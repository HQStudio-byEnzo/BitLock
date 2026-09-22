<template>
  <div class="min-h-screen text-foreground">
    <UiPublicNav />
    <main class="section-shell max-w-7xl py-10 md:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
      <section>
        <p class="eyebrow mb-4">{{ t('generator.badge') }}</p>
        <h1 class="text-4xl md:text-6xl font-semibold tracking-tight mb-5">{{ t('generator.title') }}</h1>
        <p class="text-surface-300 text-lg leading-relaxed mb-8 max-w-2xl">{{ t('generator.desc') }}</p>
        <div class="glass-panel p-5 md:p-6 space-y-6">
          <div>
            <label class="text-sm text-surface-400">{{ t('generator.generatedLabel') }}</label>
            <div class="mt-2 flex flex-col sm:flex-row gap-2">
              <input :value="password" readonly :aria-label="t('generator.generatedLabel')" class="input-field font-mono text-lg min-w-0" />
              <button class="btn-secondary shrink-0" :aria-label="t('vault.copy')" @click="copyPassword"><Icon name="hugeicons:copy" class="w-5 h-5" /></button>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="space-y-2">
              <span class="text-sm text-surface-300">{{ t('generator.length') }}: {{ options.length }}</span>
              <input v-model.number="options.length" type="range" min="12" max="64" class="w-full" />
            </label>
            <div class="metric-tile">
              <p class="text-sm text-surface-400">{{ t('generator.entropy') }}</p>
              <p class="text-2xl font-semibold text-emerald-700">{{ passwordEntropy }} bits</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label v-for="option in toggles" :key="option.key" class="flex items-center gap-3 rounded-2xl border border-border bg-foreground/[0.03] p-3">
              <input v-model="options[option.key]" type="checkbox" class="rounded" />
              <span>{{ option.label }}</span>
            </label>
          </div>
          <button class="btn-primary w-full py-3" @click="regenerate">{{ t('generator.generate') }}</button>
          <p v-if="copied" role="status" class="text-sm text-emerald-700">{{ t('generator.copied') }}</p>
        </div>

        <ContentArticleBody :sections="tool.sections" :faq="tool.faq" :faq-title="toolUi.faqTitle" />

        <section class="mt-6 space-y-4" :aria-label="t('generator.relatedTitle')">
          <h2 class="text-xl font-semibold">{{ t('generator.relatedTitle') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NuxtLink to="/audit-securite" class="card flex items-start gap-3 p-5 transition-colors hover:border-accent-500/40">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-500/10 text-accent-text">
                <Icon name="hugeicons:shield-alert" class="h-5 w-5" />
              </span>
              <span class="flex flex-col">
                <strong class="font-display text-base font-semibold text-surface-50">{{ t('generator.relatedAudit') }}</strong>
                <span class="mt-1 text-sm leading-relaxed text-surface-500">{{ t('generator.relatedAuditDesc') }}</span>
              </span>
            </NuxtLink>
            <NuxtLink to="/generateur-seed-phrase" class="card flex items-start gap-3 p-5 transition-colors hover:border-accent-500/40">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-500/10 text-accent-text">
                <Icon name="hugeicons:list-ordered" class="h-5 w-5" />
              </span>
              <span class="flex flex-col">
                <strong class="font-display text-base font-semibold text-surface-50">{{ t('generator.relatedSeed') }}</strong>
                <span class="mt-1 text-sm leading-relaxed text-surface-500">{{ t('generator.relatedSeedDesc') }}</span>
              </span>
            </NuxtLink>
          </div>
        </section>
      </section>
      <aside class="glass-panel p-5 md:p-6 h-fit space-y-4">
        <h2 class="text-xl font-semibold">{{ t('generator.bestPractices') }}</h2>
        <ul class="space-y-3 text-sm text-surface-300">
          <li>{{ t('generator.practice1') }}</li>
          <li>{{ t('generator.practice2') }}</li>
          <li>{{ t('generator.practice3') }}</li>
          <li>{{ t('generator.practice4') }}</li>
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
useSeoMeta({ title: t('generator.seoTitle'), description: t('generator.seoDesc') })

const tool = toolContent.passwordGenerator[locale.value === 'en' ? 'en' : 'fr']
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
const { generatePassword, entropy } = usePasswordGenerator()
const { copySecurely } = useSecureClipboard()
const options = reactive({ length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true, avoidAmbiguous: true })
const password = ref('')
const copied = ref(false)
const toggles = computed(() => [
  { key: 'uppercase' as const, label: t('generator.uppercase') },
  { key: 'lowercase' as const, label: t('generator.lowercase') },
  { key: 'numbers' as const, label: t('generator.numbers') },
  { key: 'symbols' as const, label: t('generator.symbols') },
  { key: 'avoidAmbiguous' as const, label: t('generator.avoidAmbiguous') },
])
const passwordEntropy = computed(() => entropy(password.value, options))
function regenerate() { password.value = generatePassword(options) }
async function copyPassword() { await copySecurely(password.value); copied.value = true; setTimeout(() => { copied.value = false }, 1600) }
watch(options, regenerate, { deep: true })
onMounted(regenerate)
</script>
