'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

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
  anchorKey: null,
  anchorOffset: 0,
  focusKey: null,
  focusOffset: 0,
  isBackward: null,
  isFocused: false,
  marks: null
};

/**
 * Range.
 *
 * @type {Range}
 */

var Range = function (_Record) {
  _inherits(Range, _Record);

  function Range() {
    _classCallCheck(this, Range);

    return _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).apply(this, arguments));
  }

  _createClass(Range, [{
    key: 'hasAnchorAtStartOf',


    /**
     * Check whether anchor point of the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

    value: function hasAnchorAtStartOf(node) {
      // PERF: Do a check for a `0` offset first since it's quickest.
      if (this.anchorOffset != 0) return false;
      var first = getFirst(node);
      return this.anchorKey == first.key;
    }

    /**
     * Check whether anchor point of the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorAtEndOf',
    value: function hasAnchorAtEndOf(node) {
      var last = getLast(node);
      return this.anchorKey == last.key && this.anchorOffset == last.text.length;
    }

    /**
     * Check whether the anchor edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorBetween',
    value: function hasAnchorBetween(node, start, end) {
      return this.anchorOffset <= end && start <= this.anchorOffset && this.hasAnchorIn(node);
    }

    /**
     * Check whether the anchor edge of a range is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorIn',
    value: function hasAnchorIn(node) {
      return node.object == 'text' ? node.key == this.anchorKey : this.anchorKey != null && node.hasDescendant(this.anchorKey);
    }

    /**
     * Check whether focus point of the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtEndOf',
    value: function hasFocusAtEndOf(node) {
      var last = getLast(node);
      return this.focusKey == last.key && this.focusOffset == last.text.length;
    }

    /**
     * Check whether focus point of the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtStartOf',
    value: function hasFocusAtStartOf(node) {
      if (this.focusOffset != 0) return false;
      var first = getFirst(node);
      return this.focusKey == first.key;
    }

    /**
     * Check whether the focus edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusBetween',
    value: function hasFocusBetween(node, start, end) {
      return start <= this.focusOffset && this.focusOffset <= end && this.hasFocusIn(node);
    }

    /**
     * Check whether the focus edge of a range is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusIn',
    value: function hasFocusIn(node) {
      return node.object == 'text' ? node.key == this.focusKey : this.focusKey != null && node.hasDescendant(this.focusKey);
    }

    /**
     * Check whether the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtStartOf',
    value: function isAtStartOf(node) {
      return this.isCollapsed && this.hasAnchorAtStartOf(node);
    }

    /**
     * Check whether the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtEndOf',
    value: function isAtEndOf(node) {
      return this.isCollapsed && this.hasAnchorAtEndOf(node);
    }

    /**
     * Focus the range.
     *
     * @return {Range}
     */

  }, {
    key: 'focus',
    value: function focus() {
      return this.merge({
        isFocused: true
      });
    }

    /**
     * Blur the range.
     *
     * @return {Range}
     */

  }, {
    key: 'blur',
    value: function blur() {
      return this.merge({
        isFocused: false
      });
    }

    /**
     * Unset the range.
     *
     * @return {Range}
     */

  }, {
    key: 'deselect',
    value: function deselect() {
      return this.merge({
        anchorKey: null,
        anchorOffset: 0,
        focusKey: null,
        focusOffset: 0,
        isFocused: false,
        isBackward: false
      });
    }

    /**
     * Flip the range.
     *
     * @return {Range}
     */

  }, {
    key: 'flip',
    value: function flip() {
      return this.merge({
        anchorKey: this.focusKey,
        anchorOffset: this.focusOffset,
        focusKey: this.anchorKey,
        focusOffset: this.anchorOffset,
        isBackward: this.isBackward == null ? null : !this.isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Range}
     */

  }, {
    key: 'moveAnchor',
    value: function moveAnchor() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      var anchorOffset = this.anchorOffset + n;
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: anchorKey == focusKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Range}
     */

  }, {
    key: 'moveFocus',
    value: function moveFocus() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          focusKey = this.focusKey,
          isBackward = this.isBackward;

      var focusOffset = this.focusOffset + n;
      return this.merge({
        focusOffset: focusOffset,
        isBackward: focusKey == anchorKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the range's anchor point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Range}
     */

  }, {
    key: 'moveAnchorTo',
    value: function moveAnchorTo(key, offset) {
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      return this.merge({
        anchorKey: key,
        anchorOffset: offset,
        isBackward: key == focusKey ? offset > focusOffset : key == anchorKey ? isBackward : null
      });
    }

    /**
     * Move the range's focus point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Range}
     */

  }, {
    key: 'moveFocusTo',
    value: function moveFocusTo(key, offset) {
      var focusKey = this.focusKey,
          anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          isBackward = this.isBackward;

      return this.merge({
        focusKey: key,
        focusOffset: offset,
        isBackward: key == anchorKey ? anchorOffset > offset : key == focusKey ? isBackward : null
      });
    }

    /**
     * Move the range to `anchorOffset`.
     *
     * @param {Number} anchorOffset
     * @return {Range}
     */

  }, {
    key: 'moveAnchorOffsetTo',
    value: function moveAnchorOffsetTo(anchorOffset) {
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: this.anchorKey == this.focusKey ? anchorOffset > this.focusOffset : this.isBackward
      });
    }

    /**
     * Move the range to `focusOffset`.
     *
     * @param {Number} focusOffset
     * @return {Range}
     */

  }, {
    key: 'moveFocusOffsetTo',
    value: function moveFocusOffsetTo(focusOffset) {
      return this.merge({
        focusOffset: focusOffset,
        isBackward: this.anchorKey == this.focusKey ? this.anchorOffset > focusOffset : this.isBackward
      });
    }

    /**
     * Move the range to `anchorOffset` and `focusOffset`.
     *
     * @param {Number} anchorOffset
     * @param {Number} focusOffset (optional)
     * @return {Range}
     */

  }, {
    key: 'moveOffsetsTo',
    value: function moveOffsetsTo(anchorOffset) {
      var focusOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : anchorOffset;

      return this.moveAnchorOffsetTo(anchorOffset).moveFocusOffsetTo(focusOffset);
    }

    /**
     * Move the focus point to the anchor point.
     *
     * @return {Range}
     */

  }, {
    key: 'moveToAnchor',
    value: function moveToAnchor() {
      return this.moveFocusTo(this.anchorKey, this.anchorOffset);
    }

    /**
     * Move the anchor point to the focus point.
     *
     * @return {Range}
     */

  }, {
    key: 'moveToFocus',
    value: function moveToFocus() {
      return this.moveAnchorTo(this.focusKey, this.focusOffset);
    }

    /**
     * Move the range's anchor point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveAnchorToStartOf',
    value: function moveAnchorToStartOf(node) {
      node = getFirst(node);
      return this.moveAnchorTo(node.key, 0);
    }

    /**
     * Move the range's anchor point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveAnchorToEndOf',
    value: function moveAnchorToEndOf(node) {
      node = getLast(node);
      return this.moveAnchorTo(node.key, node.text.length);
    }

    /**
     * Move the range's focus point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveFocusToStartOf',
    value: function moveFocusToStartOf(node) {
      node = getFirst(node);
      return this.moveFocusTo(node.key, 0);
    }

    /**
     * Move the range's focus point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveFocusToEndOf',
    value: function moveFocusToEndOf(node) {
      node = getLast(node);
      return this.moveFocusTo(node.key, node.text.length);
    }

    /**
     * Move to the entire range of `start` and `end` nodes.
     *
     * @param {Node} start
     * @param {Node} end (optional)
     * @return {Range}
     */

  }, {
    key: 'moveToRangeOf',
    value: function moveToRangeOf(start) {
      var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : start;

      return this.moveAnchorToStartOf(start).moveFocusToEndOf(end);
    }

    /**
     * Normalize the range, relative to a `node`, ensuring that the anchor
     * and focus nodes of the range always refer to leaf text nodes.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'normalize',
    value: function normalize(node) {
      var range = this;
      var anchorKey = range.anchorKey,
          anchorOffset = range.anchorOffset,
          focusKey = range.focusKey,
          focusOffset = range.focusOffset,
          isBackward = range.isBackward;

      // If the range is unset, make sure it is properly zeroed out.

      if (anchorKey == null || focusKey == null) {
        return range.merge({
          anchorKey: null,
          anchorOffset: 0,
          focusKey: null,
          focusOffset: 0,
          isBackward: false
        });
      }

      // Get the anchor and focus nodes.
      var anchorNode = node.getDescendant(anchorKey);
      var focusNode = node.getDescendant(focusKey);

      // If the range is malformed, warn and zero it out.
      if (!anchorNode || !focusNode) {
        _slateDevLogger2.default.warn('The range was invalid and was reset. The range in question was:', range);
        var first = node.getFirstText();
        return range.merge({
          anchorKey: first ? first.key : null,
          anchorOffset: 0,
          focusKey: first ? first.key : null,
          focusOffset: 0,
          isBackward: false
        });
      }

      // If the anchor node isn't a text node, match it to one.
      if (anchorNode.object != 'text') {
        _slateDevLogger2.default.warn('The range anchor was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', anchorNode);
        var anchorText = anchorNode.getTextAtOffset(anchorOffset);
        var offset = anchorNode.getOffset(anchorText.key);
        anchorOffset = anchorOffset - offset;
        anchorNode = anchorText;
      }

      // If the focus node isn't a text node, match it to one.
      if (focusNode.object != 'text') {
        _slateDevLogger2.default.warn('The range focus was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', focusNode);
        var focusText = focusNode.getTextAtOffset(focusOffset);
        var _offset = focusNode.getOffset(focusText.key);
        focusOffset = focusOffset - _offset;
        focusNode = focusText;
      }

      // If `isBackward` is not set, derive it.
      if (isBackward == null) {
        if (anchorNode.key === focusNode.key) {
          isBackward = anchorOffset > focusOffset;
        } else {
          isBackward = !node.areDescendantsSorted(anchorNode.key, focusNode.key);
        }
      }

      // Merge in any updated properties.
      return range.merge({
        anchorKey: anchorNode.key,
        anchorOffset: anchorOffset,
        focusKey: focusNode.key,
        focusOffset: focusOffset,
        isBackward: isBackward
      });
    }

    /**
     * Return a JSON representation of the range.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        anchorKey: this.anchorKey,
        anchorOffset: this.anchorOffset,
        focusKey: this.focusKey,
        focusOffset: this.focusOffset,
        isBackward: this.isBackward,
        isFocused: this.isFocused,
        marks: this.marks == null ? null : this.marks.toArray().map(function (m) {
          return m.toJSON();
        })
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
      return 'range';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check whether the range is blurred.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return !this.isFocused;
    }

    /**
     * Check whether the range is collapsed.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.anchorKey == this.focusKey && this.anchorOffset == this.focusOffset;
    }

    /**
     * Check whether the range is expanded.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return !this.isCollapsed;
    }

    /**
     * Check whether the range is forward.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.isBackward == null ? null : !this.isBackward;
    }

    /**
     * Check whether the range's keys are set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isSet',
    get: function get() {
      return this.anchorKey != null && this.focusKey != null;
    }

    /**
     * Check whether the range's keys are not set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isUnset',
    get: function get() {
      return !this.isSet;
    }

    /**
     * Get the start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.isBackward ? this.focusKey : this.anchorKey;
    }

    /**
     * Get the start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get() {
      return this.isBackward ? this.focusOffset : this.anchorOffset;
    }

    /**
     * Get the end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get() {
      return this.isBackward ? this.anchorKey : this.focusKey;
    }

    /**
     * Get the end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get() {
      return this.isBackward ? this.anchorOffset : this.focusOffset;
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Range` with `attrs`.
     *
     * @param {Object|Range} attrs
     * @return {Range}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Range.isRange(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Range.fromJSON(attrs);
      }

      throw new Error('`Range.create` only accepts objects or ranges, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Ranges` from `elements`.
     *
     * @param {Array<Range|Object>|List<Range|Object>} elements
     * @return {List<Range>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Range.create));
        return list;
      }

      throw new Error('`Range.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable range properties from `attrs`.
     *
     * @param {Object|String|Range} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Range.isRange(attrs)) {
        return {
          anchorKey: attrs.anchorKey,
          anchorOffset: attrs.anchorOffset,
          focusKey: attrs.focusKey,
          focusOffset: attrs.focusOffset,
          isBackward: attrs.isBackward,
          isFocused: attrs.isFocused,
          marks: attrs.marks
        };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var props = {};
        if ('anchorKey' in attrs) props.anchorKey = attrs.anchorKey;
        if ('anchorOffset' in attrs) props.anchorOffset = attrs.anchorOffset;
        if ('anchorPath' in attrs) props.anchorPath = attrs.anchorPath;
        if ('focusKey' in attrs) props.focusKey = attrs.focusKey;
        if ('focusOffset' in attrs) props.focusOffset = attrs.focusOffset;
        if ('focusPath' in attrs) props.focusPath = attrs.focusPath;
        if ('isBackward' in attrs) props.isBackward = attrs.isBackward;
        if ('isFocused' in attrs) props.isFocused = attrs.isFocused;
        if ('marks' in attrs) props.marks = attrs.marks == null ? null : _mark2.default.createSet(attrs.marks);
        return props;
      }

      throw new Error('`Range.createProperties` only accepts objects or ranges, but you passed it: ' + attrs);
    }

    /**
     * Create a `Range` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Range}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$anchorKey = object.anchorKey,
          anchorKey = _object$anchorKey === undefined ? null : _object$anchorKey,
          _object$anchorOffset = object.anchorOffset,
          anchorOffset = _object$anchorOffset === undefined ? 0 : _object$anchorOffset,
          _object$focusKey = object.focusKey,
          focusKey = _object$focusKey === undefined ? null : _object$focusKey,
          _object$focusOffset = object.focusOffset,
          focusOffset = _object$focusOffset === undefined ? 0 : _object$focusOffset,
          _object$isBackward = object.isBackward,
          isBackward = _object$isBackward === undefined ? null : _object$isBackward,
          _object$isFocused = object.isFocused,
          isFocused = _object$isFocused === undefined ? false : _object$isFocused,
          _object$marks = object.marks,
          marks = _object$marks === undefined ? null : _object$marks;


      var range = new Range({
        anchorKey: anchorKey,
        anchorOffset: anchorOffset,
        focusKey: focusKey,
        focusOffset: focusOffset,
        isBackward: isBackward,
        isFocused: isFocused,
        marks: marks == null ? null : new _immutable.Set(marks.map(_mark2.default.fromJSON))
      });

      return range;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isRange',


    /**
     * Check if an `obj` is a `Range`.
     *
     * @param {Any} obj
     * @return {Boolean}
     */

    value: function isRange(obj) {
      return !!(obj && obj[_modelTypes2.default.RANGE]);
    }
  }]);

  return Range;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Range.fromJS = Range.fromJSON;
Range.prototype[_modelTypes2.default.RANGE] = true;

/**
 * Mix in some "move" convenience methods.
 */

var MOVE_METHODS = [['move', ''], ['move', 'To'], ['move', 'ToStartOf'], ['move', 'ToEndOf']];

MOVE_METHODS.forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      p = _ref2[0],
      s = _ref2[1];

  Range.prototype['' + p + s] = function () {
    var _ref3;

    return (_ref3 = this[p + 'Anchor' + s].apply(this, arguments))[p + 'Focus' + s].apply(_ref3, arguments);
  };
});

/**
 * Mix in the "start", "end" and "edge" convenience methods.
 */

var EDGE_METHODS = [['has', 'AtStartOf', true], ['has', 'AtEndOf', true], ['has', 'Between', true], ['has', 'In', true], ['collapseTo', ''], ['move', ''], ['moveTo', ''], ['move', 'To'], ['move', 'OffsetTo']];

EDGE_METHODS.forEach(function (_ref4) {
  var _ref5 = _slicedToArray(_ref4, 3),
      p = _ref5[0],
      s = _ref5[1],
      hasEdge = _ref5[2];

  var anchor = p + 'Anchor' + s;
  var focus = p + 'Focus' + s;

  Range.prototype[p + 'Start' + s] = function () {
    return this.isBackward ? this[focus].apply(this, arguments) : this[anchor].apply(this, arguments);
  };

  Range.prototype[p + 'End' + s] = function () {
    return this.isBackward ? this[anchor].apply(this, arguments) : this[focus].apply(this, arguments);
  };

  if (hasEdge) {
    Range.prototype[p + 'Edge' + s] = function () {
      return this[anchor].apply(this, arguments) || this[focus].apply(this, arguments);
    };
  }
});

/**
 * Mix in some aliases for convenience / parallelism with the browser APIs.
 */

var ALIAS_METHODS = [['collapseTo', 'moveTo'], ['collapseToAnchor', 'moveToAnchor'], ['collapseToFocus', 'moveToFocus'], ['collapseToStart', 'moveToStart'], ['collapseToEnd', 'moveToEnd'], ['collapseToStartOf', 'moveToStartOf'], ['collapseToEndOf', 'moveToEndOf'], ['extend', 'moveFocus'], ['extendTo', 'moveFocusTo'], ['extendToStartOf', 'moveFocusToStartOf'], ['extendToEndOf', 'moveFocusToEndOf']];

ALIAS_METHODS.forEach(function (_ref6) {
  var _ref7 = _slicedToArray(_ref6, 2),
      alias = _ref7[0],
      method = _ref7[1];

  Range.prototype[alias] = function () {
    return this[method].apply(this, arguments);
  };
});

/**
 * Get the first text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getFirst(node) {
  return node.object == 'text' ? node : node.getFirstText();
}

/**
 * Get the last text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getLast(node) {
  return node.object == 'text' ? node : node.getLastText();
}

/**
 * Export.
 *
 * @type {Range}
 */

exports.default = Range;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvcmFuZ2UuanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJhbmNob3JLZXkiLCJhbmNob3JPZmZzZXQiLCJmb2N1c0tleSIsImZvY3VzT2Zmc2V0IiwiaXNCYWNrd2FyZCIsImlzRm9jdXNlZCIsIm1hcmtzIiwiUmFuZ2UiLCJub2RlIiwiZmlyc3QiLCJnZXRGaXJzdCIsImtleSIsImxhc3QiLCJnZXRMYXN0IiwidGV4dCIsImxlbmd0aCIsInN0YXJ0IiwiZW5kIiwiaGFzQW5jaG9ySW4iLCJvYmplY3QiLCJoYXNEZXNjZW5kYW50IiwiaGFzRm9jdXNJbiIsImlzQ29sbGFwc2VkIiwiaGFzQW5jaG9yQXRTdGFydE9mIiwiaGFzQW5jaG9yQXRFbmRPZiIsIm1lcmdlIiwibiIsIm9mZnNldCIsIm1vdmVBbmNob3JPZmZzZXRUbyIsIm1vdmVGb2N1c09mZnNldFRvIiwibW92ZUZvY3VzVG8iLCJtb3ZlQW5jaG9yVG8iLCJtb3ZlQW5jaG9yVG9TdGFydE9mIiwibW92ZUZvY3VzVG9FbmRPZiIsInJhbmdlIiwiYW5jaG9yTm9kZSIsImdldERlc2NlbmRhbnQiLCJmb2N1c05vZGUiLCJ3YXJuIiwiZ2V0Rmlyc3RUZXh0IiwiYW5jaG9yVGV4dCIsImdldFRleHRBdE9mZnNldCIsImdldE9mZnNldCIsImZvY3VzVGV4dCIsImFyZURlc2NlbmRhbnRzU29ydGVkIiwidG9BcnJheSIsIm1hcCIsIm0iLCJ0b0pTT04iLCJkZXByZWNhdGUiLCJpc1NldCIsImF0dHJzIiwiaXNSYW5nZSIsImZyb21KU09OIiwiRXJyb3IiLCJlbGVtZW50cyIsImlzTGlzdCIsIkFycmF5IiwiaXNBcnJheSIsImxpc3QiLCJjcmVhdGUiLCJwcm9wcyIsImFuY2hvclBhdGgiLCJmb2N1c1BhdGgiLCJjcmVhdGVTZXQiLCJvYmoiLCJSQU5HRSIsImZyb21KUyIsInByb3RvdHlwZSIsIk1PVkVfTUVUSE9EUyIsImZvckVhY2giLCJwIiwicyIsIkVER0VfTUVUSE9EUyIsImhhc0VkZ2UiLCJhbmNob3IiLCJmb2N1cyIsIkFMSUFTX01FVEhPRFMiLCJhbGlhcyIsIm1ldGhvZCIsImdldExhc3RUZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxXQUFXO0FBQ2ZDLGFBQVcsSUFESTtBQUVmQyxnQkFBYyxDQUZDO0FBR2ZDLFlBQVUsSUFISztBQUlmQyxlQUFhLENBSkU7QUFLZkMsY0FBWSxJQUxHO0FBTWZDLGFBQVcsS0FOSTtBQU9mQyxTQUFPO0FBUFEsQ0FBakI7O0FBVUE7Ozs7OztJQU1NQyxLOzs7Ozs7Ozs7Ozs7O0FBZ1BKOzs7Ozs7O3VDQU9tQkMsSSxFQUFNO0FBQ3ZCO0FBQ0EsVUFBSSxLQUFLUCxZQUFMLElBQXFCLENBQXpCLEVBQTRCLE9BQU8sS0FBUDtBQUM1QixVQUFNUSxRQUFRQyxTQUFTRixJQUFULENBQWQ7QUFDQSxhQUFPLEtBQUtSLFNBQUwsSUFBa0JTLE1BQU1FLEdBQS9CO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OztxQ0FPaUJILEksRUFBTTtBQUNyQixVQUFNSSxPQUFPQyxRQUFRTCxJQUFSLENBQWI7QUFDQSxhQUFPLEtBQUtSLFNBQUwsSUFBa0JZLEtBQUtELEdBQXZCLElBQThCLEtBQUtWLFlBQUwsSUFBcUJXLEtBQUtFLElBQUwsQ0FBVUMsTUFBcEU7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7O3FDQVVpQlAsSSxFQUFNUSxLLEVBQU9DLEcsRUFBSztBQUNqQyxhQUNFLEtBQUtoQixZQUFMLElBQXFCZ0IsR0FBckIsSUFDQUQsU0FBUyxLQUFLZixZQURkLElBRUEsS0FBS2lCLFdBQUwsQ0FBaUJWLElBQWpCLENBSEY7QUFLRDs7QUFFRDs7Ozs7Ozs7O2dDQU9ZQSxJLEVBQU07QUFDaEIsYUFBT0EsS0FBS1csTUFBTCxJQUFlLE1BQWYsR0FDSFgsS0FBS0csR0FBTCxJQUFZLEtBQUtYLFNBRGQsR0FFSCxLQUFLQSxTQUFMLElBQWtCLElB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LEtBQUsrQixZQUFMLEVBQXRDO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFPQSxTQUFTMUIsT0FBVCxDQUFpQkwsSUFBakIsRUFBdUI7QUFDckIsU0FBT0EsS0FBS1csTUFBTCxJQUFlLE1BQWYsR0FBd0JYLElBQXhCLEdBQStCQSxLQUFLd0UsV0FBTCxFQUF0QztBQUNEOztBQUVEOzs7Ozs7a0JBTWV6RSxLIiwiZmlsZSI6InJhbmdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdpcy1wbGFpbi1vYmplY3QnXG5pbXBvcnQgbG9nZ2VyIGZyb20gJ3NsYXRlLWRldi1sb2dnZXInXG5pbXBvcnQgeyBMaXN0LCBSZWNvcmQsIFNldCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuaW1wb3J0IE1PREVMX1RZUEVTIGZyb20gJy4uL2NvbnN0YW50cy9tb2RlbC10eXBlcydcbmltcG9ydCBNYXJrIGZyb20gJy4vbWFyaydcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgYW5jaG9yS2V5OiBudWxsLFxuICBhbmNob3JPZmZzZXQ6IDAsXG4gIGZvY3VzS2V5OiBudWxsLFxuICBmb2N1c09mZnNldDogMCxcbiAgaXNCYWNrd2FyZDogbnVsbCxcbiAgaXNGb2N1c2VkOiBmYWxzZSxcbiAgbWFya3M6IG51bGwsXG59XG5cbi8qKlxuICogUmFuZ2UuXG4gKlxuICogQHR5cGUge1JhbmdlfVxuICovXG5cbmNsYXNzIFJhbmdlIGV4dGVuZHMgUmVjb3JkKERFRkFVTFRTKSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgUmFuZ2VgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8UmFuZ2V9IGF0dHJzXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlKGF0dHJzID0ge30pIHtcbiAgICBpZiAoUmFuZ2UuaXNSYW5nZShhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgcmV0dXJuIFJhbmdlLmZyb21KU09OKGF0dHJzKVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgUmFuZ2UuY3JlYXRlXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzIG9yIHJhbmdlcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaXN0IG9mIGBSYW5nZXNgIGZyb20gYGVsZW1lbnRzYC5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxSYW5nZXxPYmplY3Q+fExpc3Q8UmFuZ2V8T2JqZWN0Pn0gZWxlbWVudHNcbiAgICogQHJldHVybiB7TGlzdDxSYW5nZT59XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGVMaXN0KGVsZW1lbnRzID0gW10pIHtcbiAgICBpZiAoTGlzdC5pc0xpc3QoZWxlbWVudHMpIHx8IEFycmF5LmlzQXJyYXkoZWxlbWVudHMpKSB7XG4gICAgICBjb25zdCBsaXN0ID0gbmV3IExpc3QoZWxlbWVudHMubWFwKFJhbmdlLmNyZWF0ZSkpXG4gICAgICByZXR1cm4gbGlzdFxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgUmFuZ2UuY3JlYXRlTGlzdFxcYCBvbmx5IGFjY2VwdHMgYXJyYXlzIG9yIGxpc3RzLCBidXQgeW91IHBhc3NlZCBpdDogJHtlbGVtZW50c31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRpY3Rpb25hcnkgb2Ygc2V0dGFibGUgcmFuZ2UgcHJvcGVydGllcyBmcm9tIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ3xSYW5nZX0gYXR0cnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcyhhdHRycyA9IHt9KSB7XG4gICAgaWYgKFJhbmdlLmlzUmFuZ2UoYXR0cnMpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhbmNob3JLZXk6IGF0dHJzLmFuY2hvcktleSxcbiAgICAgICAgYW5jaG9yT2Zmc2V0OiBhdHRycy5hbmNob3JPZmZzZXQsXG4gICAgICAgIGZvY3VzS2V5OiBhdHRycy5mb2N1c0tleSxcbiAgICAgICAgZm9jdXNPZmZzZXQ6IGF0dHJzLmZvY3VzT2Zmc2V0LFxuICAgICAgICBpc0JhY2t3YXJkOiBhdHRycy5pc0JhY2t3YXJkLFxuICAgICAgICBpc0ZvY3VzZWQ6IGF0dHJzLmlzRm9jdXNlZCxcbiAgICAgICAgbWFya3M6IGF0dHJzLm1hcmtzLFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgY29uc3QgcHJvcHMgPSB7fVxuICAgICAgaWYgKCdhbmNob3JLZXknIGluIGF0dHJzKSBwcm9wcy5hbmNob3JLZXkgPSBhdHRycy5hbmNob3JLZXlcbiAgICAgIGlmICgnYW5jaG9yT2Zmc2V0JyBpbiBhdHRycykgcHJvcHMuYW5jaG9yT2Zmc2V0ID0gYXR0cnMuYW5jaG9yT2Zmc2V0XG4gICAgICBpZiAoJ2FuY2hvclBhdGgnIGluIGF0dHJzKSBwcm9wcy5hbmNob3JQYXRoID0gYXR0cnMuYW5jaG9yUGF0aFxuICAgICAgaWYgKCdmb2N1c0tleScgaW4gYXR0cnMpIHByb3BzLmZvY3VzS2V5ID0gYXR0cnMuZm9jdXNLZXlcbiAgICAgIGlmICgnZm9jdXNPZmZzZXQnIGluIGF0dHJzKSBwcm9wcy5mb2N1c09mZnNldCA9IGF0dHJzLmZvY3VzT2Zmc2V0XG4gICAgICBpZiAoJ2ZvY3VzUGF0aCcgaW4gYXR0cnMpIHByb3BzLmZvY3VzUGF0aCA9IGF0dHJzLmZvY3VzUGF0aFxuICAgICAgaWYgKCdpc0JhY2t3YXJkJyBpbiBhdHRycykgcHJvcHMuaXNCYWNrd2FyZCA9IGF0dHJzLmlzQmFja3dhcmRcbiAgICAgIGlmICgnaXNGb2N1c2VkJyBpbiBhdHRycykgcHJvcHMuaXNGb2N1c2VkID0gYXR0cnMuaXNGb2N1c2VkXG4gICAgICBpZiAoJ21hcmtzJyBpbiBhdHRycykgcHJvcHMubWFya3MgPSBhdHRycy5tYXJrcyA9PSBudWxsID8gbnVsbCA6IE1hcmsuY3JlYXRlU2V0KGF0dHJzLm1hcmtzKVxuICAgICAgcmV0dXJuIHByb3BzXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBSYW5nZS5jcmVhdGVQcm9wZXJ0aWVzXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzIG9yIHJhbmdlcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgUmFuZ2VgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTT04ob2JqZWN0KSB7XG4gICAgY29uc3Qge1xuICAgICAgYW5jaG9yS2V5ID0gbnVsbCxcbiAgICAgIGFuY2hvck9mZnNldCA9IDAsXG4gICAgICBmb2N1c0tleSA9IG51bGwsXG4gICAgICBmb2N1c09mZnNldCA9IDAsXG4gICAgICBpc0JhY2t3YXJkID0gbnVsbCxcbiAgICAgIGlzRm9jdXNlZCA9IGZhbHNlLFxuICAgICAgbWFya3MgPSBudWxsLFxuICAgIH0gPSBvYmplY3RcblxuICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKHtcbiAgICAgIGFuY2hvcktleSxcbiAgICAgIGFuY2hvck9mZnNldCxcbiAgICAgIGZvY3VzS2V5LFxuICAgICAgZm9jdXNPZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkLFxuICAgICAgaXNGb2N1c2VkLFxuICAgICAgbWFya3M6IG1hcmtzID09IG51bGwgPyBudWxsIDogbmV3IFNldChtYXJrcy5tYXAoTWFyay5mcm9tSlNPTikpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmFuZ2VcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IFJhbmdlLmZyb21KU09OXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIGBvYmpgIGlzIGEgYFJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IG9ialxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNSYW5nZShvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9ialtNT0RFTF9UWVBFUy5SQU5HRV0pXG4gIH1cblxuICAvKipcbiAgICogT2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgcmV0dXJuICdyYW5nZSdcbiAgfVxuXG4gIGdldCBraW5kKCkge1xuICAgIGxvZ2dlci5kZXByZWNhdGUoJ3NsYXRlQDAuMzIuMCcsICdUaGUgYGtpbmRgIHByb3BlcnR5IG9mIFNsYXRlIG9iamVjdHMgaGFzIGJlZW4gcmVuYW1lZCB0byBgb2JqZWN0YC4nKVxuICAgIHJldHVybiB0aGlzLm9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHJhbmdlIGlzIGJsdXJyZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0JsdXJyZWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRm9jdXNlZFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHJhbmdlIGlzIGNvbGxhcHNlZC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzQ29sbGFwc2VkKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmFuY2hvcktleSA9PSB0aGlzLmZvY3VzS2V5ICYmXG4gICAgICB0aGlzLmFuY2hvck9mZnNldCA9PSB0aGlzLmZvY3VzT2Zmc2V0XG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHJhbmdlIGlzIGV4cGFuZGVkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNFeHBhbmRlZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNDb2xsYXBzZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSByYW5nZSBpcyBmb3J3YXJkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNGb3J3YXJkKCkge1xuICAgIHJldHVybiB0aGlzLmlzQmFja3dhcmQgPT0gbnVsbCA/IG51bGwgOiAhdGhpcy5pc0JhY2t3YXJkXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgcmFuZ2UncyBrZXlzIGFyZSBzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc1NldCgpIHtcbiAgICByZXR1cm4gdGhpcy5hbmNob3JLZXkgIT0gbnVsbCAmJiB0aGlzLmZvY3VzS2V5ICE9IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSByYW5nZSdzIGtleXMgYXJlIG5vdCBzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc1Vuc2V0KCkge1xuICAgIHJldHVybiAhdGhpcy5pc1NldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhcnQga2V5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBzdGFydEtleSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0JhY2t3YXJkID8gdGhpcy5mb2N1c0tleSA6IHRoaXMuYW5jaG9yS2V5XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzdGFydCBvZmZzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHN0YXJ0T2Zmc2V0KCkge1xuICAgIHJldHVybiB0aGlzLmlzQmFja3dhcmQgPyB0aGlzLmZvY3VzT2Zmc2V0IDogdGhpcy5hbmNob3JPZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVuZCBrZXkuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGVuZEtleSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0JhY2t3YXJkID8gdGhpcy5hbmNob3JLZXkgOiB0aGlzLmZvY3VzS2V5XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBlbmQgb2Zmc2V0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBlbmRPZmZzZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNCYWNrd2FyZCA/IHRoaXMuYW5jaG9yT2Zmc2V0IDogdGhpcy5mb2N1c09mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgYW5jaG9yIHBvaW50IG9mIHRoZSByYW5nZSBpcyBhdCB0aGUgc3RhcnQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNBbmNob3JBdFN0YXJ0T2Yobm9kZSkge1xuICAgIC8vIFBFUkY6IERvIGEgY2hlY2sgZm9yIGEgYDBgIG9mZnNldCBmaXJzdCBzaW5jZSBpdCdzIHF1aWNrZXN0LlxuICAgIGlmICh0aGlzLmFuY2hvck9mZnNldCAhPSAwKSByZXR1cm4gZmFsc2VcbiAgICBjb25zdCBmaXJzdCA9IGdldEZpcnN0KG5vZGUpXG4gICAgcmV0dXJuIHRoaXMuYW5jaG9yS2V5ID09IGZpcnN0LmtleVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgYW5jaG9yIHBvaW50IG9mIHRoZSByYW5nZSBpcyBhdCB0aGUgZW5kIG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzQW5jaG9yQXRFbmRPZihub2RlKSB7XG4gICAgY29uc3QgbGFzdCA9IGdldExhc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5hbmNob3JLZXkgPT0gbGFzdC5rZXkgJiYgdGhpcy5hbmNob3JPZmZzZXQgPT0gbGFzdC50ZXh0Lmxlbmd0aFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIGFuY2hvciBlZGdlIG9mIGEgcmFuZ2UgaXMgaW4gYSBgbm9kZWAgYW5kIGF0IGFuXG4gICAqIG9mZnNldCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbmRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzQW5jaG9yQmV0d2Vlbihub2RlLCBzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuYW5jaG9yT2Zmc2V0IDw9IGVuZCAmJlxuICAgICAgc3RhcnQgPD0gdGhpcy5hbmNob3JPZmZzZXQgJiZcbiAgICAgIHRoaXMuaGFzQW5jaG9ySW4obm9kZSlcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgYW5jaG9yIGVkZ2Ugb2YgYSByYW5nZSBpcyBpbiBhIGBub2RlYC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGhhc0FuY2hvckluKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5vYmplY3QgPT0gJ3RleHQnXG4gICAgICA/IG5vZGUua2V5ID09IHRoaXMuYW5jaG9yS2V5XG4gICAgICA6IHRoaXMuYW5jaG9yS2V5ICE9IG51bGwgJiYgbm9kZS5oYXNEZXNjZW5kYW50KHRoaXMuYW5jaG9yS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgZm9jdXMgcG9pbnQgb2YgdGhlIHJhbmdlIGlzIGF0IHRoZSBlbmQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNGb2N1c0F0RW5kT2Yobm9kZSkge1xuICAgIGNvbnN0IGxhc3QgPSBnZXRMYXN0KG5vZGUpXG4gICAgcmV0dXJuIHRoaXMuZm9jdXNLZXkgPT0gbGFzdC5rZXkgJiYgdGhpcy5mb2N1c09mZnNldCA9PSBsYXN0LnRleHQubGVuZ3RoXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBmb2N1cyBwb2ludCBvZiB0aGUgcmFuZ2UgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzRm9jdXNBdFN0YXJ0T2Yobm9kZSkge1xuICAgIGlmICh0aGlzLmZvY3VzT2Zmc2V0ICE9IDApIHJldHVybiBmYWxzZVxuICAgIGNvbnN0IGZpcnN0ID0gZ2V0Rmlyc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5mb2N1c0tleSA9PSBmaXJzdC5rZXlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBmb2N1cyBlZGdlIG9mIGEgcmFuZ2UgaXMgaW4gYSBgbm9kZWAgYW5kIGF0IGFuXG4gICAqIG9mZnNldCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbmRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzRm9jdXNCZXR3ZWVuKG5vZGUsIHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhcnQgPD0gdGhpcy5mb2N1c09mZnNldCAmJlxuICAgICAgdGhpcy5mb2N1c09mZnNldCA8PSBlbmQgJiZcbiAgICAgIHRoaXMuaGFzRm9jdXNJbihub2RlKVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBmb2N1cyBlZGdlIG9mIGEgcmFuZ2UgaXMgaW4gYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNGb2N1c0luKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5vYmplY3QgPT0gJ3RleHQnXG4gICAgICA/IG5vZGUua2V5ID09IHRoaXMuZm9jdXNLZXlcbiAgICAgIDogdGhpcy5mb2N1c0tleSAhPSBudWxsICYmIG5vZGUuaGFzRGVzY2VuZGFudCh0aGlzLmZvY3VzS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiBhIGBub2RlYC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGlzQXRTdGFydE9mKG5vZGUpIHtcbiAgICByZXR1cm4gdGhpcy5pc0NvbGxhcHNlZCAmJiB0aGlzLmhhc0FuY2hvckF0U3RhcnRPZihub2RlKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHJhbmdlIGlzIGF0IHRoZSBlbmQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBpc0F0RW5kT2Yobm9kZSkge1xuICAgIHJldHVybiB0aGlzLmlzQ29sbGFwc2VkICYmIHRoaXMuaGFzQW5jaG9yQXRFbmRPZihub2RlKVxuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzIHRoZSByYW5nZS5cbiAgICpcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIGZvY3VzKCkge1xuICAgIHJldHVybiB0aGlzLm1lcmdlKHtcbiAgICAgIGlzRm9jdXNlZDogdHJ1ZVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQmx1ciB0aGUgcmFuZ2UuXG4gICAqXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBibHVyKCkge1xuICAgIHJldHVybiB0aGlzLm1lcmdlKHtcbiAgICAgIGlzRm9jdXNlZDogZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVuc2V0IHRoZSByYW5nZS5cbiAgICpcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIGRlc2VsZWN0KCkge1xuICAgIHJldHVybiB0aGlzLm1lcmdlKHtcbiAgICAgIGFuY2hvcktleTogbnVsbCxcbiAgICAgIGFuY2hvck9mZnNldDogMCxcbiAgICAgIGZvY3VzS2V5OiBudWxsLFxuICAgICAgZm9jdXNPZmZzZXQ6IDAsXG4gICAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICAgICAgaXNCYWNrd2FyZDogZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEZsaXAgdGhlIHJhbmdlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgZmxpcCgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBhbmNob3JLZXk6IHRoaXMuZm9jdXNLZXksXG4gICAgICBhbmNob3JPZmZzZXQ6IHRoaXMuZm9jdXNPZmZzZXQsXG4gICAgICBmb2N1c0tleTogdGhpcy5hbmNob3JLZXksXG4gICAgICBmb2N1c09mZnNldDogdGhpcy5hbmNob3JPZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkOiB0aGlzLmlzQmFja3dhcmQgPT0gbnVsbCA/IG51bGwgOiAhdGhpcy5pc0JhY2t3YXJkLFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgYW5jaG9yIG9mZnNldCBgbmAgY2hhcmFjdGVycy5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG4gKG9wdGlvbmFsKVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZUFuY2hvcihuID0gMSkge1xuICAgIGNvbnN0IHsgYW5jaG9yS2V5LCBmb2N1c0tleSwgZm9jdXNPZmZzZXQsIGlzQmFja3dhcmQgfSA9IHRoaXNcbiAgICBjb25zdCBhbmNob3JPZmZzZXQgPSB0aGlzLmFuY2hvck9mZnNldCArIG5cbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBhbmNob3JPZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkOiBhbmNob3JLZXkgPT0gZm9jdXNLZXlcbiAgICAgICAgPyBhbmNob3JPZmZzZXQgPiBmb2N1c09mZnNldFxuICAgICAgICA6IGlzQmFja3dhcmRcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIGFuY2hvciBvZmZzZXQgYG5gIGNoYXJhY3RlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBuIChvcHRpb25hbClcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVGb2N1cyhuID0gMSkge1xuICAgIGNvbnN0IHsgYW5jaG9yS2V5LCBhbmNob3JPZmZzZXQsIGZvY3VzS2V5LCBpc0JhY2t3YXJkIH0gPSB0aGlzXG4gICAgY29uc3QgZm9jdXNPZmZzZXQgPSB0aGlzLmZvY3VzT2Zmc2V0ICsgblxuICAgIHJldHVybiB0aGlzLm1lcmdlKHtcbiAgICAgIGZvY3VzT2Zmc2V0LFxuICAgICAgaXNCYWNrd2FyZDogZm9jdXNLZXkgPT0gYW5jaG9yS2V5XG4gICAgICAgID8gYW5jaG9yT2Zmc2V0ID4gZm9jdXNPZmZzZXRcbiAgICAgICAgOiBpc0JhY2t3YXJkXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSByYW5nZSdzIGFuY2hvciBwb2ludCB0byBhIGBrZXlgIGFuZCBgb2Zmc2V0YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0XG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlQW5jaG9yVG8oa2V5LCBvZmZzZXQpIHtcbiAgICBjb25zdCB7IGFuY2hvcktleSwgZm9jdXNLZXksIGZvY3VzT2Zmc2V0LCBpc0JhY2t3YXJkIH0gPSB0aGlzXG4gICAgcmV0dXJuIHRoaXMubWVyZ2Uoe1xuICAgICAgYW5jaG9yS2V5OiBrZXksXG4gICAgICBhbmNob3JPZmZzZXQ6IG9mZnNldCxcbiAgICAgIGlzQmFja3dhcmQ6IGtleSA9PSBmb2N1c0tleVxuICAgICAgICA/IG9mZnNldCA+IGZvY3VzT2Zmc2V0XG4gICAgICAgIDoga2V5ID09IGFuY2hvcktleSA/IGlzQmFja3dhcmQgOiBudWxsXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSByYW5nZSdzIGZvY3VzIHBvaW50IHRvIGEgYGtleWAgYW5kIGBvZmZzZXRgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVGb2N1c1RvKGtleSwgb2Zmc2V0KSB7XG4gICAgY29uc3QgeyBmb2N1c0tleSwgYW5jaG9yS2V5LCBhbmNob3JPZmZzZXQsIGlzQmFja3dhcmQgfSA9IHRoaXNcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBmb2N1c0tleToga2V5LFxuICAgICAgZm9jdXNPZmZzZXQ6IG9mZnNldCxcbiAgICAgIGlzQmFja3dhcmQ6IGtleSA9PSBhbmNob3JLZXlcbiAgICAgICAgPyBhbmNob3JPZmZzZXQgPiBvZmZzZXRcbiAgICAgICAgOiBrZXkgPT0gZm9jdXNLZXkgPyBpc0JhY2t3YXJkIDogbnVsbFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgcmFuZ2UgdG8gYGFuY2hvck9mZnNldGAuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBhbmNob3JPZmZzZXRcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVBbmNob3JPZmZzZXRUbyhhbmNob3JPZmZzZXQpIHtcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBhbmNob3JPZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkOiB0aGlzLmFuY2hvcktleSA9PSB0aGlzLmZvY3VzS2V5XG4gICAgICAgID8gYW5jaG9yT2Zmc2V0ID4gdGhpcy5mb2N1c09mZnNldFxuICAgICAgICA6IHRoaXMuaXNCYWNrd2FyZFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgcmFuZ2UgdG8gYGZvY3VzT2Zmc2V0YC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGZvY3VzT2Zmc2V0XG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlRm9jdXNPZmZzZXRUbyhmb2N1c09mZnNldCkge1xuICAgIHJldHVybiB0aGlzLm1lcmdlKHtcbiAgICAgIGZvY3VzT2Zmc2V0LFxuICAgICAgaXNCYWNrd2FyZDogdGhpcy5hbmNob3JLZXkgPT0gdGhpcy5mb2N1c0tleVxuICAgICAgICA/IHRoaXMuYW5jaG9yT2Zmc2V0ID4gZm9jdXNPZmZzZXRcbiAgICAgICAgOiB0aGlzLmlzQmFja3dhcmRcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHJhbmdlIHRvIGBhbmNob3JPZmZzZXRgIGFuZCBgZm9jdXNPZmZzZXRgLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gYW5jaG9yT2Zmc2V0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBmb2N1c09mZnNldCAob3B0aW9uYWwpXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlT2Zmc2V0c1RvKGFuY2hvck9mZnNldCwgZm9jdXNPZmZzZXQgPSBhbmNob3JPZmZzZXQpIHtcbiAgICByZXR1cm4gdGhpc1xuICAgICAgLm1vdmVBbmNob3JPZmZzZXRUbyhhbmNob3JPZmZzZXQpXG4gICAgICAubW92ZUZvY3VzT2Zmc2V0VG8oZm9jdXNPZmZzZXQpXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgZm9jdXMgcG9pbnQgdG8gdGhlIGFuY2hvciBwb2ludC5cbiAgICpcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVUb0FuY2hvcigpIHtcbiAgICByZXR1cm4gdGhpcy5tb3ZlRm9jdXNUbyh0aGlzLmFuY2hvcktleSwgdGhpcy5hbmNob3JPZmZzZXQpXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgYW5jaG9yIHBvaW50IHRvIHRoZSBmb2N1cyBwb2ludC5cbiAgICpcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVUb0ZvY3VzKCkge1xuICAgIHJldHVybiB0aGlzLm1vdmVBbmNob3JUbyh0aGlzLmZvY3VzS2V5LCB0aGlzLmZvY3VzT2Zmc2V0KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHJhbmdlJ3MgYW5jaG9yIHBvaW50IHRvIHRoZSBzdGFydCBvZiBhIGBub2RlYC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlQW5jaG9yVG9TdGFydE9mKG5vZGUpIHtcbiAgICBub2RlID0gZ2V0Rmlyc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5tb3ZlQW5jaG9yVG8obm9kZS5rZXksIDApXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgcmFuZ2UncyBhbmNob3IgcG9pbnQgdG8gdGhlIGVuZCBvZiBhIGBub2RlYC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlQW5jaG9yVG9FbmRPZihub2RlKSB7XG4gICAgbm9kZSA9IGdldExhc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5tb3ZlQW5jaG9yVG8obm9kZS5rZXksIG5vZGUudGV4dC5sZW5ndGgpXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgcmFuZ2UncyBmb2N1cyBwb2ludCB0byB0aGUgc3RhcnQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZUZvY3VzVG9TdGFydE9mKG5vZGUpIHtcbiAgICBub2RlID0gZ2V0Rmlyc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5tb3ZlRm9jdXNUbyhub2RlLmtleSwgMClcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSByYW5nZSdzIGZvY3VzIHBvaW50IHRvIHRoZSBlbmQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZUZvY3VzVG9FbmRPZihub2RlKSB7XG4gICAgbm9kZSA9IGdldExhc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5tb3ZlRm9jdXNUbyhub2RlLmtleSwgbm9kZS50ZXh0Lmxlbmd0aClcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRvIHRoZSBlbnRpcmUgcmFuZ2Ugb2YgYHN0YXJ0YCBhbmQgYGVuZGAgbm9kZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3RhcnRcbiAgICogQHBhcmFtIHtOb2RlfSBlbmQgKG9wdGlvbmFsKVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZVRvUmFuZ2VPZihzdGFydCwgZW5kID0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICAgICAgLm1vdmVBbmNob3JUb1N0YXJ0T2Yoc3RhcnQpXG4gICAgICAubW92ZUZvY3VzVG9FbmRPZihlbmQpXG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplIHRoZSByYW5nZSwgcmVsYXRpdmUgdG8gYSBgbm9kZWAsIGVuc3VyaW5nIHRoYXQgdGhlIGFuY2hvclxuICAgKiBhbmQgZm9jdXMgbm9kZXMgb2YgdGhlIHJhbmdlIGFsd2F5cyByZWZlciB0byBsZWFmIHRleHQgbm9kZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbm9ybWFsaXplKG5vZGUpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXNcbiAgICBsZXQgeyBhbmNob3JLZXksIGFuY2hvck9mZnNldCwgZm9jdXNLZXksIGZvY3VzT2Zmc2V0LCBpc0JhY2t3YXJkIH0gPSByYW5nZVxuXG4gICAgLy8gSWYgdGhlIHJhbmdlIGlzIHVuc2V0LCBtYWtlIHN1cmUgaXQgaXMgcHJvcGVybHkgemVyb2VkIG91dC5cbiAgICBpZiAoYW5jaG9yS2V5ID09IG51bGwgfHwgZm9jdXNLZXkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJhbmdlLm1lcmdlKHtcbiAgICAgICAgYW5jaG9yS2V5OiBudWxsLFxuICAgICAgICBhbmNob3JPZmZzZXQ6IDAsXG4gICAgICAgIGZvY3VzS2V5OiBudWxsLFxuICAgICAgICBmb2N1c09mZnNldDogMCxcbiAgICAgICAgaXNCYWNrd2FyZDogZmFsc2UsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIEdldCB0aGUgYW5jaG9yIGFuZCBmb2N1cyBub2Rlcy5cbiAgICBsZXQgYW5jaG9yTm9kZSA9IG5vZGUuZ2V0RGVzY2VuZGFudChhbmNob3JLZXkpXG4gICAgbGV0IGZvY3VzTm9kZSA9IG5vZGUuZ2V0RGVzY2VuZGFudChmb2N1c0tleSlcblxuICAgIC8vIElmIHRoZSByYW5nZSBpcyBtYWxmb3JtZWQsIHdhcm4gYW5kIHplcm8gaXQgb3V0LlxuICAgIGlmICghYW5jaG9yTm9kZSB8fCAhZm9jdXNOb2RlKSB7XG4gICAgICBsb2dnZXIud2FybignVGhlIHJhbmdlIHdhcyBpbnZhbGlkIGFuZCB3YXMgcmVzZXQuIFRoZSByYW5nZSBpbiBxdWVzdGlvbiB3YXM6JywgcmFuZ2UpXG4gICAgICBjb25zdCBmaXJzdCA9IG5vZGUuZ2V0Rmlyc3RUZXh0KClcbiAgICAgIHJldHVybiByYW5nZS5tZXJnZSh7XG4gICAgICAgIGFuY2hvcktleTogZmlyc3QgPyBmaXJzdC5rZXkgOiBudWxsLFxuICAgICAgICBhbmNob3JPZmZzZXQ6IDAsXG4gICAgICAgIGZvY3VzS2V5OiBmaXJzdCA/IGZpcnN0LmtleSA6IG51bGwsXG4gICAgICAgIGZvY3VzT2Zmc2V0OiAwLFxuICAgICAgICBpc0JhY2t3YXJkOiBmYWxzZSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGFuY2hvciBub2RlIGlzbid0IGEgdGV4dCBub2RlLCBtYXRjaCBpdCB0byBvbmUuXG4gICAgaWYgKGFuY2hvck5vZGUub2JqZWN0ICE9ICd0ZXh0Jykge1xuICAgICAgbG9nZ2VyLndhcm4oJ1RoZSByYW5nZSBhbmNob3Igd2FzIHNldCB0byBhIE5vZGUgdGhhdCBpcyBub3QgYSBUZXh0IG5vZGUuIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW4gYW5kIGNhbiBkZWdyYWRlIHBlcmZvcm1hbmNlLiBUaGUgbm9kZSBpbiBxdWVzdGlvbiB3YXM6JywgYW5jaG9yTm9kZSlcbiAgICAgIGNvbnN0IGFuY2hvclRleHQgPSBhbmNob3JOb2RlLmdldFRleHRBdE9mZnNldChhbmNob3JPZmZzZXQpXG4gICAgICBjb25zdCBvZmZzZXQgPSBhbmNob3JOb2RlLmdldE9mZnNldChhbmNob3JUZXh0LmtleSlcbiAgICAgIGFuY2hvck9mZnNldCA9IGFuY2hvck9mZnNldCAtIG9mZnNldFxuICAgICAgYW5jaG9yTm9kZSA9IGFuY2hvclRleHRcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgZm9jdXMgbm9kZSBpc24ndCBhIHRleHQgbm9kZSwgbWF0Y2ggaXQgdG8gb25lLlxuICAgIGlmIChmb2N1c05vZGUub2JqZWN0ICE9ICd0ZXh0Jykge1xuICAgICAgbG9nZ2VyLndhcm4oJ1RoZSByYW5nZSBmb2N1cyB3YXMgc2V0IHRvIGEgTm9kZSB0aGF0IGlzIG5vdCBhIFRleHQgbm9kZS4gVGhpcyBzaG91bGQgbm90IGhhcHBlbiBhbmQgY2FuIGRlZ3JhZGUgcGVyZm9ybWFuY2UuIFRoZSBub2RlIGluIHF1ZXN0aW9uIHdhczonLCBmb2N1c05vZGUpXG4gICAgICBjb25zdCBmb2N1c1RleHQgPSBmb2N1c05vZGUuZ2V0VGV4dEF0T2Zmc2V0KGZvY3VzT2Zmc2V0KVxuICAgICAgY29uc3Qgb2Zmc2V0ID0gZm9jdXNOb2RlLmdldE9mZnNldChmb2N1c1RleHQua2V5KVxuICAgICAgZm9jdXNPZmZzZXQgPSBmb2N1c09mZnNldCAtIG9mZnNldFxuICAgICAgZm9jdXNOb2RlID0gZm9jdXNUZXh0XG4gICAgfVxuXG4gICAgLy8gSWYgYGlzQmFja3dhcmRgIGlzIG5vdCBzZXQsIGRlcml2ZSBpdC5cbiAgICBpZiAoaXNCYWNrd2FyZCA9PSBudWxsKSB7XG4gICAgICBpZiAoYW5jaG9yTm9kZS5rZXkgPT09IGZvY3VzTm9kZS5rZXkpIHtcbiAgICAgICAgaXNCYWNrd2FyZCA9IGFuY2hvck9mZnNldCA+IGZvY3VzT2Zmc2V0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0JhY2t3YXJkID0gIW5vZGUuYXJlRGVzY2VuZGFudHNTb3J0ZWQoYW5jaG9yTm9kZS5rZXksIGZvY3VzTm9kZS5rZXkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgaW4gYW55IHVwZGF0ZWQgcHJvcGVydGllcy5cbiAgICByZXR1cm4gcmFuZ2UubWVyZ2Uoe1xuICAgICAgYW5jaG9yS2V5OiBhbmNob3JOb2RlLmtleSxcbiAgICAgIGFuY2hvck9mZnNldCxcbiAgICAgIGZvY3VzS2V5OiBmb2N1c05vZGUua2V5LFxuICAgICAgZm9jdXNPZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSByYW5nZS5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04oKSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAgb2JqZWN0OiB0aGlzLm9iamVjdCxcbiAgICAgIGFuY2hvcktleTogdGhpcy5hbmNob3JLZXksXG4gICAgICBhbmNob3JPZmZzZXQ6IHRoaXMuYW5jaG9yT2Zmc2V0LFxuICAgICAgZm9jdXNLZXk6IHRoaXMuZm9jdXNLZXksXG4gICAgICBmb2N1c09mZnNldDogdGhpcy5mb2N1c09mZnNldCxcbiAgICAgIGlzQmFja3dhcmQ6IHRoaXMuaXNCYWNrd2FyZCxcbiAgICAgIGlzRm9jdXNlZDogdGhpcy5pc0ZvY3VzZWQsXG4gICAgICBtYXJrczogdGhpcy5tYXJrcyA9PSBudWxsID8gbnVsbCA6IHRoaXMubWFya3MudG9BcnJheSgpLm1hcChtID0+IG0udG9KU09OKCkpLFxuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgdG9KU2AuXG4gICAqL1xuXG4gIHRvSlMoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKClcbiAgfVxuXG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5SYW5nZS5wcm90b3R5cGVbTU9ERUxfVFlQRVMuUkFOR0VdID0gdHJ1ZVxuXG4vKipcbiAqIE1peCBpbiBzb21lIFwibW92ZVwiIGNvbnZlbmllbmNlIG1ldGhvZHMuXG4gKi9cblxuY29uc3QgTU9WRV9NRVRIT0RTID0gW1xuICBbJ21vdmUnLCAnJ10sXG4gIFsnbW92ZScsICdUbyddLFxuICBbJ21vdmUnLCAnVG9TdGFydE9mJ10sXG4gIFsnbW92ZScsICdUb0VuZE9mJ10sXG5dXG5cbk1PVkVfTUVUSE9EUy5mb3JFYWNoKChbIHAsIHMgXSkgPT4ge1xuICBSYW5nZS5wcm90b3R5cGVbYCR7cH0ke3N9YF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzXG4gICAgICBbYCR7cH1BbmNob3Ike3N9YF0oLi4uYXJncylcbiAgICAgIFtgJHtwfUZvY3VzJHtzfWBdKC4uLmFyZ3MpXG4gIH1cbn0pXG5cbi8qKlxuICogTWl4IGluIHRoZSBcInN0YXJ0XCIsIFwiZW5kXCIgYW5kIFwiZWRnZVwiIGNvbnZlbmllbmNlIG1ldGhvZHMuXG4gKi9cblxuY29uc3QgRURHRV9NRVRIT0RTID0gW1xuICBbJ2hhcycsICdBdFN0YXJ0T2YnLCB0cnVlXSxcbiAgWydoYXMnLCAnQXRFbmRPZicsIHRydWVdLFxuICBbJ2hhcycsICdCZXR3ZWVuJywgdHJ1ZV0sXG4gIFsnaGFzJywgJ0luJywgdHJ1ZV0sXG4gIFsnY29sbGFwc2VUbycsICcnXSxcbiAgWydtb3ZlJywgJyddLFxuICBbJ21vdmVUbycsICcnXSxcbiAgWydtb3ZlJywgJ1RvJ10sXG4gIFsnbW92ZScsICdPZmZzZXRUbyddLFxuXVxuXG5FREdFX01FVEhPRFMuZm9yRWFjaCgoWyBwLCBzLCBoYXNFZGdlIF0pID0+IHtcbiAgY29uc3QgYW5jaG9yID0gYCR7cH1BbmNob3Ike3N9YFxuICBjb25zdCBmb2N1cyA9IGAke3B9Rm9jdXMke3N9YFxuXG4gIFJhbmdlLnByb3RvdHlwZVtgJHtwfVN0YXJ0JHtzfWBdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5pc0JhY2t3YXJkXG4gICAgICA/IHRoaXNbZm9jdXNdKC4uLmFyZ3MpXG4gICAgICA6IHRoaXNbYW5jaG9yXSguLi5hcmdzKVxuICB9XG5cbiAgUmFuZ2UucHJvdG90eXBlW2Ake3B9RW5kJHtzfWBdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5pc0JhY2t3YXJkXG4gICAgICA/IHRoaXNbYW5jaG9yXSguLi5hcmdzKVxuICAgICAgOiB0aGlzW2ZvY3VzXSguLi5hcmdzKVxuICB9XG5cbiAgaWYgKGhhc0VkZ2UpIHtcbiAgICBSYW5nZS5wcm90b3R5cGVbYCR7cH1FZGdlJHtzfWBdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgIHJldHVybiB0aGlzW2FuY2hvcl0oLi4uYXJncykgfHwgdGhpc1tmb2N1c10oLi4uYXJncylcbiAgICB9XG4gIH1cbn0pXG5cbi8qKlxuICogTWl4IGluIHNvbWUgYWxpYXNlcyBmb3IgY29udmVuaWVuY2UgLyBwYXJhbGxlbGlzbSB3aXRoIHRoZSBicm93c2VyIEFQSXMuXG4gKi9cblxuY29uc3QgQUxJQVNfTUVUSE9EUyA9IFtcbiAgWydjb2xsYXBzZVRvJywgJ21vdmVUbyddLFxuICBbJ2NvbGxhcHNlVG9BbmNob3InLCAnbW92ZVRvQW5jaG9yJ10sXG4gIFsnY29sbGFwc2VUb0ZvY3VzJywgJ21vdmVUb0ZvY3VzJ10sXG4gIFsnY29sbGFwc2VUb1N0YXJ0JywgJ21vdmVUb1N0YXJ0J10sXG4gIFsnY29sbGFwc2VUb0VuZCcsICdtb3ZlVG9FbmQnXSxcbiAgWydjb2xsYXBzZVRvU3RhcnRPZicsICdtb3ZlVG9TdGFydE9mJ10sXG4gIFsnY29sbGFwc2VUb0VuZE9mJywgJ21vdmVUb0VuZE9mJ10sXG4gIFsnZXh0ZW5kJywgJ21vdmVGb2N1cyddLFxuICBbJ2V4dGVuZFRvJywgJ21vdmVGb2N1c1RvJ10sXG4gIFsnZXh0ZW5kVG9TdGFydE9mJywgJ21vdmVGb2N1c1RvU3RhcnRPZiddLFxuICBbJ2V4dGVuZFRvRW5kT2YnLCAnbW92ZUZvY3VzVG9FbmRPZiddLFxuXVxuXG5BTElBU19NRVRIT0RTLmZvckVhY2goKFsgYWxpYXMsIG1ldGhvZCBdKSA9PiB7XG4gIFJhbmdlLnByb3RvdHlwZVthbGlhc10gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzW21ldGhvZF0oLi4uYXJncylcbiAgfVxufSlcblxuLyoqXG4gKiBHZXQgdGhlIGZpcnN0IHRleHQgb2YgYSBgbm9kZWAuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtUZXh0fVxuICovXG5cbmZ1bmN0aW9uIGdldEZpcnN0KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUub2JqZWN0ID09ICd0ZXh0JyA/IG5vZGUgOiBub2RlLmdldEZpcnN0VGV4dCgpXG59XG5cbi8qKlxuICogR2V0IHRoZSBsYXN0IHRleHQgb2YgYSBgbm9kZWAuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtUZXh0fVxuICovXG5cbmZ1bmN0aW9uIGdldExhc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5vYmplY3QgPT0gJ3RleHQnID8gbm9kZSA6IG5vZGUuZ2V0TGFzdFRleHQoKVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7UmFuZ2V9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgUmFuZ2VcbiJdfQ==