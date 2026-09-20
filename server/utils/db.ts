import { createClient } from '@libsql/client'
import type { H3Event } from 'h3'
import { ensureVaultSchema } from './vault-schema'
import { useRuntimeConfig } from '#imports'

let dbClient: ReturnType<typeof createClient> | null = null
let dbReadyPromise: Promise<void> | null = null
let dbProxy: ReturnType<typeof createClient> | null = null

/**
 * Récupère le client SQLite local
 * Utilise un singleton pour réutiliser la connexion
 */
export function useDB(event?: H3Event) {
  if (dbProxy) return dbProxy

  const config = useRuntimeConfig()

  const configuredUrl = String(config.tursoDbUrl || '').trim()
  if (!configuredUrl && process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 503,
      message: 'TURSO_DB_URL is required in production.',
    })
  }
  const url = configuredUrl || 'file:./qvault-dev.db'
  const authToken = String(config.tursoDbToken || '').trim()

  dbClient = createClient(authToken ? { url, authToken } : { url })

  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      if (url.startsWith('file:')) {
        await dbClient!.execute('PRAGMA busy_timeout = 5000')
      }
      // Enforce foreign keys where the backend honors a connection-level pragma.
      // Remote libSQL may ignore this, so callers must still scope every query by user_id.
      await dbClient!.execute('PRAGMA foreign_keys = ON').catch(() => {})
      await ensureVaultSchema(dbClient!)
    })().finally(() => {
      dbReadyPromise = null
    })
  }

  dbProxy = new Proxy(dbClient as ReturnType<typeof createClient>, {
    get(target, prop, receiver) {
      if (prop === 'execute') {
        return async (...args: any[]) => {
          if (dbReadyPromise) await dbReadyPromise
          return (target.execute as any)(...args)
        }
      }

      if (prop === 'batch') {
        return async (...args: any[]) => {
          if (dbReadyPromise) await dbReadyPromise
          return (target.batch as any)(...args)
        }
      }

      if (prop === 'transaction') {
        return async (...args: any[]) => {
          if (dbReadyPromise) await dbReadyPromise
          return (target.transaction as any)(...args)
        }
      }

      const value = Reflect.get(target, prop, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  }) as ReturnType<typeof createClient>

  return dbProxy
}
