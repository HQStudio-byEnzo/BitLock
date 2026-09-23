# Audit express SEO/GEO, QVault. Vérification du 23 septembre 2026

Site : https://qvault.hqmerchant.xyz

Objet : vérifier les quatre constats d'un audit tiers portant sur la page d'accueil, puis corriger ce qui est établi.

Audience supposée, à confirmer : grand public francophone cherchant un gestionnaire de mots de passe gratuit et un coffre-fort chiffré.

## Échantillon et méthodes

Pages examinées : les 21 URL du sitemap, dont la page d'accueil en priorité.

Méthodes employées le 23 septembre 2026 :

- Requête HTTP explicite (curl) sur la production, puis lecture du HTML servi.
- Mesure des balises title et description en UTF-8, pour éviter un comptage faussé par les accents.
- Lecture du code source du site pour localiser chaque valeur.
- Contrôle des balises `application/ld+json` et des attributs `alt` sur les 21 URL.

Limites qui changent la lecture :

- Aucun rendu JavaScript n'a été exécuté. Le HTML analysé est celui rendu par le serveur.
- Aucune mesure d'indexation, de position, de trafic ni de visibilité dans les IA n'est réalisée.
- Les corrections décrites ici sont vérifiées en local. Elles ne sont pas encore déployées en production au moment de la rédaction.
- Aucun score global n'est reproduit : la méthode employée ne produit pas de note, et une note sur 100 ne décrit pas des causes actionnables.

## Vérification des quatre constats

1. Title trop long. Observé, 78 caractères sur la production, `Coffre-fort numérique gratuit : mots de passe, notes et clés crypto | QVault`. Constat réel.

2. Meta description trop longue. Observé, 173 caractères (l'audit tiers annonçait environ 172). Constat réel.

3. Aucun JSON-LD détecté. Contredit par l'observation : une balise `application/ld+json` de type `SoftwareApplication` est présente dans le HTML servi de l'accueil, avec `Offer` et `Organization`. Faux positif de l'outil utilisé par l'audit tiers.

4. Attributs `alt` non vérifiables. Les deux images de l'accueil portent bien un attribut `alt`, volontairement vide. Ce sont des logos décoratifs placés dans un lien déjà étiqueté par `aria-label`. Un `alt` vide est ici la pratique attendue : un texte alternatif redondant ferait annoncer la marque deux fois aux lecteurs d'écran. Aucune image sans attribut `alt` sur les 21 URL.

## Ce qui fonctionne

- Un hôte unique, `qvault.hqmerchant.xyz`, dans la canonical, le `og:url`, le `robots.txt` et les 21 entrées du sitemap.
- Une canonical propre à chaque page, y compris pour les pages internes.
- Un H1 unique et identifiable sur chaque page.
- Des données structurées sur toutes les pages, dont `FAQPage` sur les guides et les outils.
- Aucune image sans attribut `alt` sur les 21 URL.
- `robots.txt` cohérent : `/api/`, `/auth/` et `/dashboard/` exclus.

Ces points correspondent aux actions 1 et 2 de l'audit du 21 septembre 2026, désormais résolues.

## Lecture par famille

1. Bases techniques accessibles. Observé : 21 URL en 200, hôte unique, canonical par page, sitemap et `robots.txt` cohérents. Aucun obstacle d'accès constaté sur l'échantillon.

2. SEO de page. Observé et corrigé : la page d'accueil avait un titre et une description trop longs. La vérification a aussi révélé trois défauts de la même famille, non signalés par l'audit tiers : la page `/guides` répétait la marque (`Guides QVault | QVault`), trois titres de guides dépassaient 60 caractères, et `/support`, `/legal/notices` et les pages légales partageaient le titre ou la description de l'accueil.

3. Utilité. Non réexaminé ici. Voir l'audit du 21 septembre 2026, qui couvrait ce point.

4. Maillage interne. Non réexaminé ici.

5. Clarté SEO/GEO. Observé : les titres annoncent maintenant l'objet de la page sans répétition de la marque, et chaque description est propre à sa page.

6. Fiabilité. Observé : les nouvelles descriptions reprennent des éléments déjà présents sur le site (chiffrement dans le navigateur, gratuité, absence d'abonnement). Aucun chiffre, avis ou certification n'a été ajouté.

## Corrections appliquées

Page d'accueil, valeurs avant et après.

- Title. Avant : `Coffre-fort numérique gratuit : mots de passe, notes et clés crypto | QVault` (78 caractères). Après : `Coffre-fort numérique gratuit : mots de passe | QVault` (54 caractères). La requête principale reste en tête et la marque reste en fin, via le modèle `%s | QVault`.
- Description. Avant (173 caractères) : `QVault - Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge. AES-256-GCM, open source, gratuit.` Après (158 caractères) : `Mots de passe, notes et clés crypto chiffrés dans votre navigateur. Gratuit, sans abonnement, zero-knowledge. Créez votre coffre-fort sécurisé dès maintenant.` La nouvelle version porte un appel à l'action explicite.
- `og:title`, `og:description`, `twitter:title` et `twitter:description` alignés sur ces valeurs.

Corrections de la même famille, trouvées pendant la vérification.

- `/guides` : le titre SEO devient `Guides : mots de passe et crypto | QVault` (41 caractères). Le H1 visible reste `Guides QVault`, la marque n'est donc plus répétée dans l'onglet.
- `/guides/gerer-ses-mots-de-passe` : `Gérer et stocker ses mots de passe gratuitement | QVault` (56 au lieu de 61).
- `/guides/alternative-bitwarden` : `Alternative à Bitwarden : gratuite et française | QVault` (56 au lieu de 77).
- `/guides/comparatif-coffre-fort-mots-de-passe` : `Comparatif des coffres-forts de mots de passe 2026 | QVault` (59 au lieu de 70).
- `/support` : titre et description propres, au lieu du titre et de la description de l'accueil.
- `/legal/notices` : titre et description propres, et H1 aligné sur le titre, ce qui supprime un H1 identique à celui de `/legal/mentions-legales`.
- `/legal/cgu`, `/legal/confidentialite`, `/legal/mentions-legales` : description propre à chaque page, au lieu de celle de l'accueil.

Les H1 visibles n'ont pas été modifiés, sauf sur `/legal/notices` où le changement est justifié plus haut. Les titres SEO des guides sont un champ distinct du H1.

## Contrôle après correction

Mesure locale des 21 URL du sitemap :

- 0 titre dupliqué, 0 description dupliquée.
- Titre le plus long : 59 caractères. Description la plus longue : 158 caractères.
- 0 image sans attribut `alt`.
- 0 page sans données structurées.

## À vérifier

- Indexation réelle et affichage dans les résultats : à confirmer par le propriétaire via la Search Console. Cet audit ne mesure pas l'indexation.
- Contenu anglais : `/legal/notices` sert une page en anglais sans `hreflang`, sur un site par ailleurs francophone. Faut-il l'indexer, la rattacher à `/legal/mentions-legales`, ou la retirer du sitemap. Décision produit, non tranchée ici.
- Effet sur le taux de clic des nouveaux titres et descriptions : non mesurable sans données de Search Console, à comparer après quelques semaines.
- Redirection de l'ancien domaine `bitlock.hqmerchant.xyz` : écartée par décision du propriétaire, aucun contrôle effectué ici.

## Prochaine étape

Déployer les corrections, puis relire la page d'accueil et les pages des guides en production pour confirmer les valeurs. Ensuite, soumettre le sitemap dans la Search Console et demander l'indexation des guides.

## Fichiers modifiés

- `nuxt.config.ts` : titre et descriptions globaux.
- `utils/guides.ts` : titre SEO de l'index des guides et de trois guides.
- `pages/guides/index.vue` : usage du titre SEO dédié.
- `pages/support.vue` : titre et description propres.
- `pages/legal/cgu.vue`, `pages/legal/confidentialite.vue`, `pages/legal/mentions-legales.vue`, `pages/legal/notices.vue` : descriptions propres.
- `composables/useI18n.ts` : clés de description pour les pages légales.
