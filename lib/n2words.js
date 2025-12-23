import { Arabic } from './languages/arabic.js'
import { Azerbaijani } from './languages/azerbaijani.js'
import { Bengali } from './languages/bengali.js'
import { Czech } from './languages/czech.js'
import { Danish } from './languages/danish.js'
import { German } from './languages/german.js'
import { GreekLanguage } from './languages/greek.js'
import { English } from './languages/english.js'
import { Spanish } from './languages/spanish.js'
import { Farsi } from './languages/farsi.js'
import { FilipinoLanguage } from './languages/filipino.js'
import { French } from './languages/french.js'
import { BelgianFrench } from './languages/belgian-french.js'
import { GujaratiLanguage } from './languages/gujarati.js'
import { Hebrew } from './languages/hebrew.js'
import { BiblicalHebrew } from './languages/biblical-hebrew.js'
import { Hindi } from './languages/hindi.js'
import { Croatian } from './languages/croatian.js'
import { Hungarian } from './languages/hungarian.js'
import { Indonesian } from './languages/indonesian.js'
import { Italian } from './languages/italian.js'
import { Japanese } from './languages/japanese.js'
import { KannadaLanguage } from './languages/kannada.js'
import { Korean } from './languages/korean.js'
import { Lithuanian } from './languages/lithuanian.js'
import { Latvian } from './languages/latvian.js'
import { MarathiLanguage } from './languages/marathi.js'
import { Malay } from './languages/malay.js'
import { Dutch } from './languages/dutch.js'
import { NorwegianBokmal } from './languages/norwegian-bokmal.js'
import { Punjabi } from './languages/punjabi.js'
import { Polish } from './languages/polish.js'
import { Portuguese } from './languages/portuguese.js'
import { Romanian } from './languages/romanian.js'
import { Russian } from './languages/russian.js'
import { SerbianCyrillic } from './languages/serbian-cyrillic.js'
import { SerbianLatin } from './languages/serbian-latin.js'
import { Swedish } from './languages/swedish.js'
import { Swahili } from './languages/swahili.js'
import { Tamil } from './languages/tamil.js'
import { Telugu } from './languages/telugu.js'
import { Thai } from './languages/thai.js'
import { Turkish } from './languages/turkish.js'
import { Ukrainian } from './languages/ukrainian.js'
import { Urdu } from './languages/urdu.js'
import { Vietnamese } from './languages/vietnamese.js'
import { ChineseSimplified } from './languages/chinese-simplified.js'
import { ChineseTraditional } from './languages/chinese-traditional.js'

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
