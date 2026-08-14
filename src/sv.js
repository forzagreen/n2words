/**
 * Swedish (bare-tag alias)
 *
 * `sv` resolves to sv-SE, currently the only Swedish variant this
 * package implements. This file exists purely so `n2words/sv` works
 * without requiring a region subtag; it is not a claim that sv-SE speaks
 * for every Swedish-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './sv-SE.js'

export const aliasOf = 'sv-SE'
