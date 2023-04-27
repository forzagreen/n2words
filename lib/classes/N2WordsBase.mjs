import N2WordsAbs from './N2WordsAbs.mjs';

/**
 * This class has common functions used by multiple languages (mostly european).
 */
export default class extends N2WordsAbs {
  getValueFromCard(card) {
    return this.cards.find(el => el[0] == card)[1];
  }

  splitNum(value) {
    for (let i = 0; i < this.cards.length; i++) {
      // TODO: Understand
      if (this.cards[i][0] == '.') {
        continue;
      }

      // TODO: Convert all cards to Number type
      const card = Number(this.cards[i][0]);

      // If card is greater than value skip to next card
      if (card > value) {
        continue;
      }

      const out = [];
      let div;
      let mod;
      if (value == 0) {
        div = 1;
        mod = 0;
      } else {
        div = Math.floor(value / card);
        mod = value % card;
      }
      if (div == 1) {
        out.push({
          [this.getValueFromCard(1)]: 1,
        }); // 'one'
      } else {
        if (div == value) {
          return [(div * this.getValueFromCard(card), div * card)];
        }
        out.push(this.splitNum(div));
      }
      out.push({
        [this.getValueFromCard(card)]: card,
      });

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
    while (val.length != 1) {
      out = [];
      const left = val[0];
      const right = val[1];
      if (!Array.isArray(left) && !Array.isArray(right)) {
        // both json objects, not arrays
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
    //
    const val = this.splitNum(value);

    //
    const preWords = Object.keys(this.clean(val))[0];

    //
    return this.postClean(preWords);
  }
}
