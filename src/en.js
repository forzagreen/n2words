/**
 * English (bare-tag alias)
 *
 * `en` has no single "correct" region — English is official in dozens of
 * countries with genuinely different cardinal grammar (US vs. British
 * "and") and different default currencies. This file exists so
 * `n2words/en` resolves without forcing a region subtag, defaulting to
 * en-US (the most widely used variant, and the one en-CA/en-AU already
 * proved to be a near-duplicate of). It does NOT speak for en-GB, en-CA,
 * en-IN, or any other regional variant — see LANGUAGES.md's "Bare-tag
 * aliases" section for the full rationale.
 */

export * from './en-US.js'

export const aliasOf = 'en-US'
