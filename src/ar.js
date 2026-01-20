/**
 * Arabic language converter - Functional Implementation
 *
 * Self-contained converter with gender agreement and complex pluralization.
 *
 * Key features:
 * - Gender agreement (masculine/feminine forms)
 * - Complex pluralization (singular/dual/plural)
 * - Traditional Arabic number naming conventions
 * - "و" (and) conjunction between segments
 */

import { parseNumericValue } from './utils/parse-numeric.js'
import { validateOptions } from './utils/validate-options.js'

// ============================================================================
// Vocabulary
// ============================================================================

const TENS = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
const HUNDREDS = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة']

// Magnitude words with three forms: singular, appended (tanween), plural
const SCALE_WORDS = ['مائة', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون']
const SCALE_APPENDED = ['', 'ألفاً', 'مليوناً', 'ملياراً', 'تريليوناً', 'كوادريليوناً', 'كوينتليوناً', 'سكستيليوناً']
const SCALE_PLURAL = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات']

// Dual forms
const DUAL = ['مئتان', 'ألفان', 'مليونان', 'ملياران', 'تريليونان', 'كوادريليونان', 'كوينتليونان', 'سكستيليونان']
const DUAL_APPENDED = ['مئتا', 'ألفا', 'مليونا', 'مليارا', 'تريليونا', 'كوادريليونا', 'كوينتليونا', 'سكستيليونا']

// Gender-specific forms (1-19)
const ONES_MASC = ['واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر']
const ONES_FEM = ['واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع', 'عشر', 'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة', 'خمس عشرة', 'ست عشرة', 'سبع عشرة', 'ثماني عشرة', 'تسع عشرة']

const ZERO = 'صفر'
const NEGATIVE = 'ناقص'
const DECIMAL_SEP = 'فاصلة'
const AND = 'و'

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert a 3-digit group to words.
 * Returns a clean string with no leading/trailing spaces.
 * Arabic "و" (and) is attached to following word: "مائة وخمسة" not "مائة و خمسة"
 */
function segmentToWords (groupNumber, groupLevel, fullNumber, ones) {
  const tensValue = groupNumber % 100
  const hundredsDigit = Math.trunc(groupNumber / 100)
  let result = ''

  // Process hundreds
  if (hundredsDigit > 0) {
    if (tensValue === 0 && hundredsDigit === 2) {
      result = DUAL[0]
    } else {
      const hundredsWord = HUNDREDS[hundredsDigit]
      if (hundredsWord) {
        result = hundredsWord
        if (tensValue !== 0) {
          result += ' ' + AND // "مائة و" - و attaches to next word
        }
      }
    }
  }

  // Process tens and ones
  if (tensValue > 0) {
    if (tensValue < 20) {
      if (tensValue === 2 && hundredsDigit === 0 && groupLevel > 0) {
        const numValue = Number(fullNumber)
        const pow = Math.trunc(Math.log10(numValue))
        if (pow % 3 === 0 && fullNumber === BigInt(2 * Math.pow(10, pow))) {
          result += (groupNumber === 2 ? DUAL[groupLevel] : DUAL_APPENDED[groupLevel])
        } else {
          result += DUAL[groupLevel]
        }
      } else if (tensValue === 1 && groupLevel > 0) {
        result += SCALE_WORDS[groupLevel]
      } else {
        result += ones[tensValue - 1]
      }
    } else {
      const onesDigit = tensValue % 10
      const tensIndex = Math.trunc(tensValue / 10) - 2

      if (onesDigit > 0) {
        result += ones[onesDigit - 1] + ' ' + AND // "ستة و" attaches to tens
      }
      result += TENS[tensIndex]
    }
  }

  return result
}

function integerToWords (n, gender) {
  if (n === 0n) return ZERO

  const ones = gender === 'feminine' ? ONES_FEM : ONES_MASC

  let temp = n
  let group = 0
  const groups = []

  while (temp > 0n) {
    const numberToProcess = Number(temp % 1000n)
    temp = temp / 1000n

    if (numberToProcess > 0) {
      const groupDescription = segmentToWords(numberToProcess, group, n, ones)

      if (groupDescription) {
        let groupText = groupDescription

        // Add scale word for groups > 0
        if (group > 0 && numberToProcess > 2) {
          const remainder = numberToProcess % 100
          if (remainder === 1) {
            groupText += ' ' + SCALE_WORDS[group]
          } else if (numberToProcess >= 3 && numberToProcess <= 10) {
            groupText += ' ' + SCALE_PLURAL[group]
          } else {
            groupText += ' ' + (groups.length > 0 ? SCALE_APPENDED[group] : SCALE_WORDS[group])
          }
        }

        groups.unshift(groupText)
      }
    }

    group++
  }

  // Join groups with و (and) - space before و, attaches to next word
  // Use simple join since segmentToWords returns clean strings
  if (groups.length === 1) return groups[0]

  // Build result: "group1 وgroup2 وgroup3"
  let result = groups[0]
  for (let i = 1; i < groups.length; i++) {
    result += ' ' + AND + groups[i]
  }
  return result
}

function decimalPartToWords (decimalPart, gender) {
  const parts = []
  let i = 0

  while (i < decimalPart.length && decimalPart[i] === '0') {
    parts.push(ZERO)
    i++
  }

  const remainder = decimalPart.slice(i)
  if (remainder) {
    parts.push(integerToWords(BigInt(remainder), gender))
  }

  return parts.join(' ')
}

/**
 * Converts a numeric value to Arabic words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @param {string} [options.negativeWord] - Custom word for negative numbers
 * @returns {string} The number in Arabic words
 *
 * @example
 * toCardinal(1)                        // 'واحد'
 * toCardinal(1, {gender: 'feminine'})  // 'واحدة'
 */
function toCardinal (value, options) {
  options = validateOptions(options)
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // Apply option defaults
  const {
    gender = 'masculine',
    negativeWord = NEGATIVE
  } = options

  const parts = []

  if (isNegative) {
    parts.push(negativeWord)
  }

  parts.push(integerToWords(integerPart, gender))

  if (decimalPart) {
    parts.push(DECIMAL_SEP)
    parts.push(decimalPartToWords(decimalPart, gender))
  }

  return parts.join(' ')
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal }
