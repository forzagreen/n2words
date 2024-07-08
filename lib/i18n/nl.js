import BaseLanguage from '../classes/base-language.js';

/**
 * @augments BaseLanguage
 */
class N2WordsNL extends BaseLanguage {
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
      [1_000_000_000_000_000_000_000_000_000n, 'quadriljard'],
      [1_000_000_000_000_000_000_000_000n, 'quadriljoen'],
      [1_000_000_000_000_000_000_000n, 'triljard'],
      [1_000_000_000_000_000_000n, 'triljoen'],
      [1_000_000_000_000_000n, 'biljard'],
      [1_000_000_000_000n, 'biljoen'],
      [1_000_000_000n, 'miljard'],
      [1_000_000n, 'miljoen'],
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

  merge(current, next) {
    let cText = Object.keys(current)[0];
    let nText = Object.keys(next)[0];
    const cNumber = BigInt(Object.values(current)[0]);
    const nNumber = BigInt(Object.values(next)[0]);
    if (cNumber == 1) {
      if (nNumber < 1_000_000) {
        return { [nText]: nNumber };
      }
      cText = 'een';
    }

    let value = 0;
    if (nNumber > cNumber) {
      if (nNumber >= 1_000_000) {
        cText += ' ';
      } else if (nNumber > 100) {
        nText += ' ';
      }
      value = cNumber * nNumber;
    } else {
      if (nNumber < 10 && cNumber > 10 && cNumber < 100) {
        const temporary = nText;
        nText = cText;
        const andTxt = temporary.endsWith('e') ? 'ën' : 'en';
        cText = `${temporary}${andTxt}`;
      } else if (nNumber < 13 && cNumber < 1000 && this.includeOptionalAnd) {
        cText = `${cText}en`;
      } else if (nNumber < 13 && cNumber >= 1000 && this.includeOptionalAnd) {
        nText = ` en ${nText}`;
      } else if (cNumber >= 1_000_000) {
        cText += ' ';
      } else {
        if (cNumber == 1000) {
          cText += ' ';
        }
      }
      value = cNumber + nNumber;
    }
    return { [`${cText}${nText}`]: value };
  }

  toCardinal(value) {
    if (value >= 1100n && value < 10_000n && !this.noHundredPairs) {
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

export default N2WordsNL;
