export const formatINR = (amount) => {
  if (typeof amount !== 'number') {
    return '₹0'
  }

  const isNegative = amount < 0
  const absoluteAmount = Math.abs(amount)
  const [integerPart, decimalPart] = absoluteAmount.toFixed(2).split('.')

  // Add commas in Indian style (12,34,567)
  let formattedInteger = ''
  const digits = integerPart.split('').reverse()

  digits.forEach((digit, index) => {
    if (index === 2 || index === 4 || index === 6) {
      formattedInteger = ',' + formattedInteger
    }
    formattedInteger = digit + formattedInteger
  })

  const result = `₹${formattedInteger}.${decimalPart}`
  return isNegative ? `-${result}` : result
}

export const parseINR = (formattedString) => {
  // Remove ₹, spaces, and commas
  const cleaned = formattedString.replace(/[₹\s,]/g, '')
  return parseFloat(cleaned)
}
