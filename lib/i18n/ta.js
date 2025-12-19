import AbstractLanguage from '../classes/abstract-language.js'

class Tamil extends AbstractLanguage {
  negativeWord = 'மைனஸ்'

  decimalSeparatorWord = 'புள்ளி'

  zeroWord = 'பூஜ்ஜியம்'

  convertDecimalsPerDigit = true // Enable digit-by-digit decimal conversion

  // Move constants into class properties
  belowHundred = [
    'பூஜ்ஜியம்',
    'ஒன்று',
    'இரண்டு',
    'மூன்று',
    'நான்கு',
    'ஐந்து',
    'ஆறு',
    'ஏழு',
    'எட்டு',
    'ஒன்பது',
    'பத்து',
    'பதினொன்று',
    'பன்னிரண்டு',
    'பதிமூன்று',
    'பதினான்கு',
    'பதினைந்து',
    'பதினாறு',
    'பதினேழு',
    'பதினெட்டு',
    'பத்தொன்பது',
    'இருபது',
    'இருபத்தொன்று',
    'இருபத்திரண்டு',
    'இருபத்திமூன்று',
    'இருபத்திநான்கு',
    'இருபத்தைந்து',
    'இருபத்தாறு',
    'இருபத்தேழு',
    'இருபத்தெட்டு',
    'இருபத்தொன்பது',
    'முப்பது',
    'முப்பத்தொன்று',
    'முப்பத்திரண்டு',
    'முப்பத்திமூன்று',
    'முப்பத்திநான்கு',
    'முப்பத்தைந்து',
    'முப்பத்தாறு',
    'முப்பத்தேழு',
    'முப்பத்தெட்டு',
    'முப்பத்தொன்பது',
    'நாற்பது',
    'நாற்பத்தொன்று',
    'நாற்பத்திரண்டு',
    'நாற்பத்திமூன்று',
    'நாற்பத்திநான்கு',
    'நாற்பத்தைந்து',
    'நாற்பத்தாறு',
    'நாற்பத்தேழு',
    'நாற்பத்தெட்டு',
    'நாற்பத்தொன்பது',
    'ஐம்பது',
    'ஐம்பத்தொன்று',
    'ஐம்பத்திரண்டு',
    'ஐம்பத்திமூன்று',
    'ஐம்பத்திநான்கு',
    'ஐம்பத்தைந்து',
    'ஐம்பத்தாறு',
    'ஐம்பத்தேழு',
    'ஐம்பத்தெட்டு',
    'ஐம்பத்தொன்பது',
    'அறுபது',
    'அறுபத்தொன்று',
    'அறுபத்திரண்டு',
    'அறுபத்திமூன்று',
    'அறுபத்திநான்கு',
    'அறுபத்தைந்து',
    'அறுபத்தாறு',
    'அறுபத்தேழு',
    'அறுபத்தெட்டு',
    'அறுபத்தொன்பது',
    'எழுபது',
    'எழுபத்தொன்று',
    'எழுபத்திரண்டு',
    'எழுபத்திமூன்று',
    'எழுபத்திநான்கு',
    'எழுபத்தைந்து',
    'எழுபத்தாறு',
    'எழுபத்தேழு',
    'எழுபத்தெட்டு',
    'எழுபத்தொன்பது',
    'எண்பது',
    'எண்பத்தொன்று',
    'எண்பத்திரண்டு',
    'எண்பத்திமூன்று',
    'எண்பத்திநான்கு',
    'எண்பத்தைந்து',
    'எண்பத்தாறு',
    'எண்பத்தேழு',
    'எண்பத்தெட்டு',
    'எண்பத்தொன்பது',
    'தொண்ணூறு',
    'தொண்ணூற்று ஒன்று',
    'தொண்ணூற்று இரண்டு',
    'தொண்ணூற்று மூன்று',
    'தொண்ணூற்று நான்கு',
    'தொண்ணூற்று ஐந்து',
    'தொண்ணூற்று ஆறு',
    'தொண்ணூற்று ஏழு',
    'தொண்ணூற்று எட்டு',
    'தொண்ணூற்று ஒன்பது'
  ]

  hundreds = [
    '',
    'நூறு',
    'இருநூறு',
    'முன்னூறு',
    'நானூறு',
    'ஐநூறு',
    'அறுநூறு',
    'எழுநூறு',
    'எண்நூறு',
    'தொள்ளாயிரம்'
  ]

  // Digits map 1–9 for decimal reading
  digits = [
    'ஒன்று',
    'இரண்டு',
    'மூன்று',
    'நான்கு',
    'ஐந்து',
    'ஆறு',
    'ஏழு',
    'எட்டு',
    'ஒன்பது'
  ]

  scales = [
    '',
    'ஆயிரம்',
    'லட்சம்',
    'கோடி',
    'அரபு',
    'கராபு',
    'நீல்',
    'பத்ம',
    'சங்கு'
  ]

  convertBelowHundred (number) {
    return this.belowHundred[number]
  }

  convertBelowThousand (number) {
    if (number === 0) return ''
    if (number < 100) return this.convertBelowHundred(number)

    const hundreds = Math.trunc(number / 100)
    const remainder = number % 100
    let hundredPart = this.hundreds[hundreds]

    if (remainder > 0) {
      if (hundredPart.endsWith('ம்')) {
        hundredPart = hundredPart.replace(/ம்$/, 'த்து')
      } else if (hundredPart.endsWith('று')) {
        hundredPart = hundredPart.slice(0, -2) + 'ற்று'
      }
    }

    const parts = [hundredPart]
    if (remainder > 0) {
      parts.push(this.convertBelowHundred(remainder))
    }

    return parts.join(' ').trim()
  }

  splitIndian (number) {
    const numStr = number.toString()
    if (numStr.length <= 3) return [Number(numStr)]

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
    if (number === 0n) return this.zeroWord

    const groups = this.splitIndian(number)
    const groupCount = groups.length
    const words = []

    for (let i = 0; i < groupCount; i++) {
      const groupValue = groups[i]
      if (groupValue === 0) continue

      const scaleIndex = groupCount - i - 1
      const groupWords = (groupValue === 1 && scaleIndex > 0) ? 'ஒரு' : this.convertBelowThousand(groupValue)
      words.push(groupWords)
      if (scaleIndex > 0 && this.scales[scaleIndex]) {
        words.push(this.scales[scaleIndex])
      }
    }

    return words.join(' ').trim()
  }
}

export default function convertToWords (value, options = {}) {
  return new Tamil(options).convertToWords(value)
}



