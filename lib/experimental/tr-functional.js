/**
 * Turkish language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 *
 * Key features:
 * - Omits 'bir' (one) before hundreds and thousands
 * - Optional dropSpaces for compound form
 * - Short scale naming
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']

const TEENS = ['on', 'on bir', 'on iki', 'on üç', 'on dört', 'on beş', 'on altı', 'on yedi', 'on sekiz', 'on dokuz']
const TENS = ['', '', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan']

const HUNDRED = 'yüz'
const THOUSAND = 'bin'

const ZERO = 'sıfır'
const NEGATIVE = 'eksi'
const DECIMAL_SEP = 'virgül'

// Short scale
const SCALES = ['milyon', 'milyar', 'trilyon', 'katrilyon', 'kentilyon']

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Omits "bir" before "yüz" (hundred).
 */
function buildSegment (n, separator = ' ') {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - omit "bir" before yüz
  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push(HUNDRED)
    } else {
      parts.push(ONES[hundreds] + separator + HUNDRED)
    }
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    parts.push(TEENS[ones].replace(' ', separator))
  } else if (ones === 0) {
    parts.push(TENS[tens])
  } else {
    parts.push(TENS[tens] + separator + ONES[ones])
  }

  return parts.join(separator)
}

// Precompute all 1000 segment words (0-999) with space separator
const SEGMENTS = new Array(1000)
const SEGMENTS_NO_SPACE = new Array(1000)

for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegment(i, ' ')
  SEGMENTS_NO_SPACE[i] = buildSegment(i, '')
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Turkish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Turkish words
 */
function integerToWords (n, options = {}) {
  if (n === 0n) return ZERO

  const sep = options.dropSpaces ? '' : ' '
  const segments = options.dropSpaces ? SEGMENTS_NO_SPACE : SEGMENTS

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return segments[Number(n)]
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Omit "bir" before bin (thousand)
    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      result = segments[thousands] + sep + THOUSAND
    }

    if (remainder > 0) {
      result += sep + segments[remainder]
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, options)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {Object} options - Conversion options
 * @returns {string} Turkish words
 */
function buildLargeNumberWords (n, options) {
  const sep = options.dropSpaces ? '' : ' '
  const segmentsArr = options.dropSpaces ? SEGMENTS_NO_SPACE : SEGMENTS

  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from right to left
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

  // Convert segments to words
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const segmentWord = segmentsArr[segment]

      if (scaleIndex === 0) {
        // Units segment
        parts.push(segmentWord)
      } else if (scaleIndex === 1) {
        // Thousands - omit "bir" before bin
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          parts.push(segmentWord + sep + THOUSAND)
        }
      } else {
        // Millions+ - "bir" is kept before scale words
        const scaleWord = SCALES[scaleIndex - 2]
        parts.push(segmentWord + sep + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(sep)
}

/**
 * Converts decimal digits to Turkish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Turkish words for decimal part
 */
function decimalPartToWords (decimalPart, options) {
  const sep = options.dropSpaces ? '' : ' '
  let result = ''

  // Handle leading zeros
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += sep
    result += ZERO
    i++
  }

  // Convert remainder as a single number
  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += sep
    result += integerToWords(BigInt(remainder), options)
  }

  return result
}

/**
 * Converts a numeric value to Turkish words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {boolean} [options.dropSpaces=false] - Remove spaces for compound form
 * @returns {string} The number in Turkish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)                        // 'yirmi bir'
 * toWords(21, { dropSpaces: true })  // 'yirmibir'
 * toWords(1000)                      // 'bin'
 */
function toWords (value, options = {}) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  const sep = options.dropSpaces ? '' : ' '
  let result = ''

  if (isNegative) {
    result = NEGATIVE + sep
  }

  result += integerToWords(integerPart, options)

  if (decimalPart) {
    result += sep + DECIMAL_SEP + sep + decimalPartToWords(decimalPart, options)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }

// Named exports for testing
export {
  ONES,
  TEENS,
  TENS,
  SCALES,
  ZERO,
  SEGMENTS,
  SEGMENTS_NO_SPACE,
  integerToWords,
  decimalPartToWords
}
