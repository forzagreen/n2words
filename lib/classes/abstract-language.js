/**
 * Creates new common language class that processes decimals separately.
 * Requires implementing `toCardinal`.
 */
class AbstractLanguage {
  #negativeWord
  #separatorWord
  #zero
  #spaceSeparator
  #wholeNumber

  /**
   * @param {object} options Options for class.
   * @param {string} [options.negativeWord] Word that precedes a negative number (if any).
   * @param {string} options.separatorWord Word that separates cardinal numbers (i.e. "and").
   * @param {string} options.zero Word for 0 (i.e. "zero").
   * @param {string} [options.spaceSeparator] Character that separates words.
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
   * @returns {string} Word that precedes a negative number (if any).
   */
  get negativeWord () {
    return this.#negativeWord
  }

  /**
   * @returns {string} Word that separates cardinal numbers (i.e. "and").
   */
  get separatorWord () {
    return this.#separatorWord
  }

  /**
   * @returns {string} Word for 0 (i.e. "zero").
   */
  get zero () {
    return this.#zero
  }

  /**
   * @returns {string} Character that separates words.
   */
  get spaceSeparator () {
    return this.#spaceSeparator
  }

  /**
   * @returns {bigint} Input value without decimal.
   */
  get wholeNumber () {
    return this.#wholeNumber
  }

  /**
   * Convert ONLY decimal portion of number (processing leading zeros) to a string array of cardinal numbers.
   * @param {string} decimal Decimal string to convert.
   * @returns {string} Value in written format.
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
   * Convert a number to cardinal form.
   * @param {number|string|bigint} value Number to be convert.
   * @returns {string} Value in written format.
   * @throws {Error} Value must be a valid number.
   */
  floatToCardinal (value) {
    // Normalize and validate input
    if (typeof value === 'number') {
      if (Number.isNaN(value)) throw new TypeError('NaN is not an accepted number.')
      value = value.toString()
    } else if (typeof value === 'string') {
      value = value.trim()
      if (value.length === 0 || Number.isNaN(Number(value))) throw new Error('"' + value + '" is not a valid number.')
    } else if (typeof value !== 'bigint') {
      throw new TypeError('Invalid variable type: ' + typeof value)
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
