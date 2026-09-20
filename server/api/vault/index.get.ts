export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const db = useDB()
  const query = getQuery(event)
  const type = typeof query.type === 'string' ? query.type : undefined
  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 200) : undefined
  const vaultId = typeof query.vault === 'string' ? query.vault.slice(0, 128) : undefined
  const folderId = typeof query.folder === 'string' ? query.folder.slice(0, 128) : undefined
  const tagId = typeof query.tag === 'string' ? query.tag.slice(0, 128) : undefined
  const limit = Math.min(Math.max(Number(query.limit) || 500, 1), 1000)
  const offset = Math.max(Number(query.offset) || 0, 0)

  let where = ''
  const params: any[] = [session.user.id]
  if (type && ['link', 'password', 'crypto', 'recovery', 'note', 'totp'].includes(type)) { where += ' AND type = ?'; params.push(type) }
  if (query.favorites === 'true') where += ' AND favorite = 1'
  if (vaultId) { where += ' AND vault_id = ?'; params.push(vaultId) }
  if (folderId) { where += ' AND folder_id = ?'; params.push(folderId) }
  if (tagId) { where += ' AND id IN (SELECT item_id FROM vault_item_tags WHERE tag_id = ?)'; params.push(tagId) }
  if (search) {
    const pattern = `%${escapeLikePattern(search)}%`
    where += " AND (label LIKE ? ESCAPE '\\' OR url LIKE ? ESCAPE '\\' OR type LIKE ? ESCAPE '\\' OR (is_encrypted = 0 AND payload LIKE ? ESCAPE '\\'))"
    params.push(pattern, pattern, pattern, pattern)
  }

  const [result, tagResult, totalResult] = await Promise.all([
    db.execute({
      sql: `SELECT * FROM vault_items WHERE user_id = ?${where} ORDER BY favorite DESC, updated_at DESC LIMIT ? OFFSET ?`,
      args: [...params, limit, offset],
    }),
    db.execute({ sql: 'SELECT vit.item_id, t.id, t.name, t.color FROM vault_item_tags vit JOIN tags t ON t.id = vit.tag_id WHERE t.user_id = ?', args: [session.user.id] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM vault_items WHERE user_id = ?${where}`, args: params }),
  ])
  const tagsByItem = new Map<string, any[]>()
  for (const row of tagResult.rows as any[]) {
    const list = tagsByItem.get(String(row.item_id)) || []
    list.push({ id: row.id, name: row.name, color: row.color })
    tagsByItem.set(String(row.item_id), list)
  }
  const items = result.rows.map(row => ({
    ...row,
    is_encrypted: Boolean(row.is_encrypted),
    favorite: Boolean(row.favorite),
    tags: tagsByItem.get(String((row as any).id)) || [],
  }))
  return {
    items,
    count: items.length,
    total: Number(totalResult.rows[0]?.total || items.length),
    limit,
    offset,
  }
})
