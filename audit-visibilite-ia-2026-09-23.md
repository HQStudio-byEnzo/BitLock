# Vérification du rapport de visibilité IA, QVault

Date : 23 septembre 2026.

Site : https://qvault.hqmerchant.xyz

Objet : vérifier les constats d'un rapport de visibilité IA portant sur QVault, corriger ce qui est établi dans le code du site, et isoler ce qui dépend d'une décision ou d'un compte externe.

## Échantillon et méthodes

- Requête HTTP explicite (curl) sur la page d'accueil en production, puis lecture du HTML servi.
- Lecture des balises `application/ld+json` et des liens `a` réellement présents.
- Lecture du dépôt GitHub lié par le site.
- Recherche web sur les projets portant le nom QVault.

Limites qui changent la lecture :

- Aucune mesure de visibilité dans les modèles IA n'a été réalisée. Cet audit ne peut ni confirmer ni infirmer la note de 8 sur 100, ni le tableau par type de prompt. Ces éléments dépendent de l'outil qui les a produits et ne sont pas reproductibles ici.
- Aucune mesure de backlinks n'a été réalisée. L'affirmation « aucune mention hors du domaine » est plausible pour un site récent, elle n'est pas vérifiée ici.
- Les corrections décrites sont vérifiées en local, pas encore en production.

## Vérification des constats

1. Absence de données structurées. Contredit par l'observation. L'accueil sert trois objets `SoftwareApplication`, `Offer` et `Organization`. La recommandation « ajouter un schéma `SoftwareApplication` » porte donc sur un élément déjà présent. Faux positif.

2. Dépôt GitHub introuvable, « le site prétend open source mais aucun dépôt n'a été trouvé ». Contredit par l'observation. Le dépôt `github.com/HQStudio-byEnzo/BitLock` est public, sous licence MIT, avec 205 commits et des sujets déclarés (`password-manager`, `aes-256`, `seed-phrase-encryption`). Faux positif.

3. Page GitHub mal rattachée. Constat réel, mais pour une autre raison que celle annoncée. Dans le HTML servi, le mot `github` n'apparaissait qu'une seule fois, à l'intérieur du champ `license` du JSON-LD. Aucun lien `a` visible ne menait au code, alors que le pied de page affirme « QVault est un service gratuit et open source ». Un visiteur, ou un moteur qui ne lit pas le JSON-LD, ne pouvait pas vérifier l'affirmation.

4. `FAQPage` manquant. Constat réel. L'accueil affichait une section « Questions fréquentes » sans balisage `FAQPage` (zéro occurrence). Le balisage existait sur les guides et sur les outils, pas sur l'accueil.

5. Contenu FAQ incomplet. Constat trouvé pendant la vérification, non signalé par le rapport. Six questions étaient définies, quatre seulement étaient affichées. Les deux plus utiles pour une réponse factuelle, « QVault peut-il lire mes secrets ? » et « Y a-t-il une application mobile ? », n'apparaissaient jamais dans le HTML.

6. Conflit de nom. Constat réel. Voir la section suivante.

7. Absence de présence tierce. Cohérent avec l'observation : le site ne renvoie vers aucun profil externe, et le rapport ne peut citer aucune fiche produit, aucun avis et aucune discussion.

## Le conflit de nom, précisé

La recherche confirme que le nom est déjà porté par plusieurs projets sans lien avec QVault.

- `qvault.io` et `github.com/wagslane/qvault` : un gestionnaire de mots de passe open source publié en 2019, décrit dans deux articles sur DEV Community. Le dépôt est marqué « DEPRECATED » et compte 4 étoiles.
- `github.com/pinebit/qvault` : une bibliothèque de stockage chiffré pour Qt et C++, 2018, 1 étoile.
- `PQCVault`, `pqcvault.org` : un gestionnaire de mots de passe post-quantique actif. Ce projet reprend les mêmes mots que QVault, chiffrement AES-256-GCM, architecture zero-knowledge, dérivation PBKDF2. Il n'était pas cité dans le rapport et c'est l'homonyme le plus proche, car il est actif et positionné sur le même terrain.

Lecture : le risque de confusion est réel, mais l'homonyme exact (`qvault.io`) est dormeur depuis 2019. Le risque le plus élevé vient d'un projet post-quantique actif. Un modèle interrogé sur « QVault gestionnaire de mots de passe » peut décrire l'un ou l'autre, ou fusionner les deux.

Décision à prendre, non tranchée ici : garder le nom en le qualifiant systématiquement, ou renommer. Le produit est jeune, un renommage est moins coûteux maintenant que plus tard.

## Corrections appliquées

- Accueil : ajout d'un objet `FAQPage` couvrant les six questions, avec `inLanguage` et des réponses non vides.
- Accueil : les six questions sont désormais affichées, la FAQ visible et le balisage partagent la même source, ils ne peuvent plus diverger.
- Accueil : lien « Code source sur GitHub » visible dans le pied de page, juste après l'affirmation open source, avec `rel="noopener noreferrer"`.
- Schéma `SoftwareApplication` : ajout de `sameAs` vers le dépôt, pour que les moteurs et les modèles rattachent l'entité QVault à son profil, et de `featureList` avec huit fonctions réellement décrites sur le site.

## Contrôle après correction

- Accueil : deux objets de données structurées, `SoftwareApplication` et `FAQPage`.
- `FAQPage` : six questions, réponses non vides, `inLanguage` renseigné.
- Six éléments `details` visibles, contre quatre avant.
- Un lien GitHub visible, contre zéro avant.
- `sameAs` et `featureList` présents dans `SoftwareApplication`.
- Aucun débordement horizontal à 375, 768 et 1280 pixels, pied de page lisible aux trois largeurs.

## Ce qui dépend de toi

1. Décision sur le nom. Impact élevé, préalable au reste.
2. Fiches tierces. Une fiche Product Hunt, un profil AlternativeTo ou GetApp, et un avis vérifiable sur G2 si l'outil s'y prête. Les textes sont déjà écrits dans `seo-netlinking.md`.
3. Dépôt GitHub. Le renommer pour qu'il corresponde au produit, par exemple `qvault` au lieu de `BitLock`, améliorerait le rattachement de l'entité. GitHub redirige automatiquement l'ancienne adresse.
4. Communauté. Une publication honnête sur un espace pertinent, `r/privacy` ou Hacker News, est la seule voie réaliste vers des mentions organiques reprises ensuite par les modèles.
5. Contenu comparatif. Deux pièces existent déjà, `guides/alternative-bitwarden` et `guides/comparatif-coffre-fort-mots-de-passe`. Il manque une comparaison directe du type « QVault ou 1Password ».

## À vérifier

- Visibilité réelle dans les modèles IA. À relancer après le déploiement et après la création des fiches tierces, avec le même outil pour garder la comparaison.
- Backlinks. Non mesurés ici.
- Effet du renommage éventuel sur les liens existants. GitHub redirige, les liens du site devraient être mis à jour.

## Prochaine étape

Déployer les corrections, puis traiter la décision sur le nom. Rien de ce qui suit, fiches, publications, comparatifs, ne portera ses fruits si les modèles continuent d'attribuer le nom à un autre projet.

## Fichiers modifiés

- `pages/index.vue` : FAQ complète, schéma `FAQPage`, lien GitHub visible.
- `app.vue` : `sameAs` et `featureList` dans `SoftwareApplication`.
- `composables/useI18n.ts` : libellé du lien vers le code source, en français et en anglais.
