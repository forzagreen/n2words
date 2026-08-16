/**
 * English (Pakistan) currency profile of en-IN
 *
 * CLDR: en-PK | English as used in Pakistan
 *
 * Numerals are identical to en-IN (South Asian lakh/crore numerals (Indian grouping)) — see
 * docs/language-layers.md for why this is a locale *profile* rather than a
 * separate numeral implementation: "which words" (English) and "which
 * country" (Pakistan) are different axes, and only the latter varies
 * here. Only the default currency differs (PKR, not en-IN's
 * default).
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyValues } from './en-IN.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from en-IN: that's the entire mechanism
// a variant profile uses to apply its own default currency (see
// docs/language-layers.md). A local export legally overrides a star-export
// of the same name — this isn't a naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './en-IN.js'
export const variantOf = 'en-IN'

/**
 * @typedef {object} CurrencyOptions
 * @property {boolean} [and] - Use "and" between the major and minor unit
 * @property {import('./utils/currency-vocab.js').EnCurrency} [currency] - ISO 4217 currency code to name the amount in
 */

/** @type {Required<CurrencyOptions>} */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = { and: true, currency: 'PKR' }

/**
 * Converts a numeric value to Pakistani English currency words. Delegates
 * to en-IN's numeral and pluralization logic — only the default currency
 * differs, and any currency en-IN can name is reachable here too via the
 * `currency` option (see docs/language-layers.md).
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} [options] - Optional configuration
 * @returns {string} The amount in Pakistani English currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 * @example
 * toCurrency(42.50)                    // 'forty-two rupees and fifty paisa'
 */
function toCurrency(value, options) {
  return toCurrencyBase(value, resolveOptions(options, currencyDefaults, currencyValues))
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
