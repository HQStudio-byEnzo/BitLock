/**
 * POST /api/auth/refresh-email-state
 * Recalcule l'état de l'adresse e-mail depuis la base et met la session à jour.
 * Permet à /auth/complete-email de reprendre le bon écran au rechargement, et
 * de laisser entrer le compte dès que l'adresse a été confirmée, sans exiger
 * une reconnexion.
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const db = useDB(event)
  const result = await db.execute({
    sql: 'SELECT email, email_verified FROM users WHERE id = ?',
    args: [session.user.id],
  })

  const email = String(result.rows[0]?.email ?? '')
  const verified = Number(result.rows[0]?.email_verified) === 1
  const needsEmail = needsEmailCompletion(email, verified)

  if (needsEmail !== Boolean(session.user.needsEmail)) {
    await setUserSession(event, {
      ...session,
      user: { ...session.user, needsEmail },
    })
  }

  return {
    needsEmail,
    verified,
    // Only a real address is worth showing back to its owner.
    email: isPlaceholderEmail(email) ? '' : email,
  }
})
