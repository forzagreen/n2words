/**
 * British English ordinal numbers.
 *
 * CLDR: en-GB | English as used in the United Kingdom
 */

import { parseOrdinalValue } from '../utils/parse-ordinal.js'
import { checkMax } from '../utils/check-max.js'
import { western } from '../utils/scale.js'
import { SCALES } from '../lib/en/core.js'
import { integerToOrdinal } from '../lib/en/ordinal.js'

export const ordinalMax = western(SCALES.length)

/**
 * Converts a numeric value to British English ordinal words.
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The ordinal in British English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value exceeds the supported range
 */
export function toOrdinal(value) {
  const integerPart = parseOrdinalValue(value)
  checkMax(integerPart, ordinalMax)
  return integerToOrdinal(integerPart, true)
}
