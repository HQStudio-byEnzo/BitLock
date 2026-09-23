<template>
  <div>
    <UiPublicNav />
    <main class="legal-shell">
      <div class="mb-12">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6 text-accent-text hover:text-accent-text-strong">
          <Icon name="hugeicons:arrow-left-01" class="w-4 h-4" />
          <span>{{ t('common.back') }}</span>
        </NuxtLink>
        <h1 class="text-4xl font-bold text-foreground mb-2">{{ t('legal.notices.title') }}</h1>
      </div>

      <div class="space-y-6 text-surface-300">
        <section class="legal-card">
          <h2 class="text-2xl font-semibold text-foreground mb-4">1. Website publisher</h2>
          <p>QVault is published by Enzo Izinga, acting as an individual on behalf of HQ Studio.</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li><strong>Contact:</strong> <a href="mailto:enzoizinga23@gmail.com" class="text-accent-text hover:text-accent-text-strong">enzoizinga23@gmail.com</a></li>
          </ul>
        </section>

        <section class="legal-card">
          <h2 class="text-2xl font-semibold text-foreground mb-4">2. Online hosting</h2>
          <p>QVault is deployed on Vercel. Encrypted application data is stored in a Turso database.</p>
        </section>

        <section class="legal-card">
          <h2 class="text-2xl font-semibold text-foreground mb-4">3. Data storage</h2>
          <p>Vault secrets are encrypted in the browser before synchronization. Turso stores ciphertext and account metadata.</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'default' })
const { t } = useLang()
useSeoMeta({ title: t('legal.notices.title'), description: t('legal.notices.seoDesc') })
</script>
