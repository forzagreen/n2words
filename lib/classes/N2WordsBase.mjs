import N2WordsAbs from './N2WordsAbs.mjs';

/**
 * This class has common funtions used by multiple languages (mostly european).
 */
export default function() {
  N2WordsAbs.call(this);

  this.getValueFromCards = elem => {
    // 100
    for (let i = 0; i < this.cards.length; i++) {
      if (Object.prototype.hasOwnProperty.call(this.cards[i], elem)) {
        return this.cards[i][elem];
      }
    }
  };

  this.splitnum = value => {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i][0] == '.') {
        continue;
      }
      const elem = parseInt(Object.keys(this.cards[i])[0], 10); // 100
      if (elem > value) {
        continue;
      }
      const out = [];
      let div;
      let mod;
      if (value == 0) {
        div = 1;
        mod = 0;
      } else {
        div = Math.floor(value / elem);
        mod = value % elem;
      }
      if (div == 1) {
        out.push({
          [this.getValueFromCards(1)]: 1,
        }); // 'one'
      } else {
        if (div == value) {
          return [(div * this.getValueFromCards(elem), div * elem)];
        }
        out.push(this.splitnum(div));
      }
      out.push({
        [this.getValueFromCards(elem)]: elem,
      });

      if (mod) {
        out.push(this.splitnum(mod));
      }
      return out;
    }
  };

  this.scannum = value => {
    return value.split('').map(v => this.getValueFromCards(parseInt(v, 10)));
  };

  this.clean = val => {
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
  };

  this.postClean = out0 => out0.trimRight();

  this.toCardinal = value => {
    const val = this.splitnum(value);
    const preWords = Object.keys(this.clean(val))[0];
    const words = this.postClean(preWords);
    return words;
  };
}
