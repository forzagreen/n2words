import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Amharic language converter.
 *
 * Native Ge'ez script (ግዕዝ) output for Amharic numbers.
 *
 * Supports:
 * - Ge'ez/Ethiopic script numerals (አንድ, ሁለት, ሶስት)
 * - Space-separated word composition
 * - Teens formed with "አስራ" prefix
 * - Standard short scale (million, billion)
 *
 * For Latin/romanized output, use AmharicLatinConverter (am-Latn).
 */
export class Amharic extends GreedyScaleLanguage {
  negativeWord = 'አሉታዊ'
  zeroWord = 'ዜሮ'
  decimalSeparatorWord = 'ነጥብ'
  usePerDigitDecimals = true

  scaleWords = [
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

  /**
   * Combines two adjacent word-sets according to Amharic grammar.
   *
   * Amharic uses simple space-separated composition:
   * - Tens + units: space (ሃያ አንድ = 21)
   * - Hundreds: multiplier + meto (ሁለት መቶ = 200)
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
