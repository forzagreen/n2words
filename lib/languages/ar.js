import { AbstractLanguage } from '../classes/abstract-language.js'

/**
 * Arabic language converter.
 *
 * Supports:
 * - Gender agreement (masculine/feminine forms)
 * - Complex pluralization (singular/dual/plural)
 * - Traditional Arabic number naming conventions
 * - Right-to-left text orientation
 */
export class Arabic extends AbstractLanguage {
  negativeWord = 'ناقص'
  decimalSeparatorWord = 'فاصلة'
  zeroWord = 'صفر'

  tensWords = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
  hundredsWords = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة']

  // Magnitude words with three forms: singular, appended (tanween), plural
  scaleWords = ['مائة', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون']
  scaleAppendedWords = ['', 'ألفاً', 'مليوناً', 'ملياراً', 'تريليوناً', 'كوادريليوناً', 'كوينتليوناً', 'سكستيليوناً']
  scalePluralWords = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات']

  // Dual forms (Arabic has singular, dual, plural)
  dualWords = ['مئتان', 'ألفان', 'مليونان', 'ملياران', 'تريليونان', 'كوادريليونان', 'كوينتليونان', 'سكستيليونان']
  dualAppendedWords = ['مئتا', 'ألفا', 'مليونا', 'مليارا', 'تريليونا', 'كوادريليونا', 'كوينتليونا', 'سكستيليونا']

  // Gender-specific number words (1-19)
  ones = {
    masculine: [
      'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
      'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'
    ],
    feminine: [
      'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع', 'عشر',
      'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة', 'خمس عشرة', 'ست عشرة', 'سبع عشرة', 'ثماني عشرة', 'تسع عشرة'
    ]
  }

  constructor (options = {}) {
    super()

    this.setOptions({
      gender: 'masculine'
    }, options)

    // Allow custom negativeWord via options
    if (options.negativeWord !== undefined) {
      this.negativeWord = options.negativeWord
    }
  }

  /** Selects masculine or feminine number forms based on options. */
  get selectedOnes () {
    return this.ones[this.options.gender === 'feminine' ? 'feminine' : 'masculine']
  }

  /** Converts a 3-digit segment (0-999) to Arabic words with gender/plural rules. */
  segmentToWords (groupNumber, groupLevel, fullNumber) {
    const tens = groupNumber % 100
    const hundredsRaw = groupNumber / 100
    const hundreds = Math.trunc(hundredsRaw)
    let returnValue = ''

    // Process hundreds
    if (hundreds > 0) {
      if (tens === 0 && hundreds === 2) {
        returnValue = this.dualWords[0]
      } else {
        const hundredsWord = this.hundredsWords[hundreds]
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
          const numValue = Number(fullNumber)
          const pow = Math.trunc(Math.log10(numValue))
          if (pow % 3 === 0 && fullNumber === BigInt(2 * Math.pow(10, pow))) {
            returnValue = groupNumber === 2 ? this.dualWords[groupLevel] : this.dualAppendedWords[groupLevel]
          } else {
            returnValue = this.dualWords[groupLevel]
          }
        } else if (tens === 1 && groupLevel > 0) {
          returnValue += this.scaleWords[groupLevel]
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
        returnValue += this.tensWords[tensIndex]
      }
    }

    return returnValue
  }

  /** Converts whole number to Arabic words by processing 3-digit groups. */
  integerToWords (number) {
    if (number === 0n) {
      return this.zeroWord
    }
    let temp = number
    let group = 0
    let result = ''

    // Process each group of 3 digits (right to left)
    while (temp > 0n) {
      const numberToProcess = Number(temp % 1000n)
      temp = temp / 1000n

      if (numberToProcess > 0) {
        const groupDescription = this.segmentToWords(numberToProcess, group, number)

        if (groupDescription) {
          // Add group name for thousands, millions, etc.
          if (group > 0) {
            if (result) {
              result = ' و' + result
            }

            if (numberToProcess > 2) {
              const remainder = numberToProcess % 100
              if (remainder === 1) {
                result = this.scaleWords[group] + ' ' + result
              } else if (numberToProcess >= 3 && numberToProcess <= 10) {
                result = this.scalePluralWords[group] + ' ' + result
              } else {
                result = (result ? this.scaleAppendedWords[group] : this.scaleWords[group]) + ' ' + result
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
