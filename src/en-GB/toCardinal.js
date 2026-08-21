/**
 * British English cardinal numbers.
 *
 * CLDR: en-GB | English as used in the United Kingdom
 *
 * The "and" is what British English is, so it is baked in rather than offered — there is no options object to resolve on the cardinal path.
 * The number-building internals live in lib/en, shared with the other English
 * languages; what this file owns is which conventions en-GB uses.
 */

import { parseCardinalValue } from '../utils/parse-cardinal.js'
import { checkMax } from '../utils/check-max.js'
import { western } from '../utils/scale.js'
import { SCALES, NEGATIVE, DECIMAL_SEP, integerToWords, decimalPartToWords } from '../lib/en/core.js'

export const cardinalMax = western(SCALES.length)

/**
 * Converts a numeric value to British English words.
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in British English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value exceeds the supported range
 */
export function toCardinal(value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  checkMax(integerPart, cardinalMax, decimalPart)

  let result = isNegative ? NEGATIVE + ' ' : ''
  result += integerToWords(integerPart, false, true)
  if (decimalPart) result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, true)
  return result
}
