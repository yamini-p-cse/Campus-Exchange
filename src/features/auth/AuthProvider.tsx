import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import {
  clearSession,
  getCurrentUser,
  loginAccount,
  mapAuthUser,
  registerAccount,
} from './authService'
import type { MarketplaceUser } from './authService'
import { supabase } from '../../lib/supabase'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<MarketplaceUser | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    let isMounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapAuthUser(session?.user ?? null))
      setIsLoading(false)
    })

    void getCurrentUser()
      .then((currentUser) => {
        if (isMounted) setUser(currentUser)
      })
      .catch(() => {
        if (isMounted) setUser(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function register(displayName: string, email: string, password: string) {
    const result = await registerAccount(displayName, email, password)
    if (result.user && !result.requiresEmailConfirmation) setUser(result.user)
    return result
  }

  async function login(email: string, password: string) {
    const loggedInUser = await loginAccount(email, password)
    setUser(loggedInUser)
    return loggedInUser
  }

  async function logout() {
    await clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isConfigured: Boolean(supabase), register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}