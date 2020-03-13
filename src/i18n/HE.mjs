import Num2Word_RU from './RU.mjs';

export default function() {
  Num2Word_RU.call(this);
  this.ZERO = 'אפס';
  this.AND = 'ו';
  this.ONES = { 1: 'אחת', 2: 'שתים', 3: 'שלש', 4: 'ארבע', 5: 'חמש', 6: 'שש', 7: 'שבע', 8: 'שמונה', 9: 'תשע' };
  this.TENS = { 0: 'עשר', 1: 'אחת עשרה', 2: 'שתים עשרה', 3: 'שלש עשרה', 4: 'ארבע עשרה', 5: 'חמש עשרה', 6: 'שש עשרה', 7: 'שבע עשרה', 8: 'שמונה עשרה', 9: 'תשע עשרה' };
  this.TWENTIES = { 2: 'עשרים', 3: 'שלשים', 4: 'ארבעים', 5: 'חמישים', 6: 'ששים', 7: 'שבעים', 8: 'שמונים', 9: 'תשעים' };
  this.HUNDREDS = { 1: 'מאה', 2: 'מאתיים', 3: 'מאות' };
  this.THOUSANDS = { 1: 'אלף', 2: 'אלפיים', 3: 'שלשת אלפים', 4: 'ארבעת אלפים', 5: 'חמשת אלפים', 6: 'ששת אלפים', 7: 'שבעת אלפים', 8: 'שמונת אלפים', 9: 'תשעת אלפים' };
  this.toCardinal = (number) => {
    if (parseInt(number) == 0) {
      return this.ZERO;
    }
    var words = [];
    var chunks = this.splitbyx(JSON.stringify(number), 3);
    var i = chunks.length;
    for (let j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      i = i - 1;
      if (x == 0) { continue; }
      var [n1, n2, n3] = this.get_digits(x);
      if (i > 0) {
        words.push(this.THOUSANDS[n1]);
        continue;
      }
      if (n3 > 0) {
        if (n3 <= 2) {
          words.push(this.HUNDREDS[n3]);
        } else {
          words.push(this.ONES[n3] + ' ' + this.HUNDREDS[3]);
        }
      }
      if (n2 > 1) { words.push(this.TWENTIES[n2]); }
      if (n2 == 1) { words.push(this.TENS[n1]); }
      else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(this.ONES[n1]);
      }
      if (i > 0) {
        words.push(this.THOUSANDS[i]);
      }
    }
    if (words.length > 1) {
      words[words.length - 1] = this.AND + words[words.length - 1];
    }
    return words.join(' ');
  };
}
