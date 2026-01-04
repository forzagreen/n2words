import { ScaleLanguage } from './scale-language.js'

/**
 * Compound scale language converter.
 *
 * Extends ScaleLanguage with long scale compound pattern where odd powers
 * use "thousand + previous scale" (e.g., "mil milhões" for billion).
 *
 * Used by: Portuguese, French, Spanish (long scale languages)
 *
 * Scale pattern:
 * - 10^3: thousandWord (mil/mille)
 * - 10^6: scaleWords[0] (milhão/million/millón)
 * - 10^9: thousandWord + scaleWords[0] (mil milhões/mille millions/mil millones)
 * - 10^12: scaleWords[1] (bilião/billion/billón)
 * - 10^15: thousandWord + scaleWords[1] (mil biliões/mille billions/mil billones)
 *
 * @abstract
 * @extends ScaleLanguage
 */
export class CompoundScaleLanguage extends ScaleLanguage {
  /**
   * Word for "thousand".
   * Used alone for 10^3 and in compounds like "mil milhões" for 10^9.
   * @type {string}
   */
  thousandWord = ''

  /**
   * Gets the scale word for a given index using compound pattern.
   *
   * Pattern:
   * - Index 1: thousandWord
   * - Even indices (2, 4, 6): scaleWords[0], scaleWords[1], scaleWords[2]
   * - Odd indices > 1 (3, 5, 7): thousandWord + pluralized scaleWords[0,1,2]
   *
   * @protected
   * @param {number} scaleIndex The scale level (1 = thousand, 2 = million, etc.).
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The scale word.
   */
  scaleWordForIndex (scaleIndex, segment) {
    // Index 1: thousand
    if (scaleIndex === 1) {
      return this.thousandWord
    }

    // Even indices (2, 4, 6, 8): direct scale words from scaleWords array
    // scaleIndex 2 → scaleWords[0] (million)
    // scaleIndex 4 → scaleWords[1] (billion)
    // scaleIndex 6 → scaleWords[2] (trillion)
    if (scaleIndex % 2 === 0) {
      const arrayIndex = (scaleIndex / 2) - 1
      const baseWord = this.scaleWords[arrayIndex]
      if (!baseWord) return ''

      // Pluralize when segment > 1
      if (segment > 1n) {
        return this.pluralizeScaleWord(baseWord)
      }
      return baseWord
    }

    // Odd indices > 1 (3, 5, 7): "thousand" + pluralized previous scale
    // scaleIndex 3 → thousand + scaleWords[0] (thousand million)
    // scaleIndex 5 → thousand + scaleWords[1] (thousand billion)
    const arrayIndex = ((scaleIndex - 1) / 2) - 1
    const prevScaleWord = this.scaleWords[arrayIndex]
    if (!prevScaleWord) {
      return this.thousandWord
    }

    // Always pluralize for "thousand X" pattern
    return `${this.thousandWord} ${this.pluralizeScaleWord(prevScaleWord)}`
  }
}
