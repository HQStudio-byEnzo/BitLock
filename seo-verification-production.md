# QVault — Vérification de production (22 septembre 2026)

Périmètre : `https://qvault.hqmerchant.xyz` (production Vercel). Mesures faites
par requêtes HTTP réelles (curl), pas d'accès au compte Search Console.

## Résultat par page

| URL | Statut |
| --- | --- |
| / | 200 |
| /guides | 200 |
| /guides/stocker-seed-phrase | 200 |
| /guides/gerer-ses-mots-de-passe | 200 |
| /guides/alternative-bitwarden | 200 |
| /guides/comparatif-coffre-fort-mots-de-passe | 200 |
| /generateur-mot-de-passe | 200 |
| /audit-securite | 200 |
| /features | 200 |
| /support | 200 |
| /sitemap.xml | 200 |
| /robots.txt | 200 |

Le déploiement contient bien les derniers commits (les guides sont en ligne).

## En-têtes de sécurité (page d'accueil)

- `Content-Security-Policy` avec **nonce par requête** (`script-src 'self' 'nonce-…'`), `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- Pas de `X-Robots-Tag` sur les pages publiques (elles restent indexables).

## SEO technique

- **Canonical** propre à chaque page, sur le bon domaine (ex. `/guides/stocker-seed-phrase` → `https://qvault.hqmerchant.xyz/guides/stocker-seed-phrase`).
- **Titres** uniques, marque non dupliquée (`… | QVault`).
- **Données structurées** : `FAQPage` présent sur les 4 guides et sur les 3 outils ; `Article` et `BreadcrumbList` sur les guides ; `SoftwareApplication` global.
- **sitemap.xml** : 21 URLs, **5 URLs de guides**, un seul hôte (`qvault.hqmerchant.xyz`).
- **robots.txt** : `Allow: /`, `Disallow` sur `/api/`, `/auth/`, `/dashboard/`, et `Sitemap:` correct.

## Point à corriger

**Aucune redirection depuis l'ancien domaine.** `https://bitlock.hqmerchant.xyz/`
échoue en TLS (`000`, pas de certificat). Il n'y a donc pas de 301 vers le
nouveau domaine. À faire dans Vercel :

1. Ajouter `bitlock.hqmerchant.xyz` au projet.
2. Le configurer en **Redirect 301** permanent vers `https://qvault.hqmerchant.xyz`.
3. Vérifier que le certificat est bien émis, puis tester
   `curl -I https://bitlock.hqmerchant.xyz/` (attendu : 301 vers qvault).

## Search Console (à faire côté propriétaire)

1. Vérifier la propriété du domaine `qvault.hqmerchant.xyz` (DNS ou fichier HTML).
2. Soumettre `https://qvault.hqmerchant.xyz/sitemap.xml`.
3. Vérifier que les **21 URLs** sont couvertes et indexables.
4. Inspecter les 4 guides et demander l'indexation.
5. Surveiller les requêtes par cluster (mots-clés, guides crypto, outils).
6. Surveiller les Core Web Vitals (le sitemap et le SEO sont en place ; la
   performance n'est pas couverte par ce contrôle).

## Limites de ce contrôle

- L'**indexation réelle** (présence dans Google) n'est pas mesurable sans Search
  Console ; les prérequis techniques sont réunis.
- La **performance** (Core Web Vitals terrain) relève d'un audit séparé.
- Le TLS de l'ancien domaine n'est pas configurable depuis le code.
