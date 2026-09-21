import { createClient } from '@libsql/client'
import { randomUUID } from 'node:crypto'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { ensureVaultSchema } from '../server/utils/vault-schema.ts'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const databasePath = join(process.cwd(), `qvault-migration-${randomUUID()}.db`)
const db = createClient({ url: `file:${databasePath}` })

try {
  await db.execute('PRAGMA foreign_keys = ON')
  await db.batch([
    `CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      password_hint TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE vault_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('link', 'password', 'crypto', 'recovery')),
      label TEXT NOT NULL DEFAULT '',
      is_encrypted INTEGER NOT NULL DEFAULT 0,
      payload TEXT NOT NULL,
      iv TEXT,
      url TEXT,
      favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    {
      sql: `INSERT INTO users (id, name, email, password, password_hint)
            VALUES (?, ?, ?, ?, ?)`,
      args: ['legacy-user', 'Legacy User', 'legacy@example.com', 'hash', 'legacy hint'],
    },
    {
      sql: `INSERT INTO vault_items (id, user_id, type, label, payload)
            VALUES (?, ?, 'password', ?, ?)`,
      args: ['legacy-item', 'legacy-user', 'Legacy password', 'ciphertext'],
    },
  ], 'write')

  await ensureVaultSchema(db)

  const migratedUser = await db.execute({
    sql: 'SELECT username, email, session_version, password_hint FROM users WHERE id = ?',
    args: ['legacy-user'],
  })
  assert(migratedUser.rows[0]?.username === 'legacy_user', 'Legacy username was not derived')
  assert(migratedUser.rows[0]?.email === 'legacy@example.com', 'Legacy email was overwritten')
  assert(Number(migratedUser.rows[0]?.session_version) === 0, 'Session version was not added')
  assert(migratedUser.rows[0]?.password_hint === null, 'Legacy password hint was not removed')

  const rateLimitSchema = await db.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'rate_limits'",
  })
  assert(rateLimitSchema.rows.length === 1, 'Distributed rate-limit table was not created')

  const migratedItem = await db.execute({
    sql: 'SELECT vault_id, type, label, payload FROM vault_items WHERE id = ?',
    args: ['legacy-item'],
  })
  assert(migratedItem.rows[0]?.vault_id === 'default-legacy-user', 'Default vault was not assigned')
  assert(migratedItem.rows[0]?.payload === 'ciphertext', 'Legacy ciphertext was changed')

  const itemSchema = await db.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'vault_items'",
  })
  const schemaSql = String(itemSchema.rows[0]?.sql || '')
  assert(schemaSql.includes("'note'") && schemaSql.includes("'totp'"), 'New item types are missing')

  console.log(JSON.stringify({
    ok: true,
    legacyEmailPreserved: true,
    usernameMigrated: true,
    ciphertextPreserved: true,
    defaultVaultAssigned: true,
    distributedRateLimitReady: true,
  }))
} finally {
  await db.close()
  await unlink(databasePath).catch(() => {})
}
