import N2WordsBase from '../classes/N2WordsBase.mjs';

export default function () {
  N2WordsBase.call(this);

  this.negative_word = '마이너스';
  this.separator_word = '점';
  this.ZERO = '영';
  this.cards = [
    { '10000000000000000000000000000': '양' },
    { '1000000000000000000000000': '자' },
    { '100000000000000000000': '해' },
    { '10000000000000000': '경' },
    { '1000000000000': '조' },
    { '100000000': '억' },
    { '10000': '만' },
    { '1000': '천' },
    { '100': '백' },
    { '10': '십' },
    { '9': '구' },
    { '8': '팔' },
    { '7': '칠' },
    { '6': '육' },
    { '5': '오' },
    { '4': '사' },
    { '3': '삼' },
    { '2': '이' },
    { '1': '일' },
    { '0': '영' }
  ];
  this.merge = (lpair, rpair) => {
    const ltext = Object.keys(lpair)[0]; const lnum = parseInt(Object.values(lpair)[0]);
    const rtext = Object.keys(rpair)[0]; const rnum = parseInt(Object.values(rpair)[0]);
    if (lnum == 1 && rnum <= 10000) return { [rtext]: rnum };
    else if (10000 > lnum && lnum > rnum) return { [`${ltext}${rtext}`]: lnum + rnum };
    else if (lnum >= 10000 && lnum > rnum) return { [`${ltext} ${rtext}`]: lnum + rnum };
    else return { [`${ltext}${rtext}`]: lnum * rnum };
  };
}
