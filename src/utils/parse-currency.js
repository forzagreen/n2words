/**
 * Currency value parsing utility.
 * Optimized parser for currency conversion - extracts dollars and cents.
 * @module parse-currency
 */

import { expandScientificNotation, hasScientificNotation } from './expand-scientific.js'

/**
 * Parses a value for currency conversion.
 * Returns dollars and cents as separate bigints, plus negative flag.
 *
 * @param {number|string|bigint} value - The value to parse
 * @returns {{isNegative: boolean, dollars: bigint, cents: bigint}}
 * @throws {TypeError} If value is not number, string, or bigint
 * @throws {Error} If value is not a valid number format
 */
export function parseCurrencyValue (value) {
  const type = typeof value

  // BigInt: whole dollars only
  if (type === 'bigint') {
    return value < 0n
      ? { isNegative: true, dollars: -value, cents: 0n }
      : { isNegative: false, dollars: value, cents: 0n }
  }

  // Number: fast path for safe integers
  if (type === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Currency must be a finite number')
    }
    if (Number.isSafeInteger(value)) {
      return value < 0
        ? { isNegative: true, dollars: BigInt(-value), cents: 0n }
        : { isNegative: false, dollars: BigInt(value), cents: 0n }
    }
    // Non-integer or unsafe: convert to string
    return parseCurrencyString(numberToString(value))
  }

  // String input
  if (type === 'string') {
    return parseCurrencyString(value)
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
  return hasScientificNotation(str) ? expandScientificNotation(str) : str
}

/**
 * Parses a string for currency conversion.
 *
 * @param {string} value - The string to parse
 * @returns {{isNegative: boolean, dollars: bigint, cents: bigint}}
 */
function parseCurrencyString (value) {
  let str = value.trim()

  if (str.length === 0 || Number.isNaN(Number(str))) {
    throw new Error(`Invalid currency format: "${value}"`)
  }

  // Expand scientific notation
  if (hasScientificNotation(str)) {
    str = expandScientificNotation(str)
  }

  // Handle negative
  const isNegative = str[0] === '-'
  if (isNegative) str = str.slice(1)

  // Split on decimal
  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return { isNegative, dollars: BigInt(str), cents: 0n }
  }

  const dollarStr = str.slice(0, dotIndex) || '0'
  const decimalPart = str.slice(dotIndex + 1)

  // Truncate to 2 decimal places and pad if needed
  const centStr = (decimalPart + '00').slice(0, 2)

  return {
    isNegative,
    dollars: BigInt(dollarStr),
    cents: BigInt(centStr)
  }
}
