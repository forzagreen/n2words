/**
 * Korean language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 *
 * Key features:
 * - Myriad-based (만) grouping - 4 digits
 * - Implicit '일' (one) omission before scale words
 * - Space separation after 만+ scales
 * - Hangul numerals
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

const TEN = '십'
const HUNDRED = '백'
const THOUSAND = '천'

const ZERO = '영'
const NEGATIVE = '마이너스'
const DECIMAL_SEP = '점'

// Myriad scale words (powers of 10,000)
// 만 (10^4), 억 (10^8), 조 (10^12), 경 (10^16), etc.
const SCALES = ['만', '억', '조', '경', '해', '자', '양']

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-9999 (4-digit myriad segment).
 * Korean omits "일" before 십, 백, 천.
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100) % 10
  const thousands = Math.floor(n / 1000)

  let result = ''

  // Thousands
  if (thousands > 0) {
    if (thousands === 1) {
      result += THOUSAND
    } else {
      result += ONES[thousands] + THOUSAND
    }
  }

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      result += HUNDRED
    } else {
      result += ONES[hundreds] + HUNDRED
    }
  }

  // Tens
  if (tens > 0) {
    if (tens === 1) {
      result += TEN
    } else {
      result += ONES[tens] + TEN
    }
  }

  // Ones
  if (ones > 0) {
    result += ONES[ones]
  }

  return result
}

// Precompute all 10000 segment words (0-9999) for myriad grouping
const SEGMENTS = new Array(10000)

for (let i = 0; i < 10000; i++) {
  SEGMENTS[i] = buildSegment(i)
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Korean words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Korean words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 10000 (direct lookup)
  if (n < 10000n) {
    return SEGMENTS[Number(n)]
  }

  // For numbers >= 10000, use myriad decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 10000.
 * Uses myriad (만) grouping - 4 digits per segment.
 *
 * @param {bigint} n - Number >= 10000
 * @returns {string} Korean words
 */
function buildLargeNumberWords (n) {
  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 4 digits from right to left
  const segments = []
  const segmentSize = 4

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
      if (scaleIndex === 0) {
        // Units segment (no scale word)
        parts.push({ word: SEGMENTS[segment], isScale: false })
      } else {
        // Segment with scale word
        const scaleWord = SCALES[scaleIndex - 1]

        // Korean omits segment when it's 1 before scale words
        if (segment === 1) {
          parts.push({ word: scaleWord, isScale: true })
        } else {
          parts.push({ word: SEGMENTS[segment], isScale: false })
          parts.push({ word: scaleWord, isScale: true })
        }
      }
    }

    scaleIndex--
  }

  // Join with Korean spacing rules
  return joinKoreanParts(parts)
}

/**
 * Joins parts with Korean spacing rules.
 * - Concatenate without spaces within segments
 * - Space after scale words before next number
 *
 * @param {Array} parts - Parts with isScale metadata
 * @returns {string} Joined string
 */
function joinKoreanParts (parts) {
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0].word

  const result = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const prevPart = i > 0 ? parts[i - 1] : null

    // Add space after scale words before next number
    if (prevPart && prevPart.isScale && !part.isScale) {
      result.push(' ')
    }

    result.push(part.word)
  }

  return result.join('')
}

/**
 * Converts decimal digits to Korean words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Korean words for decimal part (space-separated)
 */
function decimalPartToWords (decimalPart) {
  const parts = []

  // Handle leading zeros
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    parts.push(ZERO)
    i++
  }

  // Convert remainder as a single number
  const remainder = decimalPart.slice(i)
  if (remainder) {
    parts.push(integerToWords(BigInt(remainder)))
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Korean words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Korean words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)         // '이십일'
 * toWords(10000)      // '만'
 * toWords(1000000)    // '백만'
 */
function toWords (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  const parts = []

  if (isNegative) {
    parts.push(NEGATIVE)
  }

  parts.push(integerToWords(integerPart))

  if (decimalPart) {
    parts.push(DECIMAL_SEP)
    parts.push(decimalPartToWords(decimalPart))
  }

  return parts.join(' ')
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }

// Named exports for testing
export {
  ONES,
  TEN,
  HUNDRED,
  THOUSAND,
  SCALES,
  ZERO,
  SEGMENTS,
  integerToWords,
  decimalPartToWords
}
