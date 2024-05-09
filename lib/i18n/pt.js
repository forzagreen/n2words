import BaseLanguage from '../classes/base-language.js';

export class N2WordsPT extends BaseLanguage {
  hundreds = {
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

  constructor(options) {
    options = Object.assign({
      negativeWord: 'menos',
      separatorWord: 'vírgula',
      zero: 'zero'
    }, options);

    super(options, [
      [1_000_000_000_000_000_000_000_000n, 'quatrilião'],
      [1_000_000_000_000_000_000n, 'trilião'],
      [1_000_000_000_000n, 'bilião'],
      [1_000_000n, 'milião'],
      [1000n, 'mil'],
      [100n, 'cem'],
      [90n, 'noventa'],
      [80n, 'oitenta'],
      [70n, 'setenta'],
      [60n, 'sessenta'],
      [50n, 'cinquenta'],
      [40n, 'quarenta'],
      [30n, 'trinta'],
      [20n, 'vinte'],
      [19n, 'dezanove'],
      [18n, 'dezoito'],
      [17n, 'dezassete'],
      [16n, 'dezasseis'],
      [15n, 'quinze'],
      [14n, 'catorze'],
      [13n, 'treze'],
      [12n, 'doze'],
      [11n, 'onze'],
      [10n, 'dez'],
      [9n, 'nove'],
      [8n, 'oito'],
      [7n, 'sete'],
      [6n, 'seis'],
      [5n, 'cinco'],
      [4n, 'quatro'],
      [3n, 'três'],
      [2n, 'dois'],
      [1n, 'um'],
      [0n, 'zero']
    ]);
  }

  postClean(words) {
    const transforms = ['mil', 'milhão', 'milhões', 'mil milhões', 'bilião', 'biliões', 'mil biliões'];

    for (const transform of transforms) {
      if (new RegExp(`.*${transform} e \\w*entos? (?=.*e)`).test(words)) {
        words = words.replaceAll(new RegExp(`${transform} e`, 'g'), `${transform}`);
      }
    }

    return words;
  }

  merge(current, next) {
    let cText = Object.keys(current)[0];
    let nText = Object.keys(next)[0];
    const cNumber = BigInt(Object.values(current)[0]);
    const nNumber = BigInt(Object.values(next)[0]);

    if (cNumber == 1) {
      if (nNumber < 1_000_000) return { [nText]: nNumber };
      cText = 'um';
    } else if (cNumber == 100 && nNumber % 1000n != 0) {
      cText = 'cento';
    }

    if (nNumber < cNumber) {
      // if (cNum < 100) {
      //   return { [`${cText} e ${nText}`]: cNum + nNum }
      // }
      return { [`${cText} e ${nText}`]: cNumber + nNumber };
    } else if (nNumber % 1_000_000_000n == 0 && cNumber > 1) {
      nText = nText.slice(0, -4) + 'liões';
    } else if (nNumber % 1_000_000n == 0 && cNumber > 1) {
      nText = nText.slice(0, -4) + 'lhões';
    }

    if (nText == 'milião') nText = 'milhão';

    if (nNumber == 100) {
      cText = this.hundreds[cNumber];
      nText = '';
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
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function floatToCardinal (value, options = {}) {
  return new N2WordsPT(options).floatToCardinal(value);
}
