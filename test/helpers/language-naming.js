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
 * isValidLanguageCode('en-US')       // true
 * isValidLanguageCode('zh-Hans-CN')  // true
 * isValidLanguageCode('invalid')  // false
 */
export function isValidLanguageCode(code) {
  try {
    return Intl.getCanonicalLocales(code).length > 0
  }
  catch {
    return false
  }
}

/**
 * Gets the canonical form of a BCP 47 language code.
 *
 * @param {string} code Language code (may be non-canonical)
 * @returns {string|null} Canonical form, or null if invalid
 * @example
 * getCanonicalCode('en-US')    // 'en-US'
 * getCanonicalCode('zh-hans-cn')  // 'zh-Hans-CN' (case-corrected)
 * getCanonicalCode('invalid')  // null
 */
export function getCanonicalCode(code) {
  try {
    const canonical = Intl.getCanonicalLocales(code)
    return canonical.length > 0 ? canonical[0] : null
  }
  catch {
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
 * normalizeCode('en-US')       // 'enUS'
 * normalizeCode('zh-Hans-CN')  // 'zhHansCN'
 * normalizeCode('fr-BE')       // 'frBE'
 */
export function normalizeCode(code) {
  return code.replace(/-([a-zA-Z])/g, (_, letter) => letter.toUpperCase())
}

// ============================================================================
// CLDR / Intl.DisplayNames
// ============================================================================

/**
 * Display names for valid BCP 47 codes that CLDR doesn't know. The single
 * source for these — the LANGUAGES.md generator and lang:add both resolve
 * names through getLanguageName, so an entry here covers every consumer.
 */
export const LANGUAGE_NAME_OVERRIDES = {
  'hbo-IL': 'Biblical Hebrew (Israel)',
}

/**
 * Gets the human-readable language name — from the overrides for codes CLDR
 * doesn't know, otherwise from CLDR via Intl.DisplayNames.
 *
 * @param {string} code BCP 47 language code
 * @returns {string|null} Language name in English, or null if unknown
 * @example
 * getLanguageName('en-US')       // 'American English'
 * getLanguageName('zh-Hans-CN')  // 'Simplified Chinese (China)'
 * getLanguageName('hbo-IL')      // 'Biblical Hebrew (Israel)' (override; not in CLDR)
 */
export function getLanguageName(code) {
  if (LANGUAGE_NAME_OVERRIDES[code]) {
    return LANGUAGE_NAME_OVERRIDES[code]
  }
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
    const name = displayNames.of(code)
    // Intl.DisplayNames returns the code itself if not found
    return name && name !== code ? name : null
  }
  catch {
    return null
  }
}
