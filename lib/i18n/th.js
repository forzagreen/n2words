import AbstractLanguage from '../classes/abstract-language.js'

const DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']

function convertBelowMillion (number) {
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
    parts.push(DIGITS[hundredThousands] + 'แสน')
  }

  if (tenThousands > 0) {
    if (tenThousands === 1) {
      parts.push('หนึ่งหมื่น')
    } else {
      parts.push(DIGITS[tenThousands] + 'หมื่น')
    }
  }

  if (thousands > 0) {
    parts.push(DIGITS[thousands] + 'พัน')
  }

  if (hundreds > 0) {
    parts.push(DIGITS[hundreds] + 'ร้อย')
  }

  if (tens > 0) {
    if (tens === 1) {
      parts.push('สิบ')
    } else if (tens === 2) {
      parts.push('ยี่สิบ')
    } else {
      parts.push(DIGITS[tens] + 'สิบ')
    }
  }

  if (ones > 0) {
    const hasHigher = hundredThousands > 0 || tenThousands > 0 || thousands > 0 || hundreds > 0 || tens > 0
    if (ones === 1 && (tens > 0 || hasHigher)) {
      parts.push('เอ็ด')
    } else {
      parts.push(DIGITS[ones])
    }
  }

  return parts.join('')
}

class Thai extends AbstractLanguage {
  constructor (options) {
    options = Object.assign({
      negativeWord: 'ลบ',
      separatorWord: 'จุด',
      zero: 'ศูนย์',
      spaceSeparator: ''
    }, options)

    super(options)
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

  decimalToCardinal (decimalString) {
    const words = []
    for (const digit of decimalString) {
      const idx = digit.charCodeAt(0) - 48
      words.push(DIGITS[idx] ?? this.zero)
    }
    return words
  }

  toCardinal (number) {
    if (number === 0n) {
      return this.zero
    }

    const groups = this.splitMillionGroups(number)
    const parts = []

    for (let i = 0; i < groups.length; i++) {
      const groupValue = groups[i]
      if (groupValue === 0) continue

      parts.push(convertBelowMillion(groupValue))
      const remaining = groups.length - i - 1
      if (remaining > 0) {
        parts.push('ล้าน'.repeat(remaining))
      }
    }

    return parts.join('')
  }
}

export default function floatToCardinal (value, options = {}) {
  return new Thai(options).floatToCardinal(value)
}
