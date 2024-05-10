import BaseLanguage from '../classes/base-language.js';

export class N2WordsTR extends BaseLanguage {
  constructor(options = {}) {
    super(Object.assign({
      negativeWord: 'eksi',
      separatorWord: 'virgül',
      zero: 'sıfır',
      spaceSeparator: (options.dropSpaces === true ? '' : ' '),
    }, options), [
      [1_000_000_000_000_000_000n, 'kentilyon'],
      [1_000_000_000_000_000n, 'katrilyon'],
      [1_000_000_000_000n, 'trilyon'],
      [1_000_000_000n, 'milyar'],
      [1_000_000n, 'milyon'],
      [1000n, 'bin'],
      [100n, 'yüz'],
      [90n, 'doksan'],
      [80n, 'seksen'],
      [70n, 'yetmiş'],
      [60n, 'altmış'],
      [50n, 'elli'],
      [40n, 'kırk'],
      [30n, 'otuz'],
      [20n, 'yirmi'],
      [10n, 'on'],
      [9n, 'dokuz'],
      [8n, 'sekiz'],
      [7n, 'yedi'],
      [6n, 'altı'],
      [5n, 'beş'],
      [4n, 'dört'],
      [3n, 'üç'],
      [2n, 'iki'],
      [1n, 'bir'],
      [0n, 'sıfır']
    ]);
  }

  merge(lPair, rPair) {
    const lText = Object.keys(lPair)[0];
    const rText = Object.keys(rPair)[0];
    const lNumber = BigInt(Object.values(lPair)[0]);
    const rNumber = BigInt(Object.values(rPair)[0]);
    if (lNumber == 1 && (rNumber <= 100 || rNumber == 1000)) {
      return { [rText]: rNumber };
    } else if (rNumber > lNumber) {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNumber * rNumber };
    } else {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNumber + rNumber };
    }
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
  return new N2WordsTR(options).floatToCardinal(value);
}
