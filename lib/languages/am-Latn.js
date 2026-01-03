import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Amharic Latin language converter.
 *
 * Romanized (Latin script) version of Amharic numbers.
 *
 * Supports:
 * - Latin/ASCII romanization of Amharic numerals
 * - Space-separated word composition
 * - Teens formed with "asra" prefix
 * - Standard short scale (million, billion)
 */
export class AmharicLatin extends GreedyScaleLanguage {
  negativeWord = 'asitegna'
  zeroWord = 'zero'
  decimalSeparatorWord = 'netib'
  usePerDigitDecimals = true

  scaleWords = [
    [1_000_000_000n, 'billiyon'],
    [1_000_000n, 'miliyon'],
    [1000n, 'shi'],
    [100n, 'meto'],
    [90n, 'zetena'],
    [80n, 'semanya'],
    [70n, 'seba'],
    [60n, 'silsa'],
    [50n, 'hamsa'],
    [40n, 'arba'],
    [30n, 'selasa'],
    [20n, 'haya'],
    [19n, 'asra zeteny'],
    [18n, 'asra siment'],
    [17n, 'asra sebat'],
    [16n, 'asra siddist'],
    [15n, 'asra amist'],
    [14n, 'asra arat'],
    [13n, 'asra sost'],
    [12n, 'asra hulet'],
    [11n, 'asra and'],
    [10n, 'asir'],
    [9n, 'zeteny'],
    [8n, 'siment'],
    [7n, 'sebat'],
    [6n, 'siddist'],
    [5n, 'amist'],
    [4n, 'arat'],
    [3n, 'sost'],
    [2n, 'hulet'],
    [1n, 'and'],
    [0n, 'zero']
  ]

  /**
   * Combines two adjacent word-sets according to Amharic grammar.
   *
   * Amharic uses simple space-separated composition:
   * - Tens + units: space (haya and = 21)
   * - Hundreds: multiplier + meto (hulet meto = 200)
   */
  combineWordSets (preceding, following) {
    const [[precedingWord, precedingValue]] = Object.entries(preceding)
    const [[followingWord, followingValue]] = Object.entries(following)

    // Handle implicit one for small numbers (0-9) - drops the "one" prefix
    if (precedingValue === 1n && followingValue < 100n) {
      return following
    }

    // Multiplying (crossing scale boundary)
    if (followingValue > precedingValue) {
      return { [`${precedingWord} ${followingWord}`]: precedingValue * followingValue }
    }

    // Adding (same magnitude) - simple space separation
    return { [`${precedingWord} ${followingWord}`]: precedingValue + followingValue }
  }
}
