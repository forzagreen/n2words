import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsTR extends BaseLanguage {
  constructor(options) {
    super(Object.assign({
      negativeWord: 'eksi',
      separatorWord: 'virgül',
      zero: 'sıfır',
      spaceSeparator: (options.dropSpaces === true ? '' : ' '),
    }, options), [
      [1000000000000000000n, 'kentilyon'],
      [1000000000000000n, 'katrilyon'],
      [1000000000000n, 'trilyon'],
      [1000000000n, 'milyar'],
      [1000000n, 'milyon'],
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
    const lNum = parseInt(Object.values(lPair)[0]);
    const rNum = parseInt(Object.values(rPair)[0]);
    if (lNum == 1 && (rNum <= 100 || rNum == 1000)) {
      return { [rText]: rNum };
    } else if (rNum > lNum) {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNum * rNum };
    } else {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNum + rNum };
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
export default function(value, options = {}) {
  return new N2WordsTR(options).floatToCardinal(value);
}
