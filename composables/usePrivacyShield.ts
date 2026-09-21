export function usePrivacyShield() {
  const shielded = useState('privacy-shielded', () => false)
  function enabled() {
    return import.meta.client && localStorage.getItem('qvault.security.privacyShield') !== 'false'
  }
  function handleVisibility() {
    if (!enabled()) return
    shielded.value = document.hidden || !document.hasFocus()
  }
  function reveal() { shielded.value = false }
  onMounted(() => {
    window.addEventListener('blur', handleVisibility)
    window.addEventListener('focus', handleVisibility)
    document.addEventListener('visibilitychange', handleVisibility)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('blur', handleVisibility)
    window.removeEventListener('focus', handleVisibility)
    document.removeEventListener('visibilitychange', handleVisibility)
  })
  return { shielded, reveal }
}
