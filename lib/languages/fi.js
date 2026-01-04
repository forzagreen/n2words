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

  /**
   * Gets scale word for index.
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }
    // Index 2 → scaleWords[0] (miljoona), etc.
    return this.scaleWords[scaleIndex - 2] || ''
  }

  /**
   * Joins segments with Finnish spacing rules.
   *
   * Key patterns:
   * - Omit "yksi" before sata and tuhat
   * - Keep "yksi" before miljoona+
   * - Space separator between components
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // Skip "yksi" before sata or tuhat
      if (part === 'yksi' && (nextPart === this.hundredWord || nextPart === this.thousandWord)) {
        continue
      }

      result.push(part)

      if (nextPart) {
        result.push(' ')
      }
    }

    return result.join('')
  }
}
