'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slate = require('slate');

/**
 * Find the DOM node for a `key`.
 *
 * @param {String|Node} key
 * @param {Window} win (optional)
 * @return {Element}
 */

function findDOMNode(key) {
  var win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;

  if (_slate.Node.isNode(key)) {
    key = key.key;
  }

  var el = win.document.querySelector('[data-key="' + key + '"]');

  if (!el) {
    throw new Error('Unable to find a DOM node for "' + key + '". This is often because of forgetting to add `props.attributes` to a custom component.');
  }

  return el;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findDOMNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9maW5kLWRvbS1ub2RlLmpzIl0sIm5hbWVzIjpbImZpbmRET01Ob2RlIiwia2V5Iiwid2luIiwid2luZG93IiwiaXNOb2RlIiwiZWwiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJFcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBRUE7Ozs7Ozs7O0FBUUEsU0FBU0EsV0FBVCxDQUFxQkMsR0FBckIsRUFBd0M7QUFBQSxNQUFkQyxHQUFjLHVFQUFSQyxNQUFROztBQUN0QyxNQUFJLFlBQUtDLE1BQUwsQ0FBWUgsR0FBWixDQUFKLEVBQXNCO0FBQ3BCQSxVQUFNQSxJQUFJQSxHQUFWO0FBQ0Q7O0FBRUQsTUFBTUksS0FBS0gsSUFBSUksUUFBSixDQUFhQyxhQUFiLGlCQUF5Q04sR0FBekMsUUFBWDs7QUFFQSxNQUFJLENBQUNJLEVBQUwsRUFBUztBQUNQLFVBQU0sSUFBSUcsS0FBSixxQ0FBNENQLEdBQTVDLDZGQUFOO0FBQ0Q7O0FBRUQsU0FBT0ksRUFBUDtBQUNEOztBQUVEOzs7Ozs7a0JBTWVMLFciLCJmaWxlIjoiZmluZC1kb20tbm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJ3NsYXRlJ1xuXG4vKipcbiAqIEZpbmQgdGhlIERPTSBub2RlIGZvciBhIGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IGtleVxuICogQHBhcmFtIHtXaW5kb3d9IHdpbiAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxuICovXG5cbmZ1bmN0aW9uIGZpbmRET01Ob2RlKGtleSwgd2luID0gd2luZG93KSB7XG4gIGlmIChOb2RlLmlzTm9kZShrZXkpKSB7XG4gICAga2V5ID0ga2V5LmtleVxuICB9XG5cbiAgY29uc3QgZWwgPSB3aW4uZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEta2V5PVwiJHtrZXl9XCJdYClcblxuICBpZiAoIWVsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBhIERPTSBub2RlIGZvciBcIiR7a2V5fVwiLiBUaGlzIGlzIG9mdGVuIGJlY2F1c2Ugb2YgZm9yZ2V0dGluZyB0byBhZGQgXFxgcHJvcHMuYXR0cmlidXRlc1xcYCB0byBhIGN1c3RvbSBjb21wb25lbnQuYClcbiAgfVxuXG4gIHJldHVybiBlbFxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZmluZERPTU5vZGVcbiJdfQ==