/**
 * Persian (bare-tag alias)
 *
 * `fa` resolves to fa-IR, currently the only Persian variant this
 * package implements. This file exists purely so `n2words/fa` works
 * without requiring a region subtag; it is not a claim that fa-IR speaks
 * for every Persian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './fa-IR.js'

export const aliasOf = 'fa-IR'
