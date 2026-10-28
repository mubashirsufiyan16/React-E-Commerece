import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency.js'

function CartItem({ item, onQuantityChange, onRemove }) {
  const { product } = item

  return (
    <article className="cart-item">
      <Link className="cart-item-image" to={`/products/${product.id}`}>
        <img alt={product.name} src={product.image} />
      </Link>
      <div className="cart-item-details">
        <div className="cart-item-heading">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
          <button
            aria-label={`Remove ${product.name}`}
            className="icon-button remove-item"
            onClick={onRemove}
            type="button"
          >
            ×
          </button>
        </div>
        <p>
          {item.color} · Size {item.size}
        </p>
        <div className="cart-item-footer">
          <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
            <button
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
              onClick={() => onQuantityChange(item.quantity - 1)}
              type="button"
            >
              −
            </button>
            <span>{item.quantity}</span>
            <button
              aria-label="Increase quantity"
              disabled={item.quantity >= product.stock}
              onClick={() => onQuantityChange(item.quantity + 1)}
              type="button"
            >
              +
            </button>
          </div>
          <strong>{formatCurrency(item.lineTotal)}</strong>
        </div>
      </div>
    </article>
  )
}

export default CartItem
