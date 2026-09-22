<template>
  <div class="min-h-screen text-foreground">
    <UiPublicNav />

    <main class="section-shell max-w-7xl py-10 md:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
      <section>
        <p class="eyebrow mb-4">{{ t('sidebar.seedGenerator') }}</p>
        <h1 class="text-4xl md:text-6xl font-semibold tracking-tight mb-5">{{ t('seedGenerator.toolTitle') }}</h1>
        <p class="text-surface-300 text-lg leading-relaxed mb-8 max-w-2xl">{{ t('seedGenerator.toolDesc') }}</p>

        <div class="glass-panel p-5 md:p-6 space-y-6">
          <div class="space-y-2">
            <label class="text-sm text-surface-400">{{ t('seedGenerator.generatedLabel') }}</label>
            <textarea :value="seedPhrase" readonly rows="4" :aria-label="t('seedGenerator.generatedLabel')" class="input-field font-mono text-base resize-none"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="space-y-2">
              <span class="text-sm text-surface-300">{{ t('seedGenerator.wordCount') }}: {{ wordCount }}</span>
              <input v-model.number="wordCount" type="range" min="12" max="24" step="3" class="w-full" />
            </label>
            <div class="metric-tile">
              <p class="text-sm text-surface-400">{{ t('seedGenerator.securityHintTitle') }}</p>
              <p class="text-sm font-semibold text-foreground mt-2">{{ t('seedGenerator.securityHintValue') }}</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button class="btn-primary flex-1" @click="regenerate">{{ t('seedGenerator.generate') }}</button>
            <button class="btn-secondary" :aria-label="t('vault.copy')" @click="copySeed">
              <Icon name="hugeicons:copy" class="w-4 h-4" />
            </button>
          </div>

          <p v-if="copied" role="status" class="text-sm text-emerald-700">{{ t('seedGenerator.copied') }}</p>
        </div>

        <ContentArticleBody :sections="tool.sections" :faq="tool.faq" :faq-title="toolUi.faqTitle" />
      </section>

      <aside class="glass-panel p-5 md:p-6 h-fit space-y-4">
        <h2 class="text-xl font-semibold text-foreground">{{ t('seedGenerator.bestPractices') }}</h2>
        <ul class="space-y-3 text-sm text-surface-300">
          <li>{{ t('seedGenerator.practice1') }}</li>
          <li>{{ t('seedGenerator.practice2') }}</li>
          <li>{{ t('seedGenerator.practice3') }}</li>
          <li>{{ t('seedGenerator.practice4') }}</li>
        </ul>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { toolContent, toolContentUi } from '~/utils/tool-content'

definePageMeta({
  layout: 'default',
  hideFloatingBrand: true,
})

const { t, locale } = useLang()
const { loggedIn } = useUserSession()
const { generateSeedPhrase } = useSeedGenerator()
const { copySecurely } = useSecureClipboard()

useSeoMeta({
  title: t('seedGenerator.toolSeoTitle'),
  description: t('seedGenerator.toolSeoDesc'),
})

const tool = toolContent.seedGenerator[locale.value === 'en' ? 'en' : 'fr']
const toolUi = toolContentUi[locale.value === 'en' ? 'en' : 'fr']
const siteUrl = String(useRuntimeConfig().public.siteUrl || '').replace(/\/+$/, '')
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    }),
  }],
})

const seedPhrase = ref('')
const copied = ref(false)
const wordCount = ref(12)

function regenerate() {
  seedPhrase.value = generateSeedPhrase(wordCount.value)
}

async function copySeed() {
  await copySecurely(seedPhrase.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}

watch(wordCount, regenerate)
onMounted(regenerate)
</script>
