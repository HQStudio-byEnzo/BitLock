export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const db = useDB()
  const result = await db.execute({
    sql: 'SELECT created_at, last_used_at, expires_at FROM extension_tokens WHERE user_id = ?',
    args: [session.user.id],
  })
  setHeader(event, 'Cache-Control', 'no-store')
  return {
    configured: result.rows.length > 0,
    createdAt: result.rows[0]?.created_at || null,
    lastUsedAt: result.rows[0]?.last_used_at || null,
    expiresAt: result.rows[0]?.expires_at || null,
  }
})
