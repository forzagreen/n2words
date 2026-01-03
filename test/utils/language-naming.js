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
 * Validates an IETF BCP 47 language code.
 *
 * Uses the Intl API to check if the code is valid and returns its canonical form.
 *
 * @param {string} code Language code to validate
 * @returns {{ valid: boolean, canonical: string|null, error: string|null }}
 * @example
 * validateLanguageCode('en')        // { valid: true, canonical: 'en', error: null }
 * validateLanguageCode('zh-hans')   // { valid: true, canonical: 'zh-Hans', error: null }
 * validateLanguageCode('invalid')   // { valid: false, canonical: null, error: '...' }
 */
export function validateLanguageCode (code) {
  try {
    const canonical = Intl.getCanonicalLocales(code)

    if (canonical.length === 0) {
      return {
        valid: false,
        canonical: null,
        error: `Invalid BCP 47 language tag: ${code}`
      }
    }

    return {
      valid: true,
      canonical: canonical[0],
      error: null
    }
  } catch (error) {
    return {
      valid: false,
      canonical: null,
      error: `Invalid BCP 47 language tag: ${code} (${error.message})`
    }
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
