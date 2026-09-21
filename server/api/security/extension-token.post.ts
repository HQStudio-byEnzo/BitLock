export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  await enforceRateLimit(event, 'extension-token-create', 10, 60 * 60 * 1000, String(session.user.id))
  const db = useDB()
  const sessionVersion = Number(session.user.sessionVersion ?? 0)

  const result = await issueExtensionToken(db, String(session.user.id), sessionVersion)

  setHeader(event, 'Cache-Control', 'no-store')
  return result
})
