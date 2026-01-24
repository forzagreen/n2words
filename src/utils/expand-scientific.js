/**
 * Scientific notation expansion utility.
 * Converts scientific notation strings to full decimal form.
 * @module expand-scientific
 */

/**
 * Expands scientific notation to full decimal form.
 * Handles arbitrarily large exponents without precision loss.
 *
 * @param {string} str - String in scientific notation (e.g., "1e21", "1.5e-3")
 * @returns {string} Full decimal representation (e.g., "1000000000000000000000", "0.0015")
 *
 * @example
 * expandScientificNotation("1e21")    // "1000000000000000000000"
 * expandScientificNotation("1.5e3")   // "1500"
 * expandScientificNotation("1e-3")    // "0.001"
 */
export function expandScientificNotation (str) {
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
  } else if (newDotPosition <= 0) {
    return '0.' + '0'.repeat(-newDotPosition) + digits
  } else {
    return digits.slice(0, newDotPosition) + '.' + digits.slice(newDotPosition)
  }
}

/**
 * Checks if a string contains scientific notation.
 *
 * @param {string} str - String to check
 * @returns {boolean} True if string contains 'e' or 'E'
 */
export function hasScientificNotation (str) {
  return str.includes('e') || str.includes('E')
}
