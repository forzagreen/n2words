import { Arabic } from './languages/ar.js'
import { Azerbaijani } from './languages/az.js'
import { Bengali } from './languages/bn.js'
import { Czech } from './languages/cs.js'
import { Danish } from './languages/da.js'
import { German } from './languages/de.js'
import { GreekLanguage } from './languages/el.js'
import { English } from './languages/en.js'
import { Spanish } from './languages/es.js'
import { Farsi } from './languages/fa.js'
import { FilipinoLanguage } from './languages/fil.js'
import { French } from './languages/fr.js'
import { BelgianFrench } from './languages/fr-BE.js'
import { GujaratiLanguage } from './languages/gu.js'
import { Hebrew } from './languages/he.js'
import { BiblicalHebrew } from './languages/hbo.js'
import { Hindi } from './languages/hi.js'
import { Croatian } from './languages/hr.js'
import { Hungarian } from './languages/hu.js'
import { Indonesian } from './languages/id.js'
import { Italian } from './languages/it.js'
import { Japanese } from './languages/ja.js'
import { KannadaLanguage } from './languages/kn.js'
import { Korean } from './languages/ko.js'
import { Lithuanian } from './languages/lt.js'
import { Latvian } from './languages/lv.js'
import { MarathiLanguage } from './languages/mr.js'
import { Malay } from './languages/ms.js'
import { Dutch } from './languages/nl.js'
import { NorwegianBokmal } from './languages/nb.js'
import { Punjabi } from './languages/pa-Guru.js'
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
import { ChineseSimplified } from './languages/zh-Hans.js'
import { ChineseTraditional } from './languages/zh-Hant.js'

/**
 * Factory function to create consistent language converter wrappers.
 * Eliminates boilerplate from individual language files.
 *
 * @param {Function} LanguageClass The language class constructor
 * @returns {Function} Converter function with signature (value, options) => string
 */
function createLanguageConverter (LanguageClass) {
  return function convertToWords (value, options = {}) {
    return new LanguageClass(options).convertToWords(value)
  }
}

// Create wrapper functions for ALL languages using the factory approach
const ArabicConverter = createLanguageConverter(Arabic)
const AzerbaijaniConverter = createLanguageConverter(Azerbaijani)
const BengaliConverter = createLanguageConverter(Bengali)
const CzechConverter = createLanguageConverter(Czech)
const DanishConverter = createLanguageConverter(Danish)
const GermanConverter = createLanguageConverter(German)
const GreekConverter = createLanguageConverter(GreekLanguage)
const EnglishConverter = createLanguageConverter(English)
const SpanishConverter = createLanguageConverter(Spanish)
const FarsiConverter = createLanguageConverter(Farsi)
const FilipinoConverter = createLanguageConverter(FilipinoLanguage)
const FrenchConverter = createLanguageConverter(French)
const BelgianFrenchConverter = createLanguageConverter(BelgianFrench)
const GujaratiConverter = createLanguageConverter(GujaratiLanguage)
const HebrewConverter = createLanguageConverter(Hebrew)
const BiblicalHebrewConverter = createLanguageConverter(BiblicalHebrew)
const HindiConverter = createLanguageConverter(Hindi)
const CroatianConverter = createLanguageConverter(Croatian)
const HungarianConverter = createLanguageConverter(Hungarian)
const IndonesianConverter = createLanguageConverter(Indonesian)
const ItalianConverter = createLanguageConverter(Italian)
const JapaneseConverter = createLanguageConverter(Japanese)
const KannadaConverter = createLanguageConverter(KannadaLanguage)
const KoreanConverter = createLanguageConverter(Korean)
const LithuanianConverter = createLanguageConverter(Lithuanian)
const LatvianConverter = createLanguageConverter(Latvian)
const MarathiConverter = createLanguageConverter(MarathiLanguage)
const MalayConverter = createLanguageConverter(Malay)
const NorwegianBokmalConverter = createLanguageConverter(NorwegianBokmal)
const DutchConverter = createLanguageConverter(Dutch)
const PunjabiConverter = createLanguageConverter(Punjabi)
const PolishConverter = createLanguageConverter(Polish)
const PortugueseConverter = createLanguageConverter(Portuguese)
const RomanianConverter = createLanguageConverter(Romanian)
const RussianConverter = createLanguageConverter(Russian)
const SerbianCyrillicConverter = createLanguageConverter(SerbianCyrillic)
const SerbianLatinConverter = createLanguageConverter(SerbianLatin)
const SwedishConverter = createLanguageConverter(Swedish)
const SwahiliConverter = createLanguageConverter(Swahili)
const TamilConverter = createLanguageConverter(Tamil)
const TeluguConverter = createLanguageConverter(Telugu)
const ThaiConverter = createLanguageConverter(Thai)
const TurkishConverter = createLanguageConverter(Turkish)
const UkrainianConverter = createLanguageConverter(Ukrainian)
const UrduConverter = createLanguageConverter(Urdu)
const VietnameseConverter = createLanguageConverter(Vietnamese)
const ChineseSimplifiedConverter = createLanguageConverter(ChineseSimplified)
const ChineseTraditionalConverter = createLanguageConverter(ChineseTraditional)

export {
  ArabicConverter as Arabic,
  AzerbaijaniConverter as Azerbaijani,
  BengaliConverter as Bengali,
  CzechConverter as Czech,
  DanishConverter as Danish,
  GermanConverter as German,
  GreekConverter as Greek,
  EnglishConverter as English,
  SpanishConverter as Spanish,
  FarsiConverter as Farsi,
  FilipinoConverter as Filipino,
  FrenchConverter as French,
  BelgianFrenchConverter as BelgianFrench,
  GujaratiConverter as Gujarati,
  HebrewConverter as Hebrew,
  BiblicalHebrewConverter as BiblicalHebrew,
  HindiConverter as Hindi,
  CroatianConverter as Croatian,
  HungarianConverter as Hungarian,
  IndonesianConverter as Indonesian,
  ItalianConverter as Italian,
  JapaneseConverter as Japanese,
  KannadaConverter as Kannada,
  KoreanConverter as Korean,
  LithuanianConverter as Lithuanian,
  LatvianConverter as Latvian,
  MarathiConverter as Marathi,
  MalayConverter as Malay,
  NorwegianBokmalConverter as NorwegianBokmal,
  DutchConverter as Dutch,
  PunjabiConverter as Punjabi,
  PolishConverter as Polish,
  PortugueseConverter as Portuguese,
  RomanianConverter as Romanian,
  RussianConverter as Russian,
  SerbianCyrillicConverter as SerbianCyrillic,
  SerbianLatinConverter as SerbianLatin,
  SwedishConverter as Swedish,
  SwahiliConverter as Swahili,
  TamilConverter as Tamil,
  TeluguConverter as Telugu,
  ThaiConverter as Thai,
  TurkishConverter as Turkish,
  UkrainianConverter as Ukrainian,
  UrduConverter as Urdu,
  VietnameseConverter as Vietnamese,
  ChineseSimplifiedConverter as ChineseSimplified,
  ChineseTraditionalConverter as ChineseTraditional
}
