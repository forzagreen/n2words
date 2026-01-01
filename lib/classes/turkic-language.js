import { GreedyScaleLanguage } from './greedy-scale-language.js'

/**
 * Base class for Turkic languages with shared grammar patterns.
 *
 * This class provides a reusable implementation for Turkic languages that share:
 * - Space-separated number combinations
 * - Implicit 'bir' (one) before hundreds and thousands
 * - Simple multiplication/addition logic
 * - Consistent magnitude handling
 * - Inherits decimal handling from AbstractLanguage via GreedyScaleLanguage
 *   (supports both grouped and per-digit modes via the `usePerDigitDecimals` class property).
 *
 * Used by: Turkish (TR), Azerbaijani (AZ)
 *
 * Subclasses MUST define (from GreedyScaleLanguage requirements):
 * - `scaleWords` array of [value, word] pairs as a class property (ordered descending by value).
 * Optionally, language-specific class properties (e.g., `negativeWord`, `zeroWord`, `decimalSeparatorWord`, `wordSeparator`).
 *
 * TurkicLanguage provides a default `combineWordSets()` implementation; subclasses may override
 * if specialized combine logic is needed (unlikely for Turkic languages).
 *
 * @abstract
 * @extends GreedyScaleLanguage
 */
export class TurkicLanguage extends GreedyScaleLanguage {
  // ============================================================================
  // Inherited Implementation (overrides GreedyScaleLanguage)
  // ============================================================================

  /**
   * Combines two adjacent word-sets according to Turkic grammar rules.
   *
   * Shared Turkic patterns:
   * - Implicit 'bir' (one) before hundreds and thousands
   * - Space separator (wordSeparator property) for all combinations
   * - Multiplies when right > left (crossing magnitude boundary)
   * - Adds otherwise (combining same-magnitude components)
   *
   * @param {Object} left The left word-set as `{ word: bigint }`.
   * @param {Object} right The right word-set as `{ word: bigint }`.
   * @returns {Object} Combined word-set with merged word and resulting number.
   */
  combineWordSets (left, right) {
    const [[leftWord, leftNumber]] = Object.entries(left)
    const [[rightWord, rightNumber]] = Object.entries(right)

    // Implicit 'bir' (one) before certain magnitudes:
    // Omit '1' before hundreds (100n) and thousands (1000n) to form natural combinations
    if (leftNumber === 1n && (rightNumber <= 100n || rightNumber === 1000n)) {
      return right // Return just the magnitude word (e.g., "yüz", not "bir yüz")
    }

    // Combine numbers with space separator (wordSeparator from GreedyScaleLanguage):
    // Multiply when crossing magnitude boundary, add otherwise
    const resultNumber = rightNumber > leftNumber ? leftNumber * rightNumber : leftNumber + rightNumber
    return { [`${leftWord}${this.wordSeparator}${rightWord}`]: resultNumber }
  }
}
