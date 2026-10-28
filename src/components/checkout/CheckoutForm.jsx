import { useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { getPhoneRule } from '../../utils/phoneNumber.js'

const citiesByCountry = {
  Australia: ['Adelaide', 'Brisbane', 'Canberra', 'Melbourne', 'Perth', 'Sydney'],
  Bangladesh: ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Rajshahi', 'Sylhet'],
  Canada: ['Calgary', 'Montreal', 'Ottawa', 'Toronto', 'Vancouver', 'Winnipeg'],
  India: ['Ahmedabad', 'Bengaluru', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai'],
  Pakistan: [
    'Faisalabad',
    'Gujranwala',
    'Hyderabad',
    'Islamabad',
    'Karachi',
    'Lahore',
    'Multan',
    'Peshawar',
    'Quetta',
    'Rawalpindi',
  ],
  'Saudi Arabia': ['Abha', 'Dammam', 'Jeddah', 'Mecca', 'Medina', 'Riyadh'],
  'United Arab Emirates': ['Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Sharjah', 'Umm Al Quwain'],
  'United Kingdom': ['Birmingham', 'Bristol', 'Edinburgh', 'Glasgow', 'London', 'Manchester'],
  'United States': ['Austin', 'Chicago', 'Los Angeles', 'New York', 'Seattle', 'Washington, D.C.'],
}

function CheckoutForm({ formError, isSubmitting, onSubmit, paymentMethod, setPaymentMethod, total }) {
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const availableCities = citiesByCountry[country] ?? []
  const phoneRule = getPhoneRule(country)

  return (
    <form className="checkout-form" onSubmit={onSubmit}>
      <section className="form-section">
        <div className="form-section-heading">
          <span className="step-number">01</span>
          <div>
            <h2>Contact information</h2>
            <p>Where should we send your order updates?</p>
          </div>
        </div>
        <label className="form-field">
          <span>Email address</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <span className="step-number">02</span>
          <div>
            <h2>Shipping address</h2>
            <p>Tell us where your pieces should go.</p>
          </div>
        </div>
        <div className="form-fields-grid">
          <label className="form-field field-span">
            <span>Full name</span>
            <input autoComplete="name" name="fullName" placeholder="Your full name" required />
          </label>
          <label className="form-field field-span">
            <span>Street address</span>
            <input
              autoComplete="street-address"
              name="address"
              placeholder="House number and street"
              required
            />
          </label>
          <label className="form-field">
            <span>City</span>
            <select
              autoComplete="address-level2"
              disabled={!country}
              name="city"
              onChange={(event) => setCity(event.target.value)}
              required
              value={city}
            >
              <option disabled value="">
                {country ? 'Choose a city' : 'Select a country first'}
              </option>
              {availableCities.map((availableCity) => (
                <option key={availableCity} value={availableCity}>
                  {availableCity}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Postal code <small>(optional)</small></span>
            <input autoComplete="postal-code" name="postalCode" placeholder="Postal code" />
          </label>
          <label className="form-field field-span">
            <span>Country / region</span>
            <select
              autoComplete="country-name"
              onChange={(event) => {
                const nextCountry = event.target.value
                setCountry(nextCountry)
                setCity('')
                setPhone('')
                event.currentTarget.form.elements.phoneNational.setCustomValidity('')
              }}
              value={country}
              name="country"
              required
            >
              <option disabled value="">Choose a country</option>
              <option>Bangladesh</option>
              <option>India</option>
              <option>Saudi Arabia</option>
              <option>United Arab Emirates</option>
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Pakistan</option>
            </select>
          </label>
          <label className="form-field field-span">
            <span>Phone number</span>
            <div className="phone-input-row">
              <input
                aria-label="Country calling code"
                className="phone-country-code"
                readOnly
                tabIndex="-1"
                value={phoneRule?.dialCode ?? ''}
              />
              <input
                autoComplete="tel-national"
                disabled={!phoneRule}
                inputMode="numeric"
                name="phoneNational"
                onChange={(event) => {
                  setPhone(event.target.value)
                  event.target.setCustomValidity('')
                }}
                onInvalid={(event) => {
                  event.target.setCustomValidity(
                    `Please enter the correct phone number: use ${phoneRule?.dialCode ?? 'the selected country code'} and ${phoneRule?.nationalDigits ?? ''} digits.`,
                  )
                }}
                pattern={phoneRule ? `[0-9]{${phoneRule.nationalDigits}}` : undefined}
                maxLength={phoneRule?.nationalDigits}
                placeholder={
                  phoneRule
                    ? `${phoneRule.nationalDigits} digit phone number`
                    : 'Select a country first'
                }
                required
                title={
                  phoneRule
                    ? `Enter ${phoneRule.nationalDigits} digits. The ${phoneRule.dialCode} country code is fixed.`
                    : 'Select a country before entering your phone number.'
                }
                type="tel"
                value={phone}
              />
            </div>
          </label>
        </div>
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <span className="step-number">03</span>
          <div>
            <h2>Payment method</h2>
            <p>Choose how you would like to pay.</p>
          </div>
        </div>
        <div className="payment-options">
          <label className={`payment-option${paymentMethod === 'cod' ? ' selected' : ''}`}>
            <input
              checked={paymentMethod === 'cod'}
              name="paymentMethod"
              onChange={() => setPaymentMethod('cod')}
              type="radio"
              value="cod"
            />
            <span className="payment-option-copy">
              <strong>Cash on delivery</strong>
              <small>Pay when your order arrives.</small>
            </span>
          </label>
          <label className={`payment-option${paymentMethod === 'card' ? ' selected' : ''}`}>
            <input
              checked={paymentMethod === 'card'}
              name="paymentMethod"
              onChange={() => setPaymentMethod('card')}
              type="radio"
              value="card"
            />
            <span className="payment-option-copy">
              <strong>Debit or credit card</strong>
              <small>Simulated card payment; no charge will be made.</small>
            </span>
          </label>
        </div>
        {paymentMethod === 'card' && (
          <div className="card-payment-fields">
            <p className="demo-card-notice">
              Demo only: use test card details, not a real card. Card details are not saved.
              Example: 4242 4242 4242 4242 · 12/30 · 123
            </p>
            <label className="form-field">
              <span>Name on card</span>
              <input
                autoComplete="off"
                name="cardholderName"
                placeholder="Name as shown on card"
                required
              />
            </label>
            <label className="form-field">
              <span>Card number</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                maxLength={23}
                name="cardNumber"
                onChange={(event) => event.target.setCustomValidity('')}
                placeholder="1234 5678 9012 3456"
                required
                type="text"
              />
            </label>
            <div className="form-fields-grid">
              <label className="form-field">
                <span>Expiry date</span>
                <input
                  autoComplete="off"
                  maxLength={5}
                  name="cardExpiry"
                  onChange={(event) => event.target.setCustomValidity('')}
                  pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                  placeholder="MM/YY"
                  required
                  title="Enter the expiry date as MM/YY."
                />
              </label>
              <label className="form-field">
                <span>Security code</span>
                <input
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={4}
                  name="cardCvc"
                  pattern="[0-9]{3,4}"
                  placeholder="CVV"
                  required
                  title="Enter the 3 or 4 digit security code."
                />
              </label>
            </div>
          </div>
        )}
      </section>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <button
        className="button button-primary checkout-submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
        ? 'Processing your order…'
        : `${paymentMethod === 'card' ? 'Simulate card payment' : 'Place COD order'} · ${formatCurrency(total)}`}
      </button>
      <p className="payment-disclaimer">
        Demo checkout only. No payment will be collected or processed.
      </p>
    </form>
  )
}

export default CheckoutForm
