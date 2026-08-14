/**
 * Punjabi (bare-tag alias)
 *
 * `pa` resolves to pa-IN, currently the only Punjabi variant this
 * package implements. This file exists purely so `n2words/pa` works
 * without requiring a region subtag; it is not a claim that pa-IN speaks
 * for every Punjabi-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './pa-IN.js'

export const aliasOf = 'pa-IN'
