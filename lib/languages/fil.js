/**
 * Filipino language converter - Functional Implementation
 *
 * Self-contained converter with precomputed lookup tables.
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
// Precomputed Lookup Table
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

const SEGMENTS = new Array(1000)
for (let i = 0; i < 1000; i++) {
  SEGMENTS[i] = buildSegment(i)
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    return SEGMENTS[Number(n)]
  }

  return buildLargeNumberWords(n)
}

function buildLargeNumberWords (n) {
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
      const scaleWord = SCALE_WORDS[scaleIndex] || ''

      if (scaleIndex === 0) {
        parts.push(SEGMENTS[segment])
      } else {
        // Add linker to segment before scale word
        let segmentWord = SEGMENTS[segment]

        // Find last word and add linker
        const words = segmentWord.split(' ')
        const lastWord = words[words.length - 1]
        if (!lastWord.endsWith('ng') && !lastWord.endsWith(' na')) {
          words[words.length - 1] = addLinker(lastWord)
          segmentWord = words.join(' ')
        }

        parts.push(segmentWord + ' ' + scaleWord)
      }
    }

    scaleIndex--
  }

  return parts.join(' ')
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
