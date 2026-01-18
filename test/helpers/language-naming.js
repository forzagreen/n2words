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

// ============================================================================
// CLDR / Intl.DisplayNames
// ============================================================================

/**
 * Gets the human-readable language name from CLDR via Intl.DisplayNames.
 *
 * @param {string} code BCP 47 language code
 * @returns {string|null} Language name in English, or null if not in CLDR
 * @example
 * getLanguageName('en')       // 'English'
 * getLanguageName('zh-Hans')  // 'Simplified Chinese'
 * getLanguageName('hbo')      // null (not in CLDR)
 */
export function getLanguageName (code) {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
    const name = displayNames.of(code)
    // Intl.DisplayNames returns the code itself if not found
    return name && name !== code ? name : null
  } catch {
    return null
  }
}

/**
 * Checks if a language code is known in CLDR.
 * Uses Intl.DisplayNames which is backed by CLDR data.
 *
 * Note: Valid BCP 47 codes may not be in CLDR (e.g., 'hbo' for Ancient Hebrew).
 *
 * @param {string} code BCP 47 language code
 * @returns {boolean} True if the code has a CLDR entry
 * @example
 * isInCLDR('en')   // true
 * isInCLDR('hbo')  // false (valid BCP 47 but not in CLDR)
 */
export function isInCLDR (code) {
  return getLanguageName(code) !== null
}
