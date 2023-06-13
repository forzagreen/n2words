import BaseLanguage from '../classes/BaseLanguage.js';

export class N2WordsDK extends BaseLanguage {
  ordFlag;

  constructor(options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'nul',
      ordFlag: false
    }, options);

    super(options, [
      [1000000000000000000000000000n, 'quadrillarder'],
      [1000000000000000000000000n, 'quadrillioner'],
      [1000000000000000000000n, 'trillarder'],
      [1000000000000000000n, 'trillioner'],
      [1000000000000000n, 'billarder'],
      [1000000000000n, 'billioner'],
      [1000000000n, 'millarder'],
      [1000000n, 'millioner'],
      [1000n, 'tusind'],
      [100n, 'hundrede'],
      [90n, 'halvfems'],
      [80n, 'firs'],
      [70n, 'halvfjerds'],
      [60n, 'treds'],
      [50n, 'halvtreds'],
      [40n, 'fyrre'],
      [30n, 'tredive'],
      [20n, 'tyve'],
      [19n, 'nitten'],
      [18n, 'atten'],
      [17n, 'sytten'],
      [16n, 'seksten'],
      [15n, 'femten'],
      [14n, 'fjorten'],
      [13n, 'tretten'],
      [12n, 'tolv'],
      [11n, 'elleve'],
      [10n, 'ti'],
      [9n, 'ni'],
      [8n, 'otte'],
      [7n, 'syv'],
      [6n, 'seks'],
      [5n, 'fem'],
      [4n, 'fire'],
      [3n, 'tre'],
      [2n, 'to'],
      [1n, 'et'],
      [0n, 'nul']
    ]);

    this.ordFlag = options.ordFlag;
  }

  merge(curr, next) {
    let cText = Object.keys(curr)[0];
    let nText = Object.keys(next)[0];
    const cNum = BigInt(Object.values(curr)[0]);
    const nNum = BigInt(Object.values(next)[0]);
    let val;
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

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @param {object} [options] Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function (value, options = {}) {
  return new N2WordsDK(options).floatToCardinal(value);
}
