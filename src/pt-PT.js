/**
 * Portuguese (Portugal) language converter
 *
 * CLDR: pt-PT | European Portuguese as used in Portugal
 *
 * Portuguese-specific rules:
 * - "e" conjunction everywhere: vinte e um, cento e um, mil e um
 * - "cem" for exact 100, "cento" for 100+ remainder
 * - Irregular hundreds: duzentos, trezentos, quatrocentos, etc.
 * - Long scale: milhão (10^6), mil milhões (10^9), bilião (10^12)
 * - Omit "um" before "mil", including "mil milhões"
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { checkMax } from './utils/check-max.js'
import { longScale, western } from './utils/scale.js'
import { resolveOptions } from './utils/resolve-options.js'
import { ptPT as CURRENCY_VOCAB, assertCurrencyExponent } from './utils/currency-vocab.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const TEENS = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove']
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']

// Irregular hundreds
const HUNDREDS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

const THOUSAND = 'mil'
const ZERO = 'zero'
const NEGATIVE = 'menos'
const DECIMAL_SEP = 'vírgula'

// Ordinal vocabulary
const ORDINAL_ONES = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono']
const ORDINAL_TEENS = ['décimo', 'décimo primeiro', 'décimo segundo', 'décimo terceiro', 'décimo quarto', 'décimo quinto', 'décimo sexto', 'décimo sétimo', 'décimo oitavo', 'décimo nono']
const ORDINAL_TENS = ['', '', 'vigésimo', 'trigésimo', 'quadragésimo', 'quinquagésimo', 'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo']
const ORDINAL_HUNDREDS = ['', 'centésimo', 'ducentésimo', 'tricentésimo', 'quadringentésimo', 'quingentésimo', 'sexcentésimo', 'septingentésimo', 'octingentésimo', 'nongentésimo']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 with Portuguese "e" rules.
 * Returns the word and whether it's an exact hundred (for "cem" handling).
 * @param {number} n - Number 0-999
 * @returns {{ word: string, isExactHundred: boolean, startsWithHundreds?: boolean }} The segment word and "e"/"cem" handling flags
 */
function buildSegment(n) {
  if (n === 0) return { word: '', isExactHundred: false }

  // Special case: exact 100 is "cem"
  if (n === 100) return { word: 'cem', isExactHundred: true }

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds])
  }

  // Tens and ones
  if (tens === 1) {
    // Teens (10-19)
    parts.push(TEENS[ones])
  }
  else if (tens >= 2) {
    if (ones > 0) {
      // Tens + ones with "e": "vinte e um"
      parts.push(TENS[tens] + ' e ' + ONES[ones])
    }
    else {
      parts.push(TENS[tens])
    }
  }
  else if (ones > 0) {
    parts.push(ONES[ones])
  }

  // Join hundreds with "e": "cento e um", "duzentos e trinta e um"
  const word = parts.join(' e ')

  return { word, isExactHundred: hundreds > 0 && tens === 0 && ones === 0, startsWithHundreds: n >= 100 }
}

// ============================================================================
// Scale Word Lookup
// ============================================================================

// Long scale: each word is a million times the previous one, so the number in
// front of it runs up to 999 999 ("mil e quinhentos milhões" for 1.5 × 10^9).
// Index 0 = 10^6, 1 = 10^12, 2 = 10^18, 3 = 10^24.
const SCALES_SINGULAR = ['milhão', 'bilião', 'trilião', 'quatrilião']
const SCALES_PLURAL = ['milhões', 'biliões', 'triliões', 'quatriliões']

// Scale ordinal words by 3-digit group (long scale for pt-PT). Module-scope so
// its length can derive the ordinal ceiling and so it isn't rebuilt on every call.
const SCALE_ORDINAL = ['', 'milésimo', 'milionésimo', 'mil milionésimo', 'bilionésimo', 'mil bilionésimo', 'trilionésimo']

// Supported magnitude ceilings (checked at the public entry points). The last
// scale word (quatrilião, 10^24) takes a multiplier up to 999 999, so
// cardinals/currency must stay below 10^30. The ordinal of a number whose
// lowest non-zero group is a scale group uses SCALE_ORDINAL, which is shorter,
// so ordinals must stay below 10^(SCALE_ORDINAL.length * 3).
export const cardinalMax = longScale(SCALES_SINGULAR.length)
export const ordinalMax = western(SCALE_ORDINAL.length - 1)
export const currencyMax = longScale(SCALES_SINGULAR.length)

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Portuguese words.
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Portuguese words
 */
function integerToWords(n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    return buildGroup(Number(n))
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for 1-999 999, the multiplier in front of a scale word.
 * @param {number} n - Number 1-999 999
 * @returns {string} Portuguese words
 */
function buildGroup(n) {
  if (n < 1000) {
    return buildSegment(n).word
  }

  const thousands = Math.trunc(n / 1000)
  const remainder = n % 1000

  // "mil" not "um mil"
  let result = thousands === 1 ? THOUSAND : buildSegment(thousands).word + ' ' + THOUSAND

  if (remainder > 0) {
    const remainderResult = buildSegment(remainder)
    // "e" before a remainder below 100 or a round hundred: "mil e um", "mil e oitocentos"
    if (!remainderResult.startsWithHundreds || remainderResult.isExactHundred) {
      result += ' e ' + remainderResult.word
    }
    else {
      result += ' ' + remainderResult.word
    }
  }

  return result
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster group extraction.
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Portuguese words
 */
function buildLargeNumberWords(n) {
  // 6-digit groups, least significant first (index 0 = below a million,
  // 1 = milhões, 2 = biliões, etc.)
  const groups = []
  let temp = n
  while (temp > 0n) {
    groups.push(Number(temp % 1_000_000n))
    temp = temp / 1_000_000n
  }

  let lowest = 0
  while (groups[lowest] === 0) lowest++

  let result = ''

  for (let i = groups.length - 1; i >= lowest; i--) {
    const group = groups[i]
    if (group === 0) continue

    if (result) {
      // "e" before the last group when its only non-zero 3 digits are below
      // 100 or a round hundred: "um milhão e quinhentos mil", "mil milhões e cem"
      const upper = Math.trunc(group / 1000)
      const lower = group % 1000
      const single = upper === 0 ? lower : lower === 0 ? upper : 0
      result += i === lowest && single > 0 && (single < 100 || single % 100 === 0) ? ' e ' : ' '
    }

    if (i === 0) {
      result += buildGroup(group)
    }
    else if (group === 1) {
      result += 'um ' + SCALES_SINGULAR[i - 1]
    }
    else {
      result += buildGroup(group) + ' ' + SCALES_PLURAL[i - 1]
    }
  }

  return result
}

/**
 * Converts decimal digits to Portuguese words.
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Portuguese words for decimal part
 */
function decimalPartToWords(decimalPart) {
  let result = ''

  // Handle leading zeros
  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  // Convert remainder as a single number
  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    result += integerToWords(BigInt(remainder))
  }

  return result
}

/**
 * Converts a numeric value to Portuguese words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Portuguese words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 * @example
 * toCardinal(21)           // 'vinte e um'
 * toCardinal(100)          // 'cem'
 * toCardinal(1000000)      // 'um milhão'
 */
function toCardinal(value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  // Both the integer part and the decimal's significant digits are spelled via
  // the scale builder, so both must clear the ceiling.
  checkMax(integerPart, cardinalMax, decimalPart)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Ordinal Functions
// ============================================================================

/**
 * @typedef {object} OrdinalWords
 * @property {string[]} ones - Ordinals 0-9
 * @property {string[]} teens - Ordinals 10-19
 * @property {string[]} tens - Ordinals of the tens, by tens digit
 * @property {string[]} hundreds - Ordinals of the hundreds, by hundreds digit
 * @property {string[]} scale - Ordinals of the scale words, by 3-digit group
 */

/**
 * Turns every masculine ordinal word into its feminine: "décimo primeiro" → "décima primeira".
 * @param {string} words - Masculine ordinal words
 * @returns {string} Feminine ordinal words
 */
function feminineOrdinal(words) {
  return words.replace(/o(?= |$)/g, 'a')
}

/** @type {OrdinalWords} */
const MASCULINE_ORDINALS = { ones: ORDINAL_ONES, teens: ORDINAL_TEENS, tens: ORDINAL_TENS, hundreds: ORDINAL_HUNDREDS, scale: SCALE_ORDINAL }

/** @type {OrdinalWords} */
const FEMININE_ORDINALS = {
  ones: /* @__PURE__ */ ORDINAL_ONES.map(feminineOrdinal),
  teens: /* @__PURE__ */ ORDINAL_TEENS.map(feminineOrdinal),
  tens: /* @__PURE__ */ ORDINAL_TENS.map(feminineOrdinal),
  hundreds: /* @__PURE__ */ ORDINAL_HUNDREDS.map(feminineOrdinal),
  scale: /* @__PURE__ */ SCALE_ORDINAL.map(feminineOrdinal),
}

/**
 * Makes cardinal words agree with a feminine noun: "um" → "uma", "dois" → "duas",
 * "duzentos" → "duzentas".
 * @param {string} words - Masculine cardinal words
 * @returns {string} Feminine cardinal words
 */
function feminineCardinal(words) {
  return words.split(' ').map((word) => {
    if (word === 'um') return 'uma'
    if (word === 'dois') return 'duas'
    return word.endsWith('entos') ? word.slice(0, -2) + 'as' : word
  }).join(' ')
}

/**
 * Builds ordinal words for 0-999.
 * @param {number} n - Number 0-999
 * @param {OrdinalWords} t - Ordinal words of the requested gender
 * @returns {string} Portuguese ordinal words
 */
function buildOrdinalSegment(n, t) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  const parts = []

  // Hundreds ordinal
  if (hundreds > 0) {
    parts.push(t.hundreds[hundreds])
  }

  // Tens and ones
  if (tens === 1) {
    // 10-19: use teens array (décimo, décimo primeiro, etc.)
    parts.push(t.teens[ones])
  }
  else if (tens >= 2) {
    parts.push(t.tens[tens])
    if (ones > 0) {
      parts.push(t.ones[ones])
    }
  }
  else if (ones > 0) {
    parts.push(t.ones[ones])
  }

  return parts.join(' ')
}

/**
 * Builds ordinal words for 1-999 999 after another ordinal: "milésimo centésimo".
 * @param {number} n - Number 1-999 999
 * @param {OrdinalWords} t - Ordinal words of the requested gender
 * @returns {string} Portuguese ordinal words
 */
function buildOrdinalGroup(n, t) {
  if (n < 1000) return buildOrdinalSegment(n, t)

  const thousands = Math.trunc(n / 1000)
  const remainder = n % 1000
  const words = thousands === 1 ? t.scale[1] : buildOrdinalSegment(thousands, t) + ' ' + t.scale[1]
  return remainder === 0 ? words : words + ' ' + buildOrdinalSegment(remainder, t)
}

/**
 * Builds ordinal words for numbers >= 1000. From 2000 on, the first numeral is
 * a cardinal and every later one an ordinal ("dois milésimo tricentésimo
 * quadragésimo quinto"); a round number keeps an ordinal multiplier
 * ("segundo milésimo", "décimo milésimo").
 * @param {bigint} n - Integer >= 1000
 * @param {OrdinalWords} t - Ordinal words of the requested gender
 * @param {boolean} feminine - Whether the leading cardinal agrees with a feminine noun
 * @returns {string} Portuguese ordinal words
 */
function buildLargeOrdinal(n, t, feminine) {
  // Extract segments
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  let lowest = 0
  while (segments[lowest] === 0) lowest++

  // A "mil" group of the long scale (odd index from 3: mil milhões, mil
  // biliões) joins the group below it, as in the cardinal: 1.5 × 10^9 is
  // "mil e quinhentos milionésimo".
  let i = segments.length - 1
  let first = segments[i]
  if (i >= 3 && i % 2 === 1 && segments[i - 1] !== 0) {
    first = first * 1000 + segments[--i]
  }
  else if (i === lowest) {
    return first === 1 ? t.scale[i] : buildOrdinalSegment(first, t) + ' ' + t.scale[i]
  }

  let result = t.scale[i]
  if (first !== 1) {
    const multiplier = buildGroup(first)
    result = (feminine ? feminineCardinal(multiplier) : multiplier) + ' ' + result
  }

  // After the first numeral, a "mil" group always reads with the group below
  // it, as an ordinal of thousands: "bilionésimo milésimo milionésimo",
  // "bilionésimo milésimo quingentésimo milionésimo".
  for (i--; i >= lowest; i--) {
    let value = segments[i]
    if (i >= 3 && i % 2 === 1) {
      value = value * 1000 + segments[--i]
    }
    if (value === 0) continue
    if (i === 0) {
      result += ' ' + buildOrdinalSegment(value, t)
    }
    else {
      result += ' ' + (value === 1 ? t.scale[i] : buildOrdinalGroup(value, t) + ' ' + t.scale[i])
    }
  }

  return result
}

/**
 * @typedef {object} OrdinalOptions
 * @property {('masculine'|'feminine')} [gender] - Grammatical gender of the ordinal
 */

/** @type {Required<OrdinalOptions>} */
export const ordinalDefaults = { gender: 'masculine' }

/** @type {{ gender: ReadonlyArray<Required<OrdinalOptions>['gender']> }} */
export const ordinalValues = { gender: ['masculine', 'feminine'] }

/**
 * Converts a number to Portuguese ordinal words.
 * @param {number | string | bigint} value - The number to convert
 * @param {OrdinalOptions} [options] - Ordinal options
 * @returns {string} Portuguese ordinal words
 * @example
 * toOrdinal(1)                           // 'primeiro'
 * toOrdinal(21)                          // 'vigésimo primeiro'
 * toOrdinal(2345)                        // 'dois milésimo tricentésimo quadragésimo quinto'
 * toOrdinal(21, { gender: 'feminine' })  // 'vigésima primeira'
 */
function toOrdinal(value, options) {
  const n = parseOrdinalValue(value)
  checkMax(n, ordinalMax)
  const { gender } = resolveOptions(options, ordinalDefaults, ordinalValues)
  const feminine = gender === 'feminine'
  const t = feminine ? FEMININE_ORDINALS : MASCULINE_ORDINALS

  // Fast path: 1-9
  if (n < 10n) {
    return t.ones[Number(n)]
  }

  // Fast path: 10-19
  if (n < 20n) {
    return t.teens[Number(n) - 10]
  }

  // Fast path: 20-99
  if (n < 100n) {
    const ones = Number(n % 10n)
    const tens = Number(n / 10n)
    if (ones === 0) {
      return t.tens[tens]
    }
    return t.tens[tens] + ' ' + t.ones[ones]
  }

  // Fast path: 100-999
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n), t)
  }

  // Large numbers
  return buildLargeOrdinal(n, t, feminine)
}

// ============================================================================
// Currency Functions
// ============================================================================

/**
 * @typedef {object} CurrencyOptions
 * @property {boolean} [and] - Include "e" between euros and cents
 * @property {import('./utils/currency-vocab.js').PtPTCurrency} [currency] - ISO 4217 currency code to name the amount in
 */

/** @type {Required<CurrencyOptions>} */
export const currencyDefaults = { and: true, currency: 'EUR' }

/** @type {{ currency: ReadonlyArray<Required<CurrencyOptions>['currency']> }} */
export const currencyValues = { currency: /** @type {Required<CurrencyOptions>['currency'][]} */ (Object.keys(CURRENCY_VOCAB)) }

/**
 * Converts a number to Portuguese currency words (Euro).
 * @param {number | string | bigint} value - The amount to convert
 * @param {CurrencyOptions} [options] Currency formatting options
 * @returns {string} Portuguese currency words
 * @example
 * toCurrency(42.50)  // 'quarenta e dois euros e cinquenta cêntimos'
 * toCurrency(1)      // 'um euro'
 * toCurrency(0.01)   // 'um cêntimo'
 */
function toCurrency(value, options) {
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)
  checkMax(euros, currencyMax)
  const { and, currency } = resolveOptions(options, currencyDefaults, currencyValues)
  assertCurrencyExponent(cents, currency)
  const { major, minor } = CURRENCY_VOCAB[currency]

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  const hasEuros = euros > 0n
  const hasCents = cents > 0n

  if (!hasEuros && !hasCents) {
    return ZERO + ' ' + major[1]
  }

  if (hasEuros) {
    const euroWords = integerToWords(euros)
    const euroUnit = euros === 1n ? major[0] : major[1]
    // Milhão and the scale words above it are nouns: a round number of them
    // takes "de" before what it counts ("um milhão de euros"), unlike
    // "um milhão e quinhentos mil euros".
    const preposition = euros >= 1_000_000n && euros % 1_000_000n === 0n ? ' de ' : ' '
    result += euroWords + preposition + euroUnit
  }

  if (hasCents) {
    if (hasEuros) {
      result += and ? ' e ' : ' '
    }
    const centWords = integerToWords(cents)
    const centUnit = cents === 1n ? (/** @type {string[]} */ (minor))[0] : (/** @type {string[]} */ (minor))[1]
    result += centWords + ' ' + centUnit
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
