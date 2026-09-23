/**
 * POST /api/auth/register
 * Crée un compte (username + e-mail) puis envoie un lien de vérification.
 * Le compte reste inactif jusqu'à la confirmation de l'adresse e-mail.
 */
import { LEGAL_TERMS_VERSION, truncateIp } from '~/server/utils/legal'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth-register', 5, 60 * 60 * 1000)
  const body = requireRecord(await readBody(event))
  const username = normalizeUsername(body.username)
  const email = normalizeEmail(body.email)
  const password = requireNewAccountPassword(body.password)
  const locale = body.locale === 'en' ? 'en' : 'fr'
  if (body.acceptedTerms !== true) {
    throw createError({ statusCode: 400, message: 'Vous devez accepter les documents juridiques.' })
  }

  const db = useDB()
  const existing = await db.execute({
    sql: 'SELECT id, username FROM users WHERE username = ? OR lower(email) = ?',
    args: [username, email],
  })
  if (existing.rows.some(row => String(row.username) === username)) {
    throw createError({ statusCode: 409, message: 'Ce username est déjà utilisé.' })
  }
  if (existing.rows.length > 0) {
    throw createError({ statusCode: 409, message: 'Cette adresse e-mail est déjà utilisée.' })
  }

  const id = crypto.randomUUID()
  const hashedPassword = await hashUserPassword(password)

  try {
    await db.batch([
      {
        sql: "INSERT INTO users (id, name, username, email, email_verified, password, created_at) VALUES (?, ?, ?, ?, 0, ?, datetime('now'))",
        args: [id, username, username, email, hashedPassword],
      },
      {
        sql: `INSERT INTO accepted_terms (user_id, terms_version, accepted_at, user_agent, ip_address)
              VALUES (?, ?, datetime('now'), ?, ?)`,
        args: [
          id,
          LEGAL_TERMS_VERSION,
          getRequestHeader(event, 'user-agent') || null,
          truncateIp(getRequestIP(event)),
        ],
      },
      {
        sql: "INSERT INTO vaults (id, user_id, name, color, is_default, created_at, updated_at) VALUES (?, ?, 'Principal', '#4ade80', 1, datetime('now'), datetime('now'))",
        args: [`default-${id}`, id],
      },
    ], 'write')
  } catch (error) {
    if (/unique|constraint/i.test(String((error as any)?.message || error))) {
      throw createError({ statusCode: 409, message: 'Ce username ou cette adresse e-mail est déjà utilisé.' })
    }
    throw error
  }

  const token = await issueVerificationToken(db, id, email)
  let delivery = 'sent'
  try {
    await sendVerificationEmail({ email, username, token, locale })
  } catch {
    // The account exists; the user can request a new link from the login screen.
    delivery = 'failed'
  }

  return {
    user: { id, username },
    verificationRequired: true,
    delivery,
    // Development convenience only: expose the link so the flow is testable
    // without an outbound email provider.
    ...(process.env.NODE_ENV === 'production' ? {} : { devVerificationUrl: verificationUrl(token) }),
  }
})
