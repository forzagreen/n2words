/**
 * Finnish (bare-tag alias)
 *
 * `fi` resolves to fi-FI, currently the only Finnish variant this
 * package implements. This file exists purely so `n2words/fi` works
 * without requiring a region subtag; it is not a claim that fi-FI speaks
 * for every Finnish-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './fi-FI.js'

export const aliasOf = 'fi-FI'
