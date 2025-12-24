import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * (European) Portuguese language converter.
 *
 * Features:
 * - Gender-aware hundreds (hundredos, duzentos, etc.)
 * - Million/Billion pluralization
 * - "e" (and) conjunction for number combinations
 * - Post-processing to normalize word flow
 */
export class PortugueseNumberConverter extends GreedyScaleLanguage {
  negativeWord = 'menos'
  decimalSeparatorWord = 'vírgula'
  zeroWord = 'zero'

  scaleWordPairs = [
    [1_000_000_000_000_000_000_000_000n, 'quatrilião'],
    [1_000_000_000_000_000_000n, 'trilião'],
    [1_000_000_000_000n, 'bilião'],
    [1_000_000n, 'milião'],
    [1000n, 'mil'],
    [100n, 'cem'],
    [90n, 'noventa'],
    [80n, 'oitenta'],
    [70n, 'setenta'],
    [60n, 'sessenta'],
    [50n, 'cinquenta'],
    [40n, 'quarenta'],
    [30n, 'trinta'],
    [20n, 'vinte'],
    [19n, 'dezanove'],
    [18n, 'dezoito'],
    [17n, 'dezassete'],
    [16n, 'dezasseis'],
    [15n, 'quinze'],
    [14n, 'catorze'],
    [13n, 'treze'],
    [12n, 'doze'],
    [11n, 'onze'],
    [10n, 'dez'],
    [9n, 'nove'],
    [8n, 'oito'],
    [7n, 'sete'],
    [6n, 'seis'],
    [5n, 'cinco'],
    [4n, 'quatro'],
    [3n, 'três'],
    [2n, 'dois'],
    [1n, 'um'],
    [0n, 'zero']
  ]

  hundreds = {
    1: 'cento',
    2: 'duzentos',
    3: 'trezentos',
    4: 'quatrocentos',
    5: 'quinhentos',
    6: 'seiscentos',
    7: 'setecentos',
    8: 'oitocentos',
    9: 'novecentos'
  }

  // Pre-compiled regex patterns for postClean - avoid recompilation
  static POSTCLEAN_REGEX = / e (.*entos?) (?=.*e)/g

  finalizeWords (words) {
    return words.replaceAll(Portuguese.POSTCLEAN_REGEX, ' $1 ')
  }

  /**
   * Merges two adjacent word-number pairs according to Portuguese grammar rules.
   *
   * Portuguese-specific rules:
   * - Implicit "um": `mergeScales({ 'um': 1n }, { 'mil': 1000n })` → `{ 'mil': 1000n }`
   * - "e" (and) between most combinations: `mergeScales({ 'vinte': 20n }, { 'três': 3n })` → `{ 'vinte e três': 23n }`
   * - Special handling: "cem" (100) becomes "cento" when followed by non-thousands
   * - Gender-aware hundreds: "duzentos", "trezentos", etc.
   * - Million pluralization: "milhões" instead of "milhão" when coefficient > 1
   * - Post-processing with postClean() to normalize word flow
   *
   * @param {Object} current The left operand as `{ word: BigInt }`.
   * @param {Object} next The right operand as `{ word: BigInt }`.
   * @returns {Object} Merged pair with combined word and resulting numeric value.
   *
   * @example
   * mergeScales({ 'um': 1n }, { 'mil': 1000n }); // { 'mil': 1000n }
   * mergeScales({ 'vinte': 20n }, { 'dois': 2n }); // { 'vinte e dois': 22n }
   */
  mergeScales (current, next) {
    // Extract words and numeric values
    let cText = Object.keys(current)[0]
    let nText = Object.keys(next)[0]
    const cNumber = Object.values(current)[0] // BigInt
    const nNumber = Object.values(next)[0] // BigInt

    // Implicit "um": omit before millions ("um milhão" → "milhão")
    if (cNumber === 1n) {
      if (nNumber < 1_000_000n) return { [nText]: nNumber }
      cText = 'um'
    } else if (cNumber === 100n && nNumber % 1000n !== 0n) {
      // Special handling: "cem" (100) becomes "cento" when followed by non-thousands
      cText = 'cento'
    }

    if (nNumber < cNumber) {
      return { [`${cText} e ${nText}`]: cNumber + nNumber }
    }

    // Handle "milião" -> "milhão" conversion
    if (nText === 'milião') nText = 'milhão'

    // Pluralization logic for large numbers
    if (cNumber > 1n) {
      if (nNumber % 1_000_000_000n === 0n) {
        nText = nText.replace('bilião', 'biliões')
      } else if (nNumber % 1_000_000n === 0n) {
        nText = nText.replace('milhão', 'milhões')
      }
    }

    if (nNumber === 100n) {
      cText = this.hundreds[cNumber]
      return { [`${cText}`]: cNumber * nNumber }
    }

    return { [`${cText} ${nText}`]: cNumber * nNumber }
  }
}
