<template>
  <div class="section-shell max-w-6xl py-10 md:py-16 space-y-6">
    <section class="hero-panel flex flex-col sm:flex-row sm:items-end justify-between gap-5">
      <div>
        <p class="eyebrow">{{ t('notes.eyebrow') }}</p>
        <h1 class="mt-3 text-3xl md:text-4xl font-semibold text-foreground">{{ t('notes.title') }}</h1>
        <p class="mt-3 text-surface-300">{{ t('notes.subtitle') }}</p>
      </div>
      <button class="btn-primary self-start" @click="showAdd = true"><Icon name="hugeicons:plus" class="w-4 h-4" /> {{ t('notes.add') }}</button>
    </section>

    <div v-if="loading" class="glass-panel p-10 text-center text-surface-400">{{ t('common.loading') }}</div>
    <div v-else-if="notes.length === 0" class="glass-panel p-10 text-center">
      <Icon name="hugeicons:notebook-tabs" class="w-10 h-10 mx-auto text-accent-600" />
      <p class="mt-4 text-foreground">{{ t('notes.empty') }}</p>
      <p class="mt-1 text-sm text-surface-400">{{ t('notes.emptyHint') }}</p>
    </div>
    <div v-else class="grid gap-3 md:grid-cols-2">
      <VaultItemCard v-for="item in notes" :key="item.id" :item="item" @toggle-favorite="toggleFavorite(item)" @decrypt="decryptTarget = item" @delete="deleteTarget = item" />
    </div>

    <VaultAddModal v-if="showAdd" default-type="note" @close="showAdd = false" @added="showAdd = false" />
    <VaultDecryptModal v-if="decryptTarget" :item="decryptTarget" @close="decryptTarget = null" />
    <VaultDeleteModal v-if="deleteTarget" :item="deleteTarget" :error-message="deleteError" @close="deleteTarget = null" @confirm="confirmDelete" />
  </div>
</template>

<script setup lang="ts">
import type { VaultItem } from '~/composables/useVault'
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { t } = useLang()
const { items, loading, fetchItems, toggleFavorite, deleteItem } = useVault()
const notes = computed(() => items.value.filter(item => item.type === 'note'))
const showAdd = ref(false)
const decryptTarget = ref<VaultItem | null>(null)
const deleteTarget = ref<VaultItem | null>(null)
const deleteError = ref('')
async function confirmDelete(secret: string) {
  if (!deleteTarget.value) return
  try { await deleteItem(deleteTarget.value, secret); deleteTarget.value = null } catch (error: any) { deleteError.value = error?.message || t('settings.deleteError') }
}
onMounted(() => fetchItems({ type: 'note' }))
</script>
