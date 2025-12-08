import BaseLanguage from '../classes/base-language.js'

/**
 * Dutch language converter.
 *
 * Features:
 * - Optional "en" (and) separator for tens (includeOptionalAnd)
 * - Optional comma before hundreds (noHundredPairs)
 * - Compound word formation without hyphenation
 */
export class NL extends BaseLanguage {
  includeOptionalAnd
  noHundredPairs
  accentOne

  constructor (options) {
    options = Object.assign({
      negativeWord: 'min',
      separatorWord: 'komma',
      zero: 'nul',
      includeOptionalAnd: false,
      noHundredPairs: false,
      accentOne: false
    }, options)

    super(options, [
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
    ])

    this.includeOptionalAnd = options.includeOptionalAnd
    this.noHundredPairs = options.noHundredPairs
    this.accentOne = options.accentOne
  }

  merge (current, next) {
    let cText = Object.keys(current)[0]
    let nText = Object.keys(next)[0]
    const cNumber = Object.values(current)[0]  // BigInt
    const nNumber = Object.values(next)[0]     // BigInt

    // Implicit "een": omit before large multipliers ("miljoen" not "een miljoen")
    if (cNumber === 1n) {
      if (nNumber < 1_000_000n) {
        return next
      }
      cText = this.accentOne ? 'één' : 'een'
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
      if (!hadSpace || !this.accentOne) {
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
    } else if (nNumber < 13n && cNumber < 1000n && this.includeOptionalAnd) {
      cText = `${cText}en`
    } else if (nNumber < 13n && cNumber >= 1000n && this.includeOptionalAnd) {
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
    } else if (!this.accentOne) {
      cText = cText.replace(/één/g, 'een')
      nText = nText.replace(/één/g, 'een')
    }

    return { [`${cText}${nText}`]: cNumber + nNumber }
  }

  toCardinal (value) {
    if (value >= 1100n && value < 10_000n && !this.noHundredPairs) {
      const high = value / 100n
      const low = value % 100n
      if (high % 10n !== 0n) {
        let result = super.toCardinal(high) + 'honderd'
        if (low) {
          result += (this.includeOptionalAnd ? ' en ' : ' ') + super.toCardinal(low)
        }
        return result
      }
    }
    return super.toCardinal(value)
  }

  floatToCardinal (value) {
    // Get the result from parent class
    let result = super.floatToCardinal(value)

    // If accentOne is false (default), convert 'één' to 'een' everywhere
    // This handles standalone 1 and 1 in decimal parts (which are not compounds)
    if (!this.accentOne) {
      result = result.replace(/één/g, 'een')
    }

    return result
  }
}

/**
 * Converts a number to Dutch cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options] Conversion options (see NL class).
 * @param {boolean} [options.includeOptionalAnd=false] Include optional 'en' (and) separator.
 * @param {boolean} [options.noHundredPairs=false] Don't combine hundreds with tens/units.
 * @param {boolean} [options.accentOne=false] Use accented 'één' for standalone 1.
 * @returns {string} The number expressed in Dutch words.
 * @throws {TypeError} If value is NaN or invalid type.
 * @throws {Error} If value is an invalid number string.
 *
 * @example
 * floatToCardinal(1, { lang: 'nl' }); // 'een'
 * floatToCardinal(1, { lang: 'nl', accentOne: true }); // 'één'
 * floatToCardinal(21, { lang: 'nl', accentOne: true }); // 'eenentwintig' (no accent in compounds)
 * floatToCardinal(42, { lang: 'nl' }); // 'tweeenveertig'
 * floatToCardinal(1.5, { lang: 'nl' }); // 'een komma vijf'
 */
export default function floatToCardinal (value, options = {}) {
  return new NL(options).floatToCardinal(value)
}
