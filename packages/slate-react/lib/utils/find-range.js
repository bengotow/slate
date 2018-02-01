'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _selectionIsBackward = require('selection-is-backward');

var _selectionIsBackward2 = _interopRequireDefault(_selectionIsBackward);

var _slate = require('slate');

var _findPoint = require('./find-point');

var _findPoint2 = _interopRequireDefault(_findPoint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Find a Slate range from a DOM `native` selection.
 *
 * @param {Selection} native
 * @param {Value} value
 * @return {Range}
 */

function findRange(native, value) {
  var el = native.anchorNode || native.startContainer;
  if (!el) return null;

  var window = (0, _getWindow2.default)(el);

  // If the `native` object is a DOM `Range` or `StaticRange` object, change it
  // into something that looks like a DOM `Selection` instead.
  if (native instanceof window.Range || window.StaticRange && native instanceof window.StaticRange) {
    native = {
      anchorNode: native.startContainer,
      anchorOffset: native.startOffset,
      focusNode: native.endContainer,
      focusOffset: native.endOffset
    };
  }

  var _native = native,
      anchorNode = _native.anchorNode,
      anchorOffset = _native.anchorOffset,
      focusNode = _native.focusNode,
      focusOffset = _native.focusOffset,
      isCollapsed = _native.isCollapsed;

  var anchor = (0, _findPoint2.default)(anchorNode, anchorOffset, value);
  var focus = isCollapsed ? anchor : (0, _findPoint2.default)(focusNode, focusOffset, value);
  if (!anchor || !focus) return null;

  var range = _slate.Range.create({
    anchorKey: anchor.key,
    anchorOffset: anchor.offset,
    focusKey: focus.key,
    focusOffset: focus.offset,
    isBackward: isCollapsed ? false : (0, _selectionIsBackward2.default)(native),
    isFocused: true
  });

  return range;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findRange;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9maW5kLXJhbmdlLmpzIl0sIm5hbWVzIjpbImZpbmRSYW5nZSIsIm5hdGl2ZSIsInZhbHVlIiwiZWwiLCJhbmNob3JOb2RlIiwic3RhcnRDb250YWluZXIiLCJ3aW5kb3ciLCJSYW5nZSIsIlN0YXRpY1JhbmdlIiwiYW5jaG9yT2Zmc2V0Iiwic3RhcnRPZmZzZXQiLCJmb2N1c05vZGUiLCJlbmRDb250YWluZXIiLCJmb2N1c09mZnNldCIsImVuZE9mZnNldCIsImlzQ29sbGFwc2VkIiwiYW5jaG9yIiwiZm9jdXMiLCJyYW5nZSIsImNyZWF0ZSIsImFuY2hvcktleSIsImtleSIsIm9mZnNldCIsImZvY3VzS2V5IiwiaXNCYWNrd2FyZCIsImlzRm9jdXNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7Ozs7QUFFQTs7Ozs7Ozs7QUFRQSxTQUFTQSxTQUFULENBQW1CQyxNQUFuQixFQUEyQkMsS0FBM0IsRUFBa0M7QUFDaEMsTUFBTUMsS0FBS0YsT0FBT0csVUFBUCxJQUFxQkgsT0FBT0ksY0FBdkM7QUFDQSxNQUFJLENBQUNGLEVBQUwsRUFBUyxPQUFPLElBQVA7O0FBRVQsTUFBTUcsU0FBUyx5QkFBVUgsRUFBVixDQUFmOztBQUVBO0FBQ0E7QUFDQSxNQUFJRixrQkFBa0JLLE9BQU9DLEtBQXpCLElBQW1DRCxPQUFPRSxXQUFQLElBQXNCUCxrQkFBa0JLLE9BQU9FLFdBQXRGLEVBQW9HO0FBQ2xHUCxhQUFTO0FBQ1BHLGtCQUFZSCxPQUFPSSxjQURaO0FBRVBJLG9CQUFjUixPQUFPUyxXQUZkO0FBR1BDLGlCQUFXVixPQUFPVyxZQUhYO0FBSVBDLG1CQUFhWixPQUFPYTtBQUpiLEtBQVQ7QUFNRDs7QUFmK0IsZ0JBaUIwQ2IsTUFqQjFDO0FBQUEsTUFpQnhCRyxVQWpCd0IsV0FpQnhCQSxVQWpCd0I7QUFBQSxNQWlCWkssWUFqQlksV0FpQlpBLFlBakJZO0FBQUEsTUFpQkVFLFNBakJGLFdBaUJFQSxTQWpCRjtBQUFBLE1BaUJhRSxXQWpCYixXQWlCYUEsV0FqQmI7QUFBQSxNQWlCMEJFLFdBakIxQixXQWlCMEJBLFdBakIxQjs7QUFrQmhDLE1BQU1DLFNBQVMseUJBQVVaLFVBQVYsRUFBc0JLLFlBQXRCLEVBQW9DUCxLQUFwQyxDQUFmO0FBQ0EsTUFBTWUsUUFBUUYsY0FBY0MsTUFBZCxHQUF1Qix5QkFBVUwsU0FBVixFQUFxQkUsV0FBckIsRUFBa0NYLEtBQWxDLENBQXJDO0FBQ0EsTUFBSSxDQUFDYyxNQUFELElBQVcsQ0FBQ0MsS0FBaEIsRUFBdUIsT0FBTyxJQUFQOztBQUV2QixNQUFNQyxRQUFRLGFBQU1DLE1BQU4sQ0FBYTtBQUN6QkMsZUFBV0osT0FBT0ssR0FETztBQUV6Qlosa0JBQWNPLE9BQU9NLE1BRkk7QUFHekJDLGNBQVVOLE1BQU1JLEdBSFM7QUFJekJSLGlCQUFhSSxNQUFNSyxNQUpNO0FBS3pCRSxnQkFBWVQsY0FBYyxLQUFkLEdBQXNCLG1DQUFXZCxNQUFYLENBTFQ7QUFNekJ3QixlQUFXO0FBTmMsR0FBYixDQUFkOztBQVNBLFNBQU9QLEtBQVA7QUFDRDs7QUFFRDs7Ozs7O2tCQU1lbEIsUyIsImZpbGUiOiJmaW5kLXJhbmdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgZ2V0V2luZG93IGZyb20gJ2dldC13aW5kb3cnXG5pbXBvcnQgaXNCYWNrd2FyZCBmcm9tICdzZWxlY3Rpb24taXMtYmFja3dhcmQnXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ3NsYXRlJ1xuXG5pbXBvcnQgZmluZFBvaW50IGZyb20gJy4vZmluZC1wb2ludCdcblxuLyoqXG4gKiBGaW5kIGEgU2xhdGUgcmFuZ2UgZnJvbSBhIERPTSBgbmF0aXZlYCBzZWxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTZWxlY3Rpb259IG5hdGl2ZVxuICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAqIEByZXR1cm4ge1JhbmdlfVxuICovXG5cbmZ1bmN0aW9uIGZpbmRSYW5nZShuYXRpdmUsIHZhbHVlKSB7XG4gIGNvbnN0IGVsID0gbmF0aXZlLmFuY2hvck5vZGUgfHwgbmF0aXZlLnN0YXJ0Q29udGFpbmVyXG4gIGlmICghZWwpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KGVsKVxuXG4gIC8vIElmIHRoZSBgbmF0aXZlYCBvYmplY3QgaXMgYSBET00gYFJhbmdlYCBvciBgU3RhdGljUmFuZ2VgIG9iamVjdCwgY2hhbmdlIGl0XG4gIC8vIGludG8gc29tZXRoaW5nIHRoYXQgbG9va3MgbGlrZSBhIERPTSBgU2VsZWN0aW9uYCBpbnN0ZWFkLlxuICBpZiAobmF0aXZlIGluc3RhbmNlb2Ygd2luZG93LlJhbmdlIHx8ICh3aW5kb3cuU3RhdGljUmFuZ2UgJiYgbmF0aXZlIGluc3RhbmNlb2Ygd2luZG93LlN0YXRpY1JhbmdlKSkge1xuICAgIG5hdGl2ZSA9IHtcbiAgICAgIGFuY2hvck5vZGU6IG5hdGl2ZS5zdGFydENvbnRhaW5lcixcbiAgICAgIGFuY2hvck9mZnNldDogbmF0aXZlLnN0YXJ0T2Zmc2V0LFxuICAgICAgZm9jdXNOb2RlOiBuYXRpdmUuZW5kQ29udGFpbmVyLFxuICAgICAgZm9jdXNPZmZzZXQ6IG5hdGl2ZS5lbmRPZmZzZXQsXG4gICAgfVxuICB9XG5cbiAgY29uc3QgeyBhbmNob3JOb2RlLCBhbmNob3JPZmZzZXQsIGZvY3VzTm9kZSwgZm9jdXNPZmZzZXQsIGlzQ29sbGFwc2VkIH0gPSBuYXRpdmVcbiAgY29uc3QgYW5jaG9yID0gZmluZFBvaW50KGFuY2hvck5vZGUsIGFuY2hvck9mZnNldCwgdmFsdWUpXG4gIGNvbnN0IGZvY3VzID0gaXNDb2xsYXBzZWQgPyBhbmNob3IgOiBmaW5kUG9pbnQoZm9jdXNOb2RlLCBmb2N1c09mZnNldCwgdmFsdWUpXG4gIGlmICghYW5jaG9yIHx8ICFmb2N1cykgcmV0dXJuIG51bGxcblxuICBjb25zdCByYW5nZSA9IFJhbmdlLmNyZWF0ZSh7XG4gICAgYW5jaG9yS2V5OiBhbmNob3Iua2V5LFxuICAgIGFuY2hvck9mZnNldDogYW5jaG9yLm9mZnNldCxcbiAgICBmb2N1c0tleTogZm9jdXMua2V5LFxuICAgIGZvY3VzT2Zmc2V0OiBmb2N1cy5vZmZzZXQsXG4gICAgaXNCYWNrd2FyZDogaXNDb2xsYXBzZWQgPyBmYWxzZSA6IGlzQmFja3dhcmQobmF0aXZlKSxcbiAgICBpc0ZvY3VzZWQ6IHRydWUsXG4gIH0pXG5cbiAgcmV0dXJuIHJhbmdlXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmaW5kUmFuZ2VcbiJdfQ==