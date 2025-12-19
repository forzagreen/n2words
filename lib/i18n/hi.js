import AbstractLanguage from '../classes/abstract-language.js'

class Hindi extends AbstractLanguage {
  negativeWord = 'माइनस'

  separatorWord = 'दशमलव'

  zeroWord = 'शून्य'

  belowHundred = [
    'शून्य',
    'एक',
    'दो',
    'तीन',
    'चार',
    'पाँच',
    'छह',
    'सात',
    'आठ',
    'नौ',
    'दस',
    'ग्यारह',
    'बारह',
    'तेरह',
    'चौदह',
    'पंद्रह',
    'सोलह',
    'सत्रह',
    'अठारह',
    'उन्नीस',
    'बीस',
    'इक्कीस',
    'बाईस',
    'तेईस',
    'चौबीस',
    'पच्चीस',
    'छब्बीस',
    'सत्ताईस',
    'अट्ठाईस',
    'उनतीस',
    'तीस',
    'इकतीस',
    'बत्तीस',
    'तैंतीस',
    'चौंतीस',
    'पैंतीस',
    'छत्तीस',
    'सैंतीस',
    'अड़तीस',
    'उनतालीस',
    'चालीस',
    'इकतालीस',
    'बयालीस',
    'तेतालीस',
    'चवालीस',
    'पैंतालीस',
    'छियालीस',
    'सैंतालीस',
    'अड़तालीस',
    'उनचास',
    'पचास',
    'इक्यावन',
    'बावन',
    'तिरपन',
    'चौवन',
    'पचपन',
    'छप्पन',
    'सत्तावन',
    'अट्ठावन',
    'उनसठ',
    'साठ',
    'इकसठ',
    'बासठ',
    'तिरसठ',
    'चौंसठ',
    'पैंसठ',
    'छियासठ',
    'सड़सठ',
    'अड़सठ',
    'उनहत्तर',
    'सत्तर',
    'इकहत्तर',
    'बहत्तर',
    'तिहत्तर',
    'चौहत्तर',
    'पचहत्तर',
    'छिहत्तर',
    'सतहत्तर',
    'अठहत्तर',
    'उन्यासी',
    'अस्सी',
    'इक्यासी',
    'बयासी',
    'तिरासी',
    'चौरासी',
    'पचासी',
    'छियासी',
    'सत्तासी',
    'अट्ठासी',
    'नवासी',
    'नब्बे',
    'इक्यानवे',
    'बानवे',
    'तिरानवे',
    'चौरानवे',
    'पचानवे',
    'छियानवे',
    'सत्तानवे',
    'अट्ठानवे',
    'निन्यानवे'
  ]

  scales = [
    '',
    'हज़ार',
    'लाख',
    'करोड़',
    'अरब',
    'खरब',
    'नील',
    'पद्म',
    'शंख'
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
      parts.push('एक सौ')
    } else {
      parts.push(this.convertBelowHundred(hundreds) + ' सौ')
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

  toCardinalWords (number) {
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

export default function floatToCardinal (value, options = {}) {
  return new Hindi(options).floatToCardinal(value)
}
