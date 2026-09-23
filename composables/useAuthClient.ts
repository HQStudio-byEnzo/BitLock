/**
 * Composable client pour l'authentification
 * Utilise nuxt-auth-utils (sessions via cookies sécurisés)
 */
export function useAuthClient() {
  const { loggedIn, user, session, clear, fetch: fetchSession } = useUserSession()
  const { clearMasterPassword } = useMasterPassword()

  /**
   * Inscription : crée le compte et envoie le lien de vérification.
   * Aucune session n'est ouverte tant que l'e-mail n'est pas confirmé.
   */
  async function signUp(data: {
    username: string
    email: string
    password: string
    acceptedTerms: boolean
    locale?: string
  }) {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: data,
    })
    clearMasterPassword()
    return response
  }

  /**
   * Connexion
   */
  async function signIn(data: { username: string; password: string }) {
    const response: { user: any; needsEmail?: boolean } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: data,
    })
    await fetchSession()
    clearMasterPassword()
    return response
  }

  /**
   * Déconnexion
   */
  async function signOut() {
    await clear()
    clearMasterPassword()
    navigateTo('/auth/login')
  }

  return {
    user,
    session,
    loggedIn,
    loading: ref(false),
    fetchSession,
    signUp,
    signIn,
    signOut,
  }
}
