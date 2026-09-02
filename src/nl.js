/**
 * Dutch (bare-tag alias)
 *
 * `nl` resolves to nl-NL, currently the only Dutch variant this
 * package implements. This file exists purely so `n2words/nl` works
 * without requiring a region subtag; it is not a claim that nl-NL speaks
 * for every Dutch-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './nl-NL.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from nl-NL — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './nl-NL.js'

export const aliasOf = 'nl-NL'

/**
 * Currency options for the bare `nl` entry point — nl-NL's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./nl-NL.js').CurrencyOptions, 'currency'> & Required<Pick<import('./nl-NL.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new nl-NL currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every nl-NL currency default except the currency itself.
 * @type {Omit<Required<import('./nl-NL.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to Dutch currency words.
 *
 * Unlike nl-NL's, this needs an explicit `currency`: `nl` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in Dutch currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'EUR' }) // 'tweeënveertig euro en vijftig cent'
 */
function toCurrency(value, options) {
  // Run nl-NL's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/nl names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/nl-NL')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
