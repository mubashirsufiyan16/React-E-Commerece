import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/checkout/CheckoutForm.jsx'
import OrderSummary from '../components/checkout/OrderSummary.jsx'
import { useCart } from '../hooks/useCart.js'
import { createPaymentCheckoutSession } from '../services/paymentGateway.js'
import { placeSimulatedOrder } from '../services/orderService.js'
import { getInternationalPhoneNumber } from '../utils/phoneNumber.js'
import { isCardExpiryInFuture, isValidCardNumber } from '../utils/payment.js'

function validateCheckoutForm(form, formData, paymentMethod, hasPaymentGateway) {
  const requiredFields = ['email', 'fullName', 'address', 'city', 'country', 'phoneNational']
  const hasMissingField = requiredFields.some(
    (field) => !String(formData.get(field) ?? '').trim(),
  )

  if (hasMissingField) {
    return {
      isValid: false,
      message: 'Please complete all required contact and shipping fields.',
    }
  }

  if (paymentMethod !== 'card' || hasPaymentGateway) return { isValid: true }

  const cardNumberInput = form.elements.cardNumber
  const expiryInput = form.elements.cardExpiry
  if (!isValidCardNumber(formData.get('cardNumber'))) {
    cardNumberInput.setCustomValidity('Enter a valid card number.')
    cardNumberInput.reportValidity()
    return { isValid: false }
  }

  if (!isCardExpiryInFuture(formData.get('cardExpiry'))) {
    expiryInput.setCustomValidity('Enter a valid future expiry date.')
    expiryInput.reportValidity()
    return { isValid: false }
  }

  return { isValid: true }
}

function createOrder(formData, cart, paymentMethod) {
  return {
    number: `SH-${Date.now().toString(36).toUpperCase()}`,
    email: String(formData.get('email')).trim(),
    customerName: String(formData.get('fullName')).trim(),
    phone: getInternationalPhoneNumber(
      String(formData.get('country')),
      String(formData.get('phoneNational')).trim(),
    ),
    shippingAddress: {
      address: String(formData.get('address')).trim(),
      city: String(formData.get('city')).trim(),
      postalCode: String(formData.get('postalCode')).trim(),
      country: String(formData.get('country')).trim(),
    },
    items: cart.items,
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    paymentMethod,
    paymentStatus: paymentMethod === 'card' ? 'simulated' : 'due_on_delivery',
    placedAt: new Date().toISOString(),
  }
}

function CheckoutPage() {
  const paymentSessionUrl = import.meta.env.VITE_PAYMENT_SESSION_URL?.trim() ?? ''
  const hasPaymentGateway = paymentSessionUrl.length > 0
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    deductStock,
    clearCart,
    updateQuantity,
    removeItem,
  } = useCart()
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const navigate = useNavigate()

  if (itemCount === 0 && !isSubmitting) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const validation = validateCheckoutForm(form, formData, paymentMethod, hasPaymentGateway)
    if (!validation.isValid) {
      if (validation.message) setFormError(validation.message)
      return
    }

    setFormError('')
    setIsSubmitting(true)
    const order = createOrder(
      formData,
      { items, subtotal, shipping, total },
      paymentMethod,
    )
    let previousOrder
    let savedOrder = false

    try {
      if (paymentMethod === 'card' && hasPaymentGateway) {
        const session = await createPaymentCheckoutSession(order, paymentSessionUrl)
        window.location.assign(session.checkoutUrl)
        return
      }

      const result = await placeSimulatedOrder(order)
      if (result.status !== 'simulated') {
        throw new Error('The simulated order did not complete successfully.')
      }

      const confirmedOrder = { ...result.order, status: result.status }
      previousOrder = window.sessionStorage.getItem('stylehub-last-order')
      window.sessionStorage.setItem('stylehub-last-order', JSON.stringify(confirmedOrder))
      savedOrder = true
      deductStock(items)
      clearCart()
      navigate('/order-confirmation', { state: { order: confirmedOrder } })
    } catch (error) {
      console.error('Unable to complete StyleHub checkout.', error)
      if (savedOrder) {
        try {
          if (previousOrder) {
            window.sessionStorage.setItem('stylehub-last-order', previousOrder)
          } else {
            window.sessionStorage.removeItem('stylehub-last-order')
          }
        } catch (storageError) {
          console.error('Unable to restore the previous StyleHub order.', storageError)
        }
      }
      setFormError('Checkout could not be completed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="checkout-page">
      <nav aria-label="Checkout progress" className="checkout-progress">
        <Link to="/">Cart</Link><span>—</span><strong>Information &amp; delivery</strong><span>—</span><span>Confirmation</span>
      </nav>
      <div className="checkout-heading">
        <p className="eyebrow">ALMOST YOURS</p>
        <h1>Checkout</h1>
        <p>Review your order, delivery details, and payment method.</p>
      </div>
      <div className="checkout-layout">
        <CheckoutForm
          formError={formError}
          hasPaymentGateway={hasPaymentGateway}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          total={total}
        />
        <OrderSummary
          items={items}
          itemCount={itemCount}
          onQuantityChange={updateQuantity}
          onRemove={removeItem}
          shipping={shipping}
          subtotal={subtotal}
          total={total}
        />
      </div>
    </div>
  )
}

export default CheckoutPage
