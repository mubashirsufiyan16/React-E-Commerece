import { useCallback, useEffect, useMemo, useState } from 'react'
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

const STORAGE_KEY = 'stylehub-cart'
const STOCK_STORAGE_KEY = 'stylehub-stock'

function readStoredStock() {
  try {
    const storedStock = window.localStorage.getItem(STOCK_STORAGE_KEY)
    return normalizeStock(storedStock ? JSON.parse(storedStock) : {})
  } catch (error) {
    console.error('Unable to restore StyleHub inventory.', error)
    return normalizeStock({})
  }
}

function readStoredCart(stockByProduct) {
  try {
    const storedCart = window.localStorage.getItem(STORAGE_KEY)
    if (!storedCart) return []

    return normalizeCartItems(JSON.parse(storedCart), stockByProduct)
  } catch (error) {
    console.error('Unable to restore the saved StyleHub cart.', error)
    return []
  }
}

export function CartProvider({ children }) {
  const [stockByProduct, setStockByProduct] = useState(readStoredStock)
  const [items, setItems] = useState(() => readStoredCart(stockByProduct))
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Unable to save the StyleHub cart.', error)
    }
  }, [items])

  const addItem = useCallback((product, size, color, quantity = 1) => {
    if (!product) return

    setItems((currentItems) =>
      addCartItem(currentItems, product.id, size, color, quantity, stockByProduct),
    )
    setIsDrawerOpen(true)
  }, [stockByProduct])

  const updateQuantity = useCallback((productId, size, color, quantity) => {
    setItems((currentItems) =>
      setCartItemQuantity(currentItems, productId, size, color, quantity, stockByProduct),
    )
  }, [stockByProduct])

  const getStock = useCallback(
    (productId) => getProductStock(productId, stockByProduct),
    [stockByProduct],
  )

  const deductStock = useCallback((orderItems) => {
    const orderedQuantities = new Map()
    orderItems.forEach((item) => {
      const product = getProductById(item.productId)
      if (
        !product ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        !product.sizes.includes(item.size) ||
        !product.colors.includes(item.color)
      ) {
        throw new Error('The order contains an invalid product quantity.')
      }

      orderedQuantities.set(
        item.productId,
        (orderedQuantities.get(item.productId) ?? 0) + item.quantity,
      )
    })

    const nextStock = { ...stockByProduct }
    orderedQuantities.forEach((quantity, productId) => {
      const currentStock = getProductStock(productId, stockByProduct)
      if (quantity > currentStock) {
        throw new Error(`Not enough stock remains for ${productId}.`)
      }
      nextStock[productId] = currentStock - quantity
    })

    try {
      window.localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(nextStock))
    } catch (error) {
      console.error('Unable to save the updated StyleHub inventory.', error)
      throw new Error('The updated inventory could not be saved.', { cause: error })
    }

    setStockByProduct(nextStock)
  }, [stockByProduct])

  const removeItem = useCallback((productId, size, color) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.productId !== productId || item.size !== size || item.color !== color,
      ),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const cartItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = getProductById(item.productId)
          return product
            ? {
                ...item,
                product: { ...product, stock: getStock(product.id) },
                lineTotal: product.price * item.quantity,
              }
            : null
        })
        .filter(Boolean),
    [getStock, items],
  )
  const { itemCount, subtotal, shipping, total } = calculateCartTotals(cartItems)

  const value = {
    items: cartItems,
    itemCount,
    subtotal,
    shipping,
    total,
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
