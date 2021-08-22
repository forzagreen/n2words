import N2WordsAbs from '../classes/N2WordsAbs.mjs';

export class N2WordsRU extends N2WordsAbs {
  constructor() {
    super();

    this.feminine = false;
    this.negativeWord = 'минус';
    this.separatorWord = 'запятая';
    this.zero = 'ноль';
    this.ones = {
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
    this.onesFeminine = {
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
    this.tens = {
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
    this.twenties = {
      2: 'двадцать',
      3: 'тридцать',
      4: 'сорок',
      5: 'пятьдесят',
      6: 'шестьдесят',
      7: 'семьдесят',
      8: 'восемьдесят',
      9: 'девяносто'
    };
    this.hundreds = {
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
    this.thousands = {
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
          results.push(parseInt(result));
        } else {
          results.push(result);
        }
      }
      for (let i = start; i < l; i += x) {
        result = n.slice(i, i + x);
        if (formatInt) {
          results.push(parseInt(result));
        } else {
          results.push(result);
        }
      }
    } else {
      if (formatInt) {
        results.push(parseInt(n));
      } else {
        results.push(n);
      }
    }
    return results;
  }

  getDigits(n) {
    const a = Array.from(JSON.stringify(n).padStart(3, '0').slice(-3)).reverse();
    return a.map(e => parseInt(e));
  }

  pluralize(n, forms) {
    let form = 2;
    if ((n % 100 < 10) || (n % 100 > 20)) {
      if (n % 10 == 1) {
        form = 0;
      } else if ((n % 10 < 5) && (n % 10 > 1)) {
        form = 1;
      }
    }
    return forms[form];
  }

  toCardinal(number) {
    if (parseInt(number) == 0) {
      return this.zero;
    }
    const words = [];
    const chunks = this.splitByX(JSON.stringify(number), 3);
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
}

export default function(n) {
  return new N2WordsRU().floatToCardinal(n);
}
