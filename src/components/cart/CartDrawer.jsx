import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart.js'
import CartItem from './CartItem.jsx'
import CartSummary from './CartSummary.jsx'

function CartDrawer() {
  const {
    items,
    itemCount,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isDrawerOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') closeDrawer()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDrawer, isDrawerOpen])

  if (!isDrawerOpen) return null

  function goToCheckout() {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <div
      className="drawer-backdrop"
      onClick={closeDrawer}
      onKeyDown={(event) => {
        if (event.key === 'Escape') closeDrawer()
      }}
      role="presentation"
    >
      <section
        aria-label="Shopping cart"
        aria-modal="true"
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">YOUR CART</p>
            <h2>Shopping cart <span>({itemCount})</span></h2>
          </div>
          <button aria-label="Close cart" className="icon-button close-drawer" onClick={closeDrawer} type="button">
            ×
          </button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart">
            <span aria-hidden="true" className="empty-cart-icon">◇</span>
            <h3>Your cart is empty</h3>
            <p>Find something you love and it will show up here.</p>
            <button className="button button-primary" onClick={closeDrawer} type="button">
              Explore the collection
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {items.map((item) => (
                <CartItem
                  item={item}
                  key={`${item.productId}-${item.size}-${item.color}`}
                  onQuantityChange={(quantity) =>
                    updateQuantity(item.productId, item.size, item.color, quantity)
                  }
                  onRemove={() => removeItem(item.productId, item.size, item.color)}
                />
              ))}
            </div>
            <CartSummary onCheckout={goToCheckout} />
          </>
        )}
      </section>
    </div>
  )
}

export default CartDrawer
