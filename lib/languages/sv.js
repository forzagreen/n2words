import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Swedish language converter.
 *
 * Supports:
 * - Hyphenation for compound tens (tjugo-tre)
 * - "och" (and) after hundreds
 * - Space-separated larger composites
 */
export class Swedish extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'noll'
  wordSeparator = ' '

  scaleWords = [
    [1_000_000_000_000_000_000_000_000_000n, 'kvadriljon'],
    [1_000_000_000_000_000_000_000_000n, 'triljon'],
    [1_000_000_000_000_000_000_000n, 'biljon'],
    [1_000_000_000_000_000_000n, 'miljard'],
    [1_000_000_000_000n, 'biljon'],
    [1_000_000_000n, 'miljard'],
    [1_000_000n, 'miljon'],
    [1000n, 'tusen'],
    [100n, 'hundra'],
    [90n, 'nittio'],
    [80n, 'åttio'],
    [70n, 'sjuttio'],
    [60n, 'sextio'],
    [50n, 'femtio'],
    [40n, 'fyrtio'],
    [30n, 'trettio'],
    [20n, 'tjugo'],
    [19n, 'nitton'],
    [18n, 'arton'],
    [17n, 'sjutton'],
    [16n, 'sexton'],
    [15n, 'femton'],
    [14n, 'fjorton'],
    [13n, 'tretton'],
    [12n, 'tolv'],
    [11n, 'elva'],
    [10n, 'tio'],
    [9n, 'nio'],
    [8n, 'åtta'],
    [7n, 'sju'],
    [6n, 'sex'],
    [5n, 'fem'],
    [4n, 'fyra'],
    [3n, 'tre'],
    [2n, 'två'],
    [1n, 'ett'],
    [0n, 'noll']
  ]

  /** Combines two word-sets according to Swedish grammar rules. */
  combineWordSets (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const leftNumber = Object.values(leftPair)[0]
    const rightNumber = Object.values(rightPair)[0]

    if (leftNumber === 1n && rightNumber < 100n) {
      return rightPair
    }

    // Omit 'ett' before 'hundra' and 'tusen'
    if (leftNumber === 1n && (rightNumber === 100n || rightNumber === 1000n)) {
      return rightPair
    }

    if (leftNumber < 100n && leftNumber > rightNumber) {
      return { [`${leftWord}-${rightWord}`]: leftNumber + rightNumber }
    }

    if (leftNumber >= 100n && rightNumber < 100n) {
      return { [`${leftWord} och ${rightWord}`]: leftNumber + rightNumber }
    }

    if (rightNumber > leftNumber) {
      if (leftNumber === 1n && rightNumber >= 1_000_000n) {
        return { [`en ${rightWord}`]: leftNumber * rightNumber }
      }
      return { [`${leftWord} ${rightWord}`]: leftNumber * rightNumber }
    }

    return { [`${leftWord} ${rightWord}`]: leftNumber + rightNumber }
  }
}
