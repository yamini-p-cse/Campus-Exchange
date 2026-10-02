import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export function LoginPage() {
  const { login, user, isConfigured } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const account = await login(email, password)
      const destination = location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null
      if (destination?.from?.pathname) {
        navigate(`${destination.from.pathname}${destination.from.search ?? ''}${destination.from.hash ?? ''}`, { replace: true })
      } else {
        setSuccess(`Welcome back, ${account?.displayName ?? 'student'}. You are now logged in.`)
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not log you in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page auth-page--login" aria-labelledby="login-title">
      <div className="auth-intro">
        <p className="eyebrow">Good to see you again</p>
        <h1 id="login-title">Pick up where you left off.</h1>
        <p>Your campus finds and listings are just around the corner.</p>
      </div>
      <div className="auth-panel">
        {success || user ? (
          <div className="auth-message auth-message--success" role="status">
            <h2>You're logged in.</h2>
            <p>{success || `Signed in as ${user?.displayName}.`}</p>
            <Link className="primary-button" to="/">Browse listings</Link>
          </div>
        ) : (
          <>
            <div className="auth-panel__heading">
              <h2>Log in</h2>
              <p>Enter the email and password you registered with.</p>
            </div>
            {!isConfigured && <p className="auth-message auth-message--error" role="status">Add your Supabase URL and anon key to .env.local to enable sign in.</p>}
            {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Email address</span>
                <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
              </label>
              <label className="form-field">
                <span>Password</span>
                <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
              </label>
              <button className="primary-button auth-submit" disabled={!isConfigured || isSubmitting} type="submit">{isSubmitting ? 'Logging in…' : 'Log in'}</button>
            </form>
            <p className="auth-switch">New to Campus Exchange? <Link state={location.state} to="/register">Create an account</Link></p>
          </>
        )}
      </div>
    </section>
  )
}