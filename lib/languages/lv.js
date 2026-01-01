import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Latvian language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Latvian diacritical marks (ī, ā, ē, ū)
 * - Compound number formation (divdesmit, trīsdesmit)
 */
export class Latvian extends SlavicLanguage {
  negativeWord = 'mīnus'
  decimalSeparatorWord = 'komats'
  zeroWord = 'nulle'

  onesWords = {
    1: 'viens',
    2: 'divi',
    3: 'trīs',
    4: 'četri',
    5: 'pieci',
    6: 'seši',
    7: 'septiņi',
    8: 'astoņi',
    9: 'deviņi'
  }

  onesFeminineWords = {
    1: 'viena',
    2: 'divas',
    3: 'trīs',
    4: 'četras',
    5: 'piecas',
    6: 'sešas',
    7: 'septiņas',
    8: 'astoņas',
    9: 'deviņas'
  }

  teensWords = {
    0: 'desmit',
    1: 'vienpadsmit',
    2: 'divpadsmit',
    3: 'trīspadsmit',
    4: 'četrpadsmit',
    5: 'piecpadsmit',
    6: 'sešpadsmit',
    7: 'septiņpadsmit',
    8: 'astoņpadsmit',
    9: 'deviņpadsmit'
  }

  twentiesWords = {
    2: 'divdesmit',
    3: 'trīsdesmit',
    4: 'četrdesmit',
    5: 'piecdesmit',
    6: 'sešdesmit',
    7: 'septiņdesmit',
    8: 'astoņdesmit',
    9: 'deviņdesmit'
  }

  hundredsWords = ['simts', 'simti', 'simtu']

  pluralForms = {
    1: ['tūkstotis', 'tūkstoši', 'tūkstošu'],
    2: ['miljons', 'miljoni', 'miljonu'],
    3: ['miljards', 'miljardi', 'miljardu'],
    4: ['triljons', 'triljoni', 'triljonu'],
    5: ['kvadriljons', 'kvadriljoni', 'kvadriljonu'],
    6: ['kvintiljons', 'kvintiljoni', 'kvintiljonu'],
    7: ['sikstiljons', 'sikstiljoni', 'sikstiljonu'],
    8: ['septiljons', 'septiljoni', 'septiljonu'],
    9: ['oktiljons', 'oktiljoni', 'oktiljonu'],
    10: ['nontiljons', 'nontiljoni', 'nontiljonu']
  }

  pluralize (n, forms) {
    if (n === 0n) {
      return forms[2]
    }

    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    if (lastDigit === 1n && lastTwoDigits !== 11n) {
      return forms[0]
    }

    return forms[1]
  }

  integerToWords (number) {
    if (number === 0n) {
      return this.zeroWord
    }
    const words = []
    const segments = this.splitToSegments(number.toString(), 3)
    let index = segments.length
    for (const x of segments) {
      index = index - 1
      if (x === 0n) {
        continue
      }
      const [n1, n2, n3] = this.extractDigits(x)
      if (n3 > 0n) {
        if (n3 === 1n && n2 === 0n && n1 > 0n) {
          words.push(this.hundredsWords[2])
        } else if (n3 > 1n) {
          words.push(this.onesWords[n3], this.hundredsWords[1])
        } else {
          words.push(this.hundredsWords[0])
        }
      }
      if (n2 > 1n) {
        words.push(this.twentiesWords[n2])
      }
      if (n2 === 1n) {
        words.push(this.teensWords[n1])
      } else if (n1 > 0n && !(index > 0 && x === 1n)) {
        words.push(this.onesWords[n1])
      }
      if (index > 0) {
        words.push(this.pluralize(x, this.pluralForms[index]))
      }
    }
    return words.join(' ')
  }
}
