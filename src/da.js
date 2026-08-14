/**
 * Danish (bare-tag alias)
 *
 * `da` resolves to da-DK, currently the only Danish variant this
 * package implements. This file exists purely so `n2words/da` works
 * without requiring a region subtag; it is not a claim that da-DK speaks
 * for every Danish-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './da-DK.js'

export const aliasOf = 'da-DK'
