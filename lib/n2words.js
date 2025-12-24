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

/**
 * Numeric value that can be converted to words
 * @typedef {number | bigint | string} NumericValue
 */

/**
 * Options for configuring the converter behavior
 * @typedef {object} ConverterOptions
 */

/**
 * Function that converts numeric values to words
 * @typedef {(value: NumericValue, options?: ConverterOptions) => string} ConverterFunction
 */

/**
 * Language class constructor interface
 * @typedef {new (options?: ConverterOptions) => { convertToWords: (value: NumericValue) => string }} LanguageClass
 */

/**
 * Factory function to create consistent language converter wrappers.
 *
 * @param {LanguageClass} LanguageClass The language class constructor
 * @returns {ConverterFunction} Converter function with signature (value, options) => string
 */
function makeConverter (LanguageClass) {
  /**
   * Converts a numeric value to words.
   *
   * @param {NumericValue} value The numeric value to convert
   * @param {ConverterOptions} [options={}] Optional configuration options
   * @returns {string} The numeric value as words
   */
  return function convertToWords (value, options = {}) {
    return new LanguageClass(options).convertToWords(value)
  }
}

// Create wrapper functions for ALL languages using the factory approach
const ArabicConverter = makeConverter(Arabic)
const AzerbaijaniConverter = makeConverter(Azerbaijani)
const BanglaConverter = makeConverter(Bangla)
const CzechConverter = makeConverter(Czech)
const DanishConverter = makeConverter(Danish)
const GermanConverter = makeConverter(German)
const GreekConverter = makeConverter(Greek)
const EnglishConverter = makeConverter(English)
const SpanishConverter = makeConverter(Spanish)
const PersianConverter = makeConverter(Persian)
const FilipinoConverter = makeConverter(Filipino)
const FrenchConverter = makeConverter(French)
const FrenchBelgiumConverter = makeConverter(FrenchBelgium)
const GujaratiConverter = makeConverter(Gujarati)
const HebrewConverter = makeConverter(Hebrew)
const BiblicalHebrewConverter = makeConverter(BiblicalHebrew)
const HindiConverter = makeConverter(Hindi)
const CroatianConverter = makeConverter(Croatian)
const HungarianConverter = makeConverter(Hungarian)
const IndonesianConverter = makeConverter(Indonesian)
const ItalianConverter = makeConverter(Italian)
const JapaneseConverter = makeConverter(Japanese)
const KannadaConverter = makeConverter(Kannada)
const KoreanConverter = makeConverter(Korean)
const LithuanianConverter = makeConverter(Lithuanian)
const LatvianConverter = makeConverter(Latvian)
const MarathiConverter = makeConverter(Marathi)
const MalayConverter = makeConverter(Malay)
const NorwegianBokmalConverter = makeConverter(NorwegianBokmal)
const DutchConverter = makeConverter(Dutch)
const PunjabiConverter = makeConverter(Punjabi)
const PolishConverter = makeConverter(Polish)
const PortugueseConverter = makeConverter(Portuguese)
const RomanianConverter = makeConverter(Romanian)
const RussianConverter = makeConverter(Russian)
const SerbianCyrillicConverter = makeConverter(SerbianCyrillic)
const SerbianLatinConverter = makeConverter(SerbianLatin)
const SwedishConverter = makeConverter(Swedish)
const SwahiliConverter = makeConverter(Swahili)
const TamilConverter = makeConverter(Tamil)
const TeluguConverter = makeConverter(Telugu)
const ThaiConverter = makeConverter(Thai)
const TurkishConverter = makeConverter(Turkish)
const UkrainianConverter = makeConverter(Ukrainian)
const UrduConverter = makeConverter(Urdu)
const VietnameseConverter = makeConverter(Vietnamese)
const SimplifiedChineseConverter = makeConverter(SimplifiedChinese)
const TraditionalChineseConverter = makeConverter(TraditionalChinese)

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
