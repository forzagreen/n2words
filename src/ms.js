/**
 * Malay (bare-tag alias)
 *
 * `ms` resolves to ms-MY, currently the only Malay variant this
 * package implements. This file exists purely so `n2words/ms` works
 * without requiring a region subtag; it is not a claim that ms-MY speaks
 * for every Malay-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ms-MY.js'

export const aliasOf = 'ms-MY'
