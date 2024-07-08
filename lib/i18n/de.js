import BaseLanguage from '../classes/base-language.js';

/**
 * @augments BaseLanguage
 */
class N2WordsDE extends BaseLanguage {
  constructor(options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'null'
    }, options);

    super(options, [
      [1_000_000_000_000_000_000_000_000_000n, 'Quadrilliarde'],
      [1_000_000_000_000_000_000_000_000n, 'Quadrillion'],
      [1_000_000_000_000_000_000_000n, 'Trilliarde'],
      [1_000_000_000_000_000_000n, 'Trillion'],
      [1_000_000_000_000_000n, 'Billiarde'],
      [1_000_000_000_000n, 'Billion'],
      [1_000_000_000n, 'Milliarde'],
      [1_000_000n, 'Million'],
      [1000n, 'tausend'],
      [100n, 'hundert'],
      [90n, 'neunzig'],
      [80n, 'achtzig'],
      [70n, 'siebzig'],
      [60n, 'sechzig'],
      [50n, 'fünfzig'],
      [40n, 'vierzig'],
      [30n, 'dreißig'],
      [20n, 'zwanzig'],
      [19n, 'neunzehn'],
      [18n, 'achtzehn'],
      [17n, 'siebzehn'],
      [16n, 'sechzehn'],
      [15n, 'fünfzehn'],
      [14n, 'vierzehn'],
      [13n, 'dreizehn'],
      [12n, 'zwölf'],
      [11n, 'elf'],
      [10n, 'zehn'],
      [9n, 'neun'],
      [8n, 'acht'],
      [7n, 'sieben'],
      [6n, 'sechs'],
      [5n, 'fünf'],
      [4n, 'vier'],
      [3n, 'drei'],
      [2n, 'zwei'],
      [1n, 'eins'],
      [0n, 'null']
    ]);
  }

  merge(current, next) {
    let cText = Object.keys(current)[0];
    let nText = Object.keys(next)[0];
    const cNumber = BigInt(Object.values(current)[0]);
    const nNumber = BigInt(Object.values(next)[0]);
    if (cNumber == 1) {
      if (nNumber == 100 || nNumber == 1000) {
        return { [`ein${nText}`]: nNumber };
      } else if (nNumber < 1_000_000) {
        return { [nText]: nNumber };
      }
      cText = 'eine';
    }

    let value = 0;
    if (nNumber > cNumber) {
      if (nNumber >= 1_000_000) {
        if (cNumber > 1) {
          nText += nText.at(-1) == 'e' ? 'n' : 'en';
        }
        cText += ' ';
      }
      value = cNumber * nNumber;
    } else {
      if (nNumber < 10 && cNumber > 10 && cNumber < 100) {
        if (nNumber == 1) {
          nText = 'ein';
        }
        const temporary = nText;
        nText = cText;
        cText = `${temporary}und`;
      } else if (cNumber >= 1_000_000) {
        cText += ' ';
      }
      value = cNumber + nNumber;
    }

    return { [`${cText}${nText}`]: value };
  }
}

export default N2WordsDE;
