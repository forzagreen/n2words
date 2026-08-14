/**
 * Indonesian (bare-tag alias)
 *
 * `id` resolves to id-ID, currently the only Indonesian variant this
 * package implements. This file exists purely so `n2words/id` works
 * without requiring a region subtag; it is not a claim that id-ID speaks
 * for every Indonesian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './id-ID.js'

export const aliasOf = 'id-ID'
