/**
 * Middleware d'authentification
 * - redirige vers /auth/login si non connecté
 * - redirige vers /auth/locked si le coffre est verrouillé (mot de passe
 *   maître non saisi), pour qu'aucune page du tableau de bord ne soit
 *   accessible sans déverrouillage
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }

  if (!to.path.startsWith('/dashboard')) return

  const { isUnlocked, loadMasterState } = useMasterPassword()
  if (isUnlocked.value) return

  if (await loadMasterState()) {
    return navigateTo({ path: '/auth/locked', query: { next: to.fullPath } })
  }
})
