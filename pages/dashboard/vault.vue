<template>
  <div class="section-shell max-w-7xl py-10 md:py-16 space-y-6">
    <section class="hero-panel space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="max-w-2xl">
          <p class="eyebrow">{{ t('sidebar.vault') }}</p>
          <h1 class="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">{{ t('vault.title') }}</h1>
          <p class="text-surface-300 text-base md:text-lg mt-3 leading-relaxed">{{ t('vault.subtitle') }}</p>
        </div>
        <button @click="showAddModal = true" class="btn-primary inline-flex items-center gap-2 self-start">
          <Icon name="hugeicons:plus" class="w-4 h-4" />
          {{ t('vault.add') }}
        </button>
      </div>
    </section>

    <!-- Filters -->
    <div class="glass-panel p-4 md:p-5 space-y-3">
      <div class="grid gap-2 sm:grid-cols-2">
        <UiSelectMenu v-model="vaultFilter" :options="vaultOptions" :placeholder="t('vault.allVaults')" />
        <UiSelectMenu v-model="folderFilter" :options="folderOptions" :placeholder="t('vault.allFolders')" />
      </div>
      <div v-if="searchQuery" class="flex items-center gap-2 text-sm text-surface-500">
        <Icon name="hugeicons:search-01" class="h-4 w-4 flex-none" />
        <span class="truncate">{{ t('vault.search') }} « {{ searchQuery }} »</span>
        <button type="button" class="ml-auto text-accent-text hover:text-accent-text-strong" @click="searchQuery = ''">
          {{ t('common.clear') }}
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          :aria-pressed="activeFilter === filter.value"
          class="px-3 py-2 rounded-2xl text-sm font-medium transition-colors border"
          :class="[
            activeFilter === filter.value
              ? 'bg-accent-600 text-primary-foreground border-accent-500/30'
              : 'bg-foreground/[0.03] text-surface-400 border-border hover:text-surface-200 hover:border-foreground/25'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="chip in searchChips"
          :key="chip.query"
          @click="searchQuery = chip.query"
          class="px-2.5 py-1 rounded-full text-xs bg-foreground/[0.03] text-surface-400 border border-border hover:text-surface-200 hover:border-foreground/25 transition-colors"
        >
          {{ chip.label }}
        </button>
      </div>
    </div>

    <!-- Items list -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="hugeicons:loader" class="w-6 h-6 text-accent-text animate-spin" />
    </div>

    <div v-else-if="visibleItems.length === 0" class="text-center py-16">
      <Icon name="hugeicons:vault" class="w-12 h-12 text-surface-600 mx-auto mb-4" />
      <p class="text-surface-400">{{ items.length === 0 ? t('vault.empty') : t('vault.noResult') }}</p>
      <p class="text-sm text-surface-500 mt-1">{{ items.length === 0 ? t('vault.emptyHint') : t('vault.noResultHint') }}</p>
    </div>

    <div v-else class="space-y-3">
      <VaultItemCard
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        @toggle-favorite="toggleFavorite(item)"
        @delete="handleDelete(item)"
        @decrypt="handleDecrypt(item)"
      />
    </div>

    <!-- Add Modal -->
    <VaultAddModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @added="onItemAdded"
    />

    <!-- Decrypt Modal -->
    <VaultDecryptModal
      v-if="decryptTarget"
      :item="decryptTarget"
      @close="decryptTarget = null"
    />

    <VaultDeleteModal
      v-if="deleteTarget"
      :item="deleteTarget"
      :error-message="deleteError"
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { t } = useLang()
const route = useRoute()
const router = useRouter()
const { items, loading, fetchItems, toggleFavorite, deleteItem } = useVault()
const { masterPassword, setMasterPassword } = useMasterPassword()

const showAddModal = ref(false)
const decryptTarget = ref<any>(null)
const deleteTarget = ref<any>(null)
const deleteError = ref('')
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const activeFilter = ref('')

const { data: orgData } = await useFetch<{
  vaults: { id: string; name: string }[]
  folders: { id: string; name: string; vault_id: string }[]
}>('/api/organization')

const vaultFilter = ref('')
const folderFilter = ref('')
const vaultOptions = computed(() => [
  { value: '', label: t('vault.allVaults') },
  ...(orgData.value?.vaults || []).map(vault => ({ value: vault.id, label: vault.name })),
])
const folderOptions = computed(() => {
  const folders = (orgData.value?.folders || []).filter(folder => !vaultFilter.value || folder.vault_id === vaultFilter.value)
  return [
    { value: '', label: t('vault.allFolders') },
    ...folders.map(folder => ({ value: folder.id, label: folder.name })),
  ]
})

watch(vaultFilter, () => { folderFilter.value = '' })

watch(() => route.query.q, (value) => {
  searchQuery.value = typeof value === 'string' ? value : ''
})

const filters = computed(() => [
  { label: t('vault.filterAll'), value: '' },
  { label: t('vault.filterLinks'), value: 'link' },
  { label: t('vault.filterPasswords'), value: 'password' },
  { label: t('vault.filterCrypto'), value: 'crypto' },
  { label: t('vault.typeNote'), value: 'note' },
  { label: t('vault.typeTotp'), value: 'totp' },
])

const searchChips = computed(() => [
  { label: t('vault.chipFavorites'), query: 'favorite' },
  { label: t('vault.chipWithUrl'), query: 'has:url' },
  { label: t('vault.chipWithoutUrl'), query: 'missing:url' },
  { label: t('vault.chipPasswords'), query: 'type:password' },
  { label: t('vault.chipCrypto'), query: 'type:crypto' },
])

const visibleItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const scoped = items.value.filter(item => {
    if (vaultFilter.value && item.vault_id !== vaultFilter.value) return false
    if (folderFilter.value && item.folder_id !== folderFilter.value) return false
    return true
  })
  const byType = activeFilter.value
    ? scoped.filter(item => item.type === activeFilter.value)
    : scoped

  if (!query) return byType

  return byType.filter(item => {
    const haystack = [
      item.label,
      item.url,
      item.type,
      item.favorite ? 'favorite favori favoris' : '',
      item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '',
    ].filter(Boolean).join(' ').toLowerCase()

    if (query === 'favorite' || query === 'favori' || query === 'favoris') return !!item.favorite
    if (query === 'has:url' || query === 'url') return !!item.url
    if (query === 'missing:url' || query === 'sans:url') return !item.url
    if (query.startsWith('type:')) return item.type === query.replace('type:', '')
    if (query.startsWith('site:')) return (item.url || '').toLowerCase().includes(query.replace('site:', ''))

    return query.split(/\s+/).every(term => haystack.includes(term))
  })
})

function onItemAdded() {
  showAddModal.value = false
}

function handleDecrypt(item: any) {
  decryptTarget.value = item
}

async function handleDelete(item: any) {
  deleteError.value = ''
  deleteTarget.value = item
}

async function confirmDelete(secret: string) {
  if (!deleteTarget.value) return

  deleteError.value = ''
  try {
    if (secret) setMasterPassword(secret)
    await deleteItem(deleteTarget.value, secret || masterPassword.value || '')
    deleteTarget.value = null
  } catch (err: any) {
    deleteError.value = err?.message || t('settings.deleteError')
  }
}

onMounted(() => {
  fetchItems()
  if (route.query.add) {
    showAddModal.value = true
    router.replace({ path: route.path, query: { ...route.query, add: undefined } })
  }
})

watch(() => route.query.add, (value) => {
  if (value) {
    showAddModal.value = true
    router.replace({ path: route.path, query: { ...route.query, add: undefined } })
  }
})
</script>
