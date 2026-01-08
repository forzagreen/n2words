/**
 * Azerbaijani language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Turkic language patterns
 * - Implicit "bir" (one) omission before hundreds and thousands
 * - Short scale naming
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'bir', 'iki', 'üç', 'dörd', 'beş', 'altı', 'yeddi', 'səkkiz', 'doqquz']
const TEENS = ['on', 'on bir', 'on iki', 'on üç', 'on dörd', 'on beş', 'on altı', 'on yeddi', 'on səkkiz', 'on doqquz']
const TENS = ['', '', 'iyirmi', 'otuz', 'qırx', 'əlli', 'altmış', 'yetmiş', 'səksən', 'doxsan']

const HUNDRED = 'yüz'
const THOUSAND = 'min'

const ZERO = 'sıfır'
const NEGATIVE = 'mənfi'
const DECIMAL_SEP = 'nöqtə'

// Short scale
const SCALE_WORDS = ['', THOUSAND, 'milyon', 'milyar', 'trilyon', 'katrilyon', 'kentilyon']

// ============================================================================
// Precomputed Lookup Table
// ============================================================================

function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  if (hundredsDigit > 0) {
    if (hundredsDigit === 1) {
      parts.push(HUNDRED)
    } else {
      parts.push(ONES[hundredsDigit] + ' ' + HUNDRED)
    }
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
      } else if (scaleIndex === 1 && segment === 1) {
        // Omit "bir" before thousand
        parts.push(scaleWord)
      } else {
        parts.push(buildSegment(segment) + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
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
 * Converts a numeric value to Azerbaijani words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Azerbaijani words
 */
function toWords (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

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
// Exports
// ============================================================================

export { toWords }
