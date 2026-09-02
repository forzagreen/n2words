/**
 * French (bare-tag alias)
 *
 * `fr` has no single "correct" region, but unlike English, fr-FR and fr-BE
 * are currency-identical (both EUR euros/centimes) and diverge only in
 * cardinal grammar (septante/nonante vs. soixante-dix/quatre-vingt-dix).
 * This file exists so `n2words/fr` resolves without forcing a region
 * subtag, defaulting to fr-FR (the most widely used variant). It does NOT
 * speak for fr-BE or any other regional variant — see LANGUAGES.md's
 * "Bare-tag aliases" section for the full rationale.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './fr-FR.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from fr-FR — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './fr-FR.js'

export const aliasOf = 'fr-FR'

/**
 * Currency options for the bare `fr` entry point — fr-FR's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./fr-FR.js').CurrencyOptions, 'currency'> & Required<Pick<import('./fr-FR.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new fr-FR currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every fr-FR currency default except the currency itself.
 * @type {Omit<Required<import('./fr-FR.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to French currency words.
 *
 * Unlike fr-FR's, this needs an explicit `currency`: `fr` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in French currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'EUR' }) // 'quarante-deux euros et cinquante centimes'
 */
function toCurrency(value, options) {
  // Run fr-FR's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/fr names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/fr-FR')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
