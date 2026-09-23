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
        <h1 class="mt-6 min-w-0 text-3xl font-semibold tracking-tight text-foreground">{{ t('auth.verify.title') }}</h1>
        <p class="text-sm text-surface-400 mt-3">{{ t('auth.verify.subtitle') }}</p>
      </header>

      <div class="glass-panel auth-card" role="status" aria-live="polite">
        <!-- Chargement -->
        <div v-if="state === 'loading'" class="flex flex-col items-center gap-4 py-6 text-center">
          <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-text">
            <Icon name="hugeicons:loader-circle" class="h-7 w-7 animate-spin" />
          </span>
          <p class="text-sm text-surface-300">{{ t('auth.verify.loading') }}</p>
        </div>

        <!-- Succès -->
        <div v-else-if="state === 'success'" class="flex flex-col items-center gap-4 py-2 text-center">
          <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15 text-green-700">
            <Icon name="hugeicons:checkmark-circle-02" class="h-7 w-7" />
          </span>
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-foreground">{{ t('auth.verify.successTitle') }}</h2>
            <p class="text-sm text-surface-300 leading-relaxed">{{ t('auth.verify.successDesc') }}</p>
          </div>
          <NuxtLink v-if="canEnterVault" to="/dashboard" class="btn-primary w-full py-2.5 justify-center">
            {{ t('auth.verify.toVault') }}
          </NuxtLink>
          <NuxtLink v-else to="/auth/login" class="btn-primary w-full py-2.5 justify-center">
            {{ t('auth.verify.cta') }}
          </NuxtLink>
        </div>

        <!-- Erreur -->
        <div v-else class="flex flex-col items-center gap-4 py-2 text-center">
          <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-600">
            <Icon name="hugeicons:alert-02" class="h-7 w-7" />
          </span>
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-foreground">{{ t('auth.verify.errorTitle') }}</h2>
            <p class="text-sm text-surface-300 leading-relaxed">{{ errorMsg }}</p>
          </div>
          <NuxtLink to="/auth/login" class="btn-secondary w-full py-2.5 justify-center">
            {{ t('auth.verify.cta') }}
          </NuxtLink>
          <NuxtLink to="/auth/register" class="text-sm font-medium text-accent-text hover:text-accent-text-strong underline">
            {{ t('auth.verify.toRegister') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

definePageMeta({
  layout: 'default',
  hideFloatingBrand: true,
})

const { t } = useLang()
const route = useRoute()
const { loggedIn } = useUserSession()
const { fetchSession } = useAuthClient()

const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMsg = ref('')
const canEnterVault = ref(false)

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!token) {
    state.value = 'error'
    errorMsg.value = t('auth.verify.missingToken')
    return
  }

  try {
    await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
    state.value = 'success'

    // A signed-in account that was waiting on this address is let in directly.
    if (loggedIn.value) {
      await $fetch('/api/auth/refresh-email-state', { method: 'POST' }).catch(() => null)
      // Refresh the client session so the route middleware sees the new state.
      await fetchSession()
      canEnterVault.value = true
    }
  } catch (err: any) {
    state.value = 'error'
    errorMsg.value = err.data?.message || t('auth.verify.errorTitle')
  }
})
</script>
