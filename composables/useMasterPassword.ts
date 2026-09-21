import { MASTER_VERIFIER_TEXT } from '~/utils/brand'
import { MIN_MASTER_PASSWORD_LENGTH } from '~/utils/security-policy'

interface MasterVerifierResponse {
  configured: boolean
  verifier: { payload: string; iv: string } | null
  probe: { payload: string; iv: string } | null
}

export function useMasterPassword() {
  const masterPassword = useState<string | null>('qvault-master-password', () => null)
  const verifying = useState('qvault-master-password-verifying', () => false)
  const { encrypt, decrypt, serializeEncryptedPayload, parseEncryptedPayload } = useCrypto()

  const isUnlocked = computed(() => !!masterPassword.value)

  function setMasterPassword(value: string) {
    masterPassword.value = value
  }

  function clearMasterPassword() {
    masterPassword.value = null
  }

  async function writeVerifier(value: string) {
    const encrypted = await encrypt(MASTER_VERIFIER_TEXT, value)
    await $fetch('/api/security/master-verifier', {
      method: 'PUT',
      body: {
        payload: serializeEncryptedPayload(encrypted),
        iv: encrypted.iv,
      },
    })
  }

  async function initializeMasterPassword(value: string) {
    if (value.length < MIN_MASTER_PASSWORD_LENGTH) throw new Error('MASTER_PASSWORD_TOO_SHORT')
    await writeVerifier(value)
    setMasterPassword(value)
  }

  async function decryptEnvelope(envelope: { payload: string; iv: string }, value: string) {
    const { salt, ciphertext, iterations } = parseEncryptedPayload(envelope.payload)
    return decrypt(ciphertext, envelope.iv, value, salt, iterations)
  }

  async function unlockMasterPassword(value: string) {
    if (!value) throw new Error('MASTER_PASSWORD_REQUIRED')
    verifying.value = true

    try {
      const state: MasterVerifierResponse = await $fetch('/api/security/master-verifier')

      if (state.configured && state.verifier) {
        const result = await decryptEnvelope(state.verifier, value)
        if (result !== MASTER_VERIFIER_TEXT) throw new Error('MASTER_PASSWORD_INVALID')
      } else if (state.probe) {
        await decryptEnvelope(state.probe, value)
        await writeVerifier(value)
      } else {
        await writeVerifier(value)
      }

      setMasterPassword(value)
      return true
    } catch (error: any) {
      clearMasterPassword()
      if (String(error?.message || error).startsWith('MASTER_')) throw error
      throw new Error('MASTER_PASSWORD_INVALID')
    } finally {
      verifying.value = false
    }
  }

  return {
    masterPassword,
    isUnlocked,
    verifying,
    setMasterPassword,
    clearMasterPassword,
    initializeMasterPassword,
    unlockMasterPassword,
  }
}
