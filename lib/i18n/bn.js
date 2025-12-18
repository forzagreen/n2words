import AbstractLanguage from '../classes/abstract-language.js'

class Bengali extends AbstractLanguage {
  negativeWord = 'মাইনাস'

  separatorWord = 'দশমিক'

  zero = 'শূন্য'

  belowHundred = [
    'শূন্য',
    'এক',
    'দুই',
    'তিন',
    'চার',
    'পাঁচ',
    'ছয়',
    'সাত',
    'আট',
    'নয়',
    'দশ',
    'এগারো',
    'বারো',
    'তেরো',
    'চৌদ্দ',
    'পনেরো',
    'ষোল',
    'সতেরো',
    'আঠারো',
    'উনিশ',
    'বিশ',
    'একুশ',
    'বাইশ',
    'তেইশ',
    'চব্বিশ',
    'পঁচিশ',
    'ছাব্বিশ',
    'সাতাশ',
    'আঠাশ',
    'উনত্রিশ',
    'ত্রিশ',
    'একত্রিশ',
    'বত্রিশ',
    'তেত্রিশ',
    'চৌত্রিশ',
    'পঁয়ত্রিশ',
    'ছত্রিশ',
    'সাঁইত্রিশ',
    'আটত্রিশ',
    'উনচল্লিশ',
    'চল্লিশ',
    'একচল্লিশ',
    'বেয়াল্লিশ',
    'তেতাল্লিশ',
    'চুয়াল্লিশ',
    'পঁয়তাল্লিশ',
    'ছেচল্লিশ',
    'সাতচল্লিশ',
    'আটচল্লিশ',
    'উনপঞ্চাশ',
    'পঞ্চাশ',
    'একান্ন',
    'বাহান্ন',
    'তিপ্পান্ন',
    'চুয়ান্ন',
    'পঞ্চান্ন',
    'ছাপ্পান্ন',
    'সাতান্ন',
    'আটান্ন',
    'উনষাট',
    'ষাট',
    'একষট্টি',
    'বাষট্টি',
    'তেষট্টি',
    'চৌষট্টি',
    'পঁয়ষট্টি',
    'ছেষট্টি',
    'সাতষট্টি',
    'আটষট্টি',
    'ঊনসত্তর',
    'সত্তর',
    'একাত্তর',
    'বাহাত্তর',
    'তেহাত্তর',
    'চুয়াত্তর',
    'পঁচাত্তর',
    'ছিয়াত্তর',
    'সাতাত্তর',
    'আটাত্তর',
    'উনআশি',
    'আশি',
    'একাশি',
    'বিরাশি',
    'তিরাশি',
    'চুরাশি',
    'পঁচাশি',
    'ছিয়াশি',
    'সাতাশি',
    'আটাশি',
    'উননব্বই',
    'নব্বই',
    'একানব্বই',
    'বিরানব্বই',
    'তিরানব্বই',
    'চুরানব্বই',
    'পঁচানব্বই',
    'ছিয়ানব্বই',
    'সাতানব্বই',
    'আটানব্বই',
    'নিরানব্বই'
  ]

  scales = [
    '',
    'হাজার',
    'লাখ',
    'কোটি',
    'আরব',
    'খরব',
    'নীল',
    'পদ্ম',
    'শঙ্খ'
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
      parts.push('এক শত')
    } else {
      parts.push(this.convertBelowHundred(hundreds) + ' শত')
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

  toCardinal (number) {
    if (number === 0n) {
      return this.zero
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

export default function floatToCardinal (value, options = {}) {
  return new Bengali(options).floatToCardinal(value)
}
