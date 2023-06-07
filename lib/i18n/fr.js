import BaseLanguage from '../classes/BaseLanguage.js';

export class N2WordsFR extends BaseLanguage {
  constructor(options) {
    super(Object.assign({
      negativeWord: 'moins',
      separatorWord: 'virgule',
      zero: 'zéro'
    }, options), [
      [1000000000000000000000000000n, 'quadrilliard'],
      [1000000000000000000000000n, 'quadrillion'],
      [1000000000000000000000n, 'trilliard'],
      [1000000000000000000n, 'trillion'],
      [1000000000000000n, 'billiard'],
      [1000000000000n, 'billion'],
      [1000000000n, 'milliard'],
      [1000000n, 'million'],
      [1000n, 'mille'],
      [100n, 'cent'],
      [80n, 'quatre-vingts'],
      [60n, 'soixante'],
      [50n, 'cinquante'],
      [40n, 'quarante'],
      [30n, 'trente'],
      [20n, 'vingt'],
      [19n, 'dix-neuf'],
      [18n, 'dix-huit'],
      [17n, 'dix-sept'],
      [16n, 'seize'],
      [15n, 'quinze'],
      [14n, 'quatorze'],
      [13n, 'treize'],
      [12n, 'douze'],
      [11n, 'onze'],
      [10n, 'dix'],
      [9n, 'neuf'],
      [8n, 'huit'],
      [7n, 'sept'],
      [6n, 'six'],
      [5n, 'cinq'],
      [4n, 'quatre'],
      [3n, 'trois'],
      [2n, 'deux'],
      [1n, 'un'],
      [0n, 'zéro']
    ]);
  }

  merge(curr, next) { // {'cent':100}, {'vingt-cinq':25}
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = BigInt(Object.values(curr)[0]);
    const nNum = BigInt(Object.values(next)[0]);
    if (cNum == 1) {
      if (nNum < 1000000) {
        return { [nText]: nNum };
      }
    } else {
      if (
        ((cNum - 80n) % 100n == 0 || (cNum % 100n == 0 && cNum < 1000)) &&
        nNum < 1000000 &&
        cText[cText.length - 1] == 's'
      ) {
        cText = cText.slice(0, -1); // without last elem
      }
      if (
        cNum < 1000 && nNum != 1000 &&
        nText[nText.length - 1] != 's' &&
        nNum % 100n == 0
      ) {
        nText += 's';
      }
    }
    if (nNum < cNum && cNum < 100) {
      if (nNum % 10n == 1 && cNum != 80) return { [`${cText} et ${nText}`]: cNum + nNum };
      return { [`${cText}-${nText}`]: cNum + nNum };
    }
    if (nNum > cNum) return { [`${cText} ${nText}`]: cNum * nNum };
    return { [`${cText} ${nText}`]: cNum + nNum };
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
  return new N2WordsFR(options).floatToCardinal(value);
}
