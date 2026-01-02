import { AbstractLanguage } from '../classes/abstract-language.js'

/**
 * Persian language converter.
 *
 * Supports:
 * - "و" (and) conjunction for compound numbers
 * - Recursive conversion for larger numbers
 */
export class Persian extends AbstractLanguage {
  negativeWord = 'منفى'
  decimalSeparatorWord = 'ممیّز'
  zeroWord = 'صفر'

  /**
   * Words for digits 1-9.
   * @type {Object.<number, string>}
   */
  onesWords = {
    1: 'یک',
    2: 'دو',
    3: 'سه',
    4: 'چهار',
    5: 'پنج',
    6: 'شش',
    7: 'هفت',
    8: 'هشت',
    9: 'نه'
  }

  /**
   * Words for teen numbers (10-19).
   * @type {Object.<number, string>}
   */
  teensWords = {
    10: 'ده',
    11: 'یازده',
    12: 'دوازده',
    13: 'سیزده',
    14: 'چهارده',
    15: 'پانزده',
    16: 'شانزده',
    17: 'هفده',
    18: 'هجده',
    19: 'نوزده'
  }

  /**
   * Words for multiples of ten (20-90).
   * @type {Object.<number, string>}
   */
  tensWords = {
    20: 'بیست',
    30: 'سی',
    40: 'چهل',
    50: 'پنجاه',
    60: 'شصت',
    70: 'هفتاد',
    80: 'هشتاد',
    90: 'نود'
  }

  /**
   * Words for hundreds (100-900).
   * @type {Object.<number, string>}
   */
  hundredsWords = {
    100: 'صد',
    200: 'دویست',
    300: 'سيصد',
    400: 'چهار صد',
    500: 'پانصد',
    600: 'ششصد',
    700: 'هفتصد',
    800: 'هشتصد',
    900: 'نهصد'
  }

  /**
   * Scale magnitude words.
   * @type {Object.<number, string>}
   */
  scaleWords = {
    1000: 'هزار',
    1_000_000: 'میلیون'
  }

  /** Converts integer part using categorized word tables. */
  integerToWords (integerPart) {
    // Zero
    if (integerPart === 0n) {
      return this.zeroWord
    }

    // 1-9
    if (integerPart <= 9n) {
      return this.onesWords[integerPart]
    }

    // 10-19
    if (integerPart <= 19n) {
      return this.teensWords[integerPart]
    }

    // 20-99
    if (integerPart < 100n) {
      const ones = integerPart % 10n
      const tens = integerPart - ones
      if (ones === 0n) {
        return this.tensWords[tens]
      }
      return `${this.tensWords[tens]} و ${this.onesWords[ones]}`
    }

    // 100-999
    if (integerPart < 1000n) {
      const hundreds = 100n * (integerPart / 100n)
      const remainder = integerPart - hundreds
      if (remainder === 0n) {
        return this.hundredsWords[hundreds]
      }
      return `${this.hundredsWords[hundreds]} و ${this.integerToWords(remainder)}`
    }

    // 1000-999999
    if (integerPart < 1_000_000n) {
      const thousandMultiplier = integerPart / 1000n
      // Persian omits "one" before thousand: 1000 is just "هزار", not "یک هزار"
      const thousandPrefix = thousandMultiplier === 1n
        ? ''
        : this.integerToWords(thousandMultiplier) + ' '
      const remainder = integerPart % 1000n
      const suffix = remainder === 0n ? '' : ' ' + this.integerToWords(remainder)
      return `${thousandPrefix}${this.scaleWords[1000]}${suffix}`
    }

    // 1000000+
    const millionMultiplier = integerPart / 1_000_000n
    const millionPrefix = this.integerToWords(millionMultiplier) + ' ' + this.scaleWords[1_000_000]
    const remainder = integerPart % 1_000_000n
    const suffix = remainder === 0n ? '' : ' و ' + this.integerToWords(remainder)
    return `${millionPrefix}${suffix}`
  }
}
