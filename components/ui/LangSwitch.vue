<template>
  <button
    type="button"
    @click="toggle"
    class="icon-button text-[11px] font-mono"
    :aria-label="locale === 'fr' ? 'FR, switch to English' : 'EN, passer en français'"
  >
    <Icon name="hugeicons:languages" class="w-4 h-4" />
    <span>{{ locale === 'fr' ? 'FR' : 'EN' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

const { locale, setLocale } = useLang()

function toggle() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr')
}
</script>
