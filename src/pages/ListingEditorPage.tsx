import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createListing, getListing, removeListingImage, updateListing, uploadListingImage } from '../features/listings/listingService'
import { useAuth } from '../features/auth/useAuth'
import { listingCategories } from '../types/listing'
import type { ListingCategory, ListingCondition, ListingDraft } from '../types/listing'

const conditions: ListingCondition[] = ['New', 'Like new', 'Good', 'Fair']

export function ListingEditorPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(listingId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<ListingCategory>('Books')
  const [condition, setCondition] = useState<ListingCondition>('Good')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  useEffect(() => {
    if (!listingId || !user) return
    let isMounted = true
    void getListing(listingId)
      .then(({ data, error: queryError }) => {
        if (queryError) throw queryError
        if (!data || data.seller_id !== user.id) throw new Error('This listing is not available to edit.')
        if (!isMounted) return
        setTitle(data.title)
        setDescription(data.description)
        setPrice(String(data.price))
        setCategory(data.category as ListingCategory)
        setCondition(data.item_condition as ListingCondition)
        setImageUrl(data.image_url ?? '')
      })
      .catch((caughtError: unknown) => {
        if (isMounted) setError(caughtError instanceof Error ? caughtError.message : 'The listing could not be loaded.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [listingId, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    if (!imageFile && !imageUrl.trim()) {
      setError('Add a listing photo before publishing.')
      return
    }
    setError('')
    setIsSubmitting(true)
    const draft: ListingDraft = {
      seller_id: user.id,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      item_condition: condition,
      image_url: imageUrl.trim() || null,
    }

    let uploadedImageUrl = ''
    try {
      if (imageFile) {
        uploadedImageUrl = await uploadListingImage(user.id, imageFile)
        draft.image_url = uploadedImageUrl
      }
      if (listingId) {
        const { error: updateError } = await updateListing(listingId, draft)
        if (updateError) throw updateError
      } else {
        const { error: createError } = await createListing(draft)
        if (createError) throw createError
      }
      navigate('/my-listings')
    } catch (caughtError) {
      if (uploadedImageUrl) await removeListingImage(uploadedImageUrl).catch(() => undefined)
      setError(caughtError instanceof Error ? caughtError.message : 'Your listing could not be saved.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleImageChange(file: File | null) {
    setError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Images must be 5 MB or smaller.')
      return
    }
    setImageUrl('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleImageUrlChange(value: string) {
    setImageUrl(value)
    setImageFile(null)
    setImagePreview('')
  }

  if (isLoading) return <section className="message-page"><p role="status">Loading listing…</p></section>

  return (
    <section className="editor-page">
      <Link className="text-link" to="/my-listings">Back to your listings</Link>
      <div className="editor-page__heading">
        <p className="eyebrow">Your account</p>
        <h1>{isEditing ? 'Edit listing' : 'List an item'}</h1>
      </div>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      <form className="listing-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="form-field">
          <span>Item name</span>
          <input maxLength={120} onChange={(event) => setTitle(event.target.value)} required value={title} />
        </label>
        <label className="form-field">
          <span>Description</span>
          <textarea maxLength={2000} onChange={(event) => setDescription(event.target.value)} rows={5} value={description} />
        </label>
        <div className="listing-form__row">
          <label className="form-field">
            <span>Price ($)</span>
            <input min="0" onChange={(event) => setPrice(event.target.value)} required step="0.01" type="number" value={price} />
          </label>
          <label className="form-field">
            <span>Category</span>
            <select onChange={(event) => setCategory(event.target.value as ListingCategory)} value={category}>
              {listingCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="listing-form__row">
          <label className="form-field">
            <span>Condition</span>
            <select onChange={(event) => setCondition(event.target.value as ListingCondition)} value={condition}>
              {conditions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Upload a photo <small>JPG, PNG, or WebP up to 5 MB</small></span>
            <input accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)} type="file" />
          </label>
        </div>
        <label className="form-field">
          <span>Or use an image URL <small>Optional</small></span>
          <input autoComplete="url" onChange={(event) => handleImageUrlChange(event.target.value)} type="url" value={imageUrl} />
        </label>
        {(imagePreview || imageUrl) && (
          <div className="listing-image-preview">
            <img alt="Listing preview" src={imagePreview || imageUrl} />
          </div>
        )}
        <div className="listing-form__actions">
          <button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Publish listing'}</button>
          <Link className="text-link" to="/my-listings">Cancel</Link>
        </div>
      </form>
    </section>
  )
}