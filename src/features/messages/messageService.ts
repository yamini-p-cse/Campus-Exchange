import { requireSupabase } from '../../lib/supabase'
import type { ListingMessage } from '../../types/message'

export async function getMessagesForUser(userId: string) {
  return requireSupabase()
    .from('listing_messages')
    .select('id, listing_id, sender_id, recipient_id, body, created_at, listing:listings!listing_messages_listing_id_fkey(title,seller_id)')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: true })
}

export async function sendListingMessage(message: Pick<ListingMessage, 'listing_id' | 'sender_id' | 'recipient_id' | 'body'>) {
  return requireSupabase()
    .from('listing_messages')
    .insert(message)
    .select('id, listing_id, sender_id, recipient_id, body, created_at')
    .single()
}