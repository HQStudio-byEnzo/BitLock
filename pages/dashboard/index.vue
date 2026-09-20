<template>
  <div class="mx-auto w-full max-w-[72rem] space-y-8 px-6 py-8 md:px-10 md:py-10">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h1 class="font-display text-3xl font-semibold tracking-tight text-surface-50 md:text-4xl">
          {{ t('dash.commandWelcome') }} {{ user?.username || t('dash.commandFallback') }},
        </h1>
        <p class="mt-2 max-w-xl text-surface-500">{{ t('dash.commandDesc') }}</p>
      </div>
      <NuxtLink to="/dashboard/vault" class="btn-primary shrink-0">
        <Icon name="lucide:vault" class="h-4 w-4" />
        {{ t('dash.openVault') }}
      </NuxtLink>
    </header>

    <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <article v-for="metric in metrics" :key="metric.label" class="card p-5">
        <p class="text-sm text-surface-500">{{ metric.label }}</p>
        <p class="mt-1 font-display text-3xl font-semibold text-surface-50">{{ metric.value }}</p>
        <p class="mt-1 text-xs text-surface-400">{{ metric.note }}</p>
      </article>
    </section>

    <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <section class="card flex flex-col p-5 md:p-6">
        <header class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-lg font-semibold text-surface-50">{{ t('dash.recentTitle') }}</h2>
          <NuxtLink to="/dashboard/vault" class="text-sm font-medium text-accent-600 hover:text-accent-700">{{ t('dash.viewAll') }}</NuxtLink>
        </header>

        <div v-if="loading" class="space-y-3">
          <span v-for="index in 3" :key="index" class="block h-12 animate-pulse rounded-lg bg-surface-900" />
        </div>
        <ul v-else-if="recentItems.length" class="divide-y divide-border">
          <li v-for="item in recentItems" :key="item.id">
            <NuxtLink to="/dashboard/vault" class="flex items-center gap-3 py-3 transition-colors hover:text-accent-600">
              <span class="grid h-9 w-9 flex-none place-items-center rounded-lg bg-accent-500/10 text-accent-600">
                <Icon :name="typeIcon(item.type)" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <strong class="block truncate text-sm font-medium text-surface-50">{{ item.label || t('vault.untitled') }}</strong>
                <small class="text-xs text-surface-500">{{ typeLabel(item.type) }} · {{ formatDate(item.updated_at || item.created_at) }}</small>
              </span>
              <Icon name="lucide:chevron-right" class="h-4 w-4 flex-none text-surface-400" />
            </NuxtLink>
          </li>
        </ul>
        <div v-else class="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
          <span class="grid h-12 w-12 place-items-center rounded-full bg-surface-900 text-surface-500">
            <Icon name="lucide:archive" class="h-5 w-5" />
          </span>
          <div>
            <p class="font-medium text-surface-50">{{ t('dash.emptyTitle') }}</p>
            <p class="text-sm text-surface-500">{{ t('dash.emptyDesc') }}</p>
          </div>
          <NuxtLink to="/dashboard/vault" class="btn-secondary">{{ t('dash.emptyAction') }}</NuxtLink>
        </div>
      </section>

      <section class="card flex flex-col p-5 md:p-6">
        <header class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-lg font-semibold text-surface-50">{{ t('dash.healthTitle') }}</h2>
          <span class="tech-status">{{ healthState }}</span>
        </header>

        <dl class="space-y-1">
          <div class="flex items-center justify-between border-b border-border py-3">
            <dt class="text-sm text-surface-500">{{ t('dash.encryptedSecrets') }}</dt>
            <dd class="text-sm font-medium text-surface-50">{{ encryptedSecrets }} / {{ secretItems.length }}</dd>
          </div>
          <div class="flex items-center justify-between border-b border-border py-3">
            <dt class="text-sm text-surface-500">{{ t('dash.itemsToReview') }}</dt>
            <dd class="text-sm font-medium text-surface-50">{{ reviewItems }}</dd>
          </div>
          <div class="flex items-center justify-between py-3">
            <dt class="text-sm text-surface-500">{{ t('dash.localDatabase') }}</dt>
            <dd class="text-sm font-medium text-surface-50">{{ t('dash.localDatabaseValue') }}</dd>
          </div>
        </dl>

        <NuxtLink to="/dashboard/audit" class="btn-secondary mt-auto w-full">
          <Icon name="lucide:shield-check" class="h-4 w-4" />
          {{ t('dash.runAudit') }}
        </NuxtLink>
      </section>

      <section class="card p-5 md:p-6 lg:col-span-2">
        <h2 class="mb-4 font-display text-lg font-semibold text-surface-50">{{ t('dash.captureTitle') }}</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <NuxtLink v-for="action in captureActions" :key="action.to" :to="action.to"
            class="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-accent-500/40 hover:bg-accent-500/5">
            <span class="grid h-10 w-10 flex-none place-items-center rounded-lg bg-accent-500/10 text-accent-600">
              <Icon :name="action.icon" class="h-5 w-5" />
            </span>
            <span class="min-w-0">
              <strong class="block text-sm font-medium text-surface-50">{{ action.title }}</strong>
              <small class="text-xs text-surface-500">{{ action.note }}</small>
            </span>
            <Icon name="lucide:plus" class="ml-auto h-4 w-4 text-surface-400" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VaultItem } from '~/composables/useVault'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { user } = useAuthClient()
const { t } = useLang()
const { formatDate } = useDateFormat()
const { items, stats, loading, fetchItems, fetchStats } = useVault()

const totalItems = computed(() => stats.value?.counts.total ?? items.value.length)
const secretItems = computed(() => items.value.filter(item => item.type !== 'link'))
const encryptedSecrets = computed(() => secretItems.value.filter(item => item.is_encrypted).length)
const reviewItems = computed(() => items.value.filter(item => (!item.is_encrypted && item.type !== 'link') || isStale(item)).length)
const recentItems = computed(() => [...items.value]
  .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
  .slice(0, 5))
const healthState = computed(() => reviewItems.value > 0 ? t('dash.review') : t('dash.nominal'))

const metrics = computed(() => [
  { label: t('dash.totalItems'), value: totalItems.value, note: t('dash.totalItemsNote') },
  { label: t('dash.encryptedSecrets'), value: encryptedSecrets.value, note: t('dash.encryptedSecretsNote') },
  { label: t('dash.favorites'), value: stats.value?.counts.favorites || 0, note: t('dash.favoritesNote') },
  { label: t('dash.itemsToReview'), value: reviewItems.value, note: t('dash.itemsToReviewNote') },
])

const captureActions = computed(() => [
  { to: '/dashboard/passwords', icon: 'lucide:key-round', title: t('dash.addPassword'), note: t('dash.capturePasswordNote') },
  { to: '/dashboard/links', icon: 'lucide:link', title: t('dash.addLink'), note: t('dash.captureLinkNote') },
  { to: '/dashboard/notes', icon: 'lucide:notebook-pen', title: t('dash.addNote'), note: t('dash.captureNoteNote') },
  { to: '/dashboard/totp', icon: 'lucide:shield-check', title: t('dash.addTotp'), note: t('dash.captureTotpNote') },
])

function isStale(item: VaultItem) {
  const date = new Date(item.updated_at || item.created_at).getTime()
  return Number.isFinite(date) && Date.now() - date > 180 * 24 * 60 * 60 * 1000
}

const TYPE_ICONS: Record<VaultItem['type'], string> = {
  link: 'lucide:link',
  password: 'lucide:key-round',
  crypto: 'lucide:bitcoin',
  recovery: 'lucide:life-buoy',
  note: 'lucide:notebook-pen',
  totp: 'lucide:shield-check',
}

const typeLabels = computed<Record<VaultItem['type'], string>>(() => ({
  link: t('dash.links'),
  password: t('dash.passwords'),
  crypto: t('dash.crypto'),
  recovery: t('dash.recovery'),
  note: t('dash.notes'),
  totp: t('dash.totp'),
}))

function typeIcon(type: VaultItem['type']) {
  return TYPE_ICONS[type]
}

function typeLabel(type: VaultItem['type']) {
  return typeLabels.value[type]
}

onMounted(() => Promise.all([fetchItems(), fetchStats()]))
</script>
