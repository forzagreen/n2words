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
  combineWordSets (preceding, following) {
    const precedingWord = Object.keys(preceding)[0]
    const followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0]
    const followingValue = Object.values(following)[0]

    if (precedingValue === 1n && followingValue < 100n) {
      return following
    }

    // Omit 'ett' before 'hundra' and 'tusen'
    if (precedingValue === 1n && (followingValue === 100n || followingValue === 1000n)) {
      return following
    }

    if (precedingValue < 100n && precedingValue > followingValue) {
      return { [`${precedingWord}-${followingWord}`]: precedingValue + followingValue }
    }

    if (precedingValue >= 100n && followingValue < 100n) {
      return { [`${precedingWord} och ${followingWord}`]: precedingValue + followingValue }
    }

    if (followingValue > precedingValue) {
      if (precedingValue === 1n && followingValue >= 1_000_000n) {
        return { [`en ${followingWord}`]: precedingValue * followingValue }
      }
      return { [`${precedingWord} ${followingWord}`]: precedingValue * followingValue }
    }

    return { [`${precedingWord} ${followingWord}`]: precedingValue + followingValue }
  }
}
