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
        <h1 class="mt-6 min-w-0 text-3xl font-semibold tracking-tight text-foreground">{{ t('auth.register.title') }}</h1>
        <p class="text-sm text-surface-400 mt-3">{{ t('auth.register.subtitle') }}</p>
      </header>

      <div class="glass-panel auth-card">
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-surface-300 mb-1">{{ t('auth.register.username') }}</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            minlength="3"
            maxlength="32"
            class="input-field"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"
            :placeholder="t('auth.register.usernamePlaceholder')"
          />
          <p class="mt-1 text-xs text-surface-500">{{ t('auth.register.usernameDesc') }}</p>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-surface-300 mb-1">{{ t('auth.register.password') }}</label>
          <input
            id="password"
            v-model="form.password"
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
          <label for="confirmPassword" class="block text-sm font-medium text-surface-300 mb-1">{{ t('auth.register.confirmPassword') }}</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            :minlength="MIN_ACCOUNT_PASSWORD_LENGTH"
            maxlength="72"
            autocomplete="new-password"
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <label class="flex items-start gap-3 text-sm text-surface-300 cursor-pointer">
          <input v-model="form.acceptedTerms" type="checkbox" class="mt-1" required />
          <span class="leading-relaxed">
            {{ t('auth.register.acceptPrefix') }}
          </span>
        </label>
        <p class="-mt-2 text-xs text-surface-400">
          <NuxtLink to="/legal/cgu" class="text-accent-text hover:text-accent-text-strong underline">{{ t('footer.terms') }}</NuxtLink>,
          <NuxtLink to="/legal/confidentialite" class="text-accent-text hover:text-accent-text-strong underline">{{ t('footer.privacy') }}</NuxtLink>,
          {{ t('auth.register.acceptAnd') }}
          <NuxtLink to="/legal/mentions-legales" class="text-accent-text hover:text-accent-text-strong underline">{{ t('footer.legalNotice') }}</NuxtLink>.
        </p>

        <!-- Error message -->
        <div v-if="errorMsg" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600" role="alert">
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary w-full py-2.5"
        >
          <span v-if="isLoading">{{ t('auth.register.loading') }}</span>
          <span v-else>{{ t('auth.register.btn') }}</span>
        </button>
      </form>
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        <p class="text-center text-sm text-surface-400">
          {{ t('auth.register.hasAccount') }}
          <NuxtLink to="/auth/login" class="text-accent-text hover:text-accent-text-strong font-medium underline">
            {{ t('auth.register.login') }}
          </NuxtLink>
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 text-xs text-surface-500">
          <NuxtLink to="/legal/cgu" class="inline-flex min-h-6 items-center hover:text-surface-300 transition-colors">{{ t('footer.terms') }}</NuxtLink>
          <NuxtLink to="/legal/confidentialite" class="inline-flex min-h-6 items-center hover:text-surface-300 transition-colors">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink to="/legal/mentions-legales" class="inline-flex min-h-6 items-center hover:text-surface-300 transition-colors">{{ t('footer.legalNotice') }}</NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { MIN_ACCOUNT_PASSWORD_LENGTH } from '~/utils/security-policy'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
  hideFloatingBrand: true,
})

const { t } = useLang()
const { signUp } = useAuthClient()

 const form = reactive({
   username: '',
   password: '',
   confirmPassword: '',
   acceptedTerms: false,
 })

const isLoading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  isLoading.value = true
  errorMsg.value = ''

  if (form.password !== form.confirmPassword) {
    errorMsg.value = t('auth.register.pwdMismatch')
    isLoading.value = false
    return
  }

  if (form.password.length < MIN_ACCOUNT_PASSWORD_LENGTH) {
    errorMsg.value = t('auth.register.pwdTooShort')
    isLoading.value = false
    return
  }

  try {
    await signUp({
      username: form.username,
      password: form.password,
      acceptedTerms: form.acceptedTerms,
    })
    navigateTo('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.data?.message || t('auth.register.error')
  } finally {
    isLoading.value = false
  }
}
</script>
