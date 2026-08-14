/**
 * French (bare-tag alias)
 *
 * `fr` has no single "correct" region, but unlike English, fr-FR and fr-BE
 * are currency-identical (both EUR euros/centimes) and diverge only in
 * cardinal grammar (septante/nonante vs. soixante-dix/quatre-vingt-dix).
 * This file exists so `n2words/fr` resolves without forcing a region
 * subtag, defaulting to fr-FR (the most widely used variant). It does NOT
 * speak for fr-BE or any other regional variant — see LANGUAGES.md's
 * "Bare-tag aliases" section for the full rationale.
 */

export * from './fr-FR.js'

export const aliasOf = 'fr-FR'
