"use strict";
exports = module.exports = n2words;

var supportedLanguages = ['en', 'fr', 'es', 'de', 'pt', 'it', 'tr', 'ru', 'cz', 'no', 'dk']

/**
 * Converts numbers to their written form.
 *
 * @param {Number} n The number to convert
 */

function n2words(n, options) {
  var lang = "EN";        // default language
  if (options) {     
    if(options.lang) {    // lang is given in options
      if (supportedLanguages.indexOf(options.lang) != -1) lang = options.lang.toUpperCase()
      else throw Error(`ERROR: Unsupported language. Supported languages are: ${supportedLanguages}`)
    }
  }

  let num;
  if (lang === 'EN') {
    num = new Num2Word_EN();
  } else if (lang === 'FR') {
    num = new Num2Word_FR();
  } else if (lang === 'ES') {
    num = new Num2Word_ES();
  } else if (lang === 'DE') {
    num = new Num2Word_DE();
  } else if (lang === 'PT') {
    num = new Num2Word_PT();
  } else if (lang === 'IT') {
    num = new Num2Word_IT();
  } else if (lang === 'TR') {
    num = new Num2Word_TR();
  } else if (lang === 'RU') {
    num = new Num2Word_RU();
  } else if (lang === 'CZ') {
    num = new Num2Word_CZ();
  } else if (lang === 'NO') {
    num = new Num2Word_NO();
  } else if (lang === 'DK') {
    num = new Num2Word_DK();
  }
  return num.toCardinal(n);
}

/* ================================ CLASSES ================================ */


function Num2Word_Base() {

  this.getValueFromCards = (elem) => { //100
    for (var i = 0; i < this.cards.length; i++) {
      if (this.cards[i].hasOwnProperty(elem)) { return this.cards[i][elem] }
    }
  }

  this.splitnum = (value) => {
    for (var i = 0; i < this.cards.length; i++) {
      var elem = parseInt(Object.keys(this.cards[i])[0]) //100
      if (elem > value) { continue; }
      var out = []
      var div, mod
      if (value == 0) {
        div = 1
        mod = 0
      } else {
        div = Math.floor(value / elem)
        mod = value % elem
      }
      if (div == 1) {
        out.push({ [this.getValueFromCards(1)]: 1 }) //'one'
      } else {
        if (div == value) {
          return [(div * this.getValueFromCards(elem), div * elem)]
        }
        out.push(this.splitnum(div))
      }
      out.push({ [this.getValueFromCards(elem)]: elem })

      if (mod) {
        out.push(this.splitnum(mod))
      }
      return out
    }
  }

  this.clean = (val) => {
    var out = val
    while (val.length != 1) {
      out = []
      var left = val[0], right = val[1]
      if (!Array.isArray(left) && !Array.isArray(right)) { // both json objects, not arrays
        out.push(this.merge(left, right))
        if (val.slice(2).length > 0) { //all but first 2 elems
          out.push(val.slice(2))
        }
      } else {
        for (var i = 0; i < val.length; i++) {
          var elem = val[i]
          if (Array.isArray(elem)) {
            if (elem.length == 1) out.push(elem[0])
            else out.push(this.clean(elem))
          } else {
            out.push(elem)
          }
        }
      }
      val = out
    }
    return out[0]
  }

  this.postClean = (out0) => out0

  this.toCardinal = (value) => {
    var val = this.splitnum(value)
    var preWords = Object.keys(this.clean(val))[0]
    var words = this.postClean(preWords)
    return words
  }
}

function Num2Word_EN() {
  Num2Word_Base.call(this);

  this.cards = [{"1000000000000000000000000000": 'octillion'}, {"1000000000000000000000000": 'septillion'}, {"1000000000000000000000": 'sextillion'}, {"1000000000000000000": 'quintillion'}, { "1000000000000000": 'quadrillion' }, { "1000000000000": 'trillion' }, { "1000000000": 'billion' }, { "1000000": 'million' }, { "1000": 'thousand' }, { "100": 'hundred' }, { "90": 'ninety' }, { "80": 'eighty' }, { "70": 'seventy' }, { "60": 'sixty' }, { "50": 'fifty' }, { "40": 'forty' }, { "30": 'thirty' }, { "20": 'twenty' }, { "19": 'nineteen' }, { "18": 'eighteen' }, { "17": 'seventeen' }, { "16": 'sixteen' }, { "15": 'fifteen' }, { "14": 'fourteen' }, { "13": 'thirteen' }, { "12": 'twelve' }, { "11": 'eleven' }, { "10": 'ten' }, { "9": 'nine' }, { "8": 'eight' }, { "7": 'seven' }, { "6": 'six' }, { "5": 'five' }, { "4": 'four' }, { "3": 'three' }, { "2": 'two' }, { "1": 'one' }, { "0": 'zero' }]

  this.merge = (lpair, rpair) => { //{'one':1}, {'hundred':100}
    var ltext = Object.keys(lpair)[0], lnum = parseInt(Object.values(lpair)[0])
    var rtext = Object.keys(rpair)[0], rnum = parseInt(Object.values(rpair)[0])
    if (lnum == 1 && rnum < 100) return { [rtext]: rnum }
    else if (100 > lnum && lnum > rnum) return { [`${ltext}-${rtext}`]: lnum + rnum }
    else if (lnum >= 100 && 100 > rnum) return { [`${ltext} and ${rtext}`]: lnum + rnum }
    else if (rnum > lnum) return { [`${ltext} ${rtext}`]: lnum * rnum }
    return { [`${ltext} ${rtext}`]: lnum + rnum }
  }

}

function Num2Word_FR() {
  Num2Word_Base.call(this);

  this.cards = [{"1000000000000000000000000000": 'quadrilliard'}, {"1000000000000000000000000": 'quadrillion'}, {"1000000000000000000000": 'trilliard'}, {"1000000000000000000": 'trillion'},{ "1000000000000000": 'billiard' }, { "1000000000000": 'billion' }, { "1000000000": 'milliard' }, { "1000000": 'million' }, { "1000": 'mille' }, { "100": 'cent' }, { "80": 'quatre-vingts' }, { "60": 'soixante' }, { "50": 'cinquante' }, { "40": 'quarante' }, { "30": 'trente' }, { "20": 'vingt' }, { "19": 'dix-neuf' }, { "18": 'dix-huit' }, { "17": 'dix-sept' }, { "16": 'seize' }, { "15": 'quinze' }, { "14": 'quatorze' }, { "13": 'treize' }, { "12": 'douze' }, { "11": 'onze' }, { "10": 'dix' }, { "9": 'neuf' }, { "8": 'huit' }, { "7": 'sept' }, { "6": 'six' }, { "5": 'cinq' }, { "4": 'quatre' }, { "3": 'trois' }, { "2": 'deux' }, { "1": 'un' }, { "0": 'zéro' }]
  this.merge = (curr, next) => { // {'cent':100}, {'vingt-cinq':25}
    var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
    var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
    if (cnum == 1) {
      if (nnum < 1000000) {
        return { [ntext]: nnum }
      }
    } else {
      if (
        ((cnum - 80) % 100 == 0 || (cnum % 100 == 0 && cnum < 1000))
        && nnum < 1000000
        && ctext[ctext.length - 1] == "s"
      ) {
        ctext = ctext.slice(0, -1) //without last elem
      }
      if (
        cnum < 1000 && nnum != 1000
        && ntext[ntext.length - 1] != "s"
        && nnum % 100 == 0
      ) { 
        ntext += "s" 
      }
    }
    if (nnum < cnum && cnum < 100) {
      if (nnum % 10 == 1 && cnum != 80) return { [`${ctext} et ${ntext}`]: cnum + nnum }
      return { [`${ctext}-${ntext}`]: cnum + nnum }
    }
    if (nnum > cnum) return { [`${ctext} ${ntext}`]: cnum * nnum }
    return { [`${ctext} ${ntext}`]: cnum + nnum }
  }
}

function Num2Word_ES() {
  Num2Word_Base.call(this);

  this.gender_stem = "o"

  this.cards = [{ "1000000000000000000000000": 'cuatrillón' }, { "1000000000000000000": 'trillón' }, { "1000000000000": 'billón' }, { "1000000": 'millón' }, { "1000": 'mil' }, { "100": 'cien' }, { "90": 'noventa' }, { "80": 'ochenta' }, { "70": 'setenta' }, { "60": 'sesenta' }, { "50": 'cincuenta' }, { "40": 'cuarenta' }, { "30": 'treinta' }, { "29": 'veintinueve' }, { "28": 'veintiocho' }, { "27": 'veintisiete' }, { "26": 'veintiséis' }, { "25": 'veinticinco' }, { "24": 'veinticuatro' }, { "23": 'veintitrés' }, { "22": 'veintidós' }, { "21": 'veintiuno' }, { "20": 'veinte' }, { "19": 'diecinueve' }, { "18": 'dieciocho' }, { "17": 'diecisiete' }, { "16": 'dieciseis' }, { "15": 'quince' }, { "14": 'catorce' }, { "13": 'trece' }, { "12": 'doce' }, { "11": 'once' }, { "10": 'diez' }, { "9": 'nueve' }, { "8": 'ocho' }, { "7": 'siete' }, { "6": 'seis' }, { "5": 'cinco' }, { "4": 'cuatro' }, { "3": 'tres' }, { "2": 'dos' }, { "1": 'uno' }, { "0": 'cero' }]
  this.merge = (curr, next) => {
    var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
    var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
    if (cnum == 1) {
      if (nnum < 1000000) return { [ntext]: nnum }
      ctext = "un"
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext += "t" + this.gender_stem
    }

    if (nnum < cnum) {
      if (cnum < 100) {
        return { [`${ctext} y ${ntext}`]: cnum + nnum }
      }
      return { [`${ctext} ${ntext}`]: cnum + nnum }
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -3) + "lones"
    }

    if (nnum == 100) {
      if (cnum == 5) {
        ctext = "quinien"
        ntext = ""
      } else if (cnum == 7) {
        ctext = "sete"
      } else if (cnum == 9) {
        ctext = "nove"
      }
      ntext += "t" + this.gender_stem + "s"
    } else {
      ntext = " " + ntext
    }
    return { [`${ctext}${ntext}`]: cnum * nnum }
  }
}

function Num2Word_DE() {
  Num2Word_Base.call(this);

  this.cards = [{ "1000000000000000000000000000": 'Quadrilliarde' }, { "1000000000000000000000000": 'Quadrillion' }, { "1000000000000000000000": 'Trilliarde' }, { "1000000000000000000": 'Trillion' }, { "1000000000000000": 'Billiarde' }, { "1000000000000": 'Billion' }, { "1000000000": 'Milliarde' }, { "1000000": 'Million' }, { "1000": 'tausend' }, { "100": 'hundert' }, { "90": 'neunzig' }, { "80": 'achtzig' }, { "70": 'siebzig' }, { "60": 'sechzig' }, { "50": 'fünfzig' }, { "40": 'vierzig' }, { "30": 'dreißig' }, { "20": 'zwanzig' }, { "19": 'neunzehn' }, { "18": 'achtzehn' }, { "17": 'siebzehn' }, { "16": 'sechzehn' }, { "15": 'fünfzehn' }, { "14": 'vierzehn' }, { "13": 'dreizehn' }, { "12": 'zwölf' }, { "11": 'elf' }, { "10": 'zehn' }, { "9": 'neun' }, { "8": 'acht' }, { "7": 'sieben' }, { "6": 'sechs' }, { "5": 'fünf' }, { "4": 'vier' }, { "3": 'drei' }, { "2": 'zwei' }, { "1": 'eins' }, { "0": 'null' }]
  this.merge = (curr, next) => {
    var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
    var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
    if (cnum == 1) {
      if (nnum == 100 || nnum == 1000) {
        return { [`ein${ntext}`]: nnum }
      }
      else if (nnum < 1000000) {
        return { [ntext]: nnum }
      }
      ctext = "eine"
    }

    var val = 0;
    if (nnum > cnum) {
      if (nnum >= 1000000) {
        if (cnum > 1) {
          if (ntext[ntext.length - 1] == "e") {
            ntext += "n"
          } else {
            ntext += "en"
          }
        }
        ctext += " "
      }
      val = cnum * nnum

    } else {
      if (nnum < 10 && 10 < cnum && cnum < 100) {
        if (nnum == 1) {
          ntext = "ein"
        }
        var temp = ntext
        ntext = ctext
        ctext = `${temp}und`
      } else if (cnum >= 1000000) {
        ctext += " "
      }
      val = cnum + nnum
    }

    return { [`${ctext}${ntext}`]: val }
  }
}

function Num2Word_PT() {
  Num2Word_Base.call(this);

  this.cards = [{ "1000000000000000000000000": 'quatrilião' }, { "1000000000000000000": 'trilião' }, { "1000000000000": 'bilião' }, { "1000000": 'milião' }, { "1000": 'mil' }, { "100": 'cem' }, { "90": 'noventa' }, { "80": 'oitenta' }, { "70": 'setenta' }, { "60": 'sessenta' }, { "50": 'cinquenta' }, { "40": 'quarenta' }, { "30": 'trinta' }, { "20": 'vinte' }, { "19": 'dezanove' }, { "18": 'dezoito' }, { "17": 'dezassete' }, { "16": 'dezasseis' }, { "15": 'quinze' }, { "14": 'catorze' }, { "13": 'treze' }, { "12": 'doze' }, { "11": 'onze' }, { "10": 'dez' }, { "9": 'nove' }, { "8": 'oito' }, { "7": 'sete' }, { "6": 'seis' }, { "5": 'cinco' }, { "4": 'quatro' }, { "3": 'três' }, { "2": 'dois' }, { "1": 'um' }, {"0":'zero'}];
  this.hundreds = { "1": "cento", "2": "duzentos", "3": "trezentos", "4": "quatrocentos", "5": "quinhentos", "6": "seiscentos", "7": "setecentos", "8": "oitocentos", "9": "novecentos" };

  this.postClean = (words) => {
    const transforms = ['mil', 'milhão', 'milhões', 'mil milhões', 'bilião', 'biliões', 'mil biliões']
    for (let i = 0; i < transforms.length; i++) {
      const ext = transforms[i];
      if (words.match(new RegExp(`.*${ext} e \\w*entos? (?=.*e)`))) {
        words = words.replace(new RegExp(`${ext} e`, 'g'), `${ext}`)
      }
    }
    return words
  }

  this.merge = (curr, next) => {
    var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
    var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
    if (cnum == 1) {
      if (nnum < 1000000) return { [ntext]: nnum }
      ctext = "um"
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext = "cento"
    }

    if (nnum < cnum) {
      // if (cnum < 100) {
      //   return { [`${ctext} e ${ntext}`]: cnum + nnum }
      // }
      return { [`${ctext} e ${ntext}`]: cnum + nnum }
    } else if (nnum % 1000000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + "liões"
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + "lhões"
    }

    if (ntext == 'milião') ntext = 'milhão'

    if (nnum == 100) {
      ctext = this.hundreds[cnum]
      ntext = ""
    } else {
      ntext = " " + ntext
    }
    return { [`${ctext}${ntext}`]: cnum * nnum }
  }
}

function Num2Word_IT() {
  const ZERO = "zero"
  const CARDINAL_WORDS = [
    ZERO, "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto",
    "nove", "dieci", "undici", "dodici", "tredici", "quattordici", "quindici",
    "sedici", "diciassette", "diciotto", "diciannove"
  ]
  const STR_TENS = { "2": "venti", "3": "trenta", "4": "quaranta", "6": "sessanta" }
  const EXPONENT_PREFIXES = [ZERO, "m", "b", "tr", "quadr", "quint", "sest", "sett", "ott", "nov", "dec"]

  this.accentuate = (string) => {
    var splittedString = string.split(' ');

    const result = splittedString.map((word) => {
      if (word.slice(-3) == "tre" && word.length > 3) return word.replace(/tré/g, 'tre').slice(0, -3) + 'tré';
      else return word.replace(/tré/g, 'tre')
    });
    return result.join(' ')
  }

  this.omitIfZero = (numberToString) => {
    if (numberToString == ZERO) {
      return ""
    } else {
      return numberToString
    }
  }

  this.phoneticContraction = (string) => {
    return string.replace(/oo/g, 'o').replace(/ao/g, 'o').replace(/io/g, 'o').replace(/au/g, 'u').replace(/iu/g, 'u')
  }

  this.tensToCardinal = (number) => {
    var tens = Math.floor(number / 10);
    var units = number % 10
    var prefix
    if (STR_TENS.hasOwnProperty(tens)) {
      prefix = STR_TENS[tens]
    } else {
      prefix = CARDINAL_WORDS[tens].slice(0, -1) + "anta"
    }
    var postfix = this.omitIfZero(CARDINAL_WORDS[units])
    return this.phoneticContraction(prefix + postfix)
  }

  this.hundredsToCardinal = (number) => {
    var hundreds = Math.floor(number / 100);
    var prefix = "cento"
    if (hundreds != 1) {
      prefix = CARDINAL_WORDS[hundreds] + prefix
    }
    var postfix = this.omitIfZero(this.toCardinal(number % 100))
    return this.phoneticContraction(prefix + postfix)
  }

  this.thousandsToCardinal = (number) => {
    var thousands = Math.floor(number / 1000);
    var prefix;
    if (thousands == 1) {
      prefix = "mille"
    } else {
      prefix = this.toCardinal(thousands) + 'mila'
    }
    var postfix = this.omitIfZero(this.toCardinal(number % 1000))
    return prefix + postfix
  }

  this.exponentLengthToString = (exponentLength) => {
    var prefix = EXPONENT_PREFIXES[Math.floor(exponentLength / 6)]
    if (exponentLength % 6 == 0) {
      return prefix + 'ilione'
    } else {
      return prefix + 'iliardo'
    }
  }

  this.bigNumberToCardinal = (number) => {
    var digits = Array.from(String(number))
    var predigits = (digits.length % 3 == 0) ? 3 : digits.length % 3
    var multiplier = digits.slice(0, predigits); // first `predigits` elements
    var exponent = digits.slice(predigits); // without the first `predigits` elements
    var prefix, postfix;
    var infix = this.exponentLengthToString(exponent.length)
    if (multiplier.toString() == "1") {
      prefix = "un "
    } else {
      prefix = this.toCardinal(parseInt(multiplier.join('')))
      infix = " " + infix.slice(0,-1) + "i"; // without last element
    }
    var isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
    if (!isSetsEqual(new Set(exponent), new Set(['0']))) {
      postfix = this.toCardinal(parseInt(exponent.join('')))
      if (postfix.includes(' e ')) {
        infix += ", " // for very large numbers
      } else {
        infix += " e "
      }
    } else {
      postfix = ''
    }
    return prefix + infix + postfix
  }

  this.toCardinal = (number) => {
    var words = ""

    if (number < 20) {
      words = CARDINAL_WORDS[number]
    } else if (number < 100) {
      words = this.tensToCardinal(number)
    } else if (number < 1000) {
      words = this.hundredsToCardinal(number)
    } else if (number < 1000000) {
      words = this.thousandsToCardinal(number)
    } else {
      words = this.bigNumberToCardinal(number)
    }

    return this.accentuate(words)
  }
}

function Num2Word_TR() {
  this.precision = 2
  this.splitnum = (value) => {
    var float_digits = JSON.stringify(value * 10 ** this.precision)
    if (parseInt(value) != 0) {
      this.integers_to_read = [
        JSON.stringify(parseInt(value)),
        float_digits.slice(float_digits.length - this.precision, float_digits.length)
      ]
    }
    else {
      this.integers_to_read = [
        "0",
        "0".repeat(this.precision - float_digits.length) + float_digits.slice(float_digits.length - this.precision, float_digits.length)
      ]
    }
    if (this.integers_to_read[0].length % 3 > 0) {
      this.total_triplets_to_read = Math.floor(this.integers_to_read[0].length / 3) + 1
    }
    else if (this.integers_to_read[0].length % 3 == 0) {
      this.total_triplets_to_read = Math.floor(this.integers_to_read[0].length / 3)
    }
    this.total_digits_outside_triplets = this.integers_to_read[0].length % 3

    var okunacak = this.integers_to_read[0].split("").reverse()
    this.order_of_last_zero_digit = 0
    var found = 0
    for (let i = 0; i < okunacak.length; i++) {
      if (parseInt(okunacak[i]) == 0 && found == 0) {
        this.order_of_last_zero_digit = i + 1
      } else {
        found = 1
      }
    }
  }

  this.CARDINAL_ONES = {
    "1": "bir",
    "2": "iki",
    "3": "üç",
    "4": "dört",
    "5": "beş",
    "6": "altı",
    "7": "yedi",
    "8": "sekiz",
    "9": "dokuz"
  }
  this.CARDINAL_TENS = {
    "1": "on",
    "2": "yirmi",
    "3": "otuz",
    "4": "kırk",
    "5": "elli",
    "6": "altmış",
    "7": "yetmiş",
    "8": "seksen",
    "9": "doksan"
  }
  this.HUNDREDS = {
    "2": "iki",
    "3": "üç",
    "4": "dört",
    "5": "beş",
    "6": "altı",
    "7": "yedi",
    "8": "sekiz",
    "9": "dokuz"
  }
  this.CARDINAL_HUNDRED = ["yüz", ""]
  this.CARDINAL_TRIPLETS = {
    1: "bin",
    2: "milyon",
    3: "milyar",
    4: "trilyon",
    5: "katrilyon",
    6: "kentilyon"
  }
  this.integers_to_read = []
  this.total_triplets_to_read = 0
  this.total_digits_outside_triplets = 0
  this.order_of_last_zero_digit = 0

  this.toCardinal = (value) => {
    if (parseInt(value) == 0) {
      return "sıfır"
    }
    this.splitnum(value)
    var wrd = ""
    if (this.order_of_last_zero_digit >= this.integers_to_read[0].length) {
      return wrd
    }
    if (this.total_triplets_to_read == 1) {
      if (this.total_digits_outside_triplets == 2) {
        if (this.order_of_last_zero_digit == 1) {
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][0]] || ""
          return wrd
        }
        if (this.order_of_last_zero_digit == 0) {
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_ONES[this.integers_to_read[0][1]] || ""
        }
        return wrd
      }
      if (this.total_digits_outside_triplets == 1) {
        if (this.order_of_last_zero_digit == 0) {
          wrd += this.CARDINAL_ONES[this.integers_to_read[0][0]] || ""
          return wrd
        }
      }
      if (this.total_digits_outside_triplets == 0) {
        if (this.order_of_last_zero_digit == 2) {
          wrd += this.HUNDREDS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_HUNDRED[0]
          return wrd
        }
        if (this.order_of_last_zero_digit == 1) {
          wrd += this.HUNDREDS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_HUNDRED[0]
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][1]] || ""
          return wrd
        }
        if (this.order_of_last_zero_digit == 0) {
          wrd += this.HUNDREDS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_HUNDRED[0]
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][1]] || ""
          wrd += this.CARDINAL_ONES[this.integers_to_read[0][2]] || ""
          return wrd
        }
      }
    }
    if (this.total_triplets_to_read >= 2) {
      if (this.total_digits_outside_triplets == 2) {
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 1) {
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
          return wrd
        }
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 2) {
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_ONES[this.integers_to_read[0][1]] || ""
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
          return wrd
        }
        if (this.order_of_last_zero_digit < this.integers_to_read[0].length - 2) {
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_ONES[this.integers_to_read[0][1]] || ""
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
        }
      }
      if (this.total_digits_outside_triplets == 1) {
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 1) {
          if (!(this.total_triplets_to_read == 2 && this.integers_to_read[0][0] == "1")) {
            wrd += this.CARDINAL_ONES[this.integers_to_read[0][0]] || ""
          }
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
          return wrd
        }
        if (this.order_of_last_zero_digit < this.integers_to_read[0].length - 1) {
          if (!(this.total_triplets_to_read == 2 && this.integers_to_read[0][0] == "1")) {
            wrd += this.CARDINAL_ONES[this.integers_to_read[0][0]] || ""
          }
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
        }
      }
      if (this.total_digits_outside_triplets == 0) {
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 1) {
          wrd += this.HUNDREDS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_HUNDRED[0]
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
          return wrd
        }
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 2) {
          wrd += this.HUNDREDS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_HUNDRED[0]
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][1]] || ""
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
          return wrd
        }
        if (this.order_of_last_zero_digit == this.integers_to_read[0].length - 3) {
          wrd += this.HUNDREDS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_HUNDRED[0]
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][1]] || ""
          wrd += this.CARDINAL_ONES[this.integers_to_read[0][2]] || ""
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
          return wrd
        }
        if (this.order_of_last_zero_digit < this.integers_to_read[0].length - 3) {
          wrd += this.HUNDREDS[this.integers_to_read[0][0]] || ""
          wrd += this.CARDINAL_HUNDRED[0]
          wrd += this.CARDINAL_TENS[this.integers_to_read[0][1]] || ""
          if (!(this.total_triplets_to_read == 2 && this.integers_to_read[0][2] == "1")) {
            wrd += this.CARDINAL_ONES[this.integers_to_read[0][2]] || ""
          }
          wrd += this.CARDINAL_TRIPLETS[this.total_triplets_to_read - 1]
        }

      }
      for (let i = this.total_triplets_to_read - 1; i > 0; i--) {
        var reading_triplet_order = this.total_triplets_to_read - i
        if (this.total_digits_outside_triplets == 0) {
          var last_read_digit_order = reading_triplet_order * 3
        } else {
          last_read_digit_order = (reading_triplet_order - 1) * 3 + this.total_digits_outside_triplets
        }
        if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 3) != "000") {
          if (this.integers_to_read[0][last_read_digit_order] != "0") {
            wrd += this.HUNDREDS[this.integers_to_read[0][last_read_digit_order]] || ""
            if (this.order_of_last_zero_digit == this.integers_to_read[0].length - last_read_digit_order - 1) {
              if (i == 1) {
                wrd += this.CARDINAL_HUNDRED[0]
                return wrd
              } else if (i > 1) {
                wrd += this.CARDINAL_HUNDRED[0]
                wrd += this.CARDINAL_TRIPLETS[i - 1]
                return wrd
              }
            } else {
              wrd += this.CARDINAL_HUNDRED[0]
            }
          }
          if (this.integers_to_read[0][last_read_digit_order + 1] != "0") {
            if (this.order_of_last_zero_digit == this.integers_to_read[0].length - last_read_digit_order - 2) {
              if (i == 1) {
                wrd += this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]] || ""
                return wrd
              } else if (i > 1) {
                wrd += this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]] || ""
                wrd += this.CARDINAL_TRIPLETS[i - 1]
                return wrd
              }
            } else {
              wrd += this.CARDINAL_TENS[this.integers_to_read[0][last_read_digit_order + 1]] || ""
            }
          }
          if (this.integers_to_read[0][last_read_digit_order + 2] != "0") {
            if (this.order_of_last_zero_digit == this.integers_to_read[0].length - last_read_digit_order - 3) {
              if (i == 1) {
                wrd += this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]] || ""
                return wrd
              }
              if (i == 2) {
                if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != "00") {
                  wrd += this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]] || ""
                } else if (this.integers_to_read[0][last_read_digit_order + 2] != "1") {
                  wrd += this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]] || ""
                }
                wrd += this.CARDINAL_TRIPLETS[i - 1]
                return wrd
              }
              if (i > 2) {
                wrd += this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]] || ""
                wrd += this.CARDINAL_TRIPLETS[i - 1]
                return wrd
              }
            }
            else {
              if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != "00") {
                wrd += this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]] || ""
              } else {
                if (i == 2) {
                  if (this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != "00") {
                    wrd += this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]] || ""
                  }
                  else if (this.integers_to_read[0][last_read_digit_order + 2] != "1") {
                    wrd += this.CARDINAL_ONES[this.integers_to_read[0][last_read_digit_order + 2]] || ""
                  }
                }
              }
            }
          }

          wrd += this.CARDINAL_TRIPLETS[i - 1]
        }

      }
    }
    return wrd
  }
  
}

function Num2Word_RU() {
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

function Num2Word_CZ() {
  Num2Word_RU.call(this)

  this.ZERO = "nula"
  this.ONES = {1: "jedna", 2: "dva", 3: "tři", 4: "čtyři", 5: "pět", 6: "šest", 7: "sedm", 8: "osm", 9: "devět"}
  this.TENS = {0: "deset", 1: "jedenáct", 2: "dvanáct", 3: "třináct", 4: "čtrnáct", 5: "patnáct", 6: "šestnáct", 7: "sedmnáct", 8: "osmnáct", 9: "devatenáct"}
  this.TWENTIES = {2: "dvacet", 3: "třicet", 4: "čtyřicet", 5: "padesát", 6: "šedesát", 7: "sedmdesát", 8: "osmdesát", 9: "devadesát"}
  this.HUNDREDS = {1: "sto", 2: "dvěstě", 3: "třista", 4: "čtyřista", 5: "pětset", 6: "šestset", 7: "sedmset", 8: "osmset", 9: "devětset"}
  this.THOUSANDS = {
    1: ['tisíc', 'tisíce', 'tisíc'], // 10^ 3
    2: ['milion', 'miliony', 'milionů'], // 10^ 6
    3: ['miliarda', 'miliardy', 'miliard'], // 10^ 9
    4: ['bilion', 'biliony', 'bilionů'], // 10^ 12
    5: ['biliarda', 'biliardy', 'biliard'], // 10^ 15
    6: ['trilion', 'triliony', 'trilionů'], // 10^ 18
    7: ['triliarda', 'triliardy', 'triliard'], // 10^ 21
    8: ['kvadrilion', 'kvadriliony', 'kvadrilionů'], // 10^ 24
    9: ['kvadriliarda', 'kvadriliardy', 'kvadriliard'], // 10^ 27
    10: ['quintillion', 'quintilliony', 'quintillionů'], // 10^ 30
  }

  this.pluralize = (n, forms) => {
    var form = 2;
    if (n == 1) {
      form = 0
    } else if (((5 > n % 10) && (n % 10 > 1)) && (n % 100 < 10 || n % 100 > 20)) {
      form = 1
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
      else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(this.ONES[n1])
      }
      if (i > 0) {
        words.push(this.pluralize(x, this.THOUSANDS[i]))
      }
    }
    return words.join(' ')
  }
}

function Num2Word_NO() {
  Num2Word_Base.call(this)

  this.cards = [{"1000000000000000000000000000000000": 'quintillard'}, {"1000000000000000000000000000000": 'quintillion'}, {"1000000000000000000000000000": 'quadrillard'}, {"1000000000000000000000000": 'quadrillion'}, {"1000000000000000000000": 'trillard'}, {"1000000000000000000": 'trillion'}, {"1000000000000000": 'billard'}, {"1000000000000": 'billion'}, {"1000000000": 'millard'}, {"1000000": 'million'}, {"1000": 'tusen'}, {"100": 'hundre'}, {"90": 'nitti'}, {"80": 'åtti'}, {"70": 'sytti'}, {"60": 'seksti'}, {"50": 'femti'}, {"40": 'førti'}, {"30": 'tretti'}, {"20": 'tjue'}, {"19": 'nitten'}, {"18": 'atten'}, {"17": 'sytten'}, {"16": 'seksten'}, {"15": 'femten'}, {"14": 'fjorten'}, {"13": 'tretten'}, {"12": 'tolv'}, {"11": 'elleve'}, {"10": 'ti'}, {"9": 'ni'}, {"8": 'åtte'}, {"7": 'syv'}, {"6": 'seks'}, {"5": 'fem'}, {"4": 'fire'}, {"3": 'tre'}, {"2": 'to'}, {"1": 'en'}, {"0": 'null'}]
  this.merge = (lpair, rpair) => { //{'one':1}, {'hundred':100}
    var ltext = Object.keys(lpair)[0], lnum = parseInt(Object.values(lpair)[0])
    var rtext = Object.keys(rpair)[0], rnum = parseInt(Object.values(rpair)[0])
    if (lnum == 1 && rnum < 100) return { [rtext]: rnum }
    else if (100 > lnum && lnum > rnum) return { [`${ltext}-${rtext}`]: lnum + rnum }
    else if (lnum >= 100 && 100 > rnum) return { [`${ltext} og ${rtext}`]: lnum + rnum }
    else if (rnum > lnum) return { [`${ltext} ${rtext}`]: lnum * rnum }
    return { [`${ltext}, ${rtext}`]: lnum + rnum }
  }
}

function Num2Word_DK() {
  Num2Word_Base.call(this);
  this.ordflag = false
  this.cards = [{"1000000000000000000000000000": 'quadrillarder'}, {"1000000000000000000000000": 'quadrillioner'}, {"1000000000000000000000": 'trillarder'}, {"1000000000000000000": 'trillioner'}, {"1000000000000000": 'billarder'}, {"1000000000000": 'billioner'}, {"1000000000": 'millarder'}, {"1000000": 'millioner'}, {"1000": 'tusind'}, {"100": 'hundrede'}, {"90": 'halvfems'}, {"80": 'firs'}, {"70": 'halvfjerds'}, {"60": 'treds'}, {"50": 'halvtreds'}, {"40": 'fyrre'}, {"30": 'tredive'}, {"20": 'tyve'}, {"19": 'nitten'}, {"18": 'atten'}, {"17": 'sytten'}, {"16": 'seksten'}, {"15": 'femten'}, {"14": 'fjorten'}, {"13": 'tretten'}, {"12": 'tolv'}, {"11": 'elleve'}, {"10": 'ti'}, {"9": 'ni'}, {"8": 'otte'}, {"7": 'syv'}, {"6": 'seks'}, {"5": 'fem'}, {"4": 'fire'}, {"3": 'tre'}, {"2": 'to'}, {"1": 'et'}, {"0": 'nul'}]
  this.merge = (curr, next) => {
    var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
    var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
    var val = 1
    if (nnum == 100 || nnum == 1000) { next = { [`et${ntext}`]: nnum } }
    if (cnum == 1) {
      if (nnum < 1000000 || this.ordflag) { return next }
      ctext = "en"
    }
    if (nnum > cnum) {
      if (nnum >= 1000000) { ctext += " " }
      val = cnum * nnum
    } else {
      if (cnum >= 100 && cnum < 1000) {
        ctext += " og "
      } else if (cnum >= 1000 && cnum <= 100000) {
        ctext += "e og "
      }
      if ((nnum < 10) && (10 < cnum) && (cnum < 100)) {
        if (nnum == 1) { ntext = "en" }
        var temp = ntext
        ntext = ctext
        ctext = temp + "og"
      } else if (cnum >= 1000000) { ctext += " " }
      val = cnum + nnum
    }
    var word = ctext + ntext
    return { [`${word}`]: val }
  }
}
