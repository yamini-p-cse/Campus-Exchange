import { useEffect, useState } from 'react'
import { ListingCard } from '../features/listings/ListingCard'
import { sampleListings } from '../features/listings/sampleListings'
import { getListings } from '../features/listings/listingService'
import { filterListings } from '../features/search/filterListings'
import { EmptyState } from '../components/ui/EmptyState'
import { listingCategories } from '../types/listing'
import type { ListingCategory } from '../types/listing'
import type { Listing } from '../types/listing'
import { useAuth } from '../features/auth/useAuth'

export function BrowsePage() {
  const { isConfigured } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState<ListingCategory | 'All'>('All')
  const [listings, setListings] = useState<Listing[]>(isConfigured ? [] : sampleListings)
  const [isLoading, setIsLoading] = useState(isConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isConfigured) return

    let isMounted = true
    void getListings()
      .then(({ data, error: queryError }) => {
        if (queryError) throw queryError
        if (isMounted) setListings((data ?? []) as Listing[])
      })
      .catch((caughtError: unknown) => {
        if (isMounted) setError(caughtError instanceof Error ? caughtError.message : 'Listings could not be loaded.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => { isMounted = false }
  }, [isConfigured])

  const visibleListings = filterListings(listings, searchText, category)

  return (
    <>
      <section className="browse-heading" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Your campus, second-hand</p>
          <h1 id="page-title">Good finds.<br />Good for campus.</h1>
        </div>
        <p className="browse-heading__note">A simple place to pass useful things from one student to another.</p>
      </section>
      <section className="browse-tools" aria-label="Search listings">
        <label className="search-box">
          <span className="search-box__icon" aria-hidden="true">⌕</span>
          <span className="visually-hidden">Search listings</span>
          <input
            type="search"
            placeholder="Try a textbook, calculator, backpack..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>
        <div className="category-list" aria-label="Filter by category">
          <button className={category === 'All' ? 'category-button is-selected' : 'category-button'} onClick={() => setCategory('All')} type="button" aria-pressed={category === 'All'}>All items</button>
          {listingCategories.map((listingCategory) => (
            <button
              className={category === listingCategory ? 'category-button is-selected' : 'category-button'}
              key={listingCategory}
              onClick={() => setCategory(listingCategory)}
              type="button"
              aria-pressed={category === listingCategory}
            >{listingCategory}</button>
          ))}
        </div>
      </section>
      <section className="results-section" aria-labelledby="results-title">
        <div className="section-heading">
          <h2 id="results-title">Fresh on campus</h2>
          <span>{isLoading ? 'Loading…' : `${visibleListings.length} listings`}</span>
        </div>
        {isLoading ? <p className="empty-state" role="status">Loading listings…</p> : error ? (
          <EmptyState message={`Listings could not be loaded: ${error}`} />
        ) : visibleListings.length > 0 ? (
          <div className="listing-grid">
            {visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <EmptyState message="No listings match that search. Try another term or category." />
        )}
      </section>
    </>
  )
}