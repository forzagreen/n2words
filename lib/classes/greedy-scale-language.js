import AbstractLanguage from './abstract-language.js'

/**
 * Greedy scale language converter implementing the "highest-matching scale word" algorithm.
 *
 * Responsibilities:
 * - Decompose a whole-number value into a sequence of scale word-sets.
 * - Provide helpers to merge and post-process matched word-sets.
 * - Inherits decimal handling from AbstractLanguage (supports grouped and per-digit
 *   modes via the `convertDecimalsPerDigit` class property).
 *
 * Subclass requirements:
 * - Define `scaleWordPairs` (ordered descending) as `[BigInt, string]` tuples.
 * - Implement `mergeScales(leftWordSet, rightWordSet)` to combine adjacent word-sets
 *   per language grammar.
 *
 * Scale words specification:
 * - `scaleWordPairs` is an Array of 2-tuples: `[BigInt, string]` where the first element
 *   is the numeric value (BigInt) and the second is the word used for that value.
 * - Scale words MUST be ordered from largest to smallest (descending) for the algorithm
 *   to function correctly.
 *
 * @extends AbstractLanguage
 * @example
 * // Example `scaleWordPairs` for English (descending order):
 * // [[1000000000n, 'billion'], [1000000n, 'million'], [1000n, 'thousand'], [100n, 'hundred'], ..., [1n, 'one']]
 */

class GreedyScaleLanguage extends AbstractLanguage {
  /**
   * Array of scale word pairs mapping numeric values to their word representations.
   *
   * Each element is a 2-tuple: `[BigInt, string]` where the first element is the
   * numeric value and the second is the word for that value. The array MUST be
   * ordered from largest to smallest (descending) for the greedy algorithm to work correctly.
   *
   * @type {Array<[bigint, string]>}
   * @example
   * // English scale words (descending order):
   * // [[1000000000n, 'billion'], [1000000n, 'million'], [1000n, 'thousand'], [100n, 'hundred'], ..., [1n, 'one']]
   */
  scaleWordPairs

  /**
   * Return the word associated with an exact scale word-set numeric value.
   *
   * @param {bigint|number} scaleValue Numeric word-set object key (prefer BigInt for exact matching).
   * @returns {string|undefined} The word for the provided scale value, or `undefined`.
   */
  getScaleWord (scaleValue) {
    const matchingPair = this.scaleWordPairs.find((pair) => pair[0] === scaleValue)
    return matchingPair?.[1]
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
    const decomposeWordSets = []
    let remainingValue = wholeNumber

    do {
      const matchingScaleWordPair = this.scaleWordPairs.find((scaleWordPair) => remainingValue >= scaleWordPair[0])
      if (!matchingScaleWordPair) break

      const multiplier = remainingValue === 0n ? 1n : remainingValue / matchingScaleWordPair[0]

      if (multiplier === 1n) {
        decomposeWordSets.push({ [this.getScaleWord(1n)]: 1n })
      } else {
        decomposeWordSets.push(this.decomposeToScales(multiplier))
      }

      decomposeWordSets.push({ [matchingScaleWordPair[1]]: matchingScaleWordPair[0] })

      remainingValue = remainingValue === 0n ? 0n : remainingValue % matchingScaleWordPair[0]
    } while (remainingValue > 0n)

    return decomposeWordSets
  }

  /**
   * Reduce a nested array of word-sets into a single merged word-set object.
   *
   * This method repeatedly applies the subclass `mergeScales()` operation until a single
   * object remains. It normalizes nested arrays by recursively merging them.
   *
   * @protected
   * @param {Array<Object|Array>} mergeWordSetsList Array of word-set objects and nested arrays.
   * @returns {Object} Merged word-set where the single object key is the language string
   *   and its value is the numeric BigInt result for that string.
   */
  mergeWordSets (mergeWordSetsList) {
    while (mergeWordSetsList.length > 1) {
      const [firstWordSet, secondWordSet, ...remainingWordSets] = mergeWordSetsList

      if (!Array.isArray(firstWordSet) && !Array.isArray(secondWordSet)) {
        const merged = this.mergeScales(firstWordSet, secondWordSet)
        mergeWordSetsList = remainingWordSets.length > 0 ? [merged, remainingWordSets] : [merged]
        continue
      }

      const normalizedWordSets = mergeWordSetsList.map((wordSetElement) => {
        if (!Array.isArray(wordSetElement)) return wordSetElement
        return wordSetElement.length === 1 ? wordSetElement[0] : this.mergeWordSets(wordSetElement)
      })

      mergeWordSetsList = normalizedWordSets
    }

    return mergeWordSetsList[0]
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
    const decomposeWordSets = this.decomposeToScales(wholeNumber)
    const mergedWordSet = this.mergeWordSets(decomposeWordSets)
    const resultString = Object.keys(mergedWordSet)[0]
    return this.finalizeWords(resultString)
  }
}

export default GreedyScaleLanguage
