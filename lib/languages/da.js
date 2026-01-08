/**
 * Danish language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Vigesimal (base-20) tens naming: halvtreds (50), treds (60), etc.
 * - Units-before-tens: "enogtyve" (21) = one-and-twenty
 * - Compound thousands: "ettusind", "firetusinde"
 * - "og" conjunction after hundreds and thousands
 * - Long scale for millions+
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'et', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'otte', 'ni']
// "en" form used in vigesimal pattern (X og Y) and before millions
const ONES_VIGESIMAL = ['', 'en', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'otte', 'ni']

const TEENS = ['ti', 'elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten', 'nitten']

// Danish vigesimal tens (base-20 derived names)
const TENS = ['', '', 'tyve', 'tredive', 'fyrre', 'halvtreds', 'treds', 'halvfjerds', 'firs', 'halvfems']

const HUNDRED = 'hundrede'
const THOUSAND = 'tusind'

const ZERO = 'nul'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'komma'

// Long scale: millioner, millarder, billioner, etc.
const SCALES = ['millioner', 'millarder', 'billioner', 'billarder', 'trillioner', 'trillarder', 'quadrillioner', 'quadrillarder']

// ============================================================================
// Segment Building
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

  // Hundreds: "ethundrede", "tohundrede" (compound, no space)
  if (hundreds > 0) {
    parts.push(ONES[hundreds] + HUNDRED)
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
    // Units-before-tens: "enogtyve", "treogfyrre"
    parts.push(ONES_VIGESIMAL[ones] + 'og' + TENS[tens])
  }

  // Combine with " og " between hundreds and remainder
  if (parts.length === 2) {
    return parts[0] + ' og ' + parts[1]
  }
  return parts[0] || ''
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Danish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Danish words
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

    // Compound thousands: "ettusind", "firetusind"
    let result = buildSegment(thousands) + THOUSAND

    if (remainder > 0) {
      // Add 'e' suffix and " og " for remainder: "firetusinde og ..."
      result += 'e og ' + buildSegment(remainder)
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
 * @returns {string} Danish words
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

  // Convert segments to words with scale tracking
  // scaleIndex: 0 = units, 1 = thousands, 2 = millions, etc.
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const segmentWord = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment
        parts.push({ word: segmentWord, type: 'units' })
      } else if (scaleIndex === 1) {
        // Thousands - compound form
        parts.push({ word: segmentWord + THOUSAND, type: 'thousand' })
      } else {
        // Millions+ - space-separated, use "en" for 1
        const scaleWord = SCALES[scaleIndex - 2]
        let numWord = segmentWord
        // "et" → "en" before millions+
        if (segment === 1) {
          numWord = 'en'
        }
        parts.push({ word: numWord + ' ' + scaleWord, type: 'million' })
      }
    }

    scaleIndex--
  }

  // Join parts with Danish rules
  return joinDanishParts(parts)
}

/**
 * Joins parts with Danish spacing rules.
 * - After thousands with remainder: "tusinde og"
 * - Millions are space-separated
 *
 * @param {Array} parts - Parts with type metadata
 * @returns {string} Joined string
 */
function joinDanishParts (parts) {
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0].word

  const result = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const nextPart = parts[i + 1]

    if (part.type === 'thousand' && nextPart && nextPart.type === 'units') {
      // Thousands followed by units: add "e og"
      result.push(part.word + 'e og ' + nextPart.word)
      i++ // Skip the units part
    } else if (part.type === 'million') {
      if (result.length > 0) {
        result.push(' ')
      }
      result.push(part.word)
      if (nextPart) {
        result.push(' ')
      }
    } else {
      if (result.length > 0 && !result[result.length - 1].endsWith(' ')) {
        result.push(' ')
      }
      result.push(part.word)
    }
  }

  return result.join('')
}

/**
 * Converts decimal digits to Danish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Danish words for decimal part
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
 * Converts a numeric value to Danish words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Danish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)       // 'enogtyve'
 * toWords(1000)     // 'ettusind'
 * toWords(1000000)  // 'en millioner'
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
