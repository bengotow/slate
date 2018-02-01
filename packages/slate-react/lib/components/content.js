'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _eventHandlers = require('../constants/event-handlers');

var _eventHandlers2 = _interopRequireDefault(_eventHandlers);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _findDomRange = require('../utils/find-dom-range');

var _findDomRange2 = _interopRequireDefault(_findDomRange);

var _findRange = require('../utils/find-range');

var _findRange2 = _interopRequireDefault(_findRange);

var _scrollToSelection = require('../utils/scroll-to-selection');

var _scrollToSelection2 = _interopRequireDefault(_scrollToSelection);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:content');

/**
 * Content.
 *
 * @type {Component}
 */

var Content = function (_React$Component) {
  _inherits(Content, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Content(props) {
    _classCallCheck(this, Content);

    var _this = _possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, props));

    _this.componentDidMount = function () {
      var editor = _this.props.editor;

      var window = (0, _getWindow2.default)(_this.element);

      window.document.addEventListener('selectionchange', _this.onNativeSelectionChange);

      // COMPAT: Restrict scope of `beforeinput` to mobile.
      if ((_environment.IS_IOS || _environment.IS_ANDROID) && _environment.SUPPORTED_EVENTS.beforeinput) {
        _this.element.addEventListener('beforeinput', _this.onNativeBeforeInput);
      }

      _this.updateSelection();

      if (_this.props.autoFocus) {
        editor.focus();
      }
    };

    _this.componentDidUpdate = function () {
      _this.updateSelection();
    };

    _this.updateSelection = function () {
      var editor = _this.props.editor;
      var value = editor.value;
      var selection = value.selection;
      var isBackward = selection.isBackward;

      var window = (0, _getWindow2.default)(_this.element);
      var native = window.getSelection();
      var rangeCount = native.rangeCount,
          anchorNode = native.anchorNode;

      // If both selections are blurred, do nothing.

      if (!rangeCount && selection.isBlurred) return;

      // If the selection has been blurred, but is still inside the editor in the
      // DOM, blur it manually.
      if (selection.isBlurred) {
        if (!_this.isInEditor(anchorNode)) return;
        native.removeAllRanges();
        _this.element.blur();
        debug('updateSelection', { selection: selection, native: native });
        return;
      }

      // If the selection isn't set, do nothing.
      if (selection.isUnset) return;

      // Otherwise, figure out which DOM nodes should be selected...
      var current = !!rangeCount && native.getRangeAt(0);
      var range = (0, _findDomRange2.default)(selection, window);

      if (!range) {
        _slateDevLogger2.default.error('Unable to find a native DOM range from the current selection.', { selection: selection });
        return;
      }

      var startContainer = range.startContainer,
          startOffset = range.startOffset,
          endContainer = range.endContainer,
          endOffset = range.endOffset;

      // If the new range matches the current selection, there is nothing to fix.
      // COMPAT: The native `Range` object always has it's "start" first and "end"
      // last in the DOM. It has no concept of "backwards/forwards", so we have
      // to check both orientations here. (2017/10/31)

      if (current) {
        if (startContainer == current.startContainer && startOffset == current.startOffset && endContainer == current.endContainer && endOffset == current.endOffset || startContainer == current.endContainer && startOffset == current.endOffset && endContainer == current.startContainer && endOffset == current.startOffset) {
          return;
        }
      }

      // Otherwise, set the `isUpdatingSelection` flag and update the selection.
      _this.tmp.isUpdatingSelection = true;
      native.removeAllRanges();

      // COMPAT: IE 11 does not support Selection.extend
      if (native.extend) {
        // COMPAT: Since the DOM range has no concept of backwards/forwards
        // we need to check and do the right thing here.
        if (isBackward) {
          native.collapse(range.endContainer, range.endOffset);
          native.extend(range.startContainer, range.startOffset);
        } else {
          native.collapse(range.startContainer, range.startOffset);
          native.extend(range.endContainer, range.endOffset);
        }
      } else {
        // COMPAT: IE 11 does not support Selection.extend, fallback to addRange
        native.addRange(range);
      }

      // Scroll to the selection, in case it's out of view.
      (0, _scrollToSelection2.default)(native);

      // Then unset the `isUpdatingSelection` flag after a delay.
      setTimeout(function () {
        // COMPAT: In Firefox, it's not enough to create a range, you also need to
        // focus the contenteditable element too. (2016/11/16)
        if (_environment.IS_FIREFOX && _this.element) _this.element.focus();
        _this.tmp.isUpdatingSelection = false;
      });

      debug('updateSelection', { selection: selection, native: native });
    };

    _this.ref = function (element) {
      _this.element = element;
    };

    _this.isInEditor = function (target) {
      var element = _this.element;
      // COMPAT: Text nodes don't have `isContentEditable` property. So, when
      // `target` is a text node use its parent node for check.

      var el = target.nodeType === 3 ? target.parentNode : target;
      return el.isContentEditable && (el === element || el.closest('[data-slate-editor]') === element);
    };

    _this.onNativeBeforeInput = function (event) {
      if (_this.props.readOnly) return;
      if (!_this.isInEditor(event.target)) return;

      var _event$getTargetRange = event.getTargetRanges(),
          _event$getTargetRange2 = _slicedToArray(_event$getTargetRange, 1),
          targetRange = _event$getTargetRange2[0];

      if (!targetRange) return;

      var editor = _this.props.editor;


      switch (event.inputType) {
        case 'deleteContentBackward':
          {
            event.preventDefault();

            var range = (0, _findRange2.default)(targetRange, editor.value);
            editor.change(function (change) {
              return change.deleteAtRange(range);
            });
            break;
          }

        case 'insertLineBreak': // intentional fallthru
        case 'insertParagraph':
          {
            event.preventDefault();
            var _range = (0, _findRange2.default)(targetRange, editor.value);

            editor.change(function (change) {
              if (change.value.isInVoid) {
                change.collapseToStartOfNextText();
              } else {
                change.splitBlockAtRange(_range);
              }
            });
            break;
          }

        case 'insertReplacementText': // intentional fallthru
        case 'insertText':
          {
            // `data` should have the text for the `insertText` input type and
            // `dataTransfer` should have the text for the `insertReplacementText`
            // input type, but Safari uses `insertText` for spell check replacements
            // and sets `data` to `null`.
            var text = event.data == null ? event.dataTransfer.getData('text/plain') : event.data;

            if (text == null) return;

            event.preventDefault();

            var value = editor.value;
            var selection = value.selection;

            var _range2 = (0, _findRange2.default)(targetRange, value);

            editor.change(function (change) {
              change.insertTextAtRange(_range2, text, selection.marks);

              // If the text was successfully inserted, and the selection had marks
              // on it, unset the selection's marks.
              if (selection.marks && value.document != change.value.document) {
                change.select({ marks: null });
              }
            });

            break;
          }
      }
    };

    _this.onNativeSelectionChange = (0, _lodash2.default)(function (event) {
      if (_this.props.readOnly) return;

      var window = (0, _getWindow2.default)(event.target);
      var activeElement = window.document.activeElement;

      if (activeElement !== _this.element) return;

      _this.props.onSelect(event);
    }, 100);

    _this.renderNode = function (child, isSelected) {
      var _this$props = _this.props,
          editor = _this$props.editor,
          readOnly = _this$props.readOnly;
      var value = editor.value;
      var document = value.document,
          decorations = value.decorations;
      var stack = editor.stack;

      var decs = document.getDecorations(stack);
      if (decorations) decs = decorations.concat(decs);
      return _react2.default.createElement(_node2.default, {
        block: null,
        editor: editor,
        decorations: decs,
        isSelected: isSelected,
        key: child.key,
        node: child,
        parent: document,
        readOnly: readOnly
      });
    };

    _this.tmp = {};
    _this.tmp.key = 0;
    _this.tmp.isUpdatingSelection = false;

    _eventHandlers2.default.forEach(function (handler) {
      _this[handler] = function (event) {
        _this.onEvent(handler, event);
      };
    });
    return _this;
  }

  /**
   * When the editor first mounts in the DOM we need to:
   *
   *   - Add native DOM event listeners.
   *   - Update the selection, in case it starts focused.
   *   - Focus the editor if `autoFocus` is set.
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  _createClass(Content, [{
    key: 'componentWillUnmount',


    /**
     * When unmounting, remove DOM event listeners.
     */

    value: function componentWillUnmount() {
      var window = (0, _getWindow2.default)(this.element);

      if (window) {
        window.document.removeEventListener('selectionchange', this.onNativeSelectionChange);
      }

      // COMPAT: Restrict scope of `beforeinput` to mobile.
      if ((_environment.IS_IOS || _environment.IS_ANDROID) && _environment.SUPPORTED_EVENTS.beforeinput) {
        this.element.removeEventListener('beforeinput', this.onNativeBeforeInput);
      }
    }

    /**
     * On update, update the selection.
     */

    /**
     * Update the native DOM selection to reflect the internal model.
     */

    /**
     * The React ref method to set the root content element locally.
     *
     * @param {Element} element
     */

    /**
     * Check if an event `target` is fired from within the contenteditable
     * element. This should be false for edits happening in non-contenteditable
     * children, such as void nodes and other nested Slate editors.
     *
     * @param {Element} target
     * @return {Boolean}
     */

  }, {
    key: 'onEvent',


    /**
     * On `event` with `handler`.
     *
     * @param {String} handler
     * @param {Event} event
     */

    value: function onEvent(handler, event) {
      debug('onEvent', handler);

      // COMPAT: Composition events can change the DOM out of under React, so we
      // increment this key to ensure that a full re-render happens. (2017/10/16)
      if (handler == 'onCompositionEnd') {
        this.tmp.key++;
      }

      // Ignore `onBlur`, `onFocus` and `onSelect` events generated
      // programmatically while updating selection.
      if (this.tmp.isUpdatingSelection && (handler == 'onSelect' || handler == 'onBlur' || handler == 'onFocus')) {
        return;
      }

      // COMPAT: There are situations where a select event will fire with a new
      // native selection that resolves to the same internal position. In those
      // cases we don't need to trigger any changes, since our internal model is
      // already up to date, but we do want to update the native selection again
      // to make sure it is in sync. (2017/10/16)
      if (handler == 'onSelect') {
        var editor = this.props.editor;
        var value = editor.value;
        var selection = value.selection;

        var window = (0, _getWindow2.default)(event.target);
        var native = window.getSelection();
        var range = (0, _findRange2.default)(native, value);

        if (range && range.equals(selection)) {
          this.updateSelection();
          return;
        }
      }

      // Don't handle drag events coming from embedded editors.
      if (handler == 'onDragEnd' || handler == 'onDragEnter' || handler == 'onDragExit' || handler == 'onDragLeave' || handler == 'onDragOver' || handler == 'onDragStart') {
        var target = event.target;

        var targetEditorNode = target.closest('[data-slate-editor]');
        if (targetEditorNode !== this.element) return;
      }

      // Some events require being in editable in the editor, so if the event
      // target isn't, ignore them.
      if (handler == 'onBeforeInput' || handler == 'onBlur' || handler == 'onCompositionEnd' || handler == 'onCompositionStart' || handler == 'onCopy' || handler == 'onCut' || handler == 'onFocus' || handler == 'onInput' || handler == 'onKeyDown' || handler == 'onKeyUp' || handler == 'onPaste' || handler == 'onSelect') {
        if (!this.isInEditor(event.target)) return;
      }

      this.props[handler](event);
    }

    /**
     * On a native `beforeinput` event, use the additional range information
     * provided by the event to manipulate text exactly as the browser would.
     *
     * This is currently only used on iOS and Android.
     *
     * @param {InputEvent} event
     */

    /**
     * On native `selectionchange` event, trigger the `onSelect` handler. This is
     * needed to account for React's `onSelect` being non-standard and not firing
     * until after a selection has been released. This causes issues in situations
     * where another change happens while a selection is being made.
     *
     * @param {Event} event
     */

  }, {
    key: 'render',


    /**
     * Render the editor content.
     *
     * @return {Element}
     */

    value: function render() {
      var _this2 = this;

      var props = this.props;
      var className = props.className,
          readOnly = props.readOnly,
          editor = props.editor,
          tabIndex = props.tabIndex,
          role = props.role,
          tagName = props.tagName;
      var value = editor.value;

      var Container = tagName;
      var document = value.document,
          selection = value.selection;

      var indexes = document.getSelectionIndexes(selection, selection.isFocused);
      var children = document.nodes.toArray().map(function (child, i) {
        var isSelected = !!indexes && indexes.start <= i && i < indexes.end;
        return _this2.renderNode(child, isSelected);
      });

      var handlers = _eventHandlers2.default.reduce(function (obj, handler) {
        obj[handler] = _this2[handler];
        return obj;
      }, {});

      var style = _extends({
        // Prevent the default outline styles.
        outline: 'none',
        // Preserve adjacent whitespace and new lines.
        whiteSpace: 'pre-wrap',
        // Allow words to break if they are too long.
        wordWrap: 'break-word'
      }, readOnly ? {} : { WebkitUserModify: 'read-write-plaintext-only' }, props.style);

      // COMPAT: In Firefox, spellchecking can remove entire wrapping elements
      // including inline ones like `<a>`, which is jarring for the user but also
      // causes the DOM to get into an irreconcilable value. (2016/09/01)
      var spellCheck = _environment.IS_FIREFOX ? false : props.spellCheck;

      debug('render', { props: props });

      return _react2.default.createElement(
        Container,
        _extends({}, handlers, {
          'data-slate-editor': true,
          key: this.tmp.key,
          ref: this.ref,
          'data-key': document.key,
          contentEditable: readOnly ? null : true,
          suppressContentEditableWarning: true,
          className: className,
          onBlur: this.onBlur,
          onFocus: this.onFocus,
          onCompositionEnd: this.onCompositionEnd,
          onCompositionStart: this.onCompositionStart,
          onCopy: this.onCopy,
          onCut: this.onCut,
          onDragEnd: this.onDragEnd,
          onDragOver: this.onDragOver,
          onDragStart: this.onDragStart,
          onDrop: this.onDrop,
          onInput: this.onInput,
          onKeyDown: this.onKeyDown,
          onKeyUp: this.onKeyUp,
          onPaste: this.onPaste,
          onSelect: this.onSelect,
          autoCorrect: props.autoCorrect ? 'on' : 'off',
          spellCheck: spellCheck,
          style: style,
          role: readOnly ? null : role || 'textbox',
          tabIndex: tabIndex
          // COMPAT: The Grammarly Chrome extension works by changing the DOM out
          // from under `contenteditable` elements, which leads to weird behaviors
          // so we have to disable it like this. (2017/04/24)
          , 'data-gramm': false
        }),
        children,
        this.props.children
      );
    }

    /**
     * Render a `child` node of the document.
     *
     * @param {Node} child
     * @param {Boolean} isSelected
     * @return {Element}
     */

  }]);

  return Content;
}(_react2.default.Component);

/**
 * Mix in handler prop types.
 */

Content.propTypes = {
  autoCorrect: _propTypes2.default.bool.isRequired,
  autoFocus: _propTypes2.default.bool.isRequired,
  children: _propTypes2.default.any.isRequired,
  className: _propTypes2.default.string,
  editor: _propTypes2.default.object.isRequired,
  readOnly: _propTypes2.default.bool.isRequired,
  role: _propTypes2.default.string,
  spellCheck: _propTypes2.default.bool.isRequired,
  style: _propTypes2.default.object,
  tabIndex: _propTypes2.default.number,
  tagName: _propTypes2.default.string
};
Content.defaultProps = {
  style: {},
  tagName: 'div'
};
_eventHandlers2.default.forEach(function (handler) {
  Content.propTypes[handler] = _propTypes2.default.func.isRequired;
});

/**
 * Export.
 *
 * @type {Component}
 */

exports.default = Content;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2NvbnRlbnQuanMiXSwibmFtZXMiOlsiZGVidWciLCJDb250ZW50IiwicHJvcHMiLCJjb21wb25lbnREaWRNb3VudCIsImVkaXRvciIsIndpbmRvdyIsImVsZW1lbnQiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbk5hdGl2ZVNlbGVjdGlvbkNoYW5nZSIsImJlZm9yZWlucHV0Iiwib25OYXRpdmVCZWZvcmVJbnB1dCIsInVwZGF0ZVNlbGVjdGlvbiIsImF1dG9Gb2N1cyIsImZvY3VzIiwiY29tcG9uZW50RGlkVXBkYXRlIiwidmFsdWUiLCJzZWxlY3Rpb24iLCJpc0JhY2t3YXJkIiwibmF0aXZlIiwiZ2V0U2VsZWN0aW9uIiwicmFuZ2VDb3VudCIsImFuY2hvck5vZGUiLCJpc0JsdXJyZWQiLCJpc0luRWRpdG9yIiwicmVtb3ZlQWxsUmFuZ2VzIiwiYmx1ciIsImlzVW5zZXQiLCJjdXJyZW50IiwiZ2V0UmFuZ2VBdCIsInJhbmdlIiwiZXJyb3IiLCJzdGFydENvbnRhaW5lciIsInN0YXJ0T2Zmc2V0IiwiZW5kQ29udGFpbmVyIiwiZW5kT2Zmc2V0IiwidG1wIiwiaXNVcGRhdGluZ1NlbGVjdGlvbiIsImV4dGVuZCIsImNvbGxhcHNlIiwiYWRkUmFuZ2UiLCJzZXRUaW1lb3V0IiwicmVmIiwidGFyZ2V0IiwiZWwiLCJub2RlVHlwZSIsInBhcmVudE5vZGUiLCJpc0NvbnRlbnRFZGl0YWJsZSIsImNsb3Nlc3QiLCJldmVudCIsInJlYWRPbmx5IiwiZ2V0VGFyZ2V0UmFuZ2VzIiwidGFyZ2V0UmFuZ2UiLCJpbnB1dFR5cGUiLCJwcmV2ZW50RGVmYXVsdCIsImNoYW5nZSIsImRlbGV0ZUF0UmFuZ2UiLCJpc0luVm9pZCIsImNvbGxhcHNlVG9TdGFydE9mTmV4dFRleHQiLCJzcGxpdEJsb2NrQXRSYW5nZSIsInRleHQiLCJkYXRhIiwiZGF0YVRyYW5zZmVyIiwiZ2V0RGF0YSIsImluc2VydFRleHRBdFJhbmdlIiwibWFya3MiLCJzZWxlY3QiLCJhY3RpdmVFbGVtZW50Iiwib25TZWxlY3QiLCJyZW5kZXJOb2RlIiwiY2hpbGQiLCJpc1NlbGVjdGVkIiwiZGVjb3JhdGlvbnMiLCJzdGFjayIsImRlY3MiLCJnZXREZWNvcmF0aW9ucyIsImNvbmNhdCIsImtleSIsImZvckVhY2giLCJoYW5kbGVyIiwib25FdmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJlcXVhbHMiLCJ0YXJnZXRFZGl0b3JOb2RlIiwiY2xhc3NOYW1lIiwidGFiSW5kZXgiLCJyb2xlIiwidGFnTmFtZSIsIkNvbnRhaW5lciIsImluZGV4ZXMiLCJnZXRTZWxlY3Rpb25JbmRleGVzIiwiaXNGb2N1c2VkIiwiY2hpbGRyZW4iLCJub2RlcyIsInRvQXJyYXkiLCJtYXAiLCJpIiwic3RhcnQiLCJlbmQiLCJoYW5kbGVycyIsInJlZHVjZSIsIm9iaiIsInN0eWxlIiwib3V0bGluZSIsIndoaXRlU3BhY2UiLCJ3b3JkV3JhcCIsIldlYmtpdFVzZXJNb2RpZnkiLCJzcGVsbENoZWNrIiwib25CbHVyIiwib25Gb2N1cyIsIm9uQ29tcG9zaXRpb25FbmQiLCJvbkNvbXBvc2l0aW9uU3RhcnQiLCJvbkNvcHkiLCJvbkN1dCIsIm9uRHJhZ0VuZCIsIm9uRHJhZ092ZXIiLCJvbkRyYWdTdGFydCIsIm9uRHJvcCIsIm9uSW5wdXQiLCJvbktleURvd24iLCJvbktleVVwIiwib25QYXN0ZSIsImF1dG9Db3JyZWN0IiwiQ29tcG9uZW50IiwicHJvcFR5cGVzIiwiYm9vbCIsImlzUmVxdWlyZWQiLCJhbnkiLCJzdHJpbmciLCJvYmplY3QiLCJudW1iZXIiLCJkZWZhdWx0UHJvcHMiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFPQTs7Ozs7O0FBTUEsSUFBTUEsUUFB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O0FBNEJFLG9CQUFVRDtBQUNWO0FBQ0E7QUFDQTtBQS9CRixZQWdDRSxjQUFZO0FBaENkO0FBa0NHTyxnQkFsQ0g7QUFtQ0csYUFBSzFGLEtBQUwsQ0FBVzBGO0FBbkNkLE9BREY7QUF1Q0Q7O0FBRUQ7Ozs7Ozs7Ozs7O0VBbmZvQixnQkFBTStCLFM7O0FBa2hCNUI7Ozs7QUFsaEJNMUgsTyxDQVFHMkgsUyxHQUFZO0FBQ2pCRixlQUFhLG9CQUFNRyxJQUFOLENBQVdDLFVBRFA7QUFFakJqSCxhQUFXLG9CQUFNZ0gsSUFBTixDQUFXQyxVQUZMO0FBR2pCbEMsWUFBVSxvQkFBTW1DLEdBQU4sQ0FBVUQsVUFISDtBQUlqQjFDLGFBQVcsb0JBQU00QyxNQUpBO0FBS2pCNUgsVUFBUSxvQkFBTTZILE1BQU4sQ0FBYUgsVUFMSjtBQU1qQjVFLFlBQVUsb0JBQU0yRSxJQUFOLENBQVdDLFVBTko7QUFPakJ4QyxRQUFNLG9CQUFNMEMsTUFQSztBQVFqQnJCLGNBQVksb0JBQU1rQixJQUFOLENBQVdDLFVBUk47QUFTakJ4QixTQUFPLG9CQUFNMkIsTUFUSTtBQVVqQjVDLFlBQVUsb0JBQU02QyxNQVZDO0FBV2pCM0MsV0FBUyxvQkFBTXlDO0FBWEUsQztBQVJmL0gsTyxDQTRCR2tJLFksR0FBZTtBQUNwQjdCLFNBQU8sRUFEYTtBQUVwQmYsV0FBUztBQUZXLEM7QUEwZnhCLHdCQUFlVCxPQUFmLENBQXVCLFVBQUNDLE9BQUQsRUFBYTtBQUNsQzlFLFVBQVEySCxTQUFSLENBQWtCN0MsT0FBbEIsSUFBNkIsb0JBQU1xRCxJQUFOLENBQVdOLFVBQXhDO0FBQ0QsQ0FGRDs7QUFJQTs7Ozs7O2tCQU1lN0gsTyIsImZpbGUiOiJjb250ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgVHlwZXMgZnJvbSAncHJvcC10eXBlcydcbmltcG9ydCBnZXRXaW5kb3cgZnJvbSAnZ2V0LXdpbmRvdydcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB0aHJvdHRsZSBmcm9tICdsb2Rhc2gudGhyb3R0bGUnXG5cbmltcG9ydCBFVkVOVF9IQU5ETEVSUyBmcm9tICcuLi9jb25zdGFudHMvZXZlbnQtaGFuZGxlcnMnXG5pbXBvcnQgTm9kZSBmcm9tICcuL25vZGUnXG5pbXBvcnQgZmluZERPTVJhbmdlIGZyb20gJy4uL3V0aWxzL2ZpbmQtZG9tLXJhbmdlJ1xuaW1wb3J0IGZpbmRSYW5nZSBmcm9tICcuLi91dGlscy9maW5kLXJhbmdlJ1xuaW1wb3J0IHNjcm9sbFRvU2VsZWN0aW9uIGZyb20gJy4uL3V0aWxzL3Njcm9sbC10by1zZWxlY3Rpb24nXG5pbXBvcnQge1xuICBJU19GSVJFRk9YLFxuICBJU19JT1MsXG4gIElTX0FORFJPSUQsXG4gIFNVUFBPUlRFRF9FVkVOVFNcbn0gZnJvbSAnLi4vY29uc3RhbnRzL2Vudmlyb25tZW50J1xuXG4vKipcbiAqIERlYnVnLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5jb25zdCBkZWJ1ZyA9IERlYnVnKCdzbGF0ZTpjb250ZW50JylcblxuLyoqXG4gKiBDb250ZW50LlxuICpcbiAqIEB0eXBlIHtDb21wb25lbnR9XG4gKi9cblxuY2xhc3MgQ29udGVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgLyoqXG4gICAqIFByb3BlcnR5IHR5cGVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGF1dG9Db3JyZWN0OiBUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgYXV0b0ZvY3VzOiBUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgY2hpbGRyZW46IFR5cGVzLmFueS5pc1JlcXVpcmVkLFxuICAgIGNsYXNzTmFtZTogVHlwZXMuc3RyaW5nLFxuICAgIGVkaXRvcjogVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgcmVhZE9ubHk6IFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICByb2xlOiBUeXBlcy5zdHJpbmcsXG4gICAgc3BlbGxDaGVjazogVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHN0eWxlOiBUeXBlcy5vYmplY3QsXG4gICAgdGFiSW5kZXg6IFR5cGVzLm51bWJlcixcbiAgICB0YWdOYW1lOiBUeXBlcy5zdHJpbmcsXG4gIH1cblxuICAvKipcbiAgICogRGVmYXVsdCBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIHN0eWxlOiB7fSxcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG4gICAqL1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy50bXAgPSB7fVxuICAgIHRoaXMudG1wLmtleSA9IDBcbiAgICB0aGlzLnRtcC5pc1VwZGF0aW5nU2VsZWN0aW9uID0gZmFsc2VcblxuICAgIEVWRU5UX0hBTkRMRVJTLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgIHRoaXNbaGFuZGxlcl0gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5vbkV2ZW50KGhhbmRsZXIsIGV2ZW50KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgZWRpdG9yIGZpcnN0IG1vdW50cyBpbiB0aGUgRE9NIHdlIG5lZWQgdG86XG4gICAqXG4gICAqICAgLSBBZGQgbmF0aXZlIERPTSBldmVudCBsaXN0ZW5lcnMuXG4gICAqICAgLSBVcGRhdGUgdGhlIHNlbGVjdGlvbiwgaW4gY2FzZSBpdCBzdGFydHMgZm9jdXNlZC5cbiAgICogICAtIEZvY3VzIHRoZSBlZGl0b3IgaWYgYGF1dG9Gb2N1c2AgaXMgc2V0LlxuICAgKi9cblxuICBjb21wb25lbnREaWRNb3VudCA9ICgpID0+IHtcbiAgICBjb25zdCB7IGVkaXRvciB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdyh0aGlzLmVsZW1lbnQpXG5cbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0aW9uY2hhbmdlJywgdGhpcy5vbk5hdGl2ZVNlbGVjdGlvbkNoYW5nZSlcblxuICAgIC8vIENPTVBBVDogUmVzdHJpY3Qgc2NvcGUgb2YgYGJlZm9yZWlucHV0YCB0byBtb2JpbGUuXG4gICAgaWYgKChJU19JT1MgfHwgSVNfQU5EUk9JRCkgJiYgU1VQUE9SVEVEX0VWRU5UUy5iZWZvcmVpbnB1dCkge1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZWlucHV0JywgdGhpcy5vbk5hdGl2ZUJlZm9yZUlucHV0KVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uKClcblxuICAgIGlmICh0aGlzLnByb3BzLmF1dG9Gb2N1cykge1xuICAgICAgZWRpdG9yLmZvY3VzKClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hlbiB1bm1vdW50aW5nLCByZW1vdmUgRE9NIGV2ZW50IGxpc3RlbmVycy5cbiAgICovXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KHRoaXMuZWxlbWVudClcblxuICAgIGlmICh3aW5kb3cpIHtcbiAgICAgIHdpbmRvdy5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWxlY3Rpb25jaGFuZ2UnLCB0aGlzLm9uTmF0aXZlU2VsZWN0aW9uQ2hhbmdlKVxuICAgIH1cblxuICAgIC8vIENPTVBBVDogUmVzdHJpY3Qgc2NvcGUgb2YgYGJlZm9yZWlucHV0YCB0byBtb2JpbGUuXG4gICAgaWYgKChJU19JT1MgfHwgSVNfQU5EUk9JRCkgJiYgU1VQUE9SVEVEX0VWRU5UUy5iZWZvcmVpbnB1dCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JlZm9yZWlucHV0JywgdGhpcy5vbk5hdGl2ZUJlZm9yZUlucHV0KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiB1cGRhdGUsIHVwZGF0ZSB0aGUgc2VsZWN0aW9uLlxuICAgKi9cblxuICBjb21wb25lbnREaWRVcGRhdGUgPSAoKSA9PiB7XG4gICAgdGhpcy51cGRhdGVTZWxlY3Rpb24oKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgbmF0aXZlIERPTSBzZWxlY3Rpb24gdG8gcmVmbGVjdCB0aGUgaW50ZXJuYWwgbW9kZWwuXG4gICAqL1xuXG4gIHVwZGF0ZVNlbGVjdGlvbiA9ICgpID0+IHtcbiAgICBjb25zdCB7IGVkaXRvciB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGVkaXRvclxuICAgIGNvbnN0IHsgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgIGNvbnN0IHsgaXNCYWNrd2FyZCB9ID0gc2VsZWN0aW9uXG4gICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KHRoaXMuZWxlbWVudClcbiAgICBjb25zdCBuYXRpdmUgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCB7IHJhbmdlQ291bnQsIGFuY2hvck5vZGUgfSA9IG5hdGl2ZVxuXG4gICAgLy8gSWYgYm90aCBzZWxlY3Rpb25zIGFyZSBibHVycmVkLCBkbyBub3RoaW5nLlxuICAgIGlmICghcmFuZ2VDb3VudCAmJiBzZWxlY3Rpb24uaXNCbHVycmVkKSByZXR1cm5cblxuICAgIC8vIElmIHRoZSBzZWxlY3Rpb24gaGFzIGJlZW4gYmx1cnJlZCwgYnV0IGlzIHN0aWxsIGluc2lkZSB0aGUgZWRpdG9yIGluIHRoZVxuICAgIC8vIERPTSwgYmx1ciBpdCBtYW51YWxseS5cbiAgICBpZiAoc2VsZWN0aW9uLmlzQmx1cnJlZCkge1xuICAgICAgaWYgKCF0aGlzLmlzSW5FZGl0b3IoYW5jaG9yTm9kZSkpIHJldHVyblxuICAgICAgbmF0aXZlLnJlbW92ZUFsbFJhbmdlcygpXG4gICAgICB0aGlzLmVsZW1lbnQuYmx1cigpXG4gICAgICBkZWJ1ZygndXBkYXRlU2VsZWN0aW9uJywgeyBzZWxlY3Rpb24sIG5hdGl2ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHNlbGVjdGlvbiBpc24ndCBzZXQsIGRvIG5vdGhpbmcuXG4gICAgaWYgKHNlbGVjdGlvbi5pc1Vuc2V0KSByZXR1cm5cblxuICAgIC8vIE90aGVyd2lzZSwgZmlndXJlIG91dCB3aGljaCBET00gbm9kZXMgc2hvdWxkIGJlIHNlbGVjdGVkLi4uXG4gICAgY29uc3QgY3VycmVudCA9ICEhcmFuZ2VDb3VudCAmJiBuYXRpdmUuZ2V0UmFuZ2VBdCgwKVxuICAgIGNvbnN0IHJhbmdlID0gZmluZERPTVJhbmdlKHNlbGVjdGlvbiwgd2luZG93KVxuXG4gICAgaWYgKCFyYW5nZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdVbmFibGUgdG8gZmluZCBhIG5hdGl2ZSBET00gcmFuZ2UgZnJvbSB0aGUgY3VycmVudCBzZWxlY3Rpb24uJywgeyBzZWxlY3Rpb24gfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIHN0YXJ0Q29udGFpbmVyLFxuICAgICAgc3RhcnRPZmZzZXQsXG4gICAgICBlbmRDb250YWluZXIsXG4gICAgICBlbmRPZmZzZXQsXG4gICAgfSA9IHJhbmdlXG5cbiAgICAvLyBJZiB0aGUgbmV3IHJhbmdlIG1hdGNoZXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLCB0aGVyZSBpcyBub3RoaW5nIHRvIGZpeC5cbiAgICAvLyBDT01QQVQ6IFRoZSBuYXRpdmUgYFJhbmdlYCBvYmplY3QgYWx3YXlzIGhhcyBpdCdzIFwic3RhcnRcIiBmaXJzdCBhbmQgXCJlbmRcIlxuICAgIC8vIGxhc3QgaW4gdGhlIERPTS4gSXQgaGFzIG5vIGNvbmNlcHQgb2YgXCJiYWNrd2FyZHMvZm9yd2FyZHNcIiwgc28gd2UgaGF2ZVxuICAgIC8vIHRvIGNoZWNrIGJvdGggb3JpZW50YXRpb25zIGhlcmUuICgyMDE3LzEwLzMxKVxuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIChcbiAgICAgICAgICBzdGFydENvbnRhaW5lciA9PSBjdXJyZW50LnN0YXJ0Q29udGFpbmVyICYmXG4gICAgICAgICAgc3RhcnRPZmZzZXQgPT0gY3VycmVudC5zdGFydE9mZnNldCAmJlxuICAgICAgICAgIGVuZENvbnRhaW5lciA9PSBjdXJyZW50LmVuZENvbnRhaW5lciAmJlxuICAgICAgICAgIGVuZE9mZnNldCA9PSBjdXJyZW50LmVuZE9mZnNldFxuICAgICAgICApIHx8XG4gICAgICAgIChcbiAgICAgICAgICBzdGFydENvbnRhaW5lciA9PSBjdXJyZW50LmVuZENvbnRhaW5lciAmJlxuICAgICAgICAgIHN0YXJ0T2Zmc2V0ID09IGN1cnJlbnQuZW5kT2Zmc2V0ICYmXG4gICAgICAgICAgZW5kQ29udGFpbmVyID09IGN1cnJlbnQuc3RhcnRDb250YWluZXIgJiZcbiAgICAgICAgICBlbmRPZmZzZXQgPT0gY3VycmVudC5zdGFydE9mZnNldFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBzZXQgdGhlIGBpc1VwZGF0aW5nU2VsZWN0aW9uYCBmbGFnIGFuZCB1cGRhdGUgdGhlIHNlbGVjdGlvbi5cbiAgICB0aGlzLnRtcC5pc1VwZGF0aW5nU2VsZWN0aW9uID0gdHJ1ZVxuICAgIG5hdGl2ZS5yZW1vdmVBbGxSYW5nZXMoKVxuXG4gICAgLy8gQ09NUEFUOiBJRSAxMSBkb2VzIG5vdCBzdXBwb3J0IFNlbGVjdGlvbi5leHRlbmRcbiAgICBpZiAobmF0aXZlLmV4dGVuZCkge1xuICAgICAgLy8gQ09NUEFUOiBTaW5jZSB0aGUgRE9NIHJhbmdlIGhhcyBubyBjb25jZXB0IG9mIGJhY2t3YXJkcy9mb3J3YXJkc1xuICAgICAgLy8gd2UgbmVlZCB0byBjaGVjayBhbmQgZG8gdGhlIHJpZ2h0IHRoaW5nIGhlcmUuXG4gICAgICBpZiAoaXNCYWNrd2FyZCkge1xuICAgICAgICBuYXRpdmUuY29sbGFwc2UocmFuZ2UuZW5kQ29udGFpbmVyLCByYW5nZS5lbmRPZmZzZXQpXG4gICAgICAgIG5hdGl2ZS5leHRlbmQocmFuZ2Uuc3RhcnRDb250YWluZXIsIHJhbmdlLnN0YXJ0T2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmF0aXZlLmNvbGxhcHNlKHJhbmdlLnN0YXJ0Q29udGFpbmVyLCByYW5nZS5zdGFydE9mZnNldClcbiAgICAgICAgbmF0aXZlLmV4dGVuZChyYW5nZS5lbmRDb250YWluZXIsIHJhbmdlLmVuZE9mZnNldClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ09NUEFUOiBJRSAxMSBkb2VzIG5vdCBzdXBwb3J0IFNlbGVjdGlvbi5leHRlbmQsIGZhbGxiYWNrIHRvIGFkZFJhbmdlXG4gICAgICBuYXRpdmUuYWRkUmFuZ2UocmFuZ2UpXG4gICAgfVxuXG4gICAgLy8gU2Nyb2xsIHRvIHRoZSBzZWxlY3Rpb24sIGluIGNhc2UgaXQncyBvdXQgb2Ygdmlldy5cbiAgICBzY3JvbGxUb1NlbGVjdGlvbihuYXRpdmUpXG5cbiAgICAvLyBUaGVuIHVuc2V0IHRoZSBgaXNVcGRhdGluZ1NlbGVjdGlvbmAgZmxhZyBhZnRlciBhIGRlbGF5LlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgLy8gQ09NUEFUOiBJbiBGaXJlZm94LCBpdCdzIG5vdCBlbm91Z2ggdG8gY3JlYXRlIGEgcmFuZ2UsIHlvdSBhbHNvIG5lZWQgdG9cbiAgICAgIC8vIGZvY3VzIHRoZSBjb250ZW50ZWRpdGFibGUgZWxlbWVudCB0b28uICgyMDE2LzExLzE2KVxuICAgICAgaWYgKElTX0ZJUkVGT1ggJiYgdGhpcy5lbGVtZW50KSB0aGlzLmVsZW1lbnQuZm9jdXMoKVxuICAgICAgdGhpcy50bXAuaXNVcGRhdGluZ1NlbGVjdGlvbiA9IGZhbHNlXG4gICAgfSlcblxuICAgIGRlYnVnKCd1cGRhdGVTZWxlY3Rpb24nLCB7IHNlbGVjdGlvbiwgbmF0aXZlIH0pXG4gIH1cblxuICAvKipcbiAgICogVGhlIFJlYWN0IHJlZiBtZXRob2QgdG8gc2V0IHRoZSByb290IGNvbnRlbnQgZWxlbWVudCBsb2NhbGx5LlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAgICovXG5cbiAgcmVmID0gKGVsZW1lbnQpID0+IHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYW4gZXZlbnQgYHRhcmdldGAgaXMgZmlyZWQgZnJvbSB3aXRoaW4gdGhlIGNvbnRlbnRlZGl0YWJsZVxuICAgKiBlbGVtZW50LiBUaGlzIHNob3VsZCBiZSBmYWxzZSBmb3IgZWRpdHMgaGFwcGVuaW5nIGluIG5vbi1jb250ZW50ZWRpdGFibGVcbiAgICogY2hpbGRyZW4sIHN1Y2ggYXMgdm9pZCBub2RlcyBhbmQgb3RoZXIgbmVzdGVkIFNsYXRlIGVkaXRvcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGlzSW5FZGl0b3IgPSAodGFyZ2V0KSA9PiB7XG4gICAgY29uc3QgeyBlbGVtZW50IH0gPSB0aGlzXG4gICAgLy8gQ09NUEFUOiBUZXh0IG5vZGVzIGRvbid0IGhhdmUgYGlzQ29udGVudEVkaXRhYmxlYCBwcm9wZXJ0eS4gU28sIHdoZW5cbiAgICAvLyBgdGFyZ2V0YCBpcyBhIHRleHQgbm9kZSB1c2UgaXRzIHBhcmVudCBub2RlIGZvciBjaGVjay5cbiAgICBjb25zdCBlbCA9IHRhcmdldC5ub2RlVHlwZSA9PT0gMyA/IHRhcmdldC5wYXJlbnROb2RlIDogdGFyZ2V0XG4gICAgcmV0dXJuIChcbiAgICAgIChlbC5pc0NvbnRlbnRFZGl0YWJsZSkgJiZcbiAgICAgIChlbCA9PT0gZWxlbWVudCB8fCBlbC5jbG9zZXN0KCdbZGF0YS1zbGF0ZS1lZGl0b3JdJykgPT09IGVsZW1lbnQpXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGBldmVudGAgd2l0aCBgaGFuZGxlcmAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqL1xuXG4gIG9uRXZlbnQoaGFuZGxlciwgZXZlbnQpIHtcbiAgICBkZWJ1Zygnb25FdmVudCcsIGhhbmRsZXIpXG5cbiAgICAvLyBDT01QQVQ6IENvbXBvc2l0aW9uIGV2ZW50cyBjYW4gY2hhbmdlIHRoZSBET00gb3V0IG9mIHVuZGVyIFJlYWN0LCBzbyB3ZVxuICAgIC8vIGluY3JlbWVudCB0aGlzIGtleSB0byBlbnN1cmUgdGhhdCBhIGZ1bGwgcmUtcmVuZGVyIGhhcHBlbnMuICgyMDE3LzEwLzE2KVxuICAgIGlmIChoYW5kbGVyID09ICdvbkNvbXBvc2l0aW9uRW5kJykge1xuICAgICAgdGhpcy50bXAua2V5KytcbiAgICB9XG5cbiAgICAvLyBJZ25vcmUgYG9uQmx1cmAsIGBvbkZvY3VzYCBhbmQgYG9uU2VsZWN0YCBldmVudHMgZ2VuZXJhdGVkXG4gICAgLy8gcHJvZ3JhbW1hdGljYWxseSB3aGlsZSB1cGRhdGluZyBzZWxlY3Rpb24uXG4gICAgaWYgKFxuICAgICAgdGhpcy50bXAuaXNVcGRhdGluZ1NlbGVjdGlvbiAmJlxuICAgICAgKFxuICAgICAgICBoYW5kbGVyID09ICdvblNlbGVjdCcgfHxcbiAgICAgICAgaGFuZGxlciA9PSAnb25CbHVyJyB8fFxuICAgICAgICBoYW5kbGVyID09ICdvbkZvY3VzJ1xuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gQ09NUEFUOiBUaGVyZSBhcmUgc2l0dWF0aW9ucyB3aGVyZSBhIHNlbGVjdCBldmVudCB3aWxsIGZpcmUgd2l0aCBhIG5ld1xuICAgIC8vIG5hdGl2ZSBzZWxlY3Rpb24gdGhhdCByZXNvbHZlcyB0byB0aGUgc2FtZSBpbnRlcm5hbCBwb3NpdGlvbi4gSW4gdGhvc2VcbiAgICAvLyBjYXNlcyB3ZSBkb24ndCBuZWVkIHRvIHRyaWdnZXIgYW55IGNoYW5nZXMsIHNpbmNlIG91ciBpbnRlcm5hbCBtb2RlbCBpc1xuICAgIC8vIGFscmVhZHkgdXAgdG8gZGF0ZSwgYnV0IHdlIGRvIHdhbnQgdG8gdXBkYXRlIHRoZSBuYXRpdmUgc2VsZWN0aW9uIGFnYWluXG4gICAgLy8gdG8gbWFrZSBzdXJlIGl0IGlzIGluIHN5bmMuICgyMDE3LzEwLzE2KVxuICAgIGlmIChoYW5kbGVyID09ICdvblNlbGVjdCcpIHtcbiAgICAgIGNvbnN0IHsgZWRpdG9yIH0gPSB0aGlzLnByb3BzXG4gICAgICBjb25zdCB7IHZhbHVlIH0gPSBlZGl0b3JcbiAgICAgIGNvbnN0IHsgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KGV2ZW50LnRhcmdldClcbiAgICAgIGNvbnN0IG5hdGl2ZSA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgICAgY29uc3QgcmFuZ2UgPSBmaW5kUmFuZ2UobmF0aXZlLCB2YWx1ZSlcblxuICAgICAgaWYgKHJhbmdlICYmIHJhbmdlLmVxdWFscyhzZWxlY3Rpb24pKSB7XG4gICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgaGFuZGxlIGRyYWcgZXZlbnRzIGNvbWluZyBmcm9tIGVtYmVkZGVkIGVkaXRvcnMuXG4gICAgaWYgKFxuICAgICAgaGFuZGxlciA9PSAnb25EcmFnRW5kJyB8fFxuICAgICAgaGFuZGxlciA9PSAnb25EcmFnRW50ZXInIHx8XG4gICAgICBoYW5kbGVyID09ICdvbkRyYWdFeGl0JyB8fFxuICAgICAgaGFuZGxlciA9PSAnb25EcmFnTGVhdmUnIHx8XG4gICAgICBoYW5kbGVyID09ICdvbkRyYWdPdmVyJyB8fFxuICAgICAgaGFuZGxlciA9PSAnb25EcmFnU3RhcnQnXG4gICAgKSB7XG4gICAgICBjb25zdCB7IHRhcmdldCB9ID0gZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldEVkaXRvck5vZGUgPSB0YXJnZXQuY2xvc2VzdCgnW2RhdGEtc2xhdGUtZWRpdG9yXScpXG4gICAgICBpZiAodGFyZ2V0RWRpdG9yTm9kZSAhPT0gdGhpcy5lbGVtZW50KSByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBTb21lIGV2ZW50cyByZXF1aXJlIGJlaW5nIGluIGVkaXRhYmxlIGluIHRoZSBlZGl0b3IsIHNvIGlmIHRoZSBldmVudFxuICAgIC8vIHRhcmdldCBpc24ndCwgaWdub3JlIHRoZW0uXG4gICAgaWYgKFxuICAgICAgaGFuZGxlciA9PSAnb25CZWZvcmVJbnB1dCcgfHxcbiAgICAgIGhhbmRsZXIgPT0gJ29uQmx1cicgfHxcbiAgICAgIGhhbmRsZXIgPT0gJ29uQ29tcG9zaXRpb25FbmQnIHx8XG4gICAgICBoYW5kbGVyID09ICdvbkNvbXBvc2l0aW9uU3RhcnQnIHx8XG4gICAgICBoYW5kbGVyID09ICdvbkNvcHknIHx8XG4gICAgICBoYW5kbGVyID09ICdvbkN1dCcgfHxcbiAgICAgIGhhbmRsZXIgPT0gJ29uRm9jdXMnIHx8XG4gICAgICBoYW5kbGVyID09ICdvbklucHV0JyB8fFxuICAgICAgaGFuZGxlciA9PSAnb25LZXlEb3duJyB8fFxuICAgICAgaGFuZGxlciA9PSAnb25LZXlVcCcgfHxcbiAgICAgIGhhbmRsZXIgPT0gJ29uUGFzdGUnIHx8XG4gICAgICBoYW5kbGVyID09ICdvblNlbGVjdCdcbiAgICApIHtcbiAgICAgIGlmICghdGhpcy5pc0luRWRpdG9yKGV2ZW50LnRhcmdldCkpIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMucHJvcHNbaGFuZGxlcl0oZXZlbnQpXG4gIH1cblxuICAvKipcbiAgICogT24gYSBuYXRpdmUgYGJlZm9yZWlucHV0YCBldmVudCwgdXNlIHRoZSBhZGRpdGlvbmFsIHJhbmdlIGluZm9ybWF0aW9uXG4gICAqIHByb3ZpZGVkIGJ5IHRoZSBldmVudCB0byBtYW5pcHVsYXRlIHRleHQgZXhhY3RseSBhcyB0aGUgYnJvd3NlciB3b3VsZC5cbiAgICpcbiAgICogVGhpcyBpcyBjdXJyZW50bHkgb25seSB1c2VkIG9uIGlPUyBhbmQgQW5kcm9pZC5cbiAgICpcbiAgICogQHBhcmFtIHtJbnB1dEV2ZW50fSBldmVudFxuICAgKi9cblxuICBvbk5hdGl2ZUJlZm9yZUlucHV0ID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMucHJvcHMucmVhZE9ubHkpIHJldHVyblxuICAgIGlmICghdGhpcy5pc0luRWRpdG9yKGV2ZW50LnRhcmdldCkpIHJldHVyblxuXG4gICAgY29uc3QgWyB0YXJnZXRSYW5nZSBdID0gZXZlbnQuZ2V0VGFyZ2V0UmFuZ2VzKClcbiAgICBpZiAoIXRhcmdldFJhbmdlKSByZXR1cm5cblxuICAgIGNvbnN0IHsgZWRpdG9yIH0gPSB0aGlzLnByb3BzXG5cbiAgICBzd2l0Y2ggKGV2ZW50LmlucHV0VHlwZSkge1xuICAgICAgY2FzZSAnZGVsZXRlQ29udGVudEJhY2t3YXJkJzoge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgICAgY29uc3QgcmFuZ2UgPSBmaW5kUmFuZ2UodGFyZ2V0UmFuZ2UsIGVkaXRvci52YWx1ZSlcbiAgICAgICAgZWRpdG9yLmNoYW5nZShjaGFuZ2UgPT4gY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UpKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnRMaW5lQnJlYWsnOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhydVxuICAgICAgY2FzZSAnaW5zZXJ0UGFyYWdyYXBoJzoge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGNvbnN0IHJhbmdlID0gZmluZFJhbmdlKHRhcmdldFJhbmdlLCBlZGl0b3IudmFsdWUpXG5cbiAgICAgICAgZWRpdG9yLmNoYW5nZSgoY2hhbmdlKSA9PiB7XG4gICAgICAgICAgaWYgKGNoYW5nZS52YWx1ZS5pc0luVm9pZCkge1xuICAgICAgICAgICAgY2hhbmdlLmNvbGxhcHNlVG9TdGFydE9mTmV4dFRleHQoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGFuZ2Uuc3BsaXRCbG9ja0F0UmFuZ2UocmFuZ2UpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlICdpbnNlcnRSZXBsYWNlbWVudFRleHQnOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhydVxuICAgICAgY2FzZSAnaW5zZXJ0VGV4dCc6IHtcbiAgICAgICAgLy8gYGRhdGFgIHNob3VsZCBoYXZlIHRoZSB0ZXh0IGZvciB0aGUgYGluc2VydFRleHRgIGlucHV0IHR5cGUgYW5kXG4gICAgICAgIC8vIGBkYXRhVHJhbnNmZXJgIHNob3VsZCBoYXZlIHRoZSB0ZXh0IGZvciB0aGUgYGluc2VydFJlcGxhY2VtZW50VGV4dGBcbiAgICAgICAgLy8gaW5wdXQgdHlwZSwgYnV0IFNhZmFyaSB1c2VzIGBpbnNlcnRUZXh0YCBmb3Igc3BlbGwgY2hlY2sgcmVwbGFjZW1lbnRzXG4gICAgICAgIC8vIGFuZCBzZXRzIGBkYXRhYCB0byBgbnVsbGAuXG4gICAgICAgIGNvbnN0IHRleHQgPSBldmVudC5kYXRhID09IG51bGxcbiAgICAgICAgICA/IGV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXh0L3BsYWluJylcbiAgICAgICAgICA6IGV2ZW50LmRhdGFcblxuICAgICAgICBpZiAodGV4dCA9PSBudWxsKSByZXR1cm5cblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gZWRpdG9yXG4gICAgICAgIGNvbnN0IHsgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgICAgICBjb25zdCByYW5nZSA9IGZpbmRSYW5nZSh0YXJnZXRSYW5nZSwgdmFsdWUpXG5cbiAgICAgICAgZWRpdG9yLmNoYW5nZSgoY2hhbmdlKSA9PiB7XG4gICAgICAgICAgY2hhbmdlLmluc2VydFRleHRBdFJhbmdlKHJhbmdlLCB0ZXh0LCBzZWxlY3Rpb24ubWFya3MpXG5cbiAgICAgICAgICAvLyBJZiB0aGUgdGV4dCB3YXMgc3VjY2Vzc2Z1bGx5IGluc2VydGVkLCBhbmQgdGhlIHNlbGVjdGlvbiBoYWQgbWFya3NcbiAgICAgICAgICAvLyBvbiBpdCwgdW5zZXQgdGhlIHNlbGVjdGlvbidzIG1hcmtzLlxuICAgICAgICAgIGlmIChzZWxlY3Rpb24ubWFya3MgJiYgdmFsdWUuZG9jdW1lbnQgIT0gY2hhbmdlLnZhbHVlLmRvY3VtZW50KSB7XG4gICAgICAgICAgICBjaGFuZ2Uuc2VsZWN0KHsgbWFya3M6IG51bGwgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT24gbmF0aXZlIGBzZWxlY3Rpb25jaGFuZ2VgIGV2ZW50LCB0cmlnZ2VyIHRoZSBgb25TZWxlY3RgIGhhbmRsZXIuIFRoaXMgaXNcbiAgICogbmVlZGVkIHRvIGFjY291bnQgZm9yIFJlYWN0J3MgYG9uU2VsZWN0YCBiZWluZyBub24tc3RhbmRhcmQgYW5kIG5vdCBmaXJpbmdcbiAgICogdW50aWwgYWZ0ZXIgYSBzZWxlY3Rpb24gaGFzIGJlZW4gcmVsZWFzZWQuIFRoaXMgY2F1c2VzIGlzc3VlcyBpbiBzaXR1YXRpb25zXG4gICAqIHdoZXJlIGFub3RoZXIgY2hhbmdlIGhhcHBlbnMgd2hpbGUgYSBzZWxlY3Rpb24gaXMgYmVpbmcgbWFkZS5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICovXG5cbiAgb25OYXRpdmVTZWxlY3Rpb25DaGFuZ2UgPSB0aHJvdHRsZSgoZXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5wcm9wcy5yZWFkT25seSkgcmV0dXJuXG5cbiAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coZXZlbnQudGFyZ2V0KVxuICAgIGNvbnN0IHsgYWN0aXZlRWxlbWVudCB9ID0gd2luZG93LmRvY3VtZW50XG4gICAgaWYgKGFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuZWxlbWVudCkgcmV0dXJuXG5cbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KGV2ZW50KVxuICB9LCAxMDApXG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgZWRpdG9yIGNvbnRlbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAqL1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHByb3BzIH0gPSB0aGlzXG4gICAgY29uc3QgeyBjbGFzc05hbWUsIHJlYWRPbmx5LCBlZGl0b3IsIHRhYkluZGV4LCByb2xlLCB0YWdOYW1lIH0gPSBwcm9wc1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGVkaXRvclxuICAgIGNvbnN0IENvbnRhaW5lciA9IHRhZ05hbWVcbiAgICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgY29uc3QgaW5kZXhlcyA9IGRvY3VtZW50LmdldFNlbGVjdGlvbkluZGV4ZXMoc2VsZWN0aW9uLCBzZWxlY3Rpb24uaXNGb2N1c2VkKVxuICAgIGNvbnN0IGNoaWxkcmVuID0gZG9jdW1lbnQubm9kZXMudG9BcnJheSgpLm1hcCgoY2hpbGQsIGkpID0+IHtcbiAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSAhIWluZGV4ZXMgJiYgaW5kZXhlcy5zdGFydCA8PSBpICYmIGkgPCBpbmRleGVzLmVuZFxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTm9kZShjaGlsZCwgaXNTZWxlY3RlZClcbiAgICB9KVxuXG4gICAgY29uc3QgaGFuZGxlcnMgPSBFVkVOVF9IQU5ETEVSUy5yZWR1Y2UoKG9iaiwgaGFuZGxlcikgPT4ge1xuICAgICAgb2JqW2hhbmRsZXJdID0gdGhpc1toYW5kbGVyXVxuICAgICAgcmV0dXJuIG9ialxuICAgIH0sIHt9KVxuXG4gICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IG91dGxpbmUgc3R5bGVzLlxuICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgLy8gUHJlc2VydmUgYWRqYWNlbnQgd2hpdGVzcGFjZSBhbmQgbmV3IGxpbmVzLlxuICAgICAgd2hpdGVTcGFjZTogJ3ByZS13cmFwJyxcbiAgICAgIC8vIEFsbG93IHdvcmRzIHRvIGJyZWFrIGlmIHRoZXkgYXJlIHRvbyBsb25nLlxuICAgICAgd29yZFdyYXA6ICdicmVhay13b3JkJyxcbiAgICAgIC8vIENPTVBBVDogSW4gaU9TLCBhIGZvcm1hdHRpbmcgbWVudSB3aXRoIGJvbGQsIGl0YWxpYyBhbmQgdW5kZXJsaW5lXG4gICAgICAvLyBidXR0b25zIGlzIHNob3duIHdoaWNoIGNhdXNlcyBvdXIgaW50ZXJuYWwgdmFsdWUgdG8gZ2V0IG91dCBvZiBzeW5jIGluXG4gICAgICAvLyB3ZWlyZCB3YXlzLiBUaGlzIGhpZGVzIHRoYXQuICgyMDE2LzA2LzIxKVxuICAgICAgLi4uKHJlYWRPbmx5ID8ge30gOiB7IFdlYmtpdFVzZXJNb2RpZnk6ICdyZWFkLXdyaXRlLXBsYWludGV4dC1vbmx5JyB9KSxcbiAgICAgIC8vIEFsbG93IGZvciBwYXNzZWQtaW4gc3R5bGVzIHRvIG92ZXJyaWRlIGFueXRoaW5nLlxuICAgICAgLi4ucHJvcHMuc3R5bGUsXG4gICAgfVxuXG4gICAgLy8gQ09NUEFUOiBJbiBGaXJlZm94LCBzcGVsbGNoZWNraW5nIGNhbiByZW1vdmUgZW50aXJlIHdyYXBwaW5nIGVsZW1lbnRzXG4gICAgLy8gaW5jbHVkaW5nIGlubGluZSBvbmVzIGxpa2UgYDxhPmAsIHdoaWNoIGlzIGphcnJpbmcgZm9yIHRoZSB1c2VyIGJ1dCBhbHNvXG4gICAgLy8gY2F1c2VzIHRoZSBET00gdG8gZ2V0IGludG8gYW4gaXJyZWNvbmNpbGFibGUgdmFsdWUuICgyMDE2LzA5LzAxKVxuICAgIGNvbnN0IHNwZWxsQ2hlY2sgPSBJU19GSVJFRk9YID8gZmFsc2UgOiBwcm9wcy5zcGVsbENoZWNrXG5cbiAgICBkZWJ1ZygncmVuZGVyJywgeyBwcm9wcyB9KVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxDb250YWluZXJcbiAgICAgICAgey4uLmhhbmRsZXJzfVxuICAgICAgICBkYXRhLXNsYXRlLWVkaXRvclxuICAgICAgICBrZXk9e3RoaXMudG1wLmtleX1cbiAgICAgICAgcmVmPXt0aGlzLnJlZn1cbiAgICAgICAgZGF0YS1rZXk9e2RvY3VtZW50LmtleX1cbiAgICAgICAgY29udGVudEVkaXRhYmxlPXtyZWFkT25seSA/IG51bGwgOiB0cnVlfVxuICAgICAgICBzdXBwcmVzc0NvbnRlbnRFZGl0YWJsZVdhcm5pbmdcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgIG9uQmx1cj17dGhpcy5vbkJsdXJ9XG4gICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgb25Db21wb3NpdGlvbkVuZD17dGhpcy5vbkNvbXBvc2l0aW9uRW5kfVxuICAgICAgICBvbkNvbXBvc2l0aW9uU3RhcnQ9e3RoaXMub25Db21wb3NpdGlvblN0YXJ0fVxuICAgICAgICBvbkNvcHk9e3RoaXMub25Db3B5fVxuICAgICAgICBvbkN1dD17dGhpcy5vbkN1dH1cbiAgICAgICAgb25EcmFnRW5kPXt0aGlzLm9uRHJhZ0VuZH1cbiAgICAgICAgb25EcmFnT3Zlcj17dGhpcy5vbkRyYWdPdmVyfVxuICAgICAgICBvbkRyYWdTdGFydD17dGhpcy5vbkRyYWdTdGFydH1cbiAgICAgICAgb25Ecm9wPXt0aGlzLm9uRHJvcH1cbiAgICAgICAgb25JbnB1dD17dGhpcy5vbklucHV0fVxuICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICBvbktleVVwPXt0aGlzLm9uS2V5VXB9XG4gICAgICAgIG9uUGFzdGU9e3RoaXMub25QYXN0ZX1cbiAgICAgICAgb25TZWxlY3Q9e3RoaXMub25TZWxlY3R9XG4gICAgICAgIGF1dG9Db3JyZWN0PXtwcm9wcy5hdXRvQ29ycmVjdCA/ICdvbicgOiAnb2ZmJ31cbiAgICAgICAgc3BlbGxDaGVjaz17c3BlbGxDaGVja31cbiAgICAgICAgc3R5bGU9e3N0eWxlfVxuICAgICAgICByb2xlPXtyZWFkT25seSA/IG51bGwgOiAocm9sZSB8fCAndGV4dGJveCcpfVxuICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgIC8vIENPTVBBVDogVGhlIEdyYW1tYXJseSBDaHJvbWUgZXh0ZW5zaW9uIHdvcmtzIGJ5IGNoYW5naW5nIHRoZSBET00gb3V0XG4gICAgICAgIC8vIGZyb20gdW5kZXIgYGNvbnRlbnRlZGl0YWJsZWAgZWxlbWVudHMsIHdoaWNoIGxlYWRzIHRvIHdlaXJkIGJlaGF2aW9yc1xuICAgICAgICAvLyBzbyB3ZSBoYXZlIHRvIGRpc2FibGUgaXQgbGlrZSB0aGlzLiAoMjAxNy8wNC8yNClcbiAgICAgICAgZGF0YS1ncmFtbT17ZmFsc2V9XG4gICAgICA+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICA8L0NvbnRhaW5lcj5cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGEgYGNoaWxkYCBub2RlIG9mIHRoZSBkb2N1bWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBjaGlsZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzU2VsZWN0ZWRcbiAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICovXG5cbiAgcmVuZGVyTm9kZSA9IChjaGlsZCwgaXNTZWxlY3RlZCkgPT4ge1xuICAgIGNvbnN0IHsgZWRpdG9yLCByZWFkT25seSB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGVkaXRvclxuICAgIGNvbnN0IHsgZG9jdW1lbnQsIGRlY29yYXRpb25zIH0gPSB2YWx1ZVxuICAgIGNvbnN0IHsgc3RhY2sgfSA9IGVkaXRvclxuICAgIGxldCBkZWNzID0gZG9jdW1lbnQuZ2V0RGVjb3JhdGlvbnMoc3RhY2spXG4gICAgaWYgKGRlY29yYXRpb25zKSBkZWNzID0gZGVjb3JhdGlvbnMuY29uY2F0KGRlY3MpXG4gICAgcmV0dXJuIChcbiAgICAgIDxOb2RlXG4gICAgICAgIGJsb2NrPXtudWxsfVxuICAgICAgICBlZGl0b3I9e2VkaXRvcn1cbiAgICAgICAgZGVjb3JhdGlvbnM9e2RlY3N9XG4gICAgICAgIGlzU2VsZWN0ZWQ9e2lzU2VsZWN0ZWR9XG4gICAgICAgIGtleT17Y2hpbGQua2V5fVxuICAgICAgICBub2RlPXtjaGlsZH1cbiAgICAgICAgcGFyZW50PXtkb2N1bWVudH1cbiAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgLz5cbiAgICApXG4gIH1cblxufVxuXG4vKipcbiAqIE1peCBpbiBoYW5kbGVyIHByb3AgdHlwZXMuXG4gKi9cblxuRVZFTlRfSEFORExFUlMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICBDb250ZW50LnByb3BUeXBlc1toYW5kbGVyXSA9IFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0NvbXBvbmVudH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBDb250ZW50XG4iXX0=