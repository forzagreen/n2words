import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Finnish language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Compound tens+ones without spaces: "kaksikymmentäyksi" (21)
 * - Teens with "-toista" suffix: "yksitoista" (11)
 * - Omit "yksi" before sata/tuhat but keep before miljoona+
 * - Long scale: miljoona, miljardi, biljoona, triljoona
 */
export class Finnish extends ScaleLanguage {
  negativeWord = 'miinus'
  decimalSeparatorWord = 'pilkku'
  zeroWord = 'nolla'
  usePerDigitDecimals = true

  onesWords = {
    1: 'yksi',
    2: 'kaksi',
    3: 'kolme',
    4: 'neljä',
    5: 'viisi',
    6: 'kuusi',
    7: 'seitsemän',
    8: 'kahdeksan',
    9: 'yhdeksän'
  }

  teensWords = {
    0: 'kymmenen',
    1: 'yksitoista',
    2: 'kaksitoista',
    3: 'kolmetoista',
    4: 'neljätoista',
    5: 'viisitoista',
    6: 'kuusitoista',
    7: 'seitsemäntoista',
    8: 'kahdeksantoista',
    9: 'yhdeksäntoista'
  }

  // Tens use "kymmentä" suffix, pre-computed for performance
  tensWords = {
    2: 'kaksikymmentä',
    3: 'kolmekymmentä',
    4: 'neljäkymmentä',
    5: 'viisikymmentä',
    6: 'kuusikymmentä',
    7: 'seitsemänkymmentä',
    8: 'kahdeksankymmentä',
    9: 'yhdeksänkymmentä'
  }

  hundredWord = 'sata'
  thousandWord = 'tuhat'

  // Long scale: miljoona (10^6), miljardi (10^9), biljoona (10^12)
  scaleWords = ['miljoona', 'miljardi', 'biljoona', 'triljoona']

  // Omit "yksi" before hundred and thousand
  omitOneBeforeHundred = true
  omitOneBeforeThousand = true

  /**
   * Converts a 3-digit segment with Finnish compound patterns.
   *
   * Finnish uses compound tens+ones: "kaksikymmentäyksi" (21)
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds: "sata", "kaksi sata" (space before sata for 2-9)
    if (hundreds > 0n) {
      if (hundreds === 1n) {
        parts.push(this.hundredWord)
      } else {
        parts.push(`${this.onesWords[hundreds]} ${this.hundredWord}`)
      }
    }

    // Tens and ones
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds
    } else if (tensOnes < 10n) {
      // Single digit
      parts.push(this.onesWords[ones])
    } else if (tensOnes < 20n) {
      // Teens (10-19)
      parts.push(this.teensWords[ones])
    } else if (ones === 0n) {
      // Even tens (20, 30, 40, etc.)
      parts.push(this.tensWords[tens])
    } else {
      // Compound tens+ones: "kaksikymmentäyksi" (no space)
      parts.push(`${this.tensWords[tens]}${this.onesWords[ones]}`)
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Combines segment parts with Finnish spacing.
   *
   * Space between hundreds and rest.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]
    return parts.join(' ')
  }
}
