/**
 * Language File Helpers
 *
 * Utilities for working with language files in tests and scripts.
 * Provides methods for extracting metadata from language files and modules.
 */

import { readFileSync, readdirSync } from 'node:fs'

// ============================================================================
// Constants
// ============================================================================

const LANGUAGE_DIR = './lib/languages'

/**
 * Valid base classes that language implementations can extend.
 */
export const VALID_BASE_CLASSES = [
  'AbstractLanguage',
  'GreedyScaleLanguage',
  'HebrewLanguage',
  'SlavicLanguage',
  'SouthAsianLanguage',
  'TurkicLanguage'
]

// ============================================================================
// File-based Helpers
// ============================================================================

/**
 * Gets metadata for all language files.
 *
 * Reads each language file once and extracts:
 * - code: Language code from filename (e.g., 'en', 'zh-Hans')
 * - className: Exported class name (e.g., 'English', 'SimplifiedChinese')
 * - hasOptions: Whether the language accepts options
 *
 * @returns {Array<{code: string, className: string, hasOptions: boolean}>}
 */
export function getLanguageMetadata () {
  return readdirSync(LANGUAGE_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const code = file.replace('.js', '')
      const content = readFileSync(`${LANGUAGE_DIR}/${file}`, 'utf8')

      // Extract class name from export statement
      const classMatch = content.match(/export\s+class\s+(\w+)/)
      const className = classMatch ? classMatch[1] : null

      // Check for options support
      const hasOptions = content.includes('this.setOptions(')

      return { code, className, hasOptions }
    })
    .filter(lang => lang.className !== null)
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
 * Gets converter functions from an n2words module.
 *
 * @param {Object} n2wordsModule The imported n2words module
 * @returns {Object<string, Function>} Map of converter names to functions
 */
export function getConverters (n2wordsModule) {
  const converters = {}
  for (const [key, value] of Object.entries(n2wordsModule)) {
    if (key.endsWith('Converter')) {
      converters[key] = value
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

  if (VALID_BASE_CLASSES.includes(parentName)) {
    return parentName
  }

  // Check grandparent for regional variants (e.g., FrenchBelgium → French → GreedyScaleLanguage)
  const grandProto = Object.getPrototypeOf(proto)
  const grandParentName = grandProto?.name

  if (VALID_BASE_CLASSES.includes(grandParentName)) {
    return grandParentName
  }

  return parentName
}
