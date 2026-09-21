/**
 * Canonical brand identifiers for QVault.
 *
 * The project was previously named "BitLock". Every identifier that can leave
 * the app or survive in a browser (exported files, credential payloads,
 * localStorage keys) must keep reading its legacy `bitlock` value so nothing
 * produced before the rebrand breaks. New artifacts always use `qvault`.
 */

/** Encrypted `.qvault` backup envelope (`format` field). */
export const BACKUP_FORMAT = 'qvault-backup'
export const LEGACY_BACKUP_FORMAT = 'bitlock-backup'

/** Offline transfer envelope (`format` field). */
export const TRANSFER_FORMAT = 'qvault-transfer'
export const LEGACY_TRANSFER_FORMAT = 'bitlock-transfer'

/** Password item payload schema (`schema` field). */
export const CREDENTIAL_SCHEMA = 'qvault.credentials/v1'
export const LEGACY_CREDENTIAL_SCHEMA = 'bitlock.credentials/v1'

/** localStorage namespace. Legacy keys are migrated once on the client by
 * `plugins/brand-migration.client.ts`. */
export const STORAGE_PREFIX = 'qvault'
export const LEGACY_STORAGE_PREFIX = 'bitlock'

/**
 * Plaintext marker encrypted with the master password to verify it.
 *
 * NEVER change this value: existing verifiers stored server-side were
 * encrypted with the legacy string, so changing it would lock every current
 * user out of their vault.
 */
export const MASTER_VERIFIER_TEXT = 'bitlock://master-verifier/v1'
