export default function() {
    // Num2Word_Base.call(this);
    this.feminine = false
    this.ZERO = "ноль"
    this.ONES = {1: "один", 2: "два", 3: "три", 4: "четыре", 5: "пять", 6: "шесть", 7: "семь", 8: "восемь", 9: "девять"}
    this.ONES_FEMININE = {1: "одна", 2: "две", 3: "три", 4: "четыре", 5: "пять", 6: "шесть", 7: "семь", 8: "восемь", 9: "девять"}
    this.TENS = {0: "десять", 1: "одиннадцать", 2: "двенадцать", 3: "тринадцать", 4: "четырнадцать", 5: "пятнадцать", 6: "шестнадцать", 7: "семнадцать", 8: "восемнадцать", 9: "девятнадцать"}
    this.TWENTIES = {2: "двадцать", 3: "тридцать", 4: "сорок", 5: "пятьдесят", 6: "шестьдесят", 7: "семьдесят", 8: "восемьдесят", 9: "девяносто"}
    this.HUNDREDS = {1: "сто", 2: "двести", 3: "триста", 4: "четыреста", 5: "пятьсот", 6: "шестьсот", 7: "семьсот", 8: "восемьсот", 9: "девятьсот"}
    this.THOUSANDS = {
      1: ['тысяча', 'тысячи', 'тысяч'], // 10^ 3
      2: ['миллион', 'миллиона', 'миллионов'], // 10^ 6
      3: ['миллиард', 'миллиарда', 'миллиардов'], // 10^ 9
      4: ['триллион', 'триллиона', 'триллионов'], // 10^ 12
      5: ['квадриллион', 'квадриллиона', 'квадриллионов'], // 10^ 15
      6: ['квинтиллион', 'квинтиллиона', 'квинтиллионов'], // 10^ 18
      7: ['секстиллион', 'секстиллиона', 'секстиллионов'], // 10^ 21
      8: ['септиллион', 'септиллиона', 'септиллионов'], // 10^ 24
      9: ['октиллион', 'октиллиона', 'октиллионов'], // 10^ 27
      10: ['нониллион', 'нониллиона', 'нониллионов'] // 10^ 30
    }
  
    this.splitbyx = (n, x, format_int = true) => {
      var results = []
      var l = n.length
      var result;
      if (l > x) {
        var start = l % x
        if (start > 0) {
          result = n.slice(0, start)
          if (format_int) {results.push(parseInt(result));} else {results.push(result);}
        }
        for (let i = start; i < l; i += x) {
          result = n.slice(i, i+x)
          if (format_int) {results.push(parseInt(result));} else {results.push(result);}
        }
      } else {
        if (format_int) {results.push(parseInt(n));} else {results.push(n);}
      }
      return results
    }
  
    this.get_digits = (n) => {
      var a = Array.from(JSON.stringify(n).padStart(3, '0').slice(-3)).reverse()
      return a.map(e => parseInt(e))
    }
  
    this.pluralize = (n, forms) => {
      var form = 2
      if ((n % 100 < 10) || (n % 100 > 20)) {
        if (n % 10 == 1) { 
          form = 0
        } else if ((5 > n % 10) && (n % 10 > 1)) {
          form = 1
        }
      }
      return forms[form]
    }
  
    this.toCardinal = (number) => {
      if (parseInt(number) == 0) {
        return this.ZERO
      }
      var words = []
      var chunks = this.splitbyx(JSON.stringify(number), 3)
      var i = chunks.length
      for (let j = 0; j < chunks.length; j++) {
        var x = chunks[j];
        var ones = []
        i = i - 1
        if (x == 0) { continue; }
        var [n1, n2, n3] = this.get_digits(x)
        if (n3 > 0) { words.push(this.HUNDREDS[n3]); }
        if (n2 > 1) { words.push(this.TWENTIES[n2]); }
        if (n2 == 1) { words.push(this.TENS[n1]); }
        else if (n1 > 0) {
          var ones = (i == 1 || this.feminine && i == 0) ? this.ONES_FEMININE : this.ONES
          words.push(ones[n1])
        }
        if (i > 0) {
          words.push(this.pluralize(x, this.THOUSANDS[i]))
        }
      }
      return words.join(' ')
    }
  }