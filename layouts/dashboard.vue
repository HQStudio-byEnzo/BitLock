<template>
  <div class="dash">
    <a href="#main" class="skip-link">Aller au contenu principal</a>

    <aside class="dash__side">
      <NuxtLink to="/" class="dash__brand" aria-label="QVault">
        <UiQVaultLogo :size="30" />
        <span>QVault</span>
      </NuxtLink>

      <nav class="dash__nav" aria-label="Navigation principale">
        <section v-for="group in navGroups" :key="group.label" class="dash__group">
          <p class="dash__groupLabel">{{ t(group.label) }}</p>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="dash__link"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <Icon :name="item.icon" class="dash__linkIcon" />
            <span>{{ t(item.label) }}</span>
          </NuxtLink>
        </section>
      </nav>

      <div class="dash__user">
        <span class="dash__avatar" aria-hidden="true">
          <img v-if="avatar" :src="`/emoji/${avatar}.png`" alt="" class="dash__avatarImg" />
          <template v-else>{{ initial }}</template>
        </span>
        <span class="dash__userText">
          <strong>{{ user?.username || '—' }}</strong>
          <small>{{ t('nav.localAccount') }}</small>
        </span>
        <button type="button" class="dash__signout" :aria-label="t('nav.signout')" @click="signOut">
          <Icon name="hugeicons:log-out" class="h-4 w-4" />
        </button>
      </div>
    </aside>

    <div class="dash__col">
      <header class="dash__bar">
        <button type="button" class="dash__menu dash__menu--mobile" aria-label="Ouvrir la navigation" @click="mobileMenuOpen = true">
          <Icon name="hugeicons:menu" class="h-5 w-5" />
        </button>
        <NuxtLink to="/" class="dash__brand dash__brand--mobile" aria-label="QVault">
          <UiQVaultLogo :size="26" />
          <span>QVault</span>
        </NuxtLink>

        <div ref="searchRoot" class="dash__searchWrap">
          <form class="dash__search" role="search" @submit.prevent="openFirstResult">
            <Icon name="hugeicons:search-01" class="dash__searchIcon" />
            <input
              v-model="searchQuery"
              type="search"
              class="dash__searchInput"
              :placeholder="t('vault.search')"
              :aria-label="t('vault.search')"
              @focus="onSearchFocus"
              @input="onSearchInput"
            />
          </form>

          <Transition name="fade">
            <div v-if="searchOpen && searchQuery.trim()" class="dash__results" role="listbox">
              <p v-if="results.length === 0" class="dash__resultsEmpty">{{ t('vault.noResult') }}</p>
              <button
                v-for="item in results"
                :key="item.id"
                type="button"
                class="dash__result"
                role="option"
                @click="pickResult(item)"
              >
                <span class="dash__resultIcon"><Icon :name="typeIcon(item.type)" class="h-4 w-4" /></span>
                <span class="dash__resultText">
                  <strong>{{ item.label || t('vault.untitled') }}</strong>
                  <small>{{ item.url || typeLabel(item.type) }}</small>
                </span>
                <Icon name="hugeicons:arrow-right-01" class="dash__resultArrow h-4 w-4" />
              </button>
              <NuxtLink v-if="results.length" to="/dashboard/vault" class="dash__resultsAll" @click="searchOpen = false">
                {{ t('dash.viewAll') }}
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <button type="button" class="dash__menu dash__menu--mobile" :aria-label="t('nav.signout')" @click="signOut">
          <Icon name="hugeicons:log-out" class="h-4 w-4" />
        </button>
      </header>

      <main id="main" tabindex="-1" class="dash__panel">
        <slot />
      </main>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="mobileMenuOpen" ref="mobileSheetEl" tabindex="-1" class="dash-sheet" role="dialog" aria-modal="true" aria-label="Navigation">
          <button class="dash-sheet__backdrop" aria-label="Fermer la navigation" @click="mobileMenuOpen = false" />
          <aside class="dash-sheet__card">
            <div class="dash-sheet__head">
              <NuxtLink to="/" class="dash__brand" @click="mobileMenuOpen = false">
                <UiQVaultLogo :size="28" />
                <span>QVault</span>
              </NuxtLink>
              <button type="button" class="dash__menu" aria-label="Fermer la navigation" @click="mobileMenuOpen = false">
                <Icon name="hugeicons:x" class="h-5 w-5" />
              </button>
            </div>
            <nav class="dash__nav" aria-label="Navigation mobile">
              <section v-for="group in navGroups" :key="group.label" class="dash__group">
                <p class="dash__groupLabel">{{ t(group.label) }}</p>
                <NuxtLink
                  v-for="item in group.items"
                  :key="item.to"
                  :to="item.to"
                  class="dash__link"
                  :aria-current="isActive(item.to) ? 'page' : undefined"
                  @click="mobileMenuOpen = false"
                >
                  <Icon :name="item.icon" class="dash__linkIcon" />
                  <span>{{ t(item.label) }}</span>
                </NuxtLink>
              </section>
            </nav>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <aside v-if="showWarning" class="dash-toast" role="status">
          <div class="flex items-start gap-3">
            <Icon name="hugeicons:clock-01" class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <strong class="block text-sm">{{ t('autolock.title') }}</strong>
              <p class="mt-1 text-xs text-surface-500">
                {{ t('autolock.desc').replace('{seconds}', String(remainingSeconds)) }}
              </p>
              <button type="button" class="btn-secondary mt-3" @click="resetTimers">
                {{ t('autolock.stay') }}
              </button>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <button v-if="shielded" type="button" class="dash-shield" @click="reveal">
          <UiQVaultLogo :size="58" />
          <strong class="mt-5 text-xl text-surface-50">{{ t('privacy.title') }}</strong>
          <span class="mt-2 text-sm text-surface-500">{{ t('privacy.reveal') }}</span>
        </button>
      </Transition>
    </Teleport>

    <LegalTermsAcceptanceModal />
    <SecurityMasterPasswordOnboarding />
    <VaultDecryptModal v-if="searchTarget" :item="searchTarget" @close="searchTarget = null" />
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
import type { VaultItem } from '~/composables/useVault'

const { user, signOut } = useAuthClient()
const { t } = useLang()
useAppShortcuts()
const route = useRoute()
const mobileMenuOpen = ref(false)
const searchQuery = ref('')
const searchOpen = ref(false)
const searchRoot = ref<HTMLElement | null>(null)
const searchTarget = ref<VaultItem | null>(null)
const mobileSheetEl = ref<HTMLElement | null>(null)
useModalFocus(mobileSheetEl, () => { mobileMenuOpen.value = false }, { active: mobileMenuOpen })

const { items, fetchItems } = useVault()
let loadingItems = false

const results = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return [] as VaultItem[]
  return items.value
    .filter(item => `${item.label} ${item.url || ''} ${item.type}`.toLowerCase().includes(query))
    .slice(0, 8)
})

const SEARCH_ICONS: Record<VaultItem['type'], string> = {
  link: 'hugeicons:link', password: 'hugeicons:key-round', crypto: 'hugeicons:bitcoin',
  recovery: 'hugeicons:life-buoy', note: 'hugeicons:notebook-pen', totp: 'hugeicons:shield-check',
}
function typeIcon(type: VaultItem['type']) { return SEARCH_ICONS[type] }
function typeLabel(type: VaultItem['type']) { return t(`dash.${({ link: 'links', password: 'passwords', crypto: 'crypto', recovery: 'recovery', note: 'notes', totp: 'totp' } as const)[type]}`) }

async function onSearchFocus() {
  searchOpen.value = true
  if (items.value.length === 0 && !loadingItems) {
    loadingItems = true
    try { await fetchItems() } finally { loadingItems = false }
  }
}
function onSearchInput() {
  searchOpen.value = true
}
function pickResult(item: VaultItem) {
  searchTarget.value = item
  searchOpen.value = false
  searchQuery.value = ''
}
function openFirstResult() {
  const first = results.value[0]
  if (first) pickResult(first)
}
function onSearchPointerDown(event: PointerEvent) {
  if (searchOpen.value && searchRoot.value && !searchRoot.value.contains(event.target as Node)) searchOpen.value = false
}
onMounted(() => document.addEventListener('pointerdown', onSearchPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onSearchPointerDown))

const { showWarning, remainingSeconds, resetTimers } = useAutoLock()
const { shielded, reveal } = usePrivacyShield()

const initial = computed(() => (user.value?.username || '?').charAt(0).toUpperCase())
const { avatar } = useAvatar()

const mainNavItems = [
  { to: '/dashboard', label: 'sidebar.dashboard', icon: 'hugeicons:house-01' },
  { to: '/dashboard/vault', label: 'sidebar.vault', icon: 'hugeicons:vault' },
  { to: '/dashboard/passwords', label: 'sidebar.passwords', icon: 'hugeicons:key-round' },
  { to: '/dashboard/notes', label: 'sidebar.notes', icon: 'hugeicons:notebook-pen' },
  { to: '/dashboard/totp', label: 'sidebar.totp', icon: 'hugeicons:shield-check' },
]

const toolNavItems = [
  { to: '/dashboard/password-generator', label: 'sidebar.passwordGenerator', icon: 'hugeicons:sparkles' },
  { to: '/dashboard/seed-generator', label: 'sidebar.seedGenerator', icon: 'hugeicons:list-ordered' },
  { to: '/dashboard/audit', label: 'sidebar.audit', icon: 'hugeicons:shield-alert' },
]

const securityNavItems = [
  { to: '/dashboard/links', label: 'sidebar.links', icon: 'hugeicons:link' },
  { to: '/dashboard/crypto', label: 'sidebar.crypto', icon: 'hugeicons:bitcoin' },
  { to: '/dashboard/recovery-codes', label: 'sidebar.recoveryCode', icon: 'hugeicons:life-buoy' },
  { to: '/dashboard/organization', label: 'sidebar.organization', icon: 'hugeicons:folder-tree' },
  { to: '/dashboard/history', label: 'sidebar.history', icon: 'hugeicons:history' },
  { to: '/dashboard/export', label: 'sidebar.export', icon: 'hugeicons:download-01' },
  { to: '/dashboard/transfer', label: 'sidebar.transfer', icon: 'hugeicons:scan-line' },
]

const accountNavItems = [
  { to: '/dashboard/support', label: 'sidebar.support', icon: 'hugeicons:heart-handshake' },
  { to: '/dashboard/settings', label: 'sidebar.settings', icon: 'hugeicons:settings-01' },
]

const navGroups = [
  { label: 'sidebar.groupMain', items: mainNavItems },
  { label: 'sidebar.groupTools', items: toolNavItems },
  { label: 'sidebar.groupSecurity', items: securityNavItems },
  { label: 'sidebar.groupAccount', items: accountNavItems },
]

function isActive(path: string) {
  if (path === '/dashboard') return route.path === path
  return route.path === path || route.path.startsWith(`${path}/`)
}

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.dash {
  background: var(--color-canvas);
  color: var(--color-text);
  display: flex;
  height: 100dvh;
  overflow: hidden;
}

.dash__side {
  display: flex;
  flex-direction: column;
  flex: 0 0 17.5rem;
  gap: var(--space-2);
  height: 100dvh;
  padding: var(--space-5) var(--space-4);
}

.dash__brand {
  align-items: center;
  color: var(--color-ink);
  display: inline-flex;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  gap: var(--space-tight);
  padding: var(--space-1) var(--space-tight) var(--space-3);
  text-decoration: none;
}

.dash__nav {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--space-5);
  min-height: 0;
  overflow-y: auto;
}

.dash__group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dash__groupLabel {
  color: var(--color-text-faint);
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-1);
  padding-inline: var(--space-tight);
  text-transform: uppercase;
}

.dash__link {
  align-items: center;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  display: flex;
  font-size: 0.875rem;
  gap: var(--space-related);
  padding: var(--space-tight) var(--space-related);
  text-decoration: none;
  transition: background-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}

.dash__link:hover {
  background: var(--color-paper-3);
  color: var(--color-ink);
}

.dash__link[aria-current='page'] {
  background: var(--color-panel);
  box-shadow: 0 1px 2px oklch(0.2 0.01 107 / 0.06);
  color: var(--color-ink);
  font-weight: 500;
}

.dash__linkIcon {
  flex: 0 0 auto;
  height: 1.125rem;
  width: 1.125rem;
}

.dash__user {
  align-items: center;
  border-top: 1px solid var(--color-rule);
  display: flex;
  gap: var(--space-related);
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-tight) 0;
}

.dash__avatar {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: 999px;
  color: var(--color-accent-strong);
  display: grid;
  flex: 0 0 auto;
  font-family: var(--font-display);
  font-weight: 600;
  height: 2.25rem;
  place-items: center;
  width: 2.25rem;
  overflow: hidden;
}

.dash__avatarImg {
  height: 74%;
  object-fit: contain;
  width: 74%;
}

.dash__userText {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.dash__userText strong {
  color: var(--color-ink);
  font-size: 0.8125rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dash__userText small {
  color: var(--color-text-faint);
  font-size: 0.6875rem;
}

.dash__signout,
.dash__menu {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  display: inline-flex;
  height: 2.25rem;
  justify-content: center;
  width: 2.25rem;
}

.dash__signout:hover,
.dash__menu:hover {
  background: var(--color-paper-3);
  color: var(--color-ink);
}

.dash__col {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: var(--space-3) var(--space-3) var(--space-3) 0;
}

.dash__bar {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-1) var(--space-3);
}

.dash__menu--mobile,
.dash__brand--mobile {
  display: none;
}

.dash__searchWrap {
  flex: 1;
  max-width: 30rem;
  position: relative;
}

.dash__search {
  align-items: center;
  background: var(--color-panel);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  display: flex;
  gap: var(--space-2);
  padding-inline: var(--space-3);
  transition: border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
  width: 100%;
}

.dash__results {
  background: var(--color-panel);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  left: 0;
  max-height: 24rem;
  overflow-y: auto;
  padding: var(--space-1);
  position: absolute;
  right: 0;
  top: calc(100% + 0.35rem);
  z-index: 50;
}

.dash__resultsEmpty {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  padding: var(--space-4);
  text-align: center;
}

.dash__result {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  text-align: start;
  transition: background-color var(--dur-fast) var(--ease-out);
  width: 100%;
}

.dash__result:hover {
  background: var(--color-paper-3);
}

.dash__resultIcon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-sm);
  color: var(--color-accent-strong);
  display: grid;
  flex: none;
  height: 1.75rem;
  place-items: center;
  width: 1.75rem;
}

.dash__resultText {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.dash__resultText strong {
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dash__resultText small {
  color: var(--color-text-faint);
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dash__resultArrow {
  color: var(--color-text-faint);
  flex: none;
}

.dash__resultsAll {
  border-top: 1px solid var(--color-rule);
  color: var(--color-accent-600);
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  margin-top: var(--space-1);
  padding: var(--space-2) var(--space-3);
  text-decoration: none;
}

.dash__resultsAll:hover {
  color: var(--color-accent-700);
}

.dash__search:focus-within {
  border-color: var(--color-accent-500);
  box-shadow: 0 0 0 3px var(--color-focus);
}

.dash__searchIcon {
  color: var(--color-text-faint);
  flex: 0 0 auto;
  height: 1.125rem;
  width: 1.125rem;
}

.dash__searchInput {
  background: transparent;
  border: 0;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  min-height: 2.25rem;
  outline: none;
  width: 100%;
}

.dash__searchInput::placeholder {
  color: var(--color-text-faint);
}

.dash__panel {
  background: var(--color-panel);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-xl);
  box-shadow: 0 1px 2px oklch(0.2 0.01 107 / 0.05);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  outline: none;
  scrollbar-gutter: stable;
}

.dash-sheet {
  display: flex;
  inset: 0;
  position: fixed;
  z-index: 50;
}

.dash-sheet__backdrop {
  background: var(--color-overlay);
  border: 0;
  inset: 0;
  position: absolute;
  width: 100%;
}

.dash-sheet__card {
  background: var(--color-panel);
  border-end-end-radius: var(--radius-xl);
  border-start-end-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
  max-width: 19rem;
  padding: var(--space-4);
  position: relative;
  width: 84%;
}

.dash-sheet__head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.dash-toast {
  background: var(--color-panel);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  bottom: var(--space-4);
  box-shadow: var(--shadow-modal);
  color: var(--color-text);
  inset-inline: var(--space-4);
  margin-inline: auto;
  max-width: 24rem;
  padding: var(--space-4);
  position: fixed;
  z-index: 60;
}

.dash-shield {
  align-items: center;
  background: var(--color-canvas);
  border: 0;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: center;
  position: fixed;
  text-align: center;
  z-index: 100;
}

@media (max-width: 64rem) {
  .dash__side {
    display: none;
  }

  .dash__menu--mobile,
  .dash__brand--mobile {
    display: inline-flex;
  }

  .dash__bar {
    padding-inline: 0;
  }

  .dash__col {
    padding: var(--space-2) var(--space-2) var(--space-2);
  }

  .dash__panel {
    border-radius: var(--radius-lg);
  }
}
</style>
