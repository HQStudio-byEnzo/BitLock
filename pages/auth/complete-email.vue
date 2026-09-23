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
        <h1 class="mt-6 min-w-0 text-3xl font-semibold tracking-tight text-foreground">{{ t('auth.completeEmail.title') }}</h1>
        <p class="text-sm text-surface-400 mt-3">{{ t('auth.completeEmail.subtitle') }}</p>
      </header>

      <div class="glass-panel auth-card">
        <!-- Étape 1 : saisie de l'adresse -->
        <div v-if="state === 'form'" class="space-y-4">
          <div class="rounded-xl border border-accent-500/20 bg-accent-500/10 p-4">
            <p class="text-sm font-medium text-accent-text">{{ t('auth.completeEmail.whyTitle') }}</p>
            <ul class="mt-2 space-y-1.5">
              <li class="flex items-start gap-2 text-sm text-surface-300 leading-relaxed">
                <Icon name="hugeicons:check" class="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
                <span>{{ t('auth.completeEmail.why1') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-surface-300 leading-relaxed">
                <Icon name="hugeicons:check" class="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
                <span>{{ t('auth.completeEmail.why2') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-surface-300 leading-relaxed">
                <Icon name="hugeicons:check" class="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
                <span>{{ t('auth.completeEmail.why3') }}</span>
              </li>
            </ul>
            <p class="mt-3 text-xs text-surface-400">{{ t('auth.completeEmail.noMarketing') }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-surface-300 mb-1">{{ t('auth.completeEmail.label') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                maxlength="254"
                class="input-field"
                autocomplete="email"
                autocapitalize="none"
                spellcheck="false"
                :aria-invalid="errorMsg ? 'true' : undefined"
                :placeholder="t('auth.completeEmail.placeholder')"
              />
            </div>

            <div v-if="errorMsg" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600" role="alert">
              {{ errorMsg }}
            </div>

            <button type="submit" :disabled="isLoading" class="btn-primary w-full py-2.5">
              <Icon v-if="isLoading" name="hugeicons:loader-circle" class="h-4 w-4 animate-spin" />
              {{ isLoading ? t('auth.completeEmail.submitting') : t('auth.completeEmail.submit') }}
            </button>
          </form>
        </div>

        <!-- Étape 2 : lien envoyé -->
        <div v-else class="flex flex-col items-center text-center gap-4 py-2" role="status" aria-live="polite">
          <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-text">
            <Icon name="hugeicons:mail-01" class="h-7 w-7" />
          </span>
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-foreground">{{ t('auth.completeEmail.doneTitle') }}</h2>
            <p class="text-sm text-surface-300 leading-relaxed">{{ doneDesc }}</p>
            <p class="text-xs text-surface-500 leading-relaxed">{{ t('auth.completeEmail.doneHint') }}</p>
          </div>

          <p v-if="infoMsg" class="w-full rounded-xl border border-accent-500/20 bg-accent-500/10 p-3 text-sm text-accent-text">
            {{ infoMsg }}
          </p>

          <div v-if="devVerificationUrl" class="w-full rounded-xl border border-surface-700 bg-surface-900/60 p-3 text-left">
            <p class="text-xs uppercase tracking-[0.14em] text-surface-500">{{ t('auth.completeEmail.devLink') }}</p>
            <a :href="devVerificationUrl" class="mt-1 block text-xs text-accent-text underline break-all">{{ devVerificationUrl }}</a>
          </div>

          <button type="button" class="btn-primary w-full py-2.5" :disabled="isChecking" @click="handleContinue">
            <Icon v-if="isChecking" name="hugeicons:loader-circle" class="h-4 w-4 animate-spin" />
            {{ isChecking ? t('auth.completeEmail.checking') : t('auth.completeEmail.confirmedCta') }}
          </button>

          <button type="button" class="btn-secondary w-full py-2.5" :disabled="isResending" @click="handleResend">
            <Icon :name="isResending ? 'hugeicons:loader-circle' : 'hugeicons:refresh'" class="h-4 w-4" :class="{ 'animate-spin': isResending }" />
            {{ isResending ? t('auth.completeEmail.resending') : t('auth.completeEmail.resend') }}
          </button>
        </div>

        <p class="mt-5 text-center">
          <button type="button" class="text-xs text-surface-500 underline hover:text-surface-300 transition-colors" @click="handleLogout">
            {{ t('auth.completeEmail.logout') }}
          </button>
        </p>
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

const { t, locale } = useLang()
const { signOut, fetchSession } = useAuthClient()

const state = ref<'form' | 'sent'>('form')
const form = reactive({ email: '' })
const isLoading = ref(false)
const isChecking = ref(false)
const isResending = ref(false)
const errorMsg = ref('')
const infoMsg = ref('')
const devVerificationUrl = ref('')

const doneDesc = computed(() => t('auth.completeEmail.doneDesc').replace('{email}', form.email))

onMounted(async () => {
  try {
    const status = await $fetch('/api/auth/refresh-email-state', { method: 'POST' })
    // The endpoint re-seals the cookie; the client state must pick it up before
    // the route middleware reads it again.
    await fetchSession()
    if (!status.needsEmail) {
      await navigateTo('/dashboard')
      return
    }
    // Already submitted, still unconfirmed: resume on the waiting screen.
    if (status.email) {
      form.email = status.email
      state.value = 'sent'
    }
  } catch {
    // Non blocking: the form below can still save an address.
  }
})

async function handleSubmit() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const response = await $fetch<{ ok: boolean; devVerificationUrl?: string }>('/api/auth/claim-email', {
      method: 'POST',
      body: { email: form.email, locale: locale.value },
    })
    devVerificationUrl.value = response?.devVerificationUrl || ''
    state.value = 'sent'
  } catch (err: any) {
    errorMsg.value = err.data?.message || t('auth.completeEmail.error')
  } finally {
    isLoading.value = false
  }
}

async function handleContinue() {
  isChecking.value = true
  infoMsg.value = ''
  try {
    const status = await $fetch('/api/auth/refresh-email-state', { method: 'POST' })
    await fetchSession()
    if (status.needsEmail) {
      infoMsg.value = t('auth.completeEmail.notYet')
      return
    }
    await navigateTo('/dashboard')
  } catch {
    infoMsg.value = t('auth.completeEmail.notYet')
  } finally {
    isChecking.value = false
  }
}

async function handleResend() {
  isResending.value = true
  infoMsg.value = ''
  try {
    await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { identifier: form.email, locale: locale.value },
    })
    infoMsg.value = t('auth.completeEmail.resent')
  } catch {
    infoMsg.value = t('auth.completeEmail.resendFailed')
  } finally {
    isResending.value = false
  }
}

async function handleLogout() {
  await signOut()
}
</script>
