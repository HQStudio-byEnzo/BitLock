export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  await enforceRateLimit(event, 'vault-update', 240, 60 * 1000, String(session.user.id))
  const db = useDB()
  const id = getRouterParam(event, 'id')
  const body = requireRecord(await readBody(event))
  if (!id || id.length > 128) throw createError({ statusCode: 400, message: 'ID requis.' })

  const existing = await db.execute({ sql: 'SELECT * FROM vault_items WHERE id = ? AND user_id = ?', args: [id, session.user.id] })
  if (!existing.rows.length) throw createError({ statusCode: 404, message: 'Élément introuvable.' })
  const current = existing.rows[0] as any
  if (body.is_encrypted !== undefined && typeof body.is_encrypted !== 'boolean') throw createError({ statusCode: 400, message: 'is_encrypted invalide.' })
  if (body.favorite !== undefined && typeof body.favorite !== 'boolean') throw createError({ statusCode: 400, message: 'favorite invalide.' })

  const encrypted = body.is_encrypted === undefined ? Number(current.is_encrypted) === 1 : body.is_encrypted
  let payload = body.payload === undefined ? current.payload : body.payload
  const iv = body.iv === undefined ? current.iv : body.iv
  if (body.is_encrypted === false) throw createError({ statusCode: 400, message: 'Un élément chiffré ne peut pas être repassé en clair.' })
  if (!encrypted && (body.payload !== undefined || body.iv !== undefined)) throw createError({ statusCode: 400, message: 'Chiffrez cet ancien élément avant de modifier son contenu.' })
  if (current.type !== 'link' && !encrypted) throw createError({ statusCode: 400, message: 'Cet élément doit rester chiffré.' })
  if (encrypted) assertEncryptedPayload(payload, iv)

  const updates: string[] = []
  const args: any[] = []
  if (body.label !== undefined) { updates.push('label = ?'); args.push(requireString(body.label, 'Label', { min: 0, max: 200 })) }
  if (body.payload !== undefined) { updates.push('payload = ?'); args.push(payload) }
  if (body.iv !== undefined) { updates.push('iv = ?'); args.push(iv) }
  if (body.is_encrypted !== undefined) { updates.push('is_encrypted = ?'); args.push(encrypted ? 1 : 0) }
  if (body.favorite !== undefined) { updates.push('favorite = ?'); args.push(body.favorite ? 1 : 0) }
  if (body.url !== undefined) { updates.push('url = ?'); args.push(optionalHttpUrl(body.url)) }
  if (!updates.length) throw createError({ statusCode: 400, message: 'Aucune modification fournie.' })

  const snapshotNeeded = ['label', 'payload', 'iv', 'is_encrypted', 'url']
    .some(field => body[field] !== undefined)
  updates.push("updated_at = datetime('now')")
  args.push(id, session.user.id)

  if (!snapshotNeeded) {
    await db.execute({ sql: `UPDATE vault_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, args })
    return { message: 'Élément mis à jour.', version: null }
  }

  const versionResult = await db.execute({ sql: 'SELECT COALESCE(MAX(version), 0) + 1 AS version FROM vault_item_history WHERE item_id = ? AND user_id = ?', args: [id, session.user.id] })
  const version = Number(versionResult.rows[0]?.version) || 1
  await db.batch([
    { sql: "INSERT INTO vault_item_history (id, item_id, user_id, version, label, payload, iv, url, is_encrypted, favorite, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", args: [crypto.randomUUID(), id, session.user.id, version, current.label, current.payload, current.iv, current.url, current.is_encrypted, current.favorite] },
    { sql: `UPDATE vault_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, args },
    { sql: 'DELETE FROM vault_item_history WHERE item_id = ? AND user_id = ? AND id NOT IN (SELECT id FROM vault_item_history WHERE item_id = ? AND user_id = ? ORDER BY version DESC LIMIT 50)', args: [id, session.user.id, id, session.user.id] },
  ], 'write')
  return { message: 'Élément mis à jour.', version }
})
