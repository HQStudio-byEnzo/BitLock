# QVault — Kit de netlinking (septembre 2026)

Objectif : obtenir des **liens entrants** et de la visibilité là où se trouvent
les utilisateurs et les comparatifs. Un lien éditorial (rédaction, annuaire
reconnu) vaut mille annuaires automatiques.

## Règles d'or

1. **Apport réel** : on publie une info utile, pas un lien nu. Sur Reddit et les
   forums, on répond d'abord, on mentionne QVault seulement si c'est pertinent.
2. **Pas de spam** : pas d'annuaires automatisés, pas de commentaires génériques.
3. **Transparence** : se présenter comme le créateur, toujours divulguer.
4. **Cohérence** : même nom, même description, même URL partout (NAP-like).
5. **Rythme** : étaler les publications (1 à 2 par semaine), pas tout d'un coup.

## Cibles par priorité

| Priorité | Cible | Type | Effort |
| --- | --- | --- | --- |
| 1 | Chrome Web Store (fiche de l'extension) | backlink + trafic | faible |
| 1 | GitHub (dépôt, topics, README) | backlink + crédibilité | faible |
| 2 | AlternativeTo | backlink + découverte | faible |
| 2 | Product Hunt | visibilité + lien | moyen |
| 3 | Annonces indie (Indie Hackers, BetaList, Show HN) | visibilité | moyen |
| 3 | Reddit / forums francophones | trafic + liens nofollow | moyen |
| 4 | Presse tech FR (Clubic, 01net, Presse-Citron, Les Numériques, Frandroid, Numerama) | backlinks forts + comparatifs | élevé |

## Chrome Web Store

- **Nom** : QVault — Coffre-fort local
- **Résumé (132 car. max)** : `Coffre-fort chiffré, gratuit et sans abonnement. Remplissez vos identifiants depuis QVault, rien n’est lisible côté serveur.`
- **Catégorie** : Productivité
- **Langues** : Français (principal), Anglais

## GitHub

- **Description du dépôt** : `Coffre-fort numérique zero-knowledge : mots de passe, notes, TOTP et clés crypto chiffrés dans le navigateur.`
- **Topics** : `password-manager`, `zero-knowledge`, `encryption`, `aes-gcm`, `privacy`, `nuxt`, `self-hosted`, `seed-phrase`
- **Site web du dépôt** : https://qvault.hqmerchant.xyz
- **README, en-tête** : une phrase de présentation, un lien vers le site, un lien
  vers l'extension Chrome, et une capture.

## AlternativeTo (alternative à Bitwarden / KeePass / Dashlane)

- **En tant qu'alternative à** : Bitwarden, KeePass, Dashlane, 1Password, NordPass
- **Tags** : `password-manager`, `security`, `encryption`, `zero-knowledge`, `open-source`, `privacy`, `crypto-wallet`, `two-factor-authentication`
- **Description courte** : `Coffre-fort gratuit et illimité. Chiffrement AES-256-GCM dans le navigateur, code source public, aucune donnée lisible par le serveur.`

## Product Hunt

- **Name** : QVault
- **Tagline (60 car. max)** : `Coffre-fort chiffré gratuit, sans abonnement`
- **Topics** : Privacy, Security, Productivity
- **Description (EN)** :
  > QVault is a free, zero-knowledge vault for passwords, notes, TOTP codes and
  > crypto seed phrases. Everything is encrypted in your browser with
  > AES-256-GCM before it is stored, so the server only ever holds ciphertext.
  > It ships with a Chrome extension, a password generator, a BIP-39 seed
  > phrase generator and a password audit. No subscription, no ads.
- **Commentaire du créateur (FR)** :
  > Salut ! J’ai construit QVault parce que je voulais un coffre gratuit, sans
  > abonnement, qui protège aussi les phrases de récupération crypto. Tout est
  > chiffré dans le navigateur : je ne peux pas lire vos données. Le code est
  > public sur GitHub. Dites-moi ce qui manque pour vous convaincre de l’utiliser
  > au quotidien.

## Annonces indie

- **Show HN (EN)** : titre `Show HN: QVault – a free zero-knowledge password and seed phrase vault`
  puis un corps factuel : ce que ça fait, ce qui est chiffré, ce qui ne l’est
  pas (métadonnées), où est le code, et ce que vous cherchez comme retours.
- **Indie Hackers** : post « I built a free, open-source, zero-knowledge vault »
  avec la même honnêteté sur les limites.
- **BetaList** : soumettre avant la disponibilité large.

## Reddit / forums

- **r/SideProject** : présentation normale, capture, lien.
- **r/privacy, r/netsec** : ne jamais poster un lien promotionnel direct. Répondre
  aux questions sur les gestionnaires et mentionner QVault seulement si c’est
  pertinent et en divulgâchant l’éditeur.
- **r/crypto_fr, forums crypto FR** : répondre aux questions « où stocker sa seed
  phrase » en apportant la méthode, puis mentionner le guide et l’outil.
- **r/france** : éviter l’auto-promotion pure ; privilégier les fils de conseils
  sécurité.

## Pitch presse (FR)

**Objet** : `QVault, un gestionnaire de mots de passe gratuit et français qui protège aussi votre seed phrase`

> Bonjour,
>
> Je suis le créateur de QVault, un coffre-fort numérique **gratuit, sans
> abonnement et sans publicité**. Il se distingue sur trois points :
> 1. **Chiffrement zero-knowledge dans le navigateur** (AES-256-GCM, PBKDF2
>    600 000 itérations) : le serveur ne reçoit que du contenu illisible.
> 2. **Une section crypto** dédiée aux seed phrases et clés privées, un besoin
>    mal couvert par les gestionnaires classiques.
> 3. **Un code source public**, vérifiable, et une **extension Chrome**.
>
> Il est disponible sur https://qvault.hqmerchant.xyz, avec des outils gratuits
> (générateur de mot de passe, générateur de seed phrase, audit de mot de passe).
>
> Je serais ravi de vous faire une démo ou de répondre à vos questions pour un
> comparatif ou un article.
>
> Merci,
> [Nom] — [contact]

**Relance (7 jours)** : rappeler en une phrase, proposer une démo de 15 minutes,
laisser la porte ouverte. Ne jamais relancer plus de deux fois.

## Suivi

Tenir un tableau simple des liens obtenus : URL, date, type (éditorial / annuaire
/ forum), rel, statut (indexé à vérifier). Prioriser les liens éditoriaux et les
mentions dans les comparatifs : ce sont eux qui font bouger les positions.
