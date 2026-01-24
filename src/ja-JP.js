/**
 * Japanese (Japan) language converter
 *
 * CLDR: ja-JP | Japanese as used in Japan
 *
 * Japanese-specific rules:
 * - Myriad (万-based) grouping: 4 digits per segment instead of 3
 * - 一 omission: Omit "一" before 十, 百, 千 but NOT before 万 and higher scales
 * - Kanji numerals: 零一二三四五六七八九
 * - No spaces between characters
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Ones words (1-9), index 0 unused
const ONES = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

// Scale words for powers of 10,000 (万-based system)
// Index 0 = 万 (10^4), 1 = 億 (10^8), 2 = 兆 (10^12), etc.
const SCALES = [
  '万', // 10^4 (man)
  '億', // 10^8 (oku)
  '兆', // 10^12 (chō)
  '京', // 10^16 (kei)
  '垓', // 10^20 (gai)
  '秭', // 10^24 (jo/shi)
  '穣', // 10^28 (jō)
  '溝', // 10^32 (kō)
  '澗', // 10^36 (kan)
  '正', // 10^40 (sei)
  '載', // 10^44 (sai)
  '極', // 10^48 (goku)
  '恒河沙', // 10^52 (gōgasha)
  '阿僧祇', // 10^56 (asōgi)
  '那由他', // 10^60 (nayuta)
  '不可思議', // 10^64 (fukashigi)
  '無量大数' // 10^68 (muryōtaisū)
]

const ZERO = '零'
const NEGATIVE = 'マイナス'
const DECIMAL_SEP = '点'

// Internal scale words (within 4-digit segments)
const TEN = '十'
const HUNDRED = '百'
const THOUSAND = '千'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-9999 with 一 omission rules.
 * - Omit 一 before 十, 百, 千
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100) % 10
  const thousands = Math.floor(n / 1000)

  let result = ''

  // Thousands (千) - omit 一 when 1
  if (thousands > 0) {
    if (thousands === 1) {
      result += THOUSAND
    } else {
      result += ONES[thousands] + THOUSAND
    }
  }

  // Hundreds (百) - omit 一 when 1
  if (hundreds > 0) {
    if (hundreds === 1) {
      result += HUNDRED
    } else {
      result += ONES[hundreds] + HUNDRED
    }
  }

  // Tens (十) - omit 一 when 1
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

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Japanese words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Japanese kanji words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 10000
  if (n < 10000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 100,000,000 (万 range)
  if (n < 100_000_000n) {
    const man = Number(n / 10000n)
    const remainder = Number(n % 10000n)

    // For 万 and above, we need 一 before the scale word when segment is 1
    let result
    if (man === 1) {
      result = '一' + SCALES[0] // 一万
    } else {
      result = buildSegment(man) + SCALES[0]
    }

    if (remainder > 0) {
      result += buildSegment(remainder)
    }

    return result
  }

  // For numbers >= 100,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 100,000,000.
 * Uses BigInt modulo for 4-digit (myriad) segment extraction.
 *
 * @param {bigint} n - Number >= 100,000,000
 * @returns {string} Japanese kanji words
 */
function buildLargeNumberWords (n) {
  // Extract segments using BigInt modulo (faster than string slicing)
  // Segments stored least-significant first (index 0 = units, 1 = 万, etc.)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 10000n))
    temp = temp / 10000n
  }

  // Build result string directly (process from most-significant to least)
  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (i > 0) {
      // For scales >= 万, we need 一 before scale word when segment is 1
      if (segment === 1) {
        result += '一' + SCALES[i - 1]
      } else {
        result += buildSegment(segment) + SCALES[i - 1]
      }
    } else {
      // Units segment (no scale word)
      result += buildSegment(segment)
    }
  }

  return result || ZERO
}

/**
 * Converts decimal digits to Japanese words (digit by digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Japanese kanji words for decimal part
 */
function decimalPartToWords (decimalPart) {
  let result = ''

  for (let i = 0; i < decimalPart.length; i++) {
    const digit = parseInt(decimalPart[i], 10)
    if (digit === 0) {
      result += ZERO
    } else {
      result += ONES[digit]
    }
  }

  return result
}

/**
 * Converts a numeric value to Japanese words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Japanese kanji words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)           // '四十二'
 * toCardinal(10000)        // '一万'
 * toCardinal(100000000)    // '一億'
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    result += DECIMAL_SEP + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal }
