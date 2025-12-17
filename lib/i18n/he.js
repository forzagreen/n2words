import SlavicLanguage from '../classes/slavic-language.js'

/**
 * Hebrew language converter.
 *
 * Implements Hebrew number words using the Slavic language pattern:
 * - Hebrew alphabet and right-to-left text
 * - Hebrew number words (אחת, שתים, שלוש, ארבע...)
 * - Feminine number forms (default in Hebrew)
 * - Optional "ve" (ו, "and") conjunction between number groups
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic languages
 *   * Form 1 (singular): 1 (e.g., "אלף")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "אלפים")
 *   * Form 3 (many): all other numbers (e.g., "אלף")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via thousands[] array with indexed [singular, few, many] forms
 *
 * Features:
 * - Right-to-left text orientation
 * - Feminine grammatical gender for numbers
 * - Three-form pluralization (similar to Slavic pattern)
 * - Conjunction control via "and" option
 *
 * Inherits from SlavicLanguage for complex pluralization algorithms.
 */
export class Hebrew extends SlavicLanguage {
  and

  ones = {
    1: 'אחת',
    2: 'שתים',
    3: 'שלש',
    4: 'ארבע',
    5: 'חמש',
    6: 'שש',
    7: 'שבע',
    8: 'שמונה',
    9: 'תשע'
  }

  tens = {
    0: 'עשר',
    1: 'אחת עשרה',
    2: 'שתים עשרה',
    3: 'שלש עשרה',
    4: 'ארבע עשרה',
    5: 'חמש עשרה',
    6: 'שש עשרה',
    7: 'שבע עשרה',
    8: 'שמונה עשרה',
    9: 'תשע עשרה'
  }

  twenties = {
    2: 'עשרים',
    3: 'שלשים',
    4: 'ארבעים',
    5: 'חמישים',
    6: 'ששים',
    7: 'שבעים',
    8: 'שמונים',
    9: 'תשעים'
  }

  hundreds = {
    1: 'מאה',
    2: 'מאתיים',
    3: 'מאות'
  }

  thousands = {
    1: 'אלף',
    2: 'אלפיים',
    3: 'שלשת אלפים',
    4: 'ארבעת אלפים',
    5: 'חמשת אלפים',
    6: 'ששת אלפים',
    7: 'שבעת אלפים',
    8: 'שמונת אלפים',
    9: 'תשעת אלפים'
  }

  constructor (options) {
    // TODO Confirm `negativeWord`
    // TODO Set `separatorWord`
    options = Object.assign({
      negativeWord: 'מינוס',
      // separatorWord: ,
      zero: 'אפס',
      and: 'ו'
    }, options)

    super(options)

    this.and = options.and
  }

  toCardinal (number) {
    if (number === 0n) {
      return this.zero
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

      if (index > 0) {
        words.push(this.thousands[n1])
        continue
      }

      if (n3 > 0n) {
        if (n3 <= 2n) {
          words.push(this.hundreds[n3])
        } else {
          words.push(this.ones[n3] + ' ' + this.hundreds[3])
        }
      }

      if (n2 > 1n) {
        words.push(this.twenties[n2])
      }

      if (n2 === 1n) {
        words.push(this.tens[n1])
      } else if (n1 > 0n) {
        words.push(this.ones[n1])
      }
    }

    if (words.length > 1) {
      words[words.length - 1] = this.and + words.at(-1)
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
export default function floatToCardinal (value, options = {}) {
  return new Hebrew(options).floatToCardinal(value)
}
