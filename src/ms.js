/**
 * Malay (Bahasa Melayu) language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - "Se-" prefix for ALL singular scale units (seratus, seribu, sejuta, sebilion)
 * - Regular patterns (puluh for tens, ratus for hundreds)
 * - Teens with "belas" suffix
 * - Note: "lapan" (8) differs from Indonesian "delapan"
 */

import { parseNumericValue } from './utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan']
const TEENS = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'lapan belas', 'sembilan belas']
const TENS = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'lapan puluh', 'sembilan puluh']

const HUNDRED_WORD = 'ratus'
const THOUSAND_WORD = 'ribu'
const SCALE_WORDS = ['juta', 'bilion', 'trilion']

const ZERO = 'sifar'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'perpuluhan'

// ============================================================================
// Segment Building
// ============================================================================

function buildSegment (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  // Hundreds: seratus (100) or N ratus (200-900)
  if (hundredsDigit > 0) {
    if (hundredsDigit === 1) {
      parts.push('se' + HUNDRED_WORD)
    } else {
      parts.push(ONES[hundredsDigit] + ' ' + HUNDRED_WORD)
    }
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    parts.push(ONES[tensOnes])
  } else if (tensOnes < 20) {
    parts.push(TEENS[tensOnes - 10])
  } else if (onesDigit === 0) {
    parts.push(TENS[tensDigit])
  } else {
    parts.push(TENS[tensDigit] + ' ' + ONES[onesDigit])
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

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      result = 'se' + THOUSAND_WORD
    } else {
      result = buildSegment(thousands) + ' ' + THOUSAND_WORD
    }

    if (remainder > 0) {
      result += ' ' + buildSegment(remainder)
    }

    return result
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
      if (scaleIndex === 0) {
        parts.push(buildSegment(segment))
      } else if (scaleIndex === 1) {
        if (segment === 1) {
          parts.push('se' + THOUSAND_WORD)
        } else {
          parts.push(buildSegment(segment) + ' ' + THOUSAND_WORD)
        }
      } else {
        // Malay: "se-" prefix for ALL scale words when segment is 1
        const scaleWord = SCALE_WORDS[scaleIndex - 2]
        if (segment === 1) {
          parts.push('se' + scaleWord)
        } else {
          parts.push(buildSegment(segment) + ' ' + scaleWord)
        }
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
 * Converts a numeric value to Malay words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Malay words
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
