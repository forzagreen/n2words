/**
 * Japanese (bare-tag alias)
 *
 * `ja` resolves to ja-JP, currently the only Japanese variant this
 * package implements. This file exists purely so `n2words/ja` works
 * without requiring a region subtag; it is not a claim that ja-JP speaks
 * for every Japanese-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ja-JP.js'

export const aliasOf = 'ja-JP'
