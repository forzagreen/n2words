/**
 * French (France) language converter
 *
 * CLDR: fr-FR | French as used in France
 *
 * French-specific rules:
 * - Vigesimal patterns: 70 = soixante-dix, 80 = quatre-vingts, 90 = quatre-vingt-dix
 * - "et" conjunction: vingt et un (21), soixante et onze (71), but NOT quatre-vingt-un
 * - Pluralization: "cents" loses 's' when followed by more digits
 * - Long scale with -ard forms: milliard, billiard, trilliard
 * - Omit "un" before mille
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']

// Scale words (even indices: million, billion, trillion, quadrillion)
const SCALES = ['million', 'billion', 'trillion', 'quadrillion']
const SCALES_ARD = ['milliard', 'billiard', 'trilliard', 'quadrilliard']

const THOUSAND = 'mille'
const HUNDRED = 'cent'
const ZERO = 'zéro'
const NEGATIVE = 'moins'
const DECIMAL_SEP = 'virgule'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Returns object with { word, endsWithCents, endsWithVingts } for pluralization handling.
 */
function buildSegment (n) {
  if (n === 0) return { word: '', endsWithCents: false, endsWithVingts: false }

  const tensOnes = n % 100
  const hundreds = Math.floor(n / 100)

  const parts = []
  let endsWithCents = false
  let endsWithVingts = false

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      if (tensOnes === 0) {
        parts.push(HUNDRED)
      } else {
        parts.push(HUNDRED)
      }
    } else {
      if (tensOnes === 0) {
        // "deux cents", "trois cents" (with 's')
        parts.push(ONES[hundreds] + ' ' + HUNDRED + 's')
        endsWithCents = true
      } else {
        // "deux cent", "trois cent" (no 's' when followed by more)
        parts.push(ONES[hundreds] + ' ' + HUNDRED)
      }
    }
  }

  // Tens and ones - vigesimal pattern
  if (tensOnes === 0) {
    // Just hundreds, nothing more
  } else if (tensOnes < 10) {
    // Single digit
    parts.push(ONES[tensOnes])
  } else if (tensOnes < 17) {
    // 10-16: regular teens
    parts.push(TEENS[tensOnes - 10])
  } else if (tensOnes < 20) {
    // 17-19: dix-sept, dix-huit, dix-neuf
    parts.push(TEENS[tensOnes - 10])
  } else if (tensOnes < 70) {
    // 20-69: standard tens + ones
    const t = Math.floor(tensOnes / 10)
    const o = tensOnes % 10
    if (o === 0) {
      parts.push(TENS[t])
    } else if (o === 1) {
      // "et un" for 21, 31, 41, 51, 61
      parts.push(TENS[t] + ' et ' + ONES[1])
    } else {
      parts.push(TENS[t] + '-' + ONES[o])
    }
  } else if (tensOnes < 80) {
    // 70-79: soixante-dix, soixante et onze, soixante-douze...
    const remainder = tensOnes - 60
    if (remainder === 11) {
      // 71: soixante et onze
      parts.push('soixante et onze')
    } else {
      // 70, 72-79: soixante-dix, soixante-douze...
      parts.push('soixante-' + TEENS[remainder - 10])
    }
  } else if (tensOnes === 80) {
    // 80: quatre-vingts (with 's')
    parts.push('quatre-vingts')
    endsWithVingts = true
  } else if (tensOnes < 100) {
    // 81-99: quatre-vingt-un, quatre-vingt-dix...
    const remainder = tensOnes - 80
    if (remainder < 10) {
      // 81-89
      parts.push('quatre-vingt-' + ONES[remainder])
    } else {
      // 90-99
      parts.push('quatre-vingt-' + TEENS[remainder - 10])
    }
  }

  // Join parts with space (between hundreds and rest)
  return { word: parts.join(' '), endsWithCents, endsWithVingts }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets scale word for French long scale with -ard pattern.
 *
 * @param {number} scaleIndex - Scale level (1 = thousand, 2 = million, etc.)
 * @param {bigint} segment - Segment value for pluralization
 * @returns {string} Scale word
 */
function getScaleWord (scaleIndex, segment) {
  if (scaleIndex === 1) return THOUSAND

  // Even indices (2, 4, 6, 8): million, billion, trillion, quadrillion
  // Odd indices > 1 (3, 5, 7, 9): milliard, billiard, trilliard, quadrilliard
  if (scaleIndex % 2 === 0) {
    const arrayIndex = (scaleIndex / 2) - 1
    const baseWord = SCALES[arrayIndex]
    if (!baseWord) return ''
    return segment > 1n ? baseWord + 's' : baseWord
  } else {
    const arrayIndex = ((scaleIndex - 1) / 2) - 1
    const ardWord = SCALES_ARD[arrayIndex]
    if (!ardWord) return THOUSAND
    return segment > 1n ? ardWord + 's' : ardWord
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to French words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {boolean} withHyphen - Whether to use hyphen separators
 * @returns {string} French words
 */
function integerToWords (n, withHyphen = false) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const { word } = buildSegment(Number(n))
    return withHyphen ? word.replace(/ /g, '-') : word
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "mille" not "un mille"
      result = THOUSAND
    } else {
      // Check if segment ends with "cents" or "vingts" - need to strip 's' before mille
      const { word: thousandsWord, endsWithCents, endsWithVingts } = buildSegment(thousands)
      let adjustedWord = thousandsWord
      if (endsWithCents || endsWithVingts) {
        adjustedWord = thousandsWord.slice(0, -1) // Remove trailing 's'
      }
      result = adjustedWord + (withHyphen ? '-' : ' ') + THOUSAND
    }

    if (remainder > 0) {
      const { word: remainderWord } = buildSegment(remainder)
      result += (withHyphen ? '-' : ' ') + remainderWord
    }

    if (withHyphen) {
      result = result.replace(/ /g, '-')
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, withHyphen)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {boolean} withHyphen - Whether to use hyphen separators
 * @returns {string} French words
 */
function buildLargeNumberWords (n, withHyphen) {
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
      const scaleWord = scaleIndex > 0 ? getScaleWord(scaleIndex, BigInt(segment)) : ''
      const { word: segWords, endsWithCents, endsWithVingts } = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment
        parts.push(segWords)
      } else if (scaleIndex === 1) {
        // Thousands: "mille" not "un mille"
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          // Strip 's' from cents/vingts before mille
          let adjustedWord = segWords
          if (endsWithCents || endsWithVingts) {
            adjustedWord = segWords.slice(0, -1)
          }
          parts.push(adjustedWord)
          parts.push(scaleWord)
        }
      } else {
        // Million and above
        parts.push(segWords)
        parts.push(scaleWord)
      }
    }

    scaleIndex--
  }

  const sep = withHyphen ? '-' : ' '
  let result = parts.join(sep)

  if (withHyphen) {
    result = result.replace(/ /g, '-')
  }

  return result
}

/**
 * Converts decimal digits to French words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {boolean} withHyphen - Whether to use hyphen separators
 * @returns {string} French words for decimal part
 */
function decimalPartToWords (decimalPart, withHyphen) {
  let result = ''
  const sep = withHyphen ? '-' : ' '

  // Handle leading zeros
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += sep
    result += ZERO
    i++
  }

  // Convert remainder as a single number
  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += sep
    result += integerToWords(BigInt(remainder), withHyphen)
  }

  return result
}

/**
 * Converts a numeric value to French words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.withHyphenSeparator=false] - Use hyphens between all words
 * @returns {string} The number in French words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)           // 'vingt et un'
 * toCardinal(80)           // 'quatre-vingts'
 * toCardinal(1000000)      // 'un million'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { withHyphenSeparator = false } = options

  let result = ''
  const sep = withHyphenSeparator ? '-' : ' '

  if (isNegative) {
    result = NEGATIVE + sep
  }

  result += integerToWords(integerPart, withHyphenSeparator)

  if (decimalPart) {
    result += sep + DECIMAL_SEP + sep + decimalPartToWords(decimalPart, withHyphenSeparator)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal }
