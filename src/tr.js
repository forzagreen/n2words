/**
 * Turkish (bare-tag alias)
 *
 * `tr` resolves to tr-TR, currently the only Turkish variant this
 * package implements. This file exists purely so `n2words/tr` works
 * without requiring a region subtag; it is not a claim that tr-TR speaks
 * for every Turkish-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './tr-TR.js'

export const aliasOf = 'tr-TR'
