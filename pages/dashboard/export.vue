<template>
  <div class="section-shell max-w-4xl py-10 md:py-16 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">{{ t('export.title') }}</h1>
      <p class="text-surface-400 text-sm mt-1">{{ t('export.subtitle') }}</p>
    </div>

    <div class="glass-panel p-5 md:p-6 space-y-4">
      <div class="flex items-center gap-3">
        <div class="feature-mark">
          <Icon name="hugeicons:download-01" class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">{{ t('export.exportTitle') }}</h2>
          <p class="text-sm text-surface-400">{{ t('export.exportDesc') }}</p>
        </div>
      </div>
      <p class="text-sm text-surface-500">
        {{ t('export.exportNotice') }}
      </p>
      <button @click="handleExport" :disabled="exporting" class="btn-primary flex items-center gap-2">
        <Icon name="hugeicons:download-01" class="w-4 h-4" />
        <span v-if="exporting">{{ t('export.exporting') }}</span>
        <span v-else>{{ t('export.exportBtn') }}</span>
      </button>
    </div>

    <div class="glass-panel p-5 md:p-6 space-y-4">
      <div class="flex items-center gap-3">
        <div class="feature-mark">
          <Icon name="hugeicons:upload-01" class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">{{ t('export.importTitle') }}</h2>
          <p class="text-sm text-surface-400">{{ t('export.importDesc') }}</p>
        </div>
      </div>
      <p class="text-sm text-surface-500">
        {{ t('export.importNotice') }}
      </p>
      <div>
        <label for="backup-password" class="block text-sm font-medium text-surface-300 mb-1">{{ t('export.backupPassword') }}</label>
        <input
          id="backup-password"
          v-model="backupPassword"
          type="password"
          class="input-field"
          autocomplete="current-password"
          :placeholder="t('export.backupPasswordPlaceholder')"
        />
        <p class="mt-1 text-xs text-surface-500">{{ t('export.backupPasswordHint') }}</p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <label class="btn-primary flex items-center gap-2 cursor-pointer">
          <Icon name="hugeicons:upload-01" class="w-4 h-4" />
          <span v-if="importing">{{ t('export.importing') }}</span>
          <span v-else>{{ t('export.importBtn') }}</span>
          <input
            type="file"
            accept=".qvault,.bitlock,application/json"
            class="hidden"
            @change="handleImport"
            :disabled="importing"
          />
        </label>
      </div>

      <!-- Import result -->
      <div v-if="importResult" class="p-3 rounded-xl text-sm" :class="importResult.success ? 'bg-green-500/10 border border-green-500/20 text-green-700' : 'bg-red-500/10 border border-red-500/20 text-red-600'">
        {{ importResult.message }}
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { t } = useLang()
const { items, fetchItems, addItem } = useVault()
const { masterPassword, isUnlocked } = useMasterPassword()
const { encrypt, decrypt, parseEncryptedPayload } = useCrypto()

const exporting = ref(false)
const importing = ref(false)
const error = ref<string | null>(null)
const importResult = ref<{ success: boolean; message: string } | null>(null)
const backupPassword = ref('')

interface BackupItem {
  type: 'link' | 'password' | 'crypto' | 'recovery' | 'note' | 'totp'
  label: string
  payload: string
  is_encrypted: boolean
  iv: string | null
  url: string | null
  favorite: boolean
  created_at: string
  updated_at: string | null
  vault_id?: string | null
  folder_id?: string | null
  tag_ids?: string[]
}

interface BackupVault {
  id: string
  name: string
  color: string
  is_default: boolean
}

interface BackupFolder {
  id: string
  vault_id: string
  name: string
  parent_id: string | null
}

interface BackupTag {
  id: string
  name: string
  color: string
}

interface OrganizationData {
  vaults: Array<BackupVault & { is_default: boolean | number }>
  folders: BackupFolder[]
  tags: BackupTag[]
}

interface BackupContentV2 {
  dataVersion: 2
  items: BackupItem[]
  organization: {
    vaults: BackupVault[]
    folders: BackupFolder[]
    tags: BackupTag[]
  }
}

interface LegacyBackupContent {
  dataVersion: 1
  items: BackupItem[]
}

type BackupContent = BackupContentV2 | LegacyBackupContent

async function handleExport() {
  exporting.value = true
  error.value = null

  try {
    if (!isUnlocked.value || !masterPassword.value) {
      throw new Error(t('export.unlockRequired'))
    }
    const [, organization] = await Promise.all([
      fetchItems(),
      $fetch('/api/organization') as Promise<OrganizationData>,
    ])

    const content: BackupContentV2 = {
      dataVersion: 2,
      items: items.value.map(item => ({
        type: item.type,
        label: item.label,
        payload: item.payload,
        is_encrypted: item.is_encrypted,
        iv: item.iv,
        url: item.url || null,
        favorite: item.favorite,
        created_at: item.created_at,
        updated_at: item.updated_at || null,
        vault_id: item.vault_id || null,
        folder_id: item.folder_id || null,
        tag_ids: item.tags?.map(tag => tag.id) || [],
      })),
      organization: {
        vaults: organization.vaults.map(vault => ({
          id: vault.id,
          name: vault.name,
          color: vault.color,
          is_default: Boolean(vault.is_default),
        })),
        folders: organization.folders.map(folder => ({
          id: folder.id,
          vault_id: folder.vault_id,
          name: folder.name,
          parent_id: folder.parent_id || null,
        })),
        tags: organization.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })),
      },
    }

    const protectedBackup = await encrypt(JSON.stringify(content), masterPassword.value)
    const exportData = {
      format: 'bitlock-backup',
      version: 4,
      exportedAt: new Date().toISOString(),
      cipher: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256-600000',
      salt: protectedBackup.salt,
      iv: protectedBackup.iv,
      payload: protectedBackup.ciphertext,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qvault-backup-${new Date().toISOString().split('T')[0]}.qvault`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = err.message || t('export.exportError')
  } finally {
    exporting.value = false
  }
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 5_000_000) {
    importResult.value = { success: false, message: t('export.invalidFormat') }
    input.value = ''
    return
  }

  importing.value = true
  error.value = null
  importResult.value = null

  try {
    if (!isUnlocked.value || !masterPassword.value) {
      throw new Error(t('export.unlockRequired'))
    }

    const text = await file.text()
    const envelope = JSON.parse(text)

    if (
      envelope?.format !== 'bitlock-backup' ||
      ![3, 4].includes(envelope?.version) ||
      typeof envelope.payload !== 'string' ||
      typeof envelope.iv !== 'string' ||
      typeof envelope.salt !== 'string'
    ) {
      throw new Error(t('export.invalidFormat'))
    }

    const sourcePassword = backupPassword.value || masterPassword.value
    let content: BackupContent
    try {
      const iterations = envelope.version === 3 ? 100_000 : 600_000
      content = JSON.parse(await decrypt(envelope.payload, envelope.iv, sourcePassword, envelope.salt, iterations))
    } catch {
      throw new Error(t('export.invalidBackupPassword'))
    }

    if (
      ![1, 2].includes(content?.dataVersion) ||
      !Array.isArray(content.items) ||
      content.items.length > 1_000 ||
      (content.dataVersion === 2 && !isValidOrganization(content.organization))
    ) {
      throw new Error(t('export.invalidFormat'))
    }

    const organizationMaps = content.dataVersion === 2
      ? await importOrganization(content.organization)
      : { vaults: new Map<string, string>(), folders: new Map<string, string>(), tags: new Map<string, string>() }

    let imported = 0
    let failed = 0

    for (const item of content.items) {
      try {
        if (!isValidImportItem(item)) {
          failed++
          continue
        }

        let plaintext = item.payload
        if (item.is_encrypted && item.iv) {
          const parsedPayload = parseEncryptedPayload(item.payload)
          plaintext = await decrypt(
            parsedPayload.ciphertext,
            item.iv,
            sourcePassword,
            parsedPayload.salt,
            parsedPayload.iterations,
          )
        }

        await addItem({
          type: item.type,
          label: item.label || '',
          payload: plaintext,
          shouldEncrypt: item.is_encrypted,
          favorite: item.favorite,
          url: item.url || undefined,
          vaultId: item.vault_id ? organizationMaps.vaults.get(item.vault_id) : undefined,
          folderId: item.folder_id ? organizationMaps.folders.get(item.folder_id) || null : null,
          tagIds: item.tag_ids?.map(id => organizationMaps.tags.get(id)).filter((id): id is string => Boolean(id)),
        }, { refresh: false })
        imported++
      } catch {
        failed++
      }
    }

    await fetchItems()

    importResult.value = {
      success: true,
      message: t('export.importSummary')
        .replace('{imported}', String(imported))
        .replace('{failed}', String(failed)),
    }
  } catch (err: any) {
    importResult.value = {
      success: false,
      message: err.message || t('export.importError'),
    }
  } finally {
    importing.value = false
    input.value = ''
  }
}

function isValidImportItem(item: any) {
  const validShape = (
    item &&
    ['link', 'password', 'crypto', 'recovery', 'note', 'totp'].includes(item.type) &&
    typeof item.label === 'string' && item.label.length <= 200 &&
    typeof item.payload === 'string' && item.payload.length <= 200_000 &&
    (item.vault_id === undefined || item.vault_id === null || (typeof item.vault_id === 'string' && item.vault_id.length <= 128)) &&
    (item.folder_id === undefined || item.folder_id === null || (typeof item.folder_id === 'string' && item.folder_id.length <= 128)) &&
    (item.tag_ids === undefined || (Array.isArray(item.tag_ids) && item.tag_ids.length <= 20 && item.tag_ids.every((id: unknown) => typeof id === 'string' && id.length <= 128))) &&
    (
      (!item.is_encrypted && !item.iv) ||
      (item.is_encrypted && typeof item.iv === 'string')
    )
  )
  if (!validShape) return false
  if (item.is_encrypted) {
    try {
      parseEncryptedPayload(item.payload)
    } catch {
      return false
    }
  }
  return true
}

function isValidOrganization(value: any) {
  if (
    !value ||
    !Array.isArray(value.vaults) || value.vaults.length > 100 ||
    !Array.isArray(value.folders) || value.folders.length > 500 ||
    !Array.isArray(value.tags) || value.tags.length > 500
  ) return false
  const validId = (id: unknown) => typeof id === 'string' && id.length > 0 && id.length <= 128
  const validName = (name: unknown) => typeof name === 'string' && name.trim().length > 0 && name.length <= 80
  const validColor = (color: unknown) => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)
  return (
    value.vaults.every((entry: any) => validId(entry.id) && validName(entry.name) && validColor(entry.color) && typeof entry.is_default === 'boolean') &&
    value.folders.every((entry: any) => validId(entry.id) && validId(entry.vault_id) && validName(entry.name) && (entry.parent_id === null || validId(entry.parent_id))) &&
    value.tags.every((entry: any) => validId(entry.id) && validName(entry.name) && validColor(entry.color))
  )
}

async function importOrganization(backup: BackupContentV2['organization']) {
  const current: OrganizationData = await $fetch('/api/organization')
  const vaults = new Map<string, string>()
  const folders = new Map<string, string>()
  const tags = new Map<string, string>()
  const defaultVault = current.vaults.find(vault => Boolean(vault.is_default)) || current.vaults[0]

  for (const source of backup.vaults) {
    let target = source.is_default
      ? defaultVault
      : current.vaults.find(vault => vault.name.toLocaleLowerCase() === source.name.toLocaleLowerCase())
    if (!target) {
      const created: { id: string } = await $fetch('/api/organization', {
        method: 'POST',
        body: { kind: 'vault', name: source.name, color: source.color },
      })
      target = { ...source, id: created.id }
      current.vaults.push(target)
    }
    if (target) vaults.set(source.id, target.id)
  }

  for (const source of backup.tags) {
    let target = current.tags.find(tag => tag.name.toLocaleLowerCase() === source.name.toLocaleLowerCase())
    if (!target) {
      const created: { id: string } = await $fetch('/api/organization', {
        method: 'POST',
        body: { kind: 'tag', name: source.name, color: source.color },
      })
      target = { ...source, id: created.id }
      current.tags.push(target)
    }
    tags.set(source.id, target.id)
  }

  const byId = new Map(backup.folders.map(folder => [folder.id, folder]))
  async function ensureFolder(source: BackupFolder, visiting = new Set<string>()): Promise<string | null> {
    const mapped = folders.get(source.id)
    if (mapped) return mapped
    if (visiting.has(source.id)) return null
    visiting.add(source.id)
    const targetVaultId = vaults.get(source.vault_id)
    if (!targetVaultId) return null
    const parentId = source.parent_id
      ? await ensureFolder(byId.get(source.parent_id)!, visiting).catch(() => null)
      : null
    let target = current.folders.find(folder => folder.vault_id === targetVaultId && folder.name.toLocaleLowerCase() === source.name.toLocaleLowerCase())
    if (!target) {
      const created: { id: string } = await $fetch('/api/organization', {
        method: 'POST',
        body: { kind: 'folder', name: source.name, vault_id: targetVaultId, parent_id: parentId },
      })
      target = { ...source, id: created.id, vault_id: targetVaultId, parent_id: parentId }
      current.folders.push(target)
    }
    folders.set(source.id, target.id)
    return target.id
  }
  for (const folder of backup.folders) await ensureFolder(folder)
  return { vaults, folders, tags }
}
</script>
