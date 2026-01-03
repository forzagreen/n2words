import { AbstractLanguage } from './abstract-language.js'
import { groupByThreeThenTwos } from '../utils/segment-utils.js'

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
   * Converts a segment (0-999) to words.
   *
   * @protected
   * @param {number} segmentValue Value between 0 and 999.
   * @returns {string} Language-specific word representation.
   */
  segmentToWords (segmentValue) {
    if (segmentValue === 0) return ''
    if (segmentValue < 100) return this.belowHundredWords[segmentValue]

    const hundreds = Math.trunc(segmentValue / 100)
    const remainder = segmentValue % 100
    const parts = []

    parts.push(this.belowHundredWords[hundreds] + ' ' + this.hundredWord)

    if (remainder > 0) {
      parts.push(this.belowHundredWords[remainder])
    }

    return parts.join(' ')
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Converts integer to cardinal words using South Asian grouping.
   *
   * @param {bigint} integerPart Number to convert.
   * @returns {string} Cardinal representation.
   */
  integerToWords (integerPart) {
    if (integerPart === 0n) {
      return this.zeroWord
    }

    const segments = groupByThreeThenTwos(integerPart)
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
