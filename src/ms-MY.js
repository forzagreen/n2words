/**
 * Malay (Malaysia) language converter
 *
 * CLDR: ms-MY | Malay (Bahasa Melayu) as used in Malaysia
 *
 * Key features:
 * - "Se-" prefix for ALL singular scale units (seratus, seribu, sejuta, sebilion)
 * - Regular patterns (puluh for tens, ratus for hundreds)
 * - Teens with "belas" suffix
 * - Note: "lapan" (8) differs from Indonesian "delapan"
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

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
// Ordinal Vocabulary
// ============================================================================

const ORDINAL_PREFIX = 'ke'
// First is special: "pertama" (not "kesatu")
const ORDINAL_FIRST = 'pertama'

// ============================================================================
// Currency Vocabulary (Malaysian Ringgit)
// ============================================================================

const RINGGIT = 'ringgit'
const SEN = 'sen'

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
 * Converts a non-negative integer to Malay ordinal words.
 *
 * Malay ordinals use "ke-" prefix + cardinal number.
 * Special case: "pertama" for 1st (not "kesatu").
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Malay ordinal words
 */
function integerToOrdinal (n) {
  // Special case: 1st is "pertama"
  if (n === 1n) {
    return ORDINAL_FIRST
  }

  // All others: "ke" + cardinal (no hyphen in Malay)
  return ORDINAL_PREFIX + integerToWords(n)
}

/**
 * Converts a numeric value to Malay ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'pertama'
 * toOrdinal(2)    // 'kedua'
 * toOrdinal(10)   // 'kesepuluh'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Malay currency words (Ringgit).
 *
 * Malaysian Ringgit uses sen as subunit (100 sen = 1 ringgit).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Malay currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'empat puluh dua ringgit'
 * toCurrency(1.50)   // 'satu ringgit lima puluh sen'
 * toCurrency(-5)     // 'minus lima ringgit'
 */
function toCurrency (value) {
  const { isNegative, dollars: ringgit, cents: sen } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Ringgit part - show if non-zero, or if no sen
  if (ringgit > 0n || sen === 0n) {
    result += integerToWords(ringgit)
    result += ' ' + RINGGIT
  }

  // Sen part
  if (sen > 0n) {
    if (ringgit > 0n) {
      result += ' '
    }
    result += integerToWords(sen)
    result += ' ' + SEN
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
