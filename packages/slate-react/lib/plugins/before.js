'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _reactDom = require('react-dom');

var _hotkeys = require('../constants/hotkeys');

var _hotkeys2 = _interopRequireDefault(_hotkeys);

var _environment = require('../constants/environment');

var _findNode = require('../utils/find-node');

var _findNode2 = _interopRequireDefault(_findNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:before');

/**
 * The core before plugin.
 *
 * @return {Object}
 */

function BeforePlugin() {
  var activeElement = null;
  var compositionCount = 0;
  var isComposing = false;
  var isCopying = false;
  var isDragging = false;

  /**
   * On before input.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBeforeInput(event, change, editor) {
    if (editor.props.readOnly) return true;

    // COMPAT: React's `onBeforeInput` synthetic event is based on the native
    // `keypress` and `textInput` events. In browsers that support the native
    // `beforeinput` event, we instead use that event to trigger text insertion,
    // since it provides more useful information about the range being affected
    // and also preserves compatibility with iOS autocorrect, which would be
    // broken if we called `preventDefault()` on React's synthetic event here.
    // Since native `onbeforeinput` mainly benefits autocorrect and spellcheck
    // for mobile, on desktop it brings IME issue, limit its scope for now.
    if ((_environment.IS_IOS || _environment.IS_ANDROID) && _environment.SUPPORTED_EVENTS.beforeinput) return true;

    debug('onBeforeInput', { event: event });
  }

  /**
   * On blur.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBlur(event, change, editor) {
    if (isCopying) return true;
    if (editor.props.readOnly) return true;

    var value = change.value;
    var relatedTarget = event.relatedTarget,
        target = event.target;

    var window = (0, _getWindow2.default)(target);

    // COMPAT: If the current `activeElement` is still the previous one, this is
    // due to the window being blurred when the tab itself becomes unfocused, so
    // we want to abort early to allow to editor to stay focused when the tab
    // becomes focused again.
    if (activeElement == window.document.activeElement) return true;

    // COMPAT: The `relatedTarget` can be null when the new focus target is not
    // a "focusable" element (eg. a `<div>` without `tabindex` set).
    if (relatedTarget) {
      var el = (0, _reactDom.findDOMNode)(editor);

      // COMPAT: The event should be ignored if the focus is returning to the
      // editor from an embedded editable element (eg. an <input> element inside
      // a void node).
      if (relatedTarget == el) return true;

      // COMPAT: The event should be ignored if the focus is moving from the
      // editor to inside a void node's spacer element.
      if (relatedTarget.hasAttribute('data-slate-spacer')) return true;

      // COMPAT: The event should be ignored if the focus is moving to a non-
      // editable section of an element that isn't a void node (eg. a list item
      // of the check list example).
      var node = (0, _findNode2.default)(relatedTarget, value);
      if (el.contains(relatedTarget) && node && !node.isVoid) return true;
    }

    debug('onBlur', { event: event });
  }

  /**
   * On change.
   *
   * @param {Change} change
   * @param {Editor} editor
   */

  function onChange(change, editor) {
    var value = change.value;

    // If the value's schema isn't the editor's schema, update it. This can
    // happen on the initialization of the editor, or if the schema changes.
    // This change isn't save into history since only schema is updated.

    if (value.schema != editor.schema) {
      change.setValue({ schema: editor.schema }, { save: false }).normalize();
    }

    debug('onChange');
  }

  /**
   * On composition end.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCompositionEnd(event, change, editor) {
    var n = compositionCount;

    // The `count` check here ensures that if another composition starts
    // before the timeout has closed out this one, we will abort unsetting the
    // `isComposing` flag, since a composition is still in affect.
    window.requestAnimationFrame(function () {
      if (compositionCount > n) return;
      isComposing = false;

      // HACK: we need to re-render the editor here so that it will update its
      // placeholder in case one is currently rendered. This should be handled
      // differently ideally, in a less invasive way?
      editor.setState({ isComposing: false });
    });

    debug('onCompositionEnd', { event: event });
  }

  /**
   * On composition start.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCompositionStart(event, change, editor) {
    isComposing = true;
    compositionCount++;

    // HACK: we need to re-render the editor here so that it will update its
    // placeholder in case one is currently rendered. This should be handled
    // differently ideally, in a less invasive way?
    editor.setState({ isComposing: true });

    debug('onCompositionStart', { event: event });
  }

  /**
   * On copy.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCopy(event, change, editor) {
    var window = (0, _getWindow2.default)(event.target);
    isCopying = true;
    window.requestAnimationFrame(function () {
      return isCopying = false;
    });

    debug('onCopy', { event: event });
  }

  /**
   * On cut.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCut(event, change, editor) {
    if (editor.props.readOnly) return true;

    var window = (0, _getWindow2.default)(event.target);
    isCopying = true;
    window.requestAnimationFrame(function () {
      return isCopying = false;
    });

    debug('onCut', { event: event });
  }

  /**
   * On drag end.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragEnd(event, change, editor) {
    isDragging = false;

    debug('onDragEnd', { event: event });
  }

  /**
   * On drag enter.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragEnter(event, change, editor) {
    debug('onDragEnter', { event: event });
  }

  /**
   * On drag exit.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragExit(event, change, editor) {
    debug('onDragExit', { event: event });
  }

  /**
   * On drag leave.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragLeave(event, change, editor) {
    debug('onDragLeave', { event: event });
  }

  /**
   * On drag over.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragOver(event, change, editor) {
    // If the target is inside a void node, and only in this case,
    // call `preventDefault` to signal that drops are allowed.
    // When the target is editable, dropping is already allowed by
    // default, and calling `preventDefault` hides the cursor.
    var node = (0, _findNode2.default)(event.target, editor.value);
    if (node.isVoid) event.preventDefault();

    // If a drag is already in progress, don't do this again.
    if (isDragging) return true;

    isDragging = true;
    event.nativeEvent.dataTransfer.dropEffect = 'move';

    debug('onDragOver', { event: event });
  }

  /**
   * On drag start.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragStart(event, change, editor) {
    isDragging = true;

    debug('onDragStart', { event: event });
  }

  /**
   * On drop.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDrop(event, change, editor) {
    // Stop propagation so the event isn't visible to parent editors.
    event.stopPropagation();

    // Nothing happens in read-only mode.
    if (editor.props.readOnly) return true;

    // Prevent default so the DOM's value isn't corrupted.
    event.preventDefault();

    debug('onDrop', { event: event });
  }

  /**
   * On focus.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onFocus(event, change, editor) {
    if (isCopying) return true;
    if (editor.props.readOnly) return true;

    var el = (0, _reactDom.findDOMNode)(editor);

    // Save the new `activeElement`.
    var window = (0, _getWindow2.default)(event.target);
    activeElement = window.document.activeElement;

    // COMPAT: If the editor has nested editable elements, the focus can go to
    // those elements. In Firefox, this must be prevented because it results in
    // issues with keyboard navigation. (2017/03/30)
    if (_environment.IS_FIREFOX && event.target != el) {
      el.focus();
      return true;
    }

    debug('onFocus', { event: event });
  }

  /**
   * On input.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onInput(event, change, editor) {
    if (isComposing) return true;
    if (change.value.isBlurred) return true;

    debug('onInput', { event: event });
  }

  /**
   * On key down.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onKeyDown(event, change, editor) {
    if (editor.props.readOnly) return true;

    // When composing, we need to prevent all hotkeys from executing while
    // typing. However, certain characters also move the selection before
    // we're able to handle it, so prevent their default behavior.
    if (isComposing) {
      if (_hotkeys2.default.COMPOSING(event)) event.preventDefault();
      return true;
    }

    // Certain hotkeys have native behavior in contenteditable elements which
    // will cause our value to be out of sync, so prevent them.
    if (_hotkeys2.default.CONTENTEDITABLE(event) && !_environment.IS_IOS) {
      event.preventDefault();
    }

    debug('onKeyDown', { event: event });
  }

  /**
   * On paste.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onPaste(event, change, editor) {
    if (editor.props.readOnly) return true;

    // Prevent defaults so the DOM state isn't corrupted.
    event.preventDefault();

    debug('onPaste', { event: event });
  }

  /**
   * On select.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onSelect(event, change, editor) {
    if (isCopying) return true;
    if (isComposing) return true;
    if (editor.props.readOnly) return true;

    // Save the new `activeElement`.
    var window = (0, _getWindow2.default)(event.target);
    activeElement = window.document.activeElement;

    debug('onSelect', { event: event });
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onChange: onChange,
    onCompositionEnd: onCompositionEnd,
    onCompositionStart: onCompositionStart,
    onCopy: onCopy,
    onCut: onCut,
    onDragEnd: onDragEnd,
    onDragEnter: onDragEnter,
    onDragExit: onDragExit,
    onDragLeave: onDragLeave,
    onDragOver: onDragOver,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onFocus: onFocus,
    onInput: onInput,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect
  };
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = BeforePlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2JlZm9yZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsIkJlZm9yZVBsdWdpbiIsImFjdGl2ZUVsZW1lbnQiLCJjb21wb3NpdGlvbkNvdW50IiwiaXNDb21wb3NpbmciLCJpc0NvcHlpbmciLCJpc0RyYWdnaW5nIiwib25CZWZvcmVJbnB1dCIsImV2ZW50IiwiY2hhbmdlIiwiZWRpdG9yIiwicHJvcHMiLCJyZWFkT25seSIsImJlZm9yZWlucHV0Iiwib25CbHVyIiwidmFsdWUiLCJyZWxhdGVkVGFyZ2V0IiwidGFyZ2V0Iiwid2luZG93IiwiZG9jdW1lbnQiLCJlbCIsImhhc0F0dHJpYnV0ZSIsIm5vZGUiLCJjb250YWlucyIsImlzVm9pZCIsIm9uQ2hhbmdlIiwic2NoZW1hIiwic2V0VmFsdWUiLCJzYXZlIiwibm9ybWFsaXplIiwib25Db21wb3NpdGlvbkVuZCIsIm4iLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzZXRTdGF0ZSIsIm9uQ29tcG9zaXRpb25TdGFydCIsIm9uQ29weSIsIm9uQ3V0Iiwib25EcmFnRW5kIiwib25EcmFnRW50ZXIiLCJvbkRyYWdFeGl0Iiwib25EcmFnTGVhdmUiLCJvbkRyYWdPdmVyIiwicHJldmVudERlZmF1bHQiLCJuYXRpdmVFdmVudCIsImRhdGFUcmFuc2ZlciIsImRyb3BFZmZlY3QiLCJvbkRyYWdTdGFydCIsIm9uRHJvcCIsInN0b3BQcm9wYWdhdGlvbiIsIm9uRm9jdXMiLCJmb2N1cyIsIm9uSW5wdXQiLCJpc0JsdXJyZWQiLCJvbktleURvd24iLCJDT01QT1NJTkciLCJDT05URU5URURJVEFCTEUiLCJvblBhc3RlIiwib25TZWxlY3QiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7OztBQUNBOztBQU1BOzs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxxQkFBTSxjQUFOLENBQWQ7O0FBRUE7Ozs7OztBQU1BLFNBQVNDLFlBQVQsR0FBd0I7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LHdCQVJLO0FBU0xDLDRCQVRLO0FBVUxDLDBCQVZLO0FBV0xDLDRCQVhLO0FBWUxDLDBCQVpLO0FBYUxLLDRCQWJLO0FBY0xDLGtCQWRLO0FBZUxFLG9CQWZLO0FBZ0JMRSxvQkFoQks7QUFpQkxFLHdCQWpCSztBQWtCTEcsb0JBbEJLO0FBbUJMQztBQW5CSyxHQUFQO0FBcUJEOztBQUVEOzs7Ozs7a0JBTWV4RCxZIiwiZmlsZSI6ImJlZm9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJ1xuaW1wb3J0IGdldFdpbmRvdyBmcm9tICdnZXQtd2luZG93J1xuaW1wb3J0IHsgZmluZERPTU5vZGUgfSBmcm9tICdyZWFjdC1kb20nXG5cbmltcG9ydCBIT1RLRVlTIGZyb20gJy4uL2NvbnN0YW50cy9ob3RrZXlzJ1xuaW1wb3J0IHtcbiAgSVNfRklSRUZPWCxcbiAgSVNfSU9TLFxuICBJU19BTkRST0lELFxuICBTVVBQT1JURURfRVZFTlRTXG59IGZyb20gJy4uL2NvbnN0YW50cy9lbnZpcm9ubWVudCdcbmltcG9ydCBmaW5kTm9kZSBmcm9tICcuLi91dGlscy9maW5kLW5vZGUnXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOmJlZm9yZScpXG5cbi8qKlxuICogVGhlIGNvcmUgYmVmb3JlIHBsdWdpbi5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gQmVmb3JlUGx1Z2luKCkge1xuICBsZXQgYWN0aXZlRWxlbWVudCA9IG51bGxcbiAgbGV0IGNvbXBvc2l0aW9uQ291bnQgPSAwXG4gIGxldCBpc0NvbXBvc2luZyA9IGZhbHNlXG4gIGxldCBpc0NvcHlpbmcgPSBmYWxzZVxuICBsZXQgaXNEcmFnZ2luZyA9IGZhbHNlXG5cbiAgLyoqXG4gICAqIE9uIGJlZm9yZSBpbnB1dC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uQmVmb3JlSW5wdXQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaWYgKGVkaXRvci5wcm9wcy5yZWFkT25seSkgcmV0dXJuIHRydWVcblxuICAgIC8vIENPTVBBVDogUmVhY3QncyBgb25CZWZvcmVJbnB1dGAgc3ludGhldGljIGV2ZW50IGlzIGJhc2VkIG9uIHRoZSBuYXRpdmVcbiAgICAvLyBga2V5cHJlc3NgIGFuZCBgdGV4dElucHV0YCBldmVudHMuIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0aGUgbmF0aXZlXG4gICAgLy8gYGJlZm9yZWlucHV0YCBldmVudCwgd2UgaW5zdGVhZCB1c2UgdGhhdCBldmVudCB0byB0cmlnZ2VyIHRleHQgaW5zZXJ0aW9uLFxuICAgIC8vIHNpbmNlIGl0IHByb3ZpZGVzIG1vcmUgdXNlZnVsIGluZm9ybWF0aW9uIGFib3V0IHRoZSByYW5nZSBiZWluZyBhZmZlY3RlZFxuICAgIC8vIGFuZCBhbHNvIHByZXNlcnZlcyBjb21wYXRpYmlsaXR5IHdpdGggaU9TIGF1dG9jb3JyZWN0LCB3aGljaCB3b3VsZCBiZVxuICAgIC8vIGJyb2tlbiBpZiB3ZSBjYWxsZWQgYHByZXZlbnREZWZhdWx0KClgIG9uIFJlYWN0J3Mgc3ludGhldGljIGV2ZW50IGhlcmUuXG4gICAgLy8gU2luY2UgbmF0aXZlIGBvbmJlZm9yZWlucHV0YCBtYWlubHkgYmVuZWZpdHMgYXV0b2NvcnJlY3QgYW5kIHNwZWxsY2hlY2tcbiAgICAvLyBmb3IgbW9iaWxlLCBvbiBkZXNrdG9wIGl0IGJyaW5ncyBJTUUgaXNzdWUsIGxpbWl0IGl0cyBzY29wZSBmb3Igbm93LlxuICAgIGlmICgoSVNfSU9TIHx8IElTX0FORFJPSUQpICYmIFNVUFBPUlRFRF9FVkVOVFMuYmVmb3JlaW5wdXQpIHJldHVybiB0cnVlXG5cbiAgICBkZWJ1Zygnb25CZWZvcmVJbnB1dCcsIHsgZXZlbnQgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBibHVyLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25CbHVyKGV2ZW50LCBjaGFuZ2UsIGVkaXRvcikge1xuICAgIGlmIChpc0NvcHlpbmcpIHJldHVybiB0cnVlXG4gICAgaWYgKGVkaXRvci5wcm9wcy5yZWFkT25seSkgcmV0dXJuIHRydWVcblxuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICAgIGNvbnN0IHsgcmVsYXRlZFRhcmdldCwgdGFyZ2V0IH0gPSBldmVudFxuICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdyh0YXJnZXQpXG5cbiAgICAvLyBDT01QQVQ6IElmIHRoZSBjdXJyZW50IGBhY3RpdmVFbGVtZW50YCBpcyBzdGlsbCB0aGUgcHJldmlvdXMgb25lLCB0aGlzIGlzXG4gICAgLy8gZHVlIHRvIHRoZSB3aW5kb3cgYmVpbmcgYmx1cnJlZCB3aGVuIHRoZSB0YWIgaXRzZWxmIGJlY29tZXMgdW5mb2N1c2VkLCBzb1xuICAgIC8vIHdlIHdhbnQgdG8gYWJvcnQgZWFybHkgdG8gYWxsb3cgdG8gZWRpdG9yIHRvIHN0YXkgZm9jdXNlZCB3aGVuIHRoZSB0YWJcbiAgICAvLyBiZWNvbWVzIGZvY3VzZWQgYWdhaW4uXG4gICAgaWYgKGFjdGl2ZUVsZW1lbnQgPT0gd2luZG93LmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybiB0cnVlXG5cbiAgICAvLyBDT01QQVQ6IFRoZSBgcmVsYXRlZFRhcmdldGAgY2FuIGJlIG51bGwgd2hlbiB0aGUgbmV3IGZvY3VzIHRhcmdldCBpcyBub3RcbiAgICAvLyBhIFwiZm9jdXNhYmxlXCIgZWxlbWVudCAoZWcuIGEgYDxkaXY+YCB3aXRob3V0IGB0YWJpbmRleGAgc2V0KS5cbiAgICBpZiAocmVsYXRlZFRhcmdldCkge1xuICAgICAgY29uc3QgZWwgPSBmaW5kRE9NTm9kZShlZGl0b3IpXG5cbiAgICAgIC8vIENPTVBBVDogVGhlIGV2ZW50IHNob3VsZCBiZSBpZ25vcmVkIGlmIHRoZSBmb2N1cyBpcyByZXR1cm5pbmcgdG8gdGhlXG4gICAgICAvLyBlZGl0b3IgZnJvbSBhbiBlbWJlZGRlZCBlZGl0YWJsZSBlbGVtZW50IChlZy4gYW4gPGlucHV0PiBlbGVtZW50IGluc2lkZVxuICAgICAgLy8gYSB2b2lkIG5vZGUpLlxuICAgICAgaWYgKHJlbGF0ZWRUYXJnZXQgPT0gZWwpIHJldHVybiB0cnVlXG5cbiAgICAgIC8vIENPTVBBVDogVGhlIGV2ZW50IHNob3VsZCBiZSBpZ25vcmVkIGlmIHRoZSBmb2N1cyBpcyBtb3ZpbmcgZnJvbSB0aGVcbiAgICAgIC8vIGVkaXRvciB0byBpbnNpZGUgYSB2b2lkIG5vZGUncyBzcGFjZXIgZWxlbWVudC5cbiAgICAgIGlmIChyZWxhdGVkVGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zbGF0ZS1zcGFjZXInKSkgcmV0dXJuIHRydWVcblxuICAgICAgLy8gQ09NUEFUOiBUaGUgZXZlbnQgc2hvdWxkIGJlIGlnbm9yZWQgaWYgdGhlIGZvY3VzIGlzIG1vdmluZyB0byBhIG5vbi1cbiAgICAgIC8vIGVkaXRhYmxlIHNlY3Rpb24gb2YgYW4gZWxlbWVudCB0aGF0IGlzbid0IGEgdm9pZCBub2RlIChlZy4gYSBsaXN0IGl0ZW1cbiAgICAgIC8vIG9mIHRoZSBjaGVjayBsaXN0IGV4YW1wbGUpLlxuICAgICAgY29uc3Qgbm9kZSA9IGZpbmROb2RlKHJlbGF0ZWRUYXJnZXQsIHZhbHVlKVxuICAgICAgaWYgKGVsLmNvbnRhaW5zKHJlbGF0ZWRUYXJnZXQpICYmIG5vZGUgJiYgIW5vZGUuaXNWb2lkKSByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGRlYnVnKCdvbkJsdXInLCB7IGV2ZW50IH0pXG4gIH1cblxuICAvKipcbiAgICogT24gY2hhbmdlLlxuICAgKlxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25DaGFuZ2UoY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcblxuICAgIC8vIElmIHRoZSB2YWx1ZSdzIHNjaGVtYSBpc24ndCB0aGUgZWRpdG9yJ3Mgc2NoZW1hLCB1cGRhdGUgaXQuIFRoaXMgY2FuXG4gICAgLy8gaGFwcGVuIG9uIHRoZSBpbml0aWFsaXphdGlvbiBvZiB0aGUgZWRpdG9yLCBvciBpZiB0aGUgc2NoZW1hIGNoYW5nZXMuXG4gICAgLy8gVGhpcyBjaGFuZ2UgaXNuJ3Qgc2F2ZSBpbnRvIGhpc3Rvcnkgc2luY2Ugb25seSBzY2hlbWEgaXMgdXBkYXRlZC5cbiAgICBpZiAodmFsdWUuc2NoZW1hICE9IGVkaXRvci5zY2hlbWEpIHtcbiAgICAgIGNoYW5nZVxuICAgICAgICAuc2V0VmFsdWUoeyBzY2hlbWE6IGVkaXRvci5zY2hlbWEgfSwgeyBzYXZlOiBmYWxzZSB9KVxuICAgICAgICAubm9ybWFsaXplKClcbiAgICB9XG5cbiAgICBkZWJ1Zygnb25DaGFuZ2UnKVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGNvbXBvc2l0aW9uIGVuZC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uQ29tcG9zaXRpb25FbmQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgY29uc3QgbiA9IGNvbXBvc2l0aW9uQ291bnRcblxuICAgIC8vIFRoZSBgY291bnRgIGNoZWNrIGhlcmUgZW5zdXJlcyB0aGF0IGlmIGFub3RoZXIgY29tcG9zaXRpb24gc3RhcnRzXG4gICAgLy8gYmVmb3JlIHRoZSB0aW1lb3V0IGhhcyBjbG9zZWQgb3V0IHRoaXMgb25lLCB3ZSB3aWxsIGFib3J0IHVuc2V0dGluZyB0aGVcbiAgICAvLyBgaXNDb21wb3NpbmdgIGZsYWcsIHNpbmNlIGEgY29tcG9zaXRpb24gaXMgc3RpbGwgaW4gYWZmZWN0LlxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgaWYgKGNvbXBvc2l0aW9uQ291bnQgPiBuKSByZXR1cm5cbiAgICAgIGlzQ29tcG9zaW5nID0gZmFsc2VcblxuICAgICAgLy8gSEFDSzogd2UgbmVlZCB0byByZS1yZW5kZXIgdGhlIGVkaXRvciBoZXJlIHNvIHRoYXQgaXQgd2lsbCB1cGRhdGUgaXRzXG4gICAgICAvLyBwbGFjZWhvbGRlciBpbiBjYXNlIG9uZSBpcyBjdXJyZW50bHkgcmVuZGVyZWQuIFRoaXMgc2hvdWxkIGJlIGhhbmRsZWRcbiAgICAgIC8vIGRpZmZlcmVudGx5IGlkZWFsbHksIGluIGEgbGVzcyBpbnZhc2l2ZSB3YXk/XG4gICAgICBlZGl0b3Iuc2V0U3RhdGUoeyBpc0NvbXBvc2luZzogZmFsc2UgfSlcbiAgICB9KVxuXG4gICAgZGVidWcoJ29uQ29tcG9zaXRpb25FbmQnLCB7IGV2ZW50IH0pXG4gIH1cblxuICAvKipcbiAgICogT24gY29tcG9zaXRpb24gc3RhcnQuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvbkNvbXBvc2l0aW9uU3RhcnQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaXNDb21wb3NpbmcgPSB0cnVlXG4gICAgY29tcG9zaXRpb25Db3VudCsrXG5cbiAgICAvLyBIQUNLOiB3ZSBuZWVkIHRvIHJlLXJlbmRlciB0aGUgZWRpdG9yIGhlcmUgc28gdGhhdCBpdCB3aWxsIHVwZGF0ZSBpdHNcbiAgICAvLyBwbGFjZWhvbGRlciBpbiBjYXNlIG9uZSBpcyBjdXJyZW50bHkgcmVuZGVyZWQuIFRoaXMgc2hvdWxkIGJlIGhhbmRsZWRcbiAgICAvLyBkaWZmZXJlbnRseSBpZGVhbGx5LCBpbiBhIGxlc3MgaW52YXNpdmUgd2F5P1xuICAgIGVkaXRvci5zZXRTdGF0ZSh7IGlzQ29tcG9zaW5nOiB0cnVlIH0pXG5cbiAgICBkZWJ1Zygnb25Db21wb3NpdGlvblN0YXJ0JywgeyBldmVudCB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGNvcHkuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvbkNvcHkoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KGV2ZW50LnRhcmdldClcbiAgICBpc0NvcHlpbmcgPSB0cnVlXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBpc0NvcHlpbmcgPSBmYWxzZSlcblxuICAgIGRlYnVnKCdvbkNvcHknLCB7IGV2ZW50IH0pXG4gIH1cblxuICAvKipcbiAgICogT24gY3V0LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25DdXQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaWYgKGVkaXRvci5wcm9wcy5yZWFkT25seSkgcmV0dXJuIHRydWVcblxuICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdyhldmVudC50YXJnZXQpXG4gICAgaXNDb3B5aW5nID0gdHJ1ZVxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gaXNDb3B5aW5nID0gZmFsc2UpXG5cbiAgICBkZWJ1Zygnb25DdXQnLCB7IGV2ZW50IH0pXG4gIH1cblxuICAvKipcbiAgICogT24gZHJhZyBlbmQuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvbkRyYWdFbmQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaXNEcmFnZ2luZyA9IGZhbHNlXG5cbiAgICBkZWJ1Zygnb25EcmFnRW5kJywgeyBldmVudCB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGRyYWcgZW50ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvbkRyYWdFbnRlcihldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBkZWJ1Zygnb25EcmFnRW50ZXInLCB7IGV2ZW50IH0pXG4gIH1cblxuICAvKipcbiAgICogT24gZHJhZyBleGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25EcmFnRXhpdChldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBkZWJ1Zygnb25EcmFnRXhpdCcsIHsgZXZlbnQgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBkcmFnIGxlYXZlLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25EcmFnTGVhdmUoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgZGVidWcoJ29uRHJhZ0xlYXZlJywgeyBldmVudCB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGRyYWcgb3Zlci5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uRHJhZ092ZXIoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBpbnNpZGUgYSB2b2lkIG5vZGUsIGFuZCBvbmx5IGluIHRoaXMgY2FzZSxcbiAgICAvLyBjYWxsIGBwcmV2ZW50RGVmYXVsdGAgdG8gc2lnbmFsIHRoYXQgZHJvcHMgYXJlIGFsbG93ZWQuXG4gICAgLy8gV2hlbiB0aGUgdGFyZ2V0IGlzIGVkaXRhYmxlLCBkcm9wcGluZyBpcyBhbHJlYWR5IGFsbG93ZWQgYnlcbiAgICAvLyBkZWZhdWx0LCBhbmQgY2FsbGluZyBgcHJldmVudERlZmF1bHRgIGhpZGVzIHRoZSBjdXJzb3IuXG4gICAgY29uc3Qgbm9kZSA9IGZpbmROb2RlKGV2ZW50LnRhcmdldCwgZWRpdG9yLnZhbHVlKVxuICAgIGlmIChub2RlLmlzVm9pZCkgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgLy8gSWYgYSBkcmFnIGlzIGFscmVhZHkgaW4gcHJvZ3Jlc3MsIGRvbid0IGRvIHRoaXMgYWdhaW4uXG4gICAgaWYgKGlzRHJhZ2dpbmcpIHJldHVybiB0cnVlXG5cbiAgICBpc0RyYWdnaW5nID0gdHJ1ZVxuICAgIGV2ZW50Lm5hdGl2ZUV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXG5cbiAgICBkZWJ1Zygnb25EcmFnT3ZlcicsIHsgZXZlbnQgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBkcmFnIHN0YXJ0LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaXNEcmFnZ2luZyA9IHRydWVcblxuICAgIGRlYnVnKCdvbkRyYWdTdGFydCcsIHsgZXZlbnQgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBkcm9wLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25Ecm9wKGV2ZW50LCBjaGFuZ2UsIGVkaXRvcikge1xuICAgIC8vIFN0b3AgcHJvcGFnYXRpb24gc28gdGhlIGV2ZW50IGlzbid0IHZpc2libGUgdG8gcGFyZW50IGVkaXRvcnMuXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIC8vIE5vdGhpbmcgaGFwcGVucyBpbiByZWFkLW9ubHkgbW9kZS5cbiAgICBpZiAoZWRpdG9yLnByb3BzLnJlYWRPbmx5KSByZXR1cm4gdHJ1ZVxuXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IHNvIHRoZSBET00ncyB2YWx1ZSBpc24ndCBjb3JydXB0ZWQuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgZGVidWcoJ29uRHJvcCcsIHsgZXZlbnQgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBmb2N1cy5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uRm9jdXMoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaWYgKGlzQ29weWluZykgcmV0dXJuIHRydWVcbiAgICBpZiAoZWRpdG9yLnByb3BzLnJlYWRPbmx5KSByZXR1cm4gdHJ1ZVxuXG4gICAgY29uc3QgZWwgPSBmaW5kRE9NTm9kZShlZGl0b3IpXG5cbiAgICAvLyBTYXZlIHRoZSBuZXcgYGFjdGl2ZUVsZW1lbnRgLlxuICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdyhldmVudC50YXJnZXQpXG4gICAgYWN0aXZlRWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5hY3RpdmVFbGVtZW50XG5cbiAgICAvLyBDT01QQVQ6IElmIHRoZSBlZGl0b3IgaGFzIG5lc3RlZCBlZGl0YWJsZSBlbGVtZW50cywgdGhlIGZvY3VzIGNhbiBnbyB0b1xuICAgIC8vIHRob3NlIGVsZW1lbnRzLiBJbiBGaXJlZm94LCB0aGlzIG11c3QgYmUgcHJldmVudGVkIGJlY2F1c2UgaXQgcmVzdWx0cyBpblxuICAgIC8vIGlzc3VlcyB3aXRoIGtleWJvYXJkIG5hdmlnYXRpb24uICgyMDE3LzAzLzMwKVxuICAgIGlmIChJU19GSVJFRk9YICYmIGV2ZW50LnRhcmdldCAhPSBlbCkge1xuICAgICAgZWwuZm9jdXMoKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBkZWJ1Zygnb25Gb2N1cycsIHsgZXZlbnQgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBpbnB1dC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge0VkaXRvcn0gZWRpdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uSW5wdXQoZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaWYgKGlzQ29tcG9zaW5nKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChjaGFuZ2UudmFsdWUuaXNCbHVycmVkKSByZXR1cm4gdHJ1ZVxuXG4gICAgZGVidWcoJ29uSW5wdXQnLCB7IGV2ZW50IH0pXG4gIH1cblxuICAvKipcbiAgICogT24ga2V5IGRvd24uXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvbktleURvd24oZXZlbnQsIGNoYW5nZSwgZWRpdG9yKSB7XG4gICAgaWYgKGVkaXRvci5wcm9wcy5yZWFkT25seSkgcmV0dXJuIHRydWVcblxuICAgIC8vIFdoZW4gY29tcG9zaW5nLCB3ZSBuZWVkIHRvIHByZXZlbnQgYWxsIGhvdGtleXMgZnJvbSBleGVjdXRpbmcgd2hpbGVcbiAgICAvLyB0eXBpbmcuIEhvd2V2ZXIsIGNlcnRhaW4gY2hhcmFjdGVycyBhbHNvIG1vdmUgdGhlIHNlbGVjdGlvbiBiZWZvcmVcbiAgICAvLyB3ZSdyZSBhYmxlIHRvIGhhbmRsZSBpdCwgc28gcHJldmVudCB0aGVpciBkZWZhdWx0IGJlaGF2aW9yLlxuICAgIGlmIChpc0NvbXBvc2luZykge1xuICAgICAgaWYgKEhPVEtFWVMuQ09NUE9TSU5HKGV2ZW50KSkgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBDZXJ0YWluIGhvdGtleXMgaGF2ZSBuYXRpdmUgYmVoYXZpb3IgaW4gY29udGVudGVkaXRhYmxlIGVsZW1lbnRzIHdoaWNoXG4gICAgLy8gd2lsbCBjYXVzZSBvdXIgdmFsdWUgdG8gYmUgb3V0IG9mIHN5bmMsIHNvIHByZXZlbnQgdGhlbS5cbiAgICBpZiAoSE9US0VZUy5DT05URU5URURJVEFCTEUoZXZlbnQpICYmICFJU19JT1MpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9XG5cbiAgICBkZWJ1Zygnb25LZXlEb3duJywgeyBldmVudCB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIHBhc3RlLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gICAqIEBwYXJhbSB7RWRpdG9yfSBlZGl0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gb25QYXN0ZShldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBpZiAoZWRpdG9yLnByb3BzLnJlYWRPbmx5KSByZXR1cm4gdHJ1ZVxuXG4gICAgLy8gUHJldmVudCBkZWZhdWx0cyBzbyB0aGUgRE9NIHN0YXRlIGlzbid0IGNvcnJ1cHRlZC5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBkZWJ1Zygnb25QYXN0ZScsIHsgZXZlbnQgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBzZWxlY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICogQHBhcmFtIHtFZGl0b3J9IGVkaXRvclxuICAgKi9cblxuICBmdW5jdGlvbiBvblNlbGVjdChldmVudCwgY2hhbmdlLCBlZGl0b3IpIHtcbiAgICBpZiAoaXNDb3B5aW5nKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChpc0NvbXBvc2luZykgcmV0dXJuIHRydWVcbiAgICBpZiAoZWRpdG9yLnByb3BzLnJlYWRPbmx5KSByZXR1cm4gdHJ1ZVxuXG4gICAgLy8gU2F2ZSB0aGUgbmV3IGBhY3RpdmVFbGVtZW50YC5cbiAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coZXZlbnQudGFyZ2V0KVxuICAgIGFjdGl2ZUVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuXG4gICAgZGVidWcoJ29uU2VsZWN0JywgeyBldmVudCB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgcGx1Z2luLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICByZXR1cm4ge1xuICAgIG9uQmVmb3JlSW5wdXQsXG4gICAgb25CbHVyLFxuICAgIG9uQ2hhbmdlLFxuICAgIG9uQ29tcG9zaXRpb25FbmQsXG4gICAgb25Db21wb3NpdGlvblN0YXJ0LFxuICAgIG9uQ29weSxcbiAgICBvbkN1dCxcbiAgICBvbkRyYWdFbmQsXG4gICAgb25EcmFnRW50ZXIsXG4gICAgb25EcmFnRXhpdCxcbiAgICBvbkRyYWdMZWF2ZSxcbiAgICBvbkRyYWdPdmVyLFxuICAgIG9uRHJhZ1N0YXJ0LFxuICAgIG9uRHJvcCxcbiAgICBvbkZvY3VzLFxuICAgIG9uSW5wdXQsXG4gICAgb25LZXlEb3duLFxuICAgIG9uUGFzdGUsXG4gICAgb25TZWxlY3QsXG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBCZWZvcmVQbHVnaW5cbiJdfQ==