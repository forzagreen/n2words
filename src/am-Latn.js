/**
 * Amharic Latin language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 * Latin/ASCII romanization of Amharic numerals.
 *
 * Key features:
 * - Romanized numerals (and, hulet, sost)
 * - Teens formed with "asra" prefix
 * - Keeps "one" before hundred: "and meto" (100)
 * - Short scale naming
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'

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
// Exports
// ============================================================================

export { toCardinal }
