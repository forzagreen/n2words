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

/**
 * Numeric value that can be converted to words
 * @typedef {number | bigint | string} NumericValue
 */

/**
 * @typedef {Object} ArabicOptions
 * @property {string} [negativeWord] Word for negative numbers
 * @property {boolean} [feminine] Use feminine forms for numbers
 */

/**
 * @typedef {Object} BanglaOptions
 * @property {boolean} [feminine=false] Currently unused in Bangla
 */

/**
 * @typedef {Object} BiblicalHebrewOptions
 * @property {string} [and='ו'] Conjunction character (typically 'ו' for and)
 * @property {boolean} [feminine=false] Use feminine forms for numbers (masculine is Biblical Hebrew default)
 */

/**
 * @typedef {Object} CroatianOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} CzechOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
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
 * @property {string} [and='ו'] Conjunction character (typically 'ו' for and)
 */

/**
 * @typedef {Object} HindiOptions
 * @property {boolean} [feminine=false] Currently unused in Hindi
 */

/**
 * @typedef {Object} LatvianOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} LithuanianOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} PolishOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} RomanianOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} RussianOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} SerbianCyrillicOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} SerbianLatinOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

/**
 * @typedef {Object} SimplifiedChineseOptions
 * @property {boolean} [formal=true] Use formal/financial numerals (壹贰叁) vs. common numerals (一二三)
 */

/**
 * @typedef {Object} SpanishOptions
 * @property {string} [genderStem='o'] Masculine 'o' or feminine 'a' ending
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
 * @property {boolean} [feminine=false] Use feminine forms for numbers
 */

// ============================================================================
// Converter Factory
// ============================================================================

/**
 * Creates a converter function for a language class
 * @template {Object} [TOptions={}]
 * @param {new (options?: TOptions) => { convertToWords: (value: NumericValue) => string }} LanguageClass
 * @returns {(value: NumericValue, options?: TOptions) => string}
 */
function makeConverter (LanguageClass) {
  return function convertToWords (value, options) {
    return new LanguageClass(options).convertToWords(value)
  }
}

// ============================================================================
// Language Converters
// ============================================================================

const ArabicConverter = /** @type {(value: NumericValue, options?: ArabicOptions) => string} */ (makeConverter(Arabic))
const AzerbaijaniConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Azerbaijani))
const BanglaConverter = /** @type {(value: NumericValue, options?: BanglaOptions) => string} */ (makeConverter(Bangla))
const CzechConverter = /** @type {(value: NumericValue, options?: CzechOptions) => string} */ (makeConverter(Czech))
const DanishConverter = /** @type {(value: NumericValue, options?: DanishOptions) => string} */ (makeConverter(Danish))
const GermanConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(German))
const GreekConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Greek))
const EnglishConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(English))
const SpanishConverter = /** @type {(value: NumericValue, options?: SpanishOptions) => string} */ (makeConverter(Spanish))
const PersianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Persian))
const FilipinoConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Filipino))
const FrenchConverter = /** @type {(value: NumericValue, options?: FrenchOptions) => string} */ (makeConverter(French))
const FrenchBelgiumConverter = /** @type {(value: NumericValue, options?: FrenchBelgiumOptions) => string} */ (makeConverter(FrenchBelgium))
const GujaratiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Gujarati))
const HebrewConverter = /** @type {(value: NumericValue, options?: HebrewOptions) => string} */ (makeConverter(Hebrew))
const BiblicalHebrewConverter = /** @type {(value: NumericValue, options?: BiblicalHebrewOptions) => string} */ (makeConverter(BiblicalHebrew))
const HindiConverter = /** @type {(value: NumericValue, options?: HindiOptions) => string} */ (makeConverter(Hindi))
const CroatianConverter = /** @type {(value: NumericValue, options?: CroatianOptions) => string} */ (makeConverter(Croatian))
const HungarianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Hungarian))
const IndonesianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Indonesian))
const ItalianConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Italian))
const JapaneseConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Japanese))
const KannadaConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Kannada))
const KoreanConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Korean))
const LithuanianConverter = /** @type {(value: NumericValue, options?: LithuanianOptions) => string} */ (makeConverter(Lithuanian))
const LatvianConverter = /** @type {(value: NumericValue, options?: LatvianOptions) => string} */ (makeConverter(Latvian))
const MarathiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Marathi))
const MalayConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Malay))
const NorwegianBokmalConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(NorwegianBokmal))
const DutchConverter = /** @type {(value: NumericValue, options?: DutchOptions) => string} */ (makeConverter(Dutch))
const PunjabiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Punjabi))
const PolishConverter = /** @type {(value: NumericValue, options?: PolishOptions) => string} */ (makeConverter(Polish))
const PortugueseConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Portuguese))
const RomanianConverter = /** @type {(value: NumericValue, options?: RomanianOptions) => string} */ (makeConverter(Romanian))
const RussianConverter = /** @type {(value: NumericValue, options?: RussianOptions) => string} */ (makeConverter(Russian))
const SerbianCyrillicConverter = /** @type {(value: NumericValue, options?: SerbianCyrillicOptions) => string} */ (makeConverter(SerbianCyrillic))
const SerbianLatinConverter = /** @type {(value: NumericValue, options?: SerbianLatinOptions) => string} */ (makeConverter(SerbianLatin))
const SwedishConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Swedish))
const SwahiliConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Swahili))
const TamilConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Tamil))
const TeluguConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Telugu))
const ThaiConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Thai))
const TurkishConverter = /** @type {(value: NumericValue, options?: TurkishOptions) => string} */ (makeConverter(Turkish))
const UkrainianConverter = /** @type {(value: NumericValue, options?: UkrainianOptions) => string} */ (makeConverter(Ukrainian))
const UrduConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Urdu))
const VietnameseConverter = /** @type {(value: NumericValue) => string} */ (makeConverter(Vietnamese))
const SimplifiedChineseConverter = /** @type {(value: NumericValue, options?: SimplifiedChineseOptions) => string} */ (makeConverter(SimplifiedChinese))
const TraditionalChineseConverter = /** @type {(value: NumericValue, options?: TraditionalChineseOptions) => string} */ (makeConverter(TraditionalChinese))

// ============================================================================
// Exports
// ============================================================================

export {
  ArabicConverter,
  AzerbaijaniConverter,
  BanglaConverter,
  CzechConverter,
  DanishConverter,
  GermanConverter,
  GreekConverter,
  EnglishConverter,
  SpanishConverter,
  PersianConverter,
  FilipinoConverter,
  FrenchConverter,
  FrenchBelgiumConverter,
  GujaratiConverter,
  HebrewConverter,
  BiblicalHebrewConverter,
  HindiConverter,
  CroatianConverter,
  HungarianConverter,
  IndonesianConverter,
  ItalianConverter,
  JapaneseConverter,
  KannadaConverter,
  KoreanConverter,
  LithuanianConverter,
  LatvianConverter,
  MarathiConverter,
  MalayConverter,
  NorwegianBokmalConverter,
  DutchConverter,
  PunjabiConverter,
  PolishConverter,
  PortugueseConverter,
  RomanianConverter,
  RussianConverter,
  SerbianCyrillicConverter,
  SerbianLatinConverter,
  SwedishConverter,
  SwahiliConverter,
  TamilConverter,
  TeluguConverter,
  ThaiConverter,
  TurkishConverter,
  UkrainianConverter,
  UrduConverter,
  VietnameseConverter,
  SimplifiedChineseConverter,
  TraditionalChineseConverter
}
