import type { H3Event } from 'h3'

function requestOrigin(event: H3Event) {
  const forwardedHost = getRequestHeader(event, 'x-forwarded-host')
  const host = forwardedHost || getRequestHeader(event, 'host')
  const forwardedProto = getRequestHeader(event, 'x-forwarded-proto')
  const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  return host ? `${protocol}://${host}` : null
}

function addOrigin(target: Set<string>, value: unknown) {
  const candidate = String(value || '').trim()
  if (!candidate) return
  try {
    target.add(new URL(candidate).origin)
  } catch {
    // Ignore malformed values rather than widening the allowlist.
  }
}

function allowedOrigins(event: H3Event) {
  const allowed = new Set<string>()
  // The configured app URL is the single trusted origin in production.
  addOrigin(allowed, useRuntimeConfig().appUrl)
  // Vercel exposes the deployment URL so previews and the platform alias keep
  // working without trusting an arbitrary Host header.
  addOrigin(allowed, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  addOrigin(allowed, process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
  // Outside production the request host is trusted so localhost and LAN hosts work.
  if (process.env.NODE_ENV !== 'production') addOrigin(allowed, requestOrigin(event))
  return allowed
}

export default defineEventHandler((event) => {
  removeResponseHeader(event, 'x-powered-by')
  if (getRequestURL(event).pathname.startsWith('/api/')) {
    setResponseHeaders(event, {
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    })
  }

  const method = getMethod(event).toUpperCase()
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return

  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  if (fetchSite === 'cross-site') {
    throw createError({ statusCode: 403, message: 'Cross-site request blocked.' })
  }

  const origin = getRequestHeader(event, 'origin')
  if (!origin) {
    // Fail closed: without an Origin header, only trust an explicit same-origin
    // Sec-Fetch-Site signal from a browser.
    if (fetchSite === 'same-origin' || fetchSite === 'same-site') return
    throw createError({ statusCode: 403, message: 'Missing request origin.' })
  }

  if (!allowedOrigins(event).has(origin)) {
    throw createError({ statusCode: 403, message: 'Invalid request origin.' })
  }
})
