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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
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
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _i18n_EN__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);

/* harmony default export */ __webpack_exports__["default"] = (function (n) {
  return new _i18n_EN__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]().toCardinal(n);
});

/***/ })
/******/ ]);
});