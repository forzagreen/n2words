/**
 * Numeric value parsing utility.
 * Transforms user input (number, string, or bigint) into normalized components.
 * @module parse-numeric
 */

/**
 * Parses a numeric value into its components.
 * @param {number|string|bigint} value
 * @returns {{isNegative: boolean, integerPart: bigint, decimalPart?: string}}
 * @throws {TypeError} If value is not number, string, or bigint
 * @throws {Error} If value is not a valid number format
 */
export function parseNumericValue (value) {
  const type = typeof value

  // BigInt: simplest case
  if (type === 'bigint') {
    return value < 0n
      ? { isNegative: true, integerPart: -value }
      : { isNegative: false, integerPart: value }
  }

  // Number: fast path for safe integers
  if (type === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Number must be finite (NaN and Infinity are not supported)')
    }
    if (Number.isSafeInteger(value)) {
      return value < 0
        ? { isNegative: true, integerPart: BigInt(-value) }
        : { isNegative: false, integerPart: BigInt(value) }
    }
    return parseNumericString(numberToString(value))
  }

  // String input
  if (type === 'string') {
    return parseNumericString(normalizeString(value))
  }

  throw new TypeError(
    `Invalid value type: expected number, string, or bigint, received ${type}`
  )
}

/**
 * Converts a number to decimal string, expanding scientific notation if needed.
 */
function numberToString (value) {
  const str = value.toString()
  return (str.includes('e') || str.includes('E'))
    ? expandScientificNotation(str)
    : str
}

/**
 * Validates and normalizes a string numeric input.
 */
function normalizeString (value) {
  const trimmed = value.trim()
  if (trimmed.length === 0 || Number.isNaN(Number(trimmed))) {
    throw new Error(`Invalid number format: "${value}"`)
  }
  return (trimmed.includes('e') || trimmed.includes('E'))
    ? expandScientificNotation(trimmed)
    : trimmed
}

/**
 * Parses a normalized numeric string into components.
 */
function parseNumericString (str) {
  const isNegative = str[0] === '-'
  if (isNegative) str = str.slice(1)

  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return { isNegative, integerPart: BigInt(str) }
  }

  const integerStr = str.slice(0, dotIndex) || '0'
  const decimalPart = str.slice(dotIndex + 1)
  return { isNegative, integerPart: BigInt(integerStr), decimalPart }
}

/**
 * Expands scientific notation to decimal form (e.g., "1e21" → "1000...").
 */
function expandScientificNotation (str) {
  const [mantissa, expStr] = str.toLowerCase().split('e')
  const exp = parseInt(expStr, 10)

  const dotIndex = mantissa.indexOf('.')
  const digits = dotIndex === -1
    ? mantissa
    : mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1)
  const integerLength = dotIndex === -1 ? mantissa.length : dotIndex
  const newDotPosition = integerLength + exp

  if (newDotPosition >= digits.length) {
    return digits + '0'.repeat(newDotPosition - digits.length)
  }
  if (newDotPosition <= 0) {
    return '0.' + '0'.repeat(-newDotPosition) + digits
  }
  return digits.slice(0, newDotPosition) + '.' + digits.slice(newDotPosition)
}
