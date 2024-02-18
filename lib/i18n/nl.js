import BaseLanguage from '../classes/BaseLanguage.js';

export class N2WordsNL extends BaseLanguage {
  includeOptionalAnd;
  noHundredPairs;

  constructor(options) {
    options = Object.assign({
      negativeWord: 'min',
      separatorWord: 'komma',
      zero: 'nul',
      includeOptionalAnd: false,
      noHundredPairs: false
    }, options);

    super(options, [
      [1000000000000000000000000000n, 'quadriljard'],
      [1000000000000000000000000n, 'quadriljoen'],
      [1000000000000000000000n, 'triljard'],
      [1000000000000000000n, 'triljoen'],
      [1000000000000000n, 'biljard'],
      [1000000000000n, 'biljoen'],
      [1000000000n, 'miljard'],
      [1000000n, 'miljoen'],
      [1000n, 'duizend'],
      [100n, 'honderd'],
      [90n, 'negentig'],
      [80n, 'tachtig'],
      [70n, 'zeventig'],
      [60n, 'zestig'],
      [50n, 'vijftig'],
      [40n, 'veertig'],
      [30n, 'dertig'],
      [20n, 'twintig'],
      [19n, 'negentien'],
      [18n, 'achttien'],
      [17n, 'zeventien'],
      [16n, 'zestien'],
      [15n, 'vijftien'],
      [14n, 'veertien'],
      [13n, 'dertien'],
      [12n, 'twaalf'],
      [11n, 'elf'],
      [10n, 'tien'],
      [9n, 'negen'],
      [8n, 'acht'],
      [7n, 'zeven'],
      [6n, 'zes'],
      [5n, 'vijf'],
      [4n, 'vier'],
      [3n, 'drie'],
      [2n, 'twee'],
      [1n, 'een'],
      [0n, 'nul'],
    ]);

    this.includeOptionalAnd = options.includeOptionalAnd;
    this.noHundredPairs = options.noHundredPairs;
  }

  merge(curr, next) {
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = BigInt(Object.values(curr)[0]);
    const nNum = BigInt(Object.values(next)[0]);
    if (cNum == 1) {
      if (nNum < 1000000) {
        return { [nText]: nNum };
      }
      cText = 'een';
    }

    let val = 0;
    if (nNum > cNum) {
      if (nNum >= 1000000) {
        cText += ' ';
      } else if (nNum > 100) {
        nText += ' ';
      }
      val = cNum * nNum;
    } else {
      if (nNum < 10 && cNum > 10 && cNum < 100) {
        const temp = nText;
        nText = cText;
        const andTxt = temp.endsWith('e') ? 'ën' : 'en';
        cText = `${temp}${andTxt}`;
      } else if (nNum < 13 && cNum < 1000 && this.includeOptionalAnd) {
        cText = `${cText}en`;
      } else if (nNum < 13 && cNum >= 1000 && this.includeOptionalAnd) {
        nText = ` en ${nText}`;
      } else if (cNum >= 1000000) {
        cText += ' ';
      } else {
        if (cNum == 1000) {
          cText += ' ';
        }
      }
      val = cNum + nNum;
    }
    return { [`${cText}${nText}`]: val };
  }

  toCardinal(value) {
    if (value >= 1100n && value < 10000n && !this.noHundredPairs) {
      const high = value / 100n;
      const low = value % 100n;
      if (high % 10n !== 0n) {
        return super.toCardinal(high) + 'honderd' +
          (low ? (this.includeOptionalAnd ? ' en ' : ' ') + super.toCardinal(low) : '');
      }
    }
    return super.toCardinal(value);
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function (value, options = {}) {
  return new N2WordsNL(options).floatToCardinal(value);
}
