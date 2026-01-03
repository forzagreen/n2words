/**
 * Language File Helpers
 *
 * Utilities for working with language files in tests.
 * Provides consistent methods for extracting metadata from language modules and files.
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
// File-based Helpers (read from file content)
// ============================================================================

/**
 * Gets all language file paths.
 *
 * @returns {string[]} Array of language file paths
 */
export function getLanguageFiles () {
  return readdirSync(LANGUAGE_DIR)
    .filter(f => f.endsWith('.js'))
    .map(f => `${LANGUAGE_DIR}/${f}`)
}

/**
 * Extracts the class name from a language file by reading its content.
 *
 * @param {string} filePath Path to the language file
 * @returns {string|null} The class name, or null if not found
 */
export function getClassNameFromFile (filePath) {
  const content = readFileSync(filePath, 'utf8')
  const match = content.match(/export\s+class\s+(\w+)/)
  return match ? match[1] : null
}

/**
 * Checks if a language file uses options (has setOptions call in constructor).
 *
 * @param {string} filePath Path to the language file
 * @returns {boolean} True if language accepts options
 */
export function languageHasOptions (filePath) {
  const content = readFileSync(filePath, 'utf8')
  return content.includes('this.setOptions(')
}

/**
 * Gets metadata for all language files.
 *
 * @returns {Array<{file: string, filePath: string, className: string, hasOptions: boolean, code: string}>}
 */
export function getLanguageMetadata () {
  const files = readdirSync(LANGUAGE_DIR).filter(f => f.endsWith('.js'))

  return files.map(file => {
    const filePath = `${LANGUAGE_DIR}/${file}`
    const className = getClassNameFromFile(filePath)
    const hasOptions = languageHasOptions(filePath)
    const code = file.replace('.js', '')
    return { file, filePath, className, hasOptions, code }
  }).filter(lang => lang.className !== null)
}

// ============================================================================
// Module-based Helpers (work with imported modules)
// ============================================================================

/**
 * Extracts the class name from a language module's exports.
 * Language files export a single named class (e.g., `export class English`).
 *
 * @param {Object} languageModule The imported language module
 * @returns {string|null} The class name, or null if not found
 */
export function getClassNameFromModule (languageModule) {
  const exportNames = Object.keys(languageModule)
  // Language files export exactly one class
  return exportNames.length === 1 ? exportNames[0] : null
}

/**
 * Gets all converter functions from an n2words module.
 *
 * @param {Object} n2wordsModule The imported n2words module (import * as n2words)
 * @returns {Object<string, Function>} Map of converter names to functions
 *
 * @example
 * import * as n2words from '../../lib/n2words.js'
 * const converters = getConverters(n2words)
 * // { EnglishConverter: fn, FrenchConverter: fn, ... }
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
 * Gets the effective base class name for a language class.
 * Handles regional variants by checking grandparent class.
 *
 * @param {Function} LanguageClass Language class constructor
 * @returns {string|null} Base class name, or null if not a valid base
 *
 * @example
 * // Direct inheritance
 * getBaseClassName(English) // 'GreedyScaleLanguage'
 *
 * // Regional variant (FrenchBelgium → French → GreedyScaleLanguage)
 * getBaseClassName(FrenchBelgium) // 'GreedyScaleLanguage'
 */
export function getBaseClassName (LanguageClass) {
  const proto = Object.getPrototypeOf(LanguageClass)
  const baseClassName = proto?.name

  if (VALID_BASE_CLASSES.includes(baseClassName)) {
    return baseClassName
  }

  // Check grandparent for regional variants
  const grandProto = Object.getPrototypeOf(proto)
  const grandParentClassName = grandProto?.name
  if (VALID_BASE_CLASSES.includes(grandParentClassName)) {
    return grandParentClassName
  }

  return baseClassName
}
