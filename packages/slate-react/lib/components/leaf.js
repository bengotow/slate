'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _slatePropTypes = require('slate-prop-types');

var _slatePropTypes2 = _interopRequireDefault(_slatePropTypes);

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debugger.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:leaves');

/**
 * Leaf.
 *
 * @type {Component}
 */

var Leaf = function (_React$Component) {
  _inherits(Leaf, _React$Component);

  function Leaf() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Leaf);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Leaf.__proto__ || Object.getPrototypeOf(Leaf)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  _createClass(Leaf, [{
    key: 'shouldComponentUpdate',


    /**
     * Should component update?
     *
     * @param {Object} props
     * @return {Boolean}
     */

    value: function shouldComponentUpdate(props) {
      // If any of the regular properties have changed, re-render.
      if (props.index != this.props.index || props.marks != this.props.marks || props.text != this.props.text || props.parent != this.props.parent) {
        return true;
      }

      // Otherwise, don't update.
      return false;
    }

    /**
     * Render the leaf.
     *
     * @return {Element}
     */

  }, {
    key: 'render',
    value: function render() {
      this.debug('render', this);

      var _props = this.props,
          node = _props.node,
          index = _props.index;

      var offsetKey = _offsetKey2.default.stringify({
        key: node.key,
        index: index
      });

      return _react2.default.createElement(
        'span',
        { 'data-offset-key': offsetKey },
        this.renderMarks()
      );
    }

    /**
     * Render all of the leaf's mark components.
     *
     * @return {Element}
     */

  }, {
    key: 'renderMarks',
    value: function renderMarks() {
      var _props2 = this.props,
          marks = _props2.marks,
          node = _props2.node,
          offset = _props2.offset,
          text = _props2.text,
          editor = _props2.editor;
      var stack = editor.stack;

      var leaf = this.renderText();

      return marks.reduce(function (children, mark) {
        var props = { editor: editor, mark: mark, marks: marks, node: node, offset: offset, text: text, children: children };
        var element = stack.find('renderMark', props);
        return element || children;
      }, leaf);
    }

    /**
     * Render the text content of the leaf, accounting for browsers.
     *
     * @return {Element}
     */

  }, {
    key: 'renderText',
    value: function renderText() {
      var _props3 = this.props,
          block = _props3.block,
          node = _props3.node,
          parent = _props3.parent,
          text = _props3.text,
          index = _props3.index,
          leaves = _props3.leaves;

      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.

      if (parent.isVoid) return _react2.default.createElement(
        'span',
        { 'data-slate-zero-width': true },
        '\u200B'
      );

      // COMPAT: If the text is empty, it's because it's on the edge of an inline
      // void node, so we render a zero-width space so that the selection can be
      // inserted next to it still.
      if (text == '') return _react2.default.createElement(
        'span',
        { 'data-slate-zero-width': true },
        '\u200B'
      );

      // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
      // so we need to add an extra trailing new lines to prevent that.
      var lastText = block.getLastText();
      var lastChar = text.charAt(text.length - 1);
      var isLastText = node == lastText;
      var isLastLeaf = index == leaves.size - 1;
      if (isLastText && isLastLeaf && lastChar == '\n') return text + '\n';

      // Otherwise, just return the text.
      return text;
    }
  }]);

  return Leaf;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Leaf.propTypes = {
  block: _slatePropTypes2.default.block.isRequired,
  editor: _propTypes2.default.object.isRequired,
  index: _propTypes2.default.number.isRequired,
  leaves: _slatePropTypes2.default.leaves.isRequired,
  marks: _slatePropTypes2.default.marks.isRequired,
  node: _slatePropTypes2.default.node.isRequired,
  offset: _propTypes2.default.number.isRequired,
  parent: _slatePropTypes2.default.node.isRequired,
  text: _propTypes2.default.string.isRequired
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    debug.apply(undefined, [message, _this2.props.node.key + '-' + _this2.props.index].concat(args));
  };
};

exports.default = Leaf;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2xlYWYuanMiXSwibmFtZXMiOlsiZGVidWciLCJMZWFmIiwicHJvcHMiLCJpbmRleCIsIm1hcmtzIiwidGV4dCIsInBhcmVudCIsIm5vZGUiLCJvZmZzZXRLZXkiLCJzdHJpbmdpZnkiLCJrZXkiLCJyZW5kZXJNYXJrcyIsIm9mZnNldCIsImVkaXRvciIsInN0YWNrIiwibGVhZiIsInJlbmRlclRleHQiLCJyZWR1Y2UiLCJjaGlsZHJlbiIsIm1hcmsiLCJlbGVtZW50IiwiZmluZCIsImJsb2NrIiwibGVhdmVzIiwiaXNWb2lkIiwibGFzdFRleHQiLCJnZXRMYXN0VGV4dCIsImxhc3RDaGFyIiwiY2hhckF0IiwibGVuZ3RoIiwiaXNMYXN0VGV4dCIsImlzTGFzdExlYWYiLCJzaXplIiwiQ29tcG9uZW50IiwicHJvcFR5cGVzIiwiaXNSZXF1aXJlZCIsIm9iamVjdCIsIm51bWJlciIsInN0cmluZyIsIm1lc3NhZ2UiLCJhcmdzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7Ozs7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxRQUFRLHFCQUFNLGNBQU4sQ0FBZDs7QUFFQTs7Ozs7O0lBTU1DLEk7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUo7Ozs7OztBQWtCQTs7Ozs7Ozs7Ozs7QUFXQTs7Ozs7OzswQ0FPc0JDLEssRUFBTztBQUMzQjtBQUNBLFVBQ0VBLE1BQU1DLEtBQU4sSUFBZSxLQUFLRCxLQUFMLENBQVdDLEtBQTFCLElBQ0FELE1BQU1FLEtBQU4sSUFBZSxLQUFLRixLQUFMLENBQVdFLEtBRDFCLElBRUFGLE1BQU1HLElBQU4sSUFBYyxLQUFLSCxLQUFMLENBQVdHLElBRnpCLElBR0FILE1BQU1JLE1BQU4sSUFBZ0IsS0FBS0osS0FBTCxDQUFXSSxNQUo3QixFQUtFO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxhQUFPLEtBQVA7QUFDRDs7QUFF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QUFhRixVQVBKO0FBUWpCN0IsVUFBUSx5QkFBV0MsSUFBWCxDQUFnQjRCLFVBUlA7QUFTakI5QixRQUFNLG9CQUFNaUMsTUFBTixDQUFhSDtBQVRGLEM7Ozs7O09BbUJuQm5DLEssR0FBUSxVQUFDdUMsT0FBRCxFQUFzQjtBQUFBLHVDQUFUQyxJQUFTO0FBQVRBLFVBQVM7QUFBQTs7QUFDNUJ4Qyw0QkFBTXVDLE9BQU4sRUFBa0IsT0FBS3JDLEtBQUwsQ0FBV0ssSUFBWCxDQUFnQkcsR0FBbEMsU0FBeUMsT0FBS1IsS0FBTCxDQUFXQyxLQUFwRCxTQUFnRXFDLElBQWhFO0FBQ0QsRzs7O2tCQXNHWXZDLEkiLCJmaWxlIjoibGVhZi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJ1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnXG5pbXBvcnQgU2xhdGVUeXBlcyBmcm9tICdzbGF0ZS1wcm9wLXR5cGVzJ1xuXG5pbXBvcnQgT2Zmc2V0S2V5IGZyb20gJy4uL3V0aWxzL29mZnNldC1rZXknXG5cbi8qKlxuICogRGVidWdnZXIuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOmxlYXZlcycpXG5cbi8qKlxuICogTGVhZi5cbiAqXG4gKiBAdHlwZSB7Q29tcG9uZW50fVxuICovXG5cbmNsYXNzIExlYWYgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIC8qKlxuICAgKiBQcm9wZXJ0eSB0eXBlcy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBibG9jazogU2xhdGVUeXBlcy5ibG9jay5pc1JlcXVpcmVkLFxuICAgIGVkaXRvcjogVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgaW5kZXg6IFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGxlYXZlczogU2xhdGVUeXBlcy5sZWF2ZXMuaXNSZXF1aXJlZCxcbiAgICBtYXJrczogU2xhdGVUeXBlcy5tYXJrcy5pc1JlcXVpcmVkLFxuICAgIG5vZGU6IFNsYXRlVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIG9mZnNldDogVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgcGFyZW50OiBTbGF0ZVR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICB0ZXh0OiBUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1Zy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQHBhcmFtIHtNaXhlZH0gLi4uYXJnc1xuICAgKi9cblxuICBkZWJ1ZyA9IChtZXNzYWdlLCAuLi5hcmdzKSA9PiB7XG4gICAgZGVidWcobWVzc2FnZSwgYCR7dGhpcy5wcm9wcy5ub2RlLmtleX0tJHt0aGlzLnByb3BzLmluZGV4fWAsIC4uLmFyZ3MpXG4gIH1cblxuICAvKipcbiAgICogU2hvdWxkIGNvbXBvbmVudCB1cGRhdGU/XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUocHJvcHMpIHtcbiAgICAvLyBJZiBhbnkgb2YgdGhlIHJlZ3VsYXIgcHJvcGVydGllcyBoYXZlIGNoYW5nZWQsIHJlLXJlbmRlci5cbiAgICBpZiAoXG4gICAgICBwcm9wcy5pbmRleCAhPSB0aGlzLnByb3BzLmluZGV4IHx8XG4gICAgICBwcm9wcy5tYXJrcyAhPSB0aGlzLnByb3BzLm1hcmtzIHx8XG4gICAgICBwcm9wcy50ZXh0ICE9IHRoaXMucHJvcHMudGV4dCB8fFxuICAgICAgcHJvcHMucGFyZW50ICE9IHRoaXMucHJvcHMucGFyZW50XG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgZG9uJ3QgdXBkYXRlLlxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgbGVhZi5cbiAgICpcbiAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICovXG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMuZGVidWcoJ3JlbmRlcicsIHRoaXMpXG5cbiAgICBjb25zdCB7IG5vZGUsIGluZGV4IH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3Qgb2Zmc2V0S2V5ID0gT2Zmc2V0S2V5LnN0cmluZ2lmeSh7XG4gICAgICBrZXk6IG5vZGUua2V5LFxuICAgICAgaW5kZXhcbiAgICB9KVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGRhdGEtb2Zmc2V0LWtleT17b2Zmc2V0S2V5fT5cbiAgICAgICAge3RoaXMucmVuZGVyTWFya3MoKX1cbiAgICAgIDwvc3Bhbj5cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGFsbCBvZiB0aGUgbGVhZidzIG1hcmsgY29tcG9uZW50cy5cbiAgICpcbiAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICovXG5cbiAgcmVuZGVyTWFya3MoKSB7XG4gICAgY29uc3QgeyBtYXJrcywgbm9kZSwgb2Zmc2V0LCB0ZXh0LCBlZGl0b3IgfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7IHN0YWNrIH0gPSBlZGl0b3JcbiAgICBjb25zdCBsZWFmID0gdGhpcy5yZW5kZXJUZXh0KClcblxuICAgIHJldHVybiBtYXJrcy5yZWR1Y2UoKGNoaWxkcmVuLCBtYXJrKSA9PiB7XG4gICAgICBjb25zdCBwcm9wcyA9IHsgZWRpdG9yLCBtYXJrLCBtYXJrcywgbm9kZSwgb2Zmc2V0LCB0ZXh0LCBjaGlsZHJlbiB9XG4gICAgICBjb25zdCBlbGVtZW50ID0gc3RhY2suZmluZCgncmVuZGVyTWFyaycsIHByb3BzKVxuICAgICAgcmV0dXJuIGVsZW1lbnQgfHwgY2hpbGRyZW5cbiAgICB9LCBsZWFmKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgdGV4dCBjb250ZW50IG9mIHRoZSBsZWFmLCBhY2NvdW50aW5nIGZvciBicm93c2Vycy5cbiAgICpcbiAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICovXG5cbiAgcmVuZGVyVGV4dCgpIHtcbiAgICBjb25zdCB7IGJsb2NrLCBub2RlLCBwYXJlbnQsIHRleHQsIGluZGV4LCBsZWF2ZXMgfSA9IHRoaXMucHJvcHNcblxuICAgIC8vIENPTVBBVDogUmVuZGVyIHRleHQgaW5zaWRlIHZvaWQgbm9kZXMgd2l0aCBhIHplcm8td2lkdGggc3BhY2UuXG4gICAgLy8gU28gdGhlIG5vZGUgY2FuIGNvbnRhaW4gc2VsZWN0aW9uIGJ1dCB0aGUgdGV4dCBpcyBub3QgdmlzaWJsZS5cbiAgICBpZiAocGFyZW50LmlzVm9pZCkgcmV0dXJuIDxzcGFuIGRhdGEtc2xhdGUtemVyby13aWR0aD57J1xcdTIwMEInfTwvc3Bhbj5cblxuICAgIC8vIENPTVBBVDogSWYgdGhlIHRleHQgaXMgZW1wdHksIGl0J3MgYmVjYXVzZSBpdCdzIG9uIHRoZSBlZGdlIG9mIGFuIGlubGluZVxuICAgIC8vIHZvaWQgbm9kZSwgc28gd2UgcmVuZGVyIGEgemVyby13aWR0aCBzcGFjZSBzbyB0aGF0IHRoZSBzZWxlY3Rpb24gY2FuIGJlXG4gICAgLy8gaW5zZXJ0ZWQgbmV4dCB0byBpdCBzdGlsbC5cbiAgICBpZiAodGV4dCA9PSAnJykgcmV0dXJuIDxzcGFuIGRhdGEtc2xhdGUtemVyby13aWR0aD57J1xcdTIwMEInfTwvc3Bhbj5cblxuICAgIC8vIENPTVBBVDogQnJvd3NlcnMgd2lsbCBjb2xsYXBzZSB0cmFpbGluZyBuZXcgbGluZXMgYXQgdGhlIGVuZCBvZiBibG9ja3MsXG4gICAgLy8gc28gd2UgbmVlZCB0byBhZGQgYW4gZXh0cmEgdHJhaWxpbmcgbmV3IGxpbmVzIHRvIHByZXZlbnQgdGhhdC5cbiAgICBjb25zdCBsYXN0VGV4dCA9IGJsb2NrLmdldExhc3RUZXh0KClcbiAgICBjb25zdCBsYXN0Q2hhciA9IHRleHQuY2hhckF0KHRleHQubGVuZ3RoIC0gMSlcbiAgICBjb25zdCBpc0xhc3RUZXh0ID0gbm9kZSA9PSBsYXN0VGV4dFxuICAgIGNvbnN0IGlzTGFzdExlYWYgPSBpbmRleCA9PSBsZWF2ZXMuc2l6ZSAtIDFcbiAgICBpZiAoaXNMYXN0VGV4dCAmJiBpc0xhc3RMZWFmICYmIGxhc3RDaGFyID09ICdcXG4nKSByZXR1cm4gYCR7dGV4dH1cXG5gXG5cbiAgICAvLyBPdGhlcndpc2UsIGp1c3QgcmV0dXJuIHRoZSB0ZXh0LlxuICAgIHJldHVybiB0ZXh0XG4gIH1cblxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7Q29tcG9uZW50fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IExlYWZcbiJdfQ==