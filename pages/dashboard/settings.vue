<template>
  <div class="section-shell max-w-3xl py-8 md:py-12 space-y-8">
    <h1 class="font-display text-3xl font-semibold tracking-tight text-foreground">{{ t('settings.title') }}</h1>

    <section class="profile">
      <UiAvatarPicker size="lg" />
      <div class="profile__text">
        <h2>{{ user?.username || '—' }}</h2>
        <p>{{ t('nav.localAccount') }}<template v-if="userInfo?.created_at"> · {{ formatDate(userInfo.created_at) }}</template></p>
      </div>
    </section>

    <nav class="rows" aria-label="Sections des paramètres">
      <button
        v-for="section in settingSections"
        :key="section.id"
        type="button"
        class="row"
        :aria-pressed="activeSection === section.id"
        @click="activeSection = section.id"
      >
        <Icon :name="section.icon" class="row__icon" />
        <span class="row__label">{{ section.label }}</span>
        <Icon name="hugeicons:chevron-right" class="row__chevron" />
      </button>
    </nav>

    <section v-if="activeSection === 'account'" class="space-y-6">
      <section class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:user" class="w-5 h-5 text-surface-400" />
          {{ t('settings.account') }}
        </h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-4 py-2 border-b border-surface-800">
            <span class="text-sm text-surface-400">{{ t('settings.username') }}</span>
            <span class="text-sm text-surface-200 text-right break-all">@{{ user?.username }}</span>
          </div>
          <div class="flex items-center justify-between gap-4 py-2">
            <span class="text-sm text-surface-400">{{ t('settings.since') }}</span>
            <span class="text-sm text-surface-200 text-right">{{ formatDate(userInfo?.created_at) }}</span>
          </div>
        </div>
      </section>

      <section class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:key-round" class="w-5 h-5 text-surface-400" />
          {{ t('settings.changePwd') }}
        </h2>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label for="currentPwd" class="block text-sm font-medium text-surface-300 mb-1">{{ t('settings.currentPwd') }}</label>
            <input
              id="currentPwd"
              v-model="pwdForm.currentPassword"
              type="password"
              required
              autocomplete="current-password"
              class="input-field"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label for="newPwd" class="block text-sm font-medium text-surface-300 mb-1">{{ t('settings.newPwd') }}</label>
            <input
              id="newPwd"
              v-model="pwdForm.newPassword"
              type="password"
              required
              :minlength="MIN_ACCOUNT_PASSWORD_LENGTH"
              maxlength="72"
              autocomplete="new-password"
              class="input-field"
              :placeholder="t('settings.newPwdPlaceholder')"
            />
          </div>
          <div>
            <label for="confirmPwd" class="block text-sm font-medium text-surface-300 mb-1">{{ t('settings.confirmPwd') }}</label>
            <input
              id="confirmPwd"
              v-model="pwdForm.confirmPassword"
              type="password"
              required
              :minlength="MIN_ACCOUNT_PASSWORD_LENGTH"
              maxlength="72"
              autocomplete="new-password"
              class="input-field"
              placeholder="••••••••"
            />
          </div>

          <div v-if="pwdError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {{ pwdError }}
          </div>
          <div v-if="pwdSuccess" class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-700">
            {{ pwdSuccess }}
          </div>

          <button type="submit" :disabled="pwdLoading" class="btn-primary">
            <span v-if="pwdLoading">{{ t('settings.changePwdBtn') }}...</span>
            <span v-else>{{ t('settings.changePwdBtn') }}</span>
          </button>
        </form>
      </section>
    </section>

    <section v-else-if="activeSection === 'security'" class="space-y-6">
      <section class="card space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:shield-01" class="w-5 h-5 text-surface-400" />
          {{ t('settings.security') }}
        </h2>
        <div class="system-note">
          <p class="text-sm text-surface-400 leading-relaxed">
            {{ t('settings.securityDesc') }}
          </p>
        </div>
      </section>

      <section class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:key-round" class="w-5 h-5 text-surface-400" />
          {{ t('settings.masterPwdTitle') }}
        </h2>

        <p class="text-sm text-surface-400 leading-relaxed">
          {{ t('settings.masterPwdDesc') }}
        </p>

        <form @submit.prevent="handleChangeMasterPassword" class="space-y-4">
          <div>
            <label for="currentMasterPassword" class="block text-sm font-medium text-surface-300 mb-1">
              {{ t('settings.masterPwdCurrent') }}
            </label>
            <input
              id="currentMasterPassword"
              v-model="masterPwdForm.currentPassword"
              type="password"
              class="input-field"
              :placeholder="t('settings.masterPwdCurrentPlaceholder')"
            />
          </div>
          <div>
            <label for="newMasterPassword" class="block text-sm font-medium text-surface-300 mb-1">
              {{ t('settings.masterPwdNew') }}
            </label>
            <input
              id="newMasterPassword"
              v-model="masterPwdForm.newPassword"
              type="password"
              required
              :minlength="MIN_MASTER_PASSWORD_LENGTH"
              maxlength="128"
              autocomplete="new-password"
              class="input-field"
              :placeholder="t('settings.masterPwdNewPlaceholder')"
            />
          </div>
          <div>
            <label for="confirmMasterPassword" class="block text-sm font-medium text-surface-300 mb-1">
              {{ t('settings.masterPwdConfirm') }}
            </label>
            <input
              id="confirmMasterPassword"
              v-model="masterPwdForm.confirmPassword"
              type="password"
              required
              :minlength="MIN_MASTER_PASSWORD_LENGTH"
              maxlength="128"
              autocomplete="new-password"
              class="input-field"
              :placeholder="t('settings.masterPwdConfirmPlaceholder')"
            />
          </div>

          <div v-if="masterPwdError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {{ masterPwdError }}
          </div>
          <div v-if="masterPwdSuccess" class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-700">
            {{ masterPwdSuccess }}
          </div>

          <div class="flex flex-wrap gap-2">
            <button type="submit" :disabled="masterPwdLoading" class="btn-primary">
              <span v-if="masterPwdLoading">{{ t('settings.masterPwdSaving') }}...</span>
              <span v-else>{{ t('settings.masterPwdSave') }}</span>
            </button>
            <button type="button" @click="handleLockVault" class="btn-secondary">
              {{ t('settings.lockVault') }}
            </button>
          </div>
        </form>
      </section>

      <section class="glass-panel p-5 md:p-6 space-y-5">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:sliders-horizontal" class="w-5 h-5 text-surface-400" />
          {{ t('settings.securityPrefs') }}
        </h2>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-surface-200">{{ t('settings.autoLock') }}</p>
              <p class="text-xs text-surface-500">{{ t('settings.autoLockDesc') }}</p>
            </div>
            <div class="w-40 shrink-0">
              <UiSelectMenu
                :model-value="String(securitySettings.autoLockMinutes)"
                :options="autoLockOptions"
                @update:model-value="(value) => securitySettings.autoLockMinutes = Number(value)"
              />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-surface-200">{{ t('settings.clipboardClear') }}</p>
              <p class="text-xs text-surface-500">{{ t('settings.clipboardClearDesc') }}</p>
            </div>
            <div class="w-40 shrink-0">
              <UiSelectMenu
                :model-value="String(securitySettings.clipboardClearSeconds)"
                :options="clipboardOptions"
                @update:model-value="(value) => securitySettings.clipboardClearSeconds = Number(value)"
              />
            </div>
          </div>
        </div>

        <label class="flex items-start gap-3 text-sm text-surface-300 cursor-pointer">
          <input v-model="securitySettings.hideDecryptedByDefault" type="checkbox" class="mt-1" />
          <span>
            {{ t('settings.hideDecrypted') }}
            <span class="block text-xs text-surface-500 mt-0.5">{{ t('settings.hideDecryptedDesc') }}</span>
          </span>
        </label>

        <label class="flex items-start gap-3 text-sm text-surface-300 cursor-pointer">
          <input v-model="securitySettings.privacyShield" type="checkbox" class="mt-1" />
          <span>
            {{ t('settings.privacyShield') }}
            <span class="block text-xs text-surface-500 mt-0.5">{{ t('settings.privacyShieldDesc') }}</span>
          </span>
        </label>

        <div class="flex flex-wrap gap-2 pt-2">
          <button type="button" class="btn-primary" @click="saveSecuritySettings">{{ t('settings.save') }}</button>
          <button type="button" class="btn-secondary" @click="resetMasterOnboarding">{{ t('settings.resetOnboarding') }}</button>
        </div>

        <div v-if="securitySaved" class="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700">
          {{ t('settings.saved') }}
        </div>
      </section>

      <section class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2"><Icon name="hugeicons:fingerprint-pattern" class="w-5 h-5 text-accent-text" />{{ t('settings.passkeyTitle') }}</h2>
        <p class="text-sm text-surface-400">{{ t('settings.passkeyDesc') }}</p>
        <p v-if="!passkeySupported" class="text-sm text-amber-700">{{ t('settings.passkeyUnsupported') }}</p>
        <div v-else class="flex flex-wrap items-center gap-3">
          <span class="tech-status">{{ passkeyConfigured ? t('settings.passkeyActive') : t('settings.passkeyInactive') }}</span>
          <button v-if="!passkeyConfigured" type="button" class="btn-primary" :disabled="!isUnlocked || passkeyLoading" @click="enablePasskey">{{ t('settings.passkeyEnable') }}</button>
          <button v-else type="button" class="btn-secondary" @click="disablePasskey">{{ t('settings.passkeyDisable') }}</button>
        </div>
        <p v-if="passkeyMessage" class="text-sm" :class="passkeyFailed ? 'text-red-600' : 'text-accent-text'">{{ passkeyMessage }}</p>
      </section>

      <section class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:unplug" class="w-5 h-5 text-accent-text" />
          {{ t('settings.extensionTitle') }}
        </h2>
        <p class="text-sm text-surface-400">{{ t('settings.extensionDesc') }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <span class="tech-status">{{ extensionConfigured ? t('settings.extensionActive') : t('settings.extensionInactive') }}</span>
          <button type="button" class="btn-primary" :disabled="extensionLoading" @click="generateExtensionToken">
            {{ extensionConfigured ? t('settings.extensionRotate') : t('settings.extensionGenerate') }}
          </button>
          <button v-if="extensionConfigured" type="button" class="btn-secondary" :disabled="extensionLoading" @click="revokeExtensionToken">
            {{ t('settings.extensionRevoke') }}
          </button>
        </div>
        <div v-if="extensionToken" class="system-note space-y-3">
          <p class="text-xs text-amber-700">{{ t('settings.extensionOnce') }}</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input :value="extensionToken" readonly class="input-field flex-1 font-mono text-xs" />
            <button type="button" class="btn-secondary" @click="copyExtensionToken">
              <Icon name="hugeicons:copy" class="w-4 h-4" />{{ t('settings.extensionCopy') }}
            </button>
          </div>
        </div>
        <p v-if="extensionMessage" class="text-sm" :class="extensionFailed ? 'text-red-600' : 'text-accent-text'">{{ extensionMessage }}</p>
      </section>
    </section>

    <section v-else-if="activeSection === 'language'" class="space-y-6">
      <section class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:globe" class="w-5 h-5 text-surface-400" />
          {{ t('settings.language') }}
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            @click="setLocale('fr')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="locale === 'fr' ? 'bg-accent-600 text-primary-foreground' : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-600'"
          >
            French
          </button>
          <button
            @click="setLocale('en')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="locale === 'en' ? 'bg-accent-600 text-primary-foreground' : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-600'"
          >
            English
          </button>
        </div>
      </section>
    </section>

    <section v-else-if="activeSection === 'shortcuts'" class="space-y-6">
      <section class="glass-panel p-5 md:p-6 space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icon name="hugeicons:keyboard" class="w-5 h-5 text-surface-400" />
              {{ t('settings.shortcuts') }}
            </h2>
            <p class="text-sm text-surface-400 mt-1 max-w-2xl">{{ t('settings.shortcutsDesc') }}</p>
          </div>
          <label class="flex items-center gap-3 rounded-2xl border border-surface-800 bg-surface-900/80 px-4 py-3">
            <input v-model="shortcuts.enabled" type="checkbox" class="rounded border-surface-600 text-accent-500 focus:ring-accent-500" @change="saveShortcuts" />
            <span class="text-sm text-surface-200">{{ t('settings.shortcutsEnabled') }}</span>
          </label>
        </div>

        <div class="space-y-3 pt-2">
          <div
            v-for="action in shortcutActions"
            :key="action.id"
            class="rounded-2xl border border-surface-800 bg-surface-900/70 p-4 space-y-3"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-sm font-medium text-foreground">{{ t(action.labelKey) }}</p>
                <p class="text-xs text-surface-500 mt-1">{{ t(action.descriptionKey) }}</p>
              </div>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2 text-sm text-surface-300">
                  <input
                    v-model="shortcuts.actions[action.id].enabled"
                    type="checkbox"
                    class="rounded border-surface-600 text-accent-500 focus:ring-accent-500"
                    @change="saveShortcuts"
                  />
                  <span>{{ t('settings.shortcutEnabled') }}</span>
                </label>
                <button
                  type="button"
                  class="btn-secondary whitespace-nowrap"
                  @click="startShortcutCapture(action.id)"
                >
                  {{ editingShortcutId === action.id ? t('settings.shortcutPress') : formatShortcutCombo(shortcuts.actions[action.id].combo) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          <button type="button" class="btn-primary" @click="saveShortcuts">{{ t('settings.save') }}</button>
          <button type="button" class="btn-secondary" @click="resetShortcuts">{{ t('settings.shortcutResetAll') }}</button>
        </div>

        <div v-if="shortcutsSaved" class="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700">
          {{ t('settings.shortcutsSaved') }}
        </div>
      </section>
    </section>

    <section v-else-if="activeSection === 'support'" class="space-y-6">
      <section class="glass-panel p-5 md:p-6 space-y-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="hugeicons:message-circle" class="w-5 h-5 text-surface-400" />
          {{ t('settings.support') }}
        </h2>
        <p class="text-sm text-surface-400">{{ t('settings.supportDesc') }}</p>
        <a href="https://discord.gg/J9xmQchpX6" target="_blank" rel="noopener noreferrer" class="btn-secondary inline-flex items-center gap-2">
          <Icon name="hugeicons:message-circle" class="w-4 h-4" />
          {{ t('settings.joinDiscord') }}
        </a>
      </section>
    </section>

    <section v-else class="space-y-6">
      <section class="card border-red-500/20 space-y-4">
        <h2 class="text-lg font-semibold text-red-600 flex items-center gap-2">
          <Icon name="hugeicons:triangle-alert" class="w-5 h-5" />
          {{ t('settings.danger') }}
        </h2>

        <div class="space-y-4">
          <button type="button" @click="handleSignOut" class="btn-secondary flex items-center gap-2">
            <Icon name="hugeicons:log-out" class="w-4 h-4" />
            {{ t('settings.logout') }}
          </button>

          <div class="border-t border-surface-800 pt-4">
            <p class="text-sm text-surface-400 mb-3">
              {{ t('settings.deleteWarning') }}
            </p>

            <div v-if="!showDeleteConfirm">
              <button type="button" @click="showDeleteConfirm = true" class="btn-danger flex items-center gap-2">
                <Icon name="hugeicons:trash" class="w-4 h-4" />
                {{ t('settings.deleteBtn') }}
              </button>
            </div>

            <div v-else class="space-y-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <p class="text-sm text-red-300 font-medium">{{ t('settings.deleteConfirm') }}</p>
              <input
                v-model="deletePassword"
                type="password"
                class="input-field"
                :placeholder="t('settings.yourPassword')"
              />
              <div v-if="deleteError" class="text-sm text-red-600">{{ deleteError }}</div>
              <div class="flex gap-2">
                <button type="button" @click="handleDeleteAccount" :disabled="deleteLoading" class="btn-danger flex items-center gap-2">
                  <Icon name="hugeicons:trash" class="w-4 h-4" />
                  <span v-if="deleteLoading">{{ t('settings.deleting') }}</span>
                  <span v-else>{{ t('settings.confirmDelete') }}</span>
                </button>
                <button type="button" @click="showDeleteConfirm = false; deletePassword = ''" class="btn-secondary">
                  {{ t('settings.cancel') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { type ShortcutActionId, useShortcutPreferences } from '~/composables/useShortcuts'
import {
  MIN_ACCOUNT_PASSWORD_LENGTH,
  MIN_MASTER_PASSWORD_LENGTH,
} from '~/utils/security-policy'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { user, signOut } = useAuthClient()
const { locale, setLocale, t } = useLang()
const { formatDate: baseFormatDate } = useDateFormat()
const initial = computed(() => (user.value?.username || '?').charAt(0).toUpperCase())
const { fetchItems, reencryptVault } = useVault()
const { masterPassword, clearMasterPassword, isUnlocked } = useMasterPassword()
const { shortcuts, shortcutActions, loadShortcuts, saveShortcuts, resetShortcuts, formatShortcutCombo, editing } = useShortcutPreferences()
const { supported: passkeySupported, configured: passkeyConfigured, enable: setupPasskey, disable: removePasskey } = usePasskeyUnlock()
const { copySecurely } = useSecureClipboard()

const userInfo = ref<any>(null)
const securitySaved = ref(false)
const shortcutsSaved = ref(false)
const masterPwdLoading = ref(false)
const masterPwdError = ref('')
const masterPwdSuccess = ref('')
const passkeyLoading = ref(false)
const passkeyMessage = ref('')
const passkeyFailed = ref(false)
const extensionConfigured = ref(false)
const extensionLoading = ref(false)
const extensionToken = ref('')
const extensionMessage = ref('')
const extensionFailed = ref(false)
const activeSection = ref<'account' | 'security' | 'language' | 'shortcuts' | 'support' | 'danger'>('account')
const editingShortcutId = ref<ShortcutActionId | null>(null)
const securitySettings = reactive({
  autoLockMinutes: 5,
  clipboardClearSeconds: 30,
  hideDecryptedByDefault: true,
  privacyShield: true,
})
const autoLockOptions = computed(() => [
  { value: '1', label: '1 min' },
  { value: '5', label: '5 min' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '0', label: t('settings.disabled') },
])
const clipboardOptions = computed(() => [
  { value: '15', label: '15 s' },
  { value: '30', label: '30 s' },
  { value: '60', label: '60 s' },
  { value: '0', label: t('settings.disabled') },
])
const settingSections = computed(() => [  { id: 'account', label: t('settings.account'), icon: 'hugeicons:user' },
  { id: 'security', label: t('settings.security'), icon: 'hugeicons:shield-01' },
  { id: 'language', label: t('settings.language'), icon: 'hugeicons:globe' },
  { id: 'shortcuts', label: t('settings.shortcuts'), icon: 'hugeicons:keyboard' },
  { id: 'support', label: t('settings.support'), icon: 'hugeicons:message-circle' },
  { id: 'danger', label: t('settings.danger'), icon: 'hugeicons:triangle-alert' },
 ] as const)

onMounted(async () => {
  try {
    userInfo.value = await $fetch('/api/auth/me')
  } catch {}
  loadSecuritySettings()
  loadShortcuts()
  await fetchItems()
  await loadExtensionTokenStatus()
})

// Change password
const pwdForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref('')

async function handleChangePassword() {
  pwdError.value = ''
  pwdSuccess.value = ''

  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdError.value = t('settings.pwdMismatch')
    return
  }
  if (pwdForm.newPassword.length < MIN_ACCOUNT_PASSWORD_LENGTH) {
    pwdError.value = t('auth.register.pwdTooShort')
    return
  }

  pwdLoading.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword },
    })
    pwdSuccess.value = t('settings.pwdSuccess')
    pwdForm.currentPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    extensionConfigured.value = false
    extensionToken.value = ''
  } catch (err: any) {
    pwdError.value = err.data?.message || t('settings.pwdError')
  } finally {
    pwdLoading.value = false
  }
}

// Delete account
const showDeleteConfirm = ref(false)
const deletePassword = ref('')
const deleteLoading = ref(false)
const deleteError = ref('')

async function handleDeleteAccount() {
  if (!deletePassword.value) {
    deleteError.value = t('settings.deleteRequired')
    return
  }
  deleteError.value = ''
  deleteLoading.value = true
  try {
    await $fetch('/api/auth/delete-account', {
      method: 'POST',
      body: { password: deletePassword.value },
    })
    removePasskey()
    clearOnboardingState()
    clearMasterPassword()
    navigateTo('/')
  } catch (err: any) {
    deleteError.value = err.data?.message || t('settings.deleteError')
  } finally {
    deleteLoading.value = false
  }
}

function formatDate(date: string | undefined) {
  return baseFormatDate(date, { year: 'numeric', month: 'long', day: 'numeric' }, '—')
}

function handleSignOut() {
  signOut()
}

function handleLockVault() {
  clearMasterPassword()
  navigateTo('/auth/locked?reason=manual')
}

function loadSecuritySettings() {
  securitySettings.autoLockMinutes = Number(localStorage.getItem('qvault.security.autoLockMinutes') || 5)
  securitySettings.clipboardClearSeconds = Number(localStorage.getItem('qvault.security.clipboardClearSeconds') || 30)
  securitySettings.hideDecryptedByDefault = localStorage.getItem('qvault.security.hideDecryptedByDefault') !== 'false'
  securitySettings.privacyShield = localStorage.getItem('qvault.security.privacyShield') !== 'false'
}

function saveSecuritySettings() {
  localStorage.setItem('qvault.security.autoLockMinutes', String(securitySettings.autoLockMinutes))
  localStorage.setItem('qvault.security.clipboardClearSeconds', String(securitySettings.clipboardClearSeconds))
  localStorage.setItem('qvault.security.hideDecryptedByDefault', String(securitySettings.hideDecryptedByDefault))
  localStorage.setItem('qvault.security.privacyShield', String(securitySettings.privacyShield))
  window.dispatchEvent(new Event('qvault-security-settings-changed'))
  securitySaved.value = true
  setTimeout(() => { securitySaved.value = false }, 2000)
}

function onboardingKey(name: 'done' | 'snoozed') {
  const owner = user.value?.id || user.value?.username || 'anonymous'
  return `qvault.masterPasswordOnboarding:${encodeURIComponent(String(owner))}:${name}`
}

function clearOnboardingState() {
  localStorage.removeItem(onboardingKey('done'))
  localStorage.removeItem(onboardingKey('snoozed'))
}

function resetMasterOnboarding() {
  clearOnboardingState()
  securitySaved.value = true
  setTimeout(() => { securitySaved.value = false }, 2000)
}

async function enablePasskey() {
  if (!masterPassword.value) { passkeyFailed.value = true; passkeyMessage.value = t('settings.passkeyUnlockFirst'); return }
  passkeyLoading.value = true; passkeyMessage.value = ''; passkeyFailed.value = false
  try { await setupPasskey(masterPassword.value, user.value?.username || 'QVault user'); passkeyMessage.value = t('settings.passkeyEnabled') }
  catch { passkeyFailed.value = true; passkeyMessage.value = t('settings.passkeyError') }
  finally { passkeyLoading.value = false }
}

function disablePasskey() { removePasskey(); passkeyMessage.value = t('settings.passkeyDisabled'); passkeyFailed.value = false }

async function loadExtensionTokenStatus() {
  try {
    const status: { configured: boolean } = await $fetch('/api/security/extension-token')
    extensionConfigured.value = status.configured
  } catch {}
}

async function generateExtensionToken() {
  extensionLoading.value = true
  extensionMessage.value = ''
  extensionFailed.value = false
  try {
    const response: { token: string } = await $fetch('/api/security/extension-token', { method: 'POST' })
    extensionToken.value = response.token
    extensionConfigured.value = true
    extensionMessage.value = t('settings.extensionGenerated')
  } catch {
    extensionFailed.value = true
    extensionMessage.value = t('settings.extensionFailed')
  } finally {
    extensionLoading.value = false
  }
}

async function revokeExtensionToken() {
  extensionLoading.value = true
  extensionMessage.value = ''
  extensionFailed.value = false
  try {
    await $fetch('/api/security/extension-token', { method: 'DELETE' })
    extensionToken.value = ''
    extensionConfigured.value = false
    extensionMessage.value = t('settings.extensionRevoked')
  } catch {
    extensionFailed.value = true
    extensionMessage.value = t('settings.extensionFailed')
  } finally {
    extensionLoading.value = false
  }
}

async function copyExtensionToken() {
  await copySecurely(extensionToken.value, 120)
  extensionMessage.value = t('settings.extensionCopied')
  extensionFailed.value = false
}

function startShortcutCapture(id: ShortcutActionId) {
  editing.value = true
  editingShortcutId.value = id
}

function stopShortcutCapture() {
  editing.value = false
  editingShortcutId.value = null
}

function buildShortcutCombo(event: KeyboardEvent) {
  const parts: string[] = []
  if (event.metaKey || event.ctrlKey) parts.push('mod')
  if (event.shiftKey) parts.push('shift')
  if (event.altKey) parts.push('alt')

  const key = event.key.toLowerCase()
  if (['control', 'shift', 'alt', 'meta'].includes(key)) return ''
  if (key === 'escape') return 'escape'
  if (key === ',') {
    parts.push(',')
    return parts.join('+')
  }

  if (key.length === 1) {
    parts.push(key)
    return parts.join('+')
  }

  return ''
}

function handleShortcutCapture(event: KeyboardEvent) {
  if (!editingShortcutId.value) return
  event.preventDefault()

  if (event.key.toLowerCase() === 'escape') {
    stopShortcutCapture()
    return
  }

  const combo = buildShortcutCombo(event)
  if (!combo) return

  shortcuts.value.actions[editingShortcutId.value].combo = combo
  saveShortcuts()
  shortcutsSaved.value = true
  stopShortcutCapture()
  setTimeout(() => { shortcutsSaved.value = false }, 2000)
}

const masterPwdForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function handleChangeMasterPassword() {
  masterPwdError.value = ''
  masterPwdSuccess.value = ''

  if (masterPwdForm.newPassword !== masterPwdForm.confirmPassword) {
    masterPwdError.value = t('settings.masterPwdMismatch')
    return
  }
  if (masterPwdForm.newPassword.length < MIN_MASTER_PASSWORD_LENGTH) {
    masterPwdError.value = t('masterSetup.tooShort')
    return
  }

  masterPwdLoading.value = true

  try {
    await reencryptVault(masterPwdForm.currentPassword || (isUnlocked.value ? masterPassword.value || '' : ''), masterPwdForm.newPassword)
    removePasskey()
    masterPwdForm.currentPassword = ''
    masterPwdForm.newPassword = ''
    masterPwdForm.confirmPassword = ''
    masterPwdSuccess.value = t('settings.masterPwdSuccess')
  } catch (err: any) {
    masterPwdError.value = err.data?.message || err.message || t('settings.masterPwdError')
  } finally {
    masterPwdLoading.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleShortcutCapture)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleShortcutCapture)
})
</script>

<style scoped>
.profile {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-block: var(--space-4);
  text-align: center;
}

.profile__avatar {
  align-items: center;
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: 999px;
  color: var(--color-accent-strong);
  display: grid;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  height: 5.5rem;
  place-items: center;
  width: 5.5rem;
}

.profile__text h2 {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 600;
}

.profile__text p {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-top: var(--space-1);
}

.rows {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 2px oklch(0.2 0.01 107 / 0.05);
  overflow: hidden;
}

.row {
  align-items: center;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--color-rule);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font-size: 0.9375rem;
  gap: var(--space-related);
  min-height: 3.25rem;
  padding: var(--space-3) var(--space-4);
  text-align: start;
  transition: background-color var(--dur-base) var(--ease-out);
  width: 100%;
}

.row:last-child {
  border-bottom: 0;
}

.row:hover {
  background: var(--color-paper-2);
}

.row[aria-pressed='true'] {
  background: var(--color-accent-soft);
  color: var(--color-accent-strong);
  font-weight: 500;
}

.row__icon {
  flex: 0 0 auto;
  height: 1.125rem;
  width: 1.125rem;
}

.row__label {
  flex: 1;
  min-width: 0;
}

.row__chevron {
  color: var(--color-text-faint);
  flex: 0 0 auto;
  height: 1rem;
  width: 1rem;
}
</style>

