export const AVATARS = [
  'fox', 'cat', 'dog', 'panda', 'koala', 'lion', 'frog', 'penguin', 'owl', 'dragon',
  'robot', 'alien', 'ghost', 'unicorn', 'cactus', 'rocket', 'shield', 'lock', 'key', 'gem',
  'flame', 'star', 'zap', 'moon', 'sun', 'brain', 'ninja', 'crown',
] as const

export type AvatarId = typeof AVATARS[number]

export function useAvatar() {
  const { user } = useUserSession()
  const avatar = useState<string | null>('qvault-avatar', () => null)
  const ready = useState<boolean>('qvault-avatar-ready', () => false)

  function storageKey() {
    const owner = user.value?.id || user.value?.username || 'anonymous'
    return `qvault.avatar:${encodeURIComponent(String(owner))}`
  }

  function load() {
    if (!import.meta.client) return
    avatar.value = localStorage.getItem(storageKey()) || null
    ready.value = true
  }

  function setAvatar(id: string | null) {
    if (import.meta.client) {
      if (id) localStorage.setItem(storageKey(), id)
      else localStorage.removeItem(storageKey())
    }
    avatar.value = id
  }

  onMounted(load)
  watch(() => user.value?.id || user.value?.username, () => { if (import.meta.client) load() })

  return { avatars: AVATARS, avatar, ready, setAvatar, load }
}
