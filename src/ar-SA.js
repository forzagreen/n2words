/**
 * Arabic (Saudi Arabia) language converter
 *
 * CLDR: ar-SA | Modern Standard Arabic as used in Saudi Arabia
 *
 * Self-contained converter with gender agreement and complex pluralization.
 *
 * Key features:
 * - Gender agreement (masculine/feminine forms)
 * - Complex pluralization (singular/dual/plural)
 * - Traditional Arabic number naming conventions
 * - "و" (and) conjunction between segments
 */

import { parseCardinalValue } from './utils/parse-cardinal.js'
import { parseCurrencyValue } from './utils/parse-currency.js'
import { parseOrdinalValue } from './utils/parse-ordinal.js'
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
// Ordinal Vocabulary
// ============================================================================

// Masculine ordinal forms (1-10)
const ORDINAL_MASC = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر']

// Feminine ordinal forms (1-10)
const ORDINAL_FEM = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة']

// ============================================================================
// Currency Vocabulary (Saudi Riyal)
// ============================================================================

// Riyal: singular, dual, plural (3-10), plural (11+)
const RIYAL_SINGULAR = 'ريال'
const RIYAL_DUAL = 'ريالان'
const RIYAL_PLURAL_3_10 = 'ريالات'
const RIYAL_PLURAL_11 = 'ريالاً'

// Halala: singular, dual, plural (3-10), plural (11+)
const HALALA_SINGULAR = 'هللة'
const HALALA_DUAL = 'هللتان'
const HALALA_PLURAL_3_10 = 'هللات'
const HALALA_PLURAL_11 = 'هللة'

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
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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
// ORDINAL: toOrdinal(value, options?)
// ============================================================================

/**
 * Gets the Arabic ordinal form for a number.
 *
 * Arabic ordinals 1-10 have special forms, beyond 10 use cardinal + position.
 *
 * @param {bigint} n - Positive integer to convert
 * @param {string} gender - 'masculine' or 'feminine'
 * @returns {string} Arabic ordinal words
 */
function integerToOrdinal (n, gender) {
  const ordinals = gender === 'feminine' ? ORDINAL_FEM : ORDINAL_MASC

  // Special ordinals for 1-10
  if (n >= 1n && n <= 10n) {
    return ordinals[Number(n) - 1]
  }

  // For 11 and above, use cardinal form with "ال" prefix for definiteness
  const cardinal = integerToWords(n, gender)
  return 'ال' + cardinal
}

/**
 * Converts a numeric value to Arabic ordinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert (positive integer)
 * @param {Object} [options] - Optional configuration
 * @param {('masculine'|'feminine')} [options.gender='masculine'] - Grammatical gender
 * @returns {string} The number as ordinal words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {RangeError} If value is negative, zero, or has a decimal part
 *
 * @example
 * toOrdinal(1)                        // 'الأول'
 * toOrdinal(1, {gender: 'feminine'})  // 'الأولى'
 * toOrdinal(3)                        // 'الثالث'
 */
function toOrdinal (value, options) {
  options = validateOptions(options)
  const integerPart = parseOrdinalValue(value)
  const { gender = 'masculine' } = options
  return integerToOrdinal(integerPart, gender)
}

// ============================================================================
// CURRENCY: toCurrency(value, options?)
// ============================================================================

/**
 * Gets the appropriate currency word form based on number.
 *
 * Arabic has complex pluralization:
 * - 1: singular
 * - 2: dual
 * - 3-10: plural form 1
 * - 11+: plural form 2 (different ending)
 */
function getRiyalForm (n) {
  if (n === 1n) return RIYAL_SINGULAR
  if (n === 2n) return RIYAL_DUAL
  if (n >= 3n && n <= 10n) return RIYAL_PLURAL_3_10
  return RIYAL_PLURAL_11
}

function getHalalaForm (n) {
  if (n === 1n) return HALALA_SINGULAR
  if (n === 2n) return HALALA_DUAL
  if (n >= 3n && n <= 10n) return HALALA_PLURAL_3_10
  return HALALA_PLURAL_11
}

/**
 * Converts a numeric value to Arabic currency words (Saudi Riyal).
 *
 * @param {number | string | bigint} value - The currency amount to convert
 * @returns {string} The amount in Arabic currency words
 * @throws {TypeError} If value is not a valid numeric type
 * @throws {Error} If value is not a valid number format
 *
 * @example
 * toCurrency(42.50)  // 'اثنان وأربعون ريالاً وخمسون هللة'
 * toCurrency(1)      // 'ريال واحد'
 * toCurrency(0.01)   // 'هللة واحدة'
 */
function toCurrency (value) {
  const { isNegative, dollars: riyals, cents: halalas } = parseCurrencyValue(value)

  // Build result
  let result = ''
  if (isNegative) result = NEGATIVE + ' '

  // Riyals part - show if non-zero, or if no halalas
  if (riyals > 0n || halalas === 0n) {
    // Special case for 1 and 2: currency word comes first
    if (riyals === 1n) {
      result += RIYAL_SINGULAR + ' ' + ONES_MASC[0]
    } else if (riyals === 2n) {
      result += RIYAL_DUAL
    } else {
      const riyalWord = integerToWords(riyals, 'masculine')
      result += riyalWord + ' ' + getRiyalForm(riyals)
    }
  }

  // Halalas part
  if (halalas > 0n) {
    if (riyals > 0n) {
      result += ' ' + AND
    }
    // Special case for 1 and 2: currency word comes first
    if (halalas === 1n) {
      result += HALALA_SINGULAR + ' ' + ONES_FEM[0]
    } else if (halalas === 2n) {
      result += HALALA_DUAL
    } else {
      const halalaWord = integerToWords(halalas, 'feminine')
      result += halalaWord + ' ' + getHalalaForm(halalas)
    }
  }

  return result
}

// ============================================================================
// Exports
// ============================================================================

export { toCardinal, toOrdinal, toCurrency }
