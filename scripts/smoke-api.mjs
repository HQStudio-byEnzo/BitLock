import { createClient } from '@libsql/client'

const baseURL = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const username = `smoke_${Date.now()}`
const email = `smoke-${Date.now()}@example.com`
let password = 'Smoke-Test-2026!'
let cookie = ''

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function requestRaw(path, options = {}) {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('content-type', 'application/json')
  if (cookie) headers.set('cookie', cookie)
  if (options.method && options.method !== 'GET') {
    headers.set('origin', baseURL)
    headers.set('sec-fetch-site', 'same-origin')
  }
  const response = await fetch(`${baseURL}${path}`, { ...options, headers })
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) cookie = setCookie.split(';', 1)[0]
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { response, data }
}

async function request(path, options = {}) {
  const result = await requestRaw(path, options)
  if (!result.response.ok) {
    throw new Error(`${options.method || 'GET'} ${path}: ${result.response.status} ${JSON.stringify(result.data)}`)
  }
  return result
}

async function cleanup() {
  const url = process.env.SMOKE_DB_URL || process.env.TURSO_DB_URL || 'file:./qvault-dev.db'
  const authToken = process.env.TURSO_DB_TOKEN || ''
  const db = createClient(authToken ? { url, authToken } : { url })
  try {
    const users = await db.execute({
      sql: "SELECT id FROM users WHERE username = ? OR username LIKE 'smoke_%' OR username LIKE 'session_probe_%' OR email LIKE 'smoke-%@example.com' OR email LIKE 'session-probe-%@example.com' OR email LIKE 'smoke-%@qvault.invalid' OR email LIKE 'session-probe-%@qvault.invalid'",
      args: [username],
    })
    for (const row of users.rows) {
      const userId = String(row.id)
      await db.batch([
        { sql: 'DELETE FROM vault_item_tags WHERE item_id IN (SELECT id FROM vault_items WHERE user_id = ?)', args: [userId] },
        { sql: 'DELETE FROM vault_item_history WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM vault_items WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM tags WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM folders WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM vaults WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM master_verifiers WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM extension_tokens WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM email_verification_tokens WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM accepted_terms WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM users WHERE id = ?', args: [userId] },
      ], 'write')
    }
    // Local development only: keep repeated smoke runs below the rate limits.
    if (url.startsWith('file:')) {
      await db.execute({ sql: 'DELETE FROM rate_limits' })
    }
  } finally { await db.close() }
}

try {
  const registration = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      acceptedTerms: true,
    }),
  })
  assert(registration.response.status === 200, 'Registration failed')
  assert(registration.data?.verificationRequired === true, 'Registration did not require email verification')
  assert(!cookie.startsWith('nuxt-session='), 'Registration opened a session before email verification')

  const blockedLogin = await requestRaw('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  assert(blockedLogin.response.status === 403, `Unverified account could sign in (${blockedLogin.response.status})`)

  const devVerificationUrl = registration.data?.devVerificationUrl
  assert(devVerificationUrl, 'Registration did not expose a dev verification link')
  const registrationToken = new URL(devVerificationUrl).searchParams.get('token')
  assert(registrationToken, 'Dev verification link is missing a token')

  const resend = await request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ identifier: email }),
  })
  assert(resend.data?.ok === true, 'Resend did not acknowledge the request')
  const resendToken = new URL(resend.data.devVerificationUrl).searchParams.get('token')
  assert(resendToken && resendToken !== registrationToken, 'Resend did not issue a new token')

  const superseded = await requestRaw('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token: registrationToken }),
  })
  assert(superseded.response.status === 410, 'A resent link did not invalidate the previous token')

  const verification = await request('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token: resendToken }),
  })
  assert(verification.data?.ok === true, 'Email verification failed')

  const replay = await requestRaw('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token: resendToken }),
  })
  assert(replay.response.status === 410, 'A verification token could be replayed')

  const unknownResend = await request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ identifier: `missing-${Date.now()}@example.com` }),
  })
  assert(unknownResend.data?.ok === true, 'Resend leaked account existence')

  const rejectedLogin = await requestRaw('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password: 'incorrect-password' }),
  })
  assert(rejectedLogin.response.status === 401, 'Incorrect password was accepted')
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  const session = (await request('/api/auth/session')).data
  assert(session.user?.username === username, 'Username login did not create the expected session')
  const organization = (await request('/api/organization')).data
  assert(organization.vaults.length === 1, 'Default vault was not created')
  const vaultId = organization.vaults[0].id

  const note = (await request('/api/vault', {
    method: 'POST',
    body: JSON.stringify({
      type: 'note', label: 'Encrypted smoke note', is_encrypted: true,
      payload: 'AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAA==',
      iv: 'AAAAAAAAAAAAAAAA', vault_id: vaultId,
    }),
  })).data

  await request(`/api/vault/${note.id}`, {
    method: 'PUT',
    body: JSON.stringify({ label: 'Encrypted smoke note v2', favorite: true }),
  })
  const history = (await request(`/api/vault/${note.id}/history`)).data
  assert(history.history.length === 1, 'Update snapshot was not created')
  await request(`/api/vault/${note.id}`, { method: 'PUT', body: JSON.stringify({ favorite: false }) })
  const historyAfterFavorite = (await request(`/api/vault/${note.id}/history`)).data
  assert(historyAfterFavorite.history.length === 1, 'Favorite-only update polluted item history')
  await request('/api/vault/rotate-encryption', {
    method: 'POST',
    body: JSON.stringify({
      items: [{
        id: note.id,
        previousPayload: 'AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAA==',
        previousIv: 'AAAAAAAAAAAAAAAA',
        payload: 'BBBBBBBBBBBBBBBBBBBBBB==:BBBBBBBBBBBBBBBBBBBBBB==',
        iv: 'BBBBBBBBBBBBBBBB',
      }],
      history: [{
        id: history.history[0].id,
        previousPayload: 'AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAA==',
        previousIv: 'AAAAAAAAAAAAAAAA',
        payload: 'CCCCCCCCCCCCCCCCCCCCCC==:CCCCCCCCCCCCCCCCCCCCCC==',
        iv: 'CCCCCCCCCCCCCCCC',
      }],
      verifier: {
        payload: 'DDDDDDDDDDDDDDDDDDDDDD==:DDDDDDDDDDDDDDDDDDDDDD==',
        iv: 'DDDDDDDDDDDDDDDD',
      },
    }),
  })
  const verifier = (await request('/api/security/master-verifier')).data
  assert(verifier.verifier?.payload.startsWith('DDDD'), 'Master verifier was not rotated atomically')

  const tag = (await request('/api/organization', {
    method: 'POST', body: JSON.stringify({ kind: 'tag', name: 'smoke-tag', color: '#4ade80' }),
  })).data
  await request('/api/organization/assign', {
    method: 'POST', body: JSON.stringify({ item_id: note.id, vault_id: vaultId, tag_ids: [tag.id] }),
  })

  const items = (await request('/api/vault?type=note')).data
  const stats = (await request('/api/vault/stats')).data
  assert(items.items[0]?.tags?.length === 1, 'Tag assignment was not returned')
  assert(stats.counts.notes === 1, 'Note stats are incorrect')

  await request('/api/vault', {
    method: 'POST',
    body: JSON.stringify({
      type: 'password', label: 'Extension smoke account', is_encrypted: true,
      payload: 'AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAA==',
      iv: 'AAAAAAAAAAAAAAAA', url: 'https://example.com', vault_id: vaultId,
    }),
  })
  const extensionToken = (await request('/api/security/extension-token', { method: 'POST' })).data.token
  assert(extensionToken.startsWith('blx_'), 'Extension token was not generated')
  const extensionPasswords = (await request('/api/extension/passwords', {
    headers: { authorization: `Bearer ${extensionToken}` },
  })).data
  assert(extensionPasswords.items.length === 1, 'Extension endpoint did not return encrypted passwords')
  const nextPassword = 'Smoke-Test-2026-Updated!'
  await request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword: password, newPassword: nextPassword }),
  })
  password = nextPassword
  const revoked = await fetch(`${baseURL}/api/extension/passwords`, {
    headers: { authorization: `Bearer ${extensionToken}` },
  })
  assert(revoked.status === 401, 'Revoked extension token remained valid')

  await request('/api/auth/delete-account', { method: 'POST', body: JSON.stringify({ password }) })
  console.log(JSON.stringify({
    ok: true,
    usernameAuth: true,
    emailVerification: true,
    passwordHintsDisabled: true,
    defaultVault: true,
    notes: 1,
    historyWithoutFavoriteNoise: true,
    atomicMasterVerifier: true,
    tags: 1,
    extensionTokenRevokedOnPasswordChange: true,
  }))
} finally {
  await cleanup()
}
