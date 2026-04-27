export const formatINR = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0.00'
  }

  const isNegative = amount < 0
  const absoluteAmount = Math.abs(amount)
  const [integerPart, decimalPart] = absoluteAmount.toFixed(2).split('.')

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
  const cleaned = formattedString.replace(/[₹\s,]/g, '')
  return parseFloat(cleaned) || 0
}
