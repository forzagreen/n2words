import BaseLanguage from '../classes/BaseLanguage.js';

export class N2WordsHU extends BaseLanguage {
  constructor(options) {
    options = Object.assign({
      negativeWord: 'mínusz',
      separatorWord: 'egész',
      zero: 'nulla'
    }, options);

    super(options, [
      [1000000000000000000000000000n, 'quadrilliárd'],
      [1000000000000000000000000n, 'quadrillió'],
      [1000000000000000000000n, 'trilliárd'],
      [1000000000000000000n, 'trillió'],
      [1000000000000000n, 'billiárd'],
      [1000000000000n, 'billió'],
      [1000000000n, 'milliárd'],
      [1000000n, 'millió'],
      [1000n, 'ezer'],
      [100n, 'száz'],
      [90n, 'kilencven'],
      [80n, 'nyolcvan'],
      [70n, 'hetven'],
      [60n, 'hatvan'],
      [50n, 'ötven'],
      [40n, 'negyven'],
      [30n, 'harminc'],
      [29n, 'huszonkilenc'],
      [28n, 'huszonnyolc'],
      [27n, 'huszonhét'],
      [26n, 'huszonhat'],
      [25n, 'huszonöt'],
      [24n, 'huszonnégy'],
      [23n, 'huszonhárom'],
      [22n, 'huszonkettő'],
      [21n, 'huszonegy'],
      [20n, 'húsz'],
      [19n, 'tizenkilenc'],
      [18n, 'tizennyolc'],
      [17n, 'tizenhét'],
      [16n, 'tizenhat'],
      [15n, 'tizenöt'],
      [14n, 'tizennégy'],
      [13n, 'tizenhárom'],
      [12n, 'tizenkettő'],
      [11n, 'tizenegy'],
      [10n, 'tíz'],
      [9n, 'kilenc'],
      [8n, 'nyolc'],
      [7n, 'hét'],
      [6n, 'hat'],
      [5n, 'öt'],
      [4n, 'négy'],
      [3n, 'három'],
      [2n, 'kettő'],
      [1n, 'egy'],
      [0n, 'nulla']
    ]);
  }

  tensToCardinal(number) {
    if (this.getCardWord(number)) {
      return this.getCardWord(number);
    } else {
      const tens = Math.floor(number / 10);
      const units = number % 10;
      return this.getCardWord(tens * 10) + this.toCardinal(units);
    }
  }

  hundredsToCardinal(number) {
    const hundreds = Math.floor(number / 100);
    let prefix = 'száz';
    if (hundreds != 1) {
      prefix = this.toCardinal(hundreds, '') + prefix;
    }
    const postfix = this.toCardinal(number % 100, '');
    return prefix + postfix;
  }

  thousandsToCardinal(number) {
    const thousands = Math.floor(number / 1000);
    let prefix = 'ezer';
    if (thousands != 1) {
      prefix = this.toCardinal(thousands, '') + prefix;
    }
    let postfix = this.toCardinal(number % 1000, '');
    let middle = (number <= 2000 || postfix == '') ? '' : '-';
    return prefix + middle + postfix;
  }

  bigNumberToCardinal(number) {
    const numberLength = number.toString().length;
    let digits = (numberLength % 3 !== 0) ? numberLength : numberLength - 2;
    let exp = 10 ** (Math.floor(digits / 3) * 3);
    let prefix = this.toCardinal(number / BigInt(exp), '');
    let rest = this.toCardinal(number % BigInt(exp), '');
    let postfix = (rest !== '') ? ('-' + rest) : '';
    return prefix + this.getCardWord(exp) + postfix;
  }

  toCardinal(number, zero = this.zero) {
    let words = '';

    if (number == 0n) {
      words = zero;
    } else if (zero == '' && number == 2) {
      words = 'két';
    } else if (number < 30n) {
      words = this.getCardWord(Number(number));
    } else if (number < 100n) {
      words = this.tensToCardinal(Number(number));
    } else if (number < 1000n) {
      words = this.hundredsToCardinal(Number(number));
    } else if (number < 1000000n) {
      words = this.thousandsToCardinal(Number(number));
    } else {
      words = this.bigNumberToCardinal(number);
    }

    return words;
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
  return new N2WordsHU(options).floatToCardinal(value);
}
