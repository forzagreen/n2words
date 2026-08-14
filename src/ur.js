/**
 * Urdu (bare-tag alias)
 *
 * `ur` resolves to ur-PK, currently the only Urdu variant this
 * package implements. This file exists purely so `n2words/ur` works
 * without requiring a region subtag; it is not a claim that ur-PK speaks
 * for every Urdu-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ur-PK.js'

export const aliasOf = 'ur-PK'
