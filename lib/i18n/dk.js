import BaseLanguage from '../classes/base-language.js'

export class N2WordsDK extends BaseLanguage {
  ordFlag

  constructor (options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'komma',
      zero: 'nul',
      ordFlag: false
    }, options)

    super(options, [
      [1_000_000_000_000_000_000_000_000_000n, 'quadrillarder'],
      [1_000_000_000_000_000_000_000_000n, 'quadrillioner'],
      [1_000_000_000_000_000_000_000n, 'trillarder'],
      [1_000_000_000_000_000_000n, 'trillioner'],
      [1_000_000_000_000_000n, 'billarder'],
      [1_000_000_000_000n, 'billioner'],
      [1_000_000_000n, 'millarder'],
      [1_000_000n, 'millioner'],
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
    ])

    this.ordFlag = options.ordFlag
  }

  merge (current, next) {
    let cText = Object.keys(current)[0]
    let nText = Object.keys(next)[0]
    const cNumber = BigInt(Object.values(current)[0])
    const nNumber = BigInt(Object.values(next)[0])
    let value
    if (nNumber === 100n || nNumber === 1000n) {
      next = { [`et${nText}`]: nNumber }
    }
    if (cNumber === 1n) {
      if (nNumber < 1_000_000n || this.ordFlag) {
        return next
      }
      cText = 'en'
    }
    if (nNumber > cNumber) {
      if (nNumber >= 1_000_000) {
        cText += ' '
      }
      value = cNumber * nNumber
    } else {
      if (cNumber >= 100 && cNumber < 1000) {
        cText += ' og '
      } else if (cNumber >= 1000 && cNumber <= 100_000) {
        cText += 'e og '
      }
      if ((nNumber < 10n) && (cNumber > 10n) && (cNumber < 100n)) {
        if (nNumber === 1n) {
          nText = 'en'
        }
        const temporary = nText
        nText = cText
        cText = temporary + 'og'
      } else if (cNumber >= 1_000_000) {
        cText += ' '
      }
      value = cNumber + nNumber
    }
    const word = cText + nText
    return { [`${word}`]: value }
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
  return new N2WordsDK(options).floatToCardinal(value)
}
