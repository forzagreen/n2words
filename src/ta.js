/**
 * Tamil (bare-tag alias)
 *
 * `ta` resolves to ta-IN, currently the only Tamil variant this
 * package implements. This file exists purely so `n2words/ta` works
 * without requiring a region subtag; it is not a claim that ta-IN speaks
 * for every Tamil-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ta-IN.js'

export const aliasOf = 'ta-IN'
