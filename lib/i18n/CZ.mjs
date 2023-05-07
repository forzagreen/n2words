import {N2WordsRU} from './RU.mjs';

export class N2WordsCZ extends N2WordsRU {
  constructor() {
    super({
      negativeWord: 'mínus',
      zero: 'nula'
    });

    this.ones = {
      1: 'jedna',
      2: 'dva',
      3: 'tři',
      4: 'čtyři',
      5: 'pět',
      6: 'šest',
      7: 'sedm',
      8: 'osm',
      9: 'devět'
    };
    this.tens = {
      0: 'deset',
      1: 'jedenáct',
      2: 'dvanáct',
      3: 'třináct',
      4: 'čtrnáct',
      5: 'patnáct',
      6: 'šestnáct',
      7: 'sedmnáct',
      8: 'osmnáct',
      9: 'devatenáct'
    };
    this.twenties = {
      2: 'dvacet',
      3: 'třicet',
      4: 'čtyřicet',
      5: 'padesát',
      6: 'šedesát',
      7: 'sedmdesát',
      8: 'osmdesát',
      9: 'devadesát'
    };
    this.hundreds = {
      1: 'sto',
      2: 'dvě stě',
      3: 'tři sta',
      4: 'čtyři sta',
      5: 'pět set',
      6: 'šest set',
      7: 'sedm set',
      8: 'osm set',
      9: 'devět set'
    };
    this.thousands = {
      1: ['tisíc', 'tisíce', 'tisíc'], // 10^ 3
      2: ['milion', 'miliony', 'milionů'], // 10^ 6
      3: ['miliarda', 'miliardy', 'miliard'], // 10^ 9
      4: ['bilion', 'biliony', 'bilionů'], // 10^ 12
      5: ['biliarda', 'biliardy', 'biliard'], // 10^ 15
      6: ['trilion', 'triliony', 'trilionů'], // 10^ 18
      7: ['triliarda', 'triliardy', 'triliard'], // 10^ 21
      8: ['kvadrilion', 'kvadriliony', 'kvadrilionů'], // 10^ 24
      9: ['kvadriliarda', 'kvadriliardy', 'kvadriliard'], // 10^ 27
      10: ['quintillion', 'quintilliony', 'quintillionů'], // 10^ 30
    };
  }

  get separatorWord() {
    if (this.wholeNumber === 0n || this.wholeNumber === 1n) {
      return 'celá';
    } else if (this.wholeNumber >= 2n && this.wholeNumber <= 4n) {
      return 'celé';
    } else {
      return 'celých';
    }
  }

  pluralize(n, forms) {
    let form = 2;
    if (n == 1) {
      form = 0;
    } else if (((n % 10 < 5) && (n % 10 > 1)) && (n % 100 < 10 || n % 100 > 20)) {
      form = 1;
    }
    return forms[form];
  }

  toCardinal(number) {
    if (number == 0) {
      return this.zero;
    }
    const words = [];
    const chunks = this.splitByX(JSON.stringify(Number(number)), 3);
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
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new N2WordsCZ().floatToCardinal(value);
}
