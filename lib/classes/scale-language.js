import { AbstractLanguage } from './abstract-language.js'
import { groupByThrees, placeValues } from '../utils/segment-utils.js'

/**
 * Scale-based language converter.
 *
 * Uses segment-based decomposition for high performance with simple scale pattern
 * where each power of 1000 has a unique word.
 *
 * Used by: English, German, Swedish, Dutch, French, Spanish, Portuguese,
 * Slavic languages, Baltic languages, and other Western languages.
 *
 * Scale patterns supported:
 * 1. Short scale (default): 10^3=thousand, 10^6=million, 10^9=billion
 * 2. Compound scale (useCompoundScale=true): 10^9="thousand million"
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
  // Compound Scale Support (Long Scale)
  // ============================================================================

  /**
   * Whether to use compound scale pattern (European long scale).
   *
   * When true, odd indices > 1 use "thousand + previous scale" pattern:
   * - Index 1: thousandWord (thousand)
   * - Index 2: scaleWords[0] (million, 10^6)
   * - Index 3: thousandWord + scaleWords[0] (thousand million, 10^9)
   * - Index 4: scaleWords[1] (billion, 10^12)
   * - Index 5: thousandWord + scaleWords[1] (thousand billion, 10^15)
   *
   * Used by: Portuguese, Spanish
   * @type {boolean}
   */
  useCompoundScale = false

  // ============================================================================
  // Inflection Support (for Slavic/Baltic languages)
  // ============================================================================

  /**
   * Feminine forms for digits 1-9 (if language has gender distinction).
   * When set, enables gender-aware number forms via onesToWords().
   *
   * @type {Object.<number, string>|null}
   */
  onesFeminineWords = null

  /**
   * Plural forms for scale words (thousands, millions, billions, etc.).
   * Maps segment indices to [singular, few, many] forms.
   * When set, replaces scaleWords lookup with pluralize() call.
   *
   * @type {Object.<number, string[]>|null}
   */
  pluralForms = null

  /**
   * Gender of each scale word.
   * Maps segment indices to boolean: true = feminine, false = masculine.
   * Used with onesFeminineWords to select correct gender for ones digit.
   *
   * @type {Object.<number, boolean>}
   */
  scaleGenders = {}

  // ============================================================================
  // Concatenation Support (for Italian and similar languages)
  // ============================================================================

  /**
   * Phonetic transformation rules applied after concatenation.
   * Maps patterns to their replacements.
   * Applied in order via replaceAll().
   *
   * Example for Italian: { 'oo': 'o', 'ao': 'o', 'io': 'o', 'au': 'u', 'iu': 'u' }
   *
   * @type {Object.<string, string>}
   */
  phoneticRules = {}

  /**
   * Singular form of "thousand" (used when multiplier is 1).
   * When set (non-empty), enables special thousand handling.
   * For Italian: "mille".
   *
   * @type {string}
   */
  thousandSingular = ''

  /**
   * Plural form or suffix for "thousand" (used when multiplier > 1).
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

  /**
   * Connector word inserted between scale word and smaller remainder.
   * For Italian: "e" (as in "un milione e uno").
   * Set to empty string to disable.
   *
   * @type {string}
   */
  scaleConnector = ''

  /**
   * Whether to use inflected scale words (pluralForms instead of scaleWords).
   * When true, scaleWordForIndex() uses pluralize() with pluralForms.
   * Automatically enabled when pluralForms is defined.
   *
   * @type {boolean}
   */
  get useInflectedScale () {
    return this.pluralForms !== null && Object.keys(this.pluralForms).length > 0
  }

  // ============================================================================
  // Constructor
  // ============================================================================

  /**
   * Constructs a ScaleLanguage instance with optional configuration.
   *
   * @param {Object} [options] Configuration options.
   * @param {('masculine'|'feminine')} [options.gender='masculine'] Grammatical gender for number forms.
   */
  constructor (options = {}) {
    super()
    this.setOptions({ gender: 'masculine' }, options)
  }

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
   * Supports gender selection when onesFeminineWords is defined:
   * - Uses scaleGenders to determine if scale word is feminine
   * - Uses options.gender for the ones segment (scaleIndex === 0)
   *
   * Subclasses may override for language-specific forms.
   *
   * @protected
   * @param {bigint} ones The ones digit (1-9).
   * @param {number} scaleIndex The scale level.
   * @param {bigint} tens The tens digit (for context).
   * @returns {string} The ones word.
   */
  onesToWords (ones, scaleIndex, tens) {
    // Gender selection when onesFeminineWords is defined
    if (this.onesFeminineWords) {
      const isScaleFeminine = this.scaleGenders[scaleIndex] === true
      const isFeminine = isScaleFeminine || (this.options?.gender === 'feminine' && scaleIndex === 0)
      const onesArray = isFeminine ? this.onesFeminineWords : this.onesWords
      return onesArray[ones]
    }
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
   * Applies phonetic transformation rules to a string.
   * Used by languages that concatenate words (like Italian).
   *
   * @protected
   * @param {string} str The string to transform.
   * @returns {string} The transformed string.
   */
  applyPhoneticRules (str) {
    if (Object.keys(this.phoneticRules).length === 0) {
      return str
    }
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
   * @protected
   * @param {string} str The string to post-process.
   * @returns {string} The post-processed string.
   */
  postProcess (str) {
    return str
  }

  /**
   * Selects the correct plural form based on inflection rules.
   *
   * Default implementation uses Slavic-style three-form pluralization.
   * Subclasses may override for language-specific variations (e.g., Baltic languages).
   *
   * @protected
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

  /**
   * Gets the scale word for a given index.
   *
   * Supports four patterns:
   * 1. Simple: index 1 → scaleWords[0] (thousand)
   * 2. Thousand-separated: thousandWord for index 1, scaleWords offset by one
   * 3. Compound: odd indices > 1 use "thousand + previous scale" pattern
   * 4. Inflected: uses pluralForms with pluralize() for multi-form scales
   *
   * @protected
   * @param {number} scaleIndex The scale level (1 = thousand, 2 = million, etc.).
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The scale word.
   */
  scaleWordForIndex (scaleIndex, segment) {
    // Inflected scale pattern (Slavic/Baltic languages)
    if (this.useInflectedScale) {
      const forms = this.pluralForms[scaleIndex]
      if (!forms) return ''
      return this.pluralize(segment, forms)
    }

    // Compound scale pattern (European long scale)
    if (this.useCompoundScale) {
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

    // Non-compound: if thousandWord is defined, use it for index 1
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
    const oneFeminineWord = this.onesFeminineWords?.[1]
    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // Check if this is "one" (masculine or feminine) followed by a word we should omit before
      if ((part === oneWord || part === oneFeminineWord) && nextPart) {
        if (this.omitOneBeforeHundred && nextPart === this.hundredWord) {
          continue
        }
        if (this.omitOneBeforeThousand && nextPart === this.thousandWord) {
          continue
        }
        if (this.omitOneBeforeScale) {
          // Check against scaleWords array
          if (this.scaleWords.includes(nextPart)) {
            continue
          }
          // Check against pluralForms values (for inflected languages)
          if (this.pluralForms) {
            const isScaleWord = Object.values(this.pluralForms).some(forms =>
              forms.includes(nextPart)
            )
            if (isScaleWord) {
              continue
            }
          }
        }
      }

      result.push(part)
    }

    return result.join(' ')
  }
}
