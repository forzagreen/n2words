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
