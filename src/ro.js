/**
 * Romanian (bare-tag alias)
 *
 * `ro` resolves to ro-RO, currently the only Romanian variant this
 * package implements. This file exists purely so `n2words/ro` works
 * without requiring a region subtag; it is not a claim that ro-RO speaks
 * for every Romanian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ro-RO.js'

export const aliasOf = 'ro-RO'
