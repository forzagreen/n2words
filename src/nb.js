/**
 * Norwegian Bokmål (bare-tag alias)
 *
 * `nb` resolves to nb-NO, currently the only Norwegian Bokmål variant this
 * package implements. This file exists purely so `n2words/nb` works
 * without requiring a region subtag; it is not a claim that nb-NO speaks
 * for every Norwegian Bokmål-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './nb-NO.js'

export const aliasOf = 'nb-NO'
