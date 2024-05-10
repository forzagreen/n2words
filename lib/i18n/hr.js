import { N2WordsRU } from './ru.js';

export class N2WordsHR extends N2WordsRU {
  ones = {
    1: ['jedan', 'jedna'],
    2: ['dva', 'dvije'],
    3: ['tri', 'tri'],
    4: ['četiri', 'četiri'],
    5: ['pet', 'pet'],
    6: ['šest', 'šest'],
    7: ['sedam', 'sedam'],
    8: ['osam', 'osam'],
    9: ['devet', 'devet']
  };

  tens = {
    0: 'deset',
    1: 'jedanaest',
    2: 'dvanaest',
    3: 'trinaest',
    4: 'četrnaest',
    5: 'petnaest',
    6: 'šesnaest',
    7: 'sedamnaest',
    8: 'osamnaest',
    9: 'devetnaest'
  };

  twenties = {
    2: 'dvadeset',
    3: 'trideset',
    4: 'četrdeset',
    5: 'pedeset',
    6: 'šezdeset',
    7: 'sedamdeset',
    8: 'osamdeset',
    9: 'devedeset'
  };

  hundreds = {
    1: 'sto',
    2: 'dvjesto',
    3: 'tristo',
    4: 'četiristo',
    5: 'petsto',
    6: 'šesto',
    7: 'sedamsto',
    8: 'osamsto',
    9: 'devetsto'
  };

  SCALE = {
    0: ['', '', '', false],
    1: ['tisuća', 'tisuće', 'tisuća', true], // 10 ^ 3
    2: ['milijun', 'milijuna', 'milijuna', false], // 10 ^ 6
    3: ['milijarda', 'milijarde', 'milijarda', false], // 10 ^ 9
    4: ['bilijun', 'bilijuna', 'bilijuna', false], // 10 ^ 12
    5: ['bilijarda', 'bilijarde', 'bilijarda', false], // 10 ^ 15
    6: ['trilijun', 'trilijuna', 'trilijuna', false], // 10 ^ 18
    7: ['trilijarda', 'trilijarde', 'trilijarda', false], // 10 ^ 21
    8: ['kvadrilijun', 'kvadrilijuna', 'kvadrilijuna', false], // 10 ^ 24
    9: ['kvadrilijarda', 'kvadrilijarde', 'kvadrilijarda', false], // 10 ^ 27
    10: ['kvintilijun', 'kvintilijuna', 'kvintilijuna', false], // 10 ^ 30
  };

  constructor(options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'zarez',
      zero: 'nula'
    }, options);

    super(options);
  }

  pluralize(n, forms) {
    let form = 2;
    if ((n % 100n < 10n) || (n % 100n > 20n)) {
      if (n % 10n == 1n) {
        form = 0;
      } else if ((n % 10n > 1n) && (n % 10n < 5n)) {
        form = 1;
      }
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
      // if (x == 0) { continue; }
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
        const isFeminine = (this.feminine || this.SCALE[index][3]);
        const genderIndex = isFeminine ? 1 : 0;
        words.push(this.ones[n1][genderIndex]);
      }
      if ((index > 0) && (x != 0)) {
        words.push(this.pluralize(x, this.SCALE[index]));
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
  return new N2WordsHR(options).floatToCardinal(value);
}
