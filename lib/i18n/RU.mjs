import AbstractLanguage from '../classes/AbstractLanguage.mjs';

export class N2WordsRU extends AbstractLanguage {
  feminine = false;

  ones = {
    1: 'один',
    2: 'два',
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять'
  };

  onesFeminine = {
    1: 'одна',
    2: 'две',
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять'
  };

  tens = {
    0: 'десять',
    1: 'одиннадцать',
    2: 'двенадцать',
    3: 'тринадцать',
    4: 'четырнадцать',
    5: 'пятнадцать',
    6: 'шестнадцать',
    7: 'семнадцать',
    8: 'восемнадцать',
    9: 'девятнадцать'
  };

  twenties = {
    2: 'двадцать',
    3: 'тридцать',
    4: 'сорок',
    5: 'пятьдесят',
    6: 'шестьдесят',
    7: 'семьдесят',
    8: 'восемьдесят',
    9: 'девяносто'
  };

  hundreds = {
    1: 'сто',
    2: 'двести',
    3: 'триста',
    4: 'четыреста',
    5: 'пятьсот',
    6: 'шестьсот',
    7: 'семьсот',
    8: 'восемьсот',
    9: 'девятьсот'
  };

  thousands = {
    1: ['тысяча', 'тысячи', 'тысяч'], // 10^ 3
    2: ['миллион', 'миллиона', 'миллионов'], // 10^ 6
    3: ['миллиард', 'миллиарда', 'миллиардов'], // 10^ 9
    4: ['триллион', 'триллиона', 'триллионов'], // 10^ 12
    5: ['квадриллион', 'квадриллиона', 'квадриллионов'], // 10^ 15
    6: ['квинтиллион', 'квинтиллиона', 'квинтиллионов'], // 10^ 18
    7: ['секстиллион', 'секстиллиона', 'секстиллионов'], // 10^ 21
    8: ['септиллион', 'септиллиона', 'септиллионов'], // 10^ 24
    9: ['октиллион', 'октиллиона', 'октиллионов'], // 10^ 27
    10: ['нониллион', 'нониллиона', 'нониллионов'], // 10^ 30
  };

  constructor(options) {
    super(Object.assign({
      negativeWord: 'минус',
      separatorWord: 'запятая',
      zero: 'ноль'
    }, options));
  }

  toCardinal(number) {
    if (number == 0) {
      return this.zero;
    }

    const words = [];

    const chunks = this.splitByX(number.toString(), 3);

    let i = chunks.length;

    for (let j = 0; j < chunks.length; j++) {
      const x = chunks[j];
      let ones = [];
      i = i - 1;

      if (x == 0) {
        continue;
      }

      const [n1, n2, n3] = this.getDigits(x);

      if (n3 > 0) {
        words.push(this.hundreds[n3]);
      }

      if (n2 > 1) {
        words.push(this.twenties[n2]);
      }

      if (n2 == 1) {
        words.push(this.tens[n1]);
      } else if (n1 > 0) {
        ones = (i == 1 || this.feminine && i == 0) ? this.onesFeminine : this.ones;
        words.push(ones[n1]);
      }

      if (i > 0) {
        words.push(this.pluralize(x, this.thousands[i]));
      }
    }

    return words.join(' ');
  }

  splitByX(n, x, formatInt = true) {
    const results = [];
    const l = n.length;
    let result;

    if (l > x) {
      const start = l % x;

      if (start > 0) {
        result = n.slice(0, start);

        if (formatInt) {
          results.push(BigInt(result));
        } else {
          results.push(result);
        }
      }

      for (let i = start; i < l; i += x) {
        result = n.slice(i, i + x);

        if (formatInt) {
          results.push(BigInt(result));
        } else {
          results.push(result);
        }
      }
    } else {
      if (formatInt) {
        results.push(BigInt(n));
      } else {
        results.push(n);
      }
    }

    return results;
  }

  getDigits(value) {
    const a = Array.from(value.toString().padStart(3, '0').slice(-3)).reverse();
    return a.map(e => BigInt(e));
  }

  pluralize(n, forms) {
    let form = 2;
    if ((n % 100n < 10n) || (n % 100n > 20n)) {
      if (n % 10n == 1n) {
        form = 0;
      } else if ((n % 10n < 5n) && (n % 10n > 1n)) {
        form = 1;
      }
    }
    return forms[form];
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new N2WordsRU().floatToCardinal(value);
}
