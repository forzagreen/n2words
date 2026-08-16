/**
 * Spanish (Mexico) currency profile of es-ES
 *
 * CLDR: es-MX | Spanish as used in Mexico
 *
 * Numerals are identical to es-ES (long-scale grammar, gender agreement,
 * "y" conjunction — the RAE and Academia Mexicana agree on all of it) — see
 * docs/language-layers.md for why this is a locale *profile* rather than a
 * separate numeral implementation: "which words" (Spanish) and "which
 * country" (Mexico) are different axes, and only the latter varies here.
 * Only the default currency differs (MXN, not es-ES's EUR).
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyValues } from './es-ES.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from es-ES: that's the entire mechanism
// a variant profile uses to apply its own default currency (see
// docs/language-layers.md). A local export legally overrides a star-export
// of the same name — this isn't a naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './es-ES.js'
export const variantOf = 'es-ES'

/**
 * @typedef {object} CurrencyOptions
 * @property {boolean} [and] - Use "con" between the major and minor unit
 * @property {import('./utils/currency-vocab.js').EsCurrency} [currency] - ISO 4217 currency code to name the amount in
 */

/** @type {Required<CurrencyOptions>} */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = { and: true, currency: 'MXN' }

/**
 * Converts a numeric value to Mexican Spanish currency words. Delegates to
 * es-ES's numeral and gender-agreement logic — only the default currency
 * differs, and any currency es-ES can name is reachable here too via the
 * `currency` option (see docs/language-layers.md).
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} [options] - Optional configuration
 * @returns {string} The amount in Mexican Spanish currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 * @example
 * toCurrency(42.50)                    // 'cuarenta y dos pesos con cincuenta centavos'
 * toCurrency(1)                        // 'un peso'
 */
function toCurrency(value, options) {
  return toCurrencyBase(value, resolveOptions(options, currencyDefaults, currencyValues))
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
