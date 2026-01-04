/**
 * English language converter - Functional Implementation
 *
 * A purely functional, performance-optimized number-to-words converter.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimizations:
 * - Minimize array allocations in hot paths
 * - Use string concatenation instead of array.join() where possible
 * - Inline small functions to reduce call overhead
 * - Use Set for O(1) scale word lookup instead of Array.includes()
 * - Avoid destructuring that creates intermediate arrays
 * - Inline decimal conversion to eliminate utility overhead
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Arrays with sequential integer indices are faster than object property lookup.
// V8 optimizes dense arrays with packed element kinds and avoids string conversion.

// Index 0 unused, 1-9 map to words (accessed via Number(bigint))
const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'
]

// Index 0-9 map to teen words (10-19)
const TEENS = [
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
  'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
]

// Index 0-1 unused, 2-9 map to tens words
const TENS = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
]

// Scale words indexed by (scaleIndex - 1)
const SCALES = [
  'thousand', 'million', 'billion', 'trillion',
  'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion'
]

// O(1) lookup for scale word detection in joinSegments
const SCALES_SET = new Set(SCALES)

const HUNDRED = 'hundred'
const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'point'

// ============================================================================
// Optimized Conversion Functions
// ============================================================================

/**
 * Converts a 3-digit segment (0-999) to words.
 * Inlines place value extraction and avoids intermediate arrays.
 *
 * @param {bigint} segment - Value between 0 and 999
 * @returns {string} The segment in words, or empty string for 0
 */
function segmentToWords (segment) {
  if (segment === 0n) return ''

  // Inline place value extraction (avoids array allocation)
  // Convert to Number once for array indexing (safe: values are 0-9)
  const ones = Number(segment % 10n)
  const tens = Number((segment / 10n) % 10n)
  const hundreds = Number(segment / 100n)

  let result = ''

  // Hundreds place
  if (hundreds > 0) {
    result = ONES[hundreds] + ' ' + HUNDRED
  }

  // Tens and ones places
  let tensOnesResult = ''

  if (tens === 1) {
    // Teen numbers: 10-19
    tensOnesResult = TEENS[ones]
  } else if (tens > 1) {
    if (ones > 0) {
      // Hyphenated: twenty-three, forty-two, etc.
      tensOnesResult = TENS[tens] + '-' + ONES[ones]
    } else {
      tensOnesResult = TENS[tens]
    }
  } else if (ones > 0) {
    tensOnesResult = ONES[ones]
  }

  // Combine with "and" after hundreds
  if (result && tensOnesResult) {
    return result + ' and ' + tensOnesResult
  }
  return result || tensOnesResult
}

/**
 * Converts a non-negative integer to English words.
 * Optimized to minimize allocations and function calls.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} The number in English words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Inline groupByThrees logic to avoid array allocation for small numbers
  const numStr = n.toString()
  const len = numStr.length

  // Fast path for numbers < 1000 (no scale words needed)
  if (len <= 3) {
    return segmentToWords(n)
  }

  // Build segments inline
  const segments = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segments.push(BigInt(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segments.push(BigInt(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (segment !== 0n) {
      const words = segmentToWords(segment)
      if (words) parts.push(words)

      if (scaleIndex > 0) {
        const scaleWord = SCALES[scaleIndex - 1]
        if (scaleWord) parts.push(scaleWord)
      }
    }
    scaleIndex--
  }

  // Join segments with "and" logic
  if (parts.length <= 1) return parts[0] || ''

  const lastPart = parts[parts.length - 1]
  const secondLastPart = parts[parts.length - 2]

  // O(1) lookup instead of Array.includes()
  const isSecondLastScale = SCALES_SET.has(secondLastPart)
  const lastContainsHundred = lastPart.indexOf(HUNDRED) !== -1

  if (isSecondLastScale && !lastContainsHundred) {
    // Insert "and" before final segment
    let result = ''
    for (let i = 0; i < parts.length - 1; i++) {
      if (result) result += ' '
      result += parts[i]
    }
    return result + ' and ' + lastPart
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to words (inlined for performance).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Words for decimal part
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
 * toWords(-3.14)        // 'minus three point fourteen'
 * toWords('1000000')    // 'one million'
 * toWords(9007199254740991n) // 'nine quadrillion...'
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

// Main public API - accepts NumericValue, handles parsing internally
export { toWords }

// Named exports for testing and advanced use
export {
  ONES,
  TEENS,
  TENS,
  SCALES,
  HUNDRED,
  ZERO,
  segmentToWords,
  integerToWords,
  decimalPartToWords
}
