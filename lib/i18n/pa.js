import AbstractLanguage from '../classes/abstract-language.js'

class Punjabi extends AbstractLanguage {
  negativeWord = 'ਮਾਇਨਸ'
  decimalSeparatorWord = 'ਦਸ਼ਮਲਵ'
  zeroWord = 'ਸਿਫ਼ਰ'

  belowHundred = [
    'ਸਿਫ਼ਰ',
    'ਇੱਕ',
    'ਦੋ',
    'ਤਿੰਨ',
    'ਚਾਰ',
    'ਪੰਜ',
    'ਛੇ',
    'ਸੱਤ',
    'ਅੱਠ',
    'ਨੌਂ',
    'ਦੱਸ',
    'ਗਿਆਰਾਂ',
    'ਬਾਰਾਂ',
    'ਤੇਰਾਂ',
    'ਚੌਦਾਂ',
    'ਪੰਦਰਾਂ',
    'ਸੋਲਾਂ',
    'ਸਤਾਰਾਂ',
    'ਅਠਾਰਾਂ',
    'ਉੱਨੀ',
    'ਵੀਹ',
    'ਇੱਕੀ',
    'ਬਾਈ',
    'ਤੇਈ',
    'ਚੌਬੀ',
    'ਪੱਚੀ',
    'ਛੱਬੀ',
    'ਸਤਾਈ',
    'ਅਠਾਈ',
    'ਉਨੱਤੀ',
    'ਤੀਹ',
    'ਇਕੱਤੀ',
    'ਬੱਤੀ',
    'ਤੇਤੀ',
    'ਚੌਂਤੀ',
    'ਪੈਂਤੀ',
    'ਛੱਤੀ',
    'ਸੈਂਤੀ',
    'ਅਠੱਤੀ',
    'ਉਨਤਾਲੀ',
    'ਚਾਲੀ',
    'ਇਕਤਾਲੀ',
    'ਬਿਆਲੀ',
    'ਤਿਰਤਾਲੀ',
    'ਚੁਵਾਲੀ',
    'ਪੰਤਾਲੀ',
    'ਛਿਆਲੀ',
    'ਸੈਂਤਾਲੀ',
    'ਅਠਤਾਲੀ',
    'ਉਨੰਜਾ',
    'ਪੰਜਾਹ',
    'ਇਕਵੰਜਾ',
    'ਬਵੰਜਾ',
    'ਤਰਵੰਜਾ',
    'ਚੁਰਵੰਜਾ',
    'ਪੰਜਵੰਜਾ',
    'ਛਪੰਜਾ',
    'ਸੱਤਵੰਜਾ',
    'ਅਠਵੰਜਾ',
    'ਉਨਾਹਠ',
    'ਸੱਠ',
    'ਇਕਾਹਠ',
    'ਬਾਹਠ',
    'ਤਰਸਠ',
    'ਚੌਂਸਠ',
    'ਪੈਂਸਠ',
    'ਛਿਆਸਠ',
    'ਸੜਸਠ',
    'ਅੜਸਠ',
    'ਉਣਹੱਤਰ',
    'ਸਤੱਰ',
    'ਇਕਹੱਤਰ',
    'ਬਹੱਤਰ',
    'ਤਹੱਤਰ',
    'ਚੌਹੱਤਰ',
    'ਪੰਝਹੱਤਰ',
    'ਛਿਹੱਤਰ',
    'ਸਤੱਤਰ',
    'ਅਠੱਤਰ',
    'ਉਨਾਸੀ',
    'ਅੱਸੀ',
    'ਇਕਿਆਸੀ',
    'ਬਿਆਸੀ',
    'ਤਰਿਆਸੀ',
    'ਚੌਰਿਆਸੀ',
    'ਪਚਾਸੀ',
    'ਛਿਆਸੀ',
    'ਸੱਤਾਸੀ',
    'ਅਠਾਸੀ',
    'ਨਵਾਸੀ',
    'ਨੱਬੇ',
    'ਇਕਾਨਵੇਂ',
    'ਬਾਨਵੇਂ',
    'ਤਰਾਨਵੇਂ',
    'ਚੁਰਾਨਵੇਂ',
    'ਪੰਚਾਨਵੇਂ',
    'ਛਿਆਨਵੇਂ',
    'ਸਤਾਨਵੇਂ',
    'ਅਠਾਨਵੇਂ',
    'ਨਿਨਾਨਵੇਂ'
  ]

  scales = [
    '',
    'ਹਜ਼ਾਰ',
    'ਲੱਖ',
    'ਕਰੋੜ',
    'ਅਰਬ',
    'ਖਰਬ',
    'ਨੀਲ',
    'ਪਦਮ',
    'ਸ਼ੰਖ'
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
      parts.push('ਇੱਕ ਸੌ')
    } else {
      parts.push(this.convertBelowHundred(hundreds) + ' ਸੌ')
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
  return new Punjabi(options).convertToWords(value)
}
