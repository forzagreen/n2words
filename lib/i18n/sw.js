import AbstractLanguage from '../classes/abstract-language.js'

class Swahili extends AbstractLanguage {
  negativeWord = 'minus'

  decimalSeparatorWord = 'nukta'

  zeroWord = 'sifuri'

  digits = {
    0: 'sifuri',
    1: 'moja',
    2: 'mbili',
    3: 'tatu',
    4: 'nne',
    5: 'tano',
    6: 'sita',
    7: 'saba',
    8: 'nane',
    9: 'tisa'
  }

  tens = {
    10: 'kumi',
    20: 'ishirini',
    30: 'thelathini',
    40: 'arobaini',
    50: 'hamsini',
    60: 'sitini',
    70: 'sabini',
    80: 'themanini',
    90: 'tisini'
  }

  scales = [
    '',
    'elfu',
    'milioni',
    'bilioni',
    'trilioni'
  ]

  wordsUnder100 (n) {
    if (n < 10) return this.digits[n]
    if (n === 10) return this.tens[10]
    if (n < 20) {
      // 11-19: 'kumi na <digit>'
      return this.tens[10] + ' na ' + this.digits[n - 10]
    }
    const tens = Math.trunc(n / 10) * 10
    const ones = n % 10
    if (ones === 0) return this.tens[tens]
    return this.tens[tens] + ' na ' + this.digits[ones]
  }

  wordsUnder1000 (n) {
    if (n < 100) return this.wordsUnder100(n)
    if (n === 100) return 'mia moja'
    const hundreds = Math.trunc(n / 100)
    const rest = n % 100
    const parts = []

    // Hundreds: 'mia <digit>'
    parts.push('mia ' + this.digits[hundreds])
    if (rest > 0) {
      if (rest < 10) {
        parts.push('na ' + this.digits[rest])
      } else {
        parts.push(this.wordsUnder100(rest))
      }
    }

    return parts.join(' ')
  }

  splitBy3 (number) {
    const s = number.toString()
    if (s.length <= 3) return [Number(s)]
    const groups = []
    const last3 = s.slice(-3)
    groups.unshift(Number(last3))
    let remaining = s.slice(0, -3)
    while (remaining.length > 0) {
      const group = remaining.slice(-3)
      groups.unshift(Number(group))
      remaining = remaining.slice(0, -3)
    }
    return groups
  }

  convertWholePart (number) {
    if (number === 0n) return this.zeroWord

    const groups = this.splitBy3(number)
    const parts = []

    for (let i = 0; i < groups.length; i++) {
      const val = groups[i]
      if (val === 0) continue
      const scaleIndex = groups.length - i - 1
      // scale word
      if (scaleIndex === 0) {
        if (val < 10 && parts.length > 0) {
          parts.push('na ' + this.digits[val])
        } else if (val === 100 && parts.length > 0) {
          // In compound numbers (e.g., 1100 -> 'elfu moja mia'), use 'mia' not 'mia moja'
          parts.push('mia')
        } else {
          parts.push(this.wordsUnder1000(val))
        }
      } else {
        // e.g., 'elfu moja', 'milioni mbili'
        const unit = (val === 1) ? 'moja' : this.wordsUnder1000(val)
        parts.push(this.scales[scaleIndex] + ' ' + unit)
      }
    }

    return parts.join(' ').trim()
  }
}

export default function convertToWords (value, options = {}) {
  return new Swahili(options).convertToWords(value)
}



