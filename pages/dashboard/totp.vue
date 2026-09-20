<template>
  <div class="section-shell max-w-6xl py-10 md:py-16 space-y-6">
    <section class="hero-panel flex flex-col sm:flex-row sm:items-end justify-between gap-5">
      <div>
        <p class="eyebrow">{{ t('sidebar.totp') }}</p>
        <h1 class="mt-3 text-3xl md:text-4xl font-semibold text-foreground">{{ t('totp.title') }}</h1>
        <p class="mt-3 text-surface-300">{{ t('totp.subtitle') }}</p>
      </div>
      <button class="btn-primary self-start" @click="showAdd = true"><Icon name="lucide:plus" class="w-4 h-4" /> {{ t('totp.add') }}</button>
    </section>

    <div v-if="!isUnlocked" class="glass-panel p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
      <Icon name="lucide:lock-keyhole" class="w-6 h-6 text-amber-700" />
      <p class="flex-1 text-sm text-surface-300">{{ t('totp.unlock') }}</p>
      <NuxtLink to="/auth/locked?redirect=/dashboard/totp" class="btn-secondary">{{ t('totp.unlockAction') }}</NuxtLink>
    </div>

    <div v-if="loading" class="glass-panel p-10 text-center text-surface-400">{{ t('common.loading') }}</div>
    <div v-else-if="totpItems.length === 0" class="glass-panel p-10 text-center text-surface-400">{{ t('totp.empty') }}</div>
    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in totpItems" :key="item.id" class="glass-panel p-5">
        <div class="flex items-start justify-between gap-3">
          <div><p class="text-xs uppercase tracking-[.2em] text-surface-500">{{ t('vault.typeTotp') }}</p><h2 class="mt-2 text-foreground font-medium">{{ item.label || t('vault.untitled') }}</h2></div>
          <span class="tech-status tabular-nums">{{ codes[item.id]?.remaining ?? '--' }}s</span>
        </div>
        <button class="mt-6 w-full font-mono text-3xl tracking-[.22em] text-accent-600 text-left tabular-nums" :disabled="!codes[item.id]" @click="copyCode(item.id)">
          {{ formatCode(codes[item.id]?.code) }}
        </button>
        <div class="mt-5 h-1 overflow-hidden bg-surface-800" role="progressbar" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="Math.round(progress(item.id))" :aria-label="item.label || t('vault.untitled')"><div class="h-full bg-accent-400 transition-[width] duration-1000" :style="{ width: `${progress(item.id)}%` }" /></div>
        <p v-if="errors[item.id]" role="alert" class="mt-3 text-xs text-red-600">{{ errors[item.id] }}</p>
      </article>
    </div>
    <VaultAddModal v-if="showAdd" default-type="totp" @close="showAdd = false" @added="onAdded" />
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { t } = useLang()
const { items, loading, fetchItems, decryptItem } = useVault()
const { isUnlocked } = useMasterPassword()
const { generateTotp } = useTotp()
const { copySecurely } = useSecureClipboard()
const showAdd = ref(false)
const codes = ref<Record<string, { code: string; remaining: number; period: number }>>({})
const secrets = ref<Record<string, string>>({})
const errors = ref<Record<string, string>>({})
const totpItems = computed(() => items.value.filter(item => item.type === 'totp'))
let timer: ReturnType<typeof setInterval> | null = null

async function refreshCodes() {
  if (!isUnlocked.value) return
  // Decrypt each secret once (PBKDF2 600k), then only recompute the cheap TOTP.
  for (const item of totpItems.value) {
    if (secrets.value[item.id] !== undefined) continue
    try { secrets.value[item.id] = await decryptItem(item) }
    catch { errors.value[item.id] = t('totp.invalid') }
  }
  for (const item of totpItems.value) {
    const secret = secrets.value[item.id]
    if (!secret) continue
    try { codes.value[item.id] = await generateTotp(secret); delete errors.value[item.id] }
    catch { errors.value[item.id] = t('totp.invalid') }
  }
}
function formatCode(code?: string) { return code ? `${code.slice(0, 3)} ${code.slice(3)}` : '--- ---' }
function progress(id: string) { const current = codes.value[id]; return current ? (current.remaining / current.period) * 100 : 0 }
async function copyCode(id: string) { const code = codes.value[id]?.code; if (code) await copySecurely(code) }
async function onAdded() { showAdd.value = false; secrets.value = {}; await fetchItems({ type: 'totp' }); await refreshCodes() }
onMounted(async () => { await fetchItems({ type: 'totp' }); await refreshCodes(); timer = setInterval(refreshCodes, 1000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
watch(isUnlocked, (unlocked) => { if (!unlocked) { secrets.value = {}; codes.value = {} } else { refreshCodes() } })
</script>
