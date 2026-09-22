# QVault — Fiche Chrome Web Store (prête à publier)

Extension : `Bitlock-extension` (manifest v3, version 3.1.0, min Chrome 116).

## 1. Informations produit

- **Nom** : `QVault — Coffre-fort local`
- **Résumé (132 caractères max)** :
  `Coffre-fort chiffré et gratuit. Remplissez vos identifiants depuis QVault : rien n’est lisible côté serveur.`
- **Catégorie** : Productivité
- **Langue** : Français
- **Site web** : https://qvault.hqmerchant.xyz
- **Politique de confidentialité** : https://qvault.hqmerchant.xyz/legal/confidentialite
- **Support** : https://qvault.hqmerchant.xyz/support

**Description détaillée** (texte brut, pas de HTML) :

> QVault est un coffre-fort numérique gratuit et sans abonnement. Cette extension
> vous permet de remplir vos identifiants en un clic et d’enregistrer un nouveau
> mot de passe directement depuis la page de connexion.
>
> Chiffrement zero-knowledge : le contenu est chiffré dans votre navigateur
> (AES-256-GCM) par l’extension avant d’être envoyé. Le serveur ne reçoit que du
> contenu illisible et ne détient jamais votre mot de passe maître.
>
> Fonctions :
> • appairage par code à 6 chiffres, sans copier-coller de jeton ;
> • déverrouillage par mot de passe maître (conservé uniquement en mémoire) ;
> • carte de remplissage automatique sur les pages de connexion ;
> • enregistrement ou mise à jour d’un identifiant après soumission ;
> • affichage des comptes correspondant au site actif ;
> • génération de mots de passe forts.
>
> QVault ne lit pas vos onglets, ne demande pas la permission « cookies » et
> n’envoie rien à un service tiers. Le code est public.

**Objectif unique (single purpose)** :
> Remplir et enregistrer en toute sécurité vos identifiants depuis votre
> coffre-fort QVault.

## 2. Données et confidentialité (formulaire « Privacy practices »)

- **Données traitées** : informations d’authentification (identifiants et mots de
  passe), et informations personnelles qu’elles peuvent contenir (nom
  d’utilisateur, e-mail, téléphone) — uniquement saisies par l’utilisateur.
- **Vendues à des tiers** : non.
- **Utilisées à des fins non liées à l’objectif unique** : non.
- **Utilisées pour évaluer la solvabilité / prêter** : non.
- **Code distant** : non (tout le code est embarqué, MV3, aucun script distant).
- **Destinataire des données** : le serveur **de l’utilisateur** (l’instance
  QVault qu’il a configurée : production ou localhost). Rien n’est transmis à
  l’éditeur de l’extension.
- **Précision à déclarer** : la donnée est transmise hors de l’appareil, vers le
  serveur du coffre appartenant à l’utilisateur, sous forme **chiffrée**.

## 3. Justification des permissions

| Permission | Justification pour la revue |
| --- | --- |
| `activeTab` | Agir sur l’onglet actif lorsque l’utilisateur ouvre le popup (remplir, contextuel du site). |
| `storage` | Conserver localement les préférences et le **jeton d’extension révocable** ; aucun secret en clair n’y est écrit. |
| `https://qvault.hqmerchant.xyz/*` | Accéder au coffre QVault de l’utilisateur, sur ce domaine uniquement. |
| `http://localhost:3000/*` | Prendre en charge une instance locale (auto-hébergée) du coffre. |
| Script de contenu sur `http://*/*` et `https://*/*` | Cœur de la fonction : détecter les champs de connexion et proposer le remplissage. Aucun contenu de page n’est envoyé ; seules les valeurs soumises par l’utilisateur sont chiffrées et envoyées à son propre serveur. |
| `web_accessible_resources` (polices, icône) | Afficher la carte de remplissage avec la typographie et le logo de QVault. |
| `minimum_chrome_version: 116` | API navigateur utilisées par l’extension. |

**Note de revue** : le script de contenu couvre « tous les sites » parce qu’un
gestionnaire de mots de passe doit pouvoir proposer le remplissage sur n’importe
quel site où l’utilisateur possède un compte. Il n’exfiltre aucune donnée.

## 4. Comment tester (notes pour le relecteur)

1. Créer un compte gratuit sur https://qvault.hqmerchant.xyz (username + mot de
   passe, accepter les conditions).
2. Définir un mot de passe maître dans le tableau de bord.
3. Ouvrir **Paramètres → Sécurité → Extension navigateur → Associer avec un code**
   et relever le code à 6 chiffres.
4. Ouvrir l’extension, choisir le serveur **Production**, saisir le code, puis
   déverrouiller avec le mot de passe maître.
5. Sur n’importe quelle page de connexion, cliquer dans le champ mot de passe :
   la carte QVault apparaît, un clic remplit l’identifiant.
6. Valider le formulaire : une carte propose d’enregistrer ou de mettre à jour.

## 5. Visuels à produire

**Captures d’écran** — format **1280×800** (ou 640×400), 1 à 5 :

1. Page d’accueil QVault (titre, promesse, CTA).
2. Tableau de bord du coffre (sections, badges chiffré, favoris).
3. Popup de l’extension en vue « Identifiants » (section « Pour ce site »).
4. Carte de remplissage inline sur une page de connexion.
5. Générateur de mot de passe (outil gratuit).

**Tuiles promotionnelles** : petite `440×280` (obligatoire pour la mise en
avant) ; marquise `1400×560` (optionnelle).

## 6. Script de la vidéo de démo (45-60 s)

1. **0-4 s** — Accroche : « Un coffre-fort gratuit qui remplit vos mots de passe,
   sans que le serveur puisse les lire. »
2. **4-12 s** — Créer le compte puis le mot de passe maître.
3. **12-22 s** — Ajouter un identifiant (et une seed phrase dans la section crypto).
4. **22-32 s** — Installer l’extension, cliquer sur **Associer avec un code**,
   saisir les 6 chiffres, déverrouiller.
5. **32-46 s** — Sur une page de connexion réelle : la carte QVault apparaît →
   clic → champs remplis. Puis le formulaire soumis → carte « Mettre à jour ».
6. **46-58 s** — Rappel : « Chiffrement zero-knowledge, gratuit, open source. »
   et CTA.

## 7. Checklist de soumission

- [ ] Compte développeur Chrome Web Store (5 $ une fois).
- [ ] Zip de l’extension (dossier `Bitlock-extension` sans `.git` ni fichiers de test).
- [ ] Fiche remplie (nom, résumé, description, catégorie, langue).
- [ ] Visuels (5 captures 1280×800 + tuile 440×280).
- [ ] Formulaire de confidentialité (section 2) + URL de politique.
- [ ] Justifications des permissions (section 3) + notes de revue (section 4).
- [ ] Vidéo de démo (optionnelle mais fortement recommandée).
