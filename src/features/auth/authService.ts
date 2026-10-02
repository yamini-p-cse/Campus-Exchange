import type { User } from '@supabase/supabase-js'
import { requireSupabase } from '../../lib/supabase'

export interface MarketplaceUser {
  id: string
  displayName: string
  email: string
}

export function mapAuthUser(user: User | null): MarketplaceUser | null {
  if (!user) return null

  return {
    id: user.id,
    displayName: user.user_metadata.display_name ?? user.email?.split('@')[0] ?? 'Student',
    email: user.email ?? '',
  }
}

export async function getCurrentUser() {
  const { data, error } = await requireSupabase().auth.getSession()
  if (error) throw error
  return mapAuthUser(data.session?.user ?? null)
}

export async function registerAccount(displayName: string, email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: displayName.trim() } },
  })
  if (error) throw error

  return {
    user: mapAuthUser(data.user),
    requiresEmailConfirmation: !data.session,
  }
}

export async function loginAccount(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return mapAuthUser(data.user)
}

export async function clearSession() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
}