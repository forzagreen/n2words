"use strict";
exports = module.exports = n2words;


const supportedLanguages = ['en', 'fr', 'es', 'de']

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

  var num = eval(`new Num2Word_${lang}()`);
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

  this.toCardinal = (value) => {
    var val = this.splitnum(value)
    var words = Object.keys(this.clean(val))[0]
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

  this.cards = [{ "1000000000000000000000000000": 'quadrilliarde' }, { "1000000000000000000000000": 'quadrillion' }, { "1000000000000000000000": 'trilliarde' }, { "1000000000000000000": 'trillion' }, { "1000000000000000": 'billiarde' }, { "1000000000000": 'billion' }, { "1000000000": 'milliarde' }, { "1000000": 'million' }, { "1000": 'tausend' }, { "100": 'hundert' }, { "90": 'neunzig' }, { "80": 'achtzig' }, { "70": 'siebzig' }, { "60": 'sechzig' }, { "50": 'fünfzig' }, { "40": 'vierzig' }, { "30": 'dreißig' }, { "20": 'zwanzig' }, { "19": 'neunzehn' }, { "18": 'achtzehn' }, { "17": 'siebzehn' }, { "16": 'sechzehn' }, { "15": 'fünfzehn' }, { "14": 'vierzehn' }, { "13": 'dreizehn' }, { "12": 'zwölf' }, { "11": 'elf' }, { "10": 'zehn' }, { "9": 'neun' }, { "8": 'acht' }, { "7": 'sieben' }, { "6": 'sechs' }, { "5": 'fünf' }, { "4": 'vier' }, { "3": 'drei' }, { "2": 'zwei' }, { "1": 'eins' }, { "0": 'null' }]
  this.merge = (curr, next) => {
    var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
    var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
    if (cnum == 1) {
      if (nnum == 100 || nnum == 1000) return { [`ein${ntext}`]: nnum }
      else if (nnum < 1000000) return { [ntext]: nnum }
      ctext = "eine"
    }

    var val;
    if (nnum > cnum) {
      if (nnum >= 1000000) {
        if (cnum > 1) {
          if (ntext[ntext.length - 1] == "e") ntext += "n"
          else ntext += "en"
        }
        ctext += " "
      }
      val = cnum * nnum

    } else {
      if (nnum < 10 && 10 < cnum && cnum < 100) {
        if (nnum == 1) ntext = "ein"
        ntext, ctext = ctext, ntext + "und"
      } else if (cnum >= 1000000) {
        ctext += " "
      }
      val = cnum + nnum
    }

    return { [`${ctext}${ntext}`]: val }
  }
}