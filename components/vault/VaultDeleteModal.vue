<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 modal-backdrop" @click="$emit('close')"></div>

      <div ref="dialogEl" tabindex="-1" class="relative w-full max-w-md modal-shell p-5 md:p-6 animate-scale-in outline-none" role="dialog" aria-modal="true" :aria-label="t('vault.deleteTitle')">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-foreground">{{ t('vault.deleteTitle') }}</h2>
          <button type="button" @click="$emit('close')" class="icon-button" :aria-label="t('vault.close')">
            <Icon name="hugeicons:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <p class="text-sm text-surface-300">
            {{ confirmText }}
          </p>

          <div v-if="item.is_encrypted" class="space-y-2">
            <label for="deleteMasterPassword" class="block text-sm font-medium text-surface-300">
              {{ t('vault.masterPwd') }}
            </label>
            <input
              id="deleteMasterPassword"
              v-model="secret"
              type="password"
              class="input-field"
              :placeholder="t('vault.deletePasswordPlaceholder')"
              autocomplete="current-password"
            />
          </div>

          <div v-if="displayError" role="alert" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {{ displayError }}
          </div>

          <div class="flex gap-3">
            <button type="button" @click="$emit('close')" class="btn-secondary flex-1">
              {{ t('vault.close') }}
            </button>
            <button type="button" @click="handleConfirm" class="btn-primary flex-1">
              {{ t('vault.deleteAction') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import type { VaultItem } from '~/composables/useVault'

const props = defineProps<{
  item: VaultItem
  errorMessage?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [secret: string]
}>()

const { t } = useLang()
const dialogEl = ref<HTMLElement | null>(null)
const secret = ref('')
const errorMsg = ref('')
useModalFocus(dialogEl, () => emit('close'))
const displayError = computed(() => props.errorMessage || errorMsg.value)
const confirmText = computed(() => {
  const label = props.item.label || t('vault.untitled')
  return t('vault.deletePrompt').replace('{label}', label)
})

function handleConfirm() {
  errorMsg.value = ''

  if (props.item.is_encrypted && !secret.value.trim()) {
    errorMsg.value = t('vault.deletePasswordRequired')
    return
  }

  emit('confirm', secret.value.trim())
}
</script>
