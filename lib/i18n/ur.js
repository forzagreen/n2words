import AbstractLanguage from '../classes/abstract-language.js'

class Urdu extends AbstractLanguage {
  negativeWord = 'منفی'
  decimalSeparatorWord = 'اعشاریہ'
  zeroWord = 'صفر'

  belowHundred = [
    'صفر',
    'ایک',
    'دو',
    'تین',
    'چار',
    'پانچ',
    'چھ',
    'سات',
    'آٹھ',
    'نو',
    'دس',
    'گیارہ',
    'بارہ',
    'تیرہ',
    'چودہ',
    'پندرہ',
    'سولہ',
    'سترہ',
    'اٹھارہ',
    'انیس',
    'بیس',
    'اکیس',
    'بائیس',
    'تیئیس',
    'چوبیس',
    'پچیس',
    'چھبیس',
    'ستائیس',
    'اٹھائیس',
    'انتیس',
    'تیس',
    'اکتیس',
    'بتیس',
    'تینتیس',
    'چونتیس',
    'پینتیس',
    'چھتیس',
    'سینتیس',
    'اڑتیس',
    'انتالیس',
    'چالیس',
    'اکتالیس',
    'بیالیس',
    'تینتالیس',
    'چوالیس',
    'پینتالیس',
    'چھالیس',
    'سینتالیس',
    'اڑتالیس',
    'انچاس',
    'پچاس',
    'اکاون',
    'باون',
    'ترپن',
    'چون',
    'پچپن',
    'چھپن',
    'ستاون',
    'اٹھاون',
    'انسٹھ',
    'ساٹھ',
    'اکسٹھ',
    'باسٹھ',
    'ترسٹھ',
    'چونسٹھ',
    'پینسٹھ',
    'چھیاسٹھ',
    'سڑسٹھ',
    'اڑسٹھ',
    'انہتر',
    'ستر',
    'اکہتر',
    'بہتر',
    'تہتر',
    'چوہتر',
    'پچھتر',
    'چھہتر',
    'ستتر',
    'اٹھہتر',
    'اناسی',
    'اسی',
    'اکیاسی',
    'بیاسی',
    'تریاسی',
    'چوراسی',
    'پچاسی',
    'چھیاسی',
    'ستاسی',
    'اٹھاسی',
    'نواسی',
    'نوے',
    'اکانوے',
    'بانوے',
    'ترانوے',
    'چورانوے',
    'پچانوے',
    'چھیانوے',
    'ستانوے',
    'اٹھانوے',
    'ننانوے'
  ]

  scales = [
    '',
    'ہزار',
    'لاکھ',
    'کروڑ',
    'ارب',
    'کھرب',
    'نیل',
    'پدم',
    'شنکھ'
  ]

  convertBelowHundred (number) {
    return this.belowHundred[number]
  }

  convertBelowThousand (number) {
    if (number === 0) return ''
    if (number < 100) return this.convertBelowHundred(number)

    const hundreds = Math.trunc(number / 100)
    const remainder = number % 100
    const parts = []

    if (hundreds === 1) {
      parts.push('ایک سو')
    } else {
      parts.push(this.convertBelowHundred(hundreds) + ' سو')
    }

    if (remainder > 0) {
      parts.push(this.convertBelowHundred(remainder))
    }

    return parts.join(' ')
  }

  splitIndian (number) {
    const numStr = number.toString()

    if (numStr.length <= 3) {
      return [Number(numStr)]
    }

    const groups = []
    const last3 = numStr.slice(-3)
    groups.unshift(Number(last3))

    let remaining = numStr.slice(0, -3)
    while (remaining.length > 0) {
      const group = remaining.slice(-2)
      groups.unshift(Number(group))
      remaining = remaining.slice(0, -2)
    }

    return groups
  }

  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }

    const groups = this.splitIndian(number)
    const groupCount = groups.length
    const words = []

    for (let i = 0; i < groupCount; i++) {
      const groupValue = groups[i]
      if (groupValue === 0) continue

      const scaleIndex = groupCount - i - 1
      words.push(this.convertBelowThousand(groupValue))
      if (scaleIndex > 0 && this.scales[scaleIndex]) {
        words.push(this.scales[scaleIndex])
      }
    }

    return words.join(' ').trim()
  }
}

export default function convertToWords (value, options = {}) {
  return new Urdu(options).convertToWords(value)
}
