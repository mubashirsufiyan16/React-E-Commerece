import { getProductById, products } from '../data/products.js'

export function getProductStock(productId, stockByProduct = {}) {
  const product = getProductById(productId)
  if (!product) return 0

  const stock = stockByProduct[productId]
  return Number.isInteger(stock) && stock >= 0 && stock <= product.stock
    ? stock
    : product.stock
}

export function normalizeStock(stockByProduct) {
  const normalizedStock = {}
  products.forEach((product) => {
    normalizedStock[product.id] = getProductStock(product.id, stockByProduct ?? {})
  })
  return normalizedStock
}

function isValidCartItem(item, product, stock) {
  return (
    product &&
    stock > 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.size === 'string' &&
    product.sizes.includes(item.size) &&
    typeof item.color === 'string' &&
    product.colors.includes(item.color)
  )
}

export function normalizeCartItems(items, stockByProduct = {}) {
  if (!Array.isArray(items)) return []

  const normalizedItems = new Map()
  const productQuantities = new Map()
  items.forEach((item) => {
    if (!item || typeof item !== 'object') return

    const product = getProductById(item.productId)
    const stock = getProductStock(item.productId, stockByProduct)
    if (!isValidCartItem(item, product, stock)) return

    const alreadyInCart = productQuantities.get(item.productId) ?? 0
    const acceptedQuantity = Math.min(item.quantity, stock - alreadyInCart)
    if (acceptedQuantity < 1) return

    const key = `${product.id}-${item.size}-${item.color}`
    const existing = normalizedItems.get(key)
    if (existing) {
      existing.quantity += acceptedQuantity
    } else {
      normalizedItems.set(key, {
        productId: product.id,
        size: item.size,
        color: item.color,
        quantity: acceptedQuantity,
      })
    }
    productQuantities.set(item.productId, alreadyInCart + acceptedQuantity)
  })

  return [...normalizedItems.values()]
}

export function addCartItem(items, productId, size, color, quantity, stockByProduct = {}) {
  const product = getProductById(productId)
  const stock = getProductStock(productId, stockByProduct)
  if (
    !product ||
    stock < 1 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    typeof size !== 'string' ||
    !product.sizes.includes(size) ||
    typeof color !== 'string' ||
    !product.colors.includes(color)
  ) {
    return items
  }

  const currentItems = normalizeCartItems(items, stockByProduct)
  const currentProductQuantity = currentItems
    .filter((item) => item.productId === product.id)
    .reduce((total, item) => total + item.quantity, 0)
  const acceptedQuantity = Math.min(quantity, stock - currentProductQuantity)
  if (acceptedQuantity < 1) return currentItems

  const existing = currentItems.find(
    (item) => item.productId === product.id && item.size === size && item.color === color,
  )

  if (!existing) {
    return [
      ...currentItems,
      { productId: product.id, size, color, quantity: acceptedQuantity },
    ]
  }

  return currentItems.map((item) =>
    item === existing
      ? { ...item, quantity: item.quantity + acceptedQuantity }
      : item,
  )
}

export function setCartItemQuantity(items, productId, size, color, quantity, stockByProduct = {}) {
  const product = getProductById(productId)
  if (!product || !Number.isInteger(quantity)) return items

  if (quantity <= 0) {
    return items.filter(
      (item) => item.productId !== productId || item.size !== size || item.color !== color,
    )
  }

  const normalizedItems = normalizeCartItems(items, stockByProduct)
  const otherVariantQuantity = normalizedItems
    .filter((item) => item.productId === productId && (item.size !== size || item.color !== color))
    .reduce((total, item) => total + item.quantity, 0)
  const maximumQuantity = Math.max(0, getProductStock(productId, stockByProduct) - otherVariantQuantity)

  const updatedItems = normalizedItems.map((item) =>
    item.productId === productId && item.size === size && item.color === color
      ? { ...item, quantity: Math.min(maximumQuantity, quantity) }
      : item,
  )
  return updatedItems.filter((item) => item.quantity > 0)
}

export function calculateCartTotals(items) {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0)
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 8

  return { itemCount, subtotal, shipping, total: subtotal + shipping }
}
