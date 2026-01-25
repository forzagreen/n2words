/**
 * Azerbaijani (Azerbaijan) language converter
 *
 * CLDR: az-AZ | Azerbaijani as used in Azerbaijan
 *
 * Key features:
 * - Turkic language patterns
 * - Implicit "bir" (one) omission before hundreds and thousands
 * - Short scale naming
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

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
// Ordinal Vocabulary
// ============================================================================

// Azerbaijani ordinals use -(i/ı/u/ü)nci/ncı/ncu/ncü suffix with vowel harmony
// Special forms for 1-10
const ORDINAL_SPECIAL = {
  1: 'birinci',
  2: 'ikinci',
  3: 'üçüncü',
  4: 'dördüncü',
  5: 'beşinci',
  6: 'altıncı',
  7: 'yeddinci',
  8: 'səkkizinci',
  9: 'doqquzuncu',
  10: 'onuncu'
}

// ============================================================================
// Currency Vocabulary (Azerbaijani Manat)
// ============================================================================

const MANAT = 'manat'
const QEPIK = 'qəpik' // subunit (100 qəpik = 1 manat)

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
 * Determines the ordinal suffix based on Azerbaijani vowel harmony.
 * @param {string} word - The cardinal word
 * @returns {string} The appropriate suffix
 */
function getOrdinalSuffix (word) {
  // Azerbaijani vowel harmony: back vowels (a,ı,o,u) vs front vowels (ə,e,i,ö,ü)
  const backVowels = 'aıou'
  const frontVowels = 'əeiöü'

  // Scan from end for last vowel
  for (let i = word.length - 1; i >= 0; i--) {
    const char = word[i]
    if (backVowels.includes(char)) {
      // Back vowels: -ıncı (after a,ı) or -uncu (after o,u)
      if ('ou'.includes(char)) return 'uncu'
      return 'ıncı'
    }
    if (frontVowels.includes(char)) {
      // Front vowels: -inci (after ə,e,i) or -üncü (after ö,ü)
      if ('öü'.includes(char)) return 'üncü'
      return 'inci'
    }
  }
  return 'inci' // default
}

/**
 * Converts a non-negative integer to Azerbaijani ordinal words.
 *
 * Azerbaijani ordinals: birinci (1st), ikinci (2nd), üçüncü (3rd), etc.
 * Uses vowel harmony for suffix selection.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Azerbaijani ordinal words
 */
function integerToOrdinal (n) {
  // Special forms for 1-10
  if (n >= 1n && n <= 10n) {
    return ORDINAL_SPECIAL[Number(n)]
  }

  // For numbers > 10, get cardinal without spaces and add appropriate suffix
  const cardinal = integerToWords(n).replace(/ /g, '')
  const suffix = getOrdinalSuffix(cardinal)
  return cardinal + suffix
}

/**
 * Converts a numeric value to Azerbaijani ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'birinci'
 * toOrdinal(2)    // 'ikinci'
 * toOrdinal(21)   // 'iyirmibirinci'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Azerbaijani currency words (Manat).
 *
 * Uses manat and qəpik (100 qəpik = 1 manat).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Azerbaijani currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'qırx iki manat'
 * toCurrency(1.50)   // 'bir manat əlli qəpik'
 * toCurrency(-5)     // 'mənfi beş manat'
 */
function toCurrency (value) {
  const { isNegative, dollars: manat, cents: qepik } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Manat part
  if (manat > 0n || qepik === 0n) {
    result += integerToWords(manat) + ' ' + MANAT
  }

  // Qəpik part
  if (qepik > 0n) {
    if (manat > 0n) {
      result += ' '
    }
    result += integerToWords(qepik) + ' ' + QEPIK
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
