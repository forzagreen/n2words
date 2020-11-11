/**
 * This is an abstract class.
 * Must be inherited by all languages.
 */
export default function () {

  this.negative_word; // TODO: add support for negative words.
  this.separator_word;
  this.ZERO;
  this.space_separator = ' '; // space
  this.toCardinal = () => {}  // Must take an integer and return a string.

  this.floatToCardinal = (value) => {
    if (Number(value) === value) {
      if ((value % 1 === 0) || typeof this.separator_word === 'undefined') {
        // if value is integer or if separator_word is not defined
        return this.toCardinal(value);
      } else {
        const splittedValue = value.toString().split('.');
        const wholeNumberStr = this.toCardinal(parseInt(splittedValue[0], 10));
        let decimalPart = splittedValue[1]
        let decimalPartArray = Array.from(decimalPart)
        let decimalPartWordsArray = []
        while (decimalPartArray[0] === '0') {  // Leading zeros
          decimalPartArray.shift()
          decimalPartWordsArray.push(this.ZERO)
        }
        decimalPartWordsArray.push(this.toCardinal(parseInt(decimalPart, 10)));
        const decimalPartStr = decimalPartWordsArray.join(this.space_separator);
        return [wholeNumberStr, this.separator_word, decimalPartStr].join(this.space_separator)
      }
    } else {
      return undefined;
    }
  };

}
