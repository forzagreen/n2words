import AbstractLanguage from './abstract-language.js'

/**
 * Card match language converter implementing the "highest-matching card" algorithm.
 *
 * Responsibilities:
 * - Decompose a whole-number value into a sequence of card matches.
 * - Provide helpers to merge and post-process matched word-sets.
 * - Inherits decimal handling from AbstractLanguage (supports both grouped and
 *   per-digit modes via `usePerDigitDecimals` option).
 *
 * Subclasses must supply a `cards` array and implement a language-specific
 * `merge(leftWordSet, rightWordSet)` method which combines two adjacent word-sets
 * according to grammatical rules of the language.
 *
 * Cards specification:
 * - `cards` is an Array of 2-tuples: `[BigInt, string]` where the first element
 *   is the numeric value (BigInt) and the second is the word used for that value.
 * - Cards MUST be ordered from largest to smallest (descending) for the algorithm
 *   to function correctly.
 *
 * @extends AbstractLanguage
 * @example
 * // Example `cards` for English (descending order):
 * // [[1000000000n, 'billion'], [1000000n, 'million'], [1000n, 'thousand'], [100n, 'hundred'], ..., [1n, 'one']]
 */
class CardMatchLanguage extends AbstractLanguage {
  cards

  /**
   * Create a BaseLanguage instance.
   *
   * @param {Object} options Pass-through configuration for `AbstractLanguage`.
   * @param {Array<Array>} cards Array of `[BigInt, string]` pairs sorted descending.
   */
  constructor (options, cards) {
    super(options)

    this.cards = cards
  }

  /**
   * Return the word associated with an exact card numeric value.
   *
   * @param {bigint|number} number Numeric card key (prefer BigInt for exact matching).
   * @returns {string|undefined} The word for the provided card value, or `undefined`.
   */
  getCardWord (number) {
    // Find the card whose numeric key equals `number` and return its word
    const card = this.cards.find((_card) => _card[0] === number)
    return card?.[1]
  }

  /**
   * Decompose a whole-number value into a sequence of card matches.
   *
   * This internal helper returns a nested structure that represents quantities and
   * their matching scale words (e.g. `[{ 'one': 1n }, { 'hundred': 100n }, ...]`).
   * The result is designed to be reduced by `clean()` using language-specific `merge()`.
   *
   * For quantities > 1, the multiplier is recursively decomposed. For quantity = 1,
   * the implicit "one" is represented with `{ 'one': 1n }` and typically omitted during merge().
   *
   * @protected
   * @param {bigint} value The integer value to decompose (BigInt preferred).
   * @returns {Array<Object|Array>} An array of word-set objects and possibly nested arrays.
   */
  toCardMatches (value) {
    const matches = []
    let remainder = value

    // Process value by repeatedly finding the largest card <= remainder
    do {
      const card = this.cards.find((c) => remainder >= c[0])
      if (!card) break

      // Compute how many times the card fits and the new remainder
      const quantity = remainder === 0n ? 1n : remainder / card[0]
      remainder = remainder === 0n ? 0n : remainder % card[0]

      if (quantity === 1n) {
        // Single quantity — represent the implicit "one"
        matches.push({ [this.getCardWord(1n)]: 1n })
      } else {
        // Quantity > 1 — recursively decompose the multiplier
        matches.push(this.toCardMatches(quantity))
      }

      // Add the card itself to the matches
      matches.push({ [card[1]]: card[0] })
    } while (remainder > 0n)

    return matches
  }

  /**
   * Reduce a nested array of word-sets into a single merged word-set object.
   *
   * This method repeatedly applies the subclass `merge()` operation until a single
   * object remains. It normalizes nested arrays by recursively cleaning them.
   *
   * Algorithm: Process the array left-to-right. When two adjacent objects are found,
   * merge them and continue. Arrays are flattened/normalized as needed. This is O(n²)
   * worst-case but works well with the typical structure from `toCardMatches()`.
   *
   * @protected
   * @param {Array<Object|Array>} words Array of word-set objects and nested arrays.
   * @returns {Object} Merged word-set where the single object key is the language string
   *   and its value is the numeric BigInt result for that string.
   */
  clean (words) {
    // Reduce nested word-sets into a single merged structure.
    // The algorithm repeatedly merges the first two elements when both
    // are plain objects; otherwise it normalizes nested arrays and retries.
    while (words.length > 1) {
      const [first, second, ...rest] = words

      if (!Array.isArray(first) && !Array.isArray(second)) {
        // Both are plain word sets — merge and continue
        const merged = this.merge(first, second)
        // Preserve the original structure: push the remaining items as a single
        // nested array (this mirrors previous behavior which kept `words.slice(2)`)
        words = rest.length > 0 ? [merged, rest] : [merged]
        continue
      }

      // Normalize each element: if it's an array, flatten/clean it; otherwise keep it
      const normalized = words.map((el) => {
        if (!Array.isArray(el)) return el
        return el.length === 1 ? el[0] : this.clean(el)
      })

      words = normalized
    }

    return words[0]
  }

  /**
   * Final string post-processing hook.
   *
   * Subclasses may override to apply language-specific whitespace, punctuation or
   * orthographic corrections.
   *
   * @protected
   * @param {string} output Merged language string produced by `toCardinal` flow.
   * @returns {string} Final formatted string.
   */
  postClean (output) {
    return output.trimEnd()
  }

  /**
   * Convert an integer value to its language-specific cardinal words.
   *
   * This method orchestrates decomposition, merging and final formatting. It does
   * not handle decimals or sign; those concerns are implemented in
   * `AbstractLanguage.floatToCardinal` which calls this helper for the whole-number part.
   *
   * @param {bigint|number} value Whole-number value to convert (BigInt is preferred).
   * @returns {string} The cardinal representation for `value` in the language.
   */
  toCardinal (value) {
    // Convert value to word sets
    const words = this.toCardMatches(value)

    // Merge the generated word sets using language rules
    const cleanedWords = this.clean(words)

    // Extract the word string from the cleaned object
    const preWords = Object.keys(cleanedWords)[0]

    // Final formatting hook
    return this.postClean(preWords)
  }
}

export default CardMatchLanguage
