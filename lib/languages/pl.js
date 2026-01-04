/**
 * Polish language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * Polish-specific rules (handled in precomputation):
 * - Three-form pluralization: 1 = singular, 2-4 = few, 5+ = many
 * - Omit "jeden" before scale words (tysiąc, milion, etc.)
 * - Irregular hundreds: dwieście, trzysta, czterysta, pięćset...
 * - Long scale with -ard forms: miliard, biliard, tryliard
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']
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
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
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
      parts.push(ONES[ones])
    }
  }

  return parts.join(' ')
}

// Precompute all 1000 segment words (0-999)
const SEGMENTS = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegment(i)
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
 * @returns {string} Polish words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return SEGMENTS[Number(n)]
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
      result = SEGMENTS[thousands] + ' ' + scaleWord
    }

    if (remainder > 0) {
      result += ' ' + SEGMENTS[remainder]
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Polish words
 */
function buildLargeNumberWords (n) {
  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from right to left
  const segmentValues = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segmentValues.push(BigInt(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segmentValues.push(BigInt(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segmentValues.length - 1

  for (let i = 0; i < segmentValues.length; i++) {
    const segment = segmentValues[i]

    if (segment !== 0n) {
      if (scaleIndex === 0) {
        // Units segment
        parts.push(SEGMENTS[Number(segment)])
      } else {
        // Scale word needed
        const forms = PLURAL_FORMS[scaleIndex]
        if (forms) {
          const scaleWord = pluralize(segment, forms)

          if (segment === 1n) {
            // Omit "jeden" before scale words
            parts.push(scaleWord)
          } else {
            parts.push(SEGMENTS[Number(segment)] + ' ' + scaleWord)
          }
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Polish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Polish words for decimal part
 */
function decimalPartToWords (decimalPart) {
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
    result += integerToWords(BigInt(remainder))
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
 * @returns {string} The number in Polish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(1)       // 'jeden'
 * toWords(1000)    // 'tysiąc'
 * toWords(2000)    // 'dwa tysiące'
 * toWords(5000)    // 'pięć tysięcy'
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
// Public API
// ============================================================================

export { toWords }

// Named exports for testing
export {
  ONES,
  ONES_FEM,
  TEENS,
  TENS,
  HUNDREDS,
  PLURAL_FORMS,
  ZERO,
  SEGMENTS,
  pluralize,
  integerToWords,
  decimalPartToWords
}
