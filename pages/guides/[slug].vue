<template>
  <div>
    <UiPublicNav />

    <main class="guide-shell">
      <nav class="guide-crumbs" :aria-label="ui.navLabel">
        <NuxtLink to="/">QVault</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/guides">{{ ui.backToGuides }}</NuxtLink>
      </nav>

      <article>
        <header class="guide-head">
          <p class="eyebrow">{{ content.eyebrow }}</p>
          <h1 class="guide-title">{{ content.h1 }}</h1>
          <p class="guide-lede">{{ content.intro }}</p>
          <p class="guide-updated">{{ ui.updatedLabel }} {{ content.updated }}</p>
        </header>

        <section class="guide-toc card" :aria-label="ui.toc">
          <h2 class="guide-toc__title">{{ ui.toc }}</h2>
          <ol>
            <li v-for="section in content.sections" :key="section.heading">
              <a :href="`#${slugify(section.heading)}`">{{ section.heading }}</a>
            </li>
            <li v-if="content.faq.length"><a :href="'#faq'">{{ ui.faqTitle }}</a></li>
          </ol>
        </section>

        <section
          v-for="section in content.sections"
          :id="slugify(section.heading)"
          :key="section.heading"
          class="guide-section"
        >
          <h2>{{ section.heading }}</h2>
          <p v-for="(paragraph, index) in section.paragraphs" :key="`p-${index}`">{{ paragraph }}</p>
          <ul v-if="section.bullets">
            <li v-for="(bullet, index) in section.bullets" :key="`b-${index}`">{{ bullet }}</li>
          </ul>
          <div v-if="section.table" class="guide-table-wrap">
            <table class="guide-table">
              <thead>
                <tr><th v-for="header in section.table.headers" :key="header" scope="col">{{ header }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in section.table.rows" :key="`r-${index}`">
                  <td v-for="(cell, cellIndex) in row" :key="`c-${cellIndex}`">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="content.faq.length" id="faq" class="guide-section">
          <h2>{{ ui.faqTitle }}</h2>
          <div class="guide-faq">
            <details v-for="item in content.faq" :key="item.q">
              <summary>{{ item.q }}</summary>
              <p>{{ item.a }}</p>
            </details>
          </div>
        </section>

        <section class="guide-related">
          <h2>{{ ui.relatedTitle }}</h2>
          <div class="guide-related__grid">
            <NuxtLink v-for="link in relatedLinks" :key="link.to" :to="link.to" class="card guide-related__item">
              <span class="guide-related__icon"><Icon :name="link.icon" class="h-4 w-4" /></span>
              <span>{{ link.label }}</span>
            </NuxtLink>
          </div>
        </section>

        <section class="guide-cta">
          <div>
            <h2>{{ ui.ctaTitle }}</h2>
            <p>{{ ui.ctaDesc }}</p>
          </div>
          <NuxtLink to="/auth/register" class="btn-primary">{{ ui.ctaButton }}</NuxtLink>
        </section>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import { getGuide, getGuides, guideUi } from '~/utils/guides'

definePageMeta({ layout: 'default' })

const route = useRoute()
const locale = useLang().locale
const slug = String(route.params.slug)
const guide = getGuide(slug)
if (!guide) {
  throw createError({ statusCode: 404, statusMessage: 'Guide introuvable', fatal: true })
}

const ui = guideUi[locale.value === 'en' ? 'en' : 'fr']
const content = guide[locale.value === 'en' ? 'en' : 'fr']
const lang = locale.value === 'en' ? 'en' : 'fr'

const siteUrl = String(useRuntimeConfig().public.siteUrl || '').replace(/\/+$/, '')

const relatedLinks = computed(() => {
  const others = getGuides()
    .filter(entry => entry.slug !== slug)
    .slice(0, 2)
    .map(entry => ({ to: `/guides/${entry.slug}`, label: entry[lang].h1, icon: entry.icon }))

  const tools: Record<string, { to: string; label: string; icon: string }> = {
    seed: { to: '/generateur-seed-phrase', label: locale.value === 'en' ? 'Seed phrase generator' : 'Générateur de seed phrase', icon: 'hugeicons:list-ordered' },
    passwords: { to: '/audit-securite', label: locale.value === 'en' ? 'Password audit' : 'Audit de mot de passe', icon: 'hugeicons:shield-alert' },
    compare: { to: '/generateur-mot-de-passe', label: locale.value === 'en' ? 'Password generator' : 'Générateur de mot de passe', icon: 'hugeicons:sparkles' },
  }
  return [tools[guide.category], ...others]
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

useSeoMeta({
  title: content.title,
  description: content.description,
  ogType: 'article',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: content.h1,
        description: content.description,
        inLanguage: locale.value,
        datePublished: '2026-09-22',
        dateModified: '2026-09-22',
        mainEntityOfPage: `${siteUrl}/guides/${slug}`,
        author: { '@type': 'Organization', name: 'HQ Studio' },
        publisher: { '@type': 'Organization', name: 'QVault' },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'QVault', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: ui.backToGuides, item: `${siteUrl}/guides` },
          { '@type': 'ListItem', position: 3, name: content.h1, item: `${siteUrl}/guides/${slug}` },
        ],
      }),
    },
  ],
}))
</script>

<style scoped>
.guide-shell {
  margin-inline: auto;
  max-width: 52rem;
  padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 5vw, 2.5rem) clamp(3rem, 8vw, 6rem);
}

.guide-crumbs {
  align-items: center;
  color: var(--color-text-faint);
  display: flex;
  flex-wrap: wrap;
  font-size: 0.8125rem;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.guide-crumbs a { color: var(--color-text-muted); text-decoration: none; }
.guide-crumbs a:hover { color: var(--color-accent-strong); }

.guide-head { max-width: 44rem; }

.guide-title {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-top: var(--space-4);
}

.guide-lede {
  color: var(--color-text-muted);
  font-size: 1.0625rem;
  line-height: 1.65;
  margin-top: var(--space-4);
}

.guide-updated {
  color: var(--color-text-faint);
  font-size: 0.8125rem;
  margin-top: var(--space-3);
}

.guide-toc {
  margin-top: var(--space-6);
  padding: var(--space-4) var(--space-5);
}

.guide-toc__title {
  color: var(--color-text-faint);
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.guide-toc ol {
  display: grid;
  gap: var(--space-2);
  list-style: none;
  margin-top: var(--space-3);
  padding: 0;
}

.guide-toc a {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  text-decoration: none;
}

.guide-toc a:hover { color: var(--color-accent-strong); }

.guide-section { margin-top: var(--space-8); scroll-margin-top: 5rem; }

.guide-section h2 {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: var(--space-4);
}

.guide-section p {
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-top: var(--space-3);
}

.guide-section ul {
  color: var(--color-text-muted);
  display: grid;
  gap: var(--space-2);
  line-height: 1.65;
  margin-top: var(--space-3);
  padding-left: 1.1rem;
}

.guide-section li::marker { color: var(--color-accent-strong); }

.guide-table-wrap {
  margin-top: var(--space-4);
  overflow-x: auto;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
}

.guide-table {
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 36rem;
  width: 100%;
}

.guide-table th,
.guide-table td {
  border-bottom: 1px solid var(--color-rule);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  vertical-align: top;
}

.guide-table th {
  background: var(--color-panel-raised);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.guide-table td { color: var(--color-text-muted); }
.guide-table tr:last-child td { border-bottom: 0; }

.guide-faq {
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.guide-faq details { border-bottom: 1px solid var(--color-rule); }
.guide-faq details:last-child { border-bottom: 0; }

.guide-faq summary {
  color: var(--color-ink);
  cursor: pointer;
  font-weight: 600;
  list-style: none;
  padding: var(--space-4);
  position: relative;
}

.guide-faq summary::-webkit-details-marker { display: none; }
.guide-faq summary::after {
  color: var(--color-text-faint);
  content: '+';
  font-family: var(--font-display);
  position: absolute;
  right: var(--space-4);
}
.guide-faq details[open] summary::after { content: '−'; }

.guide-faq p {
  color: var(--color-text-muted);
  line-height: 1.65;
  margin: 0;
  padding: 0 var(--space-4) var(--space-4);
}

@media (hover: hover) and (pointer: fine) {
  .guide-faq summary:hover { background: var(--color-panel-raised); }
}

.guide-related { margin-top: var(--space-8); }

.guide-related h2 {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.guide-related__grid {
  display: grid;
  gap: var(--space-3);
}

.guide-related__item {
  align-items: center;
  color: var(--color-text);
  display: flex;
  font-size: 0.875rem;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
}

.guide-related__icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-md);
  color: var(--color-accent-strong);
  display: grid;
  flex: none;
  height: 2rem;
  place-items: center;
  width: 2rem;
}

@media (hover: hover) and (pointer: fine) {
  .guide-related__item:hover { border-color: var(--color-accent-rule); background: var(--color-panel-raised); }
}

.guide-cta {
  align-items: center;
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-rule);
  border-radius: var(--radius-xl);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: space-between;
  margin-top: var(--space-8);
  padding: var(--space-5);
}

.guide-cta h2 {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
}

.guide-cta p { color: var(--color-text-muted); font-size: 0.875rem; margin-top: var(--space-1); }
.guide-cta .btn-primary { text-decoration: none; }

@media (min-width: 40rem) {
  .guide-related__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
