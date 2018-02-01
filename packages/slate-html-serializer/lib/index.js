'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _slate = require('slate');

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * String.
 *
 * @type {String}
 */

var String = new _immutable.Record({
  object: 'string',
  text: ''
});

/**
 * A rule to (de)serialize text nodes. This is automatically added to the HTML
 * serializer so that users don't have to worry about text-level serialization.
 *
 * @type {Object}
 */

var TEXT_RULE = {
  deserialize: function deserialize(el) {
    if (el.tagName && el.tagName.toLowerCase() === 'br') {
      return {
        object: 'text',
        leaves: [{
          object: 'leaf',
          text: '\n'
        }]
      };
    }

    if (el.nodeName == '#text') {
      if (el.nodeValue && el.nodeValue.match(/<!--.*?-->/)) return;

      return {
        object: 'text',
        leaves: [{
          object: 'leaf',
          text: el.nodeValue
        }]
      };
    }
  },
  serialize: function serialize(obj, children) {
    if (obj.object === 'string') {
      return children.split('\n').reduce(function (array, text, i) {
        if (i != 0) array.push(_react2.default.createElement('br', null));
        array.push(text);
        return array;
      }, []);
    }
  }
};

/**
 * A default `parseHtml` function that returns the `<body>` using `DOMParser`.
 *
 * @param {String} html
 * @return {Object}
 */

function defaultParseHtml(html) {
  if (typeof DOMParser === 'undefined') {
    throw new Error('The native `DOMParser` global which the `Html` serializer uses by default is not present in this environment. You must supply the `options.parseHtml` function instead.');
  }

  var parsed = new DOMParser().parseFromString(html, 'text/html');
  var body = parsed.body;

  return body;
}

/**
 * HTML serializer.
 *
 * @type {Html}
 */

var Html =

/**
 * Create a new serializer with `rules`.
 *
 * @param {Object} options
 *   @property {Array} rules
 *   @property {String|Object|Block} defaultBlock
 *   @property {Function} parseHtml
 */

function Html() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, Html);

  _initialiseProps.call(this);

  var _options$defaultBlock = options.defaultBlock,
      defaultBlock = _options$defaultBlock === undefined ? 'paragraph' : _options$defaultBlock,
      _options$parseHtml = options.parseHtml,
      parseHtml = _options$parseHtml === undefined ? defaultParseHtml : _options$parseHtml,
      _options$rules = options.rules,
      rules = _options$rules === undefined ? [] : _options$rules;


  defaultBlock = _slate.Node.createProperties(defaultBlock);

  this.rules = [].concat(_toConsumableArray(rules), [TEXT_RULE]);
  this.defaultBlock = defaultBlock;
  this.parseHtml = parseHtml;
}

/**
 * Deserialize pasted HTML.
 *
 * @param {String} html
 * @param {Object} options
 *   @property {Boolean} toRaw
 * @return {Value}
 */

/**
 * Deserialize an array of DOM elements.
 *
 * @param {Array} elements
 * @return {Array}
 */

/**
 * Deserialize a DOM element.
 *
 * @param {Object} element
 * @return {Any}
 */

/**
 * Deserialize a `mark` object.
 *
 * @param {Object} mark
 * @return {Array}
 */

/**
 * Serialize a `value` object into an HTML string.
 *
 * @param {Value} value
 * @param {Object} options
 *   @property {Boolean} render
 * @return {String|Array}
 */

/**
 * Serialize a `node`.
 *
 * @param {Node} node
 * @return {String}
 */

/**
 * Serialize a `leaf`.
 *
 * @param {Leaf} leaf
 * @return {String}
 */

/**
 * Serialize a `string`.
 *
 * @param {String} string
 * @return {String}
 */

/**
 * Filter out cruft newline nodes inserted by the DOM parser.
 *
 * @param {Object} element
 * @return {Boolean}
 */

;

/**
 * Add a unique key to a React `element`.
 *
 * @param {Element} element
 * @return {Element}
 */

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.deserialize = function (html) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$toJSON = options.toJSON,
        toJSON = _options$toJSON === undefined ? false : _options$toJSON;
    var defaultBlock = _this.defaultBlock,
        parseHtml = _this.parseHtml;

    var fragment = parseHtml(html);
    var children = Array.from(fragment.childNodes);
    var nodes = _this.deserializeElements(children);

    // COMPAT: ensure that all top-level inline nodes are wrapped into a block.
    nodes = nodes.reduce(function (memo, node, i, original) {
      if (node.object == 'block') {
        memo.push(node);
        return memo;
      }

      if (i > 0 && original[i - 1].object != 'block') {
        var _block = memo[memo.length - 1];
        _block.nodes.push(node);
        return memo;
      }

      var block = _extends({
        object: 'block',
        data: {},
        isVoid: false
      }, defaultBlock, {
        nodes: [node]
      });

      memo.push(block);
      return memo;
    }, []);

    // TODO: pretty sure this is no longer needed.
    if (nodes.length == 0) {
      nodes = [_extends({
        object: 'block',
        data: {},
        isVoid: false
      }, defaultBlock, {
        nodes: [{
          object: 'text',
          leaves: [{
            object: 'leaf',
            text: '',
            marks: []
          }]
        }]
      })];
    }

    var json = {
      object: 'value',
      document: {
        object: 'document',
        data: {},
        nodes: nodes
      }
    };

    var ret = toJSON ? json : _slate.Value.fromJSON(json);
    return ret;
  };

  this.deserializeElements = function () {
    var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var nodes = [];

    elements.filter(_this.cruftNewline).forEach(function (element) {
      var node = _this.deserializeElement(element);
      switch ((0, _typeOf2.default)(node)) {
        case 'array':
          nodes = nodes.concat(node);
          break;
        case 'object':
          nodes.push(node);
          break;
      }
    });

    return nodes;
  };

  this.deserializeElement = function (element) {
    var node = void 0;

    if (!element.tagName) {
      element.tagName = '';
    }

    var next = function next(elements) {
      if (Object.prototype.toString.call(elements) == '[object NodeList]') {
        elements = Array.from(elements);
      }

      switch ((0, _typeOf2.default)(elements)) {
        case 'array':
          return _this.deserializeElements(elements);
        case 'object':
          return _this.deserializeElement(elements);
        case 'null':
        case 'undefined':
          return;
        default:
          throw new Error('The `next` argument was called with invalid children: "' + elements + '".');
      }
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _this.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var rule = _step.value;

        if (!rule.deserialize) continue;
        var ret = rule.deserialize(element, next);
        var type = (0, _typeOf2.default)(ret);

        if (type != 'array' && type != 'object' && type != 'null' && type != 'undefined') {
          throw new Error('A rule returned an invalid deserialized representation: "' + node + '".');
        }

        if (ret === undefined) {
          continue;
        } else if (ret === null) {
          return null;
        } else if (ret.object == 'mark') {
          node = _this.deserializeMark(ret);
        } else {
          node = ret;
        }

        break;
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

    return node || next(element.childNodes);
  };

  this.deserializeMark = function (mark) {
    var type = mark.type,
        data = mark.data;


    var applyMark = function applyMark(node) {
      if (node.object == 'mark') {
        return _this.deserializeMark(node);
      } else if (node.object == 'text') {
        node.leaves = node.leaves.map(function (leaf) {
          leaf.marks = leaf.marks || [];
          leaf.marks.push({ type: type, data: data });
          return leaf;
        });
      } else {
        node.nodes = node.nodes.map(applyMark);
      }

      return node;
    };

    return mark.nodes.reduce(function (nodes, node) {
      var ret = applyMark(node);
      if (Array.isArray(ret)) return nodes.concat(ret);
      nodes.push(ret);
      return nodes;
    }, []);
  };

  this.serialize = function (value) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var document = value.document;

    var elements = document.nodes.map(_this.serializeNode);
    if (options.render === false) return elements;

    var html = _server2.default.renderToStaticMarkup(_react2.default.createElement(
      'body',
      null,
      elements
    ));
    var inner = html.slice(6, -7);
    return inner;
  };

  this.serializeNode = function (node) {
    if (node.object === 'text') {
      var leaves = node.getLeaves();
      return leaves.map(_this.serializeLeaf);
    }

    var children = node.nodes.map(_this.serializeNode);

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = _this.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var rule = _step2.value;

        if (!rule.serialize) continue;
        var ret = rule.serialize(node, children);
        if (ret) return addKey(ret);
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

    throw new Error('No serializer defined for node of type "' + node.type + '".');
  };

  this.serializeLeaf = function (leaf) {
    var string = new String({ text: leaf.text });
    var text = _this.serializeString(string);

    return leaf.marks.reduce(function (children, mark) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _this.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var rule = _step3.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(mark, children);
          if (ret) return addKey(ret);
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

      throw new Error('No serializer defined for mark of type "' + mark.type + '".');
    }, text);
  };

  this.serializeString = function (string) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = _this.rules[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var rule = _step4.value;

        if (!rule.serialize) continue;
        var ret = rule.serialize(string, string.text);
        if (ret) return ret;
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
  };

  this.cruftNewline = function (element) {
    return !(element.nodeName === '#text' && element.nodeValue == '\n');
  };
};

var key = 0;

function addKey(element) {
  return _react2.default.cloneElement(element, { key: key++ });
}

/**
 * Export.
 *
 * @type {Html}
 */

exports.default = Html;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJTdHJpbmciLCJvYmplY3QiLCJ0ZXh0IiwiVEVYVF9SVUxFIiwiZGVzZXJpYWxpemUiLCJlbCIsInRhZ05hbWUiLCJ0b0xvd2VyQ2FzZSIsImxlYXZlcyIsIm5vZGVOYW1lIiwibm9kZVZhbHVlIiwibWF0Y2giLCJzZXJpYWxpemUiLCJvYmoiLCJjaGlsZHJlbiIsInNwbGl0IiwicmVkdWNlIiwiYXJyYXkiLCJpIiwicHVzaCIsImRlZmF1bHRQYXJzZUh0bWwiLCJodG1sIiwiRE9NUGFyc2VyIiwiRXJyb3IiLCJwYXJzZWQiLCJwYXJzZUZyb21TdHJpbmciLCJib2R5IiwiSHRtbCIsIm9wdGlvbnMiLCJkZWZhdWx0QmxvY2siLCJwYXJzZUh0bWwiLCJydWxlcyIsImNyZWF0ZVByb3BlcnRpZXMiLCJ0b0pTT04iLCJmcmFnbWVudCIsIkFycmF5IiwiZnJvbSIsImNoaWxkTm9kZXMiLCJub2RlcyIsImRlc2VyaWFsaXplRWxlbWVudHMiLCJtZW1vIiwibm9kZSIsIm9yaWdpbmFsIiwiYmxvY2siLCJsZW5ndGgiLCJkYXRhIiwiaXNWb2lkIiwibWFya3MiLCJqc29uIiwiZG9jdW1lbnQiLCJyZXQiLCJmcm9tSlNPTiIsImVsZW1lbnRzIiwiZmlsdGVyIiwiY3J1ZnROZXdsaW5lIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJkZXNlcmlhbGl6ZUVsZW1lbnQiLCJjb25jYXQiLCJuZXh0IiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwicnVsZSIsInR5cGUiLCJ1bmRlZmluZWQiLCJkZXNlcmlhbGl6ZU1hcmsiLCJtYXJrIiwiYXBwbHlNYXJrIiwibWFwIiwibGVhZiIsImlzQXJyYXkiLCJ2YWx1ZSIsInNlcmlhbGl6ZU5vZGUiLCJyZW5kZXIiLCJyZW5kZXJUb1N0YXRpY01hcmt1cCIsImlubmVyIiwic2xpY2UiLCJnZXRMZWF2ZXMiLCJzZXJpYWxpemVMZWFmIiwiYWRkS2V5Iiwic3RyaW5n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QUFBO0FBQUE7QUFBQTs7QUFBQTtBQUM1Qiw0QkFBbUIsTUFBS25ELEtBQXhCLG1JQUErQjtBQUFBLFlBQXBCaUMsSUFBb0I7O0FBQzdCLFlBQUksQ0FBQ0EsS0FBS3BELFNBQVYsRUFBcUI7QUFDckIsWUFBTXNDLE1BQU1jLEtBQUtwRCxTQUFMLENBQWVzRSxNQUFmLEVBQXVCQSxPQUFPaEYsSUFBOUIsQ0FBWjtBQUNBLFlBQUlnRCxHQUFKLEVBQVMsT0FBT0EsR0FBUDtBQUNWO0FBTDJCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFNN0IsRzs7T0FTREksWSxHQUFlLFVBQUNFLE9BQUQsRUFBYTtBQUMxQixXQUFPLEVBQUVBLFFBQVEvQyxRQUFSLEtBQXFCLE9BQXJCLElBQWdDK0MsUUFBUTlDLFNBQVIsSUFBcUIsSUFBdkQsQ0FBUDtBQUNELEc7OztBQVdILElBQUkwRSxNQUFNLENBQVY7O0FBRUEsU0FBU0gsTUFBVCxDQUFnQnpCLE9BQWhCLEVBQXlCO0FBQ3ZCLFNBQU8sZ0JBQU02QixZQUFOLENBQW1CN0IsT0FBbkIsRUFBNEIsRUFBRTRCLEtBQUtBLEtBQVAsRUFBNUIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7a0JBTWV6RCxJIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RET01TZXJ2ZXIgZnJvbSAncmVhY3QtZG9tL3NlcnZlcidcbmltcG9ydCB0eXBlT2YgZnJvbSAndHlwZS1vZidcbmltcG9ydCB7IE5vZGUsIFZhbHVlIH0gZnJvbSAnc2xhdGUnXG5pbXBvcnQgeyBSZWNvcmQgfSBmcm9tICdpbW11dGFibGUnXG5cbi8qKlxuICogU3RyaW5nLlxuICpcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cblxuY29uc3QgU3RyaW5nID0gbmV3IFJlY29yZCh7XG4gIG9iamVjdDogJ3N0cmluZycsXG4gIHRleHQ6ICcnXG59KVxuXG4vKipcbiAqIEEgcnVsZSB0byAoZGUpc2VyaWFsaXplIHRleHQgbm9kZXMuIFRoaXMgaXMgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgSFRNTFxuICogc2VyaWFsaXplciBzbyB0aGF0IHVzZXJzIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgdGV4dC1sZXZlbCBzZXJpYWxpemF0aW9uLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgVEVYVF9SVUxFID0ge1xuXG4gIGRlc2VyaWFsaXplKGVsKSB7XG4gICAgaWYgKGVsLnRhZ05hbWUgJiYgZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnYnInKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvYmplY3Q6ICd0ZXh0JyxcbiAgICAgICAgbGVhdmVzOiBbe1xuICAgICAgICAgIG9iamVjdDogJ2xlYWYnLFxuICAgICAgICAgIHRleHQ6ICdcXG4nXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsLm5vZGVOYW1lID09ICcjdGV4dCcpIHtcbiAgICAgIGlmIChlbC5ub2RlVmFsdWUgJiYgZWwubm9kZVZhbHVlLm1hdGNoKC88IS0tLio/LS0+LykpIHJldHVyblxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBvYmplY3Q6ICd0ZXh0JyxcbiAgICAgICAgbGVhdmVzOiBbe1xuICAgICAgICAgIG9iamVjdDogJ2xlYWYnLFxuICAgICAgICAgIHRleHQ6IGVsLm5vZGVWYWx1ZVxuICAgICAgICB9XVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzZXJpYWxpemUob2JqLCBjaGlsZHJlbikge1xuICAgIGlmIChvYmoub2JqZWN0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLnJlZHVjZSgoYXJyYXksIHRleHQsIGkpID0+IHtcbiAgICAgICAgICBpZiAoaSAhPSAwKSBhcnJheS5wdXNoKDxiciAvPilcbiAgICAgICAgICBhcnJheS5wdXNoKHRleHQpXG4gICAgICAgICAgcmV0dXJuIGFycmF5XG4gICAgICAgIH0sIFtdKVxuICAgIH1cbiAgfVxuXG59XG5cbi8qKlxuICogQSBkZWZhdWx0IGBwYXJzZUh0bWxgIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYDxib2R5PmAgdXNpbmcgYERPTVBhcnNlcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBkZWZhdWx0UGFyc2VIdG1sKGh0bWwpIHtcbiAgaWYgKHR5cGVvZiBET01QYXJzZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgbmF0aXZlIGBET01QYXJzZXJgIGdsb2JhbCB3aGljaCB0aGUgYEh0bWxgIHNlcmlhbGl6ZXIgdXNlcyBieSBkZWZhdWx0IGlzIG5vdCBwcmVzZW50IGluIHRoaXMgZW52aXJvbm1lbnQuIFlvdSBtdXN0IHN1cHBseSB0aGUgYG9wdGlvbnMucGFyc2VIdG1sYCBmdW5jdGlvbiBpbnN0ZWFkLicpXG4gIH1cblxuICBjb25zdCBwYXJzZWQgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKGh0bWwsICd0ZXh0L2h0bWwnKVxuICBjb25zdCB7IGJvZHkgfSA9IHBhcnNlZFxuICByZXR1cm4gYm9keVxufVxuXG4vKipcbiAqIEhUTUwgc2VyaWFsaXplci5cbiAqXG4gKiBAdHlwZSB7SHRtbH1cbiAqL1xuXG5jbGFzcyBIdG1sIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHNlcmlhbGl6ZXIgd2l0aCBgcnVsZXNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiAgIEBwcm9wZXJ0eSB7QXJyYXl9IHJ1bGVzXG4gICAqICAgQHByb3BlcnR5IHtTdHJpbmd8T2JqZWN0fEJsb2NrfSBkZWZhdWx0QmxvY2tcbiAgICogICBAcHJvcGVydHkge0Z1bmN0aW9ufSBwYXJzZUh0bWxcbiAgICovXG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHtcbiAgICAgIGRlZmF1bHRCbG9jayA9ICdwYXJhZ3JhcGgnLFxuICAgICAgcGFyc2VIdG1sID0gZGVmYXVsdFBhcnNlSHRtbCxcbiAgICAgIHJ1bGVzID0gW10sXG4gICAgfSA9IG9wdGlvbnNcblxuICAgIGRlZmF1bHRCbG9jayA9IE5vZGUuY3JlYXRlUHJvcGVydGllcyhkZWZhdWx0QmxvY2spXG5cbiAgICB0aGlzLnJ1bGVzID0gWyAuLi5ydWxlcywgVEVYVF9SVUxFIF1cbiAgICB0aGlzLmRlZmF1bHRCbG9jayA9IGRlZmF1bHRCbG9ja1xuICAgIHRoaXMucGFyc2VIdG1sID0gcGFyc2VIdG1sXG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemUgcGFzdGVkIEhUTUwuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqICAgQHByb3BlcnR5IHtCb29sZWFufSB0b1Jhd1xuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgZGVzZXJpYWxpemUgPSAoaHRtbCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgY29uc3QgeyB0b0pTT04gPSBmYWxzZSB9ID0gb3B0aW9uc1xuICAgIGNvbnN0IHsgZGVmYXVsdEJsb2NrLCBwYXJzZUh0bWwgfSA9IHRoaXNcbiAgICBjb25zdCBmcmFnbWVudCA9IHBhcnNlSHRtbChodG1sKVxuICAgIGNvbnN0IGNoaWxkcmVuID0gQXJyYXkuZnJvbShmcmFnbWVudC5jaGlsZE5vZGVzKVxuICAgIGxldCBub2RlcyA9IHRoaXMuZGVzZXJpYWxpemVFbGVtZW50cyhjaGlsZHJlbilcblxuICAgIC8vIENPTVBBVDogZW5zdXJlIHRoYXQgYWxsIHRvcC1sZXZlbCBpbmxpbmUgbm9kZXMgYXJlIHdyYXBwZWQgaW50byBhIGJsb2NrLlxuICAgIG5vZGVzID0gbm9kZXMucmVkdWNlKChtZW1vLCBub2RlLCBpLCBvcmlnaW5hbCkgPT4ge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ID09ICdibG9jaycpIHtcbiAgICAgICAgbWVtby5wdXNoKG5vZGUpXG4gICAgICAgIHJldHVybiBtZW1vXG4gICAgICB9XG5cbiAgICAgIGlmIChpID4gMCAmJiBvcmlnaW5hbFtpIC0gMV0ub2JqZWN0ICE9ICdibG9jaycpIHtcbiAgICAgICAgY29uc3QgYmxvY2sgPSBtZW1vW21lbW8ubGVuZ3RoIC0gMV1cbiAgICAgICAgYmxvY2subm9kZXMucHVzaChub2RlKVxuICAgICAgICByZXR1cm4gbWVtb1xuICAgICAgfVxuXG4gICAgICBjb25zdCBibG9jayA9IHtcbiAgICAgICAgb2JqZWN0OiAnYmxvY2snLFxuICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgaXNWb2lkOiBmYWxzZSxcbiAgICAgICAgLi4uZGVmYXVsdEJsb2NrLFxuICAgICAgICBub2RlczogW25vZGVdLFxuICAgICAgfVxuXG4gICAgICBtZW1vLnB1c2goYmxvY2spXG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIFtdKVxuXG4gICAgLy8gVE9ETzogcHJldHR5IHN1cmUgdGhpcyBpcyBubyBsb25nZXIgbmVlZGVkLlxuICAgIGlmIChub2Rlcy5sZW5ndGggPT0gMCkge1xuICAgICAgbm9kZXMgPSBbe1xuICAgICAgICBvYmplY3Q6ICdibG9jaycsXG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgICBpc1ZvaWQ6IGZhbHNlLFxuICAgICAgICAuLi5kZWZhdWx0QmxvY2ssXG4gICAgICAgIG5vZGVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgb2JqZWN0OiAndGV4dCcsXG4gICAgICAgICAgICBsZWF2ZXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9iamVjdDogJ2xlYWYnLFxuICAgICAgICAgICAgICAgIHRleHQ6ICcnLFxuICAgICAgICAgICAgICAgIG1hcmtzOiBbXSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgIH1dXG4gICAgfVxuXG4gICAgY29uc3QganNvbiA9IHtcbiAgICAgIG9iamVjdDogJ3ZhbHVlJyxcbiAgICAgIGRvY3VtZW50OiB7XG4gICAgICAgIG9iamVjdDogJ2RvY3VtZW50JyxcbiAgICAgICAgZGF0YToge30sXG4gICAgICAgIG5vZGVzLFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJldCA9IHRvSlNPTiA/IGpzb24gOiBWYWx1ZS5mcm9tSlNPTihqc29uKVxuICAgIHJldHVybiByZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZSBhbiBhcnJheSBvZiBET00gZWxlbWVudHMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBkZXNlcmlhbGl6ZUVsZW1lbnRzID0gKGVsZW1lbnRzID0gW10pID0+IHtcbiAgICBsZXQgbm9kZXMgPSBbXVxuXG4gICAgZWxlbWVudHMuZmlsdGVyKHRoaXMuY3J1ZnROZXdsaW5lKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBub2RlID0gdGhpcy5kZXNlcmlhbGl6ZUVsZW1lbnQoZWxlbWVudClcbiAgICAgIHN3aXRjaCAodHlwZU9mKG5vZGUpKSB7XG4gICAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgICBub2RlcyA9IG5vZGVzLmNvbmNhdChub2RlKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgbm9kZXMucHVzaChub2RlKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBub2Rlc1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplIGEgRE9NIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gICAqIEByZXR1cm4ge0FueX1cbiAgICovXG5cbiAgZGVzZXJpYWxpemVFbGVtZW50ID0gKGVsZW1lbnQpID0+IHtcbiAgICBsZXQgbm9kZVxuXG4gICAgaWYgKCFlbGVtZW50LnRhZ05hbWUpIHtcbiAgICAgIGVsZW1lbnQudGFnTmFtZSA9ICcnXG4gICAgfVxuXG4gICAgY29uc3QgbmV4dCA9IChlbGVtZW50cykgPT4ge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlbGVtZW50cykgPT0gJ1tvYmplY3QgTm9kZUxpc3RdJykge1xuICAgICAgICBlbGVtZW50cyA9IEFycmF5LmZyb20oZWxlbWVudHMpXG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAodHlwZU9mKGVsZW1lbnRzKSkge1xuICAgICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGVzZXJpYWxpemVFbGVtZW50cyhlbGVtZW50cylcbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5kZXNlcmlhbGl6ZUVsZW1lbnQoZWxlbWVudHMpXG4gICAgICAgIGNhc2UgJ251bGwnOlxuICAgICAgICBjYXNlICd1bmRlZmluZWQnOlxuICAgICAgICAgIHJldHVyblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIFxcYG5leHRcXGAgYXJndW1lbnQgd2FzIGNhbGxlZCB3aXRoIGludmFsaWQgY2hpbGRyZW46IFwiJHtlbGVtZW50c31cIi5gKVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgcnVsZSBvZiB0aGlzLnJ1bGVzKSB7XG4gICAgICBpZiAoIXJ1bGUuZGVzZXJpYWxpemUpIGNvbnRpbnVlXG4gICAgICBjb25zdCByZXQgPSBydWxlLmRlc2VyaWFsaXplKGVsZW1lbnQsIG5leHQpXG4gICAgICBjb25zdCB0eXBlID0gdHlwZU9mKHJldClcblxuICAgICAgaWYgKHR5cGUgIT0gJ2FycmF5JyAmJiB0eXBlICE9ICdvYmplY3QnICYmIHR5cGUgIT0gJ251bGwnICYmIHR5cGUgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIHJ1bGUgcmV0dXJuZWQgYW4gaW52YWxpZCBkZXNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb246IFwiJHtub2RlfVwiLmApXG4gICAgICB9XG5cbiAgICAgIGlmIChyZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIGlmIChyZXQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH0gZWxzZSBpZiAocmV0Lm9iamVjdCA9PSAnbWFyaycpIHtcbiAgICAgICAgbm9kZSA9IHRoaXMuZGVzZXJpYWxpemVNYXJrKHJldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSByZXRcbiAgICAgIH1cblxuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZSB8fCBuZXh0KGVsZW1lbnQuY2hpbGROb2RlcylcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZSBhIGBtYXJrYCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtYXJrXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBkZXNlcmlhbGl6ZU1hcmsgPSAobWFyaykgPT4ge1xuICAgIGNvbnN0IHsgdHlwZSwgZGF0YSB9ID0gbWFya1xuXG4gICAgY29uc3QgYXBwbHlNYXJrID0gKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLm9iamVjdCA9PSAnbWFyaycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzZXJpYWxpemVNYXJrKG5vZGUpXG4gICAgICB9XG5cbiAgICAgIGVsc2UgaWYgKG5vZGUub2JqZWN0ID09ICd0ZXh0Jykge1xuICAgICAgICBub2RlLmxlYXZlcyA9IG5vZGUubGVhdmVzLm1hcCgobGVhZikgPT4ge1xuICAgICAgICAgIGxlYWYubWFya3MgPSBsZWFmLm1hcmtzIHx8IFtdXG4gICAgICAgICAgbGVhZi5tYXJrcy5wdXNoKHsgdHlwZSwgZGF0YSB9KVxuICAgICAgICAgIHJldHVybiBsZWFmXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGVsc2Uge1xuICAgICAgICBub2RlLm5vZGVzID0gbm9kZS5ub2Rlcy5tYXAoYXBwbHlNYXJrKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrLm5vZGVzLnJlZHVjZSgobm9kZXMsIG5vZGUpID0+IHtcbiAgICAgIGNvbnN0IHJldCA9IGFwcGx5TWFyayhub2RlKVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmV0KSkgcmV0dXJuIG5vZGVzLmNvbmNhdChyZXQpXG4gICAgICBub2Rlcy5wdXNoKHJldClcbiAgICAgIHJldHVybiBub2Rlc1xuICAgIH0sIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSBhIGB2YWx1ZWAgb2JqZWN0IGludG8gYW4gSFRNTCBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqICAgQHByb3BlcnR5IHtCb29sZWFufSByZW5kZXJcbiAgICogQHJldHVybiB7U3RyaW5nfEFycmF5fVxuICAgKi9cblxuICBzZXJpYWxpemUgPSAodmFsdWUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5ub2Rlcy5tYXAodGhpcy5zZXJpYWxpemVOb2RlKVxuICAgIGlmIChvcHRpb25zLnJlbmRlciA9PT0gZmFsc2UpIHJldHVybiBlbGVtZW50c1xuXG4gICAgY29uc3QgaHRtbCA9IFJlYWN0RE9NU2VydmVyLnJlbmRlclRvU3RhdGljTWFya3VwKDxib2R5PntlbGVtZW50c308L2JvZHk+KVxuICAgIGNvbnN0IGlubmVyID0gaHRtbC5zbGljZSg2LCAtNylcbiAgICByZXR1cm4gaW5uZXJcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIHNlcmlhbGl6ZU5vZGUgPSAobm9kZSkgPT4ge1xuICAgIGlmIChub2RlLm9iamVjdCA9PT0gJ3RleHQnKSB7XG4gICAgICBjb25zdCBsZWF2ZXMgPSBub2RlLmdldExlYXZlcygpXG4gICAgICByZXR1cm4gbGVhdmVzLm1hcCh0aGlzLnNlcmlhbGl6ZUxlYWYpXG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLm5vZGVzLm1hcCh0aGlzLnNlcmlhbGl6ZU5vZGUpXG5cbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgdGhpcy5ydWxlcykge1xuICAgICAgaWYgKCFydWxlLnNlcmlhbGl6ZSkgY29udGludWVcbiAgICAgIGNvbnN0IHJldCA9IHJ1bGUuc2VyaWFsaXplKG5vZGUsIGNoaWxkcmVuKVxuICAgICAgaWYgKHJldCkgcmV0dXJuIGFkZEtleShyZXQpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBObyBzZXJpYWxpemVyIGRlZmluZWQgZm9yIG5vZGUgb2YgdHlwZSBcIiR7bm9kZS50eXBlfVwiLmApXG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIGEgYGxlYWZgLlxuICAgKlxuICAgKiBAcGFyYW0ge0xlYWZ9IGxlYWZcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBzZXJpYWxpemVMZWFmID0gKGxlYWYpID0+IHtcbiAgICBjb25zdCBzdHJpbmcgPSBuZXcgU3RyaW5nKHsgdGV4dDogbGVhZi50ZXh0IH0pXG4gICAgY29uc3QgdGV4dCA9IHRoaXMuc2VyaWFsaXplU3RyaW5nKHN0cmluZylcblxuICAgIHJldHVybiBsZWFmLm1hcmtzLnJlZHVjZSgoY2hpbGRyZW4sIG1hcmspID0+IHtcbiAgICAgIGZvciAoY29uc3QgcnVsZSBvZiB0aGlzLnJ1bGVzKSB7XG4gICAgICAgIGlmICghcnVsZS5zZXJpYWxpemUpIGNvbnRpbnVlXG4gICAgICAgIGNvbnN0IHJldCA9IHJ1bGUuc2VyaWFsaXplKG1hcmssIGNoaWxkcmVuKVxuICAgICAgICBpZiAocmV0KSByZXR1cm4gYWRkS2V5KHJldClcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBzZXJpYWxpemVyIGRlZmluZWQgZm9yIG1hcmsgb2YgdHlwZSBcIiR7bWFyay50eXBlfVwiLmApXG4gICAgfSwgdGV4dClcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgYSBgc3RyaW5nYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIHNlcmlhbGl6ZVN0cmluZyA9IChzdHJpbmcpID0+IHtcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgdGhpcy5ydWxlcykge1xuICAgICAgaWYgKCFydWxlLnNlcmlhbGl6ZSkgY29udGludWVcbiAgICAgIGNvbnN0IHJldCA9IHJ1bGUuc2VyaWFsaXplKHN0cmluZywgc3RyaW5nLnRleHQpXG4gICAgICBpZiAocmV0KSByZXR1cm4gcmV0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbHRlciBvdXQgY3J1ZnQgbmV3bGluZSBub2RlcyBpbnNlcnRlZCBieSB0aGUgRE9NIHBhcnNlci5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgY3J1ZnROZXdsaW5lID0gKGVsZW1lbnQpID0+IHtcbiAgICByZXR1cm4gIShlbGVtZW50Lm5vZGVOYW1lID09PSAnI3RleHQnICYmIGVsZW1lbnQubm9kZVZhbHVlID09ICdcXG4nKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBZGQgYSB1bmlxdWUga2V5IHRvIGEgUmVhY3QgYGVsZW1lbnRgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuXG5sZXQga2V5ID0gMFxuXG5mdW5jdGlvbiBhZGRLZXkoZWxlbWVudCkge1xuICByZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KGVsZW1lbnQsIHsga2V5OiBrZXkrKyB9KVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7SHRtbH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBIdG1sXG4iXX0=