import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Malay (Bahasa Melayu) language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - "Se-" prefix for all singular units (seratus, seribu, sejuta, sebilion)
 * - Regular patterns (puluh for tens, ratus for hundreds)
 * - Teens with "belas" suffix: sebelas (11), dua belas (12)
 */
export class Malay extends ScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'perpuluhan'
  zeroWord = 'sifar'

  onesWords = {
    1: 'satu',
    2: 'dua',
    3: 'tiga',
    4: 'empat',
    5: 'lima',
    6: 'enam',
    7: 'tujuh',
    8: 'lapan',
    9: 'sembilan'
  }

  // Teens: 10 = sepuluh, 11 = sebelas, 12-19 = X belas
  teensWords = {
    0: 'sepuluh',
    1: 'sebelas',
    2: 'dua belas',
    3: 'tiga belas',
    4: 'empat belas',
    5: 'lima belas',
    6: 'enam belas',
    7: 'tujuh belas',
    8: 'lapan belas',
    9: 'sembilan belas'
  }

  // Tens: X puluh
  tensWords = {
    2: 'dua puluh',
    3: 'tiga puluh',
    4: 'empat puluh',
    5: 'lima puluh',
    6: 'enam puluh',
    7: 'tujuh puluh',
    8: 'lapan puluh',
    9: 'sembilan puluh'
  }

  // 100 = seratus (handled in segmentToWords)
  hundredWord = 'ratus'

  // 1000 = seribu (handled in joinSegments)
  thousandWord = 'ribu'

  // Scale words for 10^6 and above
  scaleWords = ['juta', 'bilion', 'trilion']

  /**
   * Converts a 3-digit segment with Malay patterns.
   *
   * Handles the "se-" prefix for 100 (seratus) and special teens.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds: seratus (100) or N ratus (200-900)
    if (hundreds > 0n) {
      if (hundreds === 1n) {
        parts.push('seratus')
      } else {
        parts.push(this.onesWords[hundreds], this.hundredWord)
      }
    }

    // Tens and ones
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds, nothing more
    } else if (tensOnes < 10n) {
      // Single digit (1-9)
      parts.push(this.onesWords[ones])
    } else if (tensOnes < 20n) {
      // Teens (10-19)
      parts.push(this.teensWords[ones])
    } else if (ones === 0n) {
      // Even tens (20, 30, etc.)
      parts.push(this.tensWords[tens])
    } else {
      // Compound: X puluh Y
      parts.push(this.tensWords[tens], this.onesWords[ones])
    }

    return parts.join(' ')
  }

  /**
   * Joins segments with Malay rules.
   *
   * Malay uses "se-" prefix for ALL singular scale units:
   * seribu (1000), sejuta (1M), sebilion (1B), setrilion (1T)
   */
  joinSegments (parts, integerPart) {
    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // "satu" + scale word → "se" + scale word
      if (part === 'satu') {
        if (nextPart === this.thousandWord) {
          result.push('seribu')
          i++ // Skip the "ribu"
          continue
        }
        if (this.scaleWords.includes(nextPart)) {
          result.push('se' + nextPart)
          i++ // Skip the scale word
          continue
        }
      }

      result.push(part)
    }

    return result.join(' ')
  }
}
