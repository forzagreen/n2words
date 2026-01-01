import { AbstractLanguage } from '../classes/abstract-language.js'

/**
 * Romanian language converter.
 *
 * Supports:
 * - Gender agreement (unu/una, doi/două)
 * - Complex pluralization (singular/plural forms)
 * - "De" preposition insertion for groups >= 20
 */
export class Romanian extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'virgulă'
  zeroWord = 'zero'

  onesWords = {
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

  onesFeminineWords = {
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

  teensWords = {
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

  teensMasculineWords = {
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

  twentiesWords = {
    2: 'douăzeci',
    3: 'treizeci',
    4: 'patruzeci',
    5: 'cincizeci',
    6: 'șaizeci',
    7: 'șaptezeci',
    8: 'optzeci',
    9: 'nouăzeci'
  }

  hundredsWords = {
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
  scaleMetadata = {
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

  constructor (options = {}) {
    super()

    this.options = this.mergeOptions({
      gender: 'masculine'
    }, options)
  }

  /** Split numeric string into BigInt groups of size x from left to right. */
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
    const stringValue = value.toString().padStart(3, '0').slice(-3)
    const a = [...stringValue].toReversed()
    return a.map(BigInt)
  }

  /** Romanian pluralization & "de" rule for big units. */
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

  spellUnder100 (n, feminineUnits = false, masculineTeens = false) {
    if (n < 10) {
      return (feminineUnits ? this.onesFeminineWords : this.onesWords)[n]
    }
    if (n < 20) {
      return (masculineTeens ? this.teensMasculineWords : this.teensWords)[n - 10]
    }
    const t = Math.floor(n / 10)
    const u = n % 10
    return u
      ? `${this.twentiesWords[t]} și ${(feminineUnits ? this.onesFeminineWords : this.onesWords)[u]}`
      : this.twentiesWords[t]
  }

  spellUnder1000 (n, feminineUnits = false, masculineTeens = false) {
    if (n < 100) return this.spellUnder100(n, feminineUnits, masculineTeens)
    const h = Math.floor(n / 100)
    const r = n % 100
    const hundredWords = this.hundredsWords[h]
    if (!r) return hundredWords
    // Standard readable form: "o sută unu" (for units) or "o sută cincizeci" (for tens)
    const separator = ' '
    return `${hundredWords}${separator}${this.spellUnder100(r, feminineUnits, masculineTeens)}`
  }

  /** Decimals always use masculine forms regardless of gender option. */
  convertDecimalWholePart (number) {
    if (number === 0n) return this.zeroWord
    // Use spellUnder1000 with masculine forms (feminineUnits=false, masculineTeens=true)
    if (number < 1000n) return this.spellUnder1000(Number(number), false, true)
    // For larger decimals, process chunks with masculine forms
    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length
    for (const x of chunks) {
      index = index - 1
      if (x === 0n) continue
      const [n1, n2, n3] = this.getDigits(x)
      if (n3 > 0n) words.push(this.hundredsWords[Number(n3)])
      if (n2 > 1n) words.push(this.twentiesWords[Number(n2)])
      if (n2 === 1n) {
        words.push(this.teensMasculineWords[Number(n1)])
      } else if (n1 > 0n) {
        if (n2 > 1n) words.push('și')
        words.push(this.onesWords[Number(n1)])
      }
      if (index > 0) {
        const form = this.scaleMetadata[index]
        if (form) {
          words.push(this.romanianPluralize(x, form))
        } else {
          words.push(this.spellUnder1000(Number(x), false))
        }
      }
    }
    return words.join(' ').replaceAll(/\s+/g, ' ').trim()
  }

  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
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
        words.push(this.hundredsWords[Number(n3)])
      }
      // tens & teens (only for the last group, not for thousands)
      if (index === 0) {
        if (n2 > 1n) {
          words.push(this.twentiesWords[Number(n2)])
        }
        if (n2 === 1n) {
          words.push(this.teensWords[Number(n1)])
        } else if (n1 > 0n) {
          // pick masculine/feminine units (only for the last group, not for thousands)
          const feminineUnits = this.options.gender === 'feminine' && index === 0
          onesMap = feminineUnits ? this.onesFeminineWords : this.onesWords
          // if there is a twenty/treizeci/etc AND ones > 0 → add "și"
          if (n2 > 1n) words.push('și')
          words.push(onesMap[Number(n1)])
        }
      }
      // big unit name (mie/mii, milion/milioane, …)
      if (index > 0) {
        const form = this.scaleMetadata[index]
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
}
