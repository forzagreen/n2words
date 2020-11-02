import Num2Word_Base from '../classes/Num2Word.mjs';

export default function() {
  Num2Word_Base.call(this);

  this.cards = [{'1000000000000000000000000000000000': 'quintillard'}, {'1000000000000000000000000000000': 'quintillion'}, {'1000000000000000000000000000': 'quadrillard'}, {'1000000000000000000000000': 'quadrillion'}, {'1000000000000000000000': 'trillard'}, {1000000000000000000: 'trillion'}, {1000000000000000: 'billard'}, {1000000000000: 'billion'}, {1000000000: 'millard'}, {1000000: 'million'}, {1000: 'tusen'}, {100: 'hundre'}, {90: 'nitti'}, {80: 'åtti'}, {70: 'sytti'}, {60: 'seksti'}, {50: 'femti'}, {40: 'førti'}, {30: 'tretti'}, {20: 'tjue'}, {19: 'nitten'}, {18: 'atten'}, {17: 'sytten'}, {16: 'seksten'}, {15: 'femten'}, {14: 'fjorten'}, {13: 'tretten'}, {12: 'tolv'}, {11: 'elleve'}, {10: 'ti'}, {9: 'ni'}, {8: 'åtte'}, {7: 'syv'}, {6: 'seks'}, {5: 'fem'}, {4: 'fire'}, {3: 'tre'}, {2: 'to'}, {1: 'en'}, {0: 'null'}];
  this.merge = (lpair, rpair) => { // {'one':1}, {'hundred':100}
    const ltext = Object.keys(lpair)[0]; const lnum = parseInt(Object.values(lpair)[0]);
    const rtext = Object.keys(rpair)[0]; const rnum = parseInt(Object.values(rpair)[0]);
    if (lnum == 1 && rnum < 100) return {[rtext]: rnum};
    else if (lnum < 100 && lnum > rnum) return {[`${ltext}-${rtext}`]: lnum + rnum};
    else if (lnum >= 100 && rnum < 100) return {[`${ltext} og ${rtext}`]: lnum + rnum};
    else if (rnum > lnum) return {[`${ltext} ${rtext}`]: lnum * rnum};
    return {[`${ltext}, ${rtext}`]: lnum + rnum};
  };
}
