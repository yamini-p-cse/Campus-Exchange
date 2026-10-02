export interface ListingMessage {
  id: string
  listing_id: string
  sender_id: string
  recipient_id: string
  body: string
  created_at: string
}

export interface MessageWithListing extends ListingMessage {
  listing: { title: string; seller_id: string } | null
}