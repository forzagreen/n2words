import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Amharic Latin language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Latin/ASCII romanization of Amharic numerals.
 *
 * Supports:
 * - Romanized numerals (and, hulet, sost)
 * - Space-separated word composition
 * - Teens formed with "asra" prefix
 * - Standard short scale (million, billion)
 *
 * For native Ge'ez script, use Amharic (am).
 */
export class AmharicLatin extends ScaleLanguage {
  negativeWord = 'asitegna'
  zeroWord = 'zero'
  decimalSeparatorWord = 'netib'
  usePerDigitDecimals = true

  onesWords = {
    1: 'and',
    2: 'hulet',
    3: 'sost',
    4: 'arat',
    5: 'amist',
    6: 'siddist',
    7: 'sebat',
    8: 'siment',
    9: 'zeteny'
  }

  // Teens are formed with "asra" + ones
  teensWords = {
    0: 'asir',
    1: 'asra and',
    2: 'asra hulet',
    3: 'asra sost',
    4: 'asra arat',
    5: 'asra amist',
    6: 'asra siddist',
    7: 'asra sebat',
    8: 'asra siment',
    9: 'asra zeteny'
  }

  tensWords = {
    2: 'haya',
    3: 'selasa',
    4: 'arba',
    5: 'hamsa',
    6: 'silsa',
    7: 'seba',
    8: 'semanya',
    9: 'zetena'
  }

  hundredWord = 'meto'
  thousandWord = 'shi'

  // Short scale
  scaleWords = ['miliyon', 'billiyon']

  /**
   * Gets scale word for index.
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }
    return this.scaleWords[scaleIndex - 2] || ''
  }

  /**
   * Converts hundreds with Amharic pattern.
   * Amharic keeps "one" before hundred: "and meto" (100)
   */
  hundredsToWords (hundreds, scaleIndex) {
    return `${this.onesWords[hundreds]} ${this.hundredWord}`
  }
}
