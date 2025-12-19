import SlavicLanguage from '../classes/slavic-language.js'

/**
 * Lithuanian language converter.
 *
 * Implements Lithuanian number words using the Slavic language pattern:
 * - Lithuanian number words (vienas/viena, du/dvi, trys, keturi...)
 * - Gender-aware forms (masculine/feminine)
 * - Baltic three-form pluralization (tūkstantis/tūkstančiai/tūkstančių)
 * - Lithuanian-specific declension patterns
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic/Baltic languages
 *   * Form 1 (singular): 1 (e.g., "tūkstantis")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "tūkstančiai")
 *   * Form 3 (many): all other numbers (e.g., "tūkstančių")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via thousands[] array with indexed [singular, few, many] forms
 * - Gender-specific number forms for 1 and 2 (masculine/feminine dual forms)
 *
 * Features:
 * - Dual gender forms (vienas/viena, du/dvi, keturi/keturios)
 * - Complex declension patterns for large numbers
 * - Baltic language characteristics
 *
 * Inherits from SlavicLanguage as Lithuanian uses similar pluralization.
 */
export class Lithuanian extends SlavicLanguage {
  negativeWord = 'minus'

  decimalSeparatorWord = 'kablelis'

  zeroWord = 'nulis'

  ones = {
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

  onesFeminine = {
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

  tens = {
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

  twenties = {
    2: 'dvidešimt',
    3: 'trisdešimt',
    4: 'keturiasdešimt',
    5: 'penkiasdešimt',
    6: 'šešiasdešimt',
    7: 'septyniasdešimt',
    8: 'aštuoniasdešimt',
    9: 'devyniasdešimt'
  }

  hundreds = ['šimtas', 'šimtai']

  thousands = {
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
        words.push(this.ones[n3])
        if (n3 > 1n) {
          words.push(this.hundreds[1])
        } else {
          words.push(this.hundreds[0])
        }
      }
      if (n2 > 1n) {
        words.push(this.twenties[n2])
      }
      if (n2 === 1n) {
        words.push(this.tens[n1])
      } else if (n1 > 0n) {
        if ((index === 1 || (this.feminine && index === 0)) && number < 1000n) {
          words.push(this.onesFeminine[n1])
        } else {
          words.push(this.ones[n1])
        }
      }
      if (index > 0) {
        words.push(this.pluralize(x, this.thousands[index]))
      }
    }
    return words.join(' ')
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function convertToWords (value, options = {}) {
  return new Lithuanian(options).convertToWords(value)
}


