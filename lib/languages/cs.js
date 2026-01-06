/**
 * Czech language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * Czech-specific rules (handled in precomputation):
 * - Three-form pluralization: 1 = singular, 2-4 = few, 5+ = many
 * - Irregular hundreds: sto, dvě stě, tři sta, čtyři sta, pět set...
 * - Gender: dva (masc) vs dvě (fem) for 2
 * - Omit "one" before scale words: "tisíc" not "jedna tisíc"
 * - Dynamic decimal separator: celá/celé/celých based on integer
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Ones words (masculine form)
const ONES = ['', 'jedna', 'dva', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět']

// Teens (10-19)
const TEENS = ['deset', 'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct', 'sedmnáct', 'osmnáct', 'devatenáct']

// Tens (20-90)
const TENS = ['', '', 'dvacet', 'třicet', 'čtyřicet', 'padesát', 'šedesát', 'sedmdesát', 'osmdesát', 'devadesát']

// Irregular hundreds
const HUNDREDS = ['', 'sto', 'dvě stě', 'tři sta', 'čtyři sta', 'pět set', 'šest set', 'sedm set', 'osm set', 'devět set']

// Scale plural forms [singular, few (2-4), many (5+)]
const PLURAL_FORMS = {
  1: ['tisíc', 'tisíce', 'tisíc'], // 10^3
  2: ['milion', 'miliony', 'milionů'], // 10^6
  3: ['miliarda', 'miliardy', 'miliard'], // 10^9
  4: ['bilion', 'biliony', 'bilionů'], // 10^12
  5: ['biliarda', 'biliardy', 'biliard'], // 10^15
  6: ['trilion', 'triliony', 'trilionů'], // 10^18
  7: ['triliarda', 'triliardy', 'triliard'], // 10^21
  8: ['kvadrilion', 'kvadriliony', 'kvadrilionů'], // 10^24
  9: ['kvadriliarda', 'kvadriliardy', 'kvadriliard'] // 10^27
}

const ZERO = 'nula'
const NEGATIVE = 'mínus'

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999 (masculine, default form).
 * Only used during table construction.
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds (irregular)
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones
  if (tens === 1) {
    // Teens
    parts.push(TEENS[ones])
  } else if (tens >= 2) {
    parts.push(TENS[tens])
    if (ones > 0) {
      parts.push(ONES[ones])
    }
  } else if (ones > 0) {
    parts.push(ONES[ones])
  }

  return parts.join(' ')
}

/**
 * Builds segment word for 0-999 with feminine hundreds.
 * Hundreds use irregular forms (dvě stě, tři sta) but ones remain masculine.
 */
function buildSegmentWithHundreds (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds use the irregular HUNDREDS array (already has "dvě stě" etc.)
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones use masculine form
  if (tens === 1) {
    parts.push(TEENS[ones])
  } else if (tens >= 2) {
    parts.push(TENS[tens])
    if (ones > 0) {
      parts.push(ONES[ones]) // masculine
    }
  } else if (ones > 0) {
    parts.push(ONES[ones]) // masculine
  }

  return parts.join(' ')
}

// Precompute all 1000 segment words (0-999) - masculine form
const SEGMENTS = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegment(i)
}

// Precompute all 1000 segment words with hundreds (irregular hundreds forms)
const SEGMENTS_WITH_HUNDREDS = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS_WITH_HUNDREDS[i] = buildSegmentWithHundreds(i)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Czech pluralization: 1 = singular, 2-4 = few, else = many.
 * Teens (11-19) always use "many" form.
 *
 * @param {bigint} n - The number
 * @param {string[]} forms - [singular, few, many]
 * @returns {string} The appropriate form
 */
function pluralize (n, forms) {
  if (n === 1n) return forms[0]

  const lastDigit = n % 10n
  const lastTwoDigits = n % 100n

  // 2-4, but not 12-14 (teens use "many")
  if (lastDigit >= 2n && lastDigit <= 4n && (lastTwoDigits < 10n || lastTwoDigits > 20n)) {
    return forms[1]
  }

  return forms[2]
}

/**
 * Gets the decimal separator word based on integer part.
 * celá (0-1), celé (2-4), celých (5+)
 */
function getDecimalSeparator (integerPart) {
  if (integerPart === 0n || integerPart === 1n) {
    return 'celá'
  } else if (integerPart >= 2n && integerPart <= 4n) {
    return 'celé'
  } else {
    return 'celých'
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Czech words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Czech words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return SEGMENTS[Number(n)]
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = n / 1000n
    const remainder = Number(n % 1000n)

    const scaleWord = pluralize(thousands, PLURAL_FORMS[1])

    let result
    if (thousands === 1n) {
      // Omit "one" before tisíc
      result = scaleWord
    } else {
      result = SEGMENTS[Number(thousands)] + ' ' + scaleWord
    }

    if (remainder > 0) {
      // Use form with irregular hundreds (for "dvě stě" etc.)
      result += ' ' + SEGMENTS_WITH_HUNDREDS[remainder]
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Czech words
 */
function buildLargeNumberWords (n) {
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

    if (result) result += ' '

    if (i === 0) {
      // Units segment (no scale word) - use form with irregular hundreds
      result += SEGMENTS_WITH_HUNDREDS[Number(segment)]
    } else {
      // Scale word needed
      const forms = PLURAL_FORMS[i]
      if (forms) {
        const scaleWord = pluralize(segment, forms)

        if (segment === 1n) {
          // Omit "one" before scale words
          result += scaleWord
        } else {
          // Use masculine form for multiplier before scale words
          result += SEGMENTS[Number(segment)] + ' ' + scaleWord
        }
      } else {
        // Fallback for very large scales without defined forms
        result += SEGMENTS[Number(segment)]
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Czech words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Czech words for decimal part
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
 * Converts a numeric value to Czech words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Czech words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)           // 'dvacet jedna'
 * toWords(1000)         // 'tisíc'
 * toWords(2000)         // 'dva tisíce'
 * toWords(5000)         // 'pět tisíc'
 */
function toWords (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    const separator = getDecimalSeparator(integerPart)
    result += ' ' + separator + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }
