<template>
  <main class="support-page">
    <UiPublicNav />

    <section class="support-hero">
      <div>
        <p class="eyebrow">{{ t('sidebar.support') }}</p>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.subtitle }}</p>
      </div>
      <dl class="support-contract" aria-label="Contrat de confidentialité">
        <div>
          <dt>Coffre</dt>
          <dd>{{ copy.noVault }}</dd>
        </div>
        <div>
          <dt>Confidentialité</dt>
          <dd>{{ copy.noTracking }}</dd>
        </div>
        <div>
          <dt>Choix</dt>
          <dd>{{ copy.voluntary }}</dd>
        </div>
      </dl>
    </section>

    <section id="partners" class="support-partners scroll-mt-8">
      <header>
        <h2>{{ copy.partnersTitle }}</h2>
        <p>{{ copy.partnersDescription }}</p>
      </header>

      <div v-if="pending" class="support-status" role="status">
        <Icon name="hugeicons:loader-circle" class="h-5 w-5 animate-spin" />
        <span>{{ copy.loading }}</span>
      </div>

      <div v-else-if="entries.length" class="support-list">
        <article v-for="entry in entries" :key="entry.id" class="support-row">
          <span class="support-row__kind">
            {{ entry.kind === 'sponsor' ? copy.sponsor : copy.affiliate }}
          </span>
          <div>
            <h3>{{ entry.title }}</h3>
            <p>{{ entry.description }}</p>
            <small>{{ entry.disclosure }}</small>
          </div>
          <a
            :href="entry.url"
            target="_blank"
            rel="sponsored noopener noreferrer"
            class="btn-secondary"
          >
            {{ entry.kind === 'sponsor' ? copy.watch : copy.open }}
            <Icon name="hugeicons:external-link" class="h-4 w-4" />
          </a>
        </article>
      </div>

      <div v-else class="support-empty">
        <Icon name="hugeicons:badge-info" class="h-6 w-6" />
        <div>
          <h3>{{ copy.emptyTitle }}</h3>
          <p>{{ copy.emptyDescription }}</p>
        </div>
      </div>
    </section>

    <section id="transparency" class="support-transparency scroll-mt-8">
      <div>
        <h2>{{ copy.transparencyTitle }}</h2>
        <p>{{ copy.transparencyDescription }}</p>
      </div>
      <ul>
        <li><Icon name="hugeicons:shield-check" class="h-5 w-5" /> {{ copy.ruleOne }}</li>
        <li><Icon name="hugeicons:mouse-pointer-click" class="h-5 w-5" /> {{ copy.ruleTwo }}</li>
        <li><Icon name="hugeicons:circle-dollar-sign" class="h-5 w-5" /> {{ copy.ruleThree }}</li>
      </ul>
    </section>

    <footer class="support-footer">
      <p>QVault · {{ copy.voluntary }}</p>
      <nav aria-label="Liens de pied de page">
        <NuxtLink to="/">{{ copy.home }}</NuxtLink>
        <NuxtLink to="/guides">{{ t('nav.guides') }}</NuxtLink>
        <NuxtLink to="/legal/confidentialite">{{ t('footer.privacy') }}</NuxtLink>
        <a
          href="https://github.com/HQStudio-byEnzo/BitLock"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('footer.sourceCode') }}
        </a>
      </nav>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import type { SupportEntry } from '~/server/utils/support-catalog'

definePageMeta({ layout: 'default' })

const { t, locale } = useLang()
const { loggedIn } = useUserSession()
const { data, pending } = await useFetch<{ entries: SupportEntry[] }>('/api/support/catalog')
const entries = computed(() => data.value?.entries || [])

const copy = computed(() => locale.value === 'fr' ? {
  navLabel: 'Navigation Support',
  title: 'Soutenir QVault sans entrer dans votre coffre.',
  subtitle: 'Regardez un contenu sponsorisé ou utilisez un lien affilié seulement si vous le souhaitez. Le coffre reste isolé de cette page.',
  noVault: 'Aucun accès aux secrets',
  noTracking: 'Aucun tracker tiers',
  voluntary: 'Ouverture volontaire',
  partnersTitle: 'Partenaires configurés',
  partnersDescription: 'Chaque destination est externe, annoncée clairement et ouverte uniquement après votre action.',
  loading: 'Lecture du catalogue…',
  sponsor: 'Sponsor',
  affiliate: 'Affiliation',
  watch: 'Voir le sponsor',
  open: 'Voir l’offre',
  emptyTitle: 'Aucun partenaire actif.',
  emptyDescription: 'QVault n’affiche pas de lien de démonstration. Cette section sera activée quand un vrai partenaire aura été vérifié.',
  transparencyTitle: 'Le coffre ne finance pas sa sécurité avec vos données.',
  transparencyDescription: 'La monétisation reste sur cette page publique et ne modifie ni le chiffrement ni le fonctionnement du coffre.',
  ruleOne: 'Aucun contenu publicitaire dans le coffre ou les écrans d’authentification.',
  ruleTwo: 'Aucune ouverture automatique, lecture forcée ou redirection cachée.',
  ruleThree: 'Les commissions éventuelles sont signalées avant le clic.',
  home: 'Accueil',
} : {
  navLabel: 'Support navigation',
  title: 'Support QVault without entering your vault.',
  subtitle: 'Watch sponsored content or use an affiliate link only when you choose to. The vault stays isolated from this page.',
  noVault: 'No access to secrets',
  noTracking: 'No third-party tracker',
  voluntary: 'Voluntary opening',
  partnersTitle: 'Configured partners',
  partnersDescription: 'Every destination is external, clearly disclosed, and opened only after your action.',
  loading: 'Reading catalog…',
  sponsor: 'Sponsor',
  affiliate: 'Affiliate',
  watch: 'View sponsor',
  open: 'View offer',
  emptyTitle: 'No active partner.',
  emptyDescription: 'QVault does not display placeholder links. This section activates after a real partner has been reviewed.',
  transparencyTitle: 'Your data does not pay for vault security.',
  transparencyDescription: 'Monetization stays on this public page and never changes encryption or dashboard behavior.',
  ruleOne: 'No ads inside the vault or authentication screens.',
  ruleTwo: 'No automatic opening, forced playback, or hidden redirect.',
  ruleThree: 'Any potential commission is disclosed before the click.',
  home: 'Home',
})
</script>

<style scoped>
.support-page {
  margin-inline: auto;
  max-width: 100rem;
  min-width: 0;
}

.support-hero,
.support-partners,
.support-transparency {
  padding-inline: clamp(var(--space-control), 5vw, var(--space-page));
}

.support-hero {
  display: grid;
  gap: var(--space-page);
  padding-block: clamp(var(--space-page), 10vw, calc(var(--space-page) * 2));
}

.support-hero h1 {
  font-size: clamp(2.5rem, 7vw, 5.25rem);
  margin-block: var(--space-group);
  max-width: 12ch;
}

.support-hero p:not(.eyebrow) {
  color: var(--color-text-muted);
  max-width: 62ch;
}

.support-contract {
  border-block: 1px solid var(--color-rule);
}

.support-contract div {
  display: grid;
  gap: var(--space-tight);
  padding-block: var(--space-group);
}

.support-contract div + div {
  border-top: 1px solid var(--color-rule);
}

.support-contract dt,
.support-row__kind {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.support-contract dd {
  color: var(--color-ink);
  font-weight: 650;
}

.support-partners {
  padding-block: var(--space-page);
}

.support-partners > header {
  display: grid;
  gap: var(--space-group);
  margin-bottom: var(--space-section);
}

.support-partners h2,
.support-transparency h2 {
  font-size: clamp(1.75rem, 4vw, 3rem);
}

.support-partners header p,
.support-transparency p,
.support-row p,
.support-empty p {
  color: var(--color-text-muted);
  max-width: 65ch;
}

.support-list {
  border-top: 1px solid var(--color-rule-strong);
}

.support-row {
  align-items: start;
  border-bottom: 1px solid var(--color-rule);
  display: grid;
  gap: var(--space-group);
  padding-block: var(--space-section);
}

.support-row h3,
.support-empty h3 {
  font-size: 1.15rem;
  margin-bottom: var(--space-tight);
}

.support-row small {
  color: var(--color-text-faint);
  display: block;
  font-family: var(--font-mono);
  margin-top: var(--space-tight);
}

.support-row .btn-secondary {
  justify-self: start;
}

.support-empty,
.support-status {
  align-items: flex-start;
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  color: var(--color-ink);
  display: flex;
  gap: var(--space-group);
  padding: var(--space-section);
}

.support-transparency {
  display: grid;
  gap: var(--space-page);
  padding-block: clamp(var(--space-page), 9vw, calc(var(--space-page) * 1.5));
}

.support-transparency p {
  margin-top: var(--space-group);
}

.support-transparency ul {
  border-block: 1px solid var(--color-rule);
}

.support-transparency li {
  align-items: flex-start;
  display: flex;
  gap: var(--space-group);
  padding-block: var(--space-group);
}

.support-transparency li + li {
  border-top: 1px solid var(--color-rule);
}

.support-transparency li svg {
  color: var(--color-accent);
  flex: none;
}

@media (min-width: 60rem) {
  .support-hero {
    grid-template-columns: minmax(0, 1.45fr) minmax(20rem, 0.55fr);
  }

  .support-row {
    grid-template-columns: 8rem minmax(0, 1fr) auto;
  }

  .support-partners > header,
  .support-transparency {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  }
}

.support-footer {
  align-items: center;
  border-top: 1px solid var(--color-rule);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: space-between;
  margin-top: var(--space-page);
  padding: var(--space-8) clamp(var(--space-control), 5vw, var(--space-page));
}

.support-footer p {
  color: var(--color-text-faint);
  font-size: 0.8125rem;
}

.support-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
}

.support-footer a {
  align-items: center;
  color: var(--color-text-muted);
  display: inline-flex;
  font-size: 0.875rem;
  min-height: 1.5rem;
  text-decoration: none;
}

.support-footer a:hover {
  color: var(--color-ink);
}
</style>
