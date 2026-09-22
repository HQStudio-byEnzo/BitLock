<template>
  <div class="article">
    <section
      v-for="section in sections"
      :id="slugify(section.heading)"
      :key="section.heading"
      class="article__section"
    >
      <h2>{{ section.heading }}</h2>
      <p v-for="(paragraph, index) in section.paragraphs" :key="`p-${index}`">{{ paragraph }}</p>
      <ul v-if="section.bullets">
        <li v-for="(bullet, index) in section.bullets" :key="`b-${index}`">{{ bullet }}</li>
      </ul>
      <div v-if="section.table" class="article__table-wrap">
        <table class="article__table">
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

    <section v-if="faq && faq.length" id="faq" class="article__section">
      <h2>{{ faqTitle }}</h2>
      <div class="article__faq">
        <details v-for="item in faq" :key="item.q">
          <summary>{{ item.q }}</summary>
          <p>{{ item.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GuideBlock, GuideFaq } from '~/utils/guides'

defineProps<{
  sections: GuideBlock[]
  faq?: GuideFaq[]
  faqTitle?: string
}>()

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
</script>

<style scoped>
.article__section { margin-top: var(--space-8); scroll-margin-top: 5rem; }

.article__section h2 {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: var(--space-4);
}

.article__section p {
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-top: var(--space-3);
}

.article__section ul {
  color: var(--color-text-muted);
  display: grid;
  gap: var(--space-2);
  line-height: 1.65;
  margin-top: var(--space-3);
  padding-left: 1.1rem;
}

.article__section li::marker { color: var(--color-accent-strong); }

.article__table-wrap {
  margin-top: var(--space-4);
  overflow-x: auto;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
}

.article__table {
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 34rem;
  width: 100%;
}

.article__table th,
.article__table td {
  border-bottom: 1px solid var(--color-rule);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  vertical-align: top;
}

.article__table th {
  background: var(--color-panel-raised);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.article__table td { color: var(--color-text-muted); }
.article__table tr:last-child td { border-bottom: 0; }

.article__faq {
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.article__faq details { border-bottom: 1px solid var(--color-rule); }
.article__faq details:last-child { border-bottom: 0; }

.article__faq summary {
  color: var(--color-ink);
  cursor: pointer;
  font-weight: 600;
  list-style: none;
  padding: var(--space-4);
  position: relative;
}

.article__faq summary::-webkit-details-marker { display: none; }
.article__faq summary::after {
  color: var(--color-text-faint);
  content: '+';
  font-family: var(--font-display);
  position: absolute;
  right: var(--space-4);
}
.article__faq details[open] summary::after { content: '−'; }

.article__faq p {
  color: var(--color-text-muted);
  line-height: 1.65;
  margin: 0;
  padding: 0 var(--space-4) var(--space-4);
}

@media (hover: hover) and (pointer: fine) {
  .article__faq summary:hover { background: var(--color-panel-raised); }
}
</style>
