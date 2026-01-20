/**
 * Portuguese language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Portuguese-specific rules:
 * - "e" conjunction everywhere: vinte e um, cento e um, mil e um
 * - "cem" for exact 100, "cento" for 100+ remainder
 * - Irregular hundreds: duzentos, trezentos, quatrocentos, etc.
 * - Compound scale: milhão (10^6), mil milhões (10^9), bilião (10^12)
 * - Omit "um" before "mil"
 */

import { parseNumericValue } from './utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const TEENS = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove']
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']

// Irregular hundreds
const HUNDREDS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

const THOUSAND = 'mil'
const ZERO = 'zero'
const NEGATIVE = 'menos'
const DECIMAL_SEP = 'vírgula'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 with Portuguese "e" rules.
 * Returns the word and whether it's an exact hundred (for "cem" handling).
 */
function buildSegment (n) {
  if (n === 0) return { word: '', isExactHundred: false }

  // Special case: exact 100 is "cem"
  if (n === 100) return { word: 'cem', isExactHundred: true }

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
  } else if (tens >= 2) {
    if (ones > 0) {
      // Tens + ones with "e": "vinte e um"
      parts.push(TENS[tens] + ' e ' + ONES[ones])
    } else {
      parts.push(TENS[tens])
    }
  } else if (ones > 0) {
    parts.push(ONES[ones])
  }

  // Join hundreds with "e": "cento e um", "duzentos e trinta e um"
  const word = parts.join(' e ')

  return { word, isExactHundred: hundreds > 0 && tens === 0 && ones === 0, startsWithHundreds: n >= 100 }
}

// ============================================================================
// Scale Word Lookup
// ============================================================================

// Precompute scale words for singular and plural forms
// Index 1 = thousands, 2 = millions, 3 = billions (mil milhões), etc.
const SCALE_WORDS_SINGULAR = [
  '', // 0 unused
  THOUSAND, // 1: mil
  'milhão', // 2: 10^6
  'mil milhões', // 3: 10^9 (compound)
  'bilião', // 4: 10^12
  'mil biliões', // 5: 10^15 (compound)
  'trilião', // 6: 10^18
  'mil triliões', // 7: 10^21 (compound)
  'quatrilião' // 8: 10^24
]

const SCALE_WORDS_PLURAL = [
  '', // 0 unused
  THOUSAND, // 1: mil (same)
  'milhões', // 2: 10^6
  'mil milhões', // 3: 10^9 (compound, same)
  'biliões', // 4: 10^12
  'mil biliões', // 5: 10^15 (compound, same)
  'triliões', // 6: 10^18
  'mil triliões', // 7: 10^21 (compound, same)
  'quatriliões' // 8: 10^24
]

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Portuguese words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Portuguese words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "mil" not "um mil"
      result = THOUSAND
    } else {
      result = buildSegment(thousands).word + ' ' + THOUSAND
    }

    if (remainder > 0) {
      const remainderResult = buildSegment(remainder)
      // Insert "e" before remainder if it doesn't start with hundreds (< 100)
      if (!remainderResult.startsWithHundreds) {
        result += ' e ' + remainderResult.word
      } else {
        result += ' ' + remainderResult.word
      }
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
 * @returns {string} Portuguese words
 */
function buildLargeNumberWords (n) {
  // Extract segments using BigInt division
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the first non-zero segment index (lowest scale with value)
  let firstNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      firstNonZeroIdx = i
      break
    }
  }

  // Build result string directly
  let result = ''
  let prevWasScale = false

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const segmentResult = buildSegment(segment)
    const isLastSegment = (i === firstNonZeroIdx)

    // Add "e" before final segment if previous was scale and this doesn't start with hundreds
    if (result && isLastSegment && prevWasScale && !segmentResult.startsWithHundreds) {
      result += ' e'
    }

    if (result) result += ' '

    if (i === 0) {
      // Units segment
      result += segmentResult.word
      prevWasScale = false
    } else if (i === 1) {
      // Thousands
      if (segment === 1) {
        result += THOUSAND
      } else {
        result += segmentResult.word + ' ' + THOUSAND
      }
      prevWasScale = true
    } else {
      // Million and above - use scale arrays
      const scaleWord = segment === 1 ? SCALE_WORDS_SINGULAR[i] : SCALE_WORDS_PLURAL[i]
      if (segment === 1) {
        result += 'um ' + scaleWord
      } else {
        result += segmentResult.word + ' ' + scaleWord
      }
      prevWasScale = true
    }
  }

  return result
}

/**
 * Converts decimal digits to Portuguese words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Portuguese words for decimal part
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
 * Converts a numeric value to Portuguese words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Portuguese words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)           // 'vinte e um'
 * toCardinal(100)          // 'cem'
 * toCardinal(1000000)      // 'um milhão'
 */
function toCardinal (value) {
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

export { toCardinal }
