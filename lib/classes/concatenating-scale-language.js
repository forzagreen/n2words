import { ScaleLanguage } from './scale-language.js'
import { placeValues } from '../utils/segment-utils.js'

/**
 * Concatenating scale language converter.
 *
 * Extends ScaleLanguage for languages that join number words without spaces
 * and may apply phonetic transformations after concatenation.
 *
 * Used by: Italian (and potentially other languages with similar patterns)
 *
 * Features:
 * - Concatenation without spaces within segments (e.g., "ventotto" not "venti otto")
 * - Phonetic transformation rules (vowel elision, etc.)
 * - Post-processing hook for final transformations (accentuation, etc.)
 * - Scale connector word between scale and remainder (e.g., "e" in "un milione e uno")
 * - Singular/plural thousand alternation (e.g., "mille" vs "mila")
 *
 * @abstract
 * @extends ScaleLanguage
 */
export class ConcatenatingScaleLanguage extends ScaleLanguage {
  // ============================================================================
  // Configuration Properties
  // ============================================================================

  /**
   * Phonetic transformation rules applied after concatenation.
   * Maps patterns to their replacements.
   * Applied in order, so order may matter for overlapping patterns.
   *
   * Example for Italian: { 'oo': 'o', 'ao': 'o', 'io': 'o', 'au': 'u', 'iu': 'u' }
   *
   * @type {Object.<string, string>}
   */
  phoneticRules = {}

  /**
   * Connector word inserted between scale word and smaller remainder.
   * For Italian: "e" (as in "un milione e uno").
   * Set to empty string to disable.
   *
   * @type {string}
   */
  scaleConnector = ''

  /**
   * Singular form of "thousand" (used when multiplier is 1).
   * For Italian: "mille".
   *
   * @type {string}
   */
  thousandSingular = ''

  /**
   * Plural suffix or word for "thousand" (used when multiplier > 1).
   * For Italian: "mila" (appended as suffix to multiplier).
   *
   * @type {string}
   */
  thousandPlural = ''

  /**
   * Whether thousandPlural is a suffix (true) or separate word (false).
   * For Italian: true ("duemila" not "due mila").
   *
   * @type {boolean}
   */
  thousandPluralIsSuffix = true

  // ============================================================================
  // Phonetic Processing
  // ============================================================================

  /**
   * Applies phonetic transformation rules to a string.
   *
   * @param {string} str The string to transform.
   * @returns {string} The transformed string.
   */
  applyPhoneticRules (str) {
    let result = str
    for (const [pattern, replacement] of Object.entries(this.phoneticRules)) {
      result = result.replaceAll(pattern, replacement)
    }
    return result
  }

  /**
   * Post-processes the final output string.
   * Override in subclasses for language-specific transformations (e.g., accentuation).
   *
   * @param {string} str The string to post-process.
   * @returns {string} The post-processed string.
   */
  postProcess (str) {
    return str
  }

  // ============================================================================
  // Override ScaleLanguage Methods
  // ============================================================================

  /**
   * Converts a 3-digit segment (0-999) to words with concatenation.
   *
   * @protected
   * @param {bigint} segment The segment value (0-999).
   * @param {number} scaleIndex The scale level (0 = ones, 1 = thousands, etc.).
   * @returns {string} The segment in words (concatenated).
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
        parts.push(this.tensToWords(tens, scaleIndex))
      }
      if (ones > 0n) {
        parts.push(this.onesToWords(ones, scaleIndex, tens))
      }
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Converts a tens digit to its word.
   * Override in subclasses for dynamic tens generation.
   *
   * @protected
   * @param {bigint} tens The tens digit (2-9).
   * @param {number} scaleIndex The scale level.
   * @returns {string} The tens word.
   */
  tensToWords (tens, scaleIndex) {
    return this.tensWords[tens]
  }

  /**
   * Combines segment parts by concatenation and applies phonetic rules.
   *
   * @protected
   * @param {string[]} parts The segment parts.
   * @param {bigint} segment The original segment value.
   * @param {number} scaleIndex The scale level.
   * @returns {string} Combined segment words (concatenated).
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    // Concatenate without spaces
    const concatenated = parts.join('')
    // Apply phonetic transformations
    return this.applyPhoneticRules(concatenated)
  }

  /**
   * Handles thousand scale specially with singular/plural forms.
   *
   * @protected
   * @param {number} scaleIndex The scale level.
   * @param {bigint} segment The segment value.
   * @param {string} segmentWords The segment converted to words.
   * @returns {string} The segment with thousand word/suffix.
   */
  thousandToWords (segment, segmentWords) {
    if (segment === 1n) {
      return this.thousandSingular
    }

    if (this.thousandPluralIsSuffix) {
      // Append plural as suffix (e.g., "duemila")
      return this.applyPhoneticRules(segmentWords + this.thousandPlural)
    }

    // Separate word (e.g., "dos mil")
    return `${segmentWords} ${this.thousandPlural}`
  }

  /**
   * Converts integer to words with post-processing.
   *
   * @param {bigint} integerPart The integer to convert.
   * @returns {string} The number in words.
   */
  integerToWords (integerPart) {
    const result = this.buildIntegerWords(integerPart)
    return this.postProcess(result)
  }

  /**
   * Builds integer words before post-processing.
   * Handles the special thousand pattern and scale connectors.
   *
   * @protected
   * @param {bigint} integerPart The integer to convert.
   * @returns {string} The number in words (before post-processing).
   */
  buildIntegerWords (integerPart) {
    if (integerPart === 0n) {
      return this.zeroWord
    }

    // For numbers < 1000, use simple segment conversion
    if (integerPart < 1000n) {
      return this.segmentToWords(integerPart, 0)
    }

    // For numbers >= 1000, need special handling
    const parts = []
    let remaining = integerPart

    // Process from largest scale down
    const str = integerPart.toString()
    const numSegments = Math.ceil(str.length / 3)

    // Calculate scale positions
    let scaleIndex = numSegments - 1

    while (remaining > 0n) {
      const divisor = 1000n ** BigInt(scaleIndex)
      const segment = remaining / divisor
      remaining = remaining % divisor

      if (segment > 0n) {
        if (scaleIndex === 1) {
          // Thousands - use special singular/plural handling
          const segmentWords = this.segmentToWords(segment, scaleIndex)
          parts.push(this.thousandToWords(segment, segmentWords))
        } else if (scaleIndex > 1) {
          // Millions and above
          const segmentWords = this.segmentToWords(segment, scaleIndex)
          const scaleWord = this.scaleWordForIndex(scaleIndex, segment)
          if (segmentWords && scaleWord) {
            parts.push(`${segmentWords} ${scaleWord}`)
          } else if (segmentWords) {
            parts.push(segmentWords)
          }
        } else {
          // Ones segment (scaleIndex === 0)
          const segmentWords = this.segmentToWords(segment, scaleIndex)
          if (segmentWords) {
            parts.push(segmentWords)
          }
        }
      }

      scaleIndex--
    }

    return this.joinSegmentsWithConnector(parts, integerPart)
  }

  /**
   * Joins segments with appropriate connectors.
   * Inserts scaleConnector between scale words and final segment when appropriate.
   *
   * @protected
   * @param {string[]} parts The converted segment parts.
   * @param {bigint} integerPart The original integer.
   * @returns {string} The joined string.
   */
  joinSegmentsWithConnector (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    // If we have a scale connector and the last part is "small" (no spaces),
    // insert the connector before it
    if (this.scaleConnector && parts.length >= 2) {
      const lastPart = parts[parts.length - 1]
      // Check if last part is a "simple" number (no scale word in it)
      // This is typically when it doesn't contain a space
      if (!lastPart.includes(' ')) {
        const allButLast = parts.slice(0, -1)
        return `${allButLast.join(' ')} ${this.scaleConnector} ${lastPart}`
      }
    }

    return parts.join(' ')
  }
}
