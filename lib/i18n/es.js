import BaseLanguage from '../classes/base-language.js';

export class N2WordsES extends BaseLanguage {
  genderStem;

  constructor(options) {
    options = Object.assign({
      negativeWord: 'menos',
      separatorWord: 'punto',
      zero: 'cero',
      genderStem: 'o'
    }, options);

    super(options, [
      [1_000_000_000_000_000_000_000_000n, 'cuatrillón'],
      [1_000_000_000_000_000_000n, 'trillón'],
      [1_000_000_000_000n, 'billón'],
      [1_000_000n, 'millón'],
      [1000n, 'mil'],
      [100n, 'cien'],
      [90n, 'noventa'],
      [80n, 'ochenta'],
      [70n, 'setenta'],
      [60n, 'sesenta'],
      [50n, 'cincuenta'],
      [40n, 'cuarenta'],
      [30n, 'treinta'],
      [29n, 'veintinueve'],
      [28n, 'veintiocho'],
      [27n, 'veintisiete'],
      [26n, 'veintiséis'],
      [25n, 'veinticinco'],
      [24n, 'veinticuatro'],
      [23n, 'veintitrés'],
      [22n, 'veintidós'],
      [21n, 'veintiuno'],
      [20n, 'veinte'],
      [19n, 'diecinueve'],
      [18n, 'dieciocho'],
      [17n, 'diecisiete'],
      [16n, 'dieciseis'],
      [15n, 'quince'],
      [14n, 'catorce'],
      [13n, 'trece'],
      [12n, 'doce'],
      [11n, 'once'],
      [10n, 'diez'],
      [9n, 'nueve'],
      [8n, 'ocho'],
      [7n, 'siete'],
      [6n, 'seis'],
      [5n, 'cinco'],
      [4n, 'cuatro'],
      [3n, 'tres'],
      [2n, 'dos'],
      [1n, 'uno'],
      [0n, 'cero']
    ]);

    this.genderStem = options.genderStem;
  }

  merge(current, next) {
    let cText = Object.keys(current)[0];
    let nText = Object.keys(next)[0];
    const cNumber = BigInt(Object.values(current)[0]);
    const nNumber = BigInt(Object.values(next)[0]);
    if (cNumber == 1) {
      if (nNumber < 1_000_000) return { [nText]: nNumber };
      cText = 'un';
    } else if (cNumber == 100 && nNumber % 1000n != 0) {
      cText += 't' + this.genderStem;
    }

    if (nNumber < cNumber) {
      if (cNumber < 100) {
        return { [`${cText} y ${nText}`]: cNumber + nNumber };
      }
      return { [`${cText} ${nText}`]: cNumber + nNumber };
    } else if (nNumber % 1_000_000n == 0 && cNumber > 1) {
      nText = nText.slice(0, -3) + 'lones';
    }

    if (nNumber == 100) {
      if (cNumber == 5) {
        cText = 'quinien';
        nText = '';
      } else if (cNumber == 7) {
        cText = 'sete';
      } else if (cNumber == 9) {
        cText = 'nove';
      }
      nText += 't' + this.genderStem + 's';
    } else {
      nText = ' ' + nText;
    }
    return { [`${cText}${nText}`]: cNumber * nNumber };
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
  return new N2WordsES(options).floatToCardinal(value);
}
