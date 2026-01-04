import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Amharic language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Native Ge'ez script (ግዕዝ) output for Amharic numbers.
 *
 * Supports:
 * - Ge'ez/Ethiopic script numerals (አንድ, ሁለት, ሶስት)
 * - Space-separated word composition
 * - Teens formed with "አስራ" prefix
 * - Standard short scale (million, billion)
 *
 * For Latin/romanized output, use AmharicLatin (am-Latn).
 */
export class Amharic extends ScaleLanguage {
  negativeWord = 'አሉታዊ'
  zeroWord = 'ዜሮ'
  decimalSeparatorWord = 'ነጥብ'
  usePerDigitDecimals = true

  onesWords = {
    1: 'አንድ',
    2: 'ሁለት',
    3: 'ሶስት',
    4: 'አራት',
    5: 'አምስት',
    6: 'ስድስት',
    7: 'ሰባት',
    8: 'ስምንት',
    9: 'ዘጠኝ'
  }

  // Teens are formed with "አስራ" + ones (the fixture has them pre-computed)
  teensWords = {
    0: 'አስር',
    1: 'አስራ አንድ',
    2: 'አስራ ሁለት',
    3: 'አስራ ሶስት',
    4: 'አስራ አራት',
    5: 'አስራ አምስት',
    6: 'አስራ ስድስት',
    7: 'አስራ ሰባት',
    8: 'አስራ ስምንት',
    9: 'አስራ ዘጠኝ'
  }

  tensWords = {
    2: 'ሃያ',
    3: 'ሰላሳ',
    4: 'አርባ',
    5: 'ሃምሳ',
    6: 'ስልሳ',
    7: 'ሰባ',
    8: 'ሰማንያ',
    9: 'ዘጠና'
  }

  hundredWord = 'መቶ'
  thousandWord = 'ሺ'

  // Short scale
  scaleWords = ['ሚሊዮን', 'ቢሊዮን']

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
   * Amharic keeps "one" before hundred: "አንድ መቶ" (100)
   */
  hundredsToWords (hundreds, scaleIndex) {
    return `${this.onesWords[hundreds]} ${this.hundredWord}`
  }
}
