import AbstractLanguage from './abstract-language.js'

/**
 * @typedef {string[]} SlavicPluralForms
 * Array of three plural forms for Slavic languages:
 * - [0]: Singular form (for numbers ending in 1, except 11: 1, 21, 31...)
 * - [1]: Few form (for numbers ending in 2-4, except 12-14: 2-4, 22-24...)
 * - [2]: Many form (for all other numbers: 0, 5-20, 25-30, 100, etc.)
 */

/**
 * @typedef {Object.<string, SlavicPluralForms>} SlavicThousandsMap
 * Mapping from power indices to their plural forms.
 * Example: { '0': ['тысяча', 'тысячи', 'тысяч'], '1': ['миллион', 'миллиона', 'миллионов'] }
 */

/**
 * Base class for Slavic and related languages with complex pluralization.
 *
 * This class provides a reusable implementation for languages that share:
 * - Three-form pluralization (singular/few/many)
 * - Gender-aware number forms (masculine/feminine for 1-9)
 * - Hundreds, tens, ones decomposition pattern
 * - Chunk-based large number handling (thousands, millions, etc.)
 * - Inherits decimal handling from AbstractLanguage (supports both grouped and
 *   per-digit modes via the `convertDecimalsPerDigit` class property).
 *
 * Used by: Russian (ru), Czech (cs), Polish (pl), Ukrainian (uk), Serbian (sr-Latn),
 * Croatian (hr), Lithuanian (lt), Latvian (lv), Hebrew (he), and Biblical Hebrew (hbo).
 *
 * Subclasses MUST define these properties with language-specific vocabulary:
 * - `ones` - Object mapping 1-9 to masculine forms (or default forms)
 * - `onesFeminine` - Object mapping 1-9 to feminine forms (if gender distinction exists)
 * - `tens` - Object mapping 0-9 to teen numbers (10-19)
 * - `twenties` - Object mapping 2-9 to tens (20-90)
 * - `hundreds` - Object mapping 1-9 to hundreds (100-900) or special hundreds handling
 * - `thousands` - Object mapping chunk indices to [singular, few, many] plural forms
 * - `feminine` - Boolean indicating if feminine forms should be used (optional, defaults to false)
 *
 * @abstract
 * @extends AbstractLanguage
 */
class SlavicLanguage extends AbstractLanguage {
  /**
   * Masculine forms for digits 1-9 (or default forms if no gender distinction).
   *
   * @type {Object.<number, string>}
   */
  ones = {}

  /**
   * Feminine forms for digits 1-9 (if language has gender distinction).
   *
   * @type {Object.<number, string>}
   */
  onesFeminine = {}

  /**
   * Words for teen numbers (10-19).
   *
   * @type {Object.<number, string>}
   */
  tens = {}

  /**
   * Words for multiples of ten (20, 30, 40, etc.).
   *
   * @type {Object.<number, string>}
   */
  twenties = {}

  /**
   * Words for hundreds (100, 200, 300, etc.) or special hundreds handling.
   *
   * @type {Object.<number, string>}
   */
  hundreds = {}

  /**
   * Scale words with pluralization for thousands, millions, etc.
   * Maps chunk indices to [singular, few, many] forms.
   *
   * @type {Object.<number, string[]>}
   */
  thousands = {}

  /**
   * Use feminine forms for numbers (affects 1-9).
   *
   * @type {boolean}
   */
  feminine

  /**
   * Initializes the Slavic language converter with language-specific options.
   *
   * @param {Object} [options={}] Configuration options.
   * @param {boolean} [options.feminine=false] Use feminine forms for numbers (affects gender agreement).
   */
  constructor (options = {}) {
    options = {
      ...{
        feminine: false
      },
      ...options
    }

    super()

    this.feminine = options.feminine
  }

  /**
   * Converts a whole number to its word representation.
   *
   * This method implements the Slavic number construction algorithm:
   * 1. Split number into 3-digit chunks from right to left (567, 234, 1 for 1,234,567)
   * 2. For each chunk (processing left to right): convert hundreds, tens, ones
   * 3. Apply gender rules: feminine forms for thousands chunk or when feminine=true
   * 4. Add appropriate pluralized scale word (thousand/million/billion/etc.)
   * 5. Join all parts with spaces
   *
   * @param {bigint} number The whole number to convert (non-negative).
   * @returns {string} The number in words.
   */
  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }

    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let chunkIndex = chunks.length

    for (const chunkValue of chunks) {
      chunkIndex = chunkIndex - 1

      if (chunkValue === 0n) {
        continue
      }

      const [onesDigit, tensDigit, hundredsDigit] = this.getDigits(chunkValue)

      if (hundredsDigit > 0n) {
        words.push(this.hundreds[hundredsDigit])
      }

      if (tensDigit > 1n) {
        words.push(this.twenties[tensDigit])
      }

      // Handle teens (10-19) or ones (1-9)
      if (tensDigit === 1n) {
        // Teens: use tens array directly
        words.push(this.tens[onesDigit])
      } else if (onesDigit > 0n) {
        // Ones: use feminine forms for thousands chunk or when feminine=true for ones chunk
        const onesArray =
          chunkIndex === 1 || (this.feminine && chunkIndex === 0)
            ? this.onesFeminine
            : this.ones
        words.push(onesArray[onesDigit])
      }

      // Add power word (thousand, million, etc.) with proper pluralization
      if (chunkIndex > 0) {
        words.push(this.pluralize(chunkValue, this.thousands[chunkIndex]))
      }
    }

    return words.join(' ')
  }

  /**
   * Splits a number string into chunks of X digits from right to left.
   *
   * Example: splitByX('1234567', 3) => [1n, 234n, 567n]
   * This represents: 1 million + 234 thousand + 567 ones
   *
   * @param {string} numberString The number as a string.
   * @param {number} chunkSize Chunk size (typically 3 for thousands grouping).
   * @returns {bigint[]} Array of BigInt chunks from highest to lowest scale.
   */
  splitByX (numberString, chunkSize) {
    const chunks = []
    const stringLength = numberString.length

    if (stringLength > chunkSize) {
      const remainderLength = stringLength % chunkSize

      if (remainderLength > 0) {
        chunks.push(BigInt(numberString.slice(0, remainderLength)))
      }

      for (let i = remainderLength; i < stringLength; i += chunkSize) {
        chunks.push(BigInt(numberString.slice(i, i + chunkSize)))
      }
    } else {
      chunks.push(BigInt(numberString))
    }

    return chunks
  }

  /**
   * Extracts individual digits from a number (units, tens, hundreds).
   *
   * Returns digits in reverse order: [ones, tens, hundreds]
   * Example: 456 => [6n, 5n, 4n]
   *
   * @param {bigint} value The number to extract digits from (0-999).
   * @returns {bigint[]} Array of [ones, tens, hundreds] as BigInts.
   */
  getDigits (value) {
    // Direct BigInt arithmetic is faster than string manipulation
    const onesPlace = value % 10n
    const tensPlace = (value / 10n) % 10n
    const hundredsPlace = value / 100n
    return [onesPlace, tensPlace, hundredsPlace]
  }

  /**
   * Selects the correct plural form based on Slavic pluralization rules.
   *
   * Slavic languages typically use three forms:
   * - Form 0 (singular): numbers ending in 1, except 11 (1, 21, 31, 101...)
   * - Form 1 (few): numbers ending in 2-4, except 12-14 (2-4, 22-24, 32-34...)
   * - Form 2 (many): all other numbers (0, 5-20, 25-30, 100, 111-119...)
   *
   * Examples using Russian тысяча (thousand):
   * - 1, 21, 31... ⇒ тысяча (form 0, singular)
   * - 2-4, 22-24, 32-34... ⇒ тысячи (form 1, few)
   * - 0, 5-20, 25-30, 100... ⇒ тысяч (form 2, many)
   *
   * @param {bigint} number The number to check.
   * @param {string[]} pluralForms Array of [singular, few, many] forms.
   * @returns {string} The appropriate form for the number.
   */
  pluralize (number, pluralForms) {
    const remainder100 = number % 100n
    const remainder10 = number % 10n

    // Check if in 11-19 range (special case)
    if (remainder100 >= 10n && remainder100 <= 20n) {
      return pluralForms[2] // Always use "many" form for 11-20
    }

    if (remainder10 === 1n) {
      return pluralForms[0] // Singular
    }

    if (remainder10 >= 2n && remainder10 <= 4n) {
      return pluralForms[1] // Few (2-4)
    }

    return pluralForms[2] // Many
  }
}

export default SlavicLanguage
