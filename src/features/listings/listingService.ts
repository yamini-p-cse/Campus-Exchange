import { requireSupabase } from '../../lib/supabase'
import type { ListingDraft } from '../../types/listing'

const LISTING_IMAGE_BUCKET = 'listing-images'
const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function getListings() {
  return requireSupabase().from('listings').select('*').order('created_at', { ascending: false })
}

export async function getListing(id: string) {
  return requireSupabase().from('listings').select('*').eq('id', id).maybeSingle()
}

export async function getMyListings(sellerId: string) {
  return requireSupabase()
    .from('listings')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
}

export async function createListing(listing: ListingDraft) {
  return requireSupabase().from('listings').insert(listing).select().single()
}

export async function updateListing(id: string, changes: Partial<ListingDraft>) {
  return requireSupabase().from('listings').update(changes).eq('id', id)
}

export async function deleteListing(id: string) {
  return requireSupabase().from('listings').delete().eq('id', id)
}

export async function uploadListingImage(userId: string, file: File) {
  const extension = imageExtensions[file.type]
  if (!extension) throw new Error('Choose a JPG, PNG, or WebP image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.')

  const client = requireSupabase()
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await client.storage.from(LISTING_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error

  return client.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function removeListingImage(publicUrl: string) {
  const pathMarker = `/storage/v1/object/public/${LISTING_IMAGE_BUCKET}/`
  const pathname = new URL(publicUrl).pathname
  const markerIndex = pathname.indexOf(pathMarker)
  if (markerIndex < 0) return

  const path = decodeURIComponent(pathname.slice(markerIndex + pathMarker.length))
  const { error } = await requireSupabase().storage.from(LISTING_IMAGE_BUCKET).remove([path])
  if (error) throw error
}