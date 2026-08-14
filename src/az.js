/**
 * Azerbaijani (bare-tag alias)
 *
 * `az` resolves to az-AZ, currently the only Azerbaijani variant this
 * package implements. This file exists purely so `n2words/az` works
 * without requiring a region subtag; it is not a claim that az-AZ speaks
 * for every Azerbaijani-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './az-AZ.js'

export const aliasOf = 'az-AZ'
