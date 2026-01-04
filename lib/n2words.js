/**
 * n2words - Convert numbers to words in multiple languages
 *
 * This file is the main entry point for the n2words library.
 * It exports converter functions for all supported languages.
 *
 * ## For Contributors
 *
 * When adding a new language, this file must be updated in TWO sections:
 * 1. Language Imports - Add import statement (alphabetically sorted)
 * 2. Exports - Add to export list (alphabetically sorted)
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

import { toWords as AmharicConverter } from './languages/am.js'
import { toWords as AmharicLatinConverter } from './languages/am-Latn.js'
import { toWords as ArabicConverter } from './languages/ar.js'
import { toWords as AzerbaijaniConverter } from './languages/az.js'
import { toWords as BanglaConverter } from './languages/bn.js'
import { toWords as BiblicalHebrewConverter } from './languages/hbo.js'
import { toWords as CroatianConverter } from './languages/hr.js'
import { toWords as CzechConverter } from './languages/cs.js'
import { toWords as DanishConverter } from './languages/da.js'
import { toWords as DutchConverter } from './languages/nl.js'
import { toWords as EnglishConverter } from './languages/en.js'
import { toWords as FilipinoConverter } from './languages/fil.js'
import { toWords as FinnishConverter } from './languages/fi.js'
import { toWords as FrenchConverter } from './languages/fr.js'
import { toWords as FrenchBelgiumConverter } from './languages/fr-BE.js'
import { toWords as GermanConverter } from './languages/de.js'
import { toWords as GreekConverter } from './languages/el.js'
import { toWords as GujaratiConverter } from './languages/gu.js'
import { toWords as HausaConverter } from './languages/ha.js'
import { toWords as HebrewConverter } from './languages/he.js'
import { toWords as HindiConverter } from './languages/hi.js'
import { toWords as HungarianConverter } from './languages/hu.js'
import { toWords as IndonesianConverter } from './languages/id.js'
import { toWords as ItalianConverter } from './languages/it.js'
import { toWords as JapaneseConverter } from './languages/ja.js'
import { toWords as KannadaConverter } from './languages/kn.js'
import { toWords as KoreanConverter } from './languages/ko.js'
import { toWords as LatvianConverter } from './languages/lv.js'
import { toWords as LithuanianConverter } from './languages/lt.js'
import { toWords as MalayConverter } from './languages/ms.js'
import { toWords as MarathiConverter } from './languages/mr.js'
import { toWords as NorwegianBokmalConverter } from './languages/nb.js'
import { toWords as PersianConverter } from './languages/fa.js'
import { toWords as PolishConverter } from './languages/pl.js'
import { toWords as PortugueseConverter } from './languages/pt.js'
import { toWords as PunjabiConverter } from './languages/pa.js'
import { toWords as RomanianConverter } from './languages/ro.js'
import { toWords as RussianConverter } from './languages/ru.js'
import { toWords as SerbianCyrillicConverter } from './languages/sr-Cyrl.js'
import { toWords as SerbianLatinConverter } from './languages/sr-Latn.js'
import { toWords as SimplifiedChineseConverter } from './languages/zh-Hans.js'
import { toWords as SpanishConverter } from './languages/es.js'
import { toWords as SwahiliConverter } from './languages/sw.js'
import { toWords as SwedishConverter } from './languages/sv.js'
import { toWords as TamilConverter } from './languages/ta.js'
import { toWords as TeluguConverter } from './languages/te.js'
import { toWords as ThaiConverter } from './languages/th.js'
import { toWords as TraditionalChineseConverter } from './languages/zh-Hant.js'
import { toWords as TurkishConverter } from './languages/tr.js'
import { toWords as UkrainianConverter } from './languages/uk.js'
import { toWords as UrduConverter } from './languages/ur.js'
import { toWords as VietnameseConverter } from './languages/vi.js'

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
 * @typedef {Object} DutchOptions
 * @property {boolean} [includeOptionalAnd=false] Include optional "en" separator
 * @property {boolean} [noHundredPairing=false] Disable hundred-pairing (e.g., "twelve hundred" becomes "one thousand two hundred")
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
// Exports
// ============================================================================
//
// All converter functions are exported for public use.
//
// IMPORTANT: Keep exports alphabetically sorted for maintainability.
// ============================================================================

export {
  AmharicConverter,
  AmharicLatinConverter,
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
  FinnishConverter,
  FrenchBelgiumConverter,
  FrenchConverter,
  GermanConverter,
  GreekConverter,
  GujaratiConverter,
  HausaConverter,
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
