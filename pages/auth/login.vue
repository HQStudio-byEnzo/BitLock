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
        <h1 class="mt-6 min-w-0 text-3xl font-semibold tracking-tight text-foreground">{{ t('auth.login.title') }}</h1>
        <p class="text-sm text-surface-400 mt-3">{{ t('auth.login.subtitle') }}</p>
      </header>

      <div class="glass-panel auth-card">
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-surface-300 mb-1">{{ t('auth.login.username') }}</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="input-field"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            :aria-invalid="errorMsg ? 'true' : undefined"
            aria-describedby="loginError"
            :placeholder="t('auth.login.usernamePlaceholder')"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-surface-300 mb-1">{{ t('auth.login.password') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="input-field"
            autocomplete="current-password"
            :aria-invalid="errorMsg ? 'true' : undefined"
            aria-describedby="loginError"
            placeholder="••••••••"
          />
        </div>

        <!-- Error message -->
        <div v-if="errorMsg" id="loginError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600" role="alert">
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary w-full py-2.5"
        >
          <span v-if="isLoading">{{ t('auth.login.loading') }}</span>
          <span v-else>{{ t('auth.login.btn') }}</span>
        </button>
      </form>
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        <p class="text-center text-sm text-surface-400">
          {{ t('auth.login.noAccount') }}
          <NuxtLink to="/auth/register" class="text-accent-600 hover:text-accent-700 font-medium">
            {{ t('auth.login.createAccount') }}
          </NuxtLink>
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 text-xs text-surface-500">
          <NuxtLink to="/legal/cgu" class="hover:text-surface-300 transition-colors">{{ t('footer.terms') }}</NuxtLink>
          <NuxtLink to="/legal/confidentialite" class="hover:text-surface-300 transition-colors">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink to="/legal/mentions-legales" class="hover:text-surface-300 transition-colors">{{ t('footer.legalNotice') }}</NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
  hideFloatingBrand: true,
})

const { t } = useLang()
const { signIn } = useAuthClient()

const form = reactive({
  username: '',
  password: '',
})

const isLoading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMsg.value = ''

  try {
    await signIn({ username: form.username, password: form.password })
    navigateTo('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.data?.message || t('auth.login.error')
  } finally {
    isLoading.value = false
  }
}
</script>
