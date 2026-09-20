<!-- QVault mark: a geometric Q whose counter holds a keyhole (vault + lock). -->
<template>
  <span class="inline-flex shrink-0 items-center justify-center text-accent-600" :aria-label="alt" role="img">
    <svg
      :width="resolvedSize"
      :height="resolvedSize"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <!-- Q ring -->
      <circle cx="32" cy="30" r="17" stroke="currentColor" stroke-width="5" />
      <!-- Keyhole: dial + stem -->
      <circle cx="32" cy="25" r="5" fill="currentColor" />
      <rect x="30" y="27.5" width="4" height="11" rx="2" fill="currentColor" />
      <!-- Q tail -->
      <path
        d="M39.5 37.5L49.5 49.5"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="round"
      />
    </svg>
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
