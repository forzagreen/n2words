/**
 * Tamil (India) language converter
 *
 * CLDR: ta-IN | Tamil as used in India
 *
 * Key features:
 * - Indian numbering system (ஆயிரம், லட்சம், கோடி)
 * - Tamil script
 * - 3-2-2 grouping pattern
 * - Complete word forms for 0-99
 * - Special hundred word transformations (connected vs standalone)
 * - Per-digit decimal reading
 * - BigInt modulo for efficient segment extraction
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'பூஜ்ஜியம்'
const NEGATIVE = 'மைனஸ்'
const DECIMAL_SEP = 'புள்ளி'

// ============================================================================
// Ordinal Vocabulary
// ============================================================================

// Ordinal suffix
const ORDINAL_SUFFIX = 'ஆவது'

// Special ordinals for first few numbers
const ORDINAL_SPECIAL = ['', 'முதல்', 'இரண்டாவது', 'மூன்றாவது', 'நான்காவது', 'ஐந்தாவது', 'ஆறாவது']

// ============================================================================
// Currency Vocabulary (Indian Rupee)
// ============================================================================

// Rupee (singular/plural same in Tamil)
const RUPEE = 'ரூபாய்'

// Paisa (singular/plural same in Tamil)
const PAISA = 'பைசா'

const BELOW_HUNDRED = [
  'பூஜ்ஜியம்', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
  'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதிமூன்று', 'பதினான்கு', 'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது',
  'இருபது', 'இருபத்தொன்று', 'இருபத்திரண்டு', 'இருபத்திமூன்று', 'இருபத்திநான்கு', 'இருபத்தைந்து', 'இருபத்தாறு', 'இருபத்தேழு', 'இருபத்தெட்டு', 'இருபத்தொன்பது',
  'முப்பது', 'முப்பத்தொன்று', 'முப்பத்திரண்டு', 'முப்பத்திமூன்று', 'முப்பத்திநான்கு', 'முப்பத்தைந்து', 'முப்பத்தாறு', 'முப்பத்தேழு', 'முப்பத்தெட்டு', 'முப்பத்தொன்பது',
  'நாற்பது', 'நாற்பத்தொன்று', 'நாற்பத்திரண்டு', 'நாற்பத்திமூன்று', 'நாற்பத்திநான்கு', 'நாற்பத்தைந்து', 'நாற்பத்தாறு', 'நாற்பத்தேழு', 'நாற்பத்தெட்டு', 'நாற்பத்தொன்பது',
  'ஐம்பது', 'ஐம்பத்தொன்று', 'ஐம்பத்திரண்டு', 'ஐம்பத்திமூன்று', 'ஐம்பத்திநான்கு', 'ஐம்பத்தைந்து', 'ஐம்பத்தாறு', 'ஐம்பத்தேழு', 'ஐம்பத்தெட்டு', 'ஐம்பத்தொன்பது',
  'அறுபது', 'அறுபத்தொன்று', 'அறுபத்திரண்டு', 'அறுபத்திமூன்று', 'அறுபத்திநான்கு', 'அறுபத்தைந்து', 'அறுபத்தாறு', 'அறுபத்தேழு', 'அறுபத்தெட்டு', 'அறுபத்தொன்பது',
  'எழுபது', 'எழுபத்தொன்று', 'எழுபத்திரண்டு', 'எழுபத்திமூன்று', 'எழுபத்திநான்கு', 'எழுபத்தைந்து', 'எழுபத்தாறு', 'எழுபத்தேழு', 'எழுபத்தெட்டு', 'எழுபத்தொன்பது',
  'எண்பது', 'எண்பத்தொன்று', 'எண்பத்திரண்டு', 'எண்பத்திமூன்று', 'எண்பத்திநான்கு', 'எண்பத்தைந்து', 'எண்பத்தாறு', 'எண்பத்தேழு', 'எண்பத்தெட்டு', 'எண்பத்தொன்பது',
  'தொண்ணூறு', 'தொண்ணூற்று ஒன்று', 'தொண்ணூற்று இரண்டு', 'தொண்ணூற்று மூன்று', 'தொண்ணூற்று நான்கு', 'தொண்ணூற்று ஐந்து', 'தொண்ணூற்று ஆறு', 'தொண்ணூற்று ஏழு', 'தொண்ணூற்று எட்டு', 'தொண்ணூற்று ஒன்பது'
]

// Standalone hundreds (when not followed by remainder)
const HUNDREDS = ['', 'நூறு', 'இருநூறு', 'முன்னூறு', 'நானூறு', 'ஐநூறு', 'அறுநூறு', 'எழுநூறு', 'எண்நூறு', 'தொள்ளாயிரம்']

// Connected form of hundreds (when followed by remainder) - precomputed
const HUNDREDS_CONNECTED = ['', 'நூற்று', 'இருநூற்று', 'முன்னூற்று', 'நானூற்று', 'ஐநூற்று', 'அறுநூற்று', 'எழுநூற்று', 'எண்நூற்று', 'தொள்ளாயிரத்து']

// Ones for decimal reading
const ONES = ['ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது']

// Scale words: index 0 = units, 1 = thousand, 2 = lakh, etc.
const SCALE_WORDS = ['', 'ஆயிரம்', 'லட்சம்', 'கோடி', 'அரபு', 'கராபு', 'நீல்', 'பத்ம', 'சங்கு']

// ============================================================================
// Segment Building
// ============================================================================

/**
 * Builds words for a 0-999 segment.
 *
 * @param {number} n - Number 0-999
 * @returns {string} Tamil words for the segment
 */
function buildSegment (n) {
  if (n === 0) return ''
  if (n < 100) return BELOW_HUNDRED[n]

  const hundreds = Math.trunc(n / 100)
  const remainder = n % 100

  if (remainder === 0) {
    return HUNDREDS[hundreds]
  }

  // Use connected form when followed by remainder
  return HUNDREDS_CONNECTED[hundreds] + ' ' + BELOW_HUNDRED[remainder]
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Tamil words.
 *
 * Uses BigInt modulo for segment extraction (faster than string slicing).
 * South Asian 3-2-2 grouping: first 3 digits, then groups of 2.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @returns {string} Tamil words
 */
function integerToWords (n) {
  if (n === 0n) return ZERO

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  // Extract segments using BigInt modulo
  const segments = []
  segments.push(Number(n % 1000n))
  let temp = n / 1000n

  while (temp > 0n) {
    segments.push(Number(temp % 100n))
    temp = temp / 100n
  }

  // Build result string (process from most-significant to least)
  const words = []
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (i === 0) {
      words.push(buildSegment(segment))
    } else {
      // Use 'ஒரு' for 1 at scale positions
      const groupWords = (segment === 1) ? 'ஒரு' : BELOW_HUNDRED[segment]
      words.push(groupWords)
    }

    if (i > 0 && SCALE_WORDS[i]) {
      words.push(SCALE_WORDS[i])
    }
  }

  return words.join(' ')
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : ONES[d - 1])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Tamil words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Tamil words
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
 * Converts a positive integer to Tamil ordinal words.
 *
 * Tamil ordinals: First has special form, 2-6 have special suffixes, then -ஆவது suffix.
 *
 * @param {bigint} n - Positive integer to convert
 * @returns {string} Tamil ordinal words
 */
function integerToOrdinal (n) {
  // Special ordinals for 1-6
  if (n >= 1n && n <= 6n) {
    return ORDINAL_SPECIAL[Number(n)]
  }

  // For 7 and above, add suffix to cardinal
  const cardinal = integerToWords(n)
  return cardinal + ORDINAL_SUFFIX
}

/**
 * Converts a numeric value to Tamil ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)    // 'முதல்'
 * toOrdinal(2)    // 'இரண்டாவது'
 * toOrdinal(10)   // 'பத்துஆவது'
 */
function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Converts a numeric value to Tamil currency words (Indian Rupee).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Tamil currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'நாற்பத்திரண்டு ரூபாய் ஐம்பது பைசா'
 * toCurrency(1)      // 'ஒன்று ரூபாய்'
 * toCurrency(0.01)   // 'ஒன்று பைசா'
 */
function toCurrency (value) {
  const { isNegative, dollars: rupees, cents: paise } = parseCurrencyValue(value)

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Rupees part - show if non-zero, or if no paise
  if (rupees > 0n || paise === 0n) {
    result += integerToWords(rupees) + ' ' + RUPEE
  }

  // Paise part
  if (paise > 0n) {
    if (rupees > 0n) {
      result += ' '
    }
    result += integerToWords(paise) + ' ' + PAISA
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
