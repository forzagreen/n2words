import BaseLanguage from '../classes/base-language.js'

/**
 * Portuguese language converter.
 *
 * Features:
 * - Gender-aware hundreds (hundredos, duzentos, etc.)
 * - Million/Billion pluralization
 * - "e" (and) conjunction for number combinations
 * - Post-processing to normalize word flow
 */
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
  }

  constructor (options) {
    options = Object.assign({
      negativeWord: 'menos',
      separatorWord: 'vírgula',
      zero: 'zero'
    }, options)

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
    ])
  }

  postClean (words) {
    const transforms = ['mil', 'milhão', 'milhões', 'mil milhões', 'bilião', 'biliões', 'mil biliões']

    for (const transform of transforms) {
      if (new RegExp(String.raw`.*${transform} e \w*entos? (?=.*e)`).test(words)) {
        words = words.replaceAll(new RegExp(`${transform} e`, 'g'), `${transform}`)
      }
    }

    return words
  }

  merge (current, next) {
    let cText = Object.keys(current)[0]
    let nText = Object.keys(next)[0]
    const cNumber = BigInt(Object.values(current)[0])
    const nNumber = BigInt(Object.values(next)[0])

    if (cNumber === 1n) {
      if (nNumber < 1_000_000) return { [nText]: nNumber }
      cText = 'um'
    } else if (cNumber === 100n && nNumber % 1000n !== 0n) {
      cText = 'cento'
    }

    if (nNumber < cNumber) {
      // if (cNum < 100) {
      //   return { [`${cText} e ${nText}`]: cNum + nNum }
      // }
      return { [`${cText} e ${nText}`]: cNumber + nNumber }
    } else if (nNumber % 1_000_000_000n === 0n && cNumber > 1n) {
      nText = nText.slice(0, -4) + 'liões'
    } else if (nNumber % 1_000_000n === 0n && cNumber > 1n) {
      nText = nText.slice(0, -4) + 'lhões'
    } else if (nNumber % 1_000_000n === 0n && cNumber > 1n) {
      nText = nText.slice(0, -4) + 'lhões'
    }
    if (nText === 'milião') nText = 'milhão'

    if (nNumber === 100n) {
      cText = this.hundreds[cNumber]
      nText = ''
    } else {
      nText = ' ' + nText
    }
    return { [`${cText}${nText}`]: cNumber * nNumber }
  }
}

/**
 * Converts a number to Portuguese cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see N2WordsPT class).
 * @returns {string} The number expressed in Portuguese words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(42, { lang: 'pt' }); // 'quarenta e dois'
 * floatToCardinal(100.5, { lang: 'pt' }); // 'cem vírgula cinco'
 */
export default function floatToCardinal (value, options = {}) {
  return new N2WordsPT(options).floatToCardinal(value)
}
