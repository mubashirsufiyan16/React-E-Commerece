import { getProductById, products } from '../data/products.js'

export function getProductStock(productId, stockByProduct = {}) {
  const product = getProductById(productId)
  if (!product) return 0

  const savedStock = stockByProduct[productId]
  if (Number.isInteger(savedStock) && savedStock >= 0 && savedStock <= product.stock) {
    return savedStock
  }
  return product.stock
}

export function normalizeStock(savedStock = {}) {
  const stock = {}

  products.forEach((product) => {
    stock[product.id] = getProductStock(product.id, savedStock)
  })

  return stock
}

function isValidCartItem(item, product, stock) {
  return (
    product &&
    stock > 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    product.sizes.includes(item.size) &&
    product.colors.includes(item.color)
  )
}

export function normalizeCartItems(savedItems, stockByProduct = {}) {
  if (!Array.isArray(savedItems)) return []

  const cartItems = []

  savedItems.forEach((item) => {
    if (!item || typeof item !== 'object') return

    const product = getProductById(item.productId)
    const stock = getProductStock(item.productId, stockByProduct)
    if (!isValidCartItem(item, product, stock)) return

    let quantityAlreadyInCart = 0
    cartItems.forEach((cartItem) => {
      if (cartItem.productId === product.id) {
        quantityAlreadyInCart += cartItem.quantity
      }
    })

    const quantityToAdd = Math.min(item.quantity, stock - quantityAlreadyInCart)
    if (quantityToAdd < 1) return

    const matchingItem = cartItems.find(
      (cartItem) =>
        cartItem.productId === product.id &&
        cartItem.size === item.size &&
        cartItem.color === item.color,
    )

    if (matchingItem) {
      matchingItem.quantity += quantityToAdd
    } else {
      cartItems.push({
        productId: product.id,
        size: item.size,
        color: item.color,
        quantity: quantityToAdd,
      })
    }
  })

  return cartItems
}

export function addCartItem(items, productId, size, color, quantity, stockByProduct = {}) {
  const product = getProductById(productId)
  const stock = getProductStock(productId, stockByProduct)

  if (
    !product ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    !product.sizes.includes(size) ||
    !product.colors.includes(color)
  ) {
    return items
  }

  const cartItems = normalizeCartItems(items, stockByProduct)
  let quantityAlreadyInCart = 0
  cartItems.forEach((item) => {
    if (item.productId === productId) quantityAlreadyInCart += item.quantity
  })

  const quantityToAdd = Math.min(quantity, stock - quantityAlreadyInCart)
  if (quantityToAdd < 1) return cartItems

  const matchingItem = cartItems.find(
    (item) => item.productId === productId && item.size === size && item.color === color,
  )

  if (matchingItem) {
    matchingItem.quantity += quantityToAdd
    return cartItems
  }

  return [...cartItems, { productId, size, color, quantity: quantityToAdd }]
}

export function setCartItemQuantity(items, productId, size, color, quantity, stockByProduct = {}) {
  if (!Number.isInteger(quantity)) return items

  if (quantity <= 0) {
    return items.filter(
      (item) => item.productId !== productId || item.size !== size || item.color !== color,
    )
  }

  const cartItems = normalizeCartItems(items, stockByProduct)
  const productStock = getProductStock(productId, stockByProduct)
  let otherVariantQuantity = 0

  cartItems.forEach((item) => {
    const isDifferentVariant =
      item.productId === productId && (item.size !== size || item.color !== color)
    if (isDifferentVariant) otherVariantQuantity += item.quantity
  })

  const maxQuantity = Math.max(0, productStock - otherVariantQuantity)
  const itemExists = cartItems.some(
    (item) => item.productId === productId && item.size === size && item.color === color,
  )
  if (!itemExists) return cartItems

  return cartItems
    .map((item) => {
      if (item.productId === productId && item.size === size && item.color === color) {
        return { ...item, quantity: Math.min(quantity, maxQuantity) }
      }
      return item
    })
    .filter((item) => item.quantity > 0)
}

export function calculateCartTotals(items) {
  let itemCount = 0
  let subtotal = 0

  items.forEach((item) => {
    itemCount += item.quantity
    subtotal += item.lineTotal
  })

  const shipping = subtotal > 0 && subtotal < 100 ? 8 : 0

  return { itemCount, subtotal, shipping, total: subtotal + shipping }
}
