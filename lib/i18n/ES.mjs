import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsES extends BaseLanguage {
  genderStem;

  constructor() {
    super({
      negativeWord: 'menos',
      separatorWord: 'punto',
      zero: 'cero'
    },[
      [1000000000000000000000000, 'cuatrillón'],
      [1000000000000000000, 'trillón'],
      [1000000000000, 'billón'],
      [1000000, 'millón'],
      [1000, 'mil'],
      [100, 'cien'],
      [90, 'noventa'],
      [80, 'ochenta'],
      [70, 'setenta'],
      [60, 'sesenta'],
      [50, 'cincuenta'],
      [40, 'cuarenta'],
      [30, 'treinta'],
      [29, 'veintinueve'],
      [28, 'veintiocho'],
      [27, 'veintisiete'],
      [26, 'veintiséis'],
      [25, 'veinticinco'],
      [24, 'veinticuatro'],
      [23, 'veintitrés'],
      [22, 'veintidós'],
      [21, 'veintiuno'],
      [20, 'veinte'],
      [19, 'diecinueve'],
      [18, 'dieciocho'],
      [17, 'diecisiete'],
      [16, 'dieciseis'],
      [15, 'quince'],
      [14, 'catorce'],
      [13, 'trece'],
      [12, 'doce'],
      [11, 'once'],
      [10, 'diez'],
      [9, 'nueve'],
      [8, 'ocho'],
      [7, 'siete'],
      [6, 'seis'],
      [5, 'cinco'],
      [4, 'cuatro'],
      [3, 'tres'],
      [2, 'dos'],
      [1, 'uno'],
      [0, 'cero']
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

export default function(n) {
  return new N2WordsES().floatToCardinal(n);
}
