/**
 * POST /api/auth/delete-account
 * Supprime définitivement le compte et toutes les données
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  await enforceRateLimit(event, 'auth-delete-account', 5, 60 * 60 * 1000, String(session.user.id))
  const body = requireRecord(await readBody(event))
  const password = requireString(body.password, 'Password', { min: 1, max: 128, trim: false })

  const db = useDB()

  // Vérifier le mot de passe
  const result = await db.execute({
    sql: 'SELECT password FROM users WHERE id = ?',
    args: [session.user.id],
  })

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, message: 'Utilisateur non trouvé.' })
  }

  const user = result.rows[0] as any
  const valid = await verifyUserPassword(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Mot de passe incorrect.' })
  }

  // Delete all account-owned data atomically. This also works when SQLite
  // foreign-key enforcement is not enabled by the hosting environment.
  await db.batch([
    { sql: 'DELETE FROM vault_item_tags WHERE item_id IN (SELECT id FROM vault_items WHERE user_id = ?)', args: [session.user.id] },
    { sql: 'DELETE FROM vault_item_history WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM vault_items WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM tags WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM folders WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM vaults WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM master_verifiers WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM extension_tokens WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM accepted_terms WHERE user_id = ?', args: [session.user.id] },
    { sql: 'DELETE FROM users WHERE id = ?', args: [session.user.id] },
  ], 'write')

  // Supprimer la session
  await clearUserSession(event)

  return { message: 'Compte supprimé définitivement.' }
})
