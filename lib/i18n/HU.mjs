import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsHU extends BaseLanguage {
  constructor() {
    super({
      negativeWord: 'mínusz',
      separatorWord: 'egész',
      zero: 'nulla'
    },[
      [1000000000000000000000000000, 'quadrilliárd'],
      [1000000000000000000000000, 'quadrillió'],
      [1000000000000000000000, 'trilliárd'],
      [1000000000000000000, 'trillió'],
      [1000000000000000, 'billiárd'],
      [1000000000000, 'billió'],
      [1000000000, 'milliárd'],
      [1000000, 'millió'],
      [1000, 'ezer'],
      [100, 'száz'],
      [90, 'kilencven'],
      [80, 'nyolcvan'],
      [70, 'hetven'],
      [60, 'hatvan'],
      [50, 'ötven'],
      [40, 'negyven'],
      [30, 'harminc'],
      [29, 'huszonkilenc'],
      [28, 'huszonnyolc'],
      [27, 'huszonhét'],
      [26, 'huszonhat'],
      [25, 'huszonöt'],
      [24, 'huszonnégy'],
      [23, 'huszonhárom'],
      [22, 'huszonkettő'],
      [21, 'huszonegy'],
      [20, 'húsz'],
      [19, 'tizenkilenc'],
      [18, 'tizennyolc'],
      [17, 'tizenhét'],
      [16, 'tizenhat'],
      [15, 'tizenöt'],
      [14, 'tizennégy'],
      [13, 'tizenhárom'],
      [12, 'tizenkettő'],
      [11, 'tizenegy'],
      [10, 'tíz'],
      [9, 'kilenc'],
      [8, 'nyolc'],
      [7, 'hét'],
      [6, 'hat'],
      [5, 'öt'],
      [4, 'négy'],
      [3, 'három'],
      [2, 'kettő'],
      [1, 'egy'],
      [0, 'nulla']
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
    let middle = (number <= 2000 || postfix === '') ? '' : '-';
    return prefix + middle + postfix;
  }

  bigNumberToCardinal(number) {
    const numberLength = String(number).length;
    let digits = (numberLength % 3 !== 0) ? numberLength : numberLength - 2;
    let exp = 10 ** (Math.floor(digits / 3) * 3);
    let prefix = this.toCardinal(Math.floor(number / exp), '');
    let rest = this.toCardinal(number % exp, '');
    let postfix = (rest !== '') ? ('-' + rest) : '';
    return prefix + this.getCardWord(exp) + postfix;
  }

  toCardinal(number, zero = this.zero) {
    let words = '';

    if (number == 0) {
      words = zero;
    } else if (zero == '' && number == 2) {
      words = 'két';
    } else if (number < 30) {
      words = this.getCardWord(number);
    } else if (number < 100) {
      words = this.tensToCardinal(number);
    } else if (number < 1000) {
      words = this.hundredsToCardinal(number);
    } else if (number < 1000000) {
      words = this.thousandsToCardinal(number);
    } else {
      words = this.bigNumberToCardinal(number);
    }

    return words;
  }
}

export default function(n) {
  return new N2WordsHU().floatToCardinal(n);
}
