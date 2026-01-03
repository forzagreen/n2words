import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Finnish language converter.
 *
 * Supports:
 * - Compound numbers without spaces (kaksikymmentäkolme = 23)
 * - Teens with "-toista" suffix (yksitoista = 11)
 * - Long scale (miljoona, miljardi, biljoona)
 * - Omission of "yksi" before sata/tuhat but not before millions+
 */
export class Finnish extends GreedyScaleLanguage {
  negativeWord = 'miinus'
  decimalSeparatorWord = 'pilkku'
  zeroWord = 'nolla'
  usePerDigitDecimals = true

  scaleWords = [
    [1_000_000_000_000_000_000n, 'triljoona'],
    [1_000_000_000_000n, 'biljoona'],
    [1_000_000_000n, 'miljardi'],
    [1_000_000n, 'miljoona'],
    [1000n, 'tuhat'],
    [100n, 'sata'],
    [90n, 'yhdeksänkymmentä'],
    [80n, 'kahdeksankymmentä'],
    [70n, 'seitsemänkymmentä'],
    [60n, 'kuusikymmentä'],
    [50n, 'viisikymmentä'],
    [40n, 'neljäkymmentä'],
    [30n, 'kolmekymmentä'],
    [20n, 'kaksikymmentä'],
    [19n, 'yhdeksäntoista'],
    [18n, 'kahdeksantoista'],
    [17n, 'seitsemäntoista'],
    [16n, 'kuusitoista'],
    [15n, 'viisitoista'],
    [14n, 'neljätoista'],
    [13n, 'kolmetoista'],
    [12n, 'kaksitoista'],
    [11n, 'yksitoista'],
    [10n, 'kymmenen'],
    [9n, 'yhdeksän'],
    [8n, 'kahdeksan'],
    [7n, 'seitsemän'],
    [6n, 'kuusi'],
    [5n, 'viisi'],
    [4n, 'neljä'],
    [3n, 'kolme'],
    [2n, 'kaksi'],
    [1n, 'yksi'],
    [0n, 'nolla']
  ]

  /**
   * Combines two adjacent word-sets according to Finnish grammar.
   *
   * Finnish compound number rules:
   * - Tens + units: no space (kaksikymmentäkolme)
   * - Omit "yksi" before sata (100) and tuhat (1000)
   * - Keep "yksi" before miljoona and larger scales
   * - Space between larger components
   */
  combineWordSets (preceding, following) {
    const [[precedingWord, precedingValue]] = Object.entries(preceding)
    const [[followingWord, followingValue]] = Object.entries(following)

    // Handle implicit "yksi" for small numbers (0-99)
    // This handles zero: { 'yksi': 1n } + { 'nolla': 0n } → { 'nolla': 0n }
    if (precedingValue === 1n && followingValue < 100n) {
      return following
    }

    // Multiplying (crossing scale boundary)
    if (followingValue > precedingValue) {
      // Omit "yksi" before sata and tuhat
      if (precedingValue === 1n && (followingValue === 100n || followingValue === 1000n)) {
        return { [followingWord]: followingValue }
      }
      // Keep "yksi" before miljoona and larger (yksi miljoona, yksi miljardi)
      return { [`${precedingWord} ${followingWord}`]: precedingValue * followingValue }
    }

    // Adding (same magnitude)
    const resultValue = precedingValue + followingValue

    // Tens + units: compound without space (kaksikymmentäkolme)
    if (precedingValue >= 20n && precedingValue <= 90n && followingValue < 10n) {
      return { [`${precedingWord}${followingWord}`]: resultValue }
    }

    // Hundreds + smaller: space separated
    // Thousands + smaller: space separated
    return { [`${precedingWord} ${followingWord}`]: resultValue }
  }
}
