import CardMatchLanguage from './card-match-language.js'

/**
 * Base class for Scandinavian languages with shared grammar patterns.
 *
 * This class provides a reusable implementation for Scandinavian languages that share:
 * - Similar number word structures
 * - "og" (and) conjunction for number combinations
 * - Space/hyphen separators with context-dependent rules
 * - Magnitude-based spacing for millions+
 * - Inherits decimal handling from AbstractLanguage via CardMatchLanguage
 *   (supports both grouped and per-digit modes via `usePerDigitDecimals` option).
 *
 * Used by: Norwegian (NO), Danish (DK)
 *
 * Subclasses MUST define:
 * - `cards` array of [value, word] pairs (passed to super constructor)
 *
 * @abstract
 * @extends BaseLanguage
 */
class ScandinavianLanguage extends CardMatchLanguage {
  /**
   * Merges two adjacent word-number pairs according to Scandinavian grammar rules.
   *
   * Shared Scandinavian patterns:
   * - Implicit 'en' (one) before tens and larger magnitudes
   * - Hyphenation for compound tens/units (e.g., "tjueen")
   * - "og" (and) separator for hundreds combinations
   * - Space for magnitude multiplication (thousands+)
   * - Comma or space for additional combinations
   *
   * @param {Object} leftPair The left operand as `{ word: bigint }`.
   * @param {Object} rightPair The right operand as `{ word: bigint }`.
   * @returns {Object} Merged pair with combined word and resulting number (bigint).
   */
  merge (leftPair, rightPair) {
    const leftWord = Object.keys(leftPair)[0]
    const rightWord = Object.keys(rightPair)[0]
    const leftNumber = Object.values(leftPair)[0] // BigInt
    const rightNumber = Object.values(rightPair)[0] // BigInt

    // Implicit 'en' before tens and larger: omit '1' to avoid redundancy
    if (leftNumber === 1n && rightNumber < 100n) {
      return rightPair
    }

    // Hyphenation for compound tens (e.g., 21 → "tjueen")
    if (leftNumber < 100n && leftNumber > rightNumber) {
      return { [`${leftWord}-${rightWord}`]: leftNumber + rightNumber }
    }

    // "og" (and) for hundreds + smaller numbers (e.g., 105 → "hundre og fem")
    if (leftNumber >= 100n && rightNumber < 100n) {
      return { [`${leftWord} og ${rightWord}`]: leftNumber + rightNumber }
    }

    // Space for magnitude multiplication across boundaries
    if (rightNumber > leftNumber) {
      return { [`${leftWord} ${rightWord}`]: leftNumber * rightNumber }
    }

    // Comma for other combinations (non-standard)
    return { [`${leftWord}, ${rightWord}`]: leftNumber + rightNumber }
  }
}

export default ScandinavianLanguage
