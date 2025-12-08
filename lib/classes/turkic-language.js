import CardMatchLanguage from './card-match-language.js'

/**
 * Base class for Turkic languages with shared grammar patterns.
 *
 * This class provides a reusable implementation for Turkic languages that share:
 * - Space-separated number combinations
 * - Implicit 'bir' (one) before hundreds and thousands
 * - Simple multiplication/addition logic
 * - Consistent magnitude handling
 *
 * Used by: Turkish (TR), Azerbaijani (AZ)
 *
 * Subclasses MUST define:
 * - `cards` array of [value, word] pairs (passed to super constructor)
 *
 * @abstract
 * @extends BaseLanguage
 */
class TurkicLanguage extends CardMatchLanguage {
  /**
   * Merges two adjacent word-number pairs according to Turkic grammar rules.
   *
   * Shared Turkic patterns:
   * - Implicit 'bir' (one) before hundreds and thousands
   * - Space separator (spaceSeparator property) for all combinations
   * - Multiplies when right > left (crossing magnitude boundary)
   * - Adds otherwise (combining same-magnitude components)
   *
   * @param {Object} leftPair The left operand as `{ word: bigint }`.
   * @param {Object} rightPair The right operand as `{ word: bigint }`.
   * @returns {Object} Merged pair with combined word and resulting number (bigint).
   */
  merge (leftPair, rightPair) {
    // Destructure entries to avoid repeated property access (performance optimization)
    const [[leftWord, leftNumber]] = Object.entries(leftPair) // BigInt values
    const [[rightWord, rightNumber]] = Object.entries(rightPair) // BigInt values

    // Implicit 'bir' (one) before certain magnitudes:
    // Omit '1' before hundreds (100n) and thousands (1000n) to form natural combinations
    if (leftNumber === 1n && (rightNumber <= 100n || rightNumber === 1000n)) {
      return rightPair // Return just the magnitude word (e.g., "yüz", not "bir yüz")
    }

    // Combine numbers with space separator (spaceSeparator from BaseLanguage):
    // Multiply when crossing magnitude boundary, add otherwise
    const result = rightNumber > leftNumber ? leftNumber * rightNumber : leftNumber + rightNumber
    return { [`${leftWord}${this.spaceSeparator}${rightWord}`]: result }
  }
}

export default TurkicLanguage
