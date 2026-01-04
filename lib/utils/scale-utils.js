/**
 * Scale Language Utilities
 *
 * Pure functions for scale-based number-to-words conversion.
 * These utilities are shared between class-based and functional implementations.
 *
 * @module scale-utils
 */

// ============================================================================
// Pluralization
// ============================================================================

/**
 * Slavic-style three-form pluralization.
 *
 * Selects the correct plural form based on the number:
 * - Singular: for 1, 21, 31, 41, etc. (ends in 1, except 11)
 * - Few: for 2-4, 22-24, 32-34, etc. (ends in 2-4, except 12-14)
 * - Many: for 0, 5-20, 25-30, etc. (everything else)
 *
 * Used by: Russian, Polish, Czech, Ukrainian, Croatian, Serbian
 *
 * @param {bigint} n - The number to check
 * @param {string[]} forms - Array of [singular, few, many] forms
 * @returns {string} The appropriate form for the number
 *
 * @example
 * pluralizeSlavic(1n, ['год', 'года', 'лет'])   // 'год'
 * pluralizeSlavic(2n, ['год', 'года', 'лет'])   // 'года'
 * pluralizeSlavic(5n, ['год', 'года', 'лет'])   // 'лет'
 * pluralizeSlavic(21n, ['год', 'года', 'лет'])  // 'год'
 * pluralizeSlavic(11n, ['год', 'года', 'лет'])  // 'лет'
 */
export function pluralizeSlavic (n, forms) {
  const lastDigit = n % 10n
  const lastTwoDigits = n % 100n

  // 11-19 are always "many" form
  if (lastTwoDigits >= 11n && lastTwoDigits <= 19n) {
    return forms[2]
  }

  // 1, 21, 31, etc. → singular
  if (lastDigit === 1n) {
    return forms[0]
  }

  // 2-4, 22-24, 32-34, etc. → few
  if (lastDigit >= 2n && lastDigit <= 4n) {
    return forms[1]
  }

  // 0, 5-9, 10, 20, 25-30, etc. → many
  return forms[2]
}

// ============================================================================
// Phonetic Transformations
// ============================================================================

/**
 * Applies phonetic transformation rules to a string.
 *
 * Used by languages that concatenate words and need vowel elision
 * or other phonetic adjustments.
 *
 * @param {string} str - The string to transform
 * @param {Object.<string, string>} rules - Map of patterns to replacements
 * @returns {string} The transformed string
 *
 * @example
 * // Italian vowel elision
 * const rules = { 'io': 'o', 'ao': 'o', 'iu': 'u', 'au': 'u' }
 * applyPhoneticRules('ventiotto', rules)   // 'ventotto'
 * applyPhoneticRules('quarantauno', rules) // 'quarantuno'
 */
export function applyPhoneticRules (str, rules) {
  if (!rules || Object.keys(rules).length === 0) {
    return str
  }

  let result = str
  for (const [pattern, replacement] of Object.entries(rules)) {
    result = result.replaceAll(pattern, replacement)
  }
  return result
}

// ============================================================================
// Decimal Conversion
// ============================================================================

/**
 * Converts decimal digits to words.
 *
 * Handles two modes:
 * - Grouped (default): Leading zeros individual, remainder as single number
 * - Per-digit: Each digit converted separately
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {string} zeroWord - The word for zero
 * @param {function(bigint): string} integerToWords - Function to convert integers
 * @param {boolean} [perDigit=false] - Convert each digit separately
 * @returns {string[]} Array of word tokens
 *
 * @example
 * // Grouped mode (English, Spanish, etc.)
 * decimalToWords('05', 'zero', n => convert(n))     // ['zero', 'five']
 * decimalToWords('14', 'zero', n => convert(n))     // ['fourteen']
 *
 * // Per-digit mode (Japanese, Thai, etc.)
 * decimalToWords('14', 'zero', n => convert(n), true) // ['one', 'four']
 */
export function decimalToWords (decimalPart, zeroWord, integerToWords, perDigit = false) {
  const words = []

  // Preserve leading zeros individually
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    words.push(zeroWord)
    i++
  }

  const remainder = decimalPart.slice(i)
  if (!remainder) return words

  // Convert remainder
  if (perDigit) {
    for (const char of remainder) {
      words.push(integerToWords(BigInt(char)))
    }
  } else {
    words.push(integerToWords(BigInt(remainder)))
  }

  return words
}
