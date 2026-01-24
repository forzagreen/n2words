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

const LANGUAGE_DIR = './src'

// ============================================================================
// Language Code Helpers
// ============================================================================

/**
 * Gets all language codes from language files.
 *
 * @returns {string[]} Language codes (e.g., ['en-US', 'fr', 'zh-Hans-CN'])
 */
export function getLanguageCodes () {
  return readdirSync(LANGUAGE_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''))
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
    // Functional implementations accept options as second parameter to toCardinal
    return content.includes('function toCardinal (value, options')
  } catch {
    return false
  }
}
