<template>
  <div class="mx-auto w-full max-w-3xl space-y-8 px-6 py-8 md:px-10 md:py-10">
    <header>
      <p class="eyebrow">{{ t('sidebar.seedGenerator') }}</p>
      <h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-surface-50 md:text-4xl">{{ t('seedGenerator.title') }}</h1>
      <p class="mt-3 max-w-2xl text-surface-500">{{ t('seedGenerator.desc') }}</p>
    </header>

    <section class="card space-y-6 p-5 md:p-6">
      <div class="space-y-2">
        <label class="text-sm text-surface-400">{{ t('seedGenerator.generatedLabel') }}</label>
        <textarea :value="seedPhrase" readonly rows="4" :aria-label="t('seedGenerator.generatedLabel')" class="input-field resize-none font-mono text-base"></textarea>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <button class="btn-primary flex-1" @click="regenerate">
          <Icon name="hugeicons:sparkles" class="h-4 w-4" />
          {{ t('seedGenerator.generate') }}
        </button>
        <button class="btn-secondary" :disabled="!seedPhrase" @click="showSave = true">
          <Icon name="hugeicons:save" class="h-4 w-4" />
          {{ t('seedGenerator.saveToVault') }}
        </button>
        <button class="btn-secondary" :aria-label="t('vault.copy')" @click="copySeed">
          <Icon name="hugeicons:copy" class="h-4 w-4" />
        </button>
      </div>

      <p v-if="copied" role="status" class="text-sm text-emerald-600">{{ t('seedGenerator.copied') }}</p>
    </section>

    <VaultAddModal
      v-if="showSave"
      default-type="crypto"
      :initial-payload="seedPhrase"
      @close="showSave = false"
      @added="showSave = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useLang()
const { generateSeedPhrase } = useSeedGenerator()
const { copySecurely } = useSecureClipboard()

const seedPhrase = ref('')
const copied = ref(false)
const showSave = ref(false)

function regenerate() {
  seedPhrase.value = generateSeedPhrase()
}

async function copySeed() {
  await copySecurely(seedPhrase.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}

onMounted(regenerate)
</script>
