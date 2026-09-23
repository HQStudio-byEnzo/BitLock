/**
 * POST /api/auth/login
 * Connexion locale par username et mot de passe.
 */
const DUMMY_PASSWORD_HASH = '$2b$12$TXHbIGwXmsfL8xqmIB/fweBVpky..BJ9b0apckX56X0c5vhpGtjfq'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth-login-ip', 50, 15 * 60 * 1000)
  const body = requireRecord(await readBody(event))
  const identifier = normalizeLoginIdentifier(body.username)
  const password = requireString(body.password, 'Password', { min: 1, max: 128, trim: false })
  await enforceRateLimit(event, 'auth-login-account', 10, 15 * 60 * 1000, identifier)

  const db = useDB()
  const result = await db.execute({
    sql: 'SELECT id, username, password, session_version, created_at, email_verified FROM users WHERE username = ? OR lower(email) = ?',
    args: [identifier, identifier],
  })

  async function rejectLogin() {
    throw createError({ statusCode: 401, message: 'Username ou mot de passe incorrect.' })
  }

  if (result.rows.length === 0) {
    await verifyUserPassword(password, DUMMY_PASSWORD_HASH)
    return rejectLogin()
  }

  const user = result.rows[0] as any
  const valid = await verifyUserPassword(password, user.password)
  if (!valid) return rejectLogin()

  if (Number(user.email_verified) !== 1) {
    // Distinct status code (401 = bad credentials, 403 = valid but unverified)
    // so the client can offer to resend the confirmation email.
    throw createError({
      statusCode: 403,
      message: 'Confirmez votre adresse e-mail pour activer votre compte.',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      username: user.username,
      sessionVersion: Number(user.session_version) || 0,
      created_at: user.created_at,
    },
  })

  return { user: { id: user.id, username: user.username } }
})
