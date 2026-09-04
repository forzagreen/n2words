/**
 * Language discovery and loading for the CLI.
 *
 * Resolves modules relative to this file rather than the cwd, so the same code
 * works from a git checkout and from an installed `node_modules/n2words`
 * (`files` ships `src/**\/*.js`). This is deliberately not
 * `test/helpers/language-helpers.js` — that one reads `./src` relative to the
 * cwd and lives under `test/`, which isn't published.
 *
 * @module cli/languages
 */

import { readdirSync } from 'node:fs'

const SRC_DIR = new URL('../../src/', import.meta.url)

/** Form key -> the export a language provides when it supports that form. */
export const FORM_EXPORTS = {
  cardinal: 'toCardinal',
  ordinal: 'toOrdinal',
  currency: 'toCurrency',
}

/** The three conversion forms, in the order they're presented to the user. */
export const FORMS = Object.keys(FORM_EXPORTS)

// Every shape in src/: `en`, `pt-BR`, `hbo-IL`, `fil-PH`, `zh-Hans-CN`,
// `sr-Cyrl-RS`. This is a path-traversal guard, not a nicety — the code ends up
// in a dynamic import specifier, so nothing outside this pattern may reach it.
const CODE_PATTERN = /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2})?$/

/**
 * Canonicalizes user input to BCP 47 casing (`en-us` -> `en-US`,
 * `ZH-hans-cn` -> `zh-Hans-CN`).
 *
 * @param {string} input Language code as typed
 * @returns {string | null} The canonical code, or null if it isn't shaped like one
 */
export function canonicalCode(input) {
  const code = String(input)
    .split('-')
    .map((subtag, index) => {
      if (index === 0) return subtag.toLowerCase()
      // A 4-letter subtag is a script (Titlecase); anything else here is a region.
      if (subtag.length === 4) return subtag[0].toUpperCase() + subtag.slice(1).toLowerCase()
      return subtag.toUpperCase()
    })
    .join('-')

  return CODE_PATTERN.test(code) ? code : null
}

/**
 * Every entry point shipped in src/, sorted.
 *
 * @returns {string[]} Language codes (e.g. ['ar', 'ar-SA', 'az', ...])
 */
export function listCodes() {
  return readdirSync(SRC_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => file.slice(0, -'.js'.length))
    .sort((a, b) => a.localeCompare(b))
}

/**
 * Imports a language module by canonical code.
 *
 * @param {string} code Canonical language code, already through canonicalCode()
 * @returns {Promise<Record<string, unknown>>} The module namespace
 * @throws {Error} If the code was never canonicalized, or the module is missing
 */
export async function importLanguage(code) {
  // Re-assert rather than trust the caller: this string builds a URL.
  if (!CODE_PATTERN.test(code)) throw new Error(`Refusing to import unvalidated code: ${code}`)
  return import(new URL(`${code}.js`, SRC_DIR).href)
}

/**
 * The forms a module actually exports, read from its real exports rather than
 * from source text — the exports are the behavior.
 *
 * @param {Record<string, unknown>} mod An imported language module
 * @returns {string[]} Supported form keys, in FORMS order
 */
export function exportedForms(mod) {
  return FORMS.filter(form => typeof mod[FORM_EXPORTS[form]] === 'function')
}

/**
 * Which of the three file kinds a module is (see docs/language-layers.md and
 * docs/bare-tag-aliases.md).
 *
 * @param {Record<string, unknown>} mod An imported language module
 * @returns {{kind: 'implementation' | 'alias' | 'profile', target: string | null}}
 */
export function describeKind(mod) {
  if (typeof mod.aliasOf === 'string') return { kind: 'alias', target: mod.aliasOf }
  if (typeof mod.variantOf === 'string') return { kind: 'profile', target: mod.variantOf }
  return { kind: 'implementation', target: null }
}

/**
 * Codes worth suggesting after an unknown one — same family first, then prefix
 * matches. Purely a nicety on the error path; never used to pick a language.
 *
 * @param {string} input The code the user typed
 * @param {string[]} codes Every known code
 * @returns {string[]} At most 8 suggestions
 */
export function suggestCodes(input, codes) {
  const needle = String(input).toLowerCase()
  const primary = needle.split('-')[0]

  const family = codes.filter(code => code.toLowerCase().split('-')[0] === primary)
  const prefix = codes.filter(code => code.toLowerCase().startsWith(primary.slice(0, 2)))

  return [...new Set([...family, ...prefix])].slice(0, 8)
}
