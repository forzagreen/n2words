import { French } from './fr.js'

/**
 * Belgian French language converter.
 *
 * Extends the French converter with Belgian French regional variant:
 * - Uses "septante" (70) instead of "soixante-dix"
 * - Uses "nonante" (90) instead of "quatre-vingt-dix"
 * - Maintains standard French "quatre-vingts" for 80
 * - More regular and logical number system than standard French
 *
 * Features:
 * - Regional number word variations (septante, nonante)
 * - Simplified tens naming (no complex arithmetic)
 * - Inherits all other French grammar rules from FR class
 * - Same pluralization and hyphenation patterns as standard French
 */
export class BelgianFrench extends French {
  /**
   * Initializes the Belgian French converter.
   *
   * @param {Object} [options={}] Configuration options.
   * @param {boolean} [options.withHyphenSeparator=false] Use hyphens (true) instead of spaces (false) in compounds.
   */
  constructor (options = {}) {
    super(options)
    // Fill the empty placeholder slots with Belgian variants
    // First empty slot (index 10) is for 90n (between 100n and 80n)
    // Second empty slot (index 12) is for 70n (between 80n and 60n)
    this.scaleWordPairs = this.scaleWordPairs.map((card, index) => {
      if (Array.isArray(card) && card.length === 0) {
        // Check next card to determine which slot this is
        const nextCard = this.scaleWordPairs[index + 1]
        if (nextCard && nextCard[0] === 80n) {
          return [90n, 'nonante']
        } else if (nextCard && nextCard[0] === 60n) {
          return [70n, 'septante']
        }
      }
      return card
    })
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function convertToWords (value, options = {}) {
  return new BelgianFrench(options).convertToWords(value)
}



