'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:history');

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  redos: new _immutable.Stack(),
  undos: new _immutable.Stack()
};

/**
 * History.
 *
 * @type {History}
 */

var History = function (_Record) {
  _inherits(History, _Record);

  function History() {
    _classCallCheck(this, History);

    return _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).apply(this, arguments));
  }

  _createClass(History, [{
    key: 'save',


    /**
     * Save an `operation` into the history.
     *
     * @param {Object} operation
     * @param {Object} options
     * @return {History}
     */

    value: function save(operation) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var history = this;
      var _history = history,
          undos = _history.undos,
          redos = _history.redos;
      var merge = options.merge,
          skip = options.skip;

      var prevBatch = undos.peek();
      var prevOperation = prevBatch && prevBatch.last();

      operation = operation.toJSON();

      if (skip == null) {
        skip = shouldSkip(operation, prevOperation);
      }

      if (skip) {
        return history;
      }

      if (merge == null) {
        merge = shouldMerge(operation, prevOperation);
      }

      debug('save', { operation: operation, merge: merge });

      // If the `merge` flag is true, add the operation to the previous batch.
      if (merge && prevBatch) {
        var batch = prevBatch.push(operation);
        undos = undos.pop();
        undos = undos.push(batch);
      }

      // Otherwise, create a new batch with the operation.
      else {
          var _batch = new _immutable.List([operation]);
          undos = undos.push(_batch);
        }

      // Constrain the history to 100 entries for memory's sake.
      if (undos.size > 100) {
        undos = undos.take(100);
      }

      // Clear the redos and update the history.
      redos = redos.clear();
      history = history.set('undos', undos).set('redos', redos);
      return history;
    }

    /**
     * Return a JSON representation of the history.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        redos: this.redos.toJSON(),
        undos: this.undos.toJSON()
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
     *
     * @return {String}
     */

    get: function get() {
      return 'history';
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
     * Create a new `History` with `attrs`.
     *
     * @param {Object|History} attrs
     * @return {History}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (History.isHistory(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return History.fromJSON(attrs);
      }

      throw new Error('`History.create` only accepts objects or histories, but you passed it: ' + attrs);
    }

    /**
     * Create a `History` from a JSON `object`.
     *
     * @param {Object} object
     * @return {History}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$redos = object.redos,
          redos = _object$redos === undefined ? [] : _object$redos,
          _object$undos = object.undos,
          undos = _object$undos === undefined ? [] : _object$undos;


      var history = new History({
        redos: new _immutable.Stack(redos),
        undos: new _immutable.Stack(undos)
      });

      return history;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isHistory',


    /**
     * Check if `any` is a `History`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isHistory(any) {
      return !!(any && any[_modelTypes2.default.HISTORY]);
    }
  }]);

  return History;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

History.fromJS = History.fromJSON;
History.prototype[_modelTypes2.default.HISTORY] = true;

/**
 * Check whether to merge a new operation `o` into the previous operation `p`.
 *
 * @param {Object} o
 * @param {Object} p
 * @return {Boolean}
 */

function shouldMerge(o, p) {
  if (!p) return false;

  var merge = o.type == 'set_selection' && p.type == 'set_selection' || o.type == 'insert_text' && p.type == 'insert_text' && o.offset == p.offset + p.text.length && (0, _isEqual2.default)(o.path, p.path) || o.type == 'remove_text' && p.type == 'remove_text' && o.offset + o.text.length == p.offset && (0, _isEqual2.default)(o.path, p.path);

  return merge;
}

/**
 * Check whether to skip a new operation `o`, given previous operation `p`.
 *
 * @param {Object} o
 * @param {Object} p
 * @return {Boolean}
 */

function shouldSkip(o, p) {
  if (!p) return false;

  var skip = o.type == 'set_selection' && p.type == 'set_selection';

  return skip;
}

/**
 * Export.
 *
 * @type {History}
 */

exports.default = History;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvaGlzdG9yeS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsIkRFRkFVTFRTIiwicmVkb3MiLCJ1bmRvcyIsIkhpc3RvcnkiLCJvcGVyYXRpb24iLCJvcHRpb25zIiwiaGlzdG9yeSIsIm1lcmdlIiwic2tpcCIsInByZXZCYXRjaCIsInBlZWsiLCJwcmV2T3BlcmF0aW9uIiwibGFzdCIsInRvSlNPTiIsInNob3VsZFNraXAiLCJzaG91bGRNZXJnZSIsImJhdGNoIiwicHVzaCIsInBvcCIsInNpemUiLCJ0YWtlIiwiY2xlYXIiLCJzZXQiLCJvYmplY3QiLCJkZXByZWNhdGUiLCJhdHRycyIsImlzSGlzdG9yeSIsImZyb21KU09OIiwiRXJyb3IiLCJhbnkiLCJISVNUT1JZIiwiZnJvbUpTIiwicHJvdG90eXBlIiwibyIsInAiLCJ0eXBlIiwib2Zmc2V0IiwidGV4dCIsImxlbmd0aCIsInBhdGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFFBQVEscUJBQU0sZUFBTixDQUFkOztBQUVBOzs7Ozs7QUFNQSxJQUFNQyxXQUFXO0FBQ2ZDLFNBQU8sc0JBRFE7QUFFZkMsU0FBTztBQUZRLENBQWpCOztBQUtBOzs7Ozs7SUFNTUMsTzs7Ozs7Ozs7Ozs7OztBQTBFSjs7Ozs7Ozs7eUJBUUtDLFMsRUFBeUI7QUFBQSxVQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQzVCLFVBQUlDLFVBQVUsSUFBZDtBQUQ0QixxQkFFTEEsT0FGSztBQUFBLFVBRXRCSixLQUZzQixZQUV0QkEsS0FGc0I7QUFBQSxVQUVmRCxLQUZlLFlBRWZBLEtBRmU7QUFBQSxVQUd0Qk0sS0FIc0IsR0FHTkYsT0FITSxDQUd0QkUsS0FIc0I7QUFBQSxVQUdmQyxJQUhlLEdBR05ILE9BSE0sQ0FHZkcsSUFIZTs7QUFJNUIsVUFBTUMsWUFBWVAsTUFBTVEs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ZnJvbSAnZGVidWcnXG5pbXBvcnQgaXNFcXVhbCBmcm9tICdsb2Rhc2gvaXNFcXVhbCdcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IExpc3QsIFJlY29yZCwgU3RhY2sgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOmhpc3RvcnknKVxuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICByZWRvczogbmV3IFN0YWNrKCksXG4gIHVuZG9zOiBuZXcgU3RhY2soKSxcbn1cblxuLyoqXG4gKiBIaXN0b3J5LlxuICpcbiAqIEB0eXBlIHtIaXN0b3J5fVxuICovXG5cbmNsYXNzIEhpc3RvcnkgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBIaXN0b3J5YCB3aXRoIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fEhpc3Rvcnl9IGF0dHJzXG4gICAqIEByZXR1cm4ge0hpc3Rvcnl9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGlmIChIaXN0b3J5LmlzSGlzdG9yeShhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgcmV0dXJuIEhpc3RvcnkuZnJvbUpTT04oYXR0cnMpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBIaXN0b3J5LmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cyBvciBoaXN0b3JpZXMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYEhpc3RvcnlgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge0hpc3Rvcnl9XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTihvYmplY3QpIHtcbiAgICBjb25zdCB7XG4gICAgICByZWRvcyA9IFtdLFxuICAgICAgdW5kb3MgPSBbXSxcbiAgICB9ID0gb2JqZWN0XG5cbiAgICBjb25zdCBoaXN0b3J5ID0gbmV3IEhpc3Rvcnkoe1xuICAgICAgcmVkb3M6IG5ldyBTdGFjayhyZWRvcyksXG4gICAgICB1bmRvczogbmV3IFN0YWNrKHVuZG9zKSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGhpc3RvcnlcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IEhpc3RvcnkuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgSGlzdG9yeWAuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzSGlzdG9yeShhbnkpIHtcbiAgICByZXR1cm4gISEoYW55ICYmIGFueVtNT0RFTF9UWVBFUy5ISVNUT1JZXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPYmplY3QuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gJ2hpc3RvcnknXG4gIH1cblxuICBnZXQga2luZCgpIHtcbiAgICBsb2dnZXIuZGVwcmVjYXRlKCdzbGF0ZUAwLjMyLjAnLCAnVGhlIGBraW5kYCBwcm9wZXJ0eSBvZiBTbGF0ZSBvYmplY3RzIGhhcyBiZWVuIHJlbmFtZWQgdG8gYG9iamVjdGAuJylcbiAgICByZXR1cm4gdGhpcy5vYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGFuIGBvcGVyYXRpb25gIGludG8gdGhlIGhpc3RvcnkuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7SGlzdG9yeX1cbiAgICovXG5cbiAgc2F2ZShvcGVyYXRpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBoaXN0b3J5ID0gdGhpc1xuICAgIGxldCB7IHVuZG9zLCByZWRvcyB9ID0gaGlzdG9yeVxuICAgIGxldCB7IG1lcmdlLCBza2lwIH0gPSBvcHRpb25zXG4gICAgY29uc3QgcHJldkJhdGNoID0gdW5kb3MucGVlaygpXG4gICAgY29uc3QgcHJldk9wZXJhdGlvbiA9IHByZXZCYXRjaCAmJiBwcmV2QmF0Y2gubGFzdCgpXG5cbiAgICBvcGVyYXRpb24gPSBvcGVyYXRpb24udG9KU09OKClcblxuICAgIGlmIChza2lwID09IG51bGwpIHtcbiAgICAgIHNraXAgPSBzaG91bGRTa2lwKG9wZXJhdGlvbiwgcHJldk9wZXJhdGlvbilcbiAgICB9XG5cbiAgICBpZiAoc2tpcCkge1xuICAgICAgcmV0dXJuIGhpc3RvcnlcbiAgICB9XG5cbiAgICBpZiAobWVyZ2UgPT0gbnVsbCkge1xuICAgICAgbWVyZ2UgPSBzaG91bGRNZXJnZShvcGVyYXRpb24sIHByZXZPcGVyYXRpb24pXG4gICAgfVxuXG4gICAgZGVidWcoJ3NhdmUnLCB7IG9wZXJhdGlvbiwgbWVyZ2UgfSlcblxuICAgIC8vIElmIHRoZSBgbWVyZ2VgIGZsYWcgaXMgdHJ1ZSwgYWRkIHRoZSBvcGVyYXRpb24gdG8gdGhlIHByZXZpb3VzIGJhdGNoLlxuICAgIGlmIChtZXJnZSAmJiBwcmV2QmF0Y2gpIHtcbiAgICAgIGNvbnN0IGJhdGNoID0gcHJldkJhdGNoLnB1c2gob3BlcmF0aW9uKVxuICAgICAgdW5kb3MgPSB1bmRvcy5wb3AoKVxuICAgICAgdW5kb3MgPSB1bmRvcy5wdXNoKGJhdGNoKVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgY3JlYXRlIGEgbmV3IGJhdGNoIHdpdGggdGhlIG9wZXJhdGlvbi5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGJhdGNoID0gbmV3IExpc3QoW29wZXJhdGlvbl0pXG4gICAgICB1bmRvcyA9IHVuZG9zLnB1c2goYmF0Y2gpXG4gICAgfVxuXG4gICAgLy8gQ29uc3RyYWluIHRoZSBoaXN0b3J5IHRvIDEwMCBlbnRyaWVzIGZvciBtZW1vcnkncyBzYWtlLlxuICAgIGlmICh1bmRvcy5zaXplID4gMTAwKSB7XG4gICAgICB1bmRvcyA9IHVuZG9zLnRha2UoMTAwKVxuICAgIH1cblxuICAgIC8vIENsZWFyIHRoZSByZWRvcyBhbmQgdXBkYXRlIHRoZSBoaXN0b3J5LlxuICAgIHJlZG9zID0gcmVkb3MuY2xlYXIoKVxuICAgIGhpc3RvcnkgPSBoaXN0b3J5LnNldCgndW5kb3MnLCB1bmRvcykuc2V0KCdyZWRvcycsIHJlZG9zKVxuICAgIHJldHVybiBoaXN0b3J5XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgaGlzdG9yeS5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04oKSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAgb2JqZWN0OiB0aGlzLm9iamVjdCxcbiAgICAgIHJlZG9zOiB0aGlzLnJlZG9zLnRvSlNPTigpLFxuICAgICAgdW5kb3M6IHRoaXMudW5kb3MudG9KU09OKCksXG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGB0b0pTYC5cbiAgICovXG5cbiAgdG9KUygpIHtcbiAgICByZXR1cm4gdGhpcy50b0pTT04oKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBwc2V1ZG8tc3ltYm9sIGZvciB0eXBlIGNoZWNraW5nLlxuICovXG5cbkhpc3RvcnkucHJvdG90eXBlW01PREVMX1RZUEVTLkhJU1RPUlldID0gdHJ1ZVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdG8gbWVyZ2UgYSBuZXcgb3BlcmF0aW9uIGBvYCBpbnRvIHRoZSBwcmV2aW91cyBvcGVyYXRpb24gYHBgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvXG4gKiBAcGFyYW0ge09iamVjdH0gcFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBzaG91bGRNZXJnZShvLCBwKSB7XG4gIGlmICghcCkgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgbWVyZ2UgPSAoXG4gICAgKFxuICAgICAgby50eXBlID09ICdzZXRfc2VsZWN0aW9uJyAmJlxuICAgICAgcC50eXBlID09ICdzZXRfc2VsZWN0aW9uJ1xuICAgICkgfHwgKFxuICAgICAgby50eXBlID09ICdpbnNlcnRfdGV4dCcgJiZcbiAgICAgIHAudHlwZSA9PSAnaW5zZXJ0X3RleHQnICYmXG4gICAgICBvLm9mZnNldCA9PSBwLm9mZnNldCArIHAudGV4dC5sZW5ndGggJiZcbiAgICAgIGlzRXF1YWwoby5wYXRoLCBwLnBhdGgpXG4gICAgKSB8fCAoXG4gICAgICBvLnR5cGUgPT0gJ3JlbW92ZV90ZXh0JyAmJlxuICAgICAgcC50eXBlID09ICdyZW1vdmVfdGV4dCcgJiZcbiAgICAgIG8ub2Zmc2V0ICsgby50ZXh0Lmxlbmd0aCA9PSBwLm9mZnNldCAmJlxuICAgICAgaXNFcXVhbChvLnBhdGgsIHAucGF0aClcbiAgICApXG4gIClcblxuICByZXR1cm4gbWVyZ2Vcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRvIHNraXAgYSBuZXcgb3BlcmF0aW9uIGBvYCwgZ2l2ZW4gcHJldmlvdXMgb3BlcmF0aW9uIGBwYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb1xuICogQHBhcmFtIHtPYmplY3R9IHBcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gc2hvdWxkU2tpcChvLCBwKSB7XG4gIGlmICghcCkgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3Qgc2tpcCA9IChcbiAgICBvLnR5cGUgPT0gJ3NldF9zZWxlY3Rpb24nICYmXG4gICAgcC50eXBlID09ICdzZXRfc2VsZWN0aW9uJ1xuICApXG5cbiAgcmV0dXJuIHNraXBcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0hpc3Rvcnl9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeVxuIl19