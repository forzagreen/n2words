/**
 * BCP 47 Language Code Utilities
 *
 * Provides validation and class name derivation for IETF BCP 47 language tags.
 * Used by both the add-language script and tests.
 *
 * @module bcp47
 */

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

/**
 * Gets the expected class name from a BCP 47 code using CLDR display names.
 *
 * Converts the CLDR language name to PascalCase, removing diacritics and
 * non-alphanumeric characters.
 *
 * @param {string} code BCP 47 language code
 * @returns {string|null} Expected PascalCase class name, or null if CLDR doesn't recognize the code
 * @example
 * getExpectedClassName('en')       // 'English'
 * getExpectedClassName('zh-Hans')  // 'SimplifiedChinese'
 * getExpectedClassName('nb')       // 'NorwegianBokmal'
 * getExpectedClassName('hbo')      // null (not recognized by CLDR)
 */
export function getExpectedClassName (code) {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
    const cldrName = displayNames.of(code)

    // CLDR doesn't recognize this code
    if (!cldrName || cldrName === code) {
      return null
    }

    // Convert "Norwegian Bokmål" -> "NorwegianBokmal"
    return cldrName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^A-Za-z0-9\s]/g, '') // Remove non-alphanumeric except spaces
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  } catch {
    return null
  }
}
