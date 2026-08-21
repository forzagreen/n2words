/**
 * American English cardinal numbers.
 *
 * CLDR: en-US | English as used in the United States
 *
 * American English omits the "and" after hundreds, and exposes it as an option because usage varies.
 * The number-building internals live in lib/en, shared with the other English
 * languages; what this file owns is which conventions en-US uses.
 */

import { parseCardinalValue } from '../utils/parse-cardinal.js'
import { checkMax } from '../utils/check-max.js'
import { western } from '../utils/scale.js'
import { resolveOptions } from '../utils/resolve-options.js'
import { SCALES, NEGATIVE, DECIMAL_SEP, integerToWords, decimalPartToWords } from '../lib/en/core.js'

export const cardinalMax = western(SCALES.length)

/**
 * @typedef {object} CardinalOptions
 * @property {boolean} [hundredPairing] - Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred")
 * @property {boolean} [and] - Use "and" after hundreds and before final small numbers
 */

/** @type {Required<CardinalOptions>} */
export const cardinalDefaults = { hundredPairing: false, and: false }

/**
 * Converts a numeric value to American English words.
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {CardinalOptions} [options] - Optional configuration
 * @returns {string} The number in American English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value exceeds the supported range
 */
export function toCardinal(value, options) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  checkMax(integerPart, cardinalMax, decimalPart)
  const { hundredPairing, and: useAnd } = resolveOptions(options, cardinalDefaults)

  let result = isNegative ? NEGATIVE + ' ' : ''
  result += integerToWords(integerPart, hundredPairing, useAnd)
  if (decimalPart) result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, useAnd)
  return result
}
