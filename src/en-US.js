/**
 * American English language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * American English conventions:
 * - No "and" after hundreds: "one hundred twenty-three"
 * - No "and" before final segment: "one million one"
 * - Hyphenated tens-ones: "twenty-one", "forty-two"
 * - Western numbering system (short scale: billion = 10^9)
 * - Optional hundred-pairing: 1500 → "fifteen hundred" (colloquial)
 */

import { parseNumericValue } from './utils/parse-numeric.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

const SCALES = [
  'thousand', 'million', 'billion', 'trillion', 'quadrillion',
  'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion',
  'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
  'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion',
  'vigintillion'
]

const HUNDRED = 'hundred'
const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'point'

// ============================================================================
// Segment Building
// ============================================================================

// Reusable result object to avoid allocation per call
const segmentResult = { word: '', hasHundred: false }

/**
 * Builds words for a 0-999 segment.
 *
 * @param {number} n - Number 0-999
 * @returns {{ word: string, hasHundred: boolean }}
 */
function buildSegment (n) {
  if (n === 0) {
    segmentResult.word = ''
    segmentResult.hasHundred = false
    return segmentResult
  }

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  // Build tens-ones part first
  let tensOnes = ''
  if (tens === 1) {
    tensOnes = TEENS[ones]
  } else if (tens >= 2) {
    tensOnes = ones > 0 ? TENS[tens] + '-' + ONES[ones] : TENS[tens]
  } else if (ones > 0) {
    tensOnes = ONES[ones]
  }

  // Hundreds place
  if (hundreds > 0) {
    if (tensOnes) {
      segmentResult.word = ONES[hundreds] + ' ' + HUNDRED + ' ' + tensOnes
    } else {
      segmentResult.word = ONES[hundreds] + ' ' + HUNDRED
    }
    segmentResult.hasHundred = true
  } else {
    segmentResult.word = tensOnes
    segmentResult.hasHundred = false
  }

  return segmentResult
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to English words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {boolean} hundredPairing - Use hundred-pairing for 1100-9900
 * @returns {string} English words
 */
function integerToWords (n, hundredPairing) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  // Hundred-pairing: 1100-9999 → "eleven hundred" to "ninety-nine hundred ninety-nine"
  if (hundredPairing && n >= 1100n && n <= 9999n) {
    const num = Number(n)
    const highPart = Math.trunc(num / 100)
    const lowPart = num % 100

    const { word: highWord } = buildSegment(highPart)
    let result = highWord + ' ' + HUNDRED

    if (lowPart > 0) {
      const { word: lowWord } = buildSegment(lowPart)
      result += ' ' + lowWord
    }

    return result
  }

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    const { word: thousandsWord } = buildSegment(thousands)
    let result = thousandsWord + ' ' + SCALES[0]

    if (remainder > 0) {
      const { word: remainderWord } = buildSegment(remainder)
      result += ' ' + remainderWord
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
  // Extract segments using BigInt division
  // Segments are stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string (process from most-significant to least)
  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const { word } = buildSegment(segment)

    // Add segment word
    if (result) result += ' '
    result += word

    // Add scale word (i=0 is units, i=1 is thousands, etc.)
    if (i > 0) {
      result += ' ' + SCALES[i - 1]
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
 * Converts a numeric value to American English words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.hundredPairing=false] - Use hundred-pairing for 1100-9900 (e.g., "fifteen hundred" instead of "one thousand five hundred")
 * @returns {string} The number in American English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(42)                            // 'forty-two'
 * toWords(1500)                          // 'one thousand five hundred'
 * toWords(1500, { hundredPairing: true }) // 'fifteen hundred'
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // Extract options with defaults
  const { hundredPairing = false } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, hundredPairing)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }
