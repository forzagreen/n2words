import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Lithuanian language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (vienas/viena, du/dvi)
 * - Baltic declension patterns
 */
export class Lithuanian extends SlavicLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'kablelis'
  zeroWord = 'nulis'

  onesWords = {
    1: 'vienas',
    2: 'du',
    3: 'trys',
    4: 'keturi',
    5: 'penki',
    6: 'šeši',
    7: 'septyni',
    8: 'aštuoni',
    9: 'devyni'
  }

  onesFeminineWords = {
    1: 'viena',
    2: 'dvi',
    3: 'trys',
    4: 'keturios',
    5: 'penkios',
    6: 'šešios',
    7: 'septynios',
    8: 'aštuonios',
    9: 'devynios'
  }

  teensWords = {
    0: 'dešimt',
    1: 'vienuolika',
    2: 'dvylika',
    3: 'trylika',
    4: 'keturiolika',
    5: 'penkiolika',
    6: 'šešiolika',
    7: 'septyniolika',
    8: 'aštuoniolika',
    9: 'devyniolika'
  }

  twentiesWords = {
    2: 'dvidešimt',
    3: 'trisdešimt',
    4: 'keturiasdešimt',
    5: 'penkiasdešimt',
    6: 'šešiasdešimt',
    7: 'septyniasdešimt',
    8: 'aštuoniasdešimt',
    9: 'devyniasdešimt'
  }

  hundredsWords = ['šimtas', 'šimtai']

  pluralForms = {
    1: ['tūkstantis', 'tūkstančiai', 'tūkstančių'],
    2: ['milijonas', 'milijonai', 'milijonų'],
    3: ['milijardas', 'milijardai', 'milijardų'],
    4: ['trilijonas', 'trilijonai', 'trilijonų'],
    5: ['kvadrilijonas', 'kvadrilijonai', 'kvadrilijonų'],
    6: ['kvintilijonas', 'kvintilijonai', 'kvintilijonų'],
    7: ['sikstilijonas', 'sikstilijonai', 'sikstilijonų'],
    8: ['septilijonas', 'septilijonai', 'septilijonų'],
    9: ['oktilijonas', 'oktilijonai', 'oktilijonų'],
    10: ['naintilijonas', 'naintilijonai', 'naintilijonų']
  }

  pluralize (n, forms) {
    if (n === 0n) {
      return forms[2]
    }

    const [n1, n2] = this.getDigits(n)

    if (n2 === 1n || n1 === 0n) {
      return forms[2]
    }

    if (n1 === 1n) {
      return forms[0]
    }

    return forms[1]
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
      if (x === 0n) {
        continue
      }
      const [n1, n2, n3] = this.getDigits(x)
      if (n3 > 0n) {
        words.push(this.onesWords[n3])
        if (n3 > 1n) {
          words.push(this.hundredsWords[1])
        } else {
          words.push(this.hundredsWords[0])
        }
      }
      if (n2 > 1n) {
        words.push(this.twentiesWords[n2])
      }
      if (n2 === 1n) {
        words.push(this.teensWords[n1])
      } else if (n1 > 0n) {
        if ((index === 1 || (this.options.gender === 'feminine' && index === 0)) && number < 1000n) {
          words.push(this.onesFeminineWords[n1])
        } else {
          words.push(this.onesWords[n1])
        }
      }
      if (index > 0) {
        words.push(this.pluralize(x, this.pluralForms[index]))
      }
    }
    return words.join(' ')
  }
}
