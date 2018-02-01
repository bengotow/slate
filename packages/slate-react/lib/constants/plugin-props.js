'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventHandlers = require('./event-handlers');

var _eventHandlers2 = _interopRequireDefault(_eventHandlers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Props that can be defined by plugins.
 *
 * @type {Array}
 */

var PLUGIN_PROPS = [].concat(_toConsumableArray(_eventHandlers2.default), ['decorateNode', 'onChange', 'renderMark', 'renderNode', 'renderPlaceholder', 'renderPortal', 'schema', 'validateNode']);

/**
 * Export.
 *
 * @type {Array}
 */

exports.default = PLUGIN_PROPS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvcGx1Z2luLXByb3BzLmpzIl0sIm5hbWVzIjpbIlBMVUdJTl9QUk9QUyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLHVFQUVKLGNBRkksRUFHSixVQUhJLEVBSUosWUFKSSxFQUtKLFlBTEksRUFNSixtQkFOSSxFQU9KLGNBUEksRUFRSixRQVJJLEVBU0osY0FUSSxFQUFOOztBQVlBOzs7Ozs7a0JBTWVBLFkiLCJmaWxlIjoicGx1Z2luLXByb3BzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgRVZFTlRfSEFORExFUlMgZnJvbSAnLi9ldmVudC1oYW5kbGVycydcblxuLyoqXG4gKiBQcm9wcyB0aGF0IGNhbiBiZSBkZWZpbmVkIGJ5IHBsdWdpbnMuXG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5cbmNvbnN0IFBMVUdJTl9QUk9QUyA9IFtcbiAgLi4uRVZFTlRfSEFORExFUlMsXG4gICdkZWNvcmF0ZU5vZGUnLFxuICAnb25DaGFuZ2UnLFxuICAncmVuZGVyTWFyaycsXG4gICdyZW5kZXJOb2RlJyxcbiAgJ3JlbmRlclBsYWNlaG9sZGVyJyxcbiAgJ3JlbmRlclBvcnRhbCcsXG4gICdzY2hlbWEnLFxuICAndmFsaWRhdGVOb2RlJyxcbl1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IFBMVUdJTl9QUk9QU1xuIl19