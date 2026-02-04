/**
 * Romanian (Romania) language converter
 *
 * CLDR: ro-RO | Romanian as used in Romania
 *
 * Key features:
 * - Gender agreement (unu/una, doi/două)
 * - "De" preposition insertion for groups >= 20
 * - Complex scale word handling (mie/mii, milion/milioane)
 * - Feminine units for thousands
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES_MASC = ['', 'unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă']
const ONES_FEM = ['', 'una', 'două', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă']

const TEENS = ['zece', 'unsprezece', 'douăsprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece']
const TEENS_MASC = ['zece', 'unsprezece', 'doisprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece']

const TWENTIES = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci']

const HUNDREDS = ['', 'o sută', 'două sute', 'trei sute', 'patru sute', 'cinci sute', 'șase sute', 'șapte sute', 'opt sute', 'nouă sute']

const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'virgulă'

// Ordinal vocabulary (masculine forms)
const ORDINAL_ONES = ['', 'primul', 'al doilea', 'al treilea', 'al patrulea', 'al cincilea', 'al șaselea', 'al șaptelea', 'al optulea', 'al nouălea']
const ORDINAL_TEENS = ['al zecelea', 'al unsprezecelea', 'al doisprezecelea', 'al treisprezecelea', 'al paisprezecelea', 'al cincisprezecelea', 'al șaisprezecelea', 'al șaptesprezecelea', 'al optsprezecelea', 'al nouăsprezecelea']
const ORDINAL_TENS = ['', '', 'al douăzecilea', 'al treizecilea', 'al patruzecilea', 'al cincizecilea', 'al șaizecilea', 'al șaptezecilea', 'al optzecilea', 'al nouăzecilea']
const ORDINAL_HUNDRED = 'al sutălea'
const ORDINAL_THOUSAND = 'al miilea'
const ORDINAL_MILLION = 'al milionulea'

// Currency (Romanian Leu)
const LEU_SINGULAR = 'leu'
const LEU_PLURAL = 'lei'
const BAN_SINGULAR = 'ban'
const BAN_PLURAL = 'bani'

// Scale metadata: [singular, plural, article, feminine, needsDe]
// - singular: form for 1
// - plural: form for 2+
// - article: 'o' for feminine, 'un' for masculine
// - feminine: whether units should be feminine
// - needsDe: whether "de" is inserted for segment >= 20
const SCALE_META = [
  { singular: 'mie', plural: 'mii', article: 'o', feminine: true, needsDe: true },
  { singular: 'milion', plural: 'milioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'miliard', plural: 'miliarde', article: 'un', feminine: false, needsDe: true },
  { singular: 'trilion', plural: 'trilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'cvadrilion', plural: 'cvadrilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'cvintilion', plural: 'cvintilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'sextilion', plural: 'sextilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'septilion', plural: 'septilioane', article: 'un', feminine: false, needsDe: true },
  { singular: 'octilion', plural: 'octilioane', article: 'un', feminine: false, needsDe: true }
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Spells number under 100.
 */
function spellUnder100 (n, feminine = false, masculineTeens = false) {
  if (n === 0) return ''
  if (n < 10) {
    return feminine ? ONES_FEM[n] : ONES_MASC[n]
  }
  if (n < 20) {
    return masculineTeens ? TEENS_MASC[n - 10] : TEENS[n - 10]
  }
  const t = Math.floor(n / 10)
  const u = n % 10
  if (u === 0) {
    return TWENTIES[t]
  }
  const onesWord = feminine ? ONES_FEM[u] : ONES_MASC[u]
  return TWENTIES[t] + ' și ' + onesWord
}

/**
 * Spells number under 1000.
 */
function spellUnder1000 (n, feminine = false, masculineTeens = false) {
  if (n === 0) return ''
  if (n < 100) return spellUnder100(n, feminine, masculineTeens)

  const h = Math.floor(n / 100)
  const r = n % 100
  const hundredWord = HUNDREDS[h]

  if (r === 0) return hundredWord
  return hundredWord + ' ' + spellUnder100(r, feminine, masculineTeens)
}

/**
 * Builds scale word with proper pluralization and "de" insertion.
 * Romanian always uses feminine forms (două, not doi) when counting scale words.
 */
function buildScalePhrase (segment, scaleIndex) {
  const meta = SCALE_META[scaleIndex - 1]
  if (!meta) return spellUnder1000(segment, true)

  if (segment === 1) {
    return meta.article + ' ' + meta.singular
  }

  // Special case: 21 with scale words uses feminine "una"
  if (segment === 21 && meta.needsDe) {
    return 'douăzeci și una de ' + meta.plural
  }

  // Romanian always uses feminine when counting scale words (două milioane, not doi milioane)
  const words = spellUnder1000(segment, true)

  // "de" after >= 20
  const needsDe = meta.needsDe && segment >= 20
  const separator = needsDe ? ' de ' : ' '

  return words + separator + meta.plural
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Romanian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Romanian words
 */
function integerToWords (n, gender) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    const feminine = gender === 'feminine'
    return spellUnder1000(Number(n), feminine)
  }

  return buildLargeNumberWords(n, gender)
}

/**
 * Builds words for numbers >= 1000.
 * Uses BigInt division for faster segment extraction.
 *
 * @param {bigint} n - Number >= 1000
 * @param {Object} options - Conversion options
 * @returns {string} Romanian words
 */
function buildLargeNumberWords (n, gender) {
  // Extract segments using BigInt division (faster than string slicing)
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string directly (avoid regex cleanup)
  let result = ''

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0) continue

    let segmentWords
    if (i === 0) {
      // Units segment - use gender from options
      const feminine = gender === 'feminine'
      segmentWords = spellUnder1000(segment, feminine)
    } else {
      // Scale segment
      segmentWords = buildScalePhrase(segment, i)
    }

    if (result && segmentWords) {
      result += ' ' + segmentWords
    } else if (segmentWords) {
      result = segmentWords
    }
  }

  return result
}

/**
 * Converts decimal digits to Romanian words.
 * Decimals always use masculine forms.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Romanian words for decimal part
 */
function decimalPartToWords (decimalPart) {
  let result = ''
  let i = 0

  // Handle leading zeros
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  // Convert remainder as a single number (masculine, with masculine teens)
  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    const n = BigInt(remainder)
    if (n < 1000n) {
      result += spellUnder1000(Number(n), false, true)
    } else {
      result += integerToWords(n, { gender: 'masculine' })
    }
  }

  return result
}

/**
 * Converts a numeric value to Romanian words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Conversion options
 * @param {string} [options.gender='masculine'] - Gender for numbers
 * @returns {string} The number in Romanian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)                        // 'douăzeci și unu'
 * toCardinal(1, { gender: 'feminine' }) // 'una'
 * toCardinal(1000)                      // 'o mie'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { gender = 'masculine' } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, gender)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Ordinal Functions
// ============================================================================

/**
 * Builds ordinal for tens and ones (0-99).
 *
 * @param {number} n - Number 0-99
 * @returns {string} Ordinal word
 */
function buildOrdinalTensOnes (n) {
  if (n === 0) return ''
  if (n < 10) return ORDINAL_ONES[n]
  if (n < 20) return ORDINAL_TEENS[n - 10]

  const ones = n % 10
  const tens = Math.floor(n / 10)

  if (ones === 0) {
    return ORDINAL_TENS[tens]
  }
  // Compound: cardinal tens + ordinal ones (only last is ordinal)
  return TWENTIES[tens] + ' și ' + ORDINAL_ONES[ones]
}

/**
 * Converts a non-negative integer to Romanian ordinal words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Romanian ordinal words
 */
function integerToOrdinal (n) {
  if (n === 0n) return ''
  if (n === 1n) return ORDINAL_ONES[1]

  // Numbers < 100
  if (n < 100n) {
    return buildOrdinalTensOnes(Number(n))
  }

  // Numbers < 1000
  if (n < 1000n) {
    const hundreds = Number(n / 100n)
    const remainder = Number(n % 100n)

    if (remainder === 0) {
      return ORDINAL_HUNDRED
    }
    return HUNDREDS[hundreds] + ' ' + buildOrdinalTensOnes(remainder)
  }

  // Numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      if (thousands === 1) {
        return ORDINAL_THOUSAND
      }
      return buildScalePhrase(thousands, 1) + ' ' + ORDINAL_THOUSAND
    }

    // Cardinal thousands + ordinal remainder
    let result
    if (thousands === 1) {
      result = 'o mie'
    } else {
      result = buildScalePhrase(thousands, 1)
    }

    if (remainder < 100) {
      return result + ' ' + buildOrdinalTensOnes(remainder)
    }

    const remHundreds = Math.floor(remainder / 100)
    const remTensOnes = remainder % 100

    if (remTensOnes === 0) {
      return result + ' ' + ORDINAL_HUNDRED
    }
    return result + ' ' + HUNDREDS[remHundreds] + ' ' + buildOrdinalTensOnes(remTensOnes)
  }

  // Numbers >= 1,000,000
  const millions = Number(n / 1_000_000n)
  const remainder = n % 1_000_000n

  if (remainder === 0n) {
    if (millions === 1) {
      return ORDINAL_MILLION
    }
    return buildScalePhrase(millions, 2) + ' ' + ORDINAL_MILLION
  }

  // Cardinal millions + ordinal remainder
  let result
  if (millions === 1) {
    result = 'un milion'
  } else {
    result = buildScalePhrase(millions, 2)
  }

  return result + ' ' + integerToOrdinal(remainder)
}

/**
 * Converts a numeric value to Romanian ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The ordinal in Romanian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a positive integer
 *
 * @example
 * toOrdinal(1)   // 'primul'
 * toOrdinal(21)  // 'douăzeci și primul'
 */
function toOrdinal (value) {
  const n = parseOrdinalValue(value)
  return integerToOrdinal(n)
}

// ============================================================================
// Currency Functions
// ============================================================================

/**
 * Converts a numeric value to Romanian Leu currency words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The currency in Romanian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(1)     // 'un leu'
 * toCurrency(2.50)  // 'doi lei cincizeci de bani'
 */
function toCurrency (value) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)

  const parts = []

  if (isNegative) {
    parts.push(NEGATIVE)
  }

  // Lei (masculine)
  if (dollars > 0n || cents === 0n) {
    if (dollars === 1n) {
      parts.push('un ' + LEU_SINGULAR)
    } else {
      const leuWord = integerToWords(dollars, 'masculine')
      parts.push(leuWord + ' ' + LEU_PLURAL)
    }
  }

  // Bani (masculine)
  if (cents > 0n) {
    const centNum = Number(cents)
    if (centNum === 1) {
      parts.push('un ' + BAN_SINGULAR)
    } else if (centNum >= 20) {
      const banWord = spellUnder100(centNum, false)
      parts.push(banWord + ' de ' + BAN_PLURAL)
    } else {
      const banWord = spellUnder100(centNum, false)
      parts.push(banWord + ' ' + BAN_PLURAL)
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
