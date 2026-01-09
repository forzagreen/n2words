/**
 * Language Naming Utilities
 *
 * Handles BCP 47 language code validation using the Intl API.
 *
 * @module language-naming
 */

// ============================================================================
// BCP 47 Validation
// ============================================================================

/**
 * Checks if a string is a valid BCP 47 language code.
 *
 * @param {string} code Language code to validate
 * @returns {boolean} True if valid
 * @example
 * isValidLanguageCode('en')       // true
 * isValidLanguageCode('zh-Hans')  // true
 * isValidLanguageCode('invalid')  // false
 */
export function isValidLanguageCode (code) {
  try {
    return Intl.getCanonicalLocales(code).length > 0
  } catch {
    return false
  }
}

/**
 * Gets the canonical form of a BCP 47 language code.
 *
 * @param {string} code Language code (may be non-canonical)
 * @returns {string|null} Canonical form, or null if invalid
 * @example
 * getCanonicalCode('en')       // 'en'
 * getCanonicalCode('zh-hans')  // 'zh-Hans' (case-corrected)
 * getCanonicalCode('invalid')  // null
 */
export function getCanonicalCode (code) {
  try {
    const canonical = Intl.getCanonicalLocales(code)
    return canonical.length > 0 ? canonical[0] : null
  } catch {
    return null
  }
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
