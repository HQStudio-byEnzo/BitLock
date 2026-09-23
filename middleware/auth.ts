/**
 * Middleware d'authentification
 * - redirige vers /auth/login si non connecté
 * - redirige vers /auth/complete-email si le compte n'a pas encore d'adresse
 *   e-mail confirmée (comptes créés avant la vérification par e-mail)
 * - redirige vers /auth/locked si le coffre est verrouillé (mot de passe
 *   maître non saisi), pour qu'aucune page du tableau de bord ne soit
 *   accessible sans déverrouillage
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }

  // The account has no usable address yet. It stays on one page until a real
  // address is supplied and confirmed, so nothing else is reachable.
  if (user.value?.needsEmail && to.path !== '/auth/complete-email') {
    return navigateTo('/auth/complete-email')
  }

  if (!to.path.startsWith('/dashboard')) return

  const { isUnlocked, loadMasterState } = useMasterPassword()
  if (isUnlocked.value) return

  if (await loadMasterState()) {
    return navigateTo({ path: '/auth/locked', query: { next: to.fullPath } })
  }
})
