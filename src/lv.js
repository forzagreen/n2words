/**
 * Latvian language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Two-form pluralization (singular for 1 except 11, plural otherwise)
 * - Gender agreement (masculine/feminine for numbers < 1000)
 * - Special hundreds forms (simts/simti/simtu)
 * - Omit "one" before scale words
 * - Long scale naming
 */

import { parseNumericValue } from './utils/parse-numeric.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'viens', 'divi', 'trīs', 'četri', 'pieci', 'seši', 'septiņi', 'astoņi', 'deviņi']
const ONES_FEM = ['', 'viena', 'divas', 'trīs', 'četras', 'piecas', 'sešas', 'septiņas', 'astoņas', 'deviņas']

const TEENS = ['desmit', 'vienpadsmit', 'divpadsmit', 'trīspadsmit', 'četrpadsmit', 'piecpadsmit', 'sešpadsmit', 'septiņpadsmit', 'astoņpadsmit', 'deviņpadsmit']
const TENS = ['', '', 'divdesmit', 'trīsdesmit', 'četrdesmit', 'piecdesmit', 'sešdesmit', 'septiņdesmit', 'astoņdesmit', 'deviņdesmit']

// Hundreds: simts (100, 110-199), simti (200-999), simtu (101-109)
const HUNDRED_SINGULAR = 'simts'
const HUNDRED_PLURAL = 'simti'
const HUNDRED_GENITIVE = 'simtu'

const ZERO = 'nulle'
const NEGATIVE = 'mīnus'
const DECIMAL_SEP = 'komats'

// Scale words: [singular, plural, genitive]
const SCALE_FORMS = [
  ['tūkstotis', 'tūkstoši', 'tūkstošu'],
  ['miljons', 'miljoni', 'miljonu'],
  ['miljards', 'miljardi', 'miljardu'],
  ['triljons', 'triljoni', 'triljonu'],
  ['kvadriljons', 'kvadriljoni', 'kvadriljonu'],
  ['kvintiljons', 'kvintiljoni', 'kvintiljonu'],
  ['sikstiljons', 'sikstiljoni', 'sikstiljonu'],
  ['septiljons', 'septiljoni', 'septiljonu'],
  ['oktiljons', 'oktiljoni', 'oktiljonu']
]

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 (masculine form).
 * Does NOT include special handling for segment=1 (omitOneBeforeScale).
 * That's handled at join time.
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - Latvian has special forms
  if (hundreds > 0) {
    if (hundreds === 1 && tens === 0 && ones > 0) {
      // 101-109: use genitive form "simtu"
      parts.push(HUNDRED_GENITIVE)
    } else if (hundreds > 1) {
      // 200-999: use plural "simti"
      parts.push(ONES_MASC[hundreds])
      parts.push(HUNDRED_PLURAL)
    } else {
      // 100, 110-199: use singular "simts"
      parts.push(HUNDRED_SINGULAR)
    }
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
    if (hundreds === 1 && tens === 0 && ones > 0) {
      parts.push(HUNDRED_GENITIVE)
    } else if (hundreds > 1) {
      parts.push(ONES_MASC[hundreds])
      parts.push(HUNDRED_PLURAL)
    } else {
      parts.push(HUNDRED_SINGULAR)
    }
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
 * Latvian pluralization - simpler than Slavic.
 * Singular: ends in 1 (except 11)
 * Plural: everything else
 *
 * @param {number} n - The segment value
 * @param {string[]} forms - [singular, plural, genitive]
 * @returns {string} The appropriate form
 */
function pluralize (n, forms) {
  if (n === 0) return forms[2]

  const lastDigit = n % 10
  const lastTwoDigits = n % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return forms[0]
  }

  return forms[1]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Latvian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Latvian words
 */
function integerToWords (n, options = {}) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const num = Number(n)
    return options.gender === 'feminine' ? buildSegmentFeminine(num) : buildSegment(num)
  }

  // For numbers >= 1000, feminine only applies to final segment if < 1000
  // But we use masculine for all segments when n >= 1000
  return buildLargeNumberWords(n, options)
}

/**
 * Builds words for numbers >= 1000.
 *
 * @param {bigint} n - Number >= 1000
 * @param {Object} options - Conversion options
 * @returns {string} Latvian words
 */
function buildLargeNumberWords (n, options) {
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

        // Latvian omits "one" before scale words
        if (segment === 1) {
          parts.push(scaleWord)
        } else {
          parts.push(segmentWord + ' ' + scaleWord)
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Latvian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Latvian words for decimal part
 */
function decimalPartToWords (decimalPart, options) {
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
    result += integerToWords(BigInt(remainder), options)
  }

  return result
}

/**
 * Converts a numeric value to Latvian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {string} [options.gender='masculine'] - Gender for numbers < 1000
 * @returns {string} The number in Latvian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(42)                          // 'četrdesmit divi'
 * toWords(1, { gender: 'feminine' })   // 'viena'
 * toWords(1000)                        // 'tūkstotis'
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, options)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, options)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }
