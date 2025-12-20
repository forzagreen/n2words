import GreedyScaleLanguage from './greedy-scale-language.js'

/**
 * @typedef {Object} TurkicWordPair
 * @property {string} word - The Turkic word or phrase
 * @property {bigint} value - The numeric value represented by the word
 */

/**
 * Base class for Turkic languages with shared grammar patterns.
 *
 * This class provides a reusable implementation for Turkic languages that share:
 * - Space-separated number combinations
 * - Implicit 'bir' (one) before hundreds and thousands
 * - Simple multiplication/addition logic
 * - Consistent magnitude handling
 * - Inherits decimal handling from AbstractLanguage via GreedyScaleLanguage
 *   (supports both grouped and per-digit modes via the `convertDecimalsPerDigit` class property).
 *
 * Used by: Turkish (TR), Azerbaijani (AZ)
 *
 * Subclasses MUST define (from GreedyScaleLanguage requirements):
 * - `scaleWordPairs` array of [value, word] pairs as a class property (ordered descending by value).
 * Optionally, language-specific class properties (e.g., `negativeWord`, `zeroWord`, `decimalSeparatorWord`, `wordSeparator`).
 *
 * TurkicLanguage provides a default `mergeScales()` implementation; subclasses may override
 * if specialized merge logic is needed (unlikely for Turkic languages).
 *
 * @abstract
 * @extends GreedyScaleLanguage
 */
class TurkicLanguage extends GreedyScaleLanguage {
  /**
   * Merges two adjacent word-number pairs according to Turkic grammar rules.
   *
   * Shared Turkic patterns:
   * - Implicit 'bir' (one) before hundreds and thousands
   * - Space separator (wordSeparator property) for all combinations
   * - Multiplies when right > left (crossing magnitude boundary)
   * - Adds otherwise (combining same-magnitude components)
   *
   * @param {Object} leftPair The left operand as `{ word: bigint }`.
   * @param {Object} rightPair The right operand as `{ word: bigint }`.
   * @returns {Object} Merged pair with combined word and resulting number (bigint).
   */
  mergeScales (leftPair, rightPair) {
    const [[leftWord, leftNumber]] = Object.entries(leftPair)
    const [[rightWord, rightNumber]] = Object.entries(rightPair)

    // Implicit 'bir' (one) before certain magnitudes:
    // Omit '1' before hundreds (100n) and thousands (1000n) to form natural combinations
    if (leftNumber === 1n && (rightNumber <= 100n || rightNumber === 1000n)) {
      return rightPair // Return just the magnitude word (e.g., "yüz", not "bir yüz")
    }

    // Combine numbers with space separator (wordSeparator from GreedyScaleLanguage):
    // Multiply when crossing magnitude boundary, add otherwise
    const mergedNumber = rightNumber > leftNumber ? leftNumber * rightNumber : leftNumber + rightNumber
    return { [`${leftWord}${this.wordSeparator}${rightWord}`]: mergedNumber }
  }
}

export default TurkicLanguage
