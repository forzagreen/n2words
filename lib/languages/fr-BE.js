import { French } from './fr.js'

/**
 * French (Belgium) language converter.
 *
 * Uses Belgian French regional variants:
 * - septante (70) instead of soixante-dix
 * - nonante (90) instead of quatre-vingt-dix
 * - Keeps quatre-vingts (80) like standard French
 *
 * Inherits all other French grammar rules.
 */
export class FrenchBelgium extends French {
  /**
   * Override tensWords to add Belgian forms.
   * 7 = septante, 9 = nonante (but 8 = quatre-vingt stays)
   */
  tensWords = {
    2: 'vingt',
    3: 'trente',
    4: 'quarante',
    5: 'cinquante',
    6: 'soixante',
    7: 'septante', // Belgian form (not soixante-dix)
    8: 'quatre-vingt', // Same as standard French
    9: 'nonante' // Belgian form (not quatre-vingt-dix)
  }

  /**
   * Converts a 3-digit segment (0-999) to words.
   *
   * Belgian French: 70-79 and 90-99 use regular tens pattern.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds
    if (hundreds > 0n) {
      parts.push(this.hundredsToWords(hundreds, scaleIndex, segment))
    }

    // Tens and ones
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds, nothing more
    } else if (tensOnes < 10n) {
      // Single digit
      parts.push(this.onesWords[ones])
    } else if (tensOnes < 17n) {
      // 10-16: regular teens
      parts.push(this.teensWords[ones])
    } else if (tensOnes < 20n) {
      // 17-19: dix-sept, dix-huit, dix-neuf
      parts.push(this.teensWords[ones])
    } else if (tensOnes < 80n) {
      // 20-79: Belgian uses regular tens for 70s too
      if (ones === 0n) {
        parts.push(this.tensWords[tens])
      } else if (ones === 1n && tens !== 7n) {
        // "et un" for 21, 31, 41, 51, 61 (not 71 in Belgian)
        parts.push(this.tensWords[tens])
        parts.push('et')
        parts.push(this.onesWords[1])
      } else if (ones === 1n && tens === 7n) {
        // 71: septante et un
        parts.push(this.tensWords[tens])
        parts.push('et')
        parts.push(this.onesWords[1])
      } else {
        parts.push(this.tensWords[tens])
        parts.push(this.onesWords[ones])
      }
    } else if (tensOnes === 80n) {
      // 80: quatre-vingts (with 's')
      parts.push('quatre-vingts')
    } else if (tensOnes < 90n) {
      // 81-89: quatre-vingt-un, etc. (same as standard French)
      const remainder = tensOnes - 80n
      parts.push('quatre-vingt')
      parts.push(this.onesWords[remainder])
    } else {
      // 90-99: Belgian uses nonante (regular pattern)
      if (ones === 0n) {
        parts.push(this.tensWords[9])
      } else if (ones === 1n) {
        // 91: nonante et un
        parts.push(this.tensWords[9])
        parts.push('et')
        parts.push(this.onesWords[1])
      } else {
        parts.push(this.tensWords[9])
        parts.push(this.onesWords[ones])
      }
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }
}
