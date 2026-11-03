import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency.js'

function OrderConfirmationPage() {
  const location = useLocation()
  const orderFromNavigation = location.state?.order
  const [savedOrder] = useState(() => {
    if (orderFromNavigation) return null
    try {
      const saved = window.sessionStorage.getItem('stylehub-last-order')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Unable to restore the StyleHub order confirmation.', error)
      return null
    }
  })

  const order = orderFromNavigation ?? savedOrder
  const paymentMethodLabel = order?.paymentMethod === 'card'
    ? 'Debit / credit card (simulated)'
    : order?.paymentMethod === 'cod'
      ? 'Cash on delivery'
      : 'Demo payment'

  if (
    order?.status !== 'simulated' ||
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    !Number.isFinite(order.total)
  ) {
    return (
      <section className="confirmation-card">
        <p className="eyebrow">ORDER DETAILS UNAVAILABLE</p>
        <h1>We couldn’t find this order</h1>
        <p>Start shopping to create a new order. No payment has been processed.</p>
        <Link className="button button-primary" to="/">Back to StyleHub</Link>
      </section>
    )
  }

  return (
    <section className="confirmation-card">
      <span aria-hidden="true" className="confirmation-icon">✓</span>
      <p className="eyebrow">THANK YOU, {order.customerName?.split(' ')[0]?.toUpperCase()}</p>
      <h1>Your order is confirmed</h1>
      <p className="confirmation-message">
        This is a simulated order for your assessment. No payment has been taken.
        {order.paymentMethod === 'cod'
          ? ' Please pay when your order is delivered.'
          : ' Card payment was only simulated; no card details were saved.'}
        {' '}A confirmation summary is available for <strong>{order.email}</strong>.
      </p>
      <div className="order-reference">
        <span>ORDER REFERENCE</span>
        <strong>{order.number}</strong>
      </div>
      <div className="confirmation-items">
        <div className="confirmation-item">
          <span>Payment method</span><strong>{paymentMethodLabel}</strong>
        </div>
        <div className="confirmation-item">
          <span>Payment status</span>
          <strong>{order.paymentStatus === 'due_on_delivery' ? 'Due on delivery' : 'Not charged (demo)'}</strong>
        </div>
        {order.items.map((item) => (
          <div className="confirmation-item" key={`${item.productId}-${item.size}-${item.color}`}>
            <span>{item.product.name} <small>× {item.quantity}</small></span>
            <strong>{formatCurrency(item.lineTotal)}</strong>
          </div>
        ))}
        <div className="confirmation-item"><span>Shipping</span><strong>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</strong></div>
        <div className="confirmation-item confirmation-total"><strong>Total</strong><strong>{formatCurrency(order.total)}</strong></div>
      </div>
      <Link className="button button-primary" to="/">Continue exploring</Link>
    </section>
  )
}

export default OrderConfirmationPage
