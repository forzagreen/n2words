/**
 * Abstract base class for language converters.
 *
 * What this class handles:
 * - Validates and normalizes caller input (`number | string | bigint`), rejecting NaN/invalid strings.
 * - Splits sign, whole, and decimal parts, caching the whole part for languages that need it.
 * - Delegates whole-number wording to `convertWholePart(wholeNumber)` implemented by subclasses.
 * - Converts decimals via `decimalDigitsToWords()`, preserving leading zeros and supporting per-digit mode when `convertDecimalsPerDigit` is true.
 *
 * What subclasses must provide:
 * - `convertWholePart(wholeNumber)` method implementation (required; abstract).
 * - `negativeWord` class property (word preceding negative numbers, e.g., "minus").
 * - `zeroWord` class property (word for digit 0, e.g., "zero").
 * - `decimalSeparatorWord` class property (word between whole and decimal, e.g., "point").
 * - `wordSeparator` class property (word separator in output, typically a space).
 * Optional: override `convertDecimalsPerDigit`, `digits`, or `convertDigitToWord()` for custom behavior.
 *
 * This class stays minimal; language grammar lives in subclasses.
 *
 * @abstract
 */
class AbstractLanguage {
  /**
   * Word that precedes negative numbers (e.g., "minus", "negative", "moins").
   * @type {string}
   */
  negativeWord = ''

  /**
   * Word that separates whole and decimal parts (e.g., "point", "virgule", "comma").
   * @type {string}
   */
  decimalSeparatorWord = ''

  /**
   * Word representation for the digit 0 (e.g., "zero", "zéro", "null").
   * @type {string}
   */
  zeroWord = ''

  /**
   * Character(s) used to separate words in the output (typically a space).
   * @type {string}
   */
  wordSeparator = ' '

  /**
   * Cached whole number portion from the most recent conversion.
   * Some languages need access to this value during conversion for
   * pluralization rules or special cases (e.g., Czech, Hebrew).
   * @type {bigint}
   */
  cachedWholeNumber = 0n

  /**
   * Whether to convert decimal digits individually rather than grouped.
   * - `true`: Each digit converted separately (e.g., "05" → "zero five")
   * - `false`: Leading zeros preserved, remaining grouped (e.g., "14" → "fourteen")
   * Used by languages like Japanese, Thai, Tamil, Telugu.
   * @type {boolean}
   */
  convertDecimalsPerDigit = false

  /**
   * Optional array of digit words for direct lookup in `convertDigitToWord()`.
   * - Length 10: indices 0–9 map directly to digit words
   * - Length 9: indices 0–8 map to words for digits 1–9
   * - `null`: Falls back to `convertWholePart()` for digit conversion
   * @type {string[]|null}
   */
  digits = null

  /**
   * Convert a single decimal digit (0-9) to its word representation.
   *
   * Default behavior:
   * - 0 returns the language's `zeroWord`
   * - If a `digits` array is present, use it for direct lookup
   *   - Length 10: indices 0–9 map directly
   *   - Length 9: indices 1–9 map via `idx - 1`
   * - Otherwise delegate to `convertWholePart(digit)`
   *
   * Subclasses may override this for custom logic.
   *
   * @protected
   * @param {bigint} digit A single digit value (0-9) as BigInt
   * @returns {string} The word representation of the digit
   */
  convertDigitToWord (digit) {
    const idx = Number(digit)
    if (idx === 0) return this.zeroWord

    if (Array.isArray(this.digits)) {
      if (this.digits.length === 10) {
        return this.digits[idx] ?? this.zeroWord
      }
      if (this.digits.length === 9) {
        return this.digits[idx - 1] ?? this.zeroWord
      }
    }

    return this.convertWholePart(digit)
  }

  /**
   * Convert the decimal fractional digits into words.
   *
  * Behavior depends on the `convertDecimalsPerDigit` class property:
   *
   * **Per-digit mode** (`convertDecimalsPerDigit: true`):
   * - Each decimal digit is converted individually using `convertDigitToWord()`
   * - Example: "05" -> [zero, 'five'], "14" -> ['one', 'four']
   * - Used by: Japanese, Thai, Tamil, Telugu
   *
   * **Grouped mode** (default, `convertDecimalsPerDigit: false`):
   * - Leading zeros are preserved as individual `zeroWord` entries
   * - Remaining digits are grouped and converted as a number
   * - Example: "05" -> [zero, 'five'], "14" -> ['fourteen']
   * - Used by: Most languages (English, Spanish, French, etc.)
   *
   * @protected
   * @param {string} decimalString The decimal digits as a string (e.g. `'05'` for 3.05).
   * @returns {Array<string>} Array of word tokens representing the fractional part.
   *
   * @example
   * // Per-digit mode
   * decimalDigitsToWords('05'); // -> [this.zeroWord, 'five']
   * decimalDigitsToWords('14'); // -> ['one', 'four']
   *
   * // Grouped mode
   * decimalDigitsToWords('05'); // -> [this.zeroWord, 'five']
   * decimalDigitsToWords('14'); // -> ['fourteen']
   */
  decimalDigitsToWords (decimalString) {
    const words = []
    const len = decimalString.length

    if (this.convertDecimalsPerDigit) {
      for (let i = 0; i < len; i++) {
        const decimalDigit = BigInt(decimalString[i])
        words.push(this.convertDigitToWord(decimalDigit))
      }
      return words
    }

    // Default grouped-decimal behavior with leading zero preservation
    let i = 0
    while (i < len && decimalString[i] === '0') {
      words.push(this.zeroWord)
      i++
    }

    if (i === len) return words

    const remainingDigits = decimalString.slice(i)
    words.push(this.convertWholePart(BigInt(remainingDigits)))

    return words
  }

  /**
   * Convert a numeric input into its language cardinal representation.
   *
   * This is the public entry point used by consumers. It normalizes the input
   * (accepting `number | string | bigint`), validates it, splits sign and
   * fractional parts, and delegates whole-number conversion to
   * `convertWholePart(BigInt)` and fractional conversion to `decimalDigitsToWords()`.
   *
   * Errors and validation:
   * - Passing `NaN` (as `number`) throws `TypeError`.
   * - Passing a non-numeric `string` throws `Error`.
   * - Passing an unsupported type throws `TypeError`.
   *
   * @public
   * @param {number|string|bigint} value Numeric input to convert. Strings may include a single `.` decimal marker.
   * @returns {string} The localized cardinal string.
   * @throws {TypeError|Error} For invalid input as described above.
   */
  convertToWords (value) {
    // Normalize and validate input
    const inputType = typeof value

    if (inputType === 'number') {
      if (Number.isNaN(value)) throw new TypeError('NaN is not an accepted number.')
      value = value.toString()
    } else if (inputType === 'string') {
      value = value.trim()
      if (value.length === 0 || Number.isNaN(Number(value))) { throw new Error('Invalid number format: "' + value + '"') }
    } else if (inputType !== 'bigint') {
      throw new TypeError(
        'Invalid variable type, expected number|string|bigint, received: ' + inputType
      )
    }

    const words = []

    // Detect negativity and strip sign for further processing.
    // Must check before type coercion for BigInt (comparison works but slice does not).
    let isNegative = false
    if (inputType === 'bigint') {
      if (value < 0n) {
        isNegative = true
        value = -value
      }
    } else {
      // For strings, check first character before normalization
      if (value[0] === '-') {
        isNegative = true
        value = value.slice(1)
      }
    }

    // Extract whole and decimal parts based on type.
    // BigInt has no decimal point; strings may contain a single '.'.
    // Default whole part to '0' if empty (e.g., '.5' -> '0' + '.5')
    let wholeNumber
    let decimalPart
    if (inputType === 'bigint') {
      wholeNumber = value
    } else {
      const decimalPointIndex = value.indexOf('.')
      if (decimalPointIndex === -1) {
        wholeNumber = BigInt(value)
      } else {
        const wholePartString = value.slice(0, decimalPointIndex) || '0'
        wholeNumber = BigInt(wholePartString)
        decimalPart = value.slice(decimalPointIndex + 1)
      }
    }

    // Cache whole number for languages that need it during conversion
    // (e.g., pluralization rules, special-case handling)
    this.cachedWholeNumber = wholeNumber

    // Build output word array: [negative?] whole [separator decimal?]
    // Join with language-specific wordSeparator at the end
    if (isNegative) words.push(this.negativeWord)

    // Add the whole number in written form
    words.push(this.convertWholePart(wholeNumber))

    // Append decimal portion if present (separator + fractional digits)
    if (decimalPart) {
      words.push(this.decimalSeparatorWord)
      words.push(...this.decimalDigitsToWords(decimalPart))
    }

    return words.join(this.wordSeparator)
  }

  /**
   * Convert a BigInt whole number to its cardinal word representation.
   *
   * This is a template method that subclasses MUST implement to provide
   * language-specific number conversion logic.
   *
   * @abstract
   * @param {bigint} wholeNumber The whole number part to convert
   * @returns {string} The cardinal representation in the target language
   */
  convertWholePart (wholeNumber) {
    throw new Error('convertWholePart() must be implemented by subclass')
  }
}

export default AbstractLanguage
