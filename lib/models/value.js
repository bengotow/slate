'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _history = require('./history');

var _history2 = _interopRequireDefault(_history);

var _range = require('./range');

var _range2 = _interopRequireDefault(_range);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

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
  decorations: null,
  document: _document2.default.create(),
  history: _history2.default.create(),
  schema: _schema2.default.create(),
  selection: _range2.default.create()
};

/**
 * Value.
 *
 * @type {Value}
 */

var Value = function (_Record) {
  _inherits(Value, _Record);

  function Value() {
    _classCallCheck(this, Value);

    return _possibleConstructorReturn(this, (Value.__proto__ || Object.getPrototypeOf(Value)).apply(this, arguments));
  }

  _createClass(Value, [{
    key: 'change',


    /**
     * Create a new `Change` with the current value as a starting point.
     *
     * @param {Object} attrs
     * @return {Change}
     */

    value: function change() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var Change = require('./change').default;
      return new Change(_extends({}, attrs, { value: this }));
    }

    /**
     * Return a JSON representation of the value.
     *
     * @param {Object} options
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
        document: this.document.toJSON(options)
      };

      if (options.preserveData) {
        object.data = this.data.toJSON();
      }

      if (options.preserveDecorations) {
        object.decorations = this.decorations ? this.decorations.toArray().map(function (d) {
          return d.toJSON();
        }) : null;
      }

      if (options.preserveHistory) {
        object.history = this.history.toJSON();
      }

      if (options.preserveSelection) {
        object.selection = this.selection.toJSON();
      }

      if (options.preserveSchema) {
        object.schema = this.schema.toJSON();
      }

      if (options.preserveSelection && !options.preserveKeys) {
        var document = this.document,
            selection = this.selection;

        object.selection.anchorPath = selection.isSet ? document.getPath(selection.anchorKey) : null;
        object.selection.focusPath = selection.isSet ? document.getPath(selection.focusKey) : null;
        delete object.selection.anchorKey;
        delete object.selection.focusKey;
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
      return 'value';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Are there undoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasUndos',
    get: function get() {
      return this.history.undos.size > 0;
    }

    /**
     * Are there redoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasRedos',
    get: function get() {
      return this.history.redos.size > 0;
    }

    /**
     * Is the current selection blurred?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return this.selection.isBlurred;
    }

    /**
     * Is the current selection focused?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isFocused',
    get: function get() {
      return this.selection.isFocused;
    }

    /**
     * Is the current selection collapsed?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.selection.isCollapsed;
    }

    /**
     * Is the current selection expanded?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return this.selection.isExpanded;
    }

    /**
     * Is the current selection backward?
     *
     * @return {Boolean} isBackward
     */

  }, {
    key: 'isBackward',
    get: function get() {
      return this.selection.isBackward;
    }

    /**
     * Is the current selection forward?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.selection.isForward;
    }

    /**
     * Get the current start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.selection.startKey;
    }

    /**
     * Get the current end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get() {
      return this.selection.endKey;
    }

    /**
     * Get the current start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get() {
      return this.selection.startOffset;
    }

    /**
     * Get the current end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get() {
      return this.selection.endOffset;
    }

    /**
     * Get the current anchor key.
     *
     * @return {String}
     */

  }, {
    key: 'anchorKey',
    get: function get() {
      return this.selection.anchorKey;
    }

    /**
     * Get the current focus key.
     *
     * @return {String}
     */

  }, {
    key: 'focusKey',
    get: function get() {
      return this.selection.focusKey;
    }

    /**
     * Get the current anchor offset.
     *
     * @return {String}
     */

  }, {
    key: 'anchorOffset',
    get: function get() {
      return this.selection.anchorOffset;
    }

    /**
     * Get the current focus offset.
     *
     * @return {String}
     */

  }, {
    key: 'focusOffset',
    get: function get() {
      return this.selection.focusOffset;
    }

    /**
     * Get the current start text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'startBlock',
    get: function get() {
      return this.startKey && this.document.getClosestBlock(this.startKey);
    }

    /**
     * Get the current end text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'endBlock',
    get: function get() {
      return this.endKey && this.document.getClosestBlock(this.endKey);
    }

    /**
     * Get the current anchor text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'anchorBlock',
    get: function get() {
      return this.anchorKey && this.document.getClosestBlock(this.anchorKey);
    }

    /**
     * Get the current focus text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'focusBlock',
    get: function get() {
      return this.focusKey && this.document.getClosestBlock(this.focusKey);
    }

    /**
     * Get the current start text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'startInline',
    get: function get() {
      return this.startKey && this.document.getClosestInline(this.startKey);
    }

    /**
     * Get the current end text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'endInline',
    get: function get() {
      return this.endKey && this.document.getClosestInline(this.endKey);
    }

    /**
     * Get the current anchor text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'anchorInline',
    get: function get() {
      return this.anchorKey && this.document.getClosestInline(this.anchorKey);
    }

    /**
     * Get the current focus text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'focusInline',
    get: function get() {
      return this.focusKey && this.document.getClosestInline(this.focusKey);
    }

    /**
     * Get the current start text node.
     *
     * @return {Text}
     */

  }, {
    key: 'startText',
    get: function get() {
      return this.startKey && this.document.getDescendant(this.startKey);
    }

    /**
     * Get the current end node.
     *
     * @return {Text}
     */

  }, {
    key: 'endText',
    get: function get() {
      return this.endKey && this.document.getDescendant(this.endKey);
    }

    /**
     * Get the current anchor node.
     *
     * @return {Text}
     */

  }, {
    key: 'anchorText',
    get: function get() {
      return this.anchorKey && this.document.getDescendant(this.anchorKey);
    }

    /**
     * Get the current focus node.
     *
     * @return {Text}
     */

  }, {
    key: 'focusText',
    get: function get() {
      return this.focusKey && this.document.getDescendant(this.focusKey);
    }

    /**
     * Get the next block node.
     *
     * @return {Block}
     */

  }, {
    key: 'nextBlock',
    get: function get() {
      return this.endKey && this.document.getNextBlock(this.endKey);
    }

    /**
     * Get the previous block node.
     *
     * @return {Block}
     */

  }, {
    key: 'previousBlock',
    get: function get() {
      return this.startKey && this.document.getPreviousBlock(this.startKey);
    }

    /**
     * Get the next inline node.
     *
     * @return {Inline}
     */

  }, {
    key: 'nextInline',
    get: function get() {
      return this.endKey && this.document.getNextInline(this.endKey);
    }

    /**
     * Get the previous inline node.
     *
     * @return {Inline}
     */

  }, {
    key: 'previousInline',
    get: function get() {
      return this.startKey && this.document.getPreviousInline(this.startKey);
    }

    /**
     * Get the next text node.
     *
     * @return {Text}
     */

  }, {
    key: 'nextText',
    get: function get() {
      return this.endKey && this.document.getNextText(this.endKey);
    }

    /**
     * Get the previous text node.
     *
     * @return {Text}
     */

  }, {
    key: 'previousText',
    get: function get() {
      return this.startKey && this.document.getPreviousText(this.startKey);
    }

    /**
     * Get the characters in the current selection.
     *
     * @return {List<Character>}
     */

  }, {
    key: 'characters',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getCharactersAtRange(this.selection);
    }

    /**
     * Get the marks of the current selection.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'marks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.Set() : this.selection.marks || this.document.getMarksAtRange(this.selection);
    }

    /**
     * Get the active marks of the current selection.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'activeMarks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.Set() : this.selection.marks || this.document.getActiveMarksAtRange(this.selection);
    }

    /**
     * Get the block nodes in the current selection.
     *
     * @return {List<Block>}
     */

  }, {
    key: 'blocks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getBlocksAtRange(this.selection);
    }

    /**
     * Get the fragment of the current selection.
     *
     * @return {Document}
     */

  }, {
    key: 'fragment',
    get: function get() {
      return this.selection.isUnset ? _document2.default.create() : this.document.getFragmentAtRange(this.selection);
    }

    /**
     * Get the inline nodes in the current selection.
     *
     * @return {List<Inline>}
     */

  }, {
    key: 'inlines',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getInlinesAtRange(this.selection);
    }

    /**
     * Get the text nodes in the current selection.
     *
     * @return {List<Text>}
     */

  }, {
    key: 'texts',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getTextsAtRange(this.selection);
    }

    /**
     * Check whether the selection is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      if (this.isCollapsed) return true;
      if (this.endOffset != 0 && this.startOffset != 0) return false;
      return this.fragment.text.length == 0;
    }

    /**
     * Check whether the selection is collapsed in a void node.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isInVoid',
    get: function get() {
      if (this.isExpanded) return false;
      return this.document.hasVoidParent(this.startKey);
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Value` with `attrs`.
     *
     * @param {Object|Value} attrs
     * @param {Object} options
     * @return {Value}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (Value.isValue(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Value.fromJSON(attrs);
      }

      throw new Error('`Value.create` only accepts objects or values, but you passed it: ' + attrs);
    }

    /**
     * Create a dictionary of settable value properties from `attrs`.
     *
     * @param {Object|Value} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Value.isValue(attrs)) {
        return {
          data: attrs.data,
          decorations: attrs.decorations,
          schema: attrs.schema
        };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var props = {};
        if ('data' in attrs) props.data = _data2.default.create(attrs.data);
        if ('decorations' in attrs) props.decorations = _range2.default.createList(attrs.decorations);
        if ('schema' in attrs) props.schema = _schema2.default.create(attrs.schema);
        return props;
      }

      throw new Error('`Value.createProperties` only accepts objects or values, but you passed it: ' + attrs);
    }

    /**
     * Create a `Value` from a JSON `object`.
     *
     * @param {Object} object
     * @param {Object} options
     *   @property {Boolean} normalize
     *   @property {Array} plugins
     * @return {Value}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _object$document = object.document,
          document = _object$document === undefined ? {} : _object$document,
          _object$selection = object.selection,
          selection = _object$selection === undefined ? {} : _object$selection,
          _object$schema = object.schema,
          schema = _object$schema === undefined ? {} : _object$schema;


      var data = new _immutable.Map();

      document = _document2.default.fromJSON(document);
      selection = _range2.default.fromJSON(selection);
      schema = _schema2.default.fromJSON(schema);

      // Allow plugins to set a default value for `data`.
      if (options.plugins) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = options.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var plugin = _step.value;

            if (plugin.data) data = data.merge(plugin.data);
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

      // Then merge in the `data` provided.
      if ('data' in object) {
        data = data.merge(object.data);
      }

      if (selection.isUnset) {
        var text = document.getFirstText();
        if (text) selection = selection.collapseToStartOf(text);
      }

      var value = new Value({
        data: data,
        document: document,
        selection: selection,
        schema: schema
      });

      if (options.normalize !== false) {
        value = value.change({ save: false }).normalize().value;
      }

      return value;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isValue',


    /**
     * Check if a `value` is a `Value`.
     *
     * @param {Any} value
     * @return {Boolean}
     */

    value: function isValue(value) {
      return !!(value && value[_modelTypes2.default.VALUE]);
    }
  }]);

  return Value;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Value.fromJS = Value.fromJSON;
Value.prototype[_modelTypes2.default.VALUE] = true;

/**
 * Export.
 */

exports.default = Value;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvdmFsdWUuanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJkYXRhIiwiZGVjb3JhdGlvbnMiLCJkb2N1bWVudCIsImNyZWF0ZSIsImhpc3RvcnkiLCJzY2hlbWEiLCJzZWxlY3Rpb24iLCJWYWx1ZSIsImF0dHJzIiwiQ2hhbmdlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJ2YWx1ZSIsIm9wdGlvbnMiLCJvYmplY3QiLCJ0b0pTT04iLCJwcmVzZXJ2ZURhdGEiLCJwcmVzZXJ2ZURlY29yYXRpb25zIiwidG9BcnJheSIsIm1hcCIsImQiLCJwcmVzZXJ2ZUhpc3RvcnkiLCJwcmVzZXJ2ZVNlbGVjdGlvbiIsInByZXNlcnZlU2NoZW1hIiwicHJlc2VydmVLZXlzIiwiYW5jaG9yUGF0aCIsImlzU2V0IiwiZ2V0UGF0aCIsImFuY2hvcktleSIsImZvY3VzUGF0aCIsImZvY3VzS2V5IiwiZGVwcmVjYXRlIiwidW5kb3MiLCJzaXplIiwicmVkb3MiLCJpc0JsdXJyZWQiLCJpc0ZvY3VzZWQiLCJpc0NvbGxhcHNlZCIsImlzRXhwYW5kZWQiLCJpc0JhY2t3YXJkIiwiaXNGb3J3YXJkIiwic3RhcnRLZXkiLCJlbmRLZXkiLCJzdGFydE9mZnNldCIsImVuZE9mZnNldCIsImFuY2hvck9mZnNldCIsImZvY3VzT2Zmc2V0IiwiZ2V0Q2xvc2VzdEJsb2NrIiwiZ2V0Q2xvc2VzdElubGluZSIsImdldERlc2NlbmRhbnQiLCJnZXROZXh0QmxvY2siLCJnZXRQcmV2aW91c0Jsb2NrIiwiZ2V0TmV4dElubGluZSIsImdldFByZXZpb3VzSW5saW5lIiwiZ2V0TmV4dFRleHQiLCJnZXRQcmV2aW91c1RleHQiLCJpc1Vuc2V0IiwiZ2V0Q2hhcmFjdGVyc0F0UmFuZ2UiLCJtYXJrcyIsImdldE1hcmtzQXRSYW5nZSIsImdldEFjdGl2ZU1hcmtzQXRSYW5nZSIsImdldEJsb2Nrc0F0UmFuZ2UiLCJnZXRGcmFnbWVudEF0UmFuZ2UiLCJnZXRJbmxpbmVzQXRSYW5nZSIsImdldFRleHRzQXRSYW5nZSIsImZyYWdtZW50IiwidGV4dCIsImxlbmd0aCIsImhhc1ZvaWRQYXJlbnQiLCJpc1ZhbHVlIiwiZnJvbUpTT04iLCJFcnJvciIsInByb3BzIiwiY3JlYXRlTGlzdCIsInBsdWdpbnMiLCJwbHVnaW4iLCJtZXJnZSIsImdldEZpcnN0VGV4dCIsImNvbGxhcHNlVG9TdGFydE9mIiwibm9ybWFsaXplIiwiY2hhbmdlIiwic2F2ZSIsIlZBTFVFIiwiZnJvbUpTIiwicHJvdG90eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFdBQVc7QUFDZkMsUUFBTSxvQkFEUztBQUVmQyxlQUFhLElBRkU7QUFHZkMsWUFBVSxtQkFBU0MsTUFBVCxFQUhLO0FBSWZDLFdBQVMsa0JBQVFELE1BQVIsRUFKTTtBQUtmRSxVQUFRLGlCQUFPRixNQUFQLEVBTE87QUFNZkcsYUFBVyxnQkFBTUgsTUFBTjtBQU5JLENBQWpCOztBQVNBOzs7Ozs7SUFNTUksSzs7Ozs7Ozs7Ozs7OztBQXNrQko7Ozs7Ozs7NkJBT21CO0FBQUEsVUFBWkMsS0FBWSx1RUFBSixFQUFJOztBQUNqQixVQUFNQyxTQUFTQyxRQUFRLFVBQVIsRUFBb0JDLE9BQW5DO0FBQ0EsYUFBTyxJQUFJRixNQUFKLGNBQWdCRCxLQUFoQixJQUF1QkksT0FBTyxJQUE5QixJQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs2QkFPcUI7QUFBQSxVQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ25CLFVBQU1DLFNBQVM7QUFDYkEsZ0JBQVEsS0FBS0EsTUFEQTtBQUViWixrQkFBVSxLQUFLQSxRQUFMLENBQWNhLE1BQWQsQ0FBcUJGLE9BQXJCO0FBRkcsT0FBZjs7QUFLQSxVQUFJQSxRQUFRRyxZQUFaLEVBQTBCO0FBQ3hCRixlQUFPZCxJQUFQLEdBQWMsS0FBS0EsSUFB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QUFPO0FBQ3BCLGFBQU8sQ0FBQyxFQUFFQSxTQUFTQSxNQUFNLHFCQUFZc0UsS0FBbEIsQ0FBWCxDQUFSO0FBQ0Q7Ozs7RUF0SGlCLHVCQUFPbkYsUUFBUCxDOztBQXdvQnBCOzs7O0FBeG9CTVEsSyxDQTJHRzRFLE0sR0FBUzVFLE1BQU0rRCxRO0FBaWlCeEIvRCxNQUFNNkUsU0FBTixDQUFnQixxQkFBWUYsS0FBNUIsSUFBcUMsSUFBckM7O0FBRUE7Ozs7a0JBSWUzRSxLIiwiZmlsZSI6InZhbHVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdpcy1wbGFpbi1vYmplY3QnXG5pbXBvcnQgbG9nZ2VyIGZyb20gJ3NsYXRlLWRldi1sb2dnZXInXG5pbXBvcnQgeyBSZWNvcmQsIFNldCwgTGlzdCwgTWFwIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IERhdGEgZnJvbSAnLi9kYXRhJ1xuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgSGlzdG9yeSBmcm9tICcuL2hpc3RvcnknXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi9yYW5nZSdcbmltcG9ydCBTY2hlbWEgZnJvbSAnLi9zY2hlbWEnXG5cbi8qKlxuICogRGVmYXVsdCBwcm9wZXJ0aWVzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIGRhdGE6IG5ldyBNYXAoKSxcbiAgZGVjb3JhdGlvbnM6IG51bGwsXG4gIGRvY3VtZW50OiBEb2N1bWVudC5jcmVhdGUoKSxcbiAgaGlzdG9yeTogSGlzdG9yeS5jcmVhdGUoKSxcbiAgc2NoZW1hOiBTY2hlbWEuY3JlYXRlKCksXG4gIHNlbGVjdGlvbjogUmFuZ2UuY3JlYXRlKCksXG59XG5cbi8qKlxuICogVmFsdWUuXG4gKlxuICogQHR5cGUge1ZhbHVlfVxuICovXG5cbmNsYXNzIFZhbHVlIGV4dGVuZHMgUmVjb3JkKERFRkFVTFRTKSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgVmFsdWVgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8VmFsdWV9IGF0dHJzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlKGF0dHJzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmIChWYWx1ZS5pc1ZhbHVlKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gVmFsdWUuZnJvbUpTT04oYXR0cnMpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBWYWx1ZS5jcmVhdGVcXGAgb25seSBhY2NlcHRzIG9iamVjdHMgb3IgdmFsdWVzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRpY3Rpb25hcnkgb2Ygc2V0dGFibGUgdmFsdWUgcHJvcGVydGllcyBmcm9tIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fFZhbHVlfSBhdHRyc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKGF0dHJzID0ge30pIHtcbiAgICBpZiAoVmFsdWUuaXNWYWx1ZShhdHRycykpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IGF0dHJzLmRhdGEsXG4gICAgICAgIGRlY29yYXRpb25zOiBhdHRycy5kZWNvcmF0aW9ucyxcbiAgICAgICAgc2NoZW1hOiBhdHRycy5zY2hlbWEsXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHt9XG4gICAgICBpZiAoJ2RhdGEnIGluIGF0dHJzKSBwcm9wcy5kYXRhID0gRGF0YS5jcmVhdGUoYXR0cnMuZGF0YSlcbiAgICAgIGlmICgnZGVjb3JhdGlvbnMnIGluIGF0dHJzKSBwcm9wcy5kZWNvcmF0aW9ucyA9IFJhbmdlLmNyZWF0ZUxpc3QoYXR0cnMuZGVjb3JhdGlvbnMpXG4gICAgICBpZiAoJ3NjaGVtYScgaW4gYXR0cnMpIHByb3BzLnNjaGVtYSA9IFNjaGVtYS5jcmVhdGUoYXR0cnMuc2NoZW1hKVxuICAgICAgcmV0dXJuIHByb3BzXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBWYWx1ZS5jcmVhdGVQcm9wZXJ0aWVzXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzIG9yIHZhbHVlcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgVmFsdWVgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAgICogICBAcHJvcGVydHkge0FycmF5fSBwbHVnaW5zXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTT04ob2JqZWN0LCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQge1xuICAgICAgZG9jdW1lbnQgPSB7fSxcbiAgICAgIHNlbGVjdGlvbiA9IHt9LFxuICAgICAgc2NoZW1hID0ge30sXG4gICAgfSA9IG9iamVjdFxuXG4gICAgbGV0IGRhdGEgPSBuZXcgTWFwKClcblxuICAgIGRvY3VtZW50ID0gRG9jdW1lbnQuZnJvbUpTT04oZG9jdW1lbnQpXG4gICAgc2VsZWN0aW9uID0gUmFuZ2UuZnJvbUpTT04oc2VsZWN0aW9uKVxuICAgIHNjaGVtYSA9IFNjaGVtYS5mcm9tSlNPTihzY2hlbWEpXG5cbiAgICAvLyBBbGxvdyBwbHVnaW5zIHRvIHNldCBhIGRlZmF1bHQgdmFsdWUgZm9yIGBkYXRhYC5cbiAgICBpZiAob3B0aW9ucy5wbHVnaW5zKSB7XG4gICAgICBmb3IgKGNvbnN0IHBsdWdpbiBvZiBvcHRpb25zLnBsdWdpbnMpIHtcbiAgICAgICAgaWYgKHBsdWdpbi5kYXRhKSBkYXRhID0gZGF0YS5tZXJnZShwbHVnaW4uZGF0YSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGVuIG1lcmdlIGluIHRoZSBgZGF0YWAgcHJvdmlkZWQuXG4gICAgaWYgKCdkYXRhJyBpbiBvYmplY3QpIHtcbiAgICAgIGRhdGEgPSBkYXRhLm1lcmdlKG9iamVjdC5kYXRhKVxuICAgIH1cblxuICAgIGlmIChzZWxlY3Rpb24uaXNVbnNldCkge1xuICAgICAgY29uc3QgdGV4dCA9IGRvY3VtZW50LmdldEZpcnN0VGV4dCgpXG4gICAgICBpZiAodGV4dCkgc2VsZWN0aW9uID0gc2VsZWN0aW9uLmNvbGxhcHNlVG9TdGFydE9mKHRleHQpXG4gICAgfVxuXG4gICAgbGV0IHZhbHVlID0gbmV3IFZhbHVlKHtcbiAgICAgIGRhdGEsXG4gICAgICBkb2N1bWVudCxcbiAgICAgIHNlbGVjdGlvbixcbiAgICAgIHNjaGVtYSxcbiAgICB9KVxuXG4gICAgaWYgKG9wdGlvbnMubm9ybWFsaXplICE9PSBmYWxzZSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5jaGFuZ2UoeyBzYXZlOiBmYWxzZSB9KS5ub3JtYWxpemUoKS52YWx1ZVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGBmcm9tSlNgLlxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTID0gVmFsdWUuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBgdmFsdWVgIGlzIGEgYFZhbHVlYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc1ZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlW01PREVMX1RZUEVTLlZBTFVFXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPYmplY3QuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gJ3ZhbHVlJ1xuICB9XG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgbG9nZ2VyLmRlcHJlY2F0ZSgnc2xhdGVAMC4zMi4wJywgJ1RoZSBga2luZGAgcHJvcGVydHkgb2YgU2xhdGUgb2JqZWN0cyBoYXMgYmVlbiByZW5hbWVkIHRvIGBvYmplY3RgLicpXG4gICAgcmV0dXJuIHRoaXMub2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQXJlIHRoZXJlIHVuZG9hYmxlIGV2ZW50cz9cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGhhc1VuZG9zKCkge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnkudW5kb3Muc2l6ZSA+IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBBcmUgdGhlcmUgcmVkb2FibGUgZXZlbnRzP1xuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaGFzUmVkb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5yZWRvcy5zaXplID4gMFxuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBibHVycmVkP1xuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNCbHVycmVkKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc0JsdXJyZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gZm9jdXNlZD9cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzRm9jdXNlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNGb2N1c2VkXG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGNvbGxhcHNlZD9cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzQ29sbGFwc2VkKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc0NvbGxhcHNlZFxuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBleHBhbmRlZD9cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzRXhwYW5kZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzRXhwYW5kZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gYmFja3dhcmQ/XG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IGlzQmFja3dhcmRcbiAgICovXG5cbiAgZ2V0IGlzQmFja3dhcmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzQmFja3dhcmRcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gZm9yd2FyZD9cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzRm9yd2FyZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNGb3J3YXJkXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHN0YXJ0IGtleS5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgc3RhcnRLZXkoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLnN0YXJ0S2V5XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGVuZCBrZXkuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGVuZEtleSgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uZW5kS2V5XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHN0YXJ0IG9mZnNldC5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgc3RhcnRPZmZzZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLnN0YXJ0T2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGVuZCBvZmZzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGVuZE9mZnNldCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uZW5kT2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGFuY2hvciBrZXkuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGFuY2hvcktleSgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uYW5jaG9yS2V5XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGZvY3VzIGtleS5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgZm9jdXNLZXkoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmZvY3VzS2V5XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGFuY2hvciBvZmZzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGFuY2hvck9mZnNldCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uYW5jaG9yT2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGZvY3VzIG9mZnNldC5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgZm9jdXNPZmZzZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmZvY3VzT2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHN0YXJ0IHRleHQgbm9kZSdzIGNsb3Nlc3QgYmxvY2sgcGFyZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCbG9ja31cbiAgICovXG5cbiAgZ2V0IHN0YXJ0QmxvY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRDbG9zZXN0QmxvY2sodGhpcy5zdGFydEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgZW5kIHRleHQgbm9kZSdzIGNsb3Nlc3QgYmxvY2sgcGFyZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCbG9ja31cbiAgICovXG5cbiAgZ2V0IGVuZEJsb2NrKCkge1xuICAgIHJldHVybiB0aGlzLmVuZEtleSAmJiB0aGlzLmRvY3VtZW50LmdldENsb3Nlc3RCbG9jayh0aGlzLmVuZEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgYW5jaG9yIHRleHQgbm9kZSdzIGNsb3Nlc3QgYmxvY2sgcGFyZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCbG9ja31cbiAgICovXG5cbiAgZ2V0IGFuY2hvckJsb2NrKCkge1xuICAgIHJldHVybiB0aGlzLmFuY2hvcktleSAmJiB0aGlzLmRvY3VtZW50LmdldENsb3Nlc3RCbG9jayh0aGlzLmFuY2hvcktleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgZm9jdXMgdGV4dCBub2RlJ3MgY2xvc2VzdCBibG9jayBwYXJlbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jsb2NrfVxuICAgKi9cblxuICBnZXQgZm9jdXNCbG9jaygpIHtcbiAgICByZXR1cm4gdGhpcy5mb2N1c0tleSAmJiB0aGlzLmRvY3VtZW50LmdldENsb3Nlc3RCbG9jayh0aGlzLmZvY3VzS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBzdGFydCB0ZXh0IG5vZGUncyBjbG9zZXN0IGlubGluZSBwYXJlbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0lubGluZX1cbiAgICovXG5cbiAgZ2V0IHN0YXJ0SW5saW5lKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0S2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZSh0aGlzLnN0YXJ0S2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBlbmQgdGV4dCBub2RlJ3MgY2xvc2VzdCBpbmxpbmUgcGFyZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtJbmxpbmV9XG4gICAqL1xuXG4gIGdldCBlbmRJbmxpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5kS2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZSh0aGlzLmVuZEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgYW5jaG9yIHRleHQgbm9kZSdzIGNsb3Nlc3QgaW5saW5lIHBhcmVudC5cbiAgICpcbiAgICogQHJldHVybiB7SW5saW5lfVxuICAgKi9cblxuICBnZXQgYW5jaG9ySW5saW5lKCkge1xuICAgIHJldHVybiB0aGlzLmFuY2hvcktleSAmJiB0aGlzLmRvY3VtZW50LmdldENsb3Nlc3RJbmxpbmUodGhpcy5hbmNob3JLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGZvY3VzIHRleHQgbm9kZSdzIGNsb3Nlc3QgaW5saW5lIHBhcmVudC5cbiAgICpcbiAgICogQHJldHVybiB7SW5saW5lfVxuICAgKi9cblxuICBnZXQgZm9jdXNJbmxpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZm9jdXNLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRDbG9zZXN0SW5saW5lKHRoaXMuZm9jdXNLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHN0YXJ0IHRleHQgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgZ2V0IHN0YXJ0VGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydEtleSAmJiB0aGlzLmRvY3VtZW50LmdldERlc2NlbmRhbnQodGhpcy5zdGFydEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgZW5kIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHR9XG4gICAqL1xuXG4gIGdldCBlbmRUZXh0KCkge1xuICAgIHJldHVybiB0aGlzLmVuZEtleSAmJiB0aGlzLmRvY3VtZW50LmdldERlc2NlbmRhbnQodGhpcy5lbmRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGFuY2hvciBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICBnZXQgYW5jaG9yVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5hbmNob3JLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXREZXNjZW5kYW50KHRoaXMuYW5jaG9yS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBmb2N1cyBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICBnZXQgZm9jdXNUZXh0KCkge1xuICAgIHJldHVybiB0aGlzLmZvY3VzS2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0RGVzY2VuZGFudCh0aGlzLmZvY3VzS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmV4dCBibG9jayBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCbG9ja31cbiAgICovXG5cbiAgZ2V0IG5leHRCbG9jaygpIHtcbiAgICByZXR1cm4gdGhpcy5lbmRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXROZXh0QmxvY2sodGhpcy5lbmRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwcmV2aW91cyBibG9jayBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCbG9ja31cbiAgICovXG5cbiAgZ2V0IHByZXZpb3VzQmxvY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRQcmV2aW91c0Jsb2NrKHRoaXMuc3RhcnRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBuZXh0IGlubGluZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtJbmxpbmV9XG4gICAqL1xuXG4gIGdldCBuZXh0SW5saW5lKCkge1xuICAgIHJldHVybiB0aGlzLmVuZEtleSAmJiB0aGlzLmRvY3VtZW50LmdldE5leHRJbmxpbmUodGhpcy5lbmRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwcmV2aW91cyBpbmxpbmUgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7SW5saW5lfVxuICAgKi9cblxuICBnZXQgcHJldmlvdXNJbmxpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRQcmV2aW91c0lubGluZSh0aGlzLnN0YXJ0S2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmV4dCB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHR9XG4gICAqL1xuXG4gIGdldCBuZXh0VGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXROZXh0VGV4dCh0aGlzLmVuZEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHByZXZpb3VzIHRleHQgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgZ2V0IHByZXZpb3VzVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydEtleSAmJiB0aGlzLmRvY3VtZW50LmdldFByZXZpb3VzVGV4dCh0aGlzLnN0YXJ0S2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2hhcmFjdGVycyBpbiB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8Q2hhcmFjdGVyPn1cbiAgICovXG5cbiAgZ2V0IGNoYXJhY3RlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzVW5zZXRcbiAgICAgID8gbmV3IExpc3QoKVxuICAgICAgOiB0aGlzLmRvY3VtZW50LmdldENoYXJhY3RlcnNBdFJhbmdlKHRoaXMuc2VsZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbWFya3Mgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldCBtYXJrcygpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNVbnNldFxuICAgICAgPyBuZXcgU2V0KClcbiAgICAgIDogdGhpcy5zZWxlY3Rpb24ubWFya3MgfHwgdGhpcy5kb2N1bWVudC5nZXRNYXJrc0F0UmFuZ2UodGhpcy5zZWxlY3Rpb24pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBhY3RpdmUgbWFya3Mgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldCBhY3RpdmVNYXJrcygpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNVbnNldFxuICAgICAgPyBuZXcgU2V0KClcbiAgICAgIDogdGhpcy5zZWxlY3Rpb24ubWFya3MgfHwgdGhpcy5kb2N1bWVudC5nZXRBY3RpdmVNYXJrc0F0UmFuZ2UodGhpcy5zZWxlY3Rpb24pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBibG9jayBub2RlcyBpbiB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8QmxvY2s+fVxuICAgKi9cblxuICBnZXQgYmxvY2tzKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc1Vuc2V0XG4gICAgICA/IG5ldyBMaXN0KClcbiAgICAgIDogdGhpcy5kb2N1bWVudC5nZXRCbG9ja3NBdFJhbmdlKHRoaXMuc2VsZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZnJhZ21lbnQgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtEb2N1bWVudH1cbiAgICovXG5cbiAgZ2V0IGZyYWdtZW50KCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc1Vuc2V0XG4gICAgICA/IERvY3VtZW50LmNyZWF0ZSgpXG4gICAgICA6IHRoaXMuZG9jdW1lbnQuZ2V0RnJhZ21lbnRBdFJhbmdlKHRoaXMuc2VsZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaW5saW5lIG5vZGVzIGluIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7TGlzdDxJbmxpbmU+fVxuICAgKi9cblxuICBnZXQgaW5saW5lcygpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNVbnNldFxuICAgICAgPyBuZXcgTGlzdCgpXG4gICAgICA6IHRoaXMuZG9jdW1lbnQuZ2V0SW5saW5lc0F0UmFuZ2UodGhpcy5zZWxlY3Rpb24pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0ZXh0IG5vZGVzIGluIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7TGlzdDxUZXh0Pn1cbiAgICovXG5cbiAgZ2V0IHRleHRzKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc1Vuc2V0XG4gICAgICA/IG5ldyBMaXN0KClcbiAgICAgIDogdGhpcy5kb2N1bWVudC5nZXRUZXh0c0F0UmFuZ2UodGhpcy5zZWxlY3Rpb24pXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNFbXB0eSgpIHtcbiAgICBpZiAodGhpcy5pc0NvbGxhcHNlZCkgcmV0dXJuIHRydWVcbiAgICBpZiAodGhpcy5lbmRPZmZzZXQgIT0gMCAmJiB0aGlzLnN0YXJ0T2Zmc2V0ICE9IDApIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0aGlzLmZyYWdtZW50LnRleHQubGVuZ3RoID09IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBzZWxlY3Rpb24gaXMgY29sbGFwc2VkIGluIGEgdm9pZCBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNJblZvaWQoKSB7XG4gICAgaWYgKHRoaXMuaXNFeHBhbmRlZCkgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuaGFzVm9pZFBhcmVudCh0aGlzLnN0YXJ0S2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQ2hhbmdlYCB3aXRoIHRoZSBjdXJyZW50IHZhbHVlIGFzIGEgc3RhcnRpbmcgcG9pbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgKiBAcmV0dXJuIHtDaGFuZ2V9XG4gICAqL1xuXG4gIGNoYW5nZShhdHRycyA9IHt9KSB7XG4gICAgY29uc3QgQ2hhbmdlID0gcmVxdWlyZSgnLi9jaGFuZ2UnKS5kZWZhdWx0XG4gICAgcmV0dXJuIG5ldyBDaGFuZ2UoeyAuLi5hdHRycywgdmFsdWU6IHRoaXMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04ob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAgb2JqZWN0OiB0aGlzLm9iamVjdCxcbiAgICAgIGRvY3VtZW50OiB0aGlzLmRvY3VtZW50LnRvSlNPTihvcHRpb25zKSxcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5wcmVzZXJ2ZURhdGEpIHtcbiAgICAgIG9iamVjdC5kYXRhID0gdGhpcy5kYXRhLnRvSlNPTigpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJlc2VydmVEZWNvcmF0aW9ucykge1xuICAgICAgb2JqZWN0LmRlY29yYXRpb25zID0gdGhpcy5kZWNvcmF0aW9ucyA/IHRoaXMuZGVjb3JhdGlvbnMudG9BcnJheSgpLm1hcChkID0+IGQudG9KU09OKCkpIDogbnVsbFxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByZXNlcnZlSGlzdG9yeSkge1xuICAgICAgb2JqZWN0Lmhpc3RvcnkgPSB0aGlzLmhpc3RvcnkudG9KU09OKClcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5wcmVzZXJ2ZVNlbGVjdGlvbikge1xuICAgICAgb2JqZWN0LnNlbGVjdGlvbiA9IHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJlc2VydmVTY2hlbWEpIHtcbiAgICAgIG9iamVjdC5zY2hlbWEgPSB0aGlzLnNjaGVtYS50b0pTT04oKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByZXNlcnZlU2VsZWN0aW9uICYmICFvcHRpb25zLnByZXNlcnZlS2V5cykge1xuICAgICAgY29uc3QgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB0aGlzXG4gICAgICBvYmplY3Quc2VsZWN0aW9uLmFuY2hvclBhdGggPSBzZWxlY3Rpb24uaXNTZXQgPyBkb2N1bWVudC5nZXRQYXRoKHNlbGVjdGlvbi5hbmNob3JLZXkpIDogbnVsbFxuICAgICAgb2JqZWN0LnNlbGVjdGlvbi5mb2N1c1BhdGggPSBzZWxlY3Rpb24uaXNTZXQgPyBkb2N1bWVudC5nZXRQYXRoKHNlbGVjdGlvbi5mb2N1c0tleSkgOiBudWxsXG4gICAgICBkZWxldGUgb2JqZWN0LnNlbGVjdGlvbi5hbmNob3JLZXlcbiAgICAgIGRlbGV0ZSBvYmplY3Quc2VsZWN0aW9uLmZvY3VzS2V5XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGB0b0pTYC5cbiAgICovXG5cbiAgdG9KUyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKG9wdGlvbnMpXG4gIH1cblxufVxuXG4vKipcbiAqIEF0dGFjaCBhIHBzZXVkby1zeW1ib2wgZm9yIHR5cGUgY2hlY2tpbmcuXG4gKi9cblxuVmFsdWUucHJvdG90eXBlW01PREVMX1RZUEVTLlZBTFVFXSA9IHRydWVcblxuLyoqXG4gKiBFeHBvcnQuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgVmFsdWVcbiJdfQ==