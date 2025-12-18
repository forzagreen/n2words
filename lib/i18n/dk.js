import CardMatchLanguage from '../classes/card-match-language.js'

/**
 * Danish language converter.
 *
 * CardMatchLanguage with Danish-specific extensions:
 * - Unique vigesimal (base-20) number system for 50-90
 * - Special composition rules ("og" for "and" between units and tens)
 * - Reverse digit order (e.g., "fem-og-tyve" = five-and-twenty = 25)
 * - Support for ordinal numbers via ordFlag option
 *
 * Key Features:
 * - Vigesimal tens: halvtreds (50), treds (60), halvfjerds (70), firs (80), halvfems (90)
 * - Units-before-tens pattern (e.g., "tre-og-tyve" = 23)
 * - "et" prefix for hundreds/thousands (not "en")
 * - Optional ordinal number conversion via ordFlag option
 * - Inline merge logic tailored for Danish ordering
 */
export class Danish extends CardMatchLanguage {
  negativeWord = 'minus'

  separatorWord = 'komma'

  zero = 'nul'

  cards = [
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

  /**
   * Initializes the Danish converter with language-specific options.
   *
   * @param {Object} [options={}] Configuration options.
   * @param {boolean} [options.ordFlag=false] Enable ordinal number conversion.
   */
  constructor ({ ordFlag = false } = {}) {
    super()

    this.ordFlag = ordFlag
  }

  /**
   * Merges two adjacent word-number pairs according to Danish grammar rules.
   * Danish uses complex vigesimal (base-20) patterns and reverse digit ordering.
   *
   * Key Danish patterns:
   * - Vigesimal tens: halvtreds(50), treds(60), halvfjerds(70), firs(80), halvfems(90)
   * - Units-before-tens order with "og" (and): "tre-og-tyve" (3 and 20 = 25)
   * - "et" prefix for hundreds/thousands (not "en")
   * - Space separators for large magnitudes (≥ millions)
   * - Ordinal support via this.ordFlag
   *
   * @param {Object} current The left operand as `{ word: bigint }`.
   * @param {Object} next The right operand as `{ word: bigint }`.
   * @returns {Object} Merged pair with combined word and resulting number (bigint).
   */
  merge (current, next) {
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
      if (nNumber < 1_000_000n || this.ordFlag) {
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

/**
 * Converts a number to Danish cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see Danish class options).
 * @param {boolean} [options.ordFlag=false] Enable ordinal number conversion.
 * @returns {string} The number expressed in Danish words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(25); // 'femogtyve' (five-and-twenty)
 * floatToCardinal(50); // 'halvtreds' (half-third-times-twenty)
 */
export default function floatToCardinal (value, options = {}) {
  return new Danish(options).floatToCardinal(value)
}
