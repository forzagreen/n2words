/**
 * Portuguese (Brazil) language converter
 *
 * CLDR: pt-BR | Brazilian Portuguese as used in Brazil
 *
 * Portuguese-specific rules:
 * - "e" conjunction between units, tens and hundreds: vinte e um, cento e um
 * - "cem" for exact 100, "cento" for 100+ remainder
 * - Irregular hundreds: duzentos, trezentos, quatrocentos, etc.
 * - Short scale: milhão (10^6), bilhão (10^9), trilhão (10^12)
 * - Omit "um" before "mil"
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { checkMax } from './utils/check-max.js'
import { western } from './utils/scale.js'
import { resolveOptions } from './utils/resolve-options.js'
import { ptBR as CURRENCY_VOCAB, assertCurrencyExponent } from './utils/currency-vocab.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const TEENS = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
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
 * @returns {{word: string, isExactHundred: boolean, startsWithHundreds?: boolean}} The segment word and hundred-related flags
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
// Scale Word Lookup (Short Scale for pt-BR)
// ============================================================================

// Precompute scale words for singular and plural forms
// Index 1 = thousands, 2 = millions, 3 = billions (10^9), etc.
const SCALE_WORDS_SINGULAR = [
  '', // 0 unused
  THOUSAND, // 1: mil
  'milhão', // 2: 10^6
  'bilhão', // 3: 10^9
  'trilhão', // 4: 10^12
  'quatrilhão', // 5: 10^15
  'quintilhão', // 6: 10^18
  'sextilhão', // 7: 10^21
  'setilhão', // 8: 10^24
]

const SCALE_WORDS_PLURAL = [
  '', // 0 unused
  THOUSAND, // 1: mil (same)
  'milhões', // 2: 10^6
  'bilhões', // 3: 10^9
  'trilhões', // 4: 10^12
  'quatrilhões', // 5: 10^15
  'quintilhões', // 6: 10^18
  'sextilhões', // 7: 10^21
  'setilhões', // 8: 10^24
]

// Scale ordinal words (short scale for pt-BR). Module-scope so its length can
// derive the ordinal ceiling and so it isn't rebuilt on every call.
const SCALE_ORDINAL = ['', 'milésimo', 'milionésimo', 'bilionésimo', 'trilionésimo', 'quatrilionésimo', 'quintilionésimo', 'sextilionésimo']

// Supported magnitude ceilings (checked at the public entry points). Cardinal
// scale words reach index SCALE_WORDS_SINGULAR.length-1 (setilhão, 10^24), so
// cardinals/currency must stay below 10^27. The ordinal of a number whose
// lowest non-zero group is a scale group uses SCALE_ORDINAL, which is shorter,
// so ordinals must stay below 10^(SCALE_ORDINAL.length * 3).
export const cardinalMax = western(SCALE_WORDS_SINGULAR.length - 1)
export const ordinalMax = western(SCALE_ORDINAL.length - 1)
export const currencyMax = western(SCALE_WORDS_SINGULAR.length - 1)

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

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "mil" not "um mil"
      result = THOUSAND
    }
    else {
      result = buildSegment(thousands).word + ' ' + THOUSAND
    }

    if (remainder > 0) {
      const remainderResult = buildSegment(remainder)
      // REGRA DO "E": Menor que 100 OU Centena Exata (ex: 500)
      if (!remainderResult.startsWithHundreds || remainderResult.isExactHundred) {
        result += ' e ' + remainderResult.word
      }
      else {
        result += ' ' + remainderResult.word
      }
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 * Uses BigInt division for faster segment extraction.
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Portuguese words
 */
function buildLargeNumberWords(n) {
  // Extract segments using BigInt division
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the first non-zero segment index
  let firstNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      firstNonZeroIdx = i
      break
    }
  }

  let result = ''
  let prevWasScale = false

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const segmentResult = buildSegment(segment)
    const isLastSegment = (i === firstNonZeroIdx)

    // REGRA DO "E": Se for o último segmento e for < 100 OU centena exata (ex: 500)
    if (result && isLastSegment && prevWasScale && (!segmentResult.startsWithHundreds || segmentResult.isExactHundred)) {
      result += ' e'
    }

    if (result) result += ' '

    if (i === 0) {
      // Units segment
      result += segmentResult.word
      prevWasScale = false
    }
    else if (i === 1) {
      // Thousands
      if (segment === 1) {
        result += THOUSAND
      }
      else {
        result += segmentResult.word + ' ' + THOUSAND
      }
      prevWasScale = true
    }
    else {
      // Million and above
      const scaleWord = segment === 1 ? SCALE_WORDS_SINGULAR[i] : SCALE_WORDS_PLURAL[i]
      if (segment === 1) {
        result += 'um ' + scaleWord
      }
      else {
        result += segmentResult.word + ' ' + scaleWord
      }
      prevWasScale = true
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
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Portuguese words
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

  const top = segments.length - 1
  const first = segments[top]

  if (top === lowest) {
    return first === 1 ? t.scale[top] : buildOrdinalSegment(first, t) + ' ' + t.scale[top]
  }

  let result = t.scale[top]
  if (first !== 1) {
    const multiplier = buildSegment(first).word
    result = (feminine ? feminineCardinal(multiplier) : multiplier) + ' ' + result
  }

  for (let i = top - 1; i >= lowest; i--) {
    const segment = segments[i]
    if (segment === 0) continue
    if (i === 0) {
      result += ' ' + buildOrdinalSegment(segment, t)
    }
    else {
      result += ' ' + (segment === 1 ? t.scale[i] : buildOrdinalSegment(segment, t) + ' ' + t.scale[i])
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
 * @property {boolean} [and] - Include "e" between major and minor units
 * @property {import('./utils/currency-vocab.js').PtBRCurrency} [currency] - ISO 4217 currency code to name the amount in
 */

/** @type {Required<CurrencyOptions>} */
export const currencyDefaults = { and: true, currency: 'BRL' }

/** @type {{ currency: ReadonlyArray<Required<CurrencyOptions>['currency']> }} */
export const currencyValues = { currency: /** @type {Required<CurrencyOptions>['currency'][]} */ (Object.keys(CURRENCY_VOCAB)) }

/**
 * Converts a number to Brazilian Portuguese currency words.
 * @param {number | string | bigint} value - The amount to convert
 * @param {CurrencyOptions} [options] Currency formatting options
 * @returns {string} Brazilian Portuguese currency words
 * @example
 * toCurrency(42.50)                    // 'quarenta e dois reais e cinquenta centavos'
 * toCurrency(42.50, {currency: 'USD'}) // 'quarenta e dois dólares e cinquenta centavos'
 */
function toCurrency(value, options) {
  const { isNegative, dollars: majorUnits, cents: minorUnits } = parseCurrencyValue(value)
  checkMax(majorUnits, currencyMax)
  const { and, currency } = resolveOptions(options, currencyDefaults, currencyValues)
  assertCurrencyExponent(minorUnits, currency)

  const currencyWords = CURRENCY_VOCAB[currency]

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  const hasMajor = majorUnits > 0n
  const hasMinor = minorUnits > 0n

  if (!hasMajor && !hasMinor) {
    return ZERO + ' ' + currencyWords.major[1]
  }

  // Parte inteira (Reais, Dólares...)
  if (hasMajor) {
    const majorText = integerToWords(majorUnits)
    const majorUnit = majorUnits === 1n ? currencyWords.major[0] : currencyWords.major[1]
    // Milhão and the scale words above it are nouns: a round number of them
    // takes "de" before what it counts ("um milhão de reais"), unlike
    // "um milhão e quinhentos mil reais".
    const preposition = majorUnits >= 1_000_000n && majorUnits % 1_000_000n === 0n ? ' de ' : ' '
    result += majorText + preposition + majorUnit
  }

  // Parte decimal (Centavos...) — assertCurrencyExponent already guarantees
  // minorUnits is 0n whenever currencyWords.minor is null, so hasMinor here
  // implies a real minor-unit word list.
  if (hasMinor) {
    if (hasMajor) {
      result += and ? ' e ' : ' '
    }
    const minorText = integerToWords(minorUnits)
    // assertCurrencyExponent already guarantees minorUnits is 0n whenever
    // currencyWords.minor is null, so hasMinor here implies a real array.
    const minorForms = /** @type {string[]} */ (currencyWords.minor)
    const minorUnit = minorUnits === 1n ? minorForms[0] : minorForms[1]
    result += minorText + ' ' + minorUnit
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
