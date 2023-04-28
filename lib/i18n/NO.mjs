import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsNO extends BaseLanguage {
  constructor() {
    super({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'null'
    },[
      [1000000000000000000000000000000000, 'quintillard'],
      [1000000000000000000000000000000, 'quintillion'],
      [1000000000000000000000000000, 'quadrillard'],
      [1000000000000000000000000, 'quadrillion'],
      [1000000000000000000000, 'trillard'],
      [1000000000000000000, 'trillion'],
      [1000000000000000, 'billard'],
      [1000000000000, 'billion'],
      [1000000000, 'millard'],
      [1000000, 'million'],
      [1000, 'tusen'],
      [100, 'hundre'],
      [90, 'nitti'],
      [80, 'åtti'],
      [70, 'sytti'],
      [60, 'seksti'],
      [50, 'femti'],
      [40, 'førti'],
      [30, 'tretti'],
      [20, 'tjue'],
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
      [8, 'åtte'],
      [7, 'syv'],
      [6, 'seks'],
      [5, 'fem'],
      [4, 'fire'],
      [3, 'tre'],
      [2, 'to'],
      [1, 'en'],
      [0, 'null']
    ]);
  }

  merge(lPair, rPair) { // {'one':1}, {'hundred':100}
    const lText = Object.keys(lPair)[0];
    const rText = Object.keys(rPair)[0];
    const lNum = parseInt(Object.values(lPair)[0]);
    const rNum = parseInt(Object.values(rPair)[0]);
    if (lNum == 1 && rNum < 100) return { [rText]: rNum };
    else if (lNum < 100 && lNum > rNum) return { [`${lText}-${rText}`]: lNum + rNum };
    else if (lNum >= 100 && rNum < 100) return { [`${lText} og ${rText}`]: lNum + rNum };
    else if (rNum > lNum) return { [`${lText} ${rText}`]: lNum * rNum };
    return { [`${lText}, ${rText}`]: lNum + rNum };
  }
}

export default function(n) {
  return new N2WordsNO().floatToCardinal(n);
}
