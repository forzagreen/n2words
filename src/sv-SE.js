/**
 * Swedish (Sweden) language converter
 *
 * CLDR: sv-SE | Swedish as used in Sweden
 *
 * Key features:
 * - Hyphenation for tens-ones (tjugo-ett)
 * - "och" after hundreds before small numbers
 * - Omit "ett" before hundra and tusen
 * - Use "en" (not "ett") before million+ scales
 * - Long scale naming with -ard forms
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio']

const TEENS = ['tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton']
const TENS = ['', '', 'tjugo', 'trettio', 'fyrtio', 'femtio', 'sextio', 'sjuttio', 'åttio', 'nittio']

const HUNDRED = 'hundra'

const ZERO = 'noll'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'komma'

// Scale words (long scale with -ard forms)
const SCALES = ['tusen', 'miljon', 'miljard', 'biljon', 'biljard', 'triljon', 'triljard', 'kvadriljon']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * Returns object with word and metadata for "och" logic.
 */
function buildSegment (n) {
  if (n === 0) return { word: '', hasHundred: false, lessThan100: false }

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  const parts = []
  let hasHundred = false

  // Hundreds - omit "ett" before hundra
  if (hundreds > 0) {
    hasHundred = true
    if (hundreds === 1) {
      parts.push(HUNDRED)
    } else {
      parts.push(ONES[hundreds] + ' ' + HUNDRED)
    }
  }

  // Tens and ones with hyphenation
  let tensOnesWord = ''
  if (tens === 1) {
    tensOnesWord = TEENS[ones]
  } else if (tens >= 2) {
    if (ones > 0) {
      tensOnesWord = TENS[tens] + '-' + ONES[ones]
    } else {
      tensOnesWord = TENS[tens]
    }
  } else if (ones > 0) {
    tensOnesWord = ONES[ones]
  }

  // Combine with "och" after hundreds if there's a remainder
  if (hasHundred && tensOnesWord) {
    return { word: parts[0] + ' och ' + tensOnesWord, hasHundred: true, lessThan100: false }
  } else if (hasHundred) {
    return { word: parts[0], hasHundred: true, lessThan100: false }
  } else {
    return { word: tensOnesWord, hasHundred: false, lessThan100: true }
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Swedish words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Swedish words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Omit "ett" before tusen
    let result = thousands === 1 ? SCALES[0] : buildSegment(thousands).word + ' ' + SCALES[0]

    if (remainder > 0) {
      const remainderResult = buildSegment(remainder)
      // Insert "och" if remainder < 100 (doesn't have hundred)
      if (remainderResult.lessThan100) {
        result += ' och ' + remainderResult.word
      } else {
        result += ' ' + remainderResult.word
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
 * @returns {string} Swedish words
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
      const segmentResult = buildSegment(segment)

      if (scaleIndex === 0) {
        // Units segment
        parts.push({
          word: segmentResult.word,
          hasHundred: segmentResult.hasHundred,
          isScale: false
        })
      } else {
        // Segment with scale word
        const scaleWord = SCALES[scaleIndex - 1]

        let segmentWord
        if (segment === 1) {
          // Omit "ett" before tusen, use "en" before million+
          if (scaleIndex === 1) {
            segmentWord = '' // Just "tusen"
          } else {
            segmentWord = 'en' // "en miljon"
          }
        } else {
          segmentWord = segmentResult.word
        }

        if (segmentWord) {
          parts.push({ word: segmentWord, hasHundred: false, isScale: false })
        }
        parts.push({ word: scaleWord, hasHundred: false, isScale: true })
      }
    }

    scaleIndex--
  }

  // Join with Swedish "och" rules
  return joinSwedishParts(parts)
}

/**
 * Joins parts with Swedish "och" rules.
 * Insert "och" before final segment if it follows a scale word and doesn't have "hundra".
 *
 * @param {Array} parts - Parts with metadata
 * @returns {string} Joined string
 */
function joinSwedishParts (parts) {
  if (parts.length === 0) return ZERO
  if (parts.length === 1) return parts[0].word

  const result = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const isLast = i === parts.length - 1

    if (isLast && parts.length > 1) {
      const prevPart = parts[i - 1]
      // Insert "och" if previous was scale and this doesn't have hundred
      if (prevPart.isScale && !part.hasHundred) {
        result.push('och')
      }
    }

    result.push(part.word)
  }

  return result.join(' ')
}

/**
 * Converts decimal digits to Swedish words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Swedish words for decimal part
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
 * Converts a numeric value to Swedish words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Swedish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(42)       // 'fyrtio-två'
 * toCardinal(101)      // 'hundra och ett'
 * toCardinal(1000000)  // 'en miljon'
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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

export { toCardinal }
