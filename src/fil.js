/**
 * Filipino (bare-tag alias)
 *
 * `fil` resolves to fil-PH, currently the only Filipino variant this
 * package implements. This file exists purely so `n2words/fil` works
 * without requiring a region subtag; it is not a claim that fil-PH speaks
 * for every Filipino-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './fil-PH.js'

export const aliasOf = 'fil-PH'
