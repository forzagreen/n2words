import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Hausa language converter.
 *
 * Supports:
 * - Authentic Boko orthography with ɗ (hooked d) and ' (glottal stop)
 * - Teens with "sha" connector (sha ɗaya = 11)
 * - Compound numbers with "da" connector (ashirin da ɗaya = 21)
 * - Arabic loanwords for tens (ashirin, talatin, arba'in, etc.)
 * - Standard short scale (miliyan, biliyan)
 */
export class Hausa extends GreedyScaleLanguage {
  negativeWord = 'babu'
  decimalSeparatorWord = 'digo'
  zeroWord = 'sifiri'
  usePerDigitDecimals = true

  scaleWords = [
    [1_000_000_000n, 'biliyan'],
    [1_000_000n, 'miliyan'],
    [1000n, 'dubu'],
    [100n, 'ɗari'],
    [90n, "tis'in"],
    [80n, 'tamanin'],
    [70n, "saba'in"],
    [60n, 'sittin'],
    [50n, 'hamsin'],
    [40n, "arba'in"],
    [30n, 'talatin'],
    [20n, 'ashirin'],
    [19n, 'sha tara'],
    [18n, 'sha takwas'],
    [17n, 'sha bakwai'],
    [16n, 'sha shida'],
    [15n, 'sha biyar'],
    [14n, 'sha huɗu'],
    [13n, 'sha uku'],
    [12n, 'sha biyu'],
    [11n, 'sha ɗaya'],
    [10n, 'goma'],
    [9n, 'tara'],
    [8n, 'takwas'],
    [7n, 'bakwai'],
    [6n, 'shida'],
    [5n, 'biyar'],
    [4n, 'huɗu'],
    [3n, 'uku'],
    [2n, 'biyu'],
    [1n, 'ɗaya'],
    [0n, 'sifiri']
  ]

  /**
   * Combines two adjacent word-sets according to Hausa grammar.
   *
   * Hausa number composition rules:
   * - Omit "ɗaya" before ɗari (100) and dubu (1000)
   * - Tens + units: use "da" connector (ashirin da ɗaya = 21)
   * - Other combinations: space separated
   */
  combineWordSets (preceding, following) {
    const [[precedingWord, precedingValue]] = Object.entries(preceding)
    const [[followingWord, followingValue]] = Object.entries(following)

    // Handle implicit one for small numbers (0-9)
    if (precedingValue === 1n && followingValue < 100n) {
      return following
    }

    // Multiplying (crossing scale boundary)
    if (followingValue > precedingValue) {
      // Omit "ɗaya" before ɗari and dubu
      if (precedingValue === 1n && (followingValue === 100n || followingValue === 1000n)) {
        return { [followingWord]: followingValue }
      }
      return { [`${precedingWord} ${followingWord}`]: precedingValue * followingValue }
    }

    // Adding (same magnitude)
    const resultValue = precedingValue + followingValue

    // Use "da" connector when adding units (1-9) to tens or hundreds
    if (followingValue >= 1n && followingValue <= 9n) {
      return { [`${precedingWord} da ${followingWord}`]: resultValue }
    }

    // Other combinations: space separated
    return { [`${precedingWord} ${followingWord}`]: resultValue }
  }
}
