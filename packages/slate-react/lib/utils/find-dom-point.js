'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _findDomNode = require('./find-dom-node');

var _findDomNode2 = _interopRequireDefault(_findDomNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Find a native DOM selection point from a Slate `key` and `offset`.
 *
 * @param {String} key
 * @param {Number} offset
 * @param {Window} win (optional)
 * @return {Object|Null}
 */

function findDOMPoint(key, offset) {
  var win = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

  var el = (0, _findDomNode2.default)(key, win);
  var start = 0;
  var n = void 0;

  // COMPAT: In IE, this method's arguments are not optional, so we have to
  // pass in all four even though the last two are defaults. (2017/10/25)
  var iterator = win.document.createNodeIterator(el, NodeFilter.SHOW_TEXT, function () {
    return NodeFilter.FILTER_ACCEPT;
  }, false);

  while (n = iterator.nextNode()) {
    var length = n.textContent.length;

    var end = start + length;

    if (offset <= end) {
      var o = offset - start;
      return { node: n, offset: o };
    }

    start = end;
  }

  return null;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findDOMPoint;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9maW5kLWRvbS1wb2ludC5qcyJdLCJuYW1lcyI6WyJmaW5kRE9NUG9pbnQiLCJrZXkiLCJvZmZzZXQiLCJ3aW4iLCJ3aW5kb3ciLCJlbCIsInN0YXJ0IiwibiIsIml0ZXJhdG9yIiwiZG9jdW1lbnQiLCJjcmVhdGVOb2RlSXRlcmF0b3IiLCJOb2RlRmlsdGVyIiwiU0hPV19URVhUIiwiRklMVEVSX0FDQ0VQVCIsIm5leHROb2RlIiwibGVuZ3RoIiwidGV4dENvbnRlbnQiLCJlbmQiLCJvIiwibm9kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7Ozs7QUFTQSxTQUFTQSxZQUFULENBQXNCQyxHQUF0QixFQUEyQkMsTUFBM0IsRUFBaUQ7QUFBQSxNQUFkQyxHQUFjLHVFQUFSQyxNQUFROztBQUMvQyxNQUFNQyxLQUFLLDJCQUFZSixHQUFaLEVBQWlCRSxHQUFqQixDQUFYO0FBQ0EsTUFBSUcsUUFBUSxDQUFaO0FBQ0EsTUFBSUMsVUFBSjs7QUFFQTtBQUNBO0FBQ0EsTUFBTUMsV0FBV0wsSUFBSU0sUUFBSixDQUFhQyxrQkFBYixDQUNmTCxFQURlLEVBRWZNLFdBQVdDLFNBRkksRUFHZjtBQUFBLFdBQU1ELFdBQVdFLGFBQWpCO0FBQUEsR0FIZSxFQUlmLEtBSmUsQ0FBakI7O0FBT0EsU0FBT04sSUFBSUMsU0FBU00sUUFBVCxFQUFYLEVBQWdDO0FBQUEsUUFDdEJDLE1BRHNCLEdBQ1hSLEVBQUVTLFdBRFMsQ0FDdEJELE1BRHNCOztBQUU5QixRQUFNRSxNQUFNWCxRQUFRUyxNQUFwQjs7QUFFQSxRQUFJYixVQUFVZSxHQUFkLEVBQW1CO0FBQ2pCLFVBQU1DLElBQUloQixTQUFTSSxLQUFuQjtBQUNBLGFBQU8sRUFBRWEsTUFBTVosQ0FBUixFQUFXTCxRQUFRZ0IsQ0FBbkIsRUFBUDtBQUNEOztBQUVEWixZQUFRVyxHQUFSO0FBQ0Q7O0FBRUQsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztrQkFNZWpCLFkiLCJmaWxlIjoiZmluZC1kb20tcG9pbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBmaW5kRE9NTm9kZSBmcm9tICcuL2ZpbmQtZG9tLW5vZGUnXG5cbi8qKlxuICogRmluZCBhIG5hdGl2ZSBET00gc2VsZWN0aW9uIHBvaW50IGZyb20gYSBTbGF0ZSBga2V5YCBhbmQgYG9mZnNldGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFxuICogQHBhcmFtIHtXaW5kb3d9IHdpbiAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtPYmplY3R8TnVsbH1cbiAqL1xuXG5mdW5jdGlvbiBmaW5kRE9NUG9pbnQoa2V5LCBvZmZzZXQsIHdpbiA9IHdpbmRvdykge1xuICBjb25zdCBlbCA9IGZpbmRET01Ob2RlKGtleSwgd2luKVxuICBsZXQgc3RhcnQgPSAwXG4gIGxldCBuXG5cbiAgLy8gQ09NUEFUOiBJbiBJRSwgdGhpcyBtZXRob2QncyBhcmd1bWVudHMgYXJlIG5vdCBvcHRpb25hbCwgc28gd2UgaGF2ZSB0b1xuICAvLyBwYXNzIGluIGFsbCBmb3VyIGV2ZW4gdGhvdWdoIHRoZSBsYXN0IHR3byBhcmUgZGVmYXVsdHMuICgyMDE3LzEwLzI1KVxuICBjb25zdCBpdGVyYXRvciA9IHdpbi5kb2N1bWVudC5jcmVhdGVOb2RlSXRlcmF0b3IoXG4gICAgZWwsXG4gICAgTm9kZUZpbHRlci5TSE9XX1RFWFQsXG4gICAgKCkgPT4gTm9kZUZpbHRlci5GSUxURVJfQUNDRVBULFxuICAgIGZhbHNlXG4gIClcblxuICB3aGlsZSAobiA9IGl0ZXJhdG9yLm5leHROb2RlKCkpIHtcbiAgICBjb25zdCB7IGxlbmd0aCB9ID0gbi50ZXh0Q29udGVudFxuICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgbGVuZ3RoXG5cbiAgICBpZiAob2Zmc2V0IDw9IGVuZCkge1xuICAgICAgY29uc3QgbyA9IG9mZnNldCAtIHN0YXJ0XG4gICAgICByZXR1cm4geyBub2RlOiBuLCBvZmZzZXQ6IG8gfVxuICAgIH1cblxuICAgIHN0YXJ0ID0gZW5kXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZmluZERPTVBvaW50XG4iXX0=