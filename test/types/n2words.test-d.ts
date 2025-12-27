/**
 * Type tests for n2words library
 * Tests that TypeScript declarations work correctly
 *
 * Run with: npm run test:tsd
 */

import { expectType, expectError, expectAssignable } from 'tsd'
import {
  ArabicConverter,
  AzerbaijaniConverter,
  BanglaConverter,
  BiblicalHebrewConverter,
  SimplifiedChineseConverter,
  TraditionalChineseConverter,
  CroatianConverter,
  CzechConverter,
  DanishConverter,
  DutchConverter,
  EnglishConverter,
  FilipinoConverter,
  FrenchBelgiumConverter,
  FrenchConverter,
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
  SpanishConverter,
  SwahiliConverter,
  SwedishConverter,
  TamilConverter,
  TeluguConverter,
  ThaiConverter,
  TurkishConverter,
  UkrainianConverter,
  UrduConverter,
  VietnameseConverter
} from '../../lib/n2words.js'

// ============================================================================
// Basic Converter Tests - Converters without options
// ============================================================================

// English converter
expectType<string>(EnglishConverter(42))
expectType<string>(EnglishConverter(BigInt(42)))
expectType<string>(EnglishConverter('42'))
expectType<string>(EnglishConverter(3.14))

// Should error if passing options to converters without options
expectError(EnglishConverter(42, { gender: 'masculine' }))

// Test multiple converters without options
expectType<string>(AzerbaijaniConverter(42))
expectType<string>(BanglaConverter(42))
expectType<string>(FilipinoConverter(42))
expectType<string>(GermanConverter(42))
expectType<string>(GreekConverter(42))
expectType<string>(GujaratiConverter(42))
expectType<string>(HindiConverter(42))
expectType<string>(HungarianConverter(42))
expectType<string>(IndonesianConverter(42))
expectType<string>(ItalianConverter(42))
expectType<string>(JapaneseConverter(42))
expectType<string>(KannadaConverter(42))
expectType<string>(KoreanConverter(42))
expectType<string>(MalayConverter(42))
expectType<string>(MarathiConverter(42))
expectType<string>(NorwegianBokmalConverter(42))
expectType<string>(PersianConverter(42))
expectType<string>(PortugueseConverter(42))
expectType<string>(PunjabiConverter(42))
expectType<string>(SwahiliConverter(42))
expectType<string>(SwedishConverter(42))
expectType<string>(TamilConverter(42))
expectType<string>(TeluguConverter(42))
expectType<string>(ThaiConverter(42))
expectType<string>(UrduConverter(42))
expectType<string>(VietnameseConverter(42))

// ============================================================================
// Converters with Gender Options
// ============================================================================

// Arabic converter with gender options
expectType<string>(ArabicConverter(42))
expectType<string>(ArabicConverter(42, { gender: 'masculine' }))
expectType<string>(ArabicConverter(42, { gender: 'feminine' }))
expectType<string>(ArabicConverter(42, { negativeWord: 'سالب' }))
expectError(ArabicConverter(42, { gender: 'invalid' }))

// Croatian converter with gender options
expectType<string>(CroatianConverter(42))
expectType<string>(CroatianConverter(42, { gender: 'masculine' }))
expectType<string>(CroatianConverter(42, { gender: 'feminine' }))
expectError(CroatianConverter(42, { gender: 'invalid' }))

// Czech converter with gender options
expectType<string>(CzechConverter(42))
expectType<string>(CzechConverter(42, { gender: 'masculine' }))
expectType<string>(CzechConverter(42, { gender: 'feminine' }))

// Latvian converter with gender options
expectType<string>(LatvianConverter(42))
expectType<string>(LatvianConverter(42, { gender: 'masculine' }))
expectType<string>(LatvianConverter(42, { gender: 'feminine' }))

// Lithuanian converter with gender options
expectType<string>(LithuanianConverter(42))
expectType<string>(LithuanianConverter(42, { gender: 'masculine' }))
expectType<string>(LithuanianConverter(42, { gender: 'feminine' }))

// Polish converter with gender options
expectType<string>(PolishConverter(42))
expectType<string>(PolishConverter(42, { gender: 'masculine' }))
expectType<string>(PolishConverter(42, { gender: 'feminine' }))

// Romanian converter with gender options
expectType<string>(RomanianConverter(42))
expectType<string>(RomanianConverter(42, { gender: 'masculine' }))
expectType<string>(RomanianConverter(42, { gender: 'feminine' }))

// Russian converter with gender options
expectType<string>(RussianConverter(42))
expectType<string>(RussianConverter(42, { gender: 'masculine' }))
expectType<string>(RussianConverter(42, { gender: 'feminine' }))

// Serbian Cyrillic converter with gender options
expectType<string>(SerbianCyrillicConverter(42))
expectType<string>(SerbianCyrillicConverter(42, { gender: 'masculine' }))
expectType<string>(SerbianCyrillicConverter(42, { gender: 'feminine' }))

// Serbian Latin converter with gender options
expectType<string>(SerbianLatinConverter(42))
expectType<string>(SerbianLatinConverter(42, { gender: 'masculine' }))
expectType<string>(SerbianLatinConverter(42, { gender: 'feminine' }))

// Spanish converter with gender options
expectType<string>(SpanishConverter(42))
expectType<string>(SpanishConverter(42, { gender: 'masculine' }))
expectType<string>(SpanishConverter(42, { gender: 'feminine' }))

// Ukrainian converter with gender options
expectType<string>(UkrainianConverter(42))
expectType<string>(UkrainianConverter(42, { gender: 'masculine' }))
expectType<string>(UkrainianConverter(42, { gender: 'feminine' }))

// ============================================================================
// Converters with Other Options
// ============================================================================

// Biblical Hebrew converter with andWord and gender options
expectType<string>(BiblicalHebrewConverter(42))
expectType<string>(BiblicalHebrewConverter(42, { andWord: 'ו' }))
expectType<string>(BiblicalHebrewConverter(42, { gender: 'masculine' }))
expectType<string>(BiblicalHebrewConverter(42, { andWord: 'ו', gender: 'feminine' }))

// Hebrew converter with andWord option
expectType<string>(HebrewConverter(42))
expectType<string>(HebrewConverter(42, { andWord: 'ו' }))

// Simplified Chinese converter with formal option
expectType<string>(SimplifiedChineseConverter(42))
expectType<string>(SimplifiedChineseConverter(42, { formal: true }))
expectType<string>(SimplifiedChineseConverter(42, { formal: false }))
expectError(SimplifiedChineseConverter(42, { formal: 'invalid' }))

// Traditional Chinese converter with formal option
expectType<string>(TraditionalChineseConverter(42))
expectType<string>(TraditionalChineseConverter(42, { formal: true }))
expectType<string>(TraditionalChineseConverter(42, { formal: false }))

// Danish converter with ordFlag option
expectType<string>(DanishConverter(42))
expectType<string>(DanishConverter(42, { ordFlag: true }))
expectType<string>(DanishConverter(42, { ordFlag: false }))

// Dutch converter with multiple options
expectType<string>(DutchConverter(42))
expectType<string>(DutchConverter(42, { includeOptionalAnd: true }))
expectType<string>(DutchConverter(42, { noHundredPairs: true }))
expectType<string>(DutchConverter(42, { accentOne: true }))
expectType<string>(DutchConverter(42, {
  includeOptionalAnd: true,
  noHundredPairs: true,
  accentOne: true
}))

// French converter with withHyphenSeparator option
expectType<string>(FrenchConverter(42))
expectType<string>(FrenchConverter(42, { withHyphenSeparator: true }))
expectType<string>(FrenchConverter(42, { withHyphenSeparator: false }))

// French Belgium converter with withHyphenSeparator option
expectType<string>(FrenchBelgiumConverter(42))
expectType<string>(FrenchBelgiumConverter(42, { withHyphenSeparator: true }))
expectType<string>(FrenchBelgiumConverter(42, { withHyphenSeparator: false }))

// Turkish converter with dropSpaces option
expectType<string>(TurkishConverter(42))
expectType<string>(TurkishConverter(42, { dropSpaces: true }))
expectType<string>(TurkishConverter(42, { dropSpaces: false }))

// ============================================================================
// Input Type Tests
// ============================================================================

// Test all valid input types
expectType<string>(EnglishConverter(0))
expectType<string>(EnglishConverter(-42))
expectType<string>(EnglishConverter(3.14159))
expectType<string>(EnglishConverter(BigInt(9007199254740992)))
expectType<string>(EnglishConverter('123'))
expectType<string>(EnglishConverter('3.14'))

// Should error on invalid input types
expectError(EnglishConverter(null))
expectError(EnglishConverter(undefined))
expectError(EnglishConverter({}))
expectError(EnglishConverter([]))
expectError(EnglishConverter(true))

// ============================================================================
// Return Type Tests
// ============================================================================

// All converters must return string
const result1: string = EnglishConverter(42)
const result2: string = ArabicConverter(42, { gender: 'feminine' })
const result3: string = SimplifiedChineseConverter(42, { formal: true })

// Should not be assignable to other types
expectError<number>(EnglishConverter(42))
expectError<boolean>(EnglishConverter(42))
expectError<object>(EnglishConverter(42))
