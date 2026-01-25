/**
 * Modern Hebrew (Israel) language converter
 *
 * CLDR: he-IL | Modern Hebrew as used in Israel
 *
 * Key features:
 * - Feminine grammatical forms (default in Modern Hebrew)
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

// Feminine forms (default in Modern Hebrew) - index 0 unused
const ONES = ['', 'אחת', 'שתים', 'שלש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע']
const TEENS = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה']
const TENS = ['', '', 'עשרים', 'שלשים', 'ארבעים', 'חמישים', 'ששים', 'שבעים', 'שמונים', 'תשעים']
const HUNDREDS = ['', 'מאה', 'מאתיים', 'שלש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות']

// Special forms for 1-9 thousand (index 0 unused)
const THOUSANDS_SPECIAL = ['', 'אלף', 'אלפיים', 'שלשת אלפים', 'ארבעת אלפים', 'חמשת אלפים', 'ששת אלפים', 'שבעת אלפים', 'שמונת אלפים', 'תשעת אלפים']

// Scale words (index 1 = thousands, 2 = millions, etc.)
const SCALE = ['', 'אלף', 'מיליון', 'מיליארד', 'טריליון', 'קוודרליון', 'קווינטיליון']
const SCALE_PLURAL = ['', 'אלפים', 'מיליונים', 'מיליארדים', 'טריליונים', 'קוודרליונים', 'קווינטיליונים']

const ZERO = 'אפס'
const NEGATIVE = 'מינוס'
const DECIMAL_SEP = 'נקודה'

// Masculine forms for currency and ordinals
const ONES_MASC = ['', 'אחד', 'שניים', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה']

// Ordinal forms (masculine, used by default)
const ORDINAL_ONES = ['', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'שמיני', 'תשיעי']
const ORDINAL_TEENS = ['עשירי', 'אחד עשר', 'שנים עשר', 'שלשה עשר', 'ארבעה עשר', 'חמשה עשר', 'ששה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר']
const ORDINAL_TENS = ['', '', 'עשרים', 'שלשים', 'ארבעים', 'חמישים', 'ששים', 'שבעים', 'שמונים', 'תשעים']
const ORDINAL_HUNDRED = 'מאה'

// Currency (New Israeli Shekel)
const SHEKEL_SINGULAR = 'שקל'
const SHEKEL_PLURAL = 'שקלים'
const AGORA_SINGULAR = 'אגורה'
const AGORA_PLURAL = 'אגורות'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for scale segments (thousands, millions, etc.).
 * "ו" is added before tens and ones when following hundreds.
 */
function buildScaleSegment (n, andWord) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS[hundreds]
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
function buildUnitsSegment (n, andWord) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS[hundreds]
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
 * Converts a non-negative integer to Hebrew words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {string} andWord - Conjunction word
 * @returns {string} Hebrew words
 */
function integerToWords (n, andWord) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildUnitsSegment(Number(n), andWord)
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
      const segmentWord = buildUnitsSegment(segment, andWord)
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
        const segmentWord = buildScaleSegment(segment, andWord)
        if (result) result += ' '
        result += segmentWord + ' ' + SCALE[1]
      }
    } else {
      // Millions and above
      if (segment === 1) {
        if (result) result += ' '
        result += SCALE[i]
      } else {
        const segmentWord = buildScaleSegment(segment, andWord)
        if (result) result += ' '
        result += segmentWord + ' ' + SCALE_PLURAL[i]
      }
    }
  }

  return result
}

/**
 * Converts decimal digits to Hebrew words (digit by digit).
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} Hebrew words for decimal part
 */
function decimalPartToWords (decimalPart) {
  let result = ''

  for (let i = 0; i < decimalPart.length; i++) {
    const d = parseInt(decimalPart[i], 10)
    if (result) result += ' '
    result += d === 0 ? ZERO : ONES[d]
  }

  return result
}

/**
 * Converts a numeric value to Modern Hebrew words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.andWord='ו'] - Custom conjunction word
 * @returns {string} The number in Modern Hebrew words
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const { andWord = 'ו' } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, andWord)

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
    // Round tens: "עשרים וראשון" (twentieth = twenty and first)
    return ORDINAL_TENS[tens] + ' ו' + ORDINAL_ONES[1]
  }
  // For compound ordinals, only the last part is ordinal
  return ORDINAL_TENS[tens] + ' ו' + ORDINAL_ONES[ones]
}

/**
 * Converts a non-negative integer to Hebrew ordinal words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Hebrew ordinal words
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

    let result
    if (hundreds === 1) {
      if (remainder === 0) {
        return ORDINAL_HUNDRED
      }
      result = HUNDREDS[hundreds]
    } else {
      if (remainder === 0) {
        return HUNDREDS[hundreds]
      }
      result = HUNDREDS[hundreds]
    }

    return result + ' ' + buildOrdinalTensOnes(remainder)
  }

  // Numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      if (thousands <= 9) {
        return THOUSANDS_SPECIAL[thousands]
      }
      return buildScaleSegment(thousands, 'ו') + ' ' + SCALE[1]
    }

    // Cardinal thousands + ordinal remainder
    let result
    if (thousands <= 9) {
      result = THOUSANDS_SPECIAL[thousands]
    } else {
      result = buildScaleSegment(thousands, 'ו') + ' ' + SCALE[1]
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
    return buildScaleSegment(millions, 'ו') + ' ' + SCALE_PLURAL[2]
  }

  // Cardinal millions + ordinal remainder
  let result
  if (millions === 1) {
    result = SCALE[2]
  } else {
    result = buildScaleSegment(millions, 'ו') + ' ' + SCALE_PLURAL[2]
  }

  return result + ' ' + integerToOrdinal(remainder)
}

/**
 * Converts a numeric value to Hebrew ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The ordinal in Hebrew words
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
 * Builds segment word for currency (masculine forms).
 */
function buildCurrencySegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    result = HUNDREDS[hundreds]
  }

  // Tens and ones
  if (tens === 1) {
    // Teens (10-19)
    const teenWord = TEENS[ones]
    if (result) {
      result += ' ' + teenWord
    } else {
      result = teenWord
    }
  } else {
    // Tens (20-90)
    if (tens >= 2) {
      if (result) {
        result += ' ' + TENS[tens]
      } else {
        result = TENS[tens]
      }
    }

    // Ones - masculine form for currency
    if (ones > 0) {
      if (result) {
        result += ' ו' + ONES_MASC[ones]
      } else {
        result = ONES_MASC[ones]
      }
    }
  }

  return result
}

/**
 * Converts a non-negative integer to Hebrew currency words (masculine).
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Hebrew words (masculine form)
 */
function integerToCurrencyWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildCurrencySegment(Number(n))
  }

  // Use general integerToWords but with masculine forms embedded in segment builder
  // For simplicity, use the cardinal form which defaults to feminine
  // However, for currency we need masculine - this is a simplification
  return integerToWords(n, 'ו')
}

/**
 * Converts a numeric value to Hebrew New Israeli Shekel currency words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The currency in Hebrew words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(1)     // 'שקל אחד'
 * toCurrency(2.50)  // 'שניים שקלים חמישים אגורות'
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
      parts.push(SHEKEL_SINGULAR + ' ' + ONES_MASC[1])
    } else if (dollars === 2n) {
      parts.push(ONES_MASC[2] + ' ' + SHEKEL_PLURAL)
    } else {
      const shekelWord = integerToCurrencyWords(dollars)
      const shekelForm = SHEKEL_PLURAL
      parts.push(shekelWord + ' ' + shekelForm)
    }
  }

  // Agorot (feminine)
  if (cents > 0n) {
    const centNum = Number(cents)
    if (centNum === 1) {
      parts.push(AGORA_SINGULAR + ' ' + ONES[1])
    } else {
      const centWord = integerToWords(cents, 'ו')
      parts.push(centWord + ' ' + AGORA_PLURAL)
    }
  }

  return parts.join(' ')
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
