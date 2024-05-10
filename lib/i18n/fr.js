import BaseLanguage from '../classes/base-language.js';

export class N2WordsFR extends BaseLanguage {
  constructor(options) {
    options = Object.assign({
      negativeWord: 'moins',
      separatorWord: 'virgule',
      zero: 'zéro',
      _region: 'FR'
    }, options);

    super(options, [
      [1_000_000_000_000_000_000_000_000_000n, 'quadrilliard'],
      [1_000_000_000_000_000_000_000_000n, 'quadrillion'],
      [1_000_000_000_000_000_000_000n, 'trilliard'],
      [1_000_000_000_000_000_000n, 'trillion'],
      [1_000_000_000_000_000n, 'billiard'],
      [1_000_000_000_000n, 'billion'],
      [1_000_000_000n, 'milliard'],
      [1_000_000n, 'million'],
      [1000n, 'mille'],
      [100n, 'cent'],
      ...(['BE'].includes(options._region) ? [[90n, 'nonante']] : []),
      [80n, 'quatre-vingts'],
      ...(['BE'].includes(options._region) ? [[70n, 'septante']] : []),
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

  merge(current, next) { // {'cent':100}, {'vingt-cinq':25}
    let cText = Object.keys(current)[0];
    let nText = Object.keys(next)[0];
    const cNumber = BigInt(Object.values(current)[0]);
    const nNumber = BigInt(Object.values(next)[0]);
    if (cNumber == 1) {
      if (nNumber < 1_000_000) {
        return { [nText]: nNumber };
      }
    } else {
      if (
        ((cNumber - 80n) % 100n == 0 || (cNumber % 100n == 0 && cNumber < 1000)) &&
        nNumber < 1_000_000 &&
        cText.at(-1) == 's'
      ) {
        cText = cText.slice(0, -1); // without last elem
      }
      if (
        cNumber < 1000 && nNumber != 1000 &&
        nText.at(-1) != 's' &&
        nNumber % 100n == 0
      ) {
        nText += 's';
      }
    }
    if (nNumber < cNumber && cNumber < 100) {
      if (nNumber % 10n == 1 && cNumber != 80) return { [`${cText} et ${nText}`]: cNumber + nNumber };
      return { [`${cText}-${nText}`]: cNumber + nNumber };
    }
    if (nNumber > cNumber) return { [`${cText} ${nText}`]: cNumber * nNumber };
    return { [`${cText} ${nText}`]: cNumber + nNumber };
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
  return new N2WordsFR(options).floatToCardinal(value);
}
