/**
 * Norwegian Bokmål language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 *
 * Key features:
 * - Hyphenated tens+ones: "tjue-en" (21)
 * - "og" conjunction after hundreds
 * - Comma separator after thousands before hundreds
 * - Short scale: million, milliard, billion, etc.
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'en', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'åtte', 'ni']

const TEENS = ['ti', 'elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten', 'nitten']
const TENS = ['', '', 'tjue', 'tretti', 'førti', 'femti', 'seksti', 'sytti', 'åtti', 'nitti']

const HUNDRED = 'hundre'
const THOUSAND = 'tusen'

const ZERO = 'null'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'komma'

// Short scale: million, milliard, billion, etc.
const SCALES = ['million', 'milliard', 'billion', 'billiard', 'kvintillion', 'sekstillion', 'septillion', 'oktillion']

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Returns object with word and hasHundred flag.
 */
function buildSegment (n) {
  if (n === 0) return { word: '', hasHundred: false }

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []
  let hasHundred = false

  // Hundreds: "en hundre", "to hundre"
  if (hundreds > 0) {
    hasHundred = true
    parts.push(ONES[hundreds] + ' ' + HUNDRED)
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    // Teens
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    // Even tens
    parts.push(TENS[tens])
  } else {
    // Hyphenated: "tjue-en"
    parts.push(TENS[tens] + '-' + ONES[ones])
  }

  // Combine with " og " between hundreds and remainder
  if (parts.length === 2) {
    return { word: parts[0] + ' og ' + parts[1], hasHundred: true }
  }
  return { word: parts[0] || '', hasHundred }
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
 * Converts a non-negative integer to Norwegian Bokmål words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Norwegian words
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

    let result = SEGMENTS[thousands] + ' ' + THOUSAND

    if (remainder > 0) {
      // Comma before hundreds, " og " before small numbers
      if (SEGMENTS_HAS_HUNDRED[remainder]) {
        result += ', ' + SEGMENTS[remainder]
      } else {
        result += ' og ' + SEGMENTS[remainder]
      }
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
 * @returns {string} Norwegian words
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
      const hasHundred = SEGMENTS_HAS_HUNDRED[segment]

      if (scaleIndex === 0) {
        // Units segment
        parts.push({ word: segmentWord, hasHundred, type: 'units' })
      } else if (scaleIndex === 1) {
        // Thousands
        parts.push({ word: segmentWord + ' ' + THOUSAND, hasHundred: false, type: 'thousand' })
      } else {
        // Millions+
        const scaleWord = SCALES[scaleIndex - 2]
        parts.push({ word: segmentWord + ' ' + scaleWord, hasHundred: false, type: 'million' })
      }
    }

    scaleIndex--
  }

  // Join parts with Norwegian rules
  return joinNorwegianParts(parts)
}

/**
 * Joins parts with Norwegian spacing and comma rules.
 *
 * @param {Array} parts - Parts with type metadata
 * @returns {string} Joined string
 */
function joinNorwegianParts (parts) {
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0].word

  const result = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const nextPart = parts[i + 1]

    result.push(part.word)

    if (nextPart) {
      if (part.type === 'thousand') {
        // After thousands: comma if next has hundred, else " og "
        if (nextPart.hasHundred) {
          result.push(', ')
        } else {
          result.push(' og ')
        }
      } else if (part.type === 'million') {
        // After millions: " og " for units without hundred, space otherwise
        if (nextPart.type === 'units' && !nextPart.hasHundred) {
          result.push(' og ')
        } else {
          result.push(' ')
        }
      } else {
        result.push(' ')
      }
    }
  }

  return result.join('')
}

/**
 * Converts decimal digits to Norwegian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Norwegian words for decimal part
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
 * Converts a numeric value to Norwegian Bokmål words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Norwegian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)       // 'tjue-en'
 * toWords(101)      // 'en hundre og en'
 * toWords(1000000)  // 'en million'
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
