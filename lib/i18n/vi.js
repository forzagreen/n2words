import AbstractLanguage from '../classes/abstract-language.js'

/**
 * Vietnamese language converter.
 *
 * Converts numbers to Vietnamese words following Vietnamese number naming:
 * - Base-10 grouping system (trăm = hundred, nghìn = thousand, triệu = million, tỷ = billion)
 * - Special pronunciation rules for 5 and 15 (lăm instead of năm)
 * - Special pronunciation for final 1 in compound numbers (mốt instead of một)
 * - "Lẻ" (odd/extra) used when tens place is zero but units exist
 *
 * Key Features:
 * - Base number mapping for 0-19 (with special forms)
 * - Tens mapping (hai mươi, ba mươi, etc.)
 * - Group-based algorithm:
 *   1. Split number into groups of 3 digits
 *   2. For each group, build words using special pronunciation rules:
 *      - "Mốt" instead of "một" for final 1 (e.g., 21 → hai mươi mốt)
 *      - "Lăm" instead of "năm" for 15 and mid-group 5 (e.g., 15, 105)
 *      - "Lẻ" prefix when tens=0 but units>0 (e.g., 101 → một trăm lẻ một)
 *   3. Append magnitude word (nghìn/triệu/tỷ)
 *   4. Join all groups with spaces
 * - Support for large numbers up to vigintillions
 *
 * Features:
 * - Natural Vietnamese number flow
 * - Proper handling of special cases (mốt, lăm)
 * - Contextual pronunciation adjustments
 */
export class Vietnamese extends AbstractLanguage {
  negativeWord = 'âm'
  decimalSeparatorWord = 'phẩy'
  zeroWord = 'không'
  base = {
    0: 'không',
    1: 'một',
    2: 'hai',
    3: 'ba',
    4: 'bốn',
    5: 'năm',
    6: 'sáu',
    7: 'bảy',
    8: 'tám',
    9: 'chín',
    10: 'mười',
    11: 'mười một',
    12: 'mười hai',
    13: 'mười ba',
    14: 'mười bốn',
    15: 'mười lăm',
    16: 'mười sáu',
    17: 'mười bảy',
    18: 'mười tám',
    19: 'mười chín'
  }

  tens = {
    20: 'hai mươi',
    30: 'ba mươi',
    40: 'bốn mươi',
    50: 'năm mươi',
    60: 'sáu mươi',
    70: 'bảy mươi',
    80: 'tám mươi',
    90: 'chín mươi'
  }

  thousands = {
    1: 'nghìn', // 10^1
    2: 'triệu', // 10^2
    3: 'tỷ', // 10^3
    4: 'nghìn tỷ',
    5: 'trăm nghìn tỷ',
    6: 'Quintillion',
    7: 'Sextillion',
    8: 'Septillion',
    9: 'Octillion',
    10: 'Nonillion',
    11: 'Decillion',
    12: 'Undecillion',
    13: 'Duodecillion',
    14: 'Tredecillion',
    15: 'Quattuordecillion',
    16: 'Sexdecillion',
    17: 'Septendecillion',
    18: 'Octodecillion',
    19: 'Novemdecillion',
    20: 'Vigintillion'
  }

  /**
   * Convert numbers less than 100 to Vietnamese words.
   *
   * @param {number} number The number to convert (0-99).
   * @returns {string} The Vietnamese representation.
   */
  convertLess100 (number) {
    const unitsPart = number % 10
    const tensPart = number - unitsPart
    const tensPartText = this.tens[tensPart]
    if (unitsPart === 0) {
      return tensPartText
    }
    const unitsPartText = this.base[unitsPart]
    let suffix = unitsPartText
    if (unitsPart === 1) {
      suffix = 'mốt'
    }
    if (unitsPart === 5) {
      suffix = 'lăm'
    }
    return tensPartText + ' ' + suffix
  }

  /**
   * Convert numbers less than 1000 to Vietnamese words.
   *
   * @param {number} number The number to convert (0-999).
   * @returns {string} The Vietnamese representation.
   */
  convertLess1000 (number) {
    const words = []
    const tensUnitsPart = number % 100
    const hundredsPart = number - tensUnitsPart
    if (hundredsPart > 0) {
      words.push(this.base[hundredsPart / 100], 'trăm')
    }
    if (tensUnitsPart > 0 && tensUnitsPart < 10) {
      if (words.length > 0) {
        words.push('lẻ')
      }
      if (tensUnitsPart === 5) {
        words.push('năm')
      } else {
        words.push(this.base[tensUnitsPart])
      }
    }
    if (tensUnitsPart >= 10) {
      words.push(this.convertWholePart(tensUnitsPart))
    }
    return words.join(' ')
  }

  /**
   * Convert numbers greater than 1000 to Vietnamese words.
   *
   * @param {bigint} number The number to convert (>= 1000).
   * @returns {string} The Vietnamese representation.
   */
  convertMore1000 (number) {
    const words = []
    let division = number / 1000n
    let power = 1
    while (division >= 1000n) {
      division = division / 1000n
      power = power + 1
    }
    const r = number - (division * BigInt(Math.pow(1000, power)))
    words.push(this.convertWholePart(division), this.thousands[power])
    if (r > 0n) {
      if (r <= 99n) {
        words.push('lẻ')
      }
      words.push(this.convertWholePart(r))
    }
    return words.join(' ')
  }

  convertWholePart (number) {
    if (number < 20n) {
      return this.base[Number(number)]
    } else {
      if (number < 100n) {
        return this.convertLess100(Number(number))
      } else {
        return (number < 1000n ? this.convertLess1000(Number(number)) : this.convertMore1000(number))
      }
    }
  }
}

/**
 * Converts a number to Vietnamese cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options={}] Configuration options.
 * @returns {string} The number expressed in Vietnamese words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 */
export default function convertToWords (value, options = {}) {
  return new Vietnamese(options).convertToWords(value)
}
