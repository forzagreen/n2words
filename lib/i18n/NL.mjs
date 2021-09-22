import N2WordsBase from '../classes/N2WordsBase.mjs';

export class N2WordsNL extends N2WordsBase {
  constructor(options) {
    super();

    this.negativeWord = 'min';
    this.separatorWord = 'komma';
    this.zero = 'nul';

    this.options = Object.assign({
      includeOptionalAnd: false,
      noHundredPairs: false,
    }, options);

    this.cards = [
      {'1000000000000000000000000000': 'quadriljard'},
      {'1000000000000000000000000': 'quadriljoen'},
      {'1000000000000000000000': 'triljard'},
      {1000000000000000000: 'triljoen'},
      {1000000000000000: 'biljard'},
      {1000000000000: 'biljoen'},
      {1000000000: 'miljard'},
      {1000000: 'miljoen'},
      {1000: 'duizend'},
      {100: 'honderd'},
      {90: 'negentig'},
      {80: 'tachtig'},
      {70: 'zeventig'},
      {60: 'zestig'},
      {50: 'vijftig'},
      {40: 'veertig'},
      {30: 'dertig'},
      {20: 'twintig'},
      {19: 'negentien'},
      {18: 'achttien'},
      {17: 'zeventien'},
      {16: 'zestien'},
      {15: 'vijftien'},
      {14: 'veertien'},
      {13: 'dertien'},
      {12: 'twaalf'},
      {11: 'elf'},
      {10: 'tien'},
      {9: 'negen'},
      {8: 'acht'},
      {7: 'zeven'},
      {6: 'zes'},
      {5: 'vijf'},
      {4: 'vier'},
      {3: 'drie'},
      {2: 'twee'},
      {1: 'een'},
      {0: 'nul'},
    ];
  }

  merge(curr, next) {
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = parseInt(Object.values(curr)[0]);
    const nNum = parseInt(Object.values(next)[0]);
    if (cNum == 1) {
      if (nNum < 1000000) {
        return {[nText]: nNum};
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
      } else if (nNum < 13 && cNum < 1000 && this.options.includeOptionalAnd) {
        cText = `${cText}en`;
      } else if (nNum < 13 && cNum >= 1000 && this.options.includeOptionalAnd) {
        nText = ` en ${nText}`;
      } else if (cNum >= 1000000) {
        cText += ' ';
      } else {
        if (cNum === 1000) {
          cText += ' ';
        }
      }
      val = cNum + nNum;
    }
    return {[`${cText}${nText}`]: val};
  }

  toCardinal(value) {
    if (value >= 1100 && value < 10000 && !this.options.noHundredPairs) {
      const high = Math.floor(value / 100);
      const low = value % 100;
      if (high % 10 !== 0) {
        return super.toCardinal(high) + 'honderd' +
          (low ? (this.options.includeOptionalAnd ? ' en ' : ' ') + super.toCardinal(low) : '');
      }
    }
    return super.toCardinal(value);
  }
}

export default function(n, options = {}) {
  return new N2WordsNL(options).floatToCardinal(n);
}
