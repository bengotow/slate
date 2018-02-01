"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Find the deepest descendant of a DOM `element`.
 *
 * @param {Element} node
 * @return {Element}
 */

function findDeepestNode(element) {
  return element.firstChild ? findDeepestNode(element.firstChild) : element;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findDeepestNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9maW5kLWRlZXBlc3Qtbm9kZS5qcyJdLCJuYW1lcyI6WyJmaW5kRGVlcGVzdE5vZGUiLCJlbGVtZW50IiwiZmlyc3RDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7Ozs7QUFPQSxTQUFTQSxlQUFULENBQXlCQyxPQUF6QixFQUFrQztBQUNoQyxTQUFPQSxRQUFRQyxVQUFSLEdBQ0hGLGdCQUFnQkMsUUFBUUMsVUFBeEIsQ0FERyxHQUVIRCxPQUZKO0FBR0Q7O0FBRUQ7Ozs7OztrQkFNZUQsZSIsImZpbGUiOiJmaW5kLWRlZXBlc3Qtbm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBGaW5kIHRoZSBkZWVwZXN0IGRlc2NlbmRhbnQgb2YgYSBET00gYGVsZW1lbnRgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZVxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuXG5mdW5jdGlvbiBmaW5kRGVlcGVzdE5vZGUoZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5maXJzdENoaWxkXG4gICAgPyBmaW5kRGVlcGVzdE5vZGUoZWxlbWVudC5maXJzdENoaWxkKVxuICAgIDogZWxlbWVudFxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZmluZERlZXBlc3ROb2RlXG4iXX0=