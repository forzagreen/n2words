/**
 * Czech (bare-tag alias)
 *
 * `cs` resolves to cs-CZ, currently the only Czech variant this
 * package implements. This file exists purely so `n2words/cs` works
 * without requiring a region subtag; it is not a claim that cs-CZ speaks
 * for every Czech-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './cs-CZ.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from cs-CZ — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './cs-CZ.js'

export const aliasOf = 'cs-CZ'

/**
 * Currency options for the bare `cs` entry point — cs-CZ's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./cs-CZ.js').CurrencyOptions, 'currency'> & Required<Pick<import('./cs-CZ.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new cs-CZ currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every cs-CZ currency default except the currency itself.
 * @type {Omit<Required<import('./cs-CZ.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to Czech currency words.
 *
 * Unlike cs-CZ's, this needs an explicit `currency`: `cs` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in Czech currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'CZK' }) // 'čtyřicet dva koruny padesát haléřů'
 */
function toCurrency(value, options) {
  // Run cs-CZ's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/cs names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/cs-CZ')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
