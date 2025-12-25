import { French } from './fr.js'

/**
 * French (Belgium) language converter.
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
export class FrenchBelgium extends French {
  /**
   * Initializes the French (Belgium) converter.
   *
   * @param {FrenchBelgiumOptions} [options={}] Configuration options.
   */
  constructor (options = {}) {
    super(options)

    // Insert 90n ('nonante') after 80n and 70n ('septante') after 60n
    const pairs = [...this.scaleWordPairs]
    // Find index of 80n and insert 90n after it
    const idx80 = pairs.findIndex(pair => pair[0] === 80n)
    if (idx80 !== -1) pairs.splice(idx80, 0, [90n, 'nonante'])
    // Find index of 60n and insert 70n after it
    const idx60 = pairs.findIndex(pair => pair[0] === 60n)
    if (idx60 !== -1) pairs.splice(idx60, 0, [70n, 'septante'])
    this.scaleWordPairs = pairs
  }
}
