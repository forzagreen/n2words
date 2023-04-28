import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsDK extends BaseLanguage {
  ordFlag;

  constructor() {
    super({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'nul',
    },[
      [1000000000000000000000000000, 'quadrillarder'],
      [1000000000000000000000000, 'quadrillioner'],
      [1000000000000000000000, 'trillarder'],
      [1000000000000000000, 'trillioner'],
      [1000000000000000, 'billarder'],
      [1000000000000, 'billioner'],
      [1000000000, 'millarder'],
      [1000000, 'millioner'],
      [1000, 'tusind'],
      [100, 'hundrede'],
      [90, 'halvfems'],
      [80, 'firs'],
      [70, 'halvfjerds'],
      [60, 'treds'],
      [50, 'halvtreds'],
      [40, 'fyrre'],
      [30, 'tredive'],
      [20, 'tyve'],
      [19, 'nitten'],
      [18, 'atten'],
      [17, 'sytten'],
      [16, 'seksten'],
      [15, 'femten'],
      [14, 'fjorten'],
      [13, 'tretten'],
      [12, 'tolv'],
      [11, 'elleve'],
      [10, 'ti'],
      [9, 'ni'],
      [8, 'otte'],
      [7, 'syv'],
      [6, 'seks'],
      [5, 'fem'],
      [4, 'fire'],
      [3, 'tre'],
      [2, 'to'],
      [1, 'et'],
      [0, 'nul']
    ]);

    this.ordFlag = false;
  }

  merge(curr, next) {
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = parseInt(Object.values(curr)[0]);
    const nNum = parseInt(Object.values(next)[0]);
    let val = 1;
    if (nNum == 100 || nNum == 1000) {
      next = { [`et${nText}`]: nNum };
    }
    if (cNum == 1) {
      if (nNum < 1000000 || this.ordFlag) {
        return next;
      }
      cText = 'en';
    }
    if (nNum > cNum) {
      if (nNum >= 1000000) {
        cText += ' ';
      }
      val = cNum * nNum;
    } else {
      if (cNum >= 100 && cNum < 1000) {
        cText += ' og ';
      } else if (cNum >= 1000 && cNum <= 100000) {
        cText += 'e og ';
      }
      if ((nNum < 10) && (10 < cNum) && (cNum < 100)) {
        if (nNum == 1) {
          nText = 'en';
        }
        const temp = nText;
        nText = cText;
        cText = temp + 'og';
      } else if (cNum >= 1000000) {
        cText += ' ';
      }
      val = cNum + nNum;
    }
    const word = cText + nText;
    return { [`${word}`]: val };
  }
}

export default function(n) {
  return new N2WordsDK().floatToCardinal(n);
}
