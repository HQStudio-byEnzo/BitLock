<template>
  <div class="mx-auto w-full max-w-3xl space-y-8 px-6 py-8 md:px-10 md:py-10">
    <header>
      <p class="eyebrow">{{ t('sidebar.support') }}</p>
      <h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-surface-50 md:text-4xl">{{ copy.title }}</h1>
      <p class="mt-3 max-w-2xl text-surface-500">{{ copy.subtitle }}</p>
    </header>

    <section class="card space-y-4 p-5 md:p-6">
      <div>
        <h2 class="font-display text-lg font-semibold text-surface-50">{{ copy.partnersTitle }}</h2>
        <p class="mt-1 text-sm text-surface-500">{{ copy.partnersDescription }}</p>
      </div>

      <div v-if="pending" class="flex items-center gap-2 text-sm text-surface-500" role="status">
        <Icon name="hugeicons:loader-circle" class="h-4 w-4 animate-spin" />
        {{ copy.loading }}
      </div>

      <ul v-else-if="entries.length" class="divide-y divide-border">
        <li v-for="entry in entries" :key="entry.id" class="flex flex-wrap items-center gap-3 py-4">
          <span class="tech-status">{{ entry.kind === 'sponsor' ? copy.sponsor : copy.affiliate }}</span>
          <div class="min-w-0 flex-1">
            <strong class="block text-sm font-medium text-surface-50">{{ entry.title }}</strong>
            <p class="text-sm text-surface-500">{{ entry.description }}</p>
            <small class="text-xs text-surface-400">{{ entry.disclosure }}</small>
          </div>
          <a :href="entry.url" target="_blank" rel="sponsored noopener noreferrer" class="btn-secondary">
            {{ entry.kind === 'sponsor' ? copy.watch : copy.open }}
            <Icon name="hugeicons:external-link" class="h-4 w-4" />
          </a>
        </li>
      </ul>

      <div v-else class="flex items-start gap-3 rounded-lg bg-surface-900 p-4">
        <Icon name="hugeicons:badge-info" class="mt-0.5 h-5 w-5 flex-none text-surface-500" />
        <div>
          <strong class="block text-sm text-surface-50">{{ copy.emptyTitle }}</strong>
          <p class="text-sm text-surface-500">{{ copy.emptyDescription }}</p>
        </div>
      </div>
    </section>

    <section class="card space-y-4 p-5 md:p-6">
      <div>
        <h2 class="font-display text-lg font-semibold text-surface-50">{{ copy.transparencyTitle }}</h2>
        <p class="mt-1 text-sm text-surface-500">{{ copy.transparencyDescription }}</p>
      </div>
      <ul class="space-y-3">
        <li v-for="rule in copy.rules" :key="rule.text" class="flex items-start gap-3 text-sm text-surface-300">
          <Icon :name="rule.icon" class="mt-0.5 h-5 w-5 flex-none text-accent-text" />
          <span>{{ rule.text }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import type { SupportEntry } from '~/server/utils/support-catalog'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t, locale } = useLang()
const { data, pending } = await useFetch<{ entries: SupportEntry[] }>('/api/support/catalog')
const entries = computed(() => data.value?.entries || [])

const copy = computed(() => locale.value === 'fr' ? {
  title: 'Soutenir QVault sans entrer dans votre coffre.',
  subtitle: 'Regardez un contenu sponsorisé ou utilisez un lien affilié seulement si vous le souhaitez. Le coffre reste isolé de cette page.',
  partnersTitle: 'Partenaires configurés',
  partnersDescription: 'Chaque destination est externe, annoncée clairement et ouverte uniquement après votre action.',
  loading: 'Lecture du catalogue…',
  sponsor: 'Sponsor',
  affiliate: 'Affiliation',
  watch: 'Voir le sponsor',
  open: 'Voir l’offre',
  emptyTitle: 'Aucun partenaire actif.',
  emptyDescription: 'QVault n’affiche pas de lien de démonstration. Cette section s’active quand un vrai partenaire a été vérifié.',
  transparencyTitle: 'Le coffre ne finance pas sa sécurité avec vos données.',
  transparencyDescription: 'La monétisation reste sur cette page publique et ne modifie ni le chiffrement ni le fonctionnement du coffre.',
  rules: [
    { icon: 'hugeicons:shield-check', text: 'Aucun contenu publicitaire dans le coffre ou les écrans d’authentification.' },
    { icon: 'hugeicons:mouse-pointer-click', text: 'Aucune ouverture automatique, lecture forcée ou redirection cachée.' },
    { icon: 'hugeicons:circle-dollar-sign', text: 'Les commissions éventuelles sont signalées avant le clic.' },
  ],
} : {
  title: 'Support QVault without entering your vault.',
  subtitle: 'Watch sponsored content or use an affiliate link only when you choose to. The vault stays isolated from this page.',
  partnersTitle: 'Configured partners',
  partnersDescription: 'Every destination is external, clearly disclosed, and opened only after your action.',
  loading: 'Reading catalog…',
  sponsor: 'Sponsor',
  affiliate: 'Affiliate',
  watch: 'View sponsor',
  open: 'View offer',
  emptyTitle: 'No active partner.',
  emptyDescription: 'QVault shows no placeholder links. This section activates after a real partner has been reviewed.',
  transparencyTitle: 'Your data does not pay for vault security.',
  transparencyDescription: 'Monetization stays on the public page and never changes encryption or how the vault works.',
  rules: [
    { icon: 'hugeicons:shield-check', text: 'No ads inside the vault or authentication screens.' },
    { icon: 'hugeicons:mouse-pointer-click', text: 'No automatic opening, forced playback, or hidden redirect.' },
    { icon: 'hugeicons:circle-dollar-sign', text: 'Any potential commission is disclosed before the click.' },
  ],
})
</script>
