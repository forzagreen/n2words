import { AbstractLanguage } from './abstract-language.js'

/**
 * Greedy scale language converter implementing the "highest-matching scale word" algorithm.
 *
 * Responsibilities:
 * - Decompose an integer into a sequence of word-sets using greedy matching.
 * - Provide helpers to reduce and post-process matched word-sets.
 * - Inherits decimal handling from AbstractLanguage (supports grouped and per-digit
 *   modes via the `usePerDigitDecimals` class property).
 *
 * Subclass requirements:
 * - Define `scaleWords` (ordered descending) as `[bigint, string]` tuples.
 * - Implement `combineWordSets(left, right)` to combine adjacent word-sets
 *   per language grammar.
 *
 * Scale words specification:
 * - `scaleWords` is an Array of 2-tuples: `[bigint, string]` where the first element
 *   is the numeric scale value and the second is the word for that value.
 * - Scale words MUST be ordered from largest to smallest (descending) for the algorithm
 *   to function correctly.
 *
 * Terminology:
 * - **Scale**: A magnitude value (100n, 1000n, 1000000n)
 * - **Word-set**: An object `{ word: bigint }` representing a partial result
 * - **Scale word**: The word for a scale value ("hundred", "thousand")
 *
 * @abstract
 * @extends AbstractLanguage
 */

export class GreedyScaleLanguage extends AbstractLanguage {
  /**
   * Array of scale words mapping numeric values to their word representations.
   *
   * Each element is a 2-tuple: `[bigint, string]` where the first element is the
   * numeric scale value and the second is the word for that value. The array MUST be
   * ordered from largest to smallest (descending) for the greedy algorithm to work correctly.
   *
   * @type {Array<[bigint, string]>}
   * @example
   * // English scale words (descending order):
   * // [[1000000000n, 'billion'], [1000000n, 'million'], [1000n, 'thousand'], [100n, 'hundred'], ..., [1n, 'one']]
   */
  scaleWords

  /**
   * Return the word for an exact scale value.
   *
   * @param {bigint} scale The scale value to look up (prefer BigInt for exact matching).
   * @returns {string|undefined} The word for the provided scale, or `undefined`.
   */
  wordForScale (scale) {
    const match = this.scaleWords.find((pair) => pair[0] === scale)
    return match?.[1]
  }

  /**
   * Decompose an integer into a sequence of word-sets.
   *
   * This internal helper returns a nested structure that represents quantities and
   * their matching scale words (e.g. `[{ 'one': 1n }, { 'hundred': 100n }, ...]`).
   * The result is designed to be reduced by `reduceWordSets()` using language-specific `combineWordSets()`.
   *
   * For quantities > 1, the multiplier is recursively decomposed. For quantity = 1,
   * the implicit "one" is represented with `{ 'one': 1n }` and typically omitted during combineWordSets().
   *
   * @protected
   * @param {bigint} integer The integer value to decompose.
   * @returns {Array<Object|Array>} An array of word-set objects and possibly nested arrays.
   */
  decomposeInteger (integer) {
    const wordSets = []
    let remaining = integer

    do {
      const match = this.scaleWords.find((pair) => remaining >= pair[0])
      if (!match) break

      const multiplier = remaining === 0n ? 1n : remaining / match[0]

      if (multiplier === 1n) {
        wordSets.push({ [this.wordForScale(1n)]: 1n })
      } else {
        wordSets.push(this.decomposeInteger(multiplier))
      }

      wordSets.push({ [match[1]]: match[0] })

      remaining = remaining === 0n ? 0n : remaining % match[0]
    } while (remaining > 0n)

    return wordSets
  }

  /**
   * Reduce a nested array of word-sets into a single word-set object.
   *
   * This method repeatedly applies the subclass `combineWordSets()` operation until a single
   * object remains. It normalizes nested arrays by recursively reducing them.
   *
   * @protected
   * @param {Array<Object|Array>} wordSets Array of word-set objects and nested arrays.
   * @returns {Object} Reduced word-set where the single object key is the language string
   *   and its value is the numeric BigInt result for that string.
   */
  reduceWordSets (wordSets) {
    while (wordSets.length > 1) {
      const [first, second, ...rest] = wordSets

      if (!Array.isArray(first) && !Array.isArray(second)) {
        const combined = this.combineWordSets(first, second)
        wordSets = rest.length > 0 ? [combined, rest] : [combined]
        continue
      }

      const normalized = wordSets.map((element) => {
        if (!Array.isArray(element)) return element
        return element.length === 1 ? element[0] : this.reduceWordSets(element)
      })

      wordSets = normalized
    }

    return wordSets[0]
  }

  /**
   * Combine two adjacent word-sets into a single word-set.
   *
   * This is the core language-specific method that must be implemented by subclasses
   * to define how adjacent word-sets are combined according to the language's grammar.
   * For example, English combines "twenty" + "three" → "twenty-three", while
   * French might combine "quatre-vingts" + "dix" → "quatre-vingt-dix".
   *
   * @abstract
   * @protected
   * @param {Object} left Left operand as `{ word: bigint }` word-set.
   * @param {Object} right Right operand as `{ word: bigint }` word-set.
   * @returns {Object} Combined word-set with merged text and resulting numeric value.
   *
   * @example
   * // English implementation might handle:
   * // combineWordSets({ 'twenty': 20n }, { 'three': 3n }) → { 'twenty-three': 23n }
   * // combineWordSets({ 'one': 1n }, { 'hundred': 100n }) → { 'one hundred': 100n }
   */
  combineWordSets (left, right) {
    throw new Error('combineWordSets() must be implemented by subclass')
  }

  /**
   * Final string post-processing hook.
   *
   * Subclasses may override to apply language-specific whitespace, punctuation or
   * orthographic corrections.
   *
   * @protected
   * @param {string} output Language string produced by the conversion flow.
   * @returns {string} Final formatted string.
   */
  finalizeWords (output) {
    return output.trimEnd()
  }

  /**
   * Convert an integer value to its language-specific cardinal words.
   *
   * This method orchestrates decomposition, reduction, and final formatting. It does
   * not handle decimals or sign; those concerns are implemented in
   * `AbstractLanguage.toWords` which calls this method for the integer part.
   *
   * @param {bigint} integer Integer value to convert.
   * @returns {string} The cardinal representation for the integer in the language.
   */
  integerToWords (integer) {
    const wordSets = this.decomposeInteger(integer)
    const reduced = this.reduceWordSets(wordSets)
    const result = Object.keys(reduced)[0]
    return this.finalizeWords(result)
  }
}
