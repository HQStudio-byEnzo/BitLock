/**
 * Composable de chiffrement Zero-Knowledge
 * Tout le chiffrement se fait EXCLUSIVEMENT côté client (navigateur)
 * Le serveur ne reçoit et ne stocke que le contenu secret sous forme chiffrée
 * 
 * Algorithmes utilisés :
 * - Dérivation de clé : PBKDF2 avec SHA-256 (600 000 itérations)
 * - Chiffrement : AES-256-GCM (authentifié)
 */
export const LEGACY_PBKDF2_ITERATIONS = 100_000
export const PBKDF2_ITERATIONS = 600_000
const ENCRYPTED_PAYLOAD_VERSION = 'v2'

export interface EncryptedPayload {
  ciphertext: string
  iv: string
  salt: string
  iterations: number
}

export function serializeEncryptedPayload(value: Pick<EncryptedPayload, 'salt' | 'ciphertext'>) {
  return `${ENCRYPTED_PAYLOAD_VERSION}:${PBKDF2_ITERATIONS}:${value.salt}:${value.ciphertext}`
}

export function parseEncryptedPayload(payload: string) {
  const parts = payload.split(':')
  if (parts.length === 2 && parts.every(Boolean)) {
    return { salt: parts[0], ciphertext: parts[1], iterations: LEGACY_PBKDF2_ITERATIONS }
  }
  if (
    parts.length === 4 &&
    parts[0] === ENCRYPTED_PAYLOAD_VERSION &&
    Number(parts[1]) === PBKDF2_ITERATIONS &&
    parts[2] &&
    parts[3]
  ) {
    return { salt: parts[2], ciphertext: parts[3], iterations: PBKDF2_ITERATIONS }
  }
  throw new Error('INVALID_ENCRYPTED_PAYLOAD')
}

export function useCrypto() {
  /**
   * Dérive une clé AES-256 à partir d'un mot de passe maître et d'un sel
   * Utilise PBKDF2 avec un facteur de travail versionné
   */
  async function deriveKey(masterPassword: string, salt: BufferSource, iterations = PBKDF2_ITERATIONS): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    
    // Importer le mot de passe comme clé brute
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    // Dériver la clé AES-256
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Génère un sel aléatoire (16 bytes)
   */
  function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16))
  }

  /**
   * Génère un IV (Initialization Vector) aléatoire (12 bytes pour AES-GCM)
   */
  function generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12))
  }

  /**
   * Chiffre un texte en clair avec AES-256-GCM
   * @returns Objet contenant le texte chiffré (base64) et l'IV (base64)
   */
  async function encrypt(
    plaintext: string,
    masterPassword: string,
    salt?: Uint8Array
  ): Promise<EncryptedPayload> {
    const encoder = new TextEncoder()
    const usedSalt = salt || generateSalt()
    const iv = generateIV()
    
    const key = await deriveKey(masterPassword, toArrayBuffer(usedSalt))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      encoder.encode(plaintext)
    )

    return {
      ciphertext: arrayBufferToBase64(encrypted),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(usedSalt),
      iterations: PBKDF2_ITERATIONS,
    }
  }

  /**
   * Déchiffre un texte chiffré avec AES-256-GCM
   * @returns Le texte en clair
   */
  async function decrypt(
    ciphertext: string,
    iv: string,
    masterPassword: string,
    salt: string,
    iterations = PBKDF2_ITERATIONS,
  ): Promise<string> {
    const decoder = new TextDecoder()
    
    const key = await deriveKey(masterPassword, base64ToArrayBuffer(salt), iterations)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToArrayBuffer(iv) },
      key,
      base64ToArrayBuffer(ciphertext)
    )

    return decoder.decode(decrypted)
  }

  /**
   * Convertit un ArrayBuffer en string Base64
   */
  function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    return btoa(binary)
  }

  /**
   * Convertit une string Base64 en Uint8Array
   */
  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return new Uint8Array(bytes).buffer
  }

  return {
    encrypt,
    decrypt,
    generateSalt,
    generateIV,
    deriveKey,
    arrayBufferToBase64,
    base64ToArrayBuffer,
    serializeEncryptedPayload,
    parseEncryptedPayload,
  }
}
