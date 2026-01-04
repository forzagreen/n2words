import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Turkish language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Omits 'bir' (one) before hundreds and thousands
 * - Optional space removal via dropSpaces option
 */
export class Turkish extends ScaleLanguage {
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

  // Omit "bir" before hundred and thousand
  omitOneBeforeHundred = true
  omitOneBeforeThousand = true

  constructor (options = {}) {
    super()

    this.setOptions({
      dropSpaces: false
    }, options)

    if (this.options.dropSpaces) {
      this.wordSeparator = ''
    }
  }

  /**
   * Combines parts of a segment with wordSeparator.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    return parts.join(this.wordSeparator)
  }

  /**
   * Converts hundreds with wordSeparator.
   */
  hundredsToWords (hundreds, scaleIndex) {
    if (hundreds === 1n) {
      return this.hundredWord
    }
    return `${this.onesWords[hundreds]}${this.wordSeparator}${this.hundredWord}`
  }

  /**
   * Joins segments with wordSeparator, handling implicit "bir" omission.
   */
  joinSegments (parts, integerPart) {
    const oneWord = this.onesWords[1]
    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // Skip "bir" before hundred or thousand
      if (part === oneWord && nextPart &&
          (nextPart === this.hundredWord || nextPart === this.thousandWord)) {
        continue
      }

      result.push(part)

      if (nextPart) {
        result.push(this.wordSeparator)
      }
    }

    return result.join('')
  }
}
