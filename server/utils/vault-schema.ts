import type { createClient } from '@libsql/client'

const ITEM_COLUMNS = [
  'id', 'user_id', 'vault_id', 'folder_id', 'type', 'label', 'is_encrypted',
  'payload', 'iv', 'url', 'favorite', 'created_at', 'updated_at',
] as const

let migrationPromise: Promise<void> | null = null

function usernameBase(value: unknown, fallback: unknown) {
  const normalized = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/^[^a-z0-9]+/, '')
    .replace(/[._-]+$/, '')
    .slice(0, 24)
  const safe = normalized.length >= 3
    ? normalized
    : `user_${String(fallback).replace(/[^a-z0-9]/gi, '').slice(0, 8)}`
  return safe.slice(0, 24)
}

async function migrateUsernames(db: ReturnType<typeof createClient>) {
  const info = await db.execute({ sql: "PRAGMA table_info('users')" })
  if (!info.rows.some(row => String((row as any).name) === 'username')) {
    await db.execute({ sql: 'ALTER TABLE users ADD COLUMN username TEXT' })
  }

  const users = await db.execute({ sql: 'SELECT id, name, email, username FROM users ORDER BY created_at, id' })
  const used = new Set<string>()
  for (const row of users.rows as any[]) {
    const original = typeof row.username === 'string' ? row.username.toLowerCase() : ''
    const base = usernameBase(row.name || String(row.email || '').split('@')[0], row.id)
    let candidate = /^[a-z0-9][a-z0-9._-]{2,31}$/.test(original) && !used.has(original) ? original : base
    let suffix = 2
    while (used.has(candidate)) {
      const marker = `_${suffix++}`
      candidate = `${base.slice(0, 32 - marker.length)}${marker}`
    }
    used.add(candidate)
    await db.execute({
      sql: 'UPDATE users SET username = ? WHERE id = ?',
      args: [candidate, row.id],
    })
  }
  await db.execute({ sql: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)' })
}

async function ensureBaseSchema(db: ReturnType<typeof createClient>) {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, password_hint TEXT, session_version INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS vaults (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#4ade80', is_default INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, name), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS folders (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, vault_id TEXT NOT NULL, name TEXT NOT NULL, parent_id TEXT, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE, FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE SET NULL)`,
    `CREATE TABLE IF NOT EXISTS vault_items (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, vault_id TEXT, folder_id TEXT, type TEXT NOT NULL CHECK (type IN ('link', 'password', 'crypto', 'recovery', 'note', 'totp')), label TEXT NOT NULL DEFAULT '', is_encrypted INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL, iv TEXT, url TEXT, favorite INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE, FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL)`,
    `CREATE TABLE IF NOT EXISTS tags (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#4ade80', created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, name), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS vault_item_tags (item_id TEXT NOT NULL, tag_id TEXT NOT NULL, PRIMARY KEY (item_id, tag_id), FOREIGN KEY (item_id) REFERENCES vault_items(id) ON DELETE CASCADE, FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS vault_item_history (id TEXT PRIMARY KEY, item_id TEXT NOT NULL, user_id TEXT NOT NULL, version INTEGER NOT NULL, label TEXT NOT NULL, payload TEXT NOT NULL, iv TEXT, url TEXT, is_encrypted INTEGER NOT NULL, favorite INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(item_id, version), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    'CREATE INDEX IF NOT EXISTS idx_vault_history_item ON vault_item_history(user_id, item_id, version DESC)',
    `CREATE TABLE IF NOT EXISTS master_verifiers (user_id TEXT PRIMARY KEY, payload TEXT NOT NULL, iv TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS webauthn_credentials (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, credential_id TEXT NOT NULL, public_key TEXT NOT NULL, encrypted_unlock_key TEXT, unlock_iv TEXT, label TEXT NOT NULL DEFAULT 'Passkey', sign_count INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, credential_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS extension_tokens (user_id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (datetime('now')), last_used_at TEXT, expires_at TEXT, session_version INTEGER NOT NULL DEFAULT 0, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS accepted_terms (user_id TEXT PRIMARY KEY, terms_version TEXT NOT NULL, accepted_at TEXT NOT NULL DEFAULT (datetime('now')), user_agent TEXT, ip_address TEXT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)`,
    'CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at)',
  ], 'write')
}

async function seedDefaultVaults(db: ReturnType<typeof createClient>) {
  await db.execute({ sql: `INSERT OR IGNORE INTO vaults (id, user_id, name, color, is_default) SELECT 'default-' || id, id, 'Principal', '#4ade80', 1 FROM users` })
  await db.execute({ sql: `UPDATE vault_items SET vault_id = 'default-' || user_id WHERE vault_id IS NULL` })
}

async function ensureItemIndexes(db: ReturnType<typeof createClient>) {
  await db.batch([
    'CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON vault_items(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_vault_items_user_type ON vault_items(user_id, type)',
    'CREATE INDEX IF NOT EXISTS idx_vault_items_favorite ON vault_items(user_id, favorite)',
    'CREATE INDEX IF NOT EXISTS idx_vault_items_vault ON vault_items(user_id, vault_id)',
    'CREATE INDEX IF NOT EXISTS idx_vault_items_folder ON vault_items(user_id, folder_id)',
  ], 'write')
}

function isCurrentItemSchema(sql: string) {
  return sql.includes("'note'") && sql.includes("'totp'") && sql.includes('vault_id TEXT') && sql.includes('folder_id TEXT')
}

async function migrateItems(db: ReturnType<typeof createClient>) {
  const transaction = await db.transaction('write')
  let committed = false
  try {
    const tableInfo = await transaction.execute({ sql: "PRAGMA table_info('vault_items')" })
    if (tableInfo.rows.length === 0) {
      await transaction.commit()
      committed = true
      return
    }

    const columns = new Set(tableInfo.rows.map(row => String((row as any).name || '')))
    const master = await transaction.execute({ sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'vault_items'" })
    const currentSql = String((master.rows[0] as any)?.sql || '')
    if (columns.has('vault_id') && columns.has('folder_id') && isCurrentItemSchema(currentSql)) {
      await transaction.commit()
      committed = true
      return
    }

    const selections = ITEM_COLUMNS.map((column) => {
      if (columns.has(column)) return column
      if (column === 'vault_id' || column === 'folder_id' || column === 'url') return `NULL AS ${column}`
      if (column === 'favorite') return '0 AS favorite'
      if (column === 'created_at' || column === 'updated_at') return `datetime('now') AS ${column}`
      return column
    })

    await transaction.execute({ sql: 'DROP TABLE IF EXISTS vault_items_migrated' })
    await transaction.execute({ sql: `CREATE TABLE vault_items_migrated (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, vault_id TEXT, folder_id TEXT, type TEXT NOT NULL CHECK (type IN ('link', 'password', 'crypto', 'recovery', 'note', 'totp')), label TEXT NOT NULL DEFAULT '', is_encrypted INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL, iv TEXT, url TEXT, favorite INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE, FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL)` })
    await transaction.execute({ sql: `INSERT INTO vault_items_migrated (${ITEM_COLUMNS.join(', ')}) SELECT ${selections.join(', ')} FROM vault_items` })
    await transaction.execute({ sql: 'DROP TABLE vault_items' })
    await transaction.execute({ sql: 'ALTER TABLE vault_items_migrated RENAME TO vault_items' })
    await transaction.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON vault_items(user_id)' })
    await transaction.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_vault_items_user_type ON vault_items(user_id, type)' })
    await transaction.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_vault_items_favorite ON vault_items(user_id, favorite)' })
    await transaction.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_vault_items_vault ON vault_items(user_id, vault_id)' })
    await transaction.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_vault_items_folder ON vault_items(user_id, folder_id)' })
    await transaction.commit()
    committed = true
  } finally {
    if (!committed) await transaction.rollback().catch(() => {})
    transaction.close()
  }
}

async function ensureExtensionTokenColumns(db: ReturnType<typeof createClient>) {
  const info = await db.execute({ sql: "PRAGMA table_info('extension_tokens')" })
  if (info.rows.length === 0) return
  const columns = new Set(info.rows.map(row => String((row as any).name || '')))
  if (!columns.has('expires_at')) {
    await db.execute({ sql: 'ALTER TABLE extension_tokens ADD COLUMN expires_at TEXT' }).catch(() => {})
  }
  if (!columns.has('session_version')) {
    await db.execute({ sql: 'ALTER TABLE extension_tokens ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0' }).catch(() => {})
  }
}

async function runVaultSchemaMigration(db: ReturnType<typeof createClient>) {
  await ensureBaseSchema(db)
  const userInfo = await db.execute({ sql: "PRAGMA table_info('users')" })
  if (userInfo.rows.length > 0 && !userInfo.rows.some(row => String((row as any).name) === 'session_version')) {
    await db.execute({ sql: 'ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0' }).catch((error) => {
      if (!String((error as any)?.message || error).toLowerCase().includes('duplicate column')) throw error
    })
  }
  await migrateUsernames(db)
  if (userInfo.rows.some(row => String((row as any).name) === 'password_hint')) {
    await db.execute({ sql: 'UPDATE users SET password_hint = NULL WHERE password_hint IS NOT NULL' })
  }
  await migrateItems(db)
  await ensureItemIndexes(db)
  await ensureExtensionTokenColumns(db)
  await seedDefaultVaults(db)
}

export function ensureVaultSchema(db: ReturnType<typeof createClient>) {
  if (!migrationPromise) migrationPromise = runVaultSchemaMigration(db).finally(() => { migrationPromise = null })
  return migrationPromise
}
