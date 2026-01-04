/**
 * Language Helpers
 *
 * Utilities for working with language files and modules in tests and scripts.
 *
 * @module language-helpers
 */

import { readFileSync, readdirSync } from 'node:fs'
import { getClassName, getConverterName } from './language-naming.js'

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
 * Gets language codes that support options.
 *
 * @returns {string[]} Language codes that accept options
 */
export function getLanguagesWithOptions () {
  return getLanguageCodes().filter(languageHasOptions)
}

// ============================================================================
// File Content Helpers
// ============================================================================

/**
 * Gets the class name by reading a language file and looking at file structure.
 * For functional implementations, we derive from the language code.
 *
 * @param {string} code Language code
 * @returns {string|null} Class name, or null if not found
 */
export function getClassNameFromFile (code) {
  // For functional implementations, derive from language-naming.js
  return getClassName(code)
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

// ============================================================================
// Module Helpers
// ============================================================================

/**
 * Gets converter functions from n2words module, keyed by language code.
 *
 * @param {Object} n2wordsModule The imported n2words module
 * @returns {Object<string, Function>} Map of language codes to converter functions
 */
export function getConvertersByCode (n2wordsModule) {
  const converters = {}
  for (const code of getLanguageCodes()) {
    const className = getClassName(code) || getClassNameFromFile(code)
    if (className) {
      const converterName = getConverterName(className)
      if (n2wordsModule[converterName]) {
        converters[code] = n2wordsModule[converterName]
      }
    }
  }
  return converters
}
