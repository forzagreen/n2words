/**
 * Greek language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 *
 * Key features:
 * - Space-separated number composition
 * - Implicit "one" (ένα) omission before scale words
 * - Irregular hundreds (διακόσια, τριακόσια, etc.)
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'ένα', 'δύο', 'τρία', 'τέσσερα', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα']

const TEENS = ['δέκα', 'έντεκα', 'δώδεκα', 'δεκατρία', 'δεκατέσσερα', 'δεκαπέντε', 'δεκαέξι', 'δεκαεπτά', 'δεκαοκτώ', 'δεκαεννέα']

const TENS = ['', '', 'είκοσι', 'τριάντα', 'σαράντα', 'πενήντα', 'εξήντα', 'εβδομήντα', 'ογδόντα', 'ενενήντα']

// Greek has irregular hundreds
const HUNDREDS = ['', 'εκατό', 'διακόσια', 'τριακόσια', 'τετρακόσια', 'πεντακόσια', 'εξακόσια', 'επτακόσια', 'οκτακόσια', 'εννιακόσια']

const THOUSAND = 'χίλια'

const ZERO = 'μηδέν'
const NEGATIVE = 'μείον'
const DECIMAL_SEP = 'κόμμα'

// Short scale
const SCALES = ['εκατομμύριο', 'δισεκατομμύριο', 'τρισεκατομμύριο']

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []

  // Hundreds (irregular forms)
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
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
    parts.push(TENS[tens] + ' ' + ONES[ones])
  }

  return parts.join(' ')
}

// Precompute all 1000 segment words (0-999)
const SEGMENTS = new Array(1000)

for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegment(i)
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Greek words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Greek words
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

    // Omit "ένα" before χίλια
    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      result = SEGMENTS[thousands] + ' ' + THOUSAND
    }

    if (remainder > 0) {
      result += ' ' + SEGMENTS[remainder]
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
 * @returns {string} Greek words
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
      const segmentWord = SEGMENTS[segment]

      if (scaleIndex === 0) {
        // Units segment
        parts.push(segmentWord)
      } else if (scaleIndex === 1) {
        // Thousands - omit "ένα" before χίλια
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          parts.push(segmentWord + ' ' + THOUSAND)
        }
      } else {
        // Millions+ - omit "ένα" before scale words
        const scaleWord = SCALES[scaleIndex - 2]
        if (segment === 1) {
          parts.push(scaleWord)
        } else {
          parts.push(segmentWord + ' ' + scaleWord)
        }
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
}

/**
 * Converts decimal digits to Greek words (per-digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Greek words for decimal part
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
 * Converts a numeric value to Greek words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Greek words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)       // 'είκοσι ένα'
 * toWords(1000)     // 'χίλια'
 * toWords('3.14')   // 'τρία κόμμα ένα τέσσερα'
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
