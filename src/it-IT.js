/**
 * Italian (Italy) language converter
 *
 * CLDR: it-IT | Italian as used in Italy
 *
 * Italian-specific rules:
 * - Concatenation without spaces within segments ("ventotto" not "venti otto")
 * - Phonetic vowel elision: "venti" + "otto" → "ventotto"
 * - Accent on final "tre" in compounds: "ventitré"
 * - mille/mila alternation for thousands
 * - Scale words: milione/milioni, miliardo/miliardi, etc.
 * - "e" connector before simple final remainder
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Base vocabulary
const ONES = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove']
const TEENS = ['dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove']
const TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta']
const HUNDREDS = ['', 'cento', 'duecento', 'trecento', 'quattrocento', 'cinquecento', 'seicento', 'settecento', 'ottocento', 'novecento']

// Pre-elided tens stems (drop final vowel before 'uno'/'otto')
// vent- (from venti), trent- (from trenta), etc.
const TENS_STEM = ['', '', 'vent', 'trent', 'quarant', 'cinquant', 'sessant', 'settant', 'ottant', 'novant']

const ZERO = 'zero'
const NEGATIVE = 'meno'
const DECIMAL_SEP = 'virgola'

// Thousands
const THOUSAND_SINGULAR = 'mille'
const THOUSAND_PLURAL_SUFFIX = 'mila'

// Scale word generation
const SCALE_PREFIXES = ['m', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec']

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Irregular ordinals 1-10 (masculine form)
const ORDINAL_ONES = ['', 'primo', 'secondo', 'terzo', 'quarto', 'quinto', 'sesto', 'settimo', 'ottavo', 'nono', 'decimo']

// Ordinal suffix for 11+
const ORDINAL_SUFFIX = 'esimo'

// ============================================================================
// Currency Vocabulary (Euro)
// ============================================================================

const EURO = 'euro'
const CENTESIMO = 'centesimo'
const CENTESIMI = 'centesimi'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds the segment word for a number 0-999.
 * Handles Italian phonetic elision inline (no regex).
 *
 * Elision rules:
 * - Tens ending in vowel + uno/otto → drop tens vowel: ventuno, ventotto
 * - Hundreds cento + otto/ottanta → centotto, centottanta (drop 'o')
 * - Final 'tre' in compounds becomes 'tré': ventitré, trentatré
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    // Elision: *cento + otto/ottanta → *centotto/centottanta (drop final 'o')
    // Only applies when tens = 8 (ottanta) or tens = 0 and ones = 8 (otto)
    if (tens === 8 || (tens === 0 && ones === 8)) {
      // Remove final 'o' from hundreds: cento→cent, duecento→duecent, etc.
      result = HUNDREDS[hundreds].slice(0, -1)
    } else {
      result = HUNDREDS[hundreds]
    }
  }

  // Tens and ones
  if (tens === 0 && ones === 0) {
    // Nothing more (just hundreds)
  } else if (tens === 1) {
    // Teens: 10-19
    result += TEENS[ones]
  } else if (tens >= 2) {
    // 20-99: handle elision for uno (1) and otto (8)
    if (ones === 1 || ones === 8) {
      // Use stem form: vent + uno = ventuno, vent + otto = ventotto
      result += TENS_STEM[tens] + ONES[ones]
    } else if (ones === 3) {
      // Final tre becomes tré
      result += TENS[tens] + 'tré'
    } else if (ones > 0) {
      result += TENS[tens] + ONES[ones]
    } else {
      result += TENS[tens]
    }
  } else if (ones > 0) {
    // 1-9 (tens === 0)
    if (ones === 3 && hundreds > 0) {
      // centotré, duecentotré, etc.
      result += 'tré'
    } else {
      result += ONES[ones]
    }
  }

  return result
}

/**
 * Builds segment word with "un" for scale context (millions, billions).
 * Same as buildSegment but returns "un" for 1 instead of "uno".
 */
function buildSegmentForScale (n) {
  if (n === 0) return ''
  if (n === 1) return 'un' // "un milione" not "uno milione"
  return buildSegment(n)
}

/**
 * Builds thousands word for 1-999 thousand.
 * Handles elision: tre + mila = tremila (no accent), otto + mila = ottomila
 */
function buildThousands (n) {
  if (n === 0) return ''
  if (n === 1) return THOUSAND_SINGULAR // "mille"

  // Build segment and append "mila"
  // Note: elision of segment ending vowel + 'mila' not needed (mila starts with 'm')
  // But we need to handle cases like "ottomila" (no double-o issue since we build directly)
  return buildSegment(n) + THOUSAND_PLURAL_SUFFIX
}

// ============================================================================
// Scale Word Functions
// ============================================================================

/**
 * Gets singular scale word for index.
 * @param {number} scaleIndex - 2=million, 3=billion, etc.
 */
function getScaleWordSingular (scaleIndex) {
  if (scaleIndex < 2) return ''
  const prefixIndex = Math.floor((scaleIndex - 2) / 2)
  const isIardo = (scaleIndex - 2) % 2 === 1
  const prefix = SCALE_PREFIXES[prefixIndex]
  if (!prefix) return ''
  return prefix + (isIardo ? 'iliardo' : 'ilione')
}

/**
 * Gets plural scale word for index.
 * @param {number} scaleIndex - 2=million, 3=billion, etc.
 */
function getScaleWordPlural (scaleIndex) {
  if (scaleIndex < 2) return ''
  const prefixIndex = Math.floor((scaleIndex - 2) / 2)
  const isIardo = (scaleIndex - 2) % 2 === 1
  const prefix = SCALE_PREFIXES[prefixIndex]
  if (!prefix) return ''
  return prefix + (isIardo ? 'iliardi' : 'ilioni')
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Italian words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Italian words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      return buildThousands(thousands)
    }

    // Concatenate thousands + remainder
    return buildThousands(thousands) + buildSegment(remainder)
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} Italian words
 */
function buildLargeNumberWords (n) {
  const parts = []
  let remaining = n

  // Find the highest scale
  let maxScale = 2
  let testValue = 1_000_000n
  while (testValue * 1000n <= remaining) {
    testValue *= 1000n
    maxScale++
  }

  // Process from highest scale down
  for (let scaleIndex = maxScale; scaleIndex >= 0; scaleIndex--) {
    const divisor = 1000n ** BigInt(scaleIndex)
    const segment = remaining / divisor
    remaining = remaining % divisor

    if (segment === 0n) continue

    const segNum = Number(segment)

    if (scaleIndex >= 2) {
      // Millions and above: "segment scaleWord"
      const segmentWords = buildSegmentForScale(segNum)
      const scaleWord = segment === 1n
        ? getScaleWordSingular(scaleIndex)
        : getScaleWordPlural(scaleIndex)
      parts.push(segmentWords + ' ' + scaleWord)
    } else if (scaleIndex === 1) {
      // Thousands
      parts.push(buildThousands(segNum))
    } else {
      // Units (scaleIndex === 0): just the segment
      parts.push(buildSegment(segNum))
    }
  }

  return joinPartsWithConnector(parts)
}

/**
 * Joins parts with Italian connector rules.
 * Uses "e" before simple (non-compound) final segment.
 *
 * @param {string[]} parts - Parts to join
 * @returns {string} Joined string
 */
function joinPartsWithConnector (parts) {
  const len = parts.length
  if (len === 0) return ''
  if (len === 1) return parts[0]

  // Check if last part is "simple" (no space = no scale word)
  const lastPart = parts[len - 1]
  if (lastPart.indexOf(' ') === -1) {
    // Join all but last with space, then add "e" connector
    let result = parts[0]
    for (let i = 1; i < len - 1; i++) {
      result += ' ' + parts[i]
    }
    return result + ' e ' + lastPart
  }

  // Join with spaces
  let result = parts[0]
  for (let i = 1; i < len; i++) {
    result += ' ' + parts[i]
  }
  return result
}

/**
 * Converts decimal digits to Italian words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Italian words for decimal part
 */
function decimalPartToWords (decimalPart) {
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
 * Converts a numeric value to Italian words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Italian words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(28)           // 'ventotto'
 * toCardinal(23)           // 'ventitré'
 * toCardinal(1000)         // 'mille'
 * toCardinal(2000)         // 'duemila'
 * toCardinal(1000000)      // 'un milione'
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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
// ORDINAL: toOrdinal(value)
// ============================================================================

/**
 * Converts a cardinal word to ordinal form by dropping final vowel and adding -esimo.
 *
 * @param {string} cardinalWord - Cardinal word to convert
 * @returns {string} Ordinal form
 */
function cardinalToOrdinal (cardinalWord) {
  // Handle accented 'é' at end (tré → tre + esimo = treesimo)
  if (cardinalWord.endsWith('é')) {
    return cardinalWord.slice(0, -1) + 'e' + ORDINAL_SUFFIX
  }

  // Handle "mila" ending (duemila → duemillesimo, not duemilesimo)
  // The ordinal of thousand is "millesimo" (from mille), not "milesimo"
  if (cardinalWord.endsWith('mila')) {
    return cardinalWord.slice(0, -4) + 'mill' + ORDINAL_SUFFIX
  }

  // Handle "mille" ending (mille → millesimo)
  if (cardinalWord.endsWith('mille')) {
    return cardinalWord.slice(0, -1) + ORDINAL_SUFFIX
  }

  // Handle -ardo/-ardi endings (miliardo → miliardiesimo)
  // These scale words get -iesimo not -esimo
  if (cardinalWord.endsWith('ardo') || cardinalWord.endsWith('ardi')) {
    return cardinalWord.slice(0, -1) + 'i' + ORDINAL_SUFFIX
  }

  // Drop final regular vowel before adding -esimo
  const lastChar = cardinalWord.slice(-1)
  if ('aeiouàèìòù'.includes(lastChar)) {
    return cardinalWord.slice(0, -1) + ORDINAL_SUFFIX
  }

  // If doesn't end in vowel, just add suffix
  return cardinalWord + ORDINAL_SUFFIX
}

/**
 * Converts a positive integer to Italian ordinal words.
 *
 * @param {bigint} n - Positive integer
 * @returns {string} Italian ordinal words (masculine form)
 */
function integerToOrdinal (n) {
  // Special cases: 1-10 have irregular forms
  if (n <= 10n) {
    return ORDINAL_ONES[Number(n)]
  }

  // For 11+, convert cardinal and apply -esimo
  const cardinalWord = integerToWords(n)
  return cardinalToOrdinal(cardinalWord)
}

/**
 * Converts a numeric value to Italian ordinal words.
 *
 * Italian ordinals: primo, secondo, terzo... (1-10 irregular)
 * For 11+: cardinal word (drop final vowel) + -esimo
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words (masculine form)
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'primo'
 * toOrdinal(2)    // 'secondo'
 * toOrdinal(11)   // 'undicesimo'
 * toOrdinal(21)   // 'ventunesimo'
 * toOrdinal(100)  // 'centesimo'
 * toOrdinal(1000) // 'millesimo'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Italian currency words (Euro).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "e" between euros and centesimi
 * @returns {string} The amount in Italian currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                 // 'quarantadue euro e cinquanta centesimi'
 * toCurrency(1)                     // 'un euro'
 * toCurrency(0.99)                  // 'novantanove centesimi'
 * toCurrency(0.01)                  // 'un centesimo'
 * toCurrency(42.50, { and: false }) // 'quarantadue euro cinquanta centesimi'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: euros, cents: centesimi } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Euros part
  if (euros > 0n || centesimi === 0n) {
    // Use "un" for 1 euro instead of "uno"
    if (euros === 1n) {
      result += 'un'
    } else {
      result += integerToWords(euros)
    }
    // Euro is invariable (doesn't change for plural in Italian)
    result += ' ' + EURO
  }

  // Centesimi part
  if (centesimi > 0n) {
    if (euros > 0n) {
      result += useAnd ? ' e ' : ' '
    }
    // Use "un" for 1 centesimo instead of "uno"
    if (centesimi === 1n) {
      result += 'un'
    } else {
      result += integerToWords(centesimi)
    }
    result += ' ' + (centesimi === 1n ? CENTESIMO : CENTESIMI)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
