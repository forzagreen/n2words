/**
 * Swahili (Kenya) language converter
 *
 * CLDR: sw-KE | Swahili as used in Kenya
 *
 * Key features:
 * - "na" connector for compound numbers
 * - Reversed hundreds: "mia moja" (one hundred)
 * - Scale words: elfu, milioni, bilioni
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['sifuri', 'moja', 'mbili', 'tatu', 'nne', 'tano', 'sita', 'saba', 'nane', 'tisa']
const TENS = { 10: 'kumi', 20: 'ishirini', 30: 'thelathini', 40: 'arobaini', 50: 'hamsini', 60: 'sitini', 70: 'sabini', 80: 'themanini', 90: 'tisini' }

const SCALE_WORDS = ['', 'elfu', 'milioni', 'bilioni', 'trilioni', 'kwadrilioni', 'kwintilioni']

const ZERO = 'sifuri'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'nukta'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Swahili ordinals use "wa" + cardinal: wa kwanza (1st), wa pili (2nd)
// First few have special forms
const ORDINAL_ONES = {
  1: 'wa kwanza',
  2: 'wa pili',
  3: 'wa tatu',
  4: 'wa nne',
  5: 'wa tano',
  6: 'wa sita',
  7: 'wa saba',
  8: 'wa nane',
  9: 'wa tisa'
}
const ORDINAL_PREFIX = 'wa'

// ============================================================================
// Currency Vocabulary (Kenyan Shilling)
// ============================================================================

const SHILLING = 'shilingi'
const CENT = 'senti'

// ============================================================================
// Conversion Functions
// ============================================================================

function wordsUnder100 (n) {
  if (n < 10) return ONES[n]
  if (n === 10) return TENS[10]
  if (n < 20) {
    // 11-19: 'kumi na <digit>'
    return TENS[10] + ' na ' + ONES[n - 10]
  }
  const tens = Math.trunc(n / 10) * 10
  const ones = n % 10
  if (ones === 0) return TENS[tens]
  return TENS[tens] + ' na ' + ONES[ones]
}

function wordsUnder1000 (n) {
  if (n < 100) return wordsUnder100(n)
  if (n === 100) return 'mia moja'
  const hundreds = Math.trunc(n / 100)
  const rest = n % 100
  const parts = []

  // Hundreds: 'mia <digit>'
  parts.push('mia ' + ONES[hundreds])
  if (rest > 0) {
    if (rest < 10) {
      parts.push('na ' + ONES[rest])
    } else {
      parts.push(wordsUnder100(rest))
    }
  }

  return parts.join(' ')
}

function extractSegments (n) {
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }
  return segments
}

function integerToWords (n) {
  if (n === 0n) return ZERO

  // segments stored least-significant first: [ones, thousands, millions, ...]
  const segments = extractSegments(n)
  const parts = []

  // Iterate from highest scale to lowest
  for (let scaleIndex = segments.length - 1; scaleIndex >= 0; scaleIndex--) {
    const val = segments[scaleIndex]
    if (val === 0) continue

    if (scaleIndex === 0) {
      // Units segment
      if (val < 10 && parts.length > 0) {
        parts.push('na ' + ONES[val])
      } else if (val === 100 && parts.length > 0) {
        // In compound numbers (e.g., 1100 -> 'elfu moja mia'), use 'mia' not 'mia moja'
        parts.push('mia')
      } else {
        parts.push(wordsUnder1000(val))
      }
    } else {
      // Scale segments: 'elfu moja', 'milioni mbili'
      const unit = (val === 1) ? 'moja' : wordsUnder1000(val)
      parts.push(SCALE_WORDS[scaleIndex] + ' ' + unit)
    }
  }

  return parts.join(' ').trim()
}

function decimalPartToWords (decimalPart) {
  let result = ''
  let i = 0

  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    result += integerToWords(BigInt(remainder))
  }

  return result
}

/**
 * Converts a numeric value to Swahili words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Swahili words
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
 * Converts a non-negative integer to Swahili ordinal words.
 *
 * Swahili ordinals: wa kwanza (1st), wa pili (2nd), wa tatu (3rd), etc.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Swahili ordinal words
 */
function integerToOrdinal (n) {
  // Special forms for 1-9
  if (n >= 1n && n <= 9n) {
    return ORDINAL_ONES[Number(n)]
  }

  // For 10+, use "wa" prefix + cardinal
  return ORDINAL_PREFIX + ' ' + integerToWords(n)
}

/**
 * Converts a numeric value to Swahili ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'wa kwanza'
 * toOrdinal(2)    // 'wa pili'
 * toOrdinal(10)   // 'wa kumi'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Swahili currency words (Kenyan Shilling).
 *
 * Uses shilingi and senti (100 senti = 1 shilingi).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Swahili currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'shilingi arobaini na mbili'
 * toCurrency(1.50)   // 'shilingi moja na senti hamsini'
 * toCurrency(-5)     // 'minus shilingi tano'
 */
function toCurrency (value) {
  const { isNegative, dollars: shillings, cents: senti } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Shillings part
  if (shillings > 0n || senti === 0n) {
    result += SHILLING + ' ' + integerToWords(shillings)
  }

  // Senti part
  if (senti > 0n) {
    if (shillings > 0n) {
      result += ' na '
    }
    result += CENT + ' ' + integerToWords(senti)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
