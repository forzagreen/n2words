import BaseLanguage from '../classes/BaseLanguage.mjs';

export class N2WordsKO extends BaseLanguage {
  constructor(options) {
    super(Object.assign({
      negativeWord: '마이너스',
      separatorWord: '점',
      zero: '영'
    }, options), [
      [10000000000000000000000000000n, '양'],
      [1000000000000000000000000n, '자'],
      [100000000000000000000n, '해'],
      [10000000000000000n, '경'],
      [1000000000000n, '조'],
      [100000000n, '억'],
      [10000n, '만'],
      [1000n, '천'],
      [100n, '백'],
      [10n, '십'],
      [9n, '구'],
      [8n, '팔'],
      [7n, '칠'],
      [6n, '육'],
      [5n, '오'],
      [4n, '사'],
      [3n, '삼'],
      [2n, '이'],
      [1n, '일'],
      [0n, '영']
    ]);
  }

  merge(lPair, rPair) {
    const lText = Object.keys(lPair)[0];
    const rText = Object.keys(rPair)[0];
    const lNum = parseInt(Object.values(lPair)[0]);
    const rNum = parseInt(Object.values(rPair)[0]);
    if (lNum == 1 && rNum <= 10000) return { [rText]: rNum };
    else if (10000 > lNum && lNum > rNum) return { [`${lText}${rText}`]: lNum + rNum };
    else if (lNum >= 10000 && lNum > rNum) return { [`${lText} ${rText}`]: lNum + rNum };
    else return { [`${lText}${rText}`]: lNum * rNum };
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new N2WordsKO().floatToCardinal(value);
}
