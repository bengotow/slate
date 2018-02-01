'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _offsetKey = require('./offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Constants.
 *
 * @type {String}
 */

var OFFSET_KEY_ATTRIBUTE = 'data-offset-key';
var RANGE_SELECTOR = '[' + OFFSET_KEY_ATTRIBUTE + ']';
var TEXT_SELECTOR = '[data-key]';
var VOID_SELECTOR = '[data-slate-void]';

/**
 * Find a Slate point from a DOM selection's `nativeNode` and `nativeOffset`.
 *
 * @param {Element} nativeNode
 * @param {Number} nativeOffset
 * @param {Value} value
 * @return {Object}
 */

function findPoint(nativeNode, nativeOffset, value) {
  var _normalizeNodeAndOffs = normalizeNodeAndOffset(nativeNode, nativeOffset),
      nearestNode = _normalizeNodeAndOffs.node,
      nearestOffset = _normalizeNodeAndOffs.offset;

  var window = (0, _getWindow2.default)(nativeNode);
  var parentNode = nearestNode.parentNode;

  var rangeNode = parentNode.closest(RANGE_SELECTOR);
  var offset = void 0;
  var node = void 0;

  // Calculate how far into the text node the `nearestNode` is, so that we can
  // determine what the offset relative to the text node is.
  if (rangeNode) {
    var range = window.document.createRange();
    var textNode = rangeNode.closest(TEXT_SELECTOR);
    range.setStart(textNode, 0);
    range.setEnd(nearestNode, nearestOffset);
    node = textNode;
    offset = range.toString().length;
  }

  // For void nodes, the element with the offset key will be a cousin, not an
  // ancestor, so find it by going down from the nearest void parent.
  else {
      var voidNode = parentNode.closest(VOID_SELECTOR);
      if (!voidNode) return null;
      rangeNode = voidNode.querySelector(RANGE_SELECTOR);
      if (!rangeNode) return null;
      node = rangeNode;
      offset = node.textContent.length;
    }

  // COMPAT: If the parent node is a Slate zero-width space, this is because the
  // text node should have no characters. However, during IME composition the
  // ASCII characters will be prepended to the zero-width space, so subtract 1
  // from the offset to account for the zero-width space character.
  if (offset == node.textContent.length && parentNode.hasAttribute('data-slate-zero-width')) {
    offset--;
  }

  // Get the string value of the offset key attribute.
  var offsetKey = rangeNode.getAttribute(OFFSET_KEY_ATTRIBUTE);
  if (!offsetKey) return null;

  var _OffsetKey$parse = _offsetKey2.default.parse(offsetKey),
      key = _OffsetKey$parse.key;

  // COMPAT: If someone is clicking from one Slate editor into another, the
  // select event fires twice, once for the old editor's `element` first, and
  // then afterwards for the correct `element`. (2017/03/03)


  if (!value.document.hasDescendant(key)) return null;

  return {
    key: key,
    offset: offset
  };
}

/**
 * From a DOM selection's `node` and `offset`, normalize so that it always
 * refers to a text node.
 *
 * @param {Element} node
 * @param {Number} offset
 * @return {Object}
 */

function normalizeNodeAndOffset(node, offset) {
  // If it's an element node, its offset refers to the index of its children
  // including comment nodes, so try to find the right text child node.
  if (node.nodeType == 1 && node.childNodes.length) {
    var isLast = offset == node.childNodes.length;
    var direction = isLast ? 'backward' : 'forward';
    var index = isLast ? offset - 1 : offset;
    node = getEditableChild(node, index, direction);

    // If the node has children, traverse until we have a leaf node. Leaf nodes
    // can be either text nodes, or other void DOM nodes.
    while (node.nodeType == 1 && node.childNodes.length) {
      var i = isLast ? node.childNodes.length - 1 : 0;
      node = getEditableChild(node, i, direction);
    }

    // Determine the new offset inside the text node.
    offset = isLast ? node.textContent.length : 0;
  }

  // Return the node and offset.
  return { node: node, offset: offset };
}

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 *
 * @param {Element} parent
 * @param {Number} index
 * @param {String} direction ('forward' or 'backward')
 * @return {Element|Null}
 */

function getEditableChild(parent, index, direction) {
  var childNodes = parent.childNodes;

  var child = childNodes[index];
  var i = index;
  var triedForward = false;
  var triedBackward = false;

  // While the child is a comment node, or an element node with no children,
  // keep iterating to find a sibling non-void, non-comment node.
  while (child.nodeType == 8 || child.nodeType == 1 && child.childNodes.length == 0 || child.nodeType == 1 && child.getAttribute('contenteditable') == 'false') {
    if (triedForward && triedBackward) break;

    if (i >= childNodes.length) {
      triedForward = true;
      i = index - 1;
      direction = 'backward';
      continue;
    }

    if (i < 0) {
      triedBackward = true;
      i = index + 1;
      direction = 'forward';
      continue;
    }

    child = childNodes[i];
    if (direction == 'forward') i++;
    if (direction == 'backward') i--;
  }

  return child || null;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findPoint;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9maW5kLXBvaW50LmpzIl0sIm5hbWVzIjpbIk9GRlNFVF9LRVlfQVRUUklCVVRFIiwiUkFOR0VfU0VMRUNUT1IiLCJURVhUX1NFTEVDVE9SIiwiVk9JRF9TRUxFQ1RPUiIsImZpbmRQb2ludCIsIm5hdGl2ZU5vZGUiLCJuYXRpdmVPZmZzZXQiLCJ2YWx1ZSIsIm5vcm1hbGl6ZU5vZGVBbmRPZmZzZXQiLCJuZWFyZXN0Tm9kZSIsIm5vZGUiLCJuZWFyZXN0T2Zmc2V0Iiwib2Zmc2V0Iiwid2luZG93IiwicGFyZW50Tm9kZSIsInJhbmdlTm9kZSIsImNsb3Nlc3QiLCJyYW5nZSIsImRvY3VtZW50IiwiY3JlYXRlUmFuZ2UiLCJ0ZXh0Tm9kZSIsInNldFN0YXJ0Iiwic2V0RW5kIiwidG9TdHJpbmciLCJsZW5ndGgiLCJ2b2lkTm9kZSIsInF1ZXJ5U2VsZWN0b3IiLCJ0ZXh0Q29udGVudCIsImhhc0F0dHJpYnV0ZSIsIm9mZnNldEtleSIsImdldEF0dHJpYnV0ZSIsInBhcnNlIiwia2V5IiwiaGFzRGVzY2VuZGFudCIsIm5vZGVUeXBlIiwiY2hpbGROb2RlcyIsImlzTGFzdCIsImRpcmVjdGlvbiIsImluZGV4IiwiZ2V0RWRpdGFibGVDaGlsZCIsImkiLCJwYXJlbnQiLCJjaGlsZCIsInRyaWVkRm9yd2FyZCIsInRyaWVkQmFja3dhcmQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSx1QkFBdUIsaUJBQTdCO0FBQ0EsSUFBTUMsdUJBQXFCRCxvQkFBckIsTUFBTjtBQUNBLElBQU1FLDRCQUFOO0FBQ0EsSUFBTUMsZ0JBQWdCLG1CQUF0Qjs7QUFFQTs7Ozs7Ozs7O0FBU0EsU0FBU0MsU0FBVCxDQUFtQkMsVUFBbkIsRUFBK0JDLFlBQS9CLEVBQTZDQyxLQUE3QyxFQUFvRDtBQUFBLDhCQUk5Q0MsdUJBQXVCSCxVQUF2QixFQUFtQ0MsWUFBbkMsQ0FKOEM7QUFBQSxNQUUxQ0cs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bSAnZ2V0LXdpbmRvdydcblxuaW1wb3J0IE9mZnNldEtleSBmcm9tICcuL29mZnNldC1rZXknXG5cbi8qKlxuICogQ29uc3RhbnRzLlxuICpcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cblxuY29uc3QgT0ZGU0VUX0tFWV9BVFRSSUJVVEUgPSAnZGF0YS1vZmZzZXQta2V5J1xuY29uc3QgUkFOR0VfU0VMRUNUT1IgPSBgWyR7T0ZGU0VUX0tFWV9BVFRSSUJVVEV9XWBcbmNvbnN0IFRFWFRfU0VMRUNUT1IgPSBgW2RhdGEta2V5XWBcbmNvbnN0IFZPSURfU0VMRUNUT1IgPSAnW2RhdGEtc2xhdGUtdm9pZF0nXG5cbi8qKlxuICogRmluZCBhIFNsYXRlIHBvaW50IGZyb20gYSBET00gc2VsZWN0aW9uJ3MgYG5hdGl2ZU5vZGVgIGFuZCBgbmF0aXZlT2Zmc2V0YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5hdGl2ZU5vZGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBuYXRpdmVPZmZzZXRcbiAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gZmluZFBvaW50KG5hdGl2ZU5vZGUsIG5hdGl2ZU9mZnNldCwgdmFsdWUpIHtcbiAgY29uc3Qge1xuICAgIG5vZGU6IG5lYXJlc3ROb2RlLFxuICAgIG9mZnNldDogbmVhcmVzdE9mZnNldCxcbiAgfSA9IG5vcm1hbGl6ZU5vZGVBbmRPZmZzZXQobmF0aXZlTm9kZSwgbmF0aXZlT2Zmc2V0KVxuXG4gIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdyhuYXRpdmVOb2RlKVxuICBjb25zdCB7IHBhcmVudE5vZGUgfSA9IG5lYXJlc3ROb2RlXG4gIGxldCByYW5nZU5vZGUgPSBwYXJlbnROb2RlLmNsb3Nlc3QoUkFOR0VfU0VMRUNUT1IpXG4gIGxldCBvZmZzZXRcbiAgbGV0IG5vZGVcblxuICAvLyBDYWxjdWxhdGUgaG93IGZhciBpbnRvIHRoZSB0ZXh0IG5vZGUgdGhlIGBuZWFyZXN0Tm9kZWAgaXMsIHNvIHRoYXQgd2UgY2FuXG4gIC8vIGRldGVybWluZSB3aGF0IHRoZSBvZmZzZXQgcmVsYXRpdmUgdG8gdGhlIHRleHQgbm9kZSBpcy5cbiAgaWYgKHJhbmdlTm9kZSkge1xuICAgIGNvbnN0IHJhbmdlID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZVJhbmdlKClcbiAgICBjb25zdCB0ZXh0Tm9kZSA9IHJhbmdlTm9kZS5jbG9zZXN0KFRFWFRfU0VMRUNUT1IpXG4gICAgcmFuZ2Uuc2V0U3RhcnQodGV4dE5vZGUsIDApXG4gICAgcmFuZ2Uuc2V0RW5kKG5lYXJlc3ROb2RlLCBuZWFyZXN0T2Zmc2V0KVxuICAgIG5vZGUgPSB0ZXh0Tm9kZVxuICAgIG9mZnNldCA9IHJhbmdlLnRvU3RyaW5nKCkubGVuZ3RoXG4gIH1cblxuICAvLyBGb3Igdm9pZCBub2RlcywgdGhlIGVsZW1lbnQgd2l0aCB0aGUgb2Zmc2V0IGtleSB3aWxsIGJlIGEgY291c2luLCBub3QgYW5cbiAgLy8gYW5jZXN0b3IsIHNvIGZpbmQgaXQgYnkgZ29pbmcgZG93biBmcm9tIHRoZSBuZWFyZXN0IHZvaWQgcGFyZW50LlxuICBlbHNlIHtcbiAgICBjb25zdCB2b2lkTm9kZSA9IHBhcmVudE5vZGUuY2xvc2VzdChWT0lEX1NFTEVDVE9SKVxuICAgIGlmICghdm9pZE5vZGUpIHJldHVybiBudWxsXG4gICAgcmFuZ2VOb2RlID0gdm9pZE5vZGUucXVlcnlTZWxlY3RvcihSQU5HRV9TRUxFQ1RPUilcbiAgICBpZiAoIXJhbmdlTm9kZSkgcmV0dXJuIG51bGxcbiAgICBub2RlID0gcmFuZ2VOb2RlXG4gICAgb2Zmc2V0ID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGhcbiAgfVxuXG4gIC8vIENPTVBBVDogSWYgdGhlIHBhcmVudCBub2RlIGlzIGEgU2xhdGUgemVyby13aWR0aCBzcGFjZSwgdGhpcyBpcyBiZWNhdXNlIHRoZVxuICAvLyB0ZXh0IG5vZGUgc2hvdWxkIGhhdmUgbm8gY2hhcmFjdGVycy4gSG93ZXZlciwgZHVyaW5nIElNRSBjb21wb3NpdGlvbiB0aGVcbiAgLy8gQVNDSUkgY2hhcmFjdGVycyB3aWxsIGJlIHByZXBlbmRlZCB0byB0aGUgemVyby13aWR0aCBzcGFjZSwgc28gc3VidHJhY3QgMVxuICAvLyBmcm9tIHRoZSBvZmZzZXQgdG8gYWNjb3VudCBmb3IgdGhlIHplcm8td2lkdGggc3BhY2UgY2hhcmFjdGVyLlxuICBpZiAoXG4gICAgb2Zmc2V0ID09IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoICYmXG4gICAgcGFyZW50Tm9kZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtc2xhdGUtemVyby13aWR0aCcpXG4gICkge1xuICAgIG9mZnNldC0tXG4gIH1cblxuICAvLyBHZXQgdGhlIHN0cmluZyB2YWx1ZSBvZiB0aGUgb2Zmc2V0IGtleSBhdHRyaWJ1dGUuXG4gIGNvbnN0IG9mZnNldEtleSA9IHJhbmdlTm9kZS5nZXRBdHRyaWJ1dGUoT0ZGU0VUX0tFWV9BVFRSSUJVVEUpXG4gIGlmICghb2Zmc2V0S2V5KSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHsga2V5IH0gPSBPZmZzZXRLZXkucGFyc2Uob2Zmc2V0S2V5KVxuXG4gIC8vIENPTVBBVDogSWYgc29tZW9uZSBpcyBjbGlja2luZyBmcm9tIG9uZSBTbGF0ZSBlZGl0b3IgaW50byBhbm90aGVyLCB0aGVcbiAgLy8gc2VsZWN0IGV2ZW50IGZpcmVzIHR3aWNlLCBvbmNlIGZvciB0aGUgb2xkIGVkaXRvcidzIGBlbGVtZW50YCBmaXJzdCwgYW5kXG4gIC8vIHRoZW4gYWZ0ZXJ3YXJkcyBmb3IgdGhlIGNvcnJlY3QgYGVsZW1lbnRgLiAoMjAxNy8wMy8wMylcbiAgaWYgKCF2YWx1ZS5kb2N1bWVudC5oYXNEZXNjZW5kYW50KGtleSkpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIHtcbiAgICBrZXksXG4gICAgb2Zmc2V0LFxuICB9XG59XG5cbi8qKlxuICogRnJvbSBhIERPTSBzZWxlY3Rpb24ncyBgbm9kZWAgYW5kIGBvZmZzZXRgLCBub3JtYWxpemUgc28gdGhhdCBpdCBhbHdheXNcbiAqIHJlZmVycyB0byBhIHRleHQgbm9kZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBub3JtYWxpemVOb2RlQW5kT2Zmc2V0KG5vZGUsIG9mZnNldCkge1xuICAvLyBJZiBpdCdzIGFuIGVsZW1lbnQgbm9kZSwgaXRzIG9mZnNldCByZWZlcnMgdG8gdGhlIGluZGV4IG9mIGl0cyBjaGlsZHJlblxuICAvLyBpbmNsdWRpbmcgY29tbWVudCBub2Rlcywgc28gdHJ5IHRvIGZpbmQgdGhlIHJpZ2h0IHRleHQgY2hpbGQgbm9kZS5cbiAgaWYgKG5vZGUubm9kZVR5cGUgPT0gMSAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgY29uc3QgaXNMYXN0ID0gb2Zmc2V0ID09IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGhcbiAgICBjb25zdCBkaXJlY3Rpb24gPSBpc0xhc3QgPyAnYmFja3dhcmQnIDogJ2ZvcndhcmQnXG4gICAgY29uc3QgaW5kZXggPSBpc0xhc3QgPyBvZmZzZXQgLSAxIDogb2Zmc2V0XG4gICAgbm9kZSA9IGdldEVkaXRhYmxlQ2hpbGQobm9kZSwgaW5kZXgsIGRpcmVjdGlvbilcblxuICAgIC8vIElmIHRoZSBub2RlIGhhcyBjaGlsZHJlbiwgdHJhdmVyc2UgdW50aWwgd2UgaGF2ZSBhIGxlYWYgbm9kZS4gTGVhZiBub2Rlc1xuICAgIC8vIGNhbiBiZSBlaXRoZXIgdGV4dCBub2Rlcywgb3Igb3RoZXIgdm9pZCBET00gbm9kZXMuXG4gICAgd2hpbGUgKG5vZGUubm9kZVR5cGUgPT0gMSAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBpID0gaXNMYXN0ID8gbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCAtIDEgOiAwXG4gICAgICBub2RlID0gZ2V0RWRpdGFibGVDaGlsZChub2RlLCBpLCBkaXJlY3Rpb24pXG4gICAgfVxuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBuZXcgb2Zmc2V0IGluc2lkZSB0aGUgdGV4dCBub2RlLlxuICAgIG9mZnNldCA9IGlzTGFzdCA/IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIDogMFxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBub2RlIGFuZCBvZmZzZXQuXG4gIHJldHVybiB7IG5vZGUsIG9mZnNldCB9XG59XG5cbi8qKlxuICogR2V0IHRoZSBuZWFyZXN0IGVkaXRhYmxlIGNoaWxkIGF0IGBpbmRleGAgaW4gYSBgcGFyZW50YCwgcHJlZmVycmluZ1xuICogYGRpcmVjdGlvbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBwYXJlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbiAoJ2ZvcndhcmQnIG9yICdiYWNrd2FyZCcpXG4gKiBAcmV0dXJuIHtFbGVtZW50fE51bGx9XG4gKi9cblxuZnVuY3Rpb24gZ2V0RWRpdGFibGVDaGlsZChwYXJlbnQsIGluZGV4LCBkaXJlY3Rpb24pIHtcbiAgY29uc3QgeyBjaGlsZE5vZGVzIH0gPSBwYXJlbnRcbiAgbGV0IGNoaWxkID0gY2hpbGROb2Rlc1tpbmRleF1cbiAgbGV0IGkgPSBpbmRleFxuICBsZXQgdHJpZWRGb3J3YXJkID0gZmFsc2VcbiAgbGV0IHRyaWVkQmFja3dhcmQgPSBmYWxzZVxuXG4gIC8vIFdoaWxlIHRoZSBjaGlsZCBpcyBhIGNvbW1lbnQgbm9kZSwgb3IgYW4gZWxlbWVudCBub2RlIHdpdGggbm8gY2hpbGRyZW4sXG4gIC8vIGtlZXAgaXRlcmF0aW5nIHRvIGZpbmQgYSBzaWJsaW5nIG5vbi12b2lkLCBub24tY29tbWVudCBub2RlLlxuICB3aGlsZSAoXG4gICAgKGNoaWxkLm5vZGVUeXBlID09IDgpIHx8XG4gICAgKGNoaWxkLm5vZGVUeXBlID09IDEgJiYgY2hpbGQuY2hpbGROb2Rlcy5sZW5ndGggPT0gMCkgfHxcbiAgICAoY2hpbGQubm9kZVR5cGUgPT0gMSAmJiBjaGlsZC5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpID09ICdmYWxzZScpXG4gICkge1xuICAgIGlmICh0cmllZEZvcndhcmQgJiYgdHJpZWRCYWNrd2FyZCkgYnJlYWtcblxuICAgIGlmIChpID49IGNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICB0cmllZEZvcndhcmQgPSB0cnVlXG4gICAgICBpID0gaW5kZXggLSAxXG4gICAgICBkaXJlY3Rpb24gPSAnYmFja3dhcmQnXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmIChpIDwgMCkge1xuICAgICAgdHJpZWRCYWNrd2FyZCA9IHRydWVcbiAgICAgIGkgPSBpbmRleCArIDFcbiAgICAgIGRpcmVjdGlvbiA9ICdmb3J3YXJkJ1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBjaGlsZCA9IGNoaWxkTm9kZXNbaV1cbiAgICBpZiAoZGlyZWN0aW9uID09ICdmb3J3YXJkJykgaSsrXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAnYmFja3dhcmQnKSBpLS1cbiAgfVxuXG4gIHJldHVybiBjaGlsZCB8fCBudWxsXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmaW5kUG9pbnRcbiJdfQ==