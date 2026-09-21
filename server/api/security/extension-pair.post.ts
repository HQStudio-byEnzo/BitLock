import { createHash, randomInt } from 'node:crypto'

const PAIR_CODE_TTL_MINUTES = 5

/**
 * POST /api/security/extension-pair
 * Generate a short-lived, single-use pairing code shown once in the app.
 * The extension exchanges it for a token through /api/extension/pair.
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  await enforceRateLimit(event, 'extension-pair-create', 10, 60 * 60 * 1000, String(session.user.id))
  const db = useDB()

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const codeHash = createHash('sha256').update(code).digest('hex')

  await db.execute({
    sql: `INSERT INTO extension_pair_codes (user_id, code_hash, created_at, expires_at)
          VALUES (?, ?, datetime('now'), datetime('now', ?))
          ON CONFLICT(user_id) DO UPDATE SET
            code_hash = excluded.code_hash,
            created_at = excluded.created_at,
            expires_at = excluded.expires_at`,
    args: [String(session.user.id), codeHash, `+${PAIR_CODE_TTL_MINUTES} minutes`],
  })

  setHeader(event, 'Cache-Control', 'no-store')
  return { code, expiresInMinutes: PAIR_CODE_TTL_MINUTES }
})
