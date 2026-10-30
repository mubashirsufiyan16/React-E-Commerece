import { useSearchParams } from 'react-router-dom'

function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams()

  function updateSearch(search) {
    const nextParams = new URLSearchParams(searchParams)
    if (search) {
      nextParams.set('search', search)
    } else {
      nextParams.delete('search')
    }

    setSearchParams(nextParams, { replace: true })
  }

  function handleSubmit(event) {
    event.preventDefault()
    updateSearch((searchParams.get('search') ?? '').trim())
  }

  function handleChange(event) {
    updateSearch(event.target.value)
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <label className="visually-hidden" htmlFor="site-search">
        Search products
      </label>
      <input
        id="site-search"
        onChange={handleChange}
        placeholder="Search styles..."
        type="search"
        value={searchParams.get('search') ?? ''}
      />
      <button aria-label="Submit search" type="submit">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      </button>
    </form>
  )
}

export default SearchBar
