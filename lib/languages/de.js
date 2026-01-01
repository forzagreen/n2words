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

  /** Merges scale components with German compound formation and reversal. */
  combineWordSets (currentPair, nextPair) {
    let currentWord = Object.keys(currentPair)[0]
    let nextWord = Object.keys(nextPair)[0]
    const currentNumber = Object.values(currentPair)[0]
    const nextNumber = Object.values(nextPair)[0]

    // Handle form of 1: "eins" → "ein(e)" in certain contexts
    if (currentNumber === 1n) {
      if (nextNumber === 100n || nextNumber === 1000n) {
        return { [`ein${nextWord}`]: nextNumber }
      }
      if (nextNumber < 1_000_000n) {
        return nextPair
      }
      currentWord = 'eine'
    }

    if (nextNumber > currentNumber) {
      // Multiply: apply pluralization rules for millions
      if (nextNumber >= 1_000_000n) {
        if (currentNumber > 1n) {
          nextWord += nextWord.at(-1) === 'e' ? 'n' : 'en'
        }
        currentWord += ' '
      }
      return { [`${currentWord}${nextWord}`]: currentNumber * nextNumber }
    }

    // Add: handle special case of tens + units
    if (nextNumber < 10n && currentNumber > 10n && currentNumber < 100n) {
      // German reverses tens and units (einundzwanzig = one and twenty)
      if (nextNumber === 1n) {
        nextWord = 'ein'
      }
      const temp = nextWord
      nextWord = currentWord
      currentWord = `${temp}und`
    } else if (currentNumber >= 1_000_000n) {
      currentWord += ' '
    }

    return { [`${currentWord}${nextWord}`]: currentNumber + nextNumber }
  }
}
