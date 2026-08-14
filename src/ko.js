/**
 * Korean (bare-tag alias)
 *
 * `ko` resolves to ko-KR, currently the only Korean variant this
 * package implements. This file exists purely so `n2words/ko` works
 * without requiring a region subtag; it is not a claim that ko-KR speaks
 * for every Korean-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ko-KR.js'

export const aliasOf = 'ko-KR'
