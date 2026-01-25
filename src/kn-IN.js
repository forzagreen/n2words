/**
 * Kannada (India) language converter
 *
 * CLDR: kn-IN | Kannada as used in India
 *
 * Key features:
 * - Indian numbering system (ಸಾವಿರ, ಲಕ್ಷ, ಕೋಟಿ)
 * - Kannada script
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'ಸೊನ್ನೆ'
const NEGATIVE = 'ಋಣಾತ್ಮಕ'
const DECIMAL_SEP = 'ದಶಮಾಂಶ'
const HUNDRED = 'ನೂರು'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix
const ORDINAL_SUFFIX = 'ನೇ'

// Special ordinals for first few numbers
const ORDINAL_SPECIAL = ['', 'ಮೊದಲನೇ', 'ಎರಡನೇ', 'ಮೂರನೇ', 'ನಾಲ್ಕನೇ', 'ಐದನೇ', 'ಆರನೇ']

// ============================================================================
// Currency Vocabulary (Indian Rupee)
// ============================================================================

// Rupee (singular/plural same in Kannada)
const RUPEE = 'ರೂಪಾಯಿ'
const RUPEES = 'ರೂಪಾಯಿಗಳು'

// Paisa (singular/plural same in Kannada)
const PAISA = 'ಪೈಸೆ'
const PAISE = 'ಪೈಸೆಗಳು'

const BELOW_HUNDRED = [
  'ಸೊನ್ನೆ', 'ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು', 'ಐದು', 'ಆರು', 'ಏಳು', 'ಎಂಟು', 'ಒಂಬತ್ತು',
  'ಹತ್ತು', 'ಹನ್ನೊಂದು', 'ಹನ್ನೆರಡು', 'ಹದಿಮೂರು', 'ಹದಿನಾಲ್ಕು', 'ಹದಿನೈದು', 'ಹದಿನಾರು', 'ಹದಿನೇಳು', 'ಹದಿನೆಂಟು', 'ಹತ್ತೊಂಬತ್ತು',
  'ಇಪ್ಪತ್ತು', 'ಇಪ್ಪತ್ತೊಂದು', 'ಇಪ್ಪತ್ತೆರಡು', 'ಇಪ್ಪತ್ತಮೂರು', 'ಇಪ್ಪತ್ತನಾಲ್ಕು', 'ಇಪ್ಪತ್ತೈದು', 'ಇಪ್ಪತ್ತಾರು', 'ಇಪ್ಪತ್ತೇಳು', 'ಇಪ್ಪತ್ತೆಂಟು', 'ಇಪ್ಪತ್ತೊಂಬತ್ತು',
  'ಮೂವತ್ತು', 'ಮೂವತ್ತೊಂದು', 'ಮೂವತ್ತೆರಡು', 'ಮೂವತ್ತಮೂರು', 'ಮೂವತ್ತನಾಲ್ಕು', 'ಮೂವತ್ತೈದು', 'ಮೂವತ್ತಾರು', 'ಮೂವತ್ತೇಳು', 'ಮೂವತ್ತೆಂಟು', 'ಮೂವತ್ತೊಂಬತ್ತು',
  'ನಲವತ್ತು', 'ನಲವತ್ತೊಂದು', 'ನಲವತ್ತೆರಡು', 'ನಲವತ್ತಮೂರು', 'ನಲವತ್ತನಾಲ್ಕು', 'ನಲವತ್ತೈದು', 'ನಲವತ್ತಾರು', 'ನಲವತ್ತೇಳು', 'ನಲವತ್ತೆಂಟು', 'ನಲವತ್ತೊಂಬತ್ತು',
  'ಐವತ್ತು', 'ಐವತ್ತೊಂದು', 'ಐವತ್ತೆರಡು', 'ಐವತ್ತಮೂರು', 'ಐವತ್ತನಾಲ್ಕು', 'ಐವತ್ತೈದು', 'ಐವತ್ತಾರು', 'ಐವತ್ತೇಳು', 'ಐವತ್ತೆಂಟು', 'ಐವತ್ತೊಂಬತ್ತು',
  'ಅರವತ್ತು', 'ಅರವತ್ತೊಂದು', 'ಅರವತ್ತೆರಡು', 'ಅರವತ್ತಮೂರು', 'ಅರವತ್ತನಾಲ್ಕು', 'ಅರವತ್ತೈದು', 'ಅರವತ್ತಾರು', 'ಅರವತ್ತೇಳು', 'ಅರವತ್ತೆಂಟು', 'ಅರವತ್ತೊಂಬತ್ತು',
  'ಎಪ್ಪತ್ತು', 'ಎಪ್ಪತ್ತೊಂದು', 'ಎಪ್ಪತ್ತೆರಡು', 'ಎಪ್ಪತ್ತಮೂರು', 'ಎಪ್ಪತ್ತನಾಲ್ಕು', 'ಎಪ್ಪತ್ತೈದು', 'ಎಪ್ಪತ್ತಾರು', 'ಎಪ್ಪತ್ತೇಳು', 'ಎಪ್ಪತ್ತೆಂಟು', 'ಎಪ್ಪತ್ತೊಂಬತ್ತು',
  'ಎಂಬತ್ತು', 'ಎಂಬತ್ತೊಂದು', 'ಎಂಬತ್ತೆರಡು', 'ಎಂಬತ್ತಮೂರು', 'ಎಂಬತ್ತನಾಲ್ಕು', 'ಎಂಬತ್ತೈದು', 'ಎಂಬತ್ತಾರು', 'ಎಂಬತ್ತೇಳು', 'ಎಂಬತ್ತೆಂಟು', 'ಎಂಬತ್ತೊಂಬತ್ತು',
  'ತೊಂಬತ್ತು', 'ತೊಂಬತ್ತೊಂದು', 'ತೊಂಬತ್ತೆರಡು', 'ತೊಂಬತ್ತಮೂರು', 'ತೊಂಬತ್ತನಾಲ್ಕು', 'ತೊಂಬತ್ತೈದು', 'ತೊಂಬತ್ತಾರು', 'ತೊಂಬತ್ತೇಳು', 'ತೊಂಬತ್ತೆಂಟು', 'ತೊಂಬತ್ತೊಂಬತ್ತು'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'ಸಾವಿರ', 'ಲಕ್ಷ', 'ಕೋಟಿ', 'ಅಬ್ಜ', 'ಖರ್ವ', 'ನೀಲ', 'ಪದ್ಮ', 'ಶಂಖ']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds words for a 0-999 segment.
 */
function buildSegment (n) {
  if (n === 0) return ''
  if (n < 100) return BELOW_HUNDRED[n]

  const hundreds = Math.trunc(n / 100)
  const remainder = n % 100

  if (remainder === 0) {
    return BELOW_HUNDRED[hundreds] + ' ' + HUNDRED
  }
  return BELOW_HUNDRED[hundreds] + ' ' + HUNDRED + ' ' + BELOW_HUNDRED[remainder]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Kannada words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Kannada words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Extract segments using BigInt modulo
  const segments = []
  segments.push(Number(n % 1000n))
  let temp = n / 1000n

  while (temp > 0n) {
    segments.push(Number(temp % 100n))
    temp = temp / 100n
  }

  // Build result string (process from most-significant to least)
  const words = []
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (i === 0) {
      words.push(buildSegment(segment))
    } else {
      words.push(BELOW_HUNDRED[segment])
    }

    if (i > 0 && SCALE_WORDS[i]) {
      words.push(SCALE_WORDS[i])
    }
  }

  return words.join(' ')
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : BELOW_HUNDRED[d])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Kannada words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Kannada words
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Converts a positive integer to Kannada ordinal words.
 *
 * Kannada ordinals: First 6 are special, then add -ನೇ suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Kannada ordinal words
 */
function integerToOrdinal (n) {
  // Special ordinals for 1-6
  if (n >= 1n && n <= 6n) {
    return ORDINAL_SPECIAL[Number(n)]
  }

  // For 7 and above, add suffix to cardinal
  const cardinal = integerToWords(n)
  return cardinal + ORDINAL_SUFFIX
}

/**
 * Converts a numeric value to Kannada ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'ಮೊದಲನೇ'
 * toOrdinal(2)    // 'ಎರಡನೇ'
 * toOrdinal(10)   // 'ಹತ್ತುನೇ'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Kannada currency words (Indian Rupee).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Kannada currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'ನಲವತ್ತೆರಡು ರೂಪಾಯಿಗಳು ಐವತ್ತು ಪೈಸೆಗಳು'
 * toCurrency(1)      // 'ಒಂದು ರೂಪಾಯಿ'
 * toCurrency(0.01)   // 'ಒಂದು ಪೈಸೆ'
 */
function toCurrency (value) {
  const { isNegative, dollars: rupees, cents: paise } = parseCurrencyValue(value)

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Rupees part - show if non-zero, or if no paise
  if (rupees > 0n || paise === 0n) {
    result += integerToWords(rupees)
    // Singular for 1 rupee, plural otherwise
    result += ' ' + (rupees === 1n ? RUPEE : RUPEES)
  }

  // Paise part
  if (paise > 0n) {
    if (rupees > 0n) {
      result += ' '
    }
    result += integerToWords(paise)
    // Singular for 1 paisa, plural otherwise
    result += ' ' + (paise === 1n ? PAISA : PAISE)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
