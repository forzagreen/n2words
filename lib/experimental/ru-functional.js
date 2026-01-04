/**
 * Russian language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * Russian-specific rules (handled in precomputation):
 * - Three-form pluralization: 1 = singular, 2-4 = few, 5+ = many
 * - Gender agreement: один/одна, два/две (for ones digit)
 * - Thousands are feminine (одна тысяча, две тысячи)
 * - Irregular hundreds: двести, триста, четыреста, пятьсот...
 * - Long scale: миллион, миллиард, триллион, квадриллион...
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
const ONES_FEM = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']

const TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']

const TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']

// Irregular hundreds
const HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

// Scale words: [singular, few (2-4), many (5+)]
const PLURAL_FORMS = {
  1: ['тысяча', 'тысячи', 'тысяч'],
  2: ['миллион', 'миллиона', 'миллионов'],
  3: ['миллиард', 'миллиарда', 'миллиардов'],
  4: ['триллион', 'триллиона', 'триллионов'],
  5: ['квадриллион', 'квадриллиона', 'квадриллионов'],
  6: ['квинтиллион', 'квинтиллиона', 'квинтиллионов'],
  7: ['секстиллион', 'секстиллиона', 'секстиллионов'],
  8: ['септиллион', 'септиллиона', 'септиллионов'],
  9: ['октиллион', 'октиллиона', 'октиллионов'],
  10: ['нониллион', 'нониллиона', 'нониллионов']
}

const ZERO = 'ноль'
const NEGATIVE = 'минус'
const DECIMAL_SEP = 'запятая'

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
 * @param {number} n - Segment value
 * @param {boolean} feminine - Use feminine forms for ones
 * @returns {string} Russian word
 */
function buildSegment (n, feminine) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones
  if (tens === 1) {
    // Teens (10-19)
    parts.push(TEENS[ones])
  } else {
    if (tens >= 2) {
      parts.push(TENS[tens])
    }
    if (ones > 0) {
      const onesArr = feminine ? ONES_FEM : ONES_MASC
      parts.push(onesArr[ones])
    }
  }

  return parts.join(' ')
}

// Precompute all 1000 segment words (0-999) for masculine
const SEGMENTS_MASC = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS_MASC[i] = buildSegment(i, false)
}

// Precompute all 1000 segment words (0-999) for feminine
const SEGMENTS_FEM = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS_FEM[i] = buildSegment(i, true)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Russian pluralization: 1 = singular, 2-4 = few, else = many.
 * Special case: 11-19 always use many form.
 *
 * @param {bigint} n - Number to pluralize
 * @param {string[]} forms - [singular, few, many]
 * @returns {string} Correct plural form
 */
function pluralize (n, forms) {
  const lastDigit = n % 10n
  const lastTwoDigits = n % 100n

  // Teens (11-19) always use many form
  if (lastTwoDigits >= 11n && lastTwoDigits <= 19n) {
    return forms[2]
  }

  if (lastDigit === 1n) {
    return forms[0] // singular
  }

  if (lastDigit >= 2n && lastDigit <= 4n) {
    return forms[1] // few
  }

  return forms[2] // many
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Russian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {boolean} feminine - Use feminine forms for final segment
 * @returns {string} Russian words
 */
function integerToWords (n, feminine) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    const segments = feminine ? SEGMENTS_FEM : SEGMENTS_MASC
    return segments[Number(n)]
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Thousands are always feminine in Russian
    const thousandsWord = SEGMENTS_FEM[thousands]
    const scaleWord = pluralize(BigInt(thousands), PLURAL_FORMS[1])

    let result = thousandsWord + ' ' + scaleWord

    if (remainder > 0) {
      // Remainder uses the requested gender
      const segments = feminine ? SEGMENTS_FEM : SEGMENTS_MASC
      result += ' ' + segments[remainder]
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, feminine)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {boolean} feminine - Use feminine forms for final segment
 * @returns {string} Russian words
 */
function buildLargeNumberWords (n, feminine) {
  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from right to left
  const segmentValues = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segmentValues.push(BigInt(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segmentValues.push(BigInt(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segmentValues.length - 1

  for (let i = 0; i < segmentValues.length; i++) {
    const segment = segmentValues[i]

    if (segment !== 0n) {
      if (scaleIndex === 0) {
        // Units segment - use requested gender
        const segments = feminine ? SEGMENTS_FEM : SEGMENTS_MASC
        parts.push(segments[Number(segment)])
      } else if (scaleIndex === 1) {
        // Thousands - always feminine
        const segmentWord = SEGMENTS_FEM[Number(segment)]
        const scaleWord = pluralize(segment, PLURAL_FORMS[1])
        parts.push(segmentWord + ' ' + scaleWord)
      } else {
        // Million and above - masculine
        const forms = PLURAL_FORMS[scaleIndex]
        if (forms) {
          const segmentWord = SEGMENTS_MASC[Number(segment)]
          const scaleWord = pluralize(segment, forms)
          parts.push(segmentWord + ' ' + scaleWord)
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Russian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Russian words for decimal part
 */
function decimalPartToWords (decimalPart, feminine) {
  let result = ''

  // Handle leading zeros
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  // Convert remainder as a single number
  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    result += integerToWords(BigInt(remainder), feminine)
  }

  return result
}

/**
 * Converts a numeric value to Russian words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Russian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(1)                        // 'один'
 * toWords(1, {gender: 'feminine'})  // 'одна'
 * toWords(1000)                     // 'одна тысяча'
 * toWords(1000000)                  // 'один миллион'
 */
function toWords (value, options = {}) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)
  const feminine = options.gender === 'feminine'

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, feminine)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, feminine)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }

// Named exports for testing
export {
  ONES_MASC,
  ONES_FEM,
  TEENS,
  TENS,
  HUNDREDS,
  PLURAL_FORMS,
  ZERO,
  SEGMENTS_MASC,
  SEGMENTS_FEM,
  pluralize,
  integerToWords,
  decimalPartToWords
}
