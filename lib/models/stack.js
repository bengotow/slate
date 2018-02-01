'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

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
  plugins: []
};

/**
 * Stack.
 *
 * @type {Stack}
 */

var Stack = function (_Record) {
  _inherits(Stack, _Record);

  function Stack() {
    _classCallCheck(this, Stack);

    return _possibleConstructorReturn(this, (Stack.__proto__ || Object.getPrototypeOf(Stack)).apply(this, arguments));
  }

  _createClass(Stack, [{
    key: 'getPluginsWith',


    /**
     * Get all plugins with `property`.
     *
     * @param {String} property
     * @return {Array}
     */

    value: function getPluginsWith(property) {
      return this.plugins.filter(function (plugin) {
        return plugin[property] != null;
      });
    }

    /**
     * Iterate the plugins with `property`, returning the first non-null value.
     *
     * @param {String} property
     * @param {Any} ...args
     */

  }, {
    key: 'find',
    value: function find(property) {
      var plugins = this.getPluginsWith(property);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var plugin = _step.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) return ret;
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
    }

    /**
     * Iterate the plugins with `property`, returning all the non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     * @return {Array}
     */

  }, {
    key: 'map',
    value: function map(property) {
      var plugins = this.getPluginsWith(property);
      var array = [];

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var plugin = _step2.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) array.push(ret);
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

      return array;
    }

    /**
     * Iterate the plugins with `property`, breaking on any a non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     */

  }, {
    key: 'run',
    value: function run(property) {
      var plugins = this.getPluginsWith(property);

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = plugins[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var plugin = _step3.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) return;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    /**
     * Iterate the plugins with `property`, reducing to a set of React children.
     *
     * @param {String} property
     * @param {Object} props
     * @param {Any} ...args
     */

  }, {
    key: 'render',
    value: function render(property, props) {
      var plugins = this.getPluginsWith(property).slice().reverse();
      var _props$children = props.children,
          children = _props$children === undefined ? null : _props$children;

      for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {

        for (var _iterator4 = plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var plugin = _step4.value;

          var ret = plugin[property].apply(plugin, [props].concat(args));
          if (ret == null) continue;
          props.children = children = ret;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return children;
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get() {
      return 'stack';
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
     * Constructor.
     *
     * @param {Object} attrs
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _attrs$plugins = attrs.plugins,
          plugins = _attrs$plugins === undefined ? [] : _attrs$plugins;

      var stack = new Stack({ plugins: plugins });
      return stack;
    }

    /**
     * Check if `any` is a `Stack`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isStack',
    value: function isStack(any) {
      return !!(any && any[_modelTypes2.default.STACK]);
    }
  }]);

  return Stack;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Stack.prototype[_modelTypes2.default.STACK] = true;

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Stack.prototype, ['getPluginsWith'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Stack}
 */

exports.default = Stack;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvc3RhY2suanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJwbHVnaW5zIiwiU3RhY2siLCJwcm9wZXJ0eSIsImZpbHRlciIsInBsdWdpbiIsImdldFBsdWdpbnNXaXRoIiwiYXJncyIsInJldCIsImFycmF5IiwicHVzaCIsInByb3BzIiwic2xpY2UiLCJyZXZlcnNlIiwiY2hpbGRyZW4iLCJkZXByZWNhdGUiLCJvYmplY3QiLCJhdHRycyIsInN0YWNrIiwiYW55IiwiU1RBQ0siLCJwcm90b3R5cGUiLCJ0YWtlc0FyZ3VtZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxXQUFXO0FBQ2ZDLFdBQVM7QUFETSxDQUFqQjs7QUFJQTs7Ozs7O0lBTU1DLEs7Ozs7Ozs7Ozs7Ozs7QUF3Q0o7Ozs7Ozs7bUNBT2VDLFEsRUFBVTtBQUN2QixhQUFPLEtBQUtGLE9BQUwsQ0FBYUcsTUFBYixDQUFvQjtBQUFBLGVBQVVDLE9BQU9GLFFBQVAsS0FBb0IsSUFBOUI7QUFBQSxPQUFwQixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozt5QkFPS0EsUSxFQUFtQjtBQUN0QixVQUFNRixVQUFVLEtBQUtLLGNBQUwsQ0FBb0JILFFBQXBCLENBQWhCOztBQURzQix3Q0FBTkksSUFBTTtBQUFOQSxZQUFNO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBR3RCLDZCQUFxQk4sT0FBckIsOEhBQThCO0FBQUEsY0FBbkJJLE1BQW1COztBQUM1QixjQUFNRyxNQUFNSCxPQUFPRixRQUFQLGdCQUFvQkksSUFBcEIsQ0FBWjtBQUNBLGNBQUlDLE9BQU8sSUFBWCxFQUFpQixPQUFPQSxHQUFQO0FBQ2xCO0FBTnFCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPdkI7O0FBRUQ7Ozs7Ozs7Ozs7d0JBUUlMLFEsRUFBbUI7QUFDckIsVUFBTUYsVUFBVSxLQUFLSyxjQUFMLENBQW9CSCxRQUFwQixDQUFoQjtBQUNBLFVBQU1NLFFBQVEsRUFBZDs7QUFGcUIseUNBQU5GLElBQU07QUFBTkEsWUFBTTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUlyQiw4QkFBcUJOLE9BQXJCLG1JQUE4QjtBQUFBLGNBQW5CSSxNQUFtQjs7QUFDNUIsY0FBTUcsTUFBTUgsT0FBT0YsUUFBUCxnQkFBb0JJLElBQXBCLENBQVo7QUFDQSxjQUFJQyxPQUFPLElBQVgsRUFBaUJDLE1BQU1DLElBQU4sQ0FBV0YsR0FBWDtBQUNsQjtBQVBvQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVNyQixhQUFPQyxLQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozt3QkFPSU4sUSxFQUFtQjtBQUNyQixVQUFNRixVQUFVLEtBQUtLLGNBQUwsQ0FBb0JILFFBQXBCLENBQWhCOztBQURxQix5Q0FBTkksSUFBTTtBQUFOQSxZQUFNO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBR3JCLDhCQUFxQk4sT0FBckIsbUlBQThCO0FBQUEsY0FBbkJJLE1BQW1COztBQUM1QixjQUFNRyxNQUFNSCxPQUFPRixRQUFQLGdCQUFvQkksSUFBcEIsQ0FBWjtBQUNBLGNBQUlDLE9BQU8sSUFBWCxFQUFpQjtBQUNsQjtBQU5vQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBT3RCOztBQUVEOzs7Ozs7Ozs7OzJCQVFPTCxRLEVBQVVRLEssRUFBZ0I7QUFDL0IsVUFBTVYsVUFBVSxLQUFLSyxjQUFMLENBQW9CSCxRQUFwQixFQUE4QlMsS0FBOUIsR0FBc0NDLE9BQXRDLEVBQWhCO0FBRCtCLDRCQUVMRixLQUZLLENBRXpCRyxRQUZ5QjtBQUFBLFVBRXpCQSxRQUZ5QixtQ0FFZCxJQUZjOztBQUFBLHlDQUFOUCxJQUFNO0FBQU5BLFlBQU07QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBSS9CLDhCQUFxQk4sT0FBckIsbUlBQThCO0FBQUEsY0FBbkJJLE1BQW1COztBQUM1QixjQUFNRyxNQUFNSCxPQUFPRixRQUFQLGlCQUFpQlEsS0FBakIsU0FBMkJKLElBQTNCLEVBQVo7QUFDQSxjQUFJQyxPQUFPLElBQVgsRUFBaUI7QUFDakJHLGdCQUFNRyxRQUFOLEdBQWlCQSxXQUFXTixHQUE1QjtBQUNEO0FBUjhCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBVS9CLGFBQU9NLFFBQVA7QUFDRDs7Ozs7QUFqR0Q7Ozs7Ozt3QkFNYTtBQUNYLGFBQU8sT0FBUDtBQUNEOzs7d0JBRVU7QUFDVCwrQkFBT0MsU0FBUCxDQUFpQixjQUFqQixFQUFpQyxvRUFBakM7QUFDQSxhQUFPLEtBQUtDLE1BQVo7QUFDRDs7Ozs7QUFwQ0Q7Ozs7Ozs2QkFNMEI7QUFBQSxVQUFaQyxLQUFZLHVFQUFKLEVBQUk7QUFBQSwyQkFDQ0EsS0FERCxDQUNoQmhCLE9BRGdCO0FBQUEsVUFDaEJBLE9BRGdCLGtDQUNOLEVBRE07O0FBRXhCLFVBQU1pQixRQUFRLElBQUloQixLQUFKLENBQVUsRUFBRUQsZ0JBQUYsRUFBVixDQUFkO0FBQ0EsYUFBT2lCLEtBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7OzRCQU9lQyxHLEVBQUs7QUFDbEIsYUFBTyxDQUFDLEVBQUVBLE9BQU9BLElBQUkscUJBQVlDLEtBQWhCLENBQVQsQ0FBUjtBQUNEOzs7O0VBdkJpQix1QkFBT3BCLFFBQVAsQzs7QUE4SHBCOzs7O0FBSUFFLE1BQU1tQixTQUFOLENBQWdCLHFCQUFZRCxLQUE1QixJQUFxQyxJQUFyQzs7QUFFQTs7OztBQUlBLHVCQUFRbEIsTUFBTW1CLFNBQWQsRUFBeUIsQ0FDdkIsZ0JBRHVCLENBQXpCLEVBRUc7QUFDREMsa0JBQWdCO0FBRGYsQ0FGSDs7QUFNQTs7Ozs7O2tCQU1lcEIsSyIsImZpbGUiOiJzdGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGxvZ2dlciBmcm9tICdzbGF0ZS1kZXYtbG9nZ2VyJ1xuaW1wb3J0IHsgUmVjb3JkIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vdXRpbHMvbWVtb2l6ZSdcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgcGx1Z2luczogW10sXG59XG5cbi8qKlxuICogU3RhY2suXG4gKlxuICogQHR5cGUge1N0YWNrfVxuICovXG5cbmNsYXNzIFN0YWNrIGV4dGVuZHMgUmVjb3JkKERFRkFVTFRTKSB7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9IHt9KSB7XG4gICAgY29uc3QgeyBwbHVnaW5zID0gW10gfSA9IGF0dHJzXG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgU3RhY2soeyBwbHVnaW5zIH0pXG4gICAgcmV0dXJuIHN0YWNrXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgU3RhY2tgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc1N0YWNrKGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLlNUQUNLXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPYmplY3QuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gJ3N0YWNrJ1xuICB9XG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgbG9nZ2VyLmRlcHJlY2F0ZSgnc2xhdGVAMC4zMi4wJywgJ1RoZSBga2luZGAgcHJvcGVydHkgb2YgU2xhdGUgb2JqZWN0cyBoYXMgYmVlbiByZW5hbWVkIHRvIGBvYmplY3RgLicpXG4gICAgcmV0dXJuIHRoaXMub2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBwbHVnaW5zIHdpdGggYHByb3BlcnR5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRQbHVnaW5zV2l0aChwcm9wZXJ0eSkge1xuICAgIHJldHVybiB0aGlzLnBsdWdpbnMuZmlsdGVyKHBsdWdpbiA9PiBwbHVnaW5bcHJvcGVydHldICE9IG51bGwpXG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSB0aGUgcGx1Z2lucyB3aXRoIGBwcm9wZXJ0eWAsIHJldHVybmluZyB0aGUgZmlyc3Qgbm9uLW51bGwgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge0FueX0gLi4uYXJnc1xuICAgKi9cblxuICBmaW5kKHByb3BlcnR5LCAuLi5hcmdzKSB7XG4gICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuZ2V0UGx1Z2luc1dpdGgocHJvcGVydHkpXG5cbiAgICBmb3IgKGNvbnN0IHBsdWdpbiBvZiBwbHVnaW5zKSB7XG4gICAgICBjb25zdCByZXQgPSBwbHVnaW5bcHJvcGVydHldKC4uLmFyZ3MpXG4gICAgICBpZiAocmV0ICE9IG51bGwpIHJldHVybiByZXRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSB0aGUgcGx1Z2lucyB3aXRoIGBwcm9wZXJ0eWAsIHJldHVybmluZyBhbGwgdGhlIG5vbi1udWxsIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7QW55fSAuLi5hcmdzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBtYXAocHJvcGVydHksIC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5nZXRQbHVnaW5zV2l0aChwcm9wZXJ0eSlcbiAgICBjb25zdCBhcnJheSA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IHBsdWdpbiBvZiBwbHVnaW5zKSB7XG4gICAgICBjb25zdCByZXQgPSBwbHVnaW5bcHJvcGVydHldKC4uLmFyZ3MpXG4gICAgICBpZiAocmV0ICE9IG51bGwpIGFycmF5LnB1c2gocmV0KVxuICAgIH1cblxuICAgIHJldHVybiBhcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhlIHBsdWdpbnMgd2l0aCBgcHJvcGVydHlgLCBicmVha2luZyBvbiBhbnkgYSBub24tbnVsbCB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge0FueX0gLi4uYXJnc1xuICAgKi9cblxuICBydW4ocHJvcGVydHksIC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5nZXRQbHVnaW5zV2l0aChwcm9wZXJ0eSlcblxuICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICAgIGNvbnN0IHJldCA9IHBsdWdpbltwcm9wZXJ0eV0oLi4uYXJncylcbiAgICAgIGlmIChyZXQgIT0gbnVsbCkgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhlIHBsdWdpbnMgd2l0aCBgcHJvcGVydHlgLCByZWR1Y2luZyB0byBhIHNldCBvZiBSZWFjdCBjaGlsZHJlbi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgKiBAcGFyYW0ge0FueX0gLi4uYXJnc1xuICAgKi9cblxuICByZW5kZXIocHJvcGVydHksIHByb3BzLCAuLi5hcmdzKSB7XG4gICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuZ2V0UGx1Z2luc1dpdGgocHJvcGVydHkpLnNsaWNlKCkucmV2ZXJzZSgpXG4gICAgbGV0IHsgY2hpbGRyZW4gPSBudWxsIH0gPSBwcm9wc1xuXG4gICAgZm9yIChjb25zdCBwbHVnaW4gb2YgcGx1Z2lucykge1xuICAgICAgY29uc3QgcmV0ID0gcGx1Z2luW3Byb3BlcnR5XShwcm9wcywgLi4uYXJncylcbiAgICAgIGlmIChyZXQgPT0gbnVsbCkgY29udGludWVcbiAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRyZW4gPSByZXRcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGRyZW5cbiAgfVxuXG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5TdGFjay5wcm90b3R5cGVbTU9ERUxfVFlQRVMuU1RBQ0tdID0gdHJ1ZVxuXG4vKipcbiAqIE1lbW9pemUgcmVhZCBtZXRob2RzLlxuICovXG5cbm1lbW9pemUoU3RhY2sucHJvdG90eXBlLCBbXG4gICdnZXRQbHVnaW5zV2l0aCcsXG5dLCB7XG4gIHRha2VzQXJndW1lbnRzOiB0cnVlLFxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge1N0YWNrfVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IFN0YWNrXG4iXX0=