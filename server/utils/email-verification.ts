import { createHash, randomBytes } from 'node:crypto'
import type { createClient } from '@libsql/client'
import { sendMail, verificationEmail } from './mailer'

const TOKEN_TTL_MINUTES = 24 * 60
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{40,64}$/
const PLACEHOLDER_EMAIL_SUFFIXES = ['@qvault.invalid', '@bitlock.invalid']

/**
 * Accounts created before email verification carry an internal placeholder
 * address. They are treated as verified by the migration so their owners keep
 * access, but they still have to supply a real address.
 */
export function isPlaceholderEmail(email: unknown) {
  const value = String(email ?? '').trim().toLowerCase()
  if (!value) return true
  return PLACEHOLDER_EMAIL_SUFFIXES.some(suffix => value.endsWith(suffix))
}

/**
 * True while the account must still complete the email step: it either has no
 * real address yet, or the address it has was never confirmed. Supplying an
 * address is not enough, opening the link is what clears this.
 */
export function needsEmailCompletion(email: unknown, emailVerified: unknown) {
  return isPlaceholderEmail(email) || Number(emailVerified) !== 1
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function verificationUrl(token: string) {
  const base = String(useRuntimeConfig().appUrl || '').replace(/\/+$/, '')
  return `${base}/auth/verify-email?token=${encodeURIComponent(token)}`
}

export function assertVerificationToken(value: unknown) {
  const token = requireString(value, 'Token', { min: 40, max: 64 })
  if (!TOKEN_PATTERN.test(token)) {
    throw createError({ statusCode: 400, message: 'Lien de vérification invalide.' })
  }
  return token
}

/** Issue a fresh single-use token (invalidating any previous one). */
export async function issueVerificationToken(
  db: ReturnType<typeof createClient>,
  userId: string,
  email: string,
) {
  const token = randomBytes(32).toString('base64url')
  await db.execute({ sql: 'DELETE FROM email_verification_tokens WHERE user_id = ?', args: [userId] })
  await db.execute({
    sql: `INSERT INTO email_verification_tokens (id, user_id, token_hash, email, created_at, expires_at)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now', ?))`,
    args: [crypto.randomUUID(), userId, hashToken(token), email, `+${TOKEN_TTL_MINUTES} minutes`],
  })
  return token
}

export async function sendVerificationEmail(input: {
  email: string
  username: string
  token: string
  locale?: string
}) {
  const link = verificationUrl(input.token)
  const mail = verificationEmail({ link, username: input.username, locale: input.locale })
  await sendMail({ to: input.email, ...mail })
  return link
}

/** Consume a token and mark the account verified. Returns the user id. */
export async function consumeVerificationToken(
  db: ReturnType<typeof createClient>,
  token: string,
) {
  const tokenHash = hashToken(token)
  const found = await db.execute({
    sql: `SELECT id, user_id FROM email_verification_tokens
          WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > datetime('now')`,
    args: [tokenHash],
  })

  if (!found.rows.length) {
    throw createError({ statusCode: 410, message: 'Ce lien est invalide ou expiré. Demandez-en un nouveau.' })
  }

  const recordId = String(found.rows[0]?.id)
  const userId = String(found.rows[0]?.user_id)

  await db.batch([
    { sql: "UPDATE users SET email_verified = 1 WHERE id = ?", args: [userId] },
    { sql: "UPDATE email_verification_tokens SET consumed_at = datetime('now') WHERE id = ?", args: [recordId] },
    { sql: 'DELETE FROM email_verification_tokens WHERE user_id = ? AND id != ?', args: [userId, recordId] },
  ], 'write')

  return userId
}
