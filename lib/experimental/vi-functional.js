/**
 * Vietnamese language converter - Functional Implementation
 *
 * A purely functional, performance-optimized number-to-words converter.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Vietnamese-specific rules:
 * - Special pronunciation: "lăm" for 5 in tens position, "mốt" for final 1
 * - "Lẻ" (odd/extra) marker when tens place is zero after hundreds/scales
 * - Short scale system with Vietnamese words (nghìn, triệu, tỷ)
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Arrays with sequential integer indices for fast lookup
const ONES = [
  'không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'
]

// Teens: 10-19 (index 0 = 10)
const TEENS = [
  'mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn',
  'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'
]

// Tens: index 2-9 for 20-90 (0-1 unused)
const TENS = [
  '', '', 'hai mươi', 'ba mươi', 'bốn mươi',
  'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'
]

// Scale words indexed by scale level (0 = units, 1 = thousands, etc.)
const SCALES = [
  '', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'trăm nghìn tỷ',
  'Quintillion', 'Sextillion', 'Septillion', 'Octillion',
  'Nonillion', 'Decillion', 'Undecillion', 'Duodecillion',
  'Tredecillion', 'Quattuordecillion', 'Sexdecillion',
  'Septendecillion', 'Octodecillion', 'Novemdecillion', 'Vigintillion'
]

const HUNDRED = 'trăm'
const ZERO = 'không'
const NEGATIVE = 'âm'
const DECIMAL_SEP = 'phẩy'
const LE = 'lẻ' // "odd/extra" marker for gaps

// Special forms
const MOT_FINAL = 'mốt' // 1 in tens position (21, 31, etc.)
const LAM = 'lăm' // 5 in tens position (25, 35, etc.)

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a number 0-99 to Vietnamese words.
 * Handles special pronunciation rules for final 1 and 5.
 *
 * @param {number} n - Number between 0 and 99
 * @returns {string} Vietnamese words
 */
function belowHundredToWords (n) {
  if (n < 10) return ONES[n]
  if (n < 20) return TEENS[n - 10]

  const ones = n % 10
  const tens = Math.floor(n / 10)

  if (ones === 0) return TENS[tens]

  // Special forms in tens position
  let onesWord = ONES[ones]
  if (ones === 1) onesWord = MOT_FINAL
  if (ones === 5) onesWord = LAM

  return TENS[tens] + ' ' + onesWord
}

/**
 * Converts a 3-digit segment (0-999) to Vietnamese words.
 * Handles the "lẻ" marker when tens place is zero.
 *
 * @param {number} n - Number between 0 and 999
 * @param {boolean} needsLeMarker - Whether to add "lẻ" for single digits
 * @returns {string} Vietnamese words
 */
function segmentToWords (n, needsLeMarker = false) {
  if (n === 0) return ''

  const hundreds = Math.floor(n / 100)
  const remainder = n % 100

  let result = ''

  if (hundreds > 0) {
    result = ONES[hundreds] + ' ' + HUNDRED
  }

  if (remainder > 0) {
    if (remainder < 10) {
      // Single digit after hundreds needs "lẻ"
      if (result || needsLeMarker) {
        result += (result ? ' ' : '') + LE + ' '
        // Use "năm" not "lăm" after lẻ
        result += remainder === 5 ? 'năm' : ONES[remainder]
      } else {
        result = ONES[remainder]
      }
    } else {
      // 10-99 after hundreds
      if (result) result += ' '
      result += belowHundredToWords(remainder)
    }
  }

  return result
}

/**
 * Converts a non-negative integer to Vietnamese words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Vietnamese words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO
  if (n < 20n) return n < 10n ? ONES[Number(n)] : TEENS[Number(n) - 10]
  if (n < 100n) return belowHundredToWords(Number(n))
  if (n < 1000n) return segmentToWords(Number(n))

  // For numbers >= 1000, use recursive scale decomposition
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
      const words = segmentToWords(segment)
      if (words) {
        if (scaleIndex > 0) {
          parts.push(words + ' ' + SCALES[scaleIndex])
        } else {
          parts.push(words)
        }
      }
    }
    scaleIndex--
  }

  // Join with "lẻ" logic for small remainders
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0]

  // Check if final segment needs "lẻ" marker (remainder <= 99 after scale word)
  const lastSegment = segments[segments.length - 1]
  if (lastSegment > 0 && lastSegment <= 99) {
    // Last segment is small (no hundreds), needs "lẻ" after scale word
    const allButLast = parts.slice(0, -1).join(' ')
    const lastPart = lastSegment < 10
      ? LE + ' ' + (lastSegment === 5 ? 'năm' : ONES[lastSegment])
      : LE + ' ' + belowHundredToWords(lastSegment)
    return allButLast + ' ' + lastPart
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Vietnamese words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Vietnamese words for decimal part
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
 * Converts a numeric value to Vietnamese words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Vietnamese words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(42)           // 'bốn mươi hai'
 * toWords(101)          // 'một trăm lẻ một'
 * toWords(1000000)      // 'một triệu'
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
  TEENS,
  TENS,
  SCALES,
  HUNDRED,
  ZERO,
  LE,
  belowHundredToWords,
  segmentToWords,
  integerToWords,
  decimalPartToWords
}
