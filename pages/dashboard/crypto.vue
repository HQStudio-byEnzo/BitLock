<template>
  <div class="section-shell max-w-7xl py-10 md:py-16 space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('crypto.title') }}</h1>
        <p class="text-surface-400 text-sm mt-1">{{ t('crypto.subtitle') }}</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary flex items-center gap-2">
        <Icon name="hugeicons:plus" class="w-4 h-4" />
        {{ t('crypto.add') }}
      </button>
    </div>

    <!-- Security notice -->
    <div class="p-3 rounded-lg bg-accent-500/10 border border-accent-500/20 text-sm text-accent-600 flex items-center gap-2">
      <Icon name="hugeicons:shield-check" class="w-4 h-4 flex-shrink-0" />
      <span>{{ t('crypto.recommend') }}</span>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="hugeicons:loader" class="w-6 h-6 text-accent-600 animate-spin" />
    </div>

    <div v-else-if="filteredItems.length === 0" class="text-center py-16">
      <Icon name="hugeicons:bitcoin" class="w-12 h-12 text-surface-600 mx-auto mb-4" />
      <p class="text-surface-400">{{ t('crypto.empty') }}</p>
    </div>

    <div v-else class="space-y-2">
      <VaultItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        @toggle-favorite="toggleFavorite(item)"
        @delete="handleDelete(item)"
        @decrypt="handleDecrypt(item)"
      />
    </div>

    <VaultAddModal
      v-if="showAddModal"
      default-type="crypto"
      @close="showAddModal = false"
      @added="showAddModal = false"
    />

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
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useLang()
const route = useRoute()
const router = useRouter()
const { items, loading, fetchItems, toggleFavorite, deleteItem } = useVault()
const { masterPassword, setMasterPassword } = useMasterPassword()
const showAddModal = ref(false)
const decryptTarget = ref<any>(null)
const deleteTarget = ref<any>(null)
const deleteError = ref('')

const filteredItems = computed(() => items.value.filter(i => i.type === 'crypto'))

function handleDecrypt(item: any) { decryptTarget.value = item }
function handleDelete(item: any) {
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
  fetchItems({ type: 'crypto' })
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
