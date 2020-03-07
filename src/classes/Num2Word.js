export default function() {
  this.getValueFromCards = (elem) => { //100
    for (var i = 0; i < this.cards.length; i++) {
      if (this.cards[i].hasOwnProperty(elem)) {
        return this.cards[i][elem];
      }
    }
  };

  this.splitnum = (value) => {
    for (var i = 0; i < this.cards.length; i++) {
      var elem = parseInt(Object.keys(this.cards[i])[0]); //100
      if (elem > value) {
        continue;
      }
      var out = [];
      var div, mod;
      if (value == 0) {
        div = 1;
        mod = 0;
      } else {
        div = Math.floor(value / elem);
        mod = value % elem;
      }
      if (div == 1) {
        out.push({
          [this.getValueFromCards(1)]: 1
        }); //'one'
      } else {
        if (div == value) {
          return [(div * this.getValueFromCards(elem), div * elem)];
        }
        out.push(this.splitnum(div));
      }
      out.push({
        [this.getValueFromCards(elem)]: elem
      });

      if (mod) {
        out.push(this.splitnum(mod));
      }
      return out;
    }
  };

  this.clean = (val) => {
    var out = val;
    while (val.length != 1) {
      out = [];
      var left = val[0],
        right = val[1];
      if (!Array.isArray(left) && !Array.isArray(right)) { // both json objects, not arrays
        out.push(this.merge(left, right));
        if (val.slice(2).length > 0) { //all but first 2 elems
          out.push(val.slice(2));
        }
      } else {
        for (var i = 0; i < val.length; i++) {
          var elem = val[i];
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

  this.postClean = (out0) => out0;

  this.toCardinal = (value) => {
    var val = this.splitnum(value);
    var preWords = Object.keys(this.clean(val))[0];
    var words = this.postClean(preWords);
    return words;
  };
}