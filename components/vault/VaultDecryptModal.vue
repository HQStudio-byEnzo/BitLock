<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 modal-backdrop" @click="$emit('close')"></div>

      <!-- Modal -->
      <div ref="dialogEl" tabindex="-1" class="relative w-full max-w-md modal-shell p-5 md:p-6 animate-scale-in max-h-[90vh] overflow-y-auto outline-none" role="dialog" aria-modal="true" :aria-label="t('vault.decrypt')">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="hugeicons:lock-open" class="w-5 h-5 text-accent-text" />
            {{ t('vault.decrypt') }}
          </h2>
          <button type="button" @click="$emit('close')" class="icon-button" :aria-label="t('vault.close')">
            <Icon name="hugeicons:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Not yet decrypted -->
        <div v-if="!decryptedValue" class="space-y-4">
          <p class="text-sm text-surface-400">
            {{ t('vault.decryptPrompt') }} "<strong class="text-surface-200">{{ item.label || t('vault.untitled') }}</strong>".
          </p>

          <form @submit.prevent="handleDecrypt" class="space-y-4">
            <div>
              <label for="masterPwd" class="block text-sm font-medium text-surface-300 mb-1">
                {{ t('vault.masterPwd') }}
              </label>
              <input
                id="masterPwd"
                v-model="masterPassword"
                type="password"
                required
                autofocus
                class="input-field"
                :placeholder="t('vault.masterPwdPlaceholder')"
              />
            </div>

            <div v-if="errorMsg" role="alert" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
              {{ errorMsg }}
            </div>

            <button type="submit" :disabled="isDecrypting" class="btn-primary w-full">
              <span v-if="isDecrypting">{{ t('vault.decrypting') }}</span>
              <span v-else>{{ t('vault.decryptBtn') }}</span>
            </button>
          </form>
        </div>

        <!-- Decrypted result -->
        <div v-else class="space-y-4">
          <div class="modal-section">
            <p class="text-xs text-surface-500 mb-3">{{ t('vault.decryptedContent') }}</p>

            <div v-if="passwordEntry && !editing" class="space-y-3">
              <div>
                <p class="text-[11px] uppercase tracking-[0.14em] text-surface-500">{{ t('vault.passwordValue') }}</p>
                <p class="mt-1 text-sm text-surface-100 font-mono break-all whitespace-pre-wrap">{{ passwordEntry.password }}</p>
              </div>
              <div v-if="passwordEntry.username">
                <p class="text-[11px] uppercase tracking-[0.14em] text-surface-500">{{ t('vault.username') }}</p>
                <p class="mt-1 text-sm text-surface-100 break-all">{{ passwordEntry.username }}</p>
              </div>
              <div v-if="passwordEntry.email">
                <p class="text-[11px] uppercase tracking-[0.14em] text-surface-500">{{ t('vault.loginEmail') }}</p>
                <p class="mt-1 text-sm text-surface-100 break-all">{{ passwordEntry.email }}</p>
              </div>
              <div v-if="passwordEntry.phone">
                <p class="text-[11px] uppercase tracking-[0.14em] text-surface-500">{{ t('vault.phone') }}</p>
                <p class="mt-1 text-sm text-surface-100 break-all">{{ passwordEntry.phone }}</p>
              </div>
              <div v-if="item.url">
                <p class="text-[11px] uppercase tracking-[0.14em] text-surface-500">{{ t('vault.websiteUrl') }}</p>
                <p class="mt-1 text-sm text-surface-100 break-all">{{ item.url }}</p>
              </div>
            </div>

            <div v-else-if="editing" class="space-y-3">
              <input v-model="editLabel" class="input-field" :placeholder="t('vault.labelField')" :aria-label="t('vault.labelField')" />
              <textarea v-model="editValue" rows="8" class="input-field resize-y font-mono text-sm" :aria-label="t('vault.decryptedContent')" />
            </div>
            <p v-else class="text-sm text-surface-100 font-mono break-all whitespace-pre-wrap">{{ decryptedValue }}</p>
          </div>

          <div class="flex gap-2">
            <button v-if="!editing" type="button" @click="copyDecrypted" class="btn-primary flex-1 flex items-center justify-center gap-2">
              <Icon :name="copied ? 'hugeicons:check' : 'hugeicons:copy'" class="w-4 h-4" />
              {{ copied ? t('vault.copied') : passwordEntry ? t('vault.copyPassword') : t('vault.copy') }}
            </button>
            <button v-if="!editing" type="button" @click="startEditing" class="btn-secondary flex-1"><Icon name="hugeicons:pencil" class="w-4 h-4" />{{ t('vault.edit') }}</button>
            <button v-if="editing" type="button" @click="saveEdit" :disabled="saving" class="btn-primary flex-1"><Icon name="hugeicons:save" class="w-4 h-4" />{{ saving ? t('vault.saving') : t('vault.save') }}</button>
            <button type="button" @click="editing ? cancelEdit() : $emit('close')" class="btn-secondary flex-1">
              {{ editing ? t('settings.cancel') : t('vault.close') }}
            </button>
          </div>
          <p v-if="editMessage" class="text-sm" :class="editFailed ? 'text-red-600' : 'text-accent-text'" role="status">{{ editMessage }}</p>

          <p class="text-xs text-surface-500 text-center">
            {{ t('vault.decryptNotice') }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import type { VaultItem } from '~/composables/useVault'
import { parsePasswordEntry } from '~/utils/password-entry'

const props = defineProps<{
  item: VaultItem
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useLang()
const dialogEl = ref<HTMLElement | null>(null)
const { decryptItem, updateItem } = useVault()
const { unlockMasterPassword, masterPassword: sessionMaster } = useMasterPassword()
const { encrypt, serializeEncryptedPayload } = useCrypto()
const { copySecurely } = useSecureClipboard()

useModalFocus(dialogEl, () => emit('close'))

const masterPassword = ref('')
const decryptedValue = ref('')
const errorMsg = ref('')
const isDecrypting = ref(false)
const copied = ref(false)
const editing = ref(false)
const editLabel = ref('')
const editValue = ref('')
const saving = ref(false)
const editMessage = ref('')
const editFailed = ref(false)

const passwordEntry = computed(() => {
  if (!decryptedValue.value || props.item.type !== 'password') return null
  return parsePasswordEntry(decryptedValue.value)
})

const copyValue = computed(() => passwordEntry.value?.password || decryptedValue.value)

async function handleDecrypt() {
  isDecrypting.value = true
  errorMsg.value = ''

  try {
    await unlockMasterPassword(masterPassword.value)
    decryptedValue.value = await decryptItem(props.item, masterPassword.value)
  } catch (err: any) {
    errorMsg.value = t('vault.decryptError')
  } finally {
    isDecrypting.value = false
  }
}

async function copyDecrypted() {
  try {
    await copySecurely(copyValue.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
  }
}

function startEditing() { editing.value = true; editLabel.value = props.item.label; editValue.value = decryptedValue.value; editMessage.value = '' }
function cancelEdit() { editing.value = false; editValue.value = decryptedValue.value; editLabel.value = props.item.label }
async function saveEdit() {
  if (!sessionMaster.value) return
  saving.value = true; editMessage.value = ''; editFailed.value = false
  try {
    const encrypted = await encrypt(editValue.value, sessionMaster.value)
    await updateItem(props.item.id, { label: editLabel.value, payload: serializeEncryptedPayload(encrypted), iv: encrypted.iv, is_encrypted: true })
    decryptedValue.value = editValue.value; editing.value = false; editMessage.value = t('vault.saved')
  } catch { editFailed.value = true; editMessage.value = t('vault.saveFailed') }
  finally { saving.value = false }
}

onMounted(async () => {
  if (!sessionMaster.value) return
  try { decryptedValue.value = await decryptItem(props.item, sessionMaster.value) } catch {}
})
</script>
