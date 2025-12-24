import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * @typedef {Object} SerbianCyrillicOptions
 * @property {boolean} [feminine=false] Use feminine forms for numbers.
 */

/**
 * Serbian language converter (Cyrillic script).
 *
 * Implements Serbian number words using the Slavic language pattern:
 * - Serbian number words (један/једна, два/две, три, четири...)
 * - Gender-aware forms (masculine/feminine)
 * - Slavic three-form pluralization (хиљада/хиљаде/хиљада)
 * - Cyrillic script representation
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic languages
 *   * Form 1 (singular): 1 (e.g., "хиљада")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "хиљаде")
 *   * Form 3 (many): all other numbers (e.g., "хиљада")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via SCALE[] array with indexed [singular, few, many] forms
 * - Gender-specific number forms for 1 and 2 (masculine/feminine dual forms)
 *
 * Features:
 * - Dual gender forms for 1 and 2 (један/једна, два/две)
 * - Similar structure to Serbian Latin with Cyrillic orthography
 * - Cyrillic script (Serbian can use both Latin and Cyrillic)
 *
 * Inherits from SlavicLanguage for complex pluralization algorithms.
 */
export class SerbianCyrillicNumberConverter extends SlavicLanguage {
  negativeWord = 'минус'
  decimalSeparatorWord = 'запета'
  zeroWord = 'нула'

  ones = {
    1: ['један', 'једна'],
    2: ['два', 'две'],
    3: ['три', 'три'],
    4: ['четири', 'четири'],
    5: ['пет', 'пет'],
    6: ['шест', 'шест'],
    7: ['седам', 'седам'],
    8: ['осам', 'осам'],
    9: ['девет', 'девет']
  }

  tens = {
    0: 'десет',
    1: 'једанаест',
    2: 'дванаест',
    3: 'тринаест',
    4: 'четрнаест',
    5: 'петнаест',
    6: 'шеснаест',
    7: 'седамнаест',
    8: 'осамнаест',
    9: 'деветнаест'
  }

  twenties = {
    2: 'двадесет',
    3: 'тридесет',
    4: 'четрдесет',
    5: 'педесет',
    6: 'шездесет',
    7: 'седамдесет',
    8: 'осамдесет',
    9: 'деведесет'
  }

  hundreds = {
    1: 'сто',
    2: 'двеста',
    3: 'триста',
    4: 'четиристо',
    5: 'петсто',
    6: 'шесто',
    7: 'седамсто',
    8: 'осамсто',
    9: 'девестo'
  }

  SCALE = [
    ['', '', '', false],
    ['хиљада', 'хиљаде', 'хиљада', true], // 10 ^ 3
    ['милион', 'милиона', 'милиона', false], // 10 ^ 6
    ['милијарда', 'милијарде', 'милијарда', false], // 10 ^ 9
    ['билион', 'билиона', 'билиона', false], // 10 ^ 12
    ['билијарда', 'билијарде', 'билијарда', false], // 10 ^ 15
    ['трилион', 'трилиона', 'трилиона', false], // 10 ^ 18
    ['трилијарда', 'трилијарде', 'трилијарда', false], // 10 ^ 21
    ['квадрилион', 'квадрилиона', 'квадрилиона', false], // 10 ^ 24
    ['квадрилијарда', 'квадрилијарде', 'квадрилијарда', false], // 10 ^ 27
    ['квинтилион', 'квинтилиона', 'квинтилиона', false] // 10 ^ 30
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
        words.push(this.hundreds[n3])
      }
      if (n2 > 1) {
        words.push(this.twenties[n2])
      }
      if (n2 === 1n) {
        words.push(this.tens[n1])
      } else if (n1 > 0) {
        const isFeminine = (this.feminine || this.SCALE[index][3])
        const genderIndex = isFeminine ? 1 : 0
        words.push(this.ones[n1][genderIndex])
      }
      if ((index > 0) && (x !== 0n)) {
        words.push(this.pluralize(x, this.SCALE[index]))
      }
    }
    return words.join(' ')
  }
}
