/**
 * Fixture helpers for bare-tag alias files.
 *
 * A bare-tag alias re-exports its target's fixtures wholesale
 * (`export * from './de-DE.js'`), which is right for cardinal and ordinal —
 * the alias forwards those bindings untouched, so replaying the target's
 * cases proves the re-export works.
 *
 * Currency is the exception. A bare tag names a language and has no country
 * to take a default currency from, so `n2words/de`'s toCurrency requires an
 * explicit `currency` (see docs/bare-tag-aliases.md). The target's own cases
 * pass no options, so they can't be replayed as-is.
 * @module alias-fixtures
 */

/**
 * Replay a target's currency cases with a currency named explicitly.
 *
 * The code goes in before the case's own options, so a case that already
 * names a different currency keeps it rather than being overwritten.
 * @param {Array<[number | string | bigint, string, object?]>} cases - The target's currency fixture cases
 * @param {string} code - ISO 4217 code to name, normally the target's own default
 * @returns {Array<[number | string | bigint, string, object]>} The same cases, each with `currency` set
 */
export function withCurrency(cases, code) {
  return cases.map(([input, expected, options]) => [input, expected, { currency: code, ...options }])
}
