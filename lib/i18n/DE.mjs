import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsDE extends BaseLanguage {
  constructor() {
    super({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'null'
    });

    this.cards = [
      [1000000000000000000000000000, 'Quadrilliarde'],
      [1000000000000000000000000, 'Quadrillion'],
      [1000000000000000000000, 'Trilliarde'],
      [1000000000000000000, 'Trillion'],
      [1000000000000000, 'Billiarde'],
      [1000000000000, 'Billion'],
      [1000000000, 'Milliarde'],
      [1000000, 'Million'],
      [1000, 'tausend'],
      [100, 'hundert'],
      [90, 'neunzig'],
      [80, 'achtzig'],
      [70, 'siebzig'],
      [60, 'sechzig'],
      [50, 'fünfzig'],
      [40, 'vierzig'],
      [30, 'dreißig'],
      [20, 'zwanzig'],
      [19, 'neunzehn'],
      [18, 'achtzehn'],
      [17, 'siebzehn'],
      [16, 'sechzehn'],
      [15, 'fünfzehn'],
      [14, 'vierzehn'],
      [13, 'dreizehn'],
      [12, 'zwölf'],
      [11, 'elf'],
      [10, 'zehn'],
      [9, 'neun'],
      [8, 'acht'],
      [7, 'sieben'],
      [6, 'sechs'],
      [5, 'fünf'],
      [4, 'vier'],
      [3, 'drei'],
      [2, 'zwei'],
      [1, 'eins'],
      [0, 'null']
    ];
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

export default function(n) {
  return new N2WordsDE().floatToCardinal(n);
}
