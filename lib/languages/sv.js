import { SegmentScaleLanguage } from '../classes/segment-scale-language.js'

/**
 * Swedish language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Hyphenation for compound tens (tjugo-tre)
 * - "och" (and) after hundreds before small numbers
 * - "och" after scale words before small numbers
 * - Numbers up to quadrillions
 */
export class Swedish extends SegmentScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'noll'

  onesWords = {
    1: 'ett',
    2: 'två',
    3: 'tre',
    4: 'fyra',
    5: 'fem',
    6: 'sex',
    7: 'sju',
    8: 'åtta',
    9: 'nio'
  }

  teensWords = {
    0: 'tio',
    1: 'elva',
    2: 'tolv',
    3: 'tretton',
    4: 'fjorton',
    5: 'femton',
    6: 'sexton',
    7: 'sjutton',
    8: 'arton',
    9: 'nitton'
  }

  tensWords = {
    2: 'tjugo',
    3: 'trettio',
    4: 'fyrtio',
    5: 'femtio',
    6: 'sextio',
    7: 'sjuttio',
    8: 'åttio',
    9: 'nittio'
  }

  hundredWord = 'hundra'

  scaleWords = [
    'tusen',
    'miljon',
    'miljard',
    'biljon',
    'biljard',
    'triljon',
    'triljard',
    'kvadriljon'
  ]

  /**
   * Combines segment parts with Swedish hyphenation and "och" rules.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''

    const tensOnes = segment % 100n
    const hasHundreds = segment >= 100n

    if (hasHundreds) {
      // parts[0] is hundreds, rest is tens/ones
      const tensOnesParts = parts.slice(1)
      let tensOnesPart = ''

      if (tensOnesParts.length === 2 && tensOnes > 20n) {
        // Hyphenate "tjugo-tre" etc.
        tensOnesPart = `${tensOnesParts[0]}-${tensOnesParts[1]}`
      } else {
        tensOnesPart = tensOnesParts.join('-')
      }

      // Add "och" after hundreds if there's a remainder < 100
      if (tensOnesPart) {
        return `${parts[0]} och ${tensOnesPart}`
      }
      return parts[0]
    } else {
      // No hundreds - just handle hyphenation for tens+ones
      if (parts.length === 2 && tensOnes > 20n) {
        return `${parts[0]}-${parts[1]}`
      }
      return parts.join('-')
    }
  }

  /**
   * Converts hundreds - omit "ett" before hundra.
   */
  hundredsToWords (hundreds, scaleIndex) {
    if (hundreds === 1n) {
      return this.hundredWord
    }
    return `${this.onesWords[hundreds]} ${this.hundredWord}`
  }

  /**
   * Gets the scale word, using "en" instead of "ett" for millions+.
   */
  scaleWordForIndex (scaleIndex, segment) {
    return this.scaleWords[scaleIndex - 1] || ''
  }

  /**
   * Converts segment with special handling for "ett" → "en" before millions.
   */
  segmentToWords (segment, scaleIndex) {
    // For segment=1 before millions+, we need "en" not "ett"
    if (segment === 1n && scaleIndex >= 2) {
      return 'en'
    }
    // For segment=1 before thousands, omit entirely
    if (segment === 1n && scaleIndex === 1) {
      return ''
    }
    return super.segmentToWords(segment, scaleIndex)
  }

  /**
   * Join segments with "och" before final small segment when needed.
   *
   * Swedish uses "och" before the final segment if:
   * - The final segment is < 100
   * - There's a scale word before it
   */
  joinSegments (parts, integerPart) {
    if (parts.length <= 1) return parts.join(' ')

    // Check if we need to insert "och" before the final segment
    const lastPart = parts[parts.length - 1]
    const secondLastPart = parts[parts.length - 2]

    // If second-to-last is a scale word and last doesn't contain "hundra"
    const isSecondLastScale = this.scaleWords.includes(secondLastPart)
    const lastContainsHundra = lastPart.includes(this.hundredWord)

    if (isSecondLastScale && !lastContainsHundra) {
      const result = [...parts]
      result.splice(parts.length - 1, 0, 'och')
      return result.join(' ')
    }

    return parts.join(' ')
  }
}
