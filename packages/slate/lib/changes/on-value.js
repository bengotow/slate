'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _value = require('../models/value');

var _value2 = _interopRequireDefault(_value);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Set `properties` on the value.
 *
 * @param {Change} change
 * @param {Object|Value} properties
 * @param {Object} options
 */

Changes.setValue = function (change, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  properties = _value2.default.createProperties(properties);
  var value = change.value;


  change.applyOperation({
    type: 'set_value',
    properties: properties,
    value: value
  }, options);
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL29uLXZhbHVlLmpzIl0sIm5hbWVzIjpbIkNoYW5nZXMiLCJzZXRWYWx1ZSIsImNoYW5nZSIsInByb3BlcnRpZXMiLCJvcHRpb25zIiwiY3JlYXRlUHJvcGVydGllcyIsInZhbHVlIiwiYXBwbHlPcGVyYXRpb24iLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFVBQVUsRUFBaEI7O0FBRUE7Ozs7Ozs7O0FBUUFBLFFBQVFDLFFBQVIsR0FBbUIsVUFBQ0MsTUFBRCxFQUFTQyxVQUFULEVBQXNDO0FBQUEsTUFBakJDLE9BQWlCLHVFQUFQLEVBQU87O0FBQ3ZERCxlQUFhLGdCQUFNRSxnQkFBTixDQUF1QkYsVUFBdkIsQ0FBYjtBQUR1RCxNQUUvQ0csS0FGK0MsR0FFckNKLE1BRnFDLENBRS9DSSxLQUYrQzs7O0FBSXZESixTQUFPSyxjQUFQLENBQXNCO0FBQ3BCQyxVQUFNLFdBRGM7QUFFcEJMLDBCQUZvQjtBQUdwQkc7QUFIb0IsR0FBdEIsRUFJR0YsT0FKSDtBQUtELENBVEQ7O0FBV0E7Ozs7OztrQkFNZUosTyIsImZpbGUiOiJvbi12YWx1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IFZhbHVlIGZyb20gJy4uL21vZGVscy92YWx1ZSdcblxuLyoqXG4gKiBDaGFuZ2VzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgQ2hhbmdlcyA9IHt9XG5cbi8qKlxuICogU2V0IGBwcm9wZXJ0aWVzYCBvbiB0aGUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtPYmplY3R8VmFsdWV9IHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuQ2hhbmdlcy5zZXRWYWx1ZSA9IChjaGFuZ2UsIHByb3BlcnRpZXMsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBwcm9wZXJ0aWVzID0gVmFsdWUuY3JlYXRlUHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb24oe1xuICAgIHR5cGU6ICdzZXRfdmFsdWUnLFxuICAgIHByb3BlcnRpZXMsXG4gICAgdmFsdWUsXG4gIH0sIG9wdGlvbnMpXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlc1xuIl19