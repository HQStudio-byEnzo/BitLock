declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    created_at?: string
    sessionVersion?: number
    /**
     * True while the account has no usable address (accounts created before
     * email verification). Route middleware confines it to /auth/complete-email.
     */
    needsEmail?: boolean
  }

  interface UserSession {
    hintChallenge?: {
      identifier: string
      expiresAt: number
    }
  }
}

export {}
