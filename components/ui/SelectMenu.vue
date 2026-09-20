<template>
  <div ref="root" class="select">
    <button
      type="button"
      class="select__trigger"
      :class="triggerClass"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="toggle"
      @keydown.down.prevent="openMenu(); move(1)"
      @keydown.up.prevent="openMenu(); move(-1)"
      @keydown.enter.prevent="open ? selectActive() : openMenu()"
      @keydown.space.prevent="open ? selectActive() : openMenu()"
      @keydown.esc="open = false"
    >
      <span class="select__value" :class="{ 'select__value--placeholder': modelValue === '' || modelValue == null }">
        {{ selectedLabel }}
      </span>
      <Icon name="hugeicons:arrow-down-01" class="select__chevron" :class="{ 'select__chevron--open': open }" />
    </button>

    <Transition name="fade">
      <ul v-if="open" class="select__menu" role="listbox">
        <li v-for="(option, index) in options" :key="option.value" role="option" :aria-selected="option.value === modelValue">
          <button
            type="button"
            class="select__option"
            :class="{ 'select__option--active': index === activeIndex, 'select__option--selected': option.value === modelValue }"
            @click="select(option.value)"
            @mouseenter="activeIndex = index"
          >
            <span>{{ option.label }}</span>
            <Icon v-if="option.value === modelValue" name="hugeicons:check" class="h-4 w-4" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  triggerClass?: string
}>(), {
  placeholder: '—',
  triggerClass: 'input-field',
})

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const open = ref(false)
const activeIndex = ref(0)
const root = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => props.options.find(o => o.value === props.modelValue)?.label ?? props.placeholder)

function toggle() {
  open.value ? (open.value = false) : openMenu()
}
function openMenu() {
  const index = props.options.findIndex(o => o.value === props.modelValue)
  activeIndex.value = index >= 0 ? index : 0
  open.value = true
}
function move(delta: number) {
  if (!props.options.length) return
  activeIndex.value = (activeIndex.value + delta + props.options.length) % props.options.length
}
function selectActive() {
  const option = props.options[activeIndex.value]
  if (option) select(option.value)
}
function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onPointerDown(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown))
</script>

<style scoped>
.select {
  position: relative;
}

.select__trigger {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
  text-align: start;
  width: 100%;
}

.select__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select__value--placeholder {
  color: var(--color-text-faint);
}

.select__chevron {
  color: var(--color-text-faint);
  flex: none;
  height: 1rem;
  transition: transform var(--dur-base) var(--ease-out);
  width: 1rem;
}

.select__chevron--open {
  transform: rotate(180deg);
}

.select__menu {
  background: var(--color-panel);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  left: 0;
  margin-top: 0.35rem;
  max-height: 16rem;
  overflow-y: auto;
  padding: var(--space-1);
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 60;
}

.select__option {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font-size: 0.875rem;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  text-align: start;
  width: 100%;
}

.select__option--active {
  background: var(--color-paper-3);
}

.select__option--selected {
  color: var(--color-accent-600);
  font-weight: 500;
}

.select__option svg {
  color: var(--color-accent-600);
}
</style>
