import N2WordsAbs from './N2WordsAbs.mjs';

/**
 * This class has common functions used by multiple languages (mostly european).
 */
export default class extends N2WordsAbs {
  /**
   * Get word value from equivalent value card set.
   * @param {number} number Card number value.
   * @returns {string|undefined} Card word value or undefined if not found.
   */
  getValueFromCard(number) {
    // Get matching card from number
    const card = this.cards.find(el => el[0] == number);

    // Return card word if found otherwise return undefined
    return (Array.isArray(card) ? card[1] : undefined);
  }

  /**
   * Convert a number value into words sets for further processing
   * @param {number} value The number value to convert to cardinal form.
   * @returns {object} Word sets from value
   * @todo Improve return object
   */
  splitNum(value) {
    // Loop through all cards
    // NOTE: Language cards should be ordered from highest to lowest
    for (let i = 0; i < this.cards.length; i++) {
      const number = this.cards[i][0];

      // If card number is greater than value skip to next card
      if (number > value) {
        continue;
      }

      const out = [];
      let div; // Quantity of card set values
      let mod; // Remaining value

      // Calculate quantity and remaining value
      // Override variables for 0 as math will fail
      if (value == 0) {
        div = 1;
        mod = 0;
      } else {
        div = Math.floor(value / number);
        mod = value % number;
      }

      // Is value perfect match of card number?
      if (div == 1) {
        // TODO: Merge word set modifier (if possible) to simplify return object
        out.push({
          [this.getValueFromCard(1)]: 1,
        });
      } else {
        // TODO: Understand this logic
        if (div == value) {
          return [(div * this.getValueFromCard(number), div * number)];
        }

        // TODO: Remove reciprocating calls
        out.push(this.splitNum(div));
      }

      // Add matching word object to output list
      out.push({
        [this.getValueFromCard(number)]: number,
      });

      // Add remaining value to output list
      // TODO: Remove reciprocating calls
      if (mod) {
        out.push(this.splitNum(mod));
      }

      return out;
    }
  }

  scanNum(value) {
    return value.split('').map(v => this.getValueFromCard(Number(v)));
  }

  clean(val) {
    let out = val;

    // Loop through word sets until one is left
    // TODO: Change logic to work in for loop
    while (val.length != 1) {
      out = [];
      const left = val[0];
      const right = val[1];

      // both json objects, not arrays
      if (!Array.isArray(left) && !Array.isArray(right)) {
        // TODO: Understand
        out.push(this.merge(left, right));

        if (val.slice(2).length > 0) {
          // all but first 2 elems
          out.push(val.slice(2));
        }
      } else {
        for (let i = 0; i < val.length; i++) {
          const elem = val[i];

          if (Array.isArray(elem)) {
            if (elem.length == 1) out.push(elem[0]);
            else out.push(this.clean(elem));
          } else {
            out.push(elem);
          }
        }
      }

      val = out;
    }

    return out[0];
  }

  postClean(out0) {
    return out0.trimRight();
  }

  /**
   * Convert a whole number to written format.
   * @param {number} value The number value to convert to cardinal form.
   * @returns {string} Value in written format.
   */
  toCardinal(value) {
    // Split value to word sets
    const words = this.splitNum(value);

    // Process word sets
    const preWords = Object.keys(this.clean(words))[0];

    // Process word sets some more and return result
    // TODO: Look into language functions/events
    return this.postClean(preWords);
  }
}
