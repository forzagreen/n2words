import { AbstractLanguage } from './abstract-language.js'
import { groupByThrees, placeValues } from '../utils/segment-utils.js'

/**
 * Scale-based language converter.
 *
 * Uses segment-based decomposition for high performance. Supports both simple
 * and compound scale patterns through the `scaleMode` property.
 *
 * Scale modes:
 * - 'simple': Each power of 1000 has a unique word (English, German, Swedish)
 *   scaleWords = ['thousand', 'million', 'billion', ...]
 *
 * - 'compound': Uses "thousand + previous scale" for odd powers (Portuguese, French)
 *   scaleWords = ['million', 'billion', 'trillion', ...] (starts at million)
 *   thousandWord = 'mil' (used alone and in compounds like "mil milhões")
 *
 * Algorithm:
 * 1. Split number into 3-digit segments from right to left
 * 2. Convert each segment to words using direct lookups (O(1))
 * 3. Append scale words (thousand, million, etc.)
 * 4. Join with language-specific rules
 *
 * Performance: ~10x faster than GreedyScaleLanguage due to:
 * - O(1) vocabulary lookups instead of O(n) array scans
 * - Single pass instead of recursive decomposition + reduction
 * - Minimal object creation
 *
 * Subclass requirements:
 * - `onesWords`: Object mapping 1-9 to words
 * - `teensWords`: Object mapping 0-9 to teen words (10-19)
 * - `tensWords`: Object mapping 2-9 to tens words (20-90)
 * - `hundredWord` OR `hundredsWords`: Either a string for simple "N hundred" pattern,
 *   or an object mapping 1-9 to hundred words (for irregular hundreds)
 * - `scaleWords`: Array of scale words (meaning depends on scaleMode)
 * - `scaleMode`: 'simple' (default) or 'compound'
 * - `thousandWord`: Required when scaleMode='compound'
 * - Optionally override `segmentToWords()` for custom segment handling
 * - Optionally override `joinSegments()` for custom joining rules
 *
 * @abstract
 * @extends AbstractLanguage
 */
export class ScaleLanguage extends AbstractLanguage {
  // ============================================================================
  // Required Properties (subclasses must define)
  // ============================================================================

  /**
   * Words for digits 1-9.
   * @type {Object.<number, string>}
   */
  onesWords = {}

  /**
   * Words for teen numbers (10-19). Key is the ones digit (0-9).
   * @type {Object.<number, string>}
   */
  teensWords = {}

  /**
   * Words for multiples of ten (20, 30, ..., 90). Key is the tens digit (2-9).
   * @type {Object.<number, string>}
   */
  tensWords = {}

  /**
   * Word for "hundred" (simple case).
   * Used when hundredsWords is not defined.
   * @type {string}
   */
  hundredWord = ''

  /**
   * Words for hundreds (1-9).
   * For languages with irregular hundreds (e.g., Slavic, French).
   * If defined, takes precedence over hundredWord.
   * @type {Object.<number, string>}
   */
  hundredsWords = null

  /**
   * Scale words for powers of 1000.
   *
   * For scaleMode='simple': Index 0 = thousand, 1 = million, 2 = billion, etc.
   * For scaleMode='compound': Index 0 = million, 1 = billion, 2 = trillion, etc.
   *
   * @type {string[]}
   */
  scaleWords = []

  /**
   * Scale mode determines how scale words are interpreted.
   *
   * - 'simple': Each power of 1000 has a unique word.
   *   scaleIndex 1 → scaleWords[0] (thousand)
   *   scaleIndex 2 → scaleWords[1] (million)
   *   scaleIndex 3 → scaleWords[2] (billion)
   *
   * - 'compound': Uses "thousand + previous scale" for odd powers above thousand.
   *   scaleIndex 1 → thousandWord (thousand)
   *   scaleIndex 2 → scaleWords[0] (million)
   *   scaleIndex 3 → thousandWord + scaleWords[0] (thousand million)
   *   scaleIndex 4 → scaleWords[1] (billion)
   *   scaleIndex 5 → thousandWord + scaleWords[1] (thousand billion)
   *
   * @type {'simple'|'compound'}
   */
  scaleMode = 'simple'

  /**
   * Word for "thousand" - required when scaleMode='compound'.
   * Used alone for 10^3 and in compounds like "mil milhões" for 10^9.
   * @type {string}
   */
  thousandWord = ''

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Converts an integer to its word representation.
   *
   * @param {bigint} integerPart The integer to convert.
   * @returns {string} The number in words.
   */
  integerToWords (integerPart) {
    if (integerPart === 0n) {
      return this.zeroWord
    }

    const segments = groupByThrees(integerPart.toString())
    const parts = []
    let scaleIndex = segments.length - 1

    for (const segment of segments) {
      if (segment !== 0n) {
        const segmentWords = this.segmentToWords(segment, scaleIndex)
        if (segmentWords) {
          parts.push(segmentWords)
        }

        if (scaleIndex > 0 && segment !== 0n) {
          const scaleWord = this.scaleWordForIndex(scaleIndex, segment)
          if (scaleWord) {
            parts.push(scaleWord)
          }
        }
      }
      scaleIndex--
    }

    return this.joinSegments(parts, integerPart)
  }

  // ============================================================================
  // Protected Methods (subclasses may override)
  // ============================================================================

  /**
   * Converts a 3-digit segment (0-999) to words.
   *
   * Subclasses may override for language-specific handling (e.g., French vigesimal).
   *
   * @protected
   * @param {bigint} segment The segment value (0-999).
   * @param {number} scaleIndex The scale level (0 = ones, 1 = thousands, etc.).
   * @returns {string} The segment in words.
   */
  segmentToWords (segment, scaleIndex) {
    const [ones, tens, hundreds] = placeValues(segment)
    const parts = []

    // Hundreds
    if (hundreds > 0n) {
      parts.push(this.hundredsToWords(hundreds, scaleIndex))
    }

    // Tens and ones
    if (tens === 1n) {
      // Teen numbers (10-19)
      parts.push(this.teensWords[ones])
    } else {
      if (tens > 1n) {
        parts.push(this.tensWords[tens])
      }
      if (ones > 0n) {
        parts.push(this.onesToWords(ones, scaleIndex, tens))
      }
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Converts a hundreds digit to words.
   *
   * Supports two patterns:
   * - `hundredsWords` object: For languages with irregular hundreds (Slavic, French)
   * - `hundredWord` string: For simple "N hundred" pattern (English, Spanish)
   *
   * @protected
   * @param {bigint} hundreds The hundreds digit (1-9).
   * @param {number} scaleIndex The scale level.
   * @returns {string} The hundreds in words.
   */
  hundredsToWords (hundreds, scaleIndex) {
    // Use hundredsWords if defined (irregular hundreds)
    if (this.hundredsWords) {
      return this.hundredsWords[hundreds]
    }

    // Fall back to simple "N hundred" pattern
    if (hundreds === 1n) {
      return this.hundredWord
    }
    return `${this.onesWords[hundreds]} ${this.hundredWord}`
  }

  /**
   * Converts a ones digit to words.
   *
   * Subclasses may override for gender-specific forms.
   *
   * @protected
   * @param {bigint} ones The ones digit (1-9).
   * @param {number} scaleIndex The scale level.
   * @param {bigint} tens The tens digit (for context).
   * @returns {string} The ones word.
   */
  onesToWords (ones, scaleIndex, tens) {
    return this.onesWords[ones]
  }

  /**
   * Combines parts of a segment with language-specific rules.
   *
   * @protected
   * @param {string[]} parts The segment parts.
   * @param {bigint} segment The original segment value.
   * @param {number} scaleIndex The scale level.
   * @returns {string} Combined segment words.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    return parts.join(' ')
  }

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
   * Gets the scale word for a given index.
   *
   * Behavior depends on scaleMode:
   * - 'simple': Direct array lookup (index 1 → scaleWords[0])
   * - 'compound': Complex pattern with thousandWord for odd indices
   *
   * @protected
   * @param {number} scaleIndex The scale level (1 = thousand, 2 = million, etc.).
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The scale word.
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (this.scaleMode === 'compound') {
      return this.#compoundScaleWord(scaleIndex, segment)
    }
    return this.scaleWords[scaleIndex - 1] || ''
  }

  /**
   * Joins all segment parts into the final string.
   *
   * Subclasses may override for custom joining (e.g., "and" before final segment).
   *
   * @protected
   * @param {string[]} parts The converted segment parts.
   * @param {bigint} integerPart The original integer (for context).
   * @returns {string} The final joined string.
   */
  joinSegments (parts, integerPart) {
    return parts.join(' ')
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Gets scale word using compound pattern (for scaleMode='compound').
   *
   * Pattern:
   * - Index 1: thousandWord
   * - Even indices (2, 4, 6): scaleWords[0], scaleWords[1], scaleWords[2]
   * - Odd indices > 1 (3, 5, 7): thousandWord + pluralized scaleWords[0,1,2]
   *
   * @private
   * @param {number} scaleIndex The scale level.
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The scale word.
   */
  #compoundScaleWord (scaleIndex, segment) {
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
