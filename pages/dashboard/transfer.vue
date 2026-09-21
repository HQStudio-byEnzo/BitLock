<template>
  <div class="section-shell max-w-6xl py-10 md:py-16 space-y-6">
    <section class="hero-panel"><p class="eyebrow">{{ t('sidebar.transfer') }}</p><h1 class="mt-3 text-3xl md:text-4xl font-semibold text-foreground">{{ t('transfer.title') }}</h1><p class="mt-3 max-w-2xl text-surface-500">{{ t('transfer.subtitle') }}</p></section>

    <div class="grid gap-5 lg:grid-cols-2">
      <section class="glass-panel p-5 md:p-6 space-y-4">
        <div><p class="eyebrow">{{ t('transfer.send') }}</p><h2 class="mt-2 text-xl text-foreground">{{ t('transfer.create') }}</h2></div>
        <UiSelectMenu v-model="selectedId" :placeholder="t('transfer.select')" :options="itemOptions" />
        <div class="flex gap-2"><input v-model="transferCode" class="input-field font-mono" :aria-label="t('transfer.code')" :placeholder="t('transfer.code')" /><button class="btn-secondary" :aria-label="t('transfer.newCode')" @click="newCode"><Icon name="hugeicons:dices" class="w-4 h-4" /></button></div>
        <button class="btn-primary w-full" :disabled="!selectedId || !transferCode || working" @click="createPackage">{{ t('transfer.generate') }}</button>
        <div v-if="encoded" class="space-y-4">
          <div class="bg-white p-3 max-w-sm mx-auto"><img v-if="qrDataUrl" :src="qrDataUrl" alt="Encrypted QVault transfer QR" width="640" height="640" class="w-full" /><p v-else class="p-6 text-center text-sm text-black">{{ t('transfer.qrTooLarge') }}</p></div>
          <textarea :value="encoded" readonly rows="4" :aria-label="t('transfer.create')" class="input-field resize-none font-mono text-xs" />
          <div class="flex gap-2"><button class="btn-secondary flex-1" @click="copyPackage"><Icon name="hugeicons:copy" class="w-4 h-4" />{{ t('transfer.copy') }}</button><button class="btn-secondary flex-1" @click="downloadPackage"><Icon name="hugeicons:file-down" class="w-4 h-4" />{{ t('transfer.file') }}</button></div>
          <p class="text-xs text-amber-700">{{ t('transfer.shareCodeSeparately') }}</p>
        </div>
      </section>

      <section class="glass-panel p-5 md:p-6 space-y-4">
        <div><p class="eyebrow">{{ t('transfer.receive') }}</p><h2 class="mt-2 text-xl text-foreground">{{ t('transfer.import') }}</h2></div>
        <textarea v-model="incoming" rows="8" :aria-label="t('transfer.paste')" class="input-field resize-none font-mono text-xs" :placeholder="t('transfer.paste')" />
        <button type="button" class="btn-secondary w-full" @click="fileInput?.click()"><Icon name="hugeicons:file-up" class="w-4 h-4" />{{ t('transfer.chooseFile') }}</button>
        <input ref="fileInput" type="file" accept=".qvault,.qvault-transfer,.bitlock-transfer,application/json" class="hidden" @change="readFile" />
        <input v-model="incomingCode" type="password" :aria-label="t('transfer.receiveCode')" class="input-field font-mono" :placeholder="t('transfer.receiveCode')" />
        <button class="btn-primary w-full" :disabled="!incoming || !incomingCode || working" @click="importPackage">{{ t('transfer.importAction') }}</button>
        <p v-if="message" role="status" class="text-sm" :class="failed ? 'text-red-600' : 'text-accent-600'">{{ message }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { useLang } from '~/composables/useI18n'
import { TRANSFER_FORMAT, LEGACY_TRANSFER_FORMAT } from '~/utils/brand'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
interface TransferEnvelope { format: typeof TRANSFER_FORMAT | typeof LEGACY_TRANSFER_FORMAT; version: 1; label: string; type: 'link' | 'password' | 'crypto' | 'recovery' | 'note' | 'totp'; url?: string; payload: string; iv: string; createdAt: string }
const { t } = useLang()
const { items, fetchItems, decryptItem, addItem } = useVault()
const { isUnlocked } = useMasterPassword()
const { encrypt, decrypt, serializeEncryptedPayload, parseEncryptedPayload } = useCrypto()
const { generatePassword } = usePasswordGenerator()
const { copySecurely } = useSecureClipboard()
const selectedId = ref(''), transferCode = ref(''), encoded = ref(''), qrDataUrl = ref(''), incoming = ref(''), incomingCode = ref(''), working = ref(false), message = ref(''), failed = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const itemOptions = computed(() => items.value.map(item => ({ value: item.id, label: item.label || item.type })))
function newCode() { transferCode.value = generatePassword({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: false, avoidAmbiguous: true }) }
async function createPackage() {
  if (!isUnlocked.value) { failed.value = true; message.value = t('transfer.unlock'); return }
  const item = items.value.find(entry => entry.id === selectedId.value); if (!item) return
  working.value = true; message.value = ''; failed.value = false
  try {
    const encrypted = await encrypt(await decryptItem(item), transferCode.value)
    const envelope: TransferEnvelope = { format: TRANSFER_FORMAT, version: 1, label: item.label, type: item.type, url: item.url, payload: serializeEncryptedPayload(encrypted), iv: encrypted.iv, createdAt: new Date().toISOString() }
    encoded.value = JSON.stringify(envelope)
    try { qrDataUrl.value = await QRCode.toDataURL(encoded.value, { errorCorrectionLevel: 'M', width: 640, margin: 2 }) } catch { qrDataUrl.value = '' }
  } catch { failed.value = true; message.value = t('transfer.failed') }
  finally { working.value = false }
}
async function importPackage() {
  if (!isUnlocked.value) { failed.value = true; message.value = t('transfer.unlock'); return }
  working.value = true; message.value = ''; failed.value = false
  try {
    const envelope = JSON.parse(incoming.value) as TransferEnvelope
    if (![TRANSFER_FORMAT, LEGACY_TRANSFER_FORMAT].includes(envelope.format) || envelope.version !== 1) throw new Error('FORMAT')
    const parsedPayload = parseEncryptedPayload(envelope.payload)
    const plain = await decrypt(parsedPayload.ciphertext, envelope.iv, incomingCode.value, parsedPayload.salt, parsedPayload.iterations)
    await addItem({ type: envelope.type, label: envelope.label, payload: plain, url: envelope.url })
    message.value = t('transfer.imported'); incoming.value = ''; incomingCode.value = ''
  } catch { failed.value = true; message.value = t('transfer.invalid') }
  finally { working.value = false }
}
async function copyPackage() { await copySecurely(encoded.value, 120) }
function downloadPackage() { const url = URL.createObjectURL(new Blob([encoded.value], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `qvault-transfer-${Date.now()}.qvault`; link.click(); URL.revokeObjectURL(url) }
async function readFile(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (file && file.size < 150_000) incoming.value = await file.text() }
onMounted(async () => { await fetchItems(); newCode() })
</script>
