/**
 * Yoruba (bare-tag alias)
 *
 * `yo` resolves to yo-NG, currently the only Yoruba variant this
 * package implements. This file exists purely so `n2words/yo` works
 * without requiring a region subtag; it is not a claim that yo-NG speaks
 * for every Yoruba-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './yo-NG.js'

export const aliasOf = 'yo-NG'
