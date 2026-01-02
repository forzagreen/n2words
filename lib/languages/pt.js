import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * (European) Portuguese language converter.
 *
 * Supports:
 * - Gender-aware hundreds (duzentos, trezentos)
 * - "e" (and) conjunction for number combinations
 * - Post-processing to normalize word flow
 */
export class Portuguese extends GreedyScaleLanguage {
  negativeWord = 'menos'
  decimalSeparatorWord = 'vírgula'
  zeroWord = 'zero'

  scaleWords = [
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

  hundredsWords = {
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

  /** Combines two word-sets according to Portuguese grammar rules. */
  combineWordSets (preceding, following) {
    // Extract words and numeric values
    let precedingWord = Object.keys(preceding)[0]
    let followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0] // BigInt
    const followingValue = Object.values(following)[0] // BigInt

    // Implicit "um": omit before millions ("um milhão" → "milhão")
    if (precedingValue === 1n) {
      if (followingValue < 1_000_000n) return { [followingWord]: followingValue }
      precedingWord = 'um'
    } else if (precedingValue === 100n && followingValue % 1000n !== 0n) {
      // Special handling: "cem" (100) becomes "cento" when followed by non-thousands
      precedingWord = 'cento'
    }

    if (followingValue < precedingValue) {
      return { [`${precedingWord} e ${followingWord}`]: precedingValue + followingValue }
    }

    // Handle "milião" -> "milhão" conversion
    if (followingWord === 'milião') followingWord = 'milhão'

    // Pluralization logic for large numbers
    if (precedingValue > 1n) {
      if (followingValue % 1_000_000_000n === 0n) {
        followingWord = followingWord.replace('bilião', 'biliões')
      } else if (followingValue % 1_000_000n === 0n) {
        followingWord = followingWord.replace('milhão', 'milhões')
      }
    }

    if (followingValue === 100n) {
      precedingWord = this.hundredsWords[precedingValue]
      return { [`${precedingWord}`]: precedingValue * followingValue }
    }

    return { [`${precedingWord} ${followingWord}`]: precedingValue * followingValue }
  }
}
