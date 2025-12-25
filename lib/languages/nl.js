import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Dutch language converter.
 *
 * Features:
 * - Optional "en" (and) separator for tens (includeOptionalAnd)
 * - Optional comma before hundreds (noHundredPairs)
 * - Compound word formation without hyphenation
 */
export class Dutch extends GreedyScaleLanguage {
  negativeWord = 'min'
  decimalSeparatorWord = 'komma'
  zeroWord = 'nul'

  scaleWordPairs = [
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

  /**
   * Initializes the Dutch converter with language-specific options.
   *
   * @param {DutchOptions} [options={}] Configuration options.
   */
  constructor (options = {}) {
    super(options)

    this.options = {
      ...{
        includeOptionalAnd: false,
        noHundredPairs: false,
        accentOne: true
      },
      ...options
    }

    if (!this.options.accentOne) {
      this.scaleWordPairs[this.scaleWordPairs.length - 2][1] = 'een'
    }
  }

  /**
   * Merges two adjacent word-number pairs according to Dutch grammar rules.
   *
   * Dutch-specific rules:
   * - Implicit "één": `mergeScales({ 'één': 1n }, { 'duizend': 1000n })` → `{ 'duizend': 1000n }`
   * - Reversed digit order for tens + units: `mergeScales({ 'twintig': 20n }, { 'één': 1n })` → `{ 'ééntwintig': 21n }`
   * - Optional "en" separator based on includeOptionalAnd option
   * - Compound words without separators for most combinations
   * - Converts 'één' to 'een' in compound words (no accent in compounds)
   * - Space separators for large numbers (millions+)
   *
   * @param {Object} current The left operand as `{ word: BigInt }`.
   * @param {Object} next The right operand as `{ word: BigInt }`.
   * @returns {Object} Merged pair with combined word and resulting numeric value.
   *
   * @example
   * mergeScales({ 'één': 1n }, { 'duizend': 1000n }); // { 'duizend': 1000n }
   * mergeScales({ 'twintig': 20n }, { 'drie': 3n }); // { 'drieentwintig': 23n }
   */
  mergeScales (current, next) {
    let cText = Object.keys(current)[0]
    let nText = Object.keys(next)[0]
    const cNumber = Object.values(current)[0] // BigInt
    const nNumber = Object.values(next)[0] // BigInt

    // Implicit "een": omit before large multipliers ("miljoen" not "een miljoen")
    if (cNumber === 1n) {
      if (nNumber < 1_000_000n) {
        return next
      }
      cText = this.options.accentOne ? 'één' : 'een'
    }

    // Handle multiplication and spacing
    if (nNumber > cNumber) {
      let hadSpace = false
      // Large scale words (millions+): add space before multiplier
      if (nNumber >= 1_000_000n) {
        cText += ' '
        hadSpace = true
      } else if (nNumber > 100n) {
        // Hundreds and above: add space after multiplier
        nText += ' '
        hadSpace = true
      }
      // Convert 'één' to 'een' in compounds (when no space or accentOne disabled)
      if (!hadSpace || !this.options.accentOne) {
        cText = cText.replace(/één/g, 'een')
        nText = nText.replace(/één/g, 'een')
      }
      return { [`${cText}${nText}`]: cNumber * nNumber }
    }

    // Track if we're adding a space (which keeps words separate)
    let hasSpace = false

    if (nNumber < 10n && cNumber > 10n && cNumber < 100n) {
      const temporary = nText
      nText = cText
      const andTxt = temporary.endsWith('e') ? 'ën' : 'en'
      cText = `${temporary}${andTxt}`
    } else if (nNumber < 13n && cNumber < 1000n && this.options.includeOptionalAnd) {
      cText = `${cText}en`
    } else if (nNumber < 13n && cNumber >= 1000n && this.options.includeOptionalAnd) {
      nText = ` en ${nText}`
      hasSpace = true
    } else if (cNumber >= 1_000_000n) {
      cText += ' '
      hasSpace = true
    } else if (cNumber === 1000n) {
      cText += ' '
      hasSpace = true
    }

    // Convert 'één' to 'een' in direct compounds (no space)
    // Keep 'één' only if there's a space AND accentOne=true
    if (!hasSpace) {
      cText = cText.replace(/één/g, 'een')
      nText = nText.replace(/één/g, 'een')
    } else if (!this.options.accentOne) {
      cText = cText.replace(/één/g, 'een')
      nText = nText.replace(/één/g, 'een')
    }

    return { [`${cText}${nText}`]: cNumber + nNumber }
  }

  convertWholePart (value) {
    if (value >= 1100n && value < 10_000n && !this.options.noHundredPairs) {
      const high = value / 100n
      const low = value % 100n
      if (high % 10n !== 0n) {
        let result = super.convertWholePart(high) + 'honderd'
        if (low) {
          result +=
            (this.options.includeOptionalAnd ? ' en ' : ' ') + super.convertWholePart(low)
        }
        return result
      }
    }
    return super.convertWholePart(value)
  }
}
