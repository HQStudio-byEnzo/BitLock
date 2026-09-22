# QVault — Stratégie de mots-clés SEO (septembre 2026)

## À lire d'abord (honnêteté)

Aucune méthode ne garantit un **top 3**. Le classement dépend de l'autorité du
domaine, des backlinks, de la fraîcheur et de l'intention de la requête. Un
domaine récent ne peut pas battre Dashlane, Bitwarden ou 01net sur les requêtes
génériques en quelques semaines.

Ce document identifie donc **où un top 3 est réellement atteignable** (requêtes
longues, outils, crypto), **où un top 10 est un bon objectif réaliste**, et
**quelles requêtes il faut éviter** faute de retour sur investissement.

## Méthode et sources

- Autocomplétion Google France (`suggestqueries.google.com`, `hl=fr&gl=fr`), 22 septembre 2026.
- Observation des SERP via DuckDuckGo (résultats réels, France).
- Analyse du produit : QVault est un coffre-fort zero-knowledge **gratuit, francophone**,
  avec des **outils** publics (générateur de mot de passe, générateur de seed phrase,
  audit de mot de passe) et une **extension Chrome**.
- Limite : pas d'outil payant (Ahrefs/Semrush), donc **pas de volumes exacts**. Les
  volumes ci-dessous sont des ordres de grandeur qualitatifs, pas des mesures.

## Ce que disent les SERP (lecture stratégique)

1. **« coffre fort numérique »** = **piège**. Le SERP est saturé par La Poste,
   Digiposte, SIV, Silae, banques : l'intention est « conserver mes fiches de paie
   et bulletins de salaire », pas « stocker mes mots de passe ». Cibler ce
   mot-clé amène du trafic non qualifié. On vise uniquement
   `coffre fort numérique gratuit mot de passe` / `coffre fort mot de passe gratuit`.

2. **« gestionnaire de mots de passe »** = **marques** (Google, Apple, Microsoft)
   et comparatifs de presse. Interdit en top 3 à court terme.

3. **Les pages d'outils** (`générateur de mot de passe`) sont occupées par des
   sites à **nom de domaine exact** et quelques marques. Une page outil soignée,
   rapide, sans compte et bien différenciée peut atteindre la page 1, et le top 3
   sur les variantes longues.

4. **Le crypto / seed phrase** est le terrain le plus favorable : les concurrents
   sont des blogs de faible autorité, des forums et une boutique. Une page utile
   et sourcée peut se classer vite.

5. Beaucoup de requêtes sont **conversationnelles** (« comment… », « où… »,
   « pourquoi… ») : elles alimentent aussi les **réponses IA (GEO)**.

## Mots-clés priorisés

Légende — Intention : `T` transactionnelle, `I` informationnelle, `N` navigationnelle.
Concurrence : Faible / Moyenne / Forte. Top 3 possible : Oui / Plus tard / Non.

### Cluster A — Outils (priorité maximale, pages existantes)

| Mot-clé | Intention | Concurrence | Page cible | Top 3 |
| --- | --- | --- | --- | --- |
| générateur de mot de passe | T | Moyenne | /generateur-mot-de-passe | Oui |
| générateur de mot de passe gratuit | T | Moyenne | /generateur-mot-de-passe | Oui |
| générateur de mot de passe sécurisé | T | Moyenne | /generateur-mot-de-passe | Oui |
| générateur de mot de passe aléatoire / fort | T | Faible | /generateur-mot-de-passe | Oui |
| générateur de mot de passe en ligne | T | Moyenne | /generateur-mot-de-passe | Oui |
| générateur de seed phrase | T | Faible | /generateur-seed-phrase | Oui |
| générateur de phrase de récupération | T | Faible | /generateur-seed-phrase | Oui |
| vérifier / tester la force d'un mot de passe | T | Faible | /audit-securite | Oui |
| tester la robustesse d'un mot de passe | T | Faible | /audit-securite | Oui |

### Cluster B — Mots de passe grand public (pages à créer)

| Mot-clé | Intention | Concurrence | Page cible | Top 3 |
| --- | --- | --- | --- | --- |
| comment stocker ses mots de passe | I | Moyenne | guide à créer | Plus tard |
| où stocker ses mots de passe gratuit | I | Moyenne | guide à créer | Oui |
| comment gérer ses mots de passe gratuitement | I | Moyenne | guide à créer | Oui |
| application gratuite pour stocker les mots de passe | T | Moyenne | guide à créer | Plus tard |
| coffre fort mot de passe gratuit | T | Moyenne | guide/comparatif | Plus tard |
| coffre fort numérique gratuit mot de passe | T | Moyenne | page d'offre | Plus tard |
| gestionnaire de mot de passe français gratuit | T | Faible | page d'offre | Oui |
| gestionnaire de mots de passe open source | T | Faible | page d'offre | Oui |
| gestionnaire de mots de passe sans abonnement | T | Faible | page d'offre | Oui |
| alternative bitwarden (gratuit, français, local) | T | Faible | comparatif | Oui |
| stocker ses mots de passe en toute sécurité | I | Moyenne | guide à créer | Plus tard |

### Cluster C — Crypto / seed phrase (le plus rentable à court terme)

| Mot-clé | Intention | Concurrence | Page cible | Top 3 |
| --- | --- | --- | --- | --- |
| où stocker sa seed phrase | I | Faible | guide à créer | Oui |
| comment stocker sa seed phrase | I | Faible | guide à créer | Oui |
| comment sécuriser sa seed phrase | I | Faible | guide à créer | Oui |
| stockage seed phrase (numérique, chiffré) | I | Faible | guide + outil | Oui |
| stocker sa phrase de récupération crypto | I | Faible | guide à créer | Oui |
| sauvegarder sa clé privée crypto | I | Faible | guide à créer | Oui |
| coffre fort crypto / bitcoin | T | Moyenne | page d'offre | Plus tard |
| phrase de récupération metamask (que faire) | I | Faible | guide à créer | Oui |

### À éviter (coût > bénéfice)

- `gestionnaire de mots de passe` (marques + presse).
- `coffre fort numérique` seul (intention fiches de paie, La Poste).
- `mot de passe maître` (intention franc-maçonnerie dominante).
- `password manager` (marché anglophone, marques).

## Pages à créer (contenu)

1. `/guides/stocker-seed-phrase` — objet : où et comment stocker une seed phrase.
   Répond : support (papier/métal), chiffré en ligne, erreurs à éviter, menaces,
   jamais dans un cloud en clair. Lien vers `/generateur-seed-phrase`.
2. `/guides/gerer-ses-mots-de-passe` — comment stocker/gérer ses mots de passe
   (gratuit, sans abonnement), comparatif d'approches, lien vers l'outil et le coffre.
3. `/guides/alternative-bitwarden` — comparaison honnête (features, gratuité,
   hébergement, open source, français), lien vers l'inscription.
4. `/comparatif-coffre-fort-mots-de-passe` — tableau neutre, critères (chiffrement,
   gratuité, local, open source), c'est ce format que les SERP « comparatif » attendent.
5. `/generateur-mot-de-passe` et `/generateur-seed-phrase` : enrichir le contenu
   éditorial (aujourd'hui très outil-dominant) : explications, bonnes pratiques,
   FAQ, alternatives.
6. `/audit-securite` : ajouter l'explication de la robustesse et de la réutilisation.

## On-page par page cible

- **Title** : mot-clé principal en début, marque à la fin (le modèle `%s | QVault`
  s'en charge déjà).
- **Meta description** : bénéfice + différenciateur (« gratuit, sans compte,
  chiffré dans votre navigateur »), 150-160 caractères.
- **H1 unique** reprenant l'intention ; **H2/H3** couvrant les variantes et les
  questions.
- **FAQ** balisée `FAQPage` sur les guides (bon pour le rich result et le GEO).
- **Maillage** : chaque guide renvoie vers l'outil lié et vers l'inscription ;
  les outils renvoient vers les guides.
- **Schema** : `SoftwareApplication` déjà présent pour le site ; ajouter
  `HowTo`/`FAQPage` sur les guides, `WebApplication` sur les outils.

## Technique (déjà en place)

- Canonical par page, `sitemap.xml` + `robots.txt` dynamiques, `hreflang`… non
  applicable (site mono-URL fr), JSON-LD avec nonce CSP, performance correcte.
- Sitemap : **ajouter les nouvelles pages** guides/comparatif à
  `server/routes/sitemap.xml.ts` dès leur création.

## Netlinking réaliste (indispensable pour viser un top 3)

- **Chrome Web Store** : la fiche de l'extension génère un backlink et du trafic.
- **GitHub** : README du dépôt (org HQStudio-byEnzo), topics, lien vers le site.
- **Annuaires d'outils** : Product Hunt, AlternativeTo, BetaList, Indie Hackers,
  r/SideProject, r/privacy (avec transparence).
- **Réponses utiles** : Reddit (r/france, r/crypto_fr), forums crypto, Quora FR —
  jamais de spam, toujours un apport réel.
- **Comparatifs** : écrire aux rédactions tech (Clubic, 01net, Presse-Citron,
  Les Numériques) pour figurer dans leurs tests — c'est ce qui débloque les
  requêtes « coffre fort mot de passe gratuit ».

## Objectifs réalistes

- **0-2 mois** : indexation des guides, top 10 sur les variantes d'outils et de
  crypto (mots-clés les plus longs).
- **3-6 mois** : top 3 sur `générateur de mot de passe` (variantes longues),
  `où stocker sa seed phrase`, `gestionnaire de mot de passe français gratuit`,
  `alternative bitwarden`.
- **6-12 mois** : top 10 sur les requêtes « comment gérer ses mots de passe »,
  et seulement **ensuite** envisager les requêtes génériques.

## KPIs à suivre

- Impressions et clics par cluster (Search Console).
- Position moyenne sur 5 requêtes cibles.
- Nombre de pages indexées et couverture.
- Backlinks référents (GitHub, Chrome Web Store, annuaires).
