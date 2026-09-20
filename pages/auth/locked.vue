<template>
  <main class="auth-shell">
    <div class="auth-frame animate-fade-in">
      <header class="auth-header">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-4 focus-visible:ring-offset-surface-950 active:opacity-70"
          aria-label="QVault — accueil"
        >
          <UiQVaultLogo :size="64" />
        </NuxtLink>
        <div class="mt-6 min-w-0 space-y-2">
          <h1 class="text-3xl font-semibold tracking-tight text-foreground">{{ t('locked.title') }}</h1>
          <p class="text-sm text-surface-400">{{ t('locked.subtitle') }}</p>
        </div>
      </header>

      <div class="glass-panel auth-card space-y-5">
        <div class="p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-sm text-accent-200">
          {{ reasonMessage }}
        </div>

        <form class="space-y-4" @submit.prevent="unlockVault">
          <div>
            <label for="masterPassword" class="block text-sm font-medium text-surface-300 mb-1">
              {{ t('locked.password') }}
            </label>
            <input
              id="masterPassword"
              v-model="masterPasswordInput"
              type="password"
              class="input-field"
              :placeholder="t('locked.passwordPlaceholder')"
              autocomplete="current-password"
              autofocus
            />
          </div>

          <div v-if="errorMsg" role="alert" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {{ errorMsg }}
          </div>

          <button type="submit" :disabled="isLoading" class="btn-primary w-full py-2.5">
            <span v-if="isLoading">{{ t('locked.loading') }}</span>
            <span v-else>{{ t('locked.cta') }}</span>
          </button>
          <button v-if="passkeyConfigured" type="button" :disabled="isLoading" class="btn-secondary w-full py-2.5" @click="unlockWithPasskey">
            <Icon name="lucide:fingerprint" class="w-4 h-4" /> {{ t('locked.passkey') }}
          </button>
        </form>

        <button type="button" class="mx-auto block min-h-11 text-center text-sm text-surface-400 hover:text-foreground transition-colors" @click="signOut">
          {{ t('locked.back') }}
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  hideFloatingBrand: true,
})

const route = useRoute()
const { t } = useLang()
const { signOut } = useAuthClient()
const { unlockMasterPassword } = useMasterPassword()
const { configured: passkeyConfigured, unlock: getPasskeyMaster } = usePasskeyUnlock()

const masterPasswordInput = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const reasonMessage = computed(() => {
  return route.query.reason === 'timeout'
    ? t('locked.reasonTimeout')
    : t('locked.reasonGeneral')
})

async function unlockVault() {
  errorMsg.value = ''
  const password = masterPasswordInput.value

  if (!password) {
    errorMsg.value = t('locked.errorRequired')
    return
  }

  isLoading.value = true
  try {
    await unlockMasterPassword(password)
    const requestedPath = typeof route.query.next === 'string' ? route.query.next : '/dashboard'
    const nextPath = requestedPath.startsWith('/') && !requestedPath.startsWith('//')
      ? requestedPath
      : '/dashboard'
    await navigateTo(nextPath)
  } catch {
    errorMsg.value = t('locked.errorGeneric')
  } finally {
    isLoading.value = false
  }
}

async function unlockWithPasskey() {
  errorMsg.value = ''
  isLoading.value = true
  try {
    await unlockMasterPassword(await getPasskeyMaster())
    const requestedPath = typeof route.query.next === 'string' ? route.query.next : '/dashboard'
    await navigateTo(requestedPath.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/dashboard')
  } catch { errorMsg.value = t('locked.passkeyError') }
  finally { isLoading.value = false }
}
</script>
