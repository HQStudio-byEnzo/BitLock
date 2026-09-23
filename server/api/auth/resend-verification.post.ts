/**
 * POST /api/auth/resend-verification
 * Renvoie un lien de vérification. Répond toujours la même chose pour ne pas
 * révéler l'existence d'un compte.
 */
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth-resend-verification', 5, 60 * 60 * 1000)
  const body = requireRecord(await readBody(event))
  const identifier = normalizeLoginIdentifier(body.identifier)
  const locale = body.locale === 'en' ? 'en' : 'fr'

  const db = useDB()
  const found = await db.execute({
    sql: 'SELECT id, username, email, email_verified FROM users WHERE username = ? OR lower(email) = ?',
    args: [identifier, identifier],
  })

  let devVerificationUrl: string | undefined
  const user = found.rows[0] as any
  if (user && Number(user.email_verified) !== 1) {
    const email = String(user.email)
    // Accounts with the internal placeholder cannot receive email.
    if (!isPlaceholderEmail(email)) {
      try {
        const token = await issueVerificationToken(db, String(user.id), email)
        await sendVerificationEmail({ email, username: String(user.username), token, locale })
        // Development convenience only, mirroring registration.
        if (process.env.NODE_ENV !== 'production') devVerificationUrl = verificationUrl(token)
      } catch {
        // Swallow: never reveal the outcome to an unauthenticated caller.
      }
    }
  }

  return {
    ok: true,
    ...(devVerificationUrl ? { devVerificationUrl } : {}),
  }
})
