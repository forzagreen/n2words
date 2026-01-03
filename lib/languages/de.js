import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * German language converter.
 *
 * Supports:
 * - Compound formation (no separators between words)
 * - Three forms of 1 (eins/ein/eine)
 * - Units-before-tens ordering (einundzwanzig = one and twenty)
 */
export class German extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'null'

  scaleWords = [
    [1_000_000_000_000_000_000_000_000_000n, 'Quadrilliarde'],
    [1_000_000_000_000_000_000_000_000n, 'Quadrillion'],
    [1_000_000_000_000_000_000_000n, 'Trilliarde'],
    [1_000_000_000_000_000_000n, 'Trillion'],
    [1_000_000_000_000_000n, 'Billiarde'],
    [1_000_000_000_000n, 'Billion'],
    [1_000_000_000n, 'Milliarde'],
    [1_000_000n, 'Million'],
    [1000n, 'tausend'],
    [100n, 'hundert'],
    [90n, 'neunzig'],
    [80n, 'achtzig'],
    [70n, 'siebzig'],
    [60n, 'sechzig'],
    [50n, 'fünfzig'],
    [40n, 'vierzig'],
    [30n, 'dreißig'],
    [20n, 'zwanzig'],
    [19n, 'neunzehn'],
    [18n, 'achtzehn'],
    [17n, 'siebzehn'],
    [16n, 'sechzehn'],
    [15n, 'fünfzehn'],
    [14n, 'vierzehn'],
    [13n, 'dreizehn'],
    [12n, 'zwölf'],
    [11n, 'elf'],
    [10n, 'zehn'],
    [9n, 'neun'],
    [8n, 'acht'],
    [7n, 'sieben'],
    [6n, 'sechs'],
    [5n, 'fünf'],
    [4n, 'vier'],
    [3n, 'drei'],
    [2n, 'zwei'],
    [1n, 'eins'],
    [0n, 'null']
  ]

  /** Combines two word-sets with German compound formation and reversal rules. */
  combineWordSets (preceding, following) {
    let [[precedingWord, precedingValue]] = Object.entries(preceding)
    let [[followingWord, followingValue]] = Object.entries(following)

    // Handle form of 1: "eins" → "ein(e)" in certain contexts
    if (precedingValue === 1n) {
      if (followingValue === 100n || followingValue === 1000n) {
        return { [`ein${followingWord}`]: followingValue }
      }
      if (followingValue < 1_000_000n) {
        return following
      }
      precedingWord = 'eine'
    }

    if (followingValue > precedingValue) {
      // Multiply: apply pluralization rules for millions
      if (followingValue >= 1_000_000n) {
        if (precedingValue > 1n) {
          followingWord += followingWord.at(-1) === 'e' ? 'n' : 'en'
        }
        precedingWord += ' '
      }
      return { [`${precedingWord}${followingWord}`]: precedingValue * followingValue }
    }

    // Add: handle special case of tens + units
    if (followingValue < 10n && precedingValue > 10n && precedingValue < 100n) {
      // German reverses tens and units (einundzwanzig = one and twenty)
      if (followingValue === 1n) {
        followingWord = 'ein'
      }
      const temp = followingWord
      followingWord = precedingWord
      precedingWord = `${temp}und`
    } else if (precedingValue >= 1_000_000n) {
      precedingWord += ' '
    }

    return { [`${precedingWord}${followingWord}`]: precedingValue + followingValue }
  }
}
