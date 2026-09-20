import type { H3Event } from 'h3'

export const LEGAL_TERMS_VERSION = '2026-06-03'

/**
 * Consent records are kept for audit purposes; the IP is truncated to reduce the
 * personal-data footprint while still evidencing the origin network.
 */
export function truncateIp(ip: string | null | undefined): string | null {
  if (!ip) return null
  const value = ip.trim()
  if (!value) return null
  if (value.includes('.')) {
    const parts = value.split('.')
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  }
  if (value.includes(':')) {
    return `${value.split(':').slice(0, 4).join(':')}::`
  }
  return value
}

export async function getLegalAcceptance(event: H3Event, userId: string) {
  const db = useDB(event)
  const result = await db.execute({
    sql: 'SELECT terms_version, accepted_at FROM accepted_terms WHERE user_id = ?',
    args: [userId],
  })

  const row = result.rows[0] as any | undefined
  return {
    accepted: !!row && row.terms_version === LEGAL_TERMS_VERSION,
    version: row?.terms_version || null,
    acceptedAt: row?.accepted_at || null,
  }
}

export async function setLegalAcceptance(event: H3Event, userId: string) {
  const db = useDB(event)
  await db.execute({
    sql: `INSERT INTO accepted_terms (user_id, terms_version, accepted_at, user_agent, ip_address)
          VALUES (?, ?, datetime('now'), ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            terms_version = excluded.terms_version,
            accepted_at = excluded.accepted_at,
            user_agent = excluded.user_agent,
            ip_address = excluded.ip_address`,
    args: [
      userId,
      LEGAL_TERMS_VERSION,
      getRequestHeader(event, 'user-agent') || null,
      truncateIp(getRequestIP(event)),
    ],
  })
}
