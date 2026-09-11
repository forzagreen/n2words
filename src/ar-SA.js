/**
 * Arabic (Saudi Arabia) language converter
 *
 * CLDR: ar-SA | Modern Standard Arabic as used in Saudi Arabia
 *
 * Self-contained converter implementing the classical rules of the Arabic
 * counted noun (العدد والمعدود). One engine renders a bare cardinal, a scale
 * word counted by its group ("ثلاثة آلاف", "أحد عشر ألفاً", "مئتا ألف") and a
 * currency unit counted by the whole amount ("ألفا ريال وريالان"), so the
 * agreement rules live in one place:
 *
 * - 1 and 2 agree with the noun and follow it: "ريال واحد", "ريالان".
 * - 3–10 take the *opposite* gender of the noun (polarity) and govern a
 *   genitive plural: "ثلاثة ريالات" but "ثلاث هللات".
 * - 11–99 govern a singular accusative (تمييز): "أحد عشر ريالاً". The
 *   tanwīn drops when that noun is itself a construct head, so 11,000
 *   riyals is "أحد عشر ألف ريال", never "ألفاً ريال".
 * - 100, 1000 and every larger scale word govern a singular genitive
 *   (إضافة): "مائة ريال", "ألف ريال". The dual loses its ن as a construct
 *   head: "مئتا ألف", "ألفا ريال".
 * - A compound ending in 1 or 2 repeats the noun rather than fronting a
 *   bare numeral: "مائة ريال وريال واحد", as in "ألف ليلة وليلة".
 *
 * Case (إعراب) is an option: the nominative is the citation form, while the
 * accusative and genitive surface as ـين on duals and tens ("اثنين وعشرين",
 * "ألفين"). Ordinals are the classical definite forms — "الحادي عشر",
 * "الحادي والعشرون", "الحادي بعد المائة" — the scheme that numbers the
 * nights of ألف ليلة وليلة.
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { checkMax } from './utils/check-max.js'
import { western } from './utils/scale.js'
import { resolveOptions } from './utils/resolve-options.js'
import { ar as CURRENCY_VOCAB, assertCurrencyExponent, minorUnitDigits } from './utils/currency-vocab.js'

// ============================================================================
// Vocabulary
// ============================================================================

/**
 * @typedef {('masculine'|'feminine')} Gender
 * @typedef {('nominative'|'accusative'|'genitive')} Case
 */

// Units 1–19, indexed by value, in the form that agrees with a noun of the
// given gender. Polarity is baked in: the "masculine" row is what counts a
// masculine noun (ثلاثة رجال), so 3–10 carry the ة there and lack it in the
// feminine row (ثلاث نساء). 11 and 12 agree in both halves; 13–19 invert the
// unit and agree the ten (ثلاثة عشر رجلاً / ثلاث عشرة امرأة).
const ONES_MASC = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر']
const ONES_FEM = ['', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع', 'عشر', 'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة', 'خمس عشرة', 'ست عشرة', 'سبع عشرة', 'ثماني عشرة', 'تسع عشرة']

// "One" in a compound (21, 31 …): the masculine keeps واحد, the feminine
// takes إحدى, as in إحدى عشرة. The feminine 8 is a defective noun: ثمانٍ
// (written ثمان) in the nominative and genitive, ثمانيَ in the accusative,
// and ثماني when it heads a plural (ثماني هللات).
const ONE_IN_COMPOUND = { masculine: 'واحد', feminine: 'إحدى' }
const EIGHT_FEM_CONSTRUCT = 'ثماني'

// Tens 20–90 without their case ending: ـون nominative, ـين oblique.
const TENS_STEM = ['', '', 'عشر', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع']
const TENS_ENDING = { nominative: 'ون', accusative: 'ين', genitive: 'ين' }

// 300–900 are written as one word. 100 is invariable; 200 is the dual
// مئتان (مئتين oblique, مئتا/مئتي as a construct head) and derived below.
const HUNDREDS = ['', 'مائة', '', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة']
const TWO_HUNDRED = 'مئتان'

// Scale words above the units group, index 1 = 10^3. Every one is a
// masculine noun; the singular and the plural counted by 3–10 are listed,
// the dual and tamyīz forms are derived from the singular.
const SCALES = ['', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون']
const SCALE_PLURALS = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات']

// Supported magnitude ceiling (checked at the public entry points), derived from the scale table.
export const cardinalMax = western(SCALES.length - 1)
export const ordinalMax = western(SCALES.length - 1)
export const currencyMax = western(SCALES.length - 1)

const ZERO = 'صفر'
const NEGATIVE = 'ناقص'
const DECIMAL_SEP = 'فاصلة'
const AND = 'و'
const AFTER = 'بعد'
const DEFINITE = 'ال'

// Ordinals 1–10 (index = value). "First" has a compound form, الحادي, used in
// 11, 21 … and after مائة/ألف; الأول is only ever the standalone word.
const ORDINAL_MASC = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر']
const ORDINAL_FEM = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة']
const ORDINAL_FIRST_COMPOUND = { masculine: 'الحادي', feminine: 'الحادية' }

// The "ten" of 11–19 agrees with the noun in both cardinals (اثنا عشر /
// اثنتا عشرة) and ordinals (الحادي عشر / الحادية عشرة).
const TEEN_TEN = { masculine: 'عشر', feminine: 'عشرة' }

// ============================================================================
// Counted nouns
// ============================================================================

/**
 * A noun as the number engine sees it: the four forms Arabic counting
 * selects between, plus the gender that drives agreement of 1–19.
 * @typedef {object} Noun
 * @property {string} singular - Bare singular: after 100/1000… and in "X واحد"
 * @property {string} dual - Nominative dual with its ن: "ريالان", "ألفان"
 * @property {string} plural - Plural counted by 3–10: "ريالات", "آلاف"
 * @property {string} tamyiz - Singular accusative after 11–99: "ريالاً"
 * @property {Gender} gender - Grammatical gender of the noun
 * @property {boolean} countsWithOne - Whether one is spelled out ("ريال واحد") or the bare noun stands alone ("ألف")
 */

/**
 * The counted-noun view of a scale word: every scale word is masculine,
 * forms its dual and tamyīz regularly, and stands alone for one ("ألف",
 * never "ألف واحد").
 * @param {number} level - Index into SCALES (1 = thousand)
 * @returns {Noun} The scale word as a counted noun
 */
function scaleNoun(level) {
  const singular = SCALES[level]
  return { singular, dual: singular + 'ان', plural: SCALE_PLURALS[level], tamyiz: singular + 'اً', gender: 'masculine', countsWithOne: false }
}

/**
 * The counted-noun view of a currency unit, from its currency-vocab row
 * ([singular, dual, plural (3–10), tamyīz (11+)]).
 * @param {string[]} forms - The word-form array from the currency matrix
 * @param {Gender} gender - The unit's grammatical gender
 * @returns {Noun} The unit as a counted noun
 */
function currencyNoun(forms, gender) {
  return { singular: forms[0], dual: forms[1], plural: forms[2], tamyiz: forms[3], gender, countsWithOne: true }
}

/**
 * Inflect a sound dual for case: the nominative ـان becomes ـين in the
 * accusative and genitive ("ريالان" → "ريالين").
 * @param {string} dual - Nominative dual ending in ان
 * @param {Case} grammaticalCase - Case to inflect for
 * @returns {string} The dual in the requested case
 */
function inflectDual(dual, grammaticalCase) {
  return grammaticalCase === 'nominative' ? dual : dual.slice(0, -2) + 'ين'
}

/**
 * The dual as a construct head (مضاف): the ن drops, leaving ـا in the
 * nominative and ـي otherwise ("ألفا ريال", "ألفي ريال").
 * @param {string} dual - Nominative dual ending in ان
 * @param {Case} grammaticalCase - Case to inflect for
 * @returns {string} The construct-state dual
 */
function constructDual(dual, grammaticalCase) {
  return dual.slice(0, -2) + (grammaticalCase === 'nominative' ? 'ا' : 'ي')
}

/**
 * The noun counted by one: "ريال واحد" for a currency, the bare "ألف" for a
 * scale word.
 * @param {Noun} noun - The counted noun
 * @returns {string} The noun counted by one
 */
function nounForOne(noun) {
  if (!noun.countsWithOne) return noun.singular
  return noun.singular + ' ' + (noun.gender === 'feminine' ? ONES_FEM[1] : ONES_MASC[1])
}

// ============================================================================
// Number words
// ============================================================================

/**
 * Render 1–99 as conjuncts (joined later with و): ["خمسة"], ["خمسة", "عشرون"],
 * ["أحد عشر"]. The gender is the counted noun's; the tables carry polarity.
 * @param {number} r - Value in 1–99
 * @param {Gender} gender - Gender of the counted noun
 * @param {Case} grammaticalCase - Case of the number
 * @param {boolean} construct - Whether 3–10 heads a genitive plural (ثماني هللات)
 * @returns {string[]} The conjuncts
 */
function tensAndOnes(r, gender, grammaticalCase, construct) {
  const ones = gender === 'feminine' ? ONES_FEM : ONES_MASC
  const feminine = gender === 'feminine'
  const unit = r % 10

  if (r < 20) {
    // The only declinable parts of 1–19 are the duals (2, and the ن-less
    // first half of 12: اثنا عشر / اثني عشر) and the defective feminine 8;
    // 11 and 13–19 are indeclinable compounds.
    if (r === 2) return [inflectDual(ones[2], grammaticalCase)]
    if (r === 12) return [constructDual(ones[2], grammaticalCase) + ' ' + TEEN_TEN[gender]]
    if (r === 8 && feminine && (construct || grammaticalCase === 'accusative')) return [EIGHT_FEM_CONSTRUCT]
    return [ones[r]]
  }

  const tensWord = TENS_STEM[Math.trunc(r / 10)] + TENS_ENDING[grammaticalCase]
  if (unit === 0) return [tensWord]

  let unitWord = ones[unit]
  if (unit === 1) unitWord = ONE_IN_COMPOUND[gender]
  else if (unit === 2) unitWord = inflectDual(ones[2], grammaticalCase)
  else if (unit === 8 && feminine && grammaticalCase === 'accusative') unitWord = EIGHT_FEM_CONSTRUCT
  return [unitWord, tensWord]
}

/**
 * The hundreds word of a group: مائة, the dual مئتان (or its construct form
 * مئتا when it heads the following noun), or one of the fused 300–900.
 * @param {number} h - Hundreds digit, 1–9
 * @param {Case} grammaticalCase - Case of the number
 * @param {boolean} construct - Whether the word directly heads its noun ("مئتا ألف")
 * @returns {string} The hundreds word
 */
function hundredsWord(h, grammaticalCase, construct) {
  if (h !== 2) return HUNDREDS[h]
  return construct ? constructDual(TWO_HUNDRED, grammaticalCase) : inflectDual(TWO_HUNDRED, grammaticalCase)
}

/**
 * Render a bare 1–999 with no noun attached (the units group of a plain
 * cardinal).
 * @param {number} g - Group value, 1–999
 * @param {Gender} gender - Gender the units agree with
 * @param {Case} grammaticalCase - Case of the number
 * @returns {string[]} The conjuncts
 */
function groupWords(g, gender, grammaticalCase) {
  const h = Math.trunc(g / 100)
  const r = g % 100
  const parts = h > 0 ? [hundredsWord(h, grammaticalCase, false)] : []
  if (r > 0) parts.push(...tensAndOnes(r, gender, grammaticalCase, false))
  return parts
}

/**
 * Render 1–999 counting a noun, the noun in the form its last number word
 * governs. When `construct` is set the noun is itself the head of a following
 * genitive (a scale word before a currency unit), so it takes its construct
 * forms: the dual drops its ن and the tamyīz loses its tanwīn.
 * @param {number} g - Group value, 1–999
 * @param {Noun} noun - The counted noun
 * @param {Case} grammaticalCase - Case of the number
 * @param {boolean} construct - Whether the noun heads a following genitive
 * @returns {string[]} The conjuncts, the noun already attached
 */
function groupWithNoun(g, noun, grammaticalCase, construct) {
  const h = Math.trunc(g / 100)
  const r = g % 100
  const dual = construct ? constructDual(noun.dual, grammaticalCase) : inflectDual(noun.dual, grammaticalCase)

  if (g === 1) return [nounForOne(noun)]
  if (g === 2) return [dual]

  // Exact hundreds, and hundreds followed by 1 or 2: the hundreds word heads
  // the noun in the singular ("مائة ريال"), and a trailing one or two repeats
  // the noun rather than fronting a bare numeral ("مائة ريال وريال واحد").
  const hundredsOfNoun = h > 0 ? hundredsWord(h, grammaticalCase, true) + ' ' + noun.singular : ''
  if (r === 0) return [hundredsOfNoun]
  if (h > 0 && r === 1) return [hundredsOfNoun, nounForOne(noun)]
  if (h > 0 && r === 2) return [hundredsOfNoun, dual]

  // 3–10 take the plural; 11–99 the singular accusative (tamyīz), whose
  // tanwīn a construct head sheds ("أحد عشر ألفاً" but "أحد عشر ألف ريال").
  const nounForm = r <= 10 ? noun.plural : (construct ? noun.singular : noun.tamyiz)
  const parts = h > 0 ? [hundredsWord(h, grammaticalCase, false)] : []
  parts.push(...tensAndOnes(r, noun.gender, grammaticalCase, r <= 10))
  parts[parts.length - 1] += ' ' + nounForm
  return parts
}

/**
 * Render a positive integer as conjuncts, optionally counting a noun that
 * follows the whole number (the currency unit). Higher groups count their
 * scale word; the noun attaches to the lowest group, or to the group above
 * it when the units are 1 or 2 ("ألف ريال وريال واحد").
 * @param {bigint} n - Positive integer
 * @param {Gender} gender - Gender the units agree with when there is no noun
 * @param {Case} grammaticalCase - Case of the number
 * @param {Noun | null} noun - The counted noun, or null for a bare cardinal
 * @returns {string[]} The conjuncts
 */
function integerToConjuncts(n, gender, grammaticalCase, noun) {
  const groups = []
  for (let rest = n; rest > 0n; rest /= 1000n) groups.push(Number(rest % 1000n))

  // Which group's scale word directly heads the noun: normally the lowest
  // non-zero group, but units of 1 or 2 defer to the group above and are
  // appended as "وريال واحد" / "وريالان" after it.
  const unitsRepeatNoun = noun !== null && groups.length > 1 && groups[0] > 0 && groups[0] <= 2
  const headLevel = noun === null ? -1 : groups.findIndex((g, level) => g > 0 && (level > 0 || !unitsRepeatNoun))

  const parts = []
  for (let level = groups.length - 1; level >= 0; level--) {
    const g = groups[level]
    if (g === 0) continue
    if (level === 0) {
      if (noun === null) parts.push(...groupWords(g, gender, grammaticalCase))
      else if (unitsRepeatNoun) parts.push(g === 1 ? nounForOne(noun) : inflectDual(noun.dual, grammaticalCase))
      else parts.push(...groupWithNoun(g, noun, grammaticalCase, false))
      continue
    }
    const heads = level === headLevel
    parts.push(...groupWithNoun(g, scaleNoun(level), grammaticalCase, heads))
    if (heads) parts[parts.length - 1] += ' ' + /** @type {Noun} */ (noun).singular
  }
  return parts
}

/**
 * Join conjuncts with و, which attaches to the following word: "مائة وخمسة".
 * @param {string[]} parts - The conjuncts
 * @returns {string} The joined phrase
 */
function joinConjuncts(parts) {
  return parts.join(' ' + AND)
}

/**
 * Convert a non-negative integer to Arabic words.
 * @param {bigint} n - The non-negative integer to convert
 * @param {Gender} gender - Gender the number agrees with
 * @param {Case} grammaticalCase - Case of the number
 * @returns {string} The number rendered as words
 */
function integerToWords(n, gender, grammaticalCase) {
  if (n === 0n) return ZERO
  return joinConjuncts(integerToConjuncts(n, gender, grammaticalCase, null))
}

/**
 * Convert the fractional digits of a number to Arabic words: leading zeros
 * digit by digit, then the remainder as one integer.
 * @param {string} decimalPart - The decimal digits (after the separator)
 * @param {Gender} gender - Gender the number agrees with
 * @param {Case} grammaticalCase - Case of the number
 * @returns {string} The decimal part rendered as words
 */
function decimalPartToWords(decimalPart, gender, grammaticalCase) {
  const parts = []
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    parts.push(ZERO)
    i++
  }
  const remainder = decimalPart.slice(i)
  if (remainder) parts.push(integerToWords(BigInt(remainder), gender, grammaticalCase))
  return parts.join(' ')
}

// ============================================================================
// CARDINAL: toCardinal(value, options?)
// ============================================================================

/**
 * @typedef {object} CardinalOptions
 * @property {Gender} [gender] - Grammatical gender of the counted noun
 * @property {Case} [case] - Grammatical case: nominative (اثنان وعشرون) or accusative/genitive (اثنين وعشرين)
 * @property {string} [negativeWord] - Custom word for negative numbers
 */

/** @type {Required<CardinalOptions>} */
export const cardinalDefaults = { gender: 'masculine', case: 'nominative', negativeWord: NEGATIVE }

/** @type {{ gender: ReadonlyArray<Required<CardinalOptions>['gender']>, case: ReadonlyArray<Required<CardinalOptions>['case']> }} */
export const cardinalValues = { gender: ['masculine', 'feminine'], case: ['nominative', 'accusative', 'genitive'] }

/**
 * Converts a numeric value to Arabic words.
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {CardinalOptions} [options] - Optional configuration
 * @returns {string} The number in Arabic words
 * @example
 * toCardinal(1)                           // 'واحد'
 * toCardinal(1, { gender: 'feminine' })   // 'واحدة'
 * toCardinal(22, { case: 'genitive' })    // 'اثنين وعشرين'
 */
function toCardinal(value, options) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  checkMax(integerPart, cardinalMax, decimalPart)
  const { gender, case: grammaticalCase, negativeWord } = resolveOptions(options, cardinalDefaults, cardinalValues)

  const parts = []
  if (isNegative) parts.push(negativeWord)
  parts.push(integerToWords(integerPart, gender, grammaticalCase))
  if (decimalPart) {
    parts.push(DECIMAL_SEP)
    parts.push(decimalPartToWords(decimalPart, gender, grammaticalCase))
  }
  return parts.join(' ')
}

// ============================================================================
// ORDINAL: toOrdinal(value, options?)
// ============================================================================

/**
 * Ordinal for 1–99: the dedicated forms for 1–10, compounds for 11–19
 * ("الحادي عشر"), and unit + definite ten for 21–99 ("الحادي والعشرون").
 * @param {number} r - Value in 1–99
 * @param {Gender} gender - Gender of the ordinal
 * @param {Case} grammaticalCase - Case of the ordinal
 * @param {boolean} compound - Whether "first" is in compound position (الحادي, not الأول)
 * @returns {string} The ordinal words
 */
function smallOrdinal(r, gender, grammaticalCase, compound) {
  const ordinals = gender === 'feminine' ? ORDINAL_FEM : ORDINAL_MASC
  const unit = r % 10
  const unitWord = unit === 1 ? ORDINAL_FIRST_COMPOUND[gender] : ordinals[unit]

  if (r <= 10) return compound && r === 1 ? unitWord : ordinals[r]
  if (r < 20) return unitWord + ' ' + TEEN_TEN[gender]

  const tensWord = DEFINITE + TENS_STEM[Math.trunc(r / 10)] + TENS_ENDING[grammaticalCase]
  return unit === 0 ? tensWord : unitWord + ' ' + AND + tensWord
}

/**
 * The definite cardinal ("المائة", "الألف والمائتين", "الثلاثة آلاف"): the
 * article goes on the first word of every conjunct.
 * @param {bigint} n - Positive integer
 * @param {Case} grammaticalCase - Case of the number
 * @returns {string} The definite cardinal
 */
function definiteCardinal(n, grammaticalCase) {
  return joinConjuncts(integerToConjuncts(n, 'masculine', grammaticalCase, null).map(part => DEFINITE + part))
}

/**
 * Gets the Arabic ordinal for a positive integer. Past 99 Arabic has no
 * dedicated forms: an exact multiple of 100 is the definite cardinal
 * ("المائة", "الألفان"), and anything else is the ordinal of the last two
 * digits followed by بعد and the genitive definite remainder — "الحادي
 * والعشرون بعد المائة", as the nights of ألف ليلة وليلة are numbered.
 * @param {bigint} n - Positive integer to convert
 * @param {Gender} gender - Gender of the ordinal
 * @param {Case} grammaticalCase - Case of the ordinal
 * @returns {string} Arabic ordinal words
 */
function integerToOrdinal(n, gender, grammaticalCase) {
  const r = Number(n % 100n)
  const base = n - BigInt(r)
  if (base === 0n) return smallOrdinal(r, gender, grammaticalCase, false)
  if (r === 0) return definiteCardinal(base, grammaticalCase)
  return smallOrdinal(r, gender, grammaticalCase, true) + ' ' + AFTER + ' ' + definiteCardinal(base, 'genitive')
}

/**
 * @typedef {object} OrdinalOptions
 * @property {Gender} [gender] - Grammatical gender of the ordinal
 * @property {Case} [case] - Grammatical case: nominative (الحادي والعشرون) or accusative/genitive (الحادي والعشرين)
 */

/** @type {Required<OrdinalOptions>} */
export const ordinalDefaults = { gender: 'masculine', case: 'nominative' }

/** @type {{ gender: ReadonlyArray<Required<OrdinalOptions>['gender']>, case: ReadonlyArray<Required<OrdinalOptions>['case']> }} */
export const ordinalValues = { gender: ['masculine', 'feminine'], case: ['nominative', 'accusative', 'genitive'] }

/**
 * Converts a numeric value to Arabic ordinal words.
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @param {OrdinalOptions} [options] - Optional configuration
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 * @example
 * toOrdinal(1)                           // 'الأول'
 * toOrdinal(1, { gender: 'feminine' })   // 'الأولى'
 * toOrdinal(21)                          // 'الحادي والعشرون'
 * toOrdinal(101)                         // 'الحادي بعد المائة'
 */
function toOrdinal(value, options) {
  const integerPart = parseOrdinalValue(value)
  checkMax(integerPart, ordinalMax)
  const { gender, case: grammaticalCase } = resolveOptions(options, ordinalDefaults, ordinalValues)
  return integerToOrdinal(integerPart, gender, grammaticalCase)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * @typedef {object} CurrencyOptions
 * @property {import('./utils/currency-vocab.js').ArCurrency} [currency] - ISO 4217 currency code to name the amount in
 * @property {Case} [case] - Grammatical case: nominative (ريالان) or accusative/genitive (ريالين), as after مبلغ
 */

/** @type {Required<CurrencyOptions>} */
export const currencyDefaults = { currency: 'SAR', case: 'nominative' }

/** @type {{ currency: ReadonlyArray<Required<CurrencyOptions>['currency']>, case: ReadonlyArray<Required<CurrencyOptions>['case']> }} */
export const currencyValues = {
  currency: /** @type {Required<CurrencyOptions>['currency'][]} */ (Object.keys(CURRENCY_VOCAB)),
  case: ['nominative', 'accusative', 'genitive'],
}

/**
 * Converts a numeric value to Arabic currency words (Saudi riyal by default).
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} [options] - Optional configuration
 * @returns {string} The amount in Arabic currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If the amount exceeds the supported range or has minor units the currency can't represent
 * @example
 * toCurrency(42.50)  // 'اثنان وأربعون ريالاً وخمسون هللة'
 * toCurrency(1)      // 'ريال واحد'
 * toCurrency(2000)   // 'ألفا ريال'
 * toCurrency(0.01)   // 'هللة واحدة'
 */
function toCurrency(value, options) {
  // Options resolve first: the currency decides how many decimal digits the
  // parser keeps, and a 1000-subunit currency (TND, KWD, ...) read at the
  // default 2 would turn '1.500' into 50 minor units instead of 500.
  const { currency, case: grammaticalCase } = resolveOptions(options, currencyDefaults, currencyValues)
  const { isNegative, dollars: majorCount, cents: minorCount } = parseCurrencyValue(value, minorUnitDigits(currency))
  checkMax(majorCount, currencyMax) // minor units are <= 999, safe
  assertCurrencyExponent(minorCount, currency)
  const { major, minor, majorGender, minorGender } = CURRENCY_VOCAB[currency]

  const parts = []
  if (majorCount > 0n || minorCount === 0n) {
    // Every ar entry sets majorGender and minorGender
    // (currency-vocab-contract.test.js enforces it for gender-sensitive
    // languages); narrow the optional matrix fields.
    const noun = currencyNoun(major, /** @type {Gender} */ (majorGender))
    if (majorCount === 0n) parts.push(ZERO + ' ' + noun.singular)
    else parts.push(...integerToConjuncts(majorCount, noun.gender, grammaticalCase, noun))
  }
  if (minorCount > 0n) {
    // assertCurrencyExponent already guaranteed minorCount is 0n whenever
    // minor is null, so reaching this branch implies a real array.
    const noun = currencyNoun(/** @type {string[]} */ (minor), /** @type {Gender} */ (minorGender))
    parts.push(...integerToConjuncts(minorCount, noun.gender, grammaticalCase, noun))
  }

  const words = joinConjuncts(parts)
  return isNegative ? NEGATIVE + ' ' + words : words
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
