/**
 * Marathi language converter - Functional Implementation
 *
 * Self-contained converter for South Asian numbering.
 *
 * Key features:
 * - Indian numbering system (हजार, लाख, कोटी)
 * - Devanagari script
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'शून्य'
const NEGATIVE = 'उणे'
const DECIMAL_SEP = 'दशांश'
const HUNDRED = 'शंभर'

const BELOW_HUNDRED = [
  'शून्य', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ',
  'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
  'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
  'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस',
  'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
  'पन्नास', 'एक्काव्वन', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचाव्वन', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
  'साठ', 'एकसष्ठ', 'बासष्ठ', 'त्रेसष्ठ', 'चौसष्ठ', 'पासष्ठ', 'सहासष्ठ', 'सदुसष्ठ', 'अडुसष्ठ', 'एकोणसत्तर',
  'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी',
  'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद',
  'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'हजार', 'लाख', 'कोटी', 'अब्ज', 'खर्व', 'निखर्व', 'महापद्म', 'शंकू']

// ============================================================================
// Segment Splitting (inlined for performance)
// ============================================================================

function groupByThreeThenTwos (n) {
  const numStr = n.toString()
  if (numStr.length <= 3) return [Number(numStr)]

  const segments = []
  segments.unshift(Number(numStr.slice(-3)))

  let remaining = numStr.slice(0, -3)
  while (remaining.length > 0) {
    segments.unshift(Number(remaining.slice(-2)))
    remaining = remaining.slice(0, -2)
  }

  return segments
}

function segmentToWords (n) {
  if (n === 0) return ''
  if (n < 100) return BELOW_HUNDRED[n]

  const hundreds = Math.trunc(n / 100)
  const remainder = n % 100

  if (remainder === 0) {
    return BELOW_HUNDRED[hundreds] + ' ' + HUNDRED
  }
  return BELOW_HUNDRED[hundreds] + ' ' + HUNDRED + ' ' + BELOW_HUNDRED[remainder]
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  const segments = groupByThreeThenTwos(n)
  const segmentCount = segments.length
  const words = []

  for (let i = 0; i < segmentCount; i++) {
    const segmentValue = segments[i]
    if (segmentValue === 0) continue

    const scaleIndex = segmentCount - i - 1
    words.push(segmentToWords(segmentValue))
    if (scaleIndex > 0 && SCALE_WORDS[scaleIndex]) {
      words.push(SCALE_WORDS[scaleIndex])
    }
  }

  return words.join(' ').trim()
}

function decimalPartToWords (decimalPart) {
  // Per-digit decimal reading
  const digits = []
  for (const char of decimalPart) {
    const d = parseInt(char, 10)
    digits.push(d === 0 ? ZERO : BELOW_HUNDRED[d])
  }
  return digits.join(' ')
}

/**
 * Converts a numeric value to Marathi words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Marathi words
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
