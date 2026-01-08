/**
 * Polish language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Polish-specific rules:
 * - Three-form pluralization: 1 = singular, 2-4 = few, 5+ = many
 * - Gender agreement (masculine/feminine for numbers < 1000)
 * - Omit "jeden" before scale words (tysiąc, milion, etc.)
 * - Irregular hundreds: dwieście, trzysta, czterysta, pięćset...
 * - Long scale with -ard forms: miliard, biliard, tryliard
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { validateOptions } from '../utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']
const ONES_FEM = ['', 'jedna', 'dwie', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']

const TEENS = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście']

const TENS = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt']

// Irregular hundreds
const HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset']

// Scale words: [singular, few (2-4), many (5+)]
const PLURAL_FORMS = {
  1: ['tysiąc', 'tysiące', 'tysięcy'],
  2: ['milion', 'miliony', 'milionów'],
  3: ['miliard', 'miliardy', 'miliardów'],
  4: ['bilion', 'biliony', 'bilionów'],
  5: ['biliard', 'biliardy', 'biliardów'],
  6: ['trylion', 'tryliony', 'trylionów'],
  7: ['tryliard', 'tryliardy', 'tryliardów'],
  8: ['kwadrylion', 'kwadryliony', 'kwadrylionów'],
  9: ['kwaryliard', 'kwadryliardy', 'kwadryliardów'],
  10: ['kwintylion', 'kwintyliony', 'kwintylionów']
}

const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'przecinek'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 (masculine form).
 * @param {number} n - Segment value
 * @returns {string} Polish word
 */
function buildSegment (n) {
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
      parts.push(ONES_MASC[ones])
    }
  }

  return parts.join(' ')
}

/**
 * Builds segment word for 0-999 (feminine form - only differs in ones).
 * @param {number} n - Segment value
 * @returns {string} Polish word
 */
function buildSegmentFeminine (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones - feminine for ones only
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else {
    if (tens >= 2) {
      parts.push(TENS[tens])
    }
    if (ones > 0) {
      parts.push(ONES_FEM[ones])
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Polish pluralization: 1 = singular, 2-4 = few, else = many.
 * Special case: 11-19 always use many form.
 *
 * @param {bigint} n - Number to pluralize
 * @param {string[]} forms - [singular, few, many]
 * @returns {string} Correct plural form
 */
function pluralize (n, forms) {
  if (n === 1n) {
    return forms[0]
  }

  const lastDigit = n % 10n
  const lastTwoDigits = n % 100n

  // Teens (11-19) always use many form
  // 2-4 use few form (but not 12-14)
  if (lastDigit >= 2n && lastDigit <= 4n && (lastTwoDigits < 10n || lastTwoDigits > 20n)) {
    return forms[1]
  }

  return forms[2]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Polish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Polish words
 */
function integerToWords (n, options = {}) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return options.gender === 'feminine' ? buildSegmentFeminine(Number(n)) : buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    const scaleWord = pluralize(BigInt(thousands), PLURAL_FORMS[1])

    let result
    if (thousands === 1) {
      // Omit "jeden" before tysiąc
      result = scaleWord
    } else {
      result = buildSegment(thousands) + ' ' + scaleWord
    }

    if (remainder > 0) {
      result += ' ' + buildSegment(remainder)
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, options)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {Object} options - Conversion options
 * @returns {string} Polish words
 */
function buildLargeNumberWords (n, options) {
  // Extract segments using BigInt division (faster than string slicing)
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(temp % 1000n)
    temp = temp / 1000n
  }

  // Build result string directly
  let result = ''

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0n) continue

    const segmentWord = buildSegment(Number(segment))

    if (result) result += ' '

    if (i === 0) {
      // Units segment
      result += segmentWord
    } else {
      // Scale word needed
      const forms = PLURAL_FORMS[i]
      if (forms) {
        const scaleWord = pluralize(segment, forms)

        if (segment === 1n) {
          // Omit "jeden" before scale words
          result += scaleWord
        } else {
          result += segmentWord + ' ' + scaleWord
        }
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Polish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Polish words for decimal part
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
 * Converts a numeric value to Polish words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {string} [options.gender='masculine'] - Gender for numbers < 1000
 * @returns {string} The number in Polish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(1)                          // 'jeden'
 * toWords(1, { gender: 'feminine' })  // 'jedna'
 * toWords(1000)                       // 'tysiąc'
 * toWords(2000)                       // 'dwa tysiące'
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
