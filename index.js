"use strict";
exports = module.exports = num2words;

var cards = [{ "1000000000": 'billion' }, { "1000000": 'million' }, { "1000": 'thousand' }, { "100": 'hundred' }, { "90": 'ninety' }, { "80": 'eighty' }, { "70": 'seventy' }, { "60": 'sixty' }, { "50": 'fifty' }, { "40": 'forty' }, { "30": 'thirty' }, { "20": 'twenty' }, { "19": 'nineteen' }, { "18": 'eighteen' }, { "17": 'seventeen' }, { "16": 'sixteen' }, { "15": 'fifteen' }, { "14": 'fourteen' }, { "13": 'thirteen' }, { "12": 'twelve' }, { "11": 'eleven' }, { "10": 'ten' }, { "9": 'nine' }, { "8": 'eight' }, { "7": 'seven' }, { "6": 'six' }, { "5": 'five' }, { "4": 'four' }, { "3": 'three' }, { "2": 'two' }, { "1": 'one' }, { "0": 'zero' }]
function getValueFromCards(elem) { //100
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].hasOwnProperty(elem)) { return cards[i][elem] }
  }
}
function splitnum(value) {
  for (var i = 0; i < cards.length; i++) {
    var elem = parseInt(Object.keys(cards[i])[0]) //100
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
      out.push({ [getValueFromCards(1)]: 1 }) //'one'
    } else {
      if (div == value) {
        return [(div * getValueFromCards(elem), div * elem)]
      }
      out.push(splitnum(div))
    }
    out.push({ [getValueFromCards(elem)]: elem })

    if (mod) {
      out.push(splitnum(mod))
    }
    return out
  }
}

// JSON.stringify(splitnum(34))   // [{"one":1},{"thirty":30},[{"one":1},{"four":4}]]
// JSON.stringify(splitnum(124))  // [{"one":1},{"hundred":100},[{"one":1},{"twenty":20},[{"one":1},{"four":4}]]]
// JSON.stringify(splitnum(3408)) // [[{"one":1},{"three":3}],{"thousand":1000},[[{"one":1},{"four":4}],{"hundred":100},[{"one":1},{"eight":8}]]]

function merge(lpair, rpair) { //{'one':1}, {'hundred':100}
  var ltext = Object.keys(lpair)[0], lnum = parseInt(Object.values(lpair)[0])
  var rtext = Object.keys(rpair)[0], rnum = parseInt(Object.values(rpair)[0])
  if (lnum == 1 && rnum < 100) return { [rtext]: rnum }
  else if (100 > lnum && lnum > rnum) return { [`${ltext}-${rtext}`]: lnum + rnum }
  else if (lnum >= 100 && 100 > rnum) return { [`${ltext} and ${rtext}`]: lnum + rnum }
  else if (rnum > lnum) return { [`${ltext} ${rtext}`]: lnum * rnum }
  return { [`${ltext} ${rtext}`]: lnum + rnum }
}

// merge({ 'one': 1 }, { 'hundred': 100 })      // {'one hundred': 100}
// merge({ 'one hundred': 100 }, { 'one': 1 })  // {'one hundred and one': 101}

function clean(val) {
  var out = val
  while (val.length != 1) {
    out = []
    var left = val[0], right = val[1]
    if (!Array.isArray(left) && !Array.isArray(right)) { // both json objects, not arrays
      out.push(merge(left, right))
      if (val.slice(2).length > 0) { //all but first 2 elems
        out.push(val.slice(2))
      }
    } else {
      for (var i = 0; i < val.length; i++) {
        var elem = val[i]
        if (Array.isArray(elem)) {
          if (elem.length == 1) out.push(elem[0])
          else out.push(clean(elem))
        } else {
          out.push(elem)
        }
      }
    }
    val = out
  }
  return out[0]
}

// clean(splitnum(12))     // {twelve: 12}
// clean(splitnum(198))    // {'one hundred and ninety-eight': 198}
// clean(splitnum(12354))  // {'twelve thousand three hundred and fifty-four': 12354}


function toCardinal(value) {
  var val = splitnum(value)
  var words = Object.keys(clean(val))[0]
  return words
}

/**
 * Converts numbers to their written form.
 *
 * @param {Number} n The number to convert
 */

function num2words(n) {
  return toCardinal(n);
}

