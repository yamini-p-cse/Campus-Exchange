import type { Listing, ListingCategory } from '../../types/listing'

export function filterListings(
  listings: Listing[],
  searchText: string,
  category: ListingCategory | 'All',
) {
  const query = searchText.trim().toLowerCase()

  return listings.filter((listing) => {
    const matchesCategory = category === 'All' || listing.category === category
    const matchesText =
      query.length === 0 ||
      `${listing.title} ${listing.description} ${listing.category}`
        .toLowerCase()
        .includes(query)

    return matchesCategory && matchesText
  })
}