/**
 * Language Helpers
 *
 * Utilities for working with language files and modules in tests and scripts.
 *
 * @module language-helpers
 */

import { readdirSync } from 'node:fs'

// ============================================================================
// Constants
// ============================================================================

const LANGUAGE_DIR = './src'

// ============================================================================
// Language Code Helpers
// ============================================================================

/**
 * Gets all language codes from language files.
 *
 * @returns {string[]} Language codes (e.g., ['en-US', 'fr-FR', 'zh-Hans-CN'])
 */
export function getLanguageCodes () {
  return readdirSync(LANGUAGE_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''))
}

// Form key -> the export a language provides when it supports that form.
const FORM_EXPORTS = {
  cardinal: 'toCardinal',
  ordinal: 'toOrdinal',
  currency: 'toCurrency'
}

/**
 * Gets the forms a language supports, read from the module's real exports
 * rather than by scanning source text. The exports ARE the behavior, so this
 * can't drift from comment or formatting changes.
 *
 * @param {string} code Language code (e.g. 'en-US')
 * @returns {Promise<Set<'cardinal'|'ordinal'|'currency'>>} Supported forms
 *   (empty if the module is missing or fails to import)
 */
export async function getExportedForms (code) {
  let mod
  try {
    mod = await import(`../../src/${code}.js`)
  } catch {
    return new Set()
  }

  return new Set(
    Object.entries(FORM_EXPORTS)
      .filter(([, exportName]) => typeof mod[exportName] === 'function')
      .map(([form]) => form)
  )
}
