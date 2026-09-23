/**
 * POST /api/auth/verify-email
 * Consomme un jeton de vérification et active le compte.
 */
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth-verify-email', 30, 60 * 60 * 1000)
  const body = requireRecord(await readBody(event))
  const token = assertVerificationToken(body.token)

  const db = useDB()
  await consumeVerificationToken(db, token)

  return { ok: true, message: 'Adresse e-mail confirmée. Vous pouvez vous connecter.' }
})
