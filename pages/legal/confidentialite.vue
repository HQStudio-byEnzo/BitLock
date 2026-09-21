<template>
  <div>
    <UiPublicNav />
    <main class="legal-shell">
      <header class="space-y-3">
        <p class="eyebrow">{{ t('legal.privacy.badge') }}</p>
        <h1 class="text-3xl font-bold text-foreground">{{ t('legal.privacy.titlePage') }}</h1>
        <p class="text-sm text-surface-500">{{ t('legal.privacy.updated') }}</p>
      </header>

      <section class="legal-card">
        <p>{{ t('legal.privacy.intro') }}</p>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.privacy.controllerTitle') }}</h2>
          <p>{{ t('legal.privacy.controllerDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.privacy.zeroTitle') }}</h2>
          <p>{{ t('legal.privacy.zeroDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.privacy.dataTitle') }}</h2>
          <p>{{ t('legal.privacy.dataDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.privacy.basisTitle') }}</h2>
          <p>{{ t('legal.privacy.basisDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.privacy.hostingTitle') }}</h2>
          <p>{{ t('legal.privacy.hostingDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.privacy.retentionTitle') }}</h2>
          <p>{{ t('legal.privacy.retentionDesc') }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">{{ t('legal.privacy.rightsTitle') }}</h2>
          <p>{{ t('legal.privacy.rightsDesc') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'default' })

const { t } = useLang()
useSeoMeta({ title: t('legal.privacy.titlePage') })
</script>
