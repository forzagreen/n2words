/**
 * Language File Helpers
 *
 * Utilities for working with language files in tests and scripts.
 * Provides methods for extracting metadata from language files and modules.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { getClassName, getConverterName } from './language-naming.js'

// ============================================================================
// Constants
// ============================================================================

const LANGUAGE_DIR = './lib/languages'

/**
 * Base classes that language implementations can extend.
 * Maps class name to description for CLI/documentation use.
 */
export const BASE_CLASSES = {
  AbstractLanguage: 'Direct implementation (advanced)',
  GreedyScaleLanguage: 'Scale-based decomposition (most common)',
  HebrewLanguage: 'Hebrew-specific patterns',
  SlavicLanguage: 'Three-form pluralization (Slavic languages)',
  SouthAsianLanguage: 'Indian numbering system (lakh, crore)',
  TurkicLanguage: 'Turkish-style implicit "bir" rules'
}

// ============================================================================
// File-based Helpers
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
 * Gets the class name for a language file by reading its export.
 *
 * @param {string} code Language code
 * @returns {string|null} Class name, or null if not found
 */
export function getClassNameFromFile (code) {
  try {
    const content = readFileSync(`${LANGUAGE_DIR}/${code}.js`, 'utf8')
    const match = content.match(/export\s+class\s+(\w+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
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
    return content.includes('this.setOptions(')
  } catch {
    return false
  }
}

/**
 * Gets languages that support options.
 *
 * @returns {string[]} Language codes that accept options
 */
export function getLanguagesWithOptions () {
  return getLanguageCodes().filter(languageHasOptions)
}

// ============================================================================
// Module-based Helpers
// ============================================================================

/**
 * Gets the class name from a language module's exports.
 *
 * Language files export exactly one named class.
 *
 * @param {Object} languageModule The imported language module
 * @returns {string|null} The class name, or null if not found
 */
export function getClassNameFromModule (languageModule) {
  const exportNames = Object.keys(languageModule)
  return exportNames.length === 1 ? exportNames[0] : null
}

/**
 * Gets converter functions from an n2words module, keyed by language code.
 *
 * Uses CLDR to derive class names from language codes, avoiding file reads.
 *
 * @param {Object} n2wordsModule The imported n2words module
 * @returns {Object<string, Function>} Map of language codes to converter functions
 */
export function getConvertersByCode (n2wordsModule) {
  const converters = {}
  for (const code of getLanguageCodes()) {
    // Use CLDR to get class name, fall back to file if not in CLDR
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

/**
 * Gets the base class name for a language class.
 *
 * Handles regional variants by checking up to grandparent class.
 *
 * @param {Function} LanguageClass Language class constructor
 * @returns {string|null} Base class name
 */
export function getBaseClassName (LanguageClass) {
  const proto = Object.getPrototypeOf(LanguageClass)
  const parentName = proto?.name

  if (parentName in BASE_CLASSES) {
    return parentName
  }

  // Check grandparent for regional variants (e.g., FrenchBelgium → French → GreedyScaleLanguage)
  const grandProto = Object.getPrototypeOf(proto)
  const grandParentName = grandProto?.name

  if (grandParentName in BASE_CLASSES) {
    return grandParentName
  }

  return parentName
}
