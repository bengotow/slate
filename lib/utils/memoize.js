'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Is in development?
 *
 * @type {Boolean}
 */

var IS_DEV = typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production';

/**
 * GLOBAL: True if memoization should is enabled. Only effective when `IS_DEV`.
 *
 * @type {Boolean}
 */

var ENABLED = true;

/**
 * GLOBAL: Changing this cache key will clear all previous cached results.
 * Only effective when `IS_DEV`.
 *
 * @type {Number}
 */

var CACHE_KEY = 0;

/**
 * The leaf node of a cache tree. Used to support variable argument length. A
 * unique object, so that native Maps will key it by reference.
 *
 * @type {Object}
 */

var LEAF = {};

/**
 * A value to represent a memoized undefined value. Allows efficient value
 * retrieval using Map.get only.
 *
 * @type {Object}
 */

var UNDEFINED = {};

/**
 * Default value for unset keys in native Maps
 *
 * @type {Undefined}
 */

var UNSET = undefined;

/**
 * Memoize all of the `properties` on a `object`.
 *
 * @param {Object} object
 * @param {Array} properties
 * @return {Record}
 */

function memoize(object, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$takesArgumen = options.takesArguments,
      takesArguments = _options$takesArgumen === undefined ? true : _options$takesArgumen;

  var _loop = function _loop(property) {
    var original = object[property];

    if (!original) {
      throw new Error('Object does not have a property named "' + property + '".');
    }

    object[property] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (IS_DEV) {
        // If memoization is disabled, call into the original method.
        if (!ENABLED) return original.apply(this, args);

        // If the cache key is different, previous caches must be cleared.
        if (CACHE_KEY !== this.__cache_key) {
          this.__cache_key = CACHE_KEY;
          this.__cache = new Map(); // eslint-disable-line no-undef,no-restricted-globals
        }
      }

      if (!this.__cache) {
        this.__cache = new Map(); // eslint-disable-line no-undef,no-restricted-globals
      }

      var cachedValue = void 0;
      var keys = void 0;

      if (takesArguments) {
        keys = [property].concat(args);
        cachedValue = getIn(this.__cache, keys);
      } else {
        cachedValue = this.__cache.get(property);
      }

      // If we've got a result already, return it.
      if (cachedValue !== UNSET) {
        return cachedValue === UNDEFINED ? undefined : cachedValue;
      }

      // Otherwise calculate what it should be once and cache it.
      var value = original.apply(this, args);
      var v = value === undefined ? UNDEFINED : value;

      if (takesArguments) {
        this.__cache = setIn(this.__cache, keys, v);
      } else {
        this.__cache.set(property, v);
      }

      return value;
    };
  };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {

    for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var property = _step.value;

      _loop(property);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

/**
 * Get a value at a key path in a tree of Map.
 *
 * If not set, returns UNSET.
 * If the set value is undefined, returns UNDEFINED.
 *
 * @param {Map} map
 * @param {Array} keys
 * @return {Any|UNSET|UNDEFINED}
 */

function getIn(map, keys) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      map = map.get(key);
      if (map === UNSET) return UNSET;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return map.get(LEAF);
}

/**
 * Set a value at a key path in a tree of Map, creating Maps on the go.
 *
 * @param {Map} map
 * @param {Array} keys
 * @param {Any} value
 * @return {Map}
 */

function setIn(map, keys, value) {
  var parent = map;
  var child = void 0;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var key = _step3.value;

      child = parent.get(key);

      // If the path was not created yet...
      if (child === UNSET) {
        child = new Map(); // eslint-disable-line no-undef,no-restricted-globals
        parent.set(key, child);
      }

      parent = child;
    }

    // The whole path has been created, so set the value to the bottom most map.
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  child.set(LEAF, value);
  return map;
}

/**
 * In DEV mode, clears the previously memoized values, globally.
 *
 * @return {Void}
 */

function __clear() {
  CACHE_KEY++;

  if (CACHE_KEY >= Number.MAX_SAFE_INTEGER) {
    CACHE_KEY = 0;
  }
}

/**
 * In DEV mode, enable or disable the use of memoize values, globally.
 *
 * @param {Boolean} enabled
 * @return {Void}
 */

function __enable(enabled) {
  ENABLED = enabled;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = memoize;
exports.__clear = __clear;
exports.__enable = __enable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tZW1vaXplLmpzIl0sIm5hbWVzIjpbIklTX0RFViIsInByb2Nlc3MiLCJlbnYiLCJOT0RFX0VOViIsIkVOQUJMRUQiLCJDQUNIRV9LRVkiLCJMRUFGIiwiVU5ERUZJTkVEIiwiVU5TRVQiLCJ1bmRlZmluZWQiLCJtZW1vaXplIiwib2JqZWN0IiwicHJvcGVydGllcyIsIm9wdGlvbnMiLCJ0YWtlc0FyZ3VtZW50cyIsInByb3BlcnR5Iiwib3JpZ2luYWwiLCJFcnJvciIsImFyZ3MiLCJhcHBseSIsIl9fY2FjaGVfa2V5IiwiX19jYWNoZSIsIk1hcCIsImNhY2hlZFZhbHVlIiwia2V5cyIsImdldEluIiwiZ2V0IiwidmFsdWUiLCJ2Iiwic2V0SW4iLCJzZXQiLCJtYXAiLCJrZXkiLCJwYXJlbnQiLCJjaGlsZCIsIl9fY2xlYXIiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiX19lbmFibGUiLCJlbmFibGVkIiwiZGVmYXVsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7OztBQU1BLElBQU1BLFNBQ0osT0FBT0MsT0FBUCxLQUFtQixXQUFuQixJQUNBQSxRQUFRQyxHQURSLElBRUFELFFBQVFDLEdBQVIsQ0FBWUMsUUFBWixLQUF5QixZQUgzQjs7QUFNQTs7Ozs7O0FBTUEsSUFBSUMsVUFBVSxJQUFkOztBQUVBOzs7Ozs7O0FBT0EsSUFBSUMsWUFBWSxDQUFoQjs7QUFFQTs7Ozs7OztBQU9BLElBQU1DLE9BQU8sRUFBYjs7QUFFQTs7Ozs7OztBQU9BLElBQU1DLFlBQVksRUFBbEI7O0FBRUE7Ozs7OztBQU1BLElBQU1DLFFBQVFDLFNBQWQ7O0FBRUE7Ozs7Ozs7O0FBUUEsU0FBU0MsT0FBVCxDQUFpQkMsTUFBakIsRUFBeUJDLFVBQXpCLEVBQW1EO0FBQUEsTUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUEsOEJBQ2ZBLE9BRGUsQ0FDekNDLGNBRHlDO0FBQUEsTUFDekNBLGNBRHlDLHlDQUN4QixJQUR3Qjs7QUFBQSw2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R0FBYTs7QUFDdEJFLGNBQVFELE9BQU9QLEdBQVAsQ0FBV00sR0FBWCxDQUFSOztBQUVBO0FBQ0EsVUFBSUUsVUFBVTFCLEtBQWQsRUFBcUI7QUFDbkIwQixnQkFBUSxJQUFJWixHQUFKLEVBQVIsQ0FEbUIsQ0FDRDtBQUNsQlcsZUFBT0gsR0FBUCxDQUFXRSxHQUFYLEVBQWdCRSxLQUFoQjtBQUNEOztBQUVERCxlQUFTQyxLQUFUO0FBQ0Q7O0FBRUQ7QUFoQitCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBaUIvQkEsUUFBTUosR0FBTixDQUFVeEIsSUFBVixFQUFnQnFCLEtBQWhCO0FBQ0EsU0FBT0ksR0FBUDtBQUNEOztBQUVEOzs7Ozs7QUFNQSxTQUFTSSxPQUFULEdBQW1CO0FBQ2pCOUI7O0FBRUEsTUFBSUEsYUFBYStCLE9BQU9DLGdCQUF4QixFQUEwQztBQUN4Q2hDLGdCQUFZLENBQVo7QUFDRDtBQUNGOztBQUVEOzs7Ozs7O0FBT0EsU0FBU2lDLFFBQVQsQ0FBa0JDLE9BQWxCLEVBQTJCO0FBQ3pCbkMsWUFBVW1DLE9BQVY7QUFDRDs7QUFFRDs7Ozs7O1FBT2FDLE8sR0FBWDlCLE87UUFDQXlCLE8sR0FBQUEsTztRQUNBRyxRLEdBQUFBLFEiLCJmaWxlIjoibWVtb2l6ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBJcyBpbiBkZXZlbG9wbWVudD9cbiAqXG4gKiBAdHlwZSB7Qm9vbGVhbn1cbiAqL1xuXG5jb25zdCBJU19ERVYgPSAoXG4gIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJlxuICBwcm9jZXNzLmVudiAmJlxuICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXG4pXG5cbi8qKlxuICogR0xPQkFMOiBUcnVlIGlmIG1lbW9pemF0aW9uIHNob3VsZCBpcyBlbmFibGVkLiBPbmx5IGVmZmVjdGl2ZSB3aGVuIGBJU19ERVZgLlxuICpcbiAqIEB0eXBlIHtCb29sZWFufVxuICovXG5cbmxldCBFTkFCTEVEID0gdHJ1ZVxuXG4vKipcbiAqIEdMT0JBTDogQ2hhbmdpbmcgdGhpcyBjYWNoZSBrZXkgd2lsbCBjbGVhciBhbGwgcHJldmlvdXMgY2FjaGVkIHJlc3VsdHMuXG4gKiBPbmx5IGVmZmVjdGl2ZSB3aGVuIGBJU19ERVZgLlxuICpcbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cblxubGV0IENBQ0hFX0tFWSA9IDBcblxuLyoqXG4gKiBUaGUgbGVhZiBub2RlIG9mIGEgY2FjaGUgdHJlZS4gVXNlZCB0byBzdXBwb3J0IHZhcmlhYmxlIGFyZ3VtZW50IGxlbmd0aC4gQVxuICogdW5pcXVlIG9iamVjdCwgc28gdGhhdCBuYXRpdmUgTWFwcyB3aWxsIGtleSBpdCBieSByZWZlcmVuY2UuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBMRUFGID0ge31cblxuLyoqXG4gKiBBIHZhbHVlIHRvIHJlcHJlc2VudCBhIG1lbW9pemVkIHVuZGVmaW5lZCB2YWx1ZS4gQWxsb3dzIGVmZmljaWVudCB2YWx1ZVxuICogcmV0cmlldmFsIHVzaW5nIE1hcC5nZXQgb25seS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IFVOREVGSU5FRCA9IHt9XG5cbi8qKlxuICogRGVmYXVsdCB2YWx1ZSBmb3IgdW5zZXQga2V5cyBpbiBuYXRpdmUgTWFwc1xuICpcbiAqIEB0eXBlIHtVbmRlZmluZWR9XG4gKi9cblxuY29uc3QgVU5TRVQgPSB1bmRlZmluZWRcblxuLyoqXG4gKiBNZW1vaXplIGFsbCBvZiB0aGUgYHByb3BlcnRpZXNgIG9uIGEgYG9iamVjdGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHBhcmFtIHtBcnJheX0gcHJvcGVydGllc1xuICogQHJldHVybiB7UmVjb3JkfVxuICovXG5cbmZ1bmN0aW9uIG1lbW9pemUob2JqZWN0LCBwcm9wZXJ0aWVzLCBvcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyB0YWtlc0FyZ3VtZW50cyA9IHRydWUgfSA9IG9wdGlvbnNcblxuICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBvcmlnaW5hbCA9IG9iamVjdFtwcm9wZXJ0eV1cblxuICAgIGlmICghb3JpZ2luYWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgT2JqZWN0IGRvZXMgbm90IGhhdmUgYSBwcm9wZXJ0eSBuYW1lZCBcIiR7cHJvcGVydHl9XCIuYClcbiAgICB9XG5cbiAgICBvYmplY3RbcHJvcGVydHldID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgIGlmIChJU19ERVYpIHtcbiAgICAgICAgLy8gSWYgbWVtb2l6YXRpb24gaXMgZGlzYWJsZWQsIGNhbGwgaW50byB0aGUgb3JpZ2luYWwgbWV0aG9kLlxuICAgICAgICBpZiAoIUVOQUJMRUQpIHJldHVybiBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKVxuXG4gICAgICAgIC8vIElmIHRoZSBjYWNoZSBrZXkgaXMgZGlmZmVyZW50LCBwcmV2aW91cyBjYWNoZXMgbXVzdCBiZSBjbGVhcmVkLlxuICAgICAgICBpZiAoQ0FDSEVfS0VZICE9PSB0aGlzLl9fY2FjaGVfa2V5KSB7XG4gICAgICAgICAgdGhpcy5fX2NhY2hlX2tleSA9IENBQ0hFX0tFWVxuICAgICAgICAgIHRoaXMuX19jYWNoZSA9IG5ldyBNYXAoKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmLG5vLXJlc3RyaWN0ZWQtZ2xvYmFsc1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5fX2NhY2hlKSB7XG4gICAgICAgIHRoaXMuX19jYWNoZSA9IG5ldyBNYXAoKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmLG5vLXJlc3RyaWN0ZWQtZ2xvYmFsc1xuICAgICAgfVxuXG4gICAgICBsZXQgY2FjaGVkVmFsdWVcbiAgICAgIGxldCBrZXlzXG5cbiAgICAgIGlmICh0YWtlc0FyZ3VtZW50cykge1xuICAgICAgICBrZXlzID0gW3Byb3BlcnR5LCAuLi5hcmdzXVxuICAgICAgICBjYWNoZWRWYWx1ZSA9IGdldEluKHRoaXMuX19jYWNoZSwga2V5cylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhY2hlZFZhbHVlID0gdGhpcy5fX2NhY2hlLmdldChwcm9wZXJ0eSlcbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UndmUgZ290IGEgcmVzdWx0IGFscmVhZHksIHJldHVybiBpdC5cbiAgICAgIGlmIChjYWNoZWRWYWx1ZSAhPT0gVU5TRVQpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlZFZhbHVlID09PSBVTkRFRklORUQgPyB1bmRlZmluZWQgOiBjYWNoZWRWYWx1ZVxuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UgY2FsY3VsYXRlIHdoYXQgaXQgc2hvdWxkIGJlIG9uY2UgYW5kIGNhY2hlIGl0LlxuICAgICAgY29uc3QgdmFsdWUgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgY29uc3QgdiA9IHZhbHVlID09PSB1bmRlZmluZWQgPyBVTkRFRklORUQgOiB2YWx1ZVxuXG4gICAgICBpZiAodGFrZXNBcmd1bWVudHMpIHtcbiAgICAgICAgdGhpcy5fX2NhY2hlID0gc2V0SW4odGhpcy5fX2NhY2hlLCBrZXlzLCB2KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fX2NhY2hlLnNldChwcm9wZXJ0eSwgdilcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR2V0IGEgdmFsdWUgYXQgYSBrZXkgcGF0aCBpbiBhIHRyZWUgb2YgTWFwLlxuICpcbiAqIElmIG5vdCBzZXQsIHJldHVybnMgVU5TRVQuXG4gKiBJZiB0aGUgc2V0IHZhbHVlIGlzIHVuZGVmaW5lZCwgcmV0dXJucyBVTkRFRklORUQuXG4gKlxuICogQHBhcmFtIHtNYXB9IG1hcFxuICogQHBhcmFtIHtBcnJheX0ga2V5c1xuICogQHJldHVybiB7QW55fFVOU0VUfFVOREVGSU5FRH1cbiAqL1xuXG5mdW5jdGlvbiBnZXRJbihtYXAsIGtleXMpIHtcbiAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgIG1hcCA9IG1hcC5nZXQoa2V5KVxuICAgIGlmIChtYXAgPT09IFVOU0VUKSByZXR1cm4gVU5TRVRcbiAgfVxuXG4gIHJldHVybiBtYXAuZ2V0KExFQUYpXG59XG5cbi8qKlxuICogU2V0IGEgdmFsdWUgYXQgYSBrZXkgcGF0aCBpbiBhIHRyZWUgb2YgTWFwLCBjcmVhdGluZyBNYXBzIG9uIHRoZSBnby5cbiAqXG4gKiBAcGFyYW0ge01hcH0gbWFwXG4gKiBAcGFyYW0ge0FycmF5fSBrZXlzXG4gKiBAcGFyYW0ge0FueX0gdmFsdWVcbiAqIEByZXR1cm4ge01hcH1cbiAqL1xuXG5mdW5jdGlvbiBzZXRJbihtYXAsIGtleXMsIHZhbHVlKSB7XG4gIGxldCBwYXJlbnQgPSBtYXBcbiAgbGV0IGNoaWxkXG5cbiAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgIGNoaWxkID0gcGFyZW50LmdldChrZXkpXG5cbiAgICAvLyBJZiB0aGUgcGF0aCB3YXMgbm90IGNyZWF0ZWQgeWV0Li4uXG4gICAgaWYgKGNoaWxkID09PSBVTlNFVCkge1xuICAgICAgY2hpbGQgPSBuZXcgTWFwKCkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZixuby1yZXN0cmljdGVkLWdsb2JhbHNcbiAgICAgIHBhcmVudC5zZXQoa2V5LCBjaGlsZClcbiAgICB9XG5cbiAgICBwYXJlbnQgPSBjaGlsZFxuICB9XG5cbiAgLy8gVGhlIHdob2xlIHBhdGggaGFzIGJlZW4gY3JlYXRlZCwgc28gc2V0IHRoZSB2YWx1ZSB0byB0aGUgYm90dG9tIG1vc3QgbWFwLlxuICBjaGlsZC5zZXQoTEVBRiwgdmFsdWUpXG4gIHJldHVybiBtYXBcbn1cblxuLyoqXG4gKiBJbiBERVYgbW9kZSwgY2xlYXJzIHRoZSBwcmV2aW91c2x5IG1lbW9pemVkIHZhbHVlcywgZ2xvYmFsbHkuXG4gKlxuICogQHJldHVybiB7Vm9pZH1cbiAqL1xuXG5mdW5jdGlvbiBfX2NsZWFyKCkge1xuICBDQUNIRV9LRVkrK1xuXG4gIGlmIChDQUNIRV9LRVkgPj0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHtcbiAgICBDQUNIRV9LRVkgPSAwXG4gIH1cbn1cblxuLyoqXG4gKiBJbiBERVYgbW9kZSwgZW5hYmxlIG9yIGRpc2FibGUgdGhlIHVzZSBvZiBtZW1vaXplIHZhbHVlcywgZ2xvYmFsbHkuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBlbmFibGVkXG4gKiBAcmV0dXJuIHtWb2lkfVxuICovXG5cbmZ1bmN0aW9uIF9fZW5hYmxlKGVuYWJsZWQpIHtcbiAgRU5BQkxFRCA9IGVuYWJsZWRcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQge1xuICBtZW1vaXplIGFzIGRlZmF1bHQsXG4gIF9fY2xlYXIsXG4gIF9fZW5hYmxlXG59XG4iXX0=