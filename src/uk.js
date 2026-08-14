/**
 * Ukrainian (bare-tag alias)
 *
 * `uk` resolves to uk-UA, currently the only Ukrainian variant this
 * package implements. This file exists purely so `n2words/uk` works
 * without requiring a region subtag; it is not a claim that uk-UA speaks
 * for every Ukrainian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './uk-UA.js'

export const aliasOf = 'uk-UA'
