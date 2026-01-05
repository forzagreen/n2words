/**
 * Gujarati language converter - Functional Implementation
 *
 * Self-contained converter for South Asian numbering.
 *
 * Key features:
 * - Indian numbering system (હજાર, લાખ, કરોડ)
 * - Gujarati script
 * - 3-2-2 grouping pattern (last 3 digits, then groups of 2)
 * - Complete word forms for 0-99
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'શૂન્ય'
const NEGATIVE = 'ઋણ'
const DECIMAL_SEP = 'દશાંશ'
const HUNDRED = 'સો'

const BELOW_HUNDRED = [
  'શૂન્ય', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ',
  'દસ', 'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ',
  'વીસ', 'એકવીસ', 'બાવીસ', 'ત્રેવીસ', 'ચોવીસ', 'પચીસ', 'છવ્વીસ', 'સત્તાવીસ', 'અઠ્ઠાવીસ', 'ઓગણત્રીસ',
  'ત્રીસ', 'એકત્રીસ', 'બત્રીસ', 'તેત્રીસ', 'ચોત્રીસ', 'પાંત્રીસ', 'છત્રીસ', 'સાડત્રીસ', 'અડત્રીસ', 'ઓગણચાલીસ',
  'ચાલીસ', 'એકતાલીસ', 'બેતાળીસ', 'ત્રેતાળીસ', 'ચુંમાલીસ', 'પિસ્તાલીસ', 'છેતાળીસ', 'સુડતાળીસ', 'અડતાળીસ', 'ઓગણપચાસ',
  'પચાસ', 'એકાવન', 'બાવન', 'ત્રેપન', 'ચોપન', 'પંચાવન', 'છપ્પન', 'સત્તાવન', 'અઠ્ઠાવન', 'ઓગણસાઠ',
  'સાઠ', 'એકસઠ', 'બાસઠ', 'ત્રેસઠ', 'ચોસઠ', 'પાંસઠ', 'છાસઠ', 'સડસઠ', 'અડસઠ', 'અગણોસિત્તેર',
  'સિત્તેર', 'એકોતેર', 'બોતેર', 'તોતેર', 'ચુમોતેર', 'પંચોતેર', 'છોતેર', 'સિત્યોતેર', 'ઇઠ્યોતેર', 'ઓગણાએંસી',
  'એંસી', 'એક્યાસી', 'બ્યાસી', 'ત્યાસી', 'ચોર્યાસી', 'પંચાસી', 'છ્યાસી', 'સિત્યાસી', 'અઠ્યાસી', 'નેવ્યાસી',
  'નેવું', 'એકાણું', 'બાણું', 'ત્રાણું', 'ચોરાણું', 'પંચાણું', 'છન્નું', 'સત્તાણું', 'અઠ્ઠાણું', 'નવ્વાણું'
]

// Scale words: index 0 = units (empty), 1 = thousand, 2 = lakh, 3 = crore, etc.
const SCALE_WORDS = ['', 'હજાર', 'લાખ', 'કરોડ', 'અબજ', 'ખરબ', 'નીલ', 'પદ્મ', 'શંખ']

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
