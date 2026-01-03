import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Amharic language converter.
 *
 * Supports:
 * - Dual script output: Ge'ez (default) or Latin romanization
 * - Space-separated word composition
 * - Teens formed with "asra/አስራ" prefix
 * - Standard short scale (million, billion)
 *
 * Options:
 * - script: 'geez' (default) - Native Ge'ez script (አንድ, ሁለት, ሶስት)
 * - script: 'latin' - Romanized ASCII (and, hulet, sost)
 */
export class Amharic extends GreedyScaleLanguage {
  usePerDigitDecimals = true

  constructor (options = {}) {
    super()
    this.setOptions({ script: 'geez' }, options)

    if (this.options.script === 'latin') {
      this.negativeWord = 'asitegna'
      this.zeroWord = 'zero'
      this.decimalSeparatorWord = 'netib'
      this.scaleWords = [
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
    } else {
      // Default: Ge'ez script
      this.negativeWord = 'አሉታዊ'
      this.zeroWord = 'ዜሮ'
      this.decimalSeparatorWord = 'ነጥብ'
      this.scaleWords = [
        [1_000_000_000n, 'ቢሊዮን'],
        [1_000_000n, 'ሚሊዮን'],
        [1000n, 'ሺ'],
        [100n, 'መቶ'],
        [90n, 'ዘጠና'],
        [80n, 'ሰማንያ'],
        [70n, 'ሰባ'],
        [60n, 'ስልሳ'],
        [50n, 'ሃምሳ'],
        [40n, 'አርባ'],
        [30n, 'ሰላሳ'],
        [20n, 'ሃያ'],
        [19n, 'አስራ ዘጠኝ'],
        [18n, 'አስራ ስምንት'],
        [17n, 'አስራ ሰባት'],
        [16n, 'አስራ ስድስት'],
        [15n, 'አስራ አምስት'],
        [14n, 'አስራ አራት'],
        [13n, 'አስራ ሶስት'],
        [12n, 'አስራ ሁለት'],
        [11n, 'አስራ አንድ'],
        [10n, 'አስር'],
        [9n, 'ዘጠኝ'],
        [8n, 'ስምንት'],
        [7n, 'ሰባት'],
        [6n, 'ስድስት'],
        [5n, 'አምስት'],
        [4n, 'አራት'],
        [3n, 'ሶስት'],
        [2n, 'ሁለት'],
        [1n, 'አንድ'],
        [0n, 'ዜሮ']
      ]
    }
  }

  /**
   * Combines two adjacent word-sets according to Amharic grammar.
   *
   * Amharic uses simple space-separated composition:
   * - Tens + units: space (ሃያ አንድ = 21)
   * - Hundreds: multiplier + meto (ሁለት መቶ = 200)
   * - "and/አንድ" is optional before meto and shi but we include it for clarity
   */
  combineWordSets (preceding, following) {
    const precedingWord = Object.keys(preceding)[0]
    const followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0]
    const followingValue = Object.values(following)[0]

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
