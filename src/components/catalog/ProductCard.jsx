import { Link } from 'react-router-dom'
import ImageWithFallback from '../ImageWithFallback.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link className="product-image-link" to={`/products/${product.id}`}>
        <ImageWithFallback
          alt={product.name}
          className="product-image"
          loading="lazy"
          src={product.image}
        />
        {product.oldPrice && <span className="product-badge">Sale</span>}
      </Link>
      <div className="product-card-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span aria-label={`${product.rating} out of 5 stars`}>★ {product.rating}</span>
        </div>
        <Link className="product-name" to={`/products/${product.id}`}>
          {product.name}
        </Link>
        <div className="product-price-row">
          <span className="product-price">{formatCurrency(product.price)}</span>
          {product.oldPrice && (
            <span className="old-price">{formatCurrency(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
