import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsFR extends BaseLanguage {
  constructor() {
    super();

    this.negativeWord = 'moins';
    this.separatorWord = 'virgule';
    this.zero = 'zéro';
    this.cards = [
      [1000000000000000000000000000, 'quadrilliard'],
      [1000000000000000000000000, 'quadrillion'],
      [1000000000000000000000, 'trilliard'],
      [1000000000000000000, 'trillion'],
      [1000000000000000, 'billiard'],
      [1000000000000, 'billion'],
      [1000000000, 'milliard'],
      [1000000, 'million'],
      [1000, 'mille'],
      [100, 'cent'],
      [80, 'quatre-vingts'],
      [60, 'soixante'],
      [50, 'cinquante'],
      [40, 'quarante'],
      [30, 'trente'],
      [20, 'vingt'],
      [19, 'dix-neuf'],
      [18, 'dix-huit'],
      [17, 'dix-sept'],
      [16, 'seize'],
      [15, 'quinze'],
      [14, 'quatorze'],
      [13, 'treize'],
      [12, 'douze'],
      [11, 'onze'],
      [10, 'dix'],
      [9, 'neuf'],
      [8, 'huit'],
      [7, 'sept'],
      [6, 'six'],
      [5, 'cinq'],
      [4, 'quatre'],
      [3, 'trois'],
      [2, 'deux'],
      [1, 'un'],
      [0, 'zéro']
    ];
  }

  merge(curr, next) { // {'cent':100}, {'vingt-cinq':25}
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = parseInt(Object.values(curr)[0]);
    const nNum = parseInt(Object.values(next)[0]);
    if (cNum == 1) {
      if (nNum < 1000000) {
        return { [nText]: nNum };
      }
    } else {
      if (
        ((cNum - 80) % 100 == 0 || (cNum % 100 == 0 && cNum < 1000)) &&
        nNum < 1000000 &&
        cText[cText.length - 1] == 's'
      ) {
        cText = cText.slice(0, -1); // without last elem
      }
      if (
        cNum < 1000 && nNum != 1000 &&
        nText[nText.length - 1] != 's' &&
        nNum % 100 == 0
      ) {
        nText += 's';
      }
    }
    if (nNum < cNum && cNum < 100) {
      if (nNum % 10 == 1 && cNum != 80) return { [`${cText} et ${nText}`]: cNum + nNum };
      return { [`${cText}-${nText}`]: cNum + nNum };
    }
    if (nNum > cNum) return { [`${cText} ${nText}`]: cNum * nNum };
    return { [`${cText} ${nText}`]: cNum + nNum };
  }
}

export default function(n) {
  return new N2WordsFR().floatToCardinal(n);
}
