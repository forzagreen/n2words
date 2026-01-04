/**
 * Telugu language converter - Functional Implementation
 *
 * Self-contained converter for South Asian numbering.
 *
 * Key features:
 * - Indian numbering system (వెయ్యి, లక్ష, కోటి)
 * - Telugu script
 * - 3-2-2 grouping pattern
 * - Complete word forms for 0-99
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'
import { groupByThreeThenTwos } from './utils/south-asian.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'సున్నా'
const NEGATIVE = 'మైనస్'
const DECIMAL_SEP = 'పాయింట్'

const BELOW_HUNDRED = [
  'సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది',
  'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పంతొమ్మిది',
  'ఇరవై', 'ఇరవై ఒక్కటి', 'ఇరవై రెండు', 'ఇరవై మూడు', 'ఇరవై నాలుగు', 'ఇరవై ఐదు', 'ఇరవై ఆరు', 'ఇరవై ఏడు', 'ఇరవై ఎనిమిది', 'ఇరవై తొమ్మిది',
  'ముప్పై', 'ముప్పై ఒకటి', 'ముప్పై రెండు', 'ముప్పై మూడు', 'ముప్పై నాలుగు', 'ముప్పై ఐదు', 'ముప్పై ఆరు', 'ముప్పై ఏడు', 'ముప్పై ఎనిమిది', 'ముప్పై తొమ్మిది',
  'నలభై', 'నలభై ఒకటి', 'నలభై రెండు', 'నలభై మూడు', 'నలభై నాలుగు', 'నలభై ఐదు', 'నలభై ఆరు', 'నలభై ఏడు', 'నలభై ఎనిమిది', 'నలభై తొమ్మిది',
  'యాభై', 'యాభై ఒకటి', 'యాభై రెండు', 'యాభై మూడు', 'యాభై నాలుగు', 'యాభై ఐదు', 'యాభై ఆరు', 'యాభై ఏడు', 'యాభై ఎనిమిది', 'యాభై తొమ్మిది',
  'అరవై', 'అరవై ఒకటి', 'అరవై రెండు', 'అరవై మూడు', 'అరవై నాలుగు', 'అరవై ఐదు', 'అరవై ఆరు', 'అరవై ఏడు', 'అరవై ఎనిమిది', 'అరవై తొమ్మిది',
  'డెబ్బై', 'డెబ్బై ఒకటి', 'డెబ్బై రెండు', 'డెబ్బై మూడు', 'డెబ్బై నాలుగు', 'డెబ్బై ఐదు', 'డెబ్బై ఆరు', 'డెబ్బై ఏడు', 'డెబ్బై ఎనిమిది', 'డెబ్బై తొమ్మిది',
  'ఎనభై', 'ఎనభై ఒకటి', 'ఎనభై రెండు', 'ఎనభై మూడు', 'ఎనభై నాలుగు', 'ఎనభై ఐదు', 'ఎనభై ఆరు', 'ఎనభై ఏడు', 'ఎనభై ఎనిమిది', 'ఎనభై తొమ్మిది',
  'తొంభై', 'తొంభై ఒకటి', 'తొంభై రెండు', 'తొంభై మూడు', 'తొంభై నాలుగు', 'తొంభై ఐదు', 'తొంభై ఆరు', 'తొంభై ఏడు', 'తొంభై ఎనిమిది', 'తొంభై తొమ్మిది'
]

const HUNDREDS = ['', 'వంద', 'రెండు వందలు', 'మూడు వందలు', 'నాలుగు వందలు', 'ఐదు వందలు', 'ఆరు వందలు', 'ఏడు వందలు', 'ఎనిమిది వందలు', 'తొమ్మిది వందలు']

// Ones for decimal reading
const ONES = ['ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది']

// Scale words: index 0 = units, 1 = thousand, 2 = lakh, etc.
const SCALE_WORDS = ['', 'వెయ్యి', 'లక్ష', 'కోటి', 'అరబ్', 'ఖరబ్', 'నిల్', 'పడ్మ', 'శంకు']

// ============================================================================
// Conversion Functions
// ============================================================================

function convertBelowHundred (n) {
  return BELOW_HUNDRED[n]
}

function convertBelowThousand (n) {
  if (n === 0) return ''
  if (n < 100) return convertBelowHundred(n)

  const hundreds = Math.trunc(n / 100)
  const remainder = n % 100
  const parts = [HUNDREDS[hundreds]]

  if (remainder > 0) {
    parts.push(convertBelowHundred(remainder))
  }

  return parts.join(' ').trim()
}

function integerToWords (n) {
  if (n === 0n) return ZERO

  const groups = groupByThreeThenTwos(n)
  const groupCount = groups.length
  const words = []

  for (let i = 0; i < groupCount; i++) {
    const groupValue = groups[i]
    if (groupValue === 0) continue

    const scaleIndex = groupCount - i - 1
    const groupWords = (groupValue === 1 && scaleIndex > 0) ? 'ఒక' : convertBelowThousand(groupValue)
    words.push(groupWords)
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
    digits.push(d === 0 ? ZERO : ONES[d - 1])
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

export {
  BELOW_HUNDRED,
  HUNDREDS,
  SCALE_WORDS,
  ZERO,
  convertBelowThousand,
  integerToWords,
  decimalPartToWords
}
