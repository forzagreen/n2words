/**
 * Greek (bare-tag alias)
 *
 * `el` resolves to el-GR, currently the only Greek variant this
 * package implements. This file exists purely so `n2words/el` works
 * without requiring a region subtag; it is not a claim that el-GR speaks
 * for every Greek-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './el-GR.js'

export const aliasOf = 'el-GR'
