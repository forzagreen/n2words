/**
 * Ordinal value parsing utility.
 * Optimized parser for ordinal conversion - accepts only positive integers.
 * @module parse-ordinal
 */

/**
 * Parses a value for ordinal conversion.
 * Ordinals require positive integers only (no zero, negatives, or decimals).
 *
 * @param {number|string|bigint} value - The value to parse
 * @returns {bigint} The positive integer value
 * @throws {TypeError} If value is not number, string, or bigint
 * @throws {RangeError} If value is zero, negative, or has a decimal part
 */
export function parseOrdinalValue (value) {
  const type = typeof value

  // BigInt: simplest case
  if (type === 'bigint') {
    if (value <= 0n) {
      throw new RangeError('Ordinals must be positive integers')
    }
    return value
  }

  // Number: fast path for safe integers
  if (type === 'number') {
    if (!Number.isFinite(value)) {
      throw new RangeError('Ordinals must be finite numbers')
    }
    if (!Number.isInteger(value)) {
      throw new RangeError('Ordinals must be whole numbers')
    }
    if (value <= 0) {
      throw new RangeError('Ordinals must be positive integers')
    }
    return BigInt(value)
  }

  // String input
  if (type === 'string') {
    return parseOrdinalString(value)
  }

  throw new TypeError(
    `Invalid value type: expected number, string, or bigint, received ${type}`
  )
}

/**
 * Parses a string for ordinal conversion.
 *
 * @param {string} value - The string to parse
 * @returns {bigint} The positive integer value
 * @throws {RangeError} If string is not a valid positive integer
 */
function parseOrdinalString (value) {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    throw new RangeError('Ordinals cannot be empty strings')
  }

  // Quick rejection for obvious non-ordinals
  if (trimmed[0] === '-') {
    throw new RangeError('Ordinals cannot be negative')
  }

  if (trimmed.includes('.')) {
    throw new RangeError('Ordinals must be whole numbers')
  }

  // Handle scientific notation (e.g., "1e3" = 1000)
  if (trimmed.includes('e') || trimmed.includes('E')) {
    const num = Number(trimmed)
    if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
      throw new RangeError('Ordinals must be positive integers')
    }
    return BigInt(num)
  }

  // Parse as BigInt directly
  try {
    const result = BigInt(trimmed)
    if (result <= 0n) {
      throw new RangeError('Ordinals must be positive integers')
    }
    return result
  } catch (e) {
    if (e instanceof RangeError) throw e
    throw new RangeError(`Invalid ordinal format: "${value}"`)
  }
}
