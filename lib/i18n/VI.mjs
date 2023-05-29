import AbstractLanguage from '../classes/AbstractLanguage.mjs';

export class N2WordsID extends AbstractLanguage {
  base = {
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

  tens = {
    20: 'hai mươi',
    30: 'ba mươi',
    40: 'bốn mươi',
    50: 'năm mươi',
    60: 'sáu mươi',
    70: 'bảy mươi',
    80: 'tám mươi',
    90: 'chín mươi',
  };

  thousands = {
    1: 'nghìn', // 10^1
    2: 'triệu', // 10^2
    3: 'tỷ', // 10^3
    4: 'nghìn tỷ',
    5: 'trăm nghìn tỷ',
    6: 'Quintillion',
    7: 'Sextillion',
    8: 'Septillion',
    9: 'Octillion',
    10: 'Nonillion',
    11: 'Decillion',
    12: 'Undecillion',
    13: 'Duodecillion',
    14: 'Tredecillion',
    15: 'Quattuordecillion',
    16: 'Sexdecillion',
    17: 'Septendecillion',
    18: 'Octodecillion',
    19: 'Novemdecillion',
    20: 'Vigintillion',
  };

  constructor(options) {
    super(Object.assign({
      negativeWord: 'âm',
      separatorWord: 'phẩy',
      zero: 'không'
    }, options));
  }

  convertLess100(number) {
    let unitsPart = number % 10;
    let tensPart = number - unitsPart;
    let tensPartText = this.tens[tensPart];
    if (unitsPart == 0) {
      return tensPartText;
    }
    let unitsPartText = this.base[unitsPart];
    let suffix = unitsPartText;
    if (unitsPart == 1) {
      suffix = 'mốt';
    }
    if (unitsPart == 5) {
      suffix = 'lăm';
    }
    return tensPartText + ' ' + suffix;
  }

  convertLess1000(number) {
    let words = [];
    let tensUnitsPart = number % 100;
    let hundredsPart = number - tensUnitsPart;
    if (hundredsPart > 0) {
      words.push(this.base[hundredsPart / 100], 'trăm');
    }
    if (0 < tensUnitsPart && tensUnitsPart < 10) {
      if (words.length > 0) {
        words.push('lẻ');
      }
      if (tensUnitsPart == 5) {
        words.push('năm');
      } else {
        words.push(this.base[tensUnitsPart]);
      }
    }
    if (tensUnitsPart >= 10) {
      words.push(this.toCardinal(tensUnitsPart));
    }
    return words.join(' ');
  }

  convertMore1000(number) {
    let words = [];
    let division = number / 1000n;
    let power = 1;
    while (division >= 1000n) {
      division = division / 1000n;
      power = power + 1;
    }
    let r = number - (division * BigInt(Math.pow(1000, power)));
    words.push(this.toCardinal(division), this.thousands[power]);
    if (r > 0n) {
      if (r <= 99n) {
        words.push('lẻ');
      }
      words.push(this.toCardinal(r));
    }
    return words.join(' ');
  }

  toCardinal(number) {
    if (number < 20n) {
      return this.base[Number(number)];
    } else {
      if (number < 100n) {
        return this.convertLess100(Number(number));
      } else {
        if (number < 1000n) {
          return this.convertLess1000(Number(number));
        } else { // number >= 1000
          return this.convertMore1000(number);
        }
      }
    }
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @param {object} options Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function (value, options) {
  return new N2WordsID(options).floatToCardinal(value);
}
