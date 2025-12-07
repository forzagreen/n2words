import AbstractLanguage from './abstract-language.js'

/**
 * Creates new common language class that uses a highest matching word value algorithm.
 * Number matching word {@link #cards} must be provided for this to work.
 * @augments AbstractLanguage
 */
class BaseLanguage extends AbstractLanguage {
  #cards

  /**
   * @param {object} options Options for class.
   * @param {string} [options.negativeWord] Word that precedes a negative number (if any).
   * @param {string} options.separatorWord Word that separates cardinal numbers (i.e. "and").
   * @param {string} options.zero Word for 0 (i.e. "zero").
   * @param {string} [options.spaceSeparator] Character that separates words.
   * @param {Array} cards Array of number matching "cards" from highest-to-lowest.
   */
  constructor (options, cards) {
    super(options)

    this.#cards = cards
  }

  /**
   * Array of number matching "cards" from highest-to-lowest.
   * First element in card array is the number to match while the second is the word to use.
   * @example
   * [
   *   ...
   *   [100, 'hundred'],
   *   ...
   *   [1, 'one'],
   * ]
   * @type {Array}
   */
  get cards () {
    return this.#cards
  }

  set cards (value) {
    this.#cards = value
  }

  /**
   * Get word for number if it matches a language card.
   * @param {number|bigint} number Card number value.
   * @returns {string|undefined} Return card word or undefined if no card.
   */
  getCardWord (number) {
    // Find the card whose numeric key equals `number` and return its word
    const card = this.cards.find(_card => _card[0] === number)
    return card?.[1]
  }

  /**
   * Get array of card matches.
   * @param {bigint} value The number value to convert to cardinal form.
   * @returns {object} Word sets (and pairs) from value.
   */
  // TODO Simplify return object.
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
        // single quantity — represent the implicit "one"
        matches.push({ [this.getCardWord(1n)]: 1n })
      } else {
        // quantity > 1 — represent the multiplier as its own matches
        matches.push(this.toCardMatches(quantity))
      }

      // then add the card itself
      matches.push({ [card[1]]: card[0] })
    } while (rem > 0n)

    return matches
  }

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

  postClean (out0) {
    return out0.trimEnd()
  }

  /**
   * Convert a whole number to written format.
   * @param {number|bigint} value The number value to convert to cardinal form.
   * @returns {string} Value in written format.
   */
  toCardinal (value) {
    // Convert value to word sets
    const words = this.toCardMatches(value)

    // Process word sets
    const preWords = Object.keys(this.clean(words))[0]

    // Process word sets some more and return result
    // TODO Look into language functions/events
    return this.postClean(preWords)
  }
}

export default BaseLanguage
