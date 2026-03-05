interface User {
  id: string
  email: string
  role: string
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const setupComplete = useState<boolean | null>('setup-complete', () => null)
  const sessionExpired = useState<boolean>('session-expired', () => false)

  async function checkSetup() {
    try {
      const data = await $fetch<{ setup_complete: boolean }>('/api/health')
      setupComplete.value = data.setup_complete
    } catch {
      setupComplete.value = null
    }
  }

  async function fetchUser() {
    try {
      const data = await $fetch<{ user: User }>('/api/auth/me')
      user.value = data.user
      sessionExpired.value = false
    } catch (err: any) {
      user.value = null
      if (err.data?.data?.expired) {
        sessionExpired.value = true
      }
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
    setupComplete.value = true
    sessionExpired.value = false
  }

  async function setup(body: {
    email: string
    password: string
    confirmPassword: string
    displayName?: string
  }) {
    const data = await $fetch<{ user: User }>('/api/auth/setup', {
      method: 'POST',
      body,
    })
    user.value = data.user
    setupComplete.value = true
    sessionExpired.value = false
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    sessionExpired.value = false
  }

  return {
    user,
    setupComplete,
    sessionExpired,
    checkSetup,
    fetchUser,
    login,
    setup,
    logout,
  }
}
