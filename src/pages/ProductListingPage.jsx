import { useParams, useSearchParams } from 'react-router-dom'
import FilterPanel from '../components/catalog/FilterPanel.jsx'
import ProductList from '../components/catalog/ProductList.jsx'
import SortControl from '../components/catalog/SortControl.jsx'
import { productCategories, products } from '../data/products.js'
import NotFoundPage from './NotFoundPage.jsx'
import { filterAndSortProducts } from '../utils/filterProducts.js'

const defaultFilters = { category: 'all', maxPrice: 200, sort: 'featured' }

function ProductListingPage() {
  const { collection } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentCollection = ['men', 'women'].includes(collection) ? collection : 'all'
  const category = searchParams.get('category') ?? defaultFilters.category
  const search = (searchParams.get('search') ?? '').trim()
  const requestedMaxPrice = Number(searchParams.get('maxPrice'))
  const maxPrice =
    Number.isFinite(requestedMaxPrice) && requestedMaxPrice >= 20
      ? Math.min(requestedMaxPrice, defaultFilters.maxPrice)
      : defaultFilters.maxPrice
  const sort = searchParams.get('sort') ?? defaultFilters.sort
  const categories =
    currentCollection === 'all'
      ? [...new Set(Object.values(productCategories).flat())]
      : productCategories[currentCollection]

  const visibleProducts = filterAndSortProducts(products, {
    collection: currentCollection,
    category,
    search,
    maxPrice,
    sort,
  })

  if (collection && !['men', 'women'].includes(collection)) {
    return <NotFoundPage />
  }

  function updateParam(key, value) {
    const nextParams = new URLSearchParams(searchParams)
    if (value === 'all' || value === 'featured' || value === 200) {
      nextParams.delete(key)
    } else {
      nextParams.set(key, String(value))
    }
    setSearchParams(nextParams)
  }

  const title =
    search.length > 0
      ? `Search results for “${search}”`
      : currentCollection === 'all'
        ? 'Find your everyday favorites'
        : `${currentCollection === 'men' ? 'Men’s' : 'Women’s'} collection`
  const subtitle =
    currentCollection === 'all'
      ? 'Thoughtful pieces, easy to wear and made to be lived in.'
      : `Explore considered essentials from our ${currentCollection} collection.`

  return (
    <div className="listing-page">
      <section className={`collection-hero collection-hero-${currentCollection}`}>
        <div className="collection-hero-copy">
          <p className="eyebrow">STYLE THAT FEELS LIKE YOU</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <span aria-hidden="true" className="hero-decoration">S</span>
      </section>
      <div className="listing-heading">
        <div>
          <p className="eyebrow">CURATED FOR EVERY DAY</p>
          <h2>
            {currentCollection === 'all'
              ? 'The collection'
              : `${currentCollection.toUpperCase()} ESSENTIALS`}
          </h2>
          <p className="result-count">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'piece' : 'pieces'}
            {category !== 'all' ? ` in ${category}` : ''}
          </p>
        </div>
        <SortControl value={sort} onChange={(value) => updateParam('sort', value)} />
      </div>
      <FilterPanel
        categories={categories}
        category={category}
        maxPrice={maxPrice}
        onCategoryChange={(value) => updateParam('category', value)}
        onMaxPriceChange={(value) => updateParam('maxPrice', value)}
      />
      {visibleProducts.length > 0 ? (
        <ProductList products={visibleProducts} />
      ) : (
        <section className="empty-results">
          <span aria-hidden="true">⌕</span>
          <h2>No pieces found</h2>
          <p>Try a different search or relax your filters.</p>
          <button className="button button-secondary" onClick={() => setSearchParams({})} type="button">
            Clear filters
          </button>
        </section>
      )}
    </div>
  )
}

export default ProductListingPage
