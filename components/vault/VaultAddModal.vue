<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 modal-backdrop" @click="$emit('close')"></div>

      <div
        ref="dialogEl"
        tabindex="-1"
        class="relative w-full modal-shell animate-scale-in outline-none"
        :class="isNote ? 'note-composer' : 'max-w-md p-5 md:p-6 max-h-[90vh] overflow-y-auto'"
        role="dialog"
        aria-modal="true"
        :aria-label="isNote ? t('notes.editorTitle') : t('vault.addTitle')"
      >
        <div class="flex items-center justify-between" :class="isNote ? 'note-composer__header' : 'mb-6'">
          <div class="min-w-0">
            <p v-if="isNote" class="note-composer__eyebrow">{{ t('notes.editorEyebrow') }}</p>
            <h2 class="text-lg font-semibold text-foreground">{{ isNote ? t('notes.editorTitle') : t('vault.addTitle') }}</h2>
          </div>
          <button type="button" @click="$emit('close')" class="icon-button" :aria-label="t('vault.close')">
            <Icon name="hugeicons:x" class="w-5 h-5" />
          </button>
        </div>

        <form v-if="isNote && step === 'form'" class="note-composer__form" @submit.prevent="handleSubmit">
          <aside class="note-composer__rail">
            <div>
              <label for="noteType" class="note-composer__label">{{ t('vault.typeLabel') }}</label>
              <UiSelectMenu :model-value="form.type" :options="typeOptions" @update:model-value="(value) => form.type = value as typeof form.type" />
            </div>

            <div>
              <label for="noteLabel" class="note-composer__label">{{ t('notes.titleLabel') }}</label>
              <input
                id="noteLabel"
                v-model="form.label"
                type="text"
                class="input-field"
                :placeholder="t('notes.titlePlaceholder')"
              />
            </div>

            <div v-if="vaultOptions.length > 1 || folderOptions.length > 1" class="space-y-2">
              <UiSelectMenu v-model="vaultId" :options="vaultOptions" :placeholder="t('vault.pickVault')" />
              <UiSelectMenu v-model="folderId" :options="folderOptions" :placeholder="t('vault.pickFolder')" />
            </div>

            <div class="note-composer__security">
              <span class="note-composer__security-icon"><Icon name="hugeicons:lock-keyhole" class="h-4 w-4" /></span>
              <div>
                <strong>{{ t('notes.encryptedTitle') }}</strong>
                <p>{{ t('notes.encryptedDesc') }}</p>
              </div>
            </div>
          </aside>

          <section class="note-composer__editor">
            <div class="note-composer__editor-bar">
              <span>{{ t('notes.contentLabel') }}</span>
              <span>{{ t('notes.characters').replace('{count}', String(form.payload.length)) }}</span>
            </div>
            <textarea
              id="payload"
              v-model="form.payload"
              required
              autofocus
              maxlength="100000"
              class="note-composer__textarea"
              :aria-invalid="error ? 'true' : undefined"
              :data-state="isSubmitting ? 'loading' : error ? 'error' : undefined"
              :placeholder="t('notes.editorPlaceholder')"
            />
            <footer class="note-composer__footer">
              <p v-if="error" class="note-composer__error" role="alert">{{ error }}</p>
              <p v-else class="note-composer__autosave">{{ t('notes.localDraft') }}</p>
              <button type="submit" :disabled="isSubmitting" class="btn-primary note-composer__submit">
                <Icon :name="isSubmitting ? 'hugeicons:loader-circle' : 'hugeicons:lock-keyhole'" class="h-4 w-4" :class="{ 'animate-spin': isSubmitting }" />
                <span>{{ isSubmitting ? t('vault.adding') : t('notes.saveEncrypted') }}</span>
              </button>
            </footer>
          </section>
        </form>

        <template v-else-if="step === 'form'">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-300 mb-2">{{ t('vault.typeLabel') }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="tp in types"
                :key="tp.value"
                type="button"
                @click="form.type = tp.value"
                :aria-pressed="form.type === tp.value"
                class="p-3 rounded-2xl border text-center transition-colors text-sm"
                :class="[
                  form.type === tp.value
                    ? 'border-accent-500 bg-accent-500/10 text-accent-600'
                    : 'border-surface-700 bg-surface-800 text-surface-400 hover:border-surface-600'
                ]"
              >
                <Icon :name="tp.icon" class="w-5 h-5 mx-auto mb-1" />
                {{ tp.label }}
              </button>
            </div>
          </div>

          <div>
            <label for="label" class="block text-sm font-medium text-surface-300 mb-1">{{ t('vault.labelField') }}</label>
            <input
              id="label"
              v-model="form.label"
              type="text"
              class="input-field"
              :placeholder="t('vault.labelPlaceholder')"
            />
          </div>

          <div v-if="vaultOptions.length > 1 || folderOptions.length > 1" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UiSelectMenu v-model="vaultId" :options="vaultOptions" :placeholder="t('vault.pickVault')" />
            <UiSelectMenu v-model="folderId" :options="folderOptions" :placeholder="t('vault.pickFolder')" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="payload" class="block text-sm font-medium text-surface-300">
                {{ payloadLabel }}
              </label>
              <button
                v-if="form.type === 'password'"
                type="button"
                @click="generatePasswordValue"
                class="text-xs px-2 py-1 rounded bg-accent-600/20 text-accent-600 hover:bg-accent-600/30 transition-colors"
              >
                {{ t('vault.generatePassword') }}
              </button>
              <button
                v-if="form.type === 'crypto'"
                type="button"
                @click="generateSeed"
                class="text-xs px-2 py-1 rounded bg-accent-600/20 text-accent-600 hover:bg-accent-600/30 transition-colors"
              >
                {{ t('vault.generateSeed') }}
              </button>
              <button
                v-if="form.type === 'recovery'"
                type="button"
                class="text-xs px-2 py-1 rounded bg-surface-800 text-surface-300 hover:bg-surface-700 transition-colors"
                @click="recoveryFileInput?.click()"
              >
                {{ t('vault.importTxt') }}
              </button>
              <input ref="recoveryFileInput" type="file" accept=".txt,text/plain" class="hidden" @change="importTxt" />
            </div>
            <textarea
              id="payload"
              v-model="form.payload"
              rows="3"
              required
              class="input-field resize-none font-mono text-sm"
              :placeholder="payloadPlaceholder"
            ></textarea>
          </div>

          <div v-if="form.type === 'password'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="username" class="block text-sm font-medium text-surface-300 mb-1">{{ t('vault.username') }}</label>
              <input id="username" v-model="form.username" type="text" class="input-field" :placeholder="t('vault.usernamePlaceholder')" />
            </div>
            <div>
              <label for="loginEmail" class="block text-sm font-medium text-surface-300 mb-1">{{ t('vault.loginEmail') }}</label>
              <input id="loginEmail" v-model="form.loginEmail" type="email" class="input-field" :placeholder="t('vault.loginEmailPlaceholder')" />
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-surface-300 mb-1">{{ t('vault.phone') }}</label>
              <input id="phone" v-model="form.phone" type="tel" class="input-field" :placeholder="t('vault.phonePlaceholder')" />
            </div>
            <div>
              <label for="url" class="block text-sm font-medium text-surface-300 mb-1">{{ t('vault.websiteUrl') }}</label>
              <input id="url" v-model="form.url" type="url" class="input-field" placeholder="https://gmail.com" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-3 text-sm text-surface-300 cursor-pointer">
              <input
                v-model="form.encrypt"
                type="checkbox"
                disabled
                class="rounded border-surface-600 text-accent-500 focus:ring-accent-500"
              />
              <span>{{ t('vault.encryptionRequired') }}</span>
            </label>
          </div>

          <div v-if="error" role="alert" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary w-full py-2.5"
          >
            <span v-if="isSubmitting">{{ t('vault.adding') }}</span>
            <span v-else>{{ t('vault.addBtn') }}</span>
          </button>
        </form>
        </template>

        <div v-else class="unlock-step">
          <span class="unlock-step__icon"><Icon name="hugeicons:lock-keyhole" class="h-6 w-6" /></span>
          <h2 class="unlock-step__title">{{ t('vault.unlockTitle') }}</h2>
          <p class="unlock-step__desc">{{ t('vault.unlockDesc') }}</p>
          <form class="unlock-step__form" @submit.prevent="commitUnlock">
            <label for="addMasterPassword" class="block text-sm font-medium text-surface-300 mb-1">
              {{ t('vault.masterPwdLabel') }}
            </label>
            <input
              id="addMasterPassword"
              v-model="masterPasswordInput"
              type="password"
              required
              autofocus
              class="input-field"
              autocomplete="current-password"
              placeholder="••••••••••••"
            />
            <div v-if="error" role="alert" class="unlock-step__error">{{ error }}</div>
            <div class="unlock-step__actions">
              <button type="button" class="btn-secondary flex-1" :disabled="isSubmitting" @click="step = 'form'">
                {{ t('settings.cancel') }}
              </button>
              <button type="submit" class="btn-primary flex-1" :disabled="isSubmitting">
                <Icon :name="isSubmitting ? 'hugeicons:loader-circle' : 'hugeicons:lock-open'" class="h-4 w-4" :class="{ 'animate-spin': isSubmitting }" />
                {{ isSubmitting ? t('vault.adding') : t('vault.unlockAndSave') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { serializePasswordEntry } from '~/utils/password-entry'

const props = defineProps<{
  defaultType?: 'link' | 'password' | 'crypto' | 'recovery' | 'note' | 'totp'
  initialPayload?: string
  initialLabel?: string
}>()

const emit = defineEmits<{
  close: []
  added: []
}>()

const { addItem, error } = useVault()
const { masterPassword, isUnlocked, unlockMasterPassword } = useMasterPassword()
const { generateSeedPhrase } = useSeedGenerator()
const { generatePassword } = usePasswordGenerator()
const { t } = useLang()
const isSubmitting = ref(false)
const masterPasswordInput = ref('')
const dialogEl = ref<HTMLElement | null>(null)
const recoveryFileInput = ref<HTMLInputElement | null>(null)

const orgData = ref<{ vaults: { id: string; name: string }[]; folders: { id: string; name: string; vault_id: string }[] } | null>(null)
const vaultId = ref('')
const folderId = ref('')
const vaultOptions = computed(() => [
  { value: '', label: t('vault.pickVault') },
  ...(orgData.value?.vaults || []).map(vault => ({ value: vault.id, label: vault.name })),
])
const folderOptions = computed(() => {
  const folders = (orgData.value?.folders || []).filter(folder => !vaultId.value || folder.vault_id === vaultId.value)
  return [
    { value: '', label: t('vault.pickFolder') },
    ...folders.map(folder => ({ value: folder.id, label: folder.name })),
  ]
})
watch(vaultId, () => { folderId.value = '' })
onMounted(async () => {
  try { orgData.value = await $fetch('/api/organization') } catch { /* ignore */ }
})

useModalFocus(dialogEl, () => emit('close'))

const form = reactive({
  type: props.defaultType || 'link' as 'link' | 'password' | 'crypto' | 'recovery' | 'note' | 'totp',
  label: props.initialLabel || '',
  payload: props.initialPayload || '',
  username: '',
  loginEmail: '',
  phone: '',
  url: '',
  encrypt: true,
})

const types = computed(() => [
  { value: 'link' as const, label: t('vault.typeLink'), icon: 'hugeicons:link' },
  { value: 'password' as const, label: t('vault.typePassword'), icon: 'hugeicons:key-round' },
  { value: 'crypto' as const, label: t('vault.typeCrypto'), icon: 'hugeicons:bitcoin' },
  { value: 'recovery' as const, label: t('vault.typeRecovery'), icon: 'hugeicons:ticket-check' },
  { value: 'note' as const, label: t('vault.typeNote'), icon: 'hugeicons:notebook-tabs' },
  { value: 'totp' as const, label: t('vault.typeTotp'), icon: 'hugeicons:timer-reset' },
])

const typeOptions = computed(() => types.value.map(tp => ({ value: tp.value, label: tp.label })))

const payloadLabel = computed(() => {  switch (form.type) {
    case 'link': return t('vault.payloadLink')
    case 'password': return t('vault.payloadPassword')
    case 'crypto': return t('vault.payloadCrypto')
    case 'recovery': return t('vault.payloadRecovery')
    case 'note': return t('vault.payloadNote')
    case 'totp': return t('vault.payloadTotp')
  }
})

const payloadPlaceholder = computed(() => {
  switch (form.type) {
    case 'link': return t('vault.payloadPlaceholderLink')
    case 'password': return t('vault.payloadPlaceholderPassword')
    case 'crypto': return t('vault.payloadPlaceholderCrypto')
    case 'recovery': return t('vault.payloadPlaceholderRecovery')
    case 'note': return t('vault.payloadPlaceholderNote')
    case 'totp': return t('vault.payloadPlaceholderTotp')
  }
})

const needsEncryption = computed(() => true)
const isNote = computed(() => form.type === 'note')

watch(
  () => form.type,
  () => {
    form.encrypt = true
  },
  { immediate: true }
)

const step = ref<'form' | 'unlock'>('form')

function buildPayload() {
  return form.type === 'password'
    ? serializePasswordEntry({
        password: form.payload,
        username: form.username,
        email: form.loginEmail,
        phone: form.phone,
      })
    : form.payload
}

async function saveWithPassword(password: string) {
  isSubmitting.value = true
  error.value = ''

  try {
    if (password && !isUnlocked.value) await unlockMasterPassword(password)

    await addItem({
      type: form.type,
      label: form.label,
      payload: buildPayload(),
      shouldEncrypt: true,
      url: form.type === 'password' ? form.url : form.type === 'link' ? form.payload : undefined,
      vaultId: vaultId.value || undefined,
      folderId: folderId.value || null,
    })
    masterPasswordInput.value = ''
    emit('added')
  } catch (err: any) {
    error.value = err?.message || t('vault.needMasterPasswordToAdd')
  } finally {
    isSubmitting.value = false
  }
}

function handleSubmit() {
  // Ask for the master password only after the item form is filled.
  if (needsEncryption && !isUnlocked.value) {
    error.value = ''
    step.value = 'unlock'
    return
  }
  saveWithPassword('')
}

async function commitUnlock() {
  const password = masterPasswordInput.value.trim()
  if (!password) {
    error.value = t('vault.needMasterPasswordToAdd')
    return
  }
  await saveWithPassword(password)
}

function generateSeed() {
  form.payload = generateSeedPhrase()
}

function generatePasswordValue() {
  form.payload = generatePassword({
    length: 24,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    avoidAmbiguous: true,
  })
}

async function importTxt(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 100_000) {
    error.value = t('vault.importTooLarge')
    input.value = ''
    return
  }
  form.payload = (await file.text()).trim()
  if (!form.label) form.label = file.name.replace(/\.txt$/i, '')
  input.value = ''
}
</script>

<style scoped>
/* Hallmark · component: modal · genre: modern-minimal · theme: Workbench
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 * pre-emit critique: P5 H5 E5 S5 R5 V4
 */
.note-composer {
  width: min(70rem, calc(100% - var(--space-8)));
  height: min(48rem, calc(100dvh - var(--space-12)));
  max-width: none;
  min-height: 36rem;
  padding: 0;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.note-composer__header {
  min-height: 4.75rem;
  padding: var(--space-4) var(--space-5);
  border-bottom: var(--rule);
  background: var(--color-paper-2);
}

.note-composer__eyebrow,
.note-composer__label,
.note-composer__editor-bar {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.note-composer__eyebrow {
  margin-bottom: var(--space-1);
  color: var(--color-accent);
  font-size: 0.625rem;
}

.note-composer__form {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
}

.note-composer__rail {
  min-width: 0;
  overflow-y: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  border-right: var(--rule);
  background: var(--color-paper-2);
}

.note-composer__label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-muted);
  font-size: 0.625rem;
}

.note-composer__security {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-accent-rule);
  background: var(--color-accent-soft);
}

.note-composer__security-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  color: var(--color-accent);
  border: 1px solid var(--color-accent-rule);
}

.note-composer__security strong {
  display: block;
  color: var(--color-text);
  font-size: 0.8125rem;
}

.note-composer__security p,
.note-composer__unlock p {
  margin-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  line-height: 1.55;
}

.note-composer__unlock {
  padding-top: var(--space-4);
  border-top: var(--rule);
}

.note-composer__unlock p {
  margin: 0 0 var(--space-3);
  color: var(--color-warning);
}

.note-composer__editor {
  min-width: 0;
  min-height: 0;
  padding: var(--space-5);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  background: var(--color-paper);
}

.note-composer__editor-bar {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--color-text-faint);
  font-size: 0.625rem;
}

.note-composer__textarea {
  width: 100%;
  min-width: 0;
  min-height: 0;
  max-height: 100%;
  resize: vertical;
  padding: var(--space-5);
  border: 1px solid var(--color-rule-strong);
  border-radius: var(--radius-sm);
  outline: 2px solid transparent;
  outline-offset: 1px;
  background: var(--color-paper-deep);
  color: var(--color-text);
  caret-color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.75;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);
}

.note-composer__textarea::placeholder {
  color: var(--color-text-faint);
}

.note-composer__textarea:hover:not(:disabled) {
  border-color: var(--color-rule-strong);
  background: var(--color-paper-2);
}

.note-composer__textarea:focus-visible {
  border-color: var(--color-focus);
  outline-color: var(--color-focus);
}

.note-composer__textarea:active:not(:disabled) {
  border-color: var(--color-accent);
}

.note-composer__textarea[data-state='loading'] {
  cursor: wait;
  opacity: 0.62;
}

.note-composer__textarea[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.note-composer__textarea[data-state='success'] {
  border-color: var(--color-success);
}

.note-composer__footer {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-4);
}

.note-composer__error,
.note-composer__autosave {
  min-width: 0;
  margin-right: auto;
  font-size: 0.75rem;
}

.note-composer__error {
  color: var(--color-danger);
}

.note-composer__autosave {
  color: var(--color-text-faint);
}

.note-composer__submit {
  flex: none;
  white-space: nowrap;
}

@media (max-width: 47.9375rem) {
  .note-composer {
    width: calc(100% - var(--space-4));
    height: calc(100dvh - var(--space-4));
    min-height: 0;
  }

  .note-composer__header {
    min-height: 4rem;
    padding: var(--space-3) var(--space-4);
  }

  .note-composer__form {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .note-composer__rail {
    max-height: 16rem;
    padding: var(--space-4);
    gap: var(--space-3);
    border-right: 0;
    border-bottom: var(--rule);
  }

  .note-composer__security {
    display: none;
  }

  .note-composer__editor {
    padding: var(--space-3);
  }

  .note-composer__textarea {
    padding: var(--space-4);
  }

  .note-composer__footer {
    align-items: stretch;
    flex-direction: column;
  }

  .note-composer__submit {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .note-composer__textarea {
    transition-duration: var(--dur-fast);
  }
}

.unlock-step {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-block: var(--space-4);
  text-align: center;
}

.unlock-step__icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: 999px;
  color: var(--color-accent-strong);
  display: grid;
  height: 3rem;
  place-items: center;
  width: 3rem;
}

.unlock-step__title {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.125rem;
}

.unlock-step__desc {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  max-width: 26rem;
}

.unlock-step__form {
  margin-top: var(--space-2);
  text-align: start;
  width: 100%;
}

.unlock-step__error {
  background: var(--color-danger-soft);
  border: 1px solid oklch(0.577 0.245 27.3 / 0.35);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.8125rem;
  margin-top: var(--space-3);
  padding: var(--space-3);
}

.unlock-step__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
</style>
