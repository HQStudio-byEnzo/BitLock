<template>
  <div class="min-h-screen text-foreground">
    <UiPublicNav />

    <main class="section-shell max-w-7xl py-10 md:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
      <section class="space-y-6">
        <div>
          <p class="eyebrow mb-4">{{ t('sidebar.audit') }}</p>
          <h1 class="text-4xl md:text-6xl font-semibold tracking-tight mb-5">{{ t('audit.toolTitle') }}</h1>
          <p class="text-surface-300 text-lg leading-relaxed max-w-2xl">{{ t('audit.toolDesc') }}</p>
        </div>

        <div class="glass-panel p-5 md:p-6 space-y-6">
          <div>
            <label for="audit-password" class="block text-sm text-surface-400 mb-2">{{ t('audit.passwordLabel') }}</label>
            <input
              id="audit-password"
              v-model="password"
              type="password"
              class="input-field font-mono"
              :placeholder="t('audit.passwordPlaceholder')"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="metric-tile">
              <p class="text-sm text-surface-400">{{ t('audit.score') }}</p>
              <p class="mt-2 text-3xl font-semibold" :class="scoreColor">{{ score }}%</p>
            </div>
            <div class="metric-tile">
              <p class="text-sm text-surface-400">{{ t('audit.strength') }}</p>
              <p class="mt-2 text-lg font-semibold text-foreground">{{ strengthLabel }}</p>
            </div>
            <div class="metric-tile">
              <p class="text-sm text-surface-400">{{ t('audit.entropy') }}</p>
              <p class="mt-2 text-lg font-semibold text-foreground">{{ entropyBits }} bits</p>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="issue in passwordIssues"
              :key="issue.key"
              class="rounded-2xl border p-4"
              :class="issue.level === 'good' ? 'border-emerald-500/20 bg-emerald-500/5' : issue.level === 'warn' ? 'border-amber-500/20 bg-amber-500/5' : 'border-red-500/20 bg-red-500/5'"
            >
              <div class="flex items-start gap-3">
                <Icon :name="issue.icon" class="w-5 h-5 mt-0.5" :class="issue.level === 'good' ? 'text-emerald-400' : issue.level === 'warn' ? 'text-amber-400' : 'text-red-600'" />
                <div>
                  <p class="text-sm font-medium text-foreground">{{ issue.title }}</p>
                  <p class="text-sm text-surface-400 mt-1">{{ issue.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContentArticleBody :sections="tool.sections" :faq="tool.faq" :faq-title="toolUi.faqTitle" />
      </section>

      <aside class="glass-panel p-5 md:p-6 h-fit space-y-4">
        <h2 class="text-xl font-semibold text-foreground">{{ t('audit.checklist') }}</h2>
        <ul class="space-y-3 text-sm text-surface-300">
          <li>{{ t('audit.practice1') }}</li>
          <li>{{ t('audit.practice2') }}</li>
          <li>{{ t('audit.practice3') }}</li>
          <li>{{ t('audit.practice4') }}</li>
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

useSeoMeta({
  title: t('audit.toolSeoTitle'),
  description: t('audit.toolSeoDesc'),
})

const tool = toolContent.passwordAudit[locale.value === 'en' ? 'en' : 'fr']
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

const password = ref('')

const entropyBits = computed(() => {
  if (!password.value) return 0
  let charset = 0
  if (/[a-z]/.test(password.value)) charset += 26
  if (/[A-Z]/.test(password.value)) charset += 26
  if (/\d/.test(password.value)) charset += 10
  if (/[^A-Za-z0-9]/.test(password.value)) charset += 32
  return charset ? Math.round(password.value.length * Math.log2(charset)) : 0
})

const score = computed(() => {
  let total = 0
  if (password.value.length >= 16) total += 30
  else if (password.value.length >= 12) total += 20
  else if (password.value.length >= 8) total += 10
  if (/[a-z]/.test(password.value)) total += 15
  if (/[A-Z]/.test(password.value)) total += 15
  if (/\d/.test(password.value)) total += 15
  if (/[^A-Za-z0-9]/.test(password.value)) total += 15
  if (!/(.)\1{2,}/.test(password.value)) total += 5
  if (!/123|abc|qwerty|password|admin|qvault/i.test(password.value)) total += 5
  return Math.min(100, total)
})

const scoreColor = computed(() => {
  if (score.value >= 80) return 'text-emerald-400'
  if (score.value >= 55) return 'text-amber-400'
  return 'text-red-600'
})

const strengthLabel = computed(() => {
  if (!password.value) return t('audit.strengthEmpty')
  if (score.value >= 80) return t('audit.strengthStrong')
  if (score.value >= 55) return t('audit.strengthMedium')
  return t('audit.strengthWeak')
})

const passwordIssues = computed(() => [
  {
    key: 'length',
    icon: password.value.length >= 12 ? 'hugeicons:checkmark-circle-02' : 'hugeicons:triangle-alert',
    level: password.value.length >= 12 ? 'good' : 'warn',
    title: password.value.length >= 12 ? t('audit.lengthGood') : t('audit.lengthBad'),
    desc: t('audit.lengthDesc'),
  },
  {
    key: 'mix',
    icon: /[a-z]/.test(password.value) && /[A-Z]/.test(password.value) && /\d/.test(password.value) && /[^A-Za-z0-9]/.test(password.value) ? 'hugeicons:shield-check' : 'hugeicons:shield-alert',
    level: /[a-z]/.test(password.value) && /[A-Z]/.test(password.value) && /\d/.test(password.value) && /[^A-Za-z0-9]/.test(password.value) ? 'good' : 'warn',
    title: /[a-z]/.test(password.value) && /[A-Z]/.test(password.value) && /\d/.test(password.value) && /[^A-Za-z0-9]/.test(password.value) ? t('audit.mixGood') : t('audit.mixBad'),
    desc: t('audit.mixDesc'),
  },
  {
    key: 'patterns',
    icon: /123|abc|qwerty|password|admin|qvault/i.test(password.value) ? 'hugeicons:cancel-circle' : 'hugeicons:checkmark-circle-02',
    level: /123|abc|qwerty|password|admin|qvault/i.test(password.value) ? 'bad' : 'good',
    title: /123|abc|qwerty|password|admin|qvault/i.test(password.value) ? t('audit.patternBad') : t('audit.patternGood'),
    desc: t('audit.patternDesc'),
  },
].filter(issue => password.value || issue.key === 'length'))
</script>
