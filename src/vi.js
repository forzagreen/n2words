/**
 * Vietnamese (bare-tag alias)
 *
 * `vi` resolves to vi-VN, currently the only Vietnamese variant this
 * package implements. This file exists purely so `n2words/vi` works
 * without requiring a region subtag; it is not a claim that vi-VN speaks
 * for every Vietnamese-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './vi-VN.js'

export const aliasOf = 'vi-VN'
