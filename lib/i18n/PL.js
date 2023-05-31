import {N2WordsRU} from './RU.js';

export class N2WordsPL extends N2WordsRU {
  ones = {
    1: 'jeden',
    2: 'dwa',
    3: 'trzy',
    4: 'cztery',
    5: 'pięć',
    6: 'sześć',
    7: 'siedem',
    8: 'osiem',
    9: 'dziewięć'
  };

  tens = {
    0: 'dziesięć',
    1: 'jedenaście',
    2: 'dwanaście',
    3: 'trzynaście',
    4: 'czternaście',
    5: 'piętnaście',
    6: 'szesnaście',
    7: 'siedemnaście',
    8: 'osiemnaście',
    9: 'dziewiętnaście'
  };

  twenties = {
    2: 'dwadzieścia',
    3: 'trzydzieści',
    4: 'czterdzieści',
    5: 'pięćdziesiąt',
    6: 'sześćdziesiąt',
    7: 'siedemdziesiąt',
    8: 'osiemdziesiąt',
    9: 'dziewięćdzisiąt'
  };

  hundreds = {
    1: 'sto',
    2: 'dwieście',
    3: 'trzysta',
    4: 'czterysta',
    5: 'pięćset',
    6: 'sześćset',
    7: 'siedemset',
    8: 'osiemset',
    9: 'dziewięćset'
  };

  thousands = {
    1: ['tysiąc', 'tysiące', 'tysięcy'], // 10^ 3
    2: ['milion', 'miliony', 'milionów'], // 10^ 6
    3: ['miliard', 'miliardy', 'miliardów'], // 10^ 9
    4: ['bilion', 'biliony', 'bilionów'], // 10^ 12
    5: ['biliard', 'biliardy', 'biliardów'], // 10^ 15
    6: ['trylion', 'tryliony', 'trylionów'], // 10^ 18
    7: ['tryliard', 'tryliardy', 'tryliardów'], // 10^ 21
    8: ['kwadrylion', 'kwadryliony', 'kwadrylionów'], // 10^ 24
    9: ['kwaryliard', 'kwadryliardy', 'kwadryliardów'], // 10^ 27
    10: ['kwintylion', 'kwintyliony', 'kwintylionów'], // 10^ 30
  };

  constructor(options) {
    super(Object.assign({
      negativeWord: 'minus',
      separatorWord: 'przecinek',
      zero: 'zero'
    }, options));
  }

  pluralize(n, forms) {
    let form = 2;
    if (n == 1) {
      form = 0;
    } else if ((n % 10n < 5n) && (n % 10n > 1n) && ((n % 100n < 10n) || (n % 100n > 20n))) {
      form = 1;
    }
    return forms[form];
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
      } else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(this.ones[n1]);
      }
      if (i > 0) {
        words.push(this.pluralize(x, this.thousands[i]));
      }
    }
    return words.join(' ');
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @param {object} options Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value, options) {
  return new N2WordsPL(options).floatToCardinal(value);
}
