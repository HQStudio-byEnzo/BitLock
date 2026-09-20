<template>
  <div class="section-shell max-w-7xl py-10 md:py-16 space-y-6">
    <section class="hero-panel space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="max-w-2xl">
          <p class="eyebrow">{{ t('sidebar.recoveryCode') }}</p>
          <h1 class="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">{{ t('recovery.title') }}</h1>
          <p class="text-surface-300 text-base md:text-lg mt-3 leading-relaxed">{{ t('recovery.desc') }}</p>
        </div>
        <button @click="showAddModal = true" class="btn-primary flex items-center gap-2 self-start">
          <Icon name="lucide:plus" class="w-4 h-4" />{{ t('recovery.addImport') }}
        </button>
      </div>
      <div class="glass-panel p-4 border-accent-500/20 bg-accent-500/5 text-sm text-surface-300">{{ t('recovery.txtNotice') }}</div>
    </section>
    <div v-if="loading" class="flex items-center justify-center py-12"><Icon name="lucide:loader-2" class="w-6 h-6 text-accent-600 animate-spin" /></div>
    <div v-else-if="filteredItems.length === 0" class="text-center py-16"><Icon name="lucide:ticket-check" class="w-12 h-12 text-surface-600 mx-auto mb-4" /><p class="text-surface-400">{{ t('recovery.empty') }}</p></div>
    <div v-else class="space-y-3"><VaultItemCard v-for="item in filteredItems" :key="item.id" :item="item" @toggle-favorite="toggleFavorite(item)" @delete="handleDelete(item)" @decrypt="decryptTarget = item" /></div>
    <VaultAddModal v-if="showAddModal" default-type="recovery" @close="showAddModal = false" @added="showAddModal = false" />
    <VaultDecryptModal v-if="decryptTarget" :item="decryptTarget" @close="decryptTarget = null" />
    <VaultDeleteModal v-if="deleteTarget" :item="deleteTarget" :error-message="deleteError" @close="deleteTarget = null" @confirm="confirmDelete" />
  </div>
</template>
<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { items, loading, fetchItems, toggleFavorite, deleteItem } = useVault()
const { masterPassword, setMasterPassword } = useMasterPassword()
const { t } = useLang()
const route = useRoute()
const router = useRouter()
const showAddModal = ref(false)
const decryptTarget = ref<any>(null)
const deleteTarget = ref<any>(null)
const deleteError = ref('')
const filteredItems = computed(() => items.value.filter(i => i.type === 'recovery'))
function handleDelete(item: any) { deleteError.value = ''; deleteTarget.value = item }
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
  fetchItems({ type: 'recovery' })
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
