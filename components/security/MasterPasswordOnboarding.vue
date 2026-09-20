<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div class="absolute inset-0 modal-backdrop"></div>
        <div ref="dialogEl" tabindex="-1" class="relative w-full max-w-lg modal-shell p-5 md:p-6 outline-none" role="dialog" aria-modal="true" :aria-label="t('masterSetup.title')">
          <div class="flex items-start gap-4">
            <div class="feature-mark shrink-0">
              <Icon name="hugeicons:key-round" class="w-5 h-5" />
            </div>
            <div class="space-y-3">
              <div>
                <h2 class="text-lg font-semibold text-foreground">{{ t('masterSetup.title') }}</h2>
                <p class="text-sm text-surface-400 mt-1">{{ t('masterSetup.desc') }}</p>
              </div>

              <div class="grid gap-2 text-sm text-surface-300">
                <div class="flex items-start gap-2">
                  <Icon name="hugeicons:check" class="w-4 h-4 text-green-700 mt-0.5" />
                  <span>{{ t('masterSetup.ruleUnique') }}</span>
                </div>
                <div class="flex items-start gap-2">
                  <Icon name="hugeicons:check" class="w-4 h-4 text-green-700 mt-0.5" />
                  <span>{{ t('masterSetup.ruleRecovery') }}</span>
                </div>
                <div class="flex items-start gap-2">
                  <Icon name="hugeicons:check" class="w-4 h-4 text-green-700 mt-0.5" />
                  <span>{{ t('masterSetup.ruleRotation') }}</span>
                </div>
              </div>

              <form class="space-y-3" @submit.prevent="complete">
                <div>
                  <label for="master-setup-password" class="block text-sm text-surface-300 mb-1">{{ t('masterSetup.password') }}</label>
                  <input id="master-setup-password" v-model="password" type="password" :minlength="MIN_MASTER_PASSWORD_LENGTH" maxlength="128" required autocomplete="new-password" class="input-field" />
                </div>
                <div>
                  <label for="master-setup-confirm" class="block text-sm text-surface-300 mb-1">{{ t('masterSetup.confirm') }}</label>
                  <input id="master-setup-confirm" v-model="confirmation" type="password" :minlength="MIN_MASTER_PASSWORD_LENGTH" maxlength="128" required autocomplete="new-password" class="input-field" />
                </div>

                <label class="flex items-start gap-2 text-sm text-surface-300 cursor-pointer">
                  <input v-model="understood" type="checkbox" class="mt-1" />
                  <span>{{ t('masterSetup.understood') }}</span>
                </label>

                <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

                <div class="flex flex-col sm:flex-row gap-2 pt-2">
                  <button type="submit" :disabled="!understood || saving" class="btn-primary">
                    {{ saving ? t('masterSetup.saving') : t('masterSetup.continue') }}
                  </button>
                  <button type="button" class="btn-secondary" @click="remindLater">{{ t('masterSetup.later') }}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { MIN_MASTER_PASSWORD_LENGTH } from '~/utils/security-policy'

const visible = ref(false)
const understood = ref(false)
const password = ref('')
const confirmation = ref('')
const error = ref('')
const saving = ref(false)
const dialogEl = ref<HTMLElement | null>(null)
const { t } = useLang()
const { unlockMasterPassword } = useMasterPassword()
const { user } = useUserSession()

useModalFocus(dialogEl, () => {}, { active: visible, closeOnEscape: false })

function onboardingKey(name: 'done' | 'snoozed') {
  const owner = user.value?.id || user.value?.username || 'anonymous'
  return `bitlock.masterPasswordOnboarding:${encodeURIComponent(String(owner))}:${name}`
}

onMounted(() => {
  const done = localStorage.getItem(onboardingKey('done')) === 'true'
  const snoozedUntil = Number(localStorage.getItem(onboardingKey('snoozed')) || 0)
  visible.value = !done && Date.now() > snoozedUntil
})

async function complete() {
  error.value = ''
  if (password.value.length < MIN_MASTER_PASSWORD_LENGTH) {
    error.value = t('masterSetup.tooShort')
    return
  }
  if (password.value !== confirmation.value) {
    error.value = t('masterSetup.mismatch')
    return
  }

  saving.value = true
  try {
    await unlockMasterPassword(password.value)
    localStorage.setItem(onboardingKey('done'), 'true')
    localStorage.removeItem(onboardingKey('snoozed'))
    password.value = ''
    confirmation.value = ''
    visible.value = false
  } catch {
    error.value = t('masterSetup.error')
  } finally {
    saving.value = false
  }
}

function remindLater() {
  localStorage.setItem(onboardingKey('snoozed'), String(Date.now() + 24 * 60 * 60 * 1000))
  visible.value = false
}
</script>
