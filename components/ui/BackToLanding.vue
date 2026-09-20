<template>
  <NuxtLink
    v-if="showButton"
    to="/"
    class="fixed left-4 top-4 z-[100] icon-button md:left-6 md:top-6"
    aria-label="Return to landing page"
  >
    <UiQVaultLogo :size="26" />
  </NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute()

const showButton = computed(() => route.path !== '/' && route.meta.hideFloatingBrand !== true)
</script>
