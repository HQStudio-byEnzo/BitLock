export function useSecureClipboard() {
  const lastCopyToken = useState('qvault-secure-clipboard-token', () => '')

  async function copySecurely(value: string, clearAfterSeconds?: number) {
    if (!import.meta.client) return false
    await navigator.clipboard.writeText(value)

    const token = crypto.randomUUID()
    lastCopyToken.value = token
    const seconds = clearAfterSeconds ?? Number(localStorage.getItem('qvault.security.clipboardClearSeconds') || 30)

    if (seconds > 0) {
      window.setTimeout(async () => {
        if (lastCopyToken.value !== token) return
        try {
          const current = await navigator.clipboard.readText()
          if (current === value) {
            await navigator.clipboard.writeText('')
            lastCopyToken.value = ''
          }
        } catch {
          // Reading clipboard contents requires an explicit browser permission.
          // Never erase a newer clipboard value when equality cannot be verified.
        }
      }, seconds * 1000)
    }

    return true
  }

  return { copySecurely }
}
