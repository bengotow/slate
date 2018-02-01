'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHyperscript = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slate = require('slate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * Create selection point constants, for comparison by reference.
 *
 * @type {Object}
 */

var ANCHOR = {};
var CURSOR = {};
var FOCUS = {};

/**
 * The default Slate hyperscript creator functions.
 *
 * @type {Object}
 */

var CREATORS = {
  anchor: function anchor(tagName, attributes, children) {
    return ANCHOR;
  },
  block: function block(tagName, attributes, children) {
    return _slate.Block.create(_extends({}, attributes, {
      nodes: createChildren(children)
    }));
  },
  cursor: function cursor(tagName, attributes, children) {
    return CURSOR;
  },
  document: function document(tagName, attributes, children) {
    return _slate.Document.create(_extends({}, attributes, {
      nodes: createChildren(children)
    }));
  },
  focus: function focus(tagName, attributes, children) {
    return FOCUS;
  },
  inline: function inline(tagName, attributes, children) {
    return _slate.Inline.create(_extends({}, attributes, {
      nodes: createChildren(children)
    }));
  },
  mark: function mark(tagName, attributes, children) {
    var marks = _slate.Mark.createSet([attributes]);
    var nodes = createChildren(children, { marks: marks });
    return nodes;
  },
  selection: function selection(tagName, attributes, children) {
    return _slate.Range.create(attributes);
  },
  value: function value(tagName, attributes, children) {
    var data = attributes.data;

    var document = children.find(_slate.Document.isDocument);
    var selection = children.find(_slate.Range.isRange) || _slate.Range.create();
    var props = {};

    // Search the document's texts to see if any of them have the anchor or
    // focus information saved, so we can set the selection.
    if (document) {
      document.getTexts().forEach(function (text) {
        if (text.__anchor != null) {
          props.anchorKey = text.key;
          props.anchorOffset = text.__anchor;
          props.isFocused = true;
        }

        if (text.__focus != null) {
          props.focusKey = text.key;
          props.focusOffset = text.__focus;
          props.isFocused = true;
        }
      });
    }

    if (props.anchorKey && !props.focusKey) {
      throw new Error('Slate hyperscript must have both `<anchor/>` and `<focus/>` defined if one is defined, but you only defined `<anchor/>`. For collapsed selections, use `<cursor/>`.');
    }

    if (!props.anchorKey && props.focusKey) {
      throw new Error('Slate hyperscript must have both `<anchor/>` and `<focus/>` defined if one is defined, but you only defined `<focus/>`. For collapsed selections, use `<cursor/>`.');
    }

    if (!(0, _isEmpty2.default)(props)) {
      selection = selection.merge(props).normalize(document);
    }

    var value = _slate.Value.create({ data: data, document: document, selection: selection });
    return value;
  },
  text: function text(tagName, attributes, children) {
    var nodes = createChildren(children, { key: attributes.key });
    return nodes;
  }
};

/**
 * Create a Slate hyperscript function with `options`.
 *
 * @param {Object} options
 * @return {Function}
 */

function createHyperscript() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var creators = resolveCreators(options);

  function create(tagName, attributes) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    var creator = creators[tagName];

    if (!creator) {
      throw new Error('No hyperscript creator found for tag: "' + tagName + '"');
    }

    if (attributes == null) {
      attributes = {};
    }

    if (!(0, _isPlainObject2.default)(attributes)) {
      children = [attributes].concat(children);
      attributes = {};
    }

    children = children.filter(function (child) {
      return Boolean(child);
    }).reduce(function (memo, child) {
      return memo.concat(child);
    }, []);

    var element = creator(tagName, attributes, children);
    return element;
  }

  return create;
}

/**
 * Create an array of `children`, storing selection anchor and focus.
 *
 * @param {Array} children
 * @param {Object} options
 * @return {Array}
 */

function createChildren(children) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var array = [];
  var length = 0;

  // When creating the new node, try to preserve a key if one exists.
  var firstText = children.find(function (c) {
    return _slate.Text.isText(c);
  });
  var key = options.key ? options.key : firstText ? firstText.key : undefined;
  var node = _slate.Text.create({ key: key });

  // Create a helper to update the current node while preserving any stored
  // anchor or focus information.
  function setNode(next) {
    var _node = node,
        __anchor = _node.__anchor,
        __focus = _node.__focus;

    if (__anchor != null) next.__anchor = __anchor;
    if (__focus != null) next.__focus = __focus;
    node = next;
  }

  children.forEach(function (child) {
    // If the child is a non-text node, push the current node and the new child
    // onto the array, then creating a new node for future selection tracking.
    if (_slate.Node.isNode(child) && !_slate.Text.isText(child)) {
      if (node.text.length || node.__anchor != null || node.__focus != null) array.push(node);
      array.push(child);
      node = _slate.Text.create();
      length = 0;
    }

    // If the child is a string insert it into the node.
    if (typeof child == 'string') {
      setNode(node.insertText(node.text.length, child, options.marks));
      length += child.length;
    }

    // If the node is a `Text` add its text and marks to the existing node. If
    // the existing node is empty, and the `key` option wasn't set, preserve the
    // child's key when updating the node.
    if (_slate.Text.isText(child)) {
      var __anchor = child.__anchor,
          __focus = child.__focus;

      var i = node.text.length;

      if (!options.key && node.text.length == 0) {
        setNode(node.set('key', child.key));
      }

      child.getLeaves().forEach(function (leaf) {
        var marks = leaf.marks;

        if (options.marks) marks = marks.union(options.marks);
        setNode(node.insertText(i, leaf.text, marks));
        i += leaf.text.length;
      });

      if (__anchor != null) node.__anchor = __anchor + length;
      if (__focus != null) node.__focus = __focus + length;

      length += child.text.length;
    }

    // If the child is a selection object store the current position.
    if (child == ANCHOR || child == CURSOR) node.__anchor = length;
    if (child == FOCUS || child == CURSOR) node.__focus = length;
  });

  // Make sure the most recent node is added.
  array.push(node);

  return array;
}

/**
 * Resolve a set of hyperscript creators an `options` object.
 *
 * @param {Object} options
 * @return {Object}
 */

function resolveCreators(options) {
  var _options$blocks = options.blocks,
      blocks = _options$blocks === undefined ? {} : _options$blocks,
      _options$inlines = options.inlines,
      inlines = _options$inlines === undefined ? {} : _options$inlines,
      _options$marks = options.marks,
      marks = _options$marks === undefined ? {} : _options$marks;


  var creators = _extends({}, CREATORS, options.creators || {});

  Object.keys(blocks).map(function (key) {
    creators[key] = normalizeNode(key, blocks[key], 'block');
  });

  Object.keys(inlines).map(function (key) {
    creators[key] = normalizeNode(key, inlines[key], 'inline');
  });

  Object.keys(marks).map(function (key) {
    creators[key] = normalizeMark(key, marks[key]);
  });

  return creators;
}

/**
 * Normalize a node creator with `key` and `value`, of `object`.
 *
 * @param {String} key
 * @param {Function|Object|String} value
 * @param {String} object
 * @return {Function}
 */

function normalizeNode(key, value, object) {
  if (typeof value == 'function') {
    return value;
  }

  if (typeof value == 'string') {
    value = { type: value };
  }

  if ((0, _isPlainObject2.default)(value)) {
    return function (tagName, attributes, children) {
      var attrKey = attributes.key,
          rest = _objectWithoutProperties(attributes, ['key']);

      var attrs = _extends({}, value, {
        object: object,
        key: attrKey,
        data: _extends({}, value.data || {}, rest)
      });

      return CREATORS[object](tagName, attrs, children);
    };
  }

  throw new Error('Slate hyperscript ' + object + ' creators can be either functions, objects or strings, but you passed: ' + value);
}

/**
 * Normalize a mark creator with `key` and `value`.
 *
 * @param {String} key
 * @param {Function|Object|String} value
 * @return {Function}
 */

function normalizeMark(key, value) {
  if (typeof value == 'function') {
    return value;
  }

  if (typeof value == 'string') {
    value = { type: value };
  }

  if ((0, _isPlainObject2.default)(value)) {
    return function (tagName, attributes, children) {
      var attrs = _extends({}, value, {
        data: _extends({}, value.data || {}, attributes)
      });

      return CREATORS.mark(tagName, attrs, children);
    };
  }

  throw new Error('Slate hyperscript mark creators can be either functions, objects or strings, but you passed: ' + value);
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = createHyperscript();
exports.createHyperscript = createHyperscript;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJBTkNIT1IiLCJDVVJTT1IiLCJGT0NVUyIsIkNSRUFUT1JTIiwiYW5jaG9yIiwidGFnTmFtZSIsImF0dHJpYnV0ZXMiLCJjaGlsZHJlbiIsImJsb2NrIiwiY3JlYXRlIiwibm9kZXMiLCJjcmVhdGVDaGlsZHJlbiIsImN1cnNvciIsImRvY3VtZW50IiwiZm9jdXMiLCJpbmxpbmUiLCJtYXJrIiwibWFya3MiLCJjcmVhdGVTZXQiLCJzZWxlY3Rpb24iLCJ2YWx1ZSIsImRhdGEiLCJmaW5kIiwiaXNEb2N1bWVudCIsImlzUmFuZ2UiLCJwcm9wcyIsImdldFRleHRzIiwiZm9yRWFjaCIsInRleHQiLCJfX2FuY2hvciIsImFuY2hvcktleSIsImtleSIsImFuY2hvck9mZnNldCIsImlzRm9jdXNlZCIsIl9fZm9jdXMiLCJmb2N1c0tleSIsImZvY3VzT2Zmc2V0IiwiRXJyb3IiLCJtZXJnZSIsIm5vcm1hbGl6ZSIsImNyZWF0ZUh5cGVyc2NyaXB0Iiwib3B0aW9ucyIsImNyZWF0b3JzIiwicmVzb2x2ZUNyZWF0b3JzIiwiY3JlYXRvciIsImNvbmNhdCIsImZpbHRlciIsIkJvb2xlYW4iLCJjaGlsZCIsInJlZHVjZSIsIm1lbW8iLCJlbGVtZW50IiwiYXJyYXkiLCJsZW5ndGgiLCJmaXJzdFRleHQiLCJpc1RleHQiLCJjIiwidW5kZWZpbmVkIiwibm9kZSIsInNldE5vZGUiLCJuZXh0IiwiaXNOb2RlIiwicHVzaCIsImluc2VydFRleHQiLCJpIiwic2V0IiwiZ2V0TGVhdmVzIiwibGVhZiIsInVuaW9uIiwiYmxvY2tzIiwiaW5saW5lcyIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJub3JtYWxpemVOb2RlIiwibm9ybWFsaXplTWFyayIsIm9iamVjdCIsInR5cGUiLCJhdHRyS2V5IiwicmVzdCIsImF0dHJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQVdBOzs7Ozs7QUFNQSxJQUFNQSxTQUFTLEVBQWY7QUFDQSxJQUFNQyxTQUFTLEVBQWY7QUFDQSxJQUFNQyxRQUFRLEVBQWQ7O0FBRUE7Ozs7OztBQU1BLElBQU1DLFdBQVc7QUFFZkMsUUFGZSxrQkFFUkMsT0FGUSxFQUVDQyxVQUZELEVBRWFDLFFBRmIsRUFFdUI7QUFDcEMsV0FBT1AsTUFBUDtBQUNELEdBSmM7QUFNZlEsT0FOZSxpQkFNVEgsT0FOUyxFQU1BQyxVQU5BLEVBTVlDLFFBTlosRUFNc0I7QUFDbkMsV0FBTyxhQUFNRSxNQUFOLGNBQ0ZILFVBREU7QUFFTEksYUFBT0MsZUFBZUosUUFBZjtBQUZGLE9BQVA7QUFJRCxHQVhjO0FBYWZLLFFBYmUsa0JBYVJQLE9BYlEsRUFhQ0MsVUFiRCxFQWFhQyxRQWJiLEVBYXVCO0FBQ3BDLFdBQU9OLE1BQVA7QUFDRCxHQWZjO0FBaUJmWSxVQWpCZSxvQkFpQk5SLE9BakJNLEVBaUJHQyxVQWpCSCxFQWlCZUMsUUFqQmYsRUFpQnlCO0FBQ3RDLFdBQU8sZ0JBQVNFLE1BQVQsY0FDRkgsVUFERTtBQUVMSSxhQUFPQyxlQUFlSixRQUFmO0FBRkYsT0FBUDtBQUlELEdBdEJjO0FBd0JmTyxPQXhCZSxpQkF3QlRULE9BeEJTLEVBd0JBQyxVQXhCQSxFQXdCWUMsUUF4QlosRUF3QnNCO0FBQ25DLFdBQU9MLEtBQVA7QUFDRCxHQTFCYztBQTRCZmEsUUE1QmUsa0JBNEJSVixPQTVCUSxFQTRCQ0MsVUE1QkQsRUE0QmFDLFFBNUJiLEVBNEJ1QjtBQUNwQyxXQUFPLGNBQU9FLE1BQVAsY0FDRkgsVUFERTtBQUVMSSxhQUFPQyxlQUFlSixRQUFmO0FBRkYsT0FBUDtBQUlELEdBakNjO0FBbUNmUyxNQW5DZSxnQkFtQ1ZYLE9BbkNVLEVBbUNEQyxVQW5DQyxFQW1DV0MsUUFuQ1gsRUFtQ3FCO0FBQ2xDLFFBQU1VLFFBQVEsWUFBS0MsU0FBTCxDQUFlLENBQUNaLFVBQUQsQ0FBZixDQUFkO0FBQ0EsUUFBTUksUUFBUUMsZUFBZUosUUFBZixFQUF5QixFQUFFVSxZQUFGLEVBQXpCLENBQWQ7QUFDQSxXQUFPUCxLQUFQO0FBQ0QsR0F2Q2M7QUF5Q2ZTLFdBekNlLHFCQXlDTGQsT0F6Q0ssRUF5Q0lDLFVBekNKLEVBeUNnQkMsUUF6Q2hCLEVBeUMwQjtBQUN2QyxXQUFPLGFBQU1FLE1BQU4sQ0FBYUgsVUFBYixDQUFQO0FBQ0QsR0EzQ2M7QUE2Q2ZjLE9BN0NlLGlCQTZDVGYsT0E3Q1MsRUE2Q0FDLFVBN0NBLEVBNkNZQyxRQTdDWixFQTZDc0I7QUFBQSxRQUMzQmMsSUFEMkIsR0FDbEJmLFVBRGtCLENBQzNCZSxJQUQyQjs7QUFFbkMsUUFBTVIsV0FBV04sU0FBU2UsSUFBVCxDQUFjLGdCQUFTQyxVQUF2QixDQUFqQjtBQUNBLFFBQUlKLFlBQVlaLFNBQVNlLElBQVQsQ0FBYyxhQUFNRSxPQUFwQixLQUFnQyxhQUFNZixNQUFOLEVBQWhEO0FBQ0EsUUFBTWdCLFFBQVEsRUFBZDs7QUFFQTtBQUNBO0FBQ0EsUUFBSVosUUFBSixFQUFjO0FBQ1pBLGVBQVNhLFFBQVQsR0FBb0JDLE9BQXBCLENBQTRCLFVBQUNDLElBQUQsRUFBVTtBQUNwQyxZQUFJQSxLQUFLQyxRQUFMLElBQWlCLElBQXJCLEVBQTJCO0FBQ3pCSixnQkFBTUssU0FBTixHQUFrQkYsS0FBS0csR0FBdkI7QUFDQU4sZ0JBQU1PLFlBQU4sR0FBcUJKLEtBQUtDLFFBQTFCO0FBQ0FKLGdCQUFNUSxTQUFOLEdBQWtCLElBQWxCO0FBQ0Q7O0FBRUQsWUFBSUwsS0FBS00sT0FBTCxJQUFnQixJQUFwQixFQUEwQjtBQUN4QlQsZ0JBQU1VLFFBQU4sR0FBaUJQLEtBQUtHLEdBQXRCO0FBQ0FOLGdCQUFNVyxXQUFOLEdBQW9CUixLQUFLTSxPQUF6QjtBQUNBVCxnQkFBTVEsU0FBTixHQUFrQixJQUFsQjtBQUNEO0FBQ0YsT0FaRDtBQWFEOztBQUVELFFBQUlSLE1BQU1LLFNBQU4sSUFBbUIsQ0FBQ0wsTUFBTVUsUUFBOUIsRUFBd0M7QUFDdEMsWUFBTSxJQUFJRSxLQUFKLHVLQUFOO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDWixNQUFNSyxTQUFQLElBQW9CTCxNQUFNVSxRQUE5QixFQUF3QztBQUN0QyxZQUFNLElBQUlFLEtBQUosc0tBQU47QUFDRDs7QUFFRCxRQUFJLENBQUMsdUJBQVFaLEtBQVIsQ0FBTCxFQUFxQjtBQUNuQk4sa0JBQVlBLFVBQVVtQixLQUFWLENBQWdCYixLQUFoQixFQUF1QmMsU0FBdkIsQ0FBaUMxQixRQUFqQyxDQUFaO0FBQ0Q7O0FBRUQsUUFBTU8sUUFBUSxhQUFNWCxNQUFOLENBQWEsRUFBRVksVUFBRixFQUFRUixrQkFBUixFQUFrQk0sb0JBQWxCLEVBQWIsQ0FBZDtBQUNBLFdBQU9DLEtBQVA7QUFDRCxHQW5GYztBQXFGZlEsTUFyRmUsZ0JBcUZWdkIsT0FyRlUsRUFxRkRDLFVBckZDLEVBcUZXQyxRQXJGWCxFQXFGcUI7QUFDbEMsUUFBTUcsUUFBUUMsZUFBZUosUUFBZixFQUF5QixFQUFFd0IsS0FBS3pCLFdBQVd5QixHQUFsQixFQUF6QixDQUFkO0FBQ0EsV0FBT3JCLEtBQVA7QUFDRDtBQXhGYyxDQUFqQjs7QUE0RkE7Ozs7Ozs7QUFPQSxTQUFTOEIsaUJBQVQsR0FBeUM7QUFBQSxNQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ3ZDLE1BQU1DLFdBQVdDLGdCQUFnQkYsT0FBaEIsQ0FBakI7O0FBRUEsV0FBU2hDLE1BQVQsQ0FBZ0JKLE9BQWhCLEVBQXlCQyxVQUF6QixFQUFrRDtBQUFBLHNDQUFWQyxRQUFVO0FBQVZBLGNBQVU7QUFBQTs7QUFDaEQsUUFBTXFDLFVBQVVGLFNBQVNyQyxPQUFULENBQWhCOztBQUVBLFFBQUksQ0FBQ3VDLE9BQUwsRUFBYztBQUNaLFlBQU0sSUFBSVAsS0FBSiw2Q0FBb0RoQyxPQUFwRCxPQUFOO0FBQ0Q7O0FBRUQsUUFBSUMsY0FBYyxJQUFsQixFQUF3QjtBQUN0QkEsbUJBQWEsRUFBYjtBQUNEOztBQUVELFFBQUksQ0FBQyw2QkFBY0EsVUFBZCxDQUFMLEVBQWdDO0FBQzlCQyxpQkFBVyxDQUFDRCxVQUFELEVBQWF1QyxNQUFiLENBQW9CdEMsUUFBcEIsQ0FBWDtBQUNBRCxtQkFBYSxFQUFiO0FBQ0Q7O0FBRURDLGVBQVdBLFNBQ1J1QyxNQURRLENBQ0Q7QUFBQSxhQUFTQyxRQUFRQyxLQUFSLENBQVQ7QUFBQSxLQURDLEVBRVJDLE1BRlEsQ0FFRCxVQUFDQyxJQUFELEVBQU9GLEtBQVA7QUFBQSxhQUFpQkUsS0FBS0wsTUFBTCxDQUFZRyxLQUFaLENBQWpCO0FBQUEsS0FGQyxFQUVvQyxFQUZwQyxDQUFYOztBQUlBLFFBQU1HLFVBQVVQLFFBQVF2QyxPQUFSLEVBQWlCQyxVQUFqQixFQUE2QkMsUUFBN0IsQ0FBaEI7QUFDQSxXQUFPNEMsT0FBUDtBQUNEOztBQUVELFNBQU8xQyxNQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O0FBUUEsU0FBU0UsY0FBVCxDQUF3QkosUUFBeEIsRUFBZ0Q7QUFBQSxNQUFka0MsT0FBYyx1RUFBSixFQUFJOztBQUM5QyxNQUFNVyxRQUFRLEVBQWQ7QUFDQSxNQUFJQyxTQUFTLENBQWI7O0FBRUE7QUFDQSxNQUFNQyxZQUFZL0MsU0FBU2UsSUFBVCxDQUFjO0FBQUEsV0FBSyxZQUFLaUMsTUFBTCxDQUFZQyxDQUFaLENBQUw7QUFBQSxHQUFkLENBQWxCO0FBQ0EsTUFBTXpCLE1BQU1VLFFBQVFWLEdBQVIsR0FBY1UsUUFBUVYsR0FBdEIsR0FBNEJ1QixZQUFZQSxVQUFVdkIsR0FBdEIsR0FBNEIwQixTQUFwRTtBQUNBLE1BQUlDLE9BQU8sWUFBS2pELE1BQUwsQ0FBWSxFQUFFc0IsUUFBRixFQUFaLENBQVg7O0FBRUE7QUFDQTtBQUNBLFdBQVM0QixPQUFULENBQWlCQyxJQUFqQixFQUF1QjtBQUFBLGdCQUNTRixJQURUO0FBQUEsUUFDYjdCLFFBRGEsU0FDYkEsUUFEYTtBQUFBLFFBQ0hLLE9BREcsU0FDSEEsT0FERzs7QUFFckIsUUFBSUwsWUFBWSxJQUFoQixFQUFzQitCLEtBQUsvQixRQUFMLEdBQWdCQSxRQUFoQjtBQUN0QixRQUFJSyxXQUFXLElBQWYsRUFBcUIwQixLQUFLMUIsT0FBTCxHQUFlQSxPQUFmO0FBQ3JCd0IsV0FBT0UsSUFBUDtBQUNEOztBQUVEckQsV0FBU29CLE9BQVQsQ0FBaUIsVUFBQ3FCLEtBQUQsRUFBVztBQUMxQjtBQUNBO0FBQ0EsUUFBSSxZQUFLYSxNQUFMLENBQVliLEtBQVosS0FBc0IsQ0FBQyxZQUFLTyxNQUFMLENBQVlQLEtBQVosQ0FBM0IsRUFBK0M7QUFDN0MsVUFBSVUsS0FBSzlCLElBQUwsQ0FBVXlCLE1BQVYsSUFBb0JLLEtBQUs3QixRQUFMLElBQWlCLElBQXJDLElBQTZDNkIsS0FBS3hCLE9BQUwsSUFBZ0IsSUFBakUsRUFBdUVrQixNQUFNVSxJQUFOLENBQVdKLElBQVg7QUFDdkVOLFlBQU1VLElBQU4sQ0FBV2QsS0FBWDtBQUNBVSxhQUFPLFlBQUtqRCxNQUFMLEVBQVA7QUFDQTRDLGVBQVMsQ0FBVDtBQUNEOztBQUVEO0FBQ0EsUUFBSSxPQUFPTCxLQUFQLElBQWdCLFFBQXBCLEVBQThCO0FBQzVCVyxjQUFRRCxLQUFLSyxVQUFMLENBQWdCTCxLQUFLOUIsSUFBTCxDQUFVeUIsTUFBMUIsRUFBa0NMLEtBQWxDLEVBQXlDUCxRQUFReEIsS0FBakQsQ0FBUjtBQUNBb0MsZ0JBQVVMLE1BQU1LLE1BQWhCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsUUFBSSxZQUFLRSxNQUFMLENBQVlQLEtBQVosQ0FBSixFQUF3QjtBQUFBLFVBQ2RuQixRQURjLEdBQ1FtQixLQURSLENBQ2RuQixRQURjO0FBQUEsVUFDSkssT0FESSxHQUNRYyxLQURSLENBQ0pkLE9BREk7O0FBRXRCLFVBQUk4QixJQUFJTixLQUFLOUIsSUFBTCxDQUFVeUIsTUFBbEI7O0FBRUEsVUFBSSxDQUFDWixRQUFRVixHQUFULElBQWdCMkIsS0FBSzlCLElBQUwsQ0FBVXlCLE1BQVYsSUFBb0IsQ0FBeEMsRUFBMkM7QUFDekNNLGdCQUFRRCxLQUFLTyxHQUFMLENBQVMsS0FBVCxFQUFnQmpCLE1BQU1qQixHQUF0QixDQUFSO0FBQ0Q7O0FBRURpQixZQUFNa0IsU0FBTixHQUFrQnZDLE9BQWxCLENBQTBCLFVBQUN3QyxJQUFELEVBQVU7QUFBQSxZQUM1QmxELEtBRDRCLEdBQ2xCa0QsSUFEa0IsQ0FDNUJsRCxLQUQ0Qjs7QUFFbEMsWUFBSXdCLFFBQVF4QixLQUFaLEVBQW1CQSxRQUFRQSxNQUFNbUQsS0FBTixDQUFZM0IsUUFBUXhCLEtBQXBCLENBQVI7QUFDbkIwQyxnQkFBUUQsS0FBS0ssVUFBTCxDQUFnQkMsQ0FBaEIsRUFBbUJHLEtBQUt2QyxJQUF4QixFQUE4QlgsS0FBOUIsQ0FBUjtBQUNBK0MsYUFBS0csS0FBS3ZDLElBQUwsQ0FBVXlCLE1BQWY7QUFDRCxPQUxEOztBQU9BLFVBQUl4QixZQUFZLElBQWhCLEVBQXNCNkIsS0FBSzdCLFFBQUwsR0FBZ0JBLFdBQVd3QixNQUEzQjtBQUN0QixVQUFJbkIsV0FBVyxJQUFmLEVBQXFCd0IsS0FBS3hCLE9BQUwsR0FBZUEsVUFBVW1CLE1BQXpCOztBQUVyQkEsZ0JBQVVMLE1BQU1wQixJQUFOLENBQVd5QixNQUFyQjtBQUNEOztBQUVEO0FBQ0EsUUFBSUwsU0FBU2hELE1BQVQsSUFBbUJnRCxTQUFTL0MsTUFBaEMsRUFBd0N5RCxLQUFLN0IsUUFBTCxHQUFnQndCLE1BQWhCO0FBQ3hDLFFBQUlMLFNBQVM5QyxLQUFULElBQWtCOEMsU0FBUy9DLE1BQS9CLEVBQXVDeUQsS0FBS3hCLE9BQUwsR0FBZW1CLE1BQWY7QUFDeEMsR0EzQ0Q7O0FBNkNBO0FBQ0FELFFBQU1VLElBQU4sQ0FBV0osSUFBWDs7QUFFQSxTQUFPTixLQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFPQSxTQUFTVCxlQUFULENBQXlCRixPQUF6QixFQUFrQztBQUFBLHdCQUs1QkEsT0FMNEIsQ0FFOUI0QixNQUY4QjtBQUFBLE1BRTlCQSxNQUY4QixtQ0FFckIsRUFGcUI7QUFBQSx5QkFLNUI1QixPQUw0QixDQUc5QjZCLE9BSDhCO0FBQUEsTUFHOUJBLE9BSDhCLG9DQUdwQixFQUhvQjtBQUFBLHVCQUs1QjdCLE9BTDRCLENBSTlCeEIsS0FKOEI7QUFBQSxNQUk5QkEsS0FKOEIsa0NBSXRCLEVBSnNCOzs7QUFPaEMsTUFBTXlCLHdCQUNEdkMsUUFEQyxFQUVBc0MsUUFBUUMsUUFBUixJQUFvQixFQUZwQixDQUFOOztBQUtBNkIsU0FBT0MsSUFBUCxDQUFZSCxNQUFaLEVBQW9CSSxHQUFwQixDQUF3QixVQUFDMUMsR0FBRCxFQUFTO0FBQy9CVyxhQUFTWCxHQUFULElBQWdCMkMsY0FBYzNDLEdBQWQsRUFBbUJzQyxPQUFPdEMsR0FBUCxDQUFuQixFQUFnQyxPQUFoQyxDQUFoQjtBQUNELEdBRkQ7O0FBSUF3QyxTQUFPQyxJQUFQLENBQVlGLE9BQVosRUFBcUJHLEdBQXJCLENBQXlCLFVBQUMxQyxHQUFELEVBQVM7QUFDaENXLGFBQVNYLEdBQVQsSUFBZ0IyQyxjQUFjM0MsR0FBZCxFQUFtQnVDLFFBQVF2QyxHQUFSLENBQW5CLEVBQWlDLFFBQWpDLENBQWhCO0FBQ0QsR0FGRDs7QUFJQXdDLFNBQU9DLElBQVAsQ0FBWXZELEtBQVosRUFBbUJ3RCxHQUFuQixDQUF1QixVQUFDMUMsR0FBRCxFQUFTO0FBQzlCVyxhQUFTWCxHQUFULElBQWdCNEMsY0FBYzVDLEdBQWQsRUFBbUJkLE1BQU1jLEdBQU4sQ0FBbkIsQ0FBaEI7QUFDRCxHQUZEOztBQUlBLFNBQU9XLFFBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7O0FBU0EsU0FBU2dDLGFBQVQsQ0FBdUIzQyxHQUF2QixFQUE0QlgsS0FBNUIsRUFBbUN3RCxNQUFuQyxFQUEyQztBQUN6QyxNQUFJLE9BQU94RCxLQUFQLElBQWdCLFVBQXBCLEVBQWdDO0FBQzlCLFdBQU9BLEtBQVA7QUFDRDs7QUFFRCxNQUFJLE9BQU9BLEtBQVAsSUFBZ0IsUUFBcEIsRUFBOEI7QUFDNUJBLFlBQVEsRUFBRXlELE1BQU16RCxLQUFSLEVBQVI7QUFDRDs7QUFFRCxNQUFJLDZCQUFjQSxLQUFkLENBQUosRUFBMEI7QUFDeEIsV0FBTyxVQUFDZixPQUFELEVBQVVDLFVBQVYsRUFBc0JDLFFBQXRCLEVBQW1DO0FBQUEsVUFDM0J1RSxPQUQyQixHQUNOeEUsVUFETSxDQUNoQ3lCLEdBRGdDO0FBQUEsVUFDZmdELElBRGUsNEJBQ056RSxVQURNOztBQUV4QyxVQUFNMEUscUJBQ0Q1RCxLQURDO0FBRUp3RCxzQkFGSTtBQUdKN0MsYUFBSytDLE9BSEQ7QUFJSnpELDJCQUNNRCxNQUFNQyxJQUFOLElBQWMsRUFEcEIsRUFFSzBELElBRkw7QUFKSSxRQUFOOztBQVVBLGFBQU81RSxTQUFTeUUsTUFBVCxFQUFpQnZFLE9BQWpCLEVBQTBCMkUsS0FBMUIsRUFBaUN6RSxRQUFqQyxDQUFQO0FBQ0QsS0FiRDtBQWNEOztBQUVELFFBQU0sSUFBSThCLEtBQUosd0JBQStCdUMsTUFBL0IsK0VBQStHeEQsS0FBL0csQ0FBTjtBQUNEOztBQUVEOzs7Ozs7OztBQVFBLFNBQVN1RCxhQUFULENBQXVCNUMsR0FBdkIsRUFBNEJYLEtBQTVCLEVBQW1DO0FBQ2pDLE1BQUksT0FBT0EsS0FBUCxJQUFnQixVQUFwQixFQUFnQztBQUM5QixXQUFPQSxLQUFQO0FBQ0Q7O0FBRUQsTUFBSSxPQUFPQSxLQUFQLElBQWdCLFFBQXBCLEVBQThCO0FBQzVCQSxZQUFRLEVBQUV5RCxNQUFNekQsS0FBUixFQUFSO0FBQ0Q7O0FBRUQsTUFBSSw2QkFBY0EsS0FBZCxDQUFKLEVBQTBCO0FBQ3hCLFdBQU8sVUFBQ2YsT0FBRCxFQUFVQyxVQUFWLEVBQXNCQyxRQUF0QixFQUFtQztBQUN4QyxVQUFNeUUscUJBQ0Q1RCxLQURDO0FBRUpDLDJCQUNNRCxNQUFNQyxJQUFOLElBQWMsRUFEcEIsRUFFS2YsVUFGTDtBQUZJLFFBQU47O0FBUUEsYUFBT0gsU0FBU2EsSUFBVCxDQUFjWCxPQUFkLEVBQXVCMkUsS0FBdkIsRUFBOEJ6RSxRQUE5QixDQUFQO0FBQ0QsS0FWRDtBQVdEOztBQUVELFFBQU0sSUFBSThCLEtBQUosbUdBQTBHakIsS0FBMUcsQ0FBTjtBQUNEOztBQUVEOzs7Ozs7a0JBTWVvQixtQjtRQUNOQSxpQixHQUFBQSxpQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGlzRW1wdHkgZnJvbSAnaXMtZW1wdHknXG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdpcy1wbGFpbi1vYmplY3QnXG5cbmltcG9ydCB7XG4gIEJsb2NrLFxuICBEb2N1bWVudCxcbiAgSW5saW5lLFxuICBNYXJrLFxuICBOb2RlLFxuICBSYW5nZSxcbiAgVGV4dCxcbiAgVmFsdWUsXG59IGZyb20gJ3NsYXRlJ1xuXG4vKipcbiAqIENyZWF0ZSBzZWxlY3Rpb24gcG9pbnQgY29uc3RhbnRzLCBmb3IgY29tcGFyaXNvbiBieSByZWZlcmVuY2UuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBBTkNIT1IgPSB7fVxuY29uc3QgQ1VSU09SID0ge31cbmNvbnN0IEZPQ1VTID0ge31cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBTbGF0ZSBoeXBlcnNjcmlwdCBjcmVhdG9yIGZ1bmN0aW9ucy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IENSRUFUT1JTID0ge1xuXG4gIGFuY2hvcih0YWdOYW1lLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICAgIHJldHVybiBBTkNIT1JcbiAgfSxcblxuICBibG9jayh0YWdOYW1lLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICAgIHJldHVybiBCbG9jay5jcmVhdGUoe1xuICAgICAgLi4uYXR0cmlidXRlcyxcbiAgICAgIG5vZGVzOiBjcmVhdGVDaGlsZHJlbihjaGlsZHJlbiksXG4gICAgfSlcbiAgfSxcblxuICBjdXJzb3IodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgICByZXR1cm4gQ1VSU09SXG4gIH0sXG5cbiAgZG9jdW1lbnQodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgICByZXR1cm4gRG9jdW1lbnQuY3JlYXRlKHtcbiAgICAgIC4uLmF0dHJpYnV0ZXMsXG4gICAgICBub2RlczogY3JlYXRlQ2hpbGRyZW4oY2hpbGRyZW4pLFxuICAgIH0pXG4gIH0sXG5cbiAgZm9jdXModGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgICByZXR1cm4gRk9DVVNcbiAgfSxcblxuICBpbmxpbmUodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgICByZXR1cm4gSW5saW5lLmNyZWF0ZSh7XG4gICAgICAuLi5hdHRyaWJ1dGVzLFxuICAgICAgbm9kZXM6IGNyZWF0ZUNoaWxkcmVuKGNoaWxkcmVuKSxcbiAgICB9KVxuICB9LFxuXG4gIG1hcmsodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgICBjb25zdCBtYXJrcyA9IE1hcmsuY3JlYXRlU2V0KFthdHRyaWJ1dGVzXSlcbiAgICBjb25zdCBub2RlcyA9IGNyZWF0ZUNoaWxkcmVuKGNoaWxkcmVuLCB7IG1hcmtzIH0pXG4gICAgcmV0dXJuIG5vZGVzXG4gIH0sXG5cbiAgc2VsZWN0aW9uKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIFJhbmdlLmNyZWF0ZShhdHRyaWJ1dGVzKVxuICB9LFxuXG4gIHZhbHVlKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG4gICAgY29uc3QgeyBkYXRhIH0gPSBhdHRyaWJ1dGVzXG4gICAgY29uc3QgZG9jdW1lbnQgPSBjaGlsZHJlbi5maW5kKERvY3VtZW50LmlzRG9jdW1lbnQpXG4gICAgbGV0IHNlbGVjdGlvbiA9IGNoaWxkcmVuLmZpbmQoUmFuZ2UuaXNSYW5nZSkgfHwgUmFuZ2UuY3JlYXRlKClcbiAgICBjb25zdCBwcm9wcyA9IHt9XG5cbiAgICAvLyBTZWFyY2ggdGhlIGRvY3VtZW50J3MgdGV4dHMgdG8gc2VlIGlmIGFueSBvZiB0aGVtIGhhdmUgdGhlIGFuY2hvciBvclxuICAgIC8vIGZvY3VzIGluZm9ybWF0aW9uIHNhdmVkLCBzbyB3ZSBjYW4gc2V0IHRoZSBzZWxlY3Rpb24uXG4gICAgaWYgKGRvY3VtZW50KSB7XG4gICAgICBkb2N1bWVudC5nZXRUZXh0cygpLmZvckVhY2goKHRleHQpID0+IHtcbiAgICAgICAgaWYgKHRleHQuX19hbmNob3IgIT0gbnVsbCkge1xuICAgICAgICAgIHByb3BzLmFuY2hvcktleSA9IHRleHQua2V5XG4gICAgICAgICAgcHJvcHMuYW5jaG9yT2Zmc2V0ID0gdGV4dC5fX2FuY2hvclxuICAgICAgICAgIHByb3BzLmlzRm9jdXNlZCA9IHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXh0Ll9fZm9jdXMgIT0gbnVsbCkge1xuICAgICAgICAgIHByb3BzLmZvY3VzS2V5ID0gdGV4dC5rZXlcbiAgICAgICAgICBwcm9wcy5mb2N1c09mZnNldCA9IHRleHQuX19mb2N1c1xuICAgICAgICAgIHByb3BzLmlzRm9jdXNlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuYW5jaG9yS2V5ICYmICFwcm9wcy5mb2N1c0tleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTbGF0ZSBoeXBlcnNjcmlwdCBtdXN0IGhhdmUgYm90aCBcXGA8YW5jaG9yLz5cXGAgYW5kIFxcYDxmb2N1cy8+XFxgIGRlZmluZWQgaWYgb25lIGlzIGRlZmluZWQsIGJ1dCB5b3Ugb25seSBkZWZpbmVkIFxcYDxhbmNob3IvPlxcYC4gRm9yIGNvbGxhcHNlZCBzZWxlY3Rpb25zLCB1c2UgXFxgPGN1cnNvci8+XFxgLmApXG4gICAgfVxuXG4gICAgaWYgKCFwcm9wcy5hbmNob3JLZXkgJiYgcHJvcHMuZm9jdXNLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU2xhdGUgaHlwZXJzY3JpcHQgbXVzdCBoYXZlIGJvdGggXFxgPGFuY2hvci8+XFxgIGFuZCBcXGA8Zm9jdXMvPlxcYCBkZWZpbmVkIGlmIG9uZSBpcyBkZWZpbmVkLCBidXQgeW91IG9ubHkgZGVmaW5lZCBcXGA8Zm9jdXMvPlxcYC4gRm9yIGNvbGxhcHNlZCBzZWxlY3Rpb25zLCB1c2UgXFxgPGN1cnNvci8+XFxgLmApXG4gICAgfVxuXG4gICAgaWYgKCFpc0VtcHR5KHByb3BzKSkge1xuICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1lcmdlKHByb3BzKS5ub3JtYWxpemUoZG9jdW1lbnQpXG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSBWYWx1ZS5jcmVhdGUoeyBkYXRhLCBkb2N1bWVudCwgc2VsZWN0aW9uIH0pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgdGV4dCh0YWdOYW1lLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICAgIGNvbnN0IG5vZGVzID0gY3JlYXRlQ2hpbGRyZW4oY2hpbGRyZW4sIHsga2V5OiBhdHRyaWJ1dGVzLmtleSB9KVxuICAgIHJldHVybiBub2Rlc1xuICB9LFxuXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgU2xhdGUgaHlwZXJzY3JpcHQgZnVuY3Rpb24gd2l0aCBgb3B0aW9uc2AuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUh5cGVyc2NyaXB0KG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCBjcmVhdG9ycyA9IHJlc29sdmVDcmVhdG9ycyhvcHRpb25zKVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZSh0YWdOYW1lLCBhdHRyaWJ1dGVzLCAuLi5jaGlsZHJlbikge1xuICAgIGNvbnN0IGNyZWF0b3IgPSBjcmVhdG9yc1t0YWdOYW1lXVxuXG4gICAgaWYgKCFjcmVhdG9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGh5cGVyc2NyaXB0IGNyZWF0b3IgZm91bmQgZm9yIHRhZzogXCIke3RhZ05hbWV9XCJgKVxuICAgIH1cblxuICAgIGlmIChhdHRyaWJ1dGVzID09IG51bGwpIHtcbiAgICAgIGF0dHJpYnV0ZXMgPSB7fVxuICAgIH1cblxuICAgIGlmICghaXNQbGFpbk9iamVjdChhdHRyaWJ1dGVzKSkge1xuICAgICAgY2hpbGRyZW4gPSBbYXR0cmlidXRlc10uY29uY2F0KGNoaWxkcmVuKVxuICAgICAgYXR0cmlidXRlcyA9IHt9XG4gICAgfVxuXG4gICAgY2hpbGRyZW4gPSBjaGlsZHJlblxuICAgICAgLmZpbHRlcihjaGlsZCA9PiBCb29sZWFuKGNoaWxkKSlcbiAgICAgIC5yZWR1Y2UoKG1lbW8sIGNoaWxkKSA9PiBtZW1vLmNvbmNhdChjaGlsZCksIFtdKVxuXG4gICAgY29uc3QgZWxlbWVudCA9IGNyZWF0b3IodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gYXJyYXkgb2YgYGNoaWxkcmVuYCwgc3RvcmluZyBzZWxlY3Rpb24gYW5jaG9yIGFuZCBmb2N1cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjaGlsZHJlblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkcmVuKGNoaWxkcmVuLCBvcHRpb25zID0ge30pIHtcbiAgY29uc3QgYXJyYXkgPSBbXVxuICBsZXQgbGVuZ3RoID0gMFxuXG4gIC8vIFdoZW4gY3JlYXRpbmcgdGhlIG5ldyBub2RlLCB0cnkgdG8gcHJlc2VydmUgYSBrZXkgaWYgb25lIGV4aXN0cy5cbiAgY29uc3QgZmlyc3RUZXh0ID0gY2hpbGRyZW4uZmluZChjID0+IFRleHQuaXNUZXh0KGMpKVxuICBjb25zdCBrZXkgPSBvcHRpb25zLmtleSA/IG9wdGlvbnMua2V5IDogZmlyc3RUZXh0ID8gZmlyc3RUZXh0LmtleSA6IHVuZGVmaW5lZFxuICBsZXQgbm9kZSA9IFRleHQuY3JlYXRlKHsga2V5IH0pXG5cbiAgLy8gQ3JlYXRlIGEgaGVscGVyIHRvIHVwZGF0ZSB0aGUgY3VycmVudCBub2RlIHdoaWxlIHByZXNlcnZpbmcgYW55IHN0b3JlZFxuICAvLyBhbmNob3Igb3IgZm9jdXMgaW5mb3JtYXRpb24uXG4gIGZ1bmN0aW9uIHNldE5vZGUobmV4dCkge1xuICAgIGNvbnN0IHsgX19hbmNob3IsIF9fZm9jdXMgfSA9IG5vZGVcbiAgICBpZiAoX19hbmNob3IgIT0gbnVsbCkgbmV4dC5fX2FuY2hvciA9IF9fYW5jaG9yXG4gICAgaWYgKF9fZm9jdXMgIT0gbnVsbCkgbmV4dC5fX2ZvY3VzID0gX19mb2N1c1xuICAgIG5vZGUgPSBuZXh0XG4gIH1cblxuICBjaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgIC8vIElmIHRoZSBjaGlsZCBpcyBhIG5vbi10ZXh0IG5vZGUsIHB1c2ggdGhlIGN1cnJlbnQgbm9kZSBhbmQgdGhlIG5ldyBjaGlsZFxuICAgIC8vIG9udG8gdGhlIGFycmF5LCB0aGVuIGNyZWF0aW5nIGEgbmV3IG5vZGUgZm9yIGZ1dHVyZSBzZWxlY3Rpb24gdHJhY2tpbmcuXG4gICAgaWYgKE5vZGUuaXNOb2RlKGNoaWxkKSAmJiAhVGV4dC5pc1RleHQoY2hpbGQpKSB7XG4gICAgICBpZiAobm9kZS50ZXh0Lmxlbmd0aCB8fCBub2RlLl9fYW5jaG9yICE9IG51bGwgfHwgbm9kZS5fX2ZvY3VzICE9IG51bGwpIGFycmF5LnB1c2gobm9kZSlcbiAgICAgIGFycmF5LnB1c2goY2hpbGQpXG4gICAgICBub2RlID0gVGV4dC5jcmVhdGUoKVxuICAgICAgbGVuZ3RoID0gMFxuICAgIH1cblxuICAgIC8vIElmIHRoZSBjaGlsZCBpcyBhIHN0cmluZyBpbnNlcnQgaXQgaW50byB0aGUgbm9kZS5cbiAgICBpZiAodHlwZW9mIGNoaWxkID09ICdzdHJpbmcnKSB7XG4gICAgICBzZXROb2RlKG5vZGUuaW5zZXJ0VGV4dChub2RlLnRleHQubGVuZ3RoLCBjaGlsZCwgb3B0aW9ucy5tYXJrcykpXG4gICAgICBsZW5ndGggKz0gY2hpbGQubGVuZ3RoXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG5vZGUgaXMgYSBgVGV4dGAgYWRkIGl0cyB0ZXh0IGFuZCBtYXJrcyB0byB0aGUgZXhpc3Rpbmcgbm9kZS4gSWZcbiAgICAvLyB0aGUgZXhpc3Rpbmcgbm9kZSBpcyBlbXB0eSwgYW5kIHRoZSBga2V5YCBvcHRpb24gd2Fzbid0IHNldCwgcHJlc2VydmUgdGhlXG4gICAgLy8gY2hpbGQncyBrZXkgd2hlbiB1cGRhdGluZyB0aGUgbm9kZS5cbiAgICBpZiAoVGV4dC5pc1RleHQoY2hpbGQpKSB7XG4gICAgICBjb25zdCB7IF9fYW5jaG9yLCBfX2ZvY3VzIH0gPSBjaGlsZFxuICAgICAgbGV0IGkgPSBub2RlLnRleHQubGVuZ3RoXG5cbiAgICAgIGlmICghb3B0aW9ucy5rZXkgJiYgbm9kZS50ZXh0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHNldE5vZGUobm9kZS5zZXQoJ2tleScsIGNoaWxkLmtleSkpXG4gICAgICB9XG5cbiAgICAgIGNoaWxkLmdldExlYXZlcygpLmZvckVhY2goKGxlYWYpID0+IHtcbiAgICAgICAgbGV0IHsgbWFya3MgfSA9IGxlYWZcbiAgICAgICAgaWYgKG9wdGlvbnMubWFya3MpIG1hcmtzID0gbWFya3MudW5pb24ob3B0aW9ucy5tYXJrcylcbiAgICAgICAgc2V0Tm9kZShub2RlLmluc2VydFRleHQoaSwgbGVhZi50ZXh0LCBtYXJrcykpXG4gICAgICAgIGkgKz0gbGVhZi50ZXh0Lmxlbmd0aFxuICAgICAgfSlcblxuICAgICAgaWYgKF9fYW5jaG9yICE9IG51bGwpIG5vZGUuX19hbmNob3IgPSBfX2FuY2hvciArIGxlbmd0aFxuICAgICAgaWYgKF9fZm9jdXMgIT0gbnVsbCkgbm9kZS5fX2ZvY3VzID0gX19mb2N1cyArIGxlbmd0aFxuXG4gICAgICBsZW5ndGggKz0gY2hpbGQudGV4dC5sZW5ndGhcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgY2hpbGQgaXMgYSBzZWxlY3Rpb24gb2JqZWN0IHN0b3JlIHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgIGlmIChjaGlsZCA9PSBBTkNIT1IgfHwgY2hpbGQgPT0gQ1VSU09SKSBub2RlLl9fYW5jaG9yID0gbGVuZ3RoXG4gICAgaWYgKGNoaWxkID09IEZPQ1VTIHx8IGNoaWxkID09IENVUlNPUikgbm9kZS5fX2ZvY3VzID0gbGVuZ3RoXG4gIH0pXG5cbiAgLy8gTWFrZSBzdXJlIHRoZSBtb3N0IHJlY2VudCBub2RlIGlzIGFkZGVkLlxuICBhcnJheS5wdXNoKG5vZGUpXG5cbiAgcmV0dXJuIGFycmF5XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHNldCBvZiBoeXBlcnNjcmlwdCBjcmVhdG9ycyBhbiBgb3B0aW9uc2Agb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcmVzb2x2ZUNyZWF0b3JzKG9wdGlvbnMpIHtcbiAgY29uc3Qge1xuICAgIGJsb2NrcyA9IHt9LFxuICAgIGlubGluZXMgPSB7fSxcbiAgICBtYXJrcyA9IHt9LFxuICB9ID0gb3B0aW9uc1xuXG4gIGNvbnN0IGNyZWF0b3JzID0ge1xuICAgIC4uLkNSRUFUT1JTLFxuICAgIC4uLihvcHRpb25zLmNyZWF0b3JzIHx8IHt9KSxcbiAgfVxuXG4gIE9iamVjdC5rZXlzKGJsb2NrcykubWFwKChrZXkpID0+IHtcbiAgICBjcmVhdG9yc1trZXldID0gbm9ybWFsaXplTm9kZShrZXksIGJsb2Nrc1trZXldLCAnYmxvY2snKVxuICB9KVxuXG4gIE9iamVjdC5rZXlzKGlubGluZXMpLm1hcCgoa2V5KSA9PiB7XG4gICAgY3JlYXRvcnNba2V5XSA9IG5vcm1hbGl6ZU5vZGUoa2V5LCBpbmxpbmVzW2tleV0sICdpbmxpbmUnKVxuICB9KVxuXG4gIE9iamVjdC5rZXlzKG1hcmtzKS5tYXAoKGtleSkgPT4ge1xuICAgIGNyZWF0b3JzW2tleV0gPSBub3JtYWxpemVNYXJrKGtleSwgbWFya3Nba2V5XSlcbiAgfSlcblxuICByZXR1cm4gY3JlYXRvcnNcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSBub2RlIGNyZWF0b3Igd2l0aCBga2V5YCBhbmQgYHZhbHVlYCwgb2YgYG9iamVjdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8U3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtTdHJpbmd9IG9iamVjdFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplTm9kZShrZXksIHZhbHVlLCBvYmplY3QpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB7IHR5cGU6IHZhbHVlIH1cbiAgfVxuXG4gIGlmIChpc1BsYWluT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiAodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IHsga2V5OiBhdHRyS2V5LCAuLi5yZXN0IH0gPSBhdHRyaWJ1dGVzXG4gICAgICBjb25zdCBhdHRycyA9IHtcbiAgICAgICAgLi4udmFsdWUsXG4gICAgICAgIG9iamVjdCxcbiAgICAgICAga2V5OiBhdHRyS2V5LFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgLi4uKHZhbHVlLmRhdGEgfHwge30pLFxuICAgICAgICAgIC4uLnJlc3QsXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENSRUFUT1JTW29iamVjdF0odGFnTmFtZSwgYXR0cnMsIGNoaWxkcmVuKVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgU2xhdGUgaHlwZXJzY3JpcHQgJHtvYmplY3R9IGNyZWF0b3JzIGNhbiBiZSBlaXRoZXIgZnVuY3Rpb25zLCBvYmplY3RzIG9yIHN0cmluZ3MsIGJ1dCB5b3UgcGFzc2VkOiAke3ZhbHVlfWApXG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgbWFyayBjcmVhdG9yIHdpdGggYGtleWAgYW5kIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8U3RyaW5nfSB2YWx1ZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplTWFyayhrZXksIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0geyB0eXBlOiB2YWx1ZSB9XG4gIH1cblxuICBpZiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBhdHRycyA9IHtcbiAgICAgICAgLi4udmFsdWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAuLi4odmFsdWUuZGF0YSB8fCB7fSksXG4gICAgICAgICAgLi4uYXR0cmlidXRlcyxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ1JFQVRPUlMubWFyayh0YWdOYW1lLCBhdHRycywgY2hpbGRyZW4pXG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBTbGF0ZSBoeXBlcnNjcmlwdCBtYXJrIGNyZWF0b3JzIGNhbiBiZSBlaXRoZXIgZnVuY3Rpb25zLCBvYmplY3RzIG9yIHN0cmluZ3MsIGJ1dCB5b3UgcGFzc2VkOiAke3ZhbHVlfWApXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVIeXBlcnNjcmlwdCgpXG5leHBvcnQgeyBjcmVhdGVIeXBlcnNjcmlwdCB9XG4iXX0=