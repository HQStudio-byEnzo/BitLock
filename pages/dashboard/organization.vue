<template>
  <div class="section-shell max-w-7xl py-10 md:py-16 space-y-6">
    <section class="hero-panel">
      <p class="eyebrow">{{ t('organization.eyebrow') }}</p>
      <h1 class="mt-3 text-3xl md:text-4xl font-semibold text-foreground">{{ t('organization.title') }}</h1>
      <p class="mt-3 max-w-2xl text-surface-300">{{ t('organization.subtitle') }}</p>
    </section>

    <p v-if="message" role="status" class="glass-panel p-3 text-sm" :class="failed ? 'text-red-600' : 'text-accent-600'">{{ message }}</p>

    <div class="grid gap-4 lg:grid-cols-3">
      <section class="glass-panel p-5 space-y-4">
        <div class="flex items-center gap-2"><Icon name="hugeicons:vault" class="text-accent-600" /><h2 class="text-foreground font-medium">{{ t('organization.vaults') }}</h2></div>
        <form class="flex gap-2" @submit.prevent="create('vault', vaultName)"><input v-model="vaultName" class="input-field" :aria-label="t('organization.vaultName')" :placeholder="t('organization.vaultName')" /><button class="icon-button" :aria-label="t('organization.add')"><Icon name="hugeicons:plus" /></button></form>
        <ul class="space-y-2"><li v-for="vault in data.vaults" :key="vault.id" class="flex items-center gap-3 border border-border p-3"><span class="h-2 w-2 rounded-full" :style="{ background: vault.color }"/><span class="flex-1 text-sm text-surface-200">{{ vault.name }}</span><span v-if="vault.is_default" class="tech-status">default</span><button v-else class="icon-button" :aria-label="`${t('vault.deleteAction')} ${vault.name}`" @click="remove('vault', vault.id)"><Icon name="hugeicons:trash" class="w-4 h-4" /></button></li></ul>
      </section>

      <section class="glass-panel p-5 space-y-4">
        <div class="flex items-center gap-2"><Icon name="hugeicons:folder-tree" class="text-accent-600" /><h2 class="text-foreground font-medium">{{ t('organization.folders') }}</h2></div>
        <form class="space-y-2" @submit.prevent="create('folder', folderName)"><input v-model="folderName" class="input-field" :aria-label="t('organization.folderName')" :placeholder="t('organization.folderName')" /><select v-model="folderVault" class="input-field" :aria-label="t('organization.folders')"><option v-for="vault in data.vaults" :key="vault.id" :value="vault.id">{{ vault.name }}</option></select><button class="btn-secondary w-full">{{ t('organization.addFolder') }}</button></form>
        <ul class="space-y-2"><li v-for="folder in data.folders" :key="folder.id" class="flex items-center gap-3 border border-border p-3"><Icon name="hugeicons:folder-01" class="text-surface-500" /><span class="flex-1 text-sm text-surface-200">{{ folder.name }}</span><button class="icon-button" :aria-label="`${t('vault.deleteAction')} ${folder.name}`" @click="remove('folder', folder.id)"><Icon name="hugeicons:trash" class="w-4 h-4" /></button></li></ul>
      </section>

      <section class="glass-panel p-5 space-y-4">
        <div class="flex items-center gap-2"><Icon name="hugeicons:tags" class="text-accent-600" /><h2 class="text-foreground font-medium">{{ t('organization.tags') }}</h2></div>
        <form class="flex gap-2" @submit.prevent="create('tag', tagName)"><input v-model="tagName" class="input-field" :aria-label="t('organization.tagName')" :placeholder="t('organization.tagName')" /><UiColorPicker v-model="tagColor" /><button class="icon-button" :aria-label="t('organization.add')"><Icon name="hugeicons:plus" /></button></form>
        <ul class="flex flex-wrap gap-2"><li v-for="tag in data.tags" :key="tag.id" class="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm text-surface-200"><span class="h-2 w-2 rounded-full" :style="{ background: tag.color }" />{{ tag.name }}<button class="p-1.5 rounded hover:text-red-600" :aria-label="`${t('vault.deleteAction')} ${tag.name}`" @click="remove('tag', tag.id)"><Icon name="hugeicons:x" class="w-3.5 h-3.5" /></button></li></ul>
      </section>
    </div>

    <section class="glass-panel p-5 md:p-6 space-y-5">
      <div><p class="eyebrow">{{ t('organization.classify') }}</p><h2 class="mt-2 text-xl text-foreground">{{ t('organization.assignTitle') }}</h2></div>
      <div class="grid gap-3 md:grid-cols-3">
        <select v-model="selectedItemId" class="input-field" :aria-label="t('organization.selectItem')"><option value="">{{ t('organization.selectItem') }}</option><option v-for="item in items" :key="item.id" :value="item.id">{{ item.label || item.type }}</option></select>
        <select v-model="selectedVaultId" class="input-field" :aria-label="t('organization.vaults')"><option v-for="vault in data.vaults" :key="vault.id" :value="vault.id">{{ vault.name }}</option></select>
        <select v-model="selectedFolderId" class="input-field" :aria-label="t('organization.noFolder')"><option value="">{{ t('organization.noFolder') }}</option><option v-for="folder in matchingFolders" :key="folder.id" :value="folder.id">{{ folder.name }}</option></select>
      </div>
      <div class="flex flex-wrap gap-2"><label v-for="tag in data.tags" :key="tag.id" class="flex items-center gap-2 border border-border px-3 py-2 text-sm text-surface-300"><input v-model="selectedTagIds" type="checkbox" :value="tag.id" />{{ tag.name }}</label></div>
      <button class="btn-primary" :disabled="!selectedItemId" @click="assign">{{ t('organization.assign') }}</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
type Entry = { id: string; name: string; color?: string; is_default?: number; vault_id?: string }
const { t } = useLang()
const { items, fetchItems } = useVault()
const data = reactive<{ vaults: Entry[]; folders: Entry[]; tags: Entry[] }>({ vaults: [], folders: [], tags: [] })
const vaultName = ref(''), folderName = ref(''), tagName = ref(''), folderVault = ref(''), tagColor = ref('#4ade80')
const selectedItemId = ref(''), selectedVaultId = ref(''), selectedFolderId = ref(''), selectedTagIds = ref<string[]>([])
const message = ref(''), failed = ref(false)
const matchingFolders = computed(() => data.folders.filter(folder => folder.vault_id === selectedVaultId.value))
async function load() { const response: typeof data = await $fetch('/api/organization'); Object.assign(data, response); folderVault.value ||= data.vaults[0]?.id || ''; selectedVaultId.value ||= data.vaults[0]?.id || '' }
async function perform(work: () => Promise<unknown>) { message.value = ''; failed.value = false; try { await work(); message.value = t('organization.saved'); await load() } catch (error: any) { failed.value = true; message.value = error?.data?.message || t('organization.failed') } }
async function create(kind: 'vault' | 'folder' | 'tag', name: string) { const trimmed = name.trim(); if (!trimmed) return; await perform(() => $fetch('/api/organization', { method: 'POST', body: { kind, name: trimmed, vault_id: folderVault.value, color: tagColor.value } })); if (kind === 'vault') vaultName.value = ''; else if (kind === 'folder') folderName.value = ''; else tagName.value = '' }
async function remove(kind: string, id: string) { await perform(() => $fetch('/api/organization/remove', { method: 'POST', body: { kind, id } })) }
async function assign() { await perform(() => $fetch('/api/organization/assign', { method: 'POST', body: { item_id: selectedItemId.value, vault_id: selectedVaultId.value, folder_id: selectedFolderId.value || null, tag_ids: selectedTagIds.value } })); await fetchItems() }
watch(selectedItemId, (id) => { const item = items.value.find(entry => entry.id === id); if (!item) return; selectedVaultId.value = item.vault_id || data.vaults[0]?.id || ''; selectedFolderId.value = item.folder_id || ''; selectedTagIds.value = item.tags?.map(tag => tag.id) || [] })
onMounted(async () => { await Promise.all([load(), fetchItems()]) })
</script>
