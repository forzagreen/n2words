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
    [1n, 'isa'],
    [0n, 'zero']
  ]

  /** Converts integer part with explicit zero handling. */
  integerToWords (integerPart) {
    // Handle zero explicitly
    if (integerPart === 0n) {
      return this.zeroWord
    }
    return super.integerToWords(integerPart)
  }

  /** Combines two word-sets with Filipino connector and linker rules. */
  combineWordSets (leftWordSet, rightWordSet) {
    const leftWord = Object.keys(leftWordSet)[0]
    const rightWord = Object.keys(rightWordSet)[0]
    const leftValue = Object.values(leftWordSet)[0]
    const rightValue = Object.values(rightWordSet)[0]

    // Don't merge zero with anything - just return the non-zero value
    if (leftValue === 0n) {
      return rightWordSet
    }
    if (rightValue === 0n) {
      return leftWordSet
    }

    // Implicit "one" - omit when adding with values < 100
    if (leftValue === 1n && rightValue < 100n) {
      return rightWordSet
    }

    // Multiply when right is a scale word AND right > left
    // Use "ng" connector for Filipino, but consonant-ending words use " na "
    if (rightValue > leftValue && rightValue >= 100n) {
      // Words ending in consonants (not vowels) use " na " instead of "ng"
      const vowels = ['a', 'e', 'i', 'o', 'u']
      const lastChar = leftWord[leftWord.length - 1]
      if (!vowels.includes(lastChar)) {
        return {
          [`${leftWord} na ${rightWord}`]: leftValue * rightValue
        }
      }
      // Vowel-ending words add "ng"
      return {
        [`${leftWord}ng ${rightWord}`]: leftValue * rightValue
      }
    }

    // Special Filipino rule: certain tens words take "-ng" linker when followed by ones
    // Only limampu (50) confirmed to use this pattern
    if (leftValue >= 10n && leftValue < 100n && rightValue >= 1n && rightValue < 10n) {
      const tensWithNg = ['limampu']
      if (tensWithNg.includes(leftWord)) {
        return {
          [`${leftWord}ng ${rightWord}`]: leftValue + rightValue
        }
      }
    }

    // Default: space for addition
    return {
      [`${leftWord} ${rightWord}`]: leftValue + rightValue
    }
  }
}
