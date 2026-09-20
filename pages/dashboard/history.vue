<template>
  <div class="section-shell max-w-6xl py-10 md:py-16 space-y-6">
    <section class="hero-panel"><p class="eyebrow">{{ t('history.eyebrow') }}</p><h1 class="mt-3 text-3xl md:text-4xl font-semibold text-foreground">{{ t('history.title') }}</h1><p class="mt-3 text-surface-300">{{ t('history.subtitle') }}</p></section>
    <section class="glass-panel p-5 space-y-4">
      <p class="text-sm text-surface-300">{{ t('history.select') }}</p>
      <UiSelectMenu v-model="selectedId" :options="itemOptions" :placeholder="t('history.selectPlaceholder')" />
    </section>
    <section v-if="selectedId" class="glass-panel p-5 md:p-6">
      <div v-if="loading" class="text-surface-400">{{ t('common.loading') }}</div>
      <div v-else-if="versions.length === 0" class="text-sm text-surface-400">{{ t('history.empty') }}</div>
      <ol v-else class="divide-y divide-border">
        <li v-for="version in versions" :key="version.id" class="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
          <span class="flex h-9 w-9 items-center justify-center border border-accent-500/30 font-mono text-sm text-accent-600">v{{ version.version }}</span>
          <div class="flex-1"><p class="text-sm text-foreground">{{ version.label || t('vault.untitled') }}</p><p class="mt-1 text-xs text-surface-500">{{ formatDate(version.created_at, { dateStyle: 'medium', timeStyle: 'short' }) }} · {{ version.is_encrypted ? 'AES-256-GCM' : t('history.plain') }}</p></div>
          <button class="btn-secondary" :disabled="restoring === version.id" @click="restore(version.id)"><Icon name="hugeicons:rotate-ccw" class="w-4 h-4" />{{ t('history.restore') }}</button>
        </li>
      </ol>
      <p v-if="message" role="status" class="mt-4 text-sm" :class="failed ? 'text-red-600' : 'text-accent-600'">{{ message }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { t } = useLang()
const { formatDate } = useDateFormat()
const { items, fetchItems } = useVault()
const itemOptions = computed(() => [
  { value: '', label: t('history.selectPlaceholder') },
  ...items.value.map(item => ({ value: item.id, label: item.label || item.type })),
])
const selectedId = ref(''), versions = ref<any[]>([]), loading = ref(false), restoring = ref(''), message = ref(''), failed = ref(false)
async function loadHistory() { if (!selectedId.value) return; loading.value = true; try { const data: { history: any[] } = await $fetch(`/api/vault/${selectedId.value}/history`); versions.value = data.history } finally { loading.value = false } }
async function restore(historyId: string) { restoring.value = historyId; message.value = ''; failed.value = false; try { await $fetch(`/api/vault/${selectedId.value}/restore`, { method: 'POST', body: { history_id: historyId } }); message.value = t('history.restored'); await Promise.all([loadHistory(), fetchItems()]) } catch { failed.value = true; message.value = t('history.failed') } finally { restoring.value = '' } }
watch(selectedId, loadHistory)
onMounted(fetchItems)
</script>
