import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsES extends BaseLanguage {
  genderStem;

  constructor() {
    super({
      negativeWord: 'menos',
      separatorWord: 'punto',
      zero: 'cero'
    },[
      [1000000000000000000000000n, 'cuatrillón'],
      [1000000000000000000n, 'trillón'],
      [1000000000000n, 'billón'],
      [1000000n, 'millón'],
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

    this.genderStem = 'o';
  }

  merge(curr, next) {
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = parseInt(Object.values(curr)[0]);
    const nNum = parseInt(Object.values(next)[0]);
    if (cNum == 1) {
      if (nNum < 1000000) return { [nText]: nNum };
      cText = 'un';
    } else if (cNum == 100 && nNum % 1000 != 0) {
      cText += 't' + this.genderStem;
    }

    if (nNum < cNum) {
      if (cNum < 100) {
        return { [`${cText} y ${nText}`]: cNum + nNum };
      }
      return { [`${cText} ${nText}`]: cNum + nNum };
    } else if (nNum % 1000000 == 0 && cNum > 1) {
      nText = nText.slice(0, -3) + 'lones';
    }

    if (nNum == 100) {
      if (cNum == 5) {
        cText = 'quinien';
        nText = '';
      } else if (cNum == 7) {
        cText = 'sete';
      } else if (cNum == 9) {
        cText = 'nove';
      }
      nText += 't' + this.genderStem + 's';
    } else {
      nText = ' ' + nText;
    }
    return { [`${cText}${nText}`]: cNum * nNum };
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new N2WordsES().floatToCardinal(value);
}
