export const listingCategories = [
  'Books',
  'Calculators',
  'Lab equipment',
  'Electronics',
  'Bags',
  'Notes',
  'Other',
] as const

export type ListingCategory = (typeof listingCategories)[number]
export type ListingCondition = 'New' | 'Like new' | 'Good' | 'Fair'

export interface Listing {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  category: ListingCategory
  item_condition: ListingCondition
  image_url: string | null
  created_at: string
}

export type ListingDraft = Omit<Listing, 'id' | 'created_at'>