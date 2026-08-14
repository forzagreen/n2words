/**
 * Hausa (bare-tag alias)
 *
 * `ha` resolves to ha-NG, currently the only Hausa variant this
 * package implements. This file exists purely so `n2words/ha` works
 * without requiring a region subtag; it is not a claim that ha-NG speaks
 * for every Hausa-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ha-NG.js'

export const aliasOf = 'ha-NG'
