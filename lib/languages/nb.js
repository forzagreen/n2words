import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Norwegian Bokmål language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Hyphenated tens+ones: "tjue-en" (21), "førti-fire" (44)
 * - "og" (and) conjunction after hundreds
 * - Comma separator after thousands: "fire tusen, en hundre og..."
 * - Short scale: million, milliard, billion, etc.
 */
export class NorwegianBokmal extends ScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'null'

  onesWords = {
    1: 'en',
    2: 'to',
    3: 'tre',
    4: 'fire',
    5: 'fem',
    6: 'seks',
    7: 'syv',
    8: 'åtte',
    9: 'ni'
  }

  teensWords = {
    0: 'ti',
    1: 'elleve',
    2: 'tolv',
    3: 'tretten',
    4: 'fjorten',
    5: 'femten',
    6: 'seksten',
    7: 'sytten',
    8: 'atten',
    9: 'nitten'
  }

  tensWords = {
    2: 'tjue',
    3: 'tretti',
    4: 'førti',
    5: 'femti',
    6: 'seksti',
    7: 'sytti',
    8: 'åtti',
    9: 'nitti'
  }

  hundredWord = 'hundre'
  thousandWord = 'tusen'

  // Short scale: million (10^6), milliard (10^9), billion (10^12), etc.
  scaleWords = ['million', 'milliard', 'billion', 'billiard', 'kvintillion', 'sekstillion', 'septillion', 'oktillion']

  /**
   * Converts a 3-digit segment with Norwegian patterns.
   *
   * Norwegian uses hyphenated tens+ones: "tjue-en" (21)
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds: "en hundre", "to hundre" (space separated)
    if (hundreds > 0n) {
      parts.push(`${this.onesWords[hundreds]} ${this.hundredWord}`)
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
      // Hyphenated tens+ones: "tjue-en", "førti-fire"
      parts.push(`${this.tensWords[tens]}-${this.onesWords[ones]}`)
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Combines segment parts with Norwegian "og" rules.
   *
   * - Hundreds + smaller: " og " (en hundre og tre)
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]
    return parts.join(' og ')
  }

  /**
   * Gets scale word for index.
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }
    // Index 2 → scaleWords[0] (million), etc.
    return this.scaleWords[scaleIndex - 2] || ''
  }

  /**
   * Joins segments with Norwegian spacing and comma rules.
   *
   * Key patterns:
   * - Thousands + hundreds: comma separator "fire tusen, en hundre og..."
   * - Thousands + small number (no hundreds): "og" separator "en tusen og en"
   * - Millions+: space separated "en million"
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      result.push(part)

      if (nextPart) {
        // Determine separator based on context
        if (part === this.thousandWord || part.endsWith(` ${this.thousandWord}`)) {
          // After thousands
          if (nextPart.includes(this.hundredWord)) {
            // Thousands + hundreds: comma
            result.push(', ')
          } else {
            // Thousands + small number: " og "
            result.push(' og ')
          }
        } else if (this.#isScaleWord(part)) {
          // After scale words (million, etc.)
          if (!this.#isScaleWord(nextPart) && nextPart !== this.thousandWord) {
            // Scale + remainder: " og " for small numbers
            result.push(' og ')
          } else {
            result.push(' ')
          }
        } else if (this.#isScaleWord(nextPart) || nextPart === this.thousandWord) {
          // Before scale words: space
          result.push(' ')
        } else {
          // Default: space
          result.push(' ')
        }
      }
    }

    return result.join('')
  }

  /**
   * Checks if a word is a scale word (million+).
   */
  #isScaleWord (word) {
    for (const sw of this.scaleWords) {
      if (word === sw || word.endsWith(` ${sw}`)) return true
    }
    return false
  }
}
