import { createHash, randomBytes } from 'node:crypto'

const EXTENSION_TOKEN_TTL_DAYS = 30

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  await enforceRateLimit(event, 'extension-token-create', 10, 60 * 60 * 1000, String(session.user.id))
  const db = useDB()
  const token = `blx_${randomBytes(32).toString('base64url')}`
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const sessionVersion = Number(session.user.sessionVersion ?? 0)

  await db.execute({
    sql: `INSERT INTO extension_tokens (user_id, token_hash, created_at, last_used_at, expires_at, session_version)
          VALUES (?, ?, datetime('now'), NULL, datetime('now', ?), ?)
          ON CONFLICT(user_id) DO UPDATE SET
            token_hash = excluded.token_hash,
            created_at = excluded.created_at,
            last_used_at = NULL,
            expires_at = excluded.expires_at,
            session_version = excluded.session_version`,
    args: [session.user.id, tokenHash, `+${EXTENSION_TOKEN_TTL_DAYS} days`, sessionVersion],
  })
  setHeader(event, 'Cache-Control', 'no-store')
  return { token, expiresInDays: EXTENSION_TOKEN_TTL_DAYS }
})
