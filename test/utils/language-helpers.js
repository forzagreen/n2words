/**
 * Language Helpers
 *
 * Utilities for working with language files and modules in tests and scripts.
 *
 * @module language-helpers
 */

import { readFileSync, readdirSync } from 'node:fs'

// ============================================================================
// Constants
// ============================================================================

const LANGUAGE_DIR = './lib/languages'

// ============================================================================
// Language Code Helpers
// ============================================================================

/**
 * Gets all language codes from language files.
 *
 * @returns {string[]} Language codes (e.g., ['en', 'fr', 'zh-Hans'])
 */
export function getLanguageCodes () {
  return readdirSync(LANGUAGE_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''))
}

/**
 * Normalizes a BCP 47 language code to a valid JS identifier.
 * Removes hyphens and capitalizes the following letter (camelCase).
 *
 * @param {string} code BCP 47 language code (e.g., 'zh-Hans', 'fr-BE')
 * @returns {string} Normalized identifier (e.g., 'zhHans', 'frBE')
 * @example
 * normalizeCode('en')       // 'en'
 * normalizeCode('zh-Hans')  // 'zhHans'
 * normalizeCode('fr-BE')    // 'frBE'
 */
export function normalizeCode (code) {
  return code.replace(/-([a-zA-Z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Gets language codes that support options.
 *
 * @returns {string[]} Language codes that accept options
 */
export function getLanguagesWithOptions () {
  return getLanguageCodes().filter(languageHasOptions)
}

/**
 * Checks if a language supports options by reading its file.
 *
 * @param {string} code Language code
 * @returns {boolean} True if language accepts options
 */
export function languageHasOptions (code) {
  try {
    const content = readFileSync(`${LANGUAGE_DIR}/${code}.js`, 'utf8')
    // Functional implementations accept options as second parameter to toWords
    return content.includes('function toWords (value, options')
  } catch {
    return false
  }
}
