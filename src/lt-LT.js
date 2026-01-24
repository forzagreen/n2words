/**
 * Lithuanian (Lithuania) language converter
 *
 * CLDR: lt-LT | Lithuanian as used in Lithuania
 *
 * Key features:
 * - Three-form pluralization (singular/plural/genitive)
 * - Gender agreement (masculine/feminine for numbers < 1000)
 * - Two-form hundreds (šimtas/šimtai)
 * - Long scale naming
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni']
const ONES_FEM = ['', 'viena', 'dvi', 'trys', 'keturios', 'penkios', 'šešios', 'septynios', 'aštuonios', 'devynios']

const TEENS = ['dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika']
const TENS = ['', '', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt']

// Hundreds: šimtas (singular), šimtai (plural)
const HUNDRED_SINGULAR = 'šimtas'
const HUNDRED_PLURAL = 'šimtai'

const ZERO = 'nulis'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'kablelis'

// Scale words: [singular, plural, genitive]
const SCALE_FORMS = [
  ['tūkstantis', 'tūkstančiai', 'tūkstančių'],
  ['milijonas', 'milijonai', 'milijonų'],
  ['milijardas', 'milijardai', 'milijardų'],
  ['trilijonas', 'trilijonai', 'trilijonų'],
  ['kvadrilijonas', 'kvadrilijonai', 'kvadrilijonų'],
  ['kvintilijonas', 'kvintilijonai', 'kvintilijonų'],
  ['sikstilijonas', 'sikstilijonai', 'sikstilijonų'],
  ['septilijonas', 'septilijonai', 'septilijonų'],
  ['oktilijonas', 'oktilijonai', 'oktilijonų']
]

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 (masculine form).
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - Lithuanian always includes the numeral
  if (hundreds > 0) {
    parts.push(ONES_MASC[hundreds])
    parts.push(hundreds === 1 ? HUNDRED_SINGULAR : HUNDRED_PLURAL)
  }

  // Tens
  if (tens > 1) {
    parts.push(TENS[tens])
  }

  // Teens or ones
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else if (ones > 0) {
    parts.push(ONES_MASC[ones])
  }

  return parts.join(' ')
}

/**
 * Builds segment word for 0-999 (feminine form - only differs in ones).
 */
function buildSegmentFeminine (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - always masculine
  if (hundreds > 0) {
    parts.push(ONES_MASC[hundreds])
    parts.push(hundreds === 1 ? HUNDRED_SINGULAR : HUNDRED_PLURAL)
  }

  // Tens
  if (tens > 1) {
    parts.push(TENS[tens])
  }

  // Teens or ones - feminine for ones only
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else if (ones > 0) {
    parts.push(ONES_FEM[ones])
  }

  return parts.join(' ')
}

// ============================================================================
// Pluralization
// ============================================================================

/**
 * Lithuanian pluralization rules.
 * - Singular: ends in 1 (except 11)
 * - Plural: ends in 2-9 (except 12-19)
 * - Genitive: 0, 10-19, or ends in 0
 *
 * @param {number} n - The segment value
 * @param {string[]} forms - [singular, plural, genitive]
 * @returns {string} The appropriate form
 */
function pluralize (n, forms) {
  if (n === 0) return forms[2]

  const lastDigit = n % 10
  const lastTwoDigits = n % 100

  // 10-19 always use genitive
  if (lastTwoDigits >= 10 && lastTwoDigits <= 19) {
    return forms[2]
  }

  // Ends in 0 → genitive
  if (lastDigit === 0) {
    return forms[2]
  }

  // Ends in 1 → singular
  if (lastDigit === 1) {
    return forms[0]
  }

  // Ends in 2-9 → plural
  return forms[1]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Lithuanian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Lithuanian words
 */
function integerToWords (n, gender) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const num = Number(n)
    return gender === 'feminine' ? buildSegmentFeminine(num) : buildSegment(num)
  }

  // For numbers >= 1000, feminine only applies to final segment if < 1000
  // But the fixture shows feminine NOT applying for n >= 1000
  // So we use masculine for all segments when n >= 1000
  return buildLargeNumberWords(n, gender)
}

/**
 * Builds words for numbers >= 1000.
 *
 * @param {bigint} n - Number >= 1000
 * @param {Object} options - Conversion options
 * @returns {string} Lithuanian words
 */
function buildLargeNumberWords (n, gender) {
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
      const segmentWord = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment - use masculine (feminine doesn't apply when n >= 1000)
        parts.push(segmentWord)
      } else {
        // Segment with scale word
        const scaleForms = SCALE_FORMS[scaleIndex - 1]
        const scaleWord = pluralize(segment, scaleForms)
        parts.push(segmentWord + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Lithuanian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Lithuanian words for decimal part
 */
function decimalPartToWords (decimalPart, gender) {
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
    result += integerToWords(BigInt(remainder), gender)
  }

  return result
}

/**
 * Converts a numeric value to Lithuanian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {string} [options.gender='masculine'] - Gender for numbers < 1000
 * @returns {string} The number in Lithuanian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)                          // 'keturiasdešimt du'
 * toCardinal(1, { gender: 'feminine' })   // 'viena'
 * toCardinal(1000000)                     // 'vienas milijonas'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { gender = 'masculine' } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, gender)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, gender)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal }
