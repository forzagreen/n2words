/**
 * Croatian (bare-tag alias)
 *
 * `hr` resolves to hr-HR, currently the only Croatian variant this
 * package implements. This file exists purely so `n2words/hr` works
 * without requiring a region subtag; it is not a claim that hr-HR speaks
 * for every Croatian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './hr-HR.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from hr-HR — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './hr-HR.js'

export const aliasOf = 'hr-HR'

/**
 * Currency options for the bare `hr` entry point — hr-HR's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./hr-HR.js').CurrencyOptions, 'currency'> & Required<Pick<import('./hr-HR.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new hr-HR currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every hr-HR currency default except the currency itself.
 * @type {Omit<Required<import('./hr-HR.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to Croatian currency words.
 *
 * Unlike hr-HR's, this needs an explicit `currency`: `hr` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in Croatian currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'EUR' }) // 'četrdeset dva eura pedeset centi'
 */
function toCurrency(value, options) {
  // Run hr-HR's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/hr names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/hr-HR')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
