import { ScaleLanguage } from './scale-language.js'

/**
 * Inflected scale language converter.
 *
 * Extends ScaleLanguage for languages with grammatical inflection:
 * - Multi-form pluralization (singular/few/many) via `pluralForms`
 * - Gender-aware number forms (masculine/feminine for 1-9)
 * - Per-scale gender control via `scaleGenders`
 *
 * Used by: Slavic languages (Russian, Czech, Polish, Ukrainian, Serbian, Croatian),
 * Baltic languages (Latvian, Lithuanian).
 *
 * Subclasses MUST define these properties with language-specific vocabulary:
 * - `onesWords` - Object mapping 1-9 to masculine forms (or default forms)
 * - `onesFeminineWords` - Object mapping 1-9 to feminine forms (if gender distinction exists)
 * - `teensWords` - Object mapping 0-9 to teen numbers (10-19)
 * - `tensWords` - Object mapping 2-9 to tens (20-90)
 * - `hundredsWords` - Object mapping 1-9 to hundreds (100-900)
 * - `pluralForms` - Object mapping segment indices to [singular, few, many] plural forms
 *
 * Optional properties:
 * - `scaleGenders` - Object mapping segment indices to boolean (true = feminine scale word)
 *   Languages with feminine thousands (Russian, Ukrainian, Serbian, Croatian) should set `{ 1: true }`.
 *
 * @abstract
 * @extends ScaleLanguage
 */
export class InflectedScaleLanguage extends ScaleLanguage {
  // ============================================================================
  // Required Properties (subclasses must define)
  // ============================================================================

  /**
   * Feminine forms for digits 1-9 (if language has gender distinction).
   *
   * @type {Object.<number, string>}
   */
  onesFeminineWords = {}

  /**
   * Plural forms for scale words (thousands, millions, billions, etc.).
   * Maps segment indices to [singular, few, many] forms.
   *
   * @type {Object.<number, string[]>}
   */
  pluralForms = {}

  // ============================================================================
  // Optional Properties (subclasses may override)
  // ============================================================================

  /**
   * Gender of each scale word.
   * Maps segment indices to boolean: true = feminine, false = masculine.
   * Default is empty (all masculine). Languages with feminine thousands
   * (Russian, Ukrainian, Serbian, Croatian) should set `{ 1: true }`.
   *
   * @type {Object.<number, boolean>}
   */
  scaleGenders = {}

  // ============================================================================
  // Constructor
  // ============================================================================

  /**
   * Constructs an InflectedScaleLanguage instance with optional configuration.
   *
   * @param {Object} [options] Configuration options.
   * @param {('masculine'|'feminine')} [options.gender='masculine'] Grammatical gender for number forms.
   */
  constructor (options = {}) {
    super()

    this.setOptions({
      gender: 'masculine'
    }, options)
  }

  // ============================================================================
  // Protected Methods (override ScaleLanguage)
  // ============================================================================

  /**
   * Converts a ones digit to words with gender support.
   *
   * Uses feminine forms when:
   * - The scale word is feminine (e.g., Russian thousands)
   * - User requested feminine gender for the ones segment
   *
   * @protected
   * @param {bigint} ones The ones digit (1-9).
   * @param {number} scaleIndex The scale level.
   * @param {bigint} tens The tens digit (for context).
   * @returns {string} The ones word.
   */
  onesToWords (ones, scaleIndex, tens) {
    const isScaleFeminine = this.scaleGenders[scaleIndex] === true
    const isFeminine = isScaleFeminine || (this.options.gender === 'feminine' && scaleIndex === 0)
    const onesArray = isFeminine ? this.onesFeminineWords : this.onesWords
    return onesArray[ones]
  }

  /**
   * Gets the scale word for a given index with three-form pluralization.
   *
   * Uses `pluralForms` instead of `scaleWords` to support singular/few/many forms.
   *
   * @protected
   * @param {number} scaleIndex The scale level (1 = thousand, 2 = million, etc.).
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The pluralized scale word.
   */
  scaleWordForIndex (scaleIndex, segment) {
    const forms = this.pluralForms[scaleIndex]
    if (!forms) return ''
    return this.pluralize(segment, forms)
  }

  /**
   * Converts a 3-digit segment to words.
   *
   * Handles omitOneBeforeScale at the segment level (before scale word is added).
   *
   * @protected
   * @param {bigint} segment The segment value (0-999).
   * @param {number} scaleIndex The scale level.
   * @returns {string} The segment in words.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds
    if (hundreds > 0n) {
      parts.push(this.hundredsWords[hundreds])
    }

    // Tens
    if (tens > 1n) {
      parts.push(this.tensWords[tens])
    }

    // Teens or ones
    if (tens === 1n) {
      parts.push(this.teensWords[ones])
    } else if (ones > 0n) {
      // Skip "one" before scale words if omitOneBeforeScale is set
      const shouldOmitOne = this.omitOneBeforeScale && scaleIndex > 0 && segment === 1n

      if (!shouldOmitOne) {
        parts.push(this.onesToWords(ones, scaleIndex, tens))
      }
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Selects the correct plural form based on inflection rules.
   *
   * Default implementation uses Slavic-style three-form pluralization:
   * - Singular: for 1, 21, 31, 41, etc. (ends in 1, except 11)
   * - Few: for 2-4, 22-24, 32-34, etc. (ends in 2-4, except 12-14)
   * - Many: for 0, 5-20, 25-30, etc. (everything else)
   *
   * Subclasses may override for language-specific variations (e.g., Baltic languages).
   *
   * @param {bigint} n The number to check.
   * @param {string[]} forms Array of [singular, few, many] forms.
   * @returns {string} The appropriate form for the number.
   */
  pluralize (n, forms) {
    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    // 11-19 are always "many" form
    if (lastTwoDigits >= 11n && lastTwoDigits <= 19n) {
      return forms[2]
    }

    // 1, 21, 31, etc. → singular
    if (lastDigit === 1n) {
      return forms[0]
    }

    // 2-4, 22-24, 32-34, etc. → few
    if (lastDigit >= 2n && lastDigit <= 4n) {
      return forms[1]
    }

    // 0, 5-9, 10, 20, 25-30, etc. → many
    return forms[2]
  }
}
