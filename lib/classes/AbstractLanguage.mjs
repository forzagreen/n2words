/**
 * Creates new language class that processes decimals separately.
 * Requires implementing {@link toCardinal}.
 */
export default class {
  #negativeWord;
  #separatorWord;
  #zero;
  #spaceSeparator;
  #wholeNumber;

  /**
   * @param {object} options Options for class.
   * @param {string} [options.negativeWord = ''] Word that precedes a negative number (if any).
   * @param {string} options.separatorWord Word that separates cardinal numbers (i.e. "and").
   * @param {string} options.zero Word for 0 (i.e. "zero").
   * @param {string} [options.spaceSeparator = ' '] Character that separates words.
   */
  constructor(options) {
    options = Object.assign({
      negativeWord: '',
      separatorWord: undefined,
      zeroWord: undefined,
      spaceSeparator: ' '
    }, options);

    this.#negativeWord = options.negativeWord;
    this.#separatorWord = options.separatorWord;
    this.#zero = options.zero;
    this.#spaceSeparator = options.spaceSeparator;
  }

  /**
   * @returns {string} Word that precedes a negative number (if any).
   */
  get negativeWord() {
    return this.#negativeWord;
  }

  /**
   * @returns {string} Word that separates cardinal numbers (i.e. "and").
   */
  get separatorWord() {
    return this.#separatorWord;
  }

  /**
   * @returns {string} Word for 0 (i.e. "zero").
   */
  get zero() {
    return this.#zero;
  }

  /**
   * @returns {string} Character that separates words.
   */
  get spaceSeparator() {
    return this.#spaceSeparator;
  }

  /**
   * @returns {number} Input value without decimal.
   */
  get wholeNumber() {
    return this.#wholeNumber;
  }

  /**
   * Convert a whole number to written format.
   * @abstract
   * @param {number} value Whole number to be convert.
   * @returns {string} Value in written format.
   */
  // eslint-disable-next-line no-unused-vars
  toCardinal(value) {
    throw new Error('toCardinal function not properly implemented for language.');
  }

  /**
   * Convert decimal number to a string array of cardinal numbers.
   * @param {number} decimal Decimal number to convert.
   * @returns {string} Value in written format.
   */
  decimalToCardinal(decimal) {
    let words = Array();

    // Split decimal portion into an array of characters in reverse
    const chars = decimal.split('').reverse();

    // Loop through array (from the end) adding words to output array
    while (chars.pop() == '0') {
      words.push(this.zero);
    }

    // Add decimal number to word array
    words.push(this.toCardinal(Number(decimal)));

    // Return words joined by space separator
    return words.join(this.spaceSeparator);
  }

  /**
   * Converts a number to written form.
   * @param {number|string} value Number to be convert.
   * @throws {Error} Value must be a valid number.
   * @returns {string} Value in written format.
   */
  floatToCardinal(value) {
    // Validate value
    if (typeof value == 'number') {
      if (Number.isNaN(value)) {
        throw new Error('NaN is not an accepted number.');
      }
    } else if (typeof value == 'string') {
      value = value.trim();
      if (value.length == 0 || Number.isNaN(value = Number(value))) {
        throw new Error('"' + value + '" is not a valid number.');
      }
    } else {
      throw new TypeError('Invalid variable type: ' + typeof value + '.');
    }

    let words = [];

    // Convert value to positive value (if negative)
    const positiveValue = Math.abs(value);

    // Check if number is not a decimal or the language separator word is undefined
    // Separator word check is only needed for HE
    if (value % 1 === 0 || typeof this.separatorWord === 'undefined') {
      words = [this.toCardinal(positiveValue)];
    } else {
      // Split value by period
      const splitValue = positiveValue.toString().split('.');

      // Convert whole number to number type
      // Only needed for CZ
      this.#wholeNumber = Number(splitValue[0]);

      // Add whole number in written form
      words.push(this.toCardinal(this.#wholeNumber));

      // Add separator word
      words.push(this.separatorWord);

      // Add decimal in written form
      words.push(this.decimalToCardinal(splitValue[1]));
    }

    // If number is negative add negative word to front
    if (value < 0) {
      words.unshift(this.negativeWord);
    }

    // Join words with spaces
    return words.join(this.spaceSeparator);
  }
}