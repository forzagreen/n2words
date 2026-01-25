/**
 * Biblical Hebrew (Israel) language converter
 *
 * CLDR: hbo-IL | Biblical/Ancient Hebrew
 *
 * Key features:
 * - Gender agreement (masculine default, feminine via option)
 * - Dual forms for 2, 200, 2000
 * - Special 1-9 thousands construct state
 * - "ו" (ve) conjunction rules vary by position
 * - Per-digit decimal reading
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (arrays for indexed access - faster than object property lookup)
// ============================================================================

// Masculine forms (default in Biblical Hebrew) - index 0 unused
const ONES_MASC = ['', 'אחד', 'שניים', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה']
const TEENS_MASC = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלשה עשר', 'ארבעה עשר', 'חמשה עשר', 'ששה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר']
const THOUSANDS_MASC = ['', 'אלף', 'אלפיים', 'שלשה אלפים', 'ארבעה אלפים', 'חמשה אלפים', 'ששה אלפים', 'שבעה אלפים', 'שמונה אלפים', 'תשעה אלפים']

// Feminine forms - index 0 unused
const ONES_FEM = ['', 'אחת', 'שתים', 'שלש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע']
const TEENS_FEM = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה']
const THOUSANDS_FEM = ['', 'אלף', 'אלפיים', 'שלשת אלפים', 'ארבעת אלפים', 'חמשת אלפים', 'ששת אלפים', 'שבעת אלפים', 'שמונת אלפים', 'תשעת אלפים']

// Shared vocabulary
const TENS = ['', '', 'עשרים', 'שלשים', 'ארבעים', 'חמישים', 'ששים', 'שבעים', 'שמונים', 'תשעים']
const HUNDREDS = ['', 'מאה', 'מאתיים', 'שלשה מאות', 'ארבעה מאות', 'חמשה מאות', 'ששה מאות', 'שבעה מאות', 'שמונה מאות', 'תשעה מאות']
const HUNDREDS_FEM = ['', 'מאה', 'מאתיים', 'שלש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות']

// Scale words (index 1 = thousands, 2 = millions, etc.)
const SCALE = ['', 'אלף', 'מיליון', 'מיליארד', 'טריליון', 'קוודרליון', 'קווינטיליון']
const SCALE_PLURAL = ['', 'אלפים', 'מיליונים', 'מיליארדים', 'טריליונים', 'קוודרליונים', 'קווינטיליונים']

const ZERO = 'אפס'
const NEGATIVE = 'מינוס'
const DECIMAL_SEP = 'נקודה'

// Ordinal forms (masculine) - used in Biblical Hebrew
const ORDINAL_ONES = ['', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'שמיני', 'תשיעי']
const ORDINAL_TEENS = ['עשירי', 'אחד עשר', 'שנים עשר', 'שלשה עשר', 'ארבעה עשר', 'חמשה עשר', 'ששה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר']
const ORDINAL_TENS = ['', '', 'עשרים', 'שלשים', 'ארבעים', 'חמישים', 'ששים', 'שבעים', 'שמונים', 'תשעים']
const ORDINAL_HUNDRED = 'מאה'

// Currency (Biblical Shekel - historical usage)
const SHEKEL = 'שקל'
const SHEKEL_PLURAL = 'שקלים'
const GERAH = 'גרה'
const GERAH_PLURAL = 'גרות'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for scale segments (thousands, millions, etc.).
 * "ו" is added before tens and ones when following hundreds.
 */
function buildScaleSegment (n, andWord, ONES, TEENS, HUNDREDS_ARR) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS_ARR[hundreds]
  }

  // Tens and ones
  if (tens === 1) {
    // Teens (10-19)
    const teenWord = TEENS[ones]
    if (result) {
      result += ' ' + andWord + teenWord
    } else {
      result = teenWord
    }
  } else {
    // Tens (20-90)
    if (tens >= 2) {
      if (result) {
        result += ' ' + andWord + TENS[tens]
      } else {
        result = TENS[tens]
      }
    }

    // Ones
    if (ones > 0) {
      if (result) {
        result += ' ' + andWord + ONES[ones]
      } else {
        result = ONES[ones]
      }
    }
  }

  return result
}

/**
 * Builds segment word for units segment (no scale word).
 * "ו" is only added before the final ones digit.
 */
function buildUnitsSegment (n, andWord, ONES, TEENS, HUNDREDS_ARR) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS_ARR[hundreds]
  }

  // Tens (no conjunction)
  if (tens === 1) {
    // Teens (10-19)
    if (result) {
      result += ' ' + TEENS[ones]
    } else {
      result = TEENS[ones]
    }
  } else {
    if (tens >= 2) {
      if (result) {
        result += ' ' + TENS[tens]
      } else {
        result = TENS[tens]
      }
    }

    // Ones - conjunction only here
    if (ones > 0) {
      if (result) {
        result += ' ' + andWord + ONES[ones]
      } else {
        result = ONES[ones]
      }
    }
  }

  return result
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Biblical Hebrew words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Biblical Hebrew words
 */
function integerToWords (n, gender, andWord) {
  if (n === 0n) return ZERO

  const isFeminine = gender === 'feminine'

  // Select vocabulary based on gender
  const ONES = isFeminine ? ONES_FEM : ONES_MASC
  const TEENS = isFeminine ? TEENS_FEM : TEENS_MASC
  const THOUSANDS_SPECIAL = isFeminine ? THOUSANDS_FEM : THOUSANDS_MASC
  const HUNDREDS_ARR = isFeminine ? HUNDREDS_FEM : HUNDREDS

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildUnitsSegment(Number(n), andWord, ONES, TEENS, HUNDREDS_ARR)
  }

  // Extract segments using BigInt modulo
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string directly
  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (i === 0) {
      // Units segment (no scale word)
      const segmentWord = buildUnitsSegment(segment, andWord, ONES, TEENS, HUNDREDS_ARR)
      if (result) {
        // Add "ו" before single-digit units when following scale words
        if (segment <= 9) {
          result += ' ' + andWord + segmentWord
        } else {
          result += ' ' + segmentWord
        }
      } else {
        result = segmentWord
      }
    } else if (i === 1) {
      // Thousands - special handling for 1-9
      if (segment <= 9) {
        if (result) result += ' '
        result += THOUSANDS_SPECIAL[segment]
      } else {
        const segmentWord = buildScaleSegment(segment, andWord, ONES, TEENS, HUNDREDS_ARR)
        if (result) result += ' '
        result += segmentWord + ' ' + SCALE[1]
      }
    } else {
      // Millions and above
      if (segment === 1) {
        if (result) result += ' '
        result += SCALE[i]
      } else {
        const segmentWord = buildScaleSegment(segment, andWord, ONES, TEENS, HUNDREDS_ARR)
        if (result) result += ' '
        result += segmentWord + ' ' + SCALE_PLURAL[i]
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Biblical Hebrew words (digit by digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Biblical Hebrew words for decimal part
 */
function decimalPartToWords (decimalPart, gender, andWord) {
  const ONES = gender === 'feminine' ? ONES_FEM : ONES_MASC

  let result = ''
  for (let i = 0; i < decimalPart.length; i++) {
    const d = parseInt(decimalPart[i], 10)
    if (result) result += ' '
    result += d === 0 ? ZERO : ONES[d]
  }

  return result
}

/**
 * Converts a numeric value to Biblical Hebrew words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @param {string} [options.andWord='ו'] - Custom conjunction word
 * @returns {string} The number in Biblical Hebrew words
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const {
    gender = 'masculine',
    andWord = 'ו'
  } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, gender, andWord)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, gender, andWord)
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
    // Round tens: add "וראשון"
    return ORDINAL_TENS[tens] + ' ו' + ORDINAL_ONES[1]
  }
  // Compound: cardinal tens + ordinal ones
  return ORDINAL_TENS[tens] + ' ו' + ORDINAL_ONES[ones]
}

/**
 * Converts a non-negative integer to Biblical Hebrew ordinal words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Biblical Hebrew ordinal words
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
      if (thousands <= 9) {
        return THOUSANDS_MASC[thousands]
      }
      return buildScaleSegment(thousands, 'ו', ONES_MASC, TEENS_MASC, HUNDREDS) + ' ' + SCALE[1]
    }

    // Cardinal thousands + ordinal remainder
    let result
    if (thousands <= 9) {
      result = THOUSANDS_MASC[thousands]
    } else {
      result = buildScaleSegment(thousands, 'ו', ONES_MASC, TEENS_MASC, HUNDREDS) + ' ' + SCALE[1]
    }

    if (remainder < 100) {
      return result + ' ' + buildOrdinalTensOnes(remainder)
    }

    const remHundreds = Math.floor(remainder / 100)
    const remTensOnes = remainder % 100

    if (remTensOnes === 0) {
      return result + ' ' + HUNDREDS[remHundreds]
    }
    return result + ' ' + HUNDREDS[remHundreds] + ' ' + buildOrdinalTensOnes(remTensOnes)
  }

  // Numbers >= 1,000,000
  const millions = Number(n / 1_000_000n)
  const remainder = n % 1_000_000n

  if (remainder === 0n) {
    if (millions === 1) {
      return SCALE[2]
    }
    return buildScaleSegment(millions, 'ו', ONES_MASC, TEENS_MASC, HUNDREDS) + ' ' + SCALE_PLURAL[2]
  }

  // Cardinal millions + ordinal remainder
  let result
  if (millions === 1) {
    result = SCALE[2]
  } else {
    result = buildScaleSegment(millions, 'ו', ONES_MASC, TEENS_MASC, HUNDREDS) + ' ' + SCALE_PLURAL[2]
  }

  return result + ' ' + integerToOrdinal(remainder)
}

/**
 * Converts a numeric value to Biblical Hebrew ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The ordinal in Biblical Hebrew words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a positive integer
 *
 * @example
 * toOrdinal(1)   // 'ראשון'
 * toOrdinal(21)  // 'עשרים וראשון'
 */
function toOrdinal (value) {
  const n = parseOrdinalValue(value)
  return integerToOrdinal(n)
}

// ============================================================================
// Currency Functions
// ============================================================================

/**
 * Converts a numeric value to Biblical Hebrew Shekel currency words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The currency in Biblical Hebrew words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(1)     // 'שקל אחד'
 * toCurrency(2.50)  // 'שניים שקלים חמישים גרות'
 */
function toCurrency (value) {
  const { isNegative, dollars, cents } = parseCurrencyValue(value)

  const parts = []

  if (isNegative) {
    parts.push(NEGATIVE)
  }

  // Shekels (masculine)
  if (dollars > 0n || cents === 0n) {
    if (dollars === 1n) {
      parts.push(SHEKEL + ' ' + ONES_MASC[1])
    } else if (dollars === 2n) {
      parts.push(ONES_MASC[2] + ' ' + SHEKEL_PLURAL)
    } else {
      const shekelWord = integerToWords(dollars, 'masculine', 'ו')
      parts.push(shekelWord + ' ' + SHEKEL_PLURAL)
    }
  }

  // Gerah (feminine subunit)
  if (cents > 0n) {
    const centNum = Number(cents)
    if (centNum === 1) {
      parts.push(GERAH + ' ' + ONES_FEM[1])
    } else {
      const gerahWord = integerToWords(cents, 'feminine', 'ו')
      parts.push(gerahWord + ' ' + GERAH_PLURAL)
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
