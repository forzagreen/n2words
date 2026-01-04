/**
 * Tamil language converter - Functional Implementation
 *
 * Self-contained converter for South Asian numbering.
 *
 * Key features:
 * - Indian numbering system (ஆயிரம், லட்சம், கோடி)
 * - Tamil script
 * - 3-2-2 grouping pattern
 * - Complete word forms for 0-99
 * - Special hundred word transformations
 * - Per-digit decimal reading
 */

import { parseNumericValue } from '../utils/parse-numeric.js'

// ============================================================================
// Vocabulary
// ============================================================================

const ZERO = 'பூஜ்ஜியம்'
const NEGATIVE = 'மைனஸ்'
const DECIMAL_SEP = 'புள்ளி'

const BELOW_HUNDRED = [
  'பூஜ்ஜியம்', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
  'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதிமூன்று', 'பதினான்கு', 'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது',
  'இருபது', 'இருபத்தொன்று', 'இருபத்திரண்டு', 'இருபத்திமூன்று', 'இருபத்திநான்கு', 'இருபத்தைந்து', 'இருபத்தாறு', 'இருபத்தேழு', 'இருபத்தெட்டு', 'இருபத்தொன்பது',
  'முப்பது', 'முப்பத்தொன்று', 'முப்பத்திரண்டு', 'முப்பத்திமூன்று', 'முப்பத்திநான்கு', 'முப்பத்தைந்து', 'முப்பத்தாறு', 'முப்பத்தேழு', 'முப்பத்தெட்டு', 'முப்பத்தொன்பது',
  'நாற்பது', 'நாற்பத்தொன்று', 'நாற்பத்திரண்டு', 'நாற்பத்திமூன்று', 'நாற்பத்திநான்கு', 'நாற்பத்தைந்து', 'நாற்பத்தாறு', 'நாற்பத்தேழு', 'நாற்பத்தெட்டு', 'நாற்பத்தொன்பது',
  'ஐம்பது', 'ஐம்பத்தொன்று', 'ஐம்பத்திரண்டு', 'ஐம்பத்திமூன்று', 'ஐம்பத்திநான்கு', 'ஐம்பத்தைந்து', 'ஐம்பத்தாறு', 'ஐம்பத்தேழு', 'ஐம்பத்தெட்டு', 'ஐம்பத்தொன்பது',
  'அறுபது', 'அறுபத்தொன்று', 'அறுபத்திரண்டு', 'அறுபத்திமூன்று', 'அறுபத்திநான்கு', 'அறுபத்தைந்து', 'அறுபத்தாறு', 'அறுபத்தேழு', 'அறுபத்தெட்டு', 'அறுபத்தொன்பது',
  'எழுபது', 'எழுபத்தொன்று', 'எழுபத்திரண்டு', 'எழுபத்திமூன்று', 'எழுபத்திநான்கு', 'எழுபத்தைந்து', 'எழுபத்தாறு', 'எழுபத்தேழு', 'எழுபத்தெட்டு', 'எழுபத்தொன்பது',
  'எண்பது', 'எண்பத்தொன்று', 'எண்பத்திரண்டு', 'எண்பத்திமூன்று', 'எண்பத்திநான்கு', 'எண்பத்தைந்து', 'எண்பத்தாறு', 'எண்பத்தேழு', 'எண்பத்தெட்டு', 'எண்பத்தொன்பது',
  'தொண்ணூறு', 'தொண்ணூற்று ஒன்று', 'தொண்ணூற்று இரண்டு', 'தொண்ணூற்று மூன்று', 'தொண்ணூற்று நான்கு', 'தொண்ணூற்று ஐந்து', 'தொண்ணூற்று ஆறு', 'தொண்ணூற்று ஏழு', 'தொண்ணூற்று எட்டு', 'தொண்ணூற்று ஒன்பது'
]

// Standalone hundreds (when not followed by remainder)
const HUNDREDS = ['', 'நூறு', 'இருநூறு', 'முன்னூறு', 'நானூறு', 'ஐநூறு', 'அறுநூறு', 'எழுநூறு', 'எண்நூறு', 'தொள்ளாயிரம்']

// Connected form of hundreds (when followed by remainder) - precomputed
const HUNDREDS_CONNECTED = ['', 'நூற்று', 'இருநூற்று', 'முன்னூற்று', 'நானூற்று', 'ஐநூற்று', 'அறுநூற்று', 'எழுநூற்று', 'எண்நூற்று', 'தொள்ளாயிரத்து']

// Ones for decimal reading
const ONES = ['ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது']

// Scale words: index 0 = units, 1 = thousand, 2 = lakh, etc.
const SCALE_WORDS = ['', 'ஆயிரம்', 'லட்சம்', 'கோடி', 'அரபு', 'கராபு', 'நீல்', 'பத்ம', 'சங்கு']

// ============================================================================
// Segment Splitting (inlined for performance)
// ============================================================================

function groupByThreeThenTwos (n) {
  const numStr = n.toString()

  if (numStr.length <= 3) {
    return [Number(numStr)]
  }

  const segments = []
  const last3 = numStr.slice(-3)
  segments.unshift(Number(last3))

  let remaining = numStr.slice(0, -3)
  while (remaining.length > 0) {
    const segment = remaining.slice(-2)
    segments.unshift(Number(segment))
    remaining = remaining.slice(0, -2)
  }

  return segments
}

// ============================================================================
// Conversion Functions
// ============================================================================

function convertBelowThousand (n) {
  if (n === 0) return ''
  if (n < 100) return BELOW_HUNDRED[n]

  const hundreds = Math.trunc(n / 100)
  const remainder = n % 100

  if (remainder === 0) {
    return HUNDREDS[hundreds]
  }

  // Use precomputed connected form
  return HUNDREDS_CONNECTED[hundreds] + ' ' + BELOW_HUNDRED[remainder]
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
    const groupWords = (groupValue === 1 && scaleIndex > 0) ? 'ஒரு' : convertBelowThousand(groupValue)
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
