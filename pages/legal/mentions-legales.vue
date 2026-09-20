<template>
  <div>
    <UiPublicNav />
    <main class="legal-shell">
      <header class="space-y-3">
        <p class="eyebrow">{{ t('legal.mentions.badge') }}</p>
        <h1 class="text-3xl font-bold text-foreground">{{ t('legal.mentions.title') }}</h1>
      </header>

      <section class="legal-card">
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.mentions.publisherTitle') }}</h2>
          <p>{{ t('legal.mentions.publisherDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.mentions.hostingTitle') }}</h2>
          <p>{{ t('legal.mentions.hostingDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.mentions.dbTitle') }}</h2>
          <p>{{ t('legal.mentions.dbDesc') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'default' })

const { t } = useLang()
useSeoMeta({ title: `QVault - ${t('legal.mentions.title')}` })
</script>
