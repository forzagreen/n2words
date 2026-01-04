import { AbstractLanguage } from './abstract-language.js'
import { groupByThrees, placeValues } from '../utils/segment-utils.js'

/**
 * Short scale language converter.
 *
 * Uses segment-based decomposition for high performance with short scale numbering.
 *
 * Short scale (used in English, US, Brazil, Russia, etc.):
 * - million (10^6), billion (10^9), trillion (10^12), quadrillion (10^15)
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
 * - `scaleWords`: Array of scale words ['thousand', 'million', ...]
 * - Optionally override `segmentToWords()` for custom segment handling
 * - Optionally override `joinSegments()` for custom joining rules
 *
 * For long scale languages (European Portuguese, German, French, etc.),
 * use LongScaleLanguage instead.
 *
 * @abstract
 * @extends AbstractLanguage
 */
export class ShortScaleLanguage extends AbstractLanguage {
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
   * Index 0 = thousand, 1 = million, 2 = billion, etc.
   * @type {string[]}
   */
  scaleWords = []

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
   * Gets the scale word for a given index.
   *
   * @protected
   * @param {number} scaleIndex The scale level (1 = thousand, 2 = million, etc.).
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The scale word.
   */
  scaleWordForIndex (scaleIndex, segment) {
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
}
