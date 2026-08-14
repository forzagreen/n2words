/**
 * Swahili (bare-tag alias)
 *
 * `sw` resolves to sw-KE, currently the only Swahili variant this
 * package implements. This file exists purely so `n2words/sw` works
 * without requiring a region subtag; it is not a claim that sw-KE speaks
 * for every Swahili-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './sw-KE.js'

export const aliasOf = 'sw-KE'
