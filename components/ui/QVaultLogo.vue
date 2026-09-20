<template>
  <span class="inline-flex shrink-0 items-center justify-center" :aria-label="alt" role="img">
    <img :src="'/qvault-mark.png'" :width="resolvedSize" :height="resolvedSize" alt="" class="qvault-logo__img" />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  size?: number
  alt?: string
}>()

const resolvedSize = computed(() => props.size ?? 64)
const alt = computed(() => props.alt ?? 'QVault')
</script>

<style scoped>
.qvault-logo__img {
  display: block;
  height: auto;
  object-fit: contain;
}
</style>
