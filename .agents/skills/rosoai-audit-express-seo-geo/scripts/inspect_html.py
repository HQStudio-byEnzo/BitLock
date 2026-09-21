"""Inspect a supplied HTML file locally. No network, browser or external dependency.

Usage: python3 inspect_html.py page.html https://example.com/page evidence.json
The output is an observation of supplied HTML, never proof of live indexation.
"""

import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit

MAX_BYTES = 5 * 1024 * 1024
MAX_ITEMS = 1000
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
OMIT = {"script", "style", "template", "noscript", "head"}
BLOCK = {"p", "div", "section", "li", "main", "article", "header", "footer", "nav", "ul", "ol", "table", "tr", "h1", "h2", "h3", "h4", "h5", "h6"}
HEAD_CONTENT = {"base", "basefont", "bgsound", "link", "meta", "title", "noscript", "noframes", "style", "script", "template"}


def clean(text):
    return re.sub(r"\s+", " ", text).strip()


def http_url(value, base=None):
    """Resolve a URL as data only; never request its destination."""
    if not isinstance(value, str) or any(ord(c) < 32 for c in value):
        return None
    try:
        parsed = urlsplit(urljoin(base, value) if base else value)
        if parsed.scheme.lower() not in {"http", "https"} or not parsed.hostname:
            return None
        if parsed.username is not None or parsed.password is not None:
            return None
        port = parsed.port
        if port is not None and not 1 <= port <= 65535:
            return None
        return urlunsplit((parsed.scheme.lower(), parsed.netloc, parsed.path or "/", parsed.query, parsed.fragment))
    except ValueError:
        return None


class Inspector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.titles = []
        self.headings = []
        self.metas = []
        self.canonicals = []
        self.links = []
        self.images = []
        self.base = None
        self.lang = None
        self.body_text = []
        self.main_text = []
        self.jsonld = []
        self.limited = set()

    def add(self, target, item, label):
        if len(target) < MAX_ITEMS:
            target.append(item)
        else:
            self.limited.add(label)

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if any(f["tag"] == "head" for f in self.stack) and tag not in HEAD_CONTENT and not any(f["tag"] in {"title", "script", "style", "template", "noscript"} for f in self.stack):
            self.handle_endtag("head")
        if len(self.stack) >= 512:
            raise ValueError("HTML trop profondément imbriqué. Utiliser une capture du navigateur ou un extrait plus simple.")
        a = {}
        for key, value in attrs:
            a.setdefault(key, value if value is not None else "")
        suppressed = any(f["suppressed"] for f in self.stack)
        inert = tag in {"template", "noscript"} or any(f["inert"] for f in self.stack)
        hidden = any(f["hidden"] for f in self.stack) or "hidden" in a or a.get("aria-hidden", "").lower() == "true"
        style = re.sub(r"\s+", "", a.get("style", "").lower())
        hidden = hidden or bool(re.search(r"(?:^|;)(?:display:none|visibility:hidden)(?:!important)?(?:;|$)", style))
        frame = {"tag": tag, "attrs": a, "text": [], "suppressed": suppressed or hidden or tag in OMIT, "hidden": hidden, "inert": inert}
        if tag == "html":
            self.lang = a.get("lang")
        if not inert and (tag in {"meta", "link", "base"} or not frame["suppressed"]):
            if tag == "meta" and a.get("name"):
                self.add(self.metas, {"name": a["name"].lower(), "content": a.get("content", "")}, "metas")
            if tag == "link" and "canonical" in a.get("rel", "").lower().split():
                self.add(self.canonicals, a.get("href", ""), "canonicals")
            if tag == "base" and self.base is None and a.get("href"):
                self.base = a["href"]
            if tag == "img":
                self.add(self.images, {"src": a.get("src"), "alt": a.get("alt"), "has_alt": "alt" in a}, "images")
        if not frame["suppressed"] and tag in BLOCK | {"br", "hr"}:
            self.separator()
        if tag not in VOID:
            self.stack.append(frame)

    def separator(self):
        self.body_text.append(" ")
        self.main_text.append(" ")
        for f in self.stack:
            if not f["suppressed"] and (f["tag"] == "a" or re.fullmatch(r"h[1-6]", f["tag"])):
                f["text"].append(" ")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_data(self, data):
        if data.strip() and any(f["tag"] == "head" for f in self.stack) and not any(f["tag"] in {"title", "script", "style", "template", "noscript"} for f in self.stack):
            self.handle_endtag("head")
        visible = not any(f["suppressed"] for f in self.stack)
        for f in self.stack:
            if f["tag"] in {"title", "script"} and not f["inert"]:
                f["text"].append(data)
            elif visible and (f["tag"] == "a" or re.fullmatch(r"h[1-6]", f["tag"])):
                f["text"].append(data)
        if visible:
            self.body_text.append(data)
            if any(f["tag"] == "main" or f["attrs"].get("role") == "main" for f in self.stack):
                self.main_text.append(data)

    def finish(self, f):
        tag, a = f["tag"], f["attrs"]
        value = clean("".join(f["text"]))
        if tag == "title" and not f["inert"]:
            self.add(self.titles, value, "titles")
        elif tag == "script" and not f["inert"] and a.get("type", "").lower() == "application/ld+json":
            raw = "".join(f["text"])
            try:
                def reject_constant(value):
                    raise ValueError("Constante JSON invalide : " + value)
                decoded = json.loads(raw, parse_constant=reject_constant)
                types = set()
                def walk(obj, depth=0):
                    if depth > 100:
                        return
                    if isinstance(obj, dict):
                        t = obj.get("@type")
                        if isinstance(t, str):
                            types.add(t)
                        elif isinstance(t, list):
                            types.update(x for x in t if isinstance(x, str))
                        for child in obj.values():
                            walk(child, depth + 1)
                    elif isinstance(obj, list):
                        for child in obj:
                            walk(child, depth + 1)
                walk(decoded)
                self.add(self.jsonld, {"json_valid": True, "types": sorted(types)}, "jsonld")
            except (ValueError, RecursionError):
                self.add(self.jsonld, {"json_valid": False, "types": []}, "jsonld")
        elif not f["suppressed"] and re.fullmatch(r"h[1-6]", tag):
            self.add(self.headings, {"level": int(tag[1]), "text": value}, "headings")
        elif tag == "a" and not f["suppressed"] and "href" in a:
            self.add(self.links, {"href": a["href"], "text": value, "label": a.get("aria-label"), "rel": a.get("rel", "")}, "links")

    def handle_endtag(self, tag):
        found = next((i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i]["tag"] == tag), None)
        if found is None:
            return
        visible = not any(f["suppressed"] for f in self.stack)
        while len(self.stack) > found:
            self.finish(self.stack.pop())
        if visible and tag in BLOCK:
            self.separator()

    def complete(self):
        while self.stack:
            self.finish(self.stack.pop())


def inspect(data, source_url):
    source_url = http_url(source_url)
    if not source_url:
        raise ValueError("URL source HTTP ou HTTPS requise, sans identifiants intégrés.")
    if len(data) > MAX_BYTES:
        raise ValueError("Fichier trop volumineux : maximum 5 Mio.")
    text = data.decode("utf-8-sig", errors="replace")
    if not re.search(r"<(?:!doctype\s+html|html|head|body|main|article|h[1-6]|p|div|section|title|meta)\b", text, re.I):
        raise ValueError("Entrée HTML attendue. Analyser un texte brut avec le skill, sans cet outil.")
    parser = Inspector()
    parser.feed(text)
    parser.close()
    parser.complete()
    base = http_url(parser.base, source_url) or source_url
    host = urlsplit(source_url).hostname.lower()
    for link in parser.links:
        resolved = http_url(link["href"], base)
        link["url"] = resolved
        link["same_host"] = urlsplit(resolved).hostname.lower() == host if resolved else None
    return {
        "format_version": "1.0", "method": "supplied_html", "source_url": source_url,
        "inspected_at": datetime.now(timezone.utc).isoformat(),
        "source_captured_at": None, "sha256": hashlib.sha256(data).hexdigest(),
        "bytes": len(data), "http_status": None, "redirects": None,
        "headers": None, "rendered_dom_verified": False, "indexation": "not_measured",
        "language": parser.lang, "titles": parser.titles,
        "meta_descriptions": [m["content"] for m in parser.metas if m["name"] == "description"],
        "robots_meta": [m for m in parser.metas if m["name"] in {"robots", "googlebot", "bingbot"}],
        "canonicals": [{"raw": c, "resolved": http_url(c, base)} for c in parser.canonicals],
        "base_url": base, "headings": parser.headings, "links": parser.links,
        "images": parser.images, "jsonld_in_supplied_html": parser.jsonld,
        "text": clean("".join(parser.body_text))[:120000],
        "main_text": clean("".join(parser.main_text))[:120000],
        "limitations": [
            "HTML fourni uniquement. Provenance et date de capture à documenter séparément.",
            "Aucun accès réseau, aucun rendu JavaScript, aucun statut HTTP vérifié.",
            "Visibilité CSS non exhaustive. Le texte présent peut inclure des éléments repliés.",
            "Lecture simplifiée du HTML, sans reconstruction complète du DOM par un navigateur.",
            "Absence de JSON-LD dans ce fichier ne prouve pas son absence dans le DOM rendu.",
            "Liens extraits mais destinations non visitées. Syntaxe JSON valide ne signifie pas balisage conforme.",
            "Décodage UTF-8. Vérifier la lisibilité si le fichier utilise un autre encodage.",
        ] + (["Listes limitées : " + ", ".join(sorted(parser.limited))] if parser.limited else [])
        + (["Texte limité à 120000 caractères."] if max(len(clean("".join(parser.body_text))), len(clean("".join(parser.main_text)))) > 120000 else [])
        + (["Décodage contenant des caractères de remplacement."] if "\ufffd" in text else [])
    }


def main(argv=None):
    args = sys.argv[1:] if argv is None else argv
    if len(args) != 3:
        print("Usage : python3 inspect_html.py page.html https://exemple.fr/page preuves.json", file=sys.stderr)
        return 2
    source, source_url, destination = args
    try:
        src, dest = Path(source), Path(destination)
        if src.resolve() == dest.resolve():
            raise ValueError("Le fichier de sortie doit être différent de la source.")
        with src.open("rb") as f:
            data = f.read(MAX_BYTES + 1)
        result = inspect(data, source_url)
        with dest.open("x", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("Analyse HTML enregistrée : " + str(dest))
        return 0
    except (OSError, ValueError, RecursionError) as exc:
        print("Analyse impossible : " + str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
