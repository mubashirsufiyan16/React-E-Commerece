export function isValidDemoCardNumber(value) {
  const digits = String(value).replace(/[\s-]/g, '')
  return /^\d{12,19}$/.test(digits)
}

export function isCardExpiryInFuture(value, currentDate = new Date()) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(value))
  if (!match) return false

  const expiryYear = 2000 + Number(match[2])
  const expiryMonth = Number(match[1])
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  return expiryYear > currentYear ||
    (expiryYear === currentYear && expiryMonth >= currentMonth)
}
