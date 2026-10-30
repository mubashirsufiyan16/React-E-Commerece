import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { getProductById } from '../data/products.js'
import { formatCurrency } from '../utils/formatCurrency.js'

function ProductDetailsContent({ productId }) {
  const catalogProduct = getProductById(productId)
  const { addItem, getStock } = useCart()
  const product = catalogProduct
    ? { ...catalogProduct, stock: getStock(catalogProduct.id) }
    : null
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? '')
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? '')
  const [quantity, setQuantity] = useState(1)

  function handleAddToCart() {
    const validSelection =
      product &&
      product.stock > 0 &&
      Number.isInteger(quantity) &&
      quantity > 0 &&
      quantity <= product.stock &&
      product.sizes.includes(selectedSize) &&
      product.colors.includes(selectedColor)

    if (!validSelection) return

    addItem(product, selectedSize, selectedColor, quantity)
  }

  if (!product) {
    return (
      <section className="empty-results">
        <p className="eyebrow">SORRY, WE COULDN’T FIND THAT</p>
        <h1>Product unavailable</h1>
        <p>This product may have moved or is no longer available.</p>
        <Link className="button button-primary" to="/">Browse the collection</Link>
      </section>
    )
  }

  return (
    <div className="detail-page">
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/collections/${product.collection}`}>
          {product.collection === 'men' ? 'Men' : 'Women'}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>
      <section className="product-detail">
        <div className="detail-image-wrap">
          <img alt={product.name} className="detail-image" src={product.image.replace('w=900', 'w=1400')} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category.toUpperCase()} · STYLEHUB EDITION</p>
          <h1>{product.name}</h1>
          <p className="detail-rating">★ {product.rating} <span>({product.reviews} reviews)</span></p>
          <div className="detail-price-row">
            <strong>{formatCurrency(product.price)}</strong>
            {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-option">
            <div className="option-label">
              <span>Color</span>
              <strong>{selectedColor}</strong>
            </div>
            <div className="swatch-list">
              {product.colors.map((color, index) => (
                <button
                  aria-label={color}
                  aria-pressed={selectedColor === color}
                  className={`color-swatch swatch-${index}${selectedColor === color ? ' selected' : ''}`}
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  type="button"
                >
                  <span>{color}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="detail-option">
            <div className="option-label">
              <span>Size</span>
              <span className="size-guide">Find your fit</span>
            </div>
            <div className="size-list">
              {product.sizes.map((size) => (
                <button
                  aria-pressed={selectedSize === size}
                  className={selectedSize === size ? 'selected' : ''}
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="detail-buy-row">
            <div className="quantity-control detail-quantity">
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                type="button"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                type="button"
              >
                +
              </button>
            </div>
            <button
              className="button button-primary add-to-cart"
              disabled={product.stock < 1 || !selectedSize || !selectedColor}
              onClick={handleAddToCart}
              type="button"
            >
              Add to cart · {formatCurrency(product.price * quantity)}
            </button>
          </div>
          <p className="stock-note" role="status">
            {product.stock === 0
              ? 'Out of stock'
              : product.stock > 5
                ? `${product.stock} in stock and ready to ship`
                : `Only ${product.stock} left in stock`}
          </p>
          <div className="detail-promise">
            <p><span>↗</span> Complimentary shipping on orders over $100</p>
            <p><span>↺</span> Easy returns within 30 days</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductDetailsPage() {
  const { productId } = useParams()
  return <ProductDetailsContent key={productId} productId={productId} />
}

export default ProductDetailsPage
