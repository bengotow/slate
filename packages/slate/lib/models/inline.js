'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./document');

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _immutable = require('immutable');

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  isVoid: false,
  key: undefined,
  nodes: new _immutable.List(),
  type: undefined
};

/**
 * Inline.
 *
 * @type {Inline}
 */

var Inline = function (_Record) {
  _inherits(Inline, _Record);

  function Inline() {
    _classCallCheck(this, Inline);

    return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
  }

  _createClass(Inline, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the inline.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
        type: this.type,
        isVoid: this.isVoid,
        data: this.data.toJSON(),
        nodes: this.nodes.toArray().map(function (n) {
          return n.toJSON(options);
        })
      };

      if (options.preserveKeys) {
        object.key = this.key;
      }

      return object;
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
      return 'inline';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check if the inline is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of all the inline's children.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Inline` with `attrs`.
     *
     * @param {Object|String|Inline} attrs
     * @return {Inline}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Inline.isInline(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Inline.fromJSON(attrs);
      }

      throw new Error('`Inline.create` only accepts objects, strings or inlines, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Inlines` from an array.
     *
     * @param {Array<Inline|Object>|List<Inline|Object>} elements
     * @return {List<Inline>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Inline.create));
        return list;
      }

      throw new Error('`Inline.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Inline` from a JSON `object`.
     *
     * @param {Object|Inline} object
     * @return {Inline}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Inline.isInline(object)) {
        return object;
      }

      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          _object$isVoid = object.isVoid,
          isVoid = _object$isVoid === undefined ? false : _object$isVoid,
          _object$key = object.key,
          key = _object$key === undefined ? (0, _generateKey2.default)() : _object$key,
          _object$nodes = object.nodes,
          nodes = _object$nodes === undefined ? [] : _object$nodes,
          type = object.type;


      if (typeof type != 'string') {
        throw new Error('`Inline.fromJS` requires a `type` string.');
      }

      var inline = new Inline({
        key: key,
        type: type,
        isVoid: !!isVoid,
        data: new _immutable.Map(data),
        nodes: new _immutable.List(nodes.map(_node2.default.fromJSON))
      });

      return inline;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isInline',


    /**
     * Check if `any` is a `Inline`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isInline(any) {
      return !!(any && any[_modelTypes2.default.INLINE]);
    }

    /**
     * Check if `any` is a list of inlines.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isInlineList',
    value: function isInlineList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Inline.isInline(item);
      });
    }
  }]);

  return Inline;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Inline.fromJS = Inline.fromJSON;
Inline.prototype[_modelTypes2.default.INLINE] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Inline.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Inline}
 */

exports.default = Inline;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvaW5saW5lLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRTIiwiZGF0YSIsImlzVm9pZCIsImtleSIsInVuZGVmaW5lZCIsIm5vZGVzIiwidHlwZSIsIklubGluZSIsIm9wdGlvbnMiLCJvYmplY3QiLCJ0b0pTT04iLCJ0b0FycmF5IiwibWFwIiwibiIsInByZXNlcnZlS2V5cyIsImRlcHJlY2F0ZSIsInRleHQiLCJnZXRUZXh0IiwiYXR0cnMiLCJpc0lubGluZSIsImZyb21KU09OIiwiRXJyb3IiLCJlbGVtZW50cyIsImlzTGlzdCIsIkFycmF5IiwiaXNBcnJheSIsImxpc3QiLCJjcmVhdGUiLCJpbmxpbmUiLCJhbnkiLCJJTkxJTkUiLCJldmVyeSIsIml0ZW0iLCJmcm9tSlMiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZm9yRWFjaCIsIm1ldGhvZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFLQTs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7OztBQWhCQTs7OztBQU1BOzs7O0FBWUE7Ozs7OztBQU1BLElBQU1BLFdBQVc7QUFDZkMsUUFBTSxvQkFEUztBQUVmQyxVQUFRLEtBRk87QUFHZkMsT0FBS0MsU0FIVTtBQUlmQyxTQUFPLHFCQUpRO0FBS2ZDLFFBQU1GO0FBTFMsQ0FBakI7O0FBUUE7Ozs7OztJQU1NRyxNOzs7Ozs7Ozs7Ozs7O0FBMklKOzs7Ozs7OzZCQU9xQjtBQUFBLFVBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFDbkIsVUFBTUMsU0FBUztBQUNiQSxnQkFBUSxLQUFLQSxNQURBO0FBRWJILGNBQU0sS0FBS0EsSUFGRTtBQUdiSixnQkFBUSxLQUFLQSxNQUhBO0FBSWJELGNBQU0sS0FBS0EsSUFBTCxDQUFVUyxNQUFWLEVBSk87QUFLYkwsZUFBTyxLQUFLQSxLQUFMLENBQVdNLE9BQVgsR0FBcUJDLEdBQXJCLENBQXlCO0FBQUEsaUJB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RUQ7Ozs7Ozs7OztpQ0FPb0JELEcsRUFBSztBQUN2QixhQUFPLGdCQUFLTixNQUFMLENBQVlNLEdBQVosS0FBb0JBLElBQUlFLEtBQUosQ0FBVTtBQUFBLGVBQVF4QixPQUFPWSxRQUFQLENBQWdCYSxJQUFoQixDQUFSO0FBQUEsT0FBVixDQUEzQjtBQUNEOzs7O0VBdEdrQix1QkFBT2hDLFFBQVAsQzs7QUE0S3JCOzs7O0FBNUtNTyxNLENBZ0ZHMEIsTSxHQUFTMUIsT0FBT2EsUTtBQWdHekJiLE9BQU8yQixTQUFQLENBQWlCLHFCQUFZSixNQUE3QixJQUF1QyxJQUF2Qzs7QUFFQTs7OztBQUlBSyxPQUFPQyxtQkFBUCxDQUEyQixlQUFLRixTQUFoQyxFQUEyQ0csT0FBM0MsQ0FBbUQsVUFBQ0MsTUFBRCxFQUFZO0FBQzdELE1BQUlBLFVBQVUsYUFBZCxFQUE2QjtBQUM3Qi9CLFNBQU8yQixTQUFQLENBQWlCSSxNQUFqQixJQUEyQixlQUFLSixTQUFMLENBQWVJLE1BQWYsQ0FBM0I7QUFDRCxDQUhEOztBQUtBOzs7Ozs7a0JBTWUvQixNIiwiZmlsZSI6ImlubGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBQcmV2ZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAqL1xuXG5pbXBvcnQgJy4vZG9jdW1lbnQnXG5cbi8qKlxuICogRGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IExpc3QsIE1hcCwgUmVjb3JkIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgTm9kZSBmcm9tICcuL25vZGUnXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IGdlbmVyYXRlS2V5IGZyb20gJy4uL3V0aWxzL2dlbmVyYXRlLWtleSdcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgZGF0YTogbmV3IE1hcCgpLFxuICBpc1ZvaWQ6IGZhbHNlLFxuICBrZXk6IHVuZGVmaW5lZCxcbiAgbm9kZXM6IG5ldyBMaXN0KCksXG4gIHR5cGU6IHVuZGVmaW5lZCxcbn1cblxuLyoqXG4gKiBJbmxpbmUuXG4gKlxuICogQHR5cGUge0lubGluZX1cbiAqL1xuXG5jbGFzcyBJbmxpbmUgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBJbmxpbmVgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfElubGluZX0gYXR0cnNcbiAgICogQHJldHVybiB7SW5saW5lfVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlKGF0dHJzID0ge30pIHtcbiAgICBpZiAoSW5saW5lLmlzSW5saW5lKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhdHRycyA9PSAnc3RyaW5nJykge1xuICAgICAgYXR0cnMgPSB7IHR5cGU6IGF0dHJzIH1cbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhdHRycykpIHtcbiAgICAgIHJldHVybiBJbmxpbmUuZnJvbUpTT04oYXR0cnMpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBJbmxpbmUuY3JlYXRlXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzLCBzdHJpbmdzIG9yIGlubGluZXMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbGlzdCBvZiBgSW5saW5lc2AgZnJvbSBhbiBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxJbmxpbmV8T2JqZWN0PnxMaXN0PElubGluZXxPYmplY3Q+fSBlbGVtZW50c1xuICAgKiBAcmV0dXJuIHtMaXN0PElubGluZT59XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGVMaXN0KGVsZW1lbnRzID0gW10pIHtcbiAgICBpZiAoTGlzdC5pc0xpc3QoZWxlbWVudHMpIHx8IEFycmF5LmlzQXJyYXkoZWxlbWVudHMpKSB7XG4gICAgICBjb25zdCBsaXN0ID0gbmV3IExpc3QoZWxlbWVudHMubWFwKElubGluZS5jcmVhdGUpKVxuICAgICAgcmV0dXJuIGxpc3RcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYElubGluZS5jcmVhdGVMaXN0XFxgIG9ubHkgYWNjZXB0cyBhcnJheXMgb3IgbGlzdHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2VsZW1lbnRzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYElubGluZWAgZnJvbSBhIEpTT04gYG9iamVjdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fElubGluZX0gb2JqZWN0XG4gICAqIEByZXR1cm4ge0lubGluZX1cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGlmIChJbmxpbmUuaXNJbmxpbmUob2JqZWN0KSkge1xuICAgICAgcmV0dXJuIG9iamVjdFxuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGRhdGEgPSB7fSxcbiAgICAgIGlzVm9pZCA9IGZhbHNlLFxuICAgICAga2V5ID0gZ2VuZXJhdGVLZXkoKSxcbiAgICAgIG5vZGVzID0gW10sXG4gICAgICB0eXBlLFxuICAgIH0gPSBvYmplY3RcblxuICAgIGlmICh0eXBlb2YgdHlwZSAhPSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgSW5saW5lLmZyb21KU2AgcmVxdWlyZXMgYSBgdHlwZWAgc3RyaW5nLicpXG4gICAgfVxuXG4gICAgY29uc3QgaW5saW5lID0gbmV3IElubGluZSh7XG4gICAgICBrZXksXG4gICAgICB0eXBlLFxuICAgICAgaXNWb2lkOiAhIWlzVm9pZCxcbiAgICAgIGRhdGE6IG5ldyBNYXAoZGF0YSksXG4gICAgICBub2RlczogbmV3IExpc3Qobm9kZXMubWFwKE5vZGUuZnJvbUpTT04pKSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGlubGluZVxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGBmcm9tSlNgLlxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTID0gSW5saW5lLmZyb21KU09OXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgYElubGluZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzSW5saW5lKGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLklOTElORV0pXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBsaXN0IG9mIGlubGluZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzSW5saW5lTGlzdChhbnkpIHtcbiAgICByZXR1cm4gTGlzdC5pc0xpc3QoYW55KSAmJiBhbnkuZXZlcnkoaXRlbSA9PiBJbmxpbmUuaXNJbmxpbmUoaXRlbSkpXG4gIH1cblxuICAvKipcbiAgICogT2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgcmV0dXJuICdpbmxpbmUnXG4gIH1cblxuICBnZXQga2luZCgpIHtcbiAgICBsb2dnZXIuZGVwcmVjYXRlKCdzbGF0ZUAwLjMyLjAnLCAnVGhlIGBraW5kYCBwcm9wZXJ0eSBvZiBTbGF0ZSBvYmplY3RzIGhhcyBiZWVuIHJlbmFtZWQgdG8gYG9iamVjdGAuJylcbiAgICByZXR1cm4gdGhpcy5vYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgaW5saW5lIGlzIGVtcHR5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0ID09ICcnXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25jYXRlbmF0ZWQgdGV4dCBvZiBhbGwgdGhlIGlubGluZSdzIGNoaWxkcmVuLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCB0ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFRleHQoKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGlubGluZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04ob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAgb2JqZWN0OiB0aGlzLm9iamVjdCxcbiAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgIGlzVm9pZDogdGhpcy5pc1ZvaWQsXG4gICAgICBkYXRhOiB0aGlzLmRhdGEudG9KU09OKCksXG4gICAgICBub2RlczogdGhpcy5ub2Rlcy50b0FycmF5KCkubWFwKG4gPT4gbi50b0pTT04ob3B0aW9ucykpLFxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByZXNlcnZlS2V5cykge1xuICAgICAgb2JqZWN0LmtleSA9IHRoaXMua2V5XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGB0b0pTYC5cbiAgICovXG5cbiAgdG9KUyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKG9wdGlvbnMpXG4gIH1cblxufVxuXG4vKipcbiAqIEF0dGFjaCBhIHBzZXVkby1zeW1ib2wgZm9yIHR5cGUgY2hlY2tpbmcuXG4gKi9cblxuSW5saW5lLnByb3RvdHlwZVtNT0RFTF9UWVBFUy5JTkxJTkVdID0gdHJ1ZVxuXG4vKipcbiAqIE1peCBpbiBgTm9kZWAgbWV0aG9kcy5cbiAqL1xuXG5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhOb2RlLnByb3RvdHlwZSkuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gIGlmIChtZXRob2QgPT0gJ2NvbnN0cnVjdG9yJykgcmV0dXJuXG4gIElubGluZS5wcm90b3R5cGVbbWV0aG9kXSA9IE5vZGUucHJvdG90eXBlW21ldGhvZF1cbn0pXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtJbmxpbmV9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgSW5saW5lXG4iXX0=