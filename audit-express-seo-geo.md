# Audit express SEO/GEO, QVault

Date de consultation : 21 septembre 2026.
Site : https://qvault.hqmerchant.xyz
Objectif supposé, à confirmer : acquisition de nouveaux utilisateurs francophones cherchant un gestionnaire de mots de passe gratuit et un coffre-fort chiffré.
Audience supposée : grand public francophone, plus quelques recherches crypto (seed phrase, clé privée).

## Échantillon et méthodes

Trois pages examinées :

- P1, accueil, https://qvault.hqmerchant.xyz/
- P2, page d'offre et hub des fonctionnalités, https://qvault.hqmerchant.xyz/features
- P3, outil d'acquisition, https://qvault.hqmerchant.xyz/generateur-mot-de-passe

Méthodes employées :

- Requête HTTP explicite (curl) pour le statut, l'URL finale et les en-têtes, le 21 septembre 2026.
- Analyse du HTML servi en rendu serveur avec l'analyseur local du skill (`scripts/inspect_html.py`, méthode `supplied_html`).
- Lecture de `robots.txt` et `sitemap.xml` uniquement pour comprendre l'accès aux pages de l'échantillon.

Limites qui changent la lecture :

- Aucun rendu JavaScript n'a été exécuté. Le HTML analysé est celui rendu par le serveur. Les métadonnées modifiées après hydratation ne sont pas couvertes.
- Aucune mesure d'indexation, de position, de trafic ni de visibilité dans les IA n'est réalisée.
- La version déployée observée est antérieure aux changements locaux récents sur le domaine. Plusieurs constats portent donc sur le déploiement actuel et disparaîtront ou évolueront après un redéploiement.
- Aucun formulaire n'a été envoyé, aucune page privée n'a été visitée.

Statuts observés : les trois pages répondent 200, servies par Vercel, en `text/html;charset=utf-8`. Les en-têtes de sécurité sont présents (CSP, HSTS, `X-Frame-Options: DENY`). Aucun en-tête `X-Robots-Tag` sur ces pages.

## Ce qui fonctionne

- La balise `robots` est `index, follow` sur P1, P2 et P3. Aucun obstacle d'indexation visible sur l'échantillon.
- Chaque page possède un H1 unique et un sujet identifiable. P1 : « Gardez vos secrets en sécurité absolue ». P2 : « Tout ce que QVault fait, au même endroit. ». P3 : « Générateur de mot de passe sécurisé ».
- La hiérarchie des titres est cohérente. P1 enchaîne un H1 puis des H2 de sections (fonctionnalités, étapes, outils, sécurité, FAQ) avant les H3.
- La FAQ est présente sur P1 sous « Questions fréquentes », avec des réponses qui distinguent explicitement ce qui est chiffré de ce qui reste visible (métadonnées). C'est un bon signal de fiabilité.
- Le maillage interne de P1 est riche et varié : liens vers les six pages de fonctionnalités, vers les trois outils, vers le support et les pages légales.
- Les images portent une alternative. P1 a 2 images, P2 et P3 en ont 1, aucune sans attribut `alt`.
- Aucun script de mesure tiers dans le HTML de l'échantillon.
- Les données structurées JSON-LD sont valides (`SoftwareApplication`, `Organization`, `Offer`).

## Lecture par famille

### 1. Bases techniques accessibles

Observé : statuts 200 sur les trois pages, `robots` en `index, follow`, présence d'une canonical sur chaque page.

Problème observé : les trois pages déclarent la même canonical, celle de l'accueil. Sur P1, P2 et P3 : `<link rel="canonical" href="https://bitlock.hqmerchant.xyz/">`. Les pages internes indiquent donc à la recherche de les consolider vers la racine.

Problème observé : plusieurs hôtes coexistent sur le site déployé. Canonical, `og:url`, `og:image` et `twitter:image` pointent vers `https://bitlock.hqmerchant.xyz`. Le `sitemap.xml` et le champ `url` du JSON-LD pointent vers `https://kipit-two.vercel.app`. Le `robots.txt` renvoie vers `https://bitlock.hqmerchant.xyz/sitemap.xml`. Le domaine réellement servi est `https://qvault.hqmerchant.xyz`.

`robots.txt` : `Disallow` sur `/api/`, `/auth/` et `/dashboard/`, cohérent avec l'intention.

### 2. Titres, descriptions et structure

Observé : la marque est répétée dans les titres.

- P1 : `QVault | Coffre-fort Numérique Gratuit - Mots de Passe & Crypto Sécurisés | QVault` (82 caractères).
- P2 : `Fonctionnalités - QVault | QVault` (33 caractères).
- P3 : `Générateur de mot de passe gratuit - QVault | QVault` (52 caractères).

La cause est la coexistence d'un modèle de titre global `titleTemplate: '%s | QVault'` et de titres de page qui contiennent déjà « QVault ».

Descriptions : P2 (78 caractères) et P3 (65 caractères) sont courtes mais explicites. P1 fait 169 caractères, un peu long.

Structure : correcte, voir « Ce qui fonctionne ».

### 3. Utilité

P1 (accueil) : l'activité et le public sont clairs, l'accès à la suite du parcours est présent (créer un compte, se connecter, découvrir les fonctionnalités, ouvrir les outils).

P2 (offre et hub) : chaque fonctionnalité est résumée et renvoie vers sa page dédiée. Le rôle de hub est tenu.

P3 (outil) : l'outil est annoncé comme gratuit, sans connexion et sans envoi serveur. Les bonnes pratiques sont listées. Le prérequis est clair.

Limite : aucune de ces pages ne détaille les conditions d'un éventuel plan payant, ce qui est cohérent avec le positionnement « gratuit », mais aucune page d'offre tarifaire n'existe dans l'échantillon.

### 4. Maillage limité à l'échantillon

Observé : P1 relie les trois outils et les six fonctionnalités. P2 relie chaque fonctionnalité. P3 ne relie, dans son contenu principal, aucune autre page que la navigation commune. Depuis P3, la seule route vers les autres outils passe par la section « Outils » de l'accueil via l'ancre `/#tools`.

Les ancres de navigation sont explicites (« Fonctionnalités », « Comment ça marche », « Outils », « Aide »).

### 5. Clarté SEO/GEO

Observé : le vocabulaire est clair et cohérent sur les trois pages. Le chiffrement zero-knowledge est expliqué pour un public non technique. La FAQ répond à des questions réelles (gratuité, perte du mot de passe maître, lecture des secrets).

Point à confirmer : l'interface existe en français et en anglais, mais le site est servi sur une seule URL française avec `lang="fr"` et une bascule de langue côté client. Aucune URL anglaise n'est adressable, donc aucun contenu anglais n'est indexable en l'état.

Aucun balisage spécial IA n'est employé, ce qui n'est pas un défaut au regard des fondamentaux.

### 6. Fiabilité

Observé : les affirmations techniques affichées (AES-256-GCM, chiffrement dans le navigateur, coût de dérivation) sont cohérentes avec la FAQ et ne contiennent pas de chiffres de performance non attribués. La page support affiche des liens partenaires avec divulgation, hors échantillon.

Aucune donnée de type nombre d'utilisateurs, note ou témoignage clients n'est affichée sur les trois pages. Il n'y a donc pas de preuve externe à vérifier ici.

## Actions prioritaires

### Action 1, priorité haute. Canonical identique sur toutes les pages

- Page et preuve : P1, P2 et P3, `<link rel="canonical" href="https://bitlock.hqmerchant.xyz/">`. Méthode : HTML servi.
- Conséquence plausible : deux pages internes demandent leur consolidation vers la racine. La recherche peut préférer l'accueil et retirer ces pages des résultats.
- Correction proposée : rendre la canonical propre à chaque page. Emplacement : `nuxt.config.ts`, entrée `app.head.link` (canonical globale), à retirer, puis déclarer la canonical par page avec l'URL courante.
- Effort : moyen. Dépendance : choisir une source unique d'URL de base (voir action 2).
- Vérification : après redéploiement, la canonical de P2 doit être `https://qvault.hqmerchant.xyz/features` et celle de P3 `https://qvault.hqmerchant.xyz/generateur-mot-de-passe`.
- Limite restante : une canonical exacte ne garantit pas l'indexation, qui reste non mesurée ici.

### Action 2, priorité haute. Hôtes incohérents sur le site déployé

- Page et preuve : P1, `og:url` et canonical vers `https://bitlock.hqmerchant.xyz`. `sitemap.xml`, `<loc>https://kipit-two.vercel.app/…</loc>` sur 16 entrées. JSON-LD, `"url":"https://kipit-two.vercel.app/"`. `robots.txt`, `Sitemap: https://bitlock.hqmerchant.xyz/sitemap.xml`.
- Conséquence plausible : signaux contradictoires sur l'hôte de référence. Les moteurs peuvent suivre une canonical ou un sitemap menant à un autre domaine que celui servi.
- Correction proposée : retenir `https://qvault.hqmerchant.xyz` partout. Définir la variable d'environnement `APP_URL=https://qvault.hqmerchant.xyz` sur Vercel (elle alimente le sitemap dynamique et le JSON-LD), aligner les URL codées en dur sur l'en-tête et le `robots.txt`, puis redéployer.
- Effort : faible. Dépendance : accès à la configuration Vercel.
- Vérification : relire `robots.txt`, `sitemap.xml`, la canonical et le JSON-LD après redéploiement, tous doivent afficher `qvault.hqmerchant.xyz`.
- Limite restante : la redirection 301 de l'ancien domaine vers le nouveau n'a pas été testée ici. `https://bitlock.hqmerchant.xyz/` a échoué sur la négociation TLS, aucun certificat n'a été présenté.

### Action 3, priorité moyenne. Marque répétée dans les titres

- Page et preuve : P2 `Fonctionnalités - QVault | QVault`, P3 `Générateur de mot de passe gratuit - QVault | QVault`, P1 finit aussi par `| QVault` après un premier segment contenant `QVault`. Méthode : HTML servi.
- Conséquence plausible : titre allongé et redondant pour le lecteur, risque de troncature dans les résultats.
- Correction proposée : retirer « QVault » des titres de page et garder la marque uniquement via `titleTemplate`. Emplacements : `nuxt.config.ts` (`app.head.title` par défaut) et les clés i18n `featuresIndex.seoTitle`, `generator.seoTitle`, `audit.toolSeoTitle`, `seedGenerator.toolSeoTitle`, ainsi que les titres des pages légales qui préfixent déjà « QVault ».
- Effort : faible.
- Vérification : aucune balise `title` ne doit contenir « QVault » deux fois.
- Limite restante : la longueur utile affichée dépend du moteur.

### Action 4, priorité basse. Offrir un lien contextuel entre les outils

- Page et preuve : P3 ne contient que 7 liens, tous de navigation. Aucun lien de contenu vers `https://qvault.hqmerchant.xyz/audit-securite` ni vers `https://qvault.hqmerchant.xyz/generateur-seed-phrase`, pourtant présents sur P1.
- Conséquence plausible : un visiteur venu pour un outil ne découvre pas les deux autres sans revenir à l'accueil.
- Correction proposée : ajouter, dans le contenu principal de P3, un lien vers l'audit de sécurité et vers le générateur de seed phrase, avec des ancres explicites du type « Vérifier la solidité d'un mot de passe » et « Générer une phrase de récupération ».
- Effort : faible.
- Vérification : les deux liens doivent apparaître dans le contenu principal, pas seulement dans la navigation.
- Limite restante : l'effet sur le parcours réel n'est pas mesuré.

## Corrections prêtes à reprendre

Page prioritaire : P1, accueil.

Titre actuel : `QVault | Coffre-fort Numérique Gratuit - Mots de Passe & Crypto Sécurisés | QVault`.
Proposition, une fois la marque retirée du titre de page et laissée au modèle global : `Coffre-fort numérique gratuit : mots de passe, notes et clés crypto`. Rendu attendu : `Coffre-fort numérique gratuit : mots de passe, notes et clés crypto | QVault`.

Description actuelle (169 caractères) : `QVault - Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge. AES-256-GCM, open source, gratuit.`
Variante facultative, plus courte : `Coffre-fort numérique gratuit, chiffré dans votre navigateur. Mots de passe, notes, clés crypto et codes 2FA restent privés, sans abonnement.` La description actuelle reste acceptable, cette variante n'est pas obligatoire.

H1 actuel : `Gardez vos secrets en sécurité absolue`. Conservé tel quel, il est clair et unique.

Titres des deux autres pages examinées, à raccourcir de la même façon :

- P2 : `Fonctionnalités - QVault` devient `Fonctionnalités : coffre-fort chiffré et gratuit`, soit `Fonctionnalités : coffre-fort chiffré et gratuit | QVault` après le modèle.
- P3 : `Générateur de mot de passe gratuit - QVault` devient `Générateur de mot de passe gratuit`, soit `Générateur de mot de passe gratuit | QVault` après le modèle.

Lien suggéré, depuis P3 vers une page observée : ancre « Vérifier la solidité d'un mot de passe », cible `https://qvault.hqmerchant.xyz/audit-securite`.

## À vérifier

- Indexation réelle des pages internes : à confirmer par le propriétaire via la Search Console. Cet audit n'a pas mesuré l'indexation.
- Redirection de `bitlock.hqmerchant.xyz` vers `qvault.hqmerchant.xyz` : la requête a échoué sur le TLS, la redirection n'a pas pu être établie ni écartée.
- Contenu anglais : une URL indexable en anglais est-elle souhaitée, ou le positionnement reste-t-il francophone ? Décision produit, non tranchée ici.
- `lastmod` du sitemap toujours à la date du jour sur les 16 entrées : à confirmer, impact faible.
- Rendu client : les métadonnées après hydratation n'ont pas été observées. Une vérification au navigateur est possible si un doute subsiste.

## Prochaine étape

Commencer par l'action 1 et l'action 2, qui partagent la même correction de base : une URL de référence unique et une canonical par page. Après redéploiement, refaire lire les trois pages pour confirmer les valeurs.

## Fichiers d'observation

Les captures et preuves de cet audit sont conservées hors du dépôt, dans `qvault-audit-2026-09-21` : `P1.html`, `P2.html`, `P3.html`, `robots.txt`, `sitemap.xml` et les fichiers `P1.evidence.json`, `P2.evidence.json`, `P3.evidence.json`.
