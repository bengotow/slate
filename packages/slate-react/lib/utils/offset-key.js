"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Offset key parser regex.
 *
 * @type {RegExp}
 */

var PARSER = /^(\w+)(?::(\d+))?$/;

/**
 * Parse an offset key `string`.
 *
 * @param {String} string
 * @return {Object}
 */

function parse(string) {
  var matches = PARSER.exec(string);

  if (!matches) {
    throw new Error("Invalid offset key string \"" + string + "\".");
  }

  var _matches = _slicedToArray(matches, 3),
      original = _matches[0],
      key = _matches[1],
      index = _matches[2]; // eslint-disable-line no-unused-vars


  return {
    key: key,
    index: parseInt(index, 10)
  };
}

/**
 * Stringify an offset key `object`.
 *
 * @param {Object} object
 *   @property {String} key
 *   @property {Number} index
 * @return {String}
 */

function stringify(object) {
  return object.key + ":" + object.index;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  parse: parse,
  stringify: stringify
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9vZmZzZXQta2V5LmpzIl0sIm5hbWVzIjpbIlBBUlNFUiIsInBhcnNlIiwic3RyaW5nIiwibWF0Y2hlcyIsImV4ZWMiLCJFcnJvciIsIm9yaWdpbmFsIiwia2V5IiwiaW5kZXgiLCJwYXJzZUludCIsInN0cmluZ2lmeSIsIm9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7Ozs7O0FBTUEsSUFBTUEsU0FBUyxvQkFBZjs7QUFFQTs7Ozs7OztBQU9BLFNBQVNDLEtBQVQsQ0FBZUMsTUFBZixFQUF1QjtBQUNyQixNQUFNQyxVQUFVSCxPQUFPSSxJQUFQLENBQVlGLE1BQVosQ0FBaEI7O0FBRUEsTUFBSSxDQUFDQyxPQUFMLEVBQWM7QUFDWixVQUFNLElBQUlFLEtBQUosa0NBQXdDSCxNQUF4QyxTQUFOO0FBQ0Q7O0FBTG9CLGdDQU9ZQyxPQVBaO0FBQUEsTUFPYkcsUUFQYTtBQUFBLE1BT0hDLEdBUEc7QUFBQSxNQU9FQyxLQVBGLGdCQU9vQjs7O0FBQ3pDLFNBQU87QUFDTEQsWUFESztBQUVMQyxXQUFPQyxTQUFTRCxLQUFULEVBQWdCLEVBQWhCO0FBRkYsR0FBUDtBQUlEOztBQUVEOzs7Ozs7Ozs7QUFTQSxTQUFTRSxTQUFULENBQW1CQyxNQUFuQixFQUEyQjtBQUN6QixTQUFVQSxPQUFPSixHQUFqQixTQUF3QkksT0FBT0gsS0FBL0I7QUFDRDs7QUFFRDs7Ozs7O2tCQU1lO0FBQ2JQLGNBRGE7QUFFYlM7QUFGYSxDIiwiZmlsZSI6Im9mZnNldC1rZXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogT2Zmc2V0IGtleSBwYXJzZXIgcmVnZXguXG4gKlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xuXG5jb25zdCBQQVJTRVIgPSAvXihcXHcrKSg/OjooXFxkKykpPyQvXG5cbi8qKlxuICogUGFyc2UgYW4gb2Zmc2V0IGtleSBgc3RyaW5nYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyaW5nKSB7XG4gIGNvbnN0IG1hdGNoZXMgPSBQQVJTRVIuZXhlYyhzdHJpbmcpXG5cbiAgaWYgKCFtYXRjaGVzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG9mZnNldCBrZXkgc3RyaW5nIFwiJHtzdHJpbmd9XCIuYClcbiAgfVxuXG4gIGNvbnN0IFsgb3JpZ2luYWwsIGtleSwgaW5kZXggXSA9IG1hdGNoZXMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4ge1xuICAgIGtleSxcbiAgICBpbmRleDogcGFyc2VJbnQoaW5kZXgsIDEwKVxuICB9XG59XG5cbi8qKlxuICogU3RyaW5naWZ5IGFuIG9mZnNldCBrZXkgYG9iamVjdGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogICBAcHJvcGVydHkge1N0cmluZ30ga2V5XG4gKiAgIEBwcm9wZXJ0eSB7TnVtYmVyfSBpbmRleFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShvYmplY3QpIHtcbiAgcmV0dXJuIGAke29iamVjdC5rZXl9OiR7b2JqZWN0LmluZGV4fWBcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHBhcnNlLFxuICBzdHJpbmdpZnlcbn1cbiJdfQ==