/**
 * Spanish (bare-tag alias)
 *
 * `es` has no single "correct" region, and unlike `fr`, the es-* variants
 * genuinely diverge in both cardinal ceiling and default currency
 * (es-ES/EUR, es-MX/MXN, es-US/USD) — closer to a pt-BR/pt-PT split than a
 * fr-FR/fr-BE one. This file exists so `n2words/es` resolves without
 * forcing a region subtag anyway, defaulting to es-ES (Spain's variant, the
 * conventional default for bare `es` across most software/BCP-47 tooling).
 * It does NOT speak for es-MX or es-US — a caller who cares about Mexican
 * or US Spanish currency/grammar should import that variant explicitly.
 * See LANGUAGES.md's "Bare-tag aliases" section for the full rationale.
 *
 * `toCurrency` is the one form this file doesn't forward untouched: a bare
 * tag names a language, and a default currency belongs to a country, so
 * `currency` is required here rather than inherited. See
 * docs/bare-tag-aliases.md's "Bare tags carry no default currency".
 */

import { resolveOptions } from './utils/resolve-options.js'
import { toCurrency as toCurrencyBase, currencyDefaults as baseCurrencyDefaults, currencyValues } from './es-ES.js'

// currencyDefaults and toCurrency are deliberately re-declared below,
// shadowing the star-exported ones from es-ES — the same mechanism a locale
// profile uses to override a default (see docs/language-layers.md). A local
// export legally overrides a star-export of the same name; this isn't a
// naming collision.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './es-ES.js'

export const aliasOf = 'es-ES'

/**
 * Currency options for the bare `es` entry point — es-ES's, but with
 * `currency` required instead of defaulted.
 * @typedef {Omit<import('./es-ES.js').CurrencyOptions, 'currency'> & Required<Pick<import('./es-ES.js').CurrencyOptions, 'currency'>>} CurrencyOptions
 */

// `currency` is named only so the rest element excludes it; derived rather than
// hand-listed so a new es-ES currency option can't silently go missing here.
// eslint-disable-next-line no-unused-vars -- see above
const { currency: _baseCurrency, ...baseDefaultsWithoutCurrency } = baseCurrencyDefaults

/**
 * Every es-ES currency default except the currency itself.
 * @type {Omit<Required<import('./es-ES.js').CurrencyOptions>, 'currency'>}
 */
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currencyDefaults = baseDefaultsWithoutCurrency

/**
 * Converts a numeric value to Spanish currency words.
 *
 * Unlike es-ES's, this needs an explicit `currency`: `es` is a language
 * and has no country to take a default from.
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} options - Configuration; `currency` is required
 * @returns {string} The amount in Spanish currency words
 * @throws {TypeError} If `currency` is omitted, or options are malformed
 * @example
 * toCurrency(42.50, { currency: 'EUR' }) // 'cuarenta y dos euros con cincuenta céntimos'
 */
function toCurrency(value, options) {
  // Run es-ES's own options contract first so a malformed argument reports
  // itself — an unknown key names the key, a bad currency lists the valid set
  // — instead of being masked by the missing-currency error below. The base
  // validates again on delegation; toCurrency isn't hot enough to care.
  resolveOptions(options, baseCurrencyDefaults, currencyValues)
  if (options?.currency === undefined) {
    throw new TypeError('n2words/es names a language, not a locale: toCurrency needs an explicit { currency }, or import a region-qualified entry point such as n2words/es-ES')
  }
  return toCurrencyBase(value, options)
}

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export { toCurrency }
