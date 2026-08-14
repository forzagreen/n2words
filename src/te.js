/**
 * Telugu (bare-tag alias)
 *
 * `te` resolves to te-IN, currently the only Telugu variant this
 * package implements. This file exists purely so `n2words/te` works
 * without requiring a region subtag; it is not a claim that te-IN speaks
 * for every Telugu-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './te-IN.js'

export const aliasOf = 'te-IN'
