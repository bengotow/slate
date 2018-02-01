'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slatePropTypes = require('slate-prop-types');

var _slatePropTypes2 = _interopRequireDefault(_slatePropTypes);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _leaf = require('./leaf');

var _leaf2 = _interopRequireDefault(_leaf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:node');

/**
 * Text.
 *
 * @type {Component}
 */

var Text = function (_React$Component) {
  _inherits(Text, _React$Component);

  function Text() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Text);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Text.__proto__ || Object.getPrototypeOf(Text)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * Default prop types.
   *
   * @type {Object}
   */

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  /**
   * Should the node update?
   *
   * @param {Object} nextProps
   * @param {Object} value
   * @return {Boolean}
   */

  _createClass(Text, [{
    key: 'render',


    /**
     * Render.
     *
     * @return {Element}
     */

    value: function render() {
      var _this2 = this;

      this.debug('render', this);

      var _props = this.props,
          decorations = _props.decorations,
          editor = _props.editor,
          node = _props.node,
          style = _props.style;
      var value = editor.value;
      var document = value.document;
      var key = node.key;


      var decs = decorations.filter(function (d) {
        var startKey = d.startKey,
            endKey = d.endKey;

        if (startKey == key || endKey == key) return true;
        var startsBefore = document.areDescendantsSorted(startKey, key);
        var endsAfter = document.areDescendantsSorted(key, endKey);
        return startsBefore && endsAfter;
      });

      var leaves = node.getLeaves(decs);
      var offset = 0;

      var children = leaves.map(function (leaf, i) {
        var child = _this2.renderLeaf(leaves, leaf, i, offset);
        offset += leaf.text.length;
        return child;
      });

      return _react2.default.createElement(
        'span',
        { 'data-key': key, style: style },
        children
      );
    }

    /**
     * Render a single leaf given a `leaf` and `offset`.
     *
     * @param {List<Leaf>} leaves
     * @param {Leaf} leaf
     * @param {Number} index
     * @param {Number} offset
     * @return {Element} leaf
     */

  }]);

  return Text;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Text.propTypes = {
  block: _slatePropTypes2.default.block,
  decorations: _reactImmutableProptypes2.default.list.isRequired,
  editor: _propTypes2.default.object.isRequired,
  node: _slatePropTypes2.default.node.isRequired,
  parent: _slatePropTypes2.default.node.isRequired,
  style: _propTypes2.default.object
};
Text.defaultProps = {
  style: null
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var node = _this3.props.node;
    var key = node.key;

    debug.apply(undefined, [message, key + ' (text)'].concat(args));
  };

  this.shouldComponentUpdate = function (nextProps) {
    var props = _this3.props;

    var n = nextProps;
    var p = props;

    // If the node has changed, update. PERF: There are cases where it will have
    // changed, but it's properties will be exactly the same (eg. copy-paste)
    // which this won't catch. But that's rare and not a drag on performance, so
    // for simplicity we just let them through.
    if (n.node != p.node) return true;

    // If the node parent is a block node, and it was the last child of the
    // block, re-render to cleanup extra `\n`.
    if (n.parent.object == 'block') {
      var pLast = p.parent.nodes.last();
      var nLast = n.parent.nodes.last();
      if (p.node == pLast && n.node != nLast) return true;
    }

    // Re-render if the current decorations have changed.
    if (!n.decorations.equals(p.decorations)) return true;

    // Otherwise, don't update.
    return false;
  };

  this.renderLeaf = function (leaves, leaf, index, offset) {
    var _props2 = _this3.props,
        block = _props2.block,
        node = _props2.node,
        parent = _props2.parent,
        editor = _props2.editor;
    var text = leaf.text,
        marks = leaf.marks;


    return _react2.default.createElement(_leaf2.default, {
      key: node.key + '-' + index,
      block: block,
      editor: editor,
      index: index,
      marks: marks,
      node: node,
      offset: offset,
      parent: parent,
      leaves: leaves,
      text: text
    });
  };
};

exports.default = Text;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOlsiZGVidWciLCJUZXh0IiwicHJvcHMiLCJkZWNvcmF0aW9ucyIsImVkaXRvciIsIm5vZGUiLCJzdHlsZSIsInZhbHVlIiwiZG9jdW1lbnQiLCJrZXkiLCJkZWNzIiwiZmlsdGVyIiwiZCIsInN0YXJ0S2V5IiwiZW5kS2V5Iiwic3RhcnRzQmVmb3JlIiwiYXJlRGVzY2VuZGFudHNTb3J0ZWQiLCJlbmRzQWZ0ZXIiLCJsZWF2ZXMiLCJnZXRMZWF2ZXMiLCJvZmZzZXQiLCJjaGlsZHJlbiIsIm1hcCIsImxlYWYiLCJpIiwiY2hpbGQiLCJyZW5kZXJMZWFmIiwidGV4dCIsImxlbmd0aCIsIkNvbXBvbmVudCIsInByb3BUeXBlcyIsImJsb2NrIiwibGlzdCIsImlzUmVxdWlyZWQiLCJvYmplY3QiLCJwYXJlbnQiLCJkZWZhdWx0UHJvcHMiLCJtZXNzYWdlIiwiYXJncyIsInNob3VsZENvbXBvbmVudFVwZGF0ZSIsIm5leHRQcm9wcyIsIm4iLCJwIiwicExhc3QiLCJub2RlcyIsImxhc3QiLCJuTGFzdCIsImVxdWFscyIsImluZGV4IiwibWFya3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxxQkFBTSxZQUFOLENBQWQ7O0FBRUE7Ozs7OztJQU1NQyxJOzs7Ozs7Ozs7Ozs7Ozs7OztBQUVKOzs7Ozs7QUFlQTs7Ozs7O0FBVUE7Ozs7Ozs7QUFhQTs7Ozs7Ozs7Ozs7O0FBa0NBOzs7Ozs7NkJBTVM7QUFBQTs7QUFDUCxXQUFLRCxLQUFMLENBQVcsUUFBWCxFQUFxQixJQUFyQjs7QUFETyxtQkFHc0MsS0FBS0UsS0FIM0M7QUFBQSxVQUdDQyxXQUhELFVBR0NBLFdBSEQ7QUFBQSxVQUdjQyxNQUhkLFVBR2NBLE1BSGQ7QUFBQSxVQUdzQkMsSUFIdEIsVUFH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QUFVc0MsS0FBVixJQUFtQkYsRUFBRXBDLElBQUYsSUFBVXlDLEtBQWpDLEVBQXdDLE9BQU8sSUFBUDtBQUN6Qzs7QUFFRDtBQUNBLFFBQUksQ0FBQ0wsRUFBRXRDLFdBQUYsQ0FBYzRDLE1BQWQsQ0FBcUJMLEVBQUV2QyxXQUF2QixDQUFMLEVBQTBDLE9BQU8sSUFBUDs7QUFFMUM7QUFDQSxXQUFPLEtBQVA7QUFDRCxHOztPQWtERHVCLFUsR0FBYSxVQUFDUixNQUFELEVBQVNLLElBQVQsRUFBZXlCLEtBQWYsRUFBc0I1QixNQUF0QixFQUFpQztBQUFBLGtCQUNKLE9BQUtsQixLQUREO0FBQUEsUUFDcEM2QixLQURvQyxXQUNwQ0EsS0FEb0M7QUFBQSxRQUM3QjFCLElBRDZCLFdBQzdCQSxJQUQ2QjtBQUFBLFFBQ3ZCOEIsTUFEdUIsV0FDdkJBLE1BRHVCO0FBQUEsUUFDZi9CLE1BRGUsV0FDZkEsTUFEZTtBQUFBLFFBRXBDdUIsSUFGb0MsR0FFcEJKLElBRm9CLENBRXBDSSxJQUZvQztBQUFBLFFBRTlCc0IsS0FGOEIsR0FFcEIxQixJQUZvQixDQUU5QjBCLEtBRjhCOzs7QUFJNUMsV0FDRTtBQUNFLFdBQVE1QyxLQUFLSSxHQUFiLFNBQW9CdUMsS0FEdEI7QUFFRSxhQUFPakIsS0FGVDtBQUdFLGNBQVEzQixNQUhWO0FBSUUsYUFBTzRDLEtBSlQ7QUFLRSxhQUFPQyxLQUxUO0FBTUUsWUFBTTVDLElBTlI7QUFPRSxjQUFRZSxNQVBWO0FBUUUsY0FBUWUsTUFSVjtBQVNFLGNBQVFqQixNQVRWO0FBVUUsWUFBTVM7QUFWUixNQURGO0FBY0QsRzs7O2tCQVVZMUIsSSIsImZpbGUiOiJ0ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnXG5pbXBvcnQgSW1tdXRhYmxlVHlwZXMgZnJvbSAncmVhY3QtaW1tdXRhYmxlLXByb3B0eXBlcydcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBTbGF0ZVR5cGVzIGZyb20gJ3NsYXRlLXByb3AtdHlwZXMnXG5pbXBvcnQgVHlwZXMgZnJvbSAncHJvcC10eXBlcydcblxuaW1wb3J0IExlYWYgZnJvbSAnLi9sZWFmJ1xuXG4vKipcbiAqIERlYnVnLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5jb25zdCBkZWJ1ZyA9IERlYnVnKCdzbGF0ZTpub2RlJylcblxuLyoqXG4gKiBUZXh0LlxuICpcbiAqIEB0eXBlIHtDb21wb25lbnR9XG4gKi9cblxuY2xhc3MgVGV4dCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgLyoqXG4gICAqIFByb3BlcnR5IHR5cGVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGJsb2NrOiBTbGF0ZVR5cGVzLmJsb2NrLFxuICAgIGRlY29yYXRpb25zOiBJbW11dGFibGVUeXBlcy5saXN0LmlzUmVxdWlyZWQsXG4gICAgZWRpdG9yOiBUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBub2RlOiBTbGF0ZVR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICBwYXJlbnQ6IFNsYXRlVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIHN0eWxlOiBUeXBlcy5vYmplY3QsXG4gIH1cblxuICAvKipcbiAgICogRGVmYXVsdCBwcm9wIHR5cGVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIHN0eWxlOiBudWxsLFxuICB9XG5cbiAgLyoqXG4gICAqIERlYnVnLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAcGFyYW0ge01peGVkfSAuLi5hcmdzXG4gICAqL1xuXG4gIGRlYnVnID0gKG1lc3NhZ2UsIC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCB7IG5vZGUgfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7IGtleSB9ID0gbm9kZVxuICAgIGRlYnVnKG1lc3NhZ2UsIGAke2tleX0gKHRleHQpYCwgLi4uYXJncylcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG91bGQgdGhlIG5vZGUgdXBkYXRlP1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbmV4dFByb3BzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUgPSAobmV4dFByb3BzKSA9PiB7XG4gICAgY29uc3QgeyBwcm9wcyB9ID0gdGhpc1xuICAgIGNvbnN0IG4gPSBuZXh0UHJvcHNcbiAgICBjb25zdCBwID0gcHJvcHNcblxuICAgIC8vIElmIHRoZSBub2RlIGhhcyBjaGFuZ2VkLCB1cGRhdGUuIFBFUkY6IFRoZXJlIGFyZSBjYXNlcyB3aGVyZSBpdCB3aWxsIGhhdmVcbiAgICAvLyBjaGFuZ2VkLCBidXQgaXQncyBwcm9wZXJ0aWVzIHdpbGwgYmUgZXhhY3RseSB0aGUgc2FtZSAoZWcuIGNvcHktcGFzdGUpXG4gICAgLy8gd2hpY2ggdGhpcyB3b24ndCBjYXRjaC4gQnV0IHRoYXQncyByYXJlIGFuZCBub3QgYSBkcmFnIG9uIHBlcmZvcm1hbmNlLCBzb1xuICAgIC8vIGZvciBzaW1wbGljaXR5IHdlIGp1c3QgbGV0IHRoZW0gdGhyb3VnaC5cbiAgICBpZiAobi5ub2RlICE9IHAubm9kZSkgcmV0dXJuIHRydWVcblxuICAgIC8vIElmIHRoZSBub2RlIHBhcmVudCBpcyBhIGJsb2NrIG5vZGUsIGFuZCBpdCB3YXMgdGhlIGxhc3QgY2hpbGQgb2YgdGhlXG4gICAgLy8gYmxvY2ssIHJlLXJlbmRlciB0byBjbGVhbnVwIGV4dHJhIGBcXG5gLlxuICAgIGlmIChuLnBhcmVudC5vYmplY3QgPT0gJ2Jsb2NrJykge1xuICAgICAgY29uc3QgcExhc3QgPSBwLnBhcmVudC5ub2Rlcy5sYXN0KClcbiAgICAgIGNvbnN0IG5MYXN0ID0gbi5wYXJlbnQubm9kZXMubGFzdCgpXG4gICAgICBpZiAocC5ub2RlID09IHBMYXN0ICYmIG4ubm9kZSAhPSBuTGFzdCkgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBSZS1yZW5kZXIgaWYgdGhlIGN1cnJlbnQgZGVjb3JhdGlvbnMgaGF2ZSBjaGFuZ2VkLlxuICAgIGlmICghbi5kZWNvcmF0aW9ucy5lcXVhbHMocC5kZWNvcmF0aW9ucykpIHJldHVybiB0cnVlXG5cbiAgICAvLyBPdGhlcndpc2UsIGRvbid0IHVwZGF0ZS5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIuXG4gICAqXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAqL1xuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLmRlYnVnKCdyZW5kZXInLCB0aGlzKVxuXG4gICAgY29uc3QgeyBkZWNvcmF0aW9ucywgZWRpdG9yLCBub2RlLCBzdHlsZSB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGVkaXRvclxuICAgIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgY29uc3QgeyBrZXkgfSA9IG5vZGVcblxuICAgIGNvbnN0IGRlY3MgPSBkZWNvcmF0aW9ucy5maWx0ZXIoKGQpID0+IHtcbiAgICAgIGNvbnN0IHsgc3RhcnRLZXksIGVuZEtleSB9ID0gZFxuICAgICAgaWYgKHN0YXJ0S2V5ID09IGtleSB8fCBlbmRLZXkgPT0ga2V5KSByZXR1cm4gdHJ1ZVxuICAgICAgY29uc3Qgc3RhcnRzQmVmb3JlID0gZG9jdW1lbnQuYXJlRGVzY2VuZGFudHNTb3J0ZWQoc3RhcnRLZXksIGtleSlcbiAgICAgIGNvbnN0IGVuZHNBZnRlciA9IGRvY3VtZW50LmFyZURlc2NlbmRhbnRzU29ydGVkKGtleSwgZW5kS2V5KVxuICAgICAgcmV0dXJuIHN0YXJ0c0JlZm9yZSAmJiBlbmRzQWZ0ZXJcbiAgICB9KVxuXG4gICAgY29uc3QgbGVhdmVzID0gbm9kZS5nZXRMZWF2ZXMoZGVjcylcbiAgICBsZXQgb2Zmc2V0ID0gMFxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSBsZWF2ZXMubWFwKChsZWFmLCBpKSA9PiB7XG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMucmVuZGVyTGVhZihsZWF2ZXMsIGxlYWYsIGksIG9mZnNldClcbiAgICAgIG9mZnNldCArPSBsZWFmLnRleHQubGVuZ3RoXG4gICAgICByZXR1cm4gY2hpbGRcbiAgICB9KVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGRhdGEta2V5PXtrZXl9IHN0eWxlPXtzdHlsZX0+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvc3Bhbj5cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGEgc2luZ2xlIGxlYWYgZ2l2ZW4gYSBgbGVhZmAgYW5kIGBvZmZzZXRgLlxuICAgKlxuICAgKiBAcGFyYW0ge0xpc3Q8TGVhZj59IGxlYXZlc1xuICAgKiBAcGFyYW0ge0xlYWZ9IGxlYWZcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAgICogQHJldHVybiB7RWxlbWVudH0gbGVhZlxuICAgKi9cblxuICByZW5kZXJMZWFmID0gKGxlYXZlcywgbGVhZiwgaW5kZXgsIG9mZnNldCkgPT4ge1xuICAgIGNvbnN0IHsgYmxvY2ssIG5vZGUsIHBhcmVudCwgZWRpdG9yIH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3QgeyB0ZXh0LCBtYXJrcyB9ID0gbGVhZlxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxMZWFmXG4gICAgICAgIGtleT17YCR7bm9kZS5rZXl9LSR7aW5kZXh9YH1cbiAgICAgICAgYmxvY2s9e2Jsb2NrfVxuICAgICAgICBlZGl0b3I9e2VkaXRvcn1cbiAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICBtYXJrcz17bWFya3N9XG4gICAgICAgIG5vZGU9e25vZGV9XG4gICAgICAgIG9mZnNldD17b2Zmc2V0fVxuICAgICAgICBwYXJlbnQ9e3BhcmVudH1cbiAgICAgICAgbGVhdmVzPXtsZWF2ZXN9XG4gICAgICAgIHRleHQ9e3RleHR9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtDb21wb25lbnR9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgVGV4dFxuIl19