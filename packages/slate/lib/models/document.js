'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./block');

require('./inline');

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
  key: undefined,
  nodes: new _immutable.List()
};

/**
 * Document.
 *
 * @type {Document}
 */

var Document = function (_Record) {
  _inherits(Document, _Record);

  function Document() {
    _classCallCheck(this, Document);

    return _possibleConstructorReturn(this, (Document.__proto__ || Object.getPrototypeOf(Document)).apply(this, arguments));
  }

  _createClass(Document, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the document.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
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
      return 'document';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check if the document is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of all the document's children.
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
     * Create a new `Document` with `attrs`.
     *
     * @param {Object|Array|List|Text} attrs
     * @return {Document}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Document.isDocument(attrs)) {
        return attrs;
      }

      if (_immutable.List.isList(attrs) || Array.isArray(attrs)) {
        attrs = { nodes: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Document.fromJSON(attrs);
      }

      throw new Error('`Document.create` only accepts objects, arrays, lists or documents, but you passed it: ' + attrs);
    }

    /**
     * Create a `Document` from a JSON `object`.
     *
     * @param {Object|Document} object
     * @return {Document}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Document.isDocument(object)) {
        return object;
      }

      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          _object$key = object.key,
          key = _object$key === undefined ? (0, _generateKey2.default)() : _object$key,
          _object$nodes = object.nodes,
          nodes = _object$nodes === undefined ? [] : _object$nodes;


      var document = new Document({
        key: key,
        data: new _immutable.Map(data),
        nodes: new _immutable.List(nodes.map(_node2.default.fromJSON))
      });

      return document;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isDocument',


    /**
     * Check if `any` is a `Document`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isDocument(any) {
      return !!(any && any[_modelTypes2.default.DOCUMENT]);
    }
  }]);

  return Document;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Document.fromJS = Document.fromJSON;
Document.prototype[_modelTypes2.default.DOCUMENT] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Document.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Document}
 */

exports.default = Document;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvZG9jdW1lbnQuanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJkYXRhIiwia2V5IiwidW5kZWZpbmVkIiwibm9kZXMiLCJEb2N1bWVudCIsIm9wdGlvbnMiLCJvYmplY3QiLCJ0b0pTT04iLCJ0b0FycmF5IiwibWFwIiwibiIsInByZXNlcnZlS2V5cyIsImRlcHJlY2F0ZSIsInRleHQiLCJnZXRUZXh0IiwiYXR0cnMiLCJpc0RvY3VtZW50IiwiaXNMaXN0IiwiQXJyYXkiLCJpc0FycmF5IiwiZnJvbUpTT04iLCJFcnJvciIsImRvY3VtZW50IiwiYW55IiwiRE9DVU1FTlQiLCJmcm9tSlMiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZm9yRWFjaCIsIm1ldGhvZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFLQTs7QUFDQTs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7OztBQWpCQTs7OztBQU9BOzs7O0FBWUE7Ozs7OztBQU1BLElBQU1BLFdBQVc7QUFDZkMsUUFBTSxvQkFEUztBQUVmQyxPQUFLQyxTQUZVO0FBR2ZDLFNBQU87QUFIUSxDQUFqQjs7QUFNQTs7Ozs7O0lBTU1DLFE7Ozs7Ozs7Ozs7Ozs7QUF3R0o7Ozs7Ozs7NkJBT3FCO0FBQUEsVUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUNuQixVQUFNQyxTQUFTO0FBQ2JBLGdCQUFRLEtBQUtBLE1BREE7QUFFYk4sY0FBTSxLQUFLQSxJQUFMLENBQVVPLE1BQVYsRUFGTztBQUdiSixlQUFPLEtBQUtBLEtBQUwsQ0FBV0ssT0FBWCxHQUFxQkMsR0FBckIsQ0FBeUI7QUFBQSxpQkFBS0MsRUFBRUgsTUFBRixDQUFTRixPQUFULENBQUw7QUFBQSxTQUF6QjtBQUhNLE9BQWY7O0FBTUEsVUFBSUEsUUFBUU0sWUFBWixFQUEwQjtBQUN4QkwsZUFBT0wsR0FBUCxHQUFhLEtBQUtBLEdBQWxCO0FBQ0Q7O0FBRUQsYUFBT0ssTUFBUDtBQUNEOztBQUVEOzs7Ozs7eUJBSUtELE8sRUFBUztBQUNaLGFBQU8sS0FBS0UsTUFBTCxDQUFZRixPQUFaLENBQVA7QUFDRDs7Ozs7QUE5REQ7Ozs7Ozt3QkFNYTtBQUNYLGFBQU8sVUFBUDtBQUNEOzs7d0JBRVU7QUFDVCwrQkFBT08sU0FBUCxDQUFpQixjQUFqQixFQUFpQyxvRUFBakM7QUFDQSxhQUFPLEtBQUtOLE1BQVo7QUFDRDs7QUFFRDs7Ozs7Ozs7d0JBTWM7QUFDWixhQUFPLEtBQUtPLElBQUwsSUFBYSxFQUFwQjtBQUNEOztBQUVEOzs7Ozs7Ozt3QkFNVztBQUNULGFBQU8sS0FBS0MsT0FBTCxFQUFQO0FBQ0Q7Ozs7O0FBcEdEOzs7Ozs7OzZCQU8wQjtBQUFBLFVBQVpDLEtBQVksdUVBQUosRUFBSTs7QUFDeEIsVUFBSVgsU0FBU1ksVUFBVCxDQUFvQkQsS0FBcEIsQ0FBSixFQUFnQztBQUM5QixlQUFPQSxLQUFQO0FBQ0Q7O0FBRUQsVUFBSSxnQkFBS0UsTUFBTCxDQUFZRixLQUFaLEtBQXNCRyxNQUFNQyxPQUFOLENBQWNKLEtBQWQsQ0FBMUIsRUFBZ0Q7QUFDOUNBLGdCQUFRLEVBQUVaLE9BQU9ZLEtBQVQsRUFBUjtBQUNEOztBQUVELFVBQUksNkJBQWNBLEtBQWQsQ0FBSixFQUEwQjtBQUN4QixlQUFPWCxTQUFTZ0IsUUFBVCxDQUFrQkwsS0FBbEIsQ0FBUDtBQUNEOztBQUVELFlBQU0sSUFBSU0sS0FBSiw2RkFBc0dOLEtBQXRHLENBQU47QUFDRDs7QUFFRDs7Ozs7Ozs7OzZCQU9nQlQsTSxFQUFRO0FBQ3RCLFVBQUlGLFNBQVNZLFVBQVQsQ0FBb0JWLE1BQXBCLENBQUosRUFBaUM7QUFDL0IsZUFBT0EsTUFBUDtBQUNEOztBQUhxQix5QkFTbEJBLE1BVGtCLENBTXBCTixJQU5vQjtBQUFBLFVBTXBCQSxJQU5vQixnQ0FNYixFQU5hO0FBQUEsd0JBU2xCTSxNQVRrQixDQU9wQkwsR0FQb0I7QUFBQSxVQU9wQkEsR0FQb0IsK0JBT2QsNEJBUGM7QUFBQSwwQkFTbEJLLE1BVGtCLENBUXBCSCxLQVJvQjtBQUFBLFVBUXBCQSxLQVJvQixpQ0FRWixFQVJZOzs7QUFXdEIsVUFBTW1CLFdBQVcsSUFBSWxCLFFBQUosQ0FBYTtBQUM1QkgsZ0JBRDRCO0FBRTVCRCxjQUFNLG1CQUFRQSxJQUFSLENBRnNCO0FBRzVCRyxlQUFPLG9CQUFTQSxNQUFNTSxHQUFOLENBQVUsZUFBS1csUUFBZixDQUFUO0FBSHFCLE9BQWIsQ0FBakI7O0FBTUEsYUFBT0UsUUFBUDtBQUNEOztBQUVEOzs7Ozs7OztBQU1BOzs7Ozs7OytCQU9rQkMsRyxFQUFLO0FBQ3JCLGFBQU8sQ0FBQyxFQUFFQSxPQUFPQSxJQUFJLHFCQUFZQyxRQUFoQixDQUFULENBQVI7QUFDRDs7OztFQW5Fb0IsdUJBQU96QixRQUFQLEM7O0FBdUl2Qjs7OztBQXZJTUssUSxDQXdER3FCLE0sR0FBU3JCLFNBQVNnQixRO0FBbUYzQmhCLFNBQVNzQixTQUFULENBQW1CLHFCQUFZRixRQUEvQixJQUEyQyxJQUEzQzs7QUFFQTs7OztBQUlBRyxPQUFPQyxtQkFBUCxDQUEyQixlQUFLRixTQUFoQyxFQUEyQ0csT0FBM0MsQ0FBbUQsVUFBQ0MsTUFBRCxFQUFZO0FBQzdELE1BQUlBLFVBQVUsYUFBZCxFQUE2QjtBQUM3QjFCLFdBQVNzQixTQUFULENBQW1CSSxNQUFuQixJQUE2QixlQUFLSixTQUFMLENBQWVJLE1BQWYsQ0FBN0I7QUFDRCxDQUhEOztBQUtBOzs7Ozs7a0JBTWUxQixRIiwiZmlsZSI6ImRvY3VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIFByZXZlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCAnLi9ibG9jaydcbmltcG9ydCAnLi9pbmxpbmUnXG5cbi8qKlxuICogRGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IExpc3QsIE1hcCwgUmVjb3JkIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgTm9kZSBmcm9tICcuL25vZGUnXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IGdlbmVyYXRlS2V5IGZyb20gJy4uL3V0aWxzL2dlbmVyYXRlLWtleSdcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgZGF0YTogbmV3IE1hcCgpLFxuICBrZXk6IHVuZGVmaW5lZCxcbiAgbm9kZXM6IG5ldyBMaXN0KCksXG59XG5cbi8qKlxuICogRG9jdW1lbnQuXG4gKlxuICogQHR5cGUge0RvY3VtZW50fVxuICovXG5cbmNsYXNzIERvY3VtZW50IGV4dGVuZHMgUmVjb3JkKERFRkFVTFRTKSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgRG9jdW1lbnRgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8QXJyYXl8TGlzdHxUZXh0fSBhdHRyc1xuICAgKiBAcmV0dXJuIHtEb2N1bWVudH1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9IHt9KSB7XG4gICAgaWYgKERvY3VtZW50LmlzRG9jdW1lbnQoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gYXR0cnNcbiAgICB9XG5cbiAgICBpZiAoTGlzdC5pc0xpc3QoYXR0cnMpIHx8IEFycmF5LmlzQXJyYXkoYXR0cnMpKSB7XG4gICAgICBhdHRycyA9IHsgbm9kZXM6IGF0dHJzIH1cbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhdHRycykpIHtcbiAgICAgIHJldHVybiBEb2N1bWVudC5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYERvY3VtZW50LmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cywgYXJyYXlzLCBsaXN0cyBvciBkb2N1bWVudHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYERvY3VtZW50YCBmcm9tIGEgSlNPTiBgb2JqZWN0YC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8RG9jdW1lbnR9IG9iamVjdFxuICAgKiBAcmV0dXJuIHtEb2N1bWVudH1cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGlmIChEb2N1bWVudC5pc0RvY3VtZW50KG9iamVjdCkpIHtcbiAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBkYXRhID0ge30sXG4gICAgICBrZXkgPSBnZW5lcmF0ZUtleSgpLFxuICAgICAgbm9kZXMgPSBbXSxcbiAgICB9ID0gb2JqZWN0XG5cbiAgICBjb25zdCBkb2N1bWVudCA9IG5ldyBEb2N1bWVudCh7XG4gICAgICBrZXksXG4gICAgICBkYXRhOiBuZXcgTWFwKGRhdGEpLFxuICAgICAgbm9kZXM6IG5ldyBMaXN0KG5vZGVzLm1hcChOb2RlLmZyb21KU09OKSksXG4gICAgfSlcblxuICAgIHJldHVybiBkb2N1bWVudFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGBmcm9tSlNgLlxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTID0gRG9jdW1lbnQuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgRG9jdW1lbnRgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc0RvY3VtZW50KGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLkRPQ1VNRU5UXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPYmplY3QuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gJ2RvY3VtZW50J1xuICB9XG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgbG9nZ2VyLmRlcHJlY2F0ZSgnc2xhdGVAMC4zMi4wJywgJ1RoZSBga2luZGAgcHJvcGVydHkgb2YgU2xhdGUgb2JqZWN0cyBoYXMgYmVlbiByZW5hbWVkIHRvIGBvYmplY3RgLicpXG4gICAgcmV0dXJuIHRoaXMub2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGRvY3VtZW50IGlzIGVtcHR5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0ID09ICcnXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25jYXRlbmF0ZWQgdGV4dCBvZiBhbGwgdGhlIGRvY3VtZW50J3MgY2hpbGRyZW4uXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dCgpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgdG9KU09OKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgIG9iamVjdDogdGhpcy5vYmplY3QsXG4gICAgICBkYXRhOiB0aGlzLmRhdGEudG9KU09OKCksXG4gICAgICBub2RlczogdGhpcy5ub2Rlcy50b0FycmF5KCkubWFwKG4gPT4gbi50b0pTT04ob3B0aW9ucykpLFxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByZXNlcnZlS2V5cykge1xuICAgICAgb2JqZWN0LmtleSA9IHRoaXMua2V5XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGB0b0pTYC5cbiAgICovXG5cbiAgdG9KUyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKG9wdGlvbnMpXG4gIH1cblxufVxuXG4vKipcbiAqIEF0dGFjaCBhIHBzZXVkby1zeW1ib2wgZm9yIHR5cGUgY2hlY2tpbmcuXG4gKi9cblxuRG9jdW1lbnQucHJvdG90eXBlW01PREVMX1RZUEVTLkRPQ1VNRU5UXSA9IHRydWVcblxuLyoqXG4gKiBNaXggaW4gYE5vZGVgIG1ldGhvZHMuXG4gKi9cblxuT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTm9kZS5wcm90b3R5cGUpLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICBpZiAobWV0aG9kID09ICdjb25zdHJ1Y3RvcicpIHJldHVyblxuICBEb2N1bWVudC5wcm90b3R5cGVbbWV0aG9kXSA9IE5vZGUucHJvdG90eXBlW21ldGhvZF1cbn0pXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtEb2N1bWVudH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBEb2N1bWVudFxuIl19