/**
 * Abstract class that must be inherited by all languages.
 */
export default class {
  constructor() {
    this.negativeWord = '';
    this.separatorWord;
    this.wholeNumberInt;
    this.zero;
    this.spaceSeparator = ' ';
  }

  /**
   * Convert a whole number to written format.
   * @param {number} value The number value to convert to cardinal form.
   * @returns {string} Value in written format.
   */
  toCardinal(value) {
    return value;
  }

  /**
   * Convert decimal to written format
   * @param {string} decimalPart Decimal part of the number to convert.
   * @returns {string} Value in written format.
   * @todo Possibly only accept Number type values (0.012 instead of '0.012')
   */
  toDecimal(decimalPart) {
    let decimalPartWordsArray = [];

    // Add leading zeros to word array
    const decimalPartArray = Array.from(decimalPart);
    while (decimalPartArray[0] === '0') {
      decimalPartArray.shift();
      decimalPartWordsArray.push(this.zero);
    }

    // Add decimal number to word array
    decimalPartWordsArray.push(this.toCardinal(Number(decimalPart)));

    // Return decimal in written format
    return decimalPartWordsArray.join(this.spaceSeparator);
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

    // Check if number is not a decimal or the language seperator word is undefined
    if (value % 1 === 0 || typeof this.separatorWord === 'undefined') {
      words = [this.toCardinal(positiveValue)];
    } else {
      // Split value by period
      const splittedValue = positiveValue.toString().split('.');

      // Convert whole number to number type
      // Only needed for CZ
      this.wholeNumberInt = Number(splittedValue[0]);

      // Convert whole number to written form
      const wholeNumberStr = this.toCardinal(this.wholeNumberInt);

      // Convert decimal to written form
      const decimalPartStr = this.toDecimal(splittedValue[1]);

      words = [wholeNumberStr, this.separatorWord, decimalPartStr];
    }

    // Negative values
    if (value < 0) {
      words = [this.negativeWord].concat(words);
    }

    // Join words with proper spaces
    return words.join(this.spaceSeparator);
  }
}
