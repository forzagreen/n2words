/**
 * This is an abstract class.
 * Must be inherited by all languages.
 */
export default class {
  constructor() {
    this.negativeWord = '';
    this.separatorWord;
    this.zero;
    this.spaceSeparator = ' ';
  }

  /**
   * Must take an integer and return a string.
   */
  toCardinal() {}

  /**
   *
   * @param decimalPart
   * @returns {string}
   */
  toDecimal(decimalPart) {
    let decimalPartArray = Array.from(decimalPart);
    let decimalPartWordsArray = [];
    while (decimalPartArray[0] === '0') {
      // Leading zeros
      decimalPartArray.shift();
      decimalPartWordsArray.push(this.zero);
    }
    decimalPartWordsArray.push(this.toCardinal(parseInt(decimalPart, 10)));

    return decimalPartWordsArray.join(this.spaceSeparator);
  }

  /**
   *
   * @param value
   * @returns {string|undefined}
   */
  floatToCardinal(value) {
    if (Number(value) === value) {
      let words = [];
      let positiveValue = Math.abs(value);
      if (value % 1 === 0 || typeof this.separatorWord === 'undefined') {
        // if value is integer or if separatorWord is not defined
        words = [this.toCardinal(positiveValue)];
      } else {
        const splittedValue = positiveValue.toString().split('.');
        const wholeNumberStr = this.toCardinal(parseInt(splittedValue[0], 10));

        let decimalPart = splittedValue[1];

        const decimalPartStr = this.toDecimal(decimalPart);
        words = [wholeNumberStr, this.separatorWord, decimalPartStr];
      }
      if (value < 0) {
        // negative numbers
        words = [this.negativeWord].concat(words);
      }
      return words.join(this.spaceSeparator);
    } else {
      return undefined;
    }
  }
}
