/**
 * Never leak server internals to API clients.
 *
 * Nitro already omits the `stack` field when NODE_ENV is production, but a
 * preview or staging run would return it. Redefining the error stack here keeps
 * the field out of every API error response in any environment. Non-API
 * responses keep the stack for local debugging.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    if (!event) return
    if (!getRequestURL(event).pathname.startsWith('/api/')) return
    try {
      Object.defineProperty(error, 'stack', { value: '', configurable: true })
    } catch {
      // A non-configurable stack is left untouched.
    }
  })
})
