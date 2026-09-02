/**
 * English (bare-tag alias)
 *
 * `en` has no single "correct" region — English is official in dozens of
 * countries with genuinely different cardinal grammar (US vs. British
 * "and") and different default currencies. This file exists so
 * `n2words/en` resolves without forcing a region subtag, defaulting to
 * en-US (the most widely used variant, and the one en-CA/en-AU already
 * proved to be a near-duplicate of). It does NOT speak for en-GB, en-CA,
 * en-IN, or any other regional variant — see LANGUAGES.md's "Bare-tag
 * aliases" section for the full rationale.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './en-US.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from en-US — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './en-US.js'

export const aliasOf = 'en-US'

/**
 * Currency options for the bare `en` entry point — en-US's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./en-US.js').CurrencyOptions, 'currency'> & Required<Pick<import('./en-US.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new en-US currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every en-US currency default except the currency itself.
 * @type {Omit<Required<import('./en-US.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to English currency words.
 *
 * Unlike en-US's, this needs an explicit `currency`: `en` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in English currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'USD' }) // 'forty-two dollars and fifty cents'
 */
function toCurrency(value, options) {
  // Run en-US's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/en names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/en-US')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
