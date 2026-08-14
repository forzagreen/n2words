/**
 * Arabic (bare-tag alias)
 *
 * `ar` resolves to ar-SA, currently the only Arabic variant this package
 * implements. This file exists purely so `n2words/ar` works without
 * requiring a region subtag; it is not a claim that ar-SA speaks for every
 * Arabic-speaking region. See LANGUAGES.md's "Bare-tag aliases" section.
 */

export * from './ar-SA.js'

export const aliasOf = 'ar-SA'
