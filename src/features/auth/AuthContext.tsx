import { createContext } from 'react'
import type { MarketplaceUser } from './authService'

interface AuthContextValue {
  user: MarketplaceUser | null
  isLoading: boolean
  isConfigured: boolean
  register: (displayName: string, email: string, password: string) => Promise<{ user: MarketplaceUser | null; requiresEmailConfirmation: boolean }>
  login: (email: string, password: string) => Promise<MarketplaceUser | null>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
