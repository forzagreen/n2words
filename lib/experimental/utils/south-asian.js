/**
 * South Asian language utilities
 *
 * Shared helpers for South Asian languages (Hindi, Bengali, Urdu, etc.)
 * These are pure functions - no state, no vocab, just logic.
 */

/**
 * Splits a number into Indian-style segments (3 rightmost, then groups of 2).
 *
 * The Indian numbering system groups differently than Western:
 * - First group (rightmost): 3 digits (hundreds)
 * - Subsequent groups: 2 digits each (thousands, lakhs, crores, etc.)
 *
 * This creates the pattern: 1,23,45,67,890
 *
 * @param {bigint} n - The integer to split
 * @returns {number[]} Array of segments from highest to lowest scale
 *
 * @example
 * groupByThreeThenTwos(1234567n) => [12, 34, 567]
 * // Represents: 12 lakhs + 34 thousand + 567
 */
export function groupByThreeThenTwos (n) {
  const numStr = n.toString()

  if (numStr.length <= 3) {
    return [Number(numStr)]
  }

  const segments = []
  const last3 = numStr.slice(-3)
  segments.unshift(Number(last3))

  let remaining = numStr.slice(0, -3)
  while (remaining.length > 0) {
    const segment = remaining.slice(-2)
    segments.unshift(Number(segment))
    remaining = remaining.slice(0, -2)
  }

  return segments
}

/**
 * Converts a segment (0-999) to words using South Asian pattern.
 *
 * @param {number} segmentValue - Value between 0 and 999
 * @param {string[]} belowHundredWords - Array of words for 0-99
 * @param {string} hundredWord - Word for "hundred"
 * @returns {string} Segment in words
 */
export function segmentToWords (segmentValue, belowHundredWords, hundredWord) {
  if (segmentValue === 0) return ''
  if (segmentValue < 100) return belowHundredWords[segmentValue]

  const hundreds = Math.trunc(segmentValue / 100)
  const remainder = segmentValue % 100
  const parts = []

  parts.push(belowHundredWords[hundreds] + ' ' + hundredWord)

  if (remainder > 0) {
    parts.push(belowHundredWords[remainder])
  }

  return parts.join(' ')
}
