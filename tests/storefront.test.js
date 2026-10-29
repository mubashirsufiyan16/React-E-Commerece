import assert from 'node:assert/strict'
import test from 'node:test'
import { products, productCategories } from '../src/data/products.js'
import { createPaymentCheckoutSession } from '../src/services/paymentGateway.js'
import {
  addCartItem,
  calculateCartTotals,
  normalizeCartItems,
  setCartItemQuantity,
} from '../src/utils/cart.js'
import { filterAndSortProducts } from '../src/utils/filterProducts.js'
import { isCardExpiryInFuture, isValidCardNumber } from '../src/utils/payment.js'
import { getInternationalPhoneNumber, getPhoneRule } from '../src/utils/phoneNumber.js'

test('catalog has at least 20 uniquely identified products across both collections', () => {
  assert.ok(products.length >= 20)
  assert.equal(new Set(products.map((product) => product.id)).size, products.length)
  assert.deepEqual(new Set(products.map((product) => product.collection)), new Set(['men', 'women']))
  assert.ok(Object.values(productCategories).flat().length > 0)
})

test('product filters compose collection, category, price, and search', () => {
  const result = filterAndSortProducts(products, {
    collection: 'women',
    category: 'Tops',
    search: 'linen',
    maxPrice: 70,
    sort: 'featured',
  })

  assert.deepEqual(result.map((product) => product.id), ['relaxed-linen-shirt', 'soft-linen-blouse'])
  assert.deepEqual(
    filterAndSortProducts(products, {
      collection: 'men',
      category: 'Shoes',
      search: 'nonexistent',
      maxPrice: 200,
      sort: 'featured',
    }),
    [],
  )
})

test('product sorting supports price, rating, and name', () => {
  const options = { collection: 'all', category: 'all', search: '', maxPrice: 200 }
  const lowToHigh = filterAndSortProducts(products, { ...options, sort: 'price-low' })
  const highToLow = filterAndSortProducts(products, { ...options, sort: 'price-high' })
  const byRating = filterAndSortProducts(products, { ...options, sort: 'rating' })
  const byName = filterAndSortProducts(products, { ...options, sort: 'name' })

  assert.ok(lowToHigh[0].price <= lowToHigh.at(-1).price)
  assert.ok(highToLow[0].price >= highToLow.at(-1).price)
  assert.ok(byRating[0].rating >= byRating.at(-1).rating)
  assert.ok(byName[0].name.localeCompare(byName.at(-1).name) <= 0)
})

test('cart merges matching variants and caps quantities across variants at stock', () => {
  const productId = 'everyday-crew-tee'
  const limitedStock = { [productId]: 3 }
  const firstAdd = addCartItem([], productId, 'M', 'White', 2, limitedStock)
  const secondAdd = addCartItem(firstAdd, productId, 'M', 'White', 2, limitedStock)
  const thirdAdd = addCartItem(secondAdd, productId, 'L', 'Black', 2, limitedStock)

  assert.equal(secondAdd.length, 1)
  assert.equal(secondAdd[0].quantity, 3)
  assert.equal(thirdAdd.reduce((sum, item) => sum + item.quantity, 0), 3)
})

test('cart restoration discards invalid entries and respects remaining stock', () => {
  const items = normalizeCartItems(
    [
      { productId: 'everyday-crew-tee', size: 'M', color: 'White', quantity: 3 },
      { productId: 'everyday-crew-tee', size: 'L', color: 'Black', quantity: 3 },
      { productId: 'missing-product', size: 'M', color: 'White', quantity: 1 },
      { productId: 'everyday-crew-tee', size: 'not-a-size', color: 'White', quantity: 1 },
    ],
    { 'everyday-crew-tee': 4 },
  )

  assert.deepEqual(items, [
    { productId: 'everyday-crew-tee', size: 'M', color: 'White', quantity: 3 },
    { productId: 'everyday-crew-tee', size: 'L', color: 'Black', quantity: 1 },
  ])
})

test('cart quantity updates cannot exceed stock across variants and can remove a line', () => {
  const productId = 'everyday-crew-tee'
  const stock = { [productId]: 3 }
  const items = [
    { productId, size: 'M', color: 'White', quantity: 2 },
    { productId, size: 'L', color: 'Black', quantity: 1 },
  ]
  const updated = setCartItemQuantity(items, productId, 'M', 'White', 9, stock)
  const removed = setCartItemQuantity(updated, productId, 'M', 'White', 0, stock)

  assert.equal(updated.find((item) => item.size === 'M').quantity, 2)
  assert.deepEqual(removed, [{ productId, size: 'L', color: 'Black', quantity: 1 }])
})

test('cart totals include free-shipping threshold and low-value shipping', () => {
  assert.deepEqual(
    calculateCartTotals([
      { quantity: 2, lineTotal: 80 },
    ]),
    { itemCount: 2, subtotal: 80, shipping: 8, total: 88 },
  )
  assert.deepEqual(
    calculateCartTotals([{ quantity: 1, lineTotal: 100 }]),
    { itemCount: 1, subtotal: 100, shipping: 0, total: 100 },
  )
})

test('payment and phone helpers validate values and format supported phone numbers', () => {
  assert.equal(isValidCardNumber('4242 4242 4242 4242'), true)
  assert.equal(isValidCardNumber('4242 4242 4242 4241'), false)
  assert.equal(isCardExpiryInFuture('12/30', new Date('2026-10-29T00:00:00Z')), true)
  assert.equal(isCardExpiryInFuture('09/26', new Date('2026-10-29T00:00:00Z')), false)
  assert.equal(getPhoneRule('Pakistan').nationalDigits, 10)
  assert.equal(getInternationalPhoneNumber('Pakistan', '3001234567'), '+923001234567')
  assert.equal(getPhoneRule('Unknown'), undefined)
})

test('payment session requests include order items but never card details', async () => {
  let requestUrl
  let requestOptions
  const session = await createPaymentCheckoutSession(
    {
      number: 'SH-TEST',
      email: 'shopper@example.com',
      items: [{
        productId: 'everyday-crew-tee',
        size: 'M',
        color: 'White',
        quantity: 2,
        cardNumber: 'must-not-be-sent',
      }],
    },
    'https://api.example.com/payment-sessions',
    async (url, options) => {
      requestUrl = url
      requestOptions = options
      return { ok: true, json: async () => ({ checkoutUrl: 'https://pay.example.com/session/123' }) }
    },
  )

  assert.equal(requestUrl, 'https://api.example.com/payment-sessions')
  assert.equal(requestOptions.method, 'POST')
  assert.deepEqual(JSON.parse(requestOptions.body), {
    orderReference: 'SH-TEST',
    customerEmail: 'shopper@example.com',
    items: [{ productId: 'everyday-crew-tee', size: 'M', color: 'White', quantity: 2 }],
  })
  assert.equal(session.checkoutUrl, 'https://pay.example.com/session/123')
})

test('payment session rejects invalid endpoints, failed responses, and unsafe checkout URLs', async () => {
  const order = { number: 'SH-TEST', email: 'shopper@example.com', items: [{ quantity: 1 }] }
  await assert.rejects(
    createPaymentCheckoutSession(order, 'javascript:alert(1)', async () => ({ ok: true })),
    /must use HTTPS or HTTP/,
  )
  await assert.rejects(
    createPaymentCheckoutSession(order, 'http://api.example.com/session', async () => ({ ok: true })),
    /must use HTTPS outside localhost/,
  )
  await assert.rejects(
    createPaymentCheckoutSession(order, 'https://api.example.com/session', async () => ({
      ok: false,
      status: 503,
    })),
    /status 503/,
  )
  await assert.rejects(
    createPaymentCheckoutSession(order, 'https://api.example.com/session', async () => ({
      ok: true,
      json: async () => ({ checkoutUrl: 'javascript:alert(1)' }),
    })),
    /must use HTTPS or HTTP/,
  )
})
