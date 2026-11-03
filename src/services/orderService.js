export const ORDER_HISTORY_STORAGE_KEY = 'stylehub-order-history'

function isSavedOrder(order) {
  return (
    order?.status === 'simulated' &&
    typeof order.number === 'string' &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    order.items.every(
      (item) =>
        item &&
        Number.isFinite(item.quantity) &&
        Number.isFinite(item.lineTotal),
    ) &&
    Number.isFinite(order.total) &&
    typeof order.placedAt === 'string' &&
    Number.isFinite(Date.parse(order.placedAt))
  )
}

export function getOrderHistory() {
  try {
    const savedOrders = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY)
    let orders = []
    if (savedOrders) {
      orders = JSON.parse(savedOrders)
      if (!Array.isArray(orders)) {
        throw new Error('Saved order history must be a list.')
      }
    }

    const validOrders = orders.filter(isSavedOrder)
    if (validOrders.length > 0) return validOrders

    const lastOrder = window.sessionStorage.getItem('stylehub-last-order')
    if (!lastOrder) return []

    const previousOrder = JSON.parse(lastOrder)
    if (!isSavedOrder(previousOrder)) return []

    window.localStorage.setItem(
      ORDER_HISTORY_STORAGE_KEY,
      JSON.stringify([previousOrder]),
    )
    return [previousOrder]
  } catch (error) {
    console.error('Unable to restore StyleHub order history.', error)
    return []
  }
}

export function saveOrderToHistory(order) {
  if (!isSavedOrder(order)) {
    throw new Error('Only confirmed orders can be added to order history.')
  }

  const savedOrders = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY)
  const orders = savedOrders ? JSON.parse(savedOrders) : []
  if (!Array.isArray(orders)) {
    throw new Error('Saved order history must be a list.')
  }

  const nextOrders = [
    order,
    ...orders.filter((savedOrder) => savedOrder?.number !== order.number),
  ]
  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(nextOrders))
}

export function deleteOrderFromHistory(orderNumber) {
  const savedOrders = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY)
  const orders = savedOrders ? JSON.parse(savedOrders) : []
  if (!Array.isArray(orders)) {
    throw new Error('Saved order history must be a list.')
  }

  const nextOrders = orders.filter((order) => order?.number !== orderNumber)
  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(nextOrders))

  const lastOrder = window.sessionStorage.getItem('stylehub-last-order')
  if (lastOrder && JSON.parse(lastOrder)?.number === orderNumber) {
    window.sessionStorage.removeItem('stylehub-last-order')
  }
}

export async function placeSimulatedOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error('A simulated order requires at least one cart item.')
  }
  if (!['cod', 'card'].includes(order.paymentMethod)) {
    throw new Error('A simulated order requires a supported payment method.')
  }

  return { status: 'simulated', order }
}
