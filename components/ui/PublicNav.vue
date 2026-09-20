<template>
  <header class="pnav">
    <div class="pnav__inner">
      <NuxtLink to="/" class="pnav__brand" aria-label="QVault">
        <UiQVaultLogo :size="28" />
        <span>QVault</span>
      </NuxtLink>

      <nav class="pnav__links" :aria-label="t('landing.navLabel')">
        <NuxtLink to="/features">{{ t('nav.features') }}</NuxtLink>
        <NuxtLink to="/#how">{{ t('nav.how') }}</NuxtLink>
        <NuxtLink to="/#tools">{{ t('nav.tools') }}</NuxtLink>
        <NuxtLink to="/support">{{ t('sidebar.support') }}</NuxtLink>
      </nav>

      <div class="pnav__actions">
        <UiLangSwitch />
        <NuxtLink v-if="!loggedIn" to="/auth/login" class="btn-secondary pnav__login">{{ t('nav.login') }}</NuxtLink>
        <NuxtLink :to="loggedIn ? '/dashboard' : '/auth/register'" class="btn-primary">
          {{ loggedIn ? t('hero.dashboardCta') : t('hero.cta') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

const { t } = useLang()
const { loggedIn } = useUserSession()
</script>

<style scoped>
.pnav {
  backdrop-filter: blur(12px);
  background: color-mix(in oklab, var(--color-paper) 88%, transparent);
  border-bottom: 1px solid var(--color-rule);
  position: sticky;
  top: 0;
  z-index: 40;
}

.pnav__inner {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  margin-inline: auto;
  max-width: 76rem;
  min-height: 4rem;
  padding-inline: clamp(var(--space-4), 4vw, var(--space-8));
}

.pnav__brand {
  align-items: center;
  color: var(--color-ink);
  display: inline-flex;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  gap: var(--space-tight);
  text-decoration: none;
}

.pnav__links {
  display: none;
  gap: var(--space-6);
  margin-inline: auto;
}

.pnav__links a {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}

.pnav__links a:hover,
.pnav__links a.router-link-active {
  color: var(--color-ink);
}

.pnav__actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  margin-inline-start: auto;
}

@media (min-width: 60rem) {
  .pnav__links {
    display: flex;
  }
}

@media (max-width: 40rem) {
  .pnav__login {
    display: none;
  }
}
</style>
