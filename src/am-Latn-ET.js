/**
 * Amharic (Ethiopia, Latin script) language converter
 *
 * CLDR: am-Latn-ET | Amharic as used in Ethiopia (Latin script romanization)
 *
 * Key features:
 * - Romanized numerals (and, hulet, sost)
 * - Teens formed with "asra" prefix
 * - Keeps "one" before hundred: "and meto" (100)
 * - Short scale naming
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'and', 'hulet', 'sost', 'arat', 'amist', 'siddist', 'sebat', 'siment', 'zeteny']
const TEENS = ['asir', 'asra and', 'asra hulet', 'asra sost', 'asra arat', 'asra amist', 'asra siddist', 'asra sebat', 'asra siment', 'asra zeteny']
const TENS = ['', '', 'haya', 'selasa', 'arba', 'hamsa', 'silsa', 'seba', 'semanya', 'zetena']

const HUNDRED = 'meto'
const THOUSAND = 'shi'

const ZERO = 'zero'
const NEGATIVE = 'asitegna'
const DECIMAL_SEP = 'netib'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix (romanized -ኛ)
const ORDINAL_SUFFIX = 'nya'

// Special ordinal for first (romanized አንደኛ)
const FIRST = 'andenya'

// ============================================================================
// Currency Vocabulary (Ethiopian Birr)
// ============================================================================

// Birr (main unit, romanized ብር)
const BIRR = 'birr'

// Santim (1/100 of birr, romanized ሳንቲም)
const SANTIM = 'santim'

// Short scale
const SCALE_WORDS = ['', THOUSAND, 'miliyon', 'billiyon']

// ============================================================================
// Precomputed Lookup Table
// ============================================================================

function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  // Amharic keeps "one" before hundred: "and meto" (100)
  if (hundredsDigit > 0) {
    parts.push(ONES[hundredsDigit] + ' ' + HUNDRED)
  }

  if (tensDigit === 1) {
    parts.push(TEENS[ones])
  } else {
    if (tensDigit > 1) {
      parts.push(TENS[tensDigit])
    }
    if (ones > 0) {
      parts.push(ONES[ones])
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  return buildLargeNumberWords(n)
}

function buildLargeNumberWords (n) {
  const numStr = n.toString()
  const len = numStr.length

  const segments = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segments.push(Number(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segments.push(Number(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const scaleWord = SCALE_WORDS[scaleIndex] || ''

      if (scaleIndex === 0) {
        parts.push(buildSegment(segment))
      } else {
        parts.push(buildSegment(segment) + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : ONES[d])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Amharic (Latin script) words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Amharic Latin words
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
 * Converts a positive integer to Amharic (Latin script) ordinal words.
 *
 * In Amharic, ordinals are formed by adding -nya suffix to the cardinal.
 * Special case: 1 = andenya
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Amharic (Latin) ordinal words
 */
function integerToOrdinal (n) {
  // Special case: 1 → andenya
  if (n === 1n) {
    return FIRST
  }

  // Get cardinal form and add ordinal suffix
  const cardinal = integerToWords(n)
  return cardinal + ORDINAL_SUFFIX
}

/**
 * Converts a numeric value to Amharic (Latin script) ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'andenya'
 * toOrdinal(2)    // 'huletnya'
 * toOrdinal(10)   // 'asirnya'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Amharic (Latin script) currency words (Ethiopian Birr).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Amharic (Latin) currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'arba hulet birr hamsa santim'
 * toCurrency(1)      // 'and birr'
 * toCurrency(0.01)   // 'and santim'
 */
function toCurrency (value) {
  const { isNegative, dollars: birr, cents: santim } = parseCurrencyValue(value)

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Birr part - show if non-zero, or if no santim
  if (birr > 0n || santim === 0n) {
    result += integerToWords(birr)
    result += ' ' + BIRR
  }

  // Santim part
  if (santim > 0n) {
    if (birr > 0n) {
      result += ' '
    }
    result += integerToWords(santim)
    result += ' ' + SANTIM
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
