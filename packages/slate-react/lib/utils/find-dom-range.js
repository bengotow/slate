'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _findDomPoint = require('./find-dom-point');

var _findDomPoint2 = _interopRequireDefault(_findDomPoint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Find a native DOM range Slate `range`.
 *
 * @param {Range} range
 * @param {Window} win (optional)
 * @return {Object|Null}
 */

function findDOMRange(range) {
  var win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;
  var anchorKey = range.anchorKey,
      anchorOffset = range.anchorOffset,
      focusKey = range.focusKey,
      focusOffset = range.focusOffset,
      isBackward = range.isBackward,
      isCollapsed = range.isCollapsed;

  var anchor = (0, _findDomPoint2.default)(anchorKey, anchorOffset, win);
  var focus = isCollapsed ? anchor : (0, _findDomPoint2.default)(focusKey, focusOffset, win);
  if (!anchor || !focus) return null;

  var r = win.document.createRange();
  var start = isBackward ? focus : anchor;
  var end = isBackward ? anchor : focus;
  r.setStart(start.node, start.offset);
  r.setEnd(end.node, end.offset);
  return r;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findDOMRange;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9maW5kLWRvbS1yYW5nZS5qcyJdLCJuYW1lcyI6WyJmaW5kRE9NUmFuZ2UiLCJyYW5nZSIsIndpbiIsIndpbmRvdyIsImFuY2hvcktleSIsImFuY2hvck9mZnNldCIsImZvY3VzS2V5IiwiZm9jdXNPZmZzZXQiLCJpc0JhY2t3YXJkIiwiaXNDb2xsYXBzZWQiLCJhbmNob3IiLCJmb2N1cyIsInIiLCJkb2N1bWVudCIsImNyZWF0ZVJhbmdlIiwic3RhcnQiLCJlbmQiLCJzZXRTdGFydCIsIm5vZGUiLCJvZmZzZXQiLCJzZXRFbmQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOzs7Ozs7QUFFQTs7Ozs7Ozs7QUFRQSxTQUFTQSxZQUFULENBQXNCQyxLQUF0QixFQUEyQztBQUFBLE1BQWRDLEdBQWMsdUVBQVJDLE1BQVE7QUFBQSxNQUNqQ0MsU0FEaUMsR0FDMkNILEtBRDNDLENBQ2pDRyxTQURpQztBQUFBLE1BQ3RCQyxZQURzQixHQUMyQ0osS0FEM0MsQ0FDdEJJLFlBRHNCO0FBQUEsTUFDUkMsUUFEUSxHQUMyQ0wsS0FEM0MsQ0FDUkssUUFEUTtBQUFBLE1BQ0VDLFdBREYsR0FDMkNOLEtBRDNDLENBQ0VNLFdBREY7QUFBQSxNQUNlQyxVQURmLEdBQzJDUCxLQUQzQyxDQUNlTyxVQURmO0FBQUEsTUFDMkJDLFdBRDNCLEdBQzJDUixLQUQzQyxDQUMyQlEsV0FEM0I7O0FBRXpDLE1BQU1DLFNBQVMsNEJBQWFOLFNBQWIsRUFBd0JDLFlBQXhCLEVBQXNDSCxHQUF0QyxDQUFmO0FBQ0EsTUFBTVMsUUFBUUYsY0FBY0MsTUFBZCxHQUF1Qiw0QkFBYUosUUFBYixFQUF1QkMsV0FBdkIsRUFBb0NMLEdBQXBDLENBQXJDO0FBQ0EsTUFBSSxDQUFDUSxNQUFELElBQVcsQ0FBQ0MsS0FBaEIsRUFBdUIsT0FBTyxJQUFQOztBQUV2QixNQUFNQyxJQUFJVixJQUFJVyxRQUFKLENBQWFDLFdBQWIsRUFBVjtBQUNBLE1BQU1DLFFBQVFQLGFBQWFHLEtBQWIsR0FBcUJELE1BQW5DO0FBQ0EsTUFBTU0sTUFBTVIsYUFBYUUsTUFBYixHQUFzQkMsS0FBbEM7QUFDQUMsSUFBRUssUUFBRixDQUFXRixNQUFNRyxJQUFqQixFQUF1QkgsTUFBTUksTUFBN0I7QUFDQVAsSUFBRVEsTUFBRixDQUFTSixJQUFJRSxJQUFiLEVBQW1CRixJQUFJRyxNQUF2QjtBQUNBLFNBQU9QLENBQVA7QUFDRDs7QUFFRDs7Ozs7O2tCQU1lWixZIiwiZmlsZSI6ImZpbmQtZG9tLXJhbmdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgZmluZERPTVBvaW50IGZyb20gJy4vZmluZC1kb20tcG9pbnQnXG5cbi8qKlxuICogRmluZCBhIG5hdGl2ZSBET00gcmFuZ2UgU2xhdGUgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtXaW5kb3d9IHdpbiAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtPYmplY3R8TnVsbH1cbiAqL1xuXG5mdW5jdGlvbiBmaW5kRE9NUmFuZ2UocmFuZ2UsIHdpbiA9IHdpbmRvdykge1xuICBjb25zdCB7IGFuY2hvcktleSwgYW5jaG9yT2Zmc2V0LCBmb2N1c0tleSwgZm9jdXNPZmZzZXQsIGlzQmFja3dhcmQsIGlzQ29sbGFwc2VkIH0gPSByYW5nZVxuICBjb25zdCBhbmNob3IgPSBmaW5kRE9NUG9pbnQoYW5jaG9yS2V5LCBhbmNob3JPZmZzZXQsIHdpbilcbiAgY29uc3QgZm9jdXMgPSBpc0NvbGxhcHNlZCA/IGFuY2hvciA6IGZpbmRET01Qb2ludChmb2N1c0tleSwgZm9jdXNPZmZzZXQsIHdpbilcbiAgaWYgKCFhbmNob3IgfHwgIWZvY3VzKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHIgPSB3aW4uZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKVxuICBjb25zdCBzdGFydCA9IGlzQmFja3dhcmQgPyBmb2N1cyA6IGFuY2hvclxuICBjb25zdCBlbmQgPSBpc0JhY2t3YXJkID8gYW5jaG9yIDogZm9jdXNcbiAgci5zZXRTdGFydChzdGFydC5ub2RlLCBzdGFydC5vZmZzZXQpXG4gIHIuc2V0RW5kKGVuZC5ub2RlLCBlbmQub2Zmc2V0KVxuICByZXR1cm4gclxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZmluZERPTVJhbmdlXG4iXX0=