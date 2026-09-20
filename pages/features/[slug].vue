<template>
  <div>
    <UiPublicNav />

    <main v-if="feature" class="mx-auto w-full max-w-[76rem] px-6 py-14 md:px-10 md:py-20">
      <NuxtLink to="/features" class="btn-secondary">
        <Icon name="hugeicons:arrow-left-01" class="h-4 w-4" />
        {{ t('featuresIndex.back') }}
      </NuxtLink>

      <div class="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <section>
          <span class="grid h-11 w-11 place-items-center rounded-lg bg-accent-500/10 text-accent-600">
            <Icon :name="feature.icon" class="h-5 w-5" />
          </span>
          <h1 class="mt-4 font-display text-4xl font-semibold tracking-tight text-surface-50 md:text-5xl">{{ feature.title }}</h1>
          <p class="mt-4 max-w-2xl text-lg leading-relaxed text-surface-500">{{ feature.summary }}</p>

          <ul class="mt-8 space-y-4">
            <li v-for="point in feature.points" :key="point" class="flex items-start gap-3 text-surface-300">
              <Icon name="hugeicons:check" class="mt-1 h-4 w-4 flex-none text-accent-600" />
              <span>{{ point }}</span>
            </li>
          </ul>
        </section>

        <aside class="card h-fit p-5 md:p-6">
          <h2 class="font-display text-lg font-semibold text-surface-50">{{ t('featuresIndex.relatedActions') }}</h2>
          <p class="mt-2 text-sm text-surface-500">{{ t('featuresIndex.whatYouGet') }}</p>
          <div class="mt-5 space-y-3">
            <NuxtLink v-if="feature.slug === 'recovery'" to="/dashboard/recovery-codes" class="btn-primary w-full">{{ t('featuresIndex.openRecoveryCodes') }}</NuxtLink>
            <NuxtLink v-else to="/auth/register" class="btn-primary w-full">{{ t('featuresIndex.createVault') }}</NuxtLink>
            <NuxtLink v-if="feature.slug === 'passwords'" to="/generateur-mot-de-passe" class="btn-secondary w-full">{{ t('featuresIndex.useGenerator') }}</NuxtLink>
          </div>
        </aside>
      </div>
    </main>

    <main v-else class="mx-auto w-full max-w-[64rem] px-6 py-20 md:px-10">
      <NuxtLink to="/features" class="btn-secondary">
        <Icon name="hugeicons:arrow-left-01" class="h-4 w-4" />
        {{ t('featuresIndex.back') }}
      </NuxtLink>
      <section class="card mt-6 p-6">
        <h1 class="font-display text-2xl font-semibold text-surface-50">{{ t('featuresIndex.notFound') }}</h1>
        <p class="mt-2 text-surface-500">{{ t('featuresIndex.notFoundDesc') }}</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

definePageMeta({ layout: 'default' })

const { t } = useLang()
const route = useRoute()
const { getFeature } = useFeatureCatalog()
const feature = computed(() => getFeature(String(route.params.slug)))

useSeoMeta({
  title: feature.value ? `${feature.value.title} - QVault` : 'QVault',
  description: feature.value?.summary || t('featuresIndex.seoDesc'),
})
</script>
