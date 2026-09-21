import { LEGACY_STORAGE_PREFIX, STORAGE_PREFIX } from '~/utils/brand'

/**
 * One-time, idempotent migration of the legacy `bitlock*` localStorage
 * namespace to `qvault*`. Runs before the other client plugins (alphabetical
 * order) so `lang.client.ts` already reads the migrated key.
 *
 * Values are copied before the legacy key is removed, and an existing
 * `qvault*` value always wins, so re-running the migration can never lose or
 * overwrite a newer preference.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  try {
    const legacyKeys: string[] = []
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key && key.startsWith(LEGACY_STORAGE_PREFIX)) legacyKeys.push(key)
    }

    for (const legacyKey of legacyKeys) {
      const currentKey = `${STORAGE_PREFIX}${legacyKey.slice(LEGACY_STORAGE_PREFIX.length)}`
      const value = localStorage.getItem(legacyKey)
      if (value !== null && localStorage.getItem(currentKey) === null) {
        localStorage.setItem(currentKey, value)
      }
      localStorage.removeItem(legacyKey)
    }
  } catch {
    // Storage can be unavailable (private mode, disabled cookies). Preferences
    // then simply fall back to their defaults.
  }
})
