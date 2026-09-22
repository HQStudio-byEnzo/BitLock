/**
 * Editorial SEO content for the public tools (fr + en). Kept out of the i18n
 * dictionary, same shape as utils/guides.ts so the renderer is shared.
 */

import type { GuideBlock, GuideFaq } from './guides'

export interface ToolContent {
  sections: GuideBlock[]
  faq: GuideFaq[]
}

export const toolContentUi = {
  fr: { faqTitle: 'Questions fréquentes' },
  en: { faqTitle: 'Frequently asked questions' },
} as const

export const toolContent: Record<'passwordGenerator' | 'seedGenerator' | 'passwordAudit', { fr: ToolContent; en: ToolContent }> = {
  /* -------------------------------------------------- password generator */
  passwordGenerator: {
    fr: {
      sections: [
        {
          heading: 'Comment fonctionne un générateur de mot de passe sécurisé',
          paragraphs: [
            'Un bon générateur utilise la source aléatoire cryptographique du navigateur (crypto.getRandomValues), pas une fonction pseudo-aléatoire comme Math.random. C’est ce qui rend le résultat imprévisible, y compris pour le site lui-même.',
            'La solidité se mesure en entropie (en bits) : elle dépend de la longueur et de la taille de l’ensemble de caractères autorisés. Chaque caractère ajouté augmente fortement le nombre de combinaisons possibles.',
            'Ici, tout se passe dans votre navigateur. Le mot de passe généré n’est ni envoyé, ni enregistré : il n’existe que sur votre écran jusqu’à ce que vous le copiiez.',
          ],
        },
        {
          heading: 'Quelle longueur choisir ?',
          table: {
            headers: ['Usage', 'Longueur conseillée', 'Entropie indicative'],
            rows: [
              ['Compte peu sensible', '12 à 14 caractères', '~72 à 84 bits'],
              ['Compte courant', '16 caractères', '~96 bits'],
              ['Compte sensible (banque, e-mail)', '20 caractères et plus', '~120 bits et plus'],
              ['Secret critique ou clé', '32 caractères', '~190 bits'],
            ],
          },
          paragraphs: [
            'La longueur compte plus que la complexité affichée : un mot de passe long sans symboles est souvent plus solide qu’un mot de passe court truffé de caractères spéciaux.',
          ],
        },
        {
          heading: 'Mot de passe ou phrase de passe ?',
          paragraphs: [
            'Le mot de passe aléatoire convient aux comptes en ligne : vous ne le mémorisez pas, c’est le coffre qui s’en charge.',
            'Pour le mot de passe maître du coffre, une phrase de passe (plusieurs mots) est souvent préférable : plus longue, plus facile à retenir, et suffisamment solide.',
          ],
        },
        {
          heading: 'Ce qu’un bon générateur ne fait pas',
          bullets: [
            'Il n’envoie rien à un serveur.',
            'Il ne conserve aucun historique de vos mots de passe.',
            'Il ne produit pas de motifs prévisibles (suites, dates, prénoms).',
            'Il ne réutilise pas un mot de passe déjà généré.',
          ],
        },
        {
          heading: 'Après la génération : les réflexes',
          bullets: [
            'Enregistrez le mot de passe dans un coffre chiffré, pas dans une note.',
            'Un mot de passe unique par service, sans exception.',
            'Activez la double authentification quand elle est disponible.',
            'Ne transmettez jamais un mot de passe par e-mail ou messagerie.',
          ],
        },
      ],
      faq: [
        { q: 'Le générateur est-il vraiment aléatoire ?', a: 'Oui. Il utilise la source cryptographique du navigateur (crypto.getRandomValues), celle qui sert aussi aux clés de chiffrement, et non une fonction pseudo-aléatoire prévisible.' },
        { q: 'Mon mot de passe est-il envoyé au serveur ?', a: 'Non. La génération se fait entièrement dans votre navigateur ; le mot de passe ne quitte jamais votre appareil.' },
        { q: 'Quelle longueur de mot de passe choisir ?', a: '16 caractères est un bon standard pour un compte courant. Utilisez 20 caractères ou plus pour les comptes sensibles (banque, e-mail) et 32 pour un secret critique.' },
        { q: 'Faut-il activer les symboles ?', a: 'Ils augmentent l’ensemble de caractères, donc l’entropie. Si le site les refuse, privilégiez une longueur plus grande plutôt que des symboles.' },
        { q: 'Peut-on utiliser le même mot de passe partout ?', a: 'Non. Une fuite sur un site exposerait tous les autres. Un mot de passe unique par service est la règle de base.' },
        { q: 'Un mot de passe généré est-il plus sûr qu’un mot de passe inventé ?', a: 'En général oui : les mots de passe inventés par un humain suivent des schémas (mots, dates, substitutions) que les outils de piratage testent en priorité.' },
      ],
    },
    en: {
      sections: [
        {
          heading: 'How a secure password generator works',
          paragraphs: [
            'A good generator uses the browser cryptographic random source (crypto.getRandomValues), not a pseudo-random function like Math.random. That is what makes the result unpredictable, even to the site itself.',
            'Strength is measured in entropy (bits): it depends on length and on the size of the allowed character set. Each extra character sharply increases the number of combinations.',
            'Everything happens in your browser. The generated password is neither sent nor stored: it only exists on your screen until you copy it.',
          ],
        },
        {
          heading: 'Which length should you choose?',
          table: {
            headers: ['Use', 'Recommended length', 'Indicative entropy'],
            rows: [
              ['Low-sensitivity account', '12 to 14 characters', '~72 to 84 bits'],
              ['Standard account', '16 characters', '~96 bits'],
              ['Sensitive account (bank, email)', '20 characters and more', '~120 bits and more'],
              ['Critical secret or key', '32 characters', '~190 bits'],
            ],
          },
          paragraphs: [
            'Length matters more than apparent complexity: a long password without symbols is often stronger than a short one packed with special characters.',
          ],
        },
        {
          heading: 'Password or passphrase?',
          paragraphs: [
            'A random password suits online accounts: you do not memorise it, the vault does.',
            'For the vault master password, a passphrase (several words) is often better: longer, easier to remember and strong enough.',
          ],
        },
        {
          heading: 'What a good generator never does',
          bullets: [
            'It sends nothing to a server.',
            'It keeps no history of your passwords.',
            'It does not produce predictable patterns (sequences, dates, first names).',
            'It does not reuse a password it already generated.',
          ],
        },
        {
          heading: 'After generating: the reflexes',
          bullets: [
            'Store the password in an encrypted vault, not in a note.',
            'One unique password per service, no exception.',
            'Enable two-factor authentication when available.',
            'Never send a password by email or chat.',
          ],
        },
      ],
      faq: [
        { q: 'Is the generator truly random?', a: 'Yes. It uses the browser cryptographic source (crypto.getRandomValues), the same one used for encryption keys, not a predictable pseudo-random function.' },
        { q: 'Is my password sent to the server?', a: 'No. Generation happens entirely in your browser; the password never leaves your device.' },
        { q: 'How long should a password be?', a: '16 characters is a good standard for a standard account. Use 20 or more for sensitive accounts (bank, email) and 32 for a critical secret.' },
        { q: 'Should I enable symbols?', a: 'They increase the character set, hence the entropy. If a site rejects them, prefer a longer password over symbols.' },
        { q: 'Can I use the same password everywhere?', a: 'No. A breach on one site would expose all the others. One unique password per service is the basic rule.' },
        { q: 'Is a generated password safer than an invented one?', a: 'Usually yes: human-invented passwords follow patterns (words, dates, substitutions) that cracking tools test first.' },
      ],
    },
  },

  /* ------------------------------------------------------ seed generator */
  seedGenerator: {
    fr: {
      sections: [
        {
          heading: 'Qu’est-ce qu’une phrase de récupération (BIP-39)',
          paragraphs: [
            'Une phrase de récupération, ou seed phrase, est une suite de 12 ou 24 mots tirés d’une liste standardisée appelée BIP-39. Elle encode la clé maîtresse d’un portefeuille crypto.',
            'Avec cette phrase, n’importe quel portefeuille compatible peut reconstruire vos comptes. Sans elle, vos fonds sont inaccessibles. C’est donc l’élément le plus sensible de votre portefeuille.',
          ],
        },
        {
          heading: '12 ou 24 mots ?',
          table: {
            headers: ['Taille', 'Entropie', 'Usage'],
            rows: [
              ['12 mots', '128 bits', 'Usage courant, largement suffisant'],
              ['18 mots', '192 bits', 'Compromis'],
              ['24 mots', '256 bits', 'Montants élevés, conservation longue durée'],
            ],
          },
        },
        {
          heading: 'Comment générer une seed phrase en sécurité',
          bullets: [
            'Générez-la dans un environnement de confiance, idéalement hors ligne pour les montants importants.',
            'Utilisez une source aléatoire cryptographique : ici, la génération se fait dans votre navigateur, sans envoi.',
            'N’utilisez jamais un site tiers douteux qui affiche une phrase de récupération.',
            'Notez la phrase immédiatement : elle n’est pas conservée après avoir quitté la page.',
          ],
        },
        {
          heading: 'Après la génération, que faire ?',
          paragraphs: [
            'Ne laissez pas la phrase affichée à l’écran. Notez-la, puis rangez-la selon une méthode de sauvegarde maîtrisée.',
            'Pour choisir entre papier, métal ou stockage chiffré, consultez notre guide dédié : Où et comment stocker une seed phrase. Vous pouvez aussi la conserver chiffrée dans QVault, en gardant malgré tout une copie hors ligne.',
          ],
        },
        {
          heading: 'Ce qu’il ne faut jamais faire',
          bullets: [
            'Prendre une capture d’écran ou une photo.',
            'La coller dans un cloud en clair, un e-mail ou une messagerie.',
            'La partager, même partiellement, même avec un proche ou un « support ».',
            'La générer sur un site qui vous la demande pour « vérifier » quelque chose.',
          ],
        },
      ],
      faq: [
        { q: '12 ou 24 mots ?', a: '12 mots (128 bits) suffisent largement pour un usage courant. 24 mots (256 bits) sont préférés pour des montants élevés ou une conservation longue durée.' },
        { q: 'La phrase est-elle envoyée à un serveur ?', a: 'Non. La génération se fait entièrement dans votre navigateur ; rien n’est transmis ni conservé.' },
        { q: 'Peut-on générer une seed phrase hors ligne ?', a: 'Oui, et c’est recommandé pour les montants importants. Une fois la page chargée, la génération fonctionne sans réseau.' },
        { q: 'Une phrase générée ici est-elle valide partout ?', a: 'Oui. Elle respecte le standard BIP-39, compatible avec les principaux portefeuilles.' },
        { q: 'Puis-je la stocker dans QVault ?', a: 'Oui, elle sera chiffrée dans votre navigateur. Gardez malgré tout une copie hors ligne : si vous oubliez votre mot de passe maître, personne ne peut la restaurer.' },
        { q: 'Que faire si je l’ai déjà partagée ?', a: 'Transférez immédiatement vos fonds vers un nouveau portefeuille avec une nouvelle phrase, puis considérez l’ancienne comme définitivement exposée.' },
      ],
    },
    en: {
      sections: [
        {
          heading: 'What a recovery phrase is (BIP-39)',
          paragraphs: [
            'A recovery phrase, or seed phrase, is a set of 12 or 24 words from a standardised list called BIP-39. It encodes the master key of a crypto wallet.',
            'With that phrase, any compatible wallet can rebuild your accounts. Without it, your funds are inaccessible. It is therefore the most sensitive element of your wallet.',
          ],
        },
        {
          heading: '12 or 24 words?',
          table: {
            headers: ['Size', 'Entropy', 'Use'],
            rows: [
              ['12 words', '128 bits', 'Standard use, largely enough'],
              ['18 words', '192 bits', 'Trade-off'],
              ['24 words', '256 bits', 'Large amounts, long-term storage'],
            ],
          },
        },
        {
          heading: 'How to generate a seed phrase safely',
          bullets: [
            'Generate it in a trusted environment, ideally offline for large amounts.',
            'Use a cryptographic random source: here, generation happens in your browser, with nothing sent.',
            'Never use a dubious third-party site that displays a recovery phrase.',
            'Write the phrase down immediately: it is not kept once you leave the page.',
          ],
        },
        {
          heading: 'After generating, what next?',
          paragraphs: [
            'Do not leave the phrase on screen. Write it down, then store it using a method you control.',
            'To choose between paper, metal or encrypted storage, read our dedicated guide: Where and how to store a seed phrase. You can also keep it encrypted in QVault, while still holding an offline copy.',
          ],
        },
        {
          heading: 'What you must never do',
          bullets: [
            'Take a screenshot or a photo.',
            'Paste it into plain cloud storage, an email or a chat.',
            'Share it, even partially, even with a relative or a “support”.',
            'Generate it on a site that asks for it to “verify” something.',
          ],
        },
      ],
      faq: [
        { q: '12 or 24 words?', a: '12 words (128 bits) is largely enough for standard use. 24 words (256 bits) is preferred for large amounts or long-term storage.' },
        { q: 'Is the phrase sent to a server?', a: 'No. Generation happens entirely in your browser; nothing is transmitted or stored.' },
        { q: 'Can I generate a seed phrase offline?', a: 'Yes, and it is recommended for large amounts. Once the page is loaded, generation works without a network.' },
        { q: 'Is a phrase generated here valid everywhere?', a: 'Yes. It follows the BIP-39 standard, compatible with the main wallets.' },
        { q: 'Can I store it in QVault?', a: 'Yes, it will be encrypted in your browser. Still keep an offline copy: if you forget your master password, nobody can restore it.' },
        { q: 'What if I already shared it?', a: 'Move your funds immediately to a new wallet with a new phrase, then treat the old one as permanently exposed.' },
      ],
    },
  },

  /* ------------------------------------------------------- password audit */
  passwordAudit: {
    fr: {
      sections: [
        {
          heading: 'Comment est calculée la robustesse',
          paragraphs: [
            'L’outil estime deux choses : l’entropie, qui traduit le nombre de combinaisons possibles, et un score de conformité aux bonnes pratiques (longueur, diversité des caractères, absence de motifs évidents).',
            'Tout se calcule dans votre navigateur : le mot de passe testé n’est jamais envoyé ni conservé.',
          ],
        },
        {
          heading: 'Longueur, diversité, motifs',
          bullets: [
            'Longueur : le premier facteur. En dessous de 12 caractères, le risque augmente fortement.',
            'Diversité : minuscules, majuscules, chiffres et symboles augmentent l’ensemble de caractères.',
            'Motifs : suites (123, abc), mots courants, noms de marque ou suites de clavier (qwerty) sont testés en priorité par les attaquants.',
          ],
        },
        {
          heading: 'La force ne suffit pas : la réutilisation',
          paragraphs: [
            'Un mot de passe peut être long et complexe, et pourtant vous exposer s’il est utilisé sur plusieurs sites. Une fuite sur l’un d’eux compromet alors tous les autres.',
            'C’est pourquoi l’audit du coffre, dans le tableau de bord, cherche les mots de passe faibles et réutilisés sur l’ensemble de vos identifiants, sans envoyer de secret.',
          ],
        },
        {
          heading: 'Passer à l’action',
          bullets: [
            'Remplacez les mots de passe faibles par des mots de passe générés.',
            'Un mot de passe unique par service.',
            'Activez la double authentification sur les comptes sensibles.',
            'Sauvegardez les codes de récupération, chiffrés, dans votre coffre.',
          ],
        },
      ],
      faq: [
        { q: 'Le test envoie-t-il mon mot de passe ?', a: 'Non. Le calcul est effectué localement dans votre navigateur ; le mot de passe ne quitte jamais votre appareil.' },
        { q: 'Quelle est la différence entre entropie et score ?', a: 'L’entropie mesure le nombre de combinaisons possibles (donc la résistance à la force brute). Le score résume le respect des bonnes pratiques : longueur, diversité, absence de motifs.' },
        { q: 'Quelle longueur pour être solide ?', a: 'Visez 16 caractères pour un usage courant et 20 ou plus pour les comptes sensibles. La longueur pèse plus que la complexité apparente.' },
        { q: 'Pourquoi mon mot de passe est-il jugé faible malgré des symboles ?', a: 'Parce qu’il contient probablement des motifs prévisibles (mot du dictionnaire, date, suite) ou qu’il est trop court. Les symboles n’aident que s’ils s’ajoutent à une longueur suffisante.' },
        { q: 'Comment vérifier tous mes mots de passe d’un coup ?', a: 'Utilisez l’audit du coffre dans QVault : il analyse vos identifiants déchiffrés localement pour repérer les mots de passe faibles et réutilisés, sans rien envoyer.' },
        { q: 'Faut-il changer tous ses mots de passe ?', a: 'Commencez par les comptes sensibles (e-mail principal, banque) et ceux qui sont faibles ou réutilisés. Remplacez-les au fur et à mesure par des mots de passe générés.' },
      ],
    },
    en: {
      sections: [
        {
          heading: 'How strength is computed',
          paragraphs: [
            'The tool estimates two things: entropy, which reflects the number of possible combinations, and a score for best practices (length, character diversity, absence of obvious patterns).',
            'Everything is computed in your browser: the tested password is never sent or stored.',
          ],
        },
        {
          heading: 'Length, diversity, patterns',
          bullets: [
            'Length: the first factor. Below 12 characters, the risk rises sharply.',
            'Diversity: lowercase, uppercase, digits and symbols enlarge the character set.',
            'Patterns: sequences (123, abc), common words, brand names or keyboard runs (qwerty) are tested first by attackers.',
          ],
        },
        {
          heading: 'Strength is not enough: reuse',
          paragraphs: [
            'A password can be long and complex and still expose you if it is used on several sites. A breach on one of them then compromises all the others.',
            'That is why the vault audit, in the dashboard, looks for weak and reused passwords across your credentials, without sending any secret.',
          ],
        },
        {
          heading: 'Take action',
          bullets: [
            'Replace weak passwords with generated ones.',
            'One unique password per service.',
            'Enable two-factor authentication on sensitive accounts.',
            'Back up your recovery codes, encrypted, in your vault.',
          ],
        },
      ],
      faq: [
        { q: 'Does the test send my password?', a: 'No. The computation runs locally in your browser; the password never leaves your device.' },
        { q: 'What is the difference between entropy and score?', a: 'Entropy measures the number of possible combinations (hence brute-force resistance). The score summarises best practices: length, diversity, absence of patterns.' },
        { q: 'How long should a strong password be?', a: 'Aim for 16 characters for standard use and 20 or more for sensitive accounts. Length weighs more than apparent complexity.' },
        { q: 'Why is my password rated weak despite symbols?', a: 'Because it likely contains predictable patterns (dictionary word, date, sequence) or is too short. Symbols only help when added to sufficient length.' },
        { q: 'How can I check all my passwords at once?', a: 'Use the vault audit in QVault: it analyses your locally decrypted credentials to find weak and reused passwords, sending nothing.' },
        { q: 'Should I change all my passwords?', a: 'Start with sensitive accounts (main email, bank) and the weak or reused ones. Replace them with generated passwords over time.' },
      ],
    },
  },
}
