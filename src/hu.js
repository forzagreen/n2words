/**
 * Hungarian (bare-tag alias)
 *
 * `hu` resolves to hu-HU, currently the only Hungarian variant this
 * package implements. This file exists purely so `n2words/hu` works
 * without requiring a region subtag; it is not a claim that hu-HU speaks
 * for every Hungarian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './hu-HU.js'

export const aliasOf = 'hu-HU'
