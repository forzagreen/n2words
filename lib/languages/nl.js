import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Dutch language converter.
 *
 * Supports:
 * - Optional "en" (and) separator for tens
 * - Optional comma before hundreds
 * - Compound word formation without hyphenation
 */
export class Dutch extends GreedyScaleLanguage {
  negativeWord = 'min'
  decimalSeparatorWord = 'komma'
  zeroWord = 'nul'

  scaleWords = [
    [1_000_000_000_000_000_000_000_000_000n, 'quadriljard'],
    [1_000_000_000_000_000_000_000_000n, 'quadriljoen'],
    [1_000_000_000_000_000_000_000n, 'triljard'],
    [1_000_000_000_000_000_000n, 'triljoen'],
    [1_000_000_000_000_000n, 'biljard'],
    [1_000_000_000_000n, 'biljoen'],
    [1_000_000_000n, 'miljard'],
    [1_000_000n, 'miljoen'],
    [1000n, 'duizend'],
    [100n, 'honderd'],
    [90n, 'negentig'],
    [80n, 'tachtig'],
    [70n, 'zeventig'],
    [60n, 'zestig'],
    [50n, 'vijftig'],
    [40n, 'veertig'],
    [30n, 'dertig'],
    [20n, 'twintig'],
    [19n, 'negentien'],
    [18n, 'achttien'],
    [17n, 'zeventien'],
    [16n, 'zestien'],
    [15n, 'vijftien'],
    [14n, 'veertien'],
    [13n, 'dertien'],
    [12n, 'twaalf'],
    [11n, 'elf'],
    [10n, 'tien'],
    [9n, 'negen'],
    [8n, 'acht'],
    [7n, 'zeven'],
    [6n, 'zes'],
    [5n, 'vijf'],
    [4n, 'vier'],
    [3n, 'drie'],
    [2n, 'twee'],
    [1n, 'één'],
    [0n, 'nul']
  ]

  constructor (options = {}) {
    super()

    this.setOptions({
      includeOptionalAnd: false,
      noHundredPairing: false,
      accentOne: true
    }, options)

    if (!this.options.accentOne) {
      this.scaleWords[this.scaleWords.length - 2][1] = 'een'
    }
  }

  /** Combines two word-sets according to Dutch grammar rules. */
  combineWordSets (preceding, following) {
    let precedingWord = Object.keys(preceding)[0]
    let followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0] // BigInt
    const followingValue = Object.values(following)[0] // BigInt

    // Implicit "een": omit before large multipliers ("miljoen" not "een miljoen")
    if (precedingValue === 1n) {
      if (followingValue < 1_000_000n) {
        return following
      }
      precedingWord = this.options.accentOne ? 'één' : 'een'
    }

    // Handle multiplication and spacing
    if (followingValue > precedingValue) {
      let hadSpace = false
      // Large scale words (millions+): add space before multiplier
      if (followingValue >= 1_000_000n) {
        precedingWord += ' '
        hadSpace = true
      } else if (followingValue > 100n) {
        // Hundreds and above: add space after multiplier
        followingWord += ' '
        hadSpace = true
      }
      // Convert 'één' to 'een' in compounds (when no space or accentOne disabled)
      if (!hadSpace || !this.options.accentOne) {
        precedingWord = precedingWord.replace(/één/g, 'een')
        followingWord = followingWord.replace(/één/g, 'een')
      }
      return { [`${precedingWord}${followingWord}`]: precedingValue * followingValue }
    }

    // Track if we're adding a space (which keeps words separate)
    let hasSpace = false

    if (followingValue < 10n && precedingValue > 10n && precedingValue < 100n) {
      const temporary = followingWord
      followingWord = precedingWord
      const andTxt = temporary.endsWith('e') ? 'ën' : 'en'
      precedingWord = `${temporary}${andTxt}`
    } else if (followingValue < 13n && precedingValue < 1000n && this.options.includeOptionalAnd) {
      precedingWord = `${precedingWord}en`
    } else if (followingValue < 13n && precedingValue >= 1000n && this.options.includeOptionalAnd) {
      followingWord = ` en ${followingWord}`
      hasSpace = true
    } else if (precedingValue >= 1_000_000n) {
      precedingWord += ' '
      hasSpace = true
    } else if (precedingValue === 1000n) {
      precedingWord += ' '
      hasSpace = true
    }

    // Convert 'één' to 'een' in direct compounds (no space)
    // Keep 'één' only if there's a space AND accentOne=true
    if (!hasSpace) {
      precedingWord = precedingWord.replace(/één/g, 'een')
      followingWord = followingWord.replace(/één/g, 'een')
    } else if (!this.options.accentOne) {
      precedingWord = precedingWord.replace(/één/g, 'een')
      followingWord = followingWord.replace(/één/g, 'een')
    }

    return { [`${precedingWord}${followingWord}`]: precedingValue + followingValue }
  }

  integerToWords (integerPart) {
    if (integerPart >= 1100n && integerPart < 10_000n && !this.options.noHundredPairing) {
      const high = integerPart / 100n
      const low = integerPart % 100n
      if (high % 10n !== 0n) {
        let result = super.integerToWords(high) + 'honderd'
        if (low) {
          result +=
            (this.options.includeOptionalAnd ? ' en ' : ' ') + super.integerToWords(low)
        }
        return result
      }
    }
    return super.integerToWords(integerPart)
  }
}
