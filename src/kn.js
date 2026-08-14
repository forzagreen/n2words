/**
 * Kannada (bare-tag alias)
 *
 * `kn` resolves to kn-IN, currently the only Kannada variant this
 * package implements. This file exists purely so `n2words/kn` works
 * without requiring a region subtag; it is not a claim that kn-IN speaks
 * for every Kannada-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './kn-IN.js'

export const aliasOf = 'kn-IN'
