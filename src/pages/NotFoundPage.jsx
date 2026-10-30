import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="empty-results">
      <p className="eyebrow">404 · THIS PAGE ISN’T IN OUR CLOSET</p>
      <h1>We can’t find that page</h1>
      <p>The address may be outdated, or the page may have moved.</p>
      <Link className="button button-primary" to="/">Return to StyleHub</Link>
    </section>
  )
}

export default NotFoundPage
