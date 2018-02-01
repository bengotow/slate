'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SUPPORTED_EVENTS = exports.IS_WINDOWS = exports.IS_MAC = exports.IS_IOS = exports.IS_ANDROID = exports.IS_IE = exports.IS_SAFARI = exports.IS_FIREFOX = exports.IS_CHROME = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _isInBrowser = require('is-in-browser');

var _isInBrowser2 = _interopRequireDefault(_isInBrowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Browser matching rules.
 *
 * @type {Array}
 */

var BROWSER_RULES = [['edge', /Edge\/([0-9\._]+)/], ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/], ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/], ['opera', /Opera\/([0-9\.]+)(?:\s|$)/], ['opera', /OPR\/([0-9\.]+)(:?\s|$)$/], ['ie', /Trident\/7\.0.*rv\:([0-9\.]+)\).*Gecko$/], ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/], ['ie', /MSIE\s(7\.0)/], ['android', /Android\s([0-9\.]+)/], ['safari', /Version\/([0-9\._]+).*Safari/]];

/**
 * DOM event matching rules.
 *
 * @type {Array}
 */

var EVENT_RULES = [['beforeinput', function (el) {
  return 'onbeforeinput' in el;
}]];

/**
 * Operating system matching rules.
 *
 * @type {Array}
 */

var OS_RULES = [['ios', /os ([\.\_\d]+) like mac os/i], // must be before the macos rule
['macos', /mac os x/i], ['android', /android/i], ['firefoxos', /mozilla\/[a-z\.\_\d]+ \((?:mobile)|(?:tablet)/i], ['windows', /windows\s*(?:nt)?\s*([\.\_\d]+)/i]];

/**
 * Define variables to store the result.
 */

var BROWSER = void 0;
var EVENTS = {};
var OS = void 0;

/**
 * Run the matchers when in browser.
 */

if (_isInBrowser2.default) {
  var userAgent = window.navigator.userAgent;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {

    for (var _iterator = BROWSER_RULES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref = _step.value;

      var _ref2 = _slicedToArray(_ref, 2);

      var name = _ref2[0];
      var regexp = _ref2[1];

      if (regexp.test(userAgent)) {
        BROWSER = name;
        break;
      }
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = OS_RULES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _ref3 = _step2.value;

      var _ref4 = _slicedToArray(_ref3, 2);

      var _name = _ref4[0];
      var _regexp = _ref4[1];

      if (_regexp.test(userAgent)) {
        OS = _name;
        break;
      }
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

  var testEl = window.document.createElement('div');
  testEl.contentEditable = true;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = EVENT_RULES[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _ref5 = _step3.value;

      var _ref6 = _slicedToArray(_ref5, 2);

      var _name2 = _ref6[0];
      var testFn = _ref6[1];

      EVENTS[_name2] = testFn(testEl);
    }
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
}

/**
 * Export.
 *
 * @type {Object}
 */

var IS_CHROME = exports.IS_CHROME = BROWSER === 'chrome';
var IS_FIREFOX = exports.IS_FIREFOX = BROWSER === 'firefox';
var IS_SAFARI = exports.IS_SAFARI = BROWSER === 'safari';
var IS_IE = exports.IS_IE = BROWSER === 'ie';

var IS_ANDROID = exports.IS_ANDROID = OS === 'android';
var IS_IOS = exports.IS_IOS = OS === 'ios';
var IS_MAC = exports.IS_MAC = OS === 'macos';
var IS_WINDOWS = exports.IS_WINDOWS = OS === 'windows';

var SUPPORTED_EVENTS = exports.SUPPORTED_EVENTS = EVENTS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvZW52aXJvbm1lbnQuanMiXSwibmFtZXMiOlsiQlJPV1NFUl9SVUxFUyIsIkVWRU5UX1JVTEVTIiwiZWwiLCJPU19SVUxFUyIsIkJST1dTRVIiLCJFVkVOVFMiLCJPUyIsInVzZXJBZ2VudCIsIndpbmRvdyIsIm5hdmlnYXRvciIsIm5hbWUiLCJyZWdleHAiLCJ0ZXN0IiwidGVzdEVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY29udGVudEVkaXRhYmxlIiwidGVzdEZuIiwiSVNfQ0hST01FIiwiSVNfRklSRUZPWCIsIklTX1NBRkFSSSIsIklTX0lFIiwiSVNfQU5EUk9JRCIsIklTX0lPUyIsIklTX01BQyIsIklTX1dJTkRPV1MiLCJTVVBQT1JURURfRVZFTlRTIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGdCQUFnQixDQUNwQixDQUFDLE1BQUQsRUFBUyxtQkFBVCxDQURvQixFQUVwQixDQUFDLFFBQUQsRUFBVyxrREFBWCxDQUZvQixFQUdwQixDQUFDLFNBQUQsRUFBWSw2QkFBWixDQUhvQixFQUlwQixDQUFDLE9BQUQsRUFBVSwyQkFBVixDQUpvQixFQUtwQixDQUFDLE9BQUQsRUFBVSwwQkFBVixDQUxvQixFQU1wQixDQUFDLElBQUQsRUFBTyx5Q0FBUCxDQU5vQixFQU9wQixDQUFDLElBQUQsRUFBTyxxQ0FBUCxDQVBvQixFQVFwQixDQUFDLElBQUQsRUFBTyxjQUFQLENBUm9CLEVBU3BCLENBQUMsU0FBRCxFQUFZLHFCQUFaLENBVG9CLEVBVXBCLENBQUMsUUFBRCxFQUFXLDhCQUFYLENBVm9CLENBQXRCOztBQWFBOzs7Ozs7QUFNQSxJQUFNQyxjQUFjLENBQ2xCLENBQUMsYUFBRCxFQUFnQjtBQUFBLFNBQU0sbUJBQW1CQyxFQUF6QjtBQUFBLENBQWhCLENBRGtCLENBQXBCOztBQUlBOzs7Ozs7QUFNQSxJQUFNQyxXQUFXLENBQ2YsQ0FBQyxLQUFELEVBQVEsNkJBQVIsQ0FEZSxFQUN5QjtBQUN4QyxDQUFDLE9BQUQsRUFBVSxXQUFWLENBRmUsRUFHZixDQUFDLFNBQUQsRUFBWSxVQUFaLENBSGUsRUFJZixDQUFDLFdBQUQsRUFBYyxnREFBZCxDQUplLEVBS2YsQ0FBQyxTQUFELEVBQVksa0NBQVosQ0FMZSxDQUFqQjs7QUFRQTs7OztBQUlBLElBQUlDLGdCQUFKO0FBQ0EsSUFBTUMsU0FBUyxFQUFmO0FBQ0EsSUFBSUMsV0FBSjs7QUFFQTs7OztBQUlBLDJCQUFhO0FBQUEsTUFDSEMsU0FERyxHQUNXQyxPQUFPQyxTQURsQixDQUNIRixTQURHO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUdYLHlCQUErQlAsYUFBL0IsOEhBQThDO0FBQUE7O0FBQUE7O0FBQUEsVUFBakNVLElBQWlDO0FBQUEsVUFBM0JDLE1BQTJCOztBQUM1QyxVQUFJQSxPQUFPQyxJQUFQLENBQVlMLFNBQVosQ0FBSixFQUE0QjtBQUMxQkgsa0JBQVVNLElBQVY7QUFDQTtBQUNEO0FBQ0Y7QUFSVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQVVYLDBCQUErQlAsUUFBL0IsbUlBQXlDO0FBQUE7O0FBQUE7O0FBQUEsVUFBNUJPLEtBQTRCO0FBQUEsVUFBdEJDLE9BQXNCOztBQUN2QyxVQUFJQSxRQUFPQyxJQUFQLENBQVlMLFNBQVosQ0FBSixFQUE0QjtBQUMxQkQsYUFBS0ksS0FBTDtBQUNBO0FBQ0Q7QUFDRjtBQWZVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBaUJYLE1BQU1HLFNBQVNMLE9BQU9NLFFBQVAsQ0FBZ0JDLGFBQWhCLENBQThCLEtBQTlCLENBQWY7QUFDQUYsU0FBT0csZUFBUCxHQUF5QixJQUF6Qjs7QUFsQlc7QUFBQTtBQUFBOztBQUFBO0FBb0JYLDBCQUErQmYsV0FBL0IsbUlBQTRDO0FBQUE7O0FBQUE7O0FBQUEsVUFBL0JTLE1BQStCO0FBQUEsVUFBekJPLE1BQXlCOztBQUMxQ1osYUFBT0ssTUFBUCxJQUFlTyxPQUFPSixNQUFQLENBQWY7QUFDRDtBQXRCVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBdUJaOztBQUVEOzs7Ozs7QUFNTyxJQUFNSyxnQ0FBWWQsWUFBWSxRQUE5QjtBQUNBLElBQU1lLGtDQUFhZixZQUFZLFNBQS9CO0FBQ0EsSUFBTWdCLGdDQUFZaEIsWUFBWSxRQUE5QjtBQUNBLElBQU1pQix3QkFBUWpCLFlBQVksSUFBMUI7O0FBRUEsSUFBTWtCLGtDQUFhaEIsT0FBTyxTQUExQjtBQUNBLElBQU1pQiwwQkFBU2pCLE9BQU8sS0FBdEI7QUFDQSxJQUFNa0IsMEJBQVNsQixPQUFPLE9BQXRCO0FBQ0EsSUFBTW1CLGtDQUFhbkIsT0FBTyxTQUExQjs7QUFFQSxJQUFNb0IsOENBQW1CckIsTUFBekIiLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBicm93c2VyIGZyb20gJ2lzLWluLWJyb3dzZXInXG5cbi8qKlxuICogQnJvd3NlciBtYXRjaGluZyBydWxlcy5cbiAqXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cblxuY29uc3QgQlJPV1NFUl9SVUxFUyA9IFtcbiAgWydlZGdlJywgL0VkZ2VcXC8oWzAtOVxcLl9dKykvXSxcbiAgWydjaHJvbWUnLCAvKD8hQ2hyb20uKk9QUilDaHJvbSg/OmV8aXVtKVxcLyhbMC05XFwuXSspKDo/XFxzfCQpL10sXG4gIFsnZmlyZWZveCcsIC9GaXJlZm94XFwvKFswLTlcXC5dKykoPzpcXHN8JCkvXSxcbiAgWydvcGVyYScsIC9PcGVyYVxcLyhbMC05XFwuXSspKD86XFxzfCQpL10sXG4gIFsnb3BlcmEnLCAvT1BSXFwvKFswLTlcXC5dKykoOj9cXHN8JCkkL10sXG4gIFsnaWUnLCAvVHJpZGVudFxcLzdcXC4wLipydlxcOihbMC05XFwuXSspXFwpLipHZWNrbyQvXSxcbiAgWydpZScsIC9NU0lFXFxzKFswLTlcXC5dKyk7LipUcmlkZW50XFwvWzQtN10uMC9dLFxuICBbJ2llJywgL01TSUVcXHMoN1xcLjApL10sXG4gIFsnYW5kcm9pZCcsIC9BbmRyb2lkXFxzKFswLTlcXC5dKykvXSxcbiAgWydzYWZhcmknLCAvVmVyc2lvblxcLyhbMC05XFwuX10rKS4qU2FmYXJpL10sXG5dXG5cbi8qKlxuICogRE9NIGV2ZW50IG1hdGNoaW5nIHJ1bGVzLlxuICpcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuXG5jb25zdCBFVkVOVF9SVUxFUyA9IFtcbiAgWydiZWZvcmVpbnB1dCcsIGVsID0+ICdvbmJlZm9yZWlucHV0JyBpbiBlbF1cbl1cblxuLyoqXG4gKiBPcGVyYXRpbmcgc3lzdGVtIG1hdGNoaW5nIHJ1bGVzLlxuICpcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuXG5jb25zdCBPU19SVUxFUyA9IFtcbiAgWydpb3MnLCAvb3MgKFtcXC5cXF9cXGRdKykgbGlrZSBtYWMgb3MvaV0sIC8vIG11c3QgYmUgYmVmb3JlIHRoZSBtYWNvcyBydWxlXG4gIFsnbWFjb3MnLCAvbWFjIG9zIHgvaV0sXG4gIFsnYW5kcm9pZCcsIC9hbmRyb2lkL2ldLFxuICBbJ2ZpcmVmb3hvcycsIC9tb3ppbGxhXFwvW2EtelxcLlxcX1xcZF0rIFxcKCg/Om1vYmlsZSl8KD86dGFibGV0KS9pXSxcbiAgWyd3aW5kb3dzJywgL3dpbmRvd3NcXHMqKD86bnQpP1xccyooW1xcLlxcX1xcZF0rKS9pXSxcbl1cblxuLyoqXG4gKiBEZWZpbmUgdmFyaWFibGVzIHRvIHN0b3JlIHRoZSByZXN1bHQuXG4gKi9cblxubGV0IEJST1dTRVJcbmNvbnN0IEVWRU5UUyA9IHt9XG5sZXQgT1NcblxuLyoqXG4gKiBSdW4gdGhlIG1hdGNoZXJzIHdoZW4gaW4gYnJvd3Nlci5cbiAqL1xuXG5pZiAoYnJvd3Nlcikge1xuICBjb25zdCB7IHVzZXJBZ2VudCB9ID0gd2luZG93Lm5hdmlnYXRvclxuXG4gIGZvciAoY29uc3QgWyBuYW1lLCByZWdleHAgXSBvZiBCUk9XU0VSX1JVTEVTKSB7XG4gICAgaWYgKHJlZ2V4cC50ZXN0KHVzZXJBZ2VudCkpIHtcbiAgICAgIEJST1dTRVIgPSBuYW1lXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgWyBuYW1lLCByZWdleHAgXSBvZiBPU19SVUxFUykge1xuICAgIGlmIChyZWdleHAudGVzdCh1c2VyQWdlbnQpKSB7XG4gICAgICBPUyA9IG5hbWVcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgY29uc3QgdGVzdEVsID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHRlc3RFbC5jb250ZW50RWRpdGFibGUgPSB0cnVlXG5cbiAgZm9yIChjb25zdCBbIG5hbWUsIHRlc3RGbiBdIG9mIEVWRU5UX1JVTEVTKSB7XG4gICAgRVZFTlRTW25hbWVdID0gdGVzdEZuKHRlc3RFbClcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCBjb25zdCBJU19DSFJPTUUgPSBCUk9XU0VSID09PSAnY2hyb21lJ1xuZXhwb3J0IGNvbnN0IElTX0ZJUkVGT1ggPSBCUk9XU0VSID09PSAnZmlyZWZveCdcbmV4cG9ydCBjb25zdCBJU19TQUZBUkkgPSBCUk9XU0VSID09PSAnc2FmYXJpJ1xuZXhwb3J0IGNvbnN0IElTX0lFID0gQlJPV1NFUiA9PT0gJ2llJ1xuXG5leHBvcnQgY29uc3QgSVNfQU5EUk9JRCA9IE9TID09PSAnYW5kcm9pZCdcbmV4cG9ydCBjb25zdCBJU19JT1MgPSBPUyA9PT0gJ2lvcydcbmV4cG9ydCBjb25zdCBJU19NQUMgPSBPUyA9PT0gJ21hY29zJ1xuZXhwb3J0IGNvbnN0IElTX1dJTkRPV1MgPSBPUyA9PT0gJ3dpbmRvd3MnXG5cbmV4cG9ydCBjb25zdCBTVVBQT1JURURfRVZFTlRTID0gRVZFTlRTXG4iXX0=