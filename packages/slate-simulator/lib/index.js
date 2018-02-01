'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slate = require('slate');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Event handlers that can be simulated.
 *
 * @type {Array}
 */

var EVENT_HANDLERS = ['onBeforeInput', 'onBlur', 'onCopy', 'onCut', 'onDrop', 'onFocus', 'onKeyDown', 'onPaste', 'onSelect'];

/**
 * Simulator.
 *
 * @type {Simulator}
 */

var Simulator =

/**
 * Create a new `Simulator` with `plugins` and an initial `value`.
 *
 * @param {Object} attrs
 */

function Simulator(props) {
  _classCallCheck(this, Simulator);

  var plugins = props.plugins,
      value = props.value;

  var stack = new _slate.Stack({ plugins: plugins });
  this.props = props;
  this.stack = stack;
  this.value = value;
};

/**
 * Generate the event simulators.
 */

EVENT_HANDLERS.forEach(function (handler) {
  var method = getMethodName(handler);

  Simulator.prototype[method] = function (e) {
    if (e == null) e = {};

    var stack = this.stack,
        value = this.value;

    var editor = createEditor(this);
    var event = createEvent(e);
    var change = value.change();

    stack.run(handler, event, change, editor);
    stack.run('onChange', change, editor);

    this.value = change.value;
    return this;
  };
});

/**
 * Get the method name from a `handler` name.
 *
 * @param {String} handler
 * @return {String}
 */

function getMethodName(handler) {
  return handler.charAt(2).toLowerCase() + handler.slice(3);
}

/**
 * Create a fake editor from a `stack` and `value`.
 *
 * @param {Stack} stack
 * @param {Value} value
 */

function createEditor(_ref) {
  var stack = _ref.stack,
      value = _ref.value,
      props = _ref.props;

  var editor = {
    getSchema: function getSchema() {
      return stack.schema;
    },
    getState: function getState() {
      return value;
    },
    props: _extends({
      autoCorrect: true,
      autoFocus: false,
      onChange: function onChange() {},
      readOnly: false,
      spellCheck: true
    }, props)
  };

  return editor;
}

/**
 * Create a fake event with `attributes`.
 *
 * @param {Object} attributes
 * @return {Object}
 */

function createEvent(attributes) {
  var event = _extends({
    preventDefault: function preventDefault() {
      return event.isDefaultPrevented = true;
    },
    stopPropagation: function stopPropagation() {
      return event.isPropagationStopped = true;
    },
    isDefaultPrevented: false,
    isPropagationStopped: false
  }, attributes);

  return event;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Simulator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJFVkVOVF9IQU5ETEVSUyIsIlNpbXVsYXRvciIsInByb3BzIiwicGx1Z2lucyIsInZhbHVlIiwic3RhY2siLCJmb3JFYWNoIiwiaGFuZGxlciIsIm1ldGhvZCIsImdldE1ldGhvZE5hbWUiLCJwcm90b3R5cGUiLCJlIiwiZWRpdG9yIiwiY3JlYXRlRWRpdG9yIiwiZXZlbnQiLCJjcmVhdGVFdmVudCIsImNoYW5nZSIsInJ1biIsImNoYXJBdCIsInRvTG93ZXJDYXNlIiwic2xpY2UiLCJnZXRTY2hlbWEiLCJzY2hlbWEiLCJnZXRTdGF0ZSIsImF1dG9Db3JyZWN0IiwiYXV0b0ZvY3VzIiwib25DaGFuZ2UiLCJyZWFkT25seSIsInNwZWxsQ2hlY2siLCJhdHRyaWJ1dGVzIiwicHJldmVudERlZmF1bHQiLCJpc0RlZmF1bHRQcmV2ZW50ZWQiLCJzdG9wUHJvcGFnYXRpb24iLCJpc1Byb3BhZ2F0aW9uU3RvcHBlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxpQkFBaUIsQ0FDckIsZUFEcUIsRUFFckIsUUFGcUIsRUFHckIsUUFIcUIsRUFJckIsT0FKcUIsRUFLckIsUUFMcUIsRUFNckIsU0FOcUIsRUFPckIsV0FQcUIsRUFRckIsU0FScUIsRUFTckIsVUFUcUIsQ0FBdkI7O0FBWUE7Ozs7OztJQU1NQyxTOztBQUVKOzs7Ozs7QUFNQSxtQkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLE1BQ1RDLE9BRFMsR0FDVUQsS0FEVixDQUNUQyxPQURTO0FBQUEsTUFDQUMsS0FEQSxHQUNVRixLQURWLENBQ0FFLEtBREE7O0FBRWpCLE1BQU1DLFFBQVEsaUJBQVUsRUFBRUYsZ0JBQUYsRUFBVixDQUFkO0FBQ0EsT0FBS0QsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsT0FBS0csS0FBTCxHQUFhQSxLQUFiO0FBQ0EsT0FBS0QsS0FBTCxHQUFhQSxLQUFiO0FBQ0QsQzs7QUFJSDs7OztBQUlBSixlQUFlTSxPQUFmLENBQXVCLFVBQUNDLE9BQUQsRUFBYTtBQUNsQyxNQUFNQyxTQUFTQyxjQUFjRixPQUFkLENBQWY7O0FBRUFOLFlBQVVTLFNBQVYsQ0FBb0JGLE1BQXBCLElBQThCLFVBQVVHLENBQVYsRUFBYTtBQUN6QyxRQUFJQSxLQUFLLElBQVQsRUFBZUEsSUFBSSxFQUFKOztBQUQwQixRQUdqQ04sS0FIaUMsR0FHaEIsSUFIZ0IsQ0FHakNBLEtBSGlDO0FBQUEsUUFHMUJELEtBSDBCLEdBR2hCLElBSGdCLENBRzFCQSxLQUgwQjs7QUFJekMsUUFBTVEsU0FBU0MsYUFBYSxJQUFiLENBQWY7QUFDQSxRQUFNQyxRQUFRQyxZQUFZSixDQUFaLENBQWQ7QUFDQSxRQUFNSyxTQUFTWixNQUFNWSxNQUFOLEVBQWY7O0FBRUFYLFVBQU1ZLEdBQU4sQ0FBVVYsT0FBVixFQUFtQk8sS0FBbkIsRUFBMEJFLE1BQTFCLEVBQWtDSixNQUFsQztBQUNBUCxVQUFNWSxHQUFOLENBQVUsVUFBVixFQUFzQkQsTUFBdEIsRUFBOEJKLE1BQTlCOztBQUVBLFNBQUtSLEtBQUwsR0FBYVksT0FBT1osS0FBcEI7QUFDQSxXQUFPLElBQVA7QUFDRCxHQWJEO0FBY0QsQ0FqQkQ7O0FBbUJBOzs7Ozs7O0FBT0EsU0FBU0ssYUFBVCxDQUF1QkYsT0FBdkIsRUFBZ0M7QUFDOUIsU0FBT0EsUUFBUVcsTUFBUixDQUFlLENBQWYsRUFBa0JDLFdBQWxCLEtBQWtDWixRQUFRYSxLQUFSLENBQWMsQ0FBZCxDQUF6QztBQUNEOztBQUVEOzs7Ozs7O0FBT0EsU0FBU1AsWUFBVCxPQUErQztBQUFBLE1BQXZCUixLQUF1QixRQUF2QkEsS0FBdUI7QUFBQSxNQUFoQkQsS0FBZ0IsUUFBaEJBLEtBQWdCO0FBQUEsTUFBVEYsS0FBUyxRQUFUQSxLQUFTOztBQUM3QyxNQUFNVSxTQUFTO0FBQ2JTLGVBQVc7QUFBQSxhQUFNaEIsTUFBTWlCLE1BQVo7QUFBQSxLQURFO0FBRWJDLGNBQVU7QUFBQSxhQUFNbkIsS0FBTjtBQUFBLEtBRkc7QUFHYkY7QUFDRXNCLG1CQUFhLElBRGY7QUFFRUMsaUJBQVcsS0FGYjtBQUdFQyxnQkFBVSxvQkFBTSxDQUFFLENBSHBCO0FBSUVDLGdCQUFVLEtBSlo7QUFLRUMsa0JBQVk7QUFMZCxPQU1LMUIsS0FOTDtBQUhhLEdBQWY7O0FBY0EsU0FBT1UsTUFBUDtBQUNEOztBQUVEOzs7Ozs7O0FBT0EsU0FBU0csV0FBVCxDQUFxQmMsVUFBckIsRUFBaUM7QUFDL0IsTUFBTWY7QUFDSmdCLG9CQUFnQjtBQUFBLGFBQU1oQixNQUFNaUIsa0JBQU4sR0FBMkIsSUFBakM7QUFBQSxLQURaO0FBRUpDLHFCQUFpQjtBQUFBLGFBQU1sQixNQUFNbUIsb0JBQU4sR0FBNkIsSUFBbkM7QUFBQSxLQUZiO0FBR0pGLHdCQUFvQixLQUhoQjtBQUlKRSwwQkFBc0I7QUFKbEIsS0FLREosVUFMQyxDQUFOOztBQVFBLFNBQU9mLEtBQVA7QUFDRDs7QUFFRDs7Ozs7O2tCQU1lYixTIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBTdGFjayB9IGZyb20gJ3NsYXRlJ1xuXG4vKipcbiAqIEV2ZW50IGhhbmRsZXJzIHRoYXQgY2FuIGJlIHNpbXVsYXRlZC5cbiAqXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cblxuY29uc3QgRVZFTlRfSEFORExFUlMgPSBbXG4gICdvbkJlZm9yZUlucHV0JyxcbiAgJ29uQmx1cicsXG4gICdvbkNvcHknLFxuICAnb25DdXQnLFxuICAnb25Ecm9wJyxcbiAgJ29uRm9jdXMnLFxuICAnb25LZXlEb3duJyxcbiAgJ29uUGFzdGUnLFxuICAnb25TZWxlY3QnLFxuXVxuXG4vKipcbiAqIFNpbXVsYXRvci5cbiAqXG4gKiBAdHlwZSB7U2ltdWxhdG9yfVxuICovXG5cbmNsYXNzIFNpbXVsYXRvciB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgU2ltdWxhdG9yYCB3aXRoIGBwbHVnaW5zYCBhbmQgYW4gaW5pdGlhbCBgdmFsdWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICovXG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBjb25zdCB7IHBsdWdpbnMsIHZhbHVlIH0gPSBwcm9wc1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKHsgcGx1Z2lucyB9KVxuICAgIHRoaXMucHJvcHMgPSBwcm9wc1xuICAgIHRoaXMuc3RhY2sgPSBzdGFja1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG5cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgZXZlbnQgc2ltdWxhdG9ycy5cbiAqL1xuXG5FVkVOVF9IQU5ETEVSUy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gIGNvbnN0IG1ldGhvZCA9IGdldE1ldGhvZE5hbWUoaGFuZGxlcilcblxuICBTaW11bGF0b3IucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlID09IG51bGwpIGUgPSB7fVxuXG4gICAgY29uc3QgeyBzdGFjaywgdmFsdWUgfSA9IHRoaXNcbiAgICBjb25zdCBlZGl0b3IgPSBjcmVhdGVFZGl0b3IodGhpcylcbiAgICBjb25zdCBldmVudCA9IGNyZWF0ZUV2ZW50KGUpXG4gICAgY29uc3QgY2hhbmdlID0gdmFsdWUuY2hhbmdlKClcblxuICAgIHN0YWNrLnJ1bihoYW5kbGVyLCBldmVudCwgY2hhbmdlLCBlZGl0b3IpXG4gICAgc3RhY2sucnVuKCdvbkNoYW5nZScsIGNoYW5nZSwgZWRpdG9yKVxuXG4gICAgdGhpcy52YWx1ZSA9IGNoYW5nZS52YWx1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0pXG5cbi8qKlxuICogR2V0IHRoZSBtZXRob2QgbmFtZSBmcm9tIGEgYGhhbmRsZXJgIG5hbWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhhbmRsZXJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBnZXRNZXRob2ROYW1lKGhhbmRsZXIpIHtcbiAgcmV0dXJuIGhhbmRsZXIuY2hhckF0KDIpLnRvTG93ZXJDYXNlKCkgKyBoYW5kbGVyLnNsaWNlKDMpXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBlZGl0b3IgZnJvbSBhIGBzdGFja2AgYW5kIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtTdGFja30gc3RhY2tcbiAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRWRpdG9yKHsgc3RhY2ssIHZhbHVlLCBwcm9wcyB9KSB7XG4gIGNvbnN0IGVkaXRvciA9IHtcbiAgICBnZXRTY2hlbWE6ICgpID0+IHN0YWNrLnNjaGVtYSxcbiAgICBnZXRTdGF0ZTogKCkgPT4gdmFsdWUsXG4gICAgcHJvcHM6IHtcbiAgICAgIGF1dG9Db3JyZWN0OiB0cnVlLFxuICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcbiAgICAgIG9uQ2hhbmdlOiAoKSA9PiB7fSxcbiAgICAgIHJlYWRPbmx5OiBmYWxzZSxcbiAgICAgIHNwZWxsQ2hlY2s6IHRydWUsXG4gICAgICAuLi5wcm9wcyxcblxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gZWRpdG9yXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBldmVudCB3aXRoIGBhdHRyaWJ1dGVzYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGF0dHJpYnV0ZXMpIHtcbiAgY29uc3QgZXZlbnQgPSB7XG4gICAgcHJldmVudERlZmF1bHQ6ICgpID0+IGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCA9IHRydWUsXG4gICAgc3RvcFByb3BhZ2F0aW9uOiAoKSA9PiBldmVudC5pc1Byb3BhZ2F0aW9uU3RvcHBlZCA9IHRydWUsXG4gICAgaXNEZWZhdWx0UHJldmVudGVkOiBmYWxzZSxcbiAgICBpc1Byb3BhZ2F0aW9uU3RvcHBlZDogZmFsc2UsXG4gICAgLi4uYXR0cmlidXRlcyxcbiAgfVxuXG4gIHJldHVybiBldmVudFxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IFNpbXVsYXRvclxuIl19