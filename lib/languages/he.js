/**
 * Modern Hebrew language converter - Functional Implementation
 *
 * Self-contained converter with segment-based decomposition.
 *
 * Key features:
 * - Feminine grammatical forms (default in Modern Hebrew)
 * - Dual forms for 2, 200, 2000
 * - Special 1-9 thousands construct state
 * - Optional "ו" (ve) conjunction
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { validateOptions } from '../utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

// Feminine forms (default in Modern Hebrew)
const ONES = { 1: 'אחת', 2: 'שתים', 3: 'שלש', 4: 'ארבע', 5: 'חמש', 6: 'שש', 7: 'שבע', 8: 'שמונה', 9: 'תשע' }
const TEENS = { 0: 'עשר', 1: 'אחת עשרה', 2: 'שתים עשרה', 3: 'שלש עשרה', 4: 'ארבע עשרה', 5: 'חמש עשרה', 6: 'שש עשרה', 7: 'שבע עשרה', 8: 'שמונה עשרה', 9: 'תשע עשרה' }
const TWENTIES = { 2: 'עשרים', 3: 'שלשים', 4: 'ארבעים', 5: 'חמישים', 6: 'ששים', 7: 'שבעים', 8: 'שמונים', 9: 'תשעים' }
const HUNDREDS_WORDS = { 1: 'מאה', 2: 'מאתיים', 3: 'מאות' }

// Special forms for 1-9 thousand
const PLURAL_FORMS = {
  1: 'אלף',
  2: 'אלפיים',
  3: 'שלשת אלפים',
  4: 'ארבעת אלפים',
  5: 'חמשת אלפים',
  6: 'ששת אלפים',
  7: 'שבעת אלפים',
  8: 'שמונת אלפים',
  9: 'תשעת אלפים'
}

const SCALE = { 1: 'אלף', 2: 'מיליון', 3: 'מיליארד', 4: 'טריליון', 5: 'קוודרליון', 6: 'קווינטיליון' }
const SCALE_PLURAL = { 1: 'אלפים', 2: 'מיליונים', 3: 'מיליארדים', 4: 'טריליונים', 5: 'קוודרליונים', 6: 'קווינטיליונים' }

const ZERO = 'אפס'
const NEGATIVE = 'מינוס'
const DECIMAL_SEP = 'נקודה'

// ============================================================================
// Segment Helpers
// ============================================================================

/**
 * Extract place values from a 3-digit segment.
 * @param {bigint} segment - A number 0-999
 * @returns {[bigint, bigint, bigint]} - [ones, tens, hundreds]
 */
function placeValues (segment) {
  const ones = segment % 10n
  const tens = (segment / 10n) % 10n
  const hundreds = segment / 100n
  return [ones, tens, hundreds]
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n, options = {}) {
  if (n === 0n) return ZERO

  const andWord = options.andWord ?? 'ו'

  // Split into 3-digit segments using BigInt division (faster than string slicing)
  // Segments are stored least-significant first, then we process in reverse
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(temp % 1000n)
    temp = temp / 1000n
  }

  const words = []
  // Process from most-significant (end of array) to least-significant (start)
  for (let i = segments.length - 1; i >= 0; i--) {
    const x = segments[i]
    const index = i // index 0 = ones, 1 = thousands, 2 = millions, etc.

    if (x === 0n) continue

    const [n1, n2, n3] = placeValues(x)

    if (index > 0) {
      const chunkWords = []
      let hasHundreds = false

      // Hundreds
      if (n3 > 0n) {
        hasHundreds = true
        if (n3 <= 2n) {
          chunkWords.push(HUNDREDS_WORDS[Number(n3)])
        } else {
          chunkWords.push(ONES[Number(n3)] + ' ' + HUNDREDS_WORDS[3])
        }
      }

      // Tens
      if (n2 > 1n) {
        const tensWord = TWENTIES[Number(n2)]
        chunkWords.push(hasHundreds ? andWord + tensWord : tensWord)
      }

      // Ones
      if (n2 === 1n) {
        const onesWord = TEENS[Number(n1)]
        chunkWords.push(hasHundreds ? andWord + onesWord : onesWord)
      } else if (n1 > 0n) {
        if (x === 1n && index > 1) {
          // Skip "one" for millions/billions
        } else if (x <= 9n && chunkWords.length === 0 && index === 1) {
          // Special forms for 1-9 thousand
          chunkWords.push(PLURAL_FORMS[Number(n1)])
        } else {
          const onesWord = ONES[Number(n1)]
          chunkWords.push((hasHundreds || n2 > 0n) ? andWord + onesWord : onesWord)
        }
      }

      // Scale word
      if (x > 9n || index > 1) {
        if (x === 1n) {
          chunkWords.push(SCALE[index])
        } else if (x === 2n && index === 1) {
          // Special case: 2000 = אלפיים
          // If we have more words after, join them
          if (words.length > 0) {
            return [PLURAL_FORMS[2], ...words].join(' ')
          }
          words.push(PLURAL_FORMS[2])
          continue
        } else if (x === 2n) {
          chunkWords.push(SCALE_PLURAL[index])
        } else if (index === 1) {
          chunkWords.push(SCALE[index])
        } else {
          chunkWords.push(SCALE_PLURAL[index])
        }
      }

      words.push(chunkWords.join(' '))
      continue
    }

    // Ones segment (no scale word)
    if (n3 > 0n) {
      if (n3 <= 2n) {
        words.push(HUNDREDS_WORDS[Number(n3)])
      } else {
        words.push(ONES[Number(n3)] + ' ' + HUNDREDS_WORDS[3])
      }
    }

    if (n2 > 1n) {
      words.push(TWENTIES[Number(n2)])
    }

    if (n2 === 1n) {
      words.push(TEENS[Number(n1)])
    } else if (n1 > 0n) {
      words.push(ONES[Number(n1)])
    }
  }

  // Add conjunction before final component
  if (words.length > 1) {
    const lastIdx = words.length - 1
    words[lastIdx] = andWord + words[lastIdx]
  }

  return words.join(' ')
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
 * Converts a numeric value to Modern Hebrew words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @param {string} [options.andWord] - Custom conjunction word
 * @returns {string} The number in Modern Hebrew words
 */
function toWords (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    result = NEGATIVE + ' '
  }

  result += integerToWords(integerPart, options)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toWords }
