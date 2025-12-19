/**
 * Abstract base class for language converters.
 *
 * Responsibilities provided by this class:
 * - Validate and normalize caller input (`number | string | bigint`).
 * - Handle sign (negative numbers) and delegate whole-number conversion to
 *   the language-specific `toCardinalWords()` implementation.
 * - Convert decimal portions via `decimalToCardinal()` with two modes:
 *   - Default: Leading zeros preserved, remaining digits grouped as number
 *   - Per-digit: Each decimal digit converted individually (set `usePerDigitDecimals = true` as a class property)
 *
 * Subclasses MUST implement `toCardinalWords(wholeNumber)` which converts a BigInt
 * whole-number into the language's words. That method is invoked by
 * `floatToCardinal()` after input normalization.
 *
 * This class is intentionally small and focused on cross-language concerns;
 * language-specific grammar and composition live in subclasses.
 *
 * @abstract
 */
class AbstractLanguage {
  negativeWord = ''
  separatorWord = ''
  zeroWord = ''
  spaceSeparator = ' '
  wholeNumber = 0n
  usePerDigitDecimals = false

  /**
   * Convert a single decimal digit (0-9) to its word representation.
   *
   * Default behavior:
   * - 0 returns the language's `zeroWord`
   * - If a `digits` array is present, use it for direct lookup
   *   - Length 10: indices 0–9 map directly
   *   - Length 9: indices 1–9 map via `idx - 1`
   * - Otherwise delegate to `toCardinalWords(digit)`
   *
   * Subclasses may override this for custom logic.
   *
   * @protected
   * @param {bigint} digit A single digit value (0-9) as BigInt
   * @returns {string} The word representation of the digit
   */
  digitToWord (digit) {
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

    return this.toCardinalWords(digit)
  }

  /**
   * Convert the decimal fractional digits into words.
   *
  * Behavior depends on the `usePerDigitDecimals` class property:
   *
   * **Per-digit mode** (`usePerDigitDecimals: true`):
   * - Each decimal digit is converted individually using `digitToWord()`
   * - Example: "05" -> [zero, 'five'], "14" -> ['one', 'four']
   * - Used by: Japanese, Thai, Tamil, Telugu
   *
   * **Grouped mode** (default, `usePerDigitDecimals: false`):
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
   * decimalToCardinal('05'); // -> [this.zeroWord, 'five']
   * decimalToCardinal('14'); // -> ['one', 'four']
   *
   * // Grouped mode
   * decimalToCardinal('05'); // -> [this.zeroWord, 'five']
   * decimalToCardinal('14'); // -> ['fourteen']
   */
  decimalToCardinal (decimalString) {
    const words = []
    const len = decimalString.length

    if (this.usePerDigitDecimals) {
      for (let i = 0; i < len; i++) {
        const digitValue = BigInt(decimalString[i])
        words.push(this.digitToWord(digitValue))
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
    words.push(this.toCardinalWords(BigInt(remainingDigits)))

    return words
  }

  /**
   * Convert a numeric input into its language cardinal representation.
   *
   * This is the public entry point used by consumers. It normalizes the input
   * (accepting `number | string | bigint`), validates it, splits sign and
   * fractional parts, and delegates whole-number conversion to
   * `toCardinalWords(BigInt)` and fractional conversion to `decimalToCardinal()`.
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
  floatToCardinal (value) {
    // Normalize and validate input
    const valueType = typeof value

    if (valueType === 'number') {
      if (Number.isNaN(value)) throw new TypeError('NaN is not an accepted number.')
      value = value.toString()
    } else if (valueType === 'string') {
      value = value.trim()
      if (value.length === 0 || Number.isNaN(Number(value))) { throw new Error('Invalid number format: "' + value + '"') }
    } else if (valueType !== 'bigint') {
      throw new TypeError(
        'Invalid variable type, expected number|string|bigint, received: ' + valueType
      )
    }

    const words = []

    // Detect negativity and strip sign for further processing.
    // Must check before type coercion for BigInt (comparison works but slice does not).
    let isNegative = false
    if (valueType === 'bigint') {
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
    let decimalNumber
    if (valueType === 'bigint') {
      wholeNumber = value
    } else {
      const dotIndex = value.indexOf('.')
      if (dotIndex === -1) {
        wholeNumber = BigInt(value)
      } else {
        const wholePart = value.slice(0, dotIndex) || '0'
        wholeNumber = BigInt(wholePart)
        decimalNumber = value.slice(dotIndex + 1)
      }
    }

    // Cache whole number for languages that need it during conversion
    // (e.g., pluralization rules, special-case handling)
    this.wholeNumber = wholeNumber

    // Build output word array: [negative?] whole [separator decimal?]
    // Join with language-specific spaceSeparator at the end
    if (isNegative) words.push(this.negativeWord)

    // Add the whole number in written form
    words.push(this.toCardinalWords(wholeNumber))

    // Append decimal portion if present (separator + fractional digits)
    if (decimalNumber) {
      words.push(this.separatorWord)
      words.push(...this.decimalToCardinal(decimalNumber))
    }

    return words.join(this.spaceSeparator)
  }
}

export default AbstractLanguage
