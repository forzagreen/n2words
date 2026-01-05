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

import { parseNumericValue } from '../utils/parse-numeric.js'

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

// ============================================================================
// Conversion Functions
// ============================================================================

function segmentToWords (groupNumber, groupLevel, fullNumber, ones) {
  const tensValue = groupNumber % 100
  const hundredsDigit = Math.trunc(groupNumber / 100)
  let returnValue = ''

  // Process hundreds
  if (hundredsDigit > 0) {
    if (tensValue === 0 && hundredsDigit === 2) {
      returnValue = DUAL[0]
    } else {
      const hundredsWord = HUNDREDS[hundredsDigit]
      if (hundredsWord) {
        returnValue = hundredsWord
        if (tensValue !== 0) {
          returnValue += ' و'
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
          returnValue = groupNumber === 2 ? DUAL[groupLevel] : DUAL_APPENDED[groupLevel]
        } else {
          returnValue = DUAL[groupLevel]
        }
      } else if (tensValue === 1 && groupLevel > 0) {
        returnValue += SCALE_WORDS[groupLevel]
      } else {
        returnValue += ones[tensValue - 1]
      }
    } else {
      const onesDigit = tensValue % 10
      const tensIndex = Math.trunc(tensValue / 10) - 2

      if (onesDigit > 0) {
        returnValue += ones[onesDigit - 1]
        returnValue += ' و'
      }
      returnValue += TENS[tensIndex]
    }
  }

  return returnValue
}

function integerToWords (n, options = {}) {
  if (n === 0n) return ZERO

  const gender = options.gender || 'masculine'
  const ones = gender === 'feminine' ? ONES_FEM : ONES_MASC

  let temp = n
  let group = 0
  let result = ''

  while (temp > 0n) {
    const numberToProcess = Number(temp % 1000n)
    temp = temp / 1000n

    if (numberToProcess > 0) {
      const groupDescription = segmentToWords(numberToProcess, group, n, ones)

      if (groupDescription) {
        if (group > 0) {
          if (result) {
            result = ' و' + result
          }

          if (numberToProcess > 2) {
            const remainder = numberToProcess % 100
            if (remainder === 1) {
              result = SCALE_WORDS[group] + ' ' + result
            } else if (numberToProcess >= 3 && numberToProcess <= 10) {
              result = SCALE_PLURAL[group] + ' ' + result
            } else {
              result = (result ? SCALE_APPENDED[group] : SCALE_WORDS[group]) + ' ' + result
            }
          }
        }

        result = groupDescription + ' ' + result
      }
    }

    group++
  }

  return result.replace(/\s+/g, ' ').trim()
}

function decimalPartToWords (decimalPart, options) {
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
    result += integerToWords(BigInt(remainder), options)
  }

  return result
}

function toWords (value, options = {}) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  let result = ''

  if (isNegative) {
    const negativeWord = options.negativeWord || NEGATIVE
    result = negativeWord + ' '
  }

  result += integerToWords(integerPart, options)

  if (decimalPart) {
    result += ' ' + DECIMAL_SEP + ' ' + decimalPartToWords(decimalPart, options)
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toWords }
