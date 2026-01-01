import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * English language converter.
 *
 * Supports:
 * - Hyphenated compounds (e.g., "twenty-three")
 * - "and" after hundreds (e.g., "one hundred and one")
 * - Numbers up to octillions
 */
export class English extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  scaleWords = [
    [1_000_000_000_000_000_000_000_000_000n, 'octillion'],
    [1_000_000_000_000_000_000_000_000n, 'septillion'],
    [1_000_000_000_000_000_000_000n, 'sextillion'],
    [1_000_000_000_000_000_000n, 'quintillion'],
    [1_000_000_000_000_000n, 'quadrillion'],
    [1_000_000_000_000n, 'trillion'],
    [1_000_000_000n, 'billion'],
    [1_000_000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [90n, 'ninety'],
    [80n, 'eighty'],
    [70n, 'seventy'],
    [60n, 'sixty'],
    [50n, 'fifty'],
    [40n, 'forty'],
    [30n, 'thirty'],
    [20n, 'twenty'],
    [19n, 'nineteen'],
    [18n, 'eighteen'],
    [17n, 'seventeen'],
    [16n, 'sixteen'],
    [15n, 'fifteen'],
    [14n, 'fourteen'],
    [13n, 'thirteen'],
    [12n, 'twelve'],
    [11n, 'eleven'],
    [10n, 'ten'],
    [9n, 'nine'],
    [8n, 'eight'],
    [7n, 'seven'],
    [6n, 'six'],
    [5n, 'five'],
    [4n, 'four'],
    [3n, 'three'],
    [2n, 'two'],
    [1n, 'one'],
    [0n, 'zero']
  ]

  /** Combines two word-sets with English hyphenation and "and" rules. */
  combineWordSets (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const leftNumber = Object.values(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const rightNumber = Object.values(rightPair)[0]

    // Rule 1: Implicit "one" - omit when multiplying ("one hundred" → "hundred")
    if (leftNumber === 1n && rightNumber < 100n) {
      return { [rightWord]: rightNumber }
    }

    // Rule 2: Hyphenate compounds under 100 ("twenty-three")
    if (leftNumber < 100n && leftNumber > rightNumber) {
      return { [`${leftWord}-${rightWord}`]: leftNumber + rightNumber }
    }

    // Rule 3: Add "and" before units after hundreds ("one hundred and one")
    if (leftNumber >= 100n && rightNumber < 100n) {
      return { [`${leftWord} and ${rightWord}`]: leftNumber + rightNumber }
    }

    // Rule 4: Multiply when right > left ("one thousand")
    if (rightNumber > leftNumber) {
      return { [`${leftWord} ${rightWord}`]: leftNumber * rightNumber }
    }

    return { [`${leftWord} ${rightWord}`]: leftNumber + rightNumber }
  }
}
