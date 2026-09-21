# Audit multi-axes QVault

Date : 21 septembre 2026.
Cible : https://qvault.hqmerchant.xyz (production) et http://localhost:3000 (code courant), plus une revue du code source.
Skills appliqués : `web-perf`, `accessibility-scan` (@accesslint), `security-and-hardening`, `better-interface`, et la grille `rosoai-audit-express-seo-geo` pour le SEO déjà traité séparément.

## Périmètre et couverture

Pages publiques inspectées : accueil, `/features`, `/generateur-mot-de-passe`, `/generateur-seed-phrase`, `/audit-securite`, `/support`, `/auth/register`, `/legal/cgu`.

Outils : Lighthouse via browser, scan @accesslint (moteur de règles WCAG), trace Chrome, API Performance du navigateur, captures Playwright aux largeurs 375 / 768 / 1280, lecture du code et des tokens de design.

| Domaine | Preuve inspectée | Résultat |
| --- | --- | --- |
| Accessibilité | Scan @accesslint sur 6 pages, Lighthouse a11y, DOM et cibles tactiles, attributs du sélecteur de langue | 4 constats |
| Couleur | Tokens OKLCH, ratios calculés pour les paires accent | 2 constats de contraste |
| Rédaction (fr) | Dictionnaire `composables/useI18n.ts` | 1 constat (accents) |
| Mise en page | Captures 375 / 768 / 1280, débordement horizontal | Clair |
| Typographie | Rendu des pages, échelle et polices | Clair |
| UI / finition | Captures plein écran des 8 pages | Clair |
| Performance | Core Web Vitals, trace Chrome, réseau | Bon |
| Sécurité | En-têtes, code (auth, requêtes, XSS), `bun audit`, cookie de session | 2 constats mineurs |

## Constats

| Sévérité | Domaine | Emplacement | Avant | Après | Pourquoi |
| --- | --- | --- | --- | --- | --- |
| HIGH | Accessibilité / Couleur | `assets/css/tokens.css:176` et `assets/css/main.css:229` | `.dark { --color-accent: accent-500 }` et `.btn-primary { background: var(--color-accent); color: var(--color-accent-ink) }`, soit blanc sur oklch(0.623 0.214 259.8) = 3.66:1 | En thème sombre, donner au fond du bouton une valeur dont le blanc obtient 4.5:1 : `accent-600` = 5.11:1 (garde `accent-500` pour bordures et focus) | WCAG 1.4.3 AA échoue sur chaque bouton principal (accueil, générateurs, inscription). Rendu observé. |
| HIGH | Accessibilité / Couleur | `pages/features/index.vue:24`, `pages/auth/register.vue` (liens légaux et « Se connecter ») | `text-accent-600` sur panneau sombre, soit 3.67 à 3.74:1 | Passer ces textes à `accent-400` (6.43:1) ou `accent-500` (4.51:1) selon le rendu voulu | WCAG 1.4.3 AA échoue. Confirmé sur 7 nœuds par le moteur de règles. |
| HIGH | Accessibilité | `components/ui/LangSwitch.vue:6` | `<button aria-label="Switch to English">` avec texte visible « FR » | Inclure le texte visible dans le nom accessible, par exemple `aria-label="FR, switch to English"` et le pendant « EN, passer en français » | WCAG 2.5.3 (Label in Name, niveau A) : le nom accessible doit contenir le libellé visible. Casse le pilotage vocal. |
| MEDIUM | Accessibilité | `pages/auth/register.vue`, lien « Se connecter » du bloc de texte | `class="text-accent-600 hover:text-accent-700 font-medium"` sans soulignement | Ajouter `underline` comme sur les liens légaux voisins | WCAG 1.4.1 : distinction principalement portée par la couleur. |
| MEDIUM | Rédaction | `composables/useI18n.ts:399,400,564,643,644,663,763` | « maitre », « element », « Numero de telephone », « A corriger », « Elements », « Recreez-les » | « maître », « élément », « Numéro de téléphone », « À corriger », « Éléments », « Recréez-les » | Accents manquants en français ; l'AGENTS.md impose leur vérification. |
| LOW | Accessibilité | Pied de page, liens « Aide », « Fonctionnalités », « Conditions d'utilisation », « Politique de confidentialité » | Hauteur 22 px sur mobile (< 24 px) | Augmenter la zone cliquable ou le padding vertical | WCAG 2.2 SC 2.5.8 (Target Size AA). L'exception d'espacement peut couvrir le cas, à confirmer. |
| LOW | Sécurité | Réponses d'erreur API (mode non production) | Le JSON d'erreur contient un champ `stack` avec le chemin serveur | Vérifier que la production ne renvoie pas de `stack` (h3 le masque en `NODE_ENV=production`) | Fuite d'information interne hors production. À confirmer sur le déploiement. |
| LOW | Sécurité | `server/middleware/security.ts:9-18` | La liste d'origines autorisées ajoute l'origine déduite de l'en-tête `Host` de la requête | Rejeter une origine non explicitement configurée, ou ne faire confiance qu'aux en-têtes du proxy | Affaiblit la protection CSRF si l'hôte de la requête n'est pas validé en amont. Sur Vercel il l'est. |

## Performance

Mesures page d'accueil (première visite, cache froid) et générateur :

- LCP : accueil 2.20 s, générateur 0.87 s. Seuil « bon » < 2.5 s.
- CLS : 0.0006 et 0. Risque de décalage quasi nul.
- TBT : accueil 188 ms, générateur 13 ms. Seuil « bon » < 200 ms.
- TTFB : 105 à 597 ms.
- Lighthouse : Best Practices 1.0, SEO 1.0, Accessibilité 0.96.
- Réseau : environ 31 ressources, aucun échec, JavaScript décodé environ 358 Ko, beaucoup de petits fragments.
- Trace Chrome : 1 tâche longue de 806 ms pendant le chargement de l'accueil.

Verdict perf : bon. Aucun dépassement de seuil. Piste d'amélioration, non bloquante : réduire la tâche longue de l'accueil (chargement différé des sections sous la ligne de flottaison).

## Sécurité

Points solides vérifiés dans le code et les réponses :

- Cookie de session `nuxt-session` : `HttpOnly`, `Secure`, `SameSite=Lax`. Confirmé par en-tête `Set-Cookie` sur l'inscription locale.
- Mots de passe de compte hachés en bcrypt (coût 12), hash factice sur identifiant inconnu contre l'énumération.
- Toutes les requêtes SQL paramétrées et portées par `user_id`. Aucune concaténation.
- Aucun `v-html` ni `innerHTML` sur des données utilisateur (seul le JSON-LD, statique).
- En-têtes présents : CSP avec nonce par requête sans `unsafe-inline` sur les scripts, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Contrôle d'origine et `Sec-Fetch-Site` sur les méthodes d'écriture, en échec fermé.
- Jeton d'extension 32 octets aléatoires, hashé SHA-256, expirant, lié à `session_version`.
- Invalidation de session : changement de mot de passe incrémente `session_version` et supprime les jetons d'extension.
- Aucun secret suivi par Git (`.env` ignoré, seul `.env.example` est versionné), secrets lus depuis l'environnement.
- `bun audit` : aucune vulnérabilité connue.

Constats mineurs : voir le tableau (fuite de `stack` hors production, confiance à l'hôte dérivé).

## Vérifications

Réalisées :

- `npx @accesslint/cli scan` sur 6 pages : moteur 0.21.0, 94 règles, violations listées ci-dessus.
- Lighthouse sur l'accueil : scores ci-dessus.
- Trace Chrome 6.5 s : 1 tâche longue 806 ms.
- Core Web Vitals via PerformanceObserver (LCP, CLS, TBT) sur 2 pages.
- Captures 375 / 768 / 1280 : `scrollWidth == clientWidth` partout, aucun débordement.
- `bun audit` : no vulnerabilities found.
- Inscription locale, contrôle du `Set-Cookie`, puis suppression du compte de test (base vérifiée vide).

Non vérifié :

- Rendu après interaction utilisateur connecté (tableau de bord, modales) : hors périmètre public, non testé.
- `prefers-reduced-motion` : la règle existe (`assets/css/main.css:1719,2701,2750`) mais le rendu réduit n'a pas été inspecté visuellement.
- Zoom 200 % et largeur 320 px : non mesurés (le débordement a été vérifié à 375 px).
- Comportement des cookies et des en-têtes sur le déploiement Vercel après redéploiement.

## Verdict

`Block` : trois constats HIGH restent (contraste des boutons, contraste des textes accent, nom accessible du sélecteur de langue). Les constats MEDIUM et LOW restent à traiter dans la foulée.

Aucun de ces points n'est un défaut d'architecture : ce sont des valeurs de tokens et des libellés, corrigeables sans refonte.
