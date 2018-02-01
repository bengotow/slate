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

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

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
 * Block.
 *
 * @type {Block}
 */

var Block = function (_Record) {
  _inherits(Block, _Record);

  function Block() {
    _classCallCheck(this, Block);

    return _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).apply(this, arguments));
  }

  _createClass(Block, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the block.
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
      return 'block';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check if the block is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of all the block's children.
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
     * Create a new `Block` from `attrs`.
     *
     * @param {Object|String|Block} attrs
     * @return {Block}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Block.isBlock(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Block.fromJSON(attrs);
      }

      throw new Error('`Block.create` only accepts objects, strings or blocks, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Blocks` from `attrs`.
     *
     * @param {Array<Block|Object>|List<Block|Object>} attrs
     * @return {List<Block>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(attrs) || Array.isArray(attrs)) {
        var list = new _immutable.List(attrs.map(Block.create));
        return list;
      }

      throw new Error('`Block.createList` only accepts arrays or lists, but you passed it: ' + attrs);
    }

    /**
     * Create a `Block` from a JSON `object`.
     *
     * @param {Object|Block} object
     * @return {Block}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Block.isBlock(object)) {
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
        throw new Error('`Block.fromJSON` requires a `type` string.');
      }

      var block = new Block({
        key: key,
        type: type,
        isVoid: !!isVoid,
        data: new _immutable.Map(data),
        nodes: new _immutable.List(nodes.map(_node2.default.fromJSON))
      });

      return block;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isBlock',


    /**
     * Check if `any` is a `Block`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isBlock(any) {
      return !!(any && any[_modelTypes2.default.BLOCK]);
    }

    /**
     * Check if `any` is a block list.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isBlockList',
    value: function isBlockList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Block.isBlock(item);
      });
    }
  }]);

  return Block;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Block.fromJS = Block.fromJSON;
Block.prototype[_modelTypes2.default.BLOCK] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Block.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Block}
 */

exports.default = Block;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvYmxvY2suanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJkYXRhIiwiaXNWb2lkIiwia2V5IiwidW5kZWZpbmVkIiwibm9kZXMiLCJ0eXBlIiwiQmxvY2siLCJvcHRpb25zIiwib2JqZWN0IiwidG9KU09OIiwidG9BcnJheSIsIm1hcCIsIm4iLCJwcmVzZXJ2ZUtleXMiLCJkZXByZWNhdGUiLCJ0ZXh0IiwiZ2V0VGV4dCIsImF0dHJzIiwiaXNCbG9jayIsImZyb21KU09OIiwiRXJyb3IiLCJpc0xpc3QiLCJBcnJheSIsImlzQXJyYXkiLCJsaXN0IiwiY3JlYXRlIiwiYmxvY2siLCJhbnkiLCJCTE9DSyIsImV2ZXJ5IiwiaXRlbSIsImZyb21KUyIsInByb3RvdHlwZSIsIk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJmb3JFYWNoIiwibWV0aG9kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUtBOztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7O0FBaEJBOzs7O0FBTUE7Ozs7QUFZQTs7Ozs7O0FBTUEsSUFBTUEsV0FBVztBQUNmQyxRQUFNLG9CQURTO0FBRWZDLFVBQVEsS0FGTztBQUdmQyxPQUFLQyxTQUhVO0FBSWZDLFNBQU8scUJBSlE7QUFLZkMsUUFBTUY7QUFMUyxDQUFqQjs7QUFRQTs7Ozs7O0lBTU1HLEs7Ozs7Ozs7Ozs7Ozs7QUEySUo7Ozs7Ozs7NkJBT3FCO0FBQUEsVUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUNuQixVQUFNQyxTQUFTO0FBQ2JBLGdCQUFRLEtBQUtBLE1BREE7QUFFYkgsY0FBTSxLQUFLQSxJQUZFO0FBR2JKLGdCQUFRLEtBQUtBLE1BSEE7QUFJYkQsY0FBTSxLQUFLQSxJQUFMLENBQVVTLE1BQVYsRUFKTztBQUtiTCxlQUFPLEtBQUtBLEtBQUwsQ0FBV00sT0FBWCxHQUFxQkMsR0FBckIsQ0FBeUI7QUFBQSxpQkFBS0MsRUFBRUgsTUFBRixDQUFTRixPQUFULENBQUw7QUFBQSxTQUF6QjtBQUxNLE9BQWY7O0FBUUEsVUFBSUEsUUFBUU0sWUFBWixFQUEwQjtBQUN4QkwsZUFBT04sR0FBUCxHQUFhLEtBQUtBLEdBQWxCO0FBQ0Q7O0FBRUQsYUFBT00sTUFBUDtBQUNEOztBQUVEOzs7Ozs7eUJBSUtELE8sRUFBUztBQUNaLGFBQU8sS0FBS0UsTUFBTCxDQUFZRixPQUFaLENBQVA7QUFDRDs7Ozs7QUFoRUQ7Ozs7Ozt3QkFNYTtBQUNYLGFBQU8sT0FBUDtBQUNEOzs7d0JBRVU7QUFDVCwrQkFBT08sU0FBUCxDQUFpQixjQUFqQixFQUFpQyxvRUFBakM7QUFDQSxhQUFPLEtBQUtOLE1BQVo7QUFDRDs7QUFFRDs7Ozs7Ozs7d0JBTWM7QUFDWixhQUFPLEtBQUtPLElBQUwsSUFBYSxFQUFwQjtBQUNEOztBQUVEOzs7Ozs7Ozt3QkFNVztBQUNULGFBQU8sS0FBS0MsT0FBTCxFQUFQO0FBQ0Q7Ozs7O0FBdklEOzs7Ozs7OzZCQU8wQjtBQUFBLFVBQVpDLEtBQVksdUVBQUosRUFBSTs7QUFDeEIsVUFBSVgsTUFBTVksT0FBTixDQUFjRCxLQUFkLENBQUosRUFBMEI7QUFDeEIsZUFBT0EsS0FBUDtBQUNEOztBQUVELFVBQUksT0FBT0EsS0FBUCxJQUFnQixRQUFwQixFQUE4QjtBQUM1QkEsZ0JBQVEsRUFBRVosTUFBTVksS0FBUixFQUFSO0FBQ0Q7O0FBRUQsVUFBSSw2QkFBY0EsS0FBZCxDQUFKLEVBQTBCO0FBQ3hCLGVBQU9YLE1BQU1hLFFBQU4sQ0FBZUYsS0FBZixDQUFQO0FBQ0Q7O0FBRUQsWUFBTSxJQUFJRyxLQUFKLGlGQUEwRkgsS0FBMUYsQ0FBTjtBQUNEOztBQUVEOzs7Ozs7Ozs7aUNBTzhCO0FBQUEsVUFBWkEsS0FBWSx1RUFBSixFQUFJOztBQUM1QixVQUFJLGdCQUFLSSxNQUFMLENBQVlKLEtBQVosS0FBc0JLLE1BQU1DLE9BQU4sQ0FBY04sS0FBZCxDQUExQixFQUFnRDtBQUM5QyxZQUFNTyxPQUFPLG9CQUFTUCxNQUFNTixHQUFOLENBQVVMLE1BQU1tQixNQUFoQixDQUFULENBQWI7QUFDQSxlQUFPRCxJQUFQO0FBQ0Q7O0FBRUQsWUFBTSxJQUFJSixLQUFKLDBFQUFtRkgsS0FBbkYsQ0FBTjtBQUNEOztBQUVEOzs7Ozs7Ozs7NkJBT2dCVCxNLEVBQVE7QUFDdEIsVUFBSUYsTUFBTVksT0FBTixDQUFjVixNQUFkLENBQUosRUFBMkI7QUFDekIsZUFBT0EsTUFBUDtBQUNEOztBQUhxQix5QkFXbEJBLE1BWGtCLENBTXBCUixJQU5vQjtBQUFBLFVBTXBCQSxJQU5vQixnQ0FNYixFQU5hO0FBQUEsMkJBV2xCUSxNQVhrQixDQU9wQlAsTUFQb0I7QUFBQSxVQU9wQkEsTUFQb0Isa0NBT1gsS0FQVztBQUFBLHdCQVdsQk8sTUFYa0IsQ0FRcEJOLEdBUm9CO0FBQUEsVUFRcEJBLEdBUm9CLCtCQVFkLDRCQVJjO0FBQUEsMEJBV2xCTSxNQVhrQixDQVNwQkosS0FUb0I7QUFBQSxVQVNwQkEsS0FUb0IsaUNBU1osRUFUWTtBQUFBLFVBVXBCQyxJQVZvQixHQVdsQkcsTUFYa0IsQ0FVcEJILElBVm9COzs7QUFhdEIsVUFBSSxPQUFPQSxJQUFQLElBQWUsUUFBbkIsRUFBNkI7QUFDM0IsY0FBTSxJQUFJZSxLQUFKLENBQVUsNENBQVYsQ0FBTjtBQUNEOztBQUVELFVBQU1NLFFBQVEsSUFBSXBCLEtBQUosQ0FBVTtBQUN0QkosZ0JBRHNCO0FBRXRCRyxrQkFGc0I7QUFHdEJKLGdCQUFRLENBQUMsQ0FBQ0EsTUFIWTtBQUl0QkQsY0FBTSxtQkFBUUEsSUFBUixDQUpnQjtBQUt0QkksZUFBTyxvQkFBU0EsTUFBTU8sR0FBTixDQUFVLGVBQUtRLFFBQWYsQ0FBVDtBQUxlLE9BQVYsQ0FBZDs7QUFRQSxhQUFPTyxLQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O0FBTUE7Ozs7Ozs7NEJBT2VDLEcsRUFBSztBQUNsQixhQUFPLENBQUMsRUFBRUEsT0FBT0EsSUFBSSxxQkFBWUMsS0FBaEIsQ0FBVCxDQUFSO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OztnQ0FPbUJELEcsRUFBSztBQUN0QixhQUFPLGdCQUFLTixNQUFMLENBQVlNLEdBQVosS0FBb0JBLElBQUlFLEtBQUosQ0FBVTtBQUFBLGVBQVF2QixNQUFNWSxPQUFOLENBQWNZLElBQWQsQ0FBUjtBQUFBLE9BQVYsQ0FBM0I7QUFDRDs7OztFQXRHaUIsdUJBQU8vQixRQUFQLEM7O0FBNEtwQjs7OztBQTVLTU8sSyxDQWdGR3lCLE0sR0FBU3pCLE1BQU1hLFE7QUFnR3hCYixNQUFNMEIsU0FBTixDQUFnQixxQkFBWUosS0FBNUIsSUFBcUMsSUFBckM7O0FBRUE7Ozs7QUFJQUssT0FBT0MsbUJBQVAsQ0FBMkIsZUFBS0YsU0FBaEMsRUFBMkNHLE9BQTNDLENBQW1ELFVBQUNDLE1BQUQsRUFBWTtBQUM3RCxNQUFJQSxVQUFVLGFBQWQsRUFBNkI7QUFDN0I5QixRQUFNMEIsU0FBTixDQUFnQkksTUFBaEIsSUFBMEIsZUFBS0osU0FBTCxDQUFlSSxNQUFmLENBQTFCO0FBQ0QsQ0FIRDs7QUFLQTs7Ozs7O2tCQU1lOUIsSyIsImZpbGUiOiJibG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBQcmV2ZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAqL1xuXG5pbXBvcnQgJy4vZG9jdW1lbnQnXG5cbi8qKlxuICogRGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IExpc3QsIE1hcCwgUmVjb3JkIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IE5vZGUgZnJvbSAnLi9ub2RlJ1xuaW1wb3J0IGdlbmVyYXRlS2V5IGZyb20gJy4uL3V0aWxzL2dlbmVyYXRlLWtleSdcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgZGF0YTogbmV3IE1hcCgpLFxuICBpc1ZvaWQ6IGZhbHNlLFxuICBrZXk6IHVuZGVmaW5lZCxcbiAgbm9kZXM6IG5ldyBMaXN0KCksXG4gIHR5cGU6IHVuZGVmaW5lZCxcbn1cblxuLyoqXG4gKiBCbG9jay5cbiAqXG4gKiBAdHlwZSB7QmxvY2t9XG4gKi9cblxuY2xhc3MgQmxvY2sgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBCbG9ja2AgZnJvbSBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd8QmxvY2t9IGF0dHJzXG4gICAqIEByZXR1cm4ge0Jsb2NrfVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlKGF0dHJzID0ge30pIHtcbiAgICBpZiAoQmxvY2suaXNCbG9jayhhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXR0cnMgPT0gJ3N0cmluZycpIHtcbiAgICAgIGF0dHJzID0geyB0eXBlOiBhdHRycyB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gQmxvY2suZnJvbUpTT04oYXR0cnMpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBCbG9jay5jcmVhdGVcXGAgb25seSBhY2NlcHRzIG9iamVjdHMsIHN0cmluZ3Mgb3IgYmxvY2tzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpc3Qgb2YgYEJsb2Nrc2AgZnJvbSBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5PEJsb2NrfE9iamVjdD58TGlzdDxCbG9ja3xPYmplY3Q+fSBhdHRyc1xuICAgKiBAcmV0dXJuIHtMaXN0PEJsb2NrPn1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZUxpc3QoYXR0cnMgPSBbXSkge1xuICAgIGlmIChMaXN0LmlzTGlzdChhdHRycykgfHwgQXJyYXkuaXNBcnJheShhdHRycykpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBuZXcgTGlzdChhdHRycy5tYXAoQmxvY2suY3JlYXRlKSlcbiAgICAgIHJldHVybiBsaXN0XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBCbG9jay5jcmVhdGVMaXN0XFxgIG9ubHkgYWNjZXB0cyBhcnJheXMgb3IgbGlzdHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYEJsb2NrYCBmcm9tIGEgSlNPTiBgb2JqZWN0YC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8QmxvY2t9IG9iamVjdFxuICAgKiBAcmV0dXJuIHtCbG9ja31cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGlmIChCbG9jay5pc0Jsb2NrKG9iamVjdCkpIHtcbiAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBkYXRhID0ge30sXG4gICAgICBpc1ZvaWQgPSBmYWxzZSxcbiAgICAgIGtleSA9IGdlbmVyYXRlS2V5KCksXG4gICAgICBub2RlcyA9IFtdLFxuICAgICAgdHlwZSxcbiAgICB9ID0gb2JqZWN0XG5cbiAgICBpZiAodHlwZW9mIHR5cGUgIT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYEJsb2NrLmZyb21KU09OYCByZXF1aXJlcyBhIGB0eXBlYCBzdHJpbmcuJylcbiAgICB9XG5cbiAgICBjb25zdCBibG9jayA9IG5ldyBCbG9jayh7XG4gICAgICBrZXksXG4gICAgICB0eXBlLFxuICAgICAgaXNWb2lkOiAhIWlzVm9pZCxcbiAgICAgIGRhdGE6IG5ldyBNYXAoZGF0YSksXG4gICAgICBub2RlczogbmV3IExpc3Qobm9kZXMubWFwKE5vZGUuZnJvbUpTT04pKSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGJsb2NrXG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYGZyb21KU2AuXG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlMgPSBCbG9jay5mcm9tSlNPTlxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGBCbG9ja2AuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzQmxvY2soYW55KSB7XG4gICAgcmV0dXJuICEhKGFueSAmJiBhbnlbTU9ERUxfVFlQRVMuQkxPQ0tdKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgYmxvY2sgbGlzdC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNCbG9ja0xpc3QoYW55KSB7XG4gICAgcmV0dXJuIExpc3QuaXNMaXN0KGFueSkgJiYgYW55LmV2ZXJ5KGl0ZW0gPT4gQmxvY2suaXNCbG9jayhpdGVtKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPYmplY3QuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gJ2Jsb2NrJ1xuICB9XG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgbG9nZ2VyLmRlcHJlY2F0ZSgnc2xhdGVAMC4zMi4wJywgJ1RoZSBga2luZGAgcHJvcGVydHkgb2YgU2xhdGUgb2JqZWN0cyBoYXMgYmVlbiByZW5hbWVkIHRvIGBvYmplY3RgLicpXG4gICAgcmV0dXJuIHRoaXMub2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGJsb2NrIGlzIGVtcHR5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0ID09ICcnXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25jYXRlbmF0ZWQgdGV4dCBvZiBhbGwgdGhlIGJsb2NrJ3MgY2hpbGRyZW4uXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dCgpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgYmxvY2suXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgdG9KU09OKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgIG9iamVjdDogdGhpcy5vYmplY3QsXG4gICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICBpc1ZvaWQ6IHRoaXMuaXNWb2lkLFxuICAgICAgZGF0YTogdGhpcy5kYXRhLnRvSlNPTigpLFxuICAgICAgbm9kZXM6IHRoaXMubm9kZXMudG9BcnJheSgpLm1hcChuID0+IG4udG9KU09OKG9wdGlvbnMpKSxcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5wcmVzZXJ2ZUtleXMpIHtcbiAgICAgIG9iamVjdC5rZXkgPSB0aGlzLmtleVxuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgdG9KU2AuXG4gICAqL1xuXG4gIHRvSlMob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnRvSlNPTihvcHRpb25zKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBwc2V1ZG8tc3ltYm9sIGZvciB0eXBlIGNoZWNraW5nLlxuICovXG5cbkJsb2NrLnByb3RvdHlwZVtNT0RFTF9UWVBFUy5CTE9DS10gPSB0cnVlXG5cbi8qKlxuICogTWl4IGluIGBOb2RlYCBtZXRob2RzLlxuICovXG5cbk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE5vZGUucHJvdG90eXBlKS5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgaWYgKG1ldGhvZCA9PSAnY29uc3RydWN0b3InKSByZXR1cm5cbiAgQmxvY2sucHJvdG90eXBlW21ldGhvZF0gPSBOb2RlLnByb3RvdHlwZVttZXRob2RdXG59KVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7QmxvY2t9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgQmxvY2tcbiJdfQ==