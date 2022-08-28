import N2WordsAbs from '../classes/N2WordsAbs.mjs';

export class N2WordsID extends N2WordsAbs {
  constructor() {
    super();

    this.negativeWord = 'trừ'; // TODO: verify this
    this.separatorWord = 'phẩy';
    this.zero = 'không';
    this.base = {
      0: 'không',
      1: 'một',
      2: 'hai',
      3: 'ba',
      4: 'bốn',
      5: 'năm',
      6: 'sáu',
      7: 'bảy',
      8: 'tám',
      9: 'chín',
      10: 'mười',
      11: 'mười một',
      12: 'mười hai',
      13: 'mười ba',
      14: 'mười bốn',
      15: 'mười lăm',
      16: 'mười sáu',
      17: 'mười bảy',
      18: 'mười tám',
      19: 'mười chín',
    };
    this.tens = {
      20: 'hai mươi',
      30: 'ba mươi',
      40: 'bốn mươi',
      50: 'năm mươi',
      60: 'sáu mươi',
      70: 'bảy mươi',
      80: 'tám mươi',
      90: 'chín mươi',
    };
    this.thousands = [
      'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'trăm nghìn tỷ',
      'Quintillion', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion',
      'Decillion', 'Undecillion', 'Duodecillion', 'Tredecillion',
      'Quattuordecillion', 'Sexdecillion', 'Septendecillion',
      'Octodecillion', 'Novemdecillion', 'Vigintillion'
    ];
  }

  convertLess100(number) {
    let unitsPart = number % 10;
    let tensPart = number - unitsPart;
    let tensPartText = this.tens[tensPart];
    if (unitsPart === 0) {
      return tensPartText;
    }
    let unitsPartText = this.base[unitsPart];
    let suffix = unitsPartText;
    if (unitsPart === 1) {
      suffix = 'mốt';
    }
    if (unitsPart === 5) {
      suffix = 'lăm';
    }
    return tensPartText + ' ' + suffix;
  }

  convertLess1000(number) {
    // TODO
    let words = [];
    let tensUnitsPart = number % 100;
    let hundredsPart = number - tensUnitsPart;
    if (hundredsPart > 0) {
      words.push(this.base[hundredsPart / 100], 'trăm');
    }
    if (0 < tensUnitsPart < 10) {
      if (words.length > 0) {
        words.push('lẻ');
      }
      if (tensUnitsPart === 5) {
        words.push('năm');
      } else {
        words.push(this.base[tensUnitsPart]);
      }
    }
    if (tensUnitsPart >= 10) {
      words.push(this.base[tensUnitsPart]);
    }
    return words.join(' ');
  }

  toCardinal(number) {
    if (number < 20) {
      return this.base[number];
    }
    if (20 <= number < 100) {
      return this.convertLess100(number);
    }
    if (100 <= number < 1000) {
      return this.convertLess1000(number);
    }
    if (number >= 1000) {
      // TODO
    }
  }
}

export default function (n) {
  return new N2WordsID().floatToCardinal(n);
}
