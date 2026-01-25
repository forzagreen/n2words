/**
 * Ghanaian English language converter
 *
 * CLDR: en-GH | English as used in Ghana
 *
 * Exports:
 * - toCardinal(value)            - Cardinal numbers: 42 → "forty-two"
 * - toOrdinal(value)             - Ordinal numbers: 42 → "forty-second"
 * - toCurrency(value, options?)  - Currency: 42.50 → "forty-two cedis and fifty pesewas"
 *
 * Ghanaian English conventions:
 * - Follows British English style
 * - "and" after hundreds: "one hundred and twenty-three"
 * - "and" before final segment: "one million and one"
 * - Hyphenated tens-ones: "twenty-one", "forty-two"
 * - Western numbering system (short scale: billion = 10^9)
 * - Currency: Ghanaian Cedi (GHS) - cedi/cedis, pesewa/pesewas
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary (module-level constants)
// ============================================================================

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

const SCALES = [
  'thousand', 'million', 'billion', 'trillion', 'quadrillion',
  'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion',
  'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
  'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion',
  'vigintillion'
]

const HUNDRED = 'hundred'
const ZERO = 'zero'
const NEGATIVE = 'minus'
const DECIMAL_SEP = 'point'

// Ordinal vocabulary
const ORDINAL_ONES = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
const ORDINAL_TEENS = ['tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth']
const ORDINAL_TENS = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth']

// Currency vocabulary (Ghanaian Cedi)
const CEDI = 'cedi'
const CEDIS = 'cedis'
const PESEWA = 'pesewa'
const PESEWAS = 'pesewas'

// ============================================================================
// Segment Building
// ============================================================================

const segmentResult = { word: '', hasHundred: false }

function buildSegment (n) {
  if (n === 0) {
    segmentResult.word = ''
    segmentResult.hasHundred = false
    return segmentResult
  }

  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  let tensOnes = ''
  if (tens === 1) {
    tensOnes = TEENS[ones]
  } else if (tens >= 2) {
    tensOnes = ones > 0 ? TENS[tens] + '-' + ONES[ones] : TENS[tens]
  } else if (ones > 0) {
    tensOnes = ONES[ones]
  }

  if (hundreds > 0) {
    if (tensOnes) {
      segmentResult.word = ONES[hundreds] + ' ' + HUNDRED + ' and ' + tensOnes
    } else {
      segmentResult.word = ONES[hundreds] + ' ' + HUNDRED
    }
    segmentResult.hasHundred = true
  } else {
    segmentResult.word = tensOnes
    segmentResult.hasHundred = false
  }

  return segmentResult
}

// ============================================================================
// Conversion Functions
// ============================================================================

function integerToWords (n) {
  if (n === 0n) return ZERO

  if (n < 1000n) {
    return buildSegment(Number(n)).word
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    const { word: thousandsWord } = buildSegment(thousands)
    let result = thousandsWord + ' ' + SCALES[0]

    if (remainder > 0) {
      const { word: remainderWord, hasHundred } = buildSegment(remainder)
      result += hasHundred ? ' ' + remainderWord : ' and ' + remainderWord
    }

    return result
  }

  return buildLargeNumberWords(n)
}

function buildLargeNumberWords (n) {
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  let firstNonZeroIdx = -1
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      firstNonZeroIdx = i
      break
    }
  }

  let result = ''
  let prevWasScale = false

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const { word, hasHundred } = buildSegment(segment)
    const isLastSegment = (i === firstNonZeroIdx)

    if (result && isLastSegment && prevWasScale && !hasHundred) {
      result += ' and'
    }

    if (result) result += ' '
    result += word

    if (i > 0) {
      result += ' ' + SCALES[i - 1]
      prevWasScale = true
    } else {
      prevWasScale = false
    }
  }

  return result
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
 * Converts a numeric value to Ghanaian English words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in English words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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
// ORDINAL
// ============================================================================

function buildOrdinalSegment (n) {
  const ones = n % 10
  const tens = Math.trunc(n / 10) % 10
  const hundreds = Math.trunc(n / 100)

  let tensOnesOrdinal = ''
  if (tens === 1) {
    tensOnesOrdinal = ORDINAL_TEENS[ones]
  } else if (tens >= 2) {
    if (ones > 0) {
      tensOnesOrdinal = TENS[tens] + '-' + ORDINAL_ONES[ones]
    } else {
      tensOnesOrdinal = ORDINAL_TENS[tens]
    }
  } else if (ones > 0) {
    tensOnesOrdinal = ORDINAL_ONES[ones]
  }

  if (hundreds > 0) {
    if (tensOnesOrdinal) {
      return ONES[hundreds] + ' ' + HUNDRED + ' ' + tensOnesOrdinal
    } else {
      return ONES[hundreds] + ' hundredth'
    }
  }

  return tensOnesOrdinal
}

function integerToOrdinal (n) {
  if (n < 1000n) {
    return buildOrdinalSegment(Number(n))
  }

  if (n < 1_000_000n) {
    const thousands = Number(n / 1000n)
    const remainder = Number(n % 1000n)

    if (remainder === 0) {
      return buildSegment(thousands).word + ' ' + SCALES[0] + 'th'
    }

    const { word: thousandsWord } = buildSegment(thousands)
    return thousandsWord + ' ' + SCALES[0] + ' ' + buildOrdinalSegment(remainder)
  }

  return buildLargeOrdinal(n)
}

function buildLargeOrdinal (n) {
  const segments = []
  let temp = n
  while (temp > 0n) {
    segments.push(Number(temp % 1000n))
    temp = temp / 1000n
  }

  let lowestNonZeroIdx = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== 0) {
      lowestNonZeroIdx = i
      break
    }
  }

  let result = ''

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (segment === 0) continue

    const isLowestSegment = (i === lowestNonZeroIdx)

    if (result) result += ' '

    if (isLowestSegment) {
      if (i === 0) {
        result += buildOrdinalSegment(segment)
      } else {
        result += buildSegment(segment).word + ' ' + SCALES[i - 1] + 'th'
      }
    } else {
      result += buildSegment(segment).word
      if (i > 0) {
        result += ' ' + SCALES[i - 1]
      }
    }
  }

  return result
}

function toOrdinal (value) {
  const integerPart = parseOrdinalValue(value)
  return integerToOrdinal(integerPart)
}

// ============================================================================
// CURRENCY
// ============================================================================

function toCurrency (value, options) {
  options = validateOptions(options)
  const { isNegative, dollars: cedis, cents: pesewas } = parseCurrencyValue(value)
  const { and: useAnd = true } = options

  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  if (cedis > 0n || pesewas === 0n) {
    result += integerToWords(cedis)
    result += ' ' + (cedis === 1n ? CEDI : CEDIS)
  }

  if (pesewas > 0n) {
    if (cedis > 0n) {
      result += useAnd ? ' and ' : ' '
    }
    result += integerToWords(pesewas)
    result += ' ' + (pesewas === 1n ? PESEWA : PESEWAS)
  }

  return result
}

export { toCardinal, toOrdinal, toCurrency }
