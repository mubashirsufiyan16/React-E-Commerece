import { useEffect, useState } from 'react'
import { getProductById } from '../data/products.js'
import {
  addCartItem,
  calculateCartTotals,
  getProductStock,
  normalizeCartItems,
  normalizeStock,
  setCartItemQuantity,
} from '../utils/cart.js'
import { CartContext } from './cartContext.js'

const CART_STORAGE_KEY = 'stylehub-cart'
const STOCK_STORAGE_KEY = 'stylehub-stock'

function readSavedStock() {
  try {
    const savedStock = window.localStorage.getItem(STOCK_STORAGE_KEY)
    return normalizeStock(savedStock ? JSON.parse(savedStock) : {})
  } catch (error) {
    console.error('Unable to restore StyleHub inventory.', error)
    return normalizeStock()
  }
}

function readSavedCart(stockByProduct) {
  try {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    return normalizeCartItems(savedCart ? JSON.parse(savedCart) : [], stockByProduct)
  } catch (error) {
    console.error('Unable to restore the saved StyleHub cart.', error)
    return []
  }
}

export function CartProvider({ children }) {
  const [stockByProduct, setStockByProduct] = useState(readSavedStock)
  const [items, setItems] = useState(() => readSavedCart(stockByProduct))
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Unable to save the StyleHub cart.', error)
    }
  }, [items])

  function addItem(product, size, color, quantity = 1) {
    if (!product) return

    setItems((currentItems) =>
      addCartItem(currentItems, product.id, size, color, quantity, stockByProduct),
    )
    setIsDrawerOpen(true)
  }

  function updateQuantity(productId, size, color, quantity) {
    setItems((currentItems) =>
      setCartItemQuantity(currentItems, productId, size, color, quantity, stockByProduct),
    )
  }

  function getStock(productId) {
    return getProductStock(productId, stockByProduct)
  }

  function deductStock(orderItems) {
    const updatedStock = { ...stockByProduct }

    orderItems.forEach((item) => {
      const product = getProductById(item.productId)
      const validItem =
        product &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        product.sizes.includes(item.size) &&
        product.colors.includes(item.color)

      if (!validItem) {
        throw new Error('The order contains an invalid product or quantity.')
      }

      const currentStock = getProductStock(item.productId, updatedStock)
      if (item.quantity > currentStock) {
        throw new Error(`Not enough stock remains for ${item.productId}.`)
      }
      updatedStock[item.productId] = currentStock - item.quantity
    })

    try {
      window.localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(updatedStock))
    } catch (error) {
      console.error('Unable to save the updated StyleHub inventory.', error)
      throw new Error('The updated inventory could not be saved.', { cause: error })
    }

    setStockByProduct(updatedStock)
  }

  function removeItem(productId, size, color) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.productId !== productId || item.size !== size || item.color !== color,
      ),
    )
  }

  function clearCart() {
    setItems([])
  }

  function openDrawer() {
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
  }

  const cartItems = items
    .map((item) => {
      const product = getProductById(item.productId)
      if (!product) return null

      return {
        ...item,
        product: { ...product, stock: getStock(product.id) },
        lineTotal: product.price * item.quantity,
      }
    })
    .filter(Boolean)

  const totals = calculateCartTotals(cartItems)
  const value = {
    items: cartItems,
    ...totals,
    isDrawerOpen,
    addItem,
    updateQuantity,
    getStock,
    deductStock,
    removeItem,
    clearCart,
    openDrawer,
    closeDrawer,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
