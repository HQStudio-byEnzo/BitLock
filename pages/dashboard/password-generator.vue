<template>
  <div class="section-shell max-w-7xl py-10 md:py-16 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8">
    <section>
      <p class="eyebrow mb-4">{{ t('sidebar.passwordGenerator') }}</p>
      <h1 class="text-4xl md:text-6xl font-semibold tracking-tight mb-5">{{ t('dashboardGenerator.title') }}</h1>
      <p class="text-surface-300 text-lg leading-relaxed mb-8 max-w-2xl">{{ t('dashboardGenerator.desc') }}</p>

      <div class="glass-panel p-5 md:p-6 space-y-6">
        <div class="space-y-2">
          <label class="text-sm text-surface-400">{{ t('generator.generatedLabel') }}</label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input :value="password" readonly class="input-field font-mono text-lg min-w-0" :aria-label="t('generator.generatedLabel')" />
            <button class="btn-secondary shrink-0" :aria-label="t('vault.copy')" @click="copyPassword">
              <Icon name="lucide:copy" class="w-5 h-5" />
            </button>
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
    </section>

    <aside class="space-y-4">
      <div class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-xl font-semibold text-foreground">{{ t('dashboardGenerator.saveTitle') }}</h2>
        <p class="text-sm text-surface-400 leading-relaxed">{{ t('dashboardGenerator.saveDesc') }}</p>

        <div v-if="!isUnlocked" class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-800">
          {{ t('dashboardGenerator.masterPasswordNeeded') }}
        </div>

        <div>
          <label for="itemLabel" class="block text-sm font-medium text-surface-300 mb-1">{{ t('dashboardGenerator.label') }}</label>
          <input id="itemLabel" v-model="itemLabel" type="text" class="input-field" :placeholder="t('dashboardGenerator.labelPlaceholder')" />
        </div>

        <div>
          <label for="itemUrl" class="block text-sm font-medium text-surface-300 mb-1">{{ t('dashboardGenerator.websiteUrl') }}</label>
          <input id="itemUrl" v-model="itemUrl" type="url" class="input-field" :placeholder="t('dashboardGenerator.websiteUrlPlaceholder')" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="itemUsername" class="block text-sm font-medium text-surface-300 mb-1">{{ t('dashboardGenerator.username') }}</label>
            <input id="itemUsername" v-model="itemUsername" type="text" class="input-field" :placeholder="t('dashboardGenerator.usernamePlaceholder')" />
          </div>
          <div>
            <label for="itemLoginEmail" class="block text-sm font-medium text-surface-300 mb-1">{{ t('dashboardGenerator.loginEmail') }}</label>
            <input id="itemLoginEmail" v-model="itemLoginEmail" type="email" class="input-field" :placeholder="t('dashboardGenerator.loginEmailPlaceholder')" />
          </div>
          <div class="sm:col-span-2">
            <label for="itemPhone" class="block text-sm font-medium text-surface-300 mb-1">{{ t('dashboardGenerator.phone') }}</label>
            <input id="itemPhone" v-model="itemPhone" type="tel" class="input-field" :placeholder="t('dashboardGenerator.phonePlaceholder')" />
          </div>
        </div>

        <div v-if="saveError" role="alert" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
          {{ saveError }}
        </div>
        <div v-if="saveSuccess" role="status" class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-700">
          {{ saveSuccess }}
        </div>

        <div v-if="!isUnlocked" class="space-y-3">
          <div>
            <label for="masterPassword" class="block text-sm font-medium text-surface-300 mb-1">{{ t('dashboardGenerator.masterPassword') }}</label>
            <input id="masterPassword" v-model="masterPasswordInput" type="password" class="input-field" :placeholder="t('dashboardGenerator.masterPasswordPlaceholder')" />
          </div>
        </div>

        <button class="btn-primary w-full py-3" :disabled="saving" @click="saveToVault">
          <span v-if="saving">{{ t('dashboardGenerator.saving') }}</span>
          <span v-else>{{ t('dashboardGenerator.saveToVault') }}</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { serializePasswordEntry } from '~/utils/password-entry'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useLang()
const { generatePassword, entropy } = usePasswordGenerator()
const { copySecurely } = useSecureClipboard()
const { addItem } = useVault()
const { masterPassword, isUnlocked, setMasterPassword } = useMasterPassword()

const options = reactive({ length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true, avoidAmbiguous: true })
const password = ref('')
const copied = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')
const itemLabel = ref('')
const itemUrl = ref('')
const itemUsername = ref('')
const itemLoginEmail = ref('')
const itemPhone = ref('')
const masterPasswordInput = ref('')

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

async function saveToVault() {
  saveError.value = ''
  saveSuccess.value = ''

  const label = itemLabel.value.trim() || t('dashboardGenerator.defaultLabel')
  const url = itemUrl.value.trim()
  const currentMaster = masterPassword.value || masterPasswordInput.value.trim()

  if (!currentMaster) {
    saveError.value = t('dashboardGenerator.masterPasswordNeeded')
    return
  }

  saving.value = true
  try {
    if (!masterPassword.value) setMasterPassword(currentMaster)

    await addItem({
      type: 'password',
      label,
      payload: serializePasswordEntry({
        password: password.value,
        username: itemUsername.value,
        email: itemLoginEmail.value,
        phone: itemPhone.value,
      }),
      shouldEncrypt: true,
      url: url || undefined,
    })

    itemLabel.value = ''
    itemUrl.value = ''
    itemUsername.value = ''
    itemLoginEmail.value = ''
    itemPhone.value = ''
    saveSuccess.value = t('dashboardGenerator.saved')
  } catch (err: any) {
    saveError.value = err.data?.message || t('dashboardGenerator.saveError')
  } finally {
    saving.value = false
  }
}

watch(options, regenerate, { deep: true })
onMounted(regenerate)
</script>
