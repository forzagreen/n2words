/**
 * Segment utilities for number-to-words conversion.
 *
 * These pure functions handle common number segmentation and pluralization
 * patterns used across multiple language implementations.
 */

/**
 * Splits a number string into groups of 3 digits (Western thousand-grouping).
 *
 * This is the standard Western numbering system where commas separate
 * groups of three: 1,234,567,890
 *
 * @param {string} numberString The number as a string.
 * @returns {bigint[]} Array of BigInt segments from highest to lowest scale.
 *
 * @example
 * groupByThrees('1234567') => [1n, 234n, 567n]
 * // Represents: 1 million + 234 thousand + 567
 */
export function groupByThrees (numberString) {
  const segments = []
  const len = numberString.length
  const segmentSize = 3

  if (len > segmentSize) {
    const remainderLen = len % segmentSize
    if (remainderLen > 0) {
      segments.push(BigInt(numberString.slice(0, remainderLen)))
    }
    for (let i = remainderLen; i < len; i += segmentSize) {
      segments.push(BigInt(numberString.slice(i, i + segmentSize)))
    }
  } else {
    segments.push(BigInt(numberString))
  }

  return segments
}

/**
 * Splits a number into Indian-style segments (3 rightmost, then groups of 2).
 *
 * The Indian numbering system groups differently than Western:
 * - First group (rightmost): 3 digits (hundreds)
 * - Subsequent groups: 2 digits each (thousands, lakhs, crores, etc.)
 *
 * This creates the pattern: 1,23,45,67,890
 *
 * @param {bigint} integerPart The integer to split.
 * @returns {number[]} Array of segments from highest to lowest scale.
 *
 * @example
 * groupByThreeThenTwos(1234567n) => [12, 34, 567]
 * // Represents: 12 lakhs + 34 thousand + 567
 */
export function groupByThreeThenTwos (integerPart) {
  const numStr = integerPart.toString()

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
 * Extracts ones, tens, and hundreds place values from a segment.
 *
 * Given a number 0-999, returns an array of its place values
 * in order: [ones, tens, hundreds].
 *
 * @param {bigint} segment Value between 0n and 999n.
 * @returns {bigint[]} Array of [ones, tens, hundreds] as BigInts.
 *
 * @example
 * placeValues(456n) => [6n, 5n, 4n]
 * // 456 = 4 hundreds + 5 tens + 6 ones
 */
export function placeValues (segment) {
  const ones = segment % 10n
  const tens = (segment / 10n) % 10n
  const hundreds = segment / 100n
  return [ones, tens, hundreds]
}

/**
 * Selects the correct plural form using Slavic pluralization rules.
 *
 * Slavic languages typically have three plural forms based on the number:
 * - Singular: for 1, 21, 31, 41, etc. (ends in 1, except 11)
 * - Few: for 2-4, 22-24, 32-34, etc. (ends in 2-4, except 12-14)
 * - Many: for 0, 5-20, 25-30, etc. (everything else)
 *
 * @param {bigint} n The number to check.
 * @param {string[]} forms Array of [singular, few, many] forms.
 * @returns {string} The appropriate plural form.
 *
 * @example
 * slavicPlural(1n, ['рубль', 'рубля', 'рублей']) => 'рубль'
 * slavicPlural(3n, ['рубль', 'рубля', 'рублей']) => 'рубля'
 * slavicPlural(5n, ['рубль', 'рубля', 'рублей']) => 'рублей'
 */
export function slavicPlural (n, forms) {
  const lastDigit = n % 10n
  const lastTwoDigits = n % 100n

  // 11-19 are always "many" form
  if (lastTwoDigits >= 11n && lastTwoDigits <= 19n) {
    return forms[2]
  }

  // 1, 21, 31, etc. → singular
  if (lastDigit === 1n) {
    return forms[0]
  }

  // 2-4, 22-24, 32-34, etc. → few
  if (lastDigit >= 2n && lastDigit <= 4n) {
    return forms[1]
  }

  // 0, 5-9, 10, 20, 25-30, etc. → many
  return forms[2]
}
