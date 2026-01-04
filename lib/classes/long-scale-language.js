import { ShortScaleLanguage } from './short-scale-language.js'

/**
 * Long scale language converter.
 *
 * Extends ShortScaleLanguage with long scale numbering support.
 *
 * Long scale (used in most of Europe):
 * - million (10^6), thousand million (10^9), billion (10^12), thousand billion (10^15), trillion (10^18)
 *
 * Short scale (used in English, US, Brazil, Russia, etc.):
 * - million (10^6), billion (10^9), trillion (10^12), quadrillion (10^15), quintillion (10^18)
 *
 * Subclass requirements (in addition to ShortScaleLanguage):
 * - `thousandWord`: Word for "thousand" (used alone and in compounds like "mil milhões")
 * - `scaleWords`: Array of scale words starting at million: ['million', 'billion', 'trillion', ...]
 *   where index 0 = million (10^6), 1 = billion (10^12), 2 = trillion (10^18), etc.
 * - Override `pluralizeScaleWord()` for language-specific pluralization
 *
 * @abstract
 * @extends ShortScaleLanguage
 */
export class LongScaleLanguage extends ShortScaleLanguage {
  /**
   * Word for "thousand" used alone and in scale compounds (e.g., "mil" in "mil milhões").
   * @type {string}
   */
  thousandWord = ''

  /**
   * Pluralizes a scale word.
   * Override for language-specific pluralization rules.
   *
   * @protected
   * @param {string} word The singular scale word.
   * @returns {string} The pluralized scale word.
   */
  pluralizeScaleWord (word) {
    return word
  }

  /**
   * Gets the scale word for a given index using long scale rules.
   *
   * Long scale pattern:
   * - Index 1: thousand
   * - Even indices (2, 4, 6, 8): scaleWords[0], scaleWords[1], scaleWords[2], scaleWords[3]
   *   (million, billion, trillion, quadrillion)
   * - Odd indices (3, 5, 7): thousand + pluralized scaleWords[0,1,2]
   *   (thousand million, thousand billion, thousand trillion)
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
