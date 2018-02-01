'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slatePropTypes = require('slate-prop-types');

var _slatePropTypes2 = _interopRequireDefault(_slatePropTypes);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _void = require('./void');

var _void2 = _interopRequireDefault(_void);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
 * Node.
 *
 * @type {Component}
 */

var Node = function (_React$Component) {
  _inherits(Node, _React$Component);

  function Node() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Node);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Node.__proto__ || Object.getPrototypeOf(Node)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
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

  /**
   * Should the node update?
   *
   * @param {Object} nextProps
   * @param {Object} value
   * @return {Boolean}
   */

  _createClass(Node, [{
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
          editor = _props.editor,
          isSelected = _props.isSelected,
          node = _props.node,
          parent = _props.parent,
          readOnly = _props.readOnly;
      var value = editor.value;
      var selection = value.selection;
      var stack = editor.stack;

      var indexes = node.getSelectionIndexes(selection, isSelected);
      var children = node.nodes.toArray().map(function (child, i) {
        var isChildSelected = !!indexes && indexes.start <= i && i < indexes.end;
        return _this2.renderNode(child, isChildSelected);
      });

      // Attributes that the developer must to mix into the element in their
      // custom node renderer component.
      var attributes = { 'data-key': node.key };

      // If it's a block node with inline children, add the proper `dir` attribute
      // for text direction.
      if (node.object == 'block' && node.nodes.first().object != 'block') {
        var direction = node.getTextDirection();
        if (direction == 'rtl') attributes.dir = 'rtl';
      }

      var props = {
        key: node.key,
        editor: editor,
        isSelected: isSelected,
        node: node,
        parent: parent,
        readOnly: readOnly
      };

      var placeholder = stack.find('renderPlaceholder', props);

      if (placeholder) {
        placeholder = _react2.default.cloneElement(placeholder, { key: node.key + '-placeholder' });
        children = [placeholder].concat(_toConsumableArray(children));
      }

      var element = stack.find('renderNode', _extends({}, props, { attributes: attributes, children: children }));

      return node.isVoid ? _react2.default.createElement(
        _void2.default,
        this.props,
        element
      ) : element;
    }

    /**
     * Render a `child` node.
     *
     * @param {Node} child
     * @param {Boolean} isSelected
     * @return {Element}
     */

  }]);

  return Node;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Node.propTypes = {
  block: _slatePropTypes2.default.block,
  decorations: _reactImmutableProptypes2.default.list.isRequired,
  editor: _propTypes2.default.object.isRequired,
  isSelected: _propTypes2.default.bool.isRequired,
  node: _slatePropTypes2.default.node.isRequired,
  parent: _slatePropTypes2.default.node.isRequired,
  readOnly: _propTypes2.default.bool.isRequired
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var node = _this3.props.node;
    var key = node.key,
        type = node.type;

    debug.apply(undefined, [message, key + ' (' + type + ')'].concat(args));
  };

  this.shouldComponentUpdate = function (nextProps) {
    var props = _this3.props;
    var stack = props.editor.stack;

    var shouldUpdate = stack.find('shouldNodeComponentUpdate', props, nextProps);
    var n = nextProps;
    var p = props;

    // If the `Component` has a custom logic to determine whether the component
    // needs to be updated or not, return true if it returns true. If it returns
    // false, we need to ignore it, because it shouldn't be allowed it.
    if (shouldUpdate != null) {
      if (shouldUpdate) {
        return true;
      }

      if (shouldUpdate === false) {
        _slateDevLogger2.default.warn('Returning false in `shouldNodeComponentUpdate` does not disable Slate\'s internal `shouldComponentUpdate` logic. If you want to prevent updates, use React\'s `shouldComponentUpdate` instead.');
      }
    }

    // If the `readOnly` status has changed, re-render in case there is any
    // user-land logic that depends on it, like nested editable contents.
    if (n.readOnly != p.readOnly) return true;

    // If the node has changed, update. PERF: There are cases where it will have
    // changed, but it's properties will be exactly the same (eg. copy-paste)
    // which this won't catch. But that's rare and not a drag on performance, so
    // for simplicity we just let them through.
    if (n.node != p.node) return true;

    // If the selection value of the node or of some of its children has changed,
    // re-render in case there is any user-land logic depends on it to render.
    // if the node is selected update it, even if it was already selected: the
    // selection value of some of its children could have been changed and they
    // need to be rendered again.
    if (n.isSelected || p.isSelected) return true;

    // If the decorations have changed, update.
    if (!n.decorations.equals(p.decorations)) return true;

    // Otherwise, don't update.
    return false;
  };

  this.renderNode = function (child, isSelected) {
    var _props2 = _this3.props,
        block = _props2.block,
        decorations = _props2.decorations,
        editor = _props2.editor,
        node = _props2.node,
        readOnly = _props2.readOnly;
    var stack = editor.stack;

    var Component = child.object == 'text' ? _text2.default : Node;
    var decs = decorations.concat(node.getDecorations(stack));
    return _react2.default.createElement(Component, {
      block: node.object == 'block' ? node : block,
      decorations: decs,
      editor: editor,
      isSelected: isSelected,
      key: child.key,
      node: child,
      parent: node,
      readOnly: readOnly
    });
  };
};

exports.default = Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL25vZGUuanMiXSwibmFtZXMiOlsiZGVidWciLCJOb2RlIiwicHJvcHMiLCJlZGl0b3IiLCJpc1NlbGVjdGVkIiwibm9kZSIsInBhcmVudCIsInJlYWRPbmx5IiwidmFsdWUiLCJzZWxlY3Rpb24iLCJzdGFjayIsImluZGV4ZXMiLCJnZXRTZWxlY3Rpb25JbmRleGVzIiwiY2hpbGRyZW4iLCJub2RlcyIsInRvQXJyYXkiLCJtYXAiLCJjaGlsZCIsImkiLCJpc0NoaWxkU2VsZWN0ZWQiLCJzdGFydCIsImVuZCIsInJlbmRlck5vZGUiLCJhdHRyaWJ1dGVzIiwia2V5Iiwib2JqZWN0IiwiZmlyc3QiLCJkaXJlY3Rpb24iLCJnZXRUZXh0RGlyZWN0aW9uIiwiZGlyIiwicGxhY2Vob2xkZXIiLCJmaW5kIiwiY2xvbmVFbGVtZW50IiwiZWxlbWVudCIsImlzVm9pZCIsIkNvbXBvbmVudCIsInByb3BUeXBlcyIsImJsb2NrIiwiZGVjb3JhdGlvbnMiLCJsaXN0IiwiaXNSZXF1aXJlZCIsImJvb2wiLCJtZXNzYWdlIiwiYXJncyIsInR5cGUiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJzaG91bGRVcGRhdGUiLCJuIiwicCIsIndhcm4iLCJlcXVhbHMiLCJkZWNzIiwiY29uY2F0IiwiZ2V0RGVjb3JhdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxRQUFRLHFCQUFNLFlBQU4sQ0FBZDs7QUFFQTs7Ozs7O0lBTU1DLEk7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUo7Ozs7OztBQWdCQTs7Ozs7OztBQWFBOzs7Ozs7Ozs7Ozs7QUFvREE7Ozs7Ozs2QkFNUztBQUFBOztBQUNQLFdBQUtELEtBQUwsQ0FBVyxRQUFYLEVBQXFCLElBQXJCOztBQURP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R0FBYSxVQUFDTCxLQUFELEVBQVFiLFVBQVIsRUFBdUI7QUFBQSxrQkFDcUIsT0FBS0YsS0FEMUI7QUFBQSxRQUMxQm1DLEtBRDBCLFdBQzFCQSxLQUQwQjtBQUFBLFFBQ25CQyxXQURtQixXQUNuQkEsV0FEbUI7QUFBQSxRQUNObkMsTUFETSxXQUNOQSxNQURNO0FBQUEsUUFDRUUsSUFERixXQUNFQSxJQURGO0FBQUEsUUFDUUUsUUFEUixXQUNRQSxRQURSO0FBQUEsUUFFMUJHLEtBRjBCLEdBRWhCUCxNQUZnQixDQUUxQk8sS0FGMEI7O0FBR2xDLFFBQU15QixZQUFZbEIsTUFBTVEsTUFBTixJQUFnQixNQUFoQixvQkFBZ0N4QixJQUFsRDtBQUNBLFFBQU1tRCxPQUFPZCxZQUFZZSxNQUFaLENBQW1CaEQsS0FBS2lELGNBQUwsQ0FBb0I1QyxLQUFwQixDQUFuQixDQUFiO0FBQ0EsV0FDRSw4QkFBQyxTQUFEO0FBQ0UsYUFBT0wsS0FBS29CLE1BQUwsSUFBZSxPQUFmLEdBQXlCcEIsSUFBekIsR0FBZ0NnQyxLQUR6QztBQUVFLG1CQUFhZSxJQUZmO0FBR0UsY0FBUWpELE1BSFY7QUFJRSxrQkFBWUMsVUFKZDtBQUtFLFdBQUthLE1BQU1PLEdBTGI7QUFNRSxZQUFNUCxLQU5SO0FBT0UsY0FBUVosSUFQVjtBQVFFLGdCQUFVRTtBQVJaLE1BREY7QUFZRCxHOzs7a0JBVVlOLEkiLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJ1xuaW1wb3J0IEltbXV0YWJsZVR5cGVzIGZyb20gJ3JlYWN0LWltbXV0YWJsZS1wcm9wdHlwZXMnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgU2xhdGVUeXBlcyBmcm9tICdzbGF0ZS1wcm9wLXR5cGVzJ1xuaW1wb3J0IGxvZ2dlciBmcm9tICdzbGF0ZS1kZXYtbG9nZ2VyJ1xuaW1wb3J0IFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnXG5cbmltcG9ydCBWb2lkIGZyb20gJy4vdm9pZCdcbmltcG9ydCBUZXh0IGZyb20gJy4vdGV4dCdcblxuLyoqXG4gKiBEZWJ1Zy5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuY29uc3QgZGVidWcgPSBEZWJ1Zygnc2xhdGU6bm9kZScpXG5cbi8qKlxuICogTm9kZS5cbiAqXG4gKiBAdHlwZSB7Q29tcG9uZW50fVxuICovXG5cbmNsYXNzIE5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIC8qKlxuICAgKiBQcm9wZXJ0eSB0eXBlcy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBibG9jazogU2xhdGVUeXBlcy5ibG9jayxcbiAgICBkZWNvcmF0aW9uczogSW1tdXRhYmxlVHlwZXMubGlzdC5pc1JlcXVpcmVkLFxuICAgIGVkaXRvcjogVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgaXNTZWxlY3RlZDogVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG5vZGU6IFNsYXRlVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIHBhcmVudDogU2xhdGVUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG4gICAgcmVhZE9ubHk6IFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1Zy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQHBhcmFtIHtNaXhlZH0gLi4uYXJnc1xuICAgKi9cblxuICBkZWJ1ZyA9IChtZXNzYWdlLCAuLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgeyBub2RlIH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3QgeyBrZXksIHR5cGUgfSA9IG5vZGVcbiAgICBkZWJ1ZyhtZXNzYWdlLCBgJHtrZXl9ICgke3R5cGV9KWAsIC4uLmFyZ3MpXG4gIH1cblxuICAvKipcbiAgICogU2hvdWxkIHRoZSBub2RlIHVwZGF0ZT9cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG5leHRQcm9wc1xuICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlID0gKG5leHRQcm9wcykgPT4ge1xuICAgIGNvbnN0IHsgcHJvcHMgfSA9IHRoaXNcbiAgICBjb25zdCB7IHN0YWNrIH0gPSBwcm9wcy5lZGl0b3JcbiAgICBjb25zdCBzaG91bGRVcGRhdGUgPSBzdGFjay5maW5kKCdzaG91bGROb2RlQ29tcG9uZW50VXBkYXRlJywgcHJvcHMsIG5leHRQcm9wcylcbiAgICBjb25zdCBuID0gbmV4dFByb3BzXG4gICAgY29uc3QgcCA9IHByb3BzXG5cbiAgICAvLyBJZiB0aGUgYENvbXBvbmVudGAgaGFzIGEgY3VzdG9tIGxvZ2ljIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBjb21wb25lbnRcbiAgICAvLyBuZWVkcyB0byBiZSB1cGRhdGVkIG9yIG5vdCwgcmV0dXJuIHRydWUgaWYgaXQgcmV0dXJucyB0cnVlLiBJZiBpdCByZXR1cm5zXG4gICAgLy8gZmFsc2UsIHdlIG5lZWQgdG8gaWdub3JlIGl0LCBiZWNhdXNlIGl0IHNob3VsZG4ndCBiZSBhbGxvd2VkIGl0LlxuICAgIGlmIChzaG91bGRVcGRhdGUgIT0gbnVsbCkge1xuICAgICAgaWYgKHNob3VsZFVwZGF0ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoc2hvdWxkVXBkYXRlID09PSBmYWxzZSkge1xuICAgICAgICBsb2dnZXIud2FybignUmV0dXJuaW5nIGZhbHNlIGluIGBzaG91bGROb2RlQ29tcG9uZW50VXBkYXRlYCBkb2VzIG5vdCBkaXNhYmxlIFNsYXRlXFwncyBpbnRlcm5hbCBgc2hvdWxkQ29tcG9uZW50VXBkYXRlYCBsb2dpYy4gSWYgeW91IHdhbnQgdG8gcHJldmVudCB1cGRhdGVzLCB1c2UgUmVhY3RcXCdzIGBzaG91bGRDb21wb25lbnRVcGRhdGVgIGluc3RlYWQuJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgYHJlYWRPbmx5YCBzdGF0dXMgaGFzIGNoYW5nZWQsIHJlLXJlbmRlciBpbiBjYXNlIHRoZXJlIGlzIGFueVxuICAgIC8vIHVzZXItbGFuZCBsb2dpYyB0aGF0IGRlcGVuZHMgb24gaXQsIGxpa2UgbmVzdGVkIGVkaXRhYmxlIGNvbnRlbnRzLlxuICAgIGlmIChuLnJlYWRPbmx5ICE9IHAucmVhZE9ubHkpIHJldHVybiB0cnVlXG5cbiAgICAvLyBJZiB0aGUgbm9kZSBoYXMgY2hhbmdlZCwgdXBkYXRlLiBQRVJGOiBUaGVyZSBhcmUgY2FzZXMgd2hlcmUgaXQgd2lsbCBoYXZlXG4gICAgLy8gY2hhbmdlZCwgYnV0IGl0J3MgcHJvcGVydGllcyB3aWxsIGJlIGV4YWN0bHkgdGhlIHNhbWUgKGVnLiBjb3B5LXBhc3RlKVxuICAgIC8vIHdoaWNoIHRoaXMgd29uJ3QgY2F0Y2guIEJ1dCB0aGF0J3MgcmFyZSBhbmQgbm90IGEgZHJhZyBvbiBwZXJmb3JtYW5jZSwgc29cbiAgICAvLyBmb3Igc2ltcGxpY2l0eSB3ZSBqdXN0IGxldCB0aGVtIHRocm91Z2guXG4gICAgaWYgKG4ubm9kZSAhPSBwLm5vZGUpIHJldHVybiB0cnVlXG5cbiAgICAvLyBJZiB0aGUgc2VsZWN0aW9uIHZhbHVlIG9mIHRoZSBub2RlIG9yIG9mIHNvbWUgb2YgaXRzIGNoaWxkcmVuIGhhcyBjaGFuZ2VkLFxuICAgIC8vIHJlLXJlbmRlciBpbiBjYXNlIHRoZXJlIGlzIGFueSB1c2VyLWxhbmQgbG9naWMgZGVwZW5kcyBvbiBpdCB0byByZW5kZXIuXG4gICAgLy8gaWYgdGhlIG5vZGUgaXMgc2VsZWN0ZWQgdXBkYXRlIGl0LCBldmVuIGlmIGl0IHdhcyBhbHJlYWR5IHNlbGVjdGVkOiB0aGVcbiAgICAvLyBzZWxlY3Rpb24gdmFsdWUgb2Ygc29tZSBvZiBpdHMgY2hpbGRyZW4gY291bGQgaGF2ZSBiZWVuIGNoYW5nZWQgYW5kIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlIHJlbmRlcmVkIGFnYWluLlxuICAgIGlmIChuLmlzU2VsZWN0ZWQgfHwgcC5pc1NlbGVjdGVkKSByZXR1cm4gdHJ1ZVxuXG4gICAgLy8gSWYgdGhlIGRlY29yYXRpb25zIGhhdmUgY2hhbmdlZCwgdXBkYXRlLlxuICAgIGlmICghbi5kZWNvcmF0aW9ucy5lcXVhbHMocC5kZWNvcmF0aW9ucykpIHJldHVybiB0cnVlXG5cbiAgICAvLyBPdGhlcndpc2UsIGRvbid0IHVwZGF0ZS5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIuXG4gICAqXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAqL1xuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLmRlYnVnKCdyZW5kZXInLCB0aGlzKVxuXG4gICAgY29uc3QgeyBlZGl0b3IsIGlzU2VsZWN0ZWQsIG5vZGUsIHBhcmVudCwgcmVhZE9ubHkgfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBlZGl0b3JcbiAgICBjb25zdCB7IHNlbGVjdGlvbiB9ID0gdmFsdWVcbiAgICBjb25zdCB7IHN0YWNrIH0gPSBlZGl0b3JcbiAgICBjb25zdCBpbmRleGVzID0gbm9kZS5nZXRTZWxlY3Rpb25JbmRleGVzKHNlbGVjdGlvbiwgaXNTZWxlY3RlZClcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLm5vZGVzLnRvQXJyYXkoKS5tYXAoKGNoaWxkLCBpKSA9PiB7XG4gICAgICBjb25zdCBpc0NoaWxkU2VsZWN0ZWQgPSAhIWluZGV4ZXMgJiYgaW5kZXhlcy5zdGFydCA8PSBpICYmIGkgPCBpbmRleGVzLmVuZFxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTm9kZShjaGlsZCwgaXNDaGlsZFNlbGVjdGVkKVxuICAgIH0pXG5cbiAgICAvLyBBdHRyaWJ1dGVzIHRoYXQgdGhlIGRldmVsb3BlciBtdXN0IHRvIG1peCBpbnRvIHRoZSBlbGVtZW50IGluIHRoZWlyXG4gICAgLy8gY3VzdG9tIG5vZGUgcmVuZGVyZXIgY29tcG9uZW50LlxuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7ICdkYXRhLWtleSc6IG5vZGUua2V5IH1cblxuICAgIC8vIElmIGl0J3MgYSBibG9jayBub2RlIHdpdGggaW5saW5lIGNoaWxkcmVuLCBhZGQgdGhlIHByb3BlciBgZGlyYCBhdHRyaWJ1dGVcbiAgICAvLyBmb3IgdGV4dCBkaXJlY3Rpb24uXG4gICAgaWYgKG5vZGUub2JqZWN0ID09ICdibG9jaycgJiYgbm9kZS5ub2Rlcy5maXJzdCgpLm9iamVjdCAhPSAnYmxvY2snKSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBub2RlLmdldFRleHREaXJlY3Rpb24oKVxuICAgICAgaWYgKGRpcmVjdGlvbiA9PSAncnRsJykgYXR0cmlidXRlcy5kaXIgPSAncnRsJ1xuICAgIH1cblxuICAgIGNvbnN0IHByb3BzID0ge1xuICAgICAga2V5OiBub2RlLmtleSxcbiAgICAgIGVkaXRvcixcbiAgICAgIGlzU2VsZWN0ZWQsXG4gICAgICBub2RlLFxuICAgICAgcGFyZW50LFxuICAgICAgcmVhZE9ubHksXG4gICAgfVxuXG4gICAgbGV0IHBsYWNlaG9sZGVyID0gc3RhY2suZmluZCgncmVuZGVyUGxhY2Vob2xkZXInLCBwcm9wcylcblxuICAgIGlmIChwbGFjZWhvbGRlcikge1xuICAgICAgcGxhY2Vob2xkZXIgPSBSZWFjdC5jbG9uZUVsZW1lbnQocGxhY2Vob2xkZXIsIHsga2V5OiBgJHtub2RlLmtleX0tcGxhY2Vob2xkZXJgIH0pXG4gICAgICBjaGlsZHJlbiA9IFtwbGFjZWhvbGRlciwgLi4uY2hpbGRyZW5dXG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudCA9IHN0YWNrLmZpbmQoJ3JlbmRlck5vZGUnLCB7IC4uLnByb3BzLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbiB9KVxuXG4gICAgcmV0dXJuIG5vZGUuaXNWb2lkXG4gICAgICA/IDxWb2lkIHsuLi50aGlzLnByb3BzfT57ZWxlbWVudH08L1ZvaWQ+XG4gICAgICA6IGVsZW1lbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgYSBgY2hpbGRgIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gY2hpbGRcbiAgICogQHBhcmFtIHtCb29sZWFufSBpc1NlbGVjdGVkXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAqL1xuXG4gIHJlbmRlck5vZGUgPSAoY2hpbGQsIGlzU2VsZWN0ZWQpID0+IHtcbiAgICBjb25zdCB7IGJsb2NrLCBkZWNvcmF0aW9ucywgZWRpdG9yLCBub2RlLCByZWFkT25seSB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHsgc3RhY2sgfSA9IGVkaXRvclxuICAgIGNvbnN0IENvbXBvbmVudCA9IGNoaWxkLm9iamVjdCA9PSAndGV4dCcgPyBUZXh0IDogTm9kZVxuICAgIGNvbnN0IGRlY3MgPSBkZWNvcmF0aW9ucy5jb25jYXQobm9kZS5nZXREZWNvcmF0aW9ucyhzdGFjaykpXG4gICAgcmV0dXJuIChcbiAgICAgIDxDb21wb25lbnRcbiAgICAgICAgYmxvY2s9e25vZGUub2JqZWN0ID09ICdibG9jaycgPyBub2RlIDogYmxvY2t9XG4gICAgICAgIGRlY29yYXRpb25zPXtkZWNzfVxuICAgICAgICBlZGl0b3I9e2VkaXRvcn1cbiAgICAgICAgaXNTZWxlY3RlZD17aXNTZWxlY3RlZH1cbiAgICAgICAga2V5PXtjaGlsZC5rZXl9XG4gICAgICAgIG5vZGU9e2NoaWxkfVxuICAgICAgICBwYXJlbnQ9e25vZGV9XG4gICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgIC8+XG4gICAgKVxuICB9XG5cbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0NvbXBvbmVudH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBOb2RlXG4iXX0=