'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _changes = require('../changes');

var _changes2 = _interopRequireDefault(_changes);

var _operation = require('./operation');

var _operation2 = _interopRequireDefault(_operation);

var _apply = require('../operations/apply');

var _apply2 = _interopRequireDefault(_apply);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:change');

/**
 * Change.
 *
 * @type {Change}
 */

var Change = function () {
  _createClass(Change, null, [{
    key: 'isChange',


    /**
     * Check if `any` is a `Change`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isChange(any) {
      return !!(any && any[_modelTypes2.default.CHANGE]);
    }

    /**
     * Create a new `Change` with `attrs`.
     *
     * @param {Object} attrs
     *   @property {Value} value
     */

  }]);

  function Change(attrs) {
    _classCallCheck(this, Change);

    var value = attrs.value;

    this.value = value;
    this.operations = new _immutable.List();
    this.flags = _extends({
      normalize: true
    }, (0, _pick2.default)(attrs, ['merge', 'save', 'normalize']));
  }

  /**
   * Object.
   *
   * @return {String}
   */

  _createClass(Change, [{
    key: 'applyOperation',


    /**
     * Apply an `operation` to the current value, saving the operation to the
     * history if needed.
     *
     * @param {Operation|Object} operation
     * @param {Object} options
     * @return {Change}
     */

    value: function applyOperation(operation) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var operations = this.operations,
          flags = this.flags;
      var value = this.value;
      var _value = value,
          history = _value.history;

      // Add in the current `value` in case the operation was serialized.

      if ((0, _isPlainObject2.default)(operation)) {
        operation = _extends({}, operation, { value: value });
      }

      operation = _operation2.default.create(operation);

      // Default options to the change-level flags, this allows for setting
      // specific options for all of the operations of a given change.
      options = _extends({}, flags, options);

      // Derive the default option values.
      var _options = options,
          _options$merge = _options.merge,
          merge = _options$merge === undefined ? operations.size == 0 ? null : true : _options$merge,
          _options$save = _options.save,
          save = _options$save === undefined ? true : _options$save,
          _options$skip = _options.skip,
          skip = _options$skip === undefined ? null : _options$skip;

      // Apply the operation to the value.

      debug('apply', { operation: operation, save: save, merge: merge });
      value = (0, _apply2.default)(value, operation);

      // If needed, save the operation to the history.
      if (history && save) {
        history = history.save(operation, { merge: merge, skip: skip });
        value = value.set('history', history);
      }

      // Update the mutable change object.
      this.value = value;
      this.operations = operations.push(operation);
      return this;
    }

    /**
     * Apply a series of `operations` to the current value.
     *
     * @param {Array|List} operations
     * @param {Object} options
     * @return {Change}
     */

  }, {
    key: 'applyOperations',
    value: function applyOperations(operations, options) {
      var _this = this;

      operations.forEach(function (op) {
        return _this.applyOperation(op, options);
      });
      return this;
    }

    /**
     * Call a change `fn` with arguments.
     *
     * @param {Function} fn
     * @param {Mixed} ...args
     * @return {Change}
     */

  }, {
    key: 'call',
    value: function call(fn) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      fn.apply(undefined, [this].concat(args));
      return this;
    }

    /**
     * Applies a series of change mutations and defers normalization until the end.
     *
     * @param {Function} customChange - function that accepts a change object and executes change operations
     * @return {Change}
     */

  }, {
    key: 'withoutNormalization',
    value: function withoutNormalization(customChange) {
      var original = this.flags.normalize;
      this.setOperationFlag('normalize', false);
      try {
        customChange(this);
        // if the change function worked then run normalization
        this.normalizeDocument();
      } finally {
        // restore the flag to whatever it was
        this.setOperationFlag('normalize', original);
      }
      return this;
    }

    /**
     * Set an operation flag by `key` to `value`.
     *
     * @param {String} key
     * @param {Any} value
     * @return {Change}
     */

  }, {
    key: 'setOperationFlag',
    value: function setOperationFlag(key, value) {
      this.flags[key] = value;
      return this;
    }

    /**
     * Get the `value` of the specified flag by its `key`. Optionally accepts an `options`
     * object with override flags.
     *
     * @param {String} key
     * @param {Object} options
     * @return {Change}
     */

  }, {
    key: 'getFlag',
    value: function getFlag(key) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return options[key] !== undefined ? options[key] : this.flags[key];
    }

    /**
     * Unset an operation flag by `key`.
     *
     * @param {String} key
     * @return {Change}
     */

  }, {
    key: 'unsetOperationFlag',
    value: function unsetOperationFlag(key) {
      delete this.flags[key];
      return this;
    }
  }, {
    key: 'object',
    get: function get() {
      return 'change';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }]);

  return Change;
}();

/**
 * Attach a pseudo-symbol for type checking.
 */

Change.prototype[_modelTypes2.default.CHANGE] = true;

/**
 * Add a change method for each of the changes.
 */

Object.keys(_changes2.default).forEach(function (type) {
  Change.prototype[type] = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    debug(type, { args: args });
    this.call.apply(this, [_changes2.default[type]].concat(args));
    return this;
  };
});

/**
 * Export.
 *
 * @type {Change}
 */

exports.default = Change;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvY2hhbmdlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiQ2hhbmdlIiwiYW55IiwiQ0hBTkdFIiwiYXR0cnMiLCJ2YWx1ZSIsIm9wZXJhdGlvbnMiLCJmbGFncyIsIm5vcm1hbGl6ZSIsIm9wZXJhdGlvbiIsIm9wdGlvbnMiLCJoaXN0b3J5IiwiY3JlYXRlIiwibWVyZ2UiLCJzaXplIiwic2F2ZSIsInNraXAiLCJzZXQiLCJwdXNoIiwiZm9yRWFjaCIsImFwcGx5T3BlcmF0aW9uIiwib3AiLCJmbiIsImFyZ3MiLCJjdXN0b21DaGFuZ2UiLCJvcmlnaW5hbCIsInNldE9wZXJhdGlvbkZsYWciLCJub3JtYWxpemVEb2N1bWVudCIsImtleSIsInVuZGVmaW5lZCIsImRlcHJlY2F0ZSIsIm9iamVjdCIsInByb3RvdHlwZSIsIk9iamVjdCIsImtleXMiLCJ0eXBlIiwiY2FsbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFFBQVEscUJBQU0sY0FBTixDQUFkOztBQUVBOzs7Ozs7SUFNTUMsTTs7Ozs7QUFFSjs7Ozs7Ozs2QkFPZ0JDLEcsRUFBSztBQUNuQixhQUFPLENBQUMsRUFBRUEsT0FBT0EsSUFBSSxxQkFBWUMsTUFBaEIsQ0FBVCxDQUFSO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OztBQU9BLGtCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsUUFDVEMsS0FEUyxHQUNDRCxLQURELENBQ1RDLEtBRFM7O0FBRWpCLFNBQUtBLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLFVBQUwsR0FBa0IscUJBQWxCO0FBQ0EsU0FBS0MsS0FBTDtBQUNFQyxpQkFBVztBQURiLE9BRUssb0JBQUtKLEtBQUwsRUFBWSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLFdBQWxCLENBQVosQ0FG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QVgsQ0FGRjtBQUdEOztBQUVEOzs7Ozs7Ozs7dUNBT21CQSxHLEVBQUs7QUFDdEIsYUFBTyxLQUFLckIsS0FBTCxDQUFXcUIsR0FBWCxDQUFQO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7Ozt3QkE5SVk7QUFDWCxhQUFPLFFBQVA7QUFDRDs7O3dCQUVVO0FBQ1QsK0JBQU9FLFNBQVAsQ0FBaUIsY0FBakIsRUFBaUMsb0VBQWpDO0FBQ0EsYUFBTyxLQUFLQyxNQUFaO0FBQ0Q7Ozs7OztBQTJJSDs7OztBQUlBOUIsT0FBTytCLFNBQVAsQ0FBaUIscUJBQVk3QixNQUE3QixJQUF1QyxJQUF2Qzs7QUFFQTs7OztBQUlBOEIsT0FBT0MsSUFBUCxvQkFBcUJmLE9BQXJCLENBQTZCLFVBQUNnQixJQUFELEVBQVU7QUFDckNsQyxTQUFPK0IsU0FBUCxDQUFpQkcsSUFBakIsSUFBeUIsWUFBbUI7QUFBQSx1Q0FBTlosSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBQzFDdkIsVUFBTW1DLElBQU4sRUFBWSxFQUFFWixVQUFGLEVBQVo7QUFDQSxTQUFLYSxJQUFMLGNBQVUsa0JBQVFELElBQVIsQ0FBVixTQUE0QlosSUFBNUI7QUFDQSxXQUFPLElBQVA7QUFDRCxHQUpEO0FBS0QsQ0FORDs7QUFRQTs7Ozs7O2tCQU1ldEIsTSIsImZpbGUiOiJjaGFuZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1ZydcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCBwaWNrIGZyb20gJ2xvZGFzaC9waWNrJ1xuaW1wb3J0IHsgTGlzdCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuaW1wb3J0IE1PREVMX1RZUEVTIGZyb20gJy4uL2NvbnN0YW50cy9tb2RlbC10eXBlcydcbmltcG9ydCBDaGFuZ2VzIGZyb20gJy4uL2NoYW5nZXMnXG5pbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4vb3BlcmF0aW9uJ1xuaW1wb3J0IGFwcGx5IGZyb20gJy4uL29wZXJhdGlvbnMvYXBwbHknXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOmNoYW5nZScpXG5cbi8qKlxuICogQ2hhbmdlLlxuICpcbiAqIEB0eXBlIHtDaGFuZ2V9XG4gKi9cblxuY2xhc3MgQ2hhbmdlIHtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgQ2hhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNDaGFuZ2UoYW55KSB7XG4gICAgcmV0dXJuICEhKGFueSAmJiBhbnlbTU9ERUxfVFlQRVMuQ0hBTkdFXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYENoYW5nZWAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICogICBAcHJvcGVydHkge1ZhbHVlfSB2YWx1ZVxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihhdHRycykge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGF0dHJzXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5vcGVyYXRpb25zID0gbmV3IExpc3QoKVxuICAgIHRoaXMuZmxhZ3MgPSB7XG4gICAgICBub3JtYWxpemU6IHRydWUsXG4gICAgICAuLi5waWNrKGF0dHJzLCBbJ21lcmdlJywgJ3NhdmUnLCAnbm9ybWFsaXplJ10pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9iamVjdC5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgb2JqZWN0KCkge1xuICAgIHJldHVybiAnY2hhbmdlJ1xuICB9XG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgbG9nZ2VyLmRlcHJlY2F0ZSgnc2xhdGVAMC4zMi4wJywgJ1RoZSBga2luZGAgcHJvcGVydHkgb2YgU2xhdGUgb2JqZWN0cyBoYXMgYmVlbiByZW5hbWVkIHRvIGBvYmplY3RgLicpXG4gICAgcmV0dXJuIHRoaXMub2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgYW4gYG9wZXJhdGlvbmAgdG8gdGhlIGN1cnJlbnQgdmFsdWUsIHNhdmluZyB0aGUgb3BlcmF0aW9uIHRvIHRoZVxuICAgKiBoaXN0b3J5IGlmIG5lZWRlZC5cbiAgICpcbiAgICogQHBhcmFtIHtPcGVyYXRpb258T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7Q2hhbmdlfVxuICAgKi9cblxuICBhcHBseU9wZXJhdGlvbihvcGVyYXRpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgb3BlcmF0aW9ucywgZmxhZ3MgfSA9IHRoaXNcbiAgICBsZXQgeyB2YWx1ZSB9ID0gdGhpc1xuICAgIGxldCB7IGhpc3RvcnkgfSA9IHZhbHVlXG5cbiAgICAvLyBBZGQgaW4gdGhlIGN1cnJlbnQgYHZhbHVlYCBpbiBjYXNlIHRoZSBvcGVyYXRpb24gd2FzIHNlcmlhbGl6ZWQuXG4gICAgaWYgKGlzUGxhaW5PYmplY3Qob3BlcmF0aW9uKSkge1xuICAgICAgb3BlcmF0aW9uID0geyAuLi5vcGVyYXRpb24sIHZhbHVlIH1cbiAgICB9XG5cbiAgICBvcGVyYXRpb24gPSBPcGVyYXRpb24uY3JlYXRlKG9wZXJhdGlvbilcblxuICAgIC8vIERlZmF1bHQgb3B0aW9ucyB0byB0aGUgY2hhbmdlLWxldmVsIGZsYWdzLCB0aGlzIGFsbG93cyBmb3Igc2V0dGluZ1xuICAgIC8vIHNwZWNpZmljIG9wdGlvbnMgZm9yIGFsbCBvZiB0aGUgb3BlcmF0aW9ucyBvZiBhIGdpdmVuIGNoYW5nZS5cbiAgICBvcHRpb25zID0geyAuLi5mbGFncywgLi4ub3B0aW9ucyB9XG5cbiAgICAvLyBEZXJpdmUgdGhlIGRlZmF1bHQgb3B0aW9uIHZhbHVlcy5cbiAgICBjb25zdCB7XG4gICAgICBtZXJnZSA9IG9wZXJhdGlvbnMuc2l6ZSA9PSAwID8gbnVsbCA6IHRydWUsXG4gICAgICBzYXZlID0gdHJ1ZSxcbiAgICAgIHNraXAgPSBudWxsLFxuICAgIH0gPSBvcHRpb25zXG5cbiAgICAvLyBBcHBseSB0aGUgb3BlcmF0aW9uIHRvIHRoZSB2YWx1ZS5cbiAgICBkZWJ1ZygnYXBwbHknLCB7IG9wZXJhdGlvbiwgc2F2ZSwgbWVyZ2UgfSlcbiAgICB2YWx1ZSA9IGFwcGx5KHZhbHVlLCBvcGVyYXRpb24pXG5cbiAgICAvLyBJZiBuZWVkZWQsIHNhdmUgdGhlIG9wZXJhdGlvbiB0byB0aGUgaGlzdG9yeS5cbiAgICBpZiAoaGlzdG9yeSAmJiBzYXZlKSB7XG4gICAgICBoaXN0b3J5ID0gaGlzdG9yeS5zYXZlKG9wZXJhdGlvbiwgeyBtZXJnZSwgc2tpcCB9KVxuICAgICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2hpc3RvcnknLCBoaXN0b3J5KVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgbXV0YWJsZSBjaGFuZ2Ugb2JqZWN0LlxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMub3BlcmF0aW9ucyA9IG9wZXJhdGlvbnMucHVzaChvcGVyYXRpb24pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhIHNlcmllcyBvZiBgb3BlcmF0aW9uc2AgdG8gdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl8TGlzdH0gb3BlcmF0aW9uc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtDaGFuZ2V9XG4gICAqL1xuXG4gIGFwcGx5T3BlcmF0aW9ucyhvcGVyYXRpb25zLCBvcHRpb25zKSB7XG4gICAgb3BlcmF0aW9ucy5mb3JFYWNoKG9wID0+IHRoaXMuYXBwbHlPcGVyYXRpb24ob3AsIG9wdGlvbnMpKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBhIGNoYW5nZSBgZm5gIHdpdGggYXJndW1lbnRzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAcGFyYW0ge01peGVkfSAuLi5hcmdzXG4gICAqIEByZXR1cm4ge0NoYW5nZX1cbiAgICovXG5cbiAgY2FsbChmbiwgLi4uYXJncykge1xuICAgIGZuKHRoaXMsIC4uLmFyZ3MpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGEgc2VyaWVzIG9mIGNoYW5nZSBtdXRhdGlvbnMgYW5kIGRlZmVycyBub3JtYWxpemF0aW9uIHVudGlsIHRoZSBlbmQuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGN1c3RvbUNoYW5nZSAtIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBhIGNoYW5nZSBvYmplY3QgYW5kIGV4ZWN1dGVzIGNoYW5nZSBvcGVyYXRpb25zXG4gICAqIEByZXR1cm4ge0NoYW5nZX1cbiAgICovXG5cbiAgd2l0aG91dE5vcm1hbGl6YXRpb24oY3VzdG9tQ2hhbmdlKSB7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSB0aGlzLmZsYWdzLm5vcm1hbGl6ZVxuICAgIHRoaXMuc2V0T3BlcmF0aW9uRmxhZygnbm9ybWFsaXplJywgZmFsc2UpXG4gICAgdHJ5IHtcbiAgICAgIGN1c3RvbUNoYW5nZSh0aGlzKVxuICAgICAgLy8gaWYgdGhlIGNoYW5nZSBmdW5jdGlvbiB3b3JrZWQgdGhlbiBydW4gbm9ybWFsaXphdGlvblxuICAgICAgdGhpcy5ub3JtYWxpemVEb2N1bWVudCgpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIHJlc3RvcmUgdGhlIGZsYWcgdG8gd2hhdGV2ZXIgaXQgd2FzXG4gICAgICB0aGlzLnNldE9wZXJhdGlvbkZsYWcoJ25vcm1hbGl6ZScsIG9yaWdpbmFsKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbiBvcGVyYXRpb24gZmxhZyBieSBga2V5YCB0byBgdmFsdWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7QW55fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtDaGFuZ2V9XG4gICAqL1xuXG4gIHNldE9wZXJhdGlvbkZsYWcoa2V5LCB2YWx1ZSkge1xuICAgIHRoaXMuZmxhZ3Nba2V5XSA9IHZhbHVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGB2YWx1ZWAgb2YgdGhlIHNwZWNpZmllZCBmbGFnIGJ5IGl0cyBga2V5YC4gT3B0aW9uYWxseSBhY2NlcHRzIGFuIGBvcHRpb25zYFxuICAgKiBvYmplY3Qgd2l0aCBvdmVycmlkZSBmbGFncy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtDaGFuZ2V9XG4gICAqL1xuXG4gIGdldEZsYWcoa2V5LCBvcHRpb25zID0ge30pIHtcbiAgICByZXR1cm4gb3B0aW9uc1trZXldICE9PSB1bmRlZmluZWQgP1xuICAgICAgb3B0aW9uc1trZXldIDpcbiAgICAgIHRoaXMuZmxhZ3Nba2V5XVxuICB9XG5cbiAgLyoqXG4gICAqIFVuc2V0IGFuIG9wZXJhdGlvbiBmbGFnIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0NoYW5nZX1cbiAgICovXG5cbiAgdW5zZXRPcGVyYXRpb25GbGFnKGtleSkge1xuICAgIGRlbGV0ZSB0aGlzLmZsYWdzW2tleV1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBwc2V1ZG8tc3ltYm9sIGZvciB0eXBlIGNoZWNraW5nLlxuICovXG5cbkNoYW5nZS5wcm90b3R5cGVbTU9ERUxfVFlQRVMuQ0hBTkdFXSA9IHRydWVcblxuLyoqXG4gKiBBZGQgYSBjaGFuZ2UgbWV0aG9kIGZvciBlYWNoIG9mIHRoZSBjaGFuZ2VzLlxuICovXG5cbk9iamVjdC5rZXlzKENoYW5nZXMpLmZvckVhY2goKHR5cGUpID0+IHtcbiAgQ2hhbmdlLnByb3RvdHlwZVt0eXBlXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgZGVidWcodHlwZSwgeyBhcmdzIH0pXG4gICAgdGhpcy5jYWxsKENoYW5nZXNbdHlwZV0sIC4uLmFyZ3MpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0NoYW5nZX1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBDaGFuZ2VcbiJdfQ==