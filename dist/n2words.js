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
/******/ 	return __webpack_require__(__webpack_require__.s = 150);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var getOwnPropertyDescriptor = __webpack_require__(45).f;
var createNonEnumerableProperty = __webpack_require__(13);
var redefine = __webpack_require__(15);
var setGlobal = __webpack_require__(34);
var copyConstructorProperties = __webpack_require__(68);
var isForced = __webpack_require__(63);

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(81)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var shared = __webpack_require__(48);
var has = __webpack_require__(5);
var uid = __webpack_require__(35);
var NATIVE_SYMBOL = __webpack_require__(53);
var USE_SYMBOL_AS_UID = __webpack_require__(73);

var WellKnownSymbolsStore = shared('wks');
var Symbol = global.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (NATIVE_SYMBOL && has(Symbol, name)) WellKnownSymbolsStore[name] = Symbol[name];
    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var parseIntImplementation = __webpack_require__(85);

// `parseInt` method
// https://tc39.github.io/ecma262/#sec-parseint-string-radix
$({ global: true, forced: parseInt != parseIntImplementation }, {
  parseInt: parseIntImplementation
});


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var IE8_DOM_DEFINE = __webpack_require__(57);
var anObject = __webpack_require__(10);
var toPrimitive = __webpack_require__(26);

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_es_array_is_array__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
/* harmony import */ var core_js_modules_es_array_is_array__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_is_array__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_slice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(23);
/* harmony import */ var core_js_modules_es_array_slice__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(16);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(17);
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_parse_int__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony import */ var core_js_modules_es_parse_int__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_parse_int__WEBPACK_IMPORTED_MODULE_4__);






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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(56);
var requireObjectCoercible = __webpack_require__(12);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var definePropertyModule = __webpack_require__(8);
var createPropertyDescriptor = __webpack_require__(22);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(30);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var createNonEnumerableProperty = __webpack_require__(13);
var has = __webpack_require__(5);
var setGlobal = __webpack_require__(34);
var inspectSource = __webpack_require__(58);
var InternalStateModule = __webpack_require__(27);

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var DESCRIPTORS = __webpack_require__(6);
var objectDefinePropertyModile = __webpack_require__(8);

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
$({ target: 'Object', stat: true, forced: !DESCRIPTORS, sham: !DESCRIPTORS }, {
  defineProperty: objectDefinePropertyModile.f
});


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var toObject = __webpack_require__(18);
var nativeKeys = __webpack_require__(38);
var fails = __webpack_require__(1);

var FAILS_ON_PRIMITIVES = fails(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return nativeKeys(toObject(it));
  }
});


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(12);

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(25);

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
module.exports = Array.isArray || function isArray(arg) {
  return classof(arg) == 'Array';
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var isArray = __webpack_require__(19);

// `Array.isArray` method
// https://tc39.github.io/ecma262/#sec-array.isarray
$({ target: 'Array', stat: true }, {
  isArray: isArray
});


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var $values = __webpack_require__(90).values;

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
$({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var isObject = __webpack_require__(4);
var isArray = __webpack_require__(19);
var toAbsoluteIndex = __webpack_require__(62);
var toLength = __webpack_require__(14);
var toIndexedObject = __webpack_require__(11);
var createProperty = __webpack_require__(54);
var wellKnownSymbol = __webpack_require__(3);
var arrayMethodHasSpeciesSupport = __webpack_require__(55);
var arrayMethodUsesToLength = __webpack_require__(36);

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
var USES_TO_LENGTH = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

var SPECIES = wellKnownSymbol('species');
var nativeSlice = [].slice;
var max = Math.max;

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var fails = __webpack_require__(1);
var isArray = __webpack_require__(19);
var isObject = __webpack_require__(4);
var toObject = __webpack_require__(18);
var toLength = __webpack_require__(14);
var createProperty = __webpack_require__(54);
var arraySpeciesCreate = __webpack_require__(77);
var arrayMethodHasSpeciesSupport = __webpack_require__(55);
var wellKnownSymbol = __webpack_require__(3);
var V8_VERSION = __webpack_require__(65);

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.github.io/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$({ target: 'Array', proto: true, forced: FORCED }, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength(E.length);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});


/***/ }),
/* 25 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_WEAK_MAP = __webpack_require__(82);
var global = __webpack_require__(2);
var isObject = __webpack_require__(4);
var createNonEnumerableProperty = __webpack_require__(13);
var objectHas = __webpack_require__(5);
var sharedKey = __webpack_require__(47);
var hiddenKeys = __webpack_require__(28);

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(69);
var global = __webpack_require__(2);

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var IndexedObject = __webpack_require__(56);
var toIndexedObject = __webpack_require__(11);
var arrayMethodIsStrict = __webpack_require__(71);

var nativeJoin = [].join;

var ES3_STRINGS = IndexedObject != Object;
var STRICT_METHOD = arrayMethodIsStrict('join', ',');

// `Array.prototype.join` method
// https://tc39.github.io/ecma262/#sec-array.prototype.join
$({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toIndexedObject = __webpack_require__(11);
var addToUnscopables = __webpack_require__(98);
var Iterators = __webpack_require__(64);
var InternalStateModule = __webpack_require__(27);
var defineIterator = __webpack_require__(87);

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var redefine = __webpack_require__(15);
var anObject = __webpack_require__(10);
var fails = __webpack_require__(1);
var flags = __webpack_require__(89);

var TO_STRING = 'toString';
var RegExpPrototype = RegExp.prototype;
var nativeToString = RegExpPrototype[TO_STRING];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? flags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var createNonEnumerableProperty = __webpack_require__(13);

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),
/* 35 */
/***/ (function(module, exports) {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var fails = __webpack_require__(1);
var has = __webpack_require__(5);

var defineProperty = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

module.exports = function (METHOD_NAME, options) {
  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has(options, 0) ? options[0] : thrower;
  var argument1 = has(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails(function () {
    if (ACCESSORS && !DESCRIPTORS) return true;
    var O = { length: -1 };

    if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
    else O[1] = 1;

    method.call(O, argument0, argument1);
  });
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var global = __webpack_require__(2);
var getBuiltIn = __webpack_require__(29);
var IS_PURE = __webpack_require__(49);
var DESCRIPTORS = __webpack_require__(6);
var NATIVE_SYMBOL = __webpack_require__(53);
var USE_SYMBOL_AS_UID = __webpack_require__(73);
var fails = __webpack_require__(1);
var has = __webpack_require__(5);
var isArray = __webpack_require__(19);
var isObject = __webpack_require__(4);
var anObject = __webpack_require__(10);
var toObject = __webpack_require__(18);
var toIndexedObject = __webpack_require__(11);
var toPrimitive = __webpack_require__(26);
var createPropertyDescriptor = __webpack_require__(22);
var nativeObjectCreate = __webpack_require__(74);
var objectKeys = __webpack_require__(38);
var getOwnPropertyNamesModule = __webpack_require__(50);
var getOwnPropertyNamesExternal = __webpack_require__(125);
var getOwnPropertySymbolsModule = __webpack_require__(70);
var getOwnPropertyDescriptorModule = __webpack_require__(45);
var definePropertyModule = __webpack_require__(8);
var propertyIsEnumerableModule = __webpack_require__(46);
var createNonEnumerableProperty = __webpack_require__(13);
var redefine = __webpack_require__(15);
var shared = __webpack_require__(48);
var sharedKey = __webpack_require__(47);
var hiddenKeys = __webpack_require__(28);
var uid = __webpack_require__(35);
var wellKnownSymbol = __webpack_require__(3);
var wrappedWellKnownSymbolModule = __webpack_require__(96);
var defineWellKnownSymbol = __webpack_require__(97);
var setToStringTag = __webpack_require__(75);
var InternalStateModule = __webpack_require__(27);
var $forEach = __webpack_require__(86).forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE = 'prototype';
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(SYMBOL);
var ObjectPrototype = Object[PROTOTYPE];
var $Symbol = global.Symbol;
var $stringify = getBuiltIn('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');
var WellKnownSymbolsStore = shared('wks');
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = DESCRIPTORS && fails(function () {
  return nativeObjectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE]);
  setInternalState(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS) symbol.description = description;
  return symbol;
};

var isSymbol = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return Object(it) instanceof $Symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPrimitive(P, true);
  anObject(Attributes);
  if (has(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!DESCRIPTORS || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPrimitive(V, true);
  var enumerable = nativePropertyIsEnumerable.call(this, P);
  if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPrimitive(P, true);
  if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
      result.push(AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.github.io/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
    };
    if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return getInternalState(this).tag;
  });

  redefine($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  propertyIsEnumerableModule.f = $propertyIsEnumerable;
  definePropertyModule.f = $defineProperty;
  getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (DESCRIPTORS) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty($Symbol[PROTOTYPE], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState(this).description;
      }
    });
    if (!IS_PURE) {
      redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$({ global: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol(name);
});

$({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
  // `Symbol.for` method
  // https://tc39.github.io/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = String(key);
    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.github.io/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
  // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
$({ target: 'Object', stat: true, forced: fails(function () { getOwnPropertySymbolsModule.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return getOwnPropertySymbolsModule.f(toObject(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.github.io/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL || fails(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  $({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return $stringify.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE][TO_PRIMITIVE]) {
  createNonEnumerableProperty($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(60);
var enumBugKeys = __webpack_require__(51);

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// `Symbol.prototype.description` getter
// https://tc39.github.io/ecma262/#sec-symbol.prototype.description

var $ = __webpack_require__(0);
var DESCRIPTORS = __webpack_require__(6);
var global = __webpack_require__(2);
var has = __webpack_require__(5);
var isObject = __webpack_require__(4);
var defineProperty = __webpack_require__(8).f;
var copyConstructorProperties = __webpack_require__(68);

var NativeSymbol = global.Symbol;

if (DESCRIPTORS && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof SymbolWrapper
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };
  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(97);

// `Symbol.iterator` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(15);

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var nativeDateToString = DatePrototype[TO_STRING];
var getTime = DatePrototype.getTime;

// `Date.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-date.prototype.tostring
if (new Date(NaN) + '' != INVALID_DATE) {
  redefine(DatePrototype, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
  });
}


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var TO_STRING_TAG_SUPPORT = __webpack_require__(88);
var redefine = __webpack_require__(15);
var toString = __webpack_require__(129);

// `Object.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  redefine(Object.prototype, 'toString', toString, { unsafe: true });
}


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(103).charAt;
var InternalStateModule = __webpack_require__(27);
var defineIterator = __webpack_require__(87);

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var DOMIterables = __webpack_require__(130);
var ArrayIteratorMethods = __webpack_require__(32);
var createNonEnumerableProperty = __webpack_require__(13);
var wellKnownSymbol = __webpack_require__(3);

var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) {
      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    }
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
}


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var propertyIsEnumerableModule = __webpack_require__(46);
var createPropertyDescriptor = __webpack_require__(22);
var toIndexedObject = __webpack_require__(11);
var toPrimitive = __webpack_require__(26);
var has = __webpack_require__(5);
var IE8_DOM_DEFINE = __webpack_require__(57);

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(48);
var uid = __webpack_require__(35);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var IS_PURE = __webpack_require__(49);
var store = __webpack_require__(59);

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.4',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 49 */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(60);
var enumBugKeys = __webpack_require__(51);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),
/* 51 */
/***/ (function(module, exports) {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),
/* 52 */
/***/ (function(module, exports) {

// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toPrimitive = __webpack_require__(26);
var definePropertyModule = __webpack_require__(8);
var createPropertyDescriptor = __webpack_require__(22);

module.exports = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);
var wellKnownSymbol = __webpack_require__(3);
var V8_VERSION = __webpack_require__(65);

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);
var classof = __webpack_require__(25);

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var fails = __webpack_require__(1);
var createElement = __webpack_require__(67);

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(59);

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store.inspectSource != 'function') {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var setGlobal = __webpack_require__(34);

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(5);
var toIndexedObject = __webpack_require__(11);
var indexOf = __webpack_require__(61).indexOf;
var hiddenKeys = __webpack_require__(28);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(11);
var toLength = __webpack_require__(14);
var toAbsoluteIndex = __webpack_require__(62);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(30);

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),
/* 64 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var userAgent = __webpack_require__(78);

var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

module.exports = version && +version;


/***/ }),
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24);
/* harmony import */ var core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17);
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_values__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(21);
/* harmony import */ var core_js_modules_es_object_values__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_values__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_parse_int__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony import */ var core_js_modules_es_parse_int__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_parse_int__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _classes_Num2Word__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9);






function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ __webpack_exports__["a"] = (function () {
  _classes_Num2Word__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"].call(this);
  this.cards = [{
    '1000000000000000000000000000': 'octillion'
  }, {
    '1000000000000000000000000': 'septillion'
  }, {
    '1000000000000000000000': 'sextillion'
  }, {
    '1000000000000000000': 'quintillion'
  }, {
    '1000000000000000': 'quadrillion'
  }, {
    '1000000000000': 'trillion'
  }, {
    '1000000000': 'billion'
  }, {
    '1000000': 'million'
  }, {
    '1000': 'thousand'
  }, {
    '100': 'hundred'
  }, {
    '90': 'ninety'
  }, {
    '80': 'eighty'
  }, {
    '70': 'seventy'
  }, {
    '60': 'sixty'
  }, {
    '50': 'fifty'
  }, {
    '40': 'forty'
  }, {
    '30': 'thirty'
  }, {
    '20': 'twenty'
  }, {
    '19': 'nineteen'
  }, {
    '18': 'eighteen'
  }, {
    '17': 'seventeen'
  }, {
    '16': 'sixteen'
  }, {
    '15': 'fifteen'
  }, {
    '14': 'fourteen'
  }, {
    '13': 'thirteen'
  }, {
    '12': 'twelve'
  }, {
    '11': 'eleven'
  }, {
    '10': 'ten'
  }, {
    '9': 'nine'
  }, {
    '8': 'eight'
  }, {
    '7': 'seven'
  }, {
    '6': 'six'
  }, {
    '5': 'five'
  }, {
    '4': 'four'
  }, {
    '3': 'three'
  }, {
    '2': 'two'
  }, {
    '1': 'one'
  }, {
    '0': 'zero'
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
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var isObject = __webpack_require__(4);

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(5);
var ownKeys = __webpack_require__(83);
var getOwnPropertyDescriptorModule = __webpack_require__(45);
var definePropertyModule = __webpack_require__(8);

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);

module.exports = global;


/***/ }),
/* 70 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(1);

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(12);
var whitespaces = __webpack_require__(52);

var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

module.exports = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
  start: createMethod(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
  end: createMethod(2),
  // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
  trim: createMethod(3)
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_SYMBOL = __webpack_require__(53);

module.exports = NATIVE_SYMBOL
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(10);
var defineProperties = __webpack_require__(123);
var enumBugKeys = __webpack_require__(51);
var hiddenKeys = __webpack_require__(28);
var html = __webpack_require__(124);
var documentCreateElement = __webpack_require__(67);
var sharedKey = __webpack_require__(47);

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties(result, Properties);
};


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(8).f;
var has = __webpack_require__(5);
var wellKnownSymbol = __webpack_require__(3);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var aFunction = __webpack_require__(84);

// optional / simple context binding
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);
var isArray = __webpack_require__(19);
var wellKnownSymbol = __webpack_require__(3);

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(29);

module.exports = getBuiltIn('navigator', 'userAgent') || '';


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var exec = __webpack_require__(80);

$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var regexpFlags = __webpack_require__(89);
var stickyHelpers = __webpack_require__(112);

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y || stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = regexpFlags.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = String(str).slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = match.input.slice(charsAdded);
        match[0] = match[0].slice(charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),
/* 81 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var inspectSource = __webpack_require__(58);

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(29);
var getOwnPropertyNamesModule = __webpack_require__(50);
var getOwnPropertySymbolsModule = __webpack_require__(70);
var anObject = __webpack_require__(10);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),
/* 84 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var trim = __webpack_require__(72).trim;
var whitespaces = __webpack_require__(52);

var $parseInt = global.parseInt;
var hex = /^[+-]?0[Xx]/;
var FORCED = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22;

// `parseInt` method
// https://tc39.github.io/ecma262/#sec-parseint-string-radix
module.exports = FORCED ? function parseInt(string, radix) {
  var S = trim(String(string));
  return $parseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
} : $parseInt;


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

var bind = __webpack_require__(76);
var IndexedObject = __webpack_require__(56);
var toObject = __webpack_require__(18);
var toLength = __webpack_require__(14);
var arraySpeciesCreate = __webpack_require__(77);

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push.call(target, value); // filter
        } else if (IS_EVERY) return false;  // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6)
};


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var createIteratorConstructor = __webpack_require__(126);
var getPrototypeOf = __webpack_require__(100);
var setPrototypeOf = __webpack_require__(101);
var setToStringTag = __webpack_require__(75);
var createNonEnumerableProperty = __webpack_require__(13);
var redefine = __webpack_require__(15);
var wellKnownSymbol = __webpack_require__(3);
var IS_PURE = __webpack_require__(49);
var Iterators = __webpack_require__(64);
var IteratorsCore = __webpack_require__(99);

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(3);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var anObject = __webpack_require__(10);

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var objectKeys = __webpack_require__(38);
var toIndexedObject = __webpack_require__(11);
var propertyIsEnumerable = __webpack_require__(46).f;

// `Object.{ entries, values }` methods implementation
var createMethod = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var keys = objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

module.exports = {
  // `Object.entries` method
  // https://tc39.github.io/ecma262/#sec-object.entries
  entries: createMethod(true),
  // `Object.values` method
  // https://tc39.github.io/ecma262/#sec-object.values
  values: createMethod(false)
};


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);
var classof = __webpack_require__(25);
var wellKnownSymbol = __webpack_require__(3);

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.github.io/ecma262/#sec-isregexp
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) == 'RegExp');
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TODO: Remove from `core-js@4` since it's moved to entry points
__webpack_require__(79);
var redefine = __webpack_require__(15);
var fails = __webpack_require__(1);
var wellKnownSymbol = __webpack_require__(3);
var regexpExec = __webpack_require__(80);
var createNonEnumerableProperty = __webpack_require__(13);

var SPECIES = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  return 'a'.replace(/./, '$0') === '$0';
})();

var REPLACE = wellKnownSymbol('replace');
// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !(
      REPLACE_SUPPORTS_NAMED_GROUPS &&
      REPLACE_KEEPS_$0 &&
      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    )) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    }, {
      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
  }

  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
};


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(103).charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(25);
var regexpExec = __webpack_require__(80);

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};



/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var $indexOf = __webpack_require__(61).indexOf;
var arrayMethodIsStrict = __webpack_require__(71);
var arrayMethodUsesToLength = __webpack_require__(36);

var nativeIndexOf = [].indexOf;

var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
var STRICT_METHOD = arrayMethodIsStrict('indexOf');
var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.indexOf` method
// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
$({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(3);

exports.f = wellKnownSymbol;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(69);
var has = __webpack_require__(5);
var wrappedWellKnownSymbolModule = __webpack_require__(96);
var defineProperty = __webpack_require__(8).f;

module.exports = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule.f(NAME)
  });
};


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(3);
var create = __webpack_require__(74);
var definePropertyModule = __webpack_require__(8);

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  definePropertyModule.f(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var getPrototypeOf = __webpack_require__(100);
var createNonEnumerableProperty = __webpack_require__(13);
var has = __webpack_require__(5);
var wellKnownSymbol = __webpack_require__(3);
var IS_PURE = __webpack_require__(49);

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) {
  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(5);
var toObject = __webpack_require__(18);
var sharedKey = __webpack_require__(47);
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(127);

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(10);
var aPossiblePrototype = __webpack_require__(128);

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

var TO_STRING_TAG_SUPPORT = __webpack_require__(88);
var classofRaw = __webpack_require__(25);
var wellKnownSymbol = __webpack_require__(3);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(30);
var requireObjectCoercible = __webpack_require__(12);

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var from = __webpack_require__(131);
var checkCorrectnessOfIteration = __webpack_require__(108);

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from
$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(10);

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(3);
var Iterators = __webpack_require__(64);

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(102);
var Iterators = __webpack_require__(64);
var wellKnownSymbol = __webpack_require__(3);

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(3);

var ITERATOR = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

module.exports = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var $map = __webpack_require__(86).map;
var arrayMethodHasSpeciesSupport = __webpack_require__(55);
var arrayMethodUsesToLength = __webpack_require__(36);

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');
// FF49- issue
var USES_TO_LENGTH = arrayMethodUsesToLength('map');

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var isArray = __webpack_require__(19);

var nativeReverse = [].reverse;
var test = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$({ target: 'Array', proto: true, forced: String(test) === String(test.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign
    if (isArray(this)) this.length = this.length;
    return nativeReverse.call(this);
  }
});


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toInteger = __webpack_require__(30);
var requireObjectCoercible = __webpack_require__(12);

// `String.prototype.repeat` method implementation
// https://tc39.github.io/ecma262/#sec-string.prototype.repeat
module.exports = ''.repeat || function repeat(count) {
  var str = String(requireObjectCoercible(this));
  var result = '';
  var n = toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fails = __webpack_require__(1);

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

exports.UNSUPPORTED_Y = fails(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

exports.BROKEN_CARET = fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

var hiddenKeys = __webpack_require__(28);
var isObject = __webpack_require__(4);
var has = __webpack_require__(5);
var defineProperty = __webpack_require__(8).f;
var uid = __webpack_require__(35);
var FREEZING = __webpack_require__(139);

var METADATA = uid('meta');
var id = 0;

var isExtensible = Object.isExtensible || function () {
  return true;
};

var setMetadata = function (it) {
  defineProperty(it, METADATA, { value: {
    objectID: 'O' + ++id, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey = function (it, create) {
  // return a primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA].objectID;
};

var getWeakData = function (it, create) {
  if (!has(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZING && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
  return it;
};

var meta = module.exports = {
  REQUIRED: false,
  fastKey: fastKey,
  getWeakData: getWeakData,
  onFreeze: onFreeze
};

hiddenKeys[METADATA] = true;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(10);
var isArrayIteratorMethod = __webpack_require__(106);
var toLength = __webpack_require__(14);
var bind = __webpack_require__(76);
var getIteratorMethod = __webpack_require__(107);
var callWithSafeIterationClosing = __webpack_require__(105);

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
  var boundFunction = bind(fn, that, AS_ENTRIES ? 2 : 1);
  var iterator, iterFn, index, length, result, next, step;

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = toLength(iterable.length); length > index; index++) {
        result = AS_ENTRIES
          ? boundFunction(anObject(step = iterable[index])[0], step[1])
          : boundFunction(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

iterate.stop = function (result) {
  return new Result(true, result);
};


/***/ }),
/* 115 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);
var setPrototypeOf = __webpack_require__(101);

// makes subclassing work correct for wrapped built-ins
module.exports = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf($this, NewTargetPrototype);
  return $this;
};


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var getBuiltIn = __webpack_require__(29);
var definePropertyModule = __webpack_require__(8);
var wellKnownSymbol = __webpack_require__(3);
var DESCRIPTORS = __webpack_require__(6);

var SPECIES = wellKnownSymbol('species');

module.exports = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule.f;

  if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
    defineProperty(Constructor, SPECIES, {
      configurable: true,
      get: function () { return this; }
    });
  }
};


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(92);
var anObject = __webpack_require__(10);
var toObject = __webpack_require__(18);
var toLength = __webpack_require__(14);
var toInteger = __webpack_require__(30);
var requireObjectCoercible = __webpack_require__(12);
var advanceStringIndex = __webpack_require__(93);
var regExpExec = __webpack_require__(94);

var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      if (
        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
      ) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;
      }

      var rx = anObject(regexp);
      var S = String(this);

      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

  // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return nativeReplace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(92);
var isRegExp = __webpack_require__(91);
var anObject = __webpack_require__(10);
var requireObjectCoercible = __webpack_require__(12);
var speciesConstructor = __webpack_require__(145);
var advanceStringIndex = __webpack_require__(93);
var toLength = __webpack_require__(14);
var callRegExpExec = __webpack_require__(94);
var regexpExec = __webpack_require__(80);
var fails = __webpack_require__(1);

var arrayPush = [].push;
var min = Math.min;
var MAX_UINT32 = 0xFFFFFFFF;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

// @@split logic
fixRegExpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(requireObjectCoercible(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) {
        return nativeSplit.call(string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output.length > lim ? output.slice(0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
}, !SUPPORTS_Y);


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var aFunction = __webpack_require__(84);
var toObject = __webpack_require__(18);
var fails = __webpack_require__(1);
var arrayMethodIsStrict = __webpack_require__(71);

var test = [];
var nativeSort = test.sort;

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict('sort');

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD;

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
$({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject(this))
      : nativeSort.call(toObject(this), aFunction(comparefn));
  }
});


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var $trim = __webpack_require__(72).trim;
var forcedStringTrimMethod = __webpack_require__(122);

// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
$({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);
var whitespaces = __webpack_require__(52);

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
module.exports = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
  });
};


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var definePropertyModule = __webpack_require__(8);
var anObject = __webpack_require__(10);
var objectKeys = __webpack_require__(38);

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
  return O;
};


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(29);

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(11);
var nativeGetOwnPropertyNames = __webpack_require__(50).f;

var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return nativeGetOwnPropertyNames(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]'
    ? getWindowNames(it)
    : nativeGetOwnPropertyNames(toIndexedObject(it));
};


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var IteratorPrototype = __webpack_require__(99).IteratorPrototype;
var create = __webpack_require__(74);
var createPropertyDescriptor = __webpack_require__(22);
var setToStringTag = __webpack_require__(75);
var Iterators = __webpack_require__(64);

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);

module.exports = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var TO_STRING_TAG_SUPPORT = __webpack_require__(88);
var classof = __webpack_require__(102);

// `Object.prototype.toString` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
module.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};


/***/ }),
/* 130 */
/***/ (function(module, exports) {

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var bind = __webpack_require__(76);
var toObject = __webpack_require__(18);
var callWithSafeIterationClosing = __webpack_require__(105);
var isArrayIteratorMethod = __webpack_require__(106);
var toLength = __webpack_require__(14);
var createProperty = __webpack_require__(54);
var getIteratorMethod = __webpack_require__(107);

// `Array.from` method implementation
// https://tc39.github.io/ecma262/#sec-array.from
module.exports = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    result = new C();
    for (;!(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = toLength(O.length);
    result = new C(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var $padStart = __webpack_require__(133).start;
var WEBKIT_BUG = __webpack_require__(134);

// `String.prototype.padStart` method
// https://tc39.github.io/ecma262/#sec-string.prototype.padstart
$({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/tc39/proposal-string-pad-start-end
var toLength = __webpack_require__(14);
var repeat = __webpack_require__(111);
var requireObjectCoercible = __webpack_require__(12);

var ceil = Math.ceil;

// `String.prototype.{ padStart, padEnd }` methods implementation
var createMethod = function (IS_END) {
  return function ($this, maxLength, fillString) {
    var S = String(requireObjectCoercible($this));
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : String(fillString);
    var intMaxLength = toLength(maxLength);
    var fillLen, stringFiller;
    if (intMaxLength <= stringLength || fillStr == '') return S;
    fillLen = intMaxLength - stringLength;
    stringFiller = repeat.call(fillStr, ceil(fillLen / fillStr.length));
    if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
    return IS_END ? S + stringFiller : stringFiller + S;
  };
};

module.exports = {
  // `String.prototype.padStart` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.padstart
  start: createMethod(false),
  // `String.prototype.padEnd` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.padend
  end: createMethod(true)
};


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/zloirock/core-js/issues/280
var userAgent = __webpack_require__(78);

// eslint-disable-next-line unicorn/no-unsafe-regex
module.exports = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent);


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var $every = __webpack_require__(86).every;
var arrayMethodIsStrict = __webpack_require__(71);
var arrayMethodUsesToLength = __webpack_require__(36);

var STRICT_METHOD = arrayMethodIsStrict('every');
var USES_TO_LENGTH = arrayMethodUsesToLength('every');

// `Array.prototype.every` method
// https://tc39.github.io/ecma262/#sec-array.prototype.every
$({ target: 'Array', proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
  every: function every(callbackfn /* , thisArg */) {
    return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var $includes = __webpack_require__(61).includes;
var addToUnscopables = __webpack_require__(98);
var arrayMethodUsesToLength = __webpack_require__(36);

var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true, forced: !USES_TO_LENGTH }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var collection = __webpack_require__(138);
var collectionStrong = __webpack_require__(140);

// `Set` constructor
// https://tc39.github.io/ecma262/#sec-set-objects
module.exports = collection('Set', function (init) {
  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var global = __webpack_require__(2);
var isForced = __webpack_require__(63);
var redefine = __webpack_require__(15);
var InternalMetadataModule = __webpack_require__(113);
var iterate = __webpack_require__(114);
var anInstance = __webpack_require__(115);
var isObject = __webpack_require__(4);
var fails = __webpack_require__(1);
var checkCorrectnessOfIteration = __webpack_require__(108);
var setToStringTag = __webpack_require__(75);
var inheritIfRequired = __webpack_require__(116);

module.exports = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var nativeMethod = NativePrototype[KEY];
    redefine(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        nativeMethod.call(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        nativeMethod.call(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  // eslint-disable-next-line max-len
  if (isForced(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
    new NativeConstructor().entries().next();
  })))) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule.REQUIRED = true;
  } else if (isForced(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
        if (iterable != undefined) iterate(iterable, that[ADDER], that, IS_MAP);
        return that;
      });
      Constructor.prototype = NativePrototype;
      NativePrototype.constructor = Constructor;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

    // weak collections should not contains .clear method
    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
  }

  exported[CONSTRUCTOR_NAME] = Constructor;
  $({ global: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(1);

module.exports = !fails(function () {
  return Object.isExtensible(Object.preventExtensions({}));
});


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var defineProperty = __webpack_require__(8).f;
var create = __webpack_require__(74);
var redefineAll = __webpack_require__(141);
var bind = __webpack_require__(76);
var anInstance = __webpack_require__(115);
var iterate = __webpack_require__(114);
var defineIterator = __webpack_require__(87);
var setSpecies = __webpack_require__(117);
var DESCRIPTORS = __webpack_require__(6);
var fastKey = __webpack_require__(113).fastKey;
var InternalStateModule = __webpack_require__(27);

var setInternalState = InternalStateModule.set;
var internalStateGetterFor = InternalStateModule.getterFor;

module.exports = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, CONSTRUCTOR_NAME);
      setInternalState(that, {
        type: CONSTRUCTOR_NAME,
        index: create(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS) that.size = 0;
      if (iterable != undefined) iterate(iterable, that[ADDER], that, IS_MAP);
    });

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var entry = getEntry(that, key);
      var previous, index;
      // change existing entry
      if (entry) {
        entry.value = value;
      // create new entry
      } else {
        state.last = entry = {
          index: index = fastKey(key, true),
          key: key,
          value: value,
          previous: previous = state.last,
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS) state.size++;
        else that.size++;
        // add to index
        if (index !== 'F') state.index[index] = entry;
      } return that;
    };

    var getEntry = function (that, key) {
      var state = getInternalState(that);
      // fast case
      var index = fastKey(key);
      var entry;
      if (index !== 'F') return state.index[index];
      // frozen object case
      for (entry = state.first; entry; entry = entry.next) {
        if (entry.key == key) return entry;
      }
    };

    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        var that = this;
        var state = getInternalState(that);
        var data = state.index;
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = undefined;
          delete data[entry.index];
          entry = entry.next;
        }
        state.first = state.last = undefined;
        if (DESCRIPTORS) state.size = 0;
        else that.size = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = this;
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.next;
          var prev = entry.previous;
          delete state.index[entry.index];
          entry.removed = true;
          if (prev) prev.next = next;
          if (next) next.previous = prev;
          if (state.first == entry) state.first = next;
          if (state.last == entry) state.last = prev;
          if (DESCRIPTORS) state.size--;
          else that.size--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });

    redefineAll(C.prototype, IS_MAP ? {
      // 23.1.3.6 Map.prototype.get(key)
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      }
    } : {
      // 23.2.3.1 Set.prototype.add(value)
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      }
    });
    if (DESCRIPTORS) defineProperty(C.prototype, 'size', {
      get: function () {
        return getInternalState(this).size;
      }
    });
    return C;
  },
  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: undefined
      });
    }, function () {
      var state = getInternalIteratorState(this);
      var kind = state.kind;
      var entry = state.last;
      // revert to the last existing entry
      while (entry && entry.removed) entry = entry.previous;
      // get next entry
      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
        // or finish the iteration
        state.target = undefined;
        return { value: undefined, done: true };
      }
      // return step by kind
      if (kind == 'keys') return { value: entry.key, done: false };
      if (kind == 'values') return { value: entry.value, done: false };
      return { value: [entry.key, entry.value], done: false };
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(CONSTRUCTOR_NAME);
  }
};


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(15);

module.exports = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(0);
var notARegExp = __webpack_require__(143);
var requireObjectCoercible = __webpack_require__(12);
var correctIsRegExpLogic = __webpack_require__(144);

// `String.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-string.prototype.includes
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~String(requireObjectCoercible(this))
      .indexOf(notARegExp(searchString), arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

var isRegExp = __webpack_require__(91);

module.exports = function (it) {
  if (isRegExp(it)) {
    throw TypeError("The method doesn't accept regular expressions");
  } return it;
};


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(3);

var MATCH = wellKnownSymbol('match');

module.exports = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (e) {
    try {
      regexp[MATCH] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (f) { /* empty */ }
  } return false;
};


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(10);
var aFunction = __webpack_require__(84);
var wellKnownSymbol = __webpack_require__(3);

var SPECIES = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.github.io/ecma262/#sec-speciesconstructor
module.exports = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? defaultConstructor : aFunction(S);
};


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var global = __webpack_require__(2);
var isForced = __webpack_require__(63);
var inheritIfRequired = __webpack_require__(116);
var defineProperty = __webpack_require__(8).f;
var getOwnPropertyNames = __webpack_require__(50).f;
var isRegExp = __webpack_require__(91);
var getFlags = __webpack_require__(89);
var stickyHelpers = __webpack_require__(112);
var redefine = __webpack_require__(15);
var fails = __webpack_require__(1);
var setInternalState = __webpack_require__(27).set;
var setSpecies = __webpack_require__(117);
var wellKnownSymbol = __webpack_require__(3);

var MATCH = wellKnownSymbol('match');
var NativeRegExp = global.RegExp;
var RegExpPrototype = NativeRegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;

var FORCED = DESCRIPTORS && isForced('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y || fails(function () {
  re2[MATCH] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
})));

// `RegExp` constructor
// https://tc39.github.io/ecma262/#sec-regexp-constructor
if (FORCED) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = this instanceof RegExpWrapper;
    var patternIsRegExp = isRegExp(pattern);
    var flagsAreUndefined = flags === undefined;
    var sticky;

    if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
      return pattern;
    }

    if (CORRECT_NEW) {
      if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
    } else if (pattern instanceof RegExpWrapper) {
      if (flagsAreUndefined) flags = getFlags.call(pattern);
      pattern = pattern.source;
    }

    if (UNSUPPORTED_Y) {
      sticky = !!flags && flags.indexOf('y') > -1;
      if (sticky) flags = flags.replace(/y/g, '');
    }

    var result = inheritIfRequired(
      CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
      thisIsRegExp ? this : RegExpPrototype,
      RegExpWrapper
    );

    if (UNSUPPORTED_Y && sticky) setInternalState(result, { sticky: sticky });

    return result;
  };
  var proxy = function (key) {
    key in RegExpWrapper || defineProperty(RegExpWrapper, key, {
      configurable: true,
      get: function () { return NativeRegExp[key]; },
      set: function (it) { NativeRegExp[key] = it; }
    });
  };
  var keys = getOwnPropertyNames(NativeRegExp);
  var index = 0;
  while (keys.length > index) proxy(keys[index++]);
  RegExpPrototype.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype;
  redefine(global, 'RegExp', RegExpWrapper);
}

// https://tc39.github.io/ecma262/#sec-get-regexp-@@species
setSpecies('RegExp');


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(92);
var anObject = __webpack_require__(10);
var toLength = __webpack_require__(14);
var requireObjectCoercible = __webpack_require__(12);
var advanceStringIndex = __webpack_require__(93);
var regExpExec = __webpack_require__(94);

// @@match logic
fixRegExpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible(this);
      var matcher = regexp == undefined ? undefined : regexp[MATCH];
      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative(nativeMatch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);

      if (!rx.global) return regExpExec(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var repeat = __webpack_require__(111);

// `String.prototype.repeat` method
// https://tc39.github.io/ecma262/#sec-string.prototype.repeat
$({ target: 'String', proto: true }, {
  repeat: repeat
});


/***/ }),
/* 149 */,
/* 150 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.index-of.js
var es_array_index_of = __webpack_require__(95);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.join.js
var es_array_join = __webpack_require__(31);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.sort.js
var es_array_sort = __webpack_require__(120);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.parse-int.js
var es_parse_int = __webpack_require__(7);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.trim.js
var es_string_trim = __webpack_require__(121);

// CONCATENATED MODULE: ./src/i18n/AR.js



/* harmony default export */ var AR = (function () {
  var _this = this;

  this.integer_value = 0;
  this._decimalValue = 0;
  this.number = 0;
  this.ZERO = 'صفر'; // this.isCurrencyPartNameFeminine = true
  // this.isCurrencyNameFeminine = false

  this.arabicOnes = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  this.arabicFeminineOnes = ['', 'إحدى', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع', 'عشر', 'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة', 'خمس عشرة', 'ست عشرة', 'سبع عشرة', 'ثماني عشرة', 'تسع عشرة'];
  this.arabicTens = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  this.arabicHundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  this.arabicAppendedTwos = ['مئتا', 'ألفا', 'مليونا', 'مليارا', 'تريليونا', 'كوادريليونا', 'كوينتليونا', 'سكستيليونا'];
  this.arabicTwos = ['مئتان', 'ألفان', 'مليونان', 'ملياران', 'تريليونان', 'كوادريليونان', 'كوينتليونان', 'سكستيليونان'];
  this.arabicGroup = ['مائة', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون'];
  this.arabicAppendedGroup = ['', 'ألفاً', 'مليوناً', 'ملياراً', 'تريليوناً', 'كوادريليوناً', 'كوينتليوناً', 'سكستيليوناً'];
  this.arabicPluralGroups = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات'];

  this.digit_feminine_status = function (digit
  /*, group_level*/
  ) {
    // if ((group_level == -1 && this.isCurrencyPartNameFeminine) || (group_level == 0 && this.isCurrencyNameFeminine)) {
    //   return this.arabicFeminineOnes[parseInt(digit)]
    // }
    return _this.arabicOnes[parseInt(digit)];
  };

  this.process_arabic_group = function (group_number, group_level, remaining_number) {
    var tens = group_number % 100;
    var hundreds = group_number / 100;
    var ret_val = '';

    if (parseInt(hundreds) > 0) {
      ret_val = tens == 0 && parseInt(hundreds) == 2 ? _this.arabicAppendedTwos[0] : _this.arabicHundreds[parseInt(hundreds)];
    }

    if (tens > 0) {
      if (tens < 20) {
        if (tens == 2 && parseInt(hundreds) == 0 && group_level > 0) {
          ret_val = [2000, 2000000, 2000000000, 2000000000000, 2000000000000000, 2000000000000000000].indexOf(_this.integer_value) != -1 ? _this.arabicAppendedTwos[parseInt(group_level)] : _this.arabicTwos[parseInt(group_level)];
        } else {
          if (ret_val != '') {
            ret_val += ' و ';
          }

          if (tens == 1 && group_level > 0 && hundreds == 0) {
            ret_val += '';
          } else if ((tens == 1 || tens == 2) && (group_level == 0 || group_level == -1) && hundreds == 0 && remaining_number == 0) {
            ret_val += '';
          } else {
            ret_val += _this.digit_feminine_status(parseInt(tens), group_level);
          }
        }
      } else {
        var ones = tens % 10;
        tens = tens / 10 - 2;

        if (ones > 0) {
          if (ret_val != '' && tens < 4) {
            ret_val += ' و ';
          }

          ret_val += _this.digit_feminine_status(ones, group_level);
        }

        if (ret_val != '' && ones != 0) {
          ret_val += ' و ';
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
            ret_val = ' و ' + ret_val;
          }

          if (number_to_process != 2) {
            if (number_to_process % 100 != 1) {
              if (3 <= number_to_process && number_to_process <= 10) {
                ret_val = _this.arabicPluralGroups[group] + ' ' + ret_val;
              } else {
                if (ret_val != '') {
                  ret_val = _this.arabicAppendedGroup[group] + ' ' + ret_val;
                } else {
                  ret_val = _this.arabicGroup[group] + ' ' + ret_val;
                }
              }
            } else {
              ret_val = _this.arabicGroup[group] + ' ' + ret_val;
            }
          }
        }

        ret_val = group_description + ' ' + ret_val;
      }

      group += 1;
    }

    return ret_val.trim();
  };
});
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.symbol.js
var es_symbol = __webpack_require__(37);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.symbol.description.js
var es_symbol_description = __webpack_require__(39);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.symbol.iterator.js
var es_symbol_iterator = __webpack_require__(40);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.is-array.js
var es_array_is_array = __webpack_require__(20);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.iterator.js
var es_array_iterator = __webpack_require__(32);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.date.to-string.js
var es_date_to_string = __webpack_require__(41);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.to-string.js
var es_object_to_string = __webpack_require__(42);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.to-string.js
var es_regexp_to_string = __webpack_require__(33);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.iterator.js
var es_string_iterator = __webpack_require__(43);

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-collections.iterator.js
var web_dom_collections_iterator = __webpack_require__(44);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.from.js
var es_array_from = __webpack_require__(104);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.map.js
var es_array_map = __webpack_require__(109);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.reverse.js
var es_array_reverse = __webpack_require__(110);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.slice.js
var es_array_slice = __webpack_require__(23);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.pad-start.js
var es_string_pad_start = __webpack_require__(132);

// CONCATENATED MODULE: ./src/i18n/RU.js


















function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* harmony default export */ var RU = (function () {
  var _this = this;

  // Num2Word_Base.call(this);
  this.feminine = false;
  this.ZERO = 'ноль';
  this.ONES = {
    1: 'один',
    2: 'два',
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять'
  };
  this.ONES_FEMININE = {
    1: 'одна',
    2: 'две',
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять'
  };
  this.TENS = {
    0: 'десять',
    1: 'одиннадцать',
    2: 'двенадцать',
    3: 'тринадцать',
    4: 'четырнадцать',
    5: 'пятнадцать',
    6: 'шестнадцать',
    7: 'семнадцать',
    8: 'восемнадцать',
    9: 'девятнадцать'
  };
  this.TWENTIES = {
    2: 'двадцать',
    3: 'тридцать',
    4: 'сорок',
    5: 'пятьдесят',
    6: 'шестьдесят',
    7: 'семьдесят',
    8: 'восемьдесят',
    9: 'девяносто'
  };
  this.HUNDREDS = {
    1: 'сто',
    2: 'двести',
    3: 'триста',
    4: 'четыреста',
    5: 'пятьсот',
    6: 'шестьсот',
    7: 'семьсот',
    8: 'восемьсот',
    9: 'девятьсот'
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
        ones = i == 1 || _this.feminine && i == 0 ? _this.ONES_FEMININE : _this.ONES;
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
  this.ZERO = 'nula';
  this.ONES = {
    1: 'jedna',
    2: 'dva',
    3: 'tři',
    4: 'čtyři',
    5: 'pět',
    6: 'šest',
    7: 'sedm',
    8: 'osm',
    9: 'devět'
  };
  this.TENS = {
    0: 'deset',
    1: 'jedenáct',
    2: 'dvanáct',
    3: 'třináct',
    4: 'čtrnáct',
    5: 'patnáct',
    6: 'šestnáct',
    7: 'sedmnáct',
    8: 'osmnáct',
    9: 'devatenáct'
  };
  this.TWENTIES = {
    2: 'dvacet',
    3: 'třicet',
    4: 'čtyřicet',
    5: 'padesát',
    6: 'šedesát',
    7: 'sedmdesát',
    8: 'osmdesát',
    9: 'devadesát'
  };
  this.HUNDREDS = {
    1: 'sto',
    2: 'dvěstě',
    3: 'třista',
    4: 'čtyřista',
    5: 'pětset',
    6: 'šestset',
    7: 'sedmset',
    8: 'osmset',
    9: 'devětset'
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
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.concat.js
var es_array_concat = __webpack_require__(24);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.define-property.js
var es_object_define_property = __webpack_require__(16);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.keys.js
var es_object_keys = __webpack_require__(17);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.values.js
var es_object_values = __webpack_require__(21);

// EXTERNAL MODULE: ./src/classes/Num2Word.js
var Num2Word = __webpack_require__(9);

// CONCATENATED MODULE: ./src/i18n/DE.js






function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var DE = (function () {
  Num2Word["a" /* default */].call(this);
  this.cards = [{
    '1000000000000000000000000000': 'Quadrilliarde'
  }, {
    '1000000000000000000000000': 'Quadrillion'
  }, {
    '1000000000000000000000': 'Trilliarde'
  }, {
    '1000000000000000000': 'Trillion'
  }, {
    '1000000000000000': 'Billiarde'
  }, {
    '1000000000000': 'Billion'
  }, {
    '1000000000': 'Milliarde'
  }, {
    '1000000': 'Million'
  }, {
    '1000': 'tausend'
  }, {
    '100': 'hundert'
  }, {
    '90': 'neunzig'
  }, {
    '80': 'achtzig'
  }, {
    '70': 'siebzig'
  }, {
    '60': 'sechzig'
  }, {
    '50': 'fünfzig'
  }, {
    '40': 'vierzig'
  }, {
    '30': 'dreißig'
  }, {
    '20': 'zwanzig'
  }, {
    '19': 'neunzehn'
  }, {
    '18': 'achtzehn'
  }, {
    '17': 'siebzehn'
  }, {
    '16': 'sechzehn'
  }, {
    '15': 'fünfzehn'
  }, {
    '14': 'vierzehn'
  }, {
    '13': 'dreizehn'
  }, {
    '12': 'zwölf'
  }, {
    '11': 'elf'
  }, {
    '10': 'zehn'
  }, {
    '9': 'neun'
  }, {
    '8': 'acht'
  }, {
    '7': 'sieben'
  }, {
    '6': 'sechs'
  }, {
    '5': 'fünf'
  }, {
    '4': 'vier'
  }, {
    '3': 'drei'
  }, {
    '2': 'zwei'
  }, {
    '1': 'eins'
  }, {
    '0': 'null'
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

      ctext = 'eine';
    }

    var val = 0;

    if (nnum > cnum) {
      if (nnum >= 1000000) {
        if (cnum > 1) {
          if (ntext[ntext.length - 1] == 'e') {
            ntext += 'n';
          } else {
            ntext += 'en';
          }
        }

        ctext += ' ';
      }

      val = cnum * nnum;
    } else {
      if (nnum < 10 && 10 < cnum && cnum < 100) {
        if (nnum == 1) {
          ntext = 'ein';
        }

        var temp = ntext;
        ntext = ctext;
        ctext = "".concat(temp, "und");
      } else if (cnum >= 1000000) {
        ctext += ' ';
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
    '1000000000000000000000000000': 'quadrillarder'
  }, {
    '1000000000000000000000000': 'quadrillioner'
  }, {
    '1000000000000000000000': 'trillarder'
  }, {
    '1000000000000000000': 'trillioner'
  }, {
    '1000000000000000': 'billarder'
  }, {
    '1000000000000': 'billioner'
  }, {
    '1000000000': 'millarder'
  }, {
    '1000000': 'millioner'
  }, {
    '1000': 'tusind'
  }, {
    '100': 'hundrede'
  }, {
    '90': 'halvfems'
  }, {
    '80': 'firs'
  }, {
    '70': 'halvfjerds'
  }, {
    '60': 'treds'
  }, {
    '50': 'halvtreds'
  }, {
    '40': 'fyrre'
  }, {
    '30': 'tredive'
  }, {
    '20': 'tyve'
  }, {
    '19': 'nitten'
  }, {
    '18': 'atten'
  }, {
    '17': 'sytten'
  }, {
    '16': 'seksten'
  }, {
    '15': 'femten'
  }, {
    '14': 'fjorten'
  }, {
    '13': 'tretten'
  }, {
    '12': 'tolv'
  }, {
    '11': 'elleve'
  }, {
    '10': 'ti'
  }, {
    '9': 'ni'
  }, {
    '8': 'otte'
  }, {
    '7': 'syv'
  }, {
    '6': 'seks'
  }, {
    '5': 'fem'
  }, {
    '4': 'fire'
  }, {
    '3': 'tre'
  }, {
    '2': 'to'
  }, {
    '1': 'et'
  }, {
    '0': 'nul'
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

      ctext = 'en';
    }

    if (nnum > cnum) {
      if (nnum >= 1000000) {
        ctext += ' ';
      }

      val = cnum * nnum;
    } else {
      if (cnum >= 100 && cnum < 1000) {
        ctext += ' og ';
      } else if (cnum >= 1000 && cnum <= 100000) {
        ctext += 'e og ';
      }

      if (nnum < 10 && 10 < cnum && cnum < 100) {
        if (nnum == 1) {
          ntext = 'en';
        }

        var temp = ntext;
        ntext = ctext;
        ctext = temp + 'og';
      } else if (cnum >= 1000000) {
        ctext += ' ';
      }

      val = cnum + nnum;
    }

    var word = ctext + ntext;
    return DK_defineProperty({}, "".concat(word), val);
  };
});
// EXTERNAL MODULE: ./src/i18n/EN.js
var EN = __webpack_require__(66);

// CONCATENATED MODULE: ./src/i18n/ES.js







function ES_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var ES = (function () {
  var _this = this;

  Num2Word["a" /* default */].call(this);
  this.gender_stem = 'o';
  this.cards = [{
    '1000000000000000000000000': 'cuatrillón'
  }, {
    '1000000000000000000': 'trillón'
  }, {
    '1000000000000': 'billón'
  }, {
    '1000000': 'millón'
  }, {
    '1000': 'mil'
  }, {
    '100': 'cien'
  }, {
    '90': 'noventa'
  }, {
    '80': 'ochenta'
  }, {
    '70': 'setenta'
  }, {
    '60': 'sesenta'
  }, {
    '50': 'cincuenta'
  }, {
    '40': 'cuarenta'
  }, {
    '30': 'treinta'
  }, {
    '29': 'veintinueve'
  }, {
    '28': 'veintiocho'
  }, {
    '27': 'veintisiete'
  }, {
    '26': 'veintiséis'
  }, {
    '25': 'veinticinco'
  }, {
    '24': 'veinticuatro'
  }, {
    '23': 'veintitrés'
  }, {
    '22': 'veintidós'
  }, {
    '21': 'veintiuno'
  }, {
    '20': 'veinte'
  }, {
    '19': 'diecinueve'
  }, {
    '18': 'dieciocho'
  }, {
    '17': 'diecisiete'
  }, {
    '16': 'dieciseis'
  }, {
    '15': 'quince'
  }, {
    '14': 'catorce'
  }, {
    '13': 'trece'
  }, {
    '12': 'doce'
  }, {
    '11': 'once'
  }, {
    '10': 'diez'
  }, {
    '9': 'nueve'
  }, {
    '8': 'ocho'
  }, {
    '7': 'siete'
  }, {
    '6': 'seis'
  }, {
    '5': 'cinco'
  }, {
    '4': 'cuatro'
  }, {
    '3': 'tres'
  }, {
    '2': 'dos'
  }, {
    '1': 'uno'
  }, {
    '0': 'cero'
  }];

  this.merge = function (curr, next) {
    var ctext = Object.keys(curr)[0],
        cnum = parseInt(Object.values(curr)[0]);
    var ntext = Object.keys(next)[0],
        nnum = parseInt(Object.values(next)[0]);

    if (cnum == 1) {
      if (nnum < 1000000) return ES_defineProperty({}, ntext, nnum);
      ctext = 'un';
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext += 't' + _this.gender_stem;
    }

    if (nnum < cnum) {
      if (cnum < 100) {
        return ES_defineProperty({}, "".concat(ctext, " y ").concat(ntext), cnum + nnum);
      }

      return ES_defineProperty({}, "".concat(ctext, " ").concat(ntext), cnum + nnum);
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -3) + 'lones';
    }

    if (nnum == 100) {
      if (cnum == 5) {
        ctext = 'quinien';
        ntext = '';
      } else if (cnum == 7) {
        ctext = 'sete';
      } else if (cnum == 9) {
        ctext = 'nove';
      }

      ntext += 't' + _this.gender_stem + 's';
    } else {
      ntext = ' ' + ntext;
    }

    return ES_defineProperty({}, "".concat(ctext).concat(ntext), cnum * nnum);
  };
});
// CONCATENATED MODULE: ./src/i18n/FR.js







function FR_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var FR = (function () {
  Num2Word["a" /* default */].call(this);
  this.cards = [{
    '1000000000000000000000000000': 'quadrilliard'
  }, {
    '1000000000000000000000000': 'quadrillion'
  }, {
    '1000000000000000000000': 'trilliard'
  }, {
    '1000000000000000000': 'trillion'
  }, {
    '1000000000000000': 'billiard'
  }, {
    '1000000000000': 'billion'
  }, {
    '1000000000': 'milliard'
  }, {
    '1000000': 'million'
  }, {
    '1000': 'mille'
  }, {
    '100': 'cent'
  }, {
    '80': 'quatre-vingts'
  }, {
    '60': 'soixante'
  }, {
    '50': 'cinquante'
  }, {
    '40': 'quarante'
  }, {
    '30': 'trente'
  }, {
    '20': 'vingt'
  }, {
    '19': 'dix-neuf'
  }, {
    '18': 'dix-huit'
  }, {
    '17': 'dix-sept'
  }, {
    '16': 'seize'
  }, {
    '15': 'quinze'
  }, {
    '14': 'quatorze'
  }, {
    '13': 'treize'
  }, {
    '12': 'douze'
  }, {
    '11': 'onze'
  }, {
    '10': 'dix'
  }, {
    '9': 'neuf'
  }, {
    '8': 'huit'
  }, {
    '7': 'sept'
  }, {
    '6': 'six'
  }, {
    '5': 'cinq'
  }, {
    '4': 'quatre'
  }, {
    '3': 'trois'
  }, {
    '2': 'deux'
  }, {
    '1': 'un'
  }, {
    '0': 'zéro'
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
      if (((cnum - 80) % 100 == 0 || cnum % 100 == 0 && cnum < 1000) && nnum < 1000000 && ctext[ctext.length - 1] == 's') {
        ctext = ctext.slice(0, -1); //without last elem
      }

      if (cnum < 1000 && nnum != 1000 && ntext[ntext.length - 1] != 's' && nnum % 100 == 0) {
        ntext += 's';
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
  this.ZERO = 'אפס';
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
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.every.js
var es_array_every = __webpack_require__(135);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.includes.js
var es_array_includes = __webpack_require__(136);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.exec.js
var es_regexp_exec = __webpack_require__(79);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.js
var es_set = __webpack_require__(137);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.includes.js
var es_string_includes = __webpack_require__(142);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.replace.js
var es_string_replace = __webpack_require__(118);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.split.js
var es_string_split = __webpack_require__(119);

// CONCATENATED MODULE: ./src/i18n/IT.js























function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/* harmony default export */ var IT = (function () {
  var _this = this;

  var ZERO = 'zero';
  var CARDINAL_WORDS = [ZERO, 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
  var STR_TENS = {
    '2': 'venti',
    '3': 'trenta',
    '4': 'quaranta',
    '6': 'sessanta'
  };
  var EXPONENT_PREFIXES = [ZERO, 'm', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec'];

  this.accentuate = function (string) {
    var splittedString = string.split(' ');
    var result = splittedString.map(function (word) {
      if (word.slice(-3) == 'tre' && word.length > 3) return word.replace(/tré/g, 'tre').slice(0, -3) + 'tré';else return word.replace(/tré/g, 'tre');
    });
    return result.join(' ');
  };

  this.omitIfZero = function (numberToString) {
    if (numberToString == ZERO) {
      return '';
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
      prefix = CARDINAL_WORDS[tens].slice(0, -1) + 'anta';
    }

    var postfix = _this.omitIfZero(CARDINAL_WORDS[units]);

    return _this.phoneticContraction(prefix + postfix);
  };

  this.hundredsToCardinal = function (number) {
    var hundreds = Math.floor(number / 100);
    var prefix = 'cento';

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
      prefix = 'mille';
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

    if (multiplier.toString() == '1') {
      prefix = 'un ';
    } else {
      prefix = _this.toCardinal(parseInt(multiplier.join('')));
      infix = ' ' + infix.slice(0, -1) + 'i'; // without last element
    }

    var isSetsEqual = function isSetsEqual(a, b) {
      return a.size === b.size && _toConsumableArray(a).every(function (value) {
        return b.has(value);
      });
    };

    if (!isSetsEqual(new Set(exponent), new Set(['0']))) {
      postfix = _this.toCardinal(parseInt(exponent.join('')));

      if (postfix.includes(' e ')) {
        infix += ', '; // for very large numbers
      } else {
        infix += ' e ';
      }
    } else {
      postfix = '';
    }

    return prefix + infix + postfix;
  };

  this.toCardinal = function (number) {
    var words = '';

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
  this.ZERO = 'nulis';
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
        _this$get_digits2 = LT_slicedToArray(_this$get_digits, 2),
        n1 = _this$get_digits2[0],
        n2 = _this$get_digits2[1];

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
  this.ZERO = 'nulle';
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
    '1000000000000000000000000000000000': 'quintillard'
  }, {
    '1000000000000000000000000000000': 'quintillion'
  }, {
    '1000000000000000000000000000': 'quadrillard'
  }, {
    '1000000000000000000000000': 'quadrillion'
  }, {
    '1000000000000000000000': 'trillard'
  }, {
    '1000000000000000000': 'trillion'
  }, {
    '1000000000000000': 'billard'
  }, {
    '1000000000000': 'billion'
  }, {
    '1000000000': 'millard'
  }, {
    '1000000': 'million'
  }, {
    '1000': 'tusen'
  }, {
    '100': 'hundre'
  }, {
    '90': 'nitti'
  }, {
    '80': 'åtti'
  }, {
    '70': 'sytti'
  }, {
    '60': 'seksti'
  }, {
    '50': 'femti'
  }, {
    '40': 'førti'
  }, {
    '30': 'tretti'
  }, {
    '20': 'tjue'
  }, {
    '19': 'nitten'
  }, {
    '18': 'atten'
  }, {
    '17': 'sytten'
  }, {
    '16': 'seksten'
  }, {
    '15': 'femten'
  }, {
    '14': 'fjorten'
  }, {
    '13': 'tretten'
  }, {
    '12': 'tolv'
  }, {
    '11': 'elleve'
  }, {
    '10': 'ti'
  }, {
    '9': 'ni'
  }, {
    '8': 'åtte'
  }, {
    '7': 'syv'
  }, {
    '6': 'seks'
  }, {
    '5': 'fem'
  }, {
    '4': 'fire'
  }, {
    '3': 'tre'
  }, {
    '2': 'to'
  }, {
    '1': 'en'
  }, {
    '0': 'null'
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
  this.ZERO = 'zero';
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
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.constructor.js
var es_regexp_constructor = __webpack_require__(146);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.match.js
var es_string_match = __webpack_require__(147);

// CONCATENATED MODULE: ./src/i18n/PT.js












function PT_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var PT = (function () {
  var _this = this;

  Num2Word["a" /* default */].call(this);
  this.cards = [{
    '1000000000000000000000000': 'quatrilião'
  }, {
    '1000000000000000000': 'trilião'
  }, {
    '1000000000000': 'bilião'
  }, {
    '1000000': 'milião'
  }, {
    '1000': 'mil'
  }, {
    '100': 'cem'
  }, {
    '90': 'noventa'
  }, {
    '80': 'oitenta'
  }, {
    '70': 'setenta'
  }, {
    '60': 'sessenta'
  }, {
    '50': 'cinquenta'
  }, {
    '40': 'quarenta'
  }, {
    '30': 'trinta'
  }, {
    '20': 'vinte'
  }, {
    '19': 'dezanove'
  }, {
    '18': 'dezoito'
  }, {
    '17': 'dezassete'
  }, {
    '16': 'dezasseis'
  }, {
    '15': 'quinze'
  }, {
    '14': 'catorze'
  }, {
    '13': 'treze'
  }, {
    '12': 'doze'
  }, {
    '11': 'onze'
  }, {
    '10': 'dez'
  }, {
    '9': 'nove'
  }, {
    '8': 'oito'
  }, {
    '7': 'sete'
  }, {
    '6': 'seis'
  }, {
    '5': 'cinco'
  }, {
    '4': 'quatro'
  }, {
    '3': 'três'
  }, {
    '2': 'dois'
  }, {
    '1': 'um'
  }, {
    '0': 'zero'
  }];
  this.hundreds = {
    '1': 'cento',
    '2': 'duzentos',
    '3': 'trezentos',
    '4': 'quatrocentos',
    '5': 'quinhentos',
    '6': 'seiscentos',
    '7': 'setecentos',
    '8': 'oitocentos',
    '9': 'novecentos'
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
      ctext = 'um';
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext = 'cento';
    }

    if (nnum < cnum) {
      // if (cnum < 100) {
      //   return { [`${ctext} e ${ntext}`]: cnum + nnum }
      // }
      return PT_defineProperty({}, "".concat(ctext, " e ").concat(ntext), cnum + nnum);
    } else if (nnum % 1000000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + 'liões';
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -4) + 'lhões';
    }

    if (ntext == 'milião') ntext = 'milhão';

    if (nnum == 100) {
      ctext = _this.hundreds[cnum];
      ntext = '';
    } else {
      ntext = ' ' + ntext;
    }

    return PT_defineProperty({}, "".concat(ctext).concat(ntext), cnum * nnum);
  };
});
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.repeat.js
var es_string_repeat = __webpack_require__(148);

// CONCATENATED MODULE: ./src/i18n/TR.js






/* harmony default export */ var TR = (function () {
  var _this = this;

  this.precision = 2;

  this.splitnum = function (value) {
    var float_digits = JSON.stringify(value * Math.pow(10, _this.precision));

    if (parseInt(value) != 0) {
      _this.integers_to_read = [JSON.stringify(parseInt(value)), float_digits.slice(float_digits.length - _this.precision, float_digits.length)];
    } else {
      _this.integers_to_read = ['0', '0'.repeat(_this.precision - float_digits.length) + float_digits.slice(float_digits.length - _this.precision, float_digits.length)];
    }

    if (_this.integers_to_read[0].length % 3 > 0) {
      _this.total_triplets_to_read = Math.floor(_this.integers_to_read[0].length / 3) + 1;
    } else if (_this.integers_to_read[0].length % 3 == 0) {
      _this.total_triplets_to_read = Math.floor(_this.integers_to_read[0].length / 3);
    }

    _this.total_digits_outside_triplets = _this.integers_to_read[0].length % 3;

    var okunacak = _this.integers_to_read[0].split('').reverse();

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
    '1': 'bir',
    '2': 'iki',
    '3': 'üç',
    '4': 'dört',
    '5': 'beş',
    '6': 'altı',
    '7': 'yedi',
    '8': 'sekiz',
    '9': 'dokuz'
  };
  this.CARDINAL_TENS = {
    '1': 'on',
    '2': 'yirmi',
    '3': 'otuz',
    '4': 'kırk',
    '5': 'elli',
    '6': 'altmış',
    '7': 'yetmiş',
    '8': 'seksen',
    '9': 'doksan'
  };
  this.HUNDREDS = {
    '2': 'iki',
    '3': 'üç',
    '4': 'dört',
    '5': 'beş',
    '6': 'altı',
    '7': 'yedi',
    '8': 'sekiz',
    '9': 'dokuz'
  };
  this.CARDINAL_HUNDRED = ['yüz', ''];
  this.CARDINAL_TRIPLETS = {
    1: 'bin',
    2: 'milyon',
    3: 'milyar',
    4: 'trilyon',
    5: 'katrilyon',
    6: 'kentilyon'
  };
  this.integers_to_read = [];
  this.total_triplets_to_read = 0;
  this.total_digits_outside_triplets = 0;
  this.order_of_last_zero_digit = 0;

  this.toCardinal = function (value) {
    if (parseInt(value) == 0) {
      return 'sıfır';
    }

    _this.splitnum(value);

    var wrd = '';

    if (_this.order_of_last_zero_digit >= _this.integers_to_read[0].length) {
      return wrd;
    }

    if (_this.total_triplets_to_read == 1) {
      if (_this.total_digits_outside_triplets == 2) {
        if (_this.order_of_last_zero_digit == 1) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || '';
          return wrd;
        }

        if (_this.order_of_last_zero_digit == 0) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][1]] || '';
        }

        return wrd;
      }

      if (_this.total_digits_outside_triplets == 1) {
        if (_this.order_of_last_zero_digit == 0) {
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][0]] || '';
          return wrd;
        }
      }

      if (_this.total_digits_outside_triplets == 0) {
        if (_this.order_of_last_zero_digit == 2) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_HUNDRED[0];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == 1) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || '';
          return wrd;
        }

        if (_this.order_of_last_zero_digit == 0) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || '';
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][2]] || '';
          return wrd;
        }
      }
    }

    if (_this.total_triplets_to_read >= 2) {
      if (_this.total_digits_outside_triplets == 2) {
        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 1) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 2) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][1]] || '';
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit < _this.integers_to_read[0].length - 2) {
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][1]] || '';
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
        }
      }

      if (_this.total_digits_outside_triplets == 1) {
        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 1) {
          if (!(_this.total_triplets_to_read == 2 && _this.integers_to_read[0][0] == '1')) {
            wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][0]] || '';
          }

          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit < _this.integers_to_read[0].length - 1) {
          if (!(_this.total_triplets_to_read == 2 && _this.integers_to_read[0][0] == '1')) {
            wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][0]] || '';
          }

          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
        }
      }

      if (_this.total_digits_outside_triplets == 0) {
        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 1) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 2) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || '';
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - 3) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || '';
          wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][2]] || '';
          wrd += _this.CARDINAL_TRIPLETS[_this.total_triplets_to_read - 1];
          return wrd;
        }

        if (_this.order_of_last_zero_digit < _this.integers_to_read[0].length - 3) {
          wrd += _this.HUNDREDS[_this.integers_to_read[0][0]] || '';
          wrd += _this.CARDINAL_HUNDRED[0];
          wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][1]] || '';

          if (!(_this.total_triplets_to_read == 2 && _this.integers_to_read[0][2] == '1')) {
            wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][2]] || '';
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

        if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 3) != '000') {
          if (_this.integers_to_read[0][last_read_digit_order] != '0') {
            wrd += _this.HUNDREDS[_this.integers_to_read[0][last_read_digit_order]] || '';

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

          if (_this.integers_to_read[0][last_read_digit_order + 1] != '0') {
            if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - last_read_digit_order - 2) {
              if (i == 1) {
                wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][last_read_digit_order + 1]] || '';
                return wrd;
              } else if (i > 1) {
                wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][last_read_digit_order + 1]] || '';
                wrd += _this.CARDINAL_TRIPLETS[i - 1];
                return wrd;
              }
            } else {
              wrd += _this.CARDINAL_TENS[_this.integers_to_read[0][last_read_digit_order + 1]] || '';
            }
          }

          if (_this.integers_to_read[0][last_read_digit_order + 2] != '0') {
            if (_this.order_of_last_zero_digit == _this.integers_to_read[0].length - last_read_digit_order - 3) {
              if (i == 1) {
                wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || '';
                return wrd;
              }

              if (i == 2) {
                if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != '00') {
                  wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || '';
                } else if (_this.integers_to_read[0][last_read_digit_order + 2] != '1') {
                  wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || '';
                }

                wrd += _this.CARDINAL_TRIPLETS[i - 1];
                return wrd;
              }

              if (i > 2) {
                wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || '';
                wrd += _this.CARDINAL_TRIPLETS[i - 1];
                return wrd;
              }
            } else {
              if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != '00') {
                wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || '';
              } else {
                if (i == 2) {
                  if (_this.integers_to_read[0].slice(last_read_digit_order, last_read_digit_order + 2) != '00') {
                    wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || '';
                  } else if (_this.integers_to_read[0][last_read_digit_order + 2] != '1') {
                    wrd += _this.CARDINAL_ONES[_this.integers_to_read[0][last_read_digit_order + 2]] || '';
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
  this.ZERO = 'нуль';
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
  var lang = 'EN'; // default language

  var supportedLanguages = ['en', 'fr', 'es', 'de', 'pt', 'it', 'tr', 'ru', 'cz', 'no', 'dk', 'pl', 'uk', 'lt', 'lv', 'ar', 'he', 'ko'];

  if (options) {
    if (options.lang) {
      // lang is given in options
      if (supportedLanguages.indexOf(options.lang) != -1) lang = options.lang.toUpperCase();else throw Error('ERROR: Unsupported language. Supported languages are:' + supportedLanguages.sort().join(', '));
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