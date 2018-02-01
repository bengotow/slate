'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slatePropTypes = require('slate-prop-types');

var _slatePropTypes2 = _interopRequireDefault(_slatePropTypes);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:void');

/**
 * Void.
 *
 * @type {Component}
 */

var Void = function (_React$Component) {
  _inherits(Void, _React$Component);

  function Void() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Void);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Void.__proto__ || Object.getPrototypeOf(Void)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
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

  _createClass(Void, [{
    key: 'render',


    /**
     * Render.
     *
     * @return {Element}
     */

    value: function render() {
      var props = this.props;
      var children = props.children,
          node = props.node,
          readOnly = props.readOnly;

      var Tag = node.object == 'block' ? 'div' : 'span';
      var style = {
        height: '0',
        color: 'transparent',
        outline: 'none'
      };

      var spacer = _react2.default.createElement(
        Tag,
        {
          contentEditable: true,
          'data-slate-spacer': true,
          suppressContentEditableWarning: true,
          style: style
        },
        this.renderText()
      );

      var content = _react2.default.createElement(
        Tag,
        { draggable: readOnly ? null : true },
        children
      );

      this.debug('render', { props: props });

      return _react2.default.createElement(
        Tag,
        {
          'data-slate-void': true,
          'data-key': node.key,
          contentEditable: readOnly ? null : false
        },
        readOnly ? null : spacer,
        content
      );
    }

    /**
     * Render the void node's text node, which will catch the cursor when it the
     * void node is navigated to with the arrow keys.
     *
     * Having this text node there means the browser continues to manage the
     * selection natively, so it keeps track of the right offset when moving
     * across the block.
     *
     * @return {Element}
     */

  }]);

  return Void;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Void.propTypes = {
  block: _slatePropTypes2.default.block,
  children: _propTypes2.default.any.isRequired,
  editor: _propTypes2.default.object.isRequired,
  node: _slatePropTypes2.default.node.isRequired,
  parent: _slatePropTypes2.default.node.isRequired,
  readOnly: _propTypes2.default.bool.isRequired
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var node = _this2.props.node;
    var key = node.key,
        type = node.type;

    var id = key + ' (' + type + ')';
    debug.apply(undefined, [message, '' + id].concat(args));
  };

  this.renderText = function () {
    var _props = _this2.props,
        block = _props.block,
        decorations = _props.decorations,
        isSelected = _props.isSelected,
        node = _props.node,
        readOnly = _props.readOnly,
        editor = _props.editor;

    var child = node.getFirstText();
    return _react2.default.createElement(_text2.default, {
      block: node.object == 'block' ? node : block,
      decorations: decorations,
      editor: editor,
      isSelected: isSelected,
      key: child.key,
      node: child,
      parent: node,
      readOnly: readOnly
    });
  };
};

exports.default = Void;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3ZvaWQuanMiXSwibmFtZXMiOlsiZGVidWciLCJWb2lkIiwicHJvcHMiLCJjaGlsZHJlbiIsIm5vZGUiLCJyZWFkT25seSIsIlRhZyIsIm9iamVjdCIsInN0eWxlIiwiaGVpZ2h0IiwiY29sb3IiLCJvdXRsaW5lIiwic3BhY2VyIiwicmVuZGVyVGV4dCIsImNvbnRlbnQiLCJrZXkiLCJDb21wb25lbnQiLCJwcm9wVHlwZXMiLCJibG9jayIsImFueSIsImlzUmVxdWlyZWQiLCJlZGl0b3IiLCJwYXJlbnQiLCJib29sIiwibWVzc2FnZSIsImFyZ3MiLCJ0eXBlIiwiaWQiLCJkZWNvcmF0aW9ucyIsImlzU2VsZWN0ZWQiLCJjaGlsZCIsImdldEZpcnN0VGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxxQkFBTSxZQUFOLENBQWQ7O0FBRUE7Ozs7OztJQU1NQyxJOzs7Ozs7Ozs7Ozs7Ozs7OztBQUVKOzs7Ozs7QUFlQTs7Ozs7Ozs7Ozs7QUFjQTs7Ozs7OzZCQU1TO0FBQUEsVUFDQ0MsS0FERCxHQUNXLElBRFgsQ0FDQ0EsS0FERDtBQUFBLFVBRUNDLFFBRkQsR0FFOEJELEtBRjlCLENBRUNDLFFBRkQ7QUFBQSxVQUVXQyxJQUZYLEdBRThCRixLQUY5QixDQUVXRSxJQUZYO0FBQUEsVUFFaUJDLFFBRmpCLEdBRThCSCxLQUY5QixDQUVpQkcsUUFGakI7O0FBR1AsVUFBTUMsTUFBTUYsS0FBS0csTUFBTCxJQUFlLE9BQWYsR0FBeUIsS0FBekIsR0FBaUMsTUFBN0M7QUFDQSxVQUFNQyxRQUFRO0FBQ1pDLGdCQUFRLEdBREk7QUFFWkMsZUFBTyxhQUZLO0FBR1pDLGlCQUFTO0FBSEcsT0FBZDs7QUFNQSxVQUFNQyxTQUNKO0FBQUMsV0FBRDtBQUFBO0FBQ0UsK0JBREY7QUFFRSxtQ0FGRjtBQUdFLDhDQUhGO0FBSUUsaUJBQU9KO0FBSlQ7QUFNRyxhQUFLSyxVQUFMO0FBTkgsT0FERjs7QUFXQSxVQUFNQyxVQUNKO0FBQUMsV0FBRDtBQUFBLFVBQUssV0FBV1QsV0FBVyxJQUFYLEdBQWtCLElBQWxDO0FBQ0dGO0FBREgsT0FERjs7QUFNQSxXQUFLSCxLQUFMLENBQVcsUUFBWCxFQUFxQixFQUFFRSxZQUFGLEVBQXJCOztBQUVBLGFBQ0U7QUFBQyxXQUFEO0FBQUE7QUFDRSxpQ0FERjtBQUVFLHNCQUFVRSxLQUFLVyxHQUZqQjtBQUdFLDJCQUFpQlYsV0FBVyxJQUFYLEdBQWtCO0FBSHJDO0FBS0dBLG1CQUFXLElBQVgsR0FBa0JPLE1BTHJCO0FBTUdFO0FBTkgsT0FERjtBQVVEOztBQUVEOzs7Ozs7Ozs7Ozs7OztFQTlFaUIsZ0JBQU1FLFM7O0FBNEd6Qjs7Ozs7O0FBNUdNZixJLENBUUdnQixTLEdBQVk7QUFDakJDLFNBQU8seUJBQVdBLEtBREQ7QUFFakJmLFlBQVUsb0JBQU1nQixHQUFOLENBQVVDLFVBRkg7QUFHakJDLFVBQVEsb0JBQU1kLE1BQU4sQ0FBYWEsVUFISjtBQUlqQmhCLFFBQU0seUJBQVdBLElBQVgsQ0FBZ0JnQixVQUpMO0FBS2pCRSxVQUFRLHlCQUFXbEIsSUFBWCxDQUFnQmdCLFVBTFA7QUFNakJmLFlBQVUsb0JBQU1rQixJQUFOLENBQVdIO0FBTkosQzs7Ozs7T0FnQm5CcEIsSyxHQUFRLFVBQUN3QixPQUFELEVBQXNCO0FBQUEsdUNBQVRDLElBQVM7QUFBVEEsVUFBUztBQUFBOztBQUFBLFFBQ3BCckIsSUFEb0IsR0FDWCxPQUFLRixLQURNLENBQ3BCRSxJQURvQjtBQUFBLFFBRXBCVyxHQUZvQixHQUVOWCxJQUZNLENBRXBCVyxHQUZvQjtBQUFBLFFBRWZXLElBRmUsR0FFTnRCLElBRk0sQ0FFZnNCLElBRmU7O0FBRzVCLFFBQU1DLEtBQVFaLEdBQVIsVUFBZ0JXLElBQWhCLE1BQU47QUFDQTFCLDRCQUFNd0IsT0FBTixPQUFrQkcsRUFBbEIsU0FBMkJGLElBQTNCO0FBQ0QsRzs7T0E0RERaLFUsR0FBYSxZQUFNO0FBQUEsaUJBQ2tELE9BQUtYLEtBRHZEO0FBQUEsUUFDVGdCLEtBRFMsVUFDVEEsS0FEUztBQUFBLFFBQ0ZVLFdBREUsVUFDRkEsV0FERTtBQUFBLFFBQ1dDLFVBRFgsVUFDV0EsVUFEWDtBQUFBLFFBQ3VCekIsSUFEdkIsVUFDdUJBLElBRHZCO0FBQUEsUUFDNkJDLFFBRDdCLFVBQzZCQSxRQUQ3QjtBQUFBLFFBQ3VDZ0IsTUFEdkMsVUFDdUNBLE1BRHZDOztBQUVqQixRQUFNUyxRQUFRMUIsS0FBSzJCLFlBQUwsRUFBZDtBQUNBLFdBQ0U7QUFDRSxhQUFPM0IsS0FBS0csTUFBTCxJQUFlLE9BQWYsR0FBeUJILElBQXpCLEdBQWdDYyxLQUR6QztBQUVFLG1CQUFhVSxXQUZmO0FBR0UsY0FBUVAsTUFIVjtBQUlFLGtCQUFZUSxVQUpkO0FBS0UsV0FBS0MsTUFBTWYsR0FMYjtBQU1FLFlBQU1lLEtBTlI7QUFPRSxjQUFRMUIsSUFQVjtBQVFFLGdCQUFVQztBQVJaLE1BREY7QUFZRCxHOzs7a0JBVVlKLEkiLCJmaWxlIjoidm9pZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJ1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFNsYXRlVHlwZXMgZnJvbSAnc2xhdGUtcHJvcC10eXBlcydcbmltcG9ydCBUeXBlcyBmcm9tICdwcm9wLXR5cGVzJ1xuXG5pbXBvcnQgVGV4dCBmcm9tICcuL3RleHQnXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOnZvaWQnKVxuXG4vKipcbiAqIFZvaWQuXG4gKlxuICogQHR5cGUge0NvbXBvbmVudH1cbiAqL1xuXG5jbGFzcyBWb2lkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAvKipcbiAgICogUHJvcGVydHkgdHlwZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgYmxvY2s6IFNsYXRlVHlwZXMuYmxvY2ssXG4gICAgY2hpbGRyZW46IFR5cGVzLmFueS5pc1JlcXVpcmVkLFxuICAgIGVkaXRvcjogVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgbm9kZTogU2xhdGVUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG4gICAgcGFyZW50OiBTbGF0ZVR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICByZWFkT25seTogVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICB9XG5cbiAgLyoqXG4gICAqIERlYnVnLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAcGFyYW0ge01peGVkfSAuLi5hcmdzXG4gICAqL1xuXG4gIGRlYnVnID0gKG1lc3NhZ2UsIC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCB7IG5vZGUgfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7IGtleSwgdHlwZSB9ID0gbm9kZVxuICAgIGNvbnN0IGlkID0gYCR7a2V5fSAoJHt0eXBlfSlgXG4gICAgZGVidWcobWVzc2FnZSwgYCR7aWR9YCwgLi4uYXJncylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIuXG4gICAqXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAqL1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHByb3BzIH0gPSB0aGlzXG4gICAgY29uc3QgeyBjaGlsZHJlbiwgbm9kZSwgcmVhZE9ubHkgfSA9IHByb3BzXG4gICAgY29uc3QgVGFnID0gbm9kZS5vYmplY3QgPT0gJ2Jsb2NrJyA/ICdkaXYnIDogJ3NwYW4nXG4gICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICBoZWlnaHQ6ICcwJyxcbiAgICAgIGNvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgIH1cblxuICAgIGNvbnN0IHNwYWNlciA9IChcbiAgICAgIDxUYWdcbiAgICAgICAgY29udGVudEVkaXRhYmxlXG4gICAgICAgIGRhdGEtc2xhdGUtc3BhY2VyXG4gICAgICAgIHN1cHByZXNzQ29udGVudEVkaXRhYmxlV2FybmluZ1xuICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICA+XG4gICAgICAgIHt0aGlzLnJlbmRlclRleHQoKX1cbiAgICAgIDwvVGFnPlxuICAgIClcblxuICAgIGNvbnN0IGNvbnRlbnQgPSAoXG4gICAgICA8VGFnIGRyYWdnYWJsZT17cmVhZE9ubHkgPyBudWxsIDogdHJ1ZX0+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvVGFnPlxuICAgIClcblxuICAgIHRoaXMuZGVidWcoJ3JlbmRlcicsIHsgcHJvcHMgfSlcblxuICAgIHJldHVybiAoXG4gICAgICA8VGFnXG4gICAgICAgIGRhdGEtc2xhdGUtdm9pZFxuICAgICAgICBkYXRhLWtleT17bm9kZS5rZXl9XG4gICAgICAgIGNvbnRlbnRFZGl0YWJsZT17cmVhZE9ubHkgPyBudWxsIDogZmFsc2V9XG4gICAgICA+XG4gICAgICAgIHtyZWFkT25seSA/IG51bGwgOiBzcGFjZXJ9XG4gICAgICAgIHtjb250ZW50fVxuICAgICAgPC9UYWc+XG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgdm9pZCBub2RlJ3MgdGV4dCBub2RlLCB3aGljaCB3aWxsIGNhdGNoIHRoZSBjdXJzb3Igd2hlbiBpdCB0aGVcbiAgICogdm9pZCBub2RlIGlzIG5hdmlnYXRlZCB0byB3aXRoIHRoZSBhcnJvdyBrZXlzLlxuICAgKlxuICAgKiBIYXZpbmcgdGhpcyB0ZXh0IG5vZGUgdGhlcmUgbWVhbnMgdGhlIGJyb3dzZXIgY29udGludWVzIHRvIG1hbmFnZSB0aGVcbiAgICogc2VsZWN0aW9uIG5hdGl2ZWx5LCBzbyBpdCBrZWVwcyB0cmFjayBvZiB0aGUgcmlnaHQgb2Zmc2V0IHdoZW4gbW92aW5nXG4gICAqIGFjcm9zcyB0aGUgYmxvY2suXG4gICAqXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAqL1xuXG4gIHJlbmRlclRleHQgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBibG9jaywgZGVjb3JhdGlvbnMsIGlzU2VsZWN0ZWQsIG5vZGUsIHJlYWRPbmx5LCBlZGl0b3IgfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCBjaGlsZCA9IG5vZGUuZ2V0Rmlyc3RUZXh0KClcbiAgICByZXR1cm4gKFxuICAgICAgPFRleHRcbiAgICAgICAgYmxvY2s9e25vZGUub2JqZWN0ID09ICdibG9jaycgPyBub2RlIDogYmxvY2t9XG4gICAgICAgIGRlY29yYXRpb25zPXtkZWNvcmF0aW9uc31cbiAgICAgICAgZWRpdG9yPXtlZGl0b3J9XG4gICAgICAgIGlzU2VsZWN0ZWQ9e2lzU2VsZWN0ZWR9XG4gICAgICAgIGtleT17Y2hpbGQua2V5fVxuICAgICAgICBub2RlPXtjaGlsZH1cbiAgICAgICAgcGFyZW50PXtub2RlfVxuICAgICAgICByZWFkT25seT17cmVhZE9ubHl9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtDb21wb25lbnR9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgVm9pZFxuIl19