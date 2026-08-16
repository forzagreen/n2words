/**
 * English (Kenya) currency profile of en-GB
 *
 * CLDR: en-KE | English as used in Kenya
 *
 * Numerals are identical to en-GB (Commonwealth "and"-after-hundreds Western short-scale numerals) — see
 * docs/language-layers.md for why this is a locale *profile* rather than a
 * separate numeral implementation: "which words" (English) and "which
 * country" (Kenya) are different axes, and only the latter varies
 * here. Only the default currency differs (KES, not en-GB's
 * default).
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyValues } from './en-GB.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from en-GB: that's the entire mechanism
// a variant profile uses to apply its own default currency (see
// docs/language-layers.md). A local export legally overrides a star-export
// of the same name — this isn't a naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './en-GB.js'
export const variantOf = 'en-GB'

/**
 * @typedef {object} CurrencyOptions
 * @property {boolean} [and] - Use "and" between the major and minor unit
 * @property {import('./utils/currency-vocab.js').EnCurrency} [currency] - ISO 4217 currency code to name the amount in
 */

/** @type {Required<CurrencyOptions>} */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = { and: true, currency: 'KES' }

/**
 * Converts a numeric value to Kenyan English currency words. Delegates
 * to en-GB's numeral and pluralization logic — only the default currency
 * differs, and any currency en-GB can name is reachable here too via the
 * `currency` option (see docs/language-layers.md).
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} [options] - Optional configuration
 * @returns {string} The amount in Kenyan English currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 * @example
 * toCurrency(42.50)                    // 'forty-two shillings and fifty cents'
 */
function toCurrency(value, options) {
  return toCurrencyBase(value, resolveOptions(options, currencyDefaults, currencyValues))
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
