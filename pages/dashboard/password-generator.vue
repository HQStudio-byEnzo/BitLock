<template>
  <div class="mx-auto w-full max-w-4xl space-y-8 px-6 py-8 md:px-10 md:py-10">
    <header>
      <p class="eyebrow">{{ t('sidebar.passwordGenerator') }}</p>
      <h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-surface-50 md:text-4xl">{{ t('dashboardGenerator.title') }}</h1>
      <p class="mt-3 max-w-2xl text-surface-500">{{ t('dashboardGenerator.desc') }}</p>
    </header>

    <section class="card space-y-6 p-5 md:p-6">
      <div class="space-y-2">
        <label class="text-sm text-surface-400">{{ t('generator.generatedLabel') }}</label>
        <div class="flex flex-col gap-2 sm:flex-row">
          <input :value="password" readonly class="input-field min-w-0 font-mono text-lg" :aria-label="t('generator.generatedLabel')" />
          <button class="btn-secondary shrink-0" :aria-label="t('vault.copy')" @click="copyPassword">
            <Icon name="hugeicons:copy" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm text-surface-300">{{ t('generator.length') }}: {{ options.length }}</span>
          <input v-model.number="options.length" type="range" min="12" max="64" class="w-full" />
        </label>
        <div class="metric-tile">
          <p class="text-sm text-surface-400">{{ t('generator.entropy') }}</p>
          <p class="text-2xl font-semibold text-emerald-600">{{ passwordEntropy }} bits</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label v-for="option in toggles" :key="option.key" class="flex items-center gap-3 rounded-xl border border-border p-3">
          <input v-model="options[option.key]" type="checkbox" />
          <span>{{ option.label }}</span>
        </label>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <button class="btn-primary flex-1 py-3" @click="regenerate">
          <Icon name="hugeicons:sparkles" class="h-4 w-4" />
          {{ t('generator.generate') }}
        </button>
        <button class="btn-secondary py-3" :disabled="!password" @click="showSave = true">
          <Icon name="hugeicons:save" class="h-4 w-4" />
          {{ t('dashboardGenerator.saveToVault') }}
        </button>
      </div>

      <p v-if="copied" role="status" class="text-sm text-emerald-600">{{ t('generator.copied') }}</p>
    </section>

    <VaultAddModal
      v-if="showSave"
      default-type="password"
      :initial-payload="password"
      @close="showSave = false"
      @added="showSave = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useLang()
const { generatePassword, entropy } = usePasswordGenerator()
const { copySecurely } = useSecureClipboard()

const options = reactive({ length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true, avoidAmbiguous: true })
const password = ref('')
const copied = ref(false)
const showSave = ref(false)

const toggles = computed(() => [
  { key: 'uppercase' as const, label: t('generator.uppercase') },
  { key: 'lowercase' as const, label: t('generator.lowercase') },
  { key: 'numbers' as const, label: t('generator.numbers') },
  { key: 'symbols' as const, label: t('generator.symbols') },
  { key: 'avoidAmbiguous' as const, label: t('generator.avoidAmbiguous') },
])

const passwordEntropy = computed(() => entropy(password.value, options))

function regenerate() {
  password.value = generatePassword(options)
}

async function copyPassword() {
  await copySecurely(password.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}

watch(options, regenerate, { deep: true })
onMounted(regenerate)
</script>
