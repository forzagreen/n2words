/**
 * Language Naming Utilities
 *
 * Handles naming conventions for n2words languages:
 * - BCP 47 language codes (e.g., 'en', 'zh-Hans', 'fr-BE')
 * - CLDR display names (e.g., 'English', 'Simplified Chinese', 'French (Belgium)')
 * - Class names (e.g., 'English', 'SimplifiedChinese', 'FrenchBelgium')
 * - Converter names (e.g., 'EnglishConverter', 'SimplifiedChineseConverter')
 *
 * Uses the Intl API for BCP 47 validation and CLDR name lookup.
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

// ============================================================================
// CLDR Display Names
// ============================================================================

/**
 * Gets the CLDR display name for a BCP 47 language code.
 *
 * @param {string} code BCP 47 language code
 * @returns {string|null} CLDR display name, or null if not recognized
 * @example
 * getCldrName('en')       // 'English'
 * getCldrName('zh-Hans')  // 'Simplified Chinese'
 * getCldrName('fr-BE')    // 'French (Belgium)'
 * getCldrName('hbo')      // null (Ancient Hebrew not in CLDR)
 */
export function getCldrName (code) {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
    const name = displayNames.of(code)

    // CLDR returns the code itself if not recognized
    if (!name || name === code) {
      return null
    }

    return name
  } catch {
    return null
  }
}

// ============================================================================
// Class Name Derivation
// ============================================================================

/**
 * Converts a CLDR display name to a PascalCase class name.
 *
 * Removes diacritics, parentheses, and non-alphanumeric characters.
 *
 * @param {string} cldrName CLDR display name
 * @returns {string} PascalCase class name
 * @example
 * cldrNameToClassName('English')              // 'English'
 * cldrNameToClassName('Simplified Chinese')   // 'SimplifiedChinese'
 * cldrNameToClassName('French (Belgium)')     // 'FrenchBelgium'
 * cldrNameToClassName('Norwegian Bokmål')     // 'NorwegianBokmal'
 */
export function cldrNameToClassName (cldrName) {
  return cldrName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^A-Za-z0-9\s]/g, '') // Remove non-alphanumeric except spaces
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Gets the expected class name for a BCP 47 language code.
 *
 * Combines CLDR lookup with PascalCase conversion.
 *
 * @param {string} code BCP 47 language code
 * @returns {string|null} Expected class name, or null if CLDR doesn't recognize the code
 * @example
 * getClassName('en')       // 'English'
 * getClassName('zh-Hans')  // 'SimplifiedChinese'
 * getClassName('fr-BE')    // 'FrenchBelgium'
 * getClassName('hbo')      // null (not in CLDR)
 */
export function getClassName (code) {
  const cldrName = getCldrName(code)
  return cldrName ? cldrNameToClassName(cldrName) : null
}

// ============================================================================
// Converter Name Derivation
// ============================================================================

/**
 * Gets the converter function name for a class name.
 *
 * @param {string} className Class name (e.g., 'English', 'SimplifiedChinese')
 * @returns {string} Converter name (e.g., 'EnglishConverter', 'SimplifiedChineseConverter')
 */
export function getConverterName (className) {
  return `${className}Converter`
}

/**
 * Gets the expected converter name for a BCP 47 language code.
 *
 * @param {string} code BCP 47 language code
 * @returns {string|null} Expected converter name, or null if CLDR doesn't recognize the code
 * @example
 * getConverterNameFromCode('en')       // 'EnglishConverter'
 * getConverterNameFromCode('zh-Hans')  // 'SimplifiedChineseConverter'
 * getConverterNameFromCode('hbo')      // null (not in CLDR)
 */
export function getConverterNameFromCode (code) {
  const className = getClassName(code)
  return className ? getConverterName(className) : null
}
