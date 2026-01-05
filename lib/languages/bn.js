/**
 * Bangla language converter - Functional Implementation
 *
 * Self-contained converter for South Asian numbering.
 *
 * Key features:
 * - Indian numbering system (হাজার, লাখ, কোটি)
 * - Bangla script (Bengali)
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'শূন্য'
const NEGATIVE = 'মাইনাস'
const DECIMAL_SEP = 'দশমিক'
const HUNDRED = 'শত'

const BELOW_HUNDRED = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বেয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বাহান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তেহাত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'হাজার', 'লাখ', 'কোটি', 'আরব', 'খরব', 'নীল', 'পদ্ম', 'শঙ্খ']

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
  let result = ''
  let i = 0

  while (i < decimalPart.length && decimalPart[i] === '0') {
    if (result) result += ' '
    result += ZERO
    i++
  }

  const remainder = decimalPart.slice(i)
  if (remainder) {
    if (result) result += ' '
    result += integerToWords(BigInt(remainder))
  }

  return result
}

/**
 * Converts a numeric value to Bengali words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in Bengali words
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
