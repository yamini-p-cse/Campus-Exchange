import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export function RegisterPage() {
  const { register, isConfigured } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await register(displayName, email, password)
      const destination = location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null
      if (!result.requiresEmailConfirmation && destination?.from?.pathname) {
        navigate(`${destination.from.pathname}${destination.from.search ?? ''}${destination.from.hash ?? ''}`, { replace: true })
      } else {
        setSuccess(result.requiresEmailConfirmation
          ? 'Check your email to confirm your account before logging in.'
          : `Your account is ready, ${result.user?.displayName ?? displayName.trim()}. You are now logged in.`)
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-intro">
        <p className="eyebrow">Join your campus community</p>
        <h1 id="register-title">A better way to pass it on.</h1>
        <p>Make an account to keep track of the useful things moving around campus.</p>
      </div>
      <div className="auth-panel">
        {success ? (
          <div className="auth-message auth-message--success" role="status">
            <h2>Welcome aboard.</h2>
            <p>{success}</p>
            <Link className="primary-button" to="/">Browse listings</Link>
          </div>
        ) : (
          <>
            <div className="auth-panel__heading">
              <h2>Create your account</h2>
              <p>All fields are required.</p>
            </div>
            {!isConfigured && <p className="auth-message auth-message--error" role="status">Add your Supabase URL and anon key to .env.local to enable registration.</p>}
            {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Your name</span>
                <input autoComplete="name" maxLength={60} onChange={(event) => setDisplayName(event.target.value)} required value={displayName} />
              </label>
              <label className="form-field">
                <span>Email address</span>
                <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
              </label>
              <label className="form-field">
                <span>Password</span>
                <input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
                <small>Use at least 8 characters.</small>
              </label>
              <label className="form-field">
                <span>Confirm password</span>
                <input autoComplete="new-password" onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
              </label>
              <button className="primary-button auth-submit" disabled={!isConfigured || isSubmitting} type="submit">{isSubmitting ? 'Creating account…' : 'Create account'}</button>
            </form>
            <p className="auth-switch">Already have an account? <Link state={location.state} to="/login">Log in</Link></p>
          </>
        )}
      </div>
    </section>
  )
}