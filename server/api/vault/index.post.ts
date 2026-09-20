export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  await enforceRateLimit(event, 'vault-create', 120, 60 * 1000, String(session.user.id))
  const db = useDB()
  const body = requireRecord(await readBody(event))
  const type = body.type
  const allowedTypes = ['link', 'password', 'crypto', 'recovery', 'note', 'totp']
  if (typeof type !== 'string' || !allowedTypes.includes(type)) throw createError({ statusCode: 400, message: 'Type de coffre invalide.' })

  const label = body.label === undefined ? '' : requireString(body.label, 'Label', { min: 0, max: 200 })
  const isEncrypted = body.is_encrypted === undefined ? true : body.is_encrypted
  if (typeof isEncrypted !== 'boolean') throw createError({ statusCode: 400, message: 'is_encrypted doit être un booléen.' })
  if (!isEncrypted) throw createError({ statusCode: 400, message: 'Toutes les données du coffre doivent être chiffrées côté client.' })

  const encrypted = assertEncryptedPayload(body.payload, body.iv)
  const payload = encrypted.payload
  const iv = encrypted.iv
  const url = optionalHttpUrl(body.url)

  const vaultId = typeof body.vault_id === 'string' && body.vault_id.length <= 128 ? body.vault_id : `default-${session.user.id}`
  const folderId = typeof body.folder_id === 'string' && body.folder_id.length <= 128 ? body.folder_id : null
  const tagIds = Array.isArray(body.tag_ids)
    ? [...new Set(body.tag_ids.filter((value): value is string => typeof value === 'string' && value.length <= 128))].slice(0, 20)
    : []
  const favorite = body.favorite === undefined ? false : body.favorite
  if (typeof favorite !== 'boolean') throw createError({ statusCode: 400, message: 'favorite doit être un booléen.' })

  const vault = await db.execute({ sql: 'SELECT id FROM vaults WHERE id = ? AND user_id = ?', args: [vaultId, session.user.id] })
  if (!vault.rows.length) throw createError({ statusCode: 400, message: 'Coffre introuvable.' })
  if (folderId) {
    const folder = await db.execute({ sql: 'SELECT id FROM folders WHERE id = ? AND vault_id = ? AND user_id = ?', args: [folderId, vaultId, session.user.id] })
    if (!folder.rows.length) throw createError({ statusCode: 400, message: 'Dossier introuvable.' })
  }

  const id = crypto.randomUUID()
  const statements: any[] = [{
    sql: "INSERT INTO vault_items (id, user_id, vault_id, folder_id, type, label, is_encrypted, payload, iv, url, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
    args: [id, session.user.id, vaultId, folderId, type, label, isEncrypted ? 1 : 0, payload, iv, url, favorite ? 1 : 0],
  }]
  for (const tagId of tagIds) statements.push({
    sql: 'INSERT OR IGNORE INTO vault_item_tags (item_id, tag_id) SELECT ?, id FROM tags WHERE id = ? AND user_id = ?',
    args: [id, tagId, session.user.id],
  })

  try {
    await db.batch(statements, 'write')
  } catch (error: any) {
    // Never log the statement or bound ciphertext; keep only a correlation id and error code.
    const reference = crypto.randomUUID()
    console.error(`[vault-create:${reference}]`, error?.code || error?.name || 'unknown-error')
    throw createError({ statusCode: 500, message: `Impossible d’enregistrer cet élément. (réf. ${reference})` })
  }
  return { id, message: 'Élément ajouté.' }
})
