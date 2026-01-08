/**
 * Filipino language converter - Functional Implementation
 *
 * Self-contained module with its own input validation, ready for subpath exports.
 *
 * Key features:
 * - Linker "ng" after vowels: "isang daang" (100)
 * - Linker " na " after consonants: "siyam na daang" (900)
 * - Special tens with linker: "limampung anim" (56)
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ONES = ['', 'isa', 'dalawa', 'tatlo', 'apat', 'lima', 'anim', 'pito', 'walo', 'siyam']
const TEENS = ['sampu', 'labinisa', 'labindalawa', 'labintatlo', 'labinapat', 'labinlima', 'labinanum', 'labimpito', 'labingwalo', 'labinsiyam']
const TENS = ['', '', 'dalawampu', 'tatlumpu', 'apatnapu', 'limampu', 'animnapu', 'pitumpu', 'walumpu', 'siyamnapu']

// Scale words include linker (end with "ng")
const HUNDRED = 'daang'
const THOUSAND = 'libong'

const ZERO = 'zero'
const NEGATIVE = 'negatibo'
const DECIMAL_SEP = 'punto'

// Short scale with linker
const SCALE_WORDS = ['', THOUSAND, 'milyong', 'bilyong', 'trilyong']

// ============================================================================
// Helper Functions
// ============================================================================

const VOWELS = ['a', 'e', 'i', 'o', 'u']

function addLinker (word) {
  const lastChar = word[word.length - 1]
  if (VOWELS.includes(lastChar)) {
    return word + 'ng'
  }
  return word + ' na'
}

// ============================================================================
// Segment Building
// ============================================================================

function buildSegment (n) {
  if (n === 0) return ''

  const ones = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  // Hundreds: "isang daan", "dalawang daan", "siyam na daan"
  if (hundredsDigit > 0) {
    const hundredPrefix = addLinker(ONES[hundredsDigit])
    parts.push(hundredPrefix + ' ' + HUNDRED)
  }

  // Tens and ones
  const tensOnes = n % 100

  if (tensOnes === 0) {
    // Just hundreds
  } else if (tensOnes < 10) {
    // Single digit
    parts.push(ONES[ones])
  } else if (tensOnes < 20) {
    // Teens (10-19)
    parts.push(TEENS[ones])
  } else if (ones === 0) {
    // Even tens (20, 30, 40, etc.)
    parts.push(TENS[tensDigit])
  } else {
    // Tens + ones
    // limampu (50) gets special linker: "limampung anim" (56)
    if (tensDigit === 5) {
      parts.push(TENS[tensDigit] + 'ng ' + ONES[ones])
    } else {
      parts.push(TENS[tensDigit] + ' ' + ONES[ones])
    }
  }

  return parts.join(' ')
}

/**
 * Builds segment with linker added to last word (for use before scale words).
 */
function buildSegmentWithLinker (n) {
  const segmentWord = buildSegment(n)
  if (!segmentWord) return ''

  // Find the last space to get the last word
  const lastSpaceIdx = segmentWord.lastIndexOf(' ')
  if (lastSpaceIdx === -1) {
    // Single word
    const lastChar = segmentWord[segmentWord.length - 1]
    if (lastChar === 'g' && segmentWord.endsWith('ng')) {
      return segmentWord // Already has linker
    }
    return addLinker(segmentWord)
  }

  // Multi-word: add linker to last word
  const prefix = segmentWord.slice(0, lastSpaceIdx + 1)
  const lastWord = segmentWord.slice(lastSpaceIdx + 1)

  if (lastWord.endsWith('ng')) {
    return segmentWord // Already has linker
  }
  return prefix + addLinker(lastWord)
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    return buildSegment(Number(n))
  }

  return buildLargeNumberWords(n)
}

/**
 * Builds words for large numbers using BigInt division.
 * @param {bigint} n - Number >= 1000
 * @returns {string} Filipino words
 */
function buildLargeNumberWords (n) {
  // Extract segments using BigInt division (faster than string slicing)
  const segmentValues = []
  let temp = n
  while (temp > 0n) {
    segmentValues.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  // Build result string directly
  let result = ''

  for (let i = segmentValues.length - 1; i >= 0; i--) {
    const segment = segmentValues[i]
    if (segment === 0) continue

    const scaleWord = SCALE_WORDS[i] || ''

    if (result) result += ' '

    if (i === 0) {
      result += buildSegment(segment)
    } else {
      // Add linker to segment before scale word
      const segmentWord = buildSegmentWithLinker(segment)
      result += segmentWord + ' ' + scaleWord
    }
  }

  return result
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : ONES[d])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Filipino words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Filipino words
 */
function toWords (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

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
// Exports
// ============================================================================

export { toWords }
