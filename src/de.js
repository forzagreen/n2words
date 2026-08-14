/**
 * German (bare-tag alias)
 *
 * `de` resolves to de-DE, currently the only German variant this
 * package implements. This file exists purely so `n2words/de` works
 * without requiring a region subtag; it is not a claim that de-DE speaks
 * for every German-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './de-DE.js'

export const aliasOf = 'de-DE'
