interface StoredPasskey {
  version: 1
  credentialId: string
  salt: string
  iv: string
  encryptedMaster: string
}

const STORAGE_KEY = 'bitlock.security.passkeyUnlock'

function toBase64(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}
function fromBase64(value: string) { return Uint8Array.from(atob(value), char => char.charCodeAt(0)) }
function randomBytes(length: number) { return crypto.getRandomValues(new Uint8Array(length)) }

export function usePasskeyUnlock() {
  const { user } = useUserSession()
  const supported = useState('passkey-supported', () => false)
  const configured = useState('passkey-configured', () => false)

  function storageKey() {
    const owner = user.value?.id || user.value?.username || 'anonymous'
    return `${STORAGE_KEY}:${encodeURIComponent(String(owner))}`
  }

  function refreshConfigured() {
    configured.value = !!localStorage.getItem(storageKey())
  }

  onMounted(() => {
    supported.value = !!window.PublicKeyCredential && !!navigator.credentials
    refreshConfigured()
  })
  watch(() => user.value?.id || user.value?.username, () => {
    if (import.meta.client) refreshConfigured()
  })

  async function deriveKey(prf: ArrayBuffer) {
    const digest = await crypto.subtle.digest('SHA-256', prf)
    return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
  }

  async function enable(masterPassword: string, displayName: string) {
    if (!supported.value || !masterPassword) throw new Error('PASSKEY_UNAVAILABLE')
    const salt = randomBytes(32)
    const credential = await navigator.credentials.create({ publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'QVault' },
      user: { id: randomBytes(32), name: displayName, displayName },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      timeout: 60_000,
      authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
      attestation: 'none',
      extensions: { prf: { eval: { first: salt } } } as any,
    } }) as PublicKeyCredential | null
    if (!credential) throw new Error('PASSKEY_CANCELLED')
    const prf = (credential.getClientExtensionResults() as any)?.prf?.results?.first as ArrayBuffer | undefined
    if (!prf) throw new Error('PASSKEY_PRF_UNSUPPORTED')
    const key = await deriveKey(prf)
    const iv = randomBytes(12)
    const encryptedMaster = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(masterPassword))
    const stored: StoredPasskey = { version: 1, credentialId: toBase64(credential.rawId), salt: toBase64(salt), iv: toBase64(iv), encryptedMaster: toBase64(encryptedMaster) }
    localStorage.setItem(storageKey(), JSON.stringify(stored))
    configured.value = true
  }

  async function unlock() {
    const raw = localStorage.getItem(storageKey())
    if (!raw) throw new Error('PASSKEY_NOT_CONFIGURED')
    const stored = JSON.parse(raw) as StoredPasskey
    const salt = fromBase64(stored.salt)
    const assertion = await navigator.credentials.get({ publicKey: {
      challenge: randomBytes(32),
      allowCredentials: [{ type: 'public-key', id: fromBase64(stored.credentialId) }],
      timeout: 60_000,
      userVerification: 'required',
      extensions: { prf: { eval: { first: salt } } } as any,
    } }) as PublicKeyCredential | null
    if (!assertion) throw new Error('PASSKEY_CANCELLED')
    const prf = (assertion.getClientExtensionResults() as any)?.prf?.results?.first as ArrayBuffer | undefined
    if (!prf) throw new Error('PASSKEY_PRF_UNSUPPORTED')
    const key = await deriveKey(prf)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(stored.iv) }, key, fromBase64(stored.encryptedMaster))
    return new TextDecoder().decode(decrypted)
  }

  function disable() { localStorage.removeItem(storageKey()); configured.value = false }
  return { supported, configured, enable, unlock, disable }
}
