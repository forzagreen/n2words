/**
 * Biblical Hebrew (bare-tag alias)
 *
 * `hbo` resolves to hbo-IL, currently the only Biblical Hebrew variant this
 * package implements. This file exists purely so `n2words/hbo` works
 * without requiring a region subtag. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './hbo-IL.js'

export const aliasOf = 'hbo-IL'
