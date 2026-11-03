function parseHttpUrl(value, label) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${label} must be a valid absolute URL.`)
  }

  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error(`${label} must use HTTPS or HTTP.`)
  }
  if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error(`${label} must use HTTPS outside localhost.`)
  }
  return url
}

export async function createPaymentCheckoutSession(order, endpoint, fetchImpl = fetch) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error('A payment checkout requires at least one order item.')
  }

  const sessionEndpoint = parseHttpUrl(endpoint, 'Payment session endpoint')
  const response = await fetchImpl(sessionEndpoint.href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: order.number,
      customerEmail: order.email,
      items: order.items.map(({ productId, size, color, quantity }) => ({
        productId,
        size,
        color,
        quantity,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`Payment session creation failed with status ${response.status}.`)
  }

  let session
  try {
    session = await response.json()
  } catch (error) {
    throw new Error('Payment session response was not valid JSON.', { cause: error })
  }

  const checkoutUrl = parseHttpUrl(session?.checkoutUrl, 'Payment checkout URL')
  return { checkoutUrl: checkoutUrl.href }
}
