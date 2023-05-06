import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsPT extends BaseLanguage {
  constructor() {
    super({
      negativeWord: 'menos',
      separatorWord: 'vírgula',
      zero: 'zero'
    },[
      [1000000000000000000000000, 'quatrilião'],
      [1000000000000000000, 'trilião'],
      [1000000000000, 'bilião'],
      [1000000, 'milião'],
      [1000, 'mil'],
      [100, 'cem'],
      [90, 'noventa'],
      [80, 'oitenta'],
      [70, 'setenta'],
      [60, 'sessenta'],
      [50, 'cinquenta'],
      [40, 'quarenta'],
      [30, 'trinta'],
      [20, 'vinte'],
      [19, 'dezanove'],
      [18, 'dezoito'],
      [17, 'dezassete'],
      [16, 'dezasseis'],
      [15, 'quinze'],
      [14, 'catorze'],
      [13, 'treze'],
      [12, 'doze'],
      [11, 'onze'],
      [10, 'dez'],
      [9, 'nove'],
      [8, 'oito'],
      [7, 'sete'],
      [6, 'seis'],
      [5, 'cinco'],
      [4, 'quatro'],
      [3, 'três'],
      [2, 'dois'],
      [1, 'um'],
      [0, 'zero']
    ]);

    this.hundreds = {
      1: 'cento',
      2: 'duzentos',
      3: 'trezentos',
      4: 'quatrocentos',
      5: 'quinhentos',
      6: 'seiscentos',
      7: 'setecentos',
      8: 'oitocentos',
      9: 'novecentos'
    };
  }

  postClean(words) {
    const transforms = ['mil', 'milhão', 'milhões', 'mil milhões', 'bilião', 'biliões', 'mil biliões'];
    for (let i = 0; i < transforms.length; i++) {
      const ext = transforms[i];
      if (words.match(new RegExp(`.*${ext} e \\w*entos? (?=.*e)`))) {
        words = words.replace(new RegExp(`${ext} e`, 'g'), `${ext}`);
      }
    }
    return words;
  }

  merge(curr, next) {
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = parseInt(Object.values(curr)[0]);
    const nNum = parseInt(Object.values(next)[0]);
    if (cNum == 1) {
      if (nNum < 1000000) return { [nText]: nNum };
      cText = 'um';
    } else if (cNum == 100 && nNum % 1000 != 0) {
      cText = 'cento';
    }

    if (nNum < cNum) {
      // if (cNum < 100) {
      //   return { [`${cText} e ${nText}`]: cNum + nNum }
      // }
      return { [`${cText} e ${nText}`]: cNum + nNum };
    } else if (nNum % 1000000000 == 0 && cNum > 1) {
      nText = nText.slice(0, -4) + 'liões';
    } else if (nNum % 1000000 == 0 && cNum > 1) {
      nText = nText.slice(0, -4) + 'lhões';
    }

    if (nText == 'milião') nText = 'milhão';

    if (nNum == 100) {
      cText = this.hundreds[cNum];
      nText = '';
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
  return new N2WordsPT().floatToCardinal(value);
}
