import { AbstractLanguage } from '../classes/abstract-language.js'

/**
 * Vietnamese language converter.
 *
 * Supports:
 * - Special pronunciation rules (lăm for 5, mốt for final 1)
 * - "Lẻ" (odd/extra) when tens place is zero
 * - Vietnamese diacritical marks
 */
export class Vietnamese extends AbstractLanguage {
  negativeWord = 'âm'
  decimalSeparatorWord = 'phẩy'
  zeroWord = 'không'

  belowTwentyWords = {
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

  twentiesWords = {
    20: 'hai mươi',
    30: 'ba mươi',
    40: 'bốn mươi',
    50: 'năm mươi',
    60: 'sáu mươi',
    70: 'bảy mươi',
    80: 'tám mươi',
    90: 'chín mươi'
  }

  scaleWords = {
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

  /** Convert numbers less than 100 to Vietnamese words. */
  convertLess100 (number) {
    const unitsPart = number % 10
    const tensPart = number - unitsPart
    const tensPartText = this.twentiesWords[tensPart]
    if (unitsPart === 0) {
      return tensPartText
    }
    const unitsPartText = this.belowTwentyWords[unitsPart]
    let suffix = unitsPartText
    if (unitsPart === 1) {
      suffix = 'mốt'
    }
    if (unitsPart === 5) {
      suffix = 'lăm'
    }
    return tensPartText + ' ' + suffix
  }

  /** Convert numbers less than 1000 to Vietnamese words. */
  convertLess1000 (number) {
    const words = []
    const tensUnitsPart = number % 100
    const hundredsPart = number - tensUnitsPart
    if (hundredsPart > 0) {
      words.push(this.belowTwentyWords[hundredsPart / 100], 'trăm')
    }
    if (tensUnitsPart > 0 && tensUnitsPart < 10) {
      if (words.length > 0) {
        words.push('lẻ')
      }
      if (tensUnitsPart === 5) {
        words.push('năm')
      } else {
        words.push(this.belowTwentyWords[tensUnitsPart])
      }
    }
    if (tensUnitsPart >= 10) {
      words.push(this.integerToWords(tensUnitsPart))
    }
    return words.join(' ')
  }

  /** Convert numbers greater than 1000 to Vietnamese words. */
  convertMore1000 (number) {
    const words = []
    let division = number / 1000n
    let power = 1
    while (division >= 1000n) {
      division = division / 1000n
      power = power + 1
    }
    const r = number - (division * BigInt(Math.pow(1000, power)))
    words.push(this.integerToWords(division), this.scaleWords[power])
    if (r > 0n) {
      if (r <= 99n) {
        words.push('lẻ')
      }
      words.push(this.integerToWords(r))
    }
    return words.join(' ')
  }

  integerToWords (integerPart) {
    if (integerPart < 20n) {
      return this.belowTwentyWords[Number(integerPart)]
    } else {
      if (integerPart < 100n) {
        return this.convertLess100(Number(integerPart))
      } else {
        return (integerPart < 1000n ? this.convertLess1000(Number(integerPart)) : this.convertMore1000(integerPart))
      }
    }
  }
}
