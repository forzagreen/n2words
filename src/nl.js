/**
 * Dutch (bare-tag alias)
 *
 * `nl` resolves to nl-NL, currently the only Dutch variant this
 * package implements. This file exists purely so `n2words/nl` works
 * without requiring a region subtag; it is not a claim that nl-NL speaks
 * for every Dutch-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './nl-NL.js'

export const aliasOf = 'nl-NL'
