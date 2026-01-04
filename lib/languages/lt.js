import { InflectedScaleLanguage } from '../classes/inflected-scale-language.js'

/**
 * Lithuanian language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (vienas/viena, du/dvi)
 * - Baltic declension patterns
 * - Two-form hundreds (šimtas/šimtai)
 */
export class Lithuanian extends InflectedScaleLanguage {
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

  tensWords = {
    2: 'dvidešimt',
    3: 'trisdešimt',
    4: 'keturiasdešimt',
    5: 'penkiasdešimt',
    6: 'šešiasdešimt',
    7: 'septyniasdešimt',
    8: 'aštuoniasdešimt',
    9: 'devyniasdešimt'
  }

  /**
   * Lithuanian hundreds have two forms:
   * - šimtas (singular: 1)
   * - šimtai (plural: 2+)
   */
  hundredsForms = ['šimtas', 'šimtai']

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

  /**
   * Stores the current integer being converted for context in onesToWords.
   * @private
   */
  _currentInteger = 0n

  /**
   * Converts integer to words, storing context for feminine handling.
   *
   * @param {bigint} integerPart The integer to convert.
   * @returns {string} The number in words.
   */
  integerToWords (integerPart) {
    this._currentInteger = integerPart
    return super.integerToWords(integerPart)
  }

  /**
   * Converts a 3-digit segment to words.
   * Handles Lithuanian-specific hundreds forms.
   *
   * @protected
   * @param {bigint} segment The segment value (0-999).
   * @param {number} scaleIndex The scale level.
   * @returns {string} The segment in words.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds - Lithuanian always includes the numeral
    if (hundreds > 0n) {
      parts.push(this.onesWords[hundreds])
      if (hundreds > 1n) {
        parts.push(this.hundredsForms[1])
      } else {
        parts.push(this.hundredsForms[0])
      }
    }

    // Tens
    if (tens > 1n) {
      parts.push(this.tensWords[tens])
    }

    // Teens or ones
    if (tens === 1n) {
      parts.push(this.teensWords[ones])
    } else if (ones > 0n) {
      parts.push(this.onesToWords(ones, scaleIndex, tens))
    }

    return parts.join(' ')
  }

  /**
   * Converts ones digit to words with gender support.
   * Lithuanian uses feminine only for numbers < 1000 when gender is feminine.
   *
   * Note: The `integerPart` context is passed via the instance to check this rule.
   *
   * @protected
   * @param {bigint} ones The ones digit (1-9).
   * @param {number} scaleIndex The scale level.
   * @param {bigint} tens The tens digit (for context).
   * @returns {string} The ones word.
   */
  onesToWords (ones, scaleIndex, tens) {
    // Feminine only for ones segment when gender is feminine AND number < 1000
    const isFeminine = this.options.gender === 'feminine' && scaleIndex === 0 && this._currentInteger < 1000n
    const onesArray = isFeminine ? this.onesFeminineWords : this.onesWords
    return onesArray[ones]
  }

  /**
   * Lithuanian pluralization rules.
   * - Singular: ends in 1 (except 11)
   * - Plural: ends in 2-9 (except 12-19)
   * - Genitive: 0, 10-19, or ends in 0
   *
   * @param {bigint} n The number to check.
   * @param {string[]} forms Array of [singular, plural, genitive] forms.
   * @returns {string} The appropriate form for the number.
   */
  pluralize (n, forms) {
    if (n === 0n) {
      return forms[2]
    }

    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    // 10-19 always use genitive
    if (lastTwoDigits >= 10n && lastTwoDigits <= 19n) {
      return forms[2]
    }

    // Ends in 0 → genitive
    if (lastDigit === 0n) {
      return forms[2]
    }

    // Ends in 1 → singular
    if (lastDigit === 1n) {
      return forms[0]
    }

    // Ends in 2-9 → plural
    return forms[1]
  }
}
