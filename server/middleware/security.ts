function requestOrigin(event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
  const forwardedHost = getRequestHeader(event, 'x-forwarded-host')
  const host = forwardedHost || getRequestHeader(event, 'host')
  const forwardedProto = getRequestHeader(event, 'x-forwarded-proto')
  const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  return host ? `${protocol}://${host}` : null
}

function allowedOrigins(event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
  const allowed = new Set<string>()
  const configuredAppUrl = String(useRuntimeConfig().appUrl || '').trim()
  if (configuredAppUrl) {
    try { allowed.add(new URL(configuredAppUrl).origin) } catch { /* ignore malformed config */ }
  }
  const derived = requestOrigin(event)
  if (derived) allowed.add(derived)
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
