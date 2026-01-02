import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Danish language converter.
 *
 * Supports:
 * - Vigesimal (base-20) number system
 * - Units-before-tens ordering (e.g., "tre-og-tyve" = 23)
 * - Optional ordinal numbers via ordFlag option
 */
export class Danish extends GreedyScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'nul'

  scaleWords = [
    [1_000_000_000_000_000_000_000_000_000n, 'quadrillarder'],
    [1_000_000_000_000_000_000_000_000n, 'quadrillioner'],
    [1_000_000_000_000_000_000_000n, 'trillarder'],
    [1_000_000_000_000_000_000n, 'trillioner'],
    [1_000_000_000_000_000n, 'billarder'],
    [1_000_000_000_000n, 'billioner'],
    [1_000_000_000n, 'millarder'],
    [1_000_000n, 'millioner'],
    [1000n, 'tusind'],
    [100n, 'hundrede'],
    [90n, 'halvfems'],
    [80n, 'firs'],
    [70n, 'halvfjerds'],
    [60n, 'treds'],
    [50n, 'halvtreds'],
    [40n, 'fyrre'],
    [30n, 'tredive'],
    [20n, 'tyve'],
    [19n, 'nitten'],
    [18n, 'atten'],
    [17n, 'sytten'],
    [16n, 'seksten'],
    [15n, 'femten'],
    [14n, 'fjorten'],
    [13n, 'tretten'],
    [12n, 'tolv'],
    [11n, 'elleve'],
    [10n, 'ti'],
    [9n, 'ni'],
    [8n, 'otte'],
    [7n, 'syv'],
    [6n, 'seks'],
    [5n, 'fem'],
    [4n, 'fire'],
    [3n, 'tre'],
    [2n, 'to'],
    [1n, 'et'],
    [0n, 'nul']
  ]

  constructor (options = {}) {
    super()

    this.setOptions({
      ordFlag: false
    }, options)
  }

  /** Combines two word-sets with Danish vigesimal and reversal rules. */
  combineWordSets (preceding, following) {
    let precedingWord = Object.keys(preceding)[0]
    let followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0] // BigInt (e.g., 1n, 100n, 1000n)
    const followingValue = Object.values(following)[0] // BigInt (e.g., magnitude level like 100n, 1000n)

    // Prepend "et" to hundreds and thousands (not "en") for proper Danish form
    if (followingValue === 100n || followingValue === 1000n) {
      following = { [`et${followingWord}`]: followingValue }
    }

    // Implicit '1' handling: omit '1' before most magnitudes (except millions/ordinals)
    if (precedingValue === 1n) {
      if (followingValue < 1_000_000n || this.options.ordFlag) {
        return following // Just the magnitude word (e.g., "hundrede" not "en hundrede")
      }
      precedingWord = 'en' // Explicit "en" (one) for millions and above
    }

    // Multiplication across magnitude boundaries
    if (followingValue > precedingValue) {
      // Space for million+ (e.g., "en million", "to millioner")
      if (followingValue >= 1_000_000n) {
        precedingWord += ' '
      }
      return { [`${precedingWord}${followingWord}`]: precedingValue * followingValue }
    }

    // Addition with separator rules:
    // "og" (and) for hundreds + smaller numbers
    if (precedingValue >= 100n && precedingValue < 1000n) {
      precedingWord += ' og '
    } else if (precedingValue >= 1000n && precedingValue <= 100_000n) {
      // Special "e og" for thousands (e.g., "tusinde og tyve")
      precedingWord += 'e og '
    }

    // Units-before-tens reversal (Danish vigesimal pattern):
    // For small units (< 10) with tens (10-99), swap order: "tre og tyve" (25)
    if (followingValue < 10n && precedingValue > 10n && precedingValue < 100n) {
      if (followingValue === 1n) {
        followingWord = 'en' // Convert 1 to "en" for vigesimal context
      }
      // Swap positions: units go after "og", tens go before
      const temporary = followingWord
      followingWord = precedingWord
      precedingWord = temporary + 'og'
    } else if (precedingValue >= 1_000_000n) {
      // Space for large magnitudes (millions+)
      precedingWord += ' '
    }

    return { [`${precedingWord}${followingWord}`]: precedingValue + followingValue }
  }
}
