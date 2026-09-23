/**
 * POST /api/auth/claim-email
 * Comptes historiques sans adresse : enregistre l'adresse fournie et envoie le
 * lien de confirmation. Nécessite une session valide.
 */
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth-claim-email', 10, 60 * 60 * 1000)
  const session = await requireAuth(event)
  const body = requireRecord(await readBody(event))
  const email = normalizeEmail(body.email)
  const locale = body.locale === 'en' ? 'en' : 'fr'

  const db = useDB(event)
  const current = await db.execute({
    sql: 'SELECT email FROM users WHERE id = ?',
    args: [session.user.id],
  })

  // Idempotent: another tab may already have saved a real address.
  if (!isPlaceholderEmail(current.rows[0]?.email)) {
    return { ok: true, alreadySet: true }
  }

  const taken = await db.execute({
    sql: 'SELECT id FROM users WHERE lower(email) = ? AND id != ?',
    args: [email, session.user.id],
  })
  if (taken.rows.length > 0) {
    throw createError({ statusCode: 409, message: 'Cette adresse e-mail est déjà utilisée.' })
  }

  try {
    await db.execute({
      sql: 'UPDATE users SET email = ?, email_verified = 0 WHERE id = ?',
      args: [email, session.user.id],
    })
  } catch (error) {
    if (/unique|constraint/i.test(String((error as any)?.message || error))) {
      throw createError({ statusCode: 409, message: 'Cette adresse e-mail est déjà utilisée.' })
    }
    throw error
  }

  const token = await issueVerificationToken(db, String(session.user.id), email)
  let delivery = 'sent'
  try {
    await sendVerificationEmail({
      email,
      username: String(session.user.username),
      token,
      locale,
    })
  } catch {
    // The address is saved; the user can ask for a new link from the page.
    delivery = 'failed'
  }

  return {
    ok: true,
    delivery,
    ...(process.env.NODE_ENV === 'production' ? {} : { devVerificationUrl: verificationUrl(token) }),
  }
})
