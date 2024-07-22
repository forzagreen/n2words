import BaseLanguage from '../classes/base-language.js';

/**
 * @augments BaseLanguage
 */
class Chinese extends BaseLanguage {
  constructor(options) {
    super(Object.assign({
      negativeWord: '负',
      separatorWord: '点',
      zero: '零',
      spaceSeparator: ''
    }, options), [
      [1_000_000_000_000n, '万'],
      [100_000_000n, '亿'],
      [10_000n, '万'],
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
    const decimalPartArray = [...decimal];

    const decimalPartWordsArray = decimalPartArray.map(decimal =>
      this.getCardWord(decimal)
    );

    return decimalPartWordsArray.join(this.spaceSeparator);
  }

  digit(number_) {
    return number_.toString().length;
  }

  zeroDigit(number_) {
    return [...number_.toString()].filter(c => c == '0').length;
  }
}

export default Chinese;
