import AbstractLanguage from './abstract-language.js'

/**
 * Language converter using a "highest matching card" algorithm.
 *
 * This class decomposes numbers by iteratively finding the largest "card" (number-word pair)
 * that is less than or equal to the remaining value. It then recursively builds matches
 * and merges them according to language-specific rules.
 *
 * Subclasses should provide:
 * - A `cards` array of `[number, word]` pairs sorted from highest to lowest
 * - A `merge()` method to combine adjacent number-word pairs
 *
 * @extends AbstractLanguage
 *
 * @example
 * // Cards structure (from English):
 * [
 *   [1_000_000_000n, 'billion'],
 *   [1_000_000n, 'million'],
 *   [1000n, 'thousand'],
 *   [100n, 'hundred'],
 *   ...
 *   [1n, 'one'],
 * ]
 */
class BaseLanguage extends AbstractLanguage {
  #cards

  /**
   * Initializes the language converter with cards.
   *
   * @param {Object} options Configuration options (see AbstractLanguage).
   * @param {Array<Array>} cards Array of `[number, word]` pairs sorted highest-to-lowest.
   *   Each pair represents a number that can be matched during decomposition.
   */
  constructor (options, cards) {
    super(options)

    this.#cards = cards
  }

  /**
   * Gets the cards array used for number matching.
   *
   * @type {Array<Array>}
   * @readonly
   * @description Each card is a 2-tuple: `[number, word]`.
   *   Numbers must be in descending order for the algorithm to work correctly.
   *   Example: `[[1000n, 'thousand'], [100n, 'hundred'], ..., [1n, 'one']]`
   */
  get cards () {
    return this.#cards
  }

  set cards (value) {
    this.#cards = value
  }

  /**
   * Retrieves the word for a specific number if it exists in the cards.
   *
   * @param {number|bigint} number The card number to look up.
   * @returns {string|undefined} The word for the number, or undefined if not found.
   *
   * @example
   * getCardWord(100n); // 'hundred'
   * getCardWord(7n);   // 'seven'
   * getCardWord(999n); // undefined
   */
  getCardWord (number) {
    // Find the card whose numeric key equals `number` and return its word
    const card = this.cards.find(_card => _card[0] === number)
    return card?.[1]
  }

  /**
   * Decomposes a number into a structured array of "card matches".
   *
   * Algorithm:
   * 1. Finds the largest card <= remaining value
   * 2. Calculates how many times that card fits
   * 3. Recursively breaks down the quantity (if > 1)
   * 4. Records both the quantity and the card
   * 5. Repeats with the remainder until value is zero
   *
   * Result structure enables language-specific merge rules to combine matches naturally.
   *
   * @param {bigint} value The number to decompose.
   * @returns {Array} Structured array of match objects. Each object has the format:
   *   `{ [word]: number }` where number is the card value (for merging).
   *   Nested arrays may occur for composite quantities.
   *
   * @example
   * // For 123 with English cards:
   * // [
   * //   { 'one': 1n },
   * //   { 'hundred': 100n },
   * //   { 'twenty': 20n },
   * //   { 'three': 3n }
   * // ]
   */
  toCardMatches (value) {
    const matches = []
    let rem = value

    // Process value by repeatedly finding the largest card <= rem
    do {
      const card = this.cards.find(c => rem >= c[0])
      if (!card) break

      // Compute how many times the card fits and the new remainder
      const quantity = rem === 0n ? 1n : rem / card[0]
      rem = rem === 0n ? 0n : rem % card[0]

      if (quantity === 1n) {
        // Single quantity — represent the implicit "one"
        matches.push({ [this.getCardWord(1n)]: 1n })
      } else {
        // Quantity > 1 — recursively decompose the multiplier
        matches.push(this.toCardMatches(quantity))
      }

      // Add the card itself to the matches
      matches.push({ [card[1]]: card[0] })
    } while (rem > 0n)

    return matches
  }

  /**
   * Merges and flattens nested word-set structures into a single combined object.
   *
   * Algorithm:
   * 1. While more than one element remains:
   *    - If both first and second elements are plain objects, merge them
   *    - Otherwise, normalize any nested arrays and retry
   * 2. Returns the single merged result or normalized value
   *
   * The merge process applies language-specific rules via the `merge()` method.
   *
   * @param {Array} words Array of word-set objects and possibly nested arrays.
   * @returns {Object} A single merged object with combined word keys and values.
   *
   * @example
   * // For simplified English example:
   * // Input: [{ 'one': 1n }, { 'hundred': 100n }]
   * // Output: { 'one hundred': 100n }
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
      const normalized = words.map(el => {
        if (!Array.isArray(el)) return el
        return el.length === 1 ? el[0] : this.clean(el)
      })

      words = normalized
    }

    return words[0]
  }

  /**
   * Post-processing step to clean up final output.
   *
   * Subclasses can override this to perform additional formatting.
   *
   * @param {string} output The merged and combined word string.
   * @returns {string} Processed output.
   * @protected
   */
  postClean (output) {
    return output.trimEnd()
  }

  /**
   * Converts a whole number to its cardinal word representation.
   *
   * Process:
   * 1. Decompose the number into card matches
   * 2. Merge matches using language-specific rules
   * 3. Extract the combined word string from the result object
   * 4. Apply post-processing
   *
   * @param {number|bigint} value The number to convert.
   * @returns {string} The number expressed as words.
   *
   * @example
   * // Requires implementation of merge() method in subclass
   * toCardinal(123n); // 'one hundred twenty-three' (depends on language)
   */
  toCardinal (value) {
    // Convert value to word sets
    const words = this.toCardMatches(value)

    // Process word sets
    const preWords = Object.keys(this.clean(words))[0]

    // Process word sets some more and return result
    // Note: Future enhancement opportunity for language-specific processing hooks
    return this.postClean(preWords)
  }
}

export default BaseLanguage
