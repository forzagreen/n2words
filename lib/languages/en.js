/**
 * English language converter - Functional Implementation v2
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * English-specific rules (handled in precomputation):
 * - "and" after hundreds: "one hundred and twenty-three"
 * - Hyphenated tens-ones: "twenty-one", "forty-two"
 * - "and" before final segment when following scale word
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

const SCALES = ['thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion']

const HUNDRED = 'hundred'
const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'point'

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Returns object with word and whether it contains "hundred" (for "and" logic).
 */
function buildSegment (n) {
  if (n === 0) return { word: '', hasHundred: false }

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''
  let hasHundred = false

  // Hundreds
  if (hundreds > 0) {
    result = ONES[hundreds] + ' ' + HUNDRED
    hasHundred = true
  }

  // Tens and ones
  let tensOnes = ''
  if (tens === 1) {
    tensOnes = TEENS[ones]
  } else if (tens >= 2) {
    if (ones > 0) {
      tensOnes = TENS[tens] + '-' + ONES[ones]
    } else {
      tensOnes = TENS[tens]
    }
  } else if (ones > 0) {
    tensOnes = ONES[ones]
  }

  // Combine with "and" after hundreds
  if (result && tensOnes) {
    return { word: result + ' and ' + tensOnes, hasHundred: true }
  }

  return { word: result || tensOnes, hasHundred }
}

// Precompute all 1000 segment words (0-999)
const SEGMENTS = new Array(1000)
const SEGMENTS_HAS_HUNDRED = new Array(1000)

for (let i = 0; i < 1000; i++) {
  const result = buildSegment(i)
  SEGMENTS[i] = result.word
  SEGMENTS_HAS_HUNDRED[i] = result.hasHundred
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to English words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} English words
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

    let result = SEGMENTS[thousands] + ' ' + SCALES[0]

    if (remainder > 0) {
      const remainderWord = SEGMENTS[remainder]
      // Insert "and" if remainder doesn't have hundred
      if (!SEGMENTS_HAS_HUNDRED[remainder]) {
        result += ' and ' + remainderWord
      } else {
        result += ' ' + remainderWord
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
 * @returns {string} English words
 */
function buildLargeNumberWords (n) {
  // Extract segments using BigInt division (faster than string slicing)
  // Segments are stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the first (smallest index) non-zero segment - this is processed last
  let firstNonZeroIdx = -1
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      firstNonZeroIdx = i
      break
    }
  }

  // Build result string directly (avoids intermediate object allocations)
  // Process from most-significant (end) to least-significant (start)
  let result = ''
  let prevWasScale = false

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const segmentWord = SEGMENTS[segment]
    const hasHundred = SEGMENTS_HAS_HUNDRED[segment]
    const isLastSegment = (i === firstNonZeroIdx)

    // Add "and" only before FINAL segment if it follows scale and doesn't have hundred
    if (result && isLastSegment && prevWasScale && !hasHundred) {
      result += ' and'
    }

    // Add segment word
    if (result) result += ' '
    result += segmentWord

    // Add scale word (i=0 is units, i=1 is thousands, etc.)
    if (i > 0) {
      result += ' ' + SCALES[i - 1]
      prevWasScale = true
    } else {
      prevWasScale = false
    }
  }

  return result
}

/**
 * Converts decimal digits to English words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} English words for decimal part
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
 * Converts a numeric value to English words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(42)           // 'forty-two'
 * toWords(-3.14)        // 'minus three point one four'
 * toWords('1000000')    // 'one million'
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
