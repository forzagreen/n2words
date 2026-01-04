/**
 * English language converter - Functional Implementation (Proof of Concept)
 *
 * This is an experimental purely functional approach to number-to-words conversion.
 * Compare with the class-based en.js implementation.
 *
 * Key differences from class-based approach:
 * - No classes or inheritance
 * - Pure functions with explicit data flow
 * - Vocabulary as module-level constants (closed over)
 * - Composable conversion pipeline
 *
 * The public API boundary (n2words.js) handles input validation/normalization,
 * so this module exports `toWords(isNegative, integerPart, decimalPart)` directly.
 */

import { groupByThrees, placeValues } from '../utils/segment-utils.js'
import { decimalToWords } from '../utils/scale-utils.js'

// ============================================================================
// Vocabulary (module-level constants, closed over by functions)
// ============================================================================

const ONES = Object.freeze({
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine'
})

const TEENS = Object.freeze({
  0: 'ten',
  1: 'eleven',
  2: 'twelve',
  3: 'thirteen',
  4: 'fourteen',
  5: 'fifteen',
  6: 'sixteen',
  7: 'seventeen',
  8: 'eighteen',
  9: 'nineteen'
})

const TENS = Object.freeze({
  2: 'twenty',
  3: 'thirty',
  4: 'forty',
  5: 'fifty',
  6: 'sixty',
  7: 'seventy',
  8: 'eighty',
  9: 'ninety'
})

const SCALES = Object.freeze([
  'thousand',
  'million',
  'billion',
  'trillion',
  'quadrillion',
  'quintillion',
  'sextillion',
  'septillion',
  'octillion'
])

const HUNDRED = 'hundred'
const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'point'
const WORD_SEP = ' '

// ============================================================================
// Pure Conversion Functions
// ============================================================================

/**
 * Converts hundreds digit to words.
 *
 * @param {bigint} hundreds - The hundreds digit (1-9)
 * @returns {string} e.g., "one hundred", "five hundred"
 */
function hundredsToWords (hundreds) {
  return `${ONES[hundreds]} ${HUNDRED}`
}

/**
 * Combines segment parts with English hyphenation and "and" rules.
 *
 * English rules:
 * - Hyphenate twenty-one through ninety-nine (except tens)
 * - Insert "and" after hundreds before tens/ones
 *
 * @param {string[]} parts - Word parts from segment conversion
 * @param {bigint} segment - Original segment value (for rule decisions)
 * @returns {string} Combined words with proper formatting
 */
function combineSegmentParts (parts, segment) {
  if (parts.length === 0) return ''

  const tensOnes = segment % 100n
  const hasHundreds = segment >= 100n

  if (hasHundreds) {
    const [hundredsPart, ...tensOnesParts] = parts
    let tensOnesPart = ''

    if (tensOnesParts.length === 2 && tensOnes > 20n) {
      // Hyphenate: "twenty-three", "forty-two", etc.
      tensOnesPart = `${tensOnesParts[0]}-${tensOnesParts[1]}`
    } else {
      tensOnesPart = tensOnesParts.join(WORD_SEP)
    }

    // "and" after hundreds if there's a remainder
    return tensOnesPart
      ? `${hundredsPart} and ${tensOnesPart}`
      : hundredsPart
  }

  // No hundreds - just handle hyphenation for tens+ones
  if (parts.length === 2 && tensOnes > 20n) {
    return `${parts[0]}-${parts[1]}`
  }
  return parts.join(WORD_SEP)
}

/**
 * Converts a 3-digit segment (0-999) to words.
 *
 * @param {bigint} segment - Value between 0 and 999
 * @returns {string} The segment in words, or empty string for 0
 */
function segmentToWords (segment) {
  if (segment === 0n) return ''

  const [ones, tens, hundreds] = placeValues(segment)
  const parts = []

  // Hundreds place
  if (hundreds > 0n) {
    parts.push(hundredsToWords(hundreds))
  }

  // Tens and ones places
  if (tens === 1n) {
    // Teen numbers: 10-19
    parts.push(TEENS[ones])
  } else {
    if (tens > 1n) {
      parts.push(TENS[tens])
    }
    if (ones > 0n) {
      parts.push(ONES[ones])
    }
  }

  return combineSegmentParts(parts, segment)
}

/**
 * Gets scale word for a given index.
 *
 * @param {number} scaleIndex - 1=thousand, 2=million, 3=billion, etc.
 * @returns {string} The scale word, or empty string if out of range
 */
function scaleWordForIndex (scaleIndex) {
  return SCALES[scaleIndex - 1] || ''
}

/**
 * Joins segment parts with "and" before final small segment when needed.
 *
 * English uses "and" before the final segment if:
 * - The final segment is < 100 (doesn't contain "hundred")
 * - There's a scale word immediately before it
 *
 * Examples:
 * - "one thousand and one"
 * - "one million and fifty"
 * - "one million one hundred" (no "and" - has hundred)
 *
 * @param {string[]} parts - Converted segment and scale word parts
 * @returns {string} Joined string with proper "and" placement
 */
function joinSegments (parts) {
  if (parts.length <= 1) return parts.join(WORD_SEP)

  const lastPart = parts.at(-1)
  const secondLastPart = parts.at(-2)

  // Insert "and" if a scale word precedes a non-hundred segment
  const isSecondLastScale = SCALES.includes(secondLastPart)
  const lastContainsHundred = lastPart.includes(HUNDRED)

  if (isSecondLastScale && !lastContainsHundred) {
    return [...parts.slice(0, -1), 'and', lastPart].join(WORD_SEP)
  }

  return parts.join(WORD_SEP)
}

/**
 * Converts a non-negative integer to English words.
 *
 * Algorithm:
 * 1. Split number into 3-digit segments (groupByThrees)
 * 2. Convert each segment to words
 * 3. Append appropriate scale word (thousand, million, etc.)
 * 4. Join with proper "and" placement
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} The number in English words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  const segments = groupByThrees(n.toString())
  const parts = []
  let scaleIndex = segments.length - 1

  for (const segment of segments) {
    if (segment !== 0n) {
      const words = segmentToWords(segment)
      if (words) parts.push(words)

      if (scaleIndex > 0) {
        const scaleWord = scaleWordForIndex(scaleIndex)
        if (scaleWord) parts.push(scaleWord)
      }
    }
    scaleIndex--
  }

  return joinSegments(parts)
}

/**
 * Assembles final output from number components.
 *
 * @param {boolean} isNegative - Whether the number is negative
 * @param {bigint} integerPart - The integer part (always non-negative)
 * @param {string} [decimalPart] - Decimal digits if present
 * @returns {string} Complete English representation
 */
function toWords (isNegative, integerPart, decimalPart) {
  const words = []

  if (isNegative) words.push(NEGATIVE)
  words.push(integerToWords(integerPart))

  if (decimalPart) {
    words.push(DECIMAL_SEP)
    words.push(...decimalToWords(decimalPart, ZERO, integerToWords))
  }

  return words.join(WORD_SEP)
}

// ============================================================================
// Public API
// ============================================================================

// Export toWords as the main entry point (called by n2words.js after validation)
export { toWords }

// Named exports for testing individual functions
export {
  ONES,
  TEENS,
  TENS,
  SCALES,
  HUNDRED,
  ZERO,
  hundredsToWords,
  combineSegmentParts,
  segmentToWords,
  scaleWordForIndex,
  joinSegments,
  integerToWords
}
