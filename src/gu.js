/**
 * Gujarati (bare-tag alias)
 *
 * `gu` resolves to gu-IN, currently the only Gujarati variant this
 * package implements. This file exists purely so `n2words/gu` works
 * without requiring a region subtag; it is not a claim that gu-IN speaks
 * for every Gujarati-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './gu-IN.js'

export const aliasOf = 'gu-IN'
