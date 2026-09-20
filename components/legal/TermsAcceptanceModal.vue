<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div class="absolute inset-0 modal-backdrop"></div>
        <div ref="dialogEl" tabindex="-1" class="relative w-full max-w-2xl modal-shell p-5 md:p-6 max-h-[90vh] overflow-y-auto outline-none" role="dialog" aria-modal="true" :aria-label="t('legal.acceptTitle')">
          <div class="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 class="text-xl font-semibold text-foreground">{{ t('legal.acceptTitle') }}</h2>
              <p class="text-sm text-surface-400 mt-1">
                {{ t('legal.acceptDesc') }}
              </p>
            </div>
            <div class="feature-mark shrink-0">
              <Icon name="lucide:file-text" class="w-5 h-5" />
            </div>
          </div>

          <div class="modal-link-list mb-6">
            <NuxtLink to="/legal/cgu" class="modal-link-row">
              <span class="text-sm font-medium text-surface-200">{{ t('footer.terms') }}</span>
              <Icon name="lucide:arrow-up-right" class="w-4 h-4 text-surface-500" />
            </NuxtLink>
            <NuxtLink to="/legal/confidentialite" class="modal-link-row">
              <span class="text-sm font-medium text-surface-200">{{ t('footer.privacy') }}</span>
              <Icon name="lucide:arrow-up-right" class="w-4 h-4 text-surface-500" />
            </NuxtLink>
            <NuxtLink to="/legal/mentions-legales" class="modal-link-row">
              <span class="text-sm font-medium text-surface-200">{{ t('footer.legalNotice') }}</span>
              <Icon name="lucide:arrow-up-right" class="w-4 h-4 text-surface-500" />
            </NuxtLink>
          </div>

          <label class="flex items-start gap-3 text-sm text-surface-300 cursor-pointer mb-6">
            <input v-model="accepted" type="checkbox" class="mt-1" />
            <span class="leading-relaxed">
              {{ t('legal.acceptCheckbox') }}
            </span>
          </label>

          <div class="flex flex-col sm:flex-row gap-2">
            <button type="button" class="btn-primary" :disabled="!accepted || saving" @click="accept">
              <span v-if="saving">{{ t('legal.accepting') }}</span>
              <span v-else>{{ t('legal.acceptCta') }}</span>
            </button>
            <button type="button" class="btn-secondary" @click="logout">
              {{ t('settings.logout') }}
            </button>
          </div>

          <p v-if="error" class="mt-4 text-sm text-red-600" role="alert">
            {{ error }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

const visible = ref(false)
const accepted = ref(false)
const saving = ref(false)
const error = ref('')
const dialogEl = ref<HTMLElement | null>(null)

const { t } = useLang()
const { signOut } = useAuthClient()

useModalFocus(dialogEl, () => {}, { active: visible, closeOnEscape: false })

onMounted(async () => {
  try {
    const me: { termsAccepted: boolean } = await $fetch('/api/auth/me')
    visible.value = !me.termsAccepted
  } catch {
    visible.value = false
  }
})

async function accept() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/legal/accept', { method: 'POST' })
    visible.value = false
    window.location.reload()
  } catch (err: any) {
    error.value = err.data?.message || t('legal.acceptError')
  } finally {
    saving.value = false
  }
}

function logout() {
  signOut()
}
</script>
