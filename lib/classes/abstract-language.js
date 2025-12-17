/**
 * Abstract base class for language converters.
 *
 * Responsibilities provided by this class:
 * - Validate and normalize caller input (`number | string | bigint`).
 * - Handle sign (negative numbers) and delegate whole-number conversion to
 *   the language-specific `toCardinal()` implementation.
 * - Convert decimal portions consistently via `decimalToCardinal()` where
 *   leading zeros are preserved as the language's `zero` word.
 *
 * Subclasses MUST implement `toCardinal(wholeNumber)` which converts a BigInt
 * whole-number into the language's words. That method is invoked by
 * `floatToCardinal()` after input normalization.
 *
 * This class is intentionally small and focused on cross-language concerns;
 * language-specific grammar and composition live in subclasses.
 *
 * @abstract
 * @namespace n2words.classes
 */
class AbstractLanguage {
  #negativeWord
  #separatorWord
  #zero
  #spaceSeparator
  #wholeNumber

  /**
   * Initializes the language converter.
   *
   * @param {Object} options Configuration options for the language.
   * @param {string} [options.negativeWord=''] Word that precedes a negative number (e.g., "minus", "moins").
   * @param {string} [options.separatorWord=''] Word that separates integer and decimal parts (e.g., "point", "virgule").
   * @param {string} [options.zero=''] Word for the digit 0 (e.g., "zero", "zéro").
   * @param {string} [options.spaceSeparator=' '] Character(s) that separate words in output.
   */
  constructor (options) {
    // Merge supplied options with defaults
    options = Object.assign(
      {
        negativeWord: '',
        separatorWord: '',
        zero: '',
        spaceSeparator: ' '
      },
      options
    )

    // Make options available to class
    this.#negativeWord = options.negativeWord
    this.#separatorWord = options.separatorWord
    this.#zero = options.zero
    this.#spaceSeparator = options.spaceSeparator
  }

  /**
   * Gets the word that precedes negative numbers.
   *
   * @type {string}
   * @readonly
   */
  get negativeWord () {
    return this.#negativeWord
  }

  /**
   * Gets the word that separates integer and decimal portions.
   *
   * @type {string}
   * @readonly
   */
  get separatorWord () {
    return this.#separatorWord
  }

  /**
   * Gets the word representation for zero.
   *
   * @type {string}
   * @readonly
   */
  get zero () {
    return this.#zero
  }

  /**
   * Gets the character(s) used to separate words in the output.
   *
   * @type {string}
   * @readonly
   */
  get spaceSeparator () {
    return this.#spaceSeparator
  }

  /**
   * Gets the whole number portion of the most recent conversion (excluding decimal part).
   *
   * Some languages may need access to the whole number value during conversion
   * (e.g., to apply pluralization rules or handle special cases). This property caches
   * the value after it has been extracted and validated from the input.
   *
   * @type {bigint}
   * @readonly
   */
  get wholeNumber () {
    return this.#wholeNumber
  }

  /**
   * Convert the decimal fractional digits into words.
   *
   * Behavior rules:
   * - Leading zeros in the fractional part are preserved and emitted as the
   *   language's `zero` word. Example: fractional `"005"` -> `['zero','zero',... ]`.
   * - After any leading zeros, the remainder of the fractional digits are
   *   converted by delegating to `toCardinal(BigInt(remainingDigits))`. This
   *   yields language-appropriate grouping for the remaining digits.
   *
   * @protected
   * @param {string} decimalString The decimal digits as a string (e.g. `'05'` for 3.05).
   * @returns {Array<string>} Array of word tokens representing the fractional part.
   *
   * @example
   * decimalToCardinal('05'); // -> [this.zero, 'five']
   */
  decimalToCardinal (decimalString) {
    const words = []
    const len = decimalString.length

    // Add a word for each leading zero in the decimal portion
    let i = 0
    while (i < len && decimalString[i] === '0') {
      words.push(this.zero)
      i++
    }

    // If all digits were zeros, return the accumulated zero words (e.g. '00' -> ['zero','zero'])
    if (i === len) return words

    // Convert the remaining decimal digits as a whole number and append the resulting word(s).
    // Use BigInt to preserve exact integer semantics for very long fractional parts.
    const remainingDigits = decimalString.slice(i)
    words.push(this.toCardinal(BigInt(remainingDigits)))

    return words
  }

  /**
   * Convert a numeric input into its language cardinal representation.
   *
   * This is the public entry point used by consumers. It normalizes the input
   * (accepting `number | string | bigint`), validates it, splits sign and
   * fractional parts, and delegates whole-number conversion to
   * `toCardinal(BigInt)` and fractional conversion to `decimalToCardinal()`.
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
    this.#wholeNumber = wholeNumber

    // Build output word array: [negative?] whole [separator decimal?]
    // Join with language-specific spaceSeparator at the end
    if (isNegative) words.push(this.negativeWord)

    // Add the whole number in written form
    words.push(this.toCardinal(wholeNumber))

    // Append decimal portion if present (separator + fractional digits)
    if (decimalNumber) {
      words.push(this.separatorWord)
      words.push(...this.decimalToCardinal(decimalNumber))
    }

    return words.join(this.spaceSeparator)
  }
}

export default AbstractLanguage
