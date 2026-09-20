import { randomBytes } from 'node:crypto'

const SCRIPT_NONCE_PLACEHOLDER = /<script(?![^>]*\bnonce=)(?=[\s>])/gi

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response) => {
    if (response.headers) {
      delete response.headers['x-powered-by']
      delete response.headers['X-Powered-By']
    }
  })

  // Issue a per-request nonce so the Nuxt inline bootstrap scripts run without
  // weakening script-src with 'unsafe-inline'.
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const nonce = randomBytes(16).toString('base64')
    const withNonce = (chunk: string) => chunk.replace(SCRIPT_NONCE_PLACEHOLDER, `<script nonce="${nonce}"`)

    const htmlRecord = html as unknown as Record<string, unknown>
    for (const key of ['head', 'bodyPrepend', 'bodyAppend', 'body']) {
      const value = htmlRecord[key]
      if (Array.isArray(value)) htmlRecord[key] = value.map(withNonce)
      else if (typeof value === 'string') htmlRecord[key] = withNonce(value)
    }

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data:",
      process.env.NODE_ENV === 'production' ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
      'upgrade-insecure-requests',
    ].join('; ')

    setResponseHeader(event, 'Content-Security-Policy', csp)
  })
})
