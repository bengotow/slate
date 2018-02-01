'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _operationAttributes = require('../constants/operation-attributes');

var _operationAttributes2 = _interopRequireDefault(_operationAttributes);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _range = require('./range');

var _range2 = _interopRequireDefault(_range);

var _value = require('./value');

var _value2 = _interopRequireDefault(_value);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  length: undefined,
  mark: undefined,
  marks: undefined,
  newPath: undefined,
  node: undefined,
  offset: undefined,
  path: undefined,
  position: undefined,
  properties: undefined,
  selection: undefined,
  target: undefined,
  text: undefined,
  type: undefined,
  value: undefined
};

/**
 * Operation.
 *
 * @type {Operation}
 */

var Operation = function (_Record) {
  _inherits(Operation, _Record);

  function Operation() {
    _classCallCheck(this, Operation);

    return _possibleConstructorReturn(this, (Operation.__proto__ || Object.getPrototypeOf(Operation)).apply(this, arguments));
  }

  _createClass(Operation, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the operation.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var object = this.object,
          type = this.type;

      var json = { object: object, type: type };
      var ATTRIBUTES = _operationAttributes2.default[type];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = ATTRIBUTES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var value = this[key];

          // Skip keys for objects that should not be serialized, and are only used
          // for providing the local-only invert behavior for the history stack.
          if (key == 'document') continue;
          if (key == 'selection' && type != 'set_selection') continue;
          if (key == 'value') continue;
          if (key == 'node' && type != 'insert_node') continue;

          if (key == 'mark' || key == 'marks' || key == 'node' || key == 'selection') {
            value = value.toJSON();
          }

          if (key == 'properties' && type == 'set_mark') {
            var v = {};
            if ('data' in value) v.data = value.data.toJS();
            if ('type' in value) v.type = value.type;
            value = v;
          }

          if (key == 'properties' && type == 'set_node') {
            var _v = {};
            if ('data' in value) _v.data = value.data.toJS();
            if ('isVoid' in value) _v.isVoid = value.isVoid;
            if ('type' in value) _v.type = value.type;
            value = _v;
          }

          if (key == 'properties' && type == 'set_selection') {
            var _v2 = {};
            if ('anchorKey' in value) _v2.anchorKey = value.anchorKey;
            if ('anchorOffset' in value) _v2.anchorOffset = value.anchorOffset;
            if ('focusKey' in value) _v2.focusKey = value.focusKey;
            if ('focusOffset' in value) _v2.focusOffset = value.focusOffset;
            if ('isBackward' in value) _v2.isBackward = value.isBackward;
            if ('isFocused' in value) _v2.isFocused = value.isFocused;
            if ('marks' in value) _v2.marks = value.marks == null ? null : value.marks.toJSON();
            value = _v2;
          }

          if (key == 'properties' && type == 'set_value') {
            var _v3 = {};
            if ('data' in value) _v3.data = value.data.toJS();
            if ('decorations' in value) _v3.decorations = value.decorations.toJS();
            if ('schema' in value) _v3.schema = value.schema.toJS();
            value = _v3;
          }

          json[key] = value;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return json;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get() {
      return 'operation';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Operation` with `attrs`.
     *
     * @param {Object|Array|List|String|Operation} attrs
     * @return {Operation}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Operation.isOperation(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Operation.fromJSON(attrs);
      }

      throw new Error('`Operation.create` only accepts objects or operations, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Operations` from `elements`.
     *
     * @param {Array<Operation|Object>|List<Operation|Object>} elements
     * @return {List<Operation>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Operation.create));
        return list;
      }

      throw new Error('`Operation.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Operation` from a JSON `object`.
     *
     * @param {Object|Operation} object
     * @return {Operation}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Operation.isOperation(object)) {
        return object;
      }

      var type = object.type,
          value = object.value;

      var ATTRIBUTES = _operationAttributes2.default[type];
      var attrs = { type: type };

      if (!ATTRIBUTES) {
        throw new Error('`Operation.fromJSON` was passed an unrecognized operation type: "' + type + '"');
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = ATTRIBUTES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var key = _step2.value;

          var v = object[key];

          if (v === undefined) {
            // Skip keys for objects that should not be serialized, and are only used
            // for providing the local-only invert behavior for the history stack.
            if (key == 'document') continue;
            if (key == 'selection' && type != 'set_selection') continue;
            if (key == 'value') continue;
            if (key == 'node' && type != 'insert_node') continue;

            throw new Error('`Operation.fromJSON` was passed a "' + type + '" operation without the required "' + key + '" attribute.');
          }

          if (key == 'mark') {
            v = _mark2.default.create(v);
          }

          if (key == 'marks' && v != null) {
            v = _mark2.default.createSet(v);
          }

          if (key == 'node') {
            v = _node2.default.create(v);
          }

          if (key == 'selection') {
            v = _range2.default.create(v);
          }

          if (key == 'value') {
            v = _value2.default.create(v);
          }

          if (key == 'properties' && type == 'set_mark') {
            v = _mark2.default.createProperties(v);
          }

          if (key == 'properties' && type == 'set_node') {
            v = _node2.default.createProperties(v);
          }

          if (key == 'properties' && type == 'set_selection') {
            v = _range2.default.createProperties(v);
          }

          if (key == 'properties' && type == 'set_value') {
            v = _value2.default.createProperties(v);
          }

          attrs[key] = v;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var node = new Operation(attrs);
      return node;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isOperation',


    /**
     * Check if `any` is a `Operation`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isOperation(any) {
      return !!(any && any[_modelTypes2.default.OPERATION]);
    }

    /**
     * Check if `any` is a list of operations.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isOperationList',
    value: function isOperationList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Operation.isOperation(item);
      });
    }
  }]);

  return Operation;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Operation.fromJS = Operation.fromJSON;
Operation.prototype[_modelTypes2.default.OPERATION] = true;

/**
 * Export.
 *
 * @type {Operation}
 */

exports.default = Operation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvb3BlcmF0aW9uLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRTIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwibWFyayIsIm1hcmtzIiwibmV3UGF0aCIsIm5vZGUiLCJvZmZzZXQiLCJwYXRoIiwicG9zaXRpb24iLCJwcm9wZXJ0aWVzIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwidGV4dCIsInR5cGUiLCJ2YWx1ZSIsIk9wZXJhdGlvbiIsIm9wdGlvbnMiLCJvYmplY3QiLCJqc29uIiwiQVRUUklCVVRFUyIsImtleSIsInRvSlNPTiIsInYiLCJkYXRhIiwidG9KUyIsImlzVm9pZCIsImFuY2hvcktleSIsImFuY2hvck9mZnNldCIsImZvY3VzS2V5IiwiZm9jdXNPZmZzZXQiLCJpc0JhY2t3YXJkIiwiaXNGb2N1c2VkIiwiZGVjb3JhdGlvbnMiLCJzY2hlbWEiLCJkZXByZWNhdGUiLCJhdHRycyIsImlzT3BlcmF0aW9uIiwiZnJvbUpTT04iLCJFcnJvciIsImVsZW1lbnRzIiwiaXNMaXN0IiwiQXJyYXkiLCJpc0FycmF5IiwibGlzdCIsIm1hcCIsImNyZWF0ZSIsImNyZWF0ZVNldCIsImNyZWF0ZVByb3BlcnRpZXMiLCJhbnkiLCJPUEVSQVRJT04iLCJldmVyeSIsIml0ZW0iLCJmcm9tSlMiLCJwcm90b3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFdBQVc7QUFDZkMsVUFBUUMsU0FETztBQUVmQyxRQUFNRCxTQUZTO0FBR2ZFLFNBQU9GLFNBSFE7QUFJZkcsV0FBU0gsU0FKTTtBQUtmSSxRQUFNSixTQUxTO0FBTWZLLFVBQVFMLFNBTk87QUFPZk0sUUFBTU4sU0FQUztBQVFmTyxZQUFVUCxTQVJLO0FBU2ZRLGNBQVlSLFNBVEc7QUFVZlMsYUFBV1QsU0FWSTtBQVdmVSxVQUFRVixTQVhPO0FBWWZXLFFBQU1YLFNBWlM7QUFhZlksUUFBTVosU0FiUztBQWNmYSxTQUFPYjtBQWRRLENBQWpCOztBQWlCQTs7Ozs7O0lBTU1jLFM7Ozs7Ozs7Ozs7Ozs7QUE2Sko7Ozs7Ozs7NkJBT3FCO0FBQUEsVUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUEsVUFDWEMsTUFEVyxHQUNNLElBRE4sQ0FDWEEsTUFEVztBQUFBLFVBQ0hKLElBREcsR0FDTSxJQUROLENBQ0hBLElBREc7O0FBRW5CLFVBQU1LLE9BQU8sRUFBRUQsY0FBRixFQUFVSixVQUFWLEVBQWI7QUFDQSxVQUFNTSxhQUFhLDhCQUFxQk4sSUFBckIsQ0FBbkI7O0FBSG1CO0FBQUE7QUFBQTs7QUFBQTtBQUtuQiw2QkFBa0JNLFVBQWxCLDhIQUE4QjtBQUFBLGNBQW5CQyxHQUFtQjs7QUFDNUIsY0FBSU4sUUFBUSxLQUFLTSxHQUFMLENBQVo7O0FBRUE7QUFDQTtBQUNBLGNBQUlBLE9BQU8sVUFBWCxFQUF1QjtBQUN2QixjQUFJQSxPQUFPLFdBQVAsSUFBc0JQLFFBQVEsZUFBbEMsRUFBbUQ7QUFDbkQsY0FBSU8sT0FBTyxPQUFYLEVBQW9CO0FBQ3BCLGNBQUlBLE9BQU8sTUFBUCxJQUFpQlAsUUFBUSxhQUE3QixFQUE0Qzs7QUFFNUMsY0FBSU8sT0FBTyxNQUFQLElBQWlCQSxPQUFPLE9BQXhCLElBQW1DQSxPQUFPLE1BQTFDLElBQW9EQSxPQUFPLFdBQS9ELEVBQTRFO0FBQzFFTixvQkFBUUEsTUFBTU8sTUFBTixFQUFSO0FBQ0Q7O0FBRUQsY0FBSUQsT0FBTyxZQUFQLElBQXVCUCxRQUFRLFVBQW5DLEVBQStDO0FBQzdDLGdCQUFNUyxJQUFJLEVBQVY7QUFDQSxnQkFBSSxVQUFVUixLQUFkLEVBQXFCUSxFQUFFQyxJQUFGLEdBQVNULE1BQU1TLElBQU4sQ0FBV0MsSUFBWCxFQUFUO0FBQ3JCLGdCQUFJLFVBQVVWLEtBQWQsRUFBcUJRLEVBQUVULElBQUYsR0FBU0MsTUFBTUQsSUFBZjtBQUNyQkMsb0JBQVFRLENBQVI7QUFDRDs7QUFFRCxjQUFJRixPQUFPLFlBQVAsSUFBdUJQLFFBQVEsVUFBbkMsRUFBK0M7QUFDN0MsZ0JBQU1TLEtBQUksRUFBVjtBQUNBLGdCQUFJLFVBQVVSLEtBQWQsRUFBcUJRLEdBQUVDLElBQUYsR0FBU1QsTUFBTVMsSUFBTixDQUFXQyxJQUFYLEVBQVQ7QUFDckIsZ0JBQUksWUFBWVYsS0FBaEIsRUFBdUJRLEdBQUVHLE1BQUYsR0FBV1gsTUFBTVcsTUFBakI7QUFDdkIsZ0JBQUksVUFBVVgsS0FBZCxFQUFxQlEsR0FBRVQsSUFBRixHQUFTQyxNQUFNRCxJQUFmO0FBQ3JCQyxvQkFBUVEsRUFBUjtBQUNEOztBQUVELGNBQUlGLE9BQU8sWUFBUCxJQUF1QlAsUUFBUSxlQUFuQyxFQUFvRDtBQUNsRCxnQkFBTVMsTUFBSSxFQUFWO0FBQ0EsZ0JBQUksZUFBZVIsS0FBbkIsRUFBMEJRLElBQUVJLFNBQUYsR0FBY1osTUFBTVksU0FBcEI7QUFDMUIsZ0JBQUksa0JBQWtCWixLQUF0QixFQUE2QlEsSUFBRUssWUFBRixHQUFpQmIsTUFBTWEsWUFBdkI7QUFDN0IsZ0JBQUksY0FBY2IsS0FBbEIsRUFBeUJRLElBQUVNLFFBQUYsR0FBYWQsTUFBTWMsUUFBbkI7QUFDekIsZ0JBQUksaUJBQWlCZCxLQUFyQixFQUE0QlEsSUFBRU8sV0FBRixHQUFnQmYsTUFBTWUsV0FBdEI7QUFDNUIsZ0JBQUksZ0JBQWdCZixLQUFwQixFQUEyQlEsSUFBRVEsVUFBRixHQUFlaEIsTUFBTWdCLFVBQXJCO0FBQzNCLGdCQUFJLGVBQWVoQixLQUFuQixFQUEwQlEsSUFBRVMsU0FBRixHQUFjakIsTUFBTWlCLFNBQXBCO0FBQzFCLGdCQUFJLFdBQVdqQixLQUFmLEVBQXNCUSxJQUFFbkIsS0FBRixHQUFVVyxNQUFNWCxLQUFOLElBQWUsSUFBZixHQUFzQixJQUF0QixHQUE2QlcsTUFBTVgsS0FBTixDQUFZa0IsTUFBWixFQUF2QztBQUN0QlAsb0JBQVFRLEdBQVI7QUFDRDs7QUFFRCxjQUFJRixPQUFPLFlBQVAsSUFBdUJQLFFBQVEsV0FBbkMsRUFBZ0Q7QUFDOUMsZ0JBQU1TLE1BQUksRUFBVjtBQUNBLGdCQUFJLFVBQVVSLEtBQWQsRUFBcUJRLElBQUVDLElBQUYsR0FBU1QsTUFBTVMsSUFBTixDQUFXQyxJQUFYLEVBQVQ7QUFDckIsZ0JBQUksaUJBQWlCVixLQUFyQixFQUE0QlEsSUFBRVUsV0FBRixHQUFnQmxCLE1BQU1rQixXQUFOLENBQWtCUixJQUFsQixFQUFoQjtBQUM1QixnQkFBSSxZQUFZVixLQUFoQixFQUF1QlEsSUFBRVcsTUFBRixHQUFXbkIsTUFBTW1CLE1BQU4sQ0FBYVQsSUFBYixFQUFYO0FBQ3ZCVixvQkFBUVEsR0FBUjtBQUNEOztBQUVESixlQUFLRSxHQUFMLElBQVlOLEtBQVo7QUFDRDtBQXZEa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUF5RG5CLGFBQU9JLElBQVA7QUFDRDs7QUFFRDs7Ozs7O3lCQUlLRixPLEVBQVM7QUFDWixhQUFPLEtBQUtLLE1BQUwsQ0FBWUwsT0FBWixDQUFQO0FBQ0Q7Ozs7O0FBeEZEOzs7Ozs7d0JBTWE7QUFDWCxhQUFPLFdBQVA7QUFDRDs7O3dCQUVVO0FBQ1QsK0JBQU9rQixTQUFQLENBQWlCLGNBQWpCLEVBQWlDLG9FQUFqQztBQUNBLGFBQU8sS0FBS2pCLE1BQVo7QUFDRDs7Ozs7QUF6SkQ7Ozs7Ozs7NkJBTzBCO0FBQUEsVUFBWmtCLEtBQVksdUVBQUosRUFBSTs7QUFDeEIsVUFBSXBCLFVBQVVxQixXQUFWLENBQXNCRCxLQUF0QixDQUFKLEVBQWtDO0FBQ2hDLGVBQU9BLEtBQVA7QUFDRDs7QUFFRCxVQUFJLDZCQUFjQSxLQUFkLENBQUosRUFBMEI7QUFDeEIsZUFBT3BCLFVBQVVzQixRQUFWLENBQW1CRixLQUFuQixDQUFQO0FBQ0Q7O0FBRUQsWUFBTSxJQUFJRyxLQUFKLGdGQUF5RkgsS0FBekYsQ0FBTjtBQUNEOztBQUVEOzs7Ozs7Ozs7aUNBT2lDO0FBQUEsVUFBZkksUUFBZSx1RUFBSixFQUFJOztBQUMvQixVQUFJLGdCQUFLQyxNQUFMLENBQVlELFFBQVosS0FBeUJFLE1BQU1DLE9BQU4sQ0FBY0gsUUFBZCxDQUE3QixFQUFzRDtBQUNwRCxZQUFNSSxPQUFPLG9CQUFTSixTQUFTSyxHQUFULENBQWE3QixVQUFVOEIsTUFBdkIsQ0FBVCxDQUFiO0FBQ0EsZUFBT0YsSUFBUDtBQUNEOztBQUVELFlBQU0sSUFBSUwsS0FBSiw4RUFBdUZDLFFBQXZGLENBQU47QUFDRDs7QUFFRDs7Ozs7Ozs7OzZCQU9nQnRCLE0sRUFBUTtBQUN0QixVQUFJRixVQUFVcUIsV0FBVixDQUFzQm5CLE1BQXRCLENBQUosRUFBbUM7QUFDakMsZUFBT0EsTUFBUDtBQUNEOztBQUhxQixVQUtkSixJQUxjLEdBS0VJLE1BTEYsQ0FLZEosSUFMYztBQUFBLFVBS1JDLEtBTFEsR0FLRUcsTUFMRixDQUtSSCxLQUxROztBQU10QixVQUFNSyxhQUFhLDhCQUFxQk4sSUFBckIsQ0FBbkI7QUFDQSxVQUFNc0IsUUFBUSxFQUFFdEIsVUFBRixFQUFkOztBQUVBLFVBQUksQ0FBQ00sVUFBTCxFQUFpQjtBQUNmLGNBQU0sSUFBSW1CLEtBQUosdUVBQWdGekIsSUFBaEYsT0FBTjtBQUNEOztBQVhxQjtBQUFBO0FBQUE7O0FBQUE7QUFhdEIsOEJBQWtCTSxVQUFsQixtSUFBOEI7QUFBQSxjQUFuQkMsR0FBbUI7O0FBQzVCLGNBQUlFLElBQUlMLE9BQU9HLEdBQVAsQ0FBUjs7QUFFQSxjQUFJRSxNQUFNckIsU0FBVixFQUFxQjtBQUNuQjtBQUNBO0FBQ0EsZ0JBQUltQixPQUFPLFVBQVgsRUFBdUI7QUFDdkIsZ0JBQUlBLE9BQU8sV0FBUCxJQUFzQlAsUUFBUSxlQUFsQyxFQUFtRDtBQUNuRCxnQkFBSU8sT0FBTyxPQUFYLEVBQW9CO0FBQ3BCLGdCQUFJQSxPQUFPLE1BQVAsSUFBaUJQLFFBQVEsYUFBN0IsRUFBNEM7O0FBRTVDLGtCQUFNLElBQUl5QixLQUFKLHlDQUFrRHpCLElBQWxELDBDQUEyRk8sR0FBM0Ysa0JBQU47QUFDRDs7QUFFRCxjQUFJQSxPQUFPLE1BQVgsRUFBbUI7QUFDakJFLGdCQUFJLGVBQUt1QixNQUFMLENBQVl2QixDQUFaLENBQUo7QUFDRDs7QUFFRCxjQUFJRixPQUFPLE9BQVAsSUFBa0JFLEtBQUssSUFBM0IsRUFBaUM7QUFDL0JBLGdCQUFJLGVBQUt3QixTQUFMLENBQWV4QixDQUFmLENBQUo7QUFDRDs7QUFFRCxjQUFJRixPQUFPLE1BQVgsRUFBbUI7QUFDakJFLGdCQUFJLGVBQUt1QixNQUFMLENBQVl2QixDQUFaLENBQUo7QUFDRDs7QUFFRCxjQUFJRixPQUFPLFdBQVgsRUFBd0I7QUFDdEJFLGdCQUFJLGdCQUFNdUIsTUFBTixDQUFhdkIsQ0FBYixDQUFKO0FBQ0Q7O0FBRUQsY0FBSUYsT0FBTyxPQUFYLEVBQW9CO0FBQ2xCRSxnQkFBSSxnQkFBTXVCLE1BQU4sQ0FBYXZCLENBQWIsQ0FBSjtBQUNEOztBQUVELGNBQUlGLE9BQU8sWUFBUCxJQUF1QlAsUUFBUSxVQUFuQyxFQUErQztBQUM3Q1MsZ0JBQUksZUFBS3lCLGdCQUFMLENBQXNCekIsQ0FBdEIsQ0FBSjtBQUNEOztBQUVELGNBQUlGLE9BQU8sWUFBUCxJQUF1QlAsUUFBUSxVQUFuQyxFQUErQztBQUM3Q1MsZ0JBQUksZUFBS3lCLGdCQUFMLENBQXNCekIsQ0FBdEIsQ0FBSjtBQUNEOztBQUVELGNBQUlGLE9BQU8sWUFBUCxJQUF1QlAsUUFBUSxlQUFuQyxFQUFvRDtBQUNsRFMsZ0JBQUksZ0JBQU15QixnQkFBTixDQUF1QnpCLENBQXZCLENBQUo7QUFDRDs7QUFFRCxjQUFJRixPQUFPLFlBQVAsSUFBdUJQLFFBQVEsV0FBbkMsRUFBZ0Q7QUFDOUNTLGdCQUFJLGdCQUFNeUIsZ0JBQU4sQ0FBdUJ6QixDQUF2QixDQUFKO0FBQ0Q7O0FBRURhLGdCQUFNZixHQUFOLElBQWFFLENBQWI7QUFDRDtBQWhFcUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFrRXRCLFVBQU1qQixPQUFPLElBQUlVLFNBQUosQ0FBY29CLEtBQWQsQ0FBYjtBQUNBLGFBQU85QixJQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O0FBTUE7Ozs7Ozs7Z0NBT21CMkMsRyxFQUFLO0FBQ3RCLGFBQU8sQ0FBQyxFQUFFQSxPQUFPQSxJQUFJLHFCQUFZQyxTQUFoQixDQUFULENBQVI7QUFDRDs7QUFFRDs7Ozs7Ozs7O29DQU91QkQsRyxFQUFLO0FBQzFCLGFBQU8sZ0JBQUtSLE1BQUwsQ0FBWVEsR0FBWixLQUFvQkEsSUFBSUUsS0FBSixDQUFVO0FBQUEsZUFBUW5DLFVBQVVxQixXQUFWLENBQXNCZSxJQUF0QixDQUFSO0FBQUEsT0FBVixDQUEzQjtBQUNEOzs7O0VBNUlxQix1QkFBT3BELFFBQVAsQzs7QUEwT3hCOzs7O0FBMU9NZ0IsUyxDQXNIR3FDLE0sR0FBU3JDLFVBQVVzQixRO0FBd0g1QnRCLFVBQVVzQyxTQUFWLENBQW9CLHFCQUFZSixTQUFoQyxJQUE2QyxJQUE3Qzs7QUFFQTs7Ozs7O2tCQU1lbEMsUyIsImZpbGUiOiJvcGVyYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IExpc3QsIFJlY29yZCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuaW1wb3J0IE1PREVMX1RZUEVTIGZyb20gJy4uL2NvbnN0YW50cy9tb2RlbC10eXBlcydcbmltcG9ydCBPUEVSQVRJT05fQVRUUklCVVRFUyBmcm9tICcuLi9jb25zdGFudHMvb3BlcmF0aW9uLWF0dHJpYnV0ZXMnXG5pbXBvcnQgTWFyayBmcm9tICcuL21hcmsnXG5pbXBvcnQgTm9kZSBmcm9tICcuL25vZGUnXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi9yYW5nZSdcbmltcG9ydCBWYWx1ZSBmcm9tICcuL3ZhbHVlJ1xuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICBsZW5ndGg6IHVuZGVmaW5lZCxcbiAgbWFyazogdW5kZWZpbmVkLFxuICBtYXJrczogdW5kZWZpbmVkLFxuICBuZXdQYXRoOiB1bmRlZmluZWQsXG4gIG5vZGU6IHVuZGVmaW5lZCxcbiAgb2Zmc2V0OiB1bmRlZmluZWQsXG4gIHBhdGg6IHVuZGVmaW5lZCxcbiAgcG9zaXRpb246IHVuZGVmaW5lZCxcbiAgcHJvcGVydGllczogdW5kZWZpbmVkLFxuICBzZWxlY3Rpb246IHVuZGVmaW5lZCxcbiAgdGFyZ2V0OiB1bmRlZmluZWQsXG4gIHRleHQ6IHVuZGVmaW5lZCxcbiAgdHlwZTogdW5kZWZpbmVkLFxuICB2YWx1ZTogdW5kZWZpbmVkLFxufVxuXG4vKipcbiAqIE9wZXJhdGlvbi5cbiAqXG4gKiBAdHlwZSB7T3BlcmF0aW9ufVxuICovXG5cbmNsYXNzIE9wZXJhdGlvbiBleHRlbmRzIFJlY29yZChERUZBVUxUUykge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYE9wZXJhdGlvbmAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxBcnJheXxMaXN0fFN0cmluZ3xPcGVyYXRpb259IGF0dHJzXG4gICAqIEByZXR1cm4ge09wZXJhdGlvbn1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9IHt9KSB7XG4gICAgaWYgKE9wZXJhdGlvbi5pc09wZXJhdGlvbihhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgcmV0dXJuIE9wZXJhdGlvbi5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYE9wZXJhdGlvbi5jcmVhdGVcXGAgb25seSBhY2NlcHRzIG9iamVjdHMgb3Igb3BlcmF0aW9ucywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaXN0IG9mIGBPcGVyYXRpb25zYCBmcm9tIGBlbGVtZW50c2AuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8T3BlcmF0aW9ufE9iamVjdD58TGlzdDxPcGVyYXRpb258T2JqZWN0Pn0gZWxlbWVudHNcbiAgICogQHJldHVybiB7TGlzdDxPcGVyYXRpb24+fVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlTGlzdChlbGVtZW50cyA9IFtdKSB7XG4gICAgaWYgKExpc3QuaXNMaXN0KGVsZW1lbnRzKSB8fCBBcnJheS5pc0FycmF5KGVsZW1lbnRzKSkge1xuICAgICAgY29uc3QgbGlzdCA9IG5ldyBMaXN0KGVsZW1lbnRzLm1hcChPcGVyYXRpb24uY3JlYXRlKSlcbiAgICAgIHJldHVybiBsaXN0XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBPcGVyYXRpb24uY3JlYXRlTGlzdFxcYCBvbmx5IGFjY2VwdHMgYXJyYXlzIG9yIGxpc3RzLCBidXQgeW91IHBhc3NlZCBpdDogJHtlbGVtZW50c31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBPcGVyYXRpb25gIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxPcGVyYXRpb259IG9iamVjdFxuICAgKiBAcmV0dXJuIHtPcGVyYXRpb259XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTihvYmplY3QpIHtcbiAgICBpZiAoT3BlcmF0aW9uLmlzT3BlcmF0aW9uKG9iamVjdCkpIHtcbiAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG5cbiAgICBjb25zdCB7IHR5cGUsIHZhbHVlIH0gPSBvYmplY3RcbiAgICBjb25zdCBBVFRSSUJVVEVTID0gT1BFUkFUSU9OX0FUVFJJQlVURVNbdHlwZV1cbiAgICBjb25zdCBhdHRycyA9IHsgdHlwZSB9XG5cbiAgICBpZiAoIUFUVFJJQlVURVMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgXFxgT3BlcmF0aW9uLmZyb21KU09OXFxgIHdhcyBwYXNzZWQgYW4gdW5yZWNvZ25pemVkIG9wZXJhdGlvbiB0eXBlOiBcIiR7dHlwZX1cImApXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgQVRUUklCVVRFUykge1xuICAgICAgbGV0IHYgPSBvYmplY3Rba2V5XVxuXG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFNraXAga2V5cyBmb3Igb2JqZWN0cyB0aGF0IHNob3VsZCBub3QgYmUgc2VyaWFsaXplZCwgYW5kIGFyZSBvbmx5IHVzZWRcbiAgICAgICAgLy8gZm9yIHByb3ZpZGluZyB0aGUgbG9jYWwtb25seSBpbnZlcnQgYmVoYXZpb3IgZm9yIHRoZSBoaXN0b3J5IHN0YWNrLlxuICAgICAgICBpZiAoa2V5ID09ICdkb2N1bWVudCcpIGNvbnRpbnVlXG4gICAgICAgIGlmIChrZXkgPT0gJ3NlbGVjdGlvbicgJiYgdHlwZSAhPSAnc2V0X3NlbGVjdGlvbicpIGNvbnRpbnVlXG4gICAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlJykgY29udGludWVcbiAgICAgICAgaWYgKGtleSA9PSAnbm9kZScgJiYgdHlwZSAhPSAnaW5zZXJ0X25vZGUnKSBjb250aW51ZVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgXFxgT3BlcmF0aW9uLmZyb21KU09OXFxgIHdhcyBwYXNzZWQgYSBcIiR7dHlwZX1cIiBvcGVyYXRpb24gd2l0aG91dCB0aGUgcmVxdWlyZWQgXCIke2tleX1cIiBhdHRyaWJ1dGUuYClcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PSAnbWFyaycpIHtcbiAgICAgICAgdiA9IE1hcmsuY3JlYXRlKHYpXG4gICAgICB9XG5cbiAgICAgIGlmIChrZXkgPT0gJ21hcmtzJyAmJiB2ICE9IG51bGwpIHtcbiAgICAgICAgdiA9IE1hcmsuY3JlYXRlU2V0KHYpXG4gICAgICB9XG5cbiAgICAgIGlmIChrZXkgPT0gJ25vZGUnKSB7XG4gICAgICAgIHYgPSBOb2RlLmNyZWF0ZSh2KVxuICAgICAgfVxuXG4gICAgICBpZiAoa2V5ID09ICdzZWxlY3Rpb24nKSB7XG4gICAgICAgIHYgPSBSYW5nZS5jcmVhdGUodilcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PSAndmFsdWUnKSB7XG4gICAgICAgIHYgPSBWYWx1ZS5jcmVhdGUodilcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PSAncHJvcGVydGllcycgJiYgdHlwZSA9PSAnc2V0X21hcmsnKSB7XG4gICAgICAgIHYgPSBNYXJrLmNyZWF0ZVByb3BlcnRpZXModilcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PSAncHJvcGVydGllcycgJiYgdHlwZSA9PSAnc2V0X25vZGUnKSB7XG4gICAgICAgIHYgPSBOb2RlLmNyZWF0ZVByb3BlcnRpZXModilcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PSAncHJvcGVydGllcycgJiYgdHlwZSA9PSAnc2V0X3NlbGVjdGlvbicpIHtcbiAgICAgICAgdiA9IFJhbmdlLmNyZWF0ZVByb3BlcnRpZXModilcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PSAncHJvcGVydGllcycgJiYgdHlwZSA9PSAnc2V0X3ZhbHVlJykge1xuICAgICAgICB2ID0gVmFsdWUuY3JlYXRlUHJvcGVydGllcyh2KVxuICAgICAgfVxuXG4gICAgICBhdHRyc1trZXldID0gdlxuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSBuZXcgT3BlcmF0aW9uKGF0dHJzKVxuICAgIHJldHVybiBub2RlXG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYGZyb21KU2AuXG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlMgPSBPcGVyYXRpb24uZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgT3BlcmF0aW9uYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNPcGVyYXRpb24oYW55KSB7XG4gICAgcmV0dXJuICEhKGFueSAmJiBhbnlbTU9ERUxfVFlQRVMuT1BFUkFUSU9OXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGxpc3TCoG9mIG9wZXJhdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzT3BlcmF0aW9uTGlzdChhbnkpIHtcbiAgICByZXR1cm4gTGlzdC5pc0xpc3QoYW55KSAmJiBhbnkuZXZlcnkoaXRlbSA9PiBPcGVyYXRpb24uaXNPcGVyYXRpb24oaXRlbSkpXG4gIH1cblxuICAvKipcbiAgICogT2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgcmV0dXJuICdvcGVyYXRpb24nXG4gIH1cblxuICBnZXQga2luZCgpIHtcbiAgICBsb2dnZXIuZGVwcmVjYXRlKCdzbGF0ZUAwLjMyLjAnLCAnVGhlIGBraW5kYCBwcm9wZXJ0eSBvZiBTbGF0ZSBvYmplY3RzIGhhcyBiZWVuIHJlbmFtZWQgdG8gYG9iamVjdGAuJylcbiAgICByZXR1cm4gdGhpcy5vYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvcGVyYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgdG9KU09OKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgb2JqZWN0LCB0eXBlIH0gPSB0aGlzXG4gICAgY29uc3QganNvbiA9IHsgb2JqZWN0LCB0eXBlIH1cbiAgICBjb25zdCBBVFRSSUJVVEVTID0gT1BFUkFUSU9OX0FUVFJJQlVURVNbdHlwZV1cblxuICAgIGZvciAoY29uc3Qga2V5IG9mIEFUVFJJQlVURVMpIHtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXNba2V5XVxuXG4gICAgICAvLyBTa2lwIGtleXMgZm9yIG9iamVjdHMgdGhhdCBzaG91bGQgbm90IGJlIHNlcmlhbGl6ZWQsIGFuZCBhcmUgb25seSB1c2VkXG4gICAgICAvLyBmb3IgcHJvdmlkaW5nIHRoZSBsb2NhbC1vbmx5IGludmVydCBiZWhhdmlvciBmb3IgdGhlIGhpc3Rvcnkgc3RhY2suXG4gICAgICBpZiAoa2V5ID09ICdkb2N1bWVudCcpIGNvbnRpbnVlXG4gICAgICBpZiAoa2V5ID09ICdzZWxlY3Rpb24nICYmIHR5cGUgIT0gJ3NldF9zZWxlY3Rpb24nKSBjb250aW51ZVxuICAgICAgaWYgKGtleSA9PSAndmFsdWUnKSBjb250aW51ZVxuICAgICAgaWYgKGtleSA9PSAnbm9kZScgJiYgdHlwZSAhPSAnaW5zZXJ0X25vZGUnKSBjb250aW51ZVxuXG4gICAgICBpZiAoa2V5ID09ICdtYXJrJyB8fCBrZXkgPT0gJ21hcmtzJyB8fCBrZXkgPT0gJ25vZGUnIHx8IGtleSA9PSAnc2VsZWN0aW9uJykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTigpXG4gICAgICB9XG5cbiAgICAgIGlmIChrZXkgPT0gJ3Byb3BlcnRpZXMnICYmIHR5cGUgPT0gJ3NldF9tYXJrJykge1xuICAgICAgICBjb25zdCB2ID0ge31cbiAgICAgICAgaWYgKCdkYXRhJyBpbiB2YWx1ZSkgdi5kYXRhID0gdmFsdWUuZGF0YS50b0pTKClcbiAgICAgICAgaWYgKCd0eXBlJyBpbiB2YWx1ZSkgdi50eXBlID0gdmFsdWUudHlwZVxuICAgICAgICB2YWx1ZSA9IHZcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PSAncHJvcGVydGllcycgJiYgdHlwZSA9PSAnc2V0X25vZGUnKSB7XG4gICAgICAgIGNvbnN0IHYgPSB7fVxuICAgICAgICBpZiAoJ2RhdGEnIGluIHZhbHVlKSB2LmRhdGEgPSB2YWx1ZS5kYXRhLnRvSlMoKVxuICAgICAgICBpZiAoJ2lzVm9pZCcgaW4gdmFsdWUpIHYuaXNWb2lkID0gdmFsdWUuaXNWb2lkXG4gICAgICAgIGlmICgndHlwZScgaW4gdmFsdWUpIHYudHlwZSA9IHZhbHVlLnR5cGVcbiAgICAgICAgdmFsdWUgPSB2XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXkgPT0gJ3Byb3BlcnRpZXMnICYmIHR5cGUgPT0gJ3NldF9zZWxlY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IHYgPSB7fVxuICAgICAgICBpZiAoJ2FuY2hvcktleScgaW4gdmFsdWUpIHYuYW5jaG9yS2V5ID0gdmFsdWUuYW5jaG9yS2V5XG4gICAgICAgIGlmICgnYW5jaG9yT2Zmc2V0JyBpbiB2YWx1ZSkgdi5hbmNob3JPZmZzZXQgPSB2YWx1ZS5hbmNob3JPZmZzZXRcbiAgICAgICAgaWYgKCdmb2N1c0tleScgaW4gdmFsdWUpIHYuZm9jdXNLZXkgPSB2YWx1ZS5mb2N1c0tleVxuICAgICAgICBpZiAoJ2ZvY3VzT2Zmc2V0JyBpbiB2YWx1ZSkgdi5mb2N1c09mZnNldCA9IHZhbHVlLmZvY3VzT2Zmc2V0XG4gICAgICAgIGlmICgnaXNCYWNrd2FyZCcgaW4gdmFsdWUpIHYuaXNCYWNrd2FyZCA9IHZhbHVlLmlzQmFja3dhcmRcbiAgICAgICAgaWYgKCdpc0ZvY3VzZWQnIGluIHZhbHVlKSB2LmlzRm9jdXNlZCA9IHZhbHVlLmlzRm9jdXNlZFxuICAgICAgICBpZiAoJ21hcmtzJyBpbiB2YWx1ZSkgdi5tYXJrcyA9IHZhbHVlLm1hcmtzID09IG51bGwgPyBudWxsIDogdmFsdWUubWFya3MudG9KU09OKClcbiAgICAgICAgdmFsdWUgPSB2XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXkgPT0gJ3Byb3BlcnRpZXMnICYmIHR5cGUgPT0gJ3NldF92YWx1ZScpIHtcbiAgICAgICAgY29uc3QgdiA9IHt9XG4gICAgICAgIGlmICgnZGF0YScgaW4gdmFsdWUpIHYuZGF0YSA9IHZhbHVlLmRhdGEudG9KUygpXG4gICAgICAgIGlmICgnZGVjb3JhdGlvbnMnIGluIHZhbHVlKSB2LmRlY29yYXRpb25zID0gdmFsdWUuZGVjb3JhdGlvbnMudG9KUygpXG4gICAgICAgIGlmICgnc2NoZW1hJyBpbiB2YWx1ZSkgdi5zY2hlbWEgPSB2YWx1ZS5zY2hlbWEudG9KUygpXG4gICAgICAgIHZhbHVlID0gdlxuICAgICAgfVxuXG4gICAgICBqc29uW2tleV0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHJldHVybiBqc29uXG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYHRvSlNgLlxuICAgKi9cblxuICB0b0pTKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50b0pTT04ob3B0aW9ucylcbiAgfVxuXG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5PcGVyYXRpb24ucHJvdG90eXBlW01PREVMX1RZUEVTLk9QRVJBVElPTl0gPSB0cnVlXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPcGVyYXRpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0aW9uXG4iXX0=