export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const db = useDB()
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 1000, 1), 5000)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const history = await db.execute({
    sql: 'SELECT id, item_id, payload, iv, is_encrypted FROM vault_item_history WHERE user_id = ? ORDER BY item_id, version DESC LIMIT ? OFFSET ?',
    args: [session.user.id, limit, offset],
  })
  return { history: history.rows, count: history.rows.length, limit, offset }
})
