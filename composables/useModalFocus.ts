import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface ModalFocusOptions {
  closeOnEscape?: boolean
  active?: Ref<boolean>
}

/**
 * Keyboard and focus management for a modal dialog: traps Tab inside the
 * dialog, closes on Escape, focuses the first control on open and restores
 * focus to the previously focused element on close.
 */
export function useModalFocus(
  container: Ref<HTMLElement | null>,
  onClose: () => void,
  options: ModalFocusOptions = {},
) {
  const closeOnEscape = options.closeOnEscape !== false
  const active = options.active ?? ref(true)
  let previouslyFocused: HTMLElement | null = null

  function focusableNodes(): HTMLElement[] {
    if (!container.value) return []
    return Array.from(container.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      .filter(element => element.offsetParent !== null || element === document.activeElement)
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab') return

    const nodes = focusableNodes()
    if (nodes.length === 0) {
      event.preventDefault()
      container.value?.focus()
      return
    }

    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const current = document.activeElement as HTMLElement | null
    const inside = !!container.value && !!current && container.value.contains(current)

    if (event.shiftKey && (current === first || !inside)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (current === last || !inside)) {
      event.preventDefault()
      first.focus()
    }
  }

  function activate() {
    previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', onKeydown, true)
    nextTick(() => {
      const preferred = container.value?.querySelector<HTMLElement>('[autofocus]')
      if (preferred) preferred.focus()
      else {
        const nodes = focusableNodes()
        if (nodes.length) nodes[0].focus()
        else container.value?.focus()
      }
    })
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown, true)
    if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
    previouslyFocused = null
  }

  watch(active, (isActive) => {
    if (!import.meta.client) return
    if (isActive) activate()
    else deactivate()
  }, { immediate: true })

  onBeforeUnmount(() => {
    if (import.meta.client) deactivate()
  })
}
