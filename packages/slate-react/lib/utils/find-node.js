'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Find a Slate node from a DOM `element`.
 *
 * @param {Element} element
 * @param {Value} value
 * @return {Node|Null}
 */

function findNode(element, value) {
  var closest = element.closest('[data-key]');
  if (!closest) return null;

  var key = closest.getAttribute('data-key');
  if (!key) return null;

  var node = value.document.getNode(key);
  return node || null;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9maW5kLW5vZGUuanMiXSwibmFtZXMiOlsiZmluZE5vZGUiLCJlbGVtZW50IiwidmFsdWUiLCJjbG9zZXN0Iiwia2V5IiwiZ2V0QXR0cmlidXRlIiwibm9kZSIsImRvY3VtZW50IiwiZ2V0Tm9kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7Ozs7O0FBUUEsU0FBU0EsUUFBVCxDQUFrQkMsT0FBbEIsRUFBMkJDLEtBQTNCLEVBQWtDO0FBQ2hDLE1BQU1DLFVBQVVGLFFBQVFFLE9BQVIsQ0FBZ0IsWUFBaEIsQ0FBaEI7QUFDQSxNQUFJLENBQUNBLE9BQUwsRUFBYyxPQUFPLElBQVA7O0FBRWQsTUFBTUMsTUFBTUQsUUFBUUUsWUFBUixDQUFxQixVQUFyQixDQUFaO0FBQ0EsTUFBSSxDQUFDRCxHQUFMLEVBQVUsT0FBTyxJQUFQOztBQUVWLE1BQU1FLE9BQU9KLE1BQU1LLFFBQU4sQ0FBZUMsT0FBZixDQUF1QkosR0FBdkIsQ0FBYjtBQUNBLFNBQU9FLFFBQVEsSUFBZjtBQUNEOztBQUVEOzs7Ozs7a0JBTWVOLFEiLCJmaWxlIjoiZmluZC1ub2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEZpbmQgYSBTbGF0ZSBub2RlIGZyb20gYSBET00gYGVsZW1lbnRgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAqL1xuXG5mdW5jdGlvbiBmaW5kTm9kZShlbGVtZW50LCB2YWx1ZSkge1xuICBjb25zdCBjbG9zZXN0ID0gZWxlbWVudC5jbG9zZXN0KCdbZGF0YS1rZXldJylcbiAgaWYgKCFjbG9zZXN0KSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGtleSA9IGNsb3Nlc3QuZ2V0QXR0cmlidXRlKCdkYXRhLWtleScpXG4gIGlmICgha2V5KSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IG5vZGUgPSB2YWx1ZS5kb2N1bWVudC5nZXROb2RlKGtleSlcbiAgcmV0dXJuIG5vZGUgfHwgbnVsbFxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZmluZE5vZGVcbiJdfQ==