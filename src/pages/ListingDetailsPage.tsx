import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { sampleListings, sampleSellerContacts } from '../features/listings/sampleListings'
import { getListing } from '../features/listings/listingService'
import type { Listing } from '../types/listing'
import { useAuth } from '../features/auth/useAuth'

export function ListingDetailsPage() {
  const { listingId } = useParams()
  const { isConfigured, user } = useAuth()
  const [showDemoContact, setShowDemoContact] = useState(false)
  const [remoteListing, setRemoteListing] = useState<Listing | null>(null)
  const [loadedListingId, setLoadedListingId] = useState(isConfigured ? '' : listingId ?? '')
  const [loadError, setLoadError] = useState<{ listingId: string; message: string } | null>(null)
  const listing = isConfigured ? remoteListing : sampleListings.find((item) => item.id === listingId) ?? null
  const isLoading = isConfigured && loadedListingId !== listingId
  const error = loadError && loadError.listingId === listingId ? loadError.message : ''

  useEffect(() => {
    if (!isConfigured || !listingId) return
    let isMounted = true
    void getListing(listingId)
      .then(({ data, error: queryError }) => {
        if (queryError) throw queryError
        if (isMounted) setRemoteListing((data as Listing | null) ?? null)
      })
      .catch((caughtError: unknown) => {
        if (isMounted) setLoadError({
          listingId,
          message: caughtError instanceof Error ? caughtError.message : 'The listing could not be loaded.',
        })
      })
      .finally(() => {
        if (isMounted) setLoadedListingId(listingId)
      })
    return () => { isMounted = false }
  }, [isConfigured, listingId])

  if (isLoading) return <section className="message-page"><p role="status">Loading listing…</p></section>
  if (error) return <section className="message-page"><p className="eyebrow">Listing</p><h1>We couldn’t load that listing.</h1><p>{error}</p><Link className="text-link" to="/">Back to browse</Link></section>

  if (!listing) {
    return <section className="message-page"><p className="eyebrow">Listing</p><h1>That listing could not be found.</h1><Link className="text-link" to="/">Back to browse</Link></section>
  }

  const categoryClass = listing.category.toLowerCase().replaceAll(' ', '-')
  const sampleContact = sampleSellerContacts[listing.seller_id as keyof typeof sampleSellerContacts]

  return (
    <section className="detail-page">
      <Link className="text-link" to="/">← Back to browse</Link>
      <div className="detail-page__content">
        <div className={`detail-page__image listing-card__image--${categoryClass}`}>
          {listing.image_url && <img src={listing.image_url} alt={listing.title} onError={(event) => { event.currentTarget.hidden = true }} />}
          <span>{listing.category}</span>
        </div>
        <div className="detail-page__info">
          <p className="eyebrow">{listing.category} · {listing.item_condition}</p>
          <h1>{listing.title}</h1>
          <p className="detail-page__description">{listing.description}</p>
          <p className="detail-page__price">${listing.price.toFixed(2)}</p>
          {user?.id === listing.seller_id ? (
            <span className="listing-owner-note">This is your listing.</span>
          ) : isConfigured ? (
            <Link className="primary-button" to={`/messages?listingId=${listing.id}`}>Message seller</Link>
          ) : sampleContact ? (
            <>
              <button className="primary-button" onClick={() => setShowDemoContact((visible) => !visible)} type="button">
                {showDemoContact ? 'Hide sample contact' : 'Contact seller'}
              </button>
              {showDemoContact && (
                <div className="demo-contact" role="region" aria-label="Sample seller contact">
                  <p className="demo-contact__label">Demo contact · sample only</p>
                  <strong>{sampleContact.name}</strong>
                  <span>{sampleContact.email}</span>
                  <span>{sampleContact.phone}</span>
                  <small>These example details do not reach a real seller.</small>
                </div>
              )}
            </>
          ) : (
            <p className="form-note">Seller contact is not available for this listing.</p>
          )}
        </div>
      </div>
    </section>
  )
}