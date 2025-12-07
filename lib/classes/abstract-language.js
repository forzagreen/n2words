/**
 * Base class for language implementations.
 *
 * Provides common decimal handling and input validation. Languages extending this class
 * must implement the `toCardinal()` method to handle whole number conversion.
 *
 * @abstract
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
    options = Object.assign({
      negativeWord: '',
      separatorWord: '',
      zero: '',
      spaceSeparator: ' '
    }, options)

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
   * @type {bigint}
   * @readonly
   */
  get wholeNumber () {
    return this.#wholeNumber
  }

  /**
   * Converts the decimal portion of a number to words.
   *
   * Leading zeros are converted to the word for zero, preserving precision.
   * Remaining digits are converted as a whole number.
   *
   * @param {string} decimal The decimal portion as a string (e.g., "05" from 3.05).
   * @returns {Array<string>} Array of words representing each digit (e.g., ['zero', 'five']).
   *
   * @example
   * decimalToCardinal('05'); // ['zero', 'five']
   * decimalToCardinal('123'); // ['one', 'hundred', 'twenty-three'] (for English)
   */
  decimalToCardinal (decimal) {
    const words = []

    // Add a word for each leading zero in the decimal portion
    let i = 0
    for (; i < decimal.length && decimal[i] === '0'; i++) {
      words.push(this.zero)
    }

    // If all digits were zeros, return the accumulated zero words
    if (i === decimal.length) return words

    // Convert the remaining decimal digits as a whole number and append
    return words.concat(this.toCardinal(BigInt(decimal)))
  }

  /**
   * Converts a number (integer or decimal string) to its cardinal word representation.
   *
   * Handles:
   * - Multiple input types: `number`, `string`, `bigint`
   * - Negative numbers (prepends `negativeWord`)
   * - Decimal numbers (splits into whole and decimal parts)
   * - Input validation and error reporting
   *
   * @param {number|string|bigint} value Number to convert. Can include decimal point.
   * @returns {string} Value in written word format.
   * @throws {TypeError} If value is NaN, invalid type, or invalid string format.
   * @throws {Error} If string value is not a valid number.
   *
   * @example
   * floatToCardinal(42); // 'forty-two' (requires language implementation)
   * floatToCardinal('3.14'); // 'three point one four'
   * floatToCardinal(-10n); // 'minus ten'
   */
  floatToCardinal (value) {
    // Normalize and validate input
    if (typeof value === 'number') {
      if (Number.isNaN(value)) throw new TypeError('NaN is not an accepted number.')
      value = value.toString()
    } else if (typeof value === 'string') {
      value = value.trim()
      if (value.length === 0 || Number.isNaN(Number(value))) throw new Error('Invalid number format: "' + value + '"')
    } else if (typeof value !== 'bigint') {
      throw new TypeError('Invalid variable type, expected number|string|bigint, received: ' + typeof value)
    }

    const words = []

    // Detect negativity explicitly to avoid implicit coercions
    let isNegative = false
    if (typeof value === 'bigint') {
      if (value < 0n) {
        isNegative = true
        value = -value
      }
    } else {
      if (value.startsWith('-')) {
        isNegative = true
        value = value.slice(1)
      }
    }

    // Extract whole and decimal parts
    let wholeNumber
    let decimalNumber
    if (typeof value === 'bigint') {
      wholeNumber = value
    } else {
      const parts = value.split('.')
      const wholePart = parts[0] || '0'
      wholeNumber = BigInt(wholePart)
      decimalNumber = parts[1]
    }

    // Preserve wholeNumber for languages that need it
    this.#wholeNumber = wholeNumber

    // Prepend negative word if necessary
    if (isNegative) words.push(this.negativeWord)

    // Add whole number in written form
    words.push(this.toCardinal(wholeNumber))

    // Add decimal portion (if present)
    if (decimalNumber) {
      words.push(this.separatorWord)
      words.push(...this.decimalToCardinal(decimalNumber))
    }

    return words.join(this.spaceSeparator)
  }
}

export default AbstractLanguage
