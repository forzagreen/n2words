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
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
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

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Lithuanian ordinals (masculine nominative singular)
const ORDINAL_ONES = ['', 'pirmas', 'antras', 'trečias', 'ketvirtas', 'penktas', 'šeštas', 'septintas', 'aštuntas', 'devintas']

// Ordinal teens
const ORDINAL_TEENS = ['dešimtas', 'vienuoliktas', 'dvyliktas', 'tryliktas', 'keturioliktas', 'penkioliktas', 'šešioliktas', 'septynioliktas', 'aštuonioliktas', 'devynioliktas']

// Ordinal tens
const ORDINAL_TENS = ['', '', 'dvidešimtas', 'trisdešimtas', 'keturiasdešimtas', 'penkiasdešimtas', 'šešiasdešimtas', 'septyniasdešimtas', 'aštuoniasdešimtas', 'devyniasdešimtas']

// Ordinal hundreds
const ORDINAL_HUNDREDS = ['', 'šimtasis', 'dviejų šimtasis', 'trijų šimtasis', 'keturių šimtasis', 'penkių šimtasis', 'šešių šimtasis', 'septynių šimtasis', 'aštuonių šimtasis', 'devynių šimtasis']

// Scale ordinals
const ORDINAL_SCALES = ['tūkstantasis', 'milijonasis', 'milijardasis', 'trilijonasis']

// ============================================================================
// Currency Vocabulary (Euro - Lithuania uses Euro since 2015)
// ============================================================================

// Euro forms: [singular, plural, genitive]
const EURO_FORMS = ['euras', 'eurai', 'eurų']
// Cent forms: [singular, plural, genitive]
const CENT_FORMS = ['centas', 'centai', 'centų']

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
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Builds ordinal for a 0-99 segment when it's the final (ordinal) part.
 *
 * @param {number} n - Number 0-99
 * @returns {string} Ordinal words
 */
function buildOrdinalTensOnes (n) {
  if (n === 0) return ''

  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10)

  if (tensDigit === 0) {
    return ORDINAL_ONES[onesDigit]
  }

  if (tensDigit === 1) {
    return ORDINAL_TEENS[onesDigit]
  }

  if (onesDigit === 0) {
    return ORDINAL_TENS[tensDigit]
  }

  return TENS[tensDigit] + ' ' + ORDINAL_ONES[onesDigit]
}

/**
 * Converts a positive integer to Lithuanian ordinal words (masculine nominative).
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Ordinal Lithuanian words
 */
function integerToOrdinal (n) {
  if (n < 100n) {
    return buildOrdinalTensOnes(Number(n))
  }

  if (n < 1000n) {
    const num = Number(n)
    const hundredsDigit = Math.floor(num / 100)
    const remainder = num % 100

    if (remainder === 0) {
      return ORDINAL_HUNDREDS[hundredsDigit]
    }

    // Cardinal hundreds + ordinal remainder
    const hundredWord = ONES_MASC[hundredsDigit] + ' ' + (hundredsDigit === 1 ? HUNDRED_SINGULAR : HUNDRED_PLURAL)
    return hundredWord + ' ' + buildOrdinalTensOnes(remainder)
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      if (thousands === 1) {
        return ORDINAL_SCALES[0]
      }
      // For 2000+, include cardinal scale word before ordinal
      const scaleWord = pluralize(thousands, SCALE_FORMS[0])
      return buildSegment(thousands) + ' ' + scaleWord + ' ' + ORDINAL_SCALES[0]
    }

    const scaleWord = pluralize(thousands, SCALE_FORMS[0])
    const thousandsWord = buildSegment(thousands)
    return thousandsWord + ' ' + scaleWord + ' ' + integerToOrdinal(BigInt(remainder))
  }

  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Ordinal Lithuanian words
 */
function buildLargeOrdinal (n) {
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

  let lastNonZeroIdx = segments.length - 1
  while (lastNonZeroIdx >= 0 && segments[lastNonZeroIdx] === 0) {
    lastNonZeroIdx--
  }

  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const isLastNonZero = (i === lastNonZeroIdx)

      if (scaleIndex === 0) {
        if (isLastNonZero) {
          parts.push(integerToOrdinal(BigInt(segment)))
        } else {
          parts.push(buildSegment(segment))
        }
      } else {
        if (isLastNonZero) {
          if (segment === 1) {
            parts.push(ORDINAL_SCALES[scaleIndex - 1])
          } else {
            // For 2+, include cardinal scale word before ordinal
            const scaleForms = SCALE_FORMS[scaleIndex - 1]
            const cardinalScaleWord = pluralize(segment, scaleForms)
            parts.push(buildSegment(segment) + ' ' + cardinalScaleWord + ' ' + ORDINAL_SCALES[scaleIndex - 1])
          }
        } else {
          const scaleForms = SCALE_FORMS[scaleIndex - 1]
          const scaleWord = pluralize(segment, scaleForms)
          parts.push(buildSegment(segment) + ' ' + scaleWord)
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Lithuanian ordinal words (masculine nominative).
 *
 * @param {number | string | bigint} value - The numeric value to convert (must be a positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'pirmas'
 * toOrdinal(2)    // 'antras'
 * toOrdinal(21)   // 'dvidešimt pirmas'
 * toOrdinal(100)  // 'šimtasis'
 * toOrdinal(1000) // 'tūkstantasis'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value)
// ============================================================================

/**
 * Converts a numeric value to Lithuanian currency words (Euro).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Lithuanian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42)     // 'keturiasdešimt du eurai'
 * toCurrency(1)      // 'vienas euras'
 * toCurrency(1.50)   // 'vienas euras penkiasdešimt centų'
 * toCurrency(-5)     // 'minus penki eurai'
 */
function toCurrency (value) {
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)

  let result = ''
  if (isNegative) {
    result = NEGATIVE + ' '
  }

  // Euro part (masculine)
  if (euros > 0n || cents === 0n) {
    result += integerToWords(euros, 'masculine')
    result += ' ' + pluralize(Number(euros), EURO_FORMS)
  }

  // Cent part (masculine)
  if (cents > 0n) {
    if (euros > 0n) {
      result += ' '
    }
    result += integerToWords(cents, 'masculine')
    result += ' ' + pluralize(Number(cents), CENT_FORMS)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
