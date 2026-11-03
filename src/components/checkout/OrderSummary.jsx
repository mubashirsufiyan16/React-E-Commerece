import CartItem from '../cart/CartItem.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'

function OrderSummary({
  items,
  itemCount,
  subtotal,
  shipping,
  total,
  onQuantityChange,
  onRemove,
}) {
  return (
    <aside className="checkout-summary">
      <div className="summary-heading">
        <h2>Your order</h2>
        <span>{itemCount} items</span>
      </div>
      <div className="checkout-items">
        {items.map((item) => (
          <CartItem
            item={item}
            key={`${item.productId}-${item.size}-${item.color}`}
            onQuantityChange={(quantity) =>
              onQuantityChange(item.productId, item.size, item.color, quantity)
            }
            onRemove={() => onRemove(item.productId, item.size, item.color)}
          />
        ))}
      </div>
      <div className="checkout-totals">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
        </div>
        <div className="summary-row summary-total">
          <strong>Total</strong>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>
    </aside>
  )
}

export default OrderSummary
