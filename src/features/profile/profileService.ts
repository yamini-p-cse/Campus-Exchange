import { requireSupabase } from '../../lib/supabase'
import type { StudentProfile } from '../../types/profile'

export async function getProfile(userId: string) {
  return requireSupabase()
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .returns<StudentProfile>()
    .single()
}

export async function getProfiles(userIds: string[]) {
  return requireSupabase()
    .from('profiles')
    .select('*')
    .in('user_id', userIds)
    .returns<StudentProfile[]>()
}

export async function updateDisplayName(userId: string, displayName: string) {
  const supabase = requireSupabase()
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('user_id', userId)
  if (profileError) throw profileError

  const { error: authError } = await supabase.auth.updateUser({ data: { display_name: displayName } })
  if (authError) throw authError
}