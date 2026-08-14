/**
 * Thai (bare-tag alias)
 *
 * `th` resolves to th-TH, currently the only Thai variant this
 * package implements. This file exists purely so `n2words/th` works
 * without requiring a region subtag; it is not a claim that th-TH speaks
 * for every Thai-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './th-TH.js'

export const aliasOf = 'th-TH'
