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
   * - Multiplies when following > preceding (crossing magnitude boundary)
   * - Adds otherwise (combining same-magnitude components)
   *
   * @param {Object} preceding - Preceding word-set as { word: bigint }.
   * @param {Object} following - Following word-set as { word: bigint }.
   * @returns {Object} Combined word-set with merged word and resulting number.
   */
  combineWordSets (preceding, following) {
    const [[precedingWord, precedingValue]] = Object.entries(preceding)
    const [[followingWord, followingValue]] = Object.entries(following)

    // Implicit 'bir' (one) before certain magnitudes:
    // Omit '1' before hundreds (100n) and thousands (1000n) to form natural combinations
    if (precedingValue === 1n && (followingValue <= 100n || followingValue === 1000n)) {
      return following // Return just the magnitude word (e.g., "yüz", not "bir yüz")
    }

    // Combine numbers with space separator (wordSeparator from GreedyScaleLanguage):
    // Multiply when crossing magnitude boundary, add otherwise
    const resultNumber = followingValue > precedingValue ? precedingValue * followingValue : precedingValue + followingValue
    return { [`${precedingWord}${this.wordSeparator}${followingWord}`]: resultNumber }
  }
}
