// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-19',
  future: {
    compatibilityVersion: 3,
  },
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  experimental: {
    appManifest: false,
  },

  ssr: true,

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    'nuxt-auth-utils',
  ],

  // Vercel deployment
  nitro: {
    preset: 'vercel',
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-Permitted-Cross-Domain-Policies': 'none',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; upgrade-insecure-requests",
        },
      },
    },
  },

  // Variables d'environnement runtime
  runtimeConfig: {
    // Session (nuxt-auth-utils utilise NUXT_SESSION_PASSWORD)
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
    },
    // Base de données Turso
    tursoDbUrl: process.env.TURSO_DB_URL || '',
    tursoDbToken: process.env.TURSO_DB_TOKEN || '',
    // App URL
    appUrl: process.env.APP_URL || 'https://bitlock.hqmerchant.xyz',
    // Publicly disclosed partner links. Set SUPPORT_CATALOG_JSON=[] to disable
    // this catalogue, or replace it with your own validated JSON entries.
    supportCatalogJson: process.env.SUPPORT_CATALOG_JSON || JSON.stringify([
      {
        id: 'pokepings-free',
        kind: 'affiliate',
        title: 'PokePings Free',
        description: 'Découvrez la version gratuite de PokePings.',
        url: 'https://whop.com/pokepings/pokepings-free?a=enzoizinga',
        disclosure: 'Lien affilié PokePings — BitLock peut recevoir une commission.',
      },
      {
        id: 'pokepings-premium',
        kind: 'affiliate',
        title: 'PokePings Premium',
        description: 'Accédez aux fonctionnalités Premium de PokePings.',
        url: 'https://whop.com/pokepings/pokepings-premium?a=enzoizinga',
        disclosure: 'Lien affilié PokePings — BitLock peut recevoir une commission.',
      },
      {
        id: 'pokepings',
        kind: 'affiliate',
        title: 'PokePings',
        description: 'Explorez PokePings et choisissez l’offre qui vous convient.',
        url: 'https://whop.com/pokepings?a=enzoizinga',
        disclosure: 'Lien affilié PokePings — BitLock peut recevoir une commission.',
      },
      {
        id: 'toolsuite-vip',
        kind: 'affiliate',
        title: 'ToolSuite VIP',
        description: 'Découvrez l’offre VIP de ToolSuite.',
        url: 'https://whop.com/toolsuite/buy-vip?a=enzoizinga',
        disclosure: 'Lien affilié ToolSuite — BitLock peut recevoir une commission.',
      },
      {
        id: 'toolsuite',
        kind: 'affiliate',
        title: 'ToolSuite',
        description: 'Explorez ToolSuite et ses offres disponibles.',
        url: 'https://whop.com/toolsuite?a=enzoizinga',
        disclosure: 'Lien affilié ToolSuite — BitLock peut recevoir une commission.',
      },
      {
        id: 'steven-bloom-box',
        kind: 'affiliate',
        title: 'Stevens Whop · Bloom Box',
        description: 'Découvrez l’offre Bloom Box Fresh Flowers Monthly.',
        url: 'https://whop.com/steven/bloom-box-fresh-flowers-monthly?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — BitLock peut recevoir une commission.',
      },
      {
        id: 'steven-politics-intel',
        kind: 'affiliate',
        title: 'Stevens Whop · Politics Intel',
        description: 'Découvrez l’offre Politics Intel.',
        url: 'https://whop.com/steven/politics-intel?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — BitLock peut recevoir une commission.',
      },
      {
        id: 'steven-founder-advisory',
        kind: 'affiliate',
        title: 'Stevens Whop · Founder Advisory',
        description: 'Découvrez l’offre Founder Advisory.',
        url: 'https://whop.com/steven/founder-advisory?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — BitLock peut recevoir une commission.',
      },
      {
        id: 'steven-trade-talk',
        kind: 'affiliate',
        title: 'Stevens Whop · Trade Talk',
        description: 'Découvrez l’offre Trade Talk.',
        url: 'https://whop.com/steven/trade-talk?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — BitLock peut recevoir une commission.',
      },
      {
        id: 'stevens-whop',
        kind: 'affiliate',
        title: 'Stevens Whop',
        description: 'Explorez les autres offres Stevens Whop.',
        url: 'https://whop.com/steven?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — BitLock peut recevoir une commission.',
      },
    ]),
    // Public
    public: {
      appName: 'BitLock',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  postcss: {
    plugins: {
      cssnano: { preset: 'default' },
    },
  },

  imports: {
    dirs: ['composables/**'],
  },

  app: {
    head: {
      title: 'BitLock | Coffre-fort Numérique Gratuit - Mots de Passe & Crypto Sécurisés',
      titleTemplate: '%s | BitLock',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'BitLock - Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge. AES-256-GCM, open source, gratuit.' },
        { name: 'keywords', content: 'gestionnaire mots de passe gratuit, coffre fort numérique, password manager gratuit, chiffrement zero-knowledge, stockage mots de passe sécurisé, stockage seed phrase, sauvegarde clé privée, coffre fort crypto, protection wallet, BIP39 seed phrase, stockage clés crypto sécurisé, protection données personnelles, password manager open source, gestionnaire mots de passe français, coffre fort numerique gratuit, proteger mots de passe' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#0a0f0c' },
        { name: 'author', content: 'HQ Studio' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'BitLock' },
        { property: 'og:url', content: 'https://bitlock.hqmerchant.xyz/' },
        { property: 'og:title', content: 'BitLock | Coffre-fort Numérique Gratuit - Mots de Passe & Crypto Sécurisés' },
        { property: 'og:description', content: 'BitLock - Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge. AES-256-GCM, open source, gratuit.' },
        { property: 'og:image', content: 'https://bitlock.hqmerchant.xyz/bitlock-logo.svg' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:locale:alternate', content: 'en_US' },
        // Twitter
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'BitLock | Coffre-fort Numérique Gratuit - Mots de Passe & Crypto Sécurisés' },
        { name: 'twitter:description', content: 'Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge.' },
        { name: 'twitter:image', content: 'https://bitlock.hqmerchant.xyz/bitlock-logo.svg' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/bitlock-logo.svg' },
        { rel: 'shortcut icon', type: 'image/svg+xml', href: '/bitlock-logo.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-v2.png' },
        { rel: 'canonical', href: 'https://bitlock.hqmerchant.xyz/' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'BitLock',
            url: process.env.APP_URL || 'https://bitlock.hqmerchant.xyz/',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web',
            description: 'Coffre-fort numérique gratuit avec chiffrement zero-knowledge. Stockez mots de passe, liens et clés crypto en toute sécurité.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            author: { '@type': 'Organization', name: 'HQ Studio' },
            license: 'https://github.com/Subdomain-Studio/BitLock/blob/main/LICENSE.md',
          }),
        },
      ],
    },
  },
})
