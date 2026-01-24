/**
 * German (Germany) language converter
 *
 * CLDR: de-DE | German as used in Germany
 *
 * Key features:
 * - Inverted tens-ones order: "einundzwanzig" (one-and-twenty) for 21-99
 * - Compound words without spaces below million level
 * - Three forms of 1: "eins" (standalone), "ein" (before hundert/tausend), "eine" (before Million+)
 * - Scale pluralization: Million → Millionen, Milliarde → Milliarden
 * - Spaces only around million+ scale words
 * - BigInt modulo for efficient segment extraction
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

// Ones words (1-9), index 0 unused
const ONES = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']

// "ein" form for use before hundert/und
const EIN = 'ein'

// Teens (10-19)
const TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn']

// Tens (20-90)
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

// Scale words (index 0 = thousand, 1 = million, etc.)
const SCALES = ['tausend', 'Million', 'Milliarde', 'Billion', 'Billiarde', 'Trillion', 'Trilliarde', 'Quadrillion', 'Quadrilliarde']

// Pluralized scale words (million+)
const SCALES_PLURAL = ['tausend', 'Millionen', 'Milliarden', 'Billionen', 'Billiarden', 'Trillionen', 'Trilliarden', 'Quadrillionen', 'Quadrilliarden']

const HUNDRED = 'hundert'
const ZERO = 'null'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'komma'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal ones (1-9): erste, zweite, dritte, vierte...
// Note: 1st (erste), 3rd (dritte), 7th (siebte), 8th (achte) are irregular
const ORDINAL_ONES = ['', 'erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte', 'neunte']

// Ordinal teens: zehnte, elfte, zwölfte...
const ORDINAL_TEENS = ['zehnte', 'elfte', 'zwölfte', 'dreizehnte', 'vierzehnte', 'fünfzehnte', 'sechzehnte', 'siebzehnte', 'achtzehnte', 'neunzehnte']

// Ordinal tens: zwanzigste, dreißigste...
const ORDINAL_TENS = ['', '', 'zwanzigste', 'dreißigste', 'vierzigste', 'fünfzigste', 'sechzigste', 'siebzigste', 'achtzigste', 'neunzigste']

// Ordinal scale suffixes: -ste for 20+
const ORDINAL_SUFFIX = 'ste'

// ============================================================================
// Currency Vocabulary (Euro)
// ============================================================================

const EURO = 'Euro'
const CENT = 'Cent'

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds segment word for 0-999 (standalone form, uses "eins").
 * German inverts ones and tens: "einundzwanzig" = one-and-twenty
 *
 * @param {number} n - Number 0-999
 * @returns {string} German words for the segment
 */
function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  let result = ''

  // Hundreds: "ein" before hundert, not "eins"
  if (hundreds > 0) {
    result += (hundreds === 1 ? EIN : ONES[hundreds]) + HUNDRED
  }

  // Tens and ones
  if (tens === 1) {
    // Teens
    result += TEENS[ones]
  } else if (tens >= 2 && ones > 0) {
    // Inverted: "einundzwanzig" (one-and-twenty)
    // Use "ein" before "und", not "eins"
    result += (ones === 1 ? EIN : ONES[ones]) + 'und' + TENS[tens]
  } else if (tens >= 2) {
    // Just tens
    result += TENS[tens]
  } else if (ones > 0) {
    // Just ones (no tens, possibly after hundreds)
    // Use "eins" for standalone/after hundreds
    result += ONES[ones]
  }

  return result
}

/**
 * Builds segment word for use before "tausend".
 * Uses "ein" instead of "eins" for 1.
 *
 * @param {number} n - Number 0-999
 * @returns {string} German words for thousand context
 */
function buildSegmentForThousand (n) {
  if (n === 0) return ''
  if (n === 1) return EIN // "eintausend"

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  let result = ''

  if (hundreds > 0) {
    result += (hundreds === 1 ? EIN : ONES[hundreds]) + HUNDRED
  }

  if (tens === 1) {
    result += TEENS[ones]
  } else if (tens >= 2 && ones > 0) {
    result += (ones === 1 ? EIN : ONES[ones]) + 'und' + TENS[tens]
  } else if (tens >= 2) {
    result += TENS[tens]
  } else if (ones > 0 && hundreds > 0) {
    result += ONES[ones]
  } else if (ones > 0) {
    result += ONES[ones]
  }

  return result
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to German words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} German words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    // Compound: "eintausendzweihundert" (no spaces)
    let result = buildSegmentForThousand(thousands) + SCALES[0]

    if (remainder > 0) {
      result += buildSegment(remainder)
    }

    return result
  }

  // For numbers >= 1,000,000, use scale decomposition
  return buildLargeNumberWords(n)
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} German words
 */
function buildLargeNumberWords (n) {
  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from right to left
  const segments = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segments.push(Number(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segments.push(Number(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      if (scaleIndex === 0) {
        // Units segment (no scale word)
        parts.push({ words: buildSegment(segment), isScale: false, scaleLevel: 0 })
      } else if (scaleIndex === 1) {
        // Thousands: compound without space
        const segWords = buildSegmentForThousand(segment)
        parts.push({ words: segWords + SCALES[0], isScale: false, scaleLevel: 1 })
      } else {
        // Million+ : space around scale word
        let segWords
        if (segment === 1) {
          segWords = 'eine' // "eine Million"
        } else {
          segWords = buildSegment(segment)
        }
        const scaleWord = segment === 1 ? SCALES[scaleIndex - 1] : SCALES_PLURAL[scaleIndex - 1]
        parts.push({ words: segWords, isScale: false, scaleLevel: scaleIndex })
        parts.push({ words: scaleWord, isScale: true, scaleLevel: scaleIndex })
      }
    }

    scaleIndex--
  }

  // Join with German spacing rules: space around million+ scale words
  return joinGermanParts(parts)
}

/**
 * Joins parts with German spacing rules.
 * Spaces only around million+ scale words.
 *
 * @param {Array} parts - Parts with metadata
 * @returns {string} Joined string
 */
function joinGermanParts (parts) {
  if (parts.length === 0) return ZERO

  let result = ''

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const prevPart = i > 0 ? parts[i - 1] : null

    // Add space before if:
    // - Current is a million+ scale word
    // - Previous was a million+ scale word
    if (i > 0) {
      const needsSpace = part.isScale || (prevPart && prevPart.isScale)
      if (needsSpace) {
        result += ' '
      }
    }

    result += part.words
  }

  return result
}

/**
 * Converts decimal digits to German words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @returns {string} German words for decimal part
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
 * Converts a numeric value to German words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in German words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCardinal(21)           // 'einundzwanzig'
 * toCardinal(1000)         // 'eintausend'
 * toCardinal(1000000)      // 'eine Million'
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
 * Builds ordinal segment for 0-999.
 * Only the final component becomes ordinal.
 * Uses -te for 1-19, -ste for 20+.
 *
 * @param {number} n - Number 0-999
 * @param {boolean} isFinal - Whether this is the final segment (gets ordinal suffix)
 * @returns {string} German ordinal words for this segment
 */
function buildOrdinalSegment (n, isFinal) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  let result = ''

  // Hundreds part (cardinal form)
  if (hundreds > 0) {
    result += (hundreds === 1 ? EIN : ONES[hundreds]) + HUNDRED
  }

  // Tens and ones
  if (tens === 1) {
    // Teens: 10-19
    if (isFinal) {
      result += ORDINAL_TEENS[ones]
    } else {
      result += TEENS[ones]
    }
  } else if (tens >= 2 && ones > 0) {
    // Compound: einundzwanzig → einundzwanzigste
    if (isFinal) {
      result += (ones === 1 ? EIN : ONES[ones]) + 'und' + ORDINAL_TENS[tens]
    } else {
      result += (ones === 1 ? EIN : ONES[ones]) + 'und' + TENS[tens]
    }
  } else if (tens >= 2) {
    // Just tens: zwanzig → zwanzigste
    if (isFinal) {
      result += ORDINAL_TENS[tens]
    } else {
      result += TENS[tens]
    }
  } else if (ones > 0) {
    // Just ones: eins → erste
    if (isFinal) {
      result += ORDINAL_ONES[ones]
    } else {
      result += ONES[ones]
    }
  }

  // If final and only hundreds (100, 200, etc.), add ordinal suffix
  if (isFinal && hundreds > 0 && tens === 0 && ones === 0) {
    result += ORDINAL_SUFFIX
  }

  return result
}

/**
 * Converts integer to German ordinal words.
 *
 * @param {bigint} n - Positive integer
 * @returns {string} German ordinal words
 */
function integerToOrdinal (n) {
  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n), true)
  }

  // Fast path: numbers < 1,000,000
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      // Exact thousands: "eintausendste", "zweitausendste"
      return buildSegmentForThousand(thousands) + SCALES[0] + ORDINAL_SUFFIX
    }

    // Has remainder: cardinal thousands + ordinal remainder
    return buildSegmentForThousand(thousands) + SCALES[0] + buildOrdinalSegment(remainder, true)
  }

  // For larger numbers, use scale decomposition
  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @returns {string} German ordinal words
 */
function buildLargeOrdinal (n) {
  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from right to left
  const segments = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segments.push(Number(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segments.push(Number(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Find the lowest non-zero segment (highest index = lowest scale level)
  let lowestNonZeroIdx = 0
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i] !== 0) {
      lowestNonZeroIdx = i
      break
    }
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const isLowestSegment = (i === lowestNonZeroIdx)

    if (segment !== 0) {
      if (scaleIndex === 0) {
        // Units segment
        parts.push({ words: buildOrdinalSegment(segment, true), isScale: false, scaleLevel: 0 })
      } else if (scaleIndex === 1) {
        // Thousands
        const segWords = buildSegmentForThousand(segment)
        if (isLowestSegment) {
          parts.push({ words: segWords + SCALES[0] + ORDINAL_SUFFIX, isScale: false, scaleLevel: 1 })
        } else {
          parts.push({ words: segWords + SCALES[0], isScale: false, scaleLevel: 1 })
        }
      } else {
        // Million+
        let segWords
        if (segment === 1) {
          segWords = 'eine'
        } else {
          segWords = buildSegment(segment)
        }
        const scaleWord = segment === 1 ? SCALES[scaleIndex - 1] : SCALES_PLURAL[scaleIndex - 1]
        parts.push({ words: segWords, isScale: false, scaleLevel: scaleIndex })
        if (isLowestSegment) {
          parts.push({ words: scaleWord + ORDINAL_SUFFIX, isScale: true, scaleLevel: scaleIndex })
        } else {
          parts.push({ words: scaleWord, isScale: true, scaleLevel: scaleIndex })
        }
      }
    }

    scaleIndex--
  }

  return joinGermanParts(parts)
}

/**
 * Converts a numeric value to German ordinal words.
 *
 * German ordinals add -te for 1-19 and -ste for 20+.
 * Irregular forms: erste (1st), dritte (3rd), siebte (7th), achte (8th).
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'erste'
 * toOrdinal(2)    // 'zweite'
 * toOrdinal(3)    // 'dritte'
 * toOrdinal(21)   // 'einundzwanzigste'
 * toOrdinal(100)  // 'einhundertste'
 * toOrdinal(1000) // 'eintausendste'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to German currency words (Euro).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.and=true] - Use "und" between euros and cents
 * @returns {string} The amount in German currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)                 // 'zweiundvierzig Euro und fünfzig Cent'
 * toCurrency(1)                     // 'ein Euro'
 * toCurrency(0.99)                  // 'neunundneunzig Cent'
 * toCurrency(0.01)                  // 'ein Cent'
 * toCurrency(42.50, { and: false }) // 'zweiundvierzig Euro fünfzig Cent'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Euros part
  if (euros > 0n || cents === 0n) {
    // Use "ein" instead of "eins" before Euro
    if (euros === 1n) {
      result += EIN
    } else {
      result += integerToWords(euros)
    }
    result += ' ' + EURO
  }

  // Cents part
  if (cents > 0n) {
    if (euros > 0n) {
      result += useAnd ? ' und ' : ' '
    }
    // Use "ein" instead of "eins" before Cent
    if (cents === 1n) {
      result += EIN
    } else {
      result += integerToWords(cents)
    }
    result += ' ' + CENT
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
