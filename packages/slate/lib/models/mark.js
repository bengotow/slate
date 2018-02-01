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

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

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
  data: new _immutable.Map(),
  type: undefined
};

/**
 * Mark.
 *
 * @type {Mark}
 */

var Mark = function (_Record) {
  _inherits(Mark, _Record);

  function Mark() {
    _classCallCheck(this, Mark);

    return _possibleConstructorReturn(this, (Mark.__proto__ || Object.getPrototypeOf(Mark)).apply(this, arguments));
  }

  _createClass(Mark, [{
    key: 'getComponent',


    /**
     * Get the component for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Component|Void}
     */

    value: function getComponent(schema) {
      return schema.__getComponent(this);
    }

    /**
     * Return a JSON representation of the mark.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        type: this.type,
        data: this.data.toJSON()
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     */

    get: function get() {
      return 'mark';
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
     * Create a new `Mark` with `attrs`.
     *
     * @param {Object|Mark} attrs
     * @return {Mark}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Mark.isMark(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Mark.fromJSON(attrs);
      }

      throw new Error('`Mark.create` only accepts objects, strings or marks, but you passed it: ' + attrs);
    }

    /**
     * Create a set of marks.
     *
     * @param {Array<Object|Mark>} elements
     * @return {Set<Mark>}
     */

  }, {
    key: 'createSet',
    value: function createSet(elements) {
      if (_immutable.Set.isSet(elements) || Array.isArray(elements)) {
        var marks = new _immutable.Set(elements.map(Mark.create));
        return marks;
      }

      if (elements == null) {
        return new _immutable.Set();
      }

      throw new Error('`Mark.createSet` only accepts sets, arrays or null, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable mark properties from `attrs`.
     *
     * @param {Object|String|Mark} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Mark.isMark(attrs)) {
        return {
          data: attrs.data,
          type: attrs.type
        };
      }

      if (typeof attrs == 'string') {
        return { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var props = {};
        if ('type' in attrs) props.type = attrs.type;
        if ('data' in attrs) props.data = _data2.default.create(attrs.data);
        return props;
      }

      throw new Error('`Mark.createProperties` only accepts objects, strings or marks, but you passed it: ' + attrs);
    }

    /**
     * Create a `Mark` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Mark}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          type = object.type;


      if (typeof type != 'string') {
        throw new Error('`Mark.fromJS` requires a `type` string.');
      }

      var mark = new Mark({
        type: type,
        data: new _immutable.Map(data)
      });

      return mark;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isMark',


    /**
     * Check if `any` is a `Mark`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isMark(any) {
      return !!(any && any[_modelTypes2.default.MARK]);
    }

    /**
     * Check if `any` is a set of marks.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isMarkSet',
    value: function isMarkSet(any) {
      return _immutable.Set.isSet(any) && any.every(function (item) {
        return Mark.isMark(item);
      });
    }
  }]);

  return Mark;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Mark.fromJS = Mark.fromJSON;
Mark.prototype[_modelTypes2.default.MARK] = true;

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Mark.prototype, ['getComponent'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Mark}
 */

exports.default = Mark;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvbWFyay5qcyJdLCJuYW1lcyI6WyJERUZBVUxUUyIsImRhdGEiLCJ0eXBlIiwidW5kZWZpbmVkIiwiTWFyayIsInNjaGVtYSIsIl9fZ2V0Q29tcG9uZW50Iiwib2JqZWN0IiwidG9KU09OIiwiZGVwcmVjYXRlIiwiYXR0cnMiLCJpc01hcmsiLCJmcm9tSlNPTiIsIkVycm9yIiwiZWxlbWVudHMiLCJpc1NldCIsIkFycmF5IiwiaXNBcnJheSIsIm1hcmtzIiwibWFwIiwiY3JlYXRlIiwicHJvcHMiLCJtYXJrIiwiYW55IiwiTUFSSyIsImV2ZXJ5IiwiaXRlbSIsImZyb21KUyIsInByb3RvdHlwZSIsInRha2VzQXJndW1lbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxXQUFXO0FBQ2ZDLFFBQU0sb0JBRFM7QUFFZkMsUUFBTUM7QUFGUyxDQUFqQjs7QUFLQTs7Ozs7O0lBTU1DLEk7Ozs7Ozs7Ozs7Ozs7QUE0SUo7Ozs7Ozs7aUNBT2FDLE0sRUFBUTtBQUNuQixhQUFPQSxPQUFPQyxjQUFQLENBQXNCLElBQXRCLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7NkJBTVM7QUFDUCxVQUFNQyxTQUFTO0FBQ2JBLGdCQUFRLEtBQUtBLE1BREE7QUFFYkwsY0FBTSxLQUFLQSxJQUZFO0FBR2JELGNBQU0sS0FBS0EsSUFBTCxDQUFVTyxNQUFWO0FBSE8sT0FBZjs7QUFNQSxhQUFPRCxNQUFQO0FBQ0Q7O0FBRUQ7Ozs7OzsyQkFJTztBQUNMLGFBQU8sS0FBS0MsTUFBTCxFQUFQO0FBQ0Q7Ozs7O0FBOUNEOzs7O3dCQUlhO0FBQ1gsYUFBTyxNQUFQO0FBQ0Q7Ozt3QkFFVTtBQUNULCtCQUFPQyxTQUFQLENBQWlCLGNBQWpCLEVBQWlDLG9FQUFqQztBQUNBLGFBQU8sS0FBS0YsTUFBWjtBQUNEOzs7OztBQXhJRDs7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OztBQUlBLHVCQUFRcEIsS0FBS3dCLFNBQWIsRUFBd0IsQ0FDdEIsY0FEc0IsQ0FBeEIsRUFFRztBQUNEQyxrQkFBZ0I7QUFEZixDQUZIOztBQU1BOzs7Ozs7a0JBTWV6QixJIiwiZmlsZSI6Im1hcmsuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IE1hcCwgUmVjb3JkLCBTZXQgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5pbXBvcnQgRGF0YSBmcm9tICcuL2RhdGEnXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi91dGlscy9tZW1vaXplJ1xuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICBkYXRhOiBuZXcgTWFwKCksXG4gIHR5cGU6IHVuZGVmaW5lZCxcbn1cblxuLyoqXG4gKiBNYXJrLlxuICpcbiAqIEB0eXBlIHtNYXJrfVxuICovXG5cbmNsYXNzIE1hcmsgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBNYXJrYCB3aXRoIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fE1hcmt9IGF0dHJzXG4gICAqIEByZXR1cm4ge01hcmt9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGlmIChNYXJrLmlzTWFyayhhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXR0cnMgPT0gJ3N0cmluZycpIHtcbiAgICAgIGF0dHJzID0geyB0eXBlOiBhdHRycyB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gTWFyay5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYE1hcmsuY3JlYXRlXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzLCBzdHJpbmdzIG9yIG1hcmtzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHNldCBvZiBtYXJrcy5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxPYmplY3R8TWFyaz59IGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge1NldDxNYXJrPn1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZVNldChlbGVtZW50cykge1xuICAgIGlmIChTZXQuaXNTZXQoZWxlbWVudHMpIHx8IEFycmF5LmlzQXJyYXkoZWxlbWVudHMpKSB7XG4gICAgICBjb25zdCBtYXJrcyA9IG5ldyBTZXQoZWxlbWVudHMubWFwKE1hcmsuY3JlYXRlKSlcbiAgICAgIHJldHVybiBtYXJrc1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50cyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3IFNldCgpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBNYXJrLmNyZWF0ZVNldFxcYCBvbmx5IGFjY2VwdHMgc2V0cywgYXJyYXlzIG9yIG51bGwsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2VsZW1lbnRzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgZGljdGlvbmFyeSBvZiBzZXR0YWJsZSBtYXJrIHByb3BlcnRpZXMgZnJvbSBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd8TWFya30gYXR0cnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcyhhdHRycyA9IHt9KSB7XG4gICAgaWYgKE1hcmsuaXNNYXJrKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogYXR0cnMuZGF0YSxcbiAgICAgICAgdHlwZTogYXR0cnMudHlwZSxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGF0dHJzID09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBhdHRycyB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHt9XG4gICAgICBpZiAoJ3R5cGUnIGluIGF0dHJzKSBwcm9wcy50eXBlID0gYXR0cnMudHlwZVxuICAgICAgaWYgKCdkYXRhJyBpbiBhdHRycykgcHJvcHMuZGF0YSA9IERhdGEuY3JlYXRlKGF0dHJzLmRhdGEpXG4gICAgICByZXR1cm4gcHJvcHNcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYE1hcmsuY3JlYXRlUHJvcGVydGllc1xcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cywgc3RyaW5ncyBvciBtYXJrcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgTWFya2AgZnJvbSBhIEpTT04gYG9iamVjdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHJldHVybiB7TWFya31cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGRhdGEgPSB7fSxcbiAgICAgIHR5cGUsXG4gICAgfSA9IG9iamVjdFxuXG4gICAgaWYgKHR5cGVvZiB0eXBlICE9ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BNYXJrLmZyb21KU2AgcmVxdWlyZXMgYSBgdHlwZWAgc3RyaW5nLicpXG4gICAgfVxuXG4gICAgY29uc3QgbWFyayA9IG5ldyBNYXJrKHtcbiAgICAgIHR5cGUsXG4gICAgICBkYXRhOiBuZXcgTWFwKGRhdGEpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gbWFya1xuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGBmcm9tSlNgLlxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTID0gTWFyay5mcm9tSlNPTlxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGBNYXJrYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNNYXJrKGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLk1BUktdKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgc2V0IG9mIG1hcmtzLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc01hcmtTZXQoYW55KSB7XG4gICAgcmV0dXJuIFNldC5pc1NldChhbnkpICYmIGFueS5ldmVyeShpdGVtID0+IE1hcmsuaXNNYXJrKGl0ZW0pKVxuICB9XG5cbiAgLyoqXG4gICAqIE9iamVjdC5cbiAgICovXG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gJ21hcmsnXG4gIH1cblxuICBnZXQga2luZCgpIHtcbiAgICBsb2dnZXIuZGVwcmVjYXRlKCdzbGF0ZUAwLjMyLjAnLCAnVGhlIGBraW5kYCBwcm9wZXJ0eSBvZiBTbGF0ZSBvYmplY3RzIGhhcyBiZWVuIHJlbmFtZWQgdG8gYG9iamVjdGAuJylcbiAgICByZXR1cm4gdGhpcy5vYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvbXBvbmVudCBmb3IgdGhlIG5vZGUgZnJvbSBhIGBzY2hlbWFgLlxuICAgKlxuICAgKiBAcGFyYW0ge1NjaGVtYX0gc2NoZW1hXG4gICAqIEByZXR1cm4ge0NvbXBvbmVudHxWb2lkfVxuICAgKi9cblxuICBnZXRDb21wb25lbnQoc2NoZW1hKSB7XG4gICAgcmV0dXJuIHNjaGVtYS5fX2dldENvbXBvbmVudCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hcmsuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgdG9KU09OKCkge1xuICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgIG9iamVjdDogdGhpcy5vYmplY3QsXG4gICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICBkYXRhOiB0aGlzLmRhdGEudG9KU09OKCksXG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGB0b0pTYC5cbiAgICovXG5cbiAgdG9KUygpIHtcbiAgICByZXR1cm4gdGhpcy50b0pTT04oKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBwc2V1ZG8tc3ltYm9sIGZvciB0eXBlIGNoZWNraW5nLlxuICovXG5cbk1hcmsucHJvdG90eXBlW01PREVMX1RZUEVTLk1BUktdID0gdHJ1ZVxuXG4vKipcbiAqIE1lbW9pemUgcmVhZCBtZXRob2RzLlxuICovXG5cbm1lbW9pemUoTWFyay5wcm90b3R5cGUsIFtcbiAgJ2dldENvbXBvbmVudCcsXG5dLCB7XG4gIHRha2VzQXJndW1lbnRzOiB0cnVlLFxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge01hcmt9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgTWFya1xuIl19