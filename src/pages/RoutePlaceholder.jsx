function RoutePlaceholder({ title, message }) {
  return (
    <section aria-labelledby="page-title" className="route-placeholder">
      <h1 id="page-title">{title}</h1>
      <p>{message}</p>
    </section>
  )
}

export default RoutePlaceholder
