import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

const EXTENSION_TOKEN_PATTERN = /^blx_[A-Za-z0-9_-]{40,64}$/

export async function requireExtensionAuth(
  event: H3Event,
  scope: string,
  limit = 120,
) {
  const authorization = getHeader(event, 'authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!EXTENSION_TOKEN_PATTERN.test(token)) {
    throw createError({ statusCode: 401, message: 'Jeton d’extension requis.' })
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  await enforceRateLimit(event, `extension-${scope}`, limit, 60 * 1000, tokenHash)

  const db = useDB(event)
  const owner = await db.execute({
    sql: `SELECT et.user_id
          FROM extension_tokens et
          JOIN users u ON u.id = et.user_id
          WHERE et.token_hash = ?
            AND (et.expires_at IS NULL OR et.expires_at > datetime('now'))
            AND et.session_version = u.session_version`,
    args: [tokenHash],
  })

  if (!owner.rows.length) {
    throw createError({ statusCode: 401, message: 'Jeton d’extension invalide ou expiré.' })
  }

  await db.execute({
    sql: "UPDATE extension_tokens SET last_used_at = datetime('now') WHERE token_hash = ?",
    args: [tokenHash],
  })

  return {
    db,
    tokenHash,
    userId: String(owner.rows[0]?.user_id),
  }
}
