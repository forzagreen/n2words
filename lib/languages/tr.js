import { TurkicLanguage } from '../classes/turkic-language.js'

/**
 * Turkish language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Omits 'bir' (one) before hundreds and thousands
 * - Optional space removal via dropSpaces option
 */
export class Turkish extends TurkicLanguage {
  negativeWord = 'eksi'
  decimalSeparatorWord = 'virgül'
  zeroWord = 'sıfır'
  wordSeparator = ' '

  onesWords = {
    1: 'bir',
    2: 'iki',
    3: 'üç',
    4: 'dört',
    5: 'beş',
    6: 'altı',
    7: 'yedi',
    8: 'sekiz',
    9: 'dokuz'
  }

  teensWords = {
    0: 'on',
    1: 'on bir',
    2: 'on iki',
    3: 'on üç',
    4: 'on dört',
    5: 'on beş',
    6: 'on altı',
    7: 'on yedi',
    8: 'on sekiz',
    9: 'on dokuz'
  }

  tensWords = {
    2: 'yirmi',
    3: 'otuz',
    4: 'kırk',
    5: 'elli',
    6: 'altmış',
    7: 'yetmiş',
    8: 'seksen',
    9: 'doksan'
  }

  hundredWord = 'yüz'
  thousandWord = 'bin'

  // Short scale
  scaleWords = ['milyon', 'milyar', 'trilyon', 'katrilyon', 'kentilyon']

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
