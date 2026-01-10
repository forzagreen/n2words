/**
 * Finnish language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Compound tens+ones without spaces: "kaksikymmentäyksi" (21)
 * - Teens with "-toista" suffix
 * - Omit "yksi" before sata/tuhat but keep before miljoona+
 * - Long scale: miljoona, miljardi, biljoona
 * - Per-digit decimal reading
 */

import { parseNumericValue } from './utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän']

const TEENS = ['kymmenen', 'yksitoista', 'kaksitoista', 'kolmetoista', 'neljätoista', 'viisitoista', 'kuusitoista', 'seitsemäntoista', 'kahdeksantoista', 'yhdeksäntoista']

// Tens use "kymmentä" suffix
const TENS = ['', '', 'kaksikymmentä', 'kolmekymmentä', 'neljäkymmentä', 'viisikymmentä', 'kuusikymmentä', 'seitsemänkymmentä', 'kahdeksankymmentä', 'yhdeksänkymmentä']

const HUNDRED = 'sata'
const THOUSAND = 'tuhat'

const ZERO = 'nolla'
const NEGATIVE = 'miinus'
const DECIMAL_SEP = 'pilkku'

// Long scale
const SCALES = ['miljoona', 'miljardi', 'biljoona', 'triljoona']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Omits "yksi" before "sata" (hundred).
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds - omit "yksi" before sata
  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push(HUNDRED)
    } else {
      parts.push(ONES[hundreds] + ' ' + HUNDRED)
    }
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    parts.push(TENS[tens])
  } else {
    // Compound: "kaksikymmentäyksi" (no space)
    parts.push(TENS[tens] + ONES[ones])
  }

  return parts.join(' ')
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Finnish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Finnish words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Omit "yksi" before tuhat
    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      result = buildSegment(thousands) + ' ' + THOUSAND
    }

    if (remainder > 0) {
      result += ' ' + buildSegment(remainder)
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Finnish words
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
      const segmentWord = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment
        parts.push(segmentWord)
      } else if (scaleIndex === 1) {
        // Thousands - omit "yksi" before tuhat
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          parts.push(segmentWord + ' ' + THOUSAND)
        }
      } else {
        // Millions+ - keep "yksi" before scale words
        const scaleWord = SCALES[scaleIndex - 2]
        parts.push(segmentWord + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Finnish words (per-digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Finnish words for decimal part
 */
function decimalPartToWords (decimalPart) {
  const parts = []

  for (const digit of decimalPart) {
    const d = parseInt(digit, 10)
    if (d === 0) {
      parts.push(ZERO)
    } else {
      parts.push(ONES[d])
    }
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Finnish words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Finnish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)       // 'kaksikymmentäyksi'
 * toWords(1000)     // 'tuhat'
 * toWords('3.14')   // 'kolme pilkku yksi neljä'
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
