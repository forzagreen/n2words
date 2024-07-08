import AbstractLanguage from './abstract-language.js';

/**
 * Creates new common language class that uses a highest matching word value algorithm.
 * Number matching word {@link cards} must be provided for this to work.
 * @augments AbstractLanguage
 */
class BaseLanguage extends AbstractLanguage {
  #cards;

  /**
   * @param {object} options Options for class.
   * @param {string} [options.negativeWord] Word that precedes a negative number (if any).
   * @param {string} options.separatorWord Word that separates cardinal numbers (i.e. "and").
   * @param {string} options.zero Word for 0 (i.e. "zero").
   * @param {string} [options.spaceSeparator] Character that separates words.
   * @param {Array} cards Array of number matching "cards" from highest-to-lowest.
   */
  constructor(options, cards) {
    super(options);

    this.#cards = cards;
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
  get cards() {
    return this.#cards;
  }

  set cards(value) {
    this.#cards = value;
  }

  /**
   * Get word for number if it matches a language card.
   * @param {number|bigint} number Card number value.
   * @returns {string|undefined} Return card word or undefined if no card.
   */
  getCardWord(number) {
    // Get matching card from number
    const card = this.cards.find(_card => _card[0] == number);

    // Return card word or undefined if no card found
    return (Array.isArray(card) ? card[1] : undefined);
  }

  /**
   * Get array of card matches.
   * @param {number|bigint} value The number value to convert to cardinal form.
   * @returns {object} Word sets (and pairs) from value.
   */
  // TODO Simplify return object.
  toCardMatches(value) {
    const out = [];
    let remaining = value;

    do {
      // Find card with highest matching number
      const card = this.cards.find(card => {
        return remaining >= card[0];
      });

      let quantity; // Quantity of card set values

      // Calculate quantity and remaining value
      // Override variables for 0 as math will fail
      if (remaining == 0) {
        quantity = 1;
        remaining = 0;
      } else {
        quantity = remaining / card[0];
        remaining = remaining % card[0];
      }

      // Is value perfect match of card number?
      if (quantity == 1) {
        // TODO Merge word set pairs together (if possible) to simplify return object
        out.push({
          [this.getCardWord(1)]: 1,
        });
      } else {
        // TODO Understand the logic for this
        /*if (quantity == remaining) {
          return [(quantity * this.getCardWord(card[0]), quantity * card[0])];
        }*/

        // TODO Remove reciprocating calls.
        out.push(this.toCardMatches(quantity));
      }

      // Add matching word set to output list
      out.push({
        [card[1]]: card[0],
      });
    }
    while (remaining > 0);

    return out;
  }

  clean(words) {
    let out = words;

    // Loop through word sets while array size is greater or less than 1
    // TODO Change logic to work in for loop to better understand loop intentions
    while (words.length != 1) {
      out = [];
      const left = words[0];
      const right = words[1];

      // Are the first & second word sets arrays?
      if (!Array.isArray(left) && !Array.isArray(right)) {
        // Merge word set pair and add to output array
        out.push(this.merge(left, right));

        // TODO Understand
        if (words.slice(2).length > 0) {
          out.push(words.slice(2));
        }
      } else {
        // Loop through
        for (const element of words) {

          if (Array.isArray(element)) {
            if (element.length == 1) out.push(element[0]);
            else out.push(this.clean(element));
          } else {
            out.push(element);
          }
        }
      }

      words = out;
    }

    return out[0];
  }

  postClean(out0) {
    return out0.trimEnd();
  }

  /**
   * Convert a whole number to written format.
   * @param {number|bigint} value The number value to convert to cardinal form.
   * @returns {string} Value in written format.
   */
  toCardinal(value) {
    // Convert value to word sets
    const words = this.toCardMatches(value);

    // Process word sets
    const preWords = Object.keys(this.clean(words))[0];

    // Process word sets some more and return result
    // TODO Look into language functions/events
    return this.postClean(preWords);
  }
}

export default BaseLanguage;
