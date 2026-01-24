/**
 * Dutch (Netherlands) language converter
 *
 * CLDR: nl-NL | Dutch as used in the Netherlands
 *
 * Dutch-specific rules:
 * - Inverted tens-ones: eenentwintig (one-and-twenty)
 * - "ën" connector when ones ends in 'e' (twee, drie)
 * - Compound words without spaces
 * - Hundred pairing for 1100-9999 (elfhonderd style)
 * - "één" vs "een" (accentOne option)
 * - Optional "en" separator (includeOptionalAnd option)
 * - Long scale with -ard forms
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

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

// Currency vocabulary (Euro)
const EURO = 'euro'
const EUROS = 'euro' // Euro doesn't pluralize in Dutch
const CENT = 'cent'
const CENTEN = 'cent' // Cent doesn't pluralize in written currency

// ============================================================================
// Segment Building
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

  // Apply één/een replacement
  const applyAccent = (word) => {
    if (accentOne) {
      return word.replace(/\been\b/g, 'één')
    }
    return word
  }

  // Fast path: numbers < 1000
  if (n < 1000n) {
    return applyAccent(buildSegment(Number(n), includeOptionalAnd))
  }

  // Hundred pairing for 1100-9999
  if (!noHundredPairing && n >= 1100n && n < 10000n) {
    const high = Number(n / 100n)
    const low = Number(n % 100n)

    // Only use pairing when high is not a multiple of 10
    if (high % 10 !== 0) {
      let result = buildSegment(high, includeOptionalAnd) + HUNDRED
      if (low > 0) {
        const lowWord = buildSegment(low, includeOptionalAnd)
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
      result = buildSegment(thousands, includeOptionalAnd) + SCALES[0]
    }

    if (remainder > 0) {
      const remainderWord = buildSegment(remainder, includeOptionalAnd)
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
 * Uses BigInt division for faster segment extraction (4x faster than string slicing).
 *
 * @param {bigint} n - Number >= 1,000,000
 * @param {Object} options - Conversion options
 * @returns {string} Dutch words
 */
function buildLargeNumberWords (n, options) {
  const { includeOptionalAnd } = options

  // Extract segments using BigInt division (faster than string slicing)
  // Segments stored least-significant first (index 0 = ones, 1 = thousands, etc.)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string directly (avoids object allocation and join)
  let result = ''
  let prevWasScale = false

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0) continue

    if (i === 0) {
      // Units segment
      const word = buildSegment(segment, includeOptionalAnd)
      if (result) {
        if (prevWasScale && includeOptionalAnd && segment < 13) {
          result += ' en ' + word
        } else {
          result += ' ' + word
        }
      } else {
        result = word
      }
      prevWasScale = false
    } else if (i === 1) {
      // Thousands - compound
      if (result) result += ' '
      if (segment === 1) {
        result += SCALES[0]
      } else {
        result += buildSegment(segment, includeOptionalAnd) + SCALES[0]
      }
      prevWasScale = true
    } else {
      // Million and above - space around scale
      const scaleWord = SCALES[i - 1]
      if (result) result += ' '
      if (segment === 1) {
        result += 'een ' + scaleWord
      } else {
        result += buildSegment(segment, includeOptionalAnd) + ' ' + scaleWord
      }
      prevWasScale = true
    }
  }

  return result
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
 * toCardinal(21)                        // 'eenentwintig'
 * toCardinal(1)                         // 'één'
 * toCardinal(1, {accentOne: false})     // 'een'
 * toCardinal(1104)                      // 'elfhonderd vier'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

  // Apply option defaults
  const {
    accentOne = true,
    includeOptionalAnd = false,
    noHundredPairing = false
  } = options

  const opts = { accentOne, includeOptionalAnd, noHundredPairing }

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
// Ordinal Functions
// ============================================================================

// Ordinal forms for 1-9
const ORDINAL_ONES = ['', 'eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende', 'achtste', 'negende']

/**
 * Converts a small cardinal to ordinal.
 * Rules: 1-19 add -de (except eerste, derde, achtste), 20+ add -ste
 *
 * @param {string} cardinalWord - Cardinal word
 * @param {number} n - The number value (0-99)
 * @returns {string} Ordinal word
 */
function smallCardinalToOrdinal (cardinalWord, n) {
  // Special cases for 1-9
  if (n >= 1 && n <= 9) return ORDINAL_ONES[n]

  // 10-19: add -de or -e if ends in d
  if (n < 20) {
    if (cardinalWord.endsWith('d')) {
      return cardinalWord + 'e'
    }
    return cardinalWord + 'de'
  }

  // 20+: add -ste
  return cardinalWord + 'ste'
}

/**
 * Builds ordinal words for 0-999.
 *
 * @param {number} n - Number 0-999
 * @returns {string} Dutch ordinal words
 */
function buildOrdinalSegment (n) {
  if (n === 0) return ''

  const hundreds = Math.floor(n / 100)
  const tensOnes = n % 100

  // Simple cases: 1-99
  if (hundreds === 0) {
    const cardinalWord = buildSegment(n, false)
    return smallCardinalToOrdinal(cardinalWord, n)
  }

  // Hundreds: need to build prefix + ordinal suffix
  let prefix = ''
  if (hundreds === 1) {
    prefix = HUNDRED
  } else {
    prefix = ONES[hundreds] + HUNDRED
  }

  if (tensOnes === 0) {
    // Exact hundred: honderdste, tweehonderdste
    return prefix + 'ste'
  }

  // Hundreds + remainder: honderd eerste, tweehonderd drieëntwintigste
  // Dutch ordinals with hundreds use a space before the ordinal part
  const ordinalPart = smallCardinalToOrdinal(buildSegment(tensOnes, false), tensOnes)
  return prefix + ' ' + ordinalPart
}

/**
 * Converts a number to Dutch ordinal words.
 *
 * @param {number | string | bigint} value - The number to convert
 * @returns {string} Dutch ordinal words
 *
 * @example
 * toOrdinal(1)     // 'eerste'
 * toOrdinal(21)    // 'eenentwintigste'
 * toOrdinal(100)   // 'honderdste'
 */
function toOrdinal (value) {
  const n = parseOrdinalValue(value)

  if (n === 0n) return 'nulde'

  // Fast path: 1-9
  if (n < 10n) return ORDINAL_ONES[Number(n)]

  // Fast path: 10-99
  if (n < 100n) {
    const cardinalWord = buildSegment(Number(n), false)
    return smallCardinalToOrdinal(cardinalWord, Number(n))
  }

  // Fast path: 100-999
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n))
  }

  // Large numbers: build with cardinal then convert last segment
  return buildLargeOrdinal(n)
}

/**
 * Builds ordinal words for large numbers.
 *
 * @param {bigint} n - Non-negative integer >= 1000
 * @returns {string} Dutch ordinal words
 */
function buildLargeOrdinal (n) {
  // Extract segments
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Find the lowest non-zero segment
  let lowestNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      lowestNonZeroIdx = i
      break
    }
  }

  // Scale ordinal words
  const SCALE_ORDINAL = ['', 'duizendste', 'miljoenste', 'miljardste', 'biljoenste', 'biljardste', 'triljoenste']

  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    if (result) result += ' '

    if (i === lowestNonZeroIdx) {
      // Last non-zero segment gets ordinal form
      if (i === 0) {
        // Units segment: use ordinal segment builder
        result += buildOrdinalSegment(segment)
      } else if (segment === 1 && i > 0) {
        // Exact scale: duizendste, miljoenste, etc.
        if (i === 1) {
          result += SCALE_ORDINAL[i]
        } else {
          result += 'een ' + SCALE_ORDINAL[i]
        }
      } else {
        // Segment + scale ordinal
        if (i === 1) {
          result += buildSegment(segment, false) + SCALE_ORDINAL[i]
        } else {
          result += buildSegment(segment, false) + ' ' + SCALE_ORDINAL[i]
        }
      }
    } else {
      // Higher segments use cardinal form
      if (i === 1) {
        if (segment === 1) {
          result += SCALES[0]
        } else {
          result += buildSegment(segment, false) + SCALES[0]
        }
      } else {
        const scaleWord = SCALES[i - 1]
        if (segment === 1) {
          result += 'een ' + scaleWord
        } else {
          result += buildSegment(segment, false) + ' ' + scaleWord
        }
      }
    }
  }

  return result
}

// ============================================================================
// Currency Functions
// ============================================================================

/**
 * Converts a number to Dutch currency words (Euro).
 *
 * @param {number | string | bigint} value - The amount to convert
 * @param {Object} [options]
 * @param {boolean} [options.and=true] - Include "en" between euros and cents
 * @returns {string} Dutch currency words
 *
 * @example
 * toCurrency(42.50)  // 'tweeënveertig euro en vijftig cent'
 * toCurrency(1)      // 'één euro'
 * toCurrency(0.01)   // 'één cent'
 */
function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: euros, cents } = parseCurrencyValue(value)
  const { and = true } = options

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  const hasEuros = euros > 0n
  const hasCents = cents > 0n

  if (!hasEuros && !hasCents) {
    return ZERO + ' ' + EUROS
  }

  // Use accentOne: true for currency (één euro, één cent)
  const opts = { accentOne: true, includeOptionalAnd: false, noHundredPairing: true }

  if (hasEuros) {
    const euroWords = integerToWords(euros, opts)
    result += euroWords + ' ' + (euros === 1n ? EURO : EUROS)
  }

  if (hasCents) {
    if (hasEuros) {
      result += and ? ' en ' : ' '
    }
    const centWords = integerToWords(cents, opts)
    result += centWords + ' ' + (cents === 1n ? CENT : CENTEN)
  }

  return result
}

// ============================================================================
// Public API
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
