import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

export function RootLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (caughtError) {
      setLogoutError(caughtError instanceof Error ? caughtError.message : 'You could not be signed out.')
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Campus Exchange home">
          <span className="wordmark__mark" aria-hidden="true">cx</span>
          <span>campus exchange</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/" end>Browse</NavLink>
          {user && <NavLink to="/messages">Messages</NavLink>}
          <NavLink to="/my-listings">My listings</NavLink>
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <span className="site-nav__greeting">Hi, {user.displayName}</span>
              <button className="site-nav__account" onClick={handleLogout} type="button">Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink className="site-nav__account" to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="main-content">
        {logoutError && <p className="auth-message auth-message--error" role="alert">{logoutError}</p>}
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Made for campus life.</span>
        <span>Buy nearby. Pass it on.</span>
      </footer>
    </div>
  )
}