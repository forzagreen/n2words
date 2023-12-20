/**
 * Creates new language class that processes decimals separately.
 * Requires implementing `toCardinal`.
 */
export default class {
  #negativeWord;
  #separatorWord;
  #zero;
  #spaceSeparator;
  #wholeNumber;

  /**
   * @param {object} options Options for class.
   * @param {string} [options.negativeWord] Word that precedes a negative number (if any).
   * @param {string} options.separatorWord Word that separates cardinal numbers (i.e. "and").
   * @param {string} options.zero Word for 0 (i.e. "zero").
   * @param {string} [options.spaceSeparator] Character that separates words.
   */
  constructor(options) {
    // Merge supplied options with defaults
    options = Object.assign({
      negativeWord: '',
      separatorWord: undefined,
      zero: undefined,
      spaceSeparator: ' '
    }, options);

    // Make options available to class
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
   * Convert decimal number to a string array of cardinal numbers.
   * @param {string} decimal Decimal string to convert.
   * @returns {string} Value in written format.
   */
  decimalToCardinal(decimal) {
    const words = [];
    let allZero = true;

    // Split decimal portion into an array of characters
    const chars = decimal.split('');

    // Loop through characters adding zeros to output array
    chars.forEach(char => {
      if (char === '0') {
        words.push(this.zero);
      } else {
        allZero = false;
      }
    });

    if (allZero) {
      return words;
    }

    return words.concat(this.toCardinal(BigInt(decimal)));
  }

  /**
   * Converts a number to written form.
   * @param {number|string} value Number to be convert.
   * @throws {Error} Value must be a valid number.
   * @returns {string} Value in written format.
   */
  floatToCardinal(value) {
    // Validate user input value
    if (typeof value == 'number') {
      if (Number.isNaN(value)) {
        throw new Error('NaN is not an accepted number.');
      }
      value = value.toString();
    } else if (typeof value == 'string') {
      value = value.trim();
      if (value.length == 0 || Number.isNaN(Number(value))) {
        throw new Error('"' + value + '" is not a valid number.');
      }
    } else if (typeof value != 'bigint') {
      throw new TypeError('Invalid variable type: ' + typeof value);
    }

    let words = [];
    let wholeNumber;
    let decimalNumber;

    // If negative number add negative word
    if (value < 0) {
      words.push(this.negativeWord);
    }

    // Split value decimal (if any) (excluding BigInt)
    if (typeof value == 'bigint') {
      wholeNumber = value;
    } else {
      const splitValue = value.split('.');
      wholeNumber = BigInt(splitValue[0]);
      decimalNumber = splitValue[1];
    }

    // Convert whole number to positive (if negative)
    if (wholeNumber < 0) {
      wholeNumber = -wholeNumber;
    }

    // NOTE: Only needed for CZ
    this.#wholeNumber = wholeNumber;

    // Add whole number in written form
    words = words.concat(this.toCardinal(wholeNumber));

    // Add decimal number in written form (if any)
    if (decimalNumber) {
      words.push(this.separatorWord);

      words = words.concat(this.decimalToCardinal(decimalNumber));
    }

    // Join words with spaces
    return words.join(this.spaceSeparator);
  }
}
