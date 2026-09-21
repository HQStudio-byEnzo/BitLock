// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = (process.env.APP_URL || 'https://qvault.hqmerchant.xyz').replace(/\/+$/, '')

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
          // Content-Security-Policy is set per-request with a nonce in
          // server/plugins/security-headers.ts.
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
    appUrl: siteUrl,
    // Publicly disclosed partner links. Set SUPPORT_CATALOG_JSON=[] to disable
    // this catalogue, or replace it with your own validated JSON entries.
    supportCatalogJson: process.env.SUPPORT_CATALOG_JSON || JSON.stringify([
      {
        id: 'pokepings-free',
        kind: 'affiliate',
        title: 'PokePings Free',
        description: 'Découvrez la version gratuite de PokePings.',
        url: 'https://whop.com/pokepings/pokepings-free?a=enzoizinga',
        disclosure: 'Lien affilié PokePings — QVault peut recevoir une commission.',
      },
      {
        id: 'pokepings-premium',
        kind: 'affiliate',
        title: 'PokePings Premium',
        description: 'Accédez aux fonctionnalités Premium de PokePings.',
        url: 'https://whop.com/pokepings/pokepings-premium?a=enzoizinga',
        disclosure: 'Lien affilié PokePings — QVault peut recevoir une commission.',
      },
      {
        id: 'pokepings',
        kind: 'affiliate',
        title: 'PokePings',
        description: 'Explorez PokePings et choisissez l’offre qui vous convient.',
        url: 'https://whop.com/pokepings?a=enzoizinga',
        disclosure: 'Lien affilié PokePings — QVault peut recevoir une commission.',
      },
      {
        id: 'toolsuite-vip',
        kind: 'affiliate',
        title: 'ToolSuite VIP',
        description: 'Découvrez l’offre VIP de ToolSuite.',
        url: 'https://whop.com/toolsuite/buy-vip?a=enzoizinga',
        disclosure: 'Lien affilié ToolSuite — QVault peut recevoir une commission.',
      },
      {
        id: 'toolsuite',
        kind: 'affiliate',
        title: 'ToolSuite',
        description: 'Explorez ToolSuite et ses offres disponibles.',
        url: 'https://whop.com/toolsuite?a=enzoizinga',
        disclosure: 'Lien affilié ToolSuite — QVault peut recevoir une commission.',
      },
      {
        id: 'steven-bloom-box',
        kind: 'affiliate',
        title: 'Stevens Whop · Bloom Box',
        description: 'Découvrez l’offre Bloom Box Fresh Flowers Monthly.',
        url: 'https://whop.com/steven/bloom-box-fresh-flowers-monthly?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — QVault peut recevoir une commission.',
      },
      {
        id: 'steven-politics-intel',
        kind: 'affiliate',
        title: 'Stevens Whop · Politics Intel',
        description: 'Découvrez l’offre Politics Intel.',
        url: 'https://whop.com/steven/politics-intel?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — QVault peut recevoir une commission.',
      },
      {
        id: 'steven-founder-advisory',
        kind: 'affiliate',
        title: 'Stevens Whop · Founder Advisory',
        description: 'Découvrez l’offre Founder Advisory.',
        url: 'https://whop.com/steven/founder-advisory?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — QVault peut recevoir une commission.',
      },
      {
        id: 'steven-trade-talk',
        kind: 'affiliate',
        title: 'Stevens Whop · Trade Talk',
        description: 'Découvrez l’offre Trade Talk.',
        url: 'https://whop.com/steven/trade-talk?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — QVault peut recevoir une commission.',
      },
      {
        id: 'stevens-whop',
        kind: 'affiliate',
        title: 'Stevens Whop',
        description: 'Explorez les autres offres Stevens Whop.',
        url: 'https://whop.com/steven?a=enzoizinga',
        disclosure: 'Lien affilié Stevens Whop — QVault peut recevoir une commission.',
      },
    ]),
    // Public
    public: {
      appName: 'QVault',
      // Single source of truth for absolute URLs (canonical, Open Graph,
      // JSON-LD). Served to the client so per-page head tags stay consistent.
      siteUrl,
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  css: [
    '@fontsource-variable/geist',
    '@fontsource-variable/geist-mono',
    '@fontsource-variable/instrument-sans',
    '@fontsource/ibm-plex-mono/400.css',
    '@fontsource/ibm-plex-mono/500.css',
    '@fontsource/ibm-plex-mono/600.css',
    '@fontsource/ibm-plex-mono/700.css',
  ],

  postcss: {
    plugins: {
      cssnano: { preset: 'default' },
    },
  },

  imports: {
    dirs: ['composables/**'],
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'fr', class: 'dark' },
      title: 'Coffre-fort numérique gratuit : mots de passe, notes et clés crypto',
      titleTemplate: '%s | QVault',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'QVault - Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge. AES-256-GCM, open source, gratuit.' },
        { name: 'keywords', content: 'gestionnaire mots de passe gratuit, coffre fort numérique, password manager gratuit, chiffrement zero-knowledge, stockage mots de passe sécurisé, stockage seed phrase, sauvegarde clé privée, coffre fort crypto, protection wallet, BIP39 seed phrase, stockage clés crypto sécurisé, protection données personnelles, password manager open source, gestionnaire mots de passe français, coffre fort numerique gratuit, proteger mots de passe' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#0a0f0c' },
        { name: 'author', content: 'HQ Studio' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'QVault' },
        { property: 'og:title', content: 'Coffre-fort numérique gratuit : mots de passe, notes et clés crypto' },
        { property: 'og:description', content: 'QVault - Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge. AES-256-GCM, open source, gratuit.' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:locale:alternate', content: 'en_US' },
        // Twitter
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Coffre-fort numérique gratuit : mots de passe, notes et clés crypto' },
        { name: 'twitter:description', content: 'Coffre-fort numérique gratuit. Stockez mots de passe, liens et clés crypto en toute sécurité avec chiffrement zero-knowledge.' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/qvault-icon-48.png?v=3' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/qvault-icon-32.png?v=3' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/qvault-icon-16.png?v=3' },
        { rel: 'shortcut icon', href: '/qvault-icon-32.png?v=3' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-v2.png?v=3' },
      ],
    },
  },
})
