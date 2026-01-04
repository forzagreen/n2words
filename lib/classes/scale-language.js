import { AbstractLanguage } from './abstract-language.js'
import { groupByThrees, groupByFours, placeValues, placeValuesFour } from '../utils/segment-utils.js'

/**
 * Scale-based language converter.
 *
 * Uses segment-based decomposition for high performance. Supports simple,
 * compound, and myriad scale patterns through the `scaleMode` property.
 *
 * Scale modes:
 * - 'simple': Each power of 1000 has a unique word (English, German, Swedish)
 *   scaleWords = ['thousand', 'million', 'billion', ...]
 *
 * - 'compound': Uses "thousand + previous scale" for odd powers (Portuguese, French)
 *   scaleWords = ['million', 'billion', 'trillion', ...] (starts at million)
 *   thousandWord = 'mil' (used alone and in compounds like "mil milhões")
 *
 * - 'myriad': Groups by 10,000 (East Asian: Chinese, Japanese, Korean)
 *   scaleWords = ['만/万', '억/亿', '조/兆', ...] (powers of 10,000)
 *   Uses 4-digit segments with internal 千/百/十 structure
 *
 * Algorithm:
 * 1. Split number into 3-digit or 4-digit segments from right to left
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
 * - `teensWords`: Object mapping 0-9 to teen words (10-19) - not used for myriad
 * - `tensWords`: Object mapping 2-9 to tens words (20-90) - not used for myriad
 * - `hundredWord` OR `hundredsWords`: Either a string for simple "N hundred" pattern,
 *   or an object mapping 1-9 to hundred words (for irregular hundreds)
 * - `scaleWords`: Array of scale words (meaning depends on scaleMode)
 * - `scaleMode`: 'simple' (default), 'compound', or 'myriad'
 * - `thousandWord`: Required when scaleMode='compound' or 'myriad'
 * - `tenWord`: Required when scaleMode='myriad'
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
   * - 'myriad': Groups by 10,000 (万-based).
   *   Uses 4-digit segments internally converted with thousandWord/hundredWord/tenWord
   *   scaleIndex 1 → scaleWords[0] (万/만)
   *   scaleIndex 2 → scaleWords[1] (亿/억)
   *   scaleIndex 3 → scaleWords[2] (兆/조)
   *
   * @type {'simple'|'compound'|'myriad'}
   */
  scaleMode = 'simple'

  /**
   * Word for "thousand" - required when scaleMode='compound' or 'myriad'.
   * Used alone for 10^3 and in compounds like "mil milhões" for 10^9.
   * For myriad mode, used within 4-digit segments (e.g., 천/千).
   * @type {string}
   */
  thousandWord = ''

  /**
   * Word for "ten" - required when scaleMode='myriad'.
   * Used within 4-digit segments (e.g., 십/十).
   * @type {string}
   */
  tenWord = ''

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

    if (this.scaleMode === 'myriad') {
      return this.#myriadIntegerToWords(integerPart)
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

  // ============================================================================
  // Myriad Mode (East Asian languages)
  // ============================================================================

  /**
   * Converts an integer to words using myriad (万-based) grouping.
   *
   * Groups by 4 digits instead of 3:
   * - 10,000 = 万/만 (scaleWords[0])
   * - 100,000,000 = 亿/억 (scaleWords[1])
   * - 1,000,000,000,000 = 兆/조 (scaleWords[2])
   *
   * @private
   * @param {bigint} integerPart The integer to convert.
   * @returns {string} The number in words.
   */
  #myriadIntegerToWords (integerPart) {
    const segments = groupByFours(integerPart.toString())
    const parts = []
    let scaleIndex = segments.length - 1

    for (const segment of segments) {
      if (segment !== 0n) {
        const segmentWords = this.myriadSegmentToWords(segment, scaleIndex)
        if (segmentWords) {
          parts.push(segmentWords)
        }

        if (scaleIndex > 0) {
          const scaleWord = this.scaleWords[scaleIndex - 1]
          if (scaleWord) {
            parts.push(scaleWord)
          }
        }
      }
      scaleIndex--
    }

    return this.joinSegments(parts, integerPart)
  }

  /**
   * Converts a 4-digit segment (0-9999) to words for myriad mode.
   *
   * Uses internal structure: 千百十 (thousands, hundreds, tens)
   * Subclasses may override for language-specific handling.
   *
   * @protected
   * @param {bigint} segment The segment value (0-9999).
   * @param {number} scaleIndex The scale level (0 = ones, 1 = 万, 2 = 亿, etc.).
   * @returns {string} The segment in words.
   */
  myriadSegmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const [ones, tens, hundreds, thousands] = placeValuesFour(segment)
    const parts = []

    // Thousands (千)
    if (thousands > 0n) {
      const thousandsPart = this.myriadDigitToWords(thousands, 'thousand', scaleIndex)
      // Always add scale word; digit may be implicit (empty string)
      parts.push(thousandsPart + this.thousandWord)
    }

    // Hundreds (百)
    if (hundreds > 0n) {
      const hundredsPart = this.myriadDigitToWords(hundreds, 'hundred', scaleIndex)
      parts.push(hundredsPart + this.hundredWord)
    }

    // Tens (十)
    if (tens > 0n) {
      const tensPart = this.myriadDigitToWords(tens, 'ten', scaleIndex)
      parts.push(tensPart + this.tenWord)
    }

    // Ones
    if (ones > 0n) {
      parts.push(this.onesWords[ones])
    }

    return this.combineMyriadParts(parts, segment, scaleIndex)
  }

  /**
   * Converts a single digit for myriad mode.
   *
   * Subclasses may override for implicit "one" rules.
   * For example, Korean omits "일" (one) before scale words ≤ 만.
   *
   * @protected
   * @param {bigint} digit The digit (1-9).
   * @param {string} position The position: 'thousand', 'hundred', or 'ten'.
   * @param {number} scaleIndex The scale level.
   * @returns {string} The digit word, or empty string if implicit.
   */
  myriadDigitToWords (digit, position, scaleIndex) {
    return this.onesWords[digit]
  }

  /**
   * Combines parts of a myriad segment.
   *
   * By default, concatenates without spaces (East Asian style).
   * Subclasses may override for different joining rules.
   *
   * @protected
   * @param {string[]} parts The segment parts.
   * @param {bigint} segment The original segment value.
   * @param {number} scaleIndex The scale level.
   * @returns {string} Combined segment words.
   */
  combineMyriadParts (parts, segment, scaleIndex) {
    return parts.join('')
  }
}
