/**
 * Georgian (bare-tag alias)
 *
 * `ka` resolves to ka-GE, currently the only Georgian variant this
 * package implements. This file exists purely so `n2words/ka` works
 * without requiring a region subtag; it is not a claim that ka-GE speaks
 * for every Georgian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ka-GE.js'

export const aliasOf = 'ka-GE'
