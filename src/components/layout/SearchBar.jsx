import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentSearch = searchParams.get('search') ?? ''

  function handleSearch(search) {
    const nextParams = new URLSearchParams(searchParams)
    if (search) {
      nextParams.set('search', search)
    } else {
      nextParams.delete('search')
    }

    setSearchParams(nextParams, { replace: true })
  }

  return (
    <SearchForm
      key={currentSearch}
      currentSearch={currentSearch}
      onSearch={handleSearch}
    />
  )
}

function SearchForm({ currentSearch, onSearch }) {
  const [inputValue, setInputValue] = useState(currentSearch)

  function handleSubmit(event) {
    event.preventDefault()
    const search = inputValue.trim()
    setInputValue(search)
    onSearch(search)
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <label className="visually-hidden" htmlFor="site-search">
        Search products
      </label>
      <input
        id="site-search"
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Search styles..."
        type="search"
        value={inputValue}
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
