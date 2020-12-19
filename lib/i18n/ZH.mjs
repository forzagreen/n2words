import N2WordsBase from '../classes/N2WordsBase.mjs';

const digit = (num) => num.toString().length;
const zeroDigit = (num) =>
  Array.from(num.toString()).filter((c) => c === '0').length;

export default function () {
  N2WordsBase.call(this);

  this.negative_word = '负';
  this.separator_word = '点';
  this.ZERO = '零';
  this.space_separator = ''; // no
  this.cards = [
    { 1000000000000: '万' },
    { 100000000: '亿' },
    { 10000: '万' },
    { 1000: '仟' },
    { 100: '佰' },
    { 10: '拾' },
    { 9: '玖' },
    { 8: '捌' },
    { 7: '柒' },
    { 6: '陆' },
    { 5: '伍' },
    { 4: '肆' },
    { 3: '叁' },
    { 2: '贰' },
    { 1: '壹' },
    { 0: '零' },
  ];
  this.merge = (lpair, rpair) => {
    // {'one':1}, {'hundred':100}
    const ltext = Object.keys(lpair)[0];
    const lnum = parseInt(Object.values(lpair)[0]);
    const rtext = Object.keys(rpair)[0];
    const rnum = parseInt(Object.values(rpair)[0]);

    let result = { [`${ltext}${rtext}`]: lnum + rnum };

    if (lnum == 1 && rnum < 10) {
      result = { [rtext]: rnum };
    } else if (rnum > lnum) {
      result = { [`${ltext}${rtext}`]: lnum * rnum };
    } else if (zeroDigit(lnum) > digit(rnum)) {
      result = { [`${ltext}${this.ZERO}${rtext}`]: lnum + rnum };
    }

    return result;
  };

  this.toDecimal = (decimalPart) => {
    const decimalPartArray = Array.from(decimalPart);
    const decimalPartWordsArray = decimalPartArray.map((decimal) =>
      this.getValueFromCards(decimal)
    );

    return decimalPartWordsArray.join(this.space_separator);
  };
}
