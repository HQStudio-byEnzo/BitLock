<template>
  <div>
    <UiPublicNav />

    <main class="guide-shell">
      <header class="guide-head">
        <p class="eyebrow">{{ ui.indexEyebrow }}</p>
        <h1 class="guide-title">{{ ui.indexTitle }}</h1>
        <p class="guide-lede">{{ ui.indexSubtitle }}</p>
      </header>

      <section class="guide-grid" :aria-label="ui.navLabel">
        <NuxtLink
          v-for="guide in list"
          :key="guide.slug"
          :to="`/guides/${guide.slug}`"
          class="card guide-card"
        >
          <span class="guide-card__icon" :data-accent="guide.accent">
            <Icon :name="guide.icon" class="h-5 w-5" />
          </span>
          <h2 class="guide-card__title">{{ guide.locale.h1 }}</h2>
          <p class="guide-card__desc">{{ guide.locale.description }}</p>
          <span class="guide-card__cta">
            {{ ui.readGuide }}
            <Icon name="hugeicons:arrow-right-01" class="h-4 w-4" />
          </span>
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { getGuides, guideUi } from '~/utils/guides'

definePageMeta({ layout: 'default' })

const { locale } = useLang()
const lang = locale.value === 'en' ? 'en' : 'fr'
const ui = guideUi[lang]
const list = getGuides().map(guide => ({
  slug: guide.slug,
  icon: guide.icon,
  accent: guide.accent,
  locale: guide[lang],
}))

useSeoMeta({
  title: ui.indexSeoTitle,
  description: ui.indexSubtitle,
})
</script>

<style scoped>
.guide-shell {
  margin-inline: auto;
  max-width: 68rem;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 5vw, 2.5rem);
}

.guide-head {
  max-width: 44rem;
}

.guide-title {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-top: var(--space-4);
}

.guide-lede {
  color: var(--color-text-muted);
  font-size: 1.0625rem;
  line-height: 1.6;
  margin-top: var(--space-4);
}

.guide-grid {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

.guide-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  text-decoration: none;
  transition: border-color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out);
}

.guide-card__icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-lg);
  color: var(--color-accent-strong);
  display: grid;
  height: 2.5rem;
  place-items: center;
  width: 2.5rem;
}

.guide-card__icon[data-accent='orange'] { background: oklch(0.72 0.16 60 / 0.14); color: oklch(0.78 0.16 60); }
.guide-card__icon[data-accent='amber'] { background: oklch(0.8 0.14 80 / 0.14); color: oklch(0.84 0.14 80); }
.guide-card__icon[data-accent='blue'] { background: var(--color-accent-soft); color: var(--color-accent-strong); }
.guide-card__icon[data-accent='emerald'] { background: oklch(0.72 0.15 149 / 0.14); color: oklch(0.78 0.15 149); }

.guide-card__title {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.3;
}

.guide-card__desc {
  color: var(--color-text-muted);
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.6;
}

.guide-card__cta {
  align-items: center;
  color: var(--color-accent-strong);
  display: inline-flex;
  font-size: 0.875rem;
  font-weight: 600;
  gap: var(--space-1);
}

@media (hover: hover) and (pointer: fine) {
  .guide-card:hover {
    border-color: var(--color-accent-rule);
    background: var(--color-panel-raised);
  }
}

@media (min-width: 48rem) {
  .guide-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
