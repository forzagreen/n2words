import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Filipino language converter.
 *
 * Supports:
 * - "ng" connectors between words
 * - Implicit "one" omission
 * - Special linkers for certain tens (e.g., "limampung")
 */
export class Filipino extends GreedyScaleLanguage {
  negativeWord = 'negatibo'
  decimalSeparatorWord = 'punto'
  zeroWord = 'zero'
  usePerDigitDecimals = true // Read decimals digit-by-digit

  scaleWords = [
    [1000000000000n, 'trilyong'],
    [1000000000n, 'milyong'],
    [1000000n, 'milyong'],
    [1000n, 'libong'],
    [100n, 'daang'],

    // Tens
    [90n, 'siyamnapu'],
    [80n, 'walumpu'],
    [70n, 'pitumpu'],
    [60n, 'animnapu'],
    [50n, 'limampu'],
    [40n, 'apatnapu'],
    [30n, 'tatlumpu'],
    [20n, 'dalawampu'],

    // Teens (must come before 10 to be matched first)
    [19n, 'labinsiyam'],
    [18n, 'labingwalo'],
    [17n, 'labimpito'],
    [16n, 'labinanum'],
    [15n, 'labinlima'],
    [14n, 'labinapat'],
    [13n, 'labintatlo'],
    [12n, 'labindalawa'],
    [11n, 'labinisa'],
    [10n, 'sampu'],

    // Ones
    [9n, 'siyam'],
    [8n, 'walo'],
    [7n, 'pito'],
    [6n, 'anim'],
    [5n, 'lima'],
    [4n, 'apat'],
    [3n, 'tatlo'],
    [2n, 'dalawa'],
    [1n, 'isa']
  ]

  /** Combines two word-sets with Filipino connector and linker rules. */
  combineWordSets (preceding, following) {
    const [[precedingWord, precedingValue]] = Object.entries(preceding)
    const [[followingWord, followingValue]] = Object.entries(following)

    // Don't merge zero with anything - just return the non-zero value
    if (precedingValue === 0n) {
      return following
    }
    if (followingValue === 0n) {
      return preceding
    }

    // Implicit "one" - omit when adding with values < 100
    if (precedingValue === 1n && followingValue < 100n) {
      return following
    }

    // Multiply when following is a scale word AND following > preceding
    // Use "ng" connector for Filipino, but consonant-ending words use " na "
    if (followingValue > precedingValue && followingValue >= 100n) {
      // Words ending in consonants (not vowels) use " na " instead of "ng"
      const vowels = ['a', 'e', 'i', 'o', 'u']
      const lastChar = precedingWord[precedingWord.length - 1]
      if (!vowels.includes(lastChar)) {
        return {
          [`${precedingWord} na ${followingWord}`]: precedingValue * followingValue
        }
      }
      // Vowel-ending words add "ng"
      return {
        [`${precedingWord}ng ${followingWord}`]: precedingValue * followingValue
      }
    }

    // Special Filipino rule: certain tens words take "-ng" linker when followed by ones
    // Only limampu (50) confirmed to use this pattern
    if (precedingValue >= 10n && precedingValue < 100n && followingValue >= 1n && followingValue < 10n) {
      const tensWithNg = ['limampu']
      if (tensWithNg.includes(precedingWord)) {
        return {
          [`${precedingWord}ng ${followingWord}`]: precedingValue + followingValue
        }
      }
    }

    // Default: space for addition
    return {
      [`${precedingWord} ${followingWord}`]: precedingValue + followingValue
    }
  }
}
