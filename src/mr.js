/**
 * Marathi (bare-tag alias)
 *
 * `mr` resolves to mr-IN, currently the only Marathi variant this
 * package implements. This file exists purely so `n2words/mr` works
 * without requiring a region subtag; it is not a claim that mr-IN speaks
 * for every Marathi-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './mr-IN.js'

export const aliasOf = 'mr-IN'
