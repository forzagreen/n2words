import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Indonesian language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - "Se-" prefix for one (seratus, seribu) via custom segmentToWords
 * - Regular patterns (puluh for tens, ratus for hundreds)
 * - Teens with "belas" suffix: sebelas (11), dua belas (12)
 */
export class Indonesian extends ScaleLanguage {
  negativeWord = 'min'
  decimalSeparatorWord = 'koma'
  zeroWord = 'nol'

  onesWords = {
    1: 'satu',
    2: 'dua',
    3: 'tiga',
    4: 'empat',
    5: 'lima',
    6: 'enam',
    7: 'tujuh',
    8: 'delapan',
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
    8: 'delapan belas',
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
    8: 'delapan puluh',
    9: 'sembilan puluh'
  }

  // 100 = seratus (handled in segmentToWords)
  hundredWord = 'ratus'

  // 1000 = seribu (handled in joinSegments)
  thousandWord = 'ribu'

  // Scale words for 10^6 and above
  scaleWords = ['juta', 'miliar', 'triliun', 'kuadriliun', 'kuantiliun', 'sekstiliun', 'septiliun', 'oktiliun', 'noniliun', 'desiliun']

  /**
   * Converts a 3-digit segment with Indonesian patterns.
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
   * Joins segments with Indonesian rules.
   *
   * Handles "se-" prefix: seribu (1000), but "satu juta" for 1,000,000.
   */
  joinSegments (parts, integerPart) {
    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // "satu ribu" → "seribu"
      if (part === 'satu' && nextPart === this.thousandWord) {
        result.push('seribu')
        i++ // Skip the "ribu"
        continue
      }

      result.push(part)
    }

    return result.join(' ')
  }
}
