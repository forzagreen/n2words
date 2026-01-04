import { AbstractLanguage } from './abstract-language.js'
import { groupByFours, placeValuesFour } from '../utils/segment-utils.js'

/**
 * Myriad-based language converter.
 *
 * Uses 4-digit (万-based) grouping for East Asian number systems.
 * Groups by 10,000 rather than 1,000.
 *
 * Used by: Chinese, Japanese, Korean
 *
 * Scale pattern (powers of 10,000):
 * - 10^4: scaleWords[0] (万/만)
 * - 10^8: scaleWords[1] (亿/억)
 * - 10^12: scaleWords[2] (兆/조)
 * - 10^16: scaleWords[3] (京/경)
 *
 * Internal structure (within each 4-digit segment):
 * - 千/천 (thousand)
 * - 百/백 (hundred)
 * - 十/십 (ten)
 * - ones digit
 *
 * @abstract
 * @extends AbstractLanguage
 */
export class MyriadLanguage extends AbstractLanguage {
  /**
   * Words for digits 1-9.
   * @type {Object.<number, string>}
   */
  onesWords = {}

  /**
   * Word for "ten" within segments.
   * @type {string}
   */
  tenWord = ''

  /**
   * Word for "hundred" within segments.
   * @type {string}
   */
  hundredWord = ''

  /**
   * Word for "thousand" within segments.
   * @type {string}
   */
  thousandWord = ''

  /**
   * Scale words for powers of 10,000.
   * Index 0 = 万/만, 1 = 亿/억, 2 = 兆/조, etc.
   * @type {string[]}
   */
  scaleWords = []

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

    const segments = groupByFours(integerPart.toString())
    const parts = []
    let scaleIndex = segments.length - 1

    for (const segment of segments) {
      if (segment !== 0n) {
        const segmentWords = this.segmentToWords(segment, scaleIndex)
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
   * Converts a 4-digit segment (0-9999) to words.
   *
   * Uses internal structure: 千百十 (thousands, hundreds, tens)
   * Subclasses may override for language-specific handling.
   *
   * @protected
   * @param {bigint} segment The segment value (0-9999).
   * @param {number} scaleIndex The scale level (0 = ones, 1 = 万, 2 = 亿, etc.).
   * @returns {string} The segment in words.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const [ones, tens, hundreds, thousands] = placeValuesFour(segment)
    const parts = []

    // Thousands (千)
    if (thousands > 0n) {
      const thousandsPart = this.digitToWords(thousands, 'thousand', scaleIndex)
      // Always add scale word; digit may be implicit (empty string)
      parts.push(thousandsPart + this.thousandWord)
    }

    // Hundreds (百)
    if (hundreds > 0n) {
      const hundredsPart = this.digitToWords(hundreds, 'hundred', scaleIndex)
      parts.push(hundredsPart + this.hundredWord)
    }

    // Tens (十)
    if (tens > 0n) {
      const tensPart = this.digitToWords(tens, 'ten', scaleIndex)
      parts.push(tensPart + this.tenWord)
    }

    // Ones
    if (ones > 0n) {
      parts.push(this.onesWords[ones])
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Converts a single digit to words.
   *
   * Subclasses may override for implicit "one" rules.
   * For example, Korean omits "일" (one) before scale words.
   *
   * @protected
   * @param {bigint} digit The digit (1-9).
   * @param {string} position The position: 'thousand', 'hundred', or 'ten'.
   * @param {number} scaleIndex The scale level.
   * @returns {string} The digit word, or empty string if implicit.
   */
  digitToWords (digit, position, scaleIndex) {
    return this.onesWords[digit]
  }

  /**
   * Combines parts of a segment.
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
  combineSegmentParts (parts, segment, scaleIndex) {
    return parts.join('')
  }

  /**
   * Joins all segment parts into the final string.
   *
   * By default, concatenates without spaces.
   * Subclasses may override for custom joining rules.
   *
   * @protected
   * @param {string[]} parts The converted segment parts.
   * @param {bigint} integerPart The original integer (for context).
   * @returns {string} The final joined string.
   */
  joinSegments (parts, integerPart) {
    return parts.join('')
  }
}
