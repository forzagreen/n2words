import AbstractLanguage from '../classes/abstract-language.js'

/**
 * Romanian language converter.
 *
 * Converts numbers to Romanian words with full grammatical support:
 * - Gender agreement (masculine/feminine forms)
 * - Complex pluralization (singular/plural forms)
 * - "De" preposition insertion for groups >= 20
 * - Special feminine handling for thousands
 * - Proper case and agreement patterns
 *
 * Key Features:
 * - Gender-aware number forms (unu/una, doi/două, doisprezece/douăsprezece)
 * - Group-based algorithm:
 *   1. Split number into groups of 3 digits
 *   2. Convert each group using gender rules and special forms
 *   3. Insert "de" preposition for groups >= 20 (e.g., "douăzeci de mii")
 *   4. Append magnitude word with proper singular/plural form (mie/mii, milion/milioane)
 *   5. Join with spaces
 * - Special feminine units for thousands group
 * - Automatic "de" insertion rules (nouăsprezece mii vs douăzeci de mii)
 * - Proper singular/plural forms (mie/mii, milion/milioane)
 * - Support for very large numbers (up to decillions)
 *
 * Features:
 * - Feminine units for thousands group
 * - Support for very large numbers (up to decillions)
 */
export class Romanian extends AbstractLanguage {
  /** @type {boolean} */
  feminine

  /** @type {object} */
  ones = {
    1: 'unu',
    2: 'doi',
    3: 'trei',
    4: 'patru',
    5: 'cinci',
    6: 'șase',
    7: 'șapte',
    8: 'opt',
    9: 'nouă'
  }

  /** @type {object} */
  onesFeminine = {
    1: 'una',
    2: 'două',
    3: 'trei',
    4: 'patru',
    5: 'cinci',
    6: 'șase',
    7: 'șapte',
    8: 'opt',
    9: 'nouă'
  }

  /** @type {object} */
  tens = {
    0: 'zece',
    1: 'unsprezece',
    2: 'douăsprezece',
    3: 'treisprezece',
    4: 'paisprezece',
    5: 'cincisprezece',
    6: 'șaisprezece',
    7: 'șaptesprezece',
    8: 'optsprezece',
    9: 'nouăsprezece'
  }

  /** @type {object} */
  tensMasculine = {
    0: 'zece',
    1: 'unsprezece',
    2: 'doisprezece',
    3: 'treisprezece',
    4: 'paisprezece',
    5: 'cincisprezece',
    6: 'șaisprezece',
    7: 'șaptesprezece',
    8: 'optsprezece',
    9: 'nouăsprezece'
  }

  /** @type {object} */
  twenties = {
    2: 'douăzeci',
    3: 'treizeci',
    4: 'patruzeci',
    5: 'cincizeci',
    6: 'șaizeci',
    7: 'șaptezeci',
    8: 'optzeci',
    9: 'nouăzeci'
  }

  /** @type {object} */
  hundreds = {
    1: 'o sută',
    2: 'două sute',
    3: 'trei sute',
    4: 'patru sute',
    5: 'cinci sute',
    6: 'șase sute',
    7: 'șapte sute',
    8: 'opt sute',
    9: 'nouă sute'
  }

  /**
   * Romanian big units.
   * For each power group we keep: singular, plural, feminineUnits?, needsDe?
   * - 10^3: mie/mii (feminine units in chunk; "de" for chunk >= 20)
   * - 10^6: milion/milioane ("de" for chunk >= 20)
   * - 10^9: miliard/miliarde ("de" for chunk >= 20)
   */
  thousands = {
    1: { singular: 'mie', plural: 'mii', feminine: true, needsDe: true }, // 10^3
    2: { singular: 'milion', plural: 'milioane', feminine: false, needsDe: true }, // 10^6
    3: { singular: 'miliard', plural: 'miliarde', feminine: false, needsDe: true }, // 10^9
    4: { singular: 'trilion', plural: 'trilioane', feminine: false, needsDe: true }, // 10^12
    5: { singular: 'cvadrilion', plural: 'cvadrilioane', feminine: false, needsDe: true }, // 10^15
    6: { singular: 'cvintilion', plural: 'cvintilioane', feminine: false, needsDe: true }, // 10^18
    7: { singular: 'sextilion', plural: 'sextilioane', feminine: false, needsDe: true }, // 10^21
    8: { singular: 'septilion', plural: 'septilioane', feminine: false, needsDe: true }, // 10^24
    9: { singular: 'octilion', plural: 'octilioane', feminine: false, needsDe: true }, // 10^27
    10: { singular: 'decilion', plural: 'decilioane', feminine: false, needsDe: true } // 10^33
  }

  /**
   * Initializes the Romanian converter with language-specific options.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='minus'] Word for negative numbers.
   * @param {string} [options.separatorWord='virgulă'] Word separating whole and decimal parts (comma).
   * @param {string} [options.zero='zero'] Word for the digit 0.
   * @param {boolean} [options.feminine=false] Use feminine forms for numbers.
   */
  constructor (options) {
    options = Object.assign({
      negativeWord: 'minus',
      separatorWord: 'virgulă',
      zero: 'zero',
      feminine: false
    }, options)

    super(options)
    this.feminine = options.feminine
  }

  toCardinal (number) {
    if (number === 0n) {
      return this.zero
    }

    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length

    for (const x of chunks) {
      let onesMap = []
      index = index - 1

      if (x === 0n) continue

      const [n1, n2, n3] = this.getDigits(x) // units, tens, hundreds (as BigInt)

      // hundreds (only for the last group, not for thousands)
      if (n3 > 0n && index === 0) {
        words.push(this.hundreds[Number(n3)])
      }

      // tens & teens (only for the last group, not for thousands)
      if (index === 0) {
        if (n2 > 1n) {
          words.push(this.twenties[Number(n2)])
        }

        if (n2 === 1n) {
          words.push(this.tens[Number(n1)])
        } else if (n1 > 0n) {
          // pick masculine/feminine units (only for the last group, not for thousands)
          const feminineUnits = this.feminine && index === 0
          onesMap = feminineUnits ? this.onesFeminine : this.ones

          // if there is a twenty/treizeci/etc AND ones > 0 → add "și"
          if (n2 > 1n) words.push('și')
          words.push(onesMap[Number(n1)])
        }
      }

      // big unit name (mie/mii, milion/milioane, …)
      if (index > 0) {
        const form = this.thousands[index]
        if (form) {
          words.push(this.romanianPluralize(x, form))
        } else {
          // For very large numbers beyond our defined units, just spell out the number
          words.push(this.spellUnder1000(Number(x), true))
        }
      }
    }

    return words.join(' ').replaceAll(/\s+/g, ' ').trim()
  }

  /**
   * Split numeric string into BigInt groups of size x from left to right.
   * @param {string} n - The numeric string to split
   * @param {number} x - The size of each group
   * @returns {bigint[]} Array of BigInt groups
   */
  splitByX (n, x) {
    const results = []
    const l = n.length
    let result

    if (l > x) {
      const start = l % x
      if (start > 0) {
        result = n.slice(0, start)
        results.push(BigInt(result))
      }
      for (let index = start; index < l; index += x) {
        result = n.slice(index, index + x)
        results.push(BigInt(result))
      }
    } else {
      results.push(BigInt(n))
    }
    return results
  }

  getDigits (value) {
    // returns [units, tens, hundreds] as BigInt
    const stringValue = value.toString().padStart(3, '0').slice(-3)
    const a = [...stringValue].toReversed()
    return a.map(BigInt)
  }

  /**
   * Romanian pluralization & "de" rule for big units.
   * - 1 → singular with article ("o mie", "un milion", "un miliard", …)
   * - otherwise → spell chunk + (optional "de") + plural
   * "de" is inserted when chunk >= 20 (e.g., "douăzeci de mii/milioane/miliarde").
   * @param {bigint} chunk - The chunk value
   * @param {object} form - The form object with singular, plural, feminine, needsDe properties
   * @returns {string} The pluralized form
   */
  romanianPluralize (chunk, form) {
    const n = Number(chunk)

    if (n === 1) {
      // article differs for feminine "mie" (o mie) vs the rest (un milion/miliard…)
      const article = form.feminine ? 'o' : 'un'
      return `${article} ${form.singular}`
    }

    // For 21 with big units, use feminine "una" with plural nouns
    if (n === 21 && form.needsDe) {
      return `douăzeci și una de ${form.plural}`
    }

    // spell the chunk itself (use feminine units for big numbers)
    const words = this.spellUnder1000(n, true)

    // "de" after >= 20 (covers 20, 21, 100, 101, 999, etc.)
    const needsDe = form.needsDe && n >= 20
    const de = needsDe ? ' de ' : ' '

    return `${words}${de}${form.plural}`
  }

  spellUnder100 (n, feminineUnits = false) {
    if (n < 10) {
      return (feminineUnits ? this.onesFeminine : this.ones)[n]
    }
    if (n < 20) {
      return this.tens[n - 10]
    }
    const t = Math.floor(n / 10)
    const u = n % 10
    return u
      ? `${this.twenties[t]} și ${(feminineUnits ? this.onesFeminine : this.ones)[u]}`
      : this.twenties[t]
  }

  spellUnder1000 (n, feminineUnits = false) {
    if (n < 100) return this.spellUnder100(n, feminineUnits)
    const h = Math.floor(n / 100)
    const r = n % 100
    const hundredWords = this.hundreds[h]
    if (!r) return hundredWords
    // Standard readable form: "o sută unu" (for units) or "o sută cincizeci" (for tens)
    const separator = ' '
    return `${hundredWords}${separator}${this.spellUnder100(r, feminineUnits)}`
  }

  /**
   * Override decimalToCardinal to use masculine forms for decimal places
   * @param {string} decimal Decimal string to convert
   * @returns {string} Value in written format
   */
  decimalToCardinal (decimal) {
    const words = []

    // Split decimal string into an array of characters
    const chars = [...decimal]

    // Loop through characters adding leading zeros to words array
    let index = 0
    while (index < chars.length && chars[index] === '0') {
      words.push(this.zero)
      index++
    }

    // Prevent further processing if entire string was zeros
    if (index === chars.length) {
      return words
    }

    // Convert and add remaining using masculine forms for decimal places
    const decimalNumber = BigInt(decimal)
    const masculineWords = this.toCardinalWithMasculine(decimalNumber)
    return [...words, masculineWords]
  }

  /**
   * Convert number to cardinal form using masculine units
   * @param {bigint} number Number to convert
   * @returns {string} Value in written format
   */
  toCardinalWithMasculine (number) {
    if (number === 0n) {
      return this.zero
    }

    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length

    for (const x of chunks) {
      let onesMap = []
      index = index - 1

      if (x === 0n) continue

      const [n1, n2, n3] = this.getDigits(x) // units, tens, hundreds (as BigInt)

      // hundreds
      if (n3 > 0n) {
        words.push(this.hundreds[Number(n3)])
      }

      // tens & teens
      if (n2 > 1n) {
        words.push(this.twenties[Number(n2)])
      }

      if (n2 === 1n) {
        words.push(this.tensMasculine[Number(n1)])
      } else if (n1 > 0n) {
        // Always use masculine units for decimal places
        onesMap = this.ones

        // if there is a twenty/treizeci/etc AND ones > 0 → add "și"
        if (n2 > 1n) words.push('și')
        words.push(onesMap[Number(n1)])
      }

      // big unit name (mie/mii, milion/milioane, …)
      if (index > 0) {
        const form = this.thousands[index]
        if (form) {
          words.push(this.romanianPluralize(x, form))
        } else {
          // For very large numbers beyond our defined units, just spell out the number
          words.push(this.spellUnder1000(Number(x), false))
        }
      }
    }

    return words.join(' ').replaceAll(/\s+/g, ' ').trim()
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 */
export default function floatToCardinal (value, options = {}) {
  return new Romanian(options).floatToCardinal(value)
}
