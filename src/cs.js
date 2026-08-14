/**
 * Czech (bare-tag alias)
 *
 * `cs` resolves to cs-CZ, currently the only Czech variant this
 * package implements. This file exists purely so `n2words/cs` works
 * without requiring a region subtag; it is not a claim that cs-CZ speaks
 * for every Czech-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './cs-CZ.js'

export const aliasOf = 'cs-CZ'
