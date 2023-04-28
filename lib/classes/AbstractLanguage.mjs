/**
 * Abstract class that must be inherited by all languages.
 */
export default class {
  constructor() {
    this.negativeWord = '';
    this.separatorWord;
    this.zero;
    this.spaceSeparator = ' ';
    this.wholeNumber;
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
      this.wholeNumber = Number(splitValue[0]);

      // Convert whole number to written form
      words.push(this.toCardinal(this.wholeNumber));

      // Add separator word
      words.push(this.separatorWord);

      // Split decimal portion into an array of characters in reverse
      const chars = splitValue[1].split('').reverse();

      // Loop through array (from the end) adding words to output array
      while (chars.pop() == '0') {
        words.push(this.zero);
      }

      // Add decimal number to word array
      words.push(this.toCardinal(Number(splitValue[1])));
    }

    // If number is negative word to front
    if (value < 0) {
      words.unshift(this.negativeWord);
    }

    // Join words with proper spaces
    return words.join(this.spaceSeparator);
  }
}
