<template>
  <div ref="root" class="colorpicker">
    <button
      type="button"
      class="colorpicker__trigger"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="t('organization.tagColor')"
      @click="open = !open"
    >
      <span class="colorpicker__swatch" :style="{ background: modelValue }" />
      <span class="colorpicker__hex">{{ modelValue }}</span>
    </button>

    <Transition name="fade">
      <div v-if="open" class="colorpicker__pop" role="dialog" :aria-label="t('organization.tagColor')">
        <div class="colorpicker__presets">
          <button
            v-for="preset in presets"
            :key="preset"
            type="button"
            class="colorpicker__preset"
            :class="{ 'colorpicker__preset--active': modelValue.toLowerCase() === preset }"
            :style="{ background: preset }"
            :aria-label="preset"
            @click="pick(preset)"
          />
        </div>

        <label class="colorpicker__slider">
          <span>{{ t('colorpicker.hue') }}</span>
          <input v-model.number="hue" type="range" min="0" max="360" @input="applyHsl" />
        </label>
        <label class="colorpicker__slider">
          <span>{{ t('colorpicker.lightness') }}</span>
          <input v-model.number="light" type="range" min="25" max="75" @input="applyHsl" />
        </label>

        <div class="colorpicker__preview" :style="{ background: modelValue }" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const { t } = useLang()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const hue = ref(210)
const light = ref(50)

const presets = [
  '#2563eb', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#64748b', '#0f172a',
]

function hexToHsl(hex: string) {
  let c = (hex || '#2563eb').replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number) {
  const ss = s / 100
  const ll = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = ss * Math.min(ll, 1 - ll)
  const f = (n: number) => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const to = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0')
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`
}

function applyHsl() {
  emit('update:modelValue', hslToHex(hue.value, 68, light.value))
}

function pick(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

watch(() => props.modelValue, (value) => {
  const { h, l } = hexToHsl(value)
  hue.value = h
  light.value = l
}, { immediate: true })

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}
function onPointerDown(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}
onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerDown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<style scoped>
.colorpicker {
  position: relative;
}

.colorpicker__trigger {
  align-items: center;
  background: var(--color-paper);
  border: 1px solid var(--color-rule-strong);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  gap: var(--space-2);
  min-height: 2.25rem;
  padding-inline: var(--space-2);
}

.colorpicker__swatch {
  border: 1px solid oklch(0 0 0 / 0.12);
  border-radius: var(--radius-sm);
  height: 1.5rem;
  width: 1.5rem;
}

.colorpicker__hex {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
}

.colorpicker__pop {
  background: var(--color-panel);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 15rem;
  z-index: 50;
}

.colorpicker__presets {
  display: grid;
  gap: var(--space-1);
  grid-template-columns: repeat(6, 1fr);
}

.colorpicker__preset {
  border: 1px solid oklch(0 0 0 / 0.12);
  border-radius: var(--radius-sm);
  cursor: pointer;
  height: 1.75rem;
  transition: transform var(--dur-fast) var(--ease-out);
  width: 100%;
}

.colorpicker__preset:hover {
  transform: scale(1.1);
}

.colorpicker__preset--active {
  outline: 2px solid var(--color-accent-500);
  outline-offset: 1px;
}

.colorpicker__slider {
  display: grid;
  gap: var(--space-1);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.colorpicker__slider input {
  accent-color: var(--color-accent-600);
  width: 100%;
}

.colorpicker__preview {
  border-radius: var(--radius-sm);
  height: 0.75rem;
  width: 100%;
}
</style>
