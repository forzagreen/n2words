/**
 * Azerbaijani (bare-tag alias)
 *
 * `az` resolves to az-AZ, currently the only Azerbaijani variant this
 * package implements. This file exists purely so `n2words/az` works
 * without requiring a region subtag; it is not a claim that az-AZ speaks
 * for every Azerbaijani-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './az-AZ.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from az-AZ — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './az-AZ.js'

export const aliasOf = 'az-AZ'

/**
 * Currency options for the bare `az` entry point — az-AZ's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./az-AZ.js').CurrencyOptions, 'currency'> & Required<Pick<import('./az-AZ.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new az-AZ currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every az-AZ currency default except the currency itself.
 * @type {Omit<Required<import('./az-AZ.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to Azerbaijani currency words.
 *
 * Unlike az-AZ's, this needs an explicit `currency`: `az` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in Azerbaijani currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'AZN' }) // 'qırx iki manat əlli qəpik'
 */
function toCurrency(value, options) {
  // Run az-AZ's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/az names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/az-AZ')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
