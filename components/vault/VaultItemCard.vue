<template>
  <div class="card-hover flex items-center gap-4 p-4">
    <!-- Type icon -->
    <div
      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
      :class="typeStyles.bg"
    >
      <Icon :name="typeStyles.icon" class="w-5 h-5" :class="typeStyles.text" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <p class="text-sm font-medium text-surface-200 truncate">
          {{ item.label || t('vault.untitled') }}
        </p>
        <span v-if="item.is_encrypted" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-500/10 text-accent-text border border-accent-500/20">
          <Icon name="hugeicons:lock" class="w-2.5 h-2.5" />
        </span>
      </div>
      <p class="text-xs text-surface-500 mt-0.5">
        {{ typeLabels[item.type] }} · {{ formatDate(item.created_at, { day: 'numeric', month: 'short', year: 'numeric' }) }}
      </p>
      <a
        v-if="safeUrl && !item.is_encrypted"
        :href="safeUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-accent-text hover:text-accent-text-strong truncate block mt-0.5"
      >
        {{ safeUrl }}
      </a>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1">
      <!-- Show/Decrypt button -->
      <button
        v-if="item.is_encrypted"
        @click="$emit('decrypt', item)"
        class="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-accent-text transition-colors"
        :title="t('vault.decrypt')"
        :aria-label="t('vault.decrypt')"
      >
        <Icon name="hugeicons:eye" class="w-4 h-4" />
      </button>
      
      <!-- Copy button (non-encrypted) -->
      <button
        v-else
        @click="copyPayload"
        class="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-green-700 transition-colors"
        :title="copied ? t('vault.copied') : t('vault.copy')"
        :aria-label="copied ? t('vault.copied') : t('vault.copy')"
      >
        <Icon :name="copied ? 'hugeicons:check' : 'hugeicons:copy'" class="w-4 h-4" />
      </button>

      <!-- Favorite -->
      <button
        @click="$emit('toggle-favorite')"
        class="p-2 rounded-lg hover:bg-surface-700 transition-colors"
        :class="item.favorite ? 'text-amber-500' : 'text-surface-400 hover:text-amber-500'"
        :aria-label="item.favorite ? t('vault.unfavorite') : t('vault.favorite')"
        :aria-pressed="item.favorite"
      >
        <Icon :name="item.favorite ? 'hugeicons:star' : 'hugeicons:star'" class="w-4 h-4" :class="item.favorite ? 'fill-current' : ''" />
      </button>

      <!-- Delete -->
      <button
        @click="$emit('delete', item)"
        class="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-red-600 transition-colors"
        :aria-label="t('vault.deleteAction')"
      >
        <Icon name="hugeicons:trash" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import type { VaultItem } from '~/composables/useVault'

const props = defineProps<{
  item: VaultItem
}>()

defineEmits<{
  'toggle-favorite': []
  'delete': [item: VaultItem]
  'decrypt': [item: VaultItem]
}>()

const { t } = useLang()
const { formatDate } = useDateFormat()
const { copySecurely } = useSecureClipboard()
const copied = ref(false)

const safeUrl = computed(() => {
  if (!props.item.url) return null
  try {
    const url = new URL(props.item.url)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
})

const typeLabels = computed(() => ({
  link: t('vault.typeLink'),
  password: t('vault.typePassword'),
  crypto: t('vault.typeCrypto'),
  recovery: t('sidebar.recoveryCode'),
  note: t('vault.typeNote'),
  totp: t('vault.typeTotp'),
}))

const typeStyles = computed(() => {
  switch (props.item.type) {
    case 'link':
      return { bg: 'bg-accent-500/10 border border-accent-500/20', icon: 'hugeicons:link', text: 'text-accent-text' }
    case 'password':
      return { bg: 'bg-accent-500/10 border border-accent-500/20', icon: 'hugeicons:key-round', text: 'text-accent-text' }
    case 'crypto':
      return { bg: 'bg-accent-500/10 border border-accent-500/20', icon: 'hugeicons:bitcoin', text: 'text-accent-text' }
    case 'recovery':
      return { bg: 'bg-accent-500/10 border border-accent-500/20', icon: 'hugeicons:ticket-check', text: 'text-accent-text' }
    case 'note':
      return { bg: 'bg-accent-500/10 border border-accent-500/20', icon: 'hugeicons:notebook-tabs', text: 'text-accent-text' }
    case 'totp':
      return { bg: 'bg-accent-500/10 border border-accent-500/20', icon: 'hugeicons:timer-reset', text: 'text-accent-text' }
    default:
      return { bg: 'bg-surface-700', icon: 'hugeicons:file-01', text: 'text-surface-400' }
  }
})

async function copyPayload() {
  try {
    await copySecurely(props.item.payload)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
  }
}
</script>
