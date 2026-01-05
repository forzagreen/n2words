/**
 * French (Belgium) language converter - Functional Implementation
 *
 * Self-contained converter with precomputed lookup tables.
 *
 * Belgian French differences from standard French:
 * - septante (70) instead of soixante-dix
 * - nonante (90) instead of quatre-vingt-dix
 * - Keeps quatre-vingts (80) like standard French
 * - Uses "septante et un" (71), "nonante et un" (91)
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { validateOptions } from '../utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'septante', 'quatre-vingt', 'nonante']

// Scale words (long scale with -ard forms)
const SCALES = ['million', 'billion', 'trillion', 'quadrillion']
const SCALES_ARD = ['milliard', 'billiard', 'trilliard', 'quadrilliard']

const THOUSAND = 'mille'
const HUNDRED = 'cent'
const ZERO = 'zéro'
const NEGATIVE = 'moins'
const DECIMAL_SEP = 'virgule'

// ============================================================================
// Precomputed Lookup Tables
// ============================================================================

function buildSegment (n) {
  if (n === 0) return { word: '', endsWithCents: false, endsWithVingts: false }

  const tensOnes = n % 100
  const hundreds = Math.floor(n / 100)

  const parts = []
  let endsWithCents = false
  let endsWithVingts = false

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push(HUNDRED)
    } else {
      if (tensOnes === 0) {
        parts.push(ONES[hundreds] + ' ' + HUNDRED + 's')
        endsWithCents = true
      } else {
        parts.push(ONES[hundreds] + ' ' + HUNDRED)
      }
    }
  }

  // Tens and ones - Belgian pattern
  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    parts.push(ONES[tensOnes])
  } else if (tensOnes < 17) {
    parts.push(TEENS[tensOnes - 10])
  } else if (tensOnes < 20) {
    parts.push(TEENS[tensOnes - 10])
  } else if (tensOnes < 70) {
    // 20-69: standard pattern
    const t = Math.floor(tensOnes / 10)
    const o = tensOnes % 10
    if (o === 0) {
      parts.push(TENS[t])
    } else if (o === 1) {
      parts.push(TENS[t] + ' et ' + ONES[1])
    } else {
      parts.push(TENS[t] + '-' + ONES[o])
    }
  } else if (tensOnes < 80) {
    // 70-79: septante pattern (Belgian)
    const o = tensOnes % 10
    if (o === 0) {
      parts.push('septante')
    } else if (o === 1) {
      parts.push('septante et ' + ONES[1])
    } else {
      parts.push('septante-' + ONES[o])
    }
  } else if (tensOnes === 80) {
    // 80: quatre-vingts (same as standard)
    parts.push('quatre-vingts')
    endsWithVingts = true
  } else if (tensOnes < 90) {
    // 81-89: quatre-vingt-X (same as standard)
    const remainder = tensOnes - 80
    parts.push('quatre-vingt-' + ONES[remainder])
  } else {
    // 90-99: nonante pattern (Belgian)
    const o = tensOnes % 10
    if (o === 0) {
      parts.push('nonante')
    } else if (o === 1) {
      parts.push('nonante et ' + ONES[1])
    } else {
      parts.push('nonante-' + ONES[o])
    }
  }

  return { word: parts.join(' '), endsWithCents, endsWithVingts }
}

// Precompute all 1000 segment words
const SEGMENTS = new Array(1000)
const SEGMENTS_ENDS_CENTS = new Array(1000)
const SEGMENTS_ENDS_VINGTS = new Array(1000)

for (let i = 0; i < 1000; i++) {
  const result = buildSegment(i)
  SEGMENTS[i] = result.word
  SEGMENTS_ENDS_CENTS[i] = result.endsWithCents
  SEGMENTS_ENDS_VINGTS[i] = result.endsWithVingts
}

// ============================================================================
// Helper Functions
// ============================================================================

function getScaleWord (scaleIndex, segment) {
  if (scaleIndex === 1) return THOUSAND

  if (scaleIndex % 2 === 0) {
    const arrayIndex = (scaleIndex / 2) - 1
    const baseWord = SCALES[arrayIndex]
    if (!baseWord) return ''
    return segment > 1n ? baseWord + 's' : baseWord
  } else {
    const arrayIndex = ((scaleIndex - 1) / 2) - 1
    const ardWord = SCALES_ARD[arrayIndex]
    if (!ardWord) return THOUSAND
    return segment > 1n ? ardWord + 's' : ardWord
  }
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n, withHyphen = false) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    const word = SEGMENTS[Number(n)]
    return withHyphen ? word.replace(/ /g, '-') : word
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    let result
    if (thousands === 1) {
      result = THOUSAND
    } else {
      let thousandsWord = SEGMENTS[thousands]
      if (SEGMENTS_ENDS_CENTS[thousands] || SEGMENTS_ENDS_VINGTS[thousands]) {
        thousandsWord = thousandsWord.slice(0, -1)
      }
      result = thousandsWord + (withHyphen ? '-' : ' ') + THOUSAND
    }

    if (remainder > 0) {
      result += (withHyphen ? '-' : ' ') + SEGMENTS[remainder]
    }

    if (withHyphen) {
      result = result.replace(/ /g, '-')
    }

    return result
  }

  return buildLargeNumberWords(n, withHyphen)
}

function buildLargeNumberWords (n, withHyphen) {
  const numStr = n.toString()
  const len = numStr.length

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

  const parts = []
  let scaleIndex = segments.length - 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment !== 0) {
      const scaleWord = scaleIndex > 0 ? getScaleWord(scaleIndex, BigInt(segment)) : ''

      if (scaleIndex === 0) {
        parts.push(SEGMENTS[segment])
      } else if (scaleIndex === 1) {
        if (segment === 1) {
          parts.push(THOUSAND)
        } else {
          let segWords = SEGMENTS[segment]
          if (SEGMENTS_ENDS_CENTS[segment] || SEGMENTS_ENDS_VINGTS[segment]) {
            segWords = segWords.slice(0, -1)
          }
          parts.push(segWords)
          parts.push(scaleWord)
        }
      } else {
        parts.push(SEGMENTS[segment])
        parts.push(scaleWord)
      }
    }

    scaleIndex--
  }

  const sep = withHyphen ? '-' : ' '
  let result = parts.join(sep)

  if (withHyphen) {
    result = result.replace(/ /g, '-')
  }

  return result
}

function decimalPartToWords (decimalPart, withHyphen) {
  let result = ''
  const sep = withHyphen ? '-' : ' '

  let i = 0
  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += sep
    result += ZERO
    i++
  }

  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += sep
    result += integerToWords(BigInt(remainder), withHyphen)
  }

  return result
}

/**
 * Converts a numeric value to Belgian French words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.withHyphenSeparator=false] - Use hyphens between words
 * @returns {string} The number in Belgian French words
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)
  const withHyphen = options.withHyphenSeparator || false

  let result = ''
  const sep = withHyphen ? '-' : ' '

  if (isNegative) {
    result = NEGATIVE + sep
  }

  result += integerToWords(integerPart, withHyphen)

  if (decimalPart) {
    result += sep + DECIMAL_SEP + sep + decimalPartToWords(decimalPart, withHyphen)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toWords }
