import { createHash } from 'node:crypto'

const CODE_PATTERN = /^\d{6}$/

/**
 * POST /api/extension/pair
 * Exchange a short-lived pairing code for an extension token. Public by
 * design, so it is rate limited per IP and the code is single use.
 */
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'extension-pair', 15, 15 * 60 * 1000)
  const body = requireRecord(await readBody(event))
  const code = requireString(body.code, 'Code', { min: 6, max: 6 })
  if (!CODE_PATTERN.test(code)) {
    throw createError({ statusCode: 400, message: 'Code d’appairage invalide.' })
  }

  const db = useDB()
  const codeHash = createHash('sha256').update(code).digest('hex')

  const found = await db.execute({
    sql: `SELECT epc.user_id AS user_id, u.session_version AS session_version
          FROM extension_pair_codes epc
          JOIN users u ON u.id = epc.user_id
          WHERE epc.code_hash = ? AND epc.expires_at > datetime('now')`,
    args: [codeHash],
  })

  if (!found.rows.length) {
    throw createError({ statusCode: 401, message: 'Code invalide ou expiré.' })
  }

  const userId = String(found.rows[0]?.user_id)
  const sessionVersion = Number(found.rows[0]?.session_version) || 0

  // Consume the code before issuing the token so it can only be used once.
  await db.execute({ sql: 'DELETE FROM extension_pair_codes WHERE user_id = ?', args: [userId] })

  const result = await issueExtensionToken(db, userId, sessionVersion)

  setHeader(event, 'Cache-Control', 'no-store')
  return result
})
