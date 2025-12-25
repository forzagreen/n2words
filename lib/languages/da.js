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

  scaleWordPairs = [
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

    this.options = this.mergeOptions({
      ordFlag: false
    }, options)
  }

  /** Merges scale components with Danish vigesimal and reversal rules. */
  mergeScales (current, next) {
    let cText = Object.keys(current)[0]
    let nText = Object.keys(next)[0]
    const cNumber = Object.values(current)[0] // BigInt (e.g., 1n, 100n, 1000n)
    const nNumber = Object.values(next)[0] // BigInt (e.g., magnitude level like 100n, 1000n)

    // Prepend "et" to hundreds and thousands (not "en") for proper Danish form
    if (nNumber === 100n || nNumber === 1000n) {
      next = { [`et${nText}`]: nNumber }
    }

    // Implicit '1' handling: omit '1' before most magnitudes (except millions/ordinals)
    if (cNumber === 1n) {
      if (nNumber < 1_000_000n || this.options.ordFlag) {
        return next // Just the magnitude word (e.g., "hundrede" not "en hundrede")
      }
      cText = 'en' // Explicit "en" (one) for millions and above
    }

    // Multiplication across magnitude boundaries
    if (nNumber > cNumber) {
      // Space for million+ (e.g., "en million", "to millioner")
      if (nNumber >= 1_000_000n) {
        cText += ' '
      }
      return { [`${cText}${nText}`]: cNumber * nNumber }
    }

    // Addition with separator rules:
    // "og" (and) for hundreds + smaller numbers
    if (cNumber >= 100n && cNumber < 1000n) {
      cText += ' og '
    } else if (cNumber >= 1000n && cNumber <= 100_000n) {
      // Special "e og" for thousands (e.g., "tusinde og tyve")
      cText += 'e og '
    }

    // Units-before-tens reversal (Danish vigesimal pattern):
    // For small units (< 10) with tens (10-99), swap order: "tre og tyve" (25)
    if (nNumber < 10n && cNumber > 10n && cNumber < 100n) {
      if (nNumber === 1n) {
        nText = 'en' // Convert 1 to "en" for vigesimal context
      }
      // Swap positions: units go after "og", tens go before
      const temporary = nText
      nText = cText
      cText = temporary + 'og'
    } else if (cNumber >= 1_000_000n) {
      // Space for large magnitudes (millions+)
      cText += ' '
    }

    return { [`${cText}${nText}`]: cNumber + nNumber }
  }
}
