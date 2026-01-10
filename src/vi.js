/**
 * Vietnamese language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Vietnamese-specific rules:
 * - Special pronunciation: "lăm" for 5 in tens position, "mốt" for final 1
 * - "Lẻ" (odd/extra) marker when tens place is zero after hundreds/scales
 * - Short scale system with Vietnamese words (nghìn, triệu, tỷ)
 */

import { parseNumericValue } from './utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Base vocabulary for building lookup tables
const ONES = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']

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
// Segment Building
// ============================================================================

/**
 * Builds word for 0-99 with special forms (mốt, lăm).
 */
function buildBelowHundred (n) {
  if (n === 0) return ONES[0]
  if (n < 10) return ONES[n]

  // Teens: 10-19
  if (n < 20) {
    const ones = n - 10
    if (ones === 0) return 'mười'
    if (ones === 5) return 'mười lăm'
    return 'mười ' + ONES[ones]
  }

  // 20-99
  const ones = n % 10
  const tens = Math.floor(n / 10)
  const tensWord = ONES[tens] + ' mươi'

  if (ones === 0) return tensWord
  if (ones === 1) return tensWord + ' ' + MOT_FINAL
  if (ones === 5) return tensWord + ' ' + LAM
  return tensWord + ' ' + ONES[ones]
}

/**
 * Builds segment word for 0-999.
 */
function buildSegment (n) {
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
      if (result) {
        result += ' ' + LE + ' '
        // Use "năm" not "lăm" after lẻ
        result += remainder === 5 ? 'năm' : ONES[remainder]
      } else {
        result = ONES[remainder]
      }
    } else {
      // 10-99 after hundreds
      if (result) result += ' '
      result += buildBelowHundred(remainder)
    }
  }

  return result
}

/**
 * Builds "lẻ" prefixed word for small remainders (1-99) after scale words.
 */
function buildLeSegment (n) {
  if (n === 0) return ''
  if (n < 10) {
    // Use "năm" not "lăm" after lẻ
    return LE + ' ' + (n === 5 ? 'năm' : ONES[n])
  }
  return LE + ' ' + buildBelowHundred(n)
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Vietnamese words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Vietnamese words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 100
  if (n < 100n) {
    return buildBelowHundred(Number(n))
  }

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    const thousandsWords = buildSegment(thousands) + ' ' + SCALES[1]

    if (remainder === 0) {
      return thousandsWords
    }

    // Check if remainder needs "lẻ" marker (< 100)
    if (remainder < 100) {
      return thousandsWords + ' ' + buildLeSegment(remainder)
    }

    return thousandsWords + ' ' + buildSegment(remainder)
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Vietnamese words
 */
function buildLargeNumberWords (n) {
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
      const words = buildSegment(segment)
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
  const partsLen = parts.length
  if (partsLen === 0) return ZERO
  if (partsLen === 1) return parts[0]

  // Check if final segment needs "lẻ" marker (remainder <= 99 after scale word)
  const lastSegment = segments[segments.length - 1]
  if (lastSegment > 0 && lastSegment <= 99) {
    // Last segment is small (no hundreds), needs "lẻ" after scale word
    let result = parts[0]
    for (let i = 1; i < partsLen - 1; i++) {
      result += ' ' + parts[i]
    }
    return result + ' ' + buildLeSegment(lastSegment)
  }

  // Join with spaces
  let result = parts[0]
  for (let i = 1; i < partsLen; i++) {
    result += ' ' + parts[i]
  }
  return result
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
