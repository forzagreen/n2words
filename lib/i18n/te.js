import AbstractLanguage from '../classes/abstract-language.js'

class Telugu extends AbstractLanguage {
  belowHundred = [
    'సున్నా',
    'ఒకటి',
    'రెండు',
    'మూడు',
    'నాలుగు',
    'ఐదు',
    'ఆరు',
    'ఏడు',
    'ఎనిమిది',
    'తొమ్మిది',
    'పది',
    'పదకొండు',
    'పన్నెండు',
    'పదమూడు',
    'పద్నాలుగు',
    'పదిహేను',
    'పదహారు',
    'పదిహేడు',
    'పద్దెనిమిది',
    'పంతొమ్మిది',
    'ఇరవై',
    'ఇరవై ఒక్కటి',
    'ఇరవై రెండు',
    'ఇరవై మూడు',
    'ఇరవై నాలుగు',
    'ఇరవై ఐదు',
    'ఇరవై ఆరు',
    'ఇరవై ఏడు',
    'ఇరవై ఎనిమిది',
    'ఇరవై తొమ్మిది',
    'ముప్పై',
    'ముప్పై ఒకటి',
    'ముప్పై రెండు',
    'ముప్పై మూడు',
    'ముప్పై నాలుగు',
    'ముప్పై ఐదు',
    'ముప్పై ఆరు',
    'ముప్పై ఏడు',
    'ముప్పై ఎనిమిది',
    'ముప్పై తొమ్మిది',
    'నలభై',
    'నలభై ఒకటి',
    'నలభై రెండు',
    'నలభై మూడు',
    'నలభై నాలుగు',
    'నలభై ఐదు',
    'నలభై ఆరు',
    'నలభై ఏడు',
    'నలభై ఎనిమిది',
    'నలభై తొమ్మిది',
    'యాభై',
    'యాభై ఒకటి',
    'యాభై రెండు',
    'యాభై మూడు',
    'యాభై నాలుగు',
    'యాభై ఐదు',
    'యాభై ఆరు',
    'యాభై ఏడు',
    'యాభై ఎనిమిది',
    'యాభై తొమ్మిది',
    'అరవై',
    'అరవై ఒకటి',
    'అరవై రెండు',
    'అరవై మూడు',
    'అరవై నాలుగు',
    'అరవై ఐదు',
    'అరవై ఆరు',
    'అరవై ఏడు',
    'అరవై ఎనిమిది',
    'అరవై తొమ్మిది',
    'డెబ్బై',
    'డెబ్బై ఒకటి',
    'డెబ్బై రెండు',
    'డెబ్బై మూడు',
    'డెబ్బై నాలుగు',
    'డెబ్బై ఐదు',
    'డెబ్బై ఆరు',
    'డెబ్బై ఏడు',
    'డెబ్బై ఎనిమిది',
    'డెబ్బై తొమ్మిది',
    'ఎనభై',
    'ఎనభై ఒకటి',
    'ఎనభై రెండు',
    'ఎనభై మూడు',
    'ఎనభై నాలుగు',
    'ఎనభై ఐదు',
    'ఎనభై ఆరు',
    'ఎనభై ఏడు',
    'ఎనభై ఎనిమిది',
    'ఎనభై తొమ్మిది',
    'తొంభై',
    'తొంభై ఒకటి',
    'తొంభై రెండు',
    'తొంభై మూడు',
    'తొంభై నాలుగు',
    'తొంభై ఐదు',
    'తొంభై ఆరు',
    'తొంభై ఏడు',
    'తొంభై ఎనిమిది',
    'తొంభై తొమ్మిది'
  ]

  hundreds = [
    '',
    'వంద',
    'రెండు వందలు',
    'మూడు వందలు',
    'నాలుగు వందలు',
    'ఐదు వందలు',
    'ఆరు వందలు',
    'ఏడు వందలు',
    'ఎనిమిది వందలు',
    'తొమ్మిది వందలు'
  ]

  // Digits map 1–9 for decimal reading; zero comes from `zero`
  digits = [
    'ఒకటి',
    'రెండు',
    'మూడు',
    'నాలుగు',
    'ఐదు',
    'ఆరు',
    'ఏడు',
    'ఎనిమిది',
    'తొమ్మిది'
  ]

  scales = [
    '',
    'వెయ్యి',
    'లక్ష',
    'కోటి',
    'అరబ్',
    'ఖరబ్',
    'నిల్',
    'పడ్మ',
    'శంకు'
  ]

  constructor (options) {
    options = Object.assign({
      negativeWord: 'మైనస్',
      separatorWord: 'పాయింట్',
      zero: 'సున్నా',
      usePerDigitDecimals: true // Enable digit-by-digit decimal conversion
    }, options)

    super(options)
  }

  convertBelowHundred (number) {
    return this.belowHundred[number]
  }

  convertBelowThousand (number) {
    if (number === 0) return ''
    if (number < 100) return this.convertBelowHundred(number)

    const hundreds = Math.trunc(number / 100)
    const remainder = number % 100
    const parts = [this.hundreds[hundreds]]

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

  toCardinal (number) {
    if (number === 0n) return this.zero

    const groups = this.splitIndian(number)
    const groupCount = groups.length
    const words = []

    for (let i = 0; i < groupCount; i++) {
      const groupValue = groups[i]
      if (groupValue === 0) continue

      const scaleIndex = groupCount - i - 1
      const groupWords = (groupValue === 1 && scaleIndex > 0) ? 'ఒక' : this.convertBelowThousand(groupValue)
      words.push(groupWords)
      if (scaleIndex > 0 && this.scales[scaleIndex]) {
        words.push(this.scales[scaleIndex])
      }
    }

    return words.join(' ').trim()
  }
}

export default function floatToCardinal (value, options = {}) {
  return new Telugu(options).floatToCardinal(value)
}
