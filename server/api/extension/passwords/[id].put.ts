export default defineEventHandler(async (event) => {
  const { db, userId } = await requireExtensionAuth(event, 'passwords-write', 60)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Identifiant manquant.' })

  const body = requireRecord(await readBody(event))
  const label = requireString(body.label, 'Label', { min: 1, max: 200 })
  const encrypted = assertEncryptedPayload(body.payload, body.iv)
  const url = optionalHttpUrl(body.url)

  const existing = await db.execute({
    sql: "SELECT id FROM vault_items WHERE id = ? AND user_id = ? AND type = 'password'",
    args: [id, userId],
  })
  if (!existing.rows.length) {
    throw createError({ statusCode: 404, message: 'Identifiant introuvable.' })
  }

  await db.execute({
    sql: `UPDATE vault_items
          SET label = ?, payload = ?, iv = ?, url = ?, updated_at = datetime('now')
          WHERE id = ? AND user_id = ?`,
    args: [label, encrypted.payload, encrypted.iv, url, id, userId],
  })

  setHeader(event, 'Cache-Control', 'no-store')
  return { id, message: 'Identifiant mis à jour.' }
})
