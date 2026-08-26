<template>
  <div class="command-dashboard">
    <header class="command-dashboard__head">
      <div>
        <p class="terminal-label">vault://overview</p>
        <h1>{{ t('dash.commandWelcome') }} {{ user?.username || t('dash.commandFallback') }}</h1>
        <p>{{ t('dash.commandDesc') }}</p>
      </div>
      <div class="command-dashboard__state">
        <span :class="['vault-state', { 'vault-state--open': isUnlocked }]">
          <Icon :name="isUnlocked ? 'lucide:lock-open' : 'lucide:lock-keyhole'" class="h-4 w-4" />
          {{ isUnlocked ? t('dash.unlocked') : t('dash.locked') }}
        </span>
        <NuxtLink to="/dashboard/vault" class="btn-primary">
          {{ t('dash.openVault') }}
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </header>

    <section class="vault-telemetry" :aria-label="t('dash.telemetry')">
      <div v-for="metric in metrics" :key="metric.label" class="vault-telemetry__item">
        <span>{{ metric.code }} / {{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.note }}</small>
      </div>
    </section>

    <div class="command-dashboard__grid">
      <section class="dashboard-console dashboard-console--activity">
        <header class="dashboard-console__head">
          <div>
            <p class="terminal-label">{{ t('dash.recentLabel') }}</p>
            <h2>{{ t('dash.recentTitle') }}</h2>
          </div>
          <NuxtLink to="/dashboard/vault" class="text-command">{{ t('dash.viewAll') }} →</NuxtLink>
        </header>

        <div v-if="loading" class="dashboard-skeleton" aria-label="Loading">
          <span v-for="index in 4" :key="index" />
        </div>
        <div v-else-if="recentItems.length" class="activity-log">
          <NuxtLink v-for="item in recentItems" :key="item.id" to="/dashboard/vault" class="activity-log__row">
            <span class="activity-log__type"><Icon :name="typeIcon(item.type)" class="h-4 w-4" /></span>
            <span class="activity-log__copy">
              <strong>{{ item.label }}</strong>
              <small>{{ typeLabel(item.type) }} · {{ formatDate(item.updated_at || item.created_at) }}</small>
            </span>
            <span :class="['activity-log__security', { 'activity-log__security--plain': !item.is_encrypted }]">
              {{ item.is_encrypted ? t('dash.encrypted') : t('dash.plain') }}
            </span>
          </NuxtLink>
        </div>
        <div v-else class="dashboard-empty">
          <Icon name="lucide:archive" class="h-6 w-6" />
          <div>
            <strong>{{ t('dash.emptyTitle') }}</strong>
            <p>{{ t('dash.emptyDesc') }}</p>
          </div>
          <NuxtLink to="/dashboard/vault" class="btn-secondary">{{ t('dash.emptyAction') }}</NuxtLink>
        </div>
      </section>

      <section class="dashboard-console dashboard-console--capture">
        <header class="dashboard-console__head">
          <div>
            <p class="terminal-label">{{ t('dash.captureLabel') }}</p>
            <h2>{{ t('dash.captureTitle') }}</h2>
          </div>
        </header>
        <nav class="capture-list" :aria-label="t('dash.captureTitle')">
          <NuxtLink v-for="action in captureActions" :key="action.to" :to="action.to">
            <Icon :name="action.icon" class="h-5 w-5" />
            <span><strong>{{ action.title }}</strong><small>{{ action.note }}</small></span>
            <span aria-hidden="true">+</span>
          </NuxtLink>
        </nav>
      </section>

      <section class="dashboard-console dashboard-console--health">
        <header class="dashboard-console__head">
          <div>
            <p class="terminal-label">{{ t('dash.healthLabel') }}</p>
            <h2>{{ t('dash.healthTitle') }}</h2>
          </div>
          <span class="health-readout">{{ healthState }}</span>
        </header>
        <dl class="health-table">
          <div>
            <dt>{{ t('dash.encryptedSecrets') }}</dt>
            <dd>{{ encryptedSecrets }} / {{ secretItems.length }}</dd>
          </div>
          <div>
            <dt>{{ t('dash.itemsToReview') }}</dt>
            <dd>{{ reviewItems }}</dd>
          </div>
          <div>
            <dt>{{ t('dash.localDatabase') }}</dt>
            <dd>{{ t('dash.localDatabaseValue') }}</dd>
          </div>
        </dl>
        <NuxtLink to="/dashboard/audit" class="dashboard-console__action">
          <Icon name="lucide:scan-search" class="h-4 w-4" />
          {{ t('dash.runAudit') }}
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </section>

      <section class="dashboard-console dashboard-console--tools">
        <header class="dashboard-console__head">
          <div>
            <p class="terminal-label">{{ t('dash.toolLabel') }}</p>
            <h2>{{ t('dash.toolTitle') }}</h2>
          </div>
        </header>
        <nav class="utility-grid" :aria-label="t('dash.toolTitle')">
          <NuxtLink v-for="tool in utilityActions" :key="tool.to" :to="tool.to">
            <Icon :name="tool.icon" class="h-5 w-5" />
            <span>{{ tool.title }}</span>
            <small>{{ tool.command }}</small>
          </NuxtLink>
        </nav>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VaultItem } from '~/composables/useVault'
import { useLang } from '~/composables/useI18n'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { user } = useAuthClient()
const { t, locale } = useLang()
const { isUnlocked } = useMasterPassword()
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
  { code: '01', label: t('dash.totalItems'), value: totalItems.value, note: t('dash.totalItemsNote') },
  { code: '02', label: t('dash.encryptedSecrets'), value: encryptedSecrets.value, note: t('dash.encryptedSecretsNote') },
  { code: '03', label: t('dash.favorites'), value: stats.value?.counts.favorites || 0, note: t('dash.favoritesNote') },
  { code: '04', label: t('dash.itemsToReview'), value: reviewItems.value, note: t('dash.itemsToReviewNote') },
])

const captureActions = computed(() => [
  { to: '/dashboard/links', icon: 'lucide:link', title: t('dash.addLink'), note: t('dash.captureLinkNote') },
  { to: '/dashboard/passwords', icon: 'lucide:key-round', title: t('dash.addPassword'), note: t('dash.capturePasswordNote') },
  { to: '/dashboard/crypto', icon: 'lucide:bitcoin', title: t('dash.addCrypto'), note: t('dash.captureCryptoNote') },
  { to: '/dashboard/recovery-codes', icon: 'lucide:ticket-check', title: t('dash.addRecovery'), note: t('dash.captureRecoveryNote') },
])

const utilityActions = computed(() => [
  { to: '/dashboard/password-generator', icon: 'lucide:wand-sparkles', title: t('sidebar.passwordGenerator'), command: 'gen --password' },
  { to: '/dashboard/seed-generator', icon: 'lucide:binary', title: t('sidebar.seedGenerator'), command: 'gen --bip39' },
  { to: '/dashboard/audit', icon: 'lucide:shield-check', title: t('sidebar.audit'), command: 'audit --metadata' },
  { to: '/dashboard/export', icon: 'lucide:arrow-down-to-line', title: t('sidebar.export'), command: 'vault --transfer' },
])

function isStale(item: VaultItem) {
  const date = new Date(item.updated_at || item.created_at).getTime()
  return Number.isFinite(date) && Date.now() - date > 180 * 24 * 60 * 60 * 1000
}

const TYPE_ICONS: Record<VaultItem['type'], string> = {
  link: 'lucide:link',
  password: 'lucide:key-round',
  crypto: 'lucide:bitcoin',
  recovery: 'lucide:ticket-check',
  note: 'lucide:notebook-text',
  totp: 'lucide:clock',
}

const TYPE_LABELS: Record<VaultItem['type'], string> = {
  link: t('dash.links'),
  password: t('dash.passwords'),
  crypto: t('dash.crypto'),
  recovery: t('dash.recovery'),
  note: t('dash.notes'),
  totp: t('dash.totp'),
}

function typeIcon(type: VaultItem['type']) {
  return TYPE_ICONS[type]
}

function typeLabel(type: VaultItem['type']) {
  return TYPE_LABELS[type]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' }).format(new Date(value))
}

onMounted(() => Promise.all([fetchItems(), fetchStats()]))
</script>
