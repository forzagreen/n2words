/**
 * Cardinal value parsing utility.
 * Transforms user input (number, string, or bigint) into normalized components.
 * Handles negatives, decimals, and scientific notation.
 * @module parse-cardinal
 */

import { expandScientificNotation, hasScientificNotation } from './expand-scientific.js'

/**
 * Parses a value for cardinal conversion.
 * Cardinals accept any numeric value: integers, decimals, negatives.
 *
 * @param {number|string|bigint} value - The value to parse
 * @returns {{isNegative: boolean, integerPart: bigint, decimalPart?: string}}
 * @throws {TypeError} If value is not number, string, or bigint
 * @throws {Error} If value is not a valid number format
 */
export function parseCardinalValue (value) {
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
  return hasScientificNotation(str) ? expandScientificNotation(str) : str
}

/**
 * Validates and normalizes a string numeric input.
 */
function normalizeString (value) {
  const trimmed = value.trim()
  if (trimmed.length === 0 || Number.isNaN(Number(trimmed))) {
    throw new Error(`Invalid number format: "${value}"`)
  }
  return hasScientificNotation(trimmed) ? expandScientificNotation(trimmed) : trimmed
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
