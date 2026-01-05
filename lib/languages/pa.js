/**
 * Punjabi language converter - Functional Implementation
 *
 * Self-contained converter for South Asian numbering.
 *
 * Key features:
 * - Indian numbering system (ਹਜ਼ਾਰ, ਲੱਖ, ਕਰੋੜ)
 * - Gurmukhi script
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'ਸਿਫ਼ਰ'
const NEGATIVE = 'ਮਾਇਨਸ'
const DECIMAL_SEP = 'ਦਸ਼ਮਲਵ'
const HUNDRED = 'ਸੌ'

const BELOW_HUNDRED = [
  'ਸਿਫ਼ਰ', 'ਇੱਕ', 'ਦੋ', 'ਤਿੰਨ', 'ਚਾਰ', 'ਪੰਜ', 'ਛੇ', 'ਸੱਤ', 'ਅੱਠ', 'ਨੌਂ',
  'ਦੱਸ', 'ਗਿਆਰਾਂ', 'ਬਾਰਾਂ', 'ਤੇਰਾਂ', 'ਚੌਦਾਂ', 'ਪੰਦਰਾਂ', 'ਸੋਲਾਂ', 'ਸਤਾਰਾਂ', 'ਅਠਾਰਾਂ', 'ਉੱਨੀ',
  'ਵੀਹ', 'ਇੱਕੀ', 'ਬਾਈ', 'ਤੇਈ', 'ਚੌਬੀ', 'ਪੱਚੀ', 'ਛੱਬੀ', 'ਸਤਾਈ', 'ਅਠਾਈ', 'ਉਨੱਤੀ',
  'ਤੀਹ', 'ਇਕੱਤੀ', 'ਬੱਤੀ', 'ਤੇਤੀ', 'ਚੌਂਤੀ', 'ਪੈਂਤੀ', 'ਛੱਤੀ', 'ਸੈਂਤੀ', 'ਅਠੱਤੀ', 'ਉਨਤਾਲੀ',
  'ਚਾਲੀ', 'ਇਕਤਾਲੀ', 'ਬਿਆਲੀ', 'ਤਿਰਤਾਲੀ', 'ਚੁਵਾਲੀ', 'ਪੰਤਾਲੀ', 'ਛਿਆਲੀ', 'ਸੈਂਤਾਲੀ', 'ਅਠਤਾਲੀ', 'ਉਨੰਜਾ',
  'ਪੰਜਾਹ', 'ਇਕਵੰਜਾ', 'ਬਵੰਜਾ', 'ਤਰਵੰਜਾ', 'ਚੁਰਵੰਜਾ', 'ਪੰਜਵੰਜਾ', 'ਛਪੰਜਾ', 'ਸੱਤਵੰਜਾ', 'ਅਠਵੰਜਾ', 'ਉਨਾਹਠ',
  'ਸੱਠ', 'ਇਕਾਹਠ', 'ਬਾਹਠ', 'ਤਰਸਠ', 'ਚੌਂਸਠ', 'ਪੈਂਸਠ', 'ਛਿਆਸਠ', 'ਸੜਸਠ', 'ਅੜਸਠ', 'ਉਣਹੱਤਰ',
  'ਸਤੱਰ', 'ਇਕਹੱਤਰ', 'ਬਹੱਤਰ', 'ਤਹੱਤਰ', 'ਚੌਹੱਤਰ', 'ਪੰਝਹੱਤਰ', 'ਛਿਹੱਤਰ', 'ਸਤੱਤਰ', 'ਅਠੱਤਰ', 'ਉਨਾਸੀ',
  'ਅੱਸੀ', 'ਇਕਿਆਸੀ', 'ਬਿਆਸੀ', 'ਤਰਿਆਸੀ', 'ਚੌਰਿਆਸੀ', 'ਪਚਾਸੀ', 'ਛਿਆਸੀ', 'ਸੱਤਾਸੀ', 'ਅਠਾਸੀ', 'ਨਵਾਸੀ',
  'ਨੱਬੇ', 'ਇਕਾਨਵੇਂ', 'ਬਾਨਵੇਂ', 'ਤਰਾਨਵੇਂ', 'ਚੁਰਾਨਵੇਂ', 'ਪੰਚਾਨਵੇਂ', 'ਛਿਆਨਵੇਂ', 'ਸਤਾਨਵੇਂ', 'ਅਠਾਨਵੇਂ', 'ਨਿਨਾਨਵੇਂ'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'ਹਜ਼ਾਰ', 'ਲੱਖ', 'ਕਰੋੜ', 'ਅਰਬ', 'ਖਰਬ', 'ਨੀਲ', 'ਪਦਮ', 'ਸ਼ੰਖ']

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
