import { AbstractLanguage } from './abstract-language.js'
import { groupByThrees, placeValues } from '../utils/segment-utils.js'

/**
 * Scale-based language converter.
 *
 * Uses segment-based decomposition for high performance with simple scale pattern
 * where each power of 1000 has a unique word.
 *
 * Used by: English, German, Swedish, Dutch, and other Western languages
 *
 * Scale pattern:
 * - 10^3: scaleWords[0] (thousand)
 * - 10^6: scaleWords[1] (million)
 * - 10^9: scaleWords[2] (billion)
 * - 10^12: scaleWords[3] (trillion)
 *
 * Algorithm:
 * 1. Split number into 3-digit segments from right to left
 * 2. Convert each segment to words using direct lookups (O(1))
 * 3. Append scale words (thousand, million, etc.)
 * 4. Join with language-specific rules
 *
 * Performance benefits:
 * - O(1) vocabulary lookups using direct property access
 * - Single pass segment processing
 * - Minimal object creation
 *
 * For compound scale (long scale with "thousand + previous"), use CompoundScaleLanguage.
 * For myriad-based (万-grouping), use MyriadLanguage.
 *
 * Subclass requirements:
 * - `onesWords`: Object mapping 1-9 to words
 * - `teensWords`: Object mapping 0-9 to teen words (10-19)
 * - `tensWords`: Object mapping 2-9 to tens words (20-90)
 * - `hundredWord` OR `hundredsWords`: Either a string for simple "N hundred" pattern,
 *   or an object mapping 1-9 to hundred words (for irregular hundreds)
 * - `scaleWords`: Array of scale words [thousand, million, billion, ...]
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
   * Index 0 = thousand, 1 = million, 2 = billion, etc.
   * @type {string[]}
   */
  scaleWords = []

  /**
   * Word for "thousand" when using thousandWord pattern.
   * Some languages separate thousand from other scale words.
   * @type {string}
   */
  thousandWord = ''

  // ============================================================================
  // Implicit One Omission
  // ============================================================================

  /**
   * Whether to omit "one" before hundred (e.g., "yüz" vs "bir yüz").
   * Used by Turkish, Azerbaijani, Finnish.
   * @type {boolean}
   */
  omitOneBeforeHundred = false

  /**
   * Whether to omit "one" before thousand (e.g., "bin" vs "bir bin").
   * Used by Turkish, Azerbaijani, Greek, Finnish.
   * @type {boolean}
   */
  omitOneBeforeThousand = false

  /**
   * Whether to omit "one" before scale words (million, billion, etc.).
   * Used by Greek.
   * @type {boolean}
   */
  omitOneBeforeScale = false

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
   * If `thousandWord` is set, uses it for index 1 and offsets scaleWords by one.
   * Otherwise, direct array lookup: index 1 → scaleWords[0] (thousand)
   *
   * @protected
   * @param {number} scaleIndex The scale level (1 = thousand, 2 = million, etc.).
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The scale word.
   */
  scaleWordForIndex (scaleIndex, segment) {
    // If thousandWord is defined, use it for index 1
    if (this.thousandWord) {
      if (scaleIndex === 1) {
        return this.thousandWord
      }
      // Offset: index 2 → scaleWords[0] (million)
      return this.scaleWords[scaleIndex - 2] || ''
    }
    // Default: index 1 → scaleWords[0] (thousand)
    return this.scaleWords[scaleIndex - 1] || ''
  }

  /**
   * Joins all segment parts into the final string.
   *
   * Handles implicit one omission based on flags:
   * - omitOneBeforeHundred: Skip "one" before hundredWord
   * - omitOneBeforeThousand: Skip "one" before thousandWord
   * - omitOneBeforeScale: Skip "one" before scale words (million, billion, etc.)
   *
   * Subclasses may override for custom joining (e.g., "and" before final segment).
   *
   * @protected
   * @param {string[]} parts The converted segment parts.
   * @param {bigint} integerPart The original integer (for context).
   * @returns {string} The final joined string.
   */
  joinSegments (parts, integerPart) {
    // If no omission flags are set, use simple join
    if (!this.omitOneBeforeHundred && !this.omitOneBeforeThousand && !this.omitOneBeforeScale) {
      return parts.join(' ')
    }

    // Filter out "one" before specific words
    const oneWord = this.onesWords[1]
    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // Check if this is "one" followed by a word we should omit before
      if (part === oneWord && nextPart) {
        if (this.omitOneBeforeHundred && nextPart === this.hundredWord) {
          continue
        }
        if (this.omitOneBeforeThousand && nextPart === this.thousandWord) {
          continue
        }
        if (this.omitOneBeforeScale && this.scaleWords.includes(nextPart)) {
          continue
        }
      }

      result.push(part)
    }

    return result.join(' ')
  }
}
