<template>
  <div ref="root" class="avatar-picker">
    <button
      type="button"
      class="avatar-picker__trigger"
      :class="`avatar-picker__trigger--${size}`"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="t('avatar.choose')"
      @click="open = !open"
    >
      <img v-if="avatar" :src="`/emoji/${avatar}.png`" alt="" class="avatar-picker__img" />
      <span v-else class="avatar-picker__initial">{{ initial }}</span>
      <span class="avatar-picker__badge"><Icon name="hugeicons:pencil" class="h-3 w-3" /></span>
    </button>

    <Transition name="fade">
      <div v-if="open" class="avatar-picker__pop" role="dialog" :aria-label="t('avatar.choose')">
        <p class="avatar-picker__title">{{ t('avatar.choose') }}</p>
        <div class="avatar-picker__grid">
          <button
            v-for="id in avatars"
            :key="id"
            type="button"
            class="avatar-picker__cell"
            :class="{ 'avatar-picker__cell--active': avatar === id }"
            @click="pick(id)"
          >
            <img :src="`/emoji/${id}.png`" alt="" loading="lazy" />
          </button>
        </div>
        <button v-if="avatar" type="button" class="avatar-picker__reset" @click="pick(null)">
          <Icon name="hugeicons:refresh" class="h-4 w-4" />
          {{ t('avatar.reset') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '~/composables/useI18n'

const props = withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const { t } = useLang()
const { user } = useUserSession()
const { avatars, avatar, setAvatar } = useAvatar()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const initial = computed(() => (user.value?.username || '?').charAt(0).toUpperCase())

function pick(id: string | null) {
  setAvatar(id)
  open.value = false
}

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
.avatar-picker {
  position: relative;
}

.avatar-picker__trigger {
  align-items: center;
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: 999px;
  color: var(--color-accent-strong);
  cursor: pointer;
  display: grid;
  font-family: var(--font-display);
  font-weight: 600;
  place-items: center;
  position: relative;
  transition: border-color var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.avatar-picker__trigger:hover {
  border-color: var(--color-accent-500);
}

.avatar-picker__trigger:active {
  transform: scale(0.96);
}

.avatar-picker__trigger--sm { height: 2.25rem; width: 2.25rem; font-size: 0.9rem; }
.avatar-picker__trigger--md { height: 2.75rem; width: 2.75rem; font-size: 1.1rem; }
.avatar-picker__trigger--lg { height: 5.5rem; width: 5.5rem; font-size: 1.75rem; }

.avatar-picker__img {
  height: 100%;
  width: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-picker__badge {
  align-items: center;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 999px;
  bottom: -2px;
  color: var(--color-text-muted);
  display: grid;
  height: 1.25rem;
  place-items: center;
  position: absolute;
  right: -2px;
  width: 1.25rem;
}

.avatar-picker__pop {
  background: var(--color-panel);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  left: 0;
  padding: var(--space-4);
  position: absolute;
  top: calc(100% + 0.5rem);
  width: 20rem;
  z-index: 50;
}

.avatar-picker__title {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  margin-bottom: var(--space-3);
}

.avatar-picker__grid {
  display: grid;
  gap: var(--space-1);
  grid-template-columns: repeat(7, 1fr);
}

.avatar-picker__cell {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: grid;
  height: 2.25rem;
  place-items: center;
  transition: background-color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.avatar-picker__cell:hover {
  background: var(--color-paper-3);
  transform: scale(1.08);
}

.avatar-picker__cell--active {
  border-color: var(--color-accent-500);
  background: var(--color-accent-soft);
}

.avatar-picker__cell img {
  height: 1.5rem;
  width: 1.5rem;
}

.avatar-picker__reset {
  align-items: center;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--color-rule);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  font-size: 0.8125rem;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  width: 100%;
}

.avatar-picker__reset:hover {
  color: var(--color-ink);
}
</style>
