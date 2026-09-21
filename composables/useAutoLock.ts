/**
 * Composable pour le verrouillage automatique après inactivité
 * Vide le mot de passe maître puis redirige vers l'écran de déverrouillage
 * Affiche un avertissement 30 secondes avant le verrouillage
 */
export function useAutoLock() {
  const { clearMasterPassword } = useMasterPassword()

  const showWarning = ref(false)
  const remainingSeconds = ref(30)

  let inactivityTimer: ReturnType<typeof setTimeout> | null = null
  let warningTimer: ReturnType<typeof setTimeout> | null = null
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  function getTimeoutMs() {
    if (!import.meta.client) return 5 * 60 * 1000
    const minutes = Number(localStorage.getItem('qvault.security.autoLockMinutes') || 5)
    if (minutes <= 0) return 0
    return Math.max(1, minutes) * 60 * 1000
  }

  function resetTimers() {
    const inactivityTimeout = getTimeoutMs()

    // Hide warning if shown
    showWarning.value = false
    remainingSeconds.value = 30

    // Clear existing timers
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (warningTimer) clearTimeout(warningTimer)
    if (countdownInterval) clearInterval(countdownInterval)

    if (inactivityTimeout === 0) return

    const warningBefore = Math.min(30 * 1000, Math.max(5000, inactivityTimeout - 1000))

    // Set warning timer (fires 30s before logout)
    warningTimer = setTimeout(() => {
      showWarning.value = true
      remainingSeconds.value = Math.ceil(warningBefore / 1000)

      // Start countdown
      countdownInterval = setInterval(() => {
        remainingSeconds.value--
        if (remainingSeconds.value <= 0) {
          if (countdownInterval) clearInterval(countdownInterval)
        }
      }, 1000)
    }, inactivityTimeout - warningBefore)

    // Set logout timer
    inactivityTimer = setTimeout(() => {
      performLogout()
    }, inactivityTimeout)
  }

  function performLogout() {
    cleanup()
    clearMasterPassword()
    navigateTo('/auth/locked?reason=timeout')
  }

  function cleanup() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (warningTimer) clearTimeout(warningTimer)
    if (countdownInterval) clearInterval(countdownInterval)

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.removeEventListener(event, resetTimers)
    })
    window.removeEventListener('storage', resetTimers)
    window.removeEventListener('qvault-security-settings-changed', resetTimers)
  }

  function init() {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetTimers, { passive: true })
    })
    window.addEventListener('storage', resetTimers)
    window.addEventListener('qvault-security-settings-changed', resetTimers)

    // Start initial timer
    resetTimers()
  }

  // Lifecycle
  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    showWarning,
    remainingSeconds,
    resetTimers,
  }
}
