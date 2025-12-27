import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Serbian Latin language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (jedan/jedna, dva/dve)
 * - Latin script representation
 */
export class SerbianLatin extends SlavicLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'zapeta'
  zeroWord = 'nula'

  onesWords = {
    1: ['jedan', 'jedna'],
    2: ['dva', 'dve'],
    3: ['tri', 'tri'],
    4: ['četiri', 'četiri'],
    5: ['pet', 'pet'],
    6: ['šest', 'šest'],
    7: ['sedam', 'sedam'],
    8: ['osam', 'osam'],
    9: ['devet', 'devet']
  }

  teensWords = {
    0: 'deset',
    1: 'jedanaest',
    2: 'dvanaest',
    3: 'trinaest',
    4: 'četrnaest',
    5: 'petnaest',
    6: 'šesnaest',
    7: 'sedamnaest',
    8: 'osamnaest',
    9: 'devetnaest'
  }

  twentiesWords = {
    2: 'dvadeset',
    3: 'trideset',
    4: 'četrdeset',
    5: 'pedeset',
    6: 'šezdeset',
    7: 'sedamdeset',
    8: 'osamdeset',
    9: 'devedeset'
  }

  hundredsWords = {
    1: 'sto',
    2: 'dvesta',
    3: 'trista',
    4: 'četiristo',
    5: 'petsto',
    6: 'šesto',
    7: 'sedamsto',
    8: 'osamsto',
    9: 'devetsto'
  }

  SCALE = [
    ['', '', '', false],
    ['hiljada', 'hiljade', 'hiljada', true], // 10 ^ 3
    ['milion', 'miliona', 'miliona', false], // 10 ^ 6
    ['milijarda', 'milijarde', 'milijarda', false], // 10 ^ 9
    ['bilion', 'biliona', 'biliona', false], // 10 ^ 12
    ['bilijarda', 'bilijarde', 'bilijarda', false], // 10 ^ 15
    ['trilion', 'triliona', 'triliona', false], // 10 ^ 18
    ['trilijarda', 'trilijarde', 'trilijarda', false], // 10 ^ 21
    ['kvadrilion', 'kvadriliona', 'kvadriliona', false], // 10 ^ 24
    ['kvadrilijarda', 'kvadrilijarde', 'kvadrilijarda', false], // 10 ^ 27
    ['kvintilion', 'kvintiliona', 'kvintiliona', false] // 10 ^ 30
  ]

  pluralize (n, forms) {
    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    if ((lastTwoDigits < 10n || lastTwoDigits > 20n) && lastDigit === 1n) {
      return forms[0]
    }

    if ((lastTwoDigits < 10n || lastTwoDigits > 20n) && lastDigit > 1n && lastDigit < 5n) {
      return forms[1]
    }

    return forms[2]
  }

  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }
    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length
    for (const x of chunks) {
      index = index - 1
      const [n1, n2, n3] = this.getDigits(x)
      if (n3 > 0) {
        words.push(this.hundredsWords[n3])
      }
      if (n2 > 1) {
        words.push(this.twentiesWords[n2])
      }
      if (n2 === 1n) {
        words.push(this.teensWords[n1])
      } else if (n1 > 0) {
        const isFeminine = (this.options.gender === 'feminine' || this.SCALE[index][3])
        const genderIndex = isFeminine ? 1 : 0
        words.push(this.onesWords[n1][genderIndex])
      }
      if ((index > 0) && (x !== 0n)) {
        words.push(this.pluralize(x, this.SCALE[index]))
      }
    }
    return words.join(' ')
  }
}
