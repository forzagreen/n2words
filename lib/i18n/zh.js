import BaseLanguage from '../classes/BaseLanguage.js';

export class N2WordsZH extends BaseLanguage {
  constructor(options) {
    super(Object.assign({
      negativeWord: '负',
      separatorWord: '点',
      zero: '零',
      spaceSeparator: ''
    }, options), [
      [1000000000000n, '万'],
      [100000000n, '亿'],
      [10000n, '万'],
      [1000n, '仟'],
      [100n, '佰'],
      [10n, '拾'],
      [9n, '玖'],
      [8n, '捌'],
      [7n, '柒'],
      [6n, '陆'],
      [5n, '伍'],
      [4n, '肆'],
      [3n, '叁'],
      [2n, '贰'],
      [1n, '壹'],
      [0n, '零']
    ]);
  }

  merge(lPair, rPair) {
    // {'one':1}, {'hundred':100}
    const ltext = Object.keys(lPair)[0];
    const lnum = BigInt(Object.values(lPair)[0]);
    const rtext = Object.keys(rPair)[0];
    const rnum = BigInt(Object.values(rPair)[0]);

    let result = { [`${ltext}${rtext}`]: lnum + rnum };

    if (lnum == 1 && rnum < 10) {
      result = { [rtext]: rnum };
    } else if (rnum > lnum) {
      result = { [`${ltext}${rtext}`]: lnum * rnum };
    } else if (this.zeroDigit(lnum) > this.digit(rnum)) {
      result = { [`${ltext}${this.zero}${rtext}`]: lnum + rnum };
    }

    return result;
  }

  decimalToCardinal(decimal) {
    const decimalPartArray = decimal.split('');

    const decimalPartWordsArray = decimalPartArray.map(decimal =>
      this.getCardWord(decimal)
    );

    return decimalPartWordsArray.join(this.spaceSeparator);
  }

  digit(num) {
    return num.toString().length;
  }

  zeroDigit(num) {
    return Array.from(num.toString()).filter(c => c == '0').length;
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @param {object} [options] Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function (value, options = {}) {
  return new N2WordsZH(options).floatToCardinal(value);
}
