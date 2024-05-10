import BaseLanguage from '../classes/base-language.js';

export class N2WordsKO extends BaseLanguage {
  constructor(options) {
    options = Object.assign({
      negativeWord: '마이너스',
      separatorWord: '점',
      zero: '영'
    }, options);

    super(options, [
      [10_000_000_000_000_000_000_000_000_000n, '양'],
      [1_000_000_000_000_000_000_000_000n, '자'],
      [100_000_000_000_000_000_000n, '해'],
      [10_000_000_000_000_000n, '경'],
      [1_000_000_000_000n, '조'],
      [100_000_000n, '억'],
      [10_000n, '만'],
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
    const lNumber = BigInt(Object.values(lPair)[0]);
    const rNumber = BigInt(Object.values(rPair)[0]);
    if (lNumber == 1 && rNumber <= 10_000) return { [rText]: rNumber };
    else if (10_000 > lNumber && lNumber > rNumber) return { [`${lText}${rText}`]: lNumber + rNumber };
    else if (lNumber >= 10_000 && lNumber > rNumber) return { [`${lText} ${rText}`]: lNumber + rNumber };
    else return { [`${lText}${rText}`]: lNumber * rNumber };
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new N2WordsKO(options).floatToCardinal(value);
}
