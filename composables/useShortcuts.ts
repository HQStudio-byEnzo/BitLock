export type ShortcutActionId =
  | 'addLink'
  | 'addPassword'
  | 'addCrypto'
  | 'addRecovery'
  | 'openPasswordGenerator'
  | 'openSeedGenerator'
  | 'openAudit'
  | 'openVault'
  | 'openSettings'

export interface ShortcutActionMeta {
  id: ShortcutActionId
  route: string
  labelKey: string
  descriptionKey: string
  defaultCombo: string
}

export interface ShortcutPreferences {
  enabled: boolean
  actions: Record<ShortcutActionId, { enabled: boolean; combo: string }>
}

const STORAGE_KEY = 'qvault.shortcuts'

export const shortcutActions: ShortcutActionMeta[] = [
  { id: 'addLink', route: '/dashboard/links?add=1', labelKey: 'settings.shortcutAddLink', descriptionKey: 'settings.shortcutAddLinkDesc', defaultCombo: 'mod+shift+l' },
  { id: 'addPassword', route: '/dashboard/passwords?add=1', labelKey: 'settings.shortcutAddPassword', descriptionKey: 'settings.shortcutAddPasswordDesc', defaultCombo: 'mod+shift+p' },
  { id: 'addCrypto', route: '/dashboard/crypto?add=1', labelKey: 'settings.shortcutAddCrypto', descriptionKey: 'settings.shortcutAddCryptoDesc', defaultCombo: 'mod+shift+c' },
  { id: 'addRecovery', route: '/dashboard/recovery-codes?add=1', labelKey: 'settings.shortcutAddRecovery', descriptionKey: 'settings.shortcutAddRecoveryDesc', defaultCombo: 'mod+shift+r' },
  { id: 'openPasswordGenerator', route: '/dashboard/password-generator', labelKey: 'settings.shortcutPasswordGenerator', descriptionKey: 'settings.shortcutPasswordGeneratorDesc', defaultCombo: 'mod+alt+p' },
  { id: 'openSeedGenerator', route: '/dashboard/seed-generator', labelKey: 'settings.shortcutSeedGenerator', descriptionKey: 'settings.shortcutSeedGeneratorDesc', defaultCombo: 'mod+alt+s' },
  { id: 'openAudit', route: '/dashboard/audit', labelKey: 'settings.shortcutAudit', descriptionKey: 'settings.shortcutAuditDesc', defaultCombo: 'mod+alt+a' },
  { id: 'openVault', route: '/dashboard/vault', labelKey: 'settings.shortcutVault', descriptionKey: 'settings.shortcutVaultDesc', defaultCombo: 'mod+alt+v' },
  { id: 'openSettings', route: '/dashboard/settings', labelKey: 'settings.shortcutSettings', descriptionKey: 'settings.shortcutSettingsDesc', defaultCombo: 'mod+,', },
]

function createDefaultPreferences(): ShortcutPreferences {
  return {
    enabled: true,
    actions: Object.fromEntries(
      shortcutActions.map(action => [
        action.id,
        { enabled: true, combo: action.defaultCombo },
      ]),
    ) as ShortcutPreferences['actions'],
  }
}

function normalizeCombo(combo: string) {
  return combo
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/command|cmd|meta/g, 'mod')
}

export function formatShortcutCombo(combo: string) {
  return normalizeCombo(combo)
    .split('+')
    .map((part) => {
      if (part === 'mod') return process.client && /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘' : 'Ctrl'
      if (part === 'shift') return 'Shift'
      if (part === 'alt') return 'Alt'
      if (part === 'ctrl') return 'Ctrl'
      if (part === 'esc' || part === 'escape') return 'Esc'
      if (part === ',') return ','
      return part.length === 1 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' + ')
}

function comboMatchesEvent(combo: string, event: KeyboardEvent) {
  const tokens = normalizeCombo(combo).split('+').filter(Boolean)
  const key = event.key.toLowerCase()
  const isMac = process.client && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  const hasMod = isMac ? event.metaKey : event.ctrlKey

  return tokens.every((token) => {
    if (token === 'mod') return hasMod
    if (token === 'shift') return event.shiftKey
    if (token === 'alt') return event.altKey
    if (token === 'ctrl') return event.ctrlKey
    if (token === 'meta' || token === 'cmd' || token === 'command') return event.metaKey
    if (token === 'escape' || token === 'esc') return key === 'escape'
    if (token === ',') return key === ','
    return key === token
  })
}

function isEditableTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

export function useShortcutPreferences() {
  const shortcuts = useState<ShortcutPreferences>('qvault-shortcuts', () => createDefaultPreferences())
  const loaded = useState<boolean>('qvault-shortcuts-loaded', () => false)
  const editing = useState<boolean>('qvault-shortcuts-editing', () => false)

  function loadShortcuts() {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ShortcutPreferences>
        const defaults = createDefaultPreferences()
        shortcuts.value = {
          enabled: parsed.enabled ?? defaults.enabled,
          actions: Object.fromEntries(shortcutActions.map((action) => {
            const saved = parsed.actions?.[action.id]
            return [
              action.id,
              {
                enabled: saved?.enabled ?? true,
                combo: saved?.combo || action.defaultCombo,
              },
            ]
          })) as ShortcutPreferences['actions'],
        }
      }
    } catch {
      shortcuts.value = createDefaultPreferences()
    } finally {
      loaded.value = true
    }
  }

  function saveShortcuts() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts.value))
    window.dispatchEvent(new Event('qvault-shortcuts-changed'))
  }

  function resetShortcuts() {
    shortcuts.value = createDefaultPreferences()
    saveShortcuts()
  }

  return {
    shortcuts,
    loaded,
    editing,
    loadShortcuts,
    saveShortcuts,
    resetShortcuts,
    formatShortcutCombo,
    shortcutActions,
  }
}

export function useAppShortcuts() {
  const { shortcuts, loadShortcuts, editing } = useShortcutPreferences()

  function handleKeydown(event: KeyboardEvent) {
    if (!shortcuts.value.enabled || editing.value || event.repeat || isEditableTarget(event.target)) return

    const action = shortcutActions.find((meta) => {
      const shortcut = shortcuts.value.actions[meta.id]
      return shortcut.enabled && comboMatchesEvent(shortcut.combo, event)
    })

    if (!action) return

    event.preventDefault()
    navigateTo(action.route)
  }

  onMounted(() => {
    loadShortcuts()
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('qvault-shortcuts-changed', loadShortcuts)
    window.addEventListener('storage', loadShortcuts)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('qvault-shortcuts-changed', loadShortcuts)
    window.removeEventListener('storage', loadShortcuts)
  })

  return {
    shortcuts,
    shortcutActions,
  }
}
