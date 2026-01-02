import { AbstractLanguage } from './abstract-language.js'

/**
 * Base class for South Asian languages with shared grouping patterns.
 *
 * This class provides a reusable implementation for South Asian languages that share:
 * - Indian-style number grouping: last 3 digits, then 2-2 (1,23,45,67,89)
 * - Lakh (100,000), Crore (10,000,000), Arab (1,000,000,000) scale words
 * - Standard negative and decimal handling (inherits AbstractLanguage decimal logic,
 *   including `usePerDigitDecimals` support when set by subclasses)
 *
 * Used by: Hindi (hi), Bengali (bn), Urdu (ur), Punjabi (pa), Marathi (mr), Gujarati (gu), Kannada (kn)
 *
 * Subclasses MUST define language-specific vocabulary via class properties:
 * - `belowHundredWords` array with digit and teen words (0-99)
 * - `hundredWord` string used inside `segmentToWords`
 * - `scaleWords` array with grouping words (hazaar, lakh, crore, etc.) indexed by grouping level
 * - `negativeWord`, `decimalSeparatorWord`, `zeroWord`, `wordSeparator`
 *
 * @abstract
 * @extends AbstractLanguage
 */
export class SouthAsianLanguage extends AbstractLanguage {
  // ============================================================================
  // Required Properties (subclasses must define)
  // ============================================================================

  /**
   * Array of words for numbers 0-99 (digits and teens).
   * Index directly: belowHundredWords[0] through belowHundredWords[99].
   * @type {Array<string>}
   */
  belowHundredWords

  /**
   * Word for "hundred" in the language (e.g., 'सौ' in Hindi, 'শত' in Bengali).
   * Used to construct hundreds (e.g., "1 hundred", "2 hundred").
   * @type {string}
   */
  hundredWord

  /**
   * Array of scale words for Indian-style grouping (hazaar, lakh, crore, arab, etc.).
   * Index 0 contains empty string (ones place has no scale word).
   * Index 1 is for thousands, Index 2 for lakhs, Index 3 for crores, etc.
   * @type {Array<string>}
   */
  scaleWords

  // ============================================================================
  // Protected Methods (subclasses may call or override)
  // ============================================================================

  /**
   * Split a number into Indian numbering system segments.
   *
   * The Indian system segments differently than Western (3-3-3) systems:
   * - First segment (rightmost): Up to 3 digits (ones, tens, hundreds)
   * - Subsequent segments: Exactly 2 digits each (thousands, lakhs, crores, etc.)
   *
   * This creates the familiar Indian comma pattern: 1,23,45,67,890
   *
   * @protected
   * @param {bigint} number The number to split into segments
   * @returns {Array<number>} Array of segments from most significant to least significant
   *
   * @example
   * // splitToSegments(1234567n) → [12, 34, 567]
   * // Reads as: 12 lakhs, 34 thousands, 567 units
   * // splitToSegments(98765432n) → [9, 87, 65, 432]
   * // Reads as: 9 crores, 87 lakhs, 65 thousands, 432 units
   */
  splitToSegments (number) {
    const numStr = number.toString()

    if (numStr.length <= 3) {
      return [Number(numStr)]
    }

    const segments = []
    const last3 = numStr.slice(-3)
    segments.unshift(Number(last3))

    let remaining = numStr.slice(0, -3)
    while (remaining.length > 0) {
      const segment = remaining.slice(-2)
      segments.unshift(Number(segment))
      remaining = remaining.slice(0, -2)
    }

    return segments
  }

  /**
   * Convert a segment (0-999) to words.
   *
   * @protected
   * @param {number} number Value between 0 and 999
   * @returns {string} Language-specific word representation
   */
  segmentToWords (number) {
    if (number === 0) return ''
    if (number < 100) return this.belowHundredWords[number]

    const hundreds = Math.trunc(number / 100)
    const remainder = number % 100
    const parts = []

    if (hundreds === 1) {
      parts.push(this.belowHundredWords[1] + ' ' + this.hundredWord)
    } else {
      parts.push(this.belowHundredWords[hundreds] + ' ' + this.hundredWord)
    }

    if (remainder > 0) {
      parts.push(this.belowHundredWords[remainder])
    }

    return parts.join(' ')
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Convert integer to cardinal words using South Asian grouping.
   *
   * @param {bigint} integerPart Number to convert
   * @returns {string} Cardinal representation
   */
  integerToWords (integerPart) {
    if (integerPart === 0n) {
      return this.zeroWord
    }

    const segments = this.splitToSegments(integerPart)
    const segmentCount = segments.length
    const words = []

    for (let i = 0; i < segmentCount; i++) {
      const segmentValue = segments[i]
      if (segmentValue === 0) continue

      const scaleIndex = segmentCount - i - 1
      words.push(this.segmentToWords(segmentValue))
      if (scaleIndex > 0 && this.scaleWords[scaleIndex]) {
        words.push(this.scaleWords[scaleIndex])
      }
    }

    return words.join(' ').trim()
  }
}
