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

var _character = require('./character');

var _character2 = _interopRequireDefault(_character);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _leaf = require('./leaf');

var _leaf2 = _interopRequireDefault(_leaf);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

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
  characters: new _immutable.List(),
  key: undefined
};

/**
 * Text.
 *
 * @type {Text}
 */

var Text = function (_Record) {
  _inherits(Text, _Record);

  function Text() {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).apply(this, arguments));
  }

  _createClass(Text, [{
    key: 'addMark',


    /**
     * Add a `mark` at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @return {Text}
     */

    value: function addMark(index, length, mark) {
      var marks = new _immutable.Set([mark]);
      return this.addMarks(index, length, marks);
    }

    /**
     * Add a `set` of marks at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Set<Mark>} set
     * @return {Text}
     */

  }, {
    key: 'addMarks',
    value: function addMarks(index, length, set) {
      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char = char,
            marks = _char.marks;

        marks = marks.union(set);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Derive a set of decorated characters with `decorations`.
     *
     * @param {List<Decoration>} decorations
     * @return {List<Character>}
     */

  }, {
    key: 'getDecoratedCharacters',
    value: function getDecoratedCharacters(decorations) {
      var node = this;
      var _node = node,
          key = _node.key,
          characters = _node.characters;

      // PERF: Exit early if there are no characters to be decorated.

      if (characters.size == 0) return characters;

      decorations.forEach(function (range) {
        var startKey = range.startKey,
            endKey = range.endKey,
            startOffset = range.startOffset,
            endOffset = range.endOffset,
            marks = range.marks;

        var hasStart = startKey == key;
        var hasEnd = endKey == key;
        var index = hasStart ? startOffset : 0;
        var length = hasEnd ? endOffset - index : characters.size;
        node = node.addMarks(index, length, marks);
      });

      return node.characters;
    }

    /**
     * Get the decorations for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Array}
     */

  }, {
    key: 'getDecorations',
    value: function getDecorations(schema) {
      return schema.__getDecorations(this);
    }

    /**
     * Derive the leaves for a list of `characters`.
     *
     * @param {Array|Void} decorations (optional)
     * @return {List<Leaf>}
     */

  }, {
    key: 'getLeaves',
    value: function getLeaves() {
      var decorations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var characters = this.getDecoratedCharacters(decorations);
      var leaves = [];

      // PERF: cache previous values for faster lookup.
      var prevChar = void 0;
      var prevLeaf = void 0;

      // If there are no characters, return one empty range.
      if (characters.size == 0) {
        leaves.push({});
      }

      // Otherwise, loop the characters and build the leaves...
      else {
          characters.forEach(function (char, i) {
            var marks = char.marks,
                text = char.text;

            // The first one can always just be created.

            if (i == 0) {
              prevChar = char;
              prevLeaf = { text: text, marks: marks };
              leaves.push(prevLeaf);
              return;
            }

            // Otherwise, compare the current and previous marks.
            var prevMarks = prevChar.marks;
            var isSame = (0, _immutable.is)(marks, prevMarks);

            // If the marks are the same, add the text to the previous range.
            if (isSame) {
              prevChar = char;
              prevLeaf.text += text;
              return;
            }

            // Otherwise, create a new range.
            prevChar = char;
            prevLeaf = { text: text, marks: marks };
            leaves.push(prevLeaf);
          }, []);
        }

      // PERF: convert the leaves to immutable objects after iterating.
      leaves = new _immutable.List(leaves.map(function (object) {
        return new _leaf2.default(object);
      }));

      // Return the leaves.
      return leaves;
    }

    /**
     * Get all of the marks on the text.
     *
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getMarks',
    value: function getMarks() {
      var array = this.getMarksAsArray();
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get all of the marks on the text as an array
     *
     * @return {Array}
     */

  }, {
    key: 'getMarksAsArray',
    value: function getMarksAsArray() {
      return this.characters.reduce(function (array, char) {
        return array.concat(char.marks.toArray());
      }, []);
    }

    /**
     * Get the marks on the text at `index`.
     *
     * @param {Number} index
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksAtIndex',
    value: function getMarksAtIndex(index) {
      if (index == 0) return _mark2.default.createSet();
      var characters = this.characters;

      var char = characters.get(index - 1);
      if (!char) return _mark2.default.createSet();
      return char.marks;
    }

    /**
     * Get a node by `key`, to parallel other nodes.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNode',
    value: function getNode(key) {
      return this.key == key ? this : null;
    }

    /**
     * Check if the node has a node by `key`, to parallel other nodes.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasNode',
    value: function hasNode(key) {
      return !!this.getNode(key);
    }

    /**
     * Insert `text` at `index`.
     *
     * @param {Numbder} index
     * @param {String} text
     * @param {String} marks (optional)
     * @return {Text}
     */

  }, {
    key: 'insertText',
    value: function insertText(index, text, marks) {
      var characters = this.characters;

      var chars = _character2.default.createList(text.split('').map(function (char) {
        return { text: char, marks: marks };
      }));

      characters = characters.slice(0, index).concat(chars).concat(characters.slice(index));

      return this.set('characters', characters);
    }

    /**
     * Regenerate the node's key.
     *
     * @return {Text}
     */

  }, {
    key: 'regenerateKey',
    value: function regenerateKey() {
      var key = (0, _generateKey2.default)();
      return this.set('key', key);
    }

    /**
     * Remove a `mark` at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @return {Text}
     */

  }, {
    key: 'removeMark',
    value: function removeMark(index, length, mark) {
      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char2 = char,
            marks = _char2.marks;

        marks = marks.remove(mark);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Remove text from the text node at `index` for `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @return {Text}
     */

  }, {
    key: 'removeText',
    value: function removeText(index, length) {
      var characters = this.characters;

      var start = index;
      var end = index + length;
      characters = characters.filterNot(function (char, i) {
        return start <= i && i < end;
      });
      return this.set('characters', characters);
    }

    /**
     * Return a JSON representation of the text.
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
        leaves: this.getLeaves().toArray().map(function (r) {
          return r.toJSON();
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

    /**
     * Update a `mark` at `index` and `length` with `properties`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @param {Object} properties
     * @return {Text}
     */

  }, {
    key: 'updateMark',
    value: function updateMark(index, length, mark, properties) {
      var newMark = mark.merge(properties);

      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char3 = char,
            marks = _char3.marks;

        if (!marks.has(mark)) return char;
        marks = marks.remove(mark);
        marks = marks.add(newMark);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Validate the text node against a `schema`.
     *
     * @param {Schema} schema
     * @return {Object|Void}
     */

  }, {
    key: 'validate',
    value: function validate(schema) {
      return schema.validateNode(this);
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get() {
      return 'text';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of the node.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.characters.reduce(function (string, char) {
        return string + char.text;
      }, '');
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Text` with `attrs`.
     *
     * @param {Object|Array|List|String|Text} attrs
     * @return {Text}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (Text.isText(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { leaves: [{ text: attrs }] };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        if (attrs.text) {
          var _attrs = attrs,
              text = _attrs.text,
              marks = _attrs.marks,
              key = _attrs.key;

          attrs = { key: key, leaves: [{ text: text, marks: marks }] };
        }

        return Text.fromJSON(attrs);
      }

      throw new Error('`Text.create` only accepts objects, arrays, strings or texts, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Texts` from `elements`.
     *
     * @param {Array<Text|Object>|List<Text|Object>} elements
     * @return {List<Text>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Text.create));
        return list;
      }

      throw new Error('`Text.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Text` from a JSON `object`.
     *
     * @param {Object|Text} object
     * @return {Text}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Text.isText(object)) {
        return object;
      }

      var _object$leaves = object.leaves,
          leaves = _object$leaves === undefined ? [] : _object$leaves,
          _object$key = object.key,
          key = _object$key === undefined ? (0, _generateKey2.default)() : _object$key;


      var characters = leaves.map(_leaf2.default.fromJSON).reduce(function (l, r) {
        return l.concat(r.getCharacters());
      }, new _immutable.List());

      var node = new Text({
        characters: characters,
        key: key
      });

      return node;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isText',


    /**
     * Check if `any` is a `Text`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isText(any) {
      return !!(any && any[_modelTypes2.default.TEXT]);
    }

    /**
     * Check if `any` is a list of texts.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isTextList',
    value: function isTextList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Text.isText(item);
      });
    }
  }]);

  return Text;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Text.fromJS = Text.fromJSON;
Text.prototype[_modelTypes2.default.TEXT] = true;

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Text.prototype, ['getMarks', 'getMarksAsArray'], {
  takesArguments: false
});

(0, _memoize2.default)(Text.prototype, ['getDecoratedCharacters', 'getDecorations', 'getLeaves', 'getMarksAtIndex', 'validate'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Text}
 */

exports.default = Text;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvdGV4dC5qcyJdLCJuYW1lcyI6WyJERUZBVUxUUyIsImNoYXJhY3RlcnMiLCJrZXkiLCJ1bmRlZmluZWQiLCJUZXh0IiwiaW5kZXgiLCJsZW5ndGgiLCJtYXJrIiwibWFya3MiLCJhZGRNYXJrcyIsInNldCIsIm1hcCIsImNoYXIiLCJpIiwidW5pb24iLCJkZWNvcmF0aW9ucyIsIm5vZGUiLCJzaXplIiwiZm9yRWFjaCIsInJhbmdlIiwic3RhcnRLZXkiLCJlbmRLZXkiLCJzdGFydE9mZnNldCIsImVuZE9mZnNldCIsImhhc1N0YXJ0IiwiaGFzRW5kIiwic2NoZW1hIiwiX19nZXREZWNvcmF0aW9ucyIsImdldERlY29yYXRlZENoYXJhY3RlcnMiLCJsZWF2ZXMiLCJwcmV2Q2hhciIsInByZXZMZWFmIiwicHVzaCIsInRleHQiLCJwcmV2TWFya3MiLCJpc1NhbWUiLCJvYmplY3QiLCJhcnJheSIsImdldE1hcmtzQXNBcnJheSIsInJlZHVjZSIsImNvbmNhdCIsInRvQXJyYXkiLCJjcmVhdGVTZXQiLCJnZXQiLCJnZXROb2RlIiwiY2hhcnMiLCJjcmVhdGVMaXN0Iiwic3BsaXQiLCJzbGljZSIsInJlbW92ZSIsInN0YXJ0IiwiZW5kIiwiZmlsdGVyTm90Iiwib3B0aW9ucyIsImdldExlYXZlcyIsInIiLCJ0b0pTT04iLCJwcmVzZXJ2ZUtleXMiLCJwcm9wZXJ0aWVzIiwibmV3TWFyayIsIm1lcmdlIiwiaGFzIiwiYWRkIiwidmFsaWRhdGVOb2RlIiwiZGVwcmVjYXRlIiwic3RyaW5nIiwiYXR0cnMiLCJpc1RleHQiLCJmcm9tSlNPTiIsIkVycm9yIiwiZWxlbWVudHMiLCJpc0xpc3QiLCJBcnJheSIsImlzQXJyYXkiLCJsaXN0IiwiY3JlYXRlIiwibCIsImdldENoYXJhY3RlcnMiLCJhbnkiLCJURVhUIiwiZXZlcnkiLCJpdGVtIiwiZnJvbUpTIiwicHJvdG90eXBlIiwidGFrZXNBcmd1bWVudHMiXSwibWFwcGluZ3MiOiI7Ozs7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QkFBWUMsSUFBaEIsQ0FBVCxDQUFSO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzsrQkFPa0JELEcsRUFBSztBQUNyQixhQUFPLGdCQUFLUCxNQUFMLENBQVlPLEdBQVosS0FBb0JBLElBQUlFLEtBQUosQ0FBVTtBQUFBLGVBQVE1RSxLQUFLK0QsTUFBTCxDQUFZYyxJQUFaLENBQVI7QUFBQSxPQUFWLENBQTNCO0FBQ0Q7Ozs7RUFyR2dCLHVCQUFPakYsUUFBUCxDOztBQW9kbkI7Ozs7QUFwZE1JLEksQ0ErRUc4RSxNLEdBQVM5RSxLQUFLZ0UsUTtBQXlZdkJoRSxLQUFLK0UsU0FBTCxDQUFlLHFCQUFZSixJQUEzQixJQUFtQyxJQUFuQzs7QUFFQTs7OztBQUlBLHVCQUFRM0UsS0FBSytFLFNBQWIsRUFBd0IsQ0FDdEIsVUFEc0IsRUFFdEIsaUJBRnNCLENBQXhCLEVBR0c7QUFDREMsa0JBQWdCO0FBRGYsQ0FISDs7QUFPQSx1QkFBUWhGLEtBQUsrRSxTQUFiLEVBQXdCLENBQ3RCLHdCQURzQixFQUV0QixnQkFGc0IsRUFHdEIsV0FIc0IsRUFJdEIsaUJBSnNCLEVBS3RCLFVBTHNCLENBQXhCLEVBTUc7QUFDREMsa0JBQWdCO0FBRGYsQ0FOSDs7QUFVQTs7Ozs7O2tCQU1laEYsSSIsImZpbGUiOiJ0ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdpcy1wbGFpbi1vYmplY3QnXG5pbXBvcnQgbG9nZ2VyIGZyb20gJ3NsYXRlLWRldi1sb2dnZXInXG5pbXBvcnQgeyBMaXN0LCBPcmRlcmVkU2V0LCBSZWNvcmQsIFNldCwgaXMgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBDaGFyYWN0ZXIgZnJvbSAnLi9jaGFyYWN0ZXInXG5pbXBvcnQgTWFyayBmcm9tICcuL21hcmsnXG5pbXBvcnQgTGVhZiBmcm9tICcuL2xlYWYnXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IGdlbmVyYXRlS2V5IGZyb20gJy4uL3V0aWxzL2dlbmVyYXRlLWtleSdcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uL3V0aWxzL21lbW9pemUnXG5cbi8qKlxuICogRGVmYXVsdCBwcm9wZXJ0aWVzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIGNoYXJhY3RlcnM6IG5ldyBMaXN0KCksXG4gIGtleTogdW5kZWZpbmVkLFxufVxuXG4vKipcbiAqIFRleHQuXG4gKlxuICogQHR5cGUge1RleHR9XG4gKi9cblxuY2xhc3MgVGV4dCBleHRlbmRzIFJlY29yZChERUZBVUxUUykge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFRleHRgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8QXJyYXl8TGlzdHxTdHJpbmd8VGV4dH0gYXR0cnNcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9ICcnKSB7XG4gICAgaWYgKFRleHQuaXNUZXh0KGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhdHRycyA9PSAnc3RyaW5nJykge1xuICAgICAgYXR0cnMgPSB7IGxlYXZlczogW3sgdGV4dDogYXR0cnMgfV0gfVxuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgaWYgKGF0dHJzLnRleHQpIHtcbiAgICAgICAgY29uc3QgeyB0ZXh0LCBtYXJrcywga2V5IH0gPSBhdHRyc1xuICAgICAgICBhdHRycyA9IHsga2V5LCBsZWF2ZXM6IFt7IHRleHQsIG1hcmtzIH1dIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFRleHQuZnJvbUpTT04oYXR0cnMpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBUZXh0LmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cywgYXJyYXlzLCBzdHJpbmdzIG9yIHRleHRzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpc3Qgb2YgYFRleHRzYCBmcm9tIGBlbGVtZW50c2AuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8VGV4dHxPYmplY3Q+fExpc3Q8VGV4dHxPYmplY3Q+fSBlbGVtZW50c1xuICAgKiBAcmV0dXJuIHtMaXN0PFRleHQ+fVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlTGlzdChlbGVtZW50cyA9IFtdKSB7XG4gICAgaWYgKExpc3QuaXNMaXN0KGVsZW1lbnRzKSB8fCBBcnJheS5pc0FycmF5KGVsZW1lbnRzKSkge1xuICAgICAgY29uc3QgbGlzdCA9IG5ldyBMaXN0KGVsZW1lbnRzLm1hcChUZXh0LmNyZWF0ZSkpXG4gICAgICByZXR1cm4gbGlzdFxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgVGV4dC5jcmVhdGVMaXN0XFxgIG9ubHkgYWNjZXB0cyBhcnJheXMgb3IgbGlzdHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2VsZW1lbnRzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYFRleHRgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxUZXh0fSBvYmplY3RcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGlmIChUZXh0LmlzVGV4dChvYmplY3QpKSB7XG4gICAgICByZXR1cm4gb2JqZWN0XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgbGVhdmVzID0gW10sXG4gICAgICBrZXkgPSBnZW5lcmF0ZUtleSgpLFxuICAgIH0gPSBvYmplY3RcblxuICAgIGNvbnN0IGNoYXJhY3RlcnMgPSBsZWF2ZXNcbiAgICAgIC5tYXAoTGVhZi5mcm9tSlNPTilcbiAgICAgIC5yZWR1Y2UoKGwsIHIpID0+IGwuY29uY2F0KHIuZ2V0Q2hhcmFjdGVycygpKSwgbmV3IExpc3QoKSlcblxuICAgIGNvbnN0IG5vZGUgPSBuZXcgVGV4dCh7XG4gICAgICBjaGFyYWN0ZXJzLFxuICAgICAga2V5LFxuICAgIH0pXG5cbiAgICByZXR1cm4gbm9kZVxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGBmcm9tSlNgLlxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTID0gVGV4dC5mcm9tSlNPTlxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGBUZXh0YC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNUZXh0KGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLlRFWFRdKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgbGlzdMKgb2YgdGV4dHMuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzVGV4dExpc3QoYW55KSB7XG4gICAgcmV0dXJuIExpc3QuaXNMaXN0KGFueSkgJiYgYW55LmV2ZXJ5KGl0ZW0gPT4gVGV4dC5pc1RleHQoaXRlbSkpXG4gIH1cblxuICAvKipcbiAgICogT2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgcmV0dXJuICd0ZXh0J1xuICB9XG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgbG9nZ2VyLmRlcHJlY2F0ZSgnc2xhdGVAMC4zMi4wJywgJ1RoZSBga2luZGAgcHJvcGVydHkgb2YgU2xhdGUgb2JqZWN0cyBoYXMgYmVlbiByZW5hbWVkIHRvIGBvYmplY3RgLicpXG4gICAgcmV0dXJuIHRoaXMub2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIG5vZGUgZW1wdHk/XG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLnRleHQgPT0gJydcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvbmNhdGVuYXRlZCB0ZXh0IG9mIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCB0ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLmNoYXJhY3RlcnMucmVkdWNlKChzdHJpbmcsIGNoYXIpID0+IHN0cmluZyArIGNoYXIudGV4dCwgJycpXG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgYG1hcmtgIGF0IGBpbmRleGAgYW5kIGBsZW5ndGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aFxuICAgKiBAcGFyYW0ge01hcmt9IG1hcmtcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgYWRkTWFyayhpbmRleCwgbGVuZ3RoLCBtYXJrKSB7XG4gICAgY29uc3QgbWFya3MgPSBuZXcgU2V0KFttYXJrXSlcbiAgICByZXR1cm4gdGhpcy5hZGRNYXJrcyhpbmRleCwgbGVuZ3RoLCBtYXJrcylcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBgc2V0YCBvZiBtYXJrcyBhdCBgaW5kZXhgIGFuZCBgbGVuZ3RoYC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcbiAgICogQHBhcmFtIHtTZXQ8TWFyaz59IHNldFxuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICBhZGRNYXJrcyhpbmRleCwgbGVuZ3RoLCBzZXQpIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJzID0gdGhpcy5jaGFyYWN0ZXJzLm1hcCgoY2hhciwgaSkgPT4ge1xuICAgICAgaWYgKGkgPCBpbmRleCkgcmV0dXJuIGNoYXJcbiAgICAgIGlmIChpID49IGluZGV4ICsgbGVuZ3RoKSByZXR1cm4gY2hhclxuICAgICAgbGV0IHsgbWFya3MgfSA9IGNoYXJcbiAgICAgIG1hcmtzID0gbWFya3MudW5pb24oc2V0KVxuICAgICAgY2hhciA9IGNoYXIuc2V0KCdtYXJrcycsIG1hcmtzKVxuICAgICAgcmV0dXJuIGNoYXJcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdjaGFyYWN0ZXJzJywgY2hhcmFjdGVycylcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXJpdmUgYSBzZXQgb2YgZGVjb3JhdGVkIGNoYXJhY3RlcnMgd2l0aCBgZGVjb3JhdGlvbnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge0xpc3Q8RGVjb3JhdGlvbj59IGRlY29yYXRpb25zXG4gICAqIEByZXR1cm4ge0xpc3Q8Q2hhcmFjdGVyPn1cbiAgICovXG5cbiAgZ2V0RGVjb3JhdGVkQ2hhcmFjdGVycyhkZWNvcmF0aW9ucykge1xuICAgIGxldCBub2RlID0gdGhpc1xuICAgIGNvbnN0IHsga2V5LCBjaGFyYWN0ZXJzIH0gPSBub2RlXG5cbiAgICAvLyBQRVJGOiBFeGl0IGVhcmx5IGlmIHRoZXJlIGFyZSBubyBjaGFyYWN0ZXJzIHRvIGJlIGRlY29yYXRlZC5cbiAgICBpZiAoY2hhcmFjdGVycy5zaXplID09IDApIHJldHVybiBjaGFyYWN0ZXJzXG5cbiAgICBkZWNvcmF0aW9ucy5mb3JFYWNoKChyYW5nZSkgPT4ge1xuICAgICAgY29uc3QgeyBzdGFydEtleSwgZW5kS2V5LCBzdGFydE9mZnNldCwgZW5kT2Zmc2V0LCBtYXJrcyB9ID0gcmFuZ2VcbiAgICAgIGNvbnN0IGhhc1N0YXJ0ID0gc3RhcnRLZXkgPT0ga2V5XG4gICAgICBjb25zdCBoYXNFbmQgPSBlbmRLZXkgPT0ga2V5XG4gICAgICBjb25zdCBpbmRleCA9IGhhc1N0YXJ0ID8gc3RhcnRPZmZzZXQgOiAwXG4gICAgICBjb25zdCBsZW5ndGggPSBoYXNFbmQgPyBlbmRPZmZzZXQgLSBpbmRleCA6IGNoYXJhY3RlcnMuc2l6ZVxuICAgICAgbm9kZSA9IG5vZGUuYWRkTWFya3MoaW5kZXgsIGxlbmd0aCwgbWFya3MpXG4gICAgfSlcblxuICAgIHJldHVybiBub2RlLmNoYXJhY3RlcnNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRlY29yYXRpb25zIGZvciB0aGUgbm9kZSBmcm9tIGEgYHNjaGVtYWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U2NoZW1hfSBzY2hlbWFcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldERlY29yYXRpb25zKHNjaGVtYSkge1xuICAgIHJldHVybiBzY2hlbWEuX19nZXREZWNvcmF0aW9ucyh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIERlcml2ZSB0aGUgbGVhdmVzIGZvciBhIGxpc3Qgb2YgYGNoYXJhY3RlcnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fFZvaWR9IGRlY29yYXRpb25zIChvcHRpb25hbClcbiAgICogQHJldHVybiB7TGlzdDxMZWFmPn1cbiAgICovXG5cbiAgZ2V0TGVhdmVzKGRlY29yYXRpb25zID0gW10pIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJzID0gdGhpcy5nZXREZWNvcmF0ZWRDaGFyYWN0ZXJzKGRlY29yYXRpb25zKVxuICAgIGxldCBsZWF2ZXMgPSBbXVxuXG4gICAgLy8gUEVSRjogY2FjaGUgcHJldmlvdXMgdmFsdWVzIGZvciBmYXN0ZXIgbG9va3VwLlxuICAgIGxldCBwcmV2Q2hhclxuICAgIGxldCBwcmV2TGVhZlxuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIGNoYXJhY3RlcnMsIHJldHVybiBvbmUgZW1wdHkgcmFuZ2UuXG4gICAgaWYgKGNoYXJhY3RlcnMuc2l6ZSA9PSAwKSB7XG4gICAgICBsZWF2ZXMucHVzaCh7fSlcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGxvb3AgdGhlIGNoYXJhY3RlcnMgYW5kIGJ1aWxkIHRoZSBsZWF2ZXMuLi5cbiAgICBlbHNlIHtcbiAgICAgIGNoYXJhY3RlcnMuZm9yRWFjaCgoY2hhciwgaSkgPT4ge1xuICAgICAgICBjb25zdCB7IG1hcmtzLCB0ZXh0IH0gPSBjaGFyXG5cbiAgICAgICAgLy8gVGhlIGZpcnN0IG9uZSBjYW4gYWx3YXlzIGp1c3QgYmUgY3JlYXRlZC5cbiAgICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICAgIHByZXZDaGFyID0gY2hhclxuICAgICAgICAgIHByZXZMZWFmID0geyB0ZXh0LCBtYXJrcyB9XG4gICAgICAgICAgbGVhdmVzLnB1c2gocHJldkxlYWYpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGNvbXBhcmUgdGhlIGN1cnJlbnQgYW5kIHByZXZpb3VzIG1hcmtzLlxuICAgICAgICBjb25zdCBwcmV2TWFya3MgPSBwcmV2Q2hhci5tYXJrc1xuICAgICAgICBjb25zdCBpc1NhbWUgPSBpcyhtYXJrcywgcHJldk1hcmtzKVxuXG4gICAgICAgIC8vIElmIHRoZSBtYXJrcyBhcmUgdGhlIHNhbWUsIGFkZCB0aGUgdGV4dCB0byB0aGUgcHJldmlvdXMgcmFuZ2UuXG4gICAgICAgIGlmIChpc1NhbWUpIHtcbiAgICAgICAgICBwcmV2Q2hhciA9IGNoYXJcbiAgICAgICAgICBwcmV2TGVhZi50ZXh0ICs9IHRleHRcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgY3JlYXRlIGEgbmV3IHJhbmdlLlxuICAgICAgICBwcmV2Q2hhciA9IGNoYXJcbiAgICAgICAgcHJldkxlYWYgPSB7IHRleHQsIG1hcmtzIH1cbiAgICAgICAgbGVhdmVzLnB1c2gocHJldkxlYWYpXG4gICAgICB9LCBbXSlcbiAgICB9XG5cbiAgICAvLyBQRVJGOiBjb252ZXJ0IHRoZSBsZWF2ZXMgdG8gaW1tdXRhYmxlIG9iamVjdHMgYWZ0ZXIgaXRlcmF0aW5nLlxuICAgIGxlYXZlcyA9IG5ldyBMaXN0KGxlYXZlcy5tYXAob2JqZWN0ID0+IG5ldyBMZWFmKG9iamVjdCkpKVxuXG4gICAgLy8gUmV0dXJuIHRoZSBsZWF2ZXMuXG4gICAgcmV0dXJuIGxlYXZlc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIG1hcmtzIG9uIHRoZSB0ZXh0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPcmRlcmVkU2V0PE1hcms+fVxuICAgKi9cblxuICBnZXRNYXJrcygpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0TWFya3NBc0FycmF5KClcbiAgICByZXR1cm4gbmV3IE9yZGVyZWRTZXQoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3Mgb24gdGhlIHRleHQgYXMgYW4gYXJyYXlcbiAgICpcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldE1hcmtzQXNBcnJheSgpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXJzLnJlZHVjZSgoYXJyYXksIGNoYXIpID0+IHtcbiAgICAgIHJldHVybiBhcnJheS5jb25jYXQoY2hhci5tYXJrcy50b0FycmF5KCkpXG4gICAgfSwgW10pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBtYXJrcyBvbiB0aGUgdGV4dCBhdCBgaW5kZXhgLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICogQHJldHVybiB7U2V0PE1hcms+fVxuICAgKi9cblxuICBnZXRNYXJrc0F0SW5kZXgoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gMCkgcmV0dXJuIE1hcmsuY3JlYXRlU2V0KClcbiAgICBjb25zdCB7IGNoYXJhY3RlcnMgfSA9IHRoaXNcbiAgICBjb25zdCBjaGFyID0gY2hhcmFjdGVycy5nZXQoaW5kZXggLSAxKVxuICAgIGlmICghY2hhcikgcmV0dXJuIE1hcmsuY3JlYXRlU2V0KClcbiAgICByZXR1cm4gY2hhci5tYXJrc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5vZGUgYnkgYGtleWAsIHRvIHBhcmFsbGVsIG90aGVyIG5vZGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Tm9kZShrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5rZXkgPT0ga2V5XG4gICAgICA/IHRoaXNcbiAgICAgIDogbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBub2RlIGhhcyBhIG5vZGUgYnkgYGtleWAsIHRvIHBhcmFsbGVsIG90aGVyIG5vZGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGhhc05vZGUoa2V5KSB7XG4gICAgcmV0dXJuICEhdGhpcy5nZXROb2RlKGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYHRleHRgIGF0IGBpbmRleGAuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmRlcn0gaW5kZXhcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRleHRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1hcmtzIChvcHRpb25hbClcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgaW5zZXJ0VGV4dChpbmRleCwgdGV4dCwgbWFya3MpIHtcbiAgICBsZXQgeyBjaGFyYWN0ZXJzIH0gPSB0aGlzXG4gICAgY29uc3QgY2hhcnMgPSBDaGFyYWN0ZXIuY3JlYXRlTGlzdCh0ZXh0LnNwbGl0KCcnKS5tYXAoY2hhciA9PiAoeyB0ZXh0OiBjaGFyLCBtYXJrcyB9KSkpXG5cbiAgICBjaGFyYWN0ZXJzID0gY2hhcmFjdGVycy5zbGljZSgwLCBpbmRleClcbiAgICAgIC5jb25jYXQoY2hhcnMpXG4gICAgICAuY29uY2F0KGNoYXJhY3RlcnMuc2xpY2UoaW5kZXgpKVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdjaGFyYWN0ZXJzJywgY2hhcmFjdGVycylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdlbmVyYXRlIHRoZSBub2RlJ3Mga2V5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICByZWdlbmVyYXRlS2V5KCkge1xuICAgIGNvbnN0IGtleSA9IGdlbmVyYXRlS2V5KClcbiAgICByZXR1cm4gdGhpcy5zZXQoJ2tleScsIGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBgbWFya2AgYXQgYGluZGV4YCBhbmQgYGxlbmd0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoXG4gICAqIEBwYXJhbSB7TWFya30gbWFya1xuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICByZW1vdmVNYXJrKGluZGV4LCBsZW5ndGgsIG1hcmspIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJzID0gdGhpcy5jaGFyYWN0ZXJzLm1hcCgoY2hhciwgaSkgPT4ge1xuICAgICAgaWYgKGkgPCBpbmRleCkgcmV0dXJuIGNoYXJcbiAgICAgIGlmIChpID49IGluZGV4ICsgbGVuZ3RoKSByZXR1cm4gY2hhclxuICAgICAgbGV0IHsgbWFya3MgfSA9IGNoYXJcbiAgICAgIG1hcmtzID0gbWFya3MucmVtb3ZlKG1hcmspXG4gICAgICBjaGFyID0gY2hhci5zZXQoJ21hcmtzJywgbWFya3MpXG4gICAgICByZXR1cm4gY2hhclxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpcy5zZXQoJ2NoYXJhY3RlcnMnLCBjaGFyYWN0ZXJzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0ZXh0IGZyb20gdGhlIHRleHQgbm9kZSBhdCBgaW5kZXhgIGZvciBgbGVuZ3RoYC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgcmVtb3ZlVGV4dChpbmRleCwgbGVuZ3RoKSB7XG4gICAgbGV0IHsgY2hhcmFjdGVycyB9ID0gdGhpc1xuICAgIGNvbnN0IHN0YXJ0ID0gaW5kZXhcbiAgICBjb25zdCBlbmQgPSBpbmRleCArIGxlbmd0aFxuICAgIGNoYXJhY3RlcnMgPSBjaGFyYWN0ZXJzLmZpbHRlck5vdCgoY2hhciwgaSkgPT4gc3RhcnQgPD0gaSAmJiBpIDwgZW5kKVxuICAgIHJldHVybiB0aGlzLnNldCgnY2hhcmFjdGVycycsIGNoYXJhY3RlcnMpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGV4dC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04ob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAgb2JqZWN0OiB0aGlzLm9iamVjdCxcbiAgICAgIGxlYXZlczogdGhpcy5nZXRMZWF2ZXMoKS50b0FycmF5KCkubWFwKHIgPT4gci50b0pTT04oKSksXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJlc2VydmVLZXlzKSB7XG4gICAgICBvYmplY3Qua2V5ID0gdGhpcy5rZXlcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYHRvSlNgLlxuICAgKi9cblxuICB0b0pTKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50b0pTT04ob3B0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYSBgbWFya2AgYXQgYGluZGV4YCBhbmQgYGxlbmd0aGAgd2l0aCBgcHJvcGVydGllc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoXG4gICAqIEBwYXJhbSB7TWFya30gbWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllc1xuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICB1cGRhdGVNYXJrKGluZGV4LCBsZW5ndGgsIG1hcmssIHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBuZXdNYXJrID0gbWFyay5tZXJnZShwcm9wZXJ0aWVzKVxuXG4gICAgY29uc3QgY2hhcmFjdGVycyA9IHRoaXMuY2hhcmFjdGVycy5tYXAoKGNoYXIsIGkpID0+IHtcbiAgICAgIGlmIChpIDwgaW5kZXgpIHJldHVybiBjaGFyXG4gICAgICBpZiAoaSA+PSBpbmRleCArIGxlbmd0aCkgcmV0dXJuIGNoYXJcbiAgICAgIGxldCB7IG1hcmtzIH0gPSBjaGFyXG4gICAgICBpZiAoIW1hcmtzLmhhcyhtYXJrKSkgcmV0dXJuIGNoYXJcbiAgICAgIG1hcmtzID0gbWFya3MucmVtb3ZlKG1hcmspXG4gICAgICBtYXJrcyA9IG1hcmtzLmFkZChuZXdNYXJrKVxuICAgICAgY2hhciA9IGNoYXIuc2V0KCdtYXJrcycsIG1hcmtzKVxuICAgICAgcmV0dXJuIGNoYXJcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdjaGFyYWN0ZXJzJywgY2hhcmFjdGVycylcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSB0aGUgdGV4dCBub2RlIGFnYWluc3QgYSBgc2NoZW1hYC5cbiAgICpcbiAgICogQHBhcmFtIHtTY2hlbWF9IHNjaGVtYVxuICAgKiBAcmV0dXJuIHtPYmplY3R8Vm9pZH1cbiAgICovXG5cbiAgdmFsaWRhdGUoc2NoZW1hKSB7XG4gICAgcmV0dXJuIHNjaGVtYS52YWxpZGF0ZU5vZGUodGhpcylcbiAgfVxuXG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5UZXh0LnByb3RvdHlwZVtNT0RFTF9UWVBFUy5URVhUXSA9IHRydWVcblxuLyoqXG4gKiBNZW1vaXplIHJlYWQgbWV0aG9kcy5cbiAqL1xuXG5tZW1vaXplKFRleHQucHJvdG90eXBlLCBbXG4gICdnZXRNYXJrcycsXG4gICdnZXRNYXJrc0FzQXJyYXknLFxuXSwge1xuICB0YWtlc0FyZ3VtZW50czogZmFsc2UsXG59KVxuXG5tZW1vaXplKFRleHQucHJvdG90eXBlLCBbXG4gICdnZXREZWNvcmF0ZWRDaGFyYWN0ZXJzJyxcbiAgJ2dldERlY29yYXRpb25zJyxcbiAgJ2dldExlYXZlcycsXG4gICdnZXRNYXJrc0F0SW5kZXgnLFxuICAndmFsaWRhdGUnXG5dLCB7XG4gIHRha2VzQXJndW1lbnRzOiB0cnVlLFxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge1RleHR9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgVGV4dFxuIl19