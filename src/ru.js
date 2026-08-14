/**
 * Russian (bare-tag alias)
 *
 * `ru` resolves to ru-RU, currently the only Russian variant this
 * package implements. This file exists purely so `n2words/ru` works
 * without requiring a region subtag; it is not a claim that ru-RU speaks
 * for every Russian-speaking region. See docs/bare-tag-aliases.md for the
 * full rationale and LANGUAGES.md for the complete family/variant table.
 */

export * from './ru-RU.js'

export const aliasOf = 'ru-RU'
