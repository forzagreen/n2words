/**
 * Numeric Value Parsing Utilities
 *
 * This module handles parsing and validation of numeric inputs at the API boundary.
 * It transforms user input (number, string, or bigint) into a normalized format
 * that language classes can process directly.
 *
 * @module parse-numeric
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Numeric value that can be converted to words.
 * Accepts number, bigint, or numeric string representations.
 * @typedef {number | bigint | string} NumericValue
 */

/**
 * @typedef {Object} ParsedNumericValue
 * @property {boolean} isNegative - Whether the value is negative
 * @property {bigint} integerPart - The absolute integer part
 * @property {string} [decimalPart] - The decimal digits (without the point)
 */

// ============================================================================
// Public API
// ============================================================================

/**
 * Checks if a value is a valid numeric input (number, string, or bigint).
 *
 * This performs the same validation as parseNumericValue but returns a boolean
 * instead of throwing. Useful for validation before attempting conversion.
 *
 * @param {*} value The value to check
 * @returns {boolean} True if value can be parsed as a numeric value
 * @example
 * isValidNumericValue(42)        // true
 * isValidNumericValue('3.14')    // true
 * isValidNumericValue(123n)      // true
 * isValidNumericValue(NaN)       // false
 * isValidNumericValue('hello')   // false
 * isValidNumericValue(null)      // false
 */
export function isValidNumericValue (value) {
  try {
    parseNumericValue(value)
    return true
  } catch {
    return false
  }
}

/**
 * Parses and validates a numeric value into its components.
 * Handles number, string, and bigint inputs uniformly.
 *
 * @param {NumericValue} value The value to parse
 * @returns {ParsedNumericValue} The parsed components
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 * @example
 * parseNumericValue(42)
 * // => { isNegative: false, integerPart: 42n }
 *
 * parseNumericValue(-3.14)
 * // => { isNegative: true, integerPart: 3n, decimalPart: '14' }
 *
 * parseNumericValue('1e21')
 * // => { isNegative: false, integerPart: 1000000000000000000000n }
 */
export function parseNumericValue (value) {
  const type = typeof value

  // BigInt: simplest case - no decimals, no scientific notation
  if (type === 'bigint') {
    return value < 0n
      ? { isNegative: true, integerPart: -value }
      : { isNegative: false, integerPart: value }
  }

  // Number: fast path for safe integers (most common case)
  if (type === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Number must be finite (NaN and Infinity are not supported)')
    }
    // Fast path: safe integers don't need string parsing
    if (Number.isSafeInteger(value)) {
      return value < 0
        ? { isNegative: true, integerPart: BigInt(-value) }
        : { isNegative: false, integerPart: BigInt(value) }
    }
    // Slow path: decimals or large numbers need string conversion
    return parseNumericString(numberToString(value))
  }

  // String input
  if (type === 'string') {
    return parseNumericString(stringToNormalizedForm(value))
  }

  // Reject invalid types
  throw new TypeError(
    `Invalid value type: expected number, string, or bigint, received ${type}`
  )
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Converts a JavaScript number to a decimal string.
 * Only called for non-safe-integer numbers (decimals or large values).
 * Caller must ensure value is finite.
 *
 * @param {number} value The number to convert (must be finite)
 * @returns {string} Decimal string representation
 */
function numberToString (value) {
  const str = value.toString()

  // Expand scientific notation (used for values >= 1e21 or < 1e-6)
  if (str.includes('e') || str.includes('E')) {
    return expandScientificNotation(str)
  }

  return str
}

/**
 * Validates and normalizes a string numeric input.
 *
 * @param {string} value The string to validate
 * @returns {string} Trimmed and validated string
 * @throws {Error} If string is empty or not a valid number format
 */
function stringToNormalizedForm (value) {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    throw new Error(`Invalid number format: "${value}"`)
  }

  // Validate by attempting conversion (handles edge cases like "1e21", "-.5", etc.)
  if (Number.isNaN(Number(trimmed))) {
    throw new Error(`Invalid number format: "${value}"`)
  }

  // Expand scientific notation if present
  if (trimmed.includes('e') || trimmed.includes('E')) {
    return expandScientificNotation(trimmed)
  }

  return trimmed
}

/**
 * Parses a normalized numeric string into its components.
 *
 * @param {string} str A normalized decimal string (no scientific notation)
 * @returns {ParsedNumericValue} The parsed components
 */
function parseNumericString (str) {
  // Extract sign
  const isNegative = str[0] === '-'
  if (isNegative) {
    str = str.slice(1)
  }

  // Split into integer and decimal parts
  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return { isNegative, integerPart: BigInt(str) }
  }

  const integerStr = str.slice(0, dotIndex) || '0'
  const decimalPart = str.slice(dotIndex + 1)

  return { isNegative, integerPart: BigInt(integerStr), decimalPart }
}

/**
 * Expands scientific notation to decimal form.
 * JavaScript uses scientific notation for values >= 1e21 or < 1e-6.
 *
 * @param {string} str String possibly in scientific notation (e.g., "1e+21")
 * @returns {string} Decimal form (e.g., "1000000000000000000000")
 */
function expandScientificNotation (str) {
  const [mantissa, expStr] = str.toLowerCase().split('e')
  const exp = parseInt(expStr, 10)

  // Extract digits and determine original decimal position
  const dotIndex = mantissa.indexOf('.')
  const digits = dotIndex === -1
    ? mantissa
    : mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1)
  const integerLength = dotIndex === -1 ? mantissa.length : dotIndex

  // Calculate new decimal position after applying exponent
  const newDotPosition = integerLength + exp

  if (newDotPosition >= digits.length) {
    // Pure integer: pad with trailing zeros
    return digits + '0'.repeat(newDotPosition - digits.length)
  }

  if (newDotPosition <= 0) {
    // Pure decimal: pad with leading zeros after decimal point
    return '0.' + '0'.repeat(-newDotPosition) + digits
  }

  // Mixed: insert decimal point at new position
  return digits.slice(0, newDotPosition) + '.' + digits.slice(newDotPosition)
}
