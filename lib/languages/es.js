/**
 * Spanish language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * Spanish-specific rules (handled in precomputation):
 * - Gender agreement: uno/una, veintiuno/veintiuna, hundreds
 * - Special twenties: veinte, veintiuno, veintidós, ... veintinueve
 * - "y" conjunction: treinta y uno (only 30-99 with ones)
 * - "cien" for exact 100, "ciento/cienta" otherwise
 * - Irregular hundreds: quinientos, setecientos, novecientos
 * - Compound long scale: millón, mil millones, billón, mil billones
 * - "un" before millón (not "uno"), omit before mil
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { validateOptions } from '../utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ONES_FEM = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']

const TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve']

// 20-29 have special compound forms
const TWENTIES_MASC = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const TWENTIES_FEM = ['veinte', 'veintiuna', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']

const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']

// Irregular hundreds
const HUNDREDS_MASC = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']
const HUNDREDS_FEM = ['', 'cienta', 'doscientas', 'trescientas', 'cuatrocientas', 'quinientas', 'seiscientas', 'setecientas', 'ochocientas', 'novecientas']

// Scale words (compound long scale)
const SCALES = ['millón', 'billón', 'trillón', 'cuatrillón']
const SCALES_PLURAL = ['millones', 'billones', 'trillones', 'cuatrillones']

const THOUSAND = 'mil'
const ZERO = 'cero'
const NEGATIVE = 'menos'
const DECIMAL_SEP = 'punto'

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
 * @param {number} n - Segment value
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish word
 */
function buildSegment (n, feminine) {
  if (n === 0) return ''

  // Special case: exact 100 is "cien" (no gender)
  if (n === 100) return 'cien'

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)
  const tensOnes = n % 100

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    const hundredsArr = feminine ? HUNDREDS_FEM : HUNDREDS_MASC
    parts.push(hundredsArr[hundreds])
  }

  // Tens and ones
  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit
    const onesArr = feminine ? ONES_FEM : ONES_MASC
    parts.push(onesArr[tensOnes])
  } else if (tensOnes < 20) {
    // 10-19: teens
    parts.push(TEENS[ones])
  } else if (tensOnes < 30) {
    // 20-29: special twenties
    const twentiesArr = feminine ? TWENTIES_FEM : TWENTIES_MASC
    parts.push(twentiesArr[ones])
  } else {
    // 30-99: tens y ones
    if (ones === 0) {
      parts.push(TENS[tens])
    } else {
      const onesArr = feminine ? ONES_FEM : ONES_MASC
      parts.push(TENS[tens] + ' y ' + onesArr[ones])
    }
  }

  return parts.join(' ')
}

// Precompute all 1000 segment words (0-999) for masculine
const SEGMENTS_MASC = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS_MASC[i] = buildSegment(i, false)
}

// Precompute all 1000 segment words (0-999) for feminine
const SEGMENTS_FEM = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS_FEM[i] = buildSegment(i, true)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets scale word for Spanish compound long scale.
 *
 * @param {number} scaleIndex - Scale level (1 = thousand, 2 = million, etc.)
 * @param {bigint} segment - Segment value for pluralization
 * @returns {string} Scale word
 */
function getScaleWord (scaleIndex, segment) {
  if (scaleIndex === 1) return THOUSAND

  // Even indices (2, 4, 6, 8): millón, billón, trillón, cuatrillón
  // Odd indices > 1 (3, 5, 7): mil millones, mil billones, mil trillones
  if (scaleIndex % 2 === 0) {
    const arrayIndex = (scaleIndex / 2) - 1
    const baseWord = SCALES[arrayIndex]
    if (!baseWord) return ''
    return segment > 1n ? SCALES_PLURAL[arrayIndex] : baseWord
  } else {
    // Compound: "mil millones" pattern
    const arrayIndex = ((scaleIndex - 1) / 2) - 1
    const pluralWord = SCALES_PLURAL[arrayIndex]
    if (!pluralWord) return THOUSAND
    return THOUSAND + ' ' + pluralWord
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Spanish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish words
 */
function integerToWords (n, feminine) {
  if (n === 0n) return ZERO

  const segments = feminine ? SEGMENTS_FEM : SEGMENTS_MASC

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return segments[Number(n)]
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "mil" not "uno mil"
      result = THOUSAND
    } else {
      // Use masculine for thousands segment, but check for "uno" → omit before mil
      const thousandsWord = SEGMENTS_MASC[thousands]
      // "uno mil" → "mil" (handled in joinSegments equivalent)
      if (thousandsWord === 'uno' || thousandsWord === 'una') {
        result = THOUSAND
      } else {
        result = thousandsWord + ' ' + THOUSAND
      }
    }

    if (remainder > 0) {
      result += ' ' + segments[remainder]
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n, feminine)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish words
 */
function buildLargeNumberWords (n, feminine) {
  // Extract segments using BigInt division (faster than string slicing)
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(temp % 1000n)
    temp = temp / 1000n
  }

  const segments = feminine ? SEGMENTS_FEM : SEGMENTS_MASC

  // Build result string directly
  let result = ''

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0n) continue

    const scaleWord = i > 0 ? getScaleWord(i, segment) : ''

    if (result) result += ' '

    if (i === 0) {
      // Units segment
      result += segments[Number(segment)]
    } else if (i === 1) {
      // Thousands: omit "uno" before mil
      if (segment === 1n) {
        result += THOUSAND
      } else {
        result += SEGMENTS_MASC[Number(segment)] + ' ' + scaleWord
      }
    } else if (i % 2 === 1) {
      // Odd scale indices (3, 5, 7): "mil millones", "mil billones", etc.
      // Omit "uno" before these compound scales
      if (segment === 1n) {
        result += scaleWord
      } else {
        result += SEGMENTS_MASC[Number(segment)] + ' ' + scaleWord
      }
    } else {
      // Even scale indices (2, 4, 6): millón, billón, trillón
      if (segment === 1n) {
        // "un millón" not "uno millón"
        result += 'un ' + scaleWord
      } else {
        // Use masculine for scale segment
        result += SEGMENTS_MASC[Number(segment)] + ' ' + scaleWord
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Spanish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish words for decimal part
 */
function decimalPartToWords (decimalPart, feminine) {
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
    result += integerToWords(BigInt(remainder), feminine)
  }

  return result
}

/**
 * Converts a numeric value to Spanish words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number in Spanish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)                        // 'veintiuno'
 * toWords(21, {gender: 'feminine'})  // 'veintiuna'
 * toWords(1000000)                   // 'un millón'
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)
  const feminine = options.gender === 'feminine'

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, feminine)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, feminine)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }
