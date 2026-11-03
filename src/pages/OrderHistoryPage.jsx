import { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageWithFallback from '../components/ImageWithFallback.jsx'
import { getProductById } from '../data/products.js'
import { getOrderHistory } from '../services/orderService.js'
import { formatCurrency } from '../utils/formatCurrency.js'

function OrderHistoryPage() {
  const [orders] = useState(getOrderHistory)

  return (
    <div className="order-history-page">
      <p className="eyebrow">YOUR PURCHASES</p>
      <h1>Order history</h1>
      {orders.length > 0 ? (
        <div className="order-history-list">
          {orders.map((order) => (
            <article className="confirmation-card order-history-card" key={order.number}>
              <div className="order-reference">
                <span>ORDER REFERENCE</span>
                <strong>{order.number}</strong>
              </div>
              <p className="order-history-date">
                Placed {new Date(order.placedAt).toLocaleDateString()}
              </p>
              <div className="confirmation-items">
                {order.items.map((item, index) => (
                  <article
                    className="cart-item order-history-item"
                    key={`${item.productId}-${item.size}-${item.color}-${index}`}
                  >
                    <Link
                      className="cart-item-image"
                      to={`/products/${item.productId}`}
                    >
                      <ImageWithFallback
                        alt={item.product?.name ?? getProductById(item.productId)?.name ?? 'Product'}
                        src={item.product?.image ?? getProductById(item.productId)?.image}
                      />
                    </Link>
                    <div className="cart-item-details">
                      <div className="cart-item-heading">
                        <Link to={`/products/${item.productId}`}>
                          {item.product?.name ?? getProductById(item.productId)?.name ?? 'Product'}
                        </Link>
                      </div>
                      <p>
                        {item.color} · Size {item.size}
                      </p>
                      <div className="cart-item-footer">
                        <span>Quantity × {item.quantity}</span>
                        <strong>{formatCurrency(item.lineTotal)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
                <div className="confirmation-item">
                  <span>Payment</span>
                  <strong>
                    {order.paymentMethod === 'cod'
                      ? 'Cash on delivery'
                      : 'Debit / credit card (simulated)'}
                  </strong>
                </div>
                <div className="confirmation-item">
                  <span>Shipping</span>
                  <strong>
                    {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                  </strong>
                </div>
                {order.shippingAddress && (
                  <div className="confirmation-item">
                    <span>Delivery address</span>
                    <strong>
                      {[
                        order.shippingAddress.address,
                        order.shippingAddress.city,
                        order.shippingAddress.postalCode,
                        order.shippingAddress.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </strong>
                  </div>
                )}
                <div className="confirmation-item confirmation-total">
                  <strong>Total</strong>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="confirmation-card order-history-empty">
          <h2>No orders yet</h2>
          <p>Your confirmed orders will appear here.</p>
          <Link className="button button-primary" to="/">
            Start shopping
          </Link>
        </section>
      )}
    </div>
  )
}

export default OrderHistoryPage
