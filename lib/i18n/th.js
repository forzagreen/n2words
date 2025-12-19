import AbstractLanguage from '../classes/abstract-language.js'

class Thai extends AbstractLanguage {
  negativeWord = 'ลบ'

  decimalSeparatorWord = 'จุด'

  zeroWord = 'ศูนย์'

  wordSeparator = ''

  convertDecimalsPerDigit = true // Enable digit-by-digit decimal conversion

  // Digits map 1–9
  digits = ['หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']

  convertBelowMillion (number) {
    if (number === 0) return ''

    let value = number
    const parts = []

    const hundredThousands = Math.trunc(value / 100000)
    value %= 100000
    const tenThousands = Math.trunc(value / 10000)
    value %= 10000
    const thousands = Math.trunc(value / 1000)
    value %= 1000
    const hundreds = Math.trunc(value / 100)
    value %= 100
    const tens = Math.trunc(value / 10)
    const ones = value % 10

    if (hundredThousands > 0) {
      parts.push(this.digits[hundredThousands - 1] + 'แสน')
    }

    if (tenThousands > 0) {
      if (tenThousands === 1) {
        parts.push('หนึ่งหมื่น')
      } else {
        parts.push(this.digits[tenThousands - 1] + 'หมื่น')
      }
    }

    if (thousands > 0) {
      parts.push(this.digits[thousands - 1] + 'พัน')
    }

    if (hundreds > 0) {
      parts.push(this.digits[hundreds - 1] + 'ร้อย')
    }

    if (tens > 0) {
      if (tens === 1) {
        parts.push('สิบ')
      } else if (tens === 2) {
        parts.push('ยี่สิบ')
      } else {
        parts.push(this.digits[tens - 1] + 'สิบ')
      }
    }

    if (ones > 0) {
      const hasHigher = hundredThousands > 0 || tenThousands > 0 || thousands > 0 || hundreds > 0 || tens > 0
      if (ones === 1 && (tens > 0 || hasHigher)) {
        parts.push('เอ็ด')
      } else {
        parts.push(this.digits[ones - 1])
      }
    }

    return parts.join('')
  }

  splitMillionGroups (number) {
    const groups = []
    let remaining = number

    const million = 1_000_000n
    while (remaining > 0n) {
      const chunk = Number(remaining % million)
      groups.unshift(chunk)
      remaining = remaining / million
    }

    return groups
  }

  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }

    const groups = this.splitMillionGroups(number)
    const parts = []

    for (let i = 0; i < groups.length; i++) {
      const groupValue = groups[i]
      if (groupValue === 0) continue

      parts.push(this.convertBelowMillion(groupValue))
      const remaining = groups.length - i - 1
      if (remaining > 0) {
        parts.push('ล้าน'.repeat(remaining))
      }
    }

    return parts.join('')
  }
}

export default function convertToWords (value, options = {}) {
  return new Thai(options).convertToWords(value)
}


