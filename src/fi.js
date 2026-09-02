/**
 * Finnish (bare-tag alias)
 *
 * `fi` resolves to fi-FI, currently the only Finnish variant this
 * package implements. This file exists purely so `n2words/fi` works
 * without requiring a region subtag; it is not a claim that fi-FI speaks
 * for every Finnish-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './fi-FI.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from fi-FI — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './fi-FI.js'

export const aliasOf = 'fi-FI'

/**
 * Currency options for the bare `fi` entry point — fi-FI's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./fi-FI.js').CurrencyOptions, 'currency'> & Required<Pick<import('./fi-FI.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new fi-FI currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every fi-FI currency default except the currency itself.
 * @type {Omit<Required<import('./fi-FI.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to Finnish currency words.
 *
 * Unlike fi-FI's, this needs an explicit `currency`: `fi` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in Finnish currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'EUR' }) // 'neljäkymmentäkaksi euroa viisikymmentä senttiä'
 */
function toCurrency(value, options) {
  // Run fi-FI's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/fi names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/fi-FI')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
