<template>
  <main class="bitlock-landing">
    <header class="terminal-nav">
      <NuxtLink to="/" class="terminal-nav__brand" aria-label="BitLock — accueil">
        <UiBitLockLogo :size="30" />
        <span>bitlock</span>
      </NuxtLink>
      <nav class="terminal-nav__command" :aria-label="t('landing.navLabel')">
        <span class="terminal-nav__prompt">&gt;</span>
        <a href="#workflow">--workflow</a>
        <a href="#capabilities">--vault</a>
        <a href="#security">--security</a>
        <NuxtLink to="/support">--support</NuxtLink>
        <span class="terminal-nav__caret" aria-hidden="true">▮</span>
      </nav>
      <div class="terminal-nav__actions">
        <UiLangSwitch />
        <NuxtLink :to="loggedIn ? '/dashboard' : '/auth/register'" class="terminal-nav__launch">
          {{ loggedIn ? t('hero.dashboardCta') : t('nav.start') }}
        </NuxtLink>
      </div>
    </header>

    <section class="vault-intro">
      <div class="vault-intro__copy">
        <p class="terminal-label">bitlock://online-vault</p>
        <h1>{{ t('landing.title') }}</h1>
        <p class="vault-intro__lede">{{ t('landing.subtitle') }}</p>
        <div class="vault-intro__actions">
          <NuxtLink :to="loggedIn ? '/dashboard' : '/auth/register'" class="btn-primary">
            {{ loggedIn ? t('dash.openVault') : t('hero.cta') }}
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
          <NuxtLink v-if="!loggedIn" to="/auth/login" class="btn-secondary">
            {{ t('nav.login') }}
          </NuxtLink>
        </div>
      </div>

      <dl class="runtime-spec" :aria-label="t('landing.runtimeTitle')">
        <div>
          <dt>{{ t('landing.runtimeRuntime') }}</dt>
          <dd>{{ t('landing.runtimeBrowser') }}</dd>
          <small>{{ t('landing.runtimeBrowserNote') }}</small>
        </div>
        <div>
          <dt>{{ t('landing.runtimeCipher') }}</dt>
          <dd>{{ t('landing.runtimeCipherLabel') }}</dd>
          <small>{{ t('landing.runtimeCipherSub') }}</small>
        </div>
        <div>
          <dt>{{ t('landing.runtimeStorage') }}</dt>
          <dd>{{ t('landing.runtimeStorageLabel') }}</dd>
          <small>{{ t('landing.runtimeStorageNote') }}</small>
        </div>
      </dl>
    </section>

    <section id="workflow" class="workflow-section scroll-mt-8">
      <header class="workflow-section__intro">
        <p class="terminal-label">{{ t('landing.workflowLabel') }}</p>
        <h2>{{ t('landing.workflowTitle') }}</h2>
        <p>{{ t('landing.workflowDesc') }}</p>
      </header>

      <ol class="workflow-steps">
        <li v-for="step in workflow" :key="step.index" class="workflow-step">
          <div class="workflow-step__index">{{ step.index }}</div>
          <div class="workflow-step__body">
            <div class="workflow-step__heading">
              <Icon :name="step.icon" class="h-5 w-5" />
              <h3>{{ step.title }}</h3>
            </div>
            <p>{{ step.description }}</p>
          </div>
          <NuxtLink :to="step.to" class="workflow-step__link" :aria-label="step.action">
            {{ step.action }} <span aria-hidden="true">↗</span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section id="capabilities" class="capability-section scroll-mt-8">
      <header class="capability-section__head">
        <div>
          <p class="terminal-label">{{ t('landing.capabilitiesLabel') }}</p>
          <h2>{{ t('landing.capabilitiesTitle') }}</h2>
        </div>
        <p>{{ t('landing.capabilitiesDesc') }}</p>
      </header>

      <div class="capability-index">
        <NuxtLink
          v-for="(feature, index) in features"
          :key="feature.slug"
          :to="`/features/${feature.slug}`"
          class="capability-row"
        >
          <span class="capability-row__index">{{ String(index + 1).padStart(2, '0') }}</span>
          <Icon :name="feature.icon" class="h-5 w-5" />
          <strong>{{ feature.title }}</strong>
          <p>{{ feature.summary }}</p>
          <span class="capability-row__arrow" aria-hidden="true">↗</span>
        </NuxtLink>
      </div>
    </section>

    <section class="tool-section">
      <header>
        <p class="terminal-label">{{ t('landing.toolsLabel') }}</p>
        <h2>{{ t('landing.toolsTitle') }}</h2>
      </header>
      <div class="tool-rail">
        <NuxtLink v-for="tool in tools" :key="tool.to" :to="tool.to" class="tool-command">
          <span class="tool-command__prompt">$</span>
          <span>
            <strong>{{ tool.title }}</strong>
            <small>{{ tool.description }}</small>
          </span>
          <Icon :name="tool.icon" class="h-5 w-5" />
        </NuxtLink>
      </div>
    </section>

    <section id="security" class="security-path scroll-mt-8">
      <div class="security-path__copy">
        <p class="terminal-label">{{ t('landing.securityLabel') }}</p>
        <h2>{{ t('landing.securityTitle') }}</h2>
        <p>{{ t('landing.securityDesc') }}</p>
        <NuxtLink to="/audit-securite" class="text-command">
          {{ t('landing.inspectSecurity') }} <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
      <ol class="security-path__flow" :aria-label="t('landing.securityFlowLabel')">
        <li v-for="node in securityFlow" :key="node.title">
          <span>{{ node.index }}</span>
          <div>
            <strong>{{ node.title }}</strong>
            <small>{{ node.description }}</small>
          </div>
        </li>
      </ol>
    </section>

    <section class="landing-faq">
      <header>
        <p class="terminal-label">FAQ / 04</p>
        <h2>{{ t('faq.title') }}</h2>
      </header>
      <div>
        <details v-for="index in 4" :key="index">
          <summary>{{ t(`faq.q${index}`) }} <Icon name="lucide:plus" class="h-4 w-4" /></summary>
          <p>{{ t(`faq.a${index}`) }}</p>
        </details>
      </div>
    </section>

    <section class="launch-line">
      <p>{{ t('landing.finalTitle') }}</p>
      <NuxtLink :to="loggedIn ? '/dashboard' : '/auth/register'" class="btn-primary">
        {{ loggedIn ? t('dash.openVault') : t('hero.cta') }}
        <Icon name="lucide:arrow-right" class="h-4 w-4" />
      </NuxtLink>
    </section>

    <footer class="terminal-footer">
      <p>BitLock v1 · Chiffrement avancé · BIP-39 · Open-source · MIT</p>
      <nav :aria-label="t('landing.footerLabel')">
        <a href="https://github.com/KernelStudio-byEnzo/BitLock" target="_blank" rel="noopener noreferrer">{{ t('footer.sourceCode') }}</a>
        <NuxtLink to="/support">Support</NuxtLink>
        <NuxtLink to="/legal/cgu">{{ t('footer.terms') }}</NuxtLink>
        <NuxtLink to="/legal/confidentialite">{{ t('footer.privacy') }}</NuxtLink>
      </nav>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

definePageMeta({ layout: 'default' })

const { t } = useLang()
const { loggedIn } = useUserSession()
const { features } = useFeatureCatalog()

const workflow = computed(() => [
  { index: '1.0', icon: 'lucide:plus', title: t('landing.stepCaptureTitle'), description: t('landing.stepCaptureDesc'), action: t('landing.stepCaptureAction'), to: loggedIn.value ? '/dashboard/vault' : '/auth/register' },
  { index: '2.0', icon: 'lucide:lock-keyhole', title: t('landing.stepEncryptTitle'), description: t('landing.stepEncryptDesc'), action: t('landing.stepEncryptAction'), to: '/features/encryption' },
  { index: '3.0', icon: 'lucide:search', title: t('landing.stepFindTitle'), description: t('landing.stepFindDesc'), action: t('landing.stepFindAction'), to: '/features/favorites' },
  { index: '4.0', icon: 'lucide:scan-search', title: t('landing.stepAuditTitle'), description: t('landing.stepAuditDesc'), action: t('landing.stepAuditAction'), to: '/audit-securite' },
])

const tools = computed(() => [
  { to: '/generateur-mot-de-passe', icon: 'lucide:wand-sparkles', title: t('tools.password.title'), description: t('tools.password.desc') },
  { to: '/generateur-seed-phrase', icon: 'lucide:binary', title: t('tools.seed.title'), description: t('tools.seed.desc') },
  { to: '/audit-securite', icon: 'lucide:shield-check', title: t('tools.audit.title'), description: t('tools.audit.desc') },
])

const securityFlow = computed(() => [
  { index: 'A', title: t('landing.flowPlainTitle'), description: t('landing.flowPlainDesc') },
  { index: 'B', title: t('landing.flowCipherTitle'), description: t('landing.flowCipherDesc') },
  { index: 'C', title: t('landing.flowStoreTitle'), description: t('landing.flowStoreDesc') },
])
</script>
