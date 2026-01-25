/**
 * Amharic (Ethiopia) language converter
 *
 * CLDR: am-ET | Amharic as used in Ethiopia (Ge'ez script)
 *
 * Key features:
 * - Ge'ez/Ethiopic script numerals
 * - Teens formed with "አስራ" prefix
 * - Keeps "one" before hundred: "አንድ መቶ" (100)
 * - Short scale naming
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'አንድ', 'ሁለት', 'ሶስት', 'አራት', 'አምስት', 'ስድስት', 'ሰባት', 'ስምንት', 'ዘጠኝ']
const TEENS = ['አስር', 'አስራ አንድ', 'አስራ ሁለት', 'አስራ ሶስት', 'አስራ አራት', 'አስራ አምስት', 'አስራ ስድስት', 'አስራ ሰባት', 'አስራ ስምንት', 'አስራ ዘጠኝ']
const TENS = ['', '', 'ሃያ', 'ሰላሳ', 'አርባ', 'ሃምሳ', 'ስልሳ', 'ሰባ', 'ሰማንያ', 'ዘጠና']

const HUNDRED = 'መቶ'
const THOUSAND = 'ሺ'

const ZERO = 'ዜሮ'
const NEGATIVE = 'አሉታዊ'
const DECIMAL_SEP = 'ነጥብ'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix
const ORDINAL_SUFFIX = 'ኛ'

// Special ordinal for first
const FIRST = 'አንደኛ'

// ============================================================================
// Currency Vocabulary (Ethiopian Birr)
// ============================================================================

// Birr (main unit)
const BIRR = 'ብር'

// Santim (1/100 of birr)
const SANTIM = 'ሳንቲም'

// Short scale
const SCALE_WORDS = ['', THOUSAND, 'ሚሊዮን', 'ቢሊዮን']

// ============================================================================
// Precomputed Lookup Table
// ============================================================================

function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  // Amharic keeps "one" before hundred: "አንድ መቶ" (100)
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
 * Converts a numeric value to Amharic words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Amharic words
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
 * Converts a positive integer to Amharic ordinal words.
 *
 * In Amharic, ordinals are formed by adding -ኛ suffix to the cardinal.
 * Special case: 1 = አንደኛ (not አንድኛ)
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Amharic ordinal words
 */
function integerToOrdinal (n) {
  // Special case: 1 → አንደኛ
  if (n === 1n) {
    return FIRST
  }

  // Get cardinal form and add ordinal suffix
  const cardinal = integerToWords(n)
  return cardinal + ORDINAL_SUFFIX
}

/**
 * Converts a numeric value to Amharic ordinal words.
 *
 * Amharic ordinals: add -ኛ suffix to cardinal.
 * Special case: 1 → አንደኛ
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'አንደኛ'
 * toOrdinal(2)    // 'ሁለትኛ'
 * toOrdinal(10)   // 'አስርኛ'
 * toOrdinal(100)  // 'አንድ መቶኛ'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Amharic currency words (Ethiopian Birr).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Amharic currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'አርባ ሁለት ብር ሃምሳ ሳንቲም'
 * toCurrency(1)      // 'አንድ ብር'
 * toCurrency(0.99)   // 'ዘጠና ዘጠኝ ሳንቲም'
 * toCurrency(0.01)   // 'አንድ ሳንቲም'
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
