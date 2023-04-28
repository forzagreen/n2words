import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsZH extends BaseLanguage {
  constructor() {
    super();

    this.negativeWord = '负';
    this.separatorWord = '点';
    this.zero = '零';
    this.spaceSeparator = ''; // no
    this.cards = [
      [1000000000000, '万'],
      [100000000, '亿'],
      [10000, '万'],
      [1000, '仟'],
      [100, '佰'],
      [10, '拾'],
      [9, '玖'],
      [8, '捌'],
      [7, '柒'],
      [6, '陆'],
      [5, '伍'],
      [4, '肆'],
      [3, '叁'],
      [2, '贰'],
      [1, '壹'],
      [0, '零']
    ];
  }

  merge(lPair, rPair) {
    // {'one':1}, {'hundred':100}
    const ltext = Object.keys(lPair)[0];
    const lnum = parseInt(Object.values(lPair)[0]);
    const rtext = Object.keys(rPair)[0];
    const rnum = parseInt(Object.values(rPair)[0]);

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
    return Array.from(num.toString()).filter(c => c === '0').length;
  }
}

export default function(n) {
  return new N2WordsZH().floatToCardinal(n);
}
