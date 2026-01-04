import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Hausa language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Authentic Boko orthography with ɗ (hooked d) and ' (glottal stop)
 * - Teens with "sha" prefix (sha ɗaya = 11)
 * - Compound numbers with "da" connector (ashirin da ɗaya = 21)
 * - Arabic loanwords for tens (ashirin, talatin, arba'in, etc.)
 * - Reversed multiplier order: "biyu ɗari" (200), "biyu dubu" (2000)
 * - Implicit one before ɗari and dubu
 */
export class Hausa extends ScaleLanguage {
  negativeWord = 'babu'
  decimalSeparatorWord = 'digo'
  zeroWord = 'sifiri'
  usePerDigitDecimals = true

  onesWords = {
    1: 'ɗaya',
    2: 'biyu',
    3: 'uku',
    4: 'huɗu',
    5: 'biyar',
    6: 'shida',
    7: 'bakwai',
    8: 'takwas',
    9: 'tara'
  }

  // Teens: "sha" + ones
  teensWords = {
    0: 'goma',
    1: 'sha ɗaya',
    2: 'sha biyu',
    3: 'sha uku',
    4: 'sha huɗu',
    5: 'sha biyar',
    6: 'sha shida',
    7: 'sha bakwai',
    8: 'sha takwas',
    9: 'sha tara'
  }

  // Arabic loanwords for tens
  tensWords = {
    2: 'ashirin',
    3: 'talatin',
    4: "arba'in",
    5: 'hamsin',
    6: 'sittin',
    7: "saba'in",
    8: 'tamanin',
    9: "tis'in"
  }

  hundredWord = 'ɗari'
  thousandWord = 'dubu'

  // Short scale
  scaleWords = ['miliyan', 'biliyan']

  /**
   * Converts a 3-digit segment with Hausa patterns.
   *
   * Hausa uses reversed order for hundreds: "biyu ɗari" (200)
   * And "da" connector for ones: "ashirin da ɗaya" (21)
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds: implicit one, or "biyu ɗari" (reversed order)
    if (hundreds > 0n) {
      if (hundreds === 1n) {
        parts.push(this.hundredWord)
      } else {
        // Reversed: multiplier + hundredWord
        parts.push(`${this.onesWords[hundreds]} ${this.hundredWord}`)
      }
    }

    // Tens and ones
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds
    } else if (tensOnes < 10n) {
      // Single digit - with "da" connector if after hundreds
      if (hundreds > 0n) {
        parts.push(`da ${this.onesWords[ones]}`)
      } else {
        parts.push(this.onesWords[ones])
      }
    } else if (tensOnes < 20n) {
      // Teens (10-19): "sha X"
      parts.push(this.teensWords[ones])
    } else if (ones === 0n) {
      // Even tens (20, 30, 40, etc.)
      parts.push(this.tensWords[tens])
    } else {
      // Tens + ones with "da" connector
      parts.push(`${this.tensWords[tens]} da ${this.onesWords[ones]}`)
    }

    return parts.join(' ')
  }

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
   * Joins segments with Hausa rules.
   *
   * Key patterns:
   * - Implicit one before ɗari and dubu
   * - Reversed order for thousands: "biyu dubu" (2000)
   * - "da" connector for trailing ones after scale words
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const filtered = []

    // First pass: filter out implicit "ɗaya" before scale words
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // Skip "ɗaya" before ɗari or dubu (implicit one)
      if (part === 'ɗaya' && nextPart &&
          (nextPart === this.hundredWord || nextPart === this.thousandWord)) {
        continue
      }

      filtered.push(part)
    }

    // Second pass: join with correct separators
    const result = []
    for (let i = 0; i < filtered.length; i++) {
      const part = filtered[i]
      const prevPart = i > 0 ? filtered[i - 1] : null

      // Determine if we need "da" connector
      // Use "da" when current is a single digit following a scale word
      if (prevPart && this.#isSingleDigit(part) &&
          (prevPart === this.thousandWord || prevPart === this.hundredWord ||
           this.scaleWords.includes(prevPart))) {
        result.push(' da ')
      } else if (i > 0) {
        result.push(' ')
      }

      result.push(part)
    }

    return result.join('')
  }

  /**
   * Checks if a word is a single digit (1-9).
   */
  #isSingleDigit (word) {
    return Object.values(this.onesWords).includes(word)
  }
}
