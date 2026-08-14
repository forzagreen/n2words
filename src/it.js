/**
 * Italian (bare-tag alias)
 *
 * `it` resolves to it-IT, currently the only Italian variant this
 * package implements. This file exists purely so `n2words/it` works
 * without requiring a region subtag; it is not a claim that it-IT speaks
 * for every Italian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './it-IT.js'

export const aliasOf = 'it-IT'
