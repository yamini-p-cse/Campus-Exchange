import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { RootLayout } from '../components/layout/RootLayout'
import { AuthProvider } from '../features/auth/AuthProvider'
import { BrowsePage } from '../pages/BrowsePage'
import { ListingDetailsPage } from '../pages/ListingDetailsPage'
import { LoginPage } from '../pages/LoginPage'
import { MyListingsPage } from '../pages/MyListingsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ListingEditorPage } from '../pages/ListingEditorPage'
import { MessagesPage } from '../pages/MessagesPage'
import { ProfilePage } from '../pages/ProfilePage'
import { useAuth } from '../features/auth/useAuth'

function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <main className="message-page"><p role="status">Checking your account…</p></main>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function MarketplaceRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<BrowsePage />} />
            <Route path="/listings/:listingId" element={<ListingDetailsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/my-listings/new" element={<ListingEditorPage />} />
              <Route path="/my-listings/:listingId/edit" element={<ListingEditorPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/sign-in" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}