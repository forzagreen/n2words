/**
 * English ordinal builders.
 *
 * Private to the English language files. `useAnd` is a parameter because the
 * English languages disagree about it — en-GB carries the "and" into the
 * cardinal groups of a large ordinal, en-US and en-CA do not — and each of
 * them passes a literal, so the branch folds away per bundle.
 * @module lib/en/ordinal
 */

import { ONES, TENS, HUNDRED, SCALES, buildSegment } from './core.js'

// Ordinal vocabulary
const ORDINAL_ONES = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
const ORDINAL_TEENS = ['tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth']
const ORDINAL_TENS = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth']

/**
 * Builds ordinal words for a 0-999 segment (final segment only).
 * Returns ordinal form: "first", "twenty-third", "one hundred forty-fifth"
 * @param {number} n - Number 0-999
 * @returns {string} Ordinal words for this segment
 */
function buildOrdinalSegment(n) {
  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  // Build ordinal for tens-ones portion
  let tensOnesOrdinal = ''
  if (tens === 1) {
    // Teens: 10-19 → "tenth" through "nineteenth"
    tensOnesOrdinal = ORDINAL_TEENS[ones]
  }
  else if (tens >= 2) {
    if (ones > 0) {
      // Compound: "twenty-first", "thirty-second", etc.
      tensOnesOrdinal = TENS[tens] + '-' + ORDINAL_ONES[ones]
    }
    else {
      // Round tens: "twentieth", "thirtieth", etc.
      tensOnesOrdinal = ORDINAL_TENS[tens]
    }
  }
  else if (ones > 0) {
    // Single digit: "first", "second", etc.
    tensOnesOrdinal = ORDINAL_ONES[ones]
  }

  // Hundreds place
  if (hundreds > 0) {
    if (tensOnesOrdinal) {
      // "one hundred twenty-first"
      return ONES[hundreds] + ' ' + HUNDRED + ' ' + tensOnesOrdinal
    }
    else {
      // "one hundredth", "two hundredth", etc.
      return ONES[hundreds] + ' hundredth'
    }
  }

  return tensOnesOrdinal
}

/**
 * Converts a positive integer to ordinal words.
 * Generates ordinals directly without string manipulation.
 * @param {bigint} n - Positive integer to convert
 * @param {boolean} useAnd - Insert "and" the way Commonwealth English does
 * @returns {string} Ordinal English words
 */
function integerToOrdinal(n, useAnd) {
  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      // Exact thousands: "one thousandth", "five thousandth"
      return buildSegment(thousands, useAnd).word + ' ' + SCALES[0] + 'th'
    }

    // Has remainder: cardinal thousands + ordinal remainder
    const { word: thousandsWord } = buildSegment(thousands, useAnd)
    return thousandsWord + ' ' + SCALES[0] + ' ' + buildOrdinalSegment(remainder)
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeOrdinal(n, useAnd)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 * All segments except the final one are cardinal; final segment is ordinal.
 * @param {bigint} n - Number >= 1,000,000
 * @param {boolean} useAnd - Insert "and" the way Commonwealth English does
 * @returns {string} Ordinal English words
 */
function buildLargeOrdinal(n, useAnd) {
  // Extract segments (least-significant first)
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the lowest non-zero segment (this gets ordinal treatment)
  let lowestNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      lowestNonZeroIdx = i
      break
    }
  }

  // Build result (most-significant to least)
  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const isLowestSegment = (i === lowestNonZeroIdx)

    if (result) result += ' '

    if (isLowestSegment) {
      // Final non-zero segment gets ordinal treatment
      if (i === 0) {
        // Units position: use ordinal segment
        result += buildOrdinalSegment(segment)
      }
      else {
        // Scale position with no remainder below: "one millionth"
        result += buildSegment(segment, useAnd).word + ' ' + SCALES[i - 1] + 'th'
      }
    }
    else {
      // Non-final segments are cardinal
      result += buildSegment(segment, useAnd).word
      if (i > 0) {
        result += ' ' + SCALES[i - 1]
      }
    }
  }

  return result
}

export { integerToOrdinal }
