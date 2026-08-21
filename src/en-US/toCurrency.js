/**
 * American English currency.
 *
 * CLDR: en-US | English as used in the United States
 *
 * USD is baked in as the default because en-US names one country. Any
 * other currency English can spell is re-exported below — import it and pass
 * it. Unreferenced ones are dropped by the bundler, so a caller using the
 * default carries only USD's words.
 */

import { parseCurrencyValue } from '../utils/parse-currency.js'
import { checkMax } from '../utils/check-max.js'
import { checkCurrency } from '../utils/check-currency.js'
import { western } from '../utils/scale.js'
import { resolveOptions } from '../utils/resolve-options.js'
import { SCALES, NEGATIVE, integerToWords } from '../lib/en/core.js'
import { USD } from '../lib/en/currencies.js'

export { USD, GBP, CAD, AUD, NZD, SGD, ZAR, KES, GHS, EUR, MYR, NGN, PHP, JPY } from '../lib/en/currencies.js'

export const currencyMax = western(SCALES.length)

/**
 * @typedef {object} CurrencyOptions
 * @property {boolean} [and] - Use "and" between the major and minor unit
 * @property {import('../utils/check-currency.js').CurrencyVocab} [currency] - Currency vocabulary; defaults to USD
 */

/** @type {Required<CurrencyOptions>} */
export const currencyDefaults = { and: true, currency: USD }

/**
 * Converts a numeric value to American English currency words.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} [options] - Optional configuration
 * @returns {string} The amount in American English currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value exceeds the range, or the currency has no minor unit
 * @example
 * import { toCurrency, JPY } from 'n2words/en-US/toCurrency'
 * toCurrency(100, { currency: JPY })
 */
export function toCurrency(value, options) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)
  checkMax(dollars, currencyMax)
  const { and: useAnd, currency } = resolveOptions(options, currencyDefaults)
  checkCurrency(currency, cents)
  const { major, minor } = currency

  let result = isNegative ? NEGATIVE + ' ' : ''
  if (dollars > 0n || cents === 0n) {
    result += integerToWords(dollars, false, false) + ' ' + (dollars === 1n ? major[0] : major[1])
  }
  if (cents > 0n && minor !== null) {
    if (dollars > 0n) result += useAnd ? ' and ' : ' '
    result += integerToWords(cents, false, false) + ' ' + (cents === 1n ? minor[0] : minor[1])
  }
  return result
}
