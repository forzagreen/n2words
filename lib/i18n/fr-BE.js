import { FR } from './fr.js'

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
export class FRBE extends FR {
  /**
   * Initializes the Belgian French converter.
   *
   * Automatically sets the _region option to 'BE' to enable Belgian variants.
   *
   * @param {Object} options
   * @param {string} [options.negativeWord='moins'] Word for negative numbers (inherited from FR).
   * @param {string} [options.separatorWord='virgule'] Word separating whole and decimal parts (inherited from FR).
   * @param {string} [options.zero='zéro'] Word for the digit 0 (inherited from FR).
   * @param {boolean} [options.withHyphenSeparator=false] Use hyphens instead of spaces (inherited from FR).
   */
  constructor (options) {
    options = Object.assign({}, options, { _region: 'BE' })

    super(options)
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new FRBE(options).floatToCardinal(value)
}
