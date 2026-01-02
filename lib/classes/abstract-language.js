/**
 * Abstract base class for language converters.
 *
 * This class provides the framework for converting numbers to words in any language.
 * It handles the common conversion flow while delegating language-specific logic to subclasses.
 *
 * ## Responsibilities
 *
 * - Receives pre-validated and normalized input from the public API (n2words.js)
 * - Handles negative number prefixing via `negativeWord`
 * - Converts decimals via `decimalDigitsToWords()`, preserving leading zeros
 * - Delegates integer conversion to `integerToWords()` (implemented by subclasses)
 *
 * ## Required Subclass Implementation
 *
 * Subclasses MUST provide:
 * - `integerToWords(integerPart)` - Core conversion logic (abstract method)
 * - `negativeWord` - Word preceding negative numbers (e.g., "minus"))
 * - `zeroWord` - Word for the digit 0 (e.g., "zero")
 * - `decimalSeparatorWord` - Word between whole and decimal parts (e.g., "point")
 *
 * ## Optional Overrides
 *
 * Subclasses MAY override:
 * - `wordSeparator` - Character(s) between words (default: space, empty for CJK languages)
 * - `usePerDigitDecimals` - Enable per-digit decimal mode (default: false)
 * - `decimalIntegerToWords()` - Custom decimal conversion (e.g., Romanian masculine forms)
 * - `decimalDigitsToWords()` - Complete decimal conversion override
 * - `toWords()` - Override to capture integerPart for context-dependent rules (e.g., Czech)
 *
 * ## Input Contract
 *
 * Input validation and normalization happen at the public API boundary (n2words.js).
 * This class assumes it receives clean, pre-processed data via `toWords()`.
 *
 * @abstract
 */
export class AbstractLanguage {
  // ============================================================================
  // Private Fields
  // ============================================================================

  /**
   * Private storage for options.
   * @type {Object}
   */
  #options = {}

  // ============================================================================
  // Required Properties (subclasses must define)
  // ============================================================================

  /**
   * Word that precedes negative numbers (e.g., "minus", "negative", "moins").
   * @type {string}
   */
  negativeWord = ''

  /**
   * Word that separates integer and decimal parts (e.g., "point", "virgule", "comma").
   * @type {string}
   */
  decimalSeparatorWord = ''

  /**
   * Word representation for the digit 0 (e.g., "zero", "zéro", "null").
   * Used for zero values and leading zeros in decimals.
   * @type {string}
   */
  zeroWord = ''

  // ============================================================================
  // Optional Properties (subclasses may override)
  // ============================================================================

  /**
   * Character(s) used to separate words in the output.
   *
   * Defaults to a single space. Set to empty string for languages without
   * word separators (e.g., Japanese, Thai, Chinese).
   *
   * @type {string}
   */
  wordSeparator = ' '

  /**
   * Whether to convert decimal digits individually rather than grouped.
   *
   * - `false` (default): Leading zeros preserved, remaining digits grouped as a number
   *   - Example: "05" → ["zero", "five"], "14" → ["fourteen"]
   *   - Used by: English, Spanish, French, German, etc.
   *
   * - `true`: Each digit converted separately
   *   - Example: "05" → ["zero", "five"], "14" → ["one", "four"]
   *   - Used by: Japanese, Thai, Tamil, Telugu, Greek, Hebrew, Filipino
   *
   * @type {boolean}
   */
  usePerDigitDecimals = false

  // ============================================================================
  // Public Accessors
  // ============================================================================

  /**
   * Read-only access to options set via `setOptions()`.
   * @type {Object}
   */
  get options () {
    return this.#options
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Converts pre-normalized numeric components to words.
   *
   * This is the main entry point called by the public API (makeConverter in n2words.js).
   * It assembles the final word representation from the provided components.
   *
   * **Caller contract (enforced by makeConverter):**
   * - `integerPart` is a non-negative BigInt (>= 0n)
   * - `decimalPart` is a string of digits only (no sign, no decimal point)
   * - `isNegative` reflects the original input sign
   *
   * **Conversion flow:**
   * 1. Prepend negative word if applicable
   * 2. Convert integer part via `integerToWords()`
   * 3. If decimals present: append separator and decimal words
   * 4. Join all parts with `wordSeparator`
   *
   * Subclasses needing access to the integer part during decimal conversion
   * (e.g., for context-dependent separator words) should override this
   * method to cache the value before calling super.toWords().
   *
   * @public
   * @param {boolean} isNegative Whether the original number was negative
   * @param {bigint} integerPart The integer part (always non-negative)
   * @param {string} [decimalPart] - Decimal digits if present (e.g., "14" for 3.14)
   * @returns {string} The localized cardinal string
   */
  toWords (isNegative, integerPart, decimalPart) {
    const words = []

    if (isNegative) words.push(this.negativeWord)

    words.push(this.integerToWords(integerPart))

    if (decimalPart) {
      words.push(this.decimalSeparatorWord)
      words.push(...this.decimalDigitsToWords(decimalPart))
    }

    return words.join(this.wordSeparator)
  }

  // ============================================================================
  // Abstract Methods (subclasses must implement)
  // ============================================================================

  /**
   * Converts a BigInt integer part to its cardinal word representation.
   *
   * This is the core template method that subclasses MUST implement to provide
   * language-specific number conversion logic.
   *
   * @abstract
   * @param {bigint} integerPart The integer part to convert (always >= 0n)
   * @returns {string} The cardinal representation in the target language
   * @throws {Error} If not implemented by subclass
   */
  integerToWords (integerPart) {
    throw new Error('integerToWords() must be implemented by subclass')
  }

  // ============================================================================
  // Protected Methods (subclasses may override or call)
  // ============================================================================

  /**
   * Sets options by merging language defaults with user-provided options.
   *
   * Merges defaults first, then user options (later keys override earlier ones).
   * Stores the result in the private `#options` field, accessible via the
   * read-only `options` getter.
   *
   * @protected
   * @param {Object} [defaults={}] - Default option values for the language
   * @param {Object} [userOptions={}] - Runtime options supplied by the caller
   *
   * @example
   * constructor(options = {}) {
   *   super()
   *   this.setOptions({ gender: 'masculine' }, options)
   * }
   */
  setOptions (defaults = {}, userOptions = {}) {
    this.#options = {
      ...defaults,
      ...userOptions
    }
  }

  /**
   * Converts an integer to words in decimal context.
   *
   * By default, delegates to `integerToWords()`. Override this method
   * when decimal conversion requires different behavior than integer conversion.
   *
   * Called with:
   * - Single digits (0-9) when `usePerDigitDecimals = true`
   * - Grouped numbers when `usePerDigitDecimals = false`
   *
   * **Use cases for overriding:**
   * - Romanian: Decimals always use masculine forms regardless of gender option
   * - Languages with different plural/gender rules for decimal vs integer parts
   *
   * @protected
   * @param {bigint} integerPart The integer to convert (single digit or grouped)
   * @returns {string} The word representation for use in decimal context
   */
  decimalIntegerToWords (integerPart) {
    return this.integerToWords(integerPart)
  }

  /**
   * Converts decimal fractional digits into an array of words.
   *
   * Leading zeros are always preserved individually. The remaining digits
   * are converted based on `usePerDigitDecimals`:
   *
   * - `false` (default): Remaining digits grouped as a single number
   *   - "05" → ["zero", "five"], "14" → ["fourteen"]
   *
   * - `true`: Each remaining digit converted separately
   *   - "05" → ["zero", "five"], "14" → ["one", "four"]
   *
   * @protected
   * @param {string} decimalPart Decimal digits as string (e.g., "05" for 3.05)
   * @returns {string[]} Array of word tokens for the fractional part
   */
  decimalDigitsToWords (decimalPart) {
    const words = []

    // Always preserve leading zeros individually
    let i = 0
    while (i < decimalPart.length && decimalPart[i] === '0') {
      words.push(this.zeroWord)
      i++
    }

    const remainder = decimalPart.slice(i)
    if (!remainder) return words

    // Convert remainder: per-digit or as single number
    if (this.usePerDigitDecimals) {
      for (const char of remainder) {
        words.push(this.decimalIntegerToWords(BigInt(char)))
      }
    } else {
      words.push(this.decimalIntegerToWords(BigInt(remainder)))
    }

    return words
  }
}
