/**
 * Hebrew (bare-tag alias)
 *
 * `he` resolves to he-IL, currently the only Hebrew variant this
 * package implements. This file exists purely so `n2words/he` works
 * without requiring a region subtag; it is not a claim that he-IL speaks
 * for every Hebrew-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './he-IL.js'

export const aliasOf = 'he-IL'
