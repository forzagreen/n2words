/**
 * This is an abstract class.
 * Must be inherited by all languages.
 */
export default function () {
  this.negative_word = '';
  this.separator_word;
  this.ZERO;
  this.space_separator = ' '; // space
  this.toCardinal = () => {}; // Must take an integer and return a string.

  this.toDecimal = (decimalPart) => {
    let decimalPartArray = Array.from(decimalPart);
    let decimalPartWordsArray = [];
    while (decimalPartArray[0] === '0') {
      // Leading zeros
      decimalPartArray.shift();
      decimalPartWordsArray.push(this.ZERO);
    }
    decimalPartWordsArray.push(this.toCardinal(parseInt(decimalPart, 10)));

    return decimalPartWordsArray.join(this.space_separator);
  };

  this.floatToCardinal = (value) => {
    if (Number(value) === value) {
      let words = [];
      let positiveValue = Math.abs(value);
      if (value % 1 === 0 || typeof this.separator_word === 'undefined') {
        // if value is integer or if separator_word is not defined
        words = [this.toCardinal(positiveValue)];
      } else {
        const splittedValue = positiveValue.toString().split('.');
        const wholeNumberStr = this.toCardinal(parseInt(splittedValue[0], 10));

        let decimalPart = splittedValue[1];

        const decimalPartStr = this.toDecimal(decimalPart);
        words = [wholeNumberStr, this.separator_word, decimalPartStr];
      }
      if (value < 0) {
        // negative numbers
        words = [this.negative_word].concat(words);
      }
      return words.join(this.space_separator);
    } else {
      return undefined;
    }
  };
}
