const phoneRulesByCountry = {
  Australia: { dialCode: '+61', nationalDigits: 9 },
  Bangladesh: { dialCode: '+880', nationalDigits: 10 },
  Canada: { dialCode: '+1', nationalDigits: 10 },
  India: { dialCode: '+91', nationalDigits: 10 },
  Pakistan: { dialCode: '+92', nationalDigits: 10 },
  'Saudi Arabia': { dialCode: '+966', nationalDigits: 9 },
  'United Arab Emirates': { dialCode: '+971', nationalDigits: 9 },
  'United Kingdom': { dialCode: '+44', nationalDigits: 10 },
  'United States': { dialCode: '+1', nationalDigits: 10 },
}

export function getPhoneRule(country) {
  return phoneRulesByCountry[country]
}

export function getInternationalPhoneNumber(country, nationalNumber) {
  const phoneRule = getPhoneRule(country)
  return phoneRule ? `${phoneRule.dialCode}${nationalNumber}` : nationalNumber
}
