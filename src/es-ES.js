/**
 * Spanish (Spain) language converter
 *
 * CLDR: es-ES | Spanish as used in Spain
 *
 * Uses the European long scale numbering system:
 * - 10⁶ = millón
 * - 10⁹ = mil millones (thousand millions)
 * - 10¹² = billón
 *
 * Spanish-specific rules:
 * - Gender agreement: uno/una, veintiuno/veintiuna, hundreds
 * - Special twenties: veinte, veintiuno, veintidós, ... veintinueve
 * - "y" conjunction: treinta y uno (only 30-99 with ones)
 * - "cien" for exact 100, "ciento" otherwise ("ciento" is invariable; only 200-900 agree)
 * - Irregular hundreds: quinientos, setecientos, novecientos
 * - Apocopation: "uno" shortens to "un" before a masculine noun, and a scale
 *   word or currency noun is exactly that — "veintiún mil", "treinta y un
 *   millones", "veintiún euros". A multiplier of exactly 1 is dropped before
 *   "mil" ("mil", not "un mil") but kept before "millón" ("un millón").
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { checkMax } from './utils/check-max.js'
import { bounded, longScale } from './utils/scale.js'
import { resolveOptions } from './utils/resolve-options.js'
import { es as CURRENCY_VOCAB, assertCurrencyExponent } from './utils/currency-vocab.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ONES_FEM = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
// Apocopated masculine: only the ones digit changes, and only before a noun.
// The feminine forms never apocopate ("veintiuna casas", "treinta y una casas").
const ONES_MASC_APOC = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']

const TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']

// 20-29 have special compound forms
const TWENTIES_MASC = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const TWENTIES_FEM = ['veinte', 'veintiuna', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const TWENTIES_MASC_APOC = ['veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']

const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']

// Irregular hundreds
const HUNDREDS_MASC = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']
const HUNDREDS_FEM = ['', 'ciento', 'doscientas', 'trescientas', 'cuatrocientas', 'quinientas', 'seiscientas', 'setecientas', 'ochocientas', 'novecientas']

// Scale words (compound long scale)
const SCALES = ['millón', 'billón', 'trillón', 'cuatrillón']
const SCALES_PLURAL = ['millones', 'billones', 'trillones', 'cuatrillones']

// Supported magnitude ceilings (checked at the public entry points). Each
// SCALES entry spans two segment groups (X and "mil X"); with the units group
// that's 2 * SCALES.length + 2 groups of 3 digits, so cardinals must stay below
// 10^30. Ordinals are bounded lower: the millions multiplier is a single
// fused segment (0-999, dosmillonésimo), so n must stay below 10^9.
export const cardinalMax = longScale(SCALES.length)
export const ordinalMax = bounded(9)
export const currencyMax = longScale(SCALES.length)

const THOUSAND = 'mil'
const ZERO = 'cero'
const NEGATIVE = 'menos'
const DECIMAL_SEP = 'punto'

// Ordinal vocabulary, as the RAE writes it (Ortografía 2010, DPD "ordinales").
// Spanish ordinals agree in gender: primero/primera, segundo/segunda.
// 11-29 are single words in which only the last element inflects
// (decimosexta, vigesimoprimera); from 30 on, tens and units are separate
// words that both inflect (trigésima primera).
const ORDINAL_ONES_MASC = ['', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno']
const ORDINAL_ONES_FEM = ['', 'primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena']
const ORDINAL_TEENS_MASC = ['décimo', 'undécimo', 'duodécimo', 'decimotercero', 'decimocuarto', 'decimoquinto', 'decimosexto', 'decimoséptimo', 'decimoctavo', 'decimonoveno']
const ORDINAL_TEENS_FEM = ['décima', 'undécima', 'duodécima', 'decimotercera', 'decimocuarta', 'decimoquinta', 'decimosexta', 'decimoséptima', 'decimoctava', 'decimonovena']
const ORDINAL_TWENTIES_MASC = ['vigésimo', 'vigesimoprimero', 'vigesimosegundo', 'vigesimotercero', 'vigesimocuarto', 'vigesimoquinto', 'vigesimosexto', 'vigesimoséptimo', 'vigesimoctavo', 'vigesimonoveno']
const ORDINAL_TWENTIES_FEM = ['vigésima', 'vigesimoprimera', 'vigesimosegunda', 'vigesimotercera', 'vigesimocuarta', 'vigesimoquinta', 'vigesimosexta', 'vigesimoséptima', 'vigesimoctava', 'vigesimonovena']
const ORDINAL_TENS_MASC = ['', 'décimo', 'vigésimo', 'trigésimo', 'cuadragésimo', 'quincuagésimo', 'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo']
const ORDINAL_TENS_FEM = ['', 'décima', 'vigésima', 'trigésima', 'cuadragésima', 'quincuagésima', 'sexagésima', 'septuagésima', 'octogésima', 'nonagésima']
const ORDINAL_HUNDREDS_MASC = ['', 'centésimo', 'ducentésimo', 'tricentésimo', 'cuadringentésimo', 'quingentésimo', 'sexcentésimo', 'septingentésimo', 'octingentésimo', 'noningentésimo']
const ORDINAL_HUNDREDS_FEM = ['', 'centésima', 'ducentésima', 'tricentésima', 'cuadringentésima', 'quingentésima', 'sexcentésima', 'septingentésima', 'octingentésima', 'noningentésima']
// Cardinal multipliers fused into "milésimo"/"millonésimo" (dosmilésimo,
// veintidosmilésimo): masculine, apocopated, and without written accents.
const FUSED_ONES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const FUSED_TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve']
const FUSED_TWENTIES = ['veinte', 'veintiun', 'veintidos', 'veintitres', 'veinticuatro', 'veinticinco', 'veintiseis', 'veintisiete', 'veintiocho', 'veintinueve']
const ORDINAL_THOUSAND_MASC = 'milésimo'
const ORDINAL_THOUSAND_FEM = 'milésima'
const ORDINAL_MILLION_MASC = 'millonésimo'
const ORDINAL_MILLION_FEM = 'millonésima'

const CURRENCY_CONNECTOR = 'con'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999.
 * @param {number} n - Segment value
 * @param {boolean} feminine - Use feminine forms
 * @param {boolean} [apocopate] - The segment is immediately followed by a
 *   masculine noun (a scale word, a currency name), so a trailing "uno"
 *   shortens to "un" and "veintiuno" to "veintiún". Ignored when feminine.
 * @returns {string} Spanish word
 */
function buildSegment(n, feminine, apocopate = false) {
  if (n === 0) return ''

  // Special case: exact 100 is "cien" (no gender)
  if (n === 100) return 'cien'

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)
  const tensOnes = n % 100

  const masculineOnes = apocopate ? ONES_MASC_APOC : ONES_MASC
  const masculineTwenties = apocopate ? TWENTIES_MASC_APOC : TWENTIES_MASC

  const parts = []

  // Hundreds
  if (hundreds > 0) {
    const hundredsArr = feminine ? HUNDREDS_FEM : HUNDREDS_MASC
    parts.push(hundredsArr[hundreds])
  }

  // Tens and ones
  if (tensOnes === 0) {
    // Just hundreds
  }
  else if (tensOnes < 10) {
    // Single digit
    const onesArr = feminine ? ONES_FEM : masculineOnes
    parts.push(onesArr[tensOnes])
  }
  else if (tensOnes < 20) {
    // 10-19: teens
    parts.push(TEENS[ones])
  }
  else if (tensOnes < 30) {
    // 20-29: special twenties
    const twentiesArr = feminine ? TWENTIES_FEM : masculineTwenties
    parts.push(twentiesArr[ones])
  }
  else {
    // 30-99: tens y ones
    if (ones === 0) {
      parts.push(TENS[tens])
    }
    else {
      const onesArr = feminine ? ONES_FEM : masculineOnes
      parts.push(TENS[tens] + ' y ' + onesArr[ones])
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Builds words for 0-999999, the block each long-scale word multiplies.
 * @param {number} n - Value 0-999999
 * @param {boolean} feminine - Use feminine forms
 * @param {boolean} apocopate - A masculine noun follows the block
 * @returns {string} Spanish words
 */
function buildBelowMillion(n, feminine, apocopate) {
  if (n < 1000) return buildSegment(n, feminine, apocopate)

  const thousands = Math.trunc(n / 1000)
  const remainder = n % 1000

  // "mil", not "un mil". Otherwise "mil" is a masculine noun to the
  // multiplier in front of it: masculine forms regardless of the requested
  // gender, and apocopated — "veintiún mil", "treinta y un mil".
  let result = thousands === 1 ? THOUSAND : buildSegment(thousands, false, true) + ' ' + THOUSAND

  if (remainder > 0) {
    result += ' ' + buildSegment(remainder, feminine, apocopate)
  }

  return result
}

/**
 * Converts a non-negative integer to Spanish words.
 * @param {bigint} n - Non-negative integer to convert
 * @param {boolean} feminine - Use feminine forms
 * @param {boolean} [beforeNoun] - The whole number is followed by a noun (a
 *   currency name), so its trailing segment apocopates: "veintiún euros".
 *   A standalone numeral doesn't: toCardinal(21) is "veintiuno".
 * @returns {string} Spanish words
 */
function integerToWords(n, feminine, beforeNoun = false) {
  if (n === 0n) return ZERO

  if (n < 1_000_000n) {
    return buildBelowMillion(Number(n), feminine, beforeNoun)
  }

  return buildLargeNumberWords(n, feminine, beforeNoun)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * Long scale: each scale word is a million times the previous one, so n
 * splits into 6-digit groups, each read whole in front of its scale word —
 * 2_500_000_000 is "dos mil quinientos millones". The multiplier is kept and
 * apocopated: "un millón", "veintiún millones", "mil un millones".
 * @param {bigint} n - Number >= 1,000,000
 * @param {boolean} feminine - Use feminine forms
 * @param {boolean} [beforeNoun] - A noun follows the units group
 * @returns {string} Spanish words
 */
function buildLargeNumberWords(n, feminine, beforeNoun = false) {
  // Groups stored least-significant first (index 0 = units, 1 = millones, ...).
  // Callers guard the magnitude (cardinalMax) before reaching here.
  const groups = []
  let temp = n
  while (temp > 0n) {
    groups.push(Number(temp % 1_000_000n))
    temp = temp / 1_000_000n
  }

  let result = ''

  for (let i = groups.length - 1; i > 0; i--) {
    const group = groups[i]
    if (group === 0) continue

    if (result) result += ' '
    result += buildBelowMillion(group, false, true) + ' ' + (group === 1 ? SCALES[i - 1] : SCALES_PLURAL[i - 1])
  }

  if (groups[0] > 0) {
    result += ' ' + buildBelowMillion(groups[0], feminine, beforeNoun)
  }

  return result
}

/**
 * Converts decimal digits to Spanish words.
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish words for decimal part
 */
function decimalPartToWords(decimalPart, feminine) {
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
    result += integerToWords(BigInt(remainder), feminine)
  }

  return result
}

/**
 * @typedef {object} CardinalOptions
 * @property {('masculine'|'feminine')} [gender] - Grammatical gender
 */

/** @type {Required<CardinalOptions>} */
export const cardinalDefaults = { gender: 'masculine' }

/** @type {{ gender: ReadonlyArray<Required<CardinalOptions>['gender']> }} */
export const cardinalValues = { gender: ['masculine', 'feminine'] }

/**
 * Converts a numeric value to Spanish words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {CardinalOptions} [options] - Optional configuration
 * @returns {string} The number in Spanish words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 * @example
 * toCardinal(21)                        // 'veintiuno'
 * toCardinal(21, {gender: 'feminine'})  // 'veintiuna'
 * toCardinal(1000000)                   // 'un millón'
 */
function toCardinal(value, options) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)
  // Both the integer part and the decimal's significant digits are spelled via
  // the scale builder, so both must clear the ceiling.
  checkMax(integerPart, cardinalMax, decimalPart)

  // Apply option defaults
  const { gender } = resolveOptions(options, cardinalDefaults, cardinalValues)
  const feminine = gender === 'feminine'

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, feminine)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, feminine)
  }

  return result
}

// ============================================================================
// ORDINAL: toOrdinal(value, options?)
// ============================================================================

/**
 * Builds ordinal word for a 0-999 segment.
 *
 * - 11th = "undécimo", 16th = "decimosexto", 21st = "vigesimoprimero"
 * - 31st = "trigésimo primero"
 * - 500th = "quingentésimo", 501st = "quingentésimo primero"
 * @param {number} n - Segment value 0-999
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish ordinal word
 */
function buildOrdinalSegment(n, feminine) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  const parts = []

  if (hundreds > 0) {
    parts.push((feminine ? ORDINAL_HUNDREDS_FEM : ORDINAL_HUNDREDS_MASC)[hundreds])
  }

  if (tens === 1) {
    parts.push((feminine ? ORDINAL_TEENS_FEM : ORDINAL_TEENS_MASC)[ones])
  }
  else if (tens === 2) {
    parts.push((feminine ? ORDINAL_TWENTIES_FEM : ORDINAL_TWENTIES_MASC)[ones])
  }
  else {
    if (tens > 0) {
      parts.push((feminine ? ORDINAL_TENS_FEM : ORDINAL_TENS_MASC)[tens])
    }
    if (ones > 0) {
      parts.push((feminine ? ORDINAL_ONES_FEM : ORDINAL_ONES_MASC)[ones])
    }
  }

  return parts.join(' ')
}

/**
 * Builds the cardinal multiplier of a fused "milésimo"/"millonésimo" ordinal.
 *
 * The compound is one word stressed on its last element, so the multiplier
 * loses its spaces and written accents, and "y" becomes "i" as in one-word
 * cardinals: dosmilésimo, veintidosmilésimo, treintaiunmilésimo.
 * @param {number} n - Multiplier 2-999
 * @returns {string} Multiplier, ready to prefix the scale ordinal
 */
function fusedMultiplier(n) {
  if (n === 100) return 'cien'

  const tensOnes = n % 100
  let result = HUNDREDS_MASC[Math.trunc(n / 100)]

  if (tensOnes < 10) {
    result += FUSED_ONES[tensOnes]
  }
  else if (tensOnes < 20) {
    result += FUSED_TEENS[tensOnes - 10]
  }
  else if (tensOnes < 30) {
    result += FUSED_TWENTIES[tensOnes - 20]
  }
  else {
    result += TENS[Math.trunc(tensOnes / 10)]
    if (tensOnes % 10 > 0) result += 'i' + FUSED_ONES[tensOnes % 10]
  }

  return result
}

/**
 * Converts a positive integer to Spanish ordinal words.
 * @param {bigint} n - Positive integer to convert
 * @param {boolean} feminine - Use feminine forms
 * @returns {string} Spanish ordinal words
 */
function integerToOrdinal(n, feminine) {
  const thousandWord = feminine ? ORDINAL_THOUSAND_FEM : ORDINAL_THOUSAND_MASC
  const millionWord = feminine ? ORDINAL_MILLION_FEM : ORDINAL_MILLION_MASC

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n), feminine)
  }

  // Numbers 1000-999999
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result

    if (thousands === 1) {
      result = thousandWord
    }
    else {
      result = fusedMultiplier(thousands) + thousandWord
    }

    if (remainder > 0) {
      result += ' ' + buildOrdinalSegment(remainder, feminine)
    }

    return result
  }

  // Numbers >= 1,000,000
  const millions = Number(n / 1_000_000n)
  const remainder = n % 1_000_000n

  let result

  if (millions === 1) {
    result = millionWord
  }
  else {
    result = fusedMultiplier(millions) + millionWord
  }

  if (remainder > 0n) {
    result += ' ' + integerToOrdinal(remainder, feminine)
  }

  return result
}

/**
 * @typedef {object} OrdinalOptions
 * @property {('masculine'|'feminine')} [gender] - Grammatical gender
 */

/** @type {Required<OrdinalOptions>} */
export const ordinalDefaults = { gender: 'masculine' }

/** @type {{ gender: ReadonlyArray<Required<OrdinalOptions>['gender']> }} */
export const ordinalValues = { gender: ['masculine', 'feminine'] }

/**
 * Converts a numeric value to Spanish ordinal words.
 *
 * Spanish ordinals agree in gender with the noun they modify.
 * Only positive integers are valid for ordinals.
 * @param {number | string | bigint} value - The positive integer to convert
 * @param {OrdinalOptions} [options] - Optional configuration
 * @returns {string} The number in Spanish ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a positive integer
 * @example
 * toOrdinal(1)                          // 'primero'
 * toOrdinal(1, { gender: 'feminine' })  // 'primera'
 * toOrdinal(21)                         // 'vigesimoprimero'
 * toOrdinal(2000)                       // 'dosmilésimo'
 */
function toOrdinal(value, options) {
  const integerPart = parseOrdinalValue(value)
  checkMax(integerPart, ordinalMax)

  const { gender } = resolveOptions(options, ordinalDefaults, ordinalValues)
  const feminine = gender === 'feminine'

  return integerToOrdinal(integerPart, feminine)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * @typedef {object} CurrencyOptions
 * @property {boolean} [and] - Use "con" between euros and cents
 * @property {import('./utils/currency-vocab.js').EsCurrency} [currency] - ISO 4217 currency code to name the amount in
 */

/** @type {Required<CurrencyOptions>} */
export const currencyDefaults = { and: true, currency: 'EUR' }

/** @type {{ currency: ReadonlyArray<Required<CurrencyOptions>['currency']> }} */
export const currencyValues = { currency: /** @type {Required<CurrencyOptions>['currency'][]} */ (Object.keys(CURRENCY_VOCAB)) }

/**
 * Converts a numeric value to Spanish Euro currency words.
 *
 * Spanish currency uses masculine gender for euros (el euro)
 * and masculine for céntimos (el céntimo).
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {CurrencyOptions} [options] - Optional configuration
 * @returns {string} The amount in Spanish currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 * @example
 * toCurrency(42.50)                  // 'cuarenta y dos euros con cincuenta céntimos'
 * toCurrency(1)                      // 'un euro'
 * toCurrency(0.99)                   // 'noventa y nueve céntimos'
 * toCurrency(42.50, { and: false })  // 'cuarenta y dos euros cincuenta céntimos'
 */
function toCurrency(value, options) {
  const { isNegative, dollars: euros, cents: centimos } = parseCurrencyValue(value)
  checkMax(euros, currencyMax)
  const { and: useAnd, currency } = resolveOptions(options, currencyDefaults, currencyValues)
  assertCurrencyExponent(centimos, currency)
  const { major, minor, majorGender: majorGenderRaw, minorGender: minorGenderRaw } = CURRENCY_VOCAB[currency]
  // Every es entry sets both gender fields (currency-vocab-contract.test.js
  // enforces it for gender-sensitive languages) — narrow the optional matrix
  // fields to the non-optional shape toCurrency's own logic requires. The cast
  // also keeps the feminine branch reachable to the checker: every es currency
  // is masculine today, so the literal key types would otherwise narrow this to
  // 'masculine' and flag the comparison as dead — which it is, right up until
  // the first feminine currency (libra, corona, ...) is added.
  const majorGender = /** @type {'masculine' | 'feminine'} */ (majorGenderRaw)
  const minorGender = /** @type {'masculine' | 'feminine'} */ (minorGenderRaw)
  const majorFeminine = majorGender === 'feminine'
  const minorFeminine = minorGender === 'feminine'

  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Major-unit noun's own gender drives both the "un"/"una" article and the
  // numeral itself — see docs/currency-vocab.md. Every currency named here
  // today is masculine (euro, dólar, peso), but a future feminine one (e.g.
  // libra) must not silently get "un libra".
  if (euros > 0n || centimos === 0n) {
    if (euros === 1n) {
      result += (majorFeminine ? 'una ' : 'un ') + major[0]
    }
    else {
      // Millón and its multiples are nouns, so a round amount of them takes
      // "de" before what it counts: "un millón de euros", "mil millones de euros".
      const preposition = euros >= 1_000_000n && euros % 1_000_000n === 0n ? ' de ' : ' '
      result += integerToWords(euros, majorFeminine, true) + preposition + major[1]
    }
  }

  // Minor-unit noun's own gender.
  if (centimos > 0n) {
    if (euros > 0n) {
      result += useAnd ? ' ' + CURRENCY_CONNECTOR + ' ' : ' '
    }
    if (centimos === 1n) {
      result += (minorFeminine ? 'una ' : 'un ') + (/** @type {string[]} */ (minor))[0]
    }
    else {
      result += integerToWords(centimos, minorFeminine, true) + ' ' + (/** @type {string[]} */ (minor))[1]
    }
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
