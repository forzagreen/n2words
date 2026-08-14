/**
 * Latvian (bare-tag alias)
 *
 * `lv` resolves to lv-LV, currently the only Latvian variant this
 * package implements. This file exists purely so `n2words/lv` works
 * without requiring a region subtag; it is not a claim that lv-LV speaks
 * for every Latvian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './lv-LV.js'

export const aliasOf = 'lv-LV'
