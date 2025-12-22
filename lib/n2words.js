/** @typedef {'ar'|'az'|'bn'|'cs'|'de'|'da'|'el'|'en'|'es'|'fa'|'fr'|'fr-BE'|'gu'|'hbo'|'he'|'hi'|'hr'|'hu'|'id'|'it'|'ja'|'kn'|'ko'|'lt'|'lv'|'mr'|'ms'|'nl'|'nb'|'pa-Guru'|'pl'|'pt'|'ro'|'ru'|'sr-Cyrl'|'sr-Latn'|'sv'|'sw'|'ta'|'te'|'th'|'fil'|'tr'|'uk'|'ur'|'vi'|'zh-Hans'|'zh-Hant'} LanguageCode */

// Import type definitions from individual language files
/** @typedef {import('./languages/ar.js').ArabicOptions} ArabicOptions */
/** @typedef {import('./languages/zh-Hans.js').ChineseSimplifiedOptions} ChineseSimplifiedOptions */
/** @typedef {import('./languages/zh-Hant.js').ChineseTraditionalOptions} ChineseTraditionalOptions */
/** @typedef {import('./languages/he.js').HebrewOptions} HebrewOptions */
/** @typedef {import('./languages/hbo.js').BiblicalHebrewOptions} BiblicalHebrewOptions */
/** @typedef {import('./languages/es.js').SpanishOptions} SpanishOptions */
/** @typedef {import('./languages/nl.js').DutchOptions} DutchOptions */
/** @typedef {import('./languages/fr.js').FrenchOptions} FrenchOptions */
/** @typedef {import('./languages/tr.js').TurkishOptions} TurkishOptions */
/** @typedef {import('./languages/ro.js').RomanianOptions} RomanianOptions */
/** @typedef {import('./languages/da.js').DanishOptions} DanishOptions */
/** @typedef {import('./languages/cs.js').CzechOptions} CzechOptions */
/** @typedef {import('./languages/hr.js').CroatianOptions} CroatianOptions */
/** @typedef {import('./languages/lv.js').LatvianOptions} LatvianOptions */
/** @typedef {import('./languages/lt.js').LithuanianOptions} LithuanianOptions */
/** @typedef {import('./languages/pl.js').PolishOptions} PolishOptions */
/** @typedef {import('./languages/ru.js').RussianOptions} RussianOptions */
/** @typedef {import('./languages/sr-Cyrl.js').SerbianCyrillicOptions} SerbianCyrillicOptions */
/** @typedef {import('./languages/sr-Latn.js').SerbianLatinOptions} SerbianLatinOptions */
/** @typedef {import('./languages/uk.js').UkrainianOptions} UkrainianOptions */

/**
 * Configuration object for number-to-words conversion with comprehensive language support.
 *
 * @typedef {Object} N2WordsOptions
 * @property {LanguageCode} [lang='en'] - Target language code (see LanguageCode type for all supported codes).
 *   Supports many languages with regional variants (e.g., 'fr-BE').
 *   Falls back progressively from most-specific to least-specific (e.g., 'fr-BE' -> 'fr').
 *   Throws an error if no match is found after fallback attempts.
 * @property {string} [negativeWord] - (Arabic only) Word for negative numbers.
 * @property {boolean} [feminine] - (Arabic, Hebrew, Romanian, Slavic languages) Use feminine forms.
 * @property {boolean} [formal] - (Chinese only) Use formal/financial numerals.
 * @property {string} [and] - (Hebrew only) Conjunction character.
 * @property {('o'|'a'|string)} [genderStem] - (Spanish only) Gender ending.
 * @property {boolean} [includeOptionalAnd] - (Dutch only) Include optional "en".
 * @property {boolean} [noHundredPairs] - (Dutch only) Disable comma before hundreds.
 * @property {boolean} [accentOne] - (Dutch only) Use accented "één".
 * @property {boolean} [withHyphenSeparator] - (French, Belgian French) Use hyphens.
 * @property {boolean} [dropSpaces] - (Turkish, Azerbaijani) Remove spaces.
 * @property {boolean} [ordFlag] - (Danish only) Enable ordinal conversion.
 *
 * Language-specific options are automatically validated and forwarded to converters.
 * See individual language implementations for detailed option descriptions.
 */

// Import ALL language classes (no wrapper functions - all use factory pattern)
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
function createLanguageConverter(LanguageClass) {
  return function convertToWords(value, options = {}) {
    return new LanguageClass(options).convertToWords(value)
  }
}

// Create wrapper functions for ALL languages using the factory approach
const ar = createLanguageConverter(Arabic)
const az = createLanguageConverter(Azerbaijani)
const bn = createLanguageConverter(Bengali)
const cs = createLanguageConverter(Czech)
const da = createLanguageConverter(Danish)
const de = createLanguageConverter(German)
const el = createLanguageConverter(GreekLanguage)
const en = createLanguageConverter(English)
const es = createLanguageConverter(Spanish)
const fa = createLanguageConverter(Farsi)
const fil = createLanguageConverter(FilipinoLanguage)
const fr = createLanguageConverter(French)
const frBE = createLanguageConverter(BelgianFrench)
const gu = createLanguageConverter(GujaratiLanguage)
const he = createLanguageConverter(Hebrew)
const hbo = createLanguageConverter(BiblicalHebrew)
const hi = createLanguageConverter(Hindi)
const hr = createLanguageConverter(Croatian)
const hu = createLanguageConverter(Hungarian)
const id = createLanguageConverter(Indonesian)
const it = createLanguageConverter(Italian)
const ja = createLanguageConverter(Japanese)
const kn = createLanguageConverter(KannadaLanguage)
const ko = createLanguageConverter(Korean)
const lt = createLanguageConverter(Lithuanian)
const lv = createLanguageConverter(Latvian)
const mr = createLanguageConverter(MarathiLanguage)
const ms = createLanguageConverter(Malay)
const nb = createLanguageConverter(NorwegianBokmal)
const nl = createLanguageConverter(Dutch)
const paGuru = createLanguageConverter(Punjabi)
const pl = createLanguageConverter(Polish)
const pt = createLanguageConverter(Portuguese)
const ro = createLanguageConverter(Romanian)
const ru = createLanguageConverter(Russian)
const srCyrl = createLanguageConverter(SerbianCyrillic)
const srLatn = createLanguageConverter(SerbianLatin)
const sv = createLanguageConverter(Swedish)
const sw = createLanguageConverter(Swahili)
const ta = createLanguageConverter(Tamil)
const te = createLanguageConverter(Telugu)
const th = createLanguageConverter(Thai)
const tr = createLanguageConverter(Turkish)
const uk = createLanguageConverter(Ukrainian)
const ur = createLanguageConverter(Urdu)
const vi = createLanguageConverter(Vietnamese)
const zhHans = createLanguageConverter(ChineseSimplified)
const zhHant = createLanguageConverter(ChineseTraditional)

// Re-export all language converters for tree-shakeable imports
// This allows users to import specific languages: import { en, fr } from 'n2words'
export {
  ar, az, bn, cs, da, de, el, en, es, fa, fil, fr,
  frBE, gu, he, hbo, hi, hr, hu, id, it, ja, kn, ko,
  lt, lv, mr, ms, nb, nl, paGuru, pl, pt, ro, ru,
  srCyrl, srLatn, sv, sw, ta, te, th, tr, uk, ur, vi,
  zhHans, zhHant
}

/**
 * Factory function to create consistent language converter wrappers.
 * Eliminates boilerplate from individual language files.
 *
 * @param {Function} LanguageClass The language class constructor
 * @returns {Function} Converter function with signature (value, options) => string
 */
function createLanguageConverter(LanguageClass) {
  return function convertToWords(value, options = {}) {
    return new LanguageClass(options).convertToWords(value)
  }
}

// Individual language exports - tree-shakeable and optimized for direct imports
export const ar = createLanguageConverter(ar)
export const az = createLanguageConverter(az)
export const cs = createLanguageConverter(cs)
export const de = createLanguageConverter(de)
export const da = createLanguageConverter(da)
export const en = createLanguageConverter(en)
export const es = createLanguageConverter(es)
export const fa = createLanguageConverter(fa)
export const sw = createLanguageConverter(sw)
export const fr = createLanguageConverter(fr)
export const frBE = createLanguageConverter(frBE)
export const he = createLanguageConverter(he)
export const hbo = createLanguageConverter(hbo)
export const hr = createLanguageConverter(hr)
export const hu = createLanguageConverter(hu)
export const id = createLanguageConverter(id)
export const ms = createLanguageConverter(ms)
export const it = createLanguageConverter(it)
export const ja = createLanguageConverter(ja)
export const hi = createLanguageConverter(hi)
export const bn = createLanguageConverter(bn)
export const ko = createLanguageConverter(ko)
export const th = createLanguageConverter(th)
export const ta = createLanguageConverter(ta)
export const te = createLanguageConverter(te)
export const sv = createLanguageConverter(sv)
export const lt = createLanguageConverter(lt)
export const lv = createLanguageConverter(lv)
export const nl = createLanguageConverter(nl)
export const nb = createLanguageConverter(nb)
export const pl = createLanguageConverter(pl)
export const pt = createLanguageConverter(pt)
export const ro = createLanguageConverter(ro)
export const ru = createLanguageConverter(ru)
export const srLatn = createLanguageConverter(srLatn)
export const srCyrl = createLanguageConverter(srCyrl)
export const tr = createLanguageConverter(tr)
export const uk = createLanguageConverter(uk)
export const vi = createLanguageConverter(vi)
export const zhHans = createLanguageConverter(zhHans)
export const zhHant = createLanguageConverter(zhHant)
export const ur = createLanguageConverter(ur)
export const paGuru = createLanguageConverter(paGuru)
export const fil = createLanguageConverter(fil)
export const mr = createLanguageConverter(mr)
export const gu = createLanguageConverter(gu)
export const kn = createLanguageConverter(kn)
export const el = createLanguageConverter(el)

/**
 * Language converter registry.
 * Contains converters for all supported languages, statically imported to work
 * in both Node.js and browser environments (enables bundler dead-code elimination).
 * Keys are language codes (e.g., 'en', 'fr', 'fr-BE'); values are converter functions.
 * @type {Object<string, Function>}
 */
const dict = {
  ar: ar,
  az: az,
  cs: cs,
  de: de,
  da: da,
  en: en,
  es: es,
  fa: fa,
  sw: sw,
  fr: fr,
  'fr-BE': frBE,
  hbo: hbo,
  he: he,
  hr: hr,
  hu: hu,
  id: id,
  ms: ms,
  it: it,
  ja: ja,
  hi: hi,
  bn: bn,
  ko: ko,
  th: th,
  ta: ta,
  te: te,
  sv: sv,
  lt: lt,
  lv: lv,
  nl: nl,
  nb: nb,
  pl: pl,
  pt: pt,
  ro: ro,
  ru: ru,
  'sr-Cyrl': srCyrl,
  'sr-Latn': srLatn,
  tr: tr,
  uk: uk,
  vi: vi,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ur: ur,
  'pa-Guru': paGuru,
  fil: fil,
  mr: mr,
  gu: gu,
  kn: kn,
  el: el
}

/**
 * Convert a numeric value to its cardinal (written) form in the requested language.
 *
 * This is the main entry point. The library dispatches synchronously to the appropriate
 * per-language converter based on the `lang` option. For browser builds, language converters
 * are statically imported so bundlers (webpack/rollup) can include them in output; Node.js
 * maintains identical behavior via the same static imports.
 *
 * @param {number|string|bigint} value The number to convert. Accepts:
 *   - `number` (integer or floating-point),
 *   - `string` (numeric string, possibly with decimal point),
 *   - `bigint` for very large integers.
 *   Decimal numbers as strings preserve precision that `number` type cannot.
 * @param {N2WordsOptions} [options={}] Optional configuration object.
 *
 * @returns {string} A human-readable cardinal representation of `value` in the
 *   requested language.
 *
 * @throws {TypeError} If `options` is provided but is not an object.
 * @throws {Error} If the requested language is unsupported (no match after fallback).
 *
 * @example
 * // Basic usage
 * convertToWords(1, { lang: 'en' }) // => 'one'
 * convertToWords('45.67', { lang: 'en' }) // => 'forty-five point six seven'
 * convertToWords(123n, { lang: 'fr' }) // => 'cent vingt-trois'
 *
 * @example
 * // Language-specific options (see individual language implementations)
 * convertToWords(1, { lang: 'zh-Hans', formal: true }) // Chinese formal style
 * convertToWords(1, { lang: 'cs', feminine: true }) // Czech feminine form
 */
export function convertToWords(value, options = {}) {
  if (options !== null && options !== undefined && typeof options !== 'object') {
    throw new TypeError('Options must be an object, received: ' + typeof options)
  }

  if (options === null) {
    options = {}
  }

  let languageCode = options.lang

  if (languageCode === undefined) {
    return dict.en(value, options)
  }

  if (typeof languageCode !== 'string') {
    languageCode = String(languageCode)
  }

  let languageConverter = dict[languageCode]
  if (languageConverter !== undefined) {
    return languageConverter(value, options)
  }

  // Progressive fallback for regional variants: strip suffix on each iteration.
  // Example: 'fr-BE-XX' -> try 'fr-BE' -> try 'fr' -> throw error
  // Uses lastIndexOf for efficiency (O(n) vs O(n²) with repeated substring)
  let lastDashIndex = languageCode.lastIndexOf('-')
  while (lastDashIndex > 0) {
    const candidateLanguageCode = languageCode.slice(0, lastDashIndex)
    languageConverter = dict[candidateLanguageCode]
    if (languageConverter !== undefined) {
      return languageConverter(value, options)
    }
    lastDashIndex = candidateLanguageCode.lastIndexOf('-')
  }

  throw new Error('Unsupported language: "' + languageCode + '". Check supported language codes in the documentation.')
}
