/**
 * Spanish (bare-tag alias)
 *
 * `es` has no single "correct" region, and unlike `fr`, the es-* variants
 * genuinely diverge in both cardinal ceiling and default currency
 * (es-ES/EUR, es-MX/MXN, es-US/USD) — closer to a pt-BR/pt-PT split than a
 * fr-FR/fr-BE one. This file exists so `n2words/es` resolves without
 * forcing a region subtag anyway, defaulting to es-ES (Spain's variant, the
 * conventional default for bare `es` across most software/BCP-47 tooling).
 * It does NOT speak for es-MX or es-US — a caller who cares about Mexican
 * or US Spanish currency/grammar should import that variant explicitly.
 * See LANGUAGES.md's "Bare-tag aliases" section for the full rationale.
 */

export * from './es-ES.js'

export const aliasOf = 'es-ES'
