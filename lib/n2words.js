import { ArabicNumberConverter } from './languages/ar.js'
import { AzerbaijaniNumberConverter } from './languages/az.js'
import { BengaliNumberConverter } from './languages/bn.js'
import { CzechNumberConverter } from './languages/cs.js'
import { DanishNumberConverter } from './languages/da.js'
import { GermanNumberConverter } from './languages/de.js'
import { GreekNumberConverter } from './languages/el.js'
import { EnglishNumberConverter } from './languages/en.js'
import { SpanishNumberConverter } from './languages/es.js'
import { FarsiNumberConverter } from './languages/fa.js'
import { FilipinoNumberConverter } from './languages/fil.js'
import { FrenchNumberConverter } from './languages/fr.js'
import { BelgianFrenchNumberConverter } from './languages/fr-BE.js'
import { GujaratiNumberConverter } from './languages/gu.js'
import { HebrewNumberConverter } from './languages/he.js'
import { BiblicalHebrewNumberConverter } from './languages/he-biblical.js'
import { HindiNumberConverter } from './languages/hi.js'
import { CroatianNumberConverter } from './languages/hr.js'
import { HungarianNumberConverter } from './languages/hu.js'
import { IndonesianNumberConverter } from './languages/id.js'
import { ItalianNumberConverter } from './languages/it.js'
import { JapaneseNumberConverter } from './languages/ja.js'
import { KannadaNumberConverter } from './languages/kn.js'
import { KoreanNumberConverter } from './languages/ko.js'
import { LithuanianNumberConverter } from './languages/lt.js'
import { LatvianNumberConverter } from './languages/lv.js'
import { MarathiNumberConverter } from './languages/mr.js'
import { MalayNumberConverter } from './languages/ms.js'
import { DutchNumberConverter } from './languages/nl.js'
import { NorwegianBokmalNumberConverter } from './languages/nb.js'
import { PunjabiNumberConverter } from './languages/pa.js'
import { PolishNumberConverter } from './languages/pl.js'
import { PortugueseNumberConverter } from './languages/pt.js'
import { RomanianNumberConverter } from './languages/ro.js'
import { RussianNumberConverter } from './languages/ru.js'
import { SerbianCyrillicNumberConverter } from './languages/sr-Cyrl.js'
import { SerbianLatinNumberConverter } from './languages/sr-Latn.js'
import { SwedishNumberConverter } from './languages/sv.js'
import { SwahiliNumberConverter } from './languages/sw.js'
import { TamilNumberConverter } from './languages/ta.js'
import { TeluguNumberConverter } from './languages/te.js'
import { ThaiNumberConverter } from './languages/th.js'
import { TurkishNumberConverter } from './languages/tr.js'
import { UkrainianNumberConverter } from './languages/uk.js'
import { UrduNumberConverter } from './languages/ur.js'
import { VietnameseNumberConverter } from './languages/vi.js'
import { ChineseSimplifiedNumberConverter } from './languages/zh-Hans.js'
import { ChineseTraditionalNumberConverter } from './languages/zh-Hant.js'

/**
 * Factory function to create consistent language converter wrappers.
 * Eliminates boilerplate from individual language files.
 *
 * @param {Class} LanguageClass The language class constructor
 * @returns {Function} Converter function with signature (value, options) => string
 */
function createLanguageConverter (LanguageClass) {
  return function convertToWords (value, options = {}) {
    return new LanguageClass(options).convertToWords(value)
  }
}

// Create wrapper functions for ALL languages using the factory approach
const ArabicConverter = createLanguageConverter(ArabicNumberConverter)
const AzerbaijaniConverter = createLanguageConverter(AzerbaijaniNumberConverter)
const BengaliConverter = createLanguageConverter(BengaliNumberConverter)
const CzechConverter = createLanguageConverter(CzechNumberConverter)
const DanishConverter = createLanguageConverter(DanishNumberConverter)
const GermanConverter = createLanguageConverter(GermanNumberConverter)
const GreekConverter = createLanguageConverter(GreekNumberConverter)
const EnglishConverter = createLanguageConverter(EnglishNumberConverter)
const SpanishConverter = createLanguageConverter(SpanishNumberConverter)
const FarsiConverter = createLanguageConverter(FarsiNumberConverter)
const FilipinoConverter = createLanguageConverter(FilipinoNumberConverter)
const FrenchConverter = createLanguageConverter(FrenchNumberConverter)
const BelgianFrenchConverter = createLanguageConverter(BelgianFrenchNumberConverter)
const GujaratiConverter = createLanguageConverter(GujaratiNumberConverter)
const HebrewConverter = createLanguageConverter(HebrewNumberConverter)
const BiblicalHebrewConverter = createLanguageConverter(BiblicalHebrewNumberConverter)
const HindiConverter = createLanguageConverter(HindiNumberConverter)
const CroatianConverter = createLanguageConverter(CroatianNumberConverter)
const HungarianConverter = createLanguageConverter(HungarianNumberConverter)
const IndonesianConverter = createLanguageConverter(IndonesianNumberConverter)
const ItalianConverter = createLanguageConverter(ItalianNumberConverter)
const JapaneseConverter = createLanguageConverter(JapaneseNumberConverter)
const KannadaConverter = createLanguageConverter(KannadaNumberConverter)
const KoreanConverter = createLanguageConverter(KoreanNumberConverter)
const LithuanianConverter = createLanguageConverter(LithuanianNumberConverter)
const LatvianConverter = createLanguageConverter(LatvianNumberConverter)
const MarathiConverter = createLanguageConverter(MarathiNumberConverter)
const MalayConverter = createLanguageConverter(MalayNumberConverter)
const NorwegianBokmalConverter = createLanguageConverter(NorwegianBokmalNumberConverter)
const DutchConverter = createLanguageConverter(DutchNumberConverter)
const PunjabiConverter = createLanguageConverter(PunjabiNumberConverter)
const PolishConverter = createLanguageConverter(PolishNumberConverter)
const PortugueseConverter = createLanguageConverter(PortugueseNumberConverter)
const RomanianConverter = createLanguageConverter(RomanianNumberConverter)
const RussianConverter = createLanguageConverter(RussianNumberConverter)
const SerbianCyrillicConverter = createLanguageConverter(SerbianCyrillicNumberConverter)
const SerbianLatinConverter = createLanguageConverter(SerbianLatinNumberConverter)
const SwedishConverter = createLanguageConverter(SwedishNumberConverter)
const SwahiliConverter = createLanguageConverter(SwahiliNumberConverter)
const TamilConverter = createLanguageConverter(TamilNumberConverter)
const TeluguConverter = createLanguageConverter(TeluguNumberConverter)
const ThaiConverter = createLanguageConverter(ThaiNumberConverter)
const TurkishConverter = createLanguageConverter(TurkishNumberConverter)
const UkrainianConverter = createLanguageConverter(UkrainianNumberConverter)
const UrduConverter = createLanguageConverter(UrduNumberConverter)
const VietnameseConverter = createLanguageConverter(VietnameseNumberConverter)
const ChineseSimplifiedConverter = createLanguageConverter(ChineseSimplifiedNumberConverter)
const ChineseTraditionalConverter = createLanguageConverter(ChineseTraditionalNumberConverter)

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
