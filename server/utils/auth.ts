import { compare, hash } from 'bcryptjs'
import type { H3Event } from 'h3'

/**
 * Hash un mot de passe avec bcrypt
 */
export async function hashUserPassword(password: string): Promise<string> {
  return hash(password, 12)
}

/**
 * Vérifie un mot de passe contre son hash
 */
export async function verifyUserPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

/**
 * Middleware qui vérifie l'authentification via la session
 * Renvoie une erreur 401 si non authentifié
 */
export async function requireAuth(event: H3Event) {
  const session = await getUserSession(event)

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé. Veuillez vous connecter.',
    })
  }

  const db = useDB(event)
  const result = await db.execute({
    sql: 'SELECT username, session_version FROM users WHERE id = ?',
    args: [session.user.id],
  })
  const currentVersion = Number(result.rows[0]?.session_version ?? -1)
  const sessionVersion = Number(session.user.sessionVersion ?? 0)

  if (result.rows.length === 0 || currentVersion !== sessionVersion) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, message: 'Session expired. Please sign in again.' })
  }

  const username = String(result.rows[0]?.username || '')
  if (username && session.user.username !== username) {
    const hydratedSession = {
      ...session,
      user: {
        id: session.user.id,
        username,
        sessionVersion,
        created_at: session.user.created_at,
        // Preserved on purpose: dropping it would lift the email gate.
        needsEmail: session.user.needsEmail,
      },
    }
    await setUserSession(event, hydratedSession)
    return hydratedSession
  }

  return session as typeof session & { user: NonNullable<typeof session.user> }
}
