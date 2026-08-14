/**
 * Bangla (bare-tag alias)
 *
 * `bn` resolves to bn-BD, currently the only Bangla variant this
 * package implements. This file exists purely so `n2words/bn` works
 * without requiring a region subtag; it is not a claim that bn-BD speaks
 * for every Bangla-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './bn-BD.js'

export const aliasOf = 'bn-BD'
