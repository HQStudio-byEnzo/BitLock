import { CREDENTIAL_SCHEMA, LEGACY_CREDENTIAL_SCHEMA } from './brand'

export interface PasswordEntry {
  schema?: typeof CREDENTIAL_SCHEMA | typeof LEGACY_CREDENTIAL_SCHEMA
  password: string
  username?: string
  email?: string
  phone?: string
}

function cleanOptional(value: unknown) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function serializePasswordEntry(entry: PasswordEntry) {
  return JSON.stringify({
    schema: CREDENTIAL_SCHEMA,
    password: entry.password,
    username: cleanOptional(entry.username),
    email: cleanOptional(entry.email),
    phone: cleanOptional(entry.phone),
  })
}

export function parsePasswordEntry(payload: string): PasswordEntry {
  try {
    const parsed = JSON.parse(payload)
    if (parsed && typeof parsed === 'object' && typeof parsed.password === 'string') {
      const schema = parsed.schema === CREDENTIAL_SCHEMA || parsed.schema === LEGACY_CREDENTIAL_SCHEMA
        ? parsed.schema as PasswordEntry['schema']
        : undefined
      return {
        schema,
        password: parsed.password,
        username: cleanOptional(parsed.username),
        email: cleanOptional(parsed.email),
        phone: cleanOptional(parsed.phone),
      }
    }
  } catch {
    // Older password items are stored as a plain string.
  }

  return { password: payload }
}
