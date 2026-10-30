import { Link, useParams, useSearchParams } from 'react-router-dom'
import { productCategories } from '../../data/products.js'

function Sidebar() {
  const { collection: currentCollection } = useParams()
  const [searchParams] = useSearchParams()
  const currentCategory = searchParams.get('category')

  function getCollectionUrl(collection, category) {
    const nextParams = new URLSearchParams(searchParams)
    if (category) {
      nextParams.set('category', category)
    } else {
      nextParams.delete('category')
    }

    const query = nextParams.toString()
    return `/collections/${collection}${query ? `?${query}` : ''}`
  }

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Shop collections</h2>
      {Object.entries(productCategories).map(([collection, categories]) => (
        <nav
          aria-label={`${collection} categories`}
          className="sidebar-section"
          key={collection}
        >
          <Link
            aria-current={
              currentCollection === collection && !currentCategory ? 'page' : undefined
            }
            className="sidebar-collection"
            to={getCollectionUrl(collection)}
          >
            {collection}
          </Link>
          <ul className="sidebar-links">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  aria-current={
                    currentCollection === collection && currentCategory === category
                      ? 'page'
                      : undefined
                  }
                  to={getCollectionUrl(collection, category)}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </aside>
  )
}

export default Sidebar
