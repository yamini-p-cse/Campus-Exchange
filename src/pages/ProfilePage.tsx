import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getProfile, updateDisplayName } from '../features/profile/profileService'
import { useAuth } from '../features/auth/useAuth'
import type { StudentProfile } from '../types/profile'

export function ProfilePage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user) return
    let isMounted = true
    void getProfile(user.id)
      .then(({ data, error: queryError }) => {
        if (queryError) throw queryError
        if (isMounted) setDisplayName((data as StudentProfile).display_name)
      })
      .catch((caughtError: unknown) => {
        if (isMounted) setError(caughtError instanceof Error ? caughtError.message : 'Your profile could not be loaded.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setError('')
    setNotice('')
    setIsSaving(true)
    try {
      await updateDisplayName(user.id, displayName.trim())
      setNotice('Your profile has been updated.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Your profile could not be saved.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <section className="message-page"><p role="status">Loading your profile…</p></section>

  return (
    <section className="editor-page">
      <div className="editor-page__heading">
        <p className="eyebrow">Your account</p>
        <h1>Profile settings</h1>
      </div>
      <p className="profile-email">{user?.email}</p>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      {notice && <p className="auth-message auth-message--success" role="status">{notice}</p>}
      <form className="listing-form profile-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="form-field">
          <span>Display name</span>
          <input autoComplete="name" maxLength={60} minLength={1} onChange={(event) => setDisplayName(event.target.value)} required value={displayName} />
        </label>
        <button className="primary-button" disabled={isSaving || displayName.trim() === user?.displayName} type="submit">
          {isSaving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </section>
  )
}