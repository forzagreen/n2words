/**
 * Dutch language converter - Functional Implementation
 *
 * A performance-optimized number-to-words converter using precomputed lookup tables.
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key optimization: Precompute all segment values (0-999) at module load.
 * This eliminates all per-call string manipulation for segment conversion.
 *
 * Dutch-specific rules (handled in precomputation):
 * - Inverted tens-ones: eenentwintig (one-and-twenty)
 * - "ën" connector when ones ends in 'e' (twee, drie)
 * - Compound words without spaces
 * - Hundred pairing for 1100-9999 (elfhonderd style)
 * - "één" vs "een" (accentOne option)
 * - Optional "en" separator (includeOptionalAnd option)
 * - Long scale with -ard forms
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen']
const TEENS = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien']
const TENS = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig']

const HUNDRED = 'honderd'

// Scale words (long scale with -ard forms)
const SCALES = ['duizend', 'miljoen', 'miljard', 'biljoen', 'biljard', 'triljoen', 'triljard', 'quadriljoen', 'quadriljard']

const ZERO = 'nul'
const NEGATIVE = 'min'
const DECIMAL_SEP = 'komma'

// ============================================================================
// Precomputed Lookup Tables (built once at module load)
// ============================================================================

/**
 * Builds segment word for 0-999.
 * @param {number} n - Segment value
 * @param {boolean} withAnd - Include "en" for values < 13 after hundreds
 * @returns {string} Dutch word (compound, no spaces)
 */
function buildSegment (n, withAnd) {
  if (n === 0) return ''

  const ones = n % 10
  const tens = Math.floor(n / 10) % 10
  const hundreds = Math.floor(n / 100)
  const tensOnes = n % 100

  let result = ''

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      result = HUNDRED
    } else {
      result = ONES[hundreds] + HUNDRED
    }
  }

  // Tens and ones
  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit - add "en" if withAnd and after hundreds
    if (hundreds > 0 && withAnd) {
      result += 'en' + ONES[tensOnes]
    } else {
      result += ONES[tensOnes]
    }
  } else if (tensOnes < 20) {
    // Teens - add "en" if withAnd and after hundreds and < 13
    if (hundreds > 0 && withAnd && tensOnes < 13) {
      result += 'en' + TEENS[ones]
    } else {
      result += TEENS[ones]
    }
  } else {
    // 20-99: Dutch inverts with connector
    if (ones === 0) {
      result += TENS[tens]
    } else {
      // "ën" if ones ends in 'e' (twee, drie)
      const onesWord = ONES[ones]
      const connector = onesWord.endsWith('e') ? 'ën' : 'en'
      result += onesWord + connector + TENS[tens]
    }
  }

  return result
}

// Precompute all 1000 segment words (0-999) - standard form
const SEGMENTS = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegment(i, false)
}

// Precompute all 1000 segment words (0-999) - with optional "en"
const SEGMENTS_WITH_AND = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS_WITH_AND[i] = buildSegment(i, true)
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a non-negative integer to Dutch words.
 *
 * @param {bigint} n - Non-negative integer to convert
 * @param {Object} options - Conversion options
 * @returns {string} Dutch words
 */
function integerToWords (n, options) {
  if (n === 0n) return ZERO

  const { accentOne, includeOptionalAnd, noHundredPairing } = options
  const segments = includeOptionalAnd ? SEGMENTS_WITH_AND : SEGMENTS

  // Apply één/een replacement
  const applyAccent = (word) => {
    if (accentOne) {
      return word.replace(/\been\b/g, 'één')
    }
    return word
  }

  // Fast path: numbers < 1000 (direct lookup)
  if (n < 1000n) {
    return applyAccent(segments[Number(n)])
  }

  // Hundred pairing for 1100-9999
  if (!noHundredPairing && n >= 1100n && n < 10000n) {
    const high = Number(n / 100n)
    const low = Number(n % 100n)

    // Only use pairing when high is not a multiple of 10
    if (high % 10 !== 0) {
      let result = segments[high] + HUNDRED
      if (low > 0) {
        const lowWord = segments[low]
        if (includeOptionalAnd && low < 13) {
          result += ' en ' + lowWord
        } else {
          result += ' ' + lowWord
        }
      }
      return applyAccent(result)
    }
  }

  // Fast path: numbers < 1,000,000 (thousands)
  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      // "duizend" not "eenduizend"
      result = SCALES[0]
    } else {
      // Compound: "vijfduizend"
      result = segments[thousands] + SCALES[0]
    }

    if (remainder > 0) {
      const remainderWord = segments[remainder]
      if (includeOptionalAnd && remainder < 13) {
        result += ' en ' + remainderWord
      } else {
        result += ' ' + remainderWord
      }
    }

    return applyAccent(result)
  }

  // For numbers >= 1,000,000, use scale decomposition
  return applyAccent(buildLargeNumberWords(n, options))
}

/**
 * Builds words for numbers >= 1,000,000.
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {Object} options - Conversion options
 * @returns {string} Dutch words
 */
function buildLargeNumberWords (n, options) {
  const { includeOptionalAnd } = options
  const segments = includeOptionalAnd ? SEGMENTS_WITH_AND : SEGMENTS

  const numStr = n.toString()
  const len = numStr.length

  // Build segments of 3 digits from right to left
  const segmentValues = []
  const segmentSize = 3

  const remainderLen = len % segmentSize
  let pos = 0
  if (remainderLen > 0) {
    segmentValues.push(BigInt(numStr.slice(0, remainderLen)))
    pos = remainderLen
  }
  while (pos < len) {
    segmentValues.push(BigInt(numStr.slice(pos, pos + segmentSize)))
    pos += segmentSize
  }

  // Convert segments to words
  const parts = []
  let scaleIndex = segmentValues.length - 1

  for (let i = 0; i < segmentValues.length; i++) {
    const segment = segmentValues[i]

    if (segment !== 0n) {
      const segNum = Number(segment)

      if (scaleIndex === 0) {
        // Units segment
        parts.push({ word: segments[segNum], isScale: false, value: segNum })
      } else if (scaleIndex === 1) {
        // Thousands - compound
        if (segment === 1n) {
          parts.push({ word: SCALES[0], isScale: true, value: 1 })
        } else {
          parts.push({ word: segments[segNum] + SCALES[0], isScale: true, value: segNum })
        }
      } else {
        // Million and above - space around scale
        const scaleWord = SCALES[scaleIndex - 1]
        if (segment === 1n) {
          parts.push({ word: 'een', isScale: false, value: 1 })
          parts.push({ word: scaleWord, isScale: true, value: 1 })
        } else {
          parts.push({ word: segments[segNum], isScale: false, value: segNum })
          parts.push({ word: scaleWord, isScale: true, value: segNum })
        }
      }
    }

    scaleIndex--
  }

  // Join with Dutch spacing rules
  return joinDutchParts(parts, includeOptionalAnd)
}

/**
 * Joins parts with Dutch spacing rules.
 * - duizend compounds with preceding (vijfduizend)
 * - miljoen+ has space before and after
 *
 * @param {Array} parts - Parts with metadata
 * @param {boolean} includeOptionalAnd - Include "en" for small numbers
 * @returns {string} Joined string
 */
function joinDutchParts (parts, includeOptionalAnd) {
  if (parts.length === 0) return ZERO

  const result = []
  const millionPlusScales = SCALES.slice(1) // Everything after 'duizend'

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const prevPart = i > 0 ? parts[i - 1] : null

    const isMillionPlus = millionPlusScales.includes(part.word)
    const prevIsScale = prevPart && prevPart.isScale

    if (i > 0) {
      if (isMillionPlus) {
        // Space before million+ scale words
        result.push(' ')
      } else if (prevIsScale) {
        // Space after scale words
        if (includeOptionalAnd && part.value < 13 && !part.isScale) {
          result.push(' en ')
        } else {
          result.push(' ')
        }
      }
      // Otherwise no space (compound)
    }

    result.push(part.word)
  }

  return result.join('')
}

/**
 * Converts decimal digits to Dutch words.
 *
 * @param {string} decimalPart - Decimal digits (without the point)
 * @param {Object} options - Conversion options
 * @returns {string} Dutch words for decimal part
 */
function decimalPartToWords (decimalPart, options) {
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
    const word = integerToWords(BigInt(remainder), { ...options, noHundredPairing: true })
    result += word
  }

  return result
}

/**
 * Converts a numeric value to Dutch words.
 *
 * This is the main public API. It accepts any valid numeric input
 * (number, string, or bigint) and handles parsing internally.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.accentOne=true] - Use "één" instead of "een"
 * @param {boolean} [options.includeOptionalAnd=false] - Include "en" before small numbers
 * @param {boolean} [options.noHundredPairing=false] - Disable hundred pairing (1104→duizend honderdvier)
 * @returns {string} The number in Dutch words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toWords(21)                        // 'eenentwintig'
 * toWords(1)                         // 'één'
 * toWords(1, {accentOne: false})     // 'een'
 * toWords(1104)                      // 'elfhonderd vier'
 */
function toWords (value, options = {}) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  const opts = {
    accentOne: options.accentOne !== false, // default true
    includeOptionalAnd: options.includeOptionalAnd || false,
    noHundredPairing: options.noHundredPairing || false
  }

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, opts)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, opts)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toWords }

// Named exports for testing
export {
  ONES,
  TEENS,
  TENS,
  HUNDRED,
  SCALES,
  ZERO,
  SEGMENTS,
  SEGMENTS_WITH_AND,
  integerToWords,
  decimalPartToWords
}
