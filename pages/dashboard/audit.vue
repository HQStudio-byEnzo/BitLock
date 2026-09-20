<template>
  <div class="section-shell max-w-7xl py-10 md:py-16 space-y-6">
    <section class="hero-panel space-y-3">
      <p class="eyebrow">{{ t('sidebar.audit') }}</p>
      <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">{{ t('audit.title') }}</h1>
      <p class="text-surface-300 text-base md:text-lg max-w-3xl leading-relaxed">{{ t('audit.subtitle') }}</p>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="glass-panel p-5">
        <p class="text-xs text-surface-500 mb-2">{{ t('audit.score') }}</p>
        <p class="text-3xl font-bold" :class="scoreColor">{{ securityScore }}%</p>
      </div>
      <div class="glass-panel p-5">
        <p class="text-xs text-surface-500 mb-2">{{ t('audit.highAlerts') }}</p>
        <p class="text-3xl font-bold text-red-600">{{ highIssues.length }}</p>
      </div>
      <div class="glass-panel p-5">
        <p class="text-xs text-surface-500 mb-2">{{ t('audit.toFix') }}</p>
        <p class="text-3xl font-bold text-amber-500">{{ mediumIssues.length }}</p>
      </div>
      <div class="glass-panel p-5">
        <p class="text-xs text-surface-500 mb-2">{{ t('audit.elements') }}</p>
        <p class="text-3xl font-bold text-foreground">{{ items.length }}</p>
      </div>
    </div>

    <div class="glass-panel p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-accent-500/20 bg-accent-500/5">
      <Icon name="lucide:shield-check" class="w-5 h-5 text-accent-600 flex-shrink-0" />
      <p class="text-sm text-surface-400 flex-1">{{ t('audit.notice') }}</p>
      <button type="button" class="btn-secondary" :disabled="passwordAuditLoading" @click="runPasswordAudit">
        <Icon name="lucide:key-round" class="w-4 h-4" />
        {{ passwordAuditLoading ? t('audit.passwordAuditRunning') : t('audit.passwordAuditAction') }}
      </button>
    </div>

    <p v-if="passwordAuditMessage" class="text-sm" :class="passwordAuditError ? 'text-red-600' : 'text-green-700'" role="status">
      {{ passwordAuditMessage }}
    </p>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-6 h-6 text-accent-600 animate-spin" />
    </div>

    <div v-else-if="issues.length === 0" class="text-center py-16">
      <Icon name="lucide:shield-check" class="w-12 h-12 text-green-500 mx-auto mb-4" />
      <p class="text-surface-300 font-medium">{{ t('audit.empty') }}</p>
      <p class="text-sm text-surface-500 mt-1">{{ t('audit.emptyHint') }}</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="issue in issues"
        :key="issue.key"
        class="glass-panel p-4"
        :class="issue.severity === 'high' ? 'border-red-500/30' : issue.severity === 'medium' ? 'border-yellow-500/30' : 'border-surface-700'"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              :class="issue.severity === 'high' ? 'bg-red-500/10' : issue.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-surface-800'"
            >
              <Icon :name="issue.icon" class="w-5 h-5" :class="issue.severity === 'high' ? 'text-red-600' : issue.severity === 'medium' ? 'text-amber-500' : 'text-surface-400'" />
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">{{ issue.title }}</p>
              <p class="text-sm text-surface-400 mt-1">{{ issue.description }}</p>
              <p class="text-xs text-surface-500 mt-2">{{ issue.action }}</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="issue.severity === 'high' ? 'bg-red-500/10 text-red-600' : issue.severity === 'medium' ? 'bg-yellow-500/10 text-amber-500' : 'bg-surface-800 text-surface-400'">
            {{ severityLabel[issue.severity] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { parseEncryptedPayload } from '~/composables/useCrypto'
import type { VaultItem } from '~/composables/useVault'
import { parsePasswordEntry } from '~/utils/password-entry'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { t } = useLang()
const { items, loading, fetchItems, decryptItem } = useVault()
const { masterPassword, isUnlocked } = useMasterPassword()
const passwordAuditLoading = ref(false)
const passwordAuditMessage = ref('')
const passwordAuditError = ref(false)
const localPasswordIssues = ref<AuditIssue[]>([])

type Severity = 'high' | 'medium' | 'low'

interface AuditIssue {
  key: string
  severity: Severity
  icon: string
  title: string
  description: string
  action: string
}

const severityLabel = computed<Record<Severity, string>>(() => ({
  high: t('audit.severityHigh'),
  medium: t('audit.severityMedium'),
  low: t('audit.severityLow'),
}))

const issues = computed<AuditIssue[]>(() => {
  const result: AuditIssue[] = []
  const vaultItems = items.value
  const unencrypted = vaultItems.filter(item => !item.is_encrypted && item.type !== 'link')
  const invalidEncrypted = vaultItems.filter(item => item.is_encrypted && (!item.iv || !hasEncryptedPayload(item)))
  const passwordWithoutUrl = vaultItems.filter(item => item.type === 'password' && !item.url)
  const duplicateUrls = findDuplicates(vaultItems.filter(item => item.url), item => normalizeUrl(item.url || ''))
  const duplicateLabels = findDuplicates(vaultItems, item => item.label.trim().toLowerCase()).filter(group => group.key)
  const oldItems = vaultItems.filter(item => daysSince(item.updated_at || item.created_at) >= 180)

  if (unencrypted.length) {
    result.push({
      key: 'unencrypted',
      severity: 'high',
      icon: 'lucide:unlock',
      title: `${unencrypted.length} ${t('audit.unencryptedTitle')}`,
      description: t('audit.unencryptedDesc'),
      action: t('audit.unencryptedAction'),
    })
  }

  if (invalidEncrypted.length) {
    result.push({
      key: 'invalid-encrypted',
      severity: 'high',
      icon: 'lucide:file-warning',
      title: `${invalidEncrypted.length} ${t('audit.invalidTitle')}`,
      description: t('audit.invalidDesc'),
      action: t('audit.invalidAction'),
    })
  }

  if (passwordWithoutUrl.length) {
    result.push({
      key: 'password-missing-url',
      severity: 'medium',
      icon: 'lucide:link-2-off',
      title: `${passwordWithoutUrl.length} ${t('audit.noUrlTitle')}`,
      description: t('audit.noUrlDesc'),
      action: t('audit.noUrlAction'),
    })
  }

  duplicateUrls.forEach(group => {
    result.push({
      key: `duplicate-url-${group.key}`,
      severity: 'medium',
      icon: 'lucide:copy',
      title: `${group.items.length} ${t('audit.dupUrlTitle')} ${group.key}`,
      description: group.items.map(item => item.label || t('vault.untitled')).join(', '),
      action: t('audit.dupUrlDesc'),
    })
  })

  duplicateLabels.slice(0, 5).forEach(group => {
    result.push({
      key: `duplicate-label-${group.key}`,
      severity: 'low',
      icon: 'lucide:tags',
      title: `${group.items.length} ${t('audit.dupLabelTitle')}`,
      description: group.items.map(item => item.type).join(', '),
      action: t('audit.dupLabelAction'),
    })
  })

  if (oldItems.length) {
    result.push({
      key: 'old-items',
      severity: 'low',
      icon: 'lucide:calendar-clock',
      title: `${oldItems.length} ${t('audit.oldTitle')}`,
      description: t('audit.oldDesc'),
      action: t('audit.oldAction'),
    })
  }

  return [...result, ...localPasswordIssues.value]
})

const highIssues = computed(() => issues.value.filter(issue => issue.severity === 'high'))
const mediumIssues = computed(() => issues.value.filter(issue => issue.severity === 'medium'))

const securityScore = computed(() => {
  const penalty = issues.value.reduce((sum, issue) => sum + (issue.severity === 'high' ? 25 : issue.severity === 'medium' ? 12 : 5), 0)
  return Math.max(0, 100 - penalty)
})

const scoreColor = computed(() => {
  if (securityScore.value >= 80) return 'text-green-700'
  if (securityScore.value >= 55) return 'text-amber-500'
  return 'text-red-600'
})

function hasEncryptedPayload(item: VaultItem) {
  if (typeof item.payload !== 'string') return false
  try {
    parseEncryptedPayload(item.payload)
    return true
  } catch {
    return false
  }
}

function normalizeUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.toLowerCase()
  }
}

function daysSince(date: string | undefined) {
  if (!date) return 0
  const timestamp = new Date(date).getTime()
  if (Number.isNaN(timestamp)) return 0
  return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000))
}

function findDuplicates(itemsToGroup: VaultItem[], getKey: (item: VaultItem) => string) {
  const groups = new Map<string, VaultItem[]>()
  itemsToGroup.forEach(item => {
    const key = getKey(item)
    if (!key) return
    groups.set(key, [...(groups.get(key) || []), item])
  })

  return Array.from(groups.entries())
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({ key, items: group }))
}

function isWeakPassword(password: string) {
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(pattern => pattern.test(password)).length
  return password.length < 12 || variety < 3 || /(password|admin|qwerty|12345|qvault)/i.test(password)
}

async function runPasswordAudit() {
  passwordAuditMessage.value = ''
  passwordAuditError.value = false

  if (!isUnlocked.value || !masterPassword.value) {
    passwordAuditError.value = true
    passwordAuditMessage.value = t('audit.passwordAuditUnlock')
    return
  }

  passwordAuditLoading.value = true
  try {
    const passwordItems = items.value.filter(item => item.type === 'password' && item.is_encrypted)
    const decrypted: Array<{ item: VaultItem; password: string }> = []

    for (const item of passwordItems) {
      const plain = await decryptItem(item, masterPassword.value)
      decrypted.push({ item, password: parsePasswordEntry(plain).password })
    }

    const findings: AuditIssue[] = []
    const weak = decrypted.filter(entry => isWeakPassword(entry.password))
    const groups = new Map<string, VaultItem[]>()
    decrypted.forEach(({ item, password }) => groups.set(password, [...(groups.get(password) || []), item]))
    const reused = Array.from(groups.values()).filter(group => group.length > 1)

    if (weak.length) {
      findings.push({
        key: 'local-weak-passwords',
        severity: 'high',
        icon: 'lucide:key-round',
        title: t('audit.weakPasswordsTitle').replace('{count}', String(weak.length)),
        description: weak.map(entry => entry.item.label || t('vault.untitled')).join(', '),
        action: t('audit.weakPasswordsAction'),
      })
    }

    if (reused.length) {
      const affected = reused.reduce((sum, group) => sum + group.length, 0)
      findings.push({
        key: 'local-reused-passwords',
        severity: 'high',
        icon: 'lucide:copy-x',
        title: t('audit.reusedPasswordsTitle').replace('{count}', String(affected)),
        description: reused.flatMap(group => group.map(item => item.label || t('vault.untitled'))).join(', '),
        action: t('audit.reusedPasswordsAction'),
      })
    }

    localPasswordIssues.value = findings
    passwordAuditMessage.value = findings.length
      ? t('audit.passwordAuditFindings').replace('{count}', String(findings.length))
      : t('audit.passwordAuditClean')
  } catch {
    localPasswordIssues.value = []
    passwordAuditError.value = true
    passwordAuditMessage.value = t('audit.passwordAuditFailed')
  } finally {
    passwordAuditLoading.value = false
  }
}

onMounted(() => {
  fetchItems()
})
</script>
