import { N2WordsRU } from './ru.js';

export class N2WordsLT extends N2WordsRU {
  ones = {
    1: 'vienas',
    2: 'du',
    3: 'trys',
    4: 'keturi',
    5: 'penki',
    6: 'šeši',
    7: 'septyni',
    8: 'aštuoni',
    9: 'devyni'
  };

  onesFeminine = {
    1: 'viena',
    2: 'dvi',
    3: 'trys',
    4: 'keturios',
    5: 'penkios',
    6: 'šešios',
    7: 'septynios',
    8: 'aštuonios',
    9: 'devynios'
  };

  tens = {
    0: 'dešimt',
    1: 'vienuolika',
    2: 'dvylika',
    3: 'trylika',
    4: 'keturiolika',
    5: 'penkiolika',
    6: 'šešiolika',
    7: 'septyniolika',
    8: 'aštuoniolika',
    9: 'devyniolika'
  };

  twenties = {
    2: 'dvidešimt',
    3: 'trisdešimt',
    4: 'keturiasdešimt',
    5: 'penkiasdešimt',
    6: 'šešiasdešimt',
    7: 'septyniasdešimt',
    8: 'aštuoniasdešimt',
    9: 'devyniasdešimt'
  };

  hundreds = ['šimtas', 'šimtai'];

  thousands = {
    1: ['tūkstantis', 'tūkstančiai', 'tūkstančių'],
    2: ['milijonas', 'milijonai', 'milijonų'],
    3: ['milijardas', 'milijardai', 'milijardų'],
    4: ['trilijonas', 'trilijonai', 'trilijonų'],
    5: ['kvadrilijonas', 'kvadrilijonai', 'kvadrilijonų'],
    6: ['kvintilijonas', 'kvintilijonai', 'kvintilijonų'],
    7: ['sikstilijonas', 'sikstilijonai', 'sikstilijonų'],
    8: ['septilijonas', 'septilijonai', 'septilijonų'],
    9: ['oktilijonas', 'oktilijonai', 'oktilijonų'],
    10: ['naintilijonas', 'naintilijonai', 'naintilijonų'],
  };

  constructor(options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'kablelis',
      zero: 'nulis'
    }, options);

    super(options);
  }

  pluralize(n, forms) {
    let form = 1;
    const [n1, n2] = this.getDigits(n);
    if (n2 == 1 || n1 == 0 || n == 0) {
      form = 2;
    } else if (n1 == 1) {
      form = 0;
    }
    return forms[form];
  }

  toCardinal(number) {
    if (number == 0) {
      return this.zero;
    }
    const words = [];
    const chunks = this.splitByX(number.toString(), 3);
    let index = chunks.length;
    for (const x of chunks) {
      index = index - 1;
      if (x == 0) {
        continue;
      }
      const [n1, n2, n3] = this.getDigits(x);
      if (n3 > 0) {
        words.push(this.ones[n3]);
        if (n3 > 1) {
          words.push(this.hundreds[1]);
        } else {
          words.push(this.hundreds[0]);
        }
      }
      if (n2 > 1) {
        words.push(this.twenties[n2]);
      }
      if (n2 == 1) {
        words.push(this.tens[n1]);
      } else if (n1 > 0) {
        if ((index == 1 || this.feminine && index == 0) && number < 1000) {
          words.push(this.onesFeminine[n1]);
        } else {
          words.push(this.ones[n1]);
        }
      }
      if (index > 0) {
        words.push(this.pluralize(x, this.thousands[index]));
      }
    }
    return words.join(' ');
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new N2WordsLT(options).floatToCardinal(value);
}
