import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { ListingCard } from '../features/listings/ListingCard'
import { deleteListing, getMyListings } from '../features/listings/listingService'
import { useAuth } from '../features/auth/useAuth'
import type { Listing } from '../types/listing'

export function MyListingsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let isMounted = true
    void getMyListings(user.id)
      .then(({ data, error: queryError }) => {
        if (queryError) throw queryError
        if (isMounted) setListings((data ?? []) as Listing[])
      })
      .catch((caughtError: unknown) => {
        if (isMounted) setError(caughtError instanceof Error ? caughtError.message : 'Your listings could not be loaded.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [user])

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return
    setDeletingId(id)
    setError('')
    try {
      const { error: deleteError } = await deleteListing(id)
      if (deleteError) throw deleteError
      setListings((current) => current.filter((listing) => listing.id !== id))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'The listing could not be deleted.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className="account-page">
      <div className="account-page__heading">
        <div>
          <p className="eyebrow">Your account</p>
          <h1>Your listings</h1>
        </div>
        <Link className="primary-button" to="/my-listings/new">List an item</Link>
      </div>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      {isLoading ? <p className="empty-state" role="status">Loading your listings…</p> : listings.length ? (
        <div className="listing-grid">
          {listings.map((listing) => (
            <div className="managed-listing" key={listing.id}>
              <ListingCard listing={listing} />
              <div className="managed-listing__actions">
                <Link className="text-link" to={`/my-listings/${listing.id}/edit`}>Edit listing</Link>
                <button className="text-button text-button--danger" disabled={deletingId === listing.id} onClick={() => void handleDelete(listing.id)} type="button">
                  {deletingId === listing.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="You haven’t listed anything yet. Add an item to get started." />
      )}
    </section>
  )
}