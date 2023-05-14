import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsDE extends BaseLanguage {
  constructor() {
    super({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'null'
    },[
      [1000000000000000000000000000n, 'Quadrilliarde'],
      [1000000000000000000000000n, 'Quadrillion'],
      [1000000000000000000000n, 'Trilliarde'],
      [1000000000000000000n, 'Trillion'],
      [1000000000000000n, 'Billiarde'],
      [1000000000000n, 'Billion'],
      [1000000000n, 'Milliarde'],
      [1000000n, 'Million'],
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

  merge(curr, next) {
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = parseInt(Object.values(curr)[0]);
    const nNum = parseInt(Object.values(next)[0]);
    if (cNum == 1) {
      if (nNum == 100 || nNum == 1000) {
        return { [`ein${nText}`]: nNum };
      } else if (nNum < 1000000) {
        return { [nText]: nNum };
      }
      cText = 'eine';
    }

    let val = 0;
    if (nNum > cNum) {
      if (nNum >= 1000000) {
        if (cNum > 1) {
          if (nText[nText.length - 1] == 'e') {
            nText += 'n';
          } else {
            nText += 'en';
          }
        }
        cText += ' ';
      }
      val = cNum * nNum;
    } else {
      if (nNum < 10 && cNum > 10 && cNum < 100) {
        if (nNum == 1) {
          nText = 'ein';
        }
        const temp = nText;
        nText = cText;
        cText = `${temp}und`;
      } else if (cNum >= 1000000) {
        cText += ' ';
      }
      val = cNum + nNum;
    }

    return { [`${cText}${nText}`]: val };
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new N2WordsDE().floatToCardinal(value);
}
