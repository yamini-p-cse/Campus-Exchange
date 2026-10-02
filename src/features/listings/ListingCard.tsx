import { Link } from 'react-router-dom'
import type { Listing } from '../../types/listing'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const categoryClass = listing.category.toLowerCase().replaceAll(' ', '-')

  return (
    <article className="listing-card">
      <Link className="listing-card__link" to={`/listings/${listing.id}`}>
        <div className={`listing-card__image listing-card__image--${categoryClass}`}>
          {listing.image_url && <img src={listing.image_url} alt={listing.title} loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />}
          <span>{listing.category}</span>
        </div>
        <div className="listing-card__body">
          <div className="listing-card__meta">
            <span>{listing.category}</span>
            <span>{listing.item_condition}</span>
          </div>
          <h2>{listing.title}</h2>
          <p>{listing.description}</p>
          <strong>${listing.price.toFixed(2)}</strong>
        </div>
      </Link>
    </article>
  )
}