import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Croatian language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (jedan/jedna, dva/dvije)
 * - Croatian-specific declension endings
 */
export class Croatian extends SlavicLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'zarez'
  zeroWord = 'nula'

  ones = {
    1: 'jedan',
    2: 'dva',
    3: 'tri',
    4: 'četiri',
    5: 'pet',
    6: 'šest',
    7: 'sedam',
    8: 'osam',
    9: 'devet'
  }

  onesFeminine = {
    1: 'jedna',
    2: 'dvije',
    3: 'tri',
    4: 'četiri',
    5: 'pet',
    6: 'šest',
    7: 'sedam',
    8: 'osam',
    9: 'devet'
  }

  tens = {
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

  twenties = {
    2: 'dvadeset',
    3: 'trideset',
    4: 'četrdeset',
    5: 'pedeset',
    6: 'šezdeset',
    7: 'sedamdeset',
    8: 'osamdeset',
    9: 'devedeset'
  }

  hundreds = {
    1: 'sto',
    2: 'dvjesto',
    3: 'tristo',
    4: 'četiristo',
    5: 'petsto',
    6: 'šesto',
    7: 'sedamsto',
    8: 'osamsto',
    9: 'devetsto'
  }

  pluralForms = {
    1: ['tisuća', 'tisuće', 'tisuća'], // 10 ^ 3
    2: ['milijun', 'milijuna', 'milijuna'], // 10 ^ 6
    3: ['milijarda', 'milijarde', 'milijarda'], // 10 ^ 9
    4: ['bilijun', 'bilijuna', 'bilijuna'], // 10 ^ 12
    5: ['bilijarda', 'bilijarde', 'bilijarda'], // 10 ^ 15
    6: ['trilijun', 'trilijuna', 'trilijuna'], // 10 ^ 18
    7: ['trilijarda', 'trilijarde', 'trilijarda'], // 10 ^ 21
    8: ['kvadrilijun', 'kvadrilijuna', 'kvadrilijuna'], // 10 ^ 24
    9: ['kvadrilijarda', 'kvadrilijarde', 'kvadrilijarda'], // 10 ^ 27
    10: ['kvintilijun', 'kvintilijuna', 'kvintilijuna'] // 10 ^ 30
  }

  /**
   * Maps chunk indices to whether they are grammatically feminine.
   * In Croatian, thousands (index 1) are feminine, others are masculine.
   * @type {Object.<number, boolean>}
   */
  scaleGenders = {
    1: true, // thousands are feminine
    2: false, // millions are masculine
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false
  }

  /** Selects Croatian plural form: 1 = singular, 2-4 = few, else = many. */
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

  /** Converts whole number with Croatian gender-aware forms and pluralization. */
  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }
    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let chunkIndex = chunks.length

    for (const chunkValue of chunks) {
      chunkIndex = chunkIndex - 1

      if (chunkValue === 0n) {
        continue
      }

      const [onesDigit, tensDigit, hundredsDigit] = this.getDigits(chunkValue)

      if (hundredsDigit > 0n) {
        words.push(this.hundreds[hundredsDigit])
      }

      if (tensDigit > 1n) {
        words.push(this.twenties[tensDigit])
      }

      // Handle teens (10-19) or ones (1-9)
      if (tensDigit === 1n) {
        words.push(this.tens[onesDigit])
      } else if (onesDigit > 0n) {
        // Use feminine forms if: scale is feminine OR user explicitly requested feminine
        const isFeminine = (this.scaleGenders[chunkIndex] || this.options.gender === 'feminine')
        const onesArray = isFeminine ? this.onesFeminine : this.ones
        words.push(onesArray[onesDigit])
      }

      // Add power word (thousand, million, etc.) with proper pluralization
      if (chunkIndex > 0) {
        words.push(this.pluralize(chunkValue, this.pluralForms[chunkIndex]))
      }
    }

    return words.join(' ')
  }
}
