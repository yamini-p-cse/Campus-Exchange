import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="message-page">
      <p className="eyebrow">404</p>
      <h1>We couldn't find that page.</h1>
      <Link className="text-link" to="/">Back to browse</Link>
    </section>
  )
}