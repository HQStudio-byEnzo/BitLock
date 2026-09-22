/**
 * Public SEO guides. Long-form content lives here (fr + en) instead of the
 * flat i18n dictionary so it stays readable and does not bloat useI18n.
 */

export type GuideLang = 'fr' | 'en'

export interface GuideBlock {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  table?: { headers: string[]; rows: string[][] }
}

export interface GuideFaq {
  q: string
  a: string
}

export interface GuideLocale {
  title: string
  description: string
  eyebrow: string
  h1: string
  intro: string
  updated: string
  sections: GuideBlock[]
  faq: GuideFaq[]
}

export interface Guide {
  slug: string
  category: 'seed' | 'passwords' | 'compare'
  icon: string
  accent: string
  fr: GuideLocale
  en: GuideLocale
}

export const guideUi = {
  fr: {
    navLabel: 'Guides',
    backToGuides: 'Tous les guides',
    toc: 'Sommaire',
    faqTitle: 'Questions fréquentes',
    relatedTitle: 'Pour aller plus loin',
    updatedLabel: 'Mis à jour le',
    readGuide: 'Lire le guide',
    ctaTitle: 'Créez votre coffre-fort gratuit',
    ctaDesc: 'Chiffrement dans votre navigateur, sans abonnement. Vos secrets restent privés.',
    ctaButton: 'Créer mon coffre-fort',
    indexTitle: 'Guides QVault',
    indexSubtitle: 'Des réponses claires sur la gestion des mots de passe et la protection de vos clés crypto.',
    indexEyebrow: 'Ressources',
  },
  en: {
    navLabel: 'Guides',
    backToGuides: 'All guides',
    toc: 'Contents',
    faqTitle: 'Frequently asked questions',
    relatedTitle: 'Go further',
    updatedLabel: 'Updated on',
    readGuide: 'Read the guide',
    ctaTitle: 'Create your free vault',
    ctaDesc: 'Encrypted in your browser, no subscription. Your secrets stay private.',
    ctaButton: 'Create my vault',
    indexTitle: 'QVault guides',
    indexSubtitle: 'Clear answers on managing passwords and protecting your crypto keys.',
    indexEyebrow: 'Resources',
  },
} as const

export const guides: Guide[] = [
  /* ------------------------------------------------------------ seed phrase */
  {
    slug: 'stocker-seed-phrase',
    category: 'seed',
    icon: 'hugeicons:bitcoin',
    accent: 'orange',
    fr: {
      title: 'Où et comment stocker une seed phrase en sécurité',
      description: 'Où stocker une seed phrase : méthodes (papier, métal, chiffrée), erreurs à éviter et bonnes pratiques pour protéger votre phrase de récupération crypto.',
      eyebrow: 'Guide crypto',
      h1: 'Où et comment stocker une seed phrase en sécurité',
      intro: 'Un mot de passe oublié se réinitialise. Une seed phrase perdue, non. Elle est la clé maîtresse de votre portefeuille : quiconque la lit peut vider vos fonds. Mal la stocker est donc le risque numéro un après l’arnaque.',
      updated: '22 septembre 2026',
      sections: [
        {
          heading: 'Ce qu’est une seed phrase (et pourquoi elle est plus sensible qu’un mot de passe)',
          paragraphs: [
            'Une seed phrase (ou phrase de récupération) est une suite de 12, 18 ou 24 mots tirés d’une liste standardisée (BIP-39). Elle suffit à reconstruire vos clés privées et donc vos comptes, sur n’importe quel portefeuille compatible.',
            'Contrairement à un mot de passe de site, elle ne se réinitialise pas et ne se « récupère » pas auprès d’un service : celui qui l’a possède vos fonds. Sa sauvegarde est donc une décision de sécurité, pas une simple formalité.',
          ],
        },
        {
          heading: 'Les 5 méthodes de sauvegarde',
          table: {
            headers: ['Méthode', 'Résistance', 'Risque principal', 'Pour qui'],
            rows: [
              ['Papier / carnet', 'Moyenne', 'Feu, eau, découverte', 'Débuter, petits montants'],
              ['Métal gravé', 'Élevée', 'Coût, effort', 'Montants importants'],
              ['Fragments (découpage)', 'Élevée', 'Complexité', 'Gros portefeuilles'],
              ['Coffre physique (banque)', 'Très élevée', 'Accès, coût', 'Long terme'],
              ['Numérique chiffré', 'Élevée', 'Mot de passe maître', 'Usage courant + sauvegarde'],
            ],
          },
          paragraphs: [
            'La meilleure approche est presque toujours une combinaison : une copie hors ligne pour la résilience, et une copie chiffrée pour l’usage quotidien.',
          ],
        },
        {
          heading: 'Où ne jamais stocker sa seed phrase',
          bullets: [
            'En photo dans la galerie du téléphone : l’album est souvent synchronisé automatiquement.',
            'Dans le cloud en clair (Drive, iCloud, Dropbox) ou dans une note non chiffrée.',
            'Par e-mail, SMS ou messagerie : ces contenus sont conservés et indexés.',
            'Dans un fichier .txt non chiffré ou un tableau de suivi.',
            'Dans un gestionnaire dont le serveur détient la clé de déchiffrement.',
            'Envoyée à un « support » qui la demande : aucun support légitime ne demande une seed phrase.',
          ],
        },
        {
          heading: 'Stocker une seed phrase en ligne : le bon compromis',
          paragraphs: [
            'Le numérique n’est pas interdit, à condition que le contenu soit chiffré avant de quitter votre appareil. C’est le principe du chiffrement « zero-knowledge » : le serveur stocke des données illisibles et ne reçoit jamais votre mot de passe maître.',
            'QVault fonctionne ainsi : vous générez ou collez votre phrase, elle est chiffrée en AES-256-GCM dans votre navigateur, et seul le contenu chiffré est enregistré. Gardez malgré tout une copie hors ligne : si vous oubliez votre mot de passe maître, personne ne peut restaurer vos secrets.',
          ],
        },
        {
          heading: 'Bonnes pratiques',
          bullets: [
            'Deux copies minimum, dans deux lieux différents.',
            'Testez la restauration sur un portefeuille vide avant de dépendre d’une sauvegarde.',
            'Ne tapez jamais votre seed phrase sur un site après avoir cliqué un lien reçu.',
            'Vérifiez toujours l’adresse du site avant de saisir un secret.',
            'Ne partagez jamais votre phrase, même partiellement, même à un proche.',
            'Pour des montants élevés, privilégiez un support métal et un coffre physique.',
          ],
        },
        {
          heading: 'Les erreurs qui coûtent le plus cher',
          bullets: [
            'Une seule copie, qui disparaît avec l’appareil.',
            'Une photo « juste au cas où ».',
            'Un cloud en clair parce que « c’est plus simple ».',
            'Une sauvegarde jamais testée.',
            'Un partage pour « sécuriser » entre héritiers sans procédure adaptée.',
          ],
        },
      ],
      faq: [
        { q: 'Peut-on stocker sa seed phrase sur son téléphone ?', a: 'Oui, à condition qu’elle soit chiffrée par une application dédiée et non conservée en photo ou dans une note en clair. Le téléphone lui-même est un risque (vol, perte) : gardez toujours une copie hors ligne.' },
        { q: 'Peut-on la stocker dans un gestionnaire de mots de passe ?', a: 'Oui s’il chiffre côté client (zero-knowledge). C’est un compromis courant, pratique pour l’usage quotidien. Conservez malgré tout une copie physique pour ne pas dépendre d’un seul support.' },
        { q: 'Peut-on la mettre en photo ?', a: 'Non. Une photo se retrouve dans la galerie, souvent synchronisée vers un cloud, accessible à toute application autorisée à lire les images.' },
        { q: 'Papier ou métal ?', a: 'Papier pour débuter ou pour de petits montants, avec un emplacement à l’abri du feu et de l’eau. Métal gravé pour des montants élevés ou une conservation longue durée.' },
        { q: 'Que faire si ma seed phrase est compromise ?', a: 'Transférez immédiatement vos fonds vers un nouveau portefeuille avec une nouvelle phrase, puis abandonnez l’ancienne. Considérez l’ancienne comme définitivement exposée.' },
        { q: 'Faut-il la partager avec un proche ?', a: 'Non. Si vous prévoyez une transmission, utilisez un mécanisme prévu pour cela (fragments, testament, coffre), jamais un simple partage de la phrase entière.' },
      ],
    },
    en: {
      title: 'Where and how to store a seed phrase safely',
      description: 'Where to store a seed phrase: methods (paper, metal, encrypted), mistakes to avoid and best practices to protect your crypto recovery phrase.',
      eyebrow: 'Crypto guide',
      h1: 'Where and how to store a seed phrase safely',
      intro: 'A forgotten password can be reset. A lost seed phrase cannot. It is the master key to your wallet: anyone who reads it can drain your funds. Storing it badly is the number one risk after scams.',
      updated: 'September 22, 2026',
      sections: [
        {
          heading: 'What a seed phrase is (and why it is more sensitive than a password)',
          paragraphs: [
            'A seed phrase is a set of 12, 18 or 24 words from a standardised list (BIP-39). It is enough to rebuild your private keys, and therefore your accounts, on any compatible wallet.',
            'Unlike a website password, it cannot be reset or recovered from a service: whoever holds it owns your funds. Backing it up is a security decision, not a formality.',
          ],
        },
        {
          heading: 'The 5 backup methods',
          table: {
            headers: ['Method', 'Resistance', 'Main risk', 'For whom'],
            rows: [
              ['Paper / notebook', 'Medium', 'Fire, water, discovery', 'Beginners, small amounts'],
              ['Engraved metal', 'High', 'Cost, effort', 'Large amounts'],
              ['Fragments (splitting)', 'High', 'Complexity', 'Large portfolios'],
              ['Physical safe (bank)', 'Very high', 'Access, cost', 'Long term'],
              ['Encrypted digital', 'High', 'Master password', 'Daily use + backup'],
            ],
          },
          paragraphs: [
            'The best approach is almost always a combination: an offline copy for resilience, and an encrypted copy for daily use.',
          ],
        },
        {
          heading: 'Where never to store your seed phrase',
          bullets: [
            'As a photo in your phone gallery: albums are often synced automatically.',
            'In plain-text cloud storage (Drive, iCloud, Dropbox) or an unencrypted note.',
            'By email, SMS or chat: those contents are retained and indexed.',
            'In an unencrypted .txt file or a tracking spreadsheet.',
            'In a manager whose server holds the decryption key.',
            'Sent to a “support” that asks for it: no legitimate support ever asks for a seed phrase.',
          ],
        },
        {
          heading: 'Storing a seed phrase online: the right trade-off',
          paragraphs: [
            'Digital is not forbidden, as long as the content is encrypted before it leaves your device. That is the zero-knowledge principle: the server stores unreadable data and never receives your master password.',
            'QVault works this way: you generate or paste your phrase, it is encrypted with AES-256-GCM in your browser, and only the ciphertext is saved. Still keep an offline copy: if you forget your master password, nobody can restore your secrets.',
          ],
        },
        {
          heading: 'Best practices',
          bullets: [
            'At least two copies, in two different places.',
            'Test restoring on an empty wallet before relying on a backup.',
            'Never type your seed phrase on a site after clicking a link you received.',
            'Always check the site address before entering a secret.',
            'Never share your phrase, not even partially, not even with a relative.',
            'For large amounts, prefer a metal support and a physical safe.',
          ],
        },
        {
          heading: 'The costliest mistakes',
          bullets: [
            'A single copy that disappears with the device.',
            'A photo “just in case”.',
            'Plain cloud “because it is simpler”.',
            'A backup that was never tested.',
            'Sharing to “secure” it between heirs without a proper procedure.',
          ],
        },
      ],
      faq: [
        { q: 'Can I store my seed phrase on my phone?', a: 'Yes, as long as it is encrypted by a dedicated app and not kept as a photo or in a plain note. The phone itself is a risk (theft, loss): always keep an offline copy.' },
        { q: 'Can I store it in a password manager?', a: 'Yes if it encrypts client-side (zero-knowledge). It is a common trade-off, convenient for daily use. Still keep a physical copy so you do not depend on a single medium.' },
        { q: 'Can I use a photo?', a: 'No. A photo ends up in the gallery, often synced to a cloud and readable by any app allowed to read images.' },
        { q: 'Paper or metal?', a: 'Paper to get started or for small amounts, stored away from fire and water. Engraved metal for large amounts or long-term storage.' },
        { q: 'What if my seed phrase is compromised?', a: 'Move your funds immediately to a new wallet with a new phrase, then abandon the old one. Treat the old phrase as permanently exposed.' },
        { q: 'Should I share it with a relative?', a: 'No. If you plan to pass it on, use a mechanism designed for it (fragments, will, safe), never a simple share of the whole phrase.' },
      ],
    },
  },

  /* ------------------------------------------------------------- passwords */
  {
    slug: 'gerer-ses-mots-de-passe',
    category: 'passwords',
    icon: 'hugeicons:key-round',
    accent: 'amber',
    fr: {
      title: 'Comment gérer et stocker ses mots de passe (gratuit)',
      description: 'Comment stocker et gérer ses mots de passe gratuitement : méthodes, gestionnaire gratuit, mots de passe uniques, double authentification et bonnes pratiques.',
      eyebrow: 'Guide mots de passe',
      h1: 'Comment gérer et stocker ses mots de passe (gratuitement)',
      intro: 'Le vrai problème n’est pas de retenir des mots de passe complexes, c’est de les réutiliser. Objectif : un mot de passe unique par compte, sans avoir à tout mémoriser.',
      updated: '22 septembre 2026',
      sections: [
        {
          heading: 'Le vrai problème : la réutilisation',
          paragraphs: [
            'Quand un site est victime d’une fuite, les identifiants volés sont testés automatiquement sur des centaines d’autres services. Si vous réutilisez le même mot de passe, une seule fuite compromet tous vos comptes.',
            'La solution n’est pas de mémoriser des dizaines de mots de passe, mais d’en mémoriser un seul : le mot de passe maître qui protège un coffre.',
          ],
        },
        {
          heading: 'Les 4 façons de gérer ses mots de passe',
          table: {
            headers: ['Méthode', 'Sécurité', 'Effort', 'Pour qui'],
            rows: [
              ['Tout mémoriser', 'Faible', 'Très élevé', 'Jusqu’à ~5 comptes'],
              ['Navigateur', 'Correcte', 'Faible', 'Usage simple, un seul écosystème'],
              ['Carnet papier', 'Moyenne', 'Moyen', 'Quelques secrets critiques'],
              ['Gestionnaire dédié', 'Élevée', 'Faible', 'Usage réel, multi-appareils'],
            ],
          },
        },
        {
          heading: 'Comment choisir un gestionnaire gratuit',
          bullets: [
            'Chiffrement côté client (zero-knowledge) : le serveur ne doit jamais voir vos secrets.',
            'Gratuité réelle, sans limite cachée ni essai qui expire.',
            'Code source vérifiable, idéalement open source.',
            'Synchronisation et usage hors-ligne selon vos besoins.',
            'Double authentification (TOTP) et codes de secours.',
            'Import et export : vos données doivent rester les vôtres.',
          ],
        },
        {
          heading: 'Gratuit ou payant ?',
          paragraphs: [
            'Le gratuit couvre largement l’usage personnel : QVault est gratuit et illimité. On paie généralement pour du partage familial ou d’équipe, du support prioritaire ou des fonctionnalités avancées.',
            'Méfiez-vous des « gratuits » qui limitent le nombre d’entrées ou synchronisent mal : la contrainte pousse souvent à réutiliser des mots de passe.',
          ],
        },
        {
          heading: 'Mettre en place en 10 minutes',
          bullets: [
            'Choisissez un mot de passe maître long (une phrase de passe) et unique.',
            'Créez votre coffre et ajoutez vos comptes principaux.',
            'Remplacez les mots de passe faibles ou réutilisés par des mots de passe générés.',
            'Activez la double authentification sur les comptes sensibles.',
            'Lancez l’audit de sécurité du coffre pour repérer les doublons.',
            'Sauvegardez les codes de récupération.',
          ],
        },
        {
          heading: 'Bonnes pratiques',
          bullets: [
            'Une phrase longue vaut mieux qu’un mot de passe court et « compliqué ».',
            'Un mot de passe unique par service, sans exception.',
            'Activez la 2FA partout où c’est possible.',
            'Auditez régulièrement les mots de passe faibles et réutilisés.',
            'Ne partagez jamais votre mot de passe maître.',
          ],
        },
      ],
      faq: [
        { q: 'Quel est le meilleur gestionnaire de mots de passe gratuit ?', a: 'Celui qui chiffre côté client, reste gratuit sans limite et vous laisse exporter vos données. QVault répond à ces critères : gratuit, illimité et zero-knowledge.' },
        { q: 'Le gestionnaire de mon navigateur suffit-il ?', a: 'Souvent oui pour un usage simple sur un seul écosystème. Ses limites : dépendance au fournisseur, absence de sections dédiées (crypto, codes 2FA) et synchronisation que vous ne contrôlez pas.' },
        { q: 'Combien de mots de passe faut-il retenir ?', a: 'Un seul : votre mot de passe maître. Tous les autres peuvent être générés aléatoirement et stockés dans le coffre.' },
        { q: 'Peut-on gérer ses mots de passe sans application ?', a: 'Oui, avec un carnet papier et un générateur, mais c’est peu pratique, non recherchable et difficile à sauvegarder. C’est un bon complément, pas une solution principale.' },
        { q: 'Les gestionnaires de mots de passe sont-ils sûrs ?', a: 'Ils le sont si le chiffrement se fait côté client et si votre mot de passe maître est solide. En zero-knowledge, le serveur ne peut pas lire vos données.' },
        { q: 'Que se passe-t-il si j’oublie mon mot de passe maître ?', a: 'En zero-knowledge, personne ne peut le récupérer. C’est pourquoi il faut le mémoriser ou le conserver en lieu sûr, et sauvegarder les codes de récupération de vos comptes.' },
      ],
    },
    en: {
      title: 'How to manage and store your passwords (for free)',
      description: 'How to store and manage your passwords for free: methods, free manager, unique passwords, two-factor authentication and best practices.',
      eyebrow: 'Password guide',
      h1: 'How to manage and store your passwords (for free)',
      intro: 'The real problem is not remembering complex passwords, it is reusing them. Goal: one unique password per account, without memorising everything.',
      updated: 'September 22, 2026',
      sections: [
        {
          heading: 'The real problem: reuse',
          paragraphs: [
            'When a site suffers a breach, stolen credentials are automatically tested against hundreds of other services. If you reuse the same password, a single breach compromises all your accounts.',
            'The fix is not to memorise dozens of passwords, but to memorise one: the master password that protects a vault.',
          ],
        },
        {
          heading: 'The 4 ways to manage passwords',
          table: {
            headers: ['Method', 'Security', 'Effort', 'For whom'],
            rows: [
              ['Memorise everything', 'Low', 'Very high', 'Up to ~5 accounts'],
              ['Browser', 'Fair', 'Low', 'Simple use, one ecosystem'],
              ['Paper notebook', 'Medium', 'Medium', 'A few critical secrets'],
              ['Dedicated manager', 'High', 'Low', 'Real use, multiple devices'],
            ],
          },
        },
        {
          heading: 'How to pick a free manager',
          bullets: [
            'Client-side encryption (zero-knowledge): the server must never see your secrets.',
            'A genuinely free tier, with no hidden limit or expiring trial.',
            'Verifiable source code, ideally open source.',
            'Sync and offline use depending on your needs.',
            'Two-factor authentication (TOTP) and recovery codes.',
            'Import and export: your data must stay yours.',
          ],
        },
        {
          heading: 'Free or paid?',
          paragraphs: [
            'Free covers personal use in most cases: QVault is free and unlimited. You usually pay for family or team sharing, priority support or advanced features.',
            'Beware of “free” tools that cap the number of entries or sync poorly: the constraint pushes you back to reusing passwords.',
          ],
        },
        {
          heading: 'Set up in 10 minutes',
          bullets: [
            'Pick a long, unique master password (a passphrase).',
            'Create your vault and add your main accounts.',
            'Replace weak or reused passwords with generated ones.',
            'Turn on two-factor authentication on sensitive accounts.',
            'Run the vault security audit to spot duplicates.',
            'Back up your recovery codes.',
          ],
        },
        {
          heading: 'Best practices',
          bullets: [
            'A long passphrase beats a short “complicated” password.',
            'One unique password per service, no exception.',
            'Enable 2FA wherever possible.',
            'Regularly audit weak and reused passwords.',
            'Never share your master password.',
          ],
        },
      ],
      faq: [
        { q: 'What is the best free password manager?', a: 'The one that encrypts client-side, stays free without a cap and lets you export your data. QVault meets these criteria: free, unlimited and zero-knowledge.' },
        { q: 'Is my browser manager enough?', a: 'Often yes for simple use in one ecosystem. Its limits: vendor lock-in, no dedicated sections (crypto, 2FA codes) and sync you do not control.' },
        { q: 'How many passwords should I remember?', a: 'One: your master password. All the others can be randomly generated and stored in the vault.' },
        { q: 'Can I manage passwords without an app?', a: 'Yes, with a paper notebook and a generator, but it is impractical, not searchable and hard to back up. It is a good complement, not a main solution.' },
        { q: 'Are password managers safe?', a: 'They are if encryption happens client-side and your master password is strong. In zero-knowledge, the server cannot read your data.' },
        { q: 'What if I forget my master password?', a: 'In zero-knowledge, nobody can recover it. That is why you must memorise it or keep it somewhere safe, and back up your account recovery codes.' },
      ],
    },
  },

  /* ----------------------------------------------------- alternative bitwarden */
  {
    slug: 'alternative-bitwarden',
    category: 'compare',
    icon: 'hugeicons:refresh',
    accent: 'blue',
    fr: {
      title: 'Alternative à Bitwarden : comment choisir (gratuit, français, local)',
      description: 'Vous cherchez une alternative à Bitwarden ? Les critères qui comptent (chiffrement, hébergement, gratuité, open source) et où se situe QVault.',
      eyebrow: 'Comparatif',
      h1: 'Choisir une alternative à Bitwarden',
      intro: 'Bitwarden est une référence open source. On cherche parfois autre chose : une interface française, une gratuité sans limite, un stockage local, ou une section dédiée aux clés crypto. Voici comment décider.',
      updated: '22 septembre 2026',
      sections: [
        {
          heading: 'Pourquoi chercher une alternative',
          bullets: [
            'Une interface et un support réellement francophones.',
            'La gratuité sans plafond d’entrées.',
            'Un besoin spécifique : stocker une seed phrase ou des clés crypto.',
            'Une préférence pour un fournisseur ou une juridiction donnée.',
            'Plus de simplicité, moins de réglages.',
          ],
        },
        {
          heading: 'Les critères qui comptent vraiment',
          table: {
            headers: ['Critère', 'Ce qu’il faut vérifier'],
            rows: [
              ['Chiffrement', 'AES-256-GCM ou XChaCha20, dérivation PBKDF2/Argon2, chiffrement côté client'],
              ['Zero-knowledge', 'Le serveur ne doit jamais pouvoir déchiffrer vos données'],
              ['Open source', 'Dépôt public, code vérifiable'],
              ['Gratuité', 'Nombre d’entrées, synchronisation, expiration de l’essai'],
              ['Hébergement', 'Pays, prestataire, politique de données'],
              ['Fonctions', 'TOTP, notes, crypto, codes de secours, historique'],
              ['Import / export', 'Migration possible sans perte'],
            ],
          },
        },
        {
          heading: 'Où se situe QVault',
          bullets: [
            'Gratuit et illimité, sans abonnement.',
            'Chiffrement zero-knowledge : AES-256-GCM avec PBKDF2-SHA256 (600 000 itérations) dans le navigateur.',
            'Code source public, hébergé sur GitHub.',
            'Interface française native et extension Chrome.',
            'Section dédiée crypto (seed phrase, clé privée) et codes TOTP.',
            'Limites assumées : pas d’auto-hébergement, pas de fonctionnalités d’équipe avancées.',
          ],
        },
        {
          heading: 'Migrer depuis Bitwarden',
          bullets: [
            'Exportez vos données depuis Bitwarden (CSV ou JSON).',
            'Importez la sauvegarde dans QVault depuis la page Export / Import.',
            'Vérifiez quelques identifiants sensibles après l’import.',
            'Supprimez l’ancienne sauvegarde une fois la migration confirmée.',
          ],
        },
        {
          heading: 'Quand Bitwarden reste le bon choix',
          bullets: [
            'Vous voulez auto-héberger votre coffre.',
            'Vous gérez une équipe avec des rôles et des partages avancés.',
            'Vous cherchez un écosystème très mature avec de nombreuses intégrations.',
          ],
        },
        {
          heading: 'Comment décider',
          paragraphs: [
            'Listez vos trois priorités réelles (gratuité, langue, crypto, local, simplicité). Comparez uniquement sur ces critères : la plupart des différences mises en avant par les comparatifs n’ont aucun impact sur votre usage.',
          ],
        },
      ],
      faq: [
        { q: 'Bitwarden est-il gratuit ?', a: 'Bitwarden propose une offre gratuite et des offres payantes. Les limites exactes évoluent : vérifiez les conditions actuelles sur leur site avant de choisir.' },
        { q: 'Quelle alternative gratuite à Bitwarden ?', a: 'QVault est gratuit et illimité, avec chiffrement zero-knowledge. KeePass est une autre alternative gratuite et open source, mais locale et moins simple à synchroniser.' },
        { q: 'Peut-on importer ses données depuis Bitwarden ?', a: 'Oui : exportez un CSV ou un JSON depuis Bitwarden, puis importez-le dans QVault via la page Export / Import.' },
        { q: 'Existe-t-il un gestionnaire de mots de passe français ?', a: 'Oui, QVault est développé en français, avec une interface française native.' },
        { q: 'QVault est-il open source ?', a: 'Oui, le code source est public sur GitHub, ce qui permet de vérifier le chiffrement et l’absence de backdoor.' },
      ],
    },
    en: {
      title: 'Bitwarden alternative: how to choose (free, French, local)',
      description: 'Looking for a Bitwarden alternative? The criteria that matter (encryption, hosting, free tier, open source) and where QVault stands.',
      eyebrow: 'Comparison',
      h1: 'Choosing a Bitwarden alternative',
      intro: 'Bitwarden is an open-source reference. Sometimes you want something else: a French interface, a free tier without a cap, local storage, or a dedicated section for crypto keys. Here is how to decide.',
      updated: 'September 22, 2026',
      sections: [
        {
          heading: 'Why look for an alternative',
          bullets: [
            'A genuinely French-speaking interface and support.',
            'Free without an entry cap.',
            'A specific need: storing a seed phrase or crypto keys.',
            'A preference for a given vendor or jurisdiction.',
            'More simplicity, fewer settings.',
          ],
        },
        {
          heading: 'The criteria that really matter',
          table: {
            headers: ['Criterion', 'What to check'],
            rows: [
              ['Encryption', 'AES-256-GCM or XChaCha20, PBKDF2/Argon2 derivation, client-side encryption'],
              ['Zero-knowledge', 'The server must never be able to decrypt your data'],
              ['Open source', 'Public repository, verifiable code'],
              ['Free tier', 'Entry count, sync, trial expiry'],
              ['Hosting', 'Country, provider, data policy'],
              ['Features', 'TOTP, notes, crypto, recovery codes, history'],
              ['Import / export', 'Migration without loss'],
            ],
          },
        },
        {
          heading: 'Where QVault stands',
          bullets: [
            'Free and unlimited, no subscription.',
            'Zero-knowledge encryption: AES-256-GCM with PBKDF2-SHA256 (600,000 iterations) in the browser.',
            'Public source code, hosted on GitHub.',
            'Native French interface and a Chrome extension.',
            'A dedicated crypto section (seed phrase, private key) and TOTP codes.',
            'Deliberate limits: no self-hosting, no advanced team features.',
          ],
        },
        {
          heading: 'Migrating from Bitwarden',
          bullets: [
            'Export your data from Bitwarden (CSV or JSON).',
            'Import the backup into QVault from the Export / Import page.',
            'Check a few sensitive credentials after the import.',
            'Delete the old backup once the migration is confirmed.',
          ],
        },
        {
          heading: 'When Bitwarden remains the right choice',
          bullets: [
            'You want to self-host your vault.',
            'You manage a team with advanced roles and sharing.',
            'You want a very mature ecosystem with many integrations.',
          ],
        },
        {
          heading: 'How to decide',
          paragraphs: [
            'List your three real priorities (free tier, language, crypto, local, simplicity). Compare only on those: most of the differences highlighted by roundups have no impact on your use.',
          ],
        },
      ],
      faq: [
        { q: 'Is Bitwarden free?', a: 'Bitwarden offers a free tier and paid plans. Exact limits change: check their current terms before choosing.' },
        { q: 'What is a free alternative to Bitwarden?', a: 'QVault is free and unlimited, with zero-knowledge encryption. KeePass is another free, open-source alternative, but it is local and harder to sync.' },
        { q: 'Can I import my data from Bitwarden?', a: 'Yes: export a CSV or JSON from Bitwarden, then import it into QVault from the Export / Import page.' },
        { q: 'Is there a French password manager?', a: 'Yes, QVault is developed in French, with a native French interface.' },
        { q: 'Is QVault open source?', a: 'Yes, the source code is public on GitHub, so the encryption and the absence of a backdoor can be verified.' },
      ],
    },
  },

  /* -------------------------------------------------------------- comparatif */
  {
    slug: 'comparatif-coffre-fort-mots-de-passe',
    category: 'compare',
    icon: 'hugeicons:chart',
    accent: 'emerald',
    fr: {
      title: 'Comparatif des coffres-forts de mots de passe (critères 2026)',
      description: 'Comparer les coffres-forts de mots de passe : chiffrement, gratuité, open source, hébergement. La grille de critères et où se situe QVault.',
      eyebrow: 'Comparatif',
      h1: 'Comparatif des coffres-forts de mots de passe',
      intro: 'Plutôt qu’un classement « top 10 » souvent influencé par des partenariats, voici les critères qui comptent, comment les vérifier vous-même, et comment QVault se positionne.',
      updated: '22 septembre 2026',
      sections: [
        {
          heading: 'Pourquoi les classements « top 10 » sont trompeurs',
          paragraphs: [
            'Beaucoup de comparatifs sont financés par affiliation : l’ordre reflète la commission, pas la qualité. Mieux vaut vérifier une poignée de critères objectifs que suivre un classement.',
          ],
        },
        {
          heading: 'La grille de critères',
          table: {
            headers: ['Critère', 'Pourquoi c’est important'],
            rows: [
              ['Chiffrement côté client', 'Le serveur ne doit jamais voir le contenu en clair'],
              ['Architecture zero-knowledge', 'Même piraté, le serveur reste illisible'],
              ['Open source', 'Le chiffrement est vérifiable par tous'],
              ['Gratuité réelle', 'Pas de plafond caché qui pousse à réutiliser'],
              ['Hébergement et juridiction', 'Localisation des données et cadre légal'],
              ['Usage hors-ligne', 'Accès à vos secrets sans réseau'],
              ['Fonctions', 'TOTP, notes chiffrées, crypto, historique'],
              ['Import / export', 'Vous n’êtes pas prisonnier du service'],
            ],
          },
        },
        {
          heading: 'Comment vérifier soi-même',
          bullets: [
            'Cherchez « AES-256-GCM », « Argon2 » ou « PBKDF2 » dans la documentation.',
            'Cherchez le terme « zero-knowledge » et vérifiez que le serveur ne reçoit jamais la clé.',
            'Vérifiez l’existence d’un dépôt public et lisez le code du chiffrement.',
            'Testez l’export : si vous ne pouvez pas sortir vos données, passez votre chemin.',
            'Méfiez-vous d’un support qui propose de « récupérer » votre mot de passe maître : c’est impossible en zero-knowledge.',
          ],
        },
        {
          heading: 'Où se situe QVault',
          bullets: [
            'Gratuit, illimité, sans abonnement.',
            'Zero-knowledge : AES-256-GCM, PBKDF2-SHA256 600 000 itérations, chiffrement dans le navigateur.',
            'Open source, code public sur GitHub.',
            'Français, avec extension Chrome.',
            'Sections dédiées : mots de passe, notes, TOTP, crypto, codes de secours.',
            'Limites assumées : pas d’auto-hébergement ni d’offre entreprise.',
          ],
        },
        {
          heading: 'Choisir selon votre profil',
          table: {
            headers: ['Profil', 'Priorité'],
            rows: [
              ['Grand public', 'Gratuité, simplicité, extension'],
              ['Utilisateur crypto', 'Stockage chiffré de seed phrase et clés'],
              ['Entreprise', 'Rôles, partage, audit, support'],
              ['Hors-ligne / auto-hébergé', 'Contrôle total de l’infrastructure'],
            ],
          },
        },
        {
          heading: 'Attention au piège du « coffre fort numérique »',
          paragraphs: [
            'Beaucoup de résultats pour « coffre fort numérique » concernent la conservation de documents (fiches de paie, bulletins) chez des acteurs comme La Poste ou Digiposte. Ce n’est pas la même fonction qu’un gestionnaire de mots de passe : cherchez « coffre fort de mots de passe » ou « gestionnaire de mots de passe ».',
          ],
        },
      ],
      faq: [
        { q: 'Quel est le meilleur coffre-fort de mots de passe ?', a: 'Il n’y a pas de réponse unique : cela dépend de vos priorités. Le bon choix est celui qui chiffre côté client, reste gratuit selon vos besoins et vous laisse exporter vos données.' },
        { q: 'Gratuit ou payant ?', a: 'Le gratuit suffit à l’usage personnel, notamment avec QVault (gratuit et illimité). Le payant se justifie surtout pour le partage familial ou d’équipe.' },
        { q: 'Lequel est le plus sûr ?', a: 'Le plus sûr est celui dont l’architecture est zero-knowledge et dont le mot de passe maître est solide. Le fournisseur ne doit jamais pouvoir lire vos données.' },
        { q: 'QVault est-il open source ?', a: 'Oui, le code est public sur GitHub, ce qui permet de vérifier le chiffrement et l’absence de porte dérobée.' },
        { q: 'Puis-je y stocker mes cryptos ?', a: 'Oui, QVault dispose d’une section dédiée aux seed phrases et clés privées, chiffrées comme le reste du coffre.' },
      ],
    },
    en: {
      title: 'Password vault comparison (2026 criteria)',
      description: 'Comparing password vaults: encryption, free tier, open source, hosting. The criteria grid and where QVault stands.',
      eyebrow: 'Comparison',
      h1: 'Password vault comparison',
      intro: 'Rather than a “top 10” often shaped by partnerships, here are the criteria that matter, how to check them yourself, and where QVault stands.',
      updated: 'September 22, 2026',
      sections: [
        {
          heading: 'Why “top 10” roundups mislead',
          paragraphs: [
            'Many comparisons are affiliate-funded: the order reflects the commission, not quality. It is better to check a handful of objective criteria than to follow a ranking.',
          ],
        },
        {
          heading: 'The criteria grid',
          table: {
            headers: ['Criterion', 'Why it matters'],
            rows: [
              ['Client-side encryption', 'The server must never see plaintext content'],
              ['Zero-knowledge architecture', 'Even if breached, the server stays unreadable'],
              ['Open source', 'The encryption is verifiable by anyone'],
              ['Real free tier', 'No hidden cap that pushes you to reuse'],
              ['Hosting and jurisdiction', 'Data location and legal framework'],
              ['Offline use', 'Access your secrets without a network'],
              ['Features', 'TOTP, encrypted notes, crypto, history'],
              ['Import / export', 'You are not locked into the service'],
            ],
          },
        },
        {
          heading: 'How to check yourself',
          bullets: [
            'Look for “AES-256-GCM”, “Argon2” or “PBKDF2” in the documentation.',
            'Look for “zero-knowledge” and check the server never receives the key.',
            'Check that a public repository exists and read the encryption code.',
            'Test the export: if you cannot get your data out, walk away.',
            'Beware of support offering to “recover” your master password: that is impossible in zero-knowledge.',
          ],
        },
        {
          heading: 'Where QVault stands',
          bullets: [
            'Free, unlimited, no subscription.',
            'Zero-knowledge: AES-256-GCM, PBKDF2-SHA256 600,000 iterations, encryption in the browser.',
            'Open source, public code on GitHub.',
            'French, with a Chrome extension.',
            'Dedicated sections: passwords, notes, TOTP, crypto, recovery codes.',
            'Deliberate limits: no self-hosting or enterprise plan.',
          ],
        },
        {
          heading: 'Choose by profile',
          table: {
            headers: ['Profile', 'Priority'],
            rows: [
              ['General public', 'Free tier, simplicity, extension'],
              ['Crypto user', 'Encrypted storage of seed phrase and keys'],
              ['Enterprise', 'Roles, sharing, audit, support'],
              ['Offline / self-hosted', 'Full control of the infrastructure'],
            ],
          },
        },
        {
          heading: 'Beware the “digital safe” trap',
          paragraphs: [
            'Many results for “digital safe” (coffre fort numérique) are about storing documents (payslips, statements) with players like La Poste or Digiposte. That is not the same function as a password manager: search for “password vault” or “password manager” instead.',
          ],
        },
      ],
      faq: [
        { q: 'What is the best password vault?', a: 'There is no single answer: it depends on your priorities. The right choice is the one that encrypts client-side, stays free for your needs and lets you export your data.' },
        { q: 'Free or paid?', a: 'Free is enough for personal use, especially with QVault (free and unlimited). Paid mainly makes sense for family or team sharing.' },
        { q: 'Which is the safest?', a: 'The safest is the one with a zero-knowledge architecture and a strong master password. The vendor must never be able to read your data.' },
        { q: 'Is QVault open source?', a: 'Yes, the code is public on GitHub, so the encryption and the absence of a backdoor can be verified.' },
        { q: 'Can I store my crypto in it?', a: 'Yes, QVault has a dedicated section for seed phrases and private keys, encrypted like the rest of the vault.' },
      ],
    },
  },
]

export function getGuides(): Guide[] {
  return guides
}

export function getGuide(slug: string): Guide | undefined {
  return guides.find(guide => guide.slug === slug)
}
