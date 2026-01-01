import { TurkicLanguage } from '../classes/turkic-language.js'

/**
 * Turkish language converter.
 *
 * Supports:
 * - Omits 'bir' (one) before hundreds and thousands
 * - Optional space removal via dropSpaces option
 */
export class Turkish extends TurkicLanguage {
  negativeWord = 'eksi'
  decimalSeparatorWord = 'virgül'
  zeroWord = 'sıfır'
  wordSeparator = ' '

  scaleWordPairs = [
    [1_000_000_000_000_000_000n, 'kentilyon'],
    [1_000_000_000_000_000n, 'katrilyon'],
    [1_000_000_000_000n, 'trilyon'],
    [1_000_000_000n, 'milyar'],
    [1_000_000n, 'milyon'],
    [1000n, 'bin'],
    [100n, 'yüz'],
    [90n, 'doksan'],
    [80n, 'seksen'],
    [70n, 'yetmiş'],
    [60n, 'altmış'],
    [50n, 'elli'],
    [40n, 'kırk'],
    [30n, 'otuz'],
    [20n, 'yirmi'],
    [10n, 'on'],
    [9n, 'dokuz'],
    [8n, 'sekiz'],
    [7n, 'yedi'],
    [6n, 'altı'],
    [5n, 'beş'],
    [4n, 'dört'],
    [3n, 'üç'],
    [2n, 'iki'],
    [1n, 'bir'],
    [0n, 'sıfır']
  ]

  constructor (options = {}) {
    super()

    this.setOptions({
      dropSpaces: false
    }, options)

    if (this.options.dropSpaces) {
      this.wordSeparator = ''
    }
  }
}
