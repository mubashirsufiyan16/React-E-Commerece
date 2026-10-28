export function isValidCardNumber(value) {
  const digits = String(value).replace(/[\s-]/g, '')
  if (!/^\d{12,19}$/.test(digits)) return false

  let sum = 0
  let shouldDouble = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

export function isCardExpiryInFuture(value, currentDate = new Date()) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(value))
  if (!match) return false

  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  return year > currentDate.getFullYear() ||
    (year === currentDate.getFullYear() && month >= currentDate.getMonth() + 1)
}
