export async function placeSimulatedOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error('A simulated order requires at least one cart item.')
  }
  if (!['cod', 'card'].includes(order.paymentMethod)) {
    throw new Error('A simulated order requires a supported payment method.')
  }

  return { status: 'simulated', order }
}
