import { AbstractLanguage } from './abstract-language.js'

/**
 * Base class for Slavic and related languages with complex pluralization.
 *
 * This class provides a reusable implementation for languages that share:
 * - Three-form pluralization (singular/few/many)
 * - Gender-aware number forms (masculine/feminine for 1-9)
 * - Hundreds, tens, ones decomposition pattern
 * - Segment-based large number handling (thousands, millions, etc.)
 * - Inherits decimal handling from AbstractLanguage (supports both grouped and
 *   per-digit modes via the `usePerDigitDecimals` class property).
 *
 * Used by: Russian (ru), Czech (cs), Polish (pl), Ukrainian (uk), Serbian (sr-Latn),
 * Croatian (hr), Lithuanian (lt), Latvian (lv), Hebrew (he), and Biblical Hebrew (hbo).
 *
 * Subclasses MUST define these properties with language-specific vocabulary:
 * - `onesWords` - Object mapping 1-9 to masculine forms (or default forms)
 * - `onesFeminineWords` - Object mapping 1-9 to feminine forms (if gender distinction exists)
 * - `teensWords` - Object mapping 0-9 to teen numbers (10-19)
 * - `twentiesWords` - Object mapping 2-9 to tens (20-90)
 * - `hundredsWords` - Object mapping 1-9 to hundreds (100-900) or special hundreds handling
 * - `pluralForms` - Object mapping segment indices to [singular, few, many] plural forms
 *
 * Optional properties:
 * - `scaleGenders` - Object mapping segment indices to boolean (true = feminine scale word)
 *   If not defined, defaults to thousands (index 1) being feminine, others masculine.
 *
 * @abstract
 * @extends AbstractLanguage
 */
export class SlavicLanguage extends AbstractLanguage {
  // ============================================================================
  // Required Properties (subclasses must define)
  // ============================================================================

  /**
   * Masculine forms for digits 1-9 (or default forms if no gender distinction).
   *
   * @type {Object.<number, string>}
   */
  onesWords = {}

  /**
   * Feminine forms for digits 1-9 (if language has gender distinction).
   *
   * @type {Object.<number, string>}
   */
  onesFeminineWords = {}

  /**
   * Words for teen numbers (10-19).
   *
   * @type {Object.<number, string>}
   */
  teensWords = {}

  /**
   * Words for multiples of ten (20, 30, 40, etc.).
   *
   * @type {Object.<number, string>}
   */
  twentiesWords = {}

  /**
   * Words for hundreds (100, 200, 300, etc.) or special hundreds handling.
   *
   * @type {Object.<number, string>}
   */
  hundredsWords = {}

  /**
   * Plural forms for scale words (thousands, millions, billions, etc.).
   * Maps segment indices to [singular, few, many] forms.
   *
   * @type {Object.<number, string[]>}
   */
  pluralForms = {}

  // ============================================================================
  // Optional Properties (subclasses may override)
  // ============================================================================

  /**
   * Gender of each scale word.
   * Maps segment indices to boolean: true = feminine, false = masculine.
   * Default is empty (all masculine). Languages with feminine thousands
   * (Russian, Ukrainian, Serbian, Croatian) should set `{ 1: true }`.
   *
   * @type {Object.<number, boolean>}
   */
  scaleGenders = {}

  /**
   * Whether to omit "one" before scale words (e.g., "thousand" instead of "one thousand").
   * When true, 1000 becomes "tysiąc" (Polish) instead of "jeden tysiąc".
   * Used by Polish, Czech, and similar languages.
   *
   * @type {boolean}
   */
  omitOneBeforeScale = false

  // ============================================================================
  // Constructor
  // ============================================================================

  /**
   * Constructs a SlavicLanguage instance with optional configuration.
   *
   * @param {Object} [options] Configuration options.
   * @param {('masculine'|'feminine')} [options.gender='masculine'] Grammatical gender for number forms.
   */
  constructor (options = {}) {
    super()

    this.setOptions({
      gender: 'masculine'
    }, options)
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Converts a whole number to its word representation.
   *
   * This method implements the Slavic number construction algorithm:
   * 1. Split number into 3-digit segments from right to left (567, 234, 1 for 1,234,567)
   * 2. For each segment (processing left to right): convert hundreds, tens, ones
   * 3. Apply gender rules: feminine forms for thousands segment or when feminine=true
   * 4. Add appropriate pluralized scale word (thousand/million/billion/etc.)
   * 5. Join all parts with spaces
   *
   * @param {bigint} number The whole number to convert (non-negative).
   * @returns {string} The number in words.
   */
  integerToWords (number) {
    if (number === 0n) {
      return this.zeroWord
    }

    const words = []
    const segments = this.splitToSegments(number.toString(), 3)
    let segmentIndex = segments.length

    for (const segmentValue of segments) {
      segmentIndex = segmentIndex - 1

      if (segmentValue === 0n) {
        continue
      }

      const [onesDigit, tensDigit, hundredsDigit] = this.extractDigits(segmentValue)

      if (hundredsDigit > 0n) {
        words.push(this.hundredsWords[hundredsDigit])
      }

      if (tensDigit > 1n) {
        words.push(this.twentiesWords[tensDigit])
      }

      // Handle teens (10-19) or ones (1-9)
      if (tensDigit === 1n) {
        // Teens: use teensWords array directly
        words.push(this.teensWords[onesDigit])
      } else if (onesDigit > 0n) {
        // Skip "one" before scale words if omitOneBeforeScale is set
        // e.g., Polish says "tysiąc" not "jeden tysiąc" for 1000
        const shouldOmitOne = this.omitOneBeforeScale && segmentIndex > 0 && segmentValue === 1n

        if (!shouldOmitOne) {
          // Determine if feminine forms should be used:
          // 1. Check scaleGenders for this segment index (e.g., thousands = index 1)
          // 2. Also use feminine if user requested gender='feminine' for the ones segment
          const isScaleFeminine = this.scaleGenders[segmentIndex] === true
          const isFeminine = isScaleFeminine || (this.options.gender === 'feminine' && segmentIndex === 0)
          const onesArray = isFeminine ? this.onesFeminineWords : this.onesWords
          words.push(onesArray[onesDigit])
        }
      }

      // Add power word (thousand, million, etc.) with proper pluralization
      if (segmentIndex > 0) {
        words.push(this.pluralize(segmentValue, this.pluralForms[segmentIndex]))
      }
    }

    return words.join(' ')
  }

  // ============================================================================
  // Protected Methods (subclasses may call or override)
  // ============================================================================

  /**
   * Splits a number string into segments of specified size from right to left.
   *
   * Example: splitToSegments('1234567', 3) => [1n, 234n, 567n]
   * This represents: 1 million + 234 thousand + 567 ones
   *
   * @param {string} numberString The number as a string.
   * @param {number} segmentSize Segment size (typically 3 for thousands grouping).
   * @returns {bigint[]} Array of BigInt segments from highest to lowest scale.
   */
  splitToSegments (numberString, segmentSize) {
    const segments = []
    const stringLength = numberString.length

    if (stringLength > segmentSize) {
      const remainderLength = stringLength % segmentSize

      if (remainderLength > 0) {
        segments.push(BigInt(numberString.slice(0, remainderLength)))
      }

      for (let i = remainderLength; i < stringLength; i += segmentSize) {
        segments.push(BigInt(numberString.slice(i, i + segmentSize)))
      }
    } else {
      segments.push(BigInt(numberString))
    }

    return segments
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
  extractDigits (value) {
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
