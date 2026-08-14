/**
 * Hindi (bare-tag alias)
 *
 * `hi` resolves to hi-IN, currently the only Hindi variant this
 * package implements. This file exists purely so `n2words/hi` works
 * without requiring a region subtag; it is not a claim that hi-IN speaks
 * for every Hindi-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './hi-IN.js'

export const aliasOf = 'hi-IN'
