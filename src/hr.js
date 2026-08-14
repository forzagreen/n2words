/**
 * Croatian (bare-tag alias)
 *
 * `hr` resolves to hr-HR, currently the only Croatian variant this
 * package implements. This file exists purely so `n2words/hr` works
 * without requiring a region subtag; it is not a claim that hr-HR speaks
 * for every Croatian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './hr-HR.js'

export const aliasOf = 'hr-HR'
