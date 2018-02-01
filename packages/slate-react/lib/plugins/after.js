'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slateBase64Serializer = require('slate-base64-serializer');

var _slateBase64Serializer2 = _interopRequireDefault(_slateBase64Serializer);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _slatePlainSerializer = require('slate-plain-serializer');

var _slatePlainSerializer2 = _interopRequireDefault(_slatePlainSerializer);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _slate = require('slate');

var _environment = require('../constants/environment');

var _eventHandlers = require('../constants/event-handlers');

var _eventHandlers2 = _interopRequireDefault(_eventHandlers);

var _hotkeys = require('../constants/hotkeys');

var _hotkeys2 = _interopRequireDefault(_hotkeys);

var _content = require('../components/content');

var _content2 = _interopRequireDefault(_content);

var _cloneFragment = require('../utils/clone-fragment');

var _cloneFragment2 = _interopRequireDefault(_cloneFragment);

var _findDomNode = require('../utils/find-dom-node');

var _findDomNode2 = _interopRequireDefault(_findDomNode);

var _findNode = require('../utils/find-node');

var _findNode2 = _interopRequireDefault(_findNode);

var _findPoint = require('../utils/find-point');

var _findPoint2 = _interopRequireDefault(_findPoint);

var _findRange = require('../utils/find-range');

var _findRange2 = _interopRequireDefault(_findRange);

var _getEventRange = require('../utils/get-event-range');

var _getEventRange2 = _interopRequireDefault(_getEventRange);

var _getEventTransfer = require('../utils/get-event-transfer');

var _getEventTransfer2 = _interopRequireDefault(_getEventTransfer);

var _setEventTransfer = require('../utils/set-event-transfer');

var _setEventTransfer2 = _interopRequireDefault(_setEventTransfer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:after');

/**
 * The after plugin.
 *
 * @return {Object}
 */

function AfterPlugin() {
  var isDraggingInternally = null;

  /**
   * On before input, correct any browser inconsistencies.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBeforeInput(event, change, editor) {
    debug('onBeforeInput', { event: event });

    event.preventDefault();
    change.insertText(event.data);
  }

  /**
   * On blur.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBlur(event, change, editor) {
    debug('onBlur', { event: event });

    change.blur();
  }

  /**
   * On click.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onClick(event, change, editor) {
    if (editor.props.readOnly) return true;

    var value = change.value;
    var document = value.document;

    var node = (0, _findNode2.default)(event.target, value);
    var isVoid = node && (node.isVoid || document.hasVoidParent(node.key));

    if (isVoid) {
      // COMPAT: In Chrome & Safari, selections that are at the zero offset of
      // an inline node will be automatically replaced to be at the last offset
      // of a previous inline node, which screws us up, so we always want to set
      // it to the end of the node. (2016/11/29)
      change.focus().collapseToEndOf(node);
    }

    debug('onClick', { event: event });
  }

  /**
   * On copy.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCopy(event, change, editor) {
    debug('onCopy', { event: event });

    (0, _cloneFragment2.default)(event, change.value);
  }

  /**
   * On cut.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCut(event, change, editor) {
    debug('onCut', { event: event });

    (0, _cloneFragment2.default)(event, change.value);
    var window = (0, _getWindow2.default)(event.target);

    // Once the fake cut content has successfully been added to the clipboard,
    // delete the content in the current selection.
    window.requestAnimationFrame(function () {
      // If user cuts a void block node or a void inline node,
      // manually removes it since selection is collapsed in this case.
      var value = change.value;
      var endBlock = value.endBlock,
          endInline = value.endInline,
          isCollapsed = value.isCollapsed;

      var isVoidBlock = endBlock && endBlock.isVoid && isCollapsed;
      var isVoidInline = endInline && endInline.isVoid && isCollapsed;

      if (isVoidBlock) {
        editor.change(function (c) {
          return c.removeNodeByKey(endBlock.key);
        });
      } else if (isVoidInline) {
        editor.change(function (c) {
          return c.removeNodeByKey(endInline.key);
        });
      } else {
        editor.change(function (c) {
          return c.delete();
        });
      }
    });
  }

  /**
   * On drag end.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragEnd(event, change, editor) {
    debug('onDragEnd', { event: event });

    isDraggingInternally = null;
  }

  /**
   * On drag over.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragOver(event, change, editor) {
    debug('onDragOver', { event: event });

    isDraggingInternally = false;
  }

  /**
   * On drag start.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragStart(event, change, editor) {
    debug('onDragStart', { event: event });

    isDraggingInternally = true;

    var value = change.value;
    var document = value.document;

    var node = (0, _findNode2.default)(event.target, value);
    var isVoid = node && (node.isVoid || document.hasVoidParent(node.key));

    if (isVoid) {
      var encoded = _slateBase64Serializer2.default.serializeNode(node, { preserveKeys: true });
      (0, _setEventTransfer2.default)(event, 'node', encoded);
    } else {
      var fragment = value.fragment;

      var _encoded = _slateBase64Serializer2.default.serializeNode(fragment);
      (0, _setEventTransfer2.default)(event, 'fragment', _encoded);
    }
  }

  /**
   * On drop.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDrop(event, change, editor) {
    debug('onDrop', { event: event });

    var value = change.value;
    var document = value.document,
        selection = value.selection;

    var window = (0, _getWindow2.default)(event.target);
    var target = (0, _getEventRange2.default)(event, value);
    if (!target) return;

    var transfer = (0, _getEventTransfer2.default)(event);
    var type = transfer.type,
        fragment = transfer.fragment,
        node = transfer.node,
        text = transfer.text;


    change.focus();

    // If the drag is internal and the target is after the selection, it
    // needs to account for the selection's content being deleted.
    if (isDraggingInternally && selection.endKey == target.endKey && selection.endOffset < target.endOffset) {
      target = target.move(selection.startKey == selection.endKey ? 0 - selection.endOffset + selection.startOffset : 0 - selection.endOffset);
    }

    if (isDraggingInternally) {
      change.delete();
    }

    change.select(target);

    if (type == 'text' || type == 'html') {
      var _target = target,
          anchorKey = _target.anchorKey;

      var hasVoidParent = document.hasVoidParent(anchorKey);

      if (hasVoidParent) {
        var n = document.getNode(anchorKey);

        while (hasVoidParent) {
          n = document.getNextText(n.key);
          if (!n) break;
          hasVoidParent = document.hasVoidParent(n.key);
        }

        if (n) change.collapseToStartOf(n);
      }

      text.split('\n').forEach(function (line, i) {
        if (i > 0) change.splitBlock();
        change.insertText(line);
      });
    }

    if (type == 'fragment') {
      change.insertFragment(fragment);
    }

    if (type == 'node' && _slate.Block.isBlock(node)) {
      change.insertBlock(node).removeNodeByKey(node.key);
    }

    if (type == 'node' && _slate.Inline.isInline(node)) {
      change.insertInline(node).removeNodeByKey(node.key);
    }

    // COMPAT: React's onSelect event breaks after an onDrop event
    // has fired in a node: https://github.com/facebook/react/issues/11379.
    // Until this is fixed in React, we dispatch a mouseup event on that
    // DOM node, since that will make it go back to normal.
    var focusNode = document.getNode(target.focusKey);
    var el = (0, _findDomNode2.default)(focusNode, window);
    if (!el) return;

    el.dispatchEvent(new MouseEvent('mouseup', {
      view: window,
      bubbles: true,
      cancelable: true
    }));
  }

  /**
   * On input.
   *
   * @param {Event} eventvent
   * @param {Change} change
   */

  function onInput(event, change, editor) {
    debug('onInput', { event: event });

    var window = (0, _getWindow2.default)(event.target);
    var value = change.value;

    // Get the selection point.

    var native = window.getSelection();
    var anchorNode = native.anchorNode,
        anchorOffset = native.anchorOffset;

    var point = (0, _findPoint2.default)(anchorNode, anchorOffset, value);
    if (!point) return;

    // Get the text node and leaf in question.
    var document = value.document,
        selection = value.selection;

    var node = document.getDescendant(point.key);
    var block = document.getClosestBlock(node.key);
    var leaves = node.getLeaves();
    var lastText = block.getLastText();
    var lastLeaf = leaves.last();
    var start = 0;
    var end = 0;

    var leaf = leaves.find(function (r) {
      start = end;
      end += r.text.length;
      if (end >= point.offset) return true;
    }) || lastLeaf;

    // Get the text information.
    var text = leaf.text;
    var textContent = anchorNode.textContent;

    var isLastText = node == lastText;
    var isLastLeaf = leaf == lastLeaf;
    var lastChar = textContent.charAt(textContent.length - 1);

    // COMPAT: If this is the last leaf, and the DOM text ends in a new line,
    // we will have added another new line in <Leaf>'s render method to account
    // for browsers collapsing a single trailing new lines, so remove it.
    if (isLastText && isLastLeaf && lastChar == '\n') {
      textContent = textContent.slice(0, -1);
    }

    // If the text is no different, abort.
    if (textContent == text) return;

    // Determine what the selection should be after changing the text.
    var delta = textContent.length - text.length;
    var corrected = selection.collapseToEnd().move(delta);
    var entire = selection.moveAnchorTo(point.key, start).moveFocusTo(point.key, end);

    // Change the current value to have the leaf's text replaced.
    change.insertTextAtRange(entire, textContent, leaf.marks).select(corrected);
  }

  /**
   * On key down.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onKeyDown(event, change, editor) {
    debug('onKeyDown', { event: event });

    var value = change.value;

    // COMPAT: In iOS, some of these hotkeys are handled in the
    // `onNativeBeforeInput` handler of the `<Content>` component in order to
    // preserve native autocorrect behavior, so they shouldn't be handled here.

    if (_hotkeys2.default.SPLIT_BLOCK(event) && !_environment.IS_IOS) {
      return value.isInVoid ? change.collapseToStartOfNextText() : change.splitBlock();
    }

    if (_hotkeys2.default.DELETE_CHAR_BACKWARD(event) && !_environment.IS_IOS) {
      return change.deleteCharBackward();
    }

    if (_hotkeys2.default.DELETE_CHAR_FORWARD(event) && !_environment.IS_IOS) {
      return change.deleteCharForward();
    }

    if (_hotkeys2.default.DELETE_LINE_BACKWARD(event)) {
      return change.deleteLineBackward();
    }

    if (_hotkeys2.default.DELETE_LINE_FORWARD(event)) {
      return change.deleteLineForward();
    }

    if (_hotkeys2.default.DELETE_WORD_BACKWARD(event)) {
      return change.deleteWordBackward();
    }

    if (_hotkeys2.default.DELETE_WORD_FORWARD(event)) {
      return change.deleteWordForward();
    }

    if (_hotkeys2.default.REDO(event)) {
      return change.redo();
    }

    if (_hotkeys2.default.UNDO(event)) {
      return change.undo();
    }

    // COMPAT: Certain browsers don't handle the selection updates properly. In
    // Chrome, the selection isn't properly extended. And in Firefox, the
    // selection isn't properly collapsed. (2017/10/17)
    if (_hotkeys2.default.COLLAPSE_LINE_BACKWARD(event)) {
      event.preventDefault();
      return change.collapseLineBackward();
    }

    if (_hotkeys2.default.COLLAPSE_LINE_FORWARD(event)) {
      event.preventDefault();
      return change.collapseLineForward();
    }

    if (_hotkeys2.default.EXTEND_LINE_BACKWARD(event)) {
      event.preventDefault();
      return change.extendLineBackward();
    }

    if (_hotkeys2.default.EXTEND_LINE_FORWARD(event)) {
      event.preventDefault();
      return change.extendLineForward();
    }

    // COMPAT: If a void node is selected, or a zero-width text node adjacent to
    // an inline is selected, we need to handle these hotkeys manually because
    // browsers won't know what to do.
    if (_hotkeys2.default.COLLAPSE_CHAR_BACKWARD(event)) {
      var document = value.document,
          isInVoid = value.isInVoid,
          previousText = value.previousText,
          startText = value.startText;

      var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);
      if (isInVoid || isPreviousInVoid || startText.text == '') {
        event.preventDefault();
        return change.collapseCharBackward();
      }
    }

    if (_hotkeys2.default.COLLAPSE_CHAR_FORWARD(event)) {
      var _document = value.document,
          _isInVoid = value.isInVoid,
          nextText = value.nextText,
          _startText = value.startText;

      var isNextInVoid = nextText && _document.hasVoidParent(nextText.key);
      if (_isInVoid || isNextInVoid || _startText.text == '') {
        event.preventDefault();
        return change.collapseCharForward();
      }
    }

    if (_hotkeys2.default.EXTEND_CHAR_BACKWARD(event)) {
      var _document2 = value.document,
          _isInVoid2 = value.isInVoid,
          _previousText = value.previousText,
          _startText2 = value.startText;

      var _isPreviousInVoid = _previousText && _document2.hasVoidParent(_previousText.key);
      if (_isInVoid2 || _isPreviousInVoid || _startText2.text == '') {
        event.preventDefault();
        return change.extendCharBackward();
      }
    }

    if (_hotkeys2.default.EXTEND_CHAR_FORWARD(event)) {
      var _document3 = value.document,
          _isInVoid3 = value.isInVoid,
          _nextText = value.nextText,
          _startText3 = value.startText;

      var _isNextInVoid = _nextText && _document3.hasVoidParent(_nextText.key);
      if (_isInVoid3 || _isNextInVoid || _startText3.text == '') {
        event.preventDefault();
        return change.extendCharForward();
      }
    }
  }

  /**
   * On paste.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onPaste(event, change, editor) {
    debug('onPaste', { event: event });

    var transfer = (0, _getEventTransfer2.default)(event);
    var type = transfer.type,
        fragment = transfer.fragment,
        text = transfer.text;


    if (type == 'fragment') {
      change.insertFragment(fragment);
    }

    if (type == 'text' || type == 'html') {
      if (!text) return;
      var value = change.value;
      var document = value.document,
          selection = value.selection,
          startBlock = value.startBlock;

      if (startBlock.isVoid) return;

      var defaultBlock = startBlock;
      var defaultMarks = document.getInsertMarksAtRange(selection);
      var frag = _slatePlainSerializer2.default.deserialize(text, { defaultBlock: defaultBlock, defaultMarks: defaultMarks }).document;
      change.insertFragment(frag);
    }
  }

  /**
   * On select.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onSelect(event, change, editor) {
    debug('onSelect', { event: event });

    var window = (0, _getWindow2.default)(event.target);
    var value = change.value;
    var document = value.document;

    var native = window.getSelection();

    // If there are no ranges, the editor was blurred natively.
    if (!native.rangeCount) {
      change.blur();
      return;
    }

    // Otherwise, determine the Slate selection from the native one.
    var range = (0, _findRange2.default)(native, value);
    if (!range) return;

    var _range = range,
        anchorKey = _range.anchorKey,
        anchorOffset = _range.anchorOffset,
        focusKey = _range.focusKey,
        focusOffset = _range.focusOffset;

    var anchorText = document.getNode(anchorKey);
    var focusText = document.getNode(focusKey);
    var anchorInline = document.getClosestInline(anchorKey);
    var focusInline = document.getClosestInline(focusKey);
    var focusBlock = document.getClosestBlock(focusKey);
    var anchorBlock = document.getClosestBlock(anchorKey);

    // COMPAT: If the anchor point is at the start of a non-void, and the
    // focus point is inside a void node with an offset that isn't `0`, set
    // the focus offset to `0`. This is due to void nodes <span>'s being
    // positioned off screen, resulting in the offset always being greater
    // than `0`. Since we can't know what it really should be, and since an
    // offset of `0` is less destructive because it creates a hanging
    // selection, go with `0`. (2017/09/07)
    if (anchorBlock && !anchorBlock.isVoid && anchorOffset == 0 && focusBlock && focusBlock.isVoid && focusOffset != 0) {
      range = range.set('focusOffset', 0);
    }

    // COMPAT: If the selection is at the end of a non-void inline node, and
    // there is a node after it, put it in the node after instead. This
    // standardizes the behavior, since it's indistinguishable to the user.
    if (anchorInline && !anchorInline.isVoid && anchorOffset == anchorText.text.length) {
      var block = document.getClosestBlock(anchorKey);
      var next = block.getNextText(anchorKey);
      if (next) range = range.moveAnchorTo(next.key, 0);
    }

    if (focusInline && !focusInline.isVoid && focusOffset == focusText.text.length) {
      var _block = document.getClosestBlock(focusKey);
      var _next = _block.getNextText(focusKey);
      if (_next) range = range.moveFocusTo(_next.key, 0);
    }

    range = range.normalize(document);
    change.select(range);
  }

  /**
   * Render editor.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @return {Object}
   */

  function renderEditor(props, editor) {
    var handlers = _eventHandlers2.default.reduce(function (obj, handler) {
      obj[handler] = editor[handler];
      return obj;
    }, {});

    return _react2.default.createElement(_content2.default, _extends({}, handlers, {
      autoCorrect: props.autoCorrect,
      autoFocus: props.autoFocus,
      className: props.className,
      children: props.children,
      editor: editor,
      readOnly: props.readOnly,
      role: props.role,
      spellCheck: props.spellCheck,
      style: props.style,
      tabIndex: props.tabIndex,
      tagName: props.tagName
    }));
  }

  /**
   * Render node.
   *
   * @param {Object} props
   * @return {Element}
   */

  function renderNode(props) {
    var attributes = props.attributes,
        children = props.children,
        node = props.node;

    if (node.object != 'block' && node.object != 'inline') return;
    var Tag = node.object == 'block' ? 'div' : 'span';
    var style = { position: 'relative' };
    return _react2.default.createElement(
      Tag,
      _extends({}, attributes, { style: style }),
      children
    );
  }

  /**
   * Render placeholder.
   *
   * @param {Object} props
   * @return {Element}
   */

  function renderPlaceholder(props) {
    var editor = props.editor,
        node = props.node;

    if (!editor.props.placeholder) return;
    if (editor.state.isComposing) return;
    if (node.object != 'block') return;
    if (!_slate.Text.isTextList(node.nodes)) return;
    if (node.text != '') return;
    if (editor.value.document.getBlocks().size > 1) return;

    var style = {
      pointerEvents: 'none',
      display: 'inline-block',
      width: '0',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      opacity: '0.333'
    };

    return _react2.default.createElement(
      'span',
      { contentEditable: false, style: style },
      editor.props.placeholder
    );
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onClick: onClick,
    onCopy: onCopy,
    onCut: onCut,
    onDragEnd: onDragEnd,
    onDragOver: onDragOver,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onInput: onInput,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect,
    renderEditor: renderEditor,
    renderNode: renderNode,
    renderPlaceholder: renderPlaceholder
  };
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = AfterPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2FmdGVyLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiQWZ0ZXJQbHVnaW4iLCJpc0RyYWdnaW5nSW50ZXJuYWxseSIsIm9uQmVmb3JlSW5wdXQiLCJldmVudCIsImNoYW5nZSIsImVkaXRvciIsInByZXZlbnREZWZhdWx0IiwiaW5zZXJ0VGV4dCIsImRhdGEiLCJvbkJsdXIiLCJibHVyIiwib25DbGljayIsInByb3BzIiwicmVhZE9ubHkiLCJ2YWx1ZSIsImRvY3VtZW50Iiwibm9kZSIsInRhcmdldCIsImlzVm9pZCIsImhhc1ZvaWRQYXJlbnQiLCJrZXkiLCJmb2N1cyIsImNvbGxhcHNlVG9FbmRPZiIsIm9uQ29weSIsIm9uQ3V0Iiwid2luZG93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiZW5kQmxvY2siLCJlbmRJbmxpbmUiLCJpc0NvbGxhcHNlZCIsImlzVm9pZEJsb2NrIiwiaXNWb2lkSW5saW5lIiwiYyIsInJlbW92ZU5vZGVCeUtleSIsImRlbGV0ZSIsIm9uRHJhZ0VuZCIsIm9uRHJhZ092ZXIiLCJvbkRyYWdTdGFydCIsImVuY29kZWQiLCJzZXJpYWxpemVOb2RlIiwicHJlc2VydmVLZXlzIiwiZnJhZ21lbnQiLCJvbkRyb3AiLCJzZWxlY3Rpb24iLCJ0cmFuc2ZlciIsInR5cGUiLCJ0ZXh0IiwiZW5kS2V5IiwiZW5kT2Zmc2V0IiwibW92ZSIsInN0YXJ0S2V5Iiwic3RhcnRPZmZzZXQiLCJzZWxlY3QiLCJhbmNob3JLZXkiLCJuIiwiZ2V0Tm9kZSIsImdldE5leHRUZXh0IiwiY29sbGFwc2VUb1N0YXJ0T2YiLCJzcGxpdCIsImZvckVhY2giLCJsaW5lIiwiaSIsInNwbGl0QmxvY2siLCJpbnNlcnRGcmFnbWVudCIsImlzQmxvY2siLCJpbnNlcnRCbG9jayIsImlzSW5saW5lIiwiaW5zZXJ0SW5saW5lIiwiZm9jdXNOb2RlIiwiZm9jdXNLZXkiLCJlbCIsImRpc3BhdGNoRXZlbnQiLCJNb3VzZUV2ZW50IiwidmlldyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwib25JbnB1dCIsIm5hdGl2ZSIsImdldFNlbGVjdGlvbiIsImFuY2hvck5vZGUiLCJhbmNob3JPZmZzZXQiLCJwb2ludCIsImdldERlc2NlbmRhbnQiLCJibG9jayIsImdldENsb3Nlc3RCbG9jayIsImxlYXZlcyIsImdldExlYXZlcyIsImxhc3RUZXh0IiwiZ2V0TGFzdFRleHQiLCJsYXN0TGVhZiIsImxhc3QiLCJzdGFydCIsImVuZCIsImxlYWYiLCJmaW5kIiwiciIsImxlbmd0aCIsIm9mZnNldCIsInRleHRDb250ZW50IiwiaXNMYXN0VGV4dCIsImlzTGFzdExlYWYiLCJsYXN0Q2hhciIsImNoYXJBdCIsInNsaWNlIiwiZGVsdGEiLCJjb3JyZWN0ZWQiLCJjb2xsYXBzZVRvRW5kIiwiZW50aXJlIiwibW92ZUFuY2hvclRvIiwibW92ZUZvY3VzVG8iLCJpbnNlcnRUZXh0QXRSYW5nZSIsIm1hcmtzIiwib25LZXlEb3duIiwiU1BMSVRfQkxPQ0siLCJpc0luVm9pZCIsImNvbGxhcHNlVG9TdGFydE9mTmV4dFRleHQiLCJERUxFVEVfQ0hBUl9CQUNLV0FSRCIsImRlbGV0ZUNoYXJCYWNrd2FyZCIsIkRFTEVURV9DSEFSX0ZPUldBUkQiLCJkZWxldGVDaGFyRm9yd2FyZCIsIkRFTEVURV9MSU5FX0JBQ0tXQVJEIiwiZGVsZXRlTGluZUJhY2t3YXJkIiwiREVMRVRFX0xJTkVfRk9SV0FSRCIsImRlbGV0ZUxpbmVGb3J3YXJkIiwiREVMRVRFX1dPUkRfQkFDS1dBUkQiLCJkZWxldGVXb3JkQmFja3dhcmQiLCJERUxFVEVfV09SRF9GT1JXQVJEIiwiZGVsZXRlV29yZEZvcndhcmQiLCJSRURPIiwicmVkbyIsIlVORE8iLCJ1bmRvIiwiQ09MTEFQU0VfTElORV9CQUNLV0FSRCIsImNvbGxhcHNlTGluZUJhY2t3YXJkIiwiQ09MTEFQU0VfTElORV9GT1JXQVJEIiwiY29sbGFwc2VMaW5lRm9yd2FyZCIsIkVYVEVORF9MSU5FX0JBQ0tXQVJEIiwiZXh0ZW5kTGluZUJhY2t3YXJkIiwiRVhURU5EX0xJTkVfRk9SV0FSRCIsImV4dGVuZExpbmVGb3J3YXJkIiwiQ09MTEFQU0VfQ0hBUl9CQUNLV0FSRCIsInByZXZpb3VzVGV4dCIsInN0YXJ0VGV4dCIsImlzUHJldmlvdXNJblZvaWQiLCJjb2xsYXBzZUNoYXJCYWNrd2FyZCIsIkNPTExBUFNFX0NIQVJfRk9SV0FSRCIsIm5leHRUZXh0IiwiaXNOZXh0SW5Wb2lkIiwiY29sbGFwc2VDaGFyRm9yd2FyZCIsIkVYVEVORF9DSEFSX0JBQ0tXQVJEIiwiZXh0ZW5kQ2hhckJhY2t3YXJkIiwiRVhURU5EX0NIQVJfRk9SV0FSRCIsImV4dGVuZENoYXJGb3J3YXJkIiwib25QYXN0ZSIsInN0YXJ0QmxvY2siLCJkZWZhdWx0QmxvY2siLCJkZWZhdWx0TWFya3MiLCJnZXRJbnNlcnRNYXJrc0F0UmFuZ2UiLCJmcmFnIiwiZGVzZXJpYWxpemUiLCJvblNlbGVjdCIsInJhbmdlQ291bnQiLCJyYW5nZSIsImZvY3VzT2Zmc2V0IiwiYW5jaG9yVGV4dCIsImZvY3VzVGV4dCIsImFuY2hvcklubGluZSIsImdldENsb3Nlc3RJbmxpbmUiLCJmb2N1c0lubGluZSIsImZvY3VzQmxvY2siLCJhbmNob3JCbG9jayIsInNldCIsIm5leHQiLCJub3JtYWxpemUiLCJyZW5kZXJFZGl0b3IiLCJoYW5kbGVycyIsInJlZHVjZSIsIm9iaiIsImhhbmRsZXIiLCJhdXRvQ29ycmVjdCIsImF1dG9Gb2N1cyIsImNsYXNzTmFtZSIsImNoaWxkcmVuIiwicm9sZSIsInNwZWxsQ2hlY2siLCJzdHlsZSIsInRhYkluZGV4IiwidGFnTmFtZSIsInJlbmRlck5vZGUiLCJhdHRyaWJ1dGVzIiwib2JqZWN0IiwiVGFnIiwicG9zaXRpb24iLCJyZW5kZXJQbGFjZWhvbGRlciIsInBsYWNlaG9sZGVyIiwic3RhdGUiLCJpc0NvbXBvc2luZyIsImlzVGV4dExpc3QiLCJub2RlcyIsImdldEJsb2NrcyIsInNpemUiLCJwb2ludGVyRXZlbnRzIiwiZGlzcGxheSIsIndp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QixHQUNQSixLQURPLENBQ2hCSSxJQURnQjs7QUFFaEMsUUFBSSxDQUFDWCxPQUFPTyxLQUFQLENBQWFzTCxXQUFsQixFQUErQjtBQUMvQixRQUFJN0wsT0FBTzhMLEtBQVAsQ0FBYUMsV0FBakIsRUFBOEI7QUFDOUIsUUFBSXBMLEtBQUs4SyxNQUFMLElBQWUsT0FBbkIsRUFBNEI7QUFDNUIsUUFBSSxDQUFDLFlBQUtPLFVBQUwsQ0FBZ0JyTCxLQUFLc0wsS0FBckIsQ0FBTCxFQUFrQztBQUNsQyxRQUFJdEwsS0FBSzhCLElBQUwsSUFBYSxFQUFqQixFQUFxQjtBQUNyQixRQUFJekMsT0FBT1MsS0FBUCxDQUFhQyxRQUFiLENBQXNCd0wsU0FBdEIsR0FBa0NDLElBQWxDLEdBQXlDLENBQTdDLEVBQWdEOztBQUVoRCxRQUFNZixRQUFRO0FBQ1pnQixxQkFBZSxNQURIO0FBRVpDLGVBQVMsY0FGRztBQUdaQyxhQUFPLEdBSEs7QUFJWkMsZ0JBQVUsTUFKRTtBQUtaQyxrQkFBWSxRQUxBO0FBTVpDLGVBQVM7QUFORyxLQUFkOztBQVNBLFdBQ0U7QUFBQTtBQUFBLFFBQU0saUJBQWlCLEtBQXZCLEVBQThCLE9BQU9yQixLQUFyQztBQUNHcEwsYUFBT08sS0FBUCxDQUFhc0w7QUFEaEIsS0FERjtBQUtEOztBQUVEOzs7Ozs7QUFNQSxTQUFPO0FBQ0xoTSxnQ0FESztBQUVMTyxrQkFGSztBQUdMRSxvQkFISztBQUlMWSxrQkFKSztBQUtMQyxnQkFMSztBQU1MVyx3QkFOSztBQU9MQywwQkFQSztBQVFMQyw0QkFSSztBQVNMSyxrQkFUSztBQVVMa0Msb0JBVks7QUFXTG9DLHdCQVhLO0FBWUx5QyxvQkFaSztBQWFMTyxzQkFiSztBQWNMYyw4QkFkSztBQWVMYywwQkFmSztBQWdCTEs7QUFoQkssR0FBUDtBQWtCRDs7QUFFRDs7Ozs7O2tCQU1lak0sVyIsImZpbGUiOiJhZnRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IEJhc2U2NCBmcm9tICdzbGF0ZS1iYXNlNjQtc2VyaWFsaXplcidcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1ZydcbmltcG9ydCBQbGFpbiBmcm9tICdzbGF0ZS1wbGFpbi1zZXJpYWxpemVyJ1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGdldFdpbmRvdyBmcm9tICdnZXQtd2luZG93J1xuaW1wb3J0IHsgQmxvY2ssIElubGluZSwgVGV4dCB9IGZyb20gJ3NsYXRlJ1xuXG5pbXBvcnQgeyBJU19JT1MgfSBmcm9tICcuLi9jb25zdGFudHMvZW52aXJvbm1lbnQnXG5pbXBvcnQgRVZFTlRfSEFORExFUlMgZnJvbSAnLi4vY29uc3RhbnRzL2V2ZW50LWhhbmRsZXJzJ1xuaW1wb3J0IEhPVEtFWVMgZnJvbSAnLi4vY29uc3RhbnRzL2hvdGtleXMnXG5pbXBvcnQgQ29udGVudCBmcm9tICcuLi9jb21wb25lbnRzL2NvbnRlbnQnXG5pbXBvcnQgY2xvbmVGcmFnbWVudCBmcm9tICcuLi91dGlscy9jbG9uZS1mcmFnbWVudCdcbmltcG9ydCBmaW5kRE9NTm9kZSBmcm9tICcuLi91dGlscy9maW5kLWRvbS1ub2RlJ1xuaW1wb3J0IGZpbmROb2RlIGZyb20gJy4uL3V0aWxzL2ZpbmQtbm9kZSdcbmltcG9ydCBmaW5kUG9pbnQgZnJvbSAnLi4vdXRpbHMvZmluZC1wb2ludCdcbmltcG9ydCBmaW5kUmFuZ2UgZnJvbSAnLi4vdXRpbHMvZmluZC1yYW5nZSdcbmltcG9ydCBnZXRFdmVudFJhbmdlIGZyb20gJy4uL3V0aWxzL2dldC1ldmVudC1yYW5nZSdcbmltcG9ydCBnZXRFdmVudFRyYW5zZmVyIGZyb20gJy4uL3V0aWxzL2dldC1ldmVudC10cmFuc2ZlcidcbmltcG9ydCBzZXRFdmVudFRyYW5zZmVyIGZyb20gJy4uL3V0aWxzL3NldC1ldmVudC10cmFuc2ZlcidcblxuLyoqXG4gKiBEZWJ1Zy5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuY29uc3QgZGVidWcgPSBEZWJ1Zygnc2xhdGU6YWZ0ZXInKVxuXG4vKipcbiAqIFRoZSBhZnRlciBwbHVnaW4uXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIEFmdGVyUGx1Z2luKCkge1xuICBsZXQgaXNEcmFnZ2luZ0ludGVybmFsbHkgPSBudWxsXG5cbiAgLyoqXG4gICAqIE9uIGJlZm9yZSBpbnB1dCwgY29ycmVjdCBhbnkgYnJvd3NlciBpbmNvbnNpc3RlbmNpZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvbkJlZm9yZUlucHV0KGV2ZW50LCBjaGFuZ2UsIGVkaXRvcikge1xuICAgIGRlYnVnKCdvbkJlZm9yZUlucHV0JywgeyBldmVudCB9KVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNoYW5nZS5pbnNlcnRUZXh0KGV2ZW50LmRhdGEpXG4gIH1cblxuICAvKipcbiAgICogT24gYmx1ci5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uQmx1cihldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBkZWJ1Zygnb25CbHVyJywgeyBldmVudCB9KVxuXG4gICAgY2hhbmdlLmJsdXIoKVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGNsaWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25DbGljayhldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBpZiAoZWRpdG9yLnByb3BzLnJlYWRPbmx5KSByZXR1cm4gdHJ1ZVxuXG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gICAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgICBjb25zdCBub2RlID0gZmluZE5vZGUoZXZlbnQudGFyZ2V0LCB2YWx1ZSlcbiAgICBjb25zdCBpc1ZvaWQgPSBub2RlICYmIChub2RlLmlzVm9pZCB8fCBkb2N1bWVudC5oYXNWb2lkUGFyZW50KG5vZGUua2V5KSlcblxuICAgIGlmIChpc1ZvaWQpIHtcbiAgICAgIC8vIENPTVBBVDogSW4gQ2hyb21lICYgU2FmYXJpLCBzZWxlY3Rpb25zIHRoYXQgYXJlIGF0IHRoZSB6ZXJvIG9mZnNldCBvZlxuICAgICAgLy8gYW4gaW5saW5lIG5vZGUgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHJlcGxhY2VkIHRvIGJlIGF0IHRoZSBsYXN0IG9mZnNldFxuICAgICAgLy8gb2YgYSBwcmV2aW91cyBpbmxpbmUgbm9kZSwgd2hpY2ggc2NyZXdzIHVzIHVwLCBzbyB3ZSBhbHdheXMgd2FudCB0byBzZXRcbiAgICAgIC8vIGl0IHRvIHRoZSBlbmQgb2YgdGhlIG5vZGUuICgyMDE2LzExLzI5KVxuICAgICAgY2hhbmdlLmZvY3VzKCkuY29sbGFwc2VUb0VuZE9mKG5vZGUpXG4gICAgfVxuXG4gICAgZGVidWcoJ29uQ2xpY2snLCB7IGV2ZW50IH0pXG4gIH1cblxuICAvKipcbiAgICogT24gY29weS5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uQ29weShldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBkZWJ1Zygnb25Db3B5JywgeyBldmVudCB9KVxuXG4gICAgY2xvbmVGcmFnbWVudChldmVudCwgY2hhbmdlLnZhbHVlKVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGN1dC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uQ3V0KGV2ZW50LCBjaGFuZ2UsIGVkaXRvcikge1xuICAgIGRlYnVnKCdvbkN1dCcsIHsgZXZlbnQgfSlcblxuICAgIGNsb25lRnJhZ21lbnQoZXZlbnQsIGNoYW5nZS52YWx1ZSlcbiAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coZXZlbnQudGFyZ2V0KVxuXG4gICAgLy8gT25jZSB0aGUgZmFrZSBjdXQgY29udGVudCBoYXMgc3VjY2Vzc2Z1bGx5IGJlZW4gYWRkZWQgdG8gdGhlIGNsaXBib2FyZCxcbiAgICAvLyBkZWxldGUgdGhlIGNvbnRlbnQgaW4gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgLy8gSWYgdXNlciBjdXRzIGEgdm9pZCBibG9jayBub2RlIG9yIGEgdm9pZCBpbmxpbmUgbm9kZSxcbiAgICAgIC8vIG1hbnVhbGx5IHJlbW92ZXMgaXQgc2luY2Ugc2VsZWN0aW9uIGlzIGNvbGxhcHNlZCBpbiB0aGlzIGNhc2UuXG4gICAgICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgICAgIGNvbnN0IHsgZW5kQmxvY2ssIGVuZElubGluZSwgaXNDb2xsYXBzZWQgfSA9IHZhbHVlXG4gICAgICBjb25zdCBpc1ZvaWRCbG9jayA9IGVuZEJsb2NrICYmIGVuZEJsb2NrLmlzVm9pZCAmJiBpc0NvbGxhcHNlZFxuICAgICAgY29uc3QgaXNWb2lkSW5saW5lID0gZW5kSW5saW5lICYmIGVuZElubGluZS5pc1ZvaWQgJiYgaXNDb2xsYXBzZWRcblxuICAgICAgaWYgKGlzVm9pZEJsb2NrKSB7XG4gICAgICAgIGVkaXRvci5jaGFuZ2UoYyA9PiBjLnJlbW92ZU5vZGVCeUtleShlbmRCbG9jay5rZXkpKVxuICAgICAgfSBlbHNlIGlmIChpc1ZvaWRJbmxpbmUpIHtcbiAgICAgICAgZWRpdG9yLmNoYW5nZShjID0+IGMucmVtb3ZlTm9kZUJ5S2V5KGVuZElubGluZS5rZXkpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWRpdG9yLmNoYW5nZShjID0+IGMuZGVsZXRlKCkpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBkcmFnIGVuZC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uRHJhZ0VuZChldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBkZWJ1Zygnb25EcmFnRW5kJywgeyBldmVudCB9KVxuXG4gICAgaXNEcmFnZ2luZ0ludGVybmFsbHkgPSBudWxsXG4gIH1cblxuICAvKipcbiAgICogT24gZHJhZyBvdmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25EcmFnT3ZlcihldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBkZWJ1Zygnb25EcmFnT3ZlcicsIHsgZXZlbnQgfSlcblxuICAgIGlzRHJhZ2dpbmdJbnRlcm5hbGx5ID0gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBkcmFnIHN0YXJ0LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgZGVidWcoJ29uRHJhZ1N0YXJ0JywgeyBldmVudCB9KVxuXG4gICAgaXNEcmFnZ2luZ0ludGVybmFsbHkgPSB0cnVlXG5cbiAgICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICAgIGNvbnN0IG5vZGUgPSBmaW5kTm9kZShldmVudC50YXJnZXQsIHZhbHVlKVxuICAgIGNvbnN0IGlzVm9pZCA9IG5vZGUgJiYgKG5vZGUuaXNWb2lkIHx8IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQobm9kZS5rZXkpKVxuXG4gICAgaWYgKGlzVm9pZCkge1xuICAgICAgY29uc3QgZW5jb2RlZCA9IEJhc2U2NC5zZXJpYWxpemVOb2RlKG5vZGUsIHsgcHJlc2VydmVLZXlzOiB0cnVlIH0pXG4gICAgICBzZXRFdmVudFRyYW5zZmVyKGV2ZW50LCAnbm9kZScsIGVuY29kZWQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHsgZnJhZ21lbnQgfSA9IHZhbHVlXG4gICAgICBjb25zdCBlbmNvZGVkID0gQmFzZTY0LnNlcmlhbGl6ZU5vZGUoZnJhZ21lbnQpXG4gICAgICBzZXRFdmVudFRyYW5zZmVyKGV2ZW50LCAnZnJhZ21lbnQnLCBlbmNvZGVkKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBkcm9wLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25Ecm9wKGV2ZW50LCBjaGFuZ2UsIGVkaXRvcikge1xuICAgIGRlYnVnKCdvbkRyb3AnLCB7IGV2ZW50IH0pXG5cbiAgICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KGV2ZW50LnRhcmdldClcbiAgICBsZXQgdGFyZ2V0ID0gZ2V0RXZlbnRSYW5nZShldmVudCwgdmFsdWUpXG4gICAgaWYgKCF0YXJnZXQpIHJldHVyblxuXG4gICAgY29uc3QgdHJhbnNmZXIgPSBnZXRFdmVudFRyYW5zZmVyKGV2ZW50KVxuICAgIGNvbnN0IHsgdHlwZSwgZnJhZ21lbnQsIG5vZGUsIHRleHQgfSA9IHRyYW5zZmVyXG5cbiAgICBjaGFuZ2UuZm9jdXMoKVxuXG4gICAgLy8gSWYgdGhlIGRyYWcgaXMgaW50ZXJuYWwgYW5kIHRoZSB0YXJnZXQgaXMgYWZ0ZXIgdGhlIHNlbGVjdGlvbiwgaXRcbiAgICAvLyBuZWVkcyB0byBhY2NvdW50IGZvciB0aGUgc2VsZWN0aW9uJ3MgY29udGVudCBiZWluZyBkZWxldGVkLlxuICAgIGlmIChcbiAgICAgIGlzRHJhZ2dpbmdJbnRlcm5hbGx5ICYmXG4gICAgICBzZWxlY3Rpb24uZW5kS2V5ID09IHRhcmdldC5lbmRLZXkgJiZcbiAgICAgIHNlbGVjdGlvbi5lbmRPZmZzZXQgPCB0YXJnZXQuZW5kT2Zmc2V0XG4gICAgKSB7XG4gICAgICB0YXJnZXQgPSB0YXJnZXQubW92ZShzZWxlY3Rpb24uc3RhcnRLZXkgPT0gc2VsZWN0aW9uLmVuZEtleVxuICAgICAgICA/IDAgLSBzZWxlY3Rpb24uZW5kT2Zmc2V0ICsgc2VsZWN0aW9uLnN0YXJ0T2Zmc2V0XG4gICAgICAgIDogMCAtIHNlbGVjdGlvbi5lbmRPZmZzZXQpXG4gICAgfVxuXG4gICAgaWYgKGlzRHJhZ2dpbmdJbnRlcm5hbGx5KSB7XG4gICAgICBjaGFuZ2UuZGVsZXRlKClcbiAgICB9XG5cbiAgICBjaGFuZ2Uuc2VsZWN0KHRhcmdldClcblxuICAgIGlmICh0eXBlID09ICd0ZXh0JyB8fCB0eXBlID09ICdodG1sJykge1xuICAgICAgY29uc3QgeyBhbmNob3JLZXkgfSA9IHRhcmdldFxuICAgICAgbGV0IGhhc1ZvaWRQYXJlbnQgPSBkb2N1bWVudC5oYXNWb2lkUGFyZW50KGFuY2hvcktleSlcblxuICAgICAgaWYgKGhhc1ZvaWRQYXJlbnQpIHtcbiAgICAgICAgbGV0IG4gPSBkb2N1bWVudC5nZXROb2RlKGFuY2hvcktleSlcblxuICAgICAgICB3aGlsZSAoaGFzVm9pZFBhcmVudCkge1xuICAgICAgICAgIG4gPSBkb2N1bWVudC5nZXROZXh0VGV4dChuLmtleSlcbiAgICAgICAgICBpZiAoIW4pIGJyZWFrXG4gICAgICAgICAgaGFzVm9pZFBhcmVudCA9IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQobi5rZXkpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobikgY2hhbmdlLmNvbGxhcHNlVG9TdGFydE9mKG4pXG4gICAgICB9XG5cbiAgICAgIHRleHRcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAuZm9yRWFjaCgobGluZSwgaSkgPT4ge1xuICAgICAgICAgIGlmIChpID4gMCkgY2hhbmdlLnNwbGl0QmxvY2soKVxuICAgICAgICAgIGNoYW5nZS5pbnNlcnRUZXh0KGxpbmUpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT0gJ2ZyYWdtZW50Jykge1xuICAgICAgY2hhbmdlLmluc2VydEZyYWdtZW50KGZyYWdtZW50KVxuICAgIH1cblxuICAgIGlmICh0eXBlID09ICdub2RlJyAmJiBCbG9jay5pc0Jsb2NrKG5vZGUpKSB7XG4gICAgICBjaGFuZ2UuaW5zZXJ0QmxvY2sobm9kZSkucmVtb3ZlTm9kZUJ5S2V5KG5vZGUua2V5KVxuICAgIH1cblxuICAgIGlmICh0eXBlID09ICdub2RlJyAmJiBJbmxpbmUuaXNJbmxpbmUobm9kZSkpIHtcbiAgICAgIGNoYW5nZS5pbnNlcnRJbmxpbmUobm9kZSkucmVtb3ZlTm9kZUJ5S2V5KG5vZGUua2V5KVxuICAgIH1cblxuICAgIC8vIENPTVBBVDogUmVhY3QncyBvblNlbGVjdCBldmVudCBicmVha3MgYWZ0ZXIgYW4gb25Ecm9wIGV2ZW50XG4gICAgLy8gaGFzIGZpcmVkIGluIGEgbm9kZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8xMTM3OS5cbiAgICAvLyBVbnRpbCB0aGlzIGlzIGZpeGVkIGluIFJlYWN0LCB3ZSBkaXNwYXRjaCBhIG1vdXNldXAgZXZlbnQgb24gdGhhdFxuICAgIC8vIERPTSBub2RlLCBzaW5jZSB0aGF0IHdpbGwgbWFrZSBpdCBnbyBiYWNrIHRvIG5vcm1hbC5cbiAgICBjb25zdCBmb2N1c05vZGUgPSBkb2N1bWVudC5nZXROb2RlKHRhcmdldC5mb2N1c0tleSlcbiAgICBjb25zdCBlbCA9IGZpbmRET01Ob2RlKGZvY3VzTm9kZSwgd2luZG93KVxuICAgIGlmICghZWwpIHJldHVyblxuXG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudCgnbW91c2V1cCcsIHtcbiAgICAgIHZpZXc6IHdpbmRvdyxcbiAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogT24gaW5wdXQuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50dmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uSW5wdXQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgZGVidWcoJ29uSW5wdXQnLCB7IGV2ZW50IH0pXG5cbiAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coZXZlbnQudGFyZ2V0KVxuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuXG4gICAgLy8gR2V0IHRoZSBzZWxlY3Rpb24gcG9pbnQuXG4gICAgY29uc3QgbmF0aXZlID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3QgeyBhbmNob3JOb2RlLCBhbmNob3JPZmZzZXQgfSA9IG5hdGl2ZVxuICAgIGNvbnN0IHBvaW50ID0gZmluZFBvaW50KGFuY2hvck5vZGUsIGFuY2hvck9mZnNldCwgdmFsdWUpXG4gICAgaWYgKCFwb2ludCkgcmV0dXJuXG5cbiAgICAvLyBHZXQgdGhlIHRleHQgbm9kZSBhbmQgbGVhZiBpbiBxdWVzdGlvbi5cbiAgICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmdldERlc2NlbmRhbnQocG9pbnQua2V5KVxuICAgIGNvbnN0IGJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKG5vZGUua2V5KVxuICAgIGNvbnN0IGxlYXZlcyA9IG5vZGUuZ2V0TGVhdmVzKClcbiAgICBjb25zdCBsYXN0VGV4dCA9IGJsb2NrLmdldExhc3RUZXh0KClcbiAgICBjb25zdCBsYXN0TGVhZiA9IGxlYXZlcy5sYXN0KClcbiAgICBsZXQgc3RhcnQgPSAwXG4gICAgbGV0IGVuZCA9IDBcblxuICAgIGNvbnN0IGxlYWYgPSBsZWF2ZXMuZmluZCgocikgPT4ge1xuICAgICAgc3RhcnQgPSBlbmRcbiAgICAgIGVuZCArPSByLnRleHQubGVuZ3RoXG4gICAgICBpZiAoZW5kID49IHBvaW50Lm9mZnNldCkgcmV0dXJuIHRydWVcbiAgICB9KSB8fCBsYXN0TGVhZlxuXG4gICAgLy8gR2V0IHRoZSB0ZXh0IGluZm9ybWF0aW9uLlxuICAgIGNvbnN0IHsgdGV4dCB9ID0gbGVhZlxuICAgIGxldCB7IHRleHRDb250ZW50IH0gPSBhbmNob3JOb2RlXG4gICAgY29uc3QgaXNMYXN0VGV4dCA9IG5vZGUgPT0gbGFzdFRleHRcbiAgICBjb25zdCBpc0xhc3RMZWFmID0gbGVhZiA9PSBsYXN0TGVhZlxuICAgIGNvbnN0IGxhc3RDaGFyID0gdGV4dENvbnRlbnQuY2hhckF0KHRleHRDb250ZW50Lmxlbmd0aCAtIDEpXG5cbiAgICAvLyBDT01QQVQ6IElmIHRoaXMgaXMgdGhlIGxhc3QgbGVhZiwgYW5kIHRoZSBET00gdGV4dCBlbmRzIGluIGEgbmV3IGxpbmUsXG4gICAgLy8gd2Ugd2lsbCBoYXZlIGFkZGVkIGFub3RoZXIgbmV3IGxpbmUgaW4gPExlYWY+J3MgcmVuZGVyIG1ldGhvZCB0byBhY2NvdW50XG4gICAgLy8gZm9yIGJyb3dzZXJzIGNvbGxhcHNpbmcgYSBzaW5nbGUgdHJhaWxpbmcgbmV3IGxpbmVzLCBzbyByZW1vdmUgaXQuXG4gICAgaWYgKGlzTGFzdFRleHQgJiYgaXNMYXN0TGVhZiAmJiBsYXN0Q2hhciA9PSAnXFxuJykge1xuICAgICAgdGV4dENvbnRlbnQgPSB0ZXh0Q29udGVudC5zbGljZSgwLCAtMSlcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgdGV4dCBpcyBubyBkaWZmZXJlbnQsIGFib3J0LlxuICAgIGlmICh0ZXh0Q29udGVudCA9PSB0ZXh0KSByZXR1cm5cblxuICAgIC8vIERldGVybWluZSB3aGF0IHRoZSBzZWxlY3Rpb24gc2hvdWxkIGJlIGFmdGVyIGNoYW5naW5nIHRoZSB0ZXh0LlxuICAgIGNvbnN0IGRlbHRhID0gdGV4dENvbnRlbnQubGVuZ3RoIC0gdGV4dC5sZW5ndGhcbiAgICBjb25zdCBjb3JyZWN0ZWQgPSBzZWxlY3Rpb24uY29sbGFwc2VUb0VuZCgpLm1vdmUoZGVsdGEpXG4gICAgY29uc3QgZW50aXJlID0gc2VsZWN0aW9uLm1vdmVBbmNob3JUbyhwb2ludC5rZXksIHN0YXJ0KS5tb3ZlRm9jdXNUbyhwb2ludC5rZXksIGVuZClcblxuICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCB2YWx1ZSB0byBoYXZlIHRoZSBsZWFmJ3MgdGV4dCByZXBsYWNlZC5cbiAgICBjaGFuZ2VcbiAgICAgIC5pbnNlcnRUZXh0QXRSYW5nZShlbnRpcmUsIHRleHRDb250ZW50LCBsZWFmLm1hcmtzKVxuICAgICAgLnNlbGVjdChjb3JyZWN0ZWQpXG4gIH1cblxuICAvKipcbiAgICogT24ga2V5IGRvd24uXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvbktleURvd24oZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgZGVidWcoJ29uS2V5RG93bicsIHsgZXZlbnQgfSlcblxuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuXG4gICAgLy8gQ09NUEFUOiBJbiBpT1MsIHNvbWUgb2YgdGhlc2UgaG90a2V5cyBhcmUgaGFuZGxlZCBpbiB0aGVcbiAgICAvLyBgb25OYXRpdmVCZWZvcmVJbnB1dGAgaGFuZGxlciBvZiB0aGUgYDxDb250ZW50PmAgY29tcG9uZW50IGluIG9yZGVyIHRvXG4gICAgLy8gcHJlc2VydmUgbmF0aXZlIGF1dG9jb3JyZWN0IGJlaGF2aW9yLCBzbyB0aGV5IHNob3VsZG4ndCBiZSBoYW5kbGVkIGhlcmUuXG4gICAgaWYgKEhPVEtFWVMuU1BMSVRfQkxPQ0soZXZlbnQpICYmICFJU19JT1MpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5pc0luVm9pZFxuICAgICAgICA/IGNoYW5nZS5jb2xsYXBzZVRvU3RhcnRPZk5leHRUZXh0KClcbiAgICAgICAgOiBjaGFuZ2Uuc3BsaXRCbG9jaygpXG4gICAgfVxuXG4gICAgaWYgKEhPVEtFWVMuREVMRVRFX0NIQVJfQkFDS1dBUkQoZXZlbnQpICYmICFJU19JT1MpIHtcbiAgICAgIHJldHVybiBjaGFuZ2UuZGVsZXRlQ2hhckJhY2t3YXJkKClcbiAgICB9XG5cbiAgICBpZiAoSE9US0VZUy5ERUxFVEVfQ0hBUl9GT1JXQVJEKGV2ZW50KSAmJiAhSVNfSU9TKSB7XG4gICAgICByZXR1cm4gY2hhbmdlLmRlbGV0ZUNoYXJGb3J3YXJkKClcbiAgICB9XG5cbiAgICBpZiAoSE9US0VZUy5ERUxFVEVfTElORV9CQUNLV0FSRChldmVudCkpIHtcbiAgICAgIHJldHVybiBjaGFuZ2UuZGVsZXRlTGluZUJhY2t3YXJkKClcbiAgICB9XG5cbiAgICBpZiAoSE9US0VZUy5ERUxFVEVfTElORV9GT1JXQVJEKGV2ZW50KSkge1xuICAgICAgcmV0dXJuIGNoYW5nZS5kZWxldGVMaW5lRm9yd2FyZCgpXG4gICAgfVxuXG4gICAgaWYgKEhPVEtFWVMuREVMRVRFX1dPUkRfQkFDS1dBUkQoZXZlbnQpKSB7XG4gICAgICByZXR1cm4gY2hhbmdlLmRlbGV0ZVdvcmRCYWNrd2FyZCgpXG4gICAgfVxuXG4gICAgaWYgKEhPVEtFWVMuREVMRVRFX1dPUkRfRk9SV0FSRChldmVudCkpIHtcbiAgICAgIHJldHVybiBjaGFuZ2UuZGVsZXRlV29yZEZvcndhcmQoKVxuICAgIH1cblxuICAgIGlmIChIT1RLRVlTLlJFRE8oZXZlbnQpKSB7XG4gICAgICByZXR1cm4gY2hhbmdlLnJlZG8oKVxuICAgIH1cblxuICAgIGlmIChIT1RLRVlTLlVORE8oZXZlbnQpKSB7XG4gICAgICByZXR1cm4gY2hhbmdlLnVuZG8oKVxuICAgIH1cblxuICAgIC8vIENPTVBBVDogQ2VydGFpbiBicm93c2VycyBkb24ndCBoYW5kbGUgdGhlIHNlbGVjdGlvbiB1cGRhdGVzIHByb3Blcmx5LiBJblxuICAgIC8vIENocm9tZSwgdGhlIHNlbGVjdGlvbiBpc24ndCBwcm9wZXJseSBleHRlbmRlZC4gQW5kIGluIEZpcmVmb3gsIHRoZVxuICAgIC8vIHNlbGVjdGlvbiBpc24ndCBwcm9wZXJseSBjb2xsYXBzZWQuICgyMDE3LzEwLzE3KVxuICAgIGlmIChIT1RLRVlTLkNPTExBUFNFX0xJTkVfQkFDS1dBUkQoZXZlbnQpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gY2hhbmdlLmNvbGxhcHNlTGluZUJhY2t3YXJkKClcbiAgICB9XG5cbiAgICBpZiAoSE9US0VZUy5DT0xMQVBTRV9MSU5FX0ZPUldBUkQoZXZlbnQpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gY2hhbmdlLmNvbGxhcHNlTGluZUZvcndhcmQoKVxuICAgIH1cblxuICAgIGlmIChIT1RLRVlTLkVYVEVORF9MSU5FX0JBQ0tXQVJEKGV2ZW50KSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGNoYW5nZS5leHRlbmRMaW5lQmFja3dhcmQoKVxuICAgIH1cblxuICAgIGlmIChIT1RLRVlTLkVYVEVORF9MSU5FX0ZPUldBUkQoZXZlbnQpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gY2hhbmdlLmV4dGVuZExpbmVGb3J3YXJkKClcbiAgICB9XG5cbiAgICAvLyBDT01QQVQ6IElmIGEgdm9pZCBub2RlIGlzIHNlbGVjdGVkLCBvciBhIHplcm8td2lkdGggdGV4dCBub2RlIGFkamFjZW50IHRvXG4gICAgLy8gYW4gaW5saW5lIGlzIHNlbGVjdGVkLCB3ZSBuZWVkIHRvIGhhbmRsZSB0aGVzZSBob3RrZXlzIG1hbnVhbGx5IGJlY2F1c2VcbiAgICAvLyBicm93c2VycyB3b24ndCBrbm93IHdoYXQgdG8gZG8uXG4gICAgaWYgKEhPVEtFWVMuQ09MTEFQU0VfQ0hBUl9CQUNLV0FSRChldmVudCkpIHtcbiAgICAgIGNvbnN0IHsgZG9jdW1lbnQsIGlzSW5Wb2lkLCBwcmV2aW91c1RleHQsIHN0YXJ0VGV4dCB9ID0gdmFsdWVcbiAgICAgIGNvbnN0IGlzUHJldmlvdXNJblZvaWQgPSBwcmV2aW91c1RleHQgJiYgZG9jdW1lbnQuaGFzVm9pZFBhcmVudChwcmV2aW91c1RleHQua2V5KVxuICAgICAgaWYgKGlzSW5Wb2lkIHx8IGlzUHJldmlvdXNJblZvaWQgfHwgc3RhcnRUZXh0LnRleHQgPT0gJycpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICByZXR1cm4gY2hhbmdlLmNvbGxhcHNlQ2hhckJhY2t3YXJkKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoSE9US0VZUy5DT0xMQVBTRV9DSEFSX0ZPUldBUkQoZXZlbnQpKSB7XG4gICAgICBjb25zdCB7IGRvY3VtZW50LCBpc0luVm9pZCwgbmV4dFRleHQsIHN0YXJ0VGV4dCB9ID0gdmFsdWVcbiAgICAgIGNvbnN0IGlzTmV4dEluVm9pZCA9IG5leHRUZXh0ICYmIGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQobmV4dFRleHQua2V5KVxuICAgICAgaWYgKGlzSW5Wb2lkIHx8IGlzTmV4dEluVm9pZCB8fCBzdGFydFRleHQudGV4dCA9PSAnJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHJldHVybiBjaGFuZ2UuY29sbGFwc2VDaGFyRm9yd2FyZCgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKEhPVEtFWVMuRVhURU5EX0NIQVJfQkFDS1dBUkQoZXZlbnQpKSB7XG4gICAgICBjb25zdCB7IGRvY3VtZW50LCBpc0luVm9pZCwgcHJldmlvdXNUZXh0LCBzdGFydFRleHQgfSA9IHZhbHVlXG4gICAgICBjb25zdCBpc1ByZXZpb3VzSW5Wb2lkID0gcHJldmlvdXNUZXh0ICYmIGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQocHJldmlvdXNUZXh0LmtleSlcbiAgICAgIGlmIChpc0luVm9pZCB8fCBpc1ByZXZpb3VzSW5Wb2lkIHx8IHN0YXJ0VGV4dC50ZXh0ID09ICcnKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgcmV0dXJuIGNoYW5nZS5leHRlbmRDaGFyQmFja3dhcmQoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChIT1RLRVlTLkVYVEVORF9DSEFSX0ZPUldBUkQoZXZlbnQpKSB7XG4gICAgICBjb25zdCB7IGRvY3VtZW50LCBpc0luVm9pZCwgbmV4dFRleHQsIHN0YXJ0VGV4dCB9ID0gdmFsdWVcbiAgICAgIGNvbnN0IGlzTmV4dEluVm9pZCA9IG5leHRUZXh0ICYmIGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQobmV4dFRleHQua2V5KVxuICAgICAgaWYgKGlzSW5Wb2lkIHx8IGlzTmV4dEluVm9pZCB8fCBzdGFydFRleHQudGV4dCA9PSAnJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHJldHVybiBjaGFuZ2UuZXh0ZW5kQ2hhckZvcndhcmQoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBwYXN0ZS5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uUGFzdGUoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgZGVidWcoJ29uUGFzdGUnLCB7IGV2ZW50IH0pXG5cbiAgICBjb25zdCB0cmFuc2ZlciA9IGdldEV2ZW50VHJhbnNmZXIoZXZlbnQpXG4gICAgY29uc3QgeyB0eXBlLCBmcmFnbWVudCwgdGV4dCB9ID0gdHJhbnNmZXJcblxuICAgIGlmICh0eXBlID09ICdmcmFnbWVudCcpIHtcbiAgICAgIGNoYW5nZS5pbnNlcnRGcmFnbWVudChmcmFnbWVudClcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PSAndGV4dCcgfHwgdHlwZSA9PSAnaHRtbCcpIHtcbiAgICAgIGlmICghdGV4dCkgcmV0dXJuXG4gICAgICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgICAgIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiwgc3RhcnRCbG9jayB9ID0gdmFsdWVcbiAgICAgIGlmIChzdGFydEJsb2NrLmlzVm9pZCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGRlZmF1bHRCbG9jayA9IHN0YXJ0QmxvY2tcbiAgICAgIGNvbnN0IGRlZmF1bHRNYXJrcyA9IGRvY3VtZW50LmdldEluc2VydE1hcmtzQXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBjb25zdCBmcmFnID0gUGxhaW4uZGVzZXJpYWxpemUodGV4dCwgeyBkZWZhdWx0QmxvY2ssIGRlZmF1bHRNYXJrcyB9KS5kb2N1bWVudFxuICAgICAgY2hhbmdlLmluc2VydEZyYWdtZW50KGZyYWcpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIHNlbGVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uU2VsZWN0KGV2ZW50LCBjaGFuZ2UsIGVkaXRvcikge1xuICAgIGRlYnVnKCdvblNlbGVjdCcsIHsgZXZlbnQgfSlcblxuICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdyhldmVudC50YXJnZXQpXG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gICAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgICBjb25zdCBuYXRpdmUgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcblxuICAgIC8vIElmIHRoZXJlIGFyZSBubyByYW5nZXMsIHRoZSBlZGl0b3Igd2FzIGJsdXJyZWQgbmF0aXZlbHkuXG4gICAgaWYgKCFuYXRpdmUucmFuZ2VDb3VudCkge1xuICAgICAgY2hhbmdlLmJsdXIoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBkZXRlcm1pbmUgdGhlIFNsYXRlIHNlbGVjdGlvbiBmcm9tIHRoZSBuYXRpdmUgb25lLlxuICAgIGxldCByYW5nZSA9IGZpbmRSYW5nZShuYXRpdmUsIHZhbHVlKVxuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgY29uc3QgeyBhbmNob3JLZXksIGFuY2hvck9mZnNldCwgZm9jdXNLZXksIGZvY3VzT2Zmc2V0IH0gPSByYW5nZVxuICAgIGNvbnN0IGFuY2hvclRleHQgPSBkb2N1bWVudC5nZXROb2RlKGFuY2hvcktleSlcbiAgICBjb25zdCBmb2N1c1RleHQgPSBkb2N1bWVudC5nZXROb2RlKGZvY3VzS2V5KVxuICAgIGNvbnN0IGFuY2hvcklubGluZSA9IGRvY3VtZW50LmdldENsb3Nlc3RJbmxpbmUoYW5jaG9yS2V5KVxuICAgIGNvbnN0IGZvY3VzSW5saW5lID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShmb2N1c0tleSlcbiAgICBjb25zdCBmb2N1c0Jsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKGZvY3VzS2V5KVxuICAgIGNvbnN0IGFuY2hvckJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKGFuY2hvcktleSlcblxuICAgIC8vIENPTVBBVDogSWYgdGhlIGFuY2hvciBwb2ludCBpcyBhdCB0aGUgc3RhcnQgb2YgYSBub24tdm9pZCwgYW5kIHRoZVxuICAgIC8vIGZvY3VzIHBvaW50IGlzIGluc2lkZSBhIHZvaWQgbm9kZSB3aXRoIGFuIG9mZnNldCB0aGF0IGlzbid0IGAwYCwgc2V0XG4gICAgLy8gdGhlIGZvY3VzIG9mZnNldCB0byBgMGAuIFRoaXMgaXMgZHVlIHRvIHZvaWQgbm9kZXMgPHNwYW4+J3MgYmVpbmdcbiAgICAvLyBwb3NpdGlvbmVkIG9mZiBzY3JlZW4sIHJlc3VsdGluZyBpbiB0aGUgb2Zmc2V0IGFsd2F5cyBiZWluZyBncmVhdGVyXG4gICAgLy8gdGhhbiBgMGAuIFNpbmNlIHdlIGNhbid0IGtub3cgd2hhdCBpdCByZWFsbHkgc2hvdWxkIGJlLCBhbmQgc2luY2UgYW5cbiAgICAvLyBvZmZzZXQgb2YgYDBgIGlzIGxlc3MgZGVzdHJ1Y3RpdmUgYmVjYXVzZSBpdCBjcmVhdGVzIGEgaGFuZ2luZ1xuICAgIC8vIHNlbGVjdGlvbiwgZ28gd2l0aCBgMGAuICgyMDE3LzA5LzA3KVxuICAgIGlmIChcbiAgICAgIGFuY2hvckJsb2NrICYmXG4gICAgICAhYW5jaG9yQmxvY2suaXNWb2lkICYmXG4gICAgICBhbmNob3JPZmZzZXQgPT0gMCAmJlxuICAgICAgZm9jdXNCbG9jayAmJlxuICAgICAgZm9jdXNCbG9jay5pc1ZvaWQgJiZcbiAgICAgIGZvY3VzT2Zmc2V0ICE9IDBcbiAgICApIHtcbiAgICAgIHJhbmdlID0gcmFuZ2Uuc2V0KCdmb2N1c09mZnNldCcsIDApXG4gICAgfVxuXG4gICAgLy8gQ09NUEFUOiBJZiB0aGUgc2VsZWN0aW9uIGlzIGF0IHRoZSBlbmQgb2YgYSBub24tdm9pZCBpbmxpbmUgbm9kZSwgYW5kXG4gICAgLy8gdGhlcmUgaXMgYSBub2RlIGFmdGVyIGl0LCBwdXQgaXQgaW4gdGhlIG5vZGUgYWZ0ZXIgaW5zdGVhZC4gVGhpc1xuICAgIC8vIHN0YW5kYXJkaXplcyB0aGUgYmVoYXZpb3IsIHNpbmNlIGl0J3MgaW5kaXN0aW5ndWlzaGFibGUgdG8gdGhlIHVzZXIuXG4gICAgaWYgKFxuICAgICAgYW5jaG9ySW5saW5lICYmXG4gICAgICAhYW5jaG9ySW5saW5lLmlzVm9pZCAmJlxuICAgICAgYW5jaG9yT2Zmc2V0ID09IGFuY2hvclRleHQudGV4dC5sZW5ndGhcbiAgICApIHtcbiAgICAgIGNvbnN0IGJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKGFuY2hvcktleSlcbiAgICAgIGNvbnN0IG5leHQgPSBibG9jay5nZXROZXh0VGV4dChhbmNob3JLZXkpXG4gICAgICBpZiAobmV4dCkgcmFuZ2UgPSByYW5nZS5tb3ZlQW5jaG9yVG8obmV4dC5rZXksIDApXG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgZm9jdXNJbmxpbmUgJiZcbiAgICAgICFmb2N1c0lubGluZS5pc1ZvaWQgJiZcbiAgICAgIGZvY3VzT2Zmc2V0ID09IGZvY3VzVGV4dC50ZXh0Lmxlbmd0aFxuICAgICkge1xuICAgICAgY29uc3QgYmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soZm9jdXNLZXkpXG4gICAgICBjb25zdCBuZXh0ID0gYmxvY2suZ2V0TmV4dFRleHQoZm9jdXNLZXkpXG4gICAgICBpZiAobmV4dCkgcmFuZ2UgPSByYW5nZS5tb3ZlRm9jdXNUbyhuZXh0LmtleSwgMClcbiAgICB9XG5cbiAgICByYW5nZSA9IHJhbmdlLm5vcm1hbGl6ZShkb2N1bWVudClcbiAgICBjaGFuZ2Uuc2VsZWN0KHJhbmdlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciBlZGl0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgZnVuY3Rpb24gcmVuZGVyRWRpdG9yKHByb3BzLCBlZGl0b3IpIHtcbiAgICBjb25zdCBoYW5kbGVycyA9IEVWRU5UX0hBTkRMRVJTLnJlZHVjZSgob2JqLCBoYW5kbGVyKSA9PiB7XG4gICAgICBvYmpbaGFuZGxlcl0gPSBlZGl0b3JbaGFuZGxlcl1cbiAgICAgIHJldHVybiBvYmpcbiAgICB9LCB7fSlcblxuICAgIHJldHVybiAoXG4gICAgICA8Q29udGVudFxuICAgICAgICB7Li4uaGFuZGxlcnN9XG4gICAgICAgIGF1dG9Db3JyZWN0PXtwcm9wcy5hdXRvQ29ycmVjdH1cbiAgICAgICAgYXV0b0ZvY3VzPXtwcm9wcy5hdXRvRm9jdXN9XG4gICAgICAgIGNsYXNzTmFtZT17cHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICBjaGlsZHJlbj17cHJvcHMuY2hpbGRyZW59XG4gICAgICAgIGVkaXRvcj17ZWRpdG9yfVxuICAgICAgICByZWFkT25seT17cHJvcHMucmVhZE9ubHl9XG4gICAgICAgIHJvbGU9e3Byb3BzLnJvbGV9XG4gICAgICAgIHNwZWxsQ2hlY2s9e3Byb3BzLnNwZWxsQ2hlY2t9XG4gICAgICAgIHN0eWxlPXtwcm9wcy5zdHlsZX1cbiAgICAgICAgdGFiSW5kZXg9e3Byb3BzLnRhYkluZGV4fVxuICAgICAgICB0YWdOYW1lPXtwcm9wcy50YWdOYW1lfVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgKi9cblxuICBmdW5jdGlvbiByZW5kZXJOb2RlKHByb3BzKSB7XG4gICAgY29uc3QgeyBhdHRyaWJ1dGVzLCBjaGlsZHJlbiwgbm9kZSB9ID0gcHJvcHNcbiAgICBpZiAobm9kZS5vYmplY3QgIT0gJ2Jsb2NrJyAmJiBub2RlLm9iamVjdCAhPSAnaW5saW5lJykgcmV0dXJuXG4gICAgY29uc3QgVGFnID0gbm9kZS5vYmplY3QgPT0gJ2Jsb2NrJyA/ICdkaXYnIDogJ3NwYW4nXG4gICAgY29uc3Qgc3R5bGUgPSB7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH1cbiAgICByZXR1cm4gPFRhZyB7Li4uYXR0cmlidXRlc30gc3R5bGU9e3N0eWxlfT57Y2hpbGRyZW59PC9UYWc+XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHBsYWNlaG9sZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICovXG5cbiAgZnVuY3Rpb24gcmVuZGVyUGxhY2Vob2xkZXIocHJvcHMpIHtcbiAgICBjb25zdCB7IGVkaXRvciwgbm9kZSB9ID0gcHJvcHNcbiAgICBpZiAoIWVkaXRvci5wcm9wcy5wbGFjZWhvbGRlcikgcmV0dXJuXG4gICAgaWYgKGVkaXRvci5zdGF0ZS5pc0NvbXBvc2luZykgcmV0dXJuXG4gICAgaWYgKG5vZGUub2JqZWN0ICE9ICdibG9jaycpIHJldHVyblxuICAgIGlmICghVGV4dC5pc1RleHRMaXN0KG5vZGUubm9kZXMpKSByZXR1cm5cbiAgICBpZiAobm9kZS50ZXh0ICE9ICcnKSByZXR1cm5cbiAgICBpZiAoZWRpdG9yLnZhbHVlLmRvY3VtZW50LmdldEJsb2NrcygpLnNpemUgPiAxKSByZXR1cm5cblxuICAgIGNvbnN0IHN0eWxlID0ge1xuICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICB3aWR0aDogJzAnLFxuICAgICAgbWF4V2lkdGg6ICcxMDAlJyxcbiAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgICAgb3BhY2l0eTogJzAuMzMzJyxcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY29udGVudEVkaXRhYmxlPXtmYWxzZX0gc3R5bGU9e3N0eWxlfT5cbiAgICAgICAge2VkaXRvci5wcm9wcy5wbGFjZWhvbGRlcn1cbiAgICAgIDwvc3Bhbj5cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBwbHVnaW4uXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHJldHVybiB7XG4gICAgb25CZWZvcmVJbnB1dCxcbiAgICBvbkJsdXIsXG4gICAgb25DbGljayxcbiAgICBvbkNvcHksXG4gICAgb25DdXQsXG4gICAgb25EcmFnRW5kLFxuICAgIG9uRHJhZ092ZXIsXG4gICAgb25EcmFnU3RhcnQsXG4gICAgb25Ecm9wLFxuICAgIG9uSW5wdXQsXG4gICAgb25LZXlEb3duLFxuICAgIG9uUGFzdGUsXG4gICAgb25TZWxlY3QsXG4gICAgcmVuZGVyRWRpdG9yLFxuICAgIHJlbmRlck5vZGUsXG4gICAgcmVuZGVyUGxhY2Vob2xkZXIsXG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBBZnRlclBsdWdpblxuIl19