(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["n2words"] = factory();
	else
		root["n2words"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* harmony default export */ __webpack_exports__["a"] = (function () {
  var _this = this;

  this.getValueFromCards = function (elem) {
    //100
    for (var i = 0; i < _this.cards.length; i++) {
      if (_this.cards[i].hasOwnProperty(elem)) {
        return _this.cards[i][elem];
      }
    }
  };

  this.splitnum = function (value) {
    for (var i = 0; i < _this.cards.length; i++) {
      var elem = parseInt(Object.keys(_this.cards[i])[0]); //100

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
        out.push(_defineProperty({}, _this.getValueFromCards(1), 1)); //'one'
      } else {
        if (div == value) {
          return [(div * _this.getValueFromCards(elem), div * elem)];
        }

        out.push(_this.splitnum(div));
      }

      out.push(_defineProperty({}, _this.getValueFromCards(elem), elem));

      if (mod) {
        out.push(_this.splitnum(mod));
      }

      return out;
    }
  };

  this.clean = function (val) {
    var out = val;

    while (val.length != 1) {
      out = [];
      var left = val[0],
          right = val[1];

      if (!Array.isArray(left) && !Array.isArray(right)) {
        // both json objects, not arrays
        out.push(_this.merge(left, right));

        if (val.slice(2).length > 0) {
          //all but first 2 elems
          out.push(val.slice(2));
        }
      } else {
        for (var i = 0; i < val.length; i++) {
          var elem = val[i];

          if (Array.isArray(elem)) {
            if (elem.length == 1) out.push(elem[0]);else out.push(_this.clean(elem));
          } else {
            out.push(elem);
          }
        }
      }

      val = out;
    }

    return out[0];
  };

  this.postClean = function (out0) {
    return out0;
  };

  this.toCardinal = function (value) {
    var val = _this.splitnum(value);

    var preWords = Object.keys(_this.clean(val))[0];

    var words = _this.postClean(preWords);

    return words;
  };
});

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _classes_Num2Word__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ __webpack_exports__["a"] = (function () {
  _classes_Num2Word__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].call(this);
  this.cards = [{
    "1000000000000000000000000000": 'octillion'
  }, {
    "1000000000000000000000000": 'septillion'
  }, {
    "1000000000000000000000": 'sextillion'
  }, {
    "1000000000000000000": 'quintillion'
  }, {
    "1000000000000000": 'quadrillion'
  }, {
    "1000000000000": 'trillion'
  }, {
    "1000000000": 'billion'
  }, {
    "1000000": 'million'
  }, {
    "1000": 'thousand'
  }, {
    "100": 'hundred'
  }, {
    "90": 'ninety'
  }, {
    "80": 'eighty'
  }, {
    "70": 'seventy'
  }, {
    "60": 'sixty'
  }, {
    "50": 'fifty'
  }, {
    "40": 'forty'
  }, {
    "30": 'thirty'
  }, {
    "20": 'twenty'
  }, {
    "19": 'nineteen'
  }, {
    "18": 'eighteen'
  }, {
    "17": 'seventeen'
  }, {
    "16": 'sixteen'
  }, {
    "15": 'fifteen'
  }, {
    "14": 'fourteen'
  }, {
    "13": 'thirteen'
  }, {
    "12": 'twelve'
  }, {
    "11": 'eleven'
  }, {
    "10": 'ten'
  }, {
    "9": 'nine'
  }, {
    "8": 'eight'
  }, {
    "7": 'seven'
  }, {
    "6": 'six'
  }, {
    "5": 'five'
  }, {
    "4": 'four'
  }, {
    "3": 'three'
  }, {
    "2": 'two'
  }, {
    "1": 'one'
  }, {
    "0": 'zero'
  }];

  this.merge = function (lpair, rpair) {
    //{'one':1}, {'hundred':100}
    var ltext = Object.keys(lpair)[0],
        lnum = parseInt(Object.values(lpair)[0]);
    var rtext = Object.keys(rpair)[0],
        rnum = parseInt(Object.values(rpair)[0]);
    if (lnum == 1 && rnum < 100) return _defineProperty({}, rtext, rnum);else if (100 > lnum && lnum > rnum) return _defineProperty({}, "".concat(ltext, "-").concat(rtext), lnum + rnum);else if (lnum >= 100 && 100 > rnum) return _defineProperty({}, "".concat(ltext, " and ").concat(rtext), lnum + rnum);else if (rnum > lnum) return _defineProperty({}, "".concat(ltext, " ").concat(rtext), lnum * rnum);
    return _defineProperty({}, "".concat(ltext, " ").concat(rtext), lnum + rnum);
  };
});

/***/ }),
/* 2 */,
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/i18n/AR.js
/* harmony default export */ var AR = (function () {
  var _this = this;

  this.integer_value = 0;
  this._decimalValue = 0;
  this.number = 0;
  this.ZERO = "صفر"; // this.isCurrencyPartNameFeminine = true
  // this.isCurrencyNameFeminine = false

  this.arabicOnes = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  this.arabicFeminineOnes = ["", "إحدى", "اثنتان", "ثلاث", "أربع", "خمس", "ست", "سبع", "ثمان", "تسع", "عشر", "إحدى عشرة", "اثنتا عشرة", "ثلاث عشرة", "أربع عشرة", "خمس عشرة", "ست عشرة", "سبع عشرة", "ثماني عشرة", "تسع عشرة"];
  this.arabicTens = ["عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  this.arabicHundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  this.arabicAppendedTwos = ["مئتا", "ألفا", "مليونا", "مليارا", "تريليونا", "كوادريليونا", "كوينتليونا", "سكستيليونا"];
  this.arabicTwos = ["مئتان", "ألفان", "مليونان", "ملياران", "تريليونان", "كوادريليونان", "كوينتليونان", "سكستيليونان"];
  this.arabicGroup = ["مائة", "ألف", "مليون", "مليار", "تريليون", "كوادريليون", "كوينتليون", "سكستيليون"];
  this.arabicAppendedGroup = ["", "ألفاً", "مليوناً", "ملياراً", "تريليوناً", "كوادريليوناً", "كوينتليوناً", "سكستيليوناً"];
  this.arabicPluralGroups = ["", "آلاف", "ملايين", "مليارات", "تريليونات", "كوادريليونات", "كوينتليونات", "سكستيليونات"];

  this.digit_feminine_status = function (digit, group_level) {
    // if ((group_level == -1 && this.isCurrencyPartNameFeminine) || (group_level == 0 && this.isCurrencyNameFeminine)) {
    //   return this.arabicFeminineOnes[parseInt(digit)]
    // }
    return _this.arabicOnes[parseInt(digit)];
  };

  this.process_arabic_group = function (group_number, group_level, remaining_number) {
    var tens = group_number % 100;
    var hundreds = group_number / 100;
    var ret_val = "";

    if (parseInt(hundreds) > 0) {
      ret_val = tens == 0 && parseInt(hundreds) == 2 ? _this.arabicAppendedTwos[0] : _this.arabicHundreds[parseInt(hundreds)];
    }

    if (tens > 0) {
      if (tens < 20) {
        if (tens == 2 && parseInt(hundreds) == 0 && group_level > 0) {
          ret_val = [2000, 2000000, 2000000000, 2000000000000, 2000000000000000, 2000000000000000000].indexOf(_this.integer_value) != -1 ? _this.arabicAppendedTwos[parseInt(group_level)] : _this.arabicTwos[parseInt(group_level)];
        } else {
          if (ret_val != "") {
            ret_val += " و ";
          }

          if (tens == 1 && group_level > 0 && hundreds == 0) {
            ret_val += "";
          } else if ((tens == 1 || tens == 2) && (group_level == 0 || group_level == -1) && hundreds == 0 && remaining_number == 0) {
            ret_val += "";
          } else {
            ret_val += _this.digit_feminine_status(parseInt(tens), group_level);
          }
        }
      } else {
        var ones = tens % 10;
        tens = tens / 10 - 2;

        if (ones > 0) {
          if (ret_val != "" && tens < 4) {
            ret_val += " و ";
          }

          ret_val += _this.digit_feminine_status(ones, group_level);
        }

        if (ret_val != "" && ones != 0) {
          ret_val += " و ";
        }

        ret_val += _this.arabicTens[parseInt(tens)];
      }
    }

    return ret_val;
  };

  this.toCardinal = function (number) {
    if (parseInt(number) == 0) {
      return _this.ZERO;
    }

    temp_number = number;
    _this.integer_value = number;
    var ret_val = '';
    var group = 0;

    while (temp_number > 0) {
      var number_to_process = parseInt(temp_number % 1000);
      var temp_number = parseInt(temp_number / 1000);

      var group_description = _this.process_arabic_group(number_to_process, group, Math.floor(temp_number));

      if (group_description != '') {
        if (group > 0) {
          if (ret_val != '') {
            ret_val = " و " + ret_val;
          }

          if (number_to_process != 2) {
            if (number_to_process % 100 != 1) {
              if (3 <= number_to_process && number_to_process <= 10) {
                ret_val = _this.arabicPluralGroups[group] + " " + ret_val;
              } else {
                if (ret_val != '') {
                  ret_val = _this.arabicAppendedGroup[group] + " " + ret_val;
                } else {
                  ret_val = _this.arabicGroup[group] + " " + ret_val;
                }
              }
            } else {
              ret_val = _this.arabicGroup[group] + " " + ret_val;
            }
          }
        }

        ret_val = group_description + " " + ret_val;
      }

      group += 1;
    }

    return ret_val.trim();
  };
});
// CONCATENATED MODULE: ./src/i18n/RU.js
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* harmony default export */ var RU = (function () {
  var _this = this;

  // Num2Word_Base.call(this);
  this.feminine = false;
  this.ZERO = "ноль";
  this.ONES = {
    1: "один",
    2: "два",
    3: "три",
    4: "четыре",
    5: "пять",
    6: "шесть",
    7: "семь",
    8: "восемь",
    9: "девять"
  };
  this.ONES_FEMININE = {
    1: "одна",
    2: "две",
    3: "три",
    4: "четыре",
    5: "пять",
    6: "шесть",
    7: "семь",
    8: "восемь",
    9: "девять"
  };
  this.TENS = {
    0: "десять",
    1: "одиннадцать",
    2: "двенадцать",
    3: "тринадцать",
    4: "четырнадцать",
    5: "пятнадцать",
    6: "шестнадцать",
    7: "семнадцать",
    8: "восемнадцать",
    9: "девятнадцать"
  };
  this.TWENTIES = {
    2: "двадцать",
    3: "тридцать",
    4: "сорок",
    5: "пятьдесят",
    6: "шестьдесят",
    7: "семьдесят",
    8: "восемьдесят",
    9: "девяносто"
  };
  this.HUNDREDS = {
    1: "сто",
    2: "двести",
    3: "триста",
    4: "четыреста",
    5: "пятьсот",
    6: "шестьсот",
    7: "семьсот",
    8: "восемьсот",
    9: "девятьсот"
  };
  this.THOUSANDS = {
    1: ['тысяча', 'тысячи', 'тысяч'],
    // 10^ 3
    2: ['миллион', 'миллиона', 'миллионов'],
    // 10^ 6
    3: ['миллиард', 'миллиарда', 'миллиардов'],
    // 10^ 9
    4: ['триллион', 'триллиона', 'триллионов'],
    // 10^ 12
    5: ['квадриллион', 'квадриллиона', 'квадриллионов'],
    // 10^ 15
    6: ['квинтиллион', 'квинтиллиона', 'квинтиллионов'],
    // 10^ 18
    7: ['секстиллион', 'секстиллиона', 'секстиллионов'],
    // 10^ 21
    8: ['септиллион', 'септиллиона', 'септиллионов'],
    // 10^ 24
    9: ['октиллион', 'октиллиона', 'октиллионов'],
    // 10^ 27
    10: ['нониллион', 'нониллиона', 'нониллионов'] // 10^ 30

  };

  this.splitbyx = function (n, x) {
    var format_int = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var results = [];
    var l = n.length;
    var result;

    if (l > x) {
      var start = l % x;

      if (start > 0) {
        result = n.slice(0, start);

        if (format_int) {
          results.push(parseInt(result));
        } else {
          results.push(result);
        }
      }

      for (var i = start; i < l; i += x) {
        result = n.slice(i, i + x);

        if (format_int) {
          results.push(parseInt(result));
        } else {
          results.push(result);
        }
      }
    } else {
      if (format_int) {
        results.push(parseInt(n));
      } else {
        results.push(n);
      }
    }

    return results;
  };

  this.get_digits = function (n) {
    var a = Array.from(JSON.stringify(n).padStart(3, '0').slice(-3)).reverse();
    return a.map(function (e) {
      return parseInt(e);
    });
  };

  this.pluralize = function (n, forms) {
    var form = 2;

    if (n % 100 < 10 || n % 100 > 20) {
      if (n % 10 == 1) {
        form = 0;
      } else if (5 > n % 10 && n % 10 > 1) {
        form = 1;
      }
    }

    return forms[form];
  };

  this.toCardinal = function (number) {
    if (parseInt(number) == 0) {
      return _this.ZERO;
    }

    var words = [];

    var chunks = _this.splitbyx(JSON.stringify(number), 3);

    var i = chunks.length;

    for (var j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      var ones = [];
      i = i - 1;

      if (x == 0) {
        continue;
      }

      var _this$get_digits = _this.get_digits(x),
          _this$get_digits2 = _slicedToArray(_this$get_digits, 3),
          n1 = _this$get_digits2[0],
          n2 = _this$get_digits2[1],
          n3 = _this$get_digits2[2];

      if (n3 > 0) {
        words.push(_this.HUNDREDS[n3]);
      }

      if (n2 > 1) {
        words.push(_this.TWENTIES[n2]);
      }

      if (n2 == 1) {
        words.push(_this.TENS[n1]);
      } else if (n1 > 0) {
        var ones = i == 1 || _this.feminine && i == 0 ? _this.ONES_FEMININE : _this.ONES;
        words.push(ones[n1]);
      }

      if (i > 0) {
        words.push(_this.pluralize(x, _this.THOUSANDS[i]));
      }
    }

    return words.join(' ');
  };
});
// CONCATENATED MODULE: ./src/i18n/CZ.js
function CZ_slicedToArray(arr, i) { return CZ_arrayWithHoles(arr) || CZ_iterableToArrayLimit(arr, i) || CZ_nonIterableRest(); }

function CZ_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function CZ_iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function CZ_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/* harmony default export */ var CZ = (function () {
  var _this = this;

  RU.call(this);
  this.ZERO = "nula";
  this.ONES = {
    1: "jedna",
    2: "dva",
    3: "tři",
    4: "čtyři",
    5: "pět",
    6: "šest",
    7: "sedm",
    8: "osm",
    9: "devět"
  };
  this.TENS = {
    0: "deset",
    1: "jedenáct",
    2: "dvanáct",
    3: "třináct",
    4: "čtrnáct",
    5: "patnáct",
    6: "šestnáct",
    7: "sedmnáct",
    8: "osmnáct",
    9: "devatenáct"
  };
  this.TWENTIES = {
    2: "dvacet",
    3: "třicet",
    4: "čtyřicet",
    5: "padesát",
    6: "šedesát",
    7: "sedmdesát",
    8: "osmdesát",
    9: "devadesát"
  };
  this.HUNDREDS = {
    1: "sto",
    2: "dvěstě",
    3: "třista",
    4: "čtyřista",
    5: "pětset",
    6: "šestset",
    7: "sedmset",
    8: "osmset",
    9: "devětset"
  };
  this.THOUSANDS = {
    1: ['tisíc', 'tisíce', 'tisíc'],
    // 10^ 3
    2: ['milion', 'miliony', 'milionů'],
    // 10^ 6
    3: ['miliarda', 'miliardy', 'miliard'],
    // 10^ 9
    4: ['bilion', 'biliony', 'bilionů'],
    // 10^ 12
    5: ['biliarda', 'biliardy', 'biliard'],
    // 10^ 15
    6: ['trilion', 'triliony', 'trilionů'],
    // 10^ 18
    7: ['triliarda', 'triliardy', 'triliard'],
    // 10^ 21
    8: ['kvadrilion', 'kvadriliony', 'kvadrilionů'],
    // 10^ 24
    9: ['kvadriliarda', 'kvadriliardy', 'kvadriliard'],
    // 10^ 27
    10: ['quintillion', 'quintilliony', 'quintillionů'] // 10^ 30

  };

  this.pluralize = function (n, forms) {
    var form = 2;

    if (n == 1) {
      form = 0;
    } else if (5 > n % 10 && n % 10 > 1 && (n % 100 < 10 || n % 100 > 20)) {
      form = 1;
    }

    return forms[form];
  };

  this.toCardinal = function (number) {
    if (parseInt(number) == 0) {
      return _this.ZERO;
    }

    var words = [];

    var chunks = _this.splitbyx(JSON.stringify(number), 3);

    var i = chunks.length;

    for (var j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      var ones = [];
      i = i - 1;

      if (x == 0) {
        continue;
      }

      var _this$get_digits = _this.get_digits(x),
          _this$get_digits2 = CZ_slicedToArray(_this$get_digits, 3),
          n1 = _this$get_digits2[0],
          n2 = _this$get_digits2[1],
          n3 = _this$get_digits2[2];

      if (n3 > 0) {
        words.push(_this.HUNDREDS[n3]);
      }

      if (n2 > 1) {
        words.push(_this.TWENTIES[n2]);
      }

      if (n2 == 1) {
        words.push(_this.TENS[n1]);
      } else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(_this.ONES[n1]);
      }

      if (i > 0) {
        words.push(_this.pluralize(x, _this.THOUSANDS[i]));
      }
    }

    return words.join(' ');
  };
});
// EXTERNAL MODULE: ./src/classes/Num2Word.js
var Num2Word = __webpack_require__(0);

// CONCATENATED MODULE: ./src/i18n/DE.js
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var DE = (function () {
  Num2Word["a" /* default */].call(this);
  this.cards = [{
    "1000000000000000000000000000": 'Quadrilliarde'
  }, {
    "1000000000000000000000000": 'Quadrillion'
  }, {
    "1000000000000000000000": 'Trilliarde'
  }, {
    "1000000000000000000": 'Trillion'
  }, {
    "1000000000000000": 'Billiarde'
  }, {
    "1000000000000": 'Billion'
  }, {
    "1000000000": 'Milliarde'
  }, {
    "1000000": 'Million'
  }, {
    "1000": 'tausend'
  }, {
    "100": 'hundert'
  }, {
    "90": 'neunzig'
  }, {
    "80": 'achtzig'
  }, {
    "70": 'siebzig'
  }, {
    "60": 'sechzig'
  }, {
    "50": 'fünfzig'
  }, {
    "40": 'vierzig'
  }, {
    "30": 'dreißig'
  }, {
    "20": 'zwanzig'
  }, {
    "19": 'neunzehn'
  }, {
    "18": 'achtzehn'
  }, {
    "17": 'siebzehn'
  }, {
    "16": 'sechzehn'
  }, {
    "15": 'fünfzehn'
  }, {
    "14": 'vierzehn'
  }, {
    "13": 'dreizehn'
  }, {
    "12": 'zwölf'
  }, {
    "11": 'elf'
  }, {
    "10": 'zehn'
  }, {
    "9": 'neun'
  }, {
    "8": 'acht'
  }, {
    "7": 'sieben'
  }, {
    "6": 'sechs'
  }, {
    "5": 'fünf'
  }, {
    "4": 'vier'
  }, {
    "3": 'drei'
  }, {
    "2": 'zwei'
  }, {
    "1": 'eins'
  }, {
    "0": 'null'
  }];

  this.merge = function (curr, next) {
    var ctext = Object.keys(curr)[0],
        cnum = parseInt(Object.values(curr)[0]);
    var ntext = Object.keys(next)[0],
        nnum = parseInt(Object.values(next)[0]);

    if (cnum == 1) {
      if (nnum == 100 || nnum == 1000) {
        return _defineProperty({}, "ein".concat(ntext), nnum);
      } else if (nnum < 1000000) {
        return _defineProperty({}, ntext, nnum);
      }

      ctext = "eine";
    }

    var val = 0;

    if (nnum > cnum) {
      if (nnum >= 1000000) {
        if (cnum > 1) {
          if (ntext[ntext.length - 1] == "e") {
            ntext += "n";
          } else {
            ntext += "en";
          }
        }

        ctext += " ";
      }

      val = cnum * nnum;
    } else {
      if (nnum < 10 && 10 < cnum && cnum < 100) {
        if (nnum == 1) {
          ntext = "ein";
        }

        var temp = ntext;
        ntext = ctext;
        ctext = "".concat(temp, "und");
      } else if (cnum >= 1000000) {
        ctext += " ";
      }

      val = cnum + nnum;
    }

    return _defineProperty({}, "".concat(ctext).concat(ntext), val);
  };
});
// CONCATENATED MODULE: ./src/i18n/DK.js
function DK_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var DK = (function () {
  var _this = this;

  Num2Word["a" /* default */].call(this);
  this.ordflag = false;
  this.cards = [{
    "1000000000000000000000000000": 'quadrillarder'
  }, {
    "1000000000000000000000000": 'quadrillioner'
  }, {
    "1000000000000000000000": 'trillarder'
  }, {
    "1000000000000000000": 'trillioner'
  }, {
    "1000000000000000": 'billarder'
  }, {
    "1000000000000": 'billioner'
  }, {
    "1000000000": 'millarder'
  }, {
    "1000000": 'millioner'
  }, {
    "1000": 'tusind'
  }, {
    "100": 'hundrede'
  }, {
    "90": 'halvfems'
  }, {
    "80": 'firs'
  }, {
    "70": 'halvfjerds'
  }, {
    "60": 'treds'
  }, {
    "50": 'halvtreds'
  }, {
    "40": 'fyrre'
  }, {
    "30": 'tredive'
  }, {
    "20": 'tyve'
  }, {
    "19": 'nitten'
  }, {
    "18": 'atten'
  }, {
    "17": 'sytten'
  }, {
    "16": 'seksten'
  }, {
    "15": 'femten'
  }, {
    "14": 'fjorten'
  }, {
    "13": 'tretten'
  }, {
    "12": 'tolv'
  }, {
    "11": 'elleve'
  }, {
    "10": 'ti'
  }, {
    "9": 'ni'
  }, {
    "8": 'otte'
  }, {
    "7": 'syv'
  }, {
    "6": 'seks'
  }, {
    "5": 'fem'
  }, {
    "4": 'fire'
  }, {
    "3": 'tre'
  }, {
    "2": 'to'
  }, {
    "1": 'et'
  }, {
    "0": 'nul'
  }];

  this.merge = function (curr, next) {
    var ctext = Object.keys(curr)[0],
        cnum = parseInt(Object.values(curr)[0]);
    var ntext = Object.keys(next)[0],
        nnum = parseInt(Object.values(next)[0]);
    var val = 1;

    if (nnum == 100 || nnum == 1000) {
      next = DK_defineProperty({}, "et".concat(ntext), nnum);
    }

    if (cnum == 1) {
      if (nnum < 1000000 || _this.ordflag) {
        return next;
      }

      ctext = "en";
    }

    if (nnum > cnum) {
      if (nnum >= 1000000) {
        ctext += " ";
      }

      val = cnum * nnum;
    } else {
      if (cnum >= 100 && cnum < 1000) {
        ctext += " og ";
      } else if (cnum >= 1000 && cnum <= 100000) {
        ctext += "e og ";
      }

      if (nnum < 10 && 10 < cnum && cnum < 100) {
        if (nnum == 1) {
          ntext = "en";
        }

        var temp = ntext;
        ntext = ctext;
        ctext = temp + "og";
      } else if (cnum >= 1000000) {
        ctext += " ";
      }

      val = cnum + nnum;
    }

    var word = ctext + ntext;
    return DK_defineProperty({}, "".concat(word), val);
  };
});
// EXTERNAL MODULE: ./src/i18n/EN.js
var EN = __webpack_require__(1);

// CONCATENATED MODULE: ./src/i18n/ES.js
function ES_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var ES = (function () {
  var _this = this;

  Num2Word["a" /* default */].call(this);
  this.gender_stem = "o";
  this.cards = [{
    "1000000000000000000000000": 'cuatrillón'
  }, {
    "1000000000000000000": 'trillón'
  }, {
    "1000000000000": 'billón'
  }, {
    "1000000": 'millón'
  }, {
    "1000": 'mil'
  }, {
    "100": 'cien'
  }, {
    "90": 'noventa'
  }, {
    "80": 'ochenta'
  }, {
    "70": 'setenta'
  }, {
    "60": 'sesenta'
  }, {
    "50": 'cincuenta'
  }, {
    "40": 'cuarenta'
  }, {
    "30": 'treinta'
  }, {
    "29": 'veintinueve'
  }, {
    "28": 'veintiocho'
  }, {
    "27": 'veintisiete'
  }, {
    "26": 'veintiséis'
  }, {
    "25": 'veinticinco'
  }, {
    "24": 'veinticuatro'
  }, {
    "23": 'veintitrés'
  }, {
    "22": 'veintidós'
  }, {
    "21": 'veintiuno'
  }, {
    "20": 'veinte'
  }, {
    "19": 'diecinueve'
  }, {
    "18": 'dieciocho'
  }, {
    "17": 'diecisiete'
  }, {
    "16": 'dieciseis'
  }, {
    "15": 'quince'
  }, {
    "14": 'catorce'
  }, {
    "13": 'trece'
  }, {
    "12": 'doce'
  }, {
    "11": 'once'
  }, {
    "10": 'diez'
  }, {
    "9": 'nueve'
  }, {
    "8": 'ocho'
  }, {
    "7": 'siete'
  }, {
    "6": 'seis'
  }, {
    "5": 'cinco'
  }, {
    "4": 'cuatro'
  }, {
    "3": 'tres'
  }, {
    "2": 'dos'
  }, {
    "1": 'uno'
  }, {
    "0": 'cero'
  }];

  this.merge = function (curr, next) {
    var ctext = Object.keys(curr)[0],
        cnum = parseInt(Object.values(curr)[0]);
    var ntext = Object.keys(next)[0],
        nnum = parseInt(Object.values(next)[0]);

    if (cnum == 1) {
      if (nnum < 1000000) return ES_defineProperty({}, ntext, nnum);
      ctext = "un";
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext += "t" + _this.gender_stem;
    }

    if (nnum < cnum) {
      if (cnum < 100) {
        return ES_defineProperty({}, "".concat(ctext, " y ").concat(ntext), cnum + nnum);
      }

      return ES_defineProperty({}, "".concat(ctext, " ").concat(ntext), cnum + nnum);
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -3) + "lones";
    }

    if (nnum == 100) {
      if (cnum == 5) {
        ctext = "quinien";
        ntext = "";
      } else if (cnum == 7) {
        ctext = "sete";
      } else if (cnum == 9) {
        ctext = "nove";
      }

      ntext += "t" + _this.gender_stem + "s";
    } else {
      ntext = " " + ntext;
    }

    return ES_defineProperty({}, "".concat(ctext).concat(ntext), cnum * nnum);
  };
});
// CONCATENATED MODULE: ./src/i18n/FR.js
function FR_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var FR = (function () {
  Num2Word["a" /* default */].call(this);
  this.cards = [{
    "1000000000000000000000000000": 'quadrilliard'
  }, {
    "1000000000000000000000000": 'quadrillion'
  }, {
    "1000000000000000000000": 'trilliard'
  }, {
    "1000000000000000000": 'trillion'
  }, {
    "1000000000000000": 'billiard'
  }, {
    "1000000000000": 'billion'
  }, {
    "1000000000": 'milliard'
  }, {
    "1000000": 'million'
  }, {
    "1000": 'mille'
  }, {
    "100": 'cent'
  }, {
    "80": 'quatre-vingts'
  }, {
    "60": 'soixante'
  }, {
    "50": 'cinquante'
  }, {
    "40": 'quarante'
  }, {
    "30": 'trente'
  }, {
    "20": 'vingt'
  }, {
    "19": 'dix-neuf'
  }, {
    "18": 'dix-huit'
  }, {
    "17": 'dix-sept'
  }, {
    "16": 'seize'
  }, {
    "15": 'quinze'
  }, {
    "14": 'quatorze'
  }, {
    "13": 'treize'
  }, {
    "12": 'douze'
  }, {
    "11": 'onze'
  }, {
    "10": 'dix'
  }, {
    "9": 'neuf'
  }, {
    "8": 'huit'
  }, {
    "7": 'sept'
  }, {
    "6": 'six'
  }, {
    "5": 'cinq'
  }, {
    "4": 'quatre'
  }, {
    "3": 'trois'
  }, {
    "2": 'deux'
  }, {
    "1": 'un'
  }, {
    "0": 'zéro'
  }];

  this.merge = function (curr, next) {
    // {'cent':100}, {'vingt-cinq':25}
    var ctext = Object.keys(curr)[0],
        cnum = parseInt(Object.values(curr)[0]);
    var ntext = Object.keys(next)[0],
        nnum = parseInt(Object.values(next)[0]);

    if (cnum == 1) {
      if (nnum < 1000000) {
        return FR_defineProperty({}, ntext, nnum);
      }
    } else {
      if (((cnum - 80) % 100 == 0 || cnum % 100 == 0 && cnum < 1000) && nnum < 1000000 && ctext[ctext.length - 1] == "s") {
        ctext = ctext.slice(0, -1); //without last elem
      }

      if (cnum < 1000 && nnum != 1000 && ntext[ntext.length - 1] != "s" && nnum % 100 == 0) {
        ntext += "s";
      }
    }

    if (nnum < cnum && cnum < 100) {
      if (nnum % 10 == 1 && cnum != 80) return FR_defineProperty({}, "".concat(ctext, " et ").concat(ntext), cnum + nnum);
      return FR_defineProperty({}, "".concat(ctext, "-").concat(ntext), cnum + nnum);
    }

    if (nnum > cnum) return FR_defineProperty({}, "".concat(ctext, " ").concat(ntext), cnum * nnum);
    return FR_defineProperty({}, "".concat(ctext, " ").concat(ntext), cnum + nnum);
  };
});
// CONCATENATED MODULE: ./src/i18n/HE.js
function HE_slicedToArray(arr, i) { return HE_arrayWithHoles(arr) || HE_iterableToArrayLimit(arr, i) || HE_nonIterableRest(); }

function HE_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function HE_iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function HE_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/* harmony default export */ var HE = (function () {
  var _this = this;

  RU.call(this);
  this.ZERO = "אפס";
  this.AND = 'ו';
  this.ONES = {
    1: 'אחת',
    2: 'שתים',
    3: 'שלש',
    4: 'ארבע',
    5: 'חמש',
    6: 'שש',
    7: 'שבע',
    8: 'שמונה',
    9: 'תשע'
  };
  this.TENS = {
    0: 'עשר',
    1: 'אחת עשרה',
    2: 'שתים עשרה',
    3: 'שלש עשרה',
    4: 'ארבע עשרה',
    5: 'חמש עשרה',
    6: 'שש עשרה',
    7: 'שבע עשרה',
    8: 'שמונה עשרה',
    9: 'תשע עשרה'
  };
  this.TWENTIES = {
    2: 'עשרים',
    3: 'שלשים',
    4: 'ארבעים',
    5: 'חמישים',
    6: 'ששים',
    7: 'שבעים',
    8: 'שמונים',
    9: 'תשעים'
  };
  this.HUNDREDS = {
    1: 'מאה',
    2: 'מאתיים',
    3: 'מאות'
  };
  this.THOUSANDS = {
    1: 'אלף',
    2: 'אלפיים',
    3: 'שלשת אלפים',
    4: 'ארבעת אלפים',
    5: 'חמשת אלפים',
    6: 'ששת אלפים',
    7: 'שבעת אלפים',
    8: 'שמונת אלפים',
    9: 'תשעת אלפים'
  };

  this.toCardinal = function (number) {
    if (parseInt(number) == 0) {
      return _this.ZERO;
    }

    var words = [];

    var chunks = _this.splitbyx(JSON.stringify(number), 3);

    var i = chunks.length;

    for (var j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      i = i - 1;

      if (x == 0) {
        continue;
      }

      var _this$get_digits = _this.get_digits(x),
          _this$get_digits2 = HE_slicedToArray(_this$get_digits, 3),
          n1 = _this$get_digits2[0],
          n2 = _this$get_digits2[1],
          n3 = _this$get_digits2[2];

      if (i > 0) {
        words.push(_this.THOUSANDS[n1]);
        continue;
      }

      if (n3 > 0) {
        if (n3 <= 2) {
          words.push(_this.HUNDREDS[n3]);
        } else {
          words.push(_this.ONES[n3] + ' ' + _this.HUNDREDS[3]);
        }
      }

      if (n2 > 1) {
        words.push(_this.TWENTIES[n2]);
      }

      if (n2 == 1) {
        words.push(_this.TENS[n1]);
      } else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(_this.ONES[n1]);
      }

      if (i > 0) {
        words.push(_this.THOUSANDS[i]);
      }
    }

    if (words.length > 1) {
      words[words.length - 1] = _this.AND + words[words.length - 1];
    }

    return words.join(' ');
  };
});
// CONCATENATED MODULE: ./src/i18n/IT.js
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/* harmony default export */ var IT = (function () {
  var _this = this;

  var ZERO = "zero";
  var CARDINAL_WORDS = [ZERO, "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci", "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette", "diciotto", "diciannove"];
  var STR_TENS = {
    "2": "venti",
    "3": "trenta",
    "4": "quaranta",
    "6": "sessanta"
  };
  var EXPONENT_PREFIXES = [ZERO, "m", "b", "tr", "quadr", "quint", "sest", "sett", "ott", "nov", "dec"];

  this.accentuate = function (string) {
    var splittedString = string.split(' ');
    var result = splittedString.map(function (word) {
      if (word.slice(-3) == "tre" && word.length > 3) return word.replace(/tré/g, 'tre').slice(0, -3) + 'tré';else return word.replace(/tré/g, 'tre');
    });
    return result.join(' ');
  };

  this.omitIfZero = function (numberToString) {
    if (numberToString == ZERO) {
      return "";
    } else {
      return numberToString;
    }
  };

  this.phoneticContraction = function (string) {
    return string.replace(/oo/g, 'o').replace(/ao/g, 'o').replace(/io/g, 'o').replace(/au/g, 'u').replace(/iu/g, 'u');
  };

  this.tensToCardinal = function (number) {
    var tens = Math.floor(number / 10);
    var units = number % 10;
    var prefix;

    if (STR_TENS.hasOwnProperty(tens)) {
      prefix = STR_TENS[tens];
    } else {
      prefix = CARDINAL_WORDS[tens].slice(0, -1) + "anta";
    }

    var postfix = _this.omitIfZero(CARDINAL_WORDS[units]);

    return _this.phoneticContraction(prefix + postfix);
  };

  this.hundredsToCardinal = function (number) {
    var hundreds = Math.floor(number / 100);
    var prefix = "cento";

    if (hundreds != 1) {
      prefix = CARDINAL_WORDS[hundreds] + prefix;
    }

    var postfix = _this.omitIfZero(_this.toCardinal(number % 100));

    return _this.phoneticContraction(prefix + postfix);
  };

  this.thousandsToCardinal = function (number) {
    var thousands = Math.floor(number / 1000);
    var prefix;

    if (thousands == 1) {
      prefix = "mille";
    } else {
      prefix = _this.toCardinal(thousands) + 'mila';
    }

    var postfix = _this.omitIfZero(_this.toCardinal(number % 1000));

    return prefix + postfix;
  };

  this.exponentLengthToString = function (exponentLength) {
    var prefix = EXPONENT_PREFIXES[Math.floor(exponentLength / 6)];

    if (exponentLength % 6 == 0) {
      return prefix + 'ilione';
    } else {
      return prefix + 'iliardo';
    }
  };

  this.bigNumberToCardinal = function (number) {
    var digits = Array.from(String(number));
    var predigits = digits.length % 3 == 0 ? 3 : digits.length % 3;
    var multiplier = digits.slice(0, predigits); // first `predigits` elements

    var exponent = digits.slice(predigits); // without the first `predigits` elements

    var prefix, postfix;

    var infix = _this.exponentLengthToString(exponent.length);

    if (multiplier.toString() == "1") {
      prefix = "un ";
    } else {
      prefix = _this.toCardinal(parseInt(multiplier.join('')));
      infix = " " + infix.slice(0, -1) + "i"; // without last element
    }

    var isSetsEqual = function isSetsEqual(a, b) {
      return a.size === b.size && _toConsumableArray(a).every(function (value) {
        return b.has(value);
      });
    };

    if (!isSetsEqual(new Set(exponent), new Set(['0']))) {
      postfix = _this.toCardinal(parseInt(exponent.join('')));

      if (postfix.includes(' e ')) {
        infix += ", "; // for very large numbers
      } else {
        infix += " e ";
      }
    } else {
      postfix = '';
    }

    return prefix + infix + postfix;
  };

  this.toCardinal = function (number) {
    var words = "";

    if (number < 20) {
      words = CARDINAL_WORDS[number];
    } else if (number < 100) {
      words = _this.tensToCardinal(number);
    } else if (number < 1000) {
      words = _this.hundredsToCardinal(number);
    } else if (number < 1000000) {
      words = _this.thousandsToCardinal(number);
    } else {
      words = _this.bigNumberToCardinal(number);
    }

    return _this.accentuate(words);
  };
});
// CONCATENATED MODULE: ./src/i18n/KO.js
function KO_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var KO = (function () {
  Num2Word["a" /* default */].call(this);
  this.cards = [{
    '10000000000000000000000000000': '양'
  }, {
    '1000000000000000000000000': '자'
  }, {
    '100000000000000000000': '해'
  }, {
    '10000000000000000': '경'
  }, {
    '1000000000000': '조'
  }, {
    '100000000': '억'
  }, {
    '10000': '만'
  }, {
    '1000': '천'
  }, {
    '100': '백'
  }, {
    '10': '십'
  }, {
    '9': '구'
  }, {
    '8': '팔'
  }, {
    '7': '칠'
  }, {
    '6': '육'
  }, {
    '5': '오'
  }, {
    '4': '사'
  }, {
    '3': '삼'
  }, {
    '2': '이'
  }, {
    '1': '일'
  }, {
    '0': '영'
  }];

  this.merge = function (lpair, rpair) {
    var ltext = Object.keys(lpair)[0],
        lnum = parseInt(Object.values(lpair)[0]);
    var rtext = Object.keys(rpair)[0],
        rnum = parseInt(Object.values(rpair)[0]);
    if (lnum == 1 && rnum <= 10000) return KO_defineProperty({}, rtext, rnum);else if (10000 > lnum && lnum > rnum) return KO_defineProperty({}, "".concat(ltext).concat(rtext), lnum + rnum);else if (lnum >= 10000 && lnum > rnum) return KO_defineProperty({}, "".concat(ltext, " ").concat(rtext), lnum + rnum);else return KO_defineProperty({}, "".concat(ltext).concat(rtext), lnum * rnum);
  };
});
// CONCATENATED MODULE: ./src/i18n/LT.js
function LT_slicedToArray(arr, i) { return LT_arrayWithHoles(arr) || LT_iterableToArrayLimit(arr, i) || LT_nonIterableRest(); }

function LT_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function LT_iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function LT_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/* harmony default export */ var LT = (function () {
  var _this = this;

  RU.call(this);
  this.feminine = false;
  this.ZERO = "nulis";
  this.ONES = {
    1: 'vienas',
    2: 'du',
    3: 'trys',
    4: 'keturi',
    5: 'penki',
    6: 'šeši',
    7: 'septyni',
    8: 'aštuoni',
    9: 'devyni'
  };
  this.ONES_FEMININE = {
    1: 'viena',
    2: 'dvi',
    3: 'trys',
    4: 'keturios',
    5: 'penkios',
    6: 'šešios',
    7: 'septynios',
    8: 'aštuonios',
    9: 'devynios'
  };
  this.TENS = {
    0: 'dešimt',
    1: 'vienuolika',
    2: 'dvylika',
    3: 'trylika',
    4: 'keturiolika',
    5: 'penkiolika',
    6: 'šešiolika',
    7: 'septyniolika',
    8: 'aštuoniolika',
    9: 'devyniolika'
  };
  this.TWENTIES = {
    2: 'dvidešimt',
    3: 'trisdešimt',
    4: 'keturiasdešimt',
    5: 'penkiasdešimt',
    6: 'šešiasdešimt',
    7: 'septyniasdešimt',
    8: 'aštuoniasdešimt',
    9: 'devyniasdešimt'
  };
  this.HUNDREDS = ['šimtas', 'šimtai'];
  this.THOUSANDS = {
    1: ['tūkstantis', 'tūkstančiai', 'tūkstančių'],
    2: ['milijonas', 'milijonai', 'milijonų'],
    3: ['milijardas', 'milijardai', 'milijardų'],
    4: ['trilijonas', 'trilijonai', 'trilijonų'],
    5: ['kvadrilijonas', 'kvadrilijonai', 'kvadrilijonų'],
    6: ['kvintilijonas', 'kvintilijonai', 'kvintilijonų'],
    7: ['sikstilijonas', 'sikstilijonai', 'sikstilijonų'],
    8: ['septilijonas', 'septilijonai', 'septilijonų'],
    9: ['oktilijonas', 'oktilijonai', 'oktilijonų'],
    10: ['naintilijonas', 'naintilijonai', 'naintilijonų']
  };

  this.pluralize = function (n, forms) {
    var form = 1;

    var _this$get_digits = _this.get_digits(n),
        _this$get_digits2 = LT_slicedToArray(_this$get_digits, 3),
        n1 = _this$get_digits2[0],
        n2 = _this$get_digits2[1],
        n3 = _this$get_digits2[2];

    if (n2 == 1 || n1 == 0 || n == 0) {
      form = 2;
    } else if (n1 == 1) {
      form = 0;
    }

    return forms[form];
  };

  this.toCardinal = function (number) {
    if (parseInt(number) == 0) {
      return _this.ZERO;
    }

    var words = [];

    var chunks = _this.splitbyx(JSON.stringify(number), 3);

    var i = chunks.length;

    for (var j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      i = i - 1;

      if (x == 0) {
        continue;
      }

      var _this$get_digits3 = _this.get_digits(x),
          _this$get_digits4 = LT_slicedToArray(_this$get_digits3, 3),
          n1 = _this$get_digits4[0],
          n2 = _this$get_digits4[1],
          n3 = _this$get_digits4[2];

      if (n3 > 0) {
        words.push(_this.ONES[n3]);

        if (n3 > 1) {
          words.push(_this.HUNDREDS[1]);
        } else {
          words.push(_this.HUNDREDS[0]);
        }
      }

      if (n2 > 1) {
        words.push(_this.TWENTIES[n2]);
      }

      if (n2 == 1) {
        words.push(_this.TENS[n1]);
      } else if (n1 > 0) {
        if ((i == 1 || _this.feminine && i == 0) && number < 1000) {
          words.push(_this.ONES_FEMININE[n1]);
        } else {
          words.push(_this.ONES[n1]);
        }
      }

      if (i > 0) {
        words.push(_this.pluralize(x, _this.THOUSANDS[i]));
      }
    }

    return words.join(' ');
  };
});
// CONCATENATED MODULE: ./src/i18n/LV.js
function LV_slicedToArray(arr, i) { return LV_arrayWithHoles(arr) || LV_iterableToArrayLimit(arr, i) || LV_nonIterableRest(); }

function LV_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function LV_iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function LV_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/* harmony default export */ var LV = (function () {
  var _this = this;

  RU.call(this);
  this.ZERO = "nulle";
  this.ONES = {
    1: 'viens',
    2: 'divi',
    3: 'trīs',
    4: 'četri',
    5: 'pieci',
    6: 'seši',
    7: 'septiņi',
    8: 'astoņi',
    9: 'deviņi'
  };
  this.TENS = {
    0: 'desmit',
    1: 'vienpadsmit',
    2: 'divpadsmit',
    3: 'trīspadsmit',
    4: 'četrpadsmit',
    5: 'piecpadsmit',
    6: 'sešpadsmit',
    7: 'septiņpadsmit',
    8: 'astoņpadsmit',
    9: 'deviņpadsmit'
  };
  this.TWENTIES = {
    2: 'divdesmit',
    3: 'trīsdesmit',
    4: 'četrdesmit',
    5: 'piecdesmit',
    6: 'sešdesmit',
    7: 'septiņdesmit',
    8: 'astoņdesmit',
    9: 'deviņdesmit'
  };
  this.HUNDREDS = ['simts', 'simti', 'simtu'];
  this.THOUSANDS = {
    1: ['tūkstotis', 'tūkstoši', 'tūkstošu'],
    2: ['miljons', 'miljoni', 'miljonu'],
    3: ['miljards', 'miljardi', 'miljardu'],
    4: ['triljons', 'triljoni', 'triljonu'],
    5: ['kvadriljons', 'kvadriljoni', 'kvadriljonu'],
    6: ['kvintiljons', 'kvintiljoni', 'kvintiljonu'],
    7: ['sikstiljons', 'sikstiljoni', 'sikstiljonu'],
    8: ['septiljons', 'septiljoni', 'septiljonu'],
    9: ['oktiljons', 'oktiljoni', 'oktiljonu'],
    10: ['nontiljons', 'nontiljoni', 'nontiljonu']
  };

  this.pluralize = function (n, forms) {
    var form = 2;

    if (n != 0) {
      if (n % 10 == 1 && n % 100 != 11) {
        form = 0;
      } else {
        form = 1;
      }
    }

    return forms[form];
  };

  this.toCardinal = function (number) {
    if (parseInt(number) == 0) {
      return _this.ZERO;
    }

    var words = [];

    var chunks = _this.splitbyx(JSON.stringify(number), 3);

    var i = chunks.length;

    for (var j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      i = i - 1;

      if (x == 0) {
        continue;
      }

      var _this$get_digits = _this.get_digits(x),
          _this$get_digits2 = LV_slicedToArray(_this$get_digits, 3),
          n1 = _this$get_digits2[0],
          n2 = _this$get_digits2[1],
          n3 = _this$get_digits2[2];

      if (n3 > 0) {
        if (n3 == 1 && n2 == 0 && n1 > 0) {
          words.push(_this.HUNDREDS[2]);
        } else if (n3 > 1) {
          words.push(_this.ONES[n3]);
          words.push(_this.HUNDREDS[1]);
        } else {
          words.push(_this.HUNDREDS[0]);
        }
      }

      if (n2 > 1) {
        words.push(_this.TWENTIES[n2]);
      }

      if (n2 == 1) {
        words.push(_this.TENS[n1]);
      } else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(_this.ONES[n1]);
      }

      if (i > 0) {
        words.push(_this.pluralize(x, _this.THOUSANDS[i]));
      }
    }

    return words.join(' ');
  };
});
// CONCATENATED MODULE: ./src/i18n/NO.js
function NO_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var NO = (function () {
  Num2Word["a" /* default */].call(this);
  this.cards = [{
    "1000000000000000000000000000000000": 'quintillard'
  }, {
    "1000000000000000000000000000000": 'quintillion'
  }, {
    "1000000000000000000000000000": 'quadrillard'
  }, {
    "1000000000000000000000000": 'quadrillion'
  }, {
    "1000000000000000000000": 'trillard'
  }, {
    "1000000000000000000": 'trillion'
  }, {
    "1000000000000000": 'billard'
  }, {
    "1000000000000": 'billion'
  }, {
    "1000000000": 'millard'
  }, {
    "1000000": 'million'
  }, {
    "1000": 'tusen'
  }, {
    "100": 'hundre'
  }, {
    "90": 'nitti'
  }, {
    "80": 'åtti'
  }, {
    "70": 'sytti'
  }, {
    "60": 'seksti'
  }, {
    "50": 'femti'
  }, {
    "40": 'førti'
  }, {
    "30": 'tretti'
  }, {
    "20": 'tjue'
  }, {
    "19": 'nitten'
  }, {
    "18": 'atten'
  }, {
    "17": 'sytten'
  }, {
    "16": 'seksten'
  }, {
    "15": 'femten'
  }, {
    "14": 'fjorten'
  }, {
    "13": 'tretten'
  }, {
    "12": 'tolv'
  }, {
    "11": 'elleve'
  }, {
    "10": 'ti'
  }, {
    "9": 'ni'
  }, {
    "8": 'åtte'
  }, {
    "7": 'syv'
  }, {
    "6": 'seks'
  }, {
    "5": 'fem'
  }, {
    "4": 'fire'
  }, {
    "3": 'tre'
  }, {
    "2": 'to'
  }, {
    "1": 'en'
  }, {
    "0": 'null'
  }];

  this.merge = function (lpair, rpair) {
    //{'one':1}, {'hundred':100}
    var ltext = Object.keys(lpair)[0],
        lnum = parseInt(Object.values(lpair)[0]);
    var rtext = Object.keys(rpair)[0],
        rnum = parseInt(Object.values(rpair)[0]);
    if (lnum == 1 && rnum < 100) return NO_defineProperty({}, rtext, rnum);else if (100 > lnum && lnum > rnum) return NO_defineProperty({}, "".concat(ltext, "-").concat(rtext), lnum + rnum);else if (lnum >= 100 && 100 > rnum) return NO_defineProperty({}, "".concat(ltext, " og ").concat(rtext), lnum + rnum);else if (rnum > lnum) return NO_defineProperty({}, "".concat(ltext, " ").concat(rtext), lnum * rnum);
    return NO_defineProperty({}, "".concat(ltext, ", ").concat(rtext), lnum + rnum);
  };
});
// CONCATENATED MODULE: ./src/i18n/PL.js
function PL_slicedToArray(arr, i) { return PL_arrayWithHoles(arr) || PL_iterableToArrayLimit(arr, i) || PL_nonIterableRest(); }

function PL_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function PL_iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function PL_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/* harmony default export */ var PL = (function () {
  var _this = this;

  RU.call(this);
  this.feminine = false;
  this.ZERO = "zero";
  this.ONES = {
    1: 'jeden',
    2: 'dwa',
    3: 'trzy',
    4: 'cztery',
    5: 'pięć',
    6: 'sześć',
    7: 'siedem',
    8: 'osiem',
    9: 'dziewięć'
  };
  this.TENS = {
    0: 'dziesięć',
    1: 'jedenaście',
    2: 'dwanaście',
    3: 'trzynaście',
    4: 'czternaście',
    5: 'piętnaście',
    6: 'szesnaście',
    7: 'siedemnaście',
    8: 'osiemnaście',
    9: 'dziewiętnaście'
  };
  this.TWENTIES = {
    2: 'dwadzieścia',
    3: 'trzydzieści',
    4: 'czterdzieści',
    5: 'pięćdziesiąt',
    6: 'sześćdziesiąt',
    7: 'siedemdziesiąt',
    8: 'osiemdziesiąt',
    9: 'dziewięćdzisiąt'
  };
  this.HUNDREDS = {
    1: 'sto',
    2: 'dwieście',
    3: 'trzysta',
    4: 'czterysta',
    5: 'pięćset',
    6: 'sześćset',
    7: 'siedemset',
    8: 'osiemset',
    9: 'dziewięćset'
  };
  this.THOUSANDS = {
    1: ['tysiąc', 'tysiące', 'tysięcy'],
    // 10^ 3
    2: ['milion', 'miliony', 'milionów'],
    // 10^ 6
    3: ['miliard', 'miliardy', 'miliardów'],
    // 10^ 9
    4: ['bilion', 'biliony', 'bilionów'],
    // 10^ 12
    5: ['biliard', 'biliardy', 'biliardów'],
    // 10^ 15
    6: ['trylion', 'tryliony', 'trylionów'],
    // 10^ 18
    7: ['tryliard', 'tryliardy', 'tryliardów'],
    // 10^ 21
    8: ['kwadrylion', 'kwadryliony', 'kwadrylionów'],
    // 10^ 24
    9: ['kwaryliard', 'kwadryliardy', 'kwadryliardów'],
    // 10^ 27
    10: ['kwintylion', 'kwintyliony', 'kwintylionów'] // 10^ 30

  };

  this.pluralize = function (n, forms) {
    var form = 2;

    if (n == 1) {
      form = 0;
    } else if (5 > n % 10 && n % 10 > 1 && (n % 100 < 10 || n % 100 > 20)) {
      form = 1;
    }

    return forms[form];
  };

  this.toCardinal = function (number) {
    if (parseInt(number) == 0) {
      return _this.ZERO;
    }

    var words = [];

    var chunks = _this.splitbyx(JSON.stringify(number), 3);

    var i = chunks.length;

    for (var j = 0; j < chunks.length; j++) {
      var x = chunks[j];
      i = i - 1;

      if (x == 0) {
        continue;
      }

      var _this$get_digits = _this.get_digits(x),
          _this$get_digits2 = PL_slicedToArray(_this$get_digits, 3),
          n1 = _this$get_digits2[0],
          n2 = _this$get_digits2[1],
          n3 = _this$get_digits2[2];

      if (n3 > 0) {
        words.push(_this.HUNDREDS[n3]);
      }

      if (n2 > 1) {
        words.push(_this.TWENTIES[n2]);
      }

      if (n2 == 1) {
        words.push(_this.TENS[n1]);
      } else if (n1 > 0 && !(i > 0 && x == 1)) {
        words.push(_this.ONES[n1]);
      }

      if (i > 0) {
        words.push(_this.pluralize(x, _this.THOUSANDS[i]));
      }
    }

    return words.join(' ');
  };
});
// CONCATENATED MODULE: ./src/i18n/PT.js
function PT_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var PT = (function () {
  var _this = this;

  Num2Word["a" /* default */].call(this);
  this.cards = [{
    "1000000000000000000000000": 'quatrilião'
  }, {
    "1000000000000000000": 'trilião'
  }, {
    "1000000000000": 'bilião'
  }, {
    "1000000": 'milião'
  }, {
    "1000": 'mil'
  }, {
    "100": 'cem'
  }, {
    "90": 'noventa'
  }, {
    "80": 'oitenta'
  }, {
    "70": 'setenta'
  }, {
    "60": 'sessenta'
  }, {
    "50": 'cinquenta'
  }, {
    "40": 'quarenta'
  }, {
    "30": 'trinta'
  }, {
    "20": 'vinte'
  }, {
    "19": 'dezanove'
  }, {
    "18": 'dezoito'
  }, {
    "17": 'dezassete'
  }, {
    "16": 'dezasseis'
  }, {
    "15": 'quinze'
  }, {
    "14": 'catorze'
  }, {
    "13": 'treze'
  }, {
    "12": 'doze'
  }, {
    "11": 'onze'
  }, {
    "10": 'dez'
  }, {
    "9": 'nove'
  }, {
    "8": 'oito'
  }, {
    "7": 'sete'
  }, {
    "6": 'seis'
  }, {
    "5": 'cinco'
  }, {
    "4": 'quatro'
  }, {
    "3": 'três'
  }, {
    "2": 'dois'
  }, {
    "1": 'um'
  }, {
    "0": 'zero'
  }];
  this.hundreds = {
    "1": "cento",
    "2": "duzentos",
    "3": "trezentos",
    "4": "quatrocentos",
    "5": "quinhentos",
    "6": "seiscentos",
    "7": "setecentos",
    "8": "oitocentos",
    "9": "novecentos"
  };

  this.postClean = function (words) {
    var transforms = ['mil', 'milhão', 'milhões', 'mil milhões', 'bilião', 'biliões', 'mil biliões'];

    for (var i = 0; i < transforms.length; i++) {
      var ext = transforms[i];

      if (words.match(new RegExp(".*".concat(ext, " e \\w*entos? (?=.*e)")))) {
        words = words.replace(new RegExp("".concat(ext, " e"), 'g'), "".concat(ext));
      }
    }

    return words;
  };

  this.merge = function (curr, next) {
    var ctext = Object.keys(curr)[0],
        cnum = parseInt(Object.values(curr)[0]);
    var ntext = Object.keys(next)[0],
        nnum = parseInt(Object.values(next)[0]);

    if (cnum == 1) {
      if (nnum < 1000000) return PT_defineProperty({}, ntext, nnum);
      ctext = "um";
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext = "cento";
    }

    if (nnum < cnum) {
      // if (cnum < 100) {
      //   return { [`${ctext} e ${ntext}`]: cnum + nnum }
      // }
      return PT_defineProperty({}, "".concat(ctext, " e ").concat(ntext), cnum + nnum);
    } else if (nnum % 1000000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + "liões";
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + "lhões";
    }

    if (ntext == 'milião') ntext = 'milhão';

    if (nnum == 100) {
      ctext = _this.hundreds[cnum];
      ntext = "";
    } else {
      ntext = " " + ntext;
    }

    return PT_defineProperty({}, "".concat(ctext).concat(ntext), cnum * nnum);
  };
});
// CONCATENATED MODULE: ./src/i18n/TR.js
/* harmony default export */ var TR = (function () {
  var _this = this;

  this.precision = 2;

  this.splitnum = function (value) {
    var float_digits = JSON.stringify(value * Math.pow(10, _this.precision));

    if (parseInt(value) != 0) {
      _this.integers_to_read = [JSON.stringify(parseInt(value)), float_digits.slice(float_digits.length - _this.precision, float_digits.length)];
    } else {
      _this.integers_to_read = ["0", "0".repeat(_this.precision - float_digits.length) + float_digits.slice(float_digits.length - _this.precision, float_digits.length)];
    }

    if (_this.integers_to_read[0].length % 3 > 0) {
      _this.total_triplets_to_read = Math.floor(_this.integers_to_read[0].length / 3) + 1;
    } else if (_this.integers_to_read[0].length % 3 == 0) {
      _this.total_triplets_to_read = Math.floor(_this.integers_to_read[0].length / 3);
    }

    _this.total_digits_outside_triplets = _this.integers_to_read[0].length % 3;

    var okunacak = _this.integers_to_read[0].split("").reverse();

    _this.order_of_last_zero_digit = 0;
    var found = 0;

    for (var i = 0; i < okunacak.length; i++) {
      if (parseInt(okunacak[i]) == 0 && found == 0) {
        _this.order_of_last_zero_digit = i + 1;
      } else {
        found = 1;
      }
    }
  };

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
  };
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
  };
  this.HUNDREDS = {
    "2": "iki",
    "3": "üç",
    "4": "dört",
    "5": "beş",
    "6": "altı",
    "7": "yedi",
    "8": "sekiz",
    "9": "dokuz"
  };
  this.CARDINAL_HUNDRED = ["yüz", ""];
  this.CARDINAL_TRIPLETS = {
    1: "bin",
    2: "milyon",
    3: "milyar",
    4: "trilyon",
    5: "katrilyon",
    6: "kentilyon"
  };
  this.integers_to_read = [];
  this.total_triplets_to_read = 0;
  this.total_digits_outside_triplets = 0;
  this.order_of_last_zero_digit = 0;

  this.toCardinal = function (value) {
    if (parseInt(value) == 0) {
      return "sıfır";
    }

    _this.splitnum(value);

    var wrd = "";

    if (_this.order_of_last_zero_digit >= _this.integers_to_read[0].length) {
      return wrd;
    }

    if (_this.total_triplets_to_read == 1) {
      if (_this.total_digits_outside_triplets == 2) {
        if (_this.order_of_last_zero_digit == 1) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || "";
          return wrd;
        }

        if (_this.order_of_last_zero_digit == 0) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][1]] || "";
        }

        return wrd;
      }

      if (_this.total_digits_outside_triplets == 1) {
        if (_this.order_of_last_zero_digit == 0) {
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][0]] || "";
          return wrd;
        }
      }

      if (_this.total_digits_outside_triplets == 0) {
        if (_this.order_of_last_zero_digit == 2) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_HUNDRED[0];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == 1) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || "";
          return wrd;
        }

        if (_this.order_of_last_zero_digit == 0) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || "";
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][2]] || "";
          return wrd;
        }
      }
    }

    if (_this.total_triplets_to_read >= 2) {
      if (_this.total_digits_outside_triplets == 2) {
        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 1) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 2) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][1]] || "";
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit < _this.integers_to_read[0].length - 2) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][1]] || "";
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
        }
      }

      if (_this.total_digits_outside_triplets == 1) {
        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 1) {
          if (!(_this.total_triplets_to_read == 2 && _this.integers_to_read[0][0] == "1")) {
            wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][0]] || "";
          }

          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit < _this.integers_to_read[0].length - 1) {
          if (!(_this.total_triplets_to_read == 2 && _this.integers_to_read[0][0] == "1")) {
            wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][0]] || "";
          }

          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
        }
      }

      if (_this.total_digits_outside_triplets == 0) {
        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 1) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 2) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || "";
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 3) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || "";
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][2]] || "";
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit < _this.integers_to_read[0].length - 3) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || "";
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || "";

          if (!(_this.total_triplets_to_read == 2 && _this.integers_to_read[0][2] == "1")) {
            wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][2]] || "";
          }

          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
        }
      }

      for (var i = _this.total_triplets_to_read - 1; i > 0; i--) {
        var reading_triplet_order = _this.total_triplets_to_read - i;

        if (_this.total_digits_outside_triplets == 0) {
          var last_read_digit_order = reading_triplet_order * 3;
        } else {
          last_read_digit_order = (reading_triplet_order - 1) * 3 + _this.total_digits_outside_triplets;
        }

        if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 3) != "000") {
          if (_this.integers_to_read[0][last_read_digit_order] != "0") {
            wrd += _this.HUNDREDS[_this.integers_to_read[0][last_read_digit_order]] || "";

            if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - last_read_digit_order - 1) {
              if (i == 1) {
                wrd += _this.CARDINAL_HUNDRED[0];
                return wrd;
              } else if (i > 1) {
                wrd += _this.CARDINAL_HUNDRED[0];
                wrd += _this.CARDINAL_TRIPLETS[i - 1];
                return wrd;
              }
            } else {
              wrd += _this.CARDINAL_HUNDRED[0];
            }
          }

          if (_this.integers_to_read[0][last_read_digit_order + 1] != "0") {
            if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - last_read_digit_order - 2) {
              if (i == 1) {
                wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][last_read_digit_order + 1]] || "";
                return wrd;
              } else if (i > 1) {
                wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][last_read_digit_order + 1]] || "";
                wrd += _this.CARDINAL_TRIPLETS[i - 1];
                return wrd;
              }
            } else {
              wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][last_read_digit_order + 1]] || "";
            }
          }

          if (_this.integers_to_read[0][last_read_digit_order + 2] != "0") {
            if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - last_read_digit_order - 3) {
              if (i == 1) {
                wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || "";
                return wrd;
              }

              if (i == 2) {
                if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != "00") {
                  wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || "";
                } else if (_this.integers_to_read[0][last_read_digit_order + 2] != "1") {
                  wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || "";
                }

                wrd += _this.CARDINAL_TRIPLETS[i - 1];
                return wrd;
              }

              if (i > 2) {
                wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || "";
                wrd += _this.CARDINAL_TRIPLETS[i - 1];
                return wrd;
              }
            } else {
              if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != "00") {
                wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || "";
              } else {
                if (i == 2) {
                  if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != "00") {
                    wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || "";
                  } else if (_this.integers_to_read[0][last_read_digit_order + 2] != "1") {
                    wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || "";
                  }
                }
              }
            }
          }

          wrd += _this.CARDINAL_TRIPLETS[i - 1];
        }
      }
    }

    return wrd;
  };
});
// CONCATENATED MODULE: ./src/i18n/UK.js

/* harmony default export */ var UK = (function () {
  RU.call(this);
  this.feminine = false;
  this.ZERO = "нуль";
  this.ONES = {
    1: 'один',
    2: 'два',
    3: 'три',
    4: 'чотири',
    5: 'п\'ять',
    6: 'шiсть',
    7: 'сiм',
    8: 'вiсiм',
    9: 'дев\'ять'
  };
  this.ONES_FEMININE = {
    1: 'одна',
    2: 'двi',
    3: 'три',
    4: 'чотири',
    5: 'п\'ять',
    6: 'шiсть',
    7: 'сiм',
    8: 'вiсiм',
    9: 'дев\'ять'
  };
  this.TENS = {
    0: 'десять',
    1: 'одинадцять',
    2: 'дванадцять',
    3: 'тринадцять',
    4: 'чотирнадцять',
    5: 'п\'ятнадцять',
    6: 'шiстнадцять',
    7: 'сiмнадцять',
    8: 'вiсiмнадцять',
    9: 'дев\'ятнадцять'
  };
  this.TWENTIES = {
    2: 'двадцять',
    3: 'тридцять',
    4: 'сорок',
    5: 'п\'ятдесят',
    6: 'шiстдесят',
    7: 'сiмдесят',
    8: 'вiсiмдесят',
    9: 'дев\'яносто'
  };
  this.HUNDREDS = {
    1: 'сто',
    2: 'двiстi',
    3: 'триста',
    4: 'чотириста',
    5: 'п\'ятсот',
    6: 'шiстсот',
    7: 'сiмсот',
    8: 'вiсiмсот',
    9: 'дев\'ятсот'
  };
  this.THOUSANDS = {
    1: ['тисяча', 'тисячi', 'тисяч'],
    // 10^ 3
    2: ['мiльйон', 'мiльйони', 'мiльйонiв'],
    // 10^ 6
    3: ['мiльярд', 'мiльярди', 'мiльярдiв'],
    // 10^ 9
    4: ['трильйон', 'трильйони', 'трильйонiв'],
    // 10^ 12
    5: ['квадрильйон', 'квадрильйони', 'квадрильйонiв'],
    // 10^ 15
    6: ['квiнтильйон', 'квiнтильйони', 'квiнтильйонiв'],
    // 10^ 18
    7: ['секстильйон', 'секстильйони', 'секстильйонiв'],
    // 10^ 21
    8: ['септильйон', 'септильйони', 'септильйонiв'],
    // 10^ 24
    9: ['октильйон', 'октильйони', 'октильйонiв'],
    // 10^ 27
    10: ['нонiльйон', 'нонiльйони', 'нонiльйонiв'] // 10^ 30

  };
});
// CONCATENATED MODULE: ./src/n2words.js


















/**
 * Converts numbers to their written form.
 *
 * @constructor
 * @param {number} n - The number to convert
 * @param {Object} [options={lang: "en"}] - Language
 */

/* harmony default export */ var n2words = __webpack_exports__["default"] = (function (n, options) {
  var lang = "EN"; // default language

  var supportedLanguages = ['en', 'fr', 'es', 'de', 'pt', 'it', 'tr', 'ru', 'cz', 'no', 'dk', 'pl', 'uk', 'lt', 'lv', 'ar', 'he', 'ko'];

  if (options) {
    if (options.lang) {
      // lang is given in options
      if (supportedLanguages.indexOf(options.lang) != -1) lang = options.lang.toUpperCase();else throw Error("ERROR: Unsupported language. Supported languages are: ".concat(supportedLanguages.sort().join(", ")));
    }
  }

  var num;

  if (lang === 'EN') {
    num = new EN["a" /* default */]();
  } else if (lang === 'FR') {
    num = new FR();
  } else if (lang === 'ES') {
    num = new ES();
  } else if (lang === 'DE') {
    num = new DE();
  } else if (lang === 'PT') {
    num = new PT();
  } else if (lang === 'IT') {
    num = new IT();
  } else if (lang === 'TR') {
    num = new TR();
  } else if (lang === 'RU') {
    num = new RU();
  } else if (lang === 'CZ') {
    num = new CZ();
  } else if (lang === 'NO') {
    num = new NO();
  } else if (lang === 'DK') {
    num = new DK();
  } else if (lang === 'PL') {
    num = new PL();
  } else if (lang === 'UK') {
    num = new UK();
  } else if (lang === 'LT') {
    num = new LT();
  } else if (lang === 'LV') {
    num = new LV();
  } else if (lang === 'AR') {
    num = new AR();
  } else if (lang === 'HE') {
    // only for numbers <= 9999
    num = new HE();
  } else if (lang === 'KO') {
    num = new KO();
  }

  return num.toCardinal(n);
});

/***/ })
/******/ ])["default"];
});