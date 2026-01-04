import { ScaleLanguage } from './scale-language.js'

/**
 * Base class for Turkic languages with shared grammar patterns.
 *
 * Uses segment-based decomposition for high performance.
 * This class provides a reusable implementation for Turkic languages that share:
 * - Space-separated number combinations
 * - Implicit 'bir' (one) before hundreds and thousands
 * - Explicit 'bir' (one) before millions and higher
 *
 * Used by: Turkish (TR), Azerbaijani (AZ)
 *
 * Subclasses MUST define:
 * - `onesWords`: Object mapping 1-9 to words
 * - `teensWords`: Object mapping 0-9 to teen words (10-19)
 * - `tensWords`: Object mapping 2-9 to tens words (20-90)
 * - `hundredWord`: The word for hundred (e.g., 'yüz')
 * - `thousandWord`: The word for thousand (e.g., 'bin')
 * - `scaleWords`: Array of scale words [million, billion, ...]
 *
 * @abstract
 * @extends ScaleLanguage
 */
export class TurkicLanguage extends ScaleLanguage {
  /**
   * The word for thousand.
   * @type {string}
   */
  thousandWord = ''

  /**
   * Gets scale word for index.
   *
   * Index 1 = thousand, Index 2+ = scaleWords array
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }
    // Index 2 → scaleWords[0] (million), etc.
    return this.scaleWords[scaleIndex - 2] || ''
  }

  /**
   * Combines parts of a segment with wordSeparator.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    return parts.join(this.wordSeparator)
  }

  /**
   * Converts hundreds with wordSeparator.
   */
  hundredsToWords (hundreds, scaleIndex) {
    if (hundreds === 1n) {
      return this.hundredWord
    }
    return `${this.onesWords[hundreds]}${this.wordSeparator}${this.hundredWord}`
  }

  /**
   * Joins segments with Turkic implicit 'bir' rules.
   *
   * Key pattern: Omit 'bir' (one) before hundred and thousand,
   * but keep it before million and higher.
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // Skip 'bir' before hundred word or thousand word (implicit one)
      if (part === this.onesWords[1] && nextPart &&
          (nextPart === this.hundredWord || nextPart === this.thousandWord)) {
        continue
      }

      result.push(part)

      if (nextPart) {
        result.push(this.wordSeparator)
      }
    }

    return result.join('')
  }
}
