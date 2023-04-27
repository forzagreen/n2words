import N2WordsBase from '../classes/N2WordsBase.mjs';

export class N2WordsTR extends N2WordsBase {
  constructor(options) {
    super();

    this.options = Object.assign({
      dropSpaces: false,
    }, options);

    this.negativeWord = 'eksi';
    this.separatorWord = 'virgül';
    this.zero = 'sıfır';
    this.spaceSeparator = (this.options.dropSpaces) ? '' : ' ';
    this.cards = [
      [1000000000000000000, 'kentilyon'],
      [1000000000000000, 'katrilyon'],
      [1000000000000, 'trilyon'],
      [1000000000, 'milyar'],
      [1000000, 'milyon'],
      [1000, 'bin'],
      [100, 'yüz'],
      [90, 'doksan'],
      [80, 'seksen'],
      [70, 'yetmiş'],
      [60, 'altmış'],
      [50, 'elli'],
      [40, 'kırk'],
      [30, 'otuz'],
      [20, 'yirmi'],
      [10, 'on'],
      [9, 'dokuz'],
      [8, 'sekiz'],
      [7, 'yedi'],
      [6, 'altı'],
      [5, 'beş'],
      [4, 'dört'],
      [3, 'üç'],
      [2, 'iki'],
      [1, 'bir'],
      [0, 'sıfır']
    ];
  }

  merge(lPair, rPair) {
    const lText = Object.keys(lPair)[0];
    const rText = Object.keys(rPair)[0];
    const lNum = parseInt(Object.values(lPair)[0]);
    const rNum = parseInt(Object.values(rPair)[0]);
    if (lNum == 1 && (rNum <= 100 || rNum == 1000)) {
      return { [rText]: rNum };
    } else if (rNum > lNum) {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNum * rNum };
    } else {
      return { [`${lText}${this.spaceSeparator}${rText}`]: lNum + rNum };
    }
  }
}

export default function(n, options = {}) {
  return new N2WordsTR(options).floatToCardinal(n);
}
