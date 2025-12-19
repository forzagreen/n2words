import AbstractLanguage from './abstract-language.js'

/**
 * Greedy scale language converter implementing the "highest-matching scale word" algorithm.
 *
 * Responsibilities:
 * - Decompose a whole-number value into a sequence of scale wordSets.
 * - Provide helpers to merge and post-process matched word-sets.
 * - Inherits decimal handling from AbstractLanguage (supports both grouped and
 *   per-digit modes via the `convertDecimalsPerDigit` class property).
 *
 * Subclasses must supply a `scaleWords` array and implement a language-specific
 * `mergeScales(leftWordSet, rightWordSet)` method which combines two adjacent word-sets
 * according to grammatical rules of the language.
 *
 * Scale words specification:
 * - `scaleWords` is an Array of 2-tuples: `[BigInt, string]` where the first element
 *   is the numeric value (BigInt) and the second is the word used for that value.
 * - Scale words MUST be ordered from largest to smallest (descending) for the algorithm
 *   to function correctly.
 *
 * @extends AbstractLanguage
 * @example
 * // Example `scaleWords` for English (descending order):
 * // [[1000000000n, 'billion'], [1000000n, 'million'], [1000n, 'thousand'], [100n, 'hundred'], ..., [1n, 'one']]
 */

class GreedyScaleLanguage extends AbstractLanguage {
  scaleWords

  /**
   * Return the word associated with an exact scale word-set numeric value.
   *
   * @param {bigint|number} scaleValue Numeric word-set object key (prefer BigInt for exact matching).
   * @returns {string|undefined} The word for the provided scale value, or `undefined`.
   */
  getScaleWord (scaleValue) {
    const wordSet = this.scaleWords.find((_wordSet) => _wordSet[0] === scaleValue)
    return wordSet?.[1]
  }

  /**
   * Decompose a whole-number into a sequence of scale word-sets.
   *
   * This internal helper returns a nested structure that represents quantities and
   * their matching scale words (e.g. `[{ 'one': 1n }, { 'hundred': 100n }, ...]`).
   * The result is designed to be reduced by `mergeWordSets()` using language-specific `mergeScales()`.
   *
   * For quantities > 1, the multiplier is recursively decomposed. For quantity = 1,
   * the implicit "one" is represented with `{ 'one': 1n }` and typically omitted during mergeScales().
   *
   * @protected
   * @param {bigint} wholeNumber The integer value to decompose (BigInt preferred).
   * @returns {Array<Object|Array>} An array of word-set objects and possibly nested arrays.
   */
  decomposeToScales (wholeNumber) {
    const wordSets = []
    let remainingValue = wholeNumber

    do {
      const wordSet = this.scaleWords.find((c) => remainingValue >= c[0])
      if (!wordSet) break

      const multiplier = remainingValue === 0n ? 1n : remainingValue / wordSet[0]

      if (multiplier === 1n) {
        wordSets.push({ [this.getScaleWord(1n)]: 1n })
      } else {
        wordSets.push(this.decomposeToScales(multiplier))
      }

      wordSets.push({ [wordSet[1]]: wordSet[0] })

      remainingValue = remainingValue === 0n ? 0n : remainingValue % wordSet[0]
    } while (remainingValue > 0n)

    return wordSets
  }

  /**
   * Reduce a nested array of word-sets into a single merged word-set object.
   *
   * This method repeatedly applies the subclass `mergeScales()` operation until a single
   * object remains. It normalizes nested arrays by recursively merging them.
   *
   * @protected
   * @param {Array<Object|Array>} wordSets Array of word-set objects and nested arrays.
   * @returns {Object} Merged word-set where the single object key is the language string
   *   and its value is the numeric BigInt result for that string.
   */
  mergeWordSets (wordSets) {
    while (wordSets.length > 1) {
      const [first, second, ...rest] = wordSets

      if (!Array.isArray(first) && !Array.isArray(second)) {
        const merged = this.mergeScales(first, second)
        wordSets = rest.length > 0 ? [merged, rest] : [merged]
        continue
      }

      const normalized = wordSets.map((el) => {
        if (!Array.isArray(el)) return el
        return el.length === 1 ? el[0] : this.mergeWordSets(el)
      })

      wordSets = normalized
    }

    return wordSets[0]
  }

  /**
   * Final string post-processing hook.
   *
   * Subclasses may override to apply language-specific whitespace, punctuation or
   * orthographic corrections.
   *
   * @protected
   * @param {string} output Merged language string produced by `convertWholePart` flow.
   * @returns {string} Final formatted string.
   */
  finalizeWords (output) {
    return output.trimEnd()
  }

  /**
   * Convert an integer value to its language-specific cardinal words.
   *
   * This method orchestrates decomposition, merging and final formatting. It does
   * not handle decimals or sign; those concerns are implemented in
   * `AbstractLanguage.convertToWords` which calls this helper for the whole-number part.
   *
   * @param {bigint|number} wholeNumber Whole-number value to convert (BigInt is preferred).
   * @returns {string} The cardinal representation for `value` in the language.
   */
  convertWholePart (wholeNumber) {
    const wordSets = this.decomposeToScales(wholeNumber)
    const mergedWordSet = this.mergeWordSets(wordSets)
    const resultString = Object.keys(mergedWordSet)[0]
    return this.finalizeWords(resultString)
  }
}

export default GreedyScaleLanguage

