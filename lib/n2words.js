/**
 * n2words - Convert numbers to words in multiple languages
 *
 * This file is the main entry point for the n2words library.
 * It exports converter functions for all supported languages.
 *
 * ## For Contributors
 *
 * When adding a new language, this file must be updated in THREE sections:
 * 1. Language Imports - Add import statement (alphabetically sorted)
 * 2. Language Converters - Create converter with makeConverter() (alphabetically sorted)
 * 3. Exports - Add to export list (alphabetically sorted)
 *
 * Use the scaffolding tool to automate this process:
 *   npm run lang:add <language-code>
 *
 * ## Public API Structure
 *
 * Each language exports a converter function:
 *   - Name: `{LanguageName}Converter` (e.g., EnglishConverter, SpanishConverter)
 *   - Signature: `(value: NumericValue, options?: Options) => string`
 *   - Input: number, bigint, or string (numeric strings only)
 *   - Output: Words representing the number in the target language
 *
 * Languages without options use signature: `(value: NumericValue) => string`
 * Languages with options define a typedef (e.g., ArabicOptions) and use: `(value: NumericValue, options?: ArabicOptions) => string`
 *
 * @module n2words
 */

// ============================================================================
// Language Imports
// ============================================================================

import { Arabic } from './languages/ar.js'
import { Azerbaijani } from './languages/az.js'
import { Bangla } from './languages/bn.js'
import { Czech } from './languages/cs.js'
import { Danish } from './languages/da.js'
import { German } from './languages/de.js'
import { Greek } from './languages/el.js'
import { English } from './languages/en.js'
import { Spanish } from './languages/es.js'
import { Persian } from './languages/fa.js'
import { Filipino } from './languages/fil.js'
import { French } from './languages/fr.js'
import { FrenchBelgium } from './languages/fr-BE.js'
import { Gujarati } from './languages/gu.js'
import { Hebrew } from './languages/he.js'
import { BiblicalHebrew } from './languages/hbo.js'
import { Hindi } from './languages/hi.js'
import { Croatian } from './languages/hr.js'
import { Hungarian } from './languages/hu.js'
import { Indonesian } from './languages/id.js'
import { Italian } from './languages/it.js'
import { Japanese } from './languages/ja.js'
import { Kannada } from './languages/kn.js'
import { Korean } from './languages/ko.js'
import { Lithuanian } from './languages/lt.js'
import { Latvian } from './languages/lv.js'
import { Marathi } from './languages/mr.js'
import { Malay } from './languages/ms.js'
import { Dutch } from './languages/nl.js'
import { NorwegianBokmal } from './languages/nb.js'
import { Punjabi } from './languages/pa.js'
import { Polish } from './languages/pl.js'
import { Portuguese } from './languages/pt.js'
import { Romanian } from './languages/ro.js'
import { Russian } from './languages/ru.js'
import { SerbianCyrillic } from './languages/sr-Cyrl.js'
import { SerbianLatin } from './languages/sr-Latn.js'
import { Swedish } from './languages/sv.js'
import { Swahili } from './languages/sw.js'
import { Tamil } from './languages/ta.js'
import { Telugu } from './languages/te.js'
import { Thai } from './languages/th.js'
import { Turkish } from './languages/tr.js'
import { Ukrainian } from './languages/uk.js'
import { Urdu } from './languages/ur.js'
import { Vietnamese } from './languages/vi.js'
import { SimplifiedChinese } from './languages/zh-Hans.js'
import { TraditionalChinese } from './languages/zh-Hant.js'

// ============================================================================
// Type Definitions
// ============================================================================
//
// This section defines TypeScript-compatible JSDoc types for:
// - NumericValue: The input types accepted by all converters
// - {Language}Options: Optional configuration for languages that support it
//
// Keep options typedefs alphabetically sorted for maintainability.
// ============================================================================

/**
 * Numeric value that can be converted to words.
 * Accepts number, bigint, or numeric string representations.
 * @typedef {number | bigint | string} NumericValue
 */

/**
 * @typedef {Object} ArabicOptions
 * @property {string} [negativeWord] Word for negative numbers
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} BiblicalHebrewOptions
 * @property {string} [andWord='ו'] Conjunction character (typically 'ו' for and)
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} CroatianOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} CzechOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} DanishOptions
 * @property {boolean} [ordFlag=false] Enable ordinal number conversion
 */

/**
 * @typedef {Object} DutchOptions
 * @property {boolean} [includeOptionalAnd=false] Include optional "en" separator
 * @property {boolean} [noHundredPairs=false] Disable comma before hundreds
 * @property {boolean} [accentOne=true] Use accented "één" for one
 */

/**
 * @typedef {Object} FrenchOptions
 * @property {boolean} [withHyphenSeparator=false] Use hyphens (true) instead of spaces (false) in compounds
 */

/**
 * @typedef {Object} FrenchBelgiumOptions
 * @property {boolean} [withHyphenSeparator=false] Use hyphens (true) instead of spaces (false) in compounds
 */

/**
 * @typedef {Object} HebrewOptions
 * @property {string} [andWord='ו'] Conjunction character (typically 'ו' for and)
 */

/**
 * @typedef {Object} LatvianOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} LithuanianOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} PolishOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} RomanianOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} RussianOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} SerbianCyrillicOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} SerbianLatinOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} SimplifiedChineseOptions
 * @property {boolean} [formal=true] Use formal/financial numerals (壹贰叁) vs. common numerals (一二三)
 */

/**
 * @typedef {Object} SpanishOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

/**
 * @typedef {Object} TraditionalChineseOptions
 * @property {boolean} [formal=true] Use formal/financial numerals (壹貳參) vs. common numerals (一二三)
 */

/**
 * @typedef {Object} TurkishOptions
 * @property {boolean} [dropSpaces=false] Remove spaces between words if true
 */

/**
 * @typedef {Object} UkrainianOptions
 * @property {('masculine'|'feminine')} [gender='masculine'] Grammatical gender for number forms
 */

// ============================================================================
// Converter Factory
// ============================================================================
//
// makeConverter() is a factory function that creates converter functions from
// language classes. It provides a consistent functional API for all languages:
//
//   const result = EnglishConverter(42)                      // "forty-two"
//   const result = ArabicConverter(1, {gender: 'feminine'})  // "واحدة"
//
// This design:
// - Hides class instantiation details from public API
// - Ensures each conversion uses a fresh instance
// - Maintains immutability (no shared state between conversions)
// ============================================================================

/**
 * Creates a converter function for a language class.
 *
 * This factory handles all input validation and normalization at the public API
 * boundary, then delegates to the language class with pre-processed data.
 *
 * @template {Object} [TOptions={}]
 * @param {new (options?: TOptions) => { convert: (isNegative: boolean, wholeNumber: bigint, decimalPart?: string) => string }} LanguageClass - Language class constructor
 * @returns {(value: NumericValue, options?: TOptions) => string} Converter function
 */
function makeConverter (LanguageClass) {
  /**
   * @param {NumericValue} value
   * @param {TOptions} [options]
   * @returns {string}
   */
  return function convertToWords (value, options) {
    if (options !== undefined && !isPlainObject(options)) {
      throw new TypeError('options must be a plain object if provided')
    }

    const { isNegative, wholeNumber, decimalPart } = parseNumericValue(value)
    return new LanguageClass(options).toWords(isNegative, wholeNumber, decimalPart)
  }
}

// ============================================================================
// Input Parsing Utilities
// ============================================================================

/**
 * @typedef {Object} ParsedNumericValue
 * @property {boolean} isNegative - Whether the value is negative
 * @property {bigint} wholeNumber - The absolute whole number part
 * @property {string} [decimalPart] - The decimal digits (without the point)
 */

/**
 * Parses and validates a numeric value into its components.
 * Handles number, string, and bigint inputs uniformly.
 *
 * @param {NumericValue} value - The value to parse
 * @returns {ParsedNumericValue} The parsed components
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 */
function parseNumericValue (value) {
  const type = typeof value

  // BigInt: simplest case - no decimals, no scientific notation
  if (type === 'bigint') {
    return value < 0n
      ? { isNegative: true, wholeNumber: -value }
      : { isNegative: false, wholeNumber: value }
  }

  // Reject invalid types early
  if (type !== 'number' && type !== 'string') {
    throw new TypeError(
      `Invalid value type: expected number, string, or bigint, received ${type}`
    )
  }

  // Convert to normalized string
  const str = type === 'number'
    ? numberToString(value)
    : stringToNormalizedForm(value)

  return parseNumericString(str)
}

/**
 * Converts a JavaScript number to a decimal string.
 * Handles special cases: Infinity, NaN, and scientific notation.
 *
 * @param {number} value - The number to convert
 * @returns {string} Decimal string representation
 * @throws {Error} If value is not finite
 */
function numberToString (value) {
  if (!Number.isFinite(value)) {
    throw new Error('Number must be finite (NaN and Infinity are not supported)')
  }

  const str = value.toString()

  // Expand scientific notation (used for values >= 1e21 or < 1e-6)
  if (str.includes('e') || str.includes('E')) {
    return expandScientificNotation(str)
  }

  return str
}

/**
 * Validates and normalizes a string numeric input.
 *
 * @param {string} value - The string to validate
 * @returns {string} Trimmed and validated string
 * @throws {Error} If string is empty or not a valid number format
 */
function stringToNormalizedForm (value) {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    throw new Error(`Invalid number format: "${value}"`)
  }

  // Validate by attempting conversion (handles edge cases like "1e21", "-.5", etc.)
  if (Number.isNaN(Number(trimmed))) {
    throw new Error(`Invalid number format: "${value}"`)
  }

  // Expand scientific notation if present
  if (trimmed.includes('e') || trimmed.includes('E')) {
    return expandScientificNotation(trimmed)
  }

  return trimmed
}

/**
 * Parses a normalized numeric string into its components.
 *
 * @param {string} str - A normalized decimal string (no scientific notation)
 * @returns {ParsedNumericValue} The parsed components
 */
function parseNumericString (str) {
  // Extract sign
  const isNegative = str[0] === '-'
  if (isNegative) {
    str = str.slice(1)
  }

  // Split into whole and decimal parts
  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return { isNegative, wholeNumber: BigInt(str) }
  }

  const wholePart = str.slice(0, dotIndex) || '0'
  const decimalPart = str.slice(dotIndex + 1)

  return { isNegative, wholeNumber: BigInt(wholePart), decimalPart }
}

/**
 * Expands scientific notation to decimal form.
 * JavaScript uses scientific notation for values >= 1e21 or < 1e-6.
 *
 * @param {string} str - String possibly in scientific notation (e.g., "1e+21")
 * @returns {string} Decimal form (e.g., "1000000000000000000000")
 */
function expandScientificNotation (str) {
  const [mantissa, expStr] = str.toLowerCase().split('e')
  const exp = parseInt(expStr, 10)

  // Extract digits and determine original decimal position
  const dotIndex = mantissa.indexOf('.')
  const digits = dotIndex === -1
    ? mantissa
    : mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1)
  const integerLength = dotIndex === -1 ? mantissa.length : dotIndex

  // Calculate new decimal position after applying exponent
  const newDotPosition = integerLength + exp

  if (newDotPosition >= digits.length) {
    // Pure integer: pad with trailing zeros
    return digits + '0'.repeat(newDotPosition - digits.length)
  }

  if (newDotPosition <= 0) {
    // Pure decimal: pad with leading zeros after decimal point
    return '0.' + '0'.repeat(-newDotPosition) + digits
  }

  // Mixed: insert decimal point at new position
  return digits.slice(0, newDotPosition) + '.' + digits.slice(newDotPosition)
}

/**
 * Checks if a value is a plain object (not null, array, or other object types).
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a plain object
 */
function isPlainObject (value) {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

// ============================================================================
// Language Converters
// ============================================================================
//
// Each converter is created using makeConverter() with explicit type annotations.
//
// Pattern for languages WITHOUT options:
//   const LanguageConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Language))
//
// Pattern for languages WITH options:
//   const LanguageConverter = /** @type {(value: NumericValue, options?: LanguageOptions) => string} */ (makeConverter(Language))
//
// IMPORTANT: Keep converters alphabetically sorted by converter name.
// ============================================================================

const ArabicConverter = /** @type {(value: NumericValue, options?: ArabicOptions) => string} */ (makeConverter(Arabic))
const AzerbaijaniConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Azerbaijani))
const BanglaConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Bangla))
const BiblicalHebrewConverter = /** @type {(value: NumericValue, options?: BiblicalHebrewOptions) => string} */ (makeConverter(BiblicalHebrew))
const CroatianConverter = /** @type {(value: NumericValue, options?: CroatianOptions) => string} */ (makeConverter(Croatian))
const CzechConverter = /** @type {(value: NumericValue, options?: CzechOptions) => string} */ (makeConverter(Czech))
const DanishConverter = /** @type {(value: NumericValue, options?: DanishOptions) => string} */ (makeConverter(Danish))
const DutchConverter = /** @type {(value: NumericValue, options?: DutchOptions) => string} */ (makeConverter(Dutch))
const EnglishConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(English))
const FilipinoConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Filipino))
const FrenchConverter = /** @type {(value: NumericValue, options?: FrenchOptions) => string} */ (makeConverter(French))
const FrenchBelgiumConverter = /** @type {(value: NumericValue, options?: FrenchBelgiumOptions) => string} */ (makeConverter(FrenchBelgium))
const GermanConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(German))
const GreekConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Greek))
const GujaratiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Gujarati))
const HebrewConverter = /** @type {(value: NumericValue, options?: HebrewOptions) => string} */ (makeConverter(Hebrew))
const HindiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Hindi))
const HungarianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Hungarian))
const IndonesianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Indonesian))
const ItalianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Italian))
const JapaneseConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Japanese))
const KannadaConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Kannada))
const KoreanConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Korean))
const LatvianConverter = /** @type {(value: NumericValue, options?: LatvianOptions) => string} */ (makeConverter(Latvian))
const LithuanianConverter = /** @type {(value: NumericValue, options?: LithuanianOptions) => string} */ (makeConverter(Lithuanian))
const MalayConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Malay))
const MarathiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Marathi))
const NorwegianBokmalConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(NorwegianBokmal))
const PersianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Persian))
const PolishConverter = /** @type {(value: NumericValue, options?: PolishOptions) => string} */ (makeConverter(Polish))
const PortugueseConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Portuguese))
const PunjabiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Punjabi))
const RomanianConverter = /** @type {(value: NumericValue, options?: RomanianOptions) => string} */ (makeConverter(Romanian))
const RussianConverter = /** @type {(value: NumericValue, options?: RussianOptions) => string} */ (makeConverter(Russian))
const SerbianCyrillicConverter = /** @type {(value: NumericValue, options?: SerbianCyrillicOptions) => string} */ (makeConverter(SerbianCyrillic))
const SerbianLatinConverter = /** @type {(value: NumericValue, options?: SerbianLatinOptions) => string} */ (makeConverter(SerbianLatin))
const SimplifiedChineseConverter = /** @type {(value: NumericValue, options?: SimplifiedChineseOptions) => string} */ (makeConverter(SimplifiedChinese))
const SpanishConverter = /** @type {(value: NumericValue, options?: SpanishOptions) => string} */ (makeConverter(Spanish))
const SwahiliConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Swahili))
const SwedishConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Swedish))
const TamilConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Tamil))
const TeluguConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Telugu))
const ThaiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Thai))
const TraditionalChineseConverter = /** @type {(value: NumericValue, options?: TraditionalChineseOptions) => string} */ (makeConverter(TraditionalChinese))
const TurkishConverter = /** @type {(value: NumericValue, options?: TurkishOptions) => string} */ (makeConverter(Turkish))
const UkrainianConverter = /** @type {(value: NumericValue, options?: UkrainianOptions) => string} */ (makeConverter(Ukrainian))
const UrduConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Urdu))
const VietnameseConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Vietnamese))

// ============================================================================
// Exports
// ============================================================================
//
// All converter functions are exported for public use.
//
// IMPORTANT: Keep exports alphabetically sorted for maintainability.
// ============================================================================

export {
  ArabicConverter,
  AzerbaijaniConverter,
  BanglaConverter,
  BiblicalHebrewConverter,
  CroatianConverter,
  CzechConverter,
  DanishConverter,
  DutchConverter,
  EnglishConverter,
  FilipinoConverter,
  FrenchConverter,
  FrenchBelgiumConverter,
  GermanConverter,
  GreekConverter,
  GujaratiConverter,
  HebrewConverter,
  HindiConverter,
  HungarianConverter,
  IndonesianConverter,
  ItalianConverter,
  JapaneseConverter,
  KannadaConverter,
  KoreanConverter,
  LatvianConverter,
  LithuanianConverter,
  MalayConverter,
  MarathiConverter,
  NorwegianBokmalConverter,
  PersianConverter,
  PolishConverter,
  PortugueseConverter,
  PunjabiConverter,
  RomanianConverter,
  RussianConverter,
  SerbianCyrillicConverter,
  SerbianLatinConverter,
  SimplifiedChineseConverter,
  SpanishConverter,
  SwahiliConverter,
  SwedishConverter,
  TamilConverter,
  TeluguConverter,
  ThaiConverter,
  TraditionalChineseConverter,
  TurkishConverter,
  UkrainianConverter,
  UrduConverter,
  VietnameseConverter
}
