<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

// Absolute URL source shared with the server (runtimeConfig.public.siteUrl).
const siteUrl = computed(() => String(runtimeConfig.public.siteUrl || '').replace(/\/+$/, ''))

// Each page declares itself as canonical instead of inheriting the homepage.
// The root path keeps its trailing slash, sub-paths do not.
const pagePath = computed(() => route.path.replace(/\/+$/, '') || '/')
const canonicalUrl = computed(() => `${siteUrl.value}${pagePath.value}`)
const socialImageUrl = computed(() => `${siteUrl.value}/qvault-social.png`)

const structuredData = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'QVault',
  url: `${siteUrl.value}/`,
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  description: 'Coffre-fort numérique gratuit avec chiffrement zero-knowledge. Stockez mots de passe, liens et clés crypto en toute sécurité.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'HQ Studio' },
  license: 'https://github.com/HQStudio-byEnzo/Bitlock/blob/main/LICENSE.md',
}))

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  meta: [
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: socialImageUrl },
    { name: 'twitter:image', content: socialImageUrl },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: structuredData },
  ],
})
</script>
