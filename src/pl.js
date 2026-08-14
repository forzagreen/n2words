/**
 * Polish (bare-tag alias)
 *
 * `pl` resolves to pl-PL, currently the only Polish variant this
 * package implements. This file exists purely so `n2words/pl` works
 * without requiring a region subtag; it is not a claim that pl-PL speaks
 * for every Polish-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './pl-PL.js'

export const aliasOf = 'pl-PL'
