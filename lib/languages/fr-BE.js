import { French } from './fr.js'

/**
 * French (Belgium) language converter.
 *
 * Supports:
 * - Belgian regional variants: "septante" (70) and "nonante" (90)
 * - Simplified tens naming (no complex arithmetic)
 * - Inherits all other French grammar rules
 */
export class FrenchBelgium extends French {
  constructor (options = {}) {
    super()

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
