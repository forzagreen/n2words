import AbstractLanguage from '../classes/abstract-language.js'

/**
 * Arabic language converter.
 *
 * Converts numbers to Arabic words with full grammatical support:
 * - Gender agreement (masculine/feminine forms)
 * - Complex pluralization rules (singular, dual, plural forms)
 * - Special handling for hundreds, thousands, millions, etc.
 * - Right-to-left text orientation
 * - Traditional Arabic number naming conventions
 *
 * Key Features:
 * - Gender-aware number forms (واحد masculine vs واحدة feminine)
 * - Dual forms: اثنان/اثنتان (two masculine/feminine)
 * - Complex rule system for numbers 3-10 (requiring feminine when referring to countables)
 * - Group-based algorithm: splits number by powers of 1000 (ones, thousands, millions, billions)
 * - Tanween (nunation) for indefinite numbers
 * - Sophisticated pluralization with singular, dual, and plural forms
 *
 * Algorithm:
 * 1. Break number into groups of 3 digits (right to left)
 * 2. For each non-zero group, convert to words using gender and plural rules
 * 3. Append the appropriate magnitude word (ألف/مليون/مليار) with proper plural form
 * 4. Join all groups with spaces
 *
 * Features:
 * - Support for gender-aware number forms
 * - Proper handling of Arabic dual forms (اثنان/اثنتان)
 * - Complex group processing for large numbers
 * - Right-to-left text orientation
 * - Traditional Arabic number naming conventions
 */
export class Arabic extends AbstractLanguage {
  number

  feminine

  ones = {
    masculine: [
      'واحد',
      'اثنان',
      'ثلاثة',
      'أربعة',
      'خمسة',
      'ستة',
      'سبعة',
      'ثمانية',
      'تسعة',
      'عشرة',
      'أحد عشر',
      'اثنا عشر',
      'ثلاثة عشر',
      'أربعة عشر',
      'خمسة عشر',
      'ستة عشر',
      'سبعة عشر',
      'ثمانية عشر',
      'تسعة عشر'
    ],
    feminine: [
      'واحدة',
      'اثنتان',
      'ثلاث',
      'أربع',
      'خمس',
      'ست',
      'سبع',
      'ثمان',
      'تسع',
      'عشر',
      'إحدى عشرة',
      'اثنتا عشرة',
      'ثلاث عشرة',
      'أربع عشرة',
      'خمس عشرة',
      'ست عشرة',
      'سبع عشرة',
      'ثماني عشرة',
      'تسع عشرة'
    ]
  }

  arabicTens = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']

  arabicHundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة']

  arabicAppendedTwos = ['مئتا', 'ألفا', 'مليونا', 'مليارا', 'تريليونا', 'كوادريليونا', 'كوينتليونا', 'سكستيليونا']

  arabicTwos = ['مئتان', 'ألفان', 'مليونان', 'ملياران', 'تريليونان', 'كوادريليونان', 'كوينتليونان', 'سكستيليونان']

  arabicGroup = ['مائة', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون']

  arabicAppendedGroup = ['', 'ألفاً', 'مليوناً', 'ملياراً', 'تريليوناً', 'كوادريليوناً', 'كوينتليوناً', 'سكستيليوناً']

  arabicPluralGroups = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات']

  /**
   * Initializes the Arabic converter with language-specific options.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='ناقص'] Word for negative numbers (minus).
   * @param {string} [options.separatorWord='فاصلة'] Word separating whole and decimal parts (comma).
   * @param {string} [options.zero='صفر'] Word for the digit 0 (zero).
   * @param {boolean} [options.feminine=false] Use feminine forms for numbers.
   */
  constructor (options) {
    options = Object.assign({
      negativeWord: 'ناقص',
      separatorWord: 'فاصلة',
      zero: 'صفر',
      feminine: false
    }, options)

    super(options)

    this.feminine = options.feminine
    // Cache the gender-specific ones array to avoid repeated lookups
    this.selectedOnes = this.ones[this.feminine ? 'feminine' : 'masculine']
  }

  digitFeminineStatus (digit) {
    return this.selectedOnes[digit - 1]
  }

  /**
   * Processes the Arabic group number and returns the corresponding Arabic representation.
   * @param {number} groupNumber - The number to process. (Range: 1-999)
   * @param {number} groupLevel - Group level to process. (See example)
   * @returns {string} The Arabic representation of the group number.
   * @example 12345678 is processed in blocks of 3: '678' (group 0), '345' (group 1), '12' (group 2).
   */
  processArabicGroup (groupNumber, groupLevel) {
    const tens = groupNumber % 100
    const hundredsRaw = groupNumber / 100
    const hundreds = Math.trunc(hundredsRaw)
    let returnValue = ''

    // Process hundreds
    if (hundreds > 0) {
      if (tens === 0 && hundreds === 2) {
        returnValue = this.arabicTwos[0]
      } else {
        const hundredsWord = this.arabicHundreds[hundreds]
        if (hundredsWord) {
          returnValue = hundredsWord
          if (tens !== 0) {
            returnValue += ' و'
          }
        }
      }
    }

    // Process tens and ones
    if (tens > 0) {
      if (tens < 20) { // 1 -> 19
        if (tens === 2 && hundreds === 0 && groupLevel > 0) {
          // Cache expensive log10 calculation
          const numValue = Number(this.number)
          const pow = Math.trunc(Math.log10(numValue))
          if (pow % 3 === 0 && this.number === BigInt(2 * Math.pow(10, pow))) {
            returnValue = groupNumber === 2 ? this.arabicTwos[groupLevel] : this.arabicAppendedTwos[groupLevel]
          } else {
            returnValue = this.arabicTwos[groupLevel]
          }
        } else if (tens === 1 && groupLevel > 0) {
          returnValue += this.arabicGroup[groupLevel]
        } else {
          returnValue += this.selectedOnes[tens - 1]
        }
      } else { // 20 -> 99
        const ones = tens % 10
        const tensIndex = Math.trunc(tens / 10) - 2

        if (ones > 0) {
          returnValue += this.selectedOnes[ones - 1]
          returnValue += ' و'
        }
        returnValue += this.arabicTens[tensIndex]
      }
    }

    return returnValue
  }

  /**
   * Converts a number to its cardinal representation in Arabic.
   * It process by blocks of 3 digits.
   * @param {number} number - The number to convert.
   * @returns {string} The cardinal representation of the number in Arabic.
   */
  /**
   * Converts a number to its cardinal representation in Arabic.
   * It process by blocks of 3 digits.
   * @param {bigint} number - The number to convert.
   * @returns {string} The cardinal representation of the number in Arabic.
   */
  toCardinal (number) {
    if (number === 0n) {
      return this.zero
    }

    this.number = number
    let temp = number
    let group = 0
    let result = ''

    // Process each group of 3 digits (right to left)
    while (temp > 0n) {
      const numberToProcess = Number(temp % 1000n)
      temp = temp / 1000n

      if (numberToProcess > 0) {
        const groupDescription = this.processArabicGroup(numberToProcess, group)

        if (groupDescription) {
          // Add group name for thousands, millions, etc.
          if (group > 0) {
            if (result) {
              result = ' و' + result
            }

            if (numberToProcess > 2) {
              const remainder = numberToProcess % 100
              if (remainder === 1) {
                result = this.arabicGroup[group] + ' ' + result
              } else if (numberToProcess >= 3 && numberToProcess <= 10) {
                result = this.arabicPluralGroups[group] + ' ' + result
              } else {
                result = (result ? this.arabicAppendedGroup[group] : this.arabicGroup[group]) + ' ' + result
              }
            }
          }

          // Add group description (prepend for RTL)
          result = groupDescription + ' ' + result
        }
      }

      group++
    }

    return result.replace(/\s+/g, ' ').trim()
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new Arabic(options).floatToCardinal(value)
}
