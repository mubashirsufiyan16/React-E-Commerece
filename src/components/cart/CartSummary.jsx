import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart.js'
import { formatCurrency } from '../../utils/formatCurrency.js'

function CartSummary({ onCheckout, compact = false }) {
  const { subtotal, shipping, total, itemCount } = useCart()

  return (
    <section className={`cart-summary${compact ? ' cart-summary-compact' : ''}`}>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>{shipping === 0 && itemCount > 0 ? 'Free' : formatCurrency(shipping)}</span>
      </div>
      <p className="shipping-note">
        {itemCount > 0 && subtotal < 100
          ? `You're ${formatCurrency(100 - subtotal)} away from free shipping.`
          : 'Free shipping on orders over $100.'}
      </p>
      <div className="summary-row summary-total">
        <strong>Total</strong>
        <strong>{formatCurrency(total)}</strong>
      </div>
      {onCheckout && (
        <button
          className="button button-primary full-width"
          disabled={itemCount === 0}
          onClick={onCheckout}
          type="button"
        >
          Continue to checkout
        </button>
      )}
      {!compact && (
        <Link className="continue-shopping" to="/">
          Continue shopping
        </Link>
      )}
      <p className="tax-note">Taxes are calculated at checkout.</p>
    </section>
  )
}

export default CartSummary
