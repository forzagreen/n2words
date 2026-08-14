/**
 * Lithuanian (bare-tag alias)
 *
 * `lt` resolves to lt-LT, currently the only Lithuanian variant this
 * package implements. This file exists purely so `n2words/lt` works
 * without requiring a region subtag; it is not a claim that lt-LT speaks
 * for every Lithuanian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './lt-LT.js'

export const aliasOf = 'lt-LT'
