/**
 * Punjabi (bare-tag alias)
 *
 * `pa` resolves to pa-IN, currently the only Punjabi variant this
 * package implements. This file exists purely so `n2words/pa` works
 * without requiring a region subtag; it is not a claim that pa-IN speaks
 * for every Punjabi-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './pa-IN.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from pa-IN — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './pa-IN.js'

export const aliasOf = 'pa-IN'

/**
 * Currency options for the bare `pa` entry point — pa-IN's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./pa-IN.js').CurrencyOptions, 'currency'> & Required<Pick<import('./pa-IN.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new pa-IN currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every pa-IN currency default except the currency itself.
 * @type {Omit<Required<import('./pa-IN.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to Punjabi currency words.
 *
 * Unlike pa-IN's, this needs an explicit `currency`: `pa` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in Punjabi currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'INR' }) // 'ਬਿਆਲੀ ਰੁਪਏ ਪੰਜਾਹ ਪੈਸੇ'
 */
function toCurrency(value, options) {
  // Run pa-IN's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/pa names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/pa-IN')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
