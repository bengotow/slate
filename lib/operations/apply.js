'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _operation2 = require('../models/operation');

var _operation3 = _interopRequireDefault(_operation2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:operation:apply');

/**
 * Applying functions.
 *
 * @type {Object}
 */

var APPLIERS = {

  /**
   * Add mark to text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  add_mark: function add_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length,
        mark = operation.mark;
    var _value = value,
        document = _value.document;

    var node = document.assertPath(path);
    node = node.addMark(offset, length, mark);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Insert a `node` at `index` in a node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  insert_node: function insert_node(value, operation) {
    var path = operation.path,
        node = operation.node;

    var index = path[path.length - 1];
    var rest = path.slice(0, -1);
    var _value2 = value,
        document = _value2.document;

    var parent = document.assertPath(rest);
    parent = parent.insertNode(index, node);
    document = document.updateNode(parent);
    value = value.set('document', document);
    return value;
  },


  /**
   * Insert `text` at `offset` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  insert_text: function insert_text(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        text = operation.text,
        marks = operation.marks;
    var _value3 = value,
        document = _value3.document,
        selection = _value3.selection;
    var _selection = selection,
        anchorKey = _selection.anchorKey,
        focusKey = _selection.focusKey,
        anchorOffset = _selection.anchorOffset,
        focusOffset = _selection.focusOffset;

    var node = document.assertPath(path);

    // Update the document
    node = node.insertText(offset, text, marks);
    document = document.updateNode(node);

    // Update the selection
    if (anchorKey == node.key && anchorOffset >= offset) {
      selection = selection.moveAnchor(text.length);
    }
    if (focusKey == node.key && focusOffset >= offset) {
      selection = selection.moveFocus(text.length);
    }

    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Merge a node at `path` with the previous node.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  merge_node: function merge_node(value, operation) {
    var path = operation.path;

    var withPath = path.slice(0, path.length - 1).concat([path[path.length - 1] - 1]);
    var _value4 = value,
        document = _value4.document,
        selection = _value4.selection;

    var one = document.assertPath(withPath);
    var two = document.assertPath(path);
    var parent = document.getParent(one.key);
    var oneIndex = parent.nodes.indexOf(one);
    var twoIndex = parent.nodes.indexOf(two);

    // Perform the merge in the document.
    parent = parent.mergeNode(oneIndex, twoIndex);
    document = document.updateNode(parent);

    // If the nodes are text nodes and the selection is inside the second node
    // update it to refer to the first node instead.
    if (one.object == 'text') {
      var _selection2 = selection,
          anchorKey = _selection2.anchorKey,
          anchorOffset = _selection2.anchorOffset,
          focusKey = _selection2.focusKey,
          focusOffset = _selection2.focusOffset;

      var normalize = false;

      if (anchorKey == two.key) {
        selection = selection.moveAnchorTo(one.key, one.text.length + anchorOffset);
        normalize = true;
      }

      if (focusKey == two.key) {
        selection = selection.moveFocusTo(one.key, one.text.length + focusOffset);
        normalize = true;
      }

      if (normalize) {
        selection = selection.normalize(document);
      }
    }

    // Update the document and selection.
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Move a node by `path` to `newPath`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  move_node: function move_node(value, operation) {
    var path = operation.path,
        newPath = operation.newPath;

    var newIndex = newPath[newPath.length - 1];
    var newParentPath = newPath.slice(0, -1);
    var oldParentPath = path.slice(0, -1);
    var oldIndex = path[path.length - 1];
    var _value5 = value,
        document = _value5.document;

    var node = document.assertPath(path);

    // Remove the node from its current parent.
    var parent = document.getParent(node.key);
    parent = parent.removeNode(oldIndex);
    document = document.updateNode(parent);

    // Find the new target...
    var target = void 0;

    // If the old path and the rest of the new path are the same, then the new
    // target is the old parent.
    if (oldParentPath.every(function (x, i) {
      return x === newParentPath[i];
    }) && oldParentPath.length === newParentPath.length) {
      target = parent;
    }

    // Otherwise, if the old path removal resulted in the new path being no longer
    // correct, we need to decrement the new path at the old path's last index.
    else if (oldParentPath.every(function (x, i) {
        return x === newParentPath[i];
      }) && oldIndex < newParentPath[oldParentPath.length]) {
        newParentPath[oldParentPath.length]--;
        target = document.assertPath(newParentPath);
      }

      // Otherwise, we can just grab the target normally...
      else {
          target = document.assertPath(newParentPath);
        }

    // Insert the new node to its new parent.
    target = target.insertNode(newIndex, node);
    document = document.updateNode(target);
    value = value.set('document', document);
    return value;
  },


  /**
   * Remove mark from text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  remove_mark: function remove_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length,
        mark = operation.mark;
    var _value6 = value,
        document = _value6.document;

    var node = document.assertPath(path);
    node = node.removeMark(offset, length, mark);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Remove a node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  remove_node: function remove_node(value, operation) {
    var path = operation.path;
    var _value7 = value,
        document = _value7.document,
        selection = _value7.selection;
    var _selection3 = selection,
        startKey = _selection3.startKey,
        endKey = _selection3.endKey;

    var node = document.assertPath(path);

    // If the selection is set, check to see if it needs to be updated.
    if (selection.isSet) {
      var hasStartNode = node.hasNode(startKey);
      var hasEndNode = node.hasNode(endKey);
      var first = node.object == 'text' ? node : node.getFirstText() || node;
      var last = node.object == 'text' ? node : node.getLastText() || node;
      var prev = document.getPreviousText(first.key);
      var next = document.getNextText(last.key);

      // If the start point was in this node, update it to be just before/after.
      if (hasStartNode) {
        if (prev) {
          selection = selection.moveStartTo(prev.key, prev.text.length);
        } else if (next) {
          selection = selection.moveStartTo(next.key, 0);
        } else {
          selection = selection.deselect();
        }
      }

      // If the end point was in this node, update it to be just before/after.
      if (selection.isSet && hasEndNode) {
        if (prev) {
          selection = selection.moveEndTo(prev.key, prev.text.length);
        } else if (next) {
          selection = selection.moveEndTo(next.key, 0);
        } else {
          selection = selection.deselect();
        }
      }

      // If the selection wasn't deselected, normalize it.
      if (selection.isSet) {
        selection = selection.normalize(document);
      }
    }

    // Remove the node from the document.
    var parent = document.getParent(node.key);
    var index = parent.nodes.indexOf(node);
    parent = parent.removeNode(index);
    document = document.updateNode(parent);

    // Update the document and selection.
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Remove `text` at `offset` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  remove_text: function remove_text(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        text = operation.text;
    var length = text.length;

    var rangeOffset = offset + length;
    var _value8 = value,
        document = _value8.document,
        selection = _value8.selection;
    var _selection4 = selection,
        anchorKey = _selection4.anchorKey,
        focusKey = _selection4.focusKey,
        anchorOffset = _selection4.anchorOffset,
        focusOffset = _selection4.focusOffset;

    var node = document.assertPath(path);

    if (anchorKey == node.key) {
      if (anchorOffset >= rangeOffset) {
        selection = selection.moveAnchor(-length);
      } else if (anchorOffset > offset) {
        selection = selection.moveAnchorTo(anchorKey, offset);
      }
    }

    if (focusKey == node.key) {
      if (focusOffset >= rangeOffset) {
        selection = selection.moveFocus(-length);
      } else if (focusOffset > offset) {
        selection = selection.moveFocusTo(focusKey, offset);
      }
    }

    node = node.removeText(offset, length);
    document = document.updateNode(node);
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Set `properties` on mark on text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_mark: function set_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length,
        mark = operation.mark,
        properties = operation.properties;
    var _value9 = value,
        document = _value9.document;

    var node = document.assertPath(path);
    node = node.updateMark(offset, length, mark, properties);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Set `properties` on a node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_node: function set_node(value, operation) {
    var path = operation.path,
        properties = operation.properties;
    var _value10 = value,
        document = _value10.document;

    var node = document.assertPath(path);
    node = node.merge(properties);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Set `properties` on the selection.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_selection: function set_selection(value, operation) {
    var properties = operation.properties;

    var anchorPath = properties.anchorPath,
        focusPath = properties.focusPath,
        props = _objectWithoutProperties(properties, ['anchorPath', 'focusPath']);

    var _value11 = value,
        document = _value11.document,
        selection = _value11.selection;


    if (anchorPath !== undefined) {
      props.anchorKey = anchorPath === null ? null : document.assertPath(anchorPath).key;
    }

    if (focusPath !== undefined) {
      props.focusKey = focusPath === null ? null : document.assertPath(focusPath).key;
    }

    selection = selection.merge(props);
    selection = selection.normalize(document);
    value = value.set('selection', selection);
    return value;
  },


  /**
   * Set `properties` on `value`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_value: function set_value(value, operation) {
    var properties = operation.properties;

    value = value.merge(properties);
    return value;
  },


  /**
   * Split a node by `path` at `offset`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  split_node: function split_node(value, operation) {
    var path = operation.path,
        position = operation.position;
    var _value12 = value,
        document = _value12.document,
        selection = _value12.selection;

    // Calculate a few things...

    var node = document.assertPath(path);
    var parent = document.getParent(node.key);
    var index = parent.nodes.indexOf(node);

    // Split the node by its parent.
    parent = parent.splitNode(index, position);
    document = document.updateNode(parent);

    // Determine whether we need to update the selection...
    var _selection5 = selection,
        startKey = _selection5.startKey,
        endKey = _selection5.endKey,
        startOffset = _selection5.startOffset,
        endOffset = _selection5.endOffset;

    var next = document.getNextText(node.key);
    var normalize = false;

    // If the start point is after or equal to the split, update it.
    if (node.key == startKey && position <= startOffset) {
      selection = selection.moveStartTo(next.key, startOffset - position);
      normalize = true;
    }

    // If the end point is after or equal to the split, update it.
    if (node.key == endKey && position <= endOffset) {
      selection = selection.moveEndTo(next.key, endOffset - position);
      normalize = true;
    }

    // Normalize the selection if we changed it, since the methods we use might
    // leave it in a non-normalized value.
    if (normalize) {
      selection = selection.normalize(document);
    }

    // Return the updated value.
    value = value.set('document', document).set('selection', selection);
    return value;
  }
};

/**
 * Apply an `operation` to a `value`.
 *
 * @param {Value} value
 * @param {Object|Operation} operation
 * @return {Value} value
 */

function applyOperation(value, operation) {
  operation = _operation3.default.create(operation);
  var _operation = operation,
      type = _operation.type;

  var apply = APPLIERS[type];

  if (!apply) {
    throw new Error('Unknown operation type: "' + type + '".');
  }

  debug(type, operation);
  value = apply(value, operation);
  return value;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = applyOperation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vcGVyYXRpb25zL2FwcGx5LmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiQVBQTElFUlMiLCJhZGRfbWFyayIsInZhbHVlIiwib3BlcmF0aW9uIiwicGF0aCIsIm9mZnNldCIsImxlbmd0aCIsIm1hcmsiLCJkb2N1bWVudCIsIm5vZGUiLCJhc3NlcnRQYXRoIiwiYWRkTWFyayIsInVwZGF0ZU5vZGUiLCJzZXQiLCJpbnNlcnRfbm9kZSIsImluZGV4IiwicmVzdCIsInNsaWNlIiwicGFyZW50IiwiaW5zZXJ0Tm9kZSIsImluc2VydF90ZXh0IiwidGV4dCIsIm1hcmtzIiwic2VsZWN0aW9uIiwiYW5jaG9yS2V5IiwiZm9jdXNLZXkiLCJhbmNob3JPZmZzZXQiLCJmb2N1c09mZnNldCIsImluc2VydFRleHQiLCJrZXkiLCJtb3ZlQW5jaG9yIiwibW92ZUZvY3VzIiwibWVyZ2Vfbm9kZSIsIndpdGhQYXRoIiwiY29uY2F0Iiwib25lIiwidHdvIiwiZ2V0UGFyZW50Iiwib25lSW5kZXgiLCJub2RlcyIsImluZGV4T2YiLCJ0d29JbmRleCIsIm1lcmdlTm9kZSIsIm9iamVjdCIsIm5vcm1hbGl6ZSIsIm1vdmVBbmNob3JUbyIsIm1vdmVGb2N1c1RvIiwibW92ZV9ub2RlIiwibmV3UGF0aCIsIm5ld0luZGV4IiwibmV3UGFyZW50UGF0aCIsIm9sZFBhcmVudFBhdGgiLCJvbGRJbmRleCIsInJlbW92ZU5vZGUiLCJ0YXJnZXQiLCJldmVyeSIsIngiLCJpIiwicmVtb3ZlX21hcmsiLCJyZW1vdmVNYXJrIiwicmVtb3ZlX25vZGUiLCJzdGFydEtleSIsImVuZEtleSIsImlzU2V0IiwiaGFzU3RhcnROb2RlIiwiaGFzTm9kZSIsImhhc0VuZE5vZGUiLCJmaXJzdCIsImdldEZpcnN0VGV4dCIsImxhc3QiLCJnZXRMYXN0VGV4dCIsInByZXYiLCJnZXRQcmV2aW91c1RleHQiLCJuZXh0IiwiZ2V0TmV4dFRleHQiLCJtb3ZlU3RhcnRUbyIsImRlc2VsZWN0IiwibW92ZUVuZFRvIiwicmVtb3ZlX3RleHQiLCJyYW5nZU9mZnNldCIsInJlbW92ZVRleHQiLCJzZXRfbWFyayIsInByb3BlcnRpZXMiLCJ1cGRhdGVNYXJrIiwic2V0X25vZGUiLCJtZXJnZSIsInNldF9zZWxlY3Rpb24iLCJhbmNob3JQYXRoIiwiZm9jdXNQYXRoIiwicHJvcHMiLCJ1bmRlZmluZWQiLCJzZXRfdmFsdWUiLCJzcGxpdF9ub2RlIiwicG9zaXRpb24iLCJzcGxpdE5vZGUiLCJzdGFydE9mZnNldCIsImVuZE9mZnNldCIsImFwcGx5T3BlcmF0aW9uIiwiY3JlYXRlIiwidHlwZSIsImFwcGx5IiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOzs7O0FBRUE7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFFBQVEscUJBQU0sdUJBQU4sQ0FBZDs7QUFFQTs7Ozs7O0FBTUEsSUFBTUMsV0FBVzs7QUFFZjs7Ozs7Ozs7QUFRQUMsVUFWZSxvQkFVTkMsS0FWTSxFQVVDQyxTQVZELEVBVVk7QUFBQSxRQUNqQkMsSUFEaUIsR0FDY0QsU0FEZCxDQUNqQkMsSUFEaUI7QUFBQSxRQUNYQyxNQURXLEdBQ2NGLFNBRGQsQ0FDWEUsTUFEVztBQUFBLFFBQ0hDLE1BREcsR0FDY0gsU0FEZCxDQUNIRyxNQURHO0FBQUEsUUFDS0MsSUFETCxHQUNjSixTQURkLENBQ0tJLElBREw7QUFBQSxpQkFFTkwsS0FGTTtBQUFBLFFBRW5CTSxRQUZtQixVQUVuQkEsUUFGbUI7O0FBR3pCLFFBQUlDLE9BQU9ELFNBQVNFLFVBQVQsQ0FBb0JOLElBQXBCLENBQVg7QUFDQUssV0FBT0EsS0FBS0UsT0FBTCxDQUFhTixNQUFiLEVBQXFCQyxNQUFyQixFQUE2QkMsSUFBN0IsQ0FBUDtBQUNBQyxlQUFXQSxTQUFTSSxVQUFULENBQW9CSCxJQUFwQixDQUFYO0FBQ0FQLFlBQVFBLE1BQU1XLEdBQU4sQ0FBVSxVQUFWLEVBQXNCTCxRQUF0QixDQUFSO0FBQ0EsV0FBT04sS0FBUDtBQUNELEdBbEJjOzs7QUFvQmY7Ozs7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MEM7QUFDeENBLGNBQVksb0JBQVUrRixNQUFWLENBQWlCL0YsU0FBakIsQ0FBWjtBQUR3QyxtQkFFdkJBLFNBRnVCO0FBQUEsTUFFaENnRyxJQUZnQyxjQUVoQ0EsSUFGZ0M7O0FBR3hDLE1BQU1DLFFBQVFwRyxTQUFTbUcsSUFBVCxDQUFkOztBQUVBLE1BQUksQ0FBQ0MsS0FBTCxFQUFZO0FBQ1YsVUFBTSxJQUFJQyxLQUFKLCtCQUFzQ0YsSUFBdEMsUUFBTjtBQUNEOztBQUVEcEcsUUFBTW9HLElBQU4sRUFBWWhHLFNBQVo7QUFDQUQsVUFBUWtHLE1BQU1sRyxLQUFOLEVBQWFDLFNBQWIsQ0FBUjtBQUNBLFNBQU9ELEtBQVA7QUFDRDs7QUFFRDs7Ozs7O2tCQU1lK0YsYyIsImZpbGUiOiJhcHBseS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJ1xuXG5pbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4uL21vZGVscy9vcGVyYXRpb24nXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOm9wZXJhdGlvbjphcHBseScpXG5cbi8qKlxuICogQXBwbHlpbmcgZnVuY3Rpb25zLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgQVBQTElFUlMgPSB7XG5cbiAgLyoqXG4gICAqIEFkZCBtYXJrIHRvIHRleHQgYXQgYG9mZnNldGAgYW5kIGBsZW5ndGhgIGluIG5vZGUgYnkgYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09wZXJhdGlvbn0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBhZGRfbWFyayh2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgeyBwYXRoLCBvZmZzZXQsIGxlbmd0aCwgbWFyayB9ID0gb3BlcmF0aW9uXG4gICAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnRQYXRoKHBhdGgpXG4gICAgbm9kZSA9IG5vZGUuYWRkTWFyayhvZmZzZXQsIGxlbmd0aCwgbWFyaylcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUobm9kZSlcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudClcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogSW5zZXJ0IGEgYG5vZGVgIGF0IGBpbmRleGAgaW4gYSBub2RlIGJ5IGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAgICogQHBhcmFtIHtPcGVyYXRpb259IG9wZXJhdGlvblxuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgaW5zZXJ0X25vZGUodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCwgbm9kZSB9ID0gb3BlcmF0aW9uXG4gICAgY29uc3QgaW5kZXggPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV1cbiAgICBjb25zdCByZXN0ID0gcGF0aC5zbGljZSgwLCAtMSlcbiAgICBsZXQgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgICBsZXQgcGFyZW50ID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChyZXN0KVxuICAgIHBhcmVudCA9IHBhcmVudC5pbnNlcnROb2RlKGluZGV4LCBub2RlKVxuICAgIGRvY3VtZW50ID0gZG9jdW1lbnQudXBkYXRlTm9kZShwYXJlbnQpXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIEluc2VydCBgdGV4dGAgYXQgYG9mZnNldGAgaW4gbm9kZSBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T3BlcmF0aW9ufSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIGluc2VydF90ZXh0KHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGgsIG9mZnNldCwgdGV4dCwgbWFya3MgfSA9IG9wZXJhdGlvblxuICAgIGxldCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgY29uc3QgeyBhbmNob3JLZXksIGZvY3VzS2V5LCBhbmNob3JPZmZzZXQsIGZvY3VzT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmFzc2VydFBhdGgocGF0aClcblxuICAgIC8vIFVwZGF0ZSB0aGUgZG9jdW1lbnRcbiAgICBub2RlID0gbm9kZS5pbnNlcnRUZXh0KG9mZnNldCwgdGV4dCwgbWFya3MpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKG5vZGUpXG5cbiAgICAvLyBVcGRhdGUgdGhlIHNlbGVjdGlvblxuICAgIGlmIChhbmNob3JLZXkgPT0gbm9kZS5rZXkgJiYgYW5jaG9yT2Zmc2V0ID49IG9mZnNldCkge1xuICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVBbmNob3IodGV4dC5sZW5ndGgpXG4gICAgfVxuICAgIGlmIChmb2N1c0tleSA9PSBub2RlLmtleSAmJiBmb2N1c09mZnNldCA+PSBvZmZzZXQpIHtcbiAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlRm9jdXModGV4dC5sZW5ndGgpXG4gICAgfVxuXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpLnNldCgnc2VsZWN0aW9uJywgc2VsZWN0aW9uKVxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBNZXJnZSBhIG5vZGUgYXQgYHBhdGhgIHdpdGggdGhlIHByZXZpb3VzIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T3BlcmF0aW9ufSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIG1lcmdlX25vZGUodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCB9ID0gb3BlcmF0aW9uXG4gICAgY29uc3Qgd2l0aFBhdGggPSBwYXRoLnNsaWNlKDAsIHBhdGgubGVuZ3RoIC0gMSkuY29uY2F0KFtwYXRoW3BhdGgubGVuZ3RoIC0gMV0gLSAxXSlcbiAgICBsZXQgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgIGNvbnN0IG9uZSA9IGRvY3VtZW50LmFzc2VydFBhdGgod2l0aFBhdGgpXG4gICAgY29uc3QgdHdvID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChwYXRoKVxuICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQob25lLmtleSlcbiAgICBjb25zdCBvbmVJbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKG9uZSlcbiAgICBjb25zdCB0d29JbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKHR3bylcblxuICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGluIHRoZSBkb2N1bWVudC5cbiAgICBwYXJlbnQgPSBwYXJlbnQubWVyZ2VOb2RlKG9uZUluZGV4LCB0d29JbmRleClcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUocGFyZW50KVxuXG4gICAgLy8gSWYgdGhlIG5vZGVzIGFyZSB0ZXh0IG5vZGVzIGFuZCB0aGUgc2VsZWN0aW9uIGlzIGluc2lkZSB0aGUgc2Vjb25kIG5vZGVcbiAgICAvLyB1cGRhdGUgaXQgdG8gcmVmZXIgdG8gdGhlIGZpcnN0IG5vZGUgaW5zdGVhZC5cbiAgICBpZiAob25lLm9iamVjdCA9PSAndGV4dCcpIHtcbiAgICAgIGNvbnN0IHsgYW5jaG9yS2V5LCBhbmNob3JPZmZzZXQsIGZvY3VzS2V5LCBmb2N1c09mZnNldCB9ID0gc2VsZWN0aW9uXG4gICAgICBsZXQgbm9ybWFsaXplID0gZmFsc2VcblxuICAgICAgaWYgKGFuY2hvcktleSA9PSB0d28ua2V5KSB7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlQW5jaG9yVG8ob25lLmtleSwgb25lLnRleHQubGVuZ3RoICsgYW5jaG9yT2Zmc2V0KVxuICAgICAgICBub3JtYWxpemUgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChmb2N1c0tleSA9PSB0d28ua2V5KSB7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlRm9jdXNUbyhvbmUua2V5LCBvbmUudGV4dC5sZW5ndGggKyBmb2N1c09mZnNldClcbiAgICAgICAgbm9ybWFsaXplID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5ub3JtYWxpemUoZG9jdW1lbnQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBkb2N1bWVudCBhbmQgc2VsZWN0aW9uLlxuICAgIHZhbHVlID0gdmFsdWUuc2V0KCdkb2N1bWVudCcsIGRvY3VtZW50KS5zZXQoJ3NlbGVjdGlvbicsIHNlbGVjdGlvbilcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogTW92ZSBhIG5vZGUgYnkgYHBhdGhgIHRvIGBuZXdQYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAgICogQHBhcmFtIHtPcGVyYXRpb259IG9wZXJhdGlvblxuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgbW92ZV9ub2RlKHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGgsIG5ld1BhdGggfSA9IG9wZXJhdGlvblxuICAgIGNvbnN0IG5ld0luZGV4ID0gbmV3UGF0aFtuZXdQYXRoLmxlbmd0aCAtIDFdXG4gICAgY29uc3QgbmV3UGFyZW50UGF0aCA9IG5ld1BhdGguc2xpY2UoMCwgLTEpXG4gICAgY29uc3Qgb2xkUGFyZW50UGF0aCA9IHBhdGguc2xpY2UoMCwgLTEpXG4gICAgY29uc3Qgb2xkSW5kZXggPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV1cbiAgICBsZXQgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChwYXRoKVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBub2RlIGZyb20gaXRzIGN1cnJlbnQgcGFyZW50LlxuICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQobm9kZS5rZXkpXG4gICAgcGFyZW50ID0gcGFyZW50LnJlbW92ZU5vZGUob2xkSW5kZXgpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKHBhcmVudClcblxuICAgIC8vIEZpbmQgdGhlIG5ldyB0YXJnZXQuLi5cbiAgICBsZXQgdGFyZ2V0XG5cbiAgICAvLyBJZiB0aGUgb2xkIHBhdGggYW5kIHRoZSByZXN0IG9mIHRoZSBuZXcgcGF0aCBhcmUgdGhlIHNhbWUsIHRoZW4gdGhlIG5ld1xuICAgIC8vIHRhcmdldCBpcyB0aGUgb2xkIHBhcmVudC5cbiAgICBpZiAoXG4gICAgICAob2xkUGFyZW50UGF0aC5ldmVyeSgoeCwgaSkgPT4geCA9PT0gbmV3UGFyZW50UGF0aFtpXSkpICYmXG4gICAgICAob2xkUGFyZW50UGF0aC5sZW5ndGggPT09IG5ld1BhcmVudFBhdGgubGVuZ3RoKVxuICAgICkge1xuICAgICAgdGFyZ2V0ID0gcGFyZW50XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiB0aGUgb2xkIHBhdGggcmVtb3ZhbCByZXN1bHRlZCBpbiB0aGUgbmV3IHBhdGggYmVpbmcgbm8gbG9uZ2VyXG4gICAgLy8gY29ycmVjdCwgd2UgbmVlZCB0byBkZWNyZW1lbnQgdGhlIG5ldyBwYXRoIGF0IHRoZSBvbGQgcGF0aCdzIGxhc3QgaW5kZXguXG4gICAgZWxzZSBpZiAoXG4gICAgICAob2xkUGFyZW50UGF0aC5ldmVyeSgoeCwgaSkgPT4geCA9PT0gbmV3UGFyZW50UGF0aFtpXSkpICYmXG4gICAgICAob2xkSW5kZXggPCBuZXdQYXJlbnRQYXRoW29sZFBhcmVudFBhdGgubGVuZ3RoXSlcbiAgICApIHtcbiAgICAgIG5ld1BhcmVudFBhdGhbb2xkUGFyZW50UGF0aC5sZW5ndGhdLS1cbiAgICAgIHRhcmdldCA9IGRvY3VtZW50LmFzc2VydFBhdGgobmV3UGFyZW50UGF0aClcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIHdlIGNhbiBqdXN0IGdyYWIgdGhlIHRhcmdldCBub3JtYWxseS4uLlxuICAgIGVsc2Uge1xuICAgICAgdGFyZ2V0ID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChuZXdQYXJlbnRQYXRoKVxuICAgIH1cblxuICAgIC8vIEluc2VydCB0aGUgbmV3IG5vZGUgdG8gaXRzIG5ldyBwYXJlbnQuXG4gICAgdGFyZ2V0ID0gdGFyZ2V0Lmluc2VydE5vZGUobmV3SW5kZXgsIG5vZGUpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKHRhcmdldClcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudClcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIG1hcmsgZnJvbSB0ZXh0IGF0IGBvZmZzZXRgIGFuZCBgbGVuZ3RoYCBpbiBub2RlIGJ5IGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAgICogQHBhcmFtIHtPcGVyYXRpb259IG9wZXJhdGlvblxuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgcmVtb3ZlX21hcmsodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCwgb2Zmc2V0LCBsZW5ndGgsIG1hcmsgfSA9IG9wZXJhdGlvblxuICAgIGxldCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICAgIGxldCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChwYXRoKVxuICAgIG5vZGUgPSBub2RlLnJlbW92ZU1hcmsob2Zmc2V0LCBsZW5ndGgsIG1hcmspXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKG5vZGUpXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIG5vZGUgYnkgYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09wZXJhdGlvbn0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICByZW1vdmVfbm9kZSh2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgeyBwYXRoIH0gPSBvcGVyYXRpb25cbiAgICBsZXQgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgIGNvbnN0IHsgc3RhcnRLZXksIGVuZEtleSB9ID0gc2VsZWN0aW9uXG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmFzc2VydFBhdGgocGF0aClcblxuICAgIC8vIElmIHRoZSBzZWxlY3Rpb24gaXMgc2V0LCBjaGVjayB0byBzZWUgaWYgaXQgbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgICBpZiAoc2VsZWN0aW9uLmlzU2V0KSB7XG4gICAgICBjb25zdCBoYXNTdGFydE5vZGUgPSBub2RlLmhhc05vZGUoc3RhcnRLZXkpXG4gICAgICBjb25zdCBoYXNFbmROb2RlID0gbm9kZS5oYXNOb2RlKGVuZEtleSlcbiAgICAgIGNvbnN0IGZpcnN0ID0gbm9kZS5vYmplY3QgPT0gJ3RleHQnID8gbm9kZSA6IG5vZGUuZ2V0Rmlyc3RUZXh0KCkgfHwgbm9kZVxuICAgICAgY29uc3QgbGFzdCA9IG5vZGUub2JqZWN0ID09ICd0ZXh0JyA/IG5vZGUgOiBub2RlLmdldExhc3RUZXh0KCkgfHwgbm9kZVxuICAgICAgY29uc3QgcHJldiA9IGRvY3VtZW50LmdldFByZXZpb3VzVGV4dChmaXJzdC5rZXkpXG4gICAgICBjb25zdCBuZXh0ID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQobGFzdC5rZXkpXG5cbiAgICAgIC8vIElmIHRoZSBzdGFydCBwb2ludCB3YXMgaW4gdGhpcyBub2RlLCB1cGRhdGUgaXQgdG8gYmUganVzdCBiZWZvcmUvYWZ0ZXIuXG4gICAgICBpZiAoaGFzU3RhcnROb2RlKSB7XG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVTdGFydFRvKHByZXYua2V5LCBwcmV2LnRleHQubGVuZ3RoKVxuICAgICAgICB9IGVsc2UgaWYgKG5leHQpIHtcbiAgICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZVN0YXJ0VG8obmV4dC5rZXksIDApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLmRlc2VsZWN0KClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgZW5kIHBvaW50IHdhcyBpbiB0aGlzIG5vZGUsIHVwZGF0ZSBpdCB0byBiZSBqdXN0IGJlZm9yZS9hZnRlci5cbiAgICAgIGlmIChzZWxlY3Rpb24uaXNTZXQgJiYgaGFzRW5kTm9kZSkge1xuICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlRW5kVG8ocHJldi5rZXksIHByZXYudGV4dC5sZW5ndGgpXG4gICAgICAgIH0gZWxzZSBpZiAobmV4dCkge1xuICAgICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlRW5kVG8obmV4dC5rZXksIDApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLmRlc2VsZWN0KClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgc2VsZWN0aW9uIHdhc24ndCBkZXNlbGVjdGVkLCBub3JtYWxpemUgaXQuXG4gICAgICBpZiAoc2VsZWN0aW9uLmlzU2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5ub3JtYWxpemUoZG9jdW1lbnQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBub2RlIGZyb20gdGhlIGRvY3VtZW50LlxuICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQobm9kZS5rZXkpXG4gICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihub2RlKVxuICAgIHBhcmVudCA9IHBhcmVudC5yZW1vdmVOb2RlKGluZGV4KVxuICAgIGRvY3VtZW50ID0gZG9jdW1lbnQudXBkYXRlTm9kZShwYXJlbnQpXG5cbiAgICAvLyBVcGRhdGUgdGhlIGRvY3VtZW50IGFuZCBzZWxlY3Rpb24uXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpLnNldCgnc2VsZWN0aW9uJywgc2VsZWN0aW9uKVxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYHRleHRgIGF0IGBvZmZzZXRgIGluIG5vZGUgYnkgYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09wZXJhdGlvbn0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICByZW1vdmVfdGV4dCh2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgeyBwYXRoLCBvZmZzZXQsIHRleHQgfSA9IG9wZXJhdGlvblxuICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSB0ZXh0XG4gICAgY29uc3QgcmFuZ2VPZmZzZXQgPSBvZmZzZXQgKyBsZW5ndGhcbiAgICBsZXQgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgIGNvbnN0IHsgYW5jaG9yS2V5LCBmb2N1c0tleSwgYW5jaG9yT2Zmc2V0LCBmb2N1c09mZnNldCB9ID0gc2VsZWN0aW9uXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnRQYXRoKHBhdGgpXG5cbiAgICBpZiAoYW5jaG9yS2V5ID09IG5vZGUua2V5KSB7XG4gICAgICBpZiAoYW5jaG9yT2Zmc2V0ID49IHJhbmdlT2Zmc2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlQW5jaG9yKC1sZW5ndGgpXG4gICAgICB9IGVsc2UgaWYgKGFuY2hvck9mZnNldCA+IG9mZnNldCkge1xuICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZUFuY2hvclRvKGFuY2hvcktleSwgb2Zmc2V0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmb2N1c0tleSA9PSBub2RlLmtleSkge1xuICAgICAgaWYgKGZvY3VzT2Zmc2V0ID49IHJhbmdlT2Zmc2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlRm9jdXMoLWxlbmd0aClcbiAgICAgIH0gZWxzZSBpZiAoZm9jdXNPZmZzZXQgPiBvZmZzZXQpIHtcbiAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVGb2N1c1RvKGZvY3VzS2V5LCBvZmZzZXQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbm9kZSA9IG5vZGUucmVtb3ZlVGV4dChvZmZzZXQsIGxlbmd0aClcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUobm9kZSlcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudCkuc2V0KCdzZWxlY3Rpb24nLCBzZWxlY3Rpb24pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCBgcHJvcGVydGllc2Agb24gbWFyayBvbiB0ZXh0IGF0IGBvZmZzZXRgIGFuZCBgbGVuZ3RoYCBpbiBub2RlIGJ5IGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAgICogQHBhcmFtIHtPcGVyYXRpb259IG9wZXJhdGlvblxuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgc2V0X21hcmsodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCwgb2Zmc2V0LCBsZW5ndGgsIG1hcmssIHByb3BlcnRpZXMgfSA9IG9wZXJhdGlvblxuICAgIGxldCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICAgIGxldCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChwYXRoKVxuICAgIG5vZGUgPSBub2RlLnVwZGF0ZU1hcmsob2Zmc2V0LCBsZW5ndGgsIG1hcmssIHByb3BlcnRpZXMpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKG5vZGUpXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCBgcHJvcGVydGllc2Agb24gYSBub2RlIGJ5IGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAgICogQHBhcmFtIHtPcGVyYXRpb259IG9wZXJhdGlvblxuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgc2V0X25vZGUodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCwgcHJvcGVydGllcyB9ID0gb3BlcmF0aW9uXG4gICAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnRQYXRoKHBhdGgpXG4gICAgbm9kZSA9IG5vZGUubWVyZ2UocHJvcGVydGllcylcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUobm9kZSlcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudClcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogU2V0IGBwcm9wZXJ0aWVzYCBvbiB0aGUgc2VsZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09wZXJhdGlvbn0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBzZXRfc2VsZWN0aW9uKHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHByb3BlcnRpZXMgfSA9IG9wZXJhdGlvblxuICAgIGNvbnN0IHsgYW5jaG9yUGF0aCwgZm9jdXNQYXRoLCAuLi5wcm9wcyB9ID0gcHJvcGVydGllc1xuICAgIGxldCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG5cbiAgICBpZiAoYW5jaG9yUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcm9wcy5hbmNob3JLZXkgPSBhbmNob3JQYXRoID09PSBudWxsID8gbnVsbCA6IGRvY3VtZW50LmFzc2VydFBhdGgoYW5jaG9yUGF0aCkua2V5XG4gICAgfVxuXG4gICAgaWYgKGZvY3VzUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcm9wcy5mb2N1c0tleSA9IGZvY3VzUGF0aCA9PT0gbnVsbCA/IG51bGwgOiBkb2N1bWVudC5hc3NlcnRQYXRoKGZvY3VzUGF0aCkua2V5XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1lcmdlKHByb3BzKVxuICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5ub3JtYWxpemUoZG9jdW1lbnQpXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ3NlbGVjdGlvbicsIHNlbGVjdGlvbilcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogU2V0IGBwcm9wZXJ0aWVzYCBvbiBgdmFsdWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09wZXJhdGlvbn0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBzZXRfdmFsdWUodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcHJvcGVydGllcyB9ID0gb3BlcmF0aW9uXG4gICAgdmFsdWUgPSB2YWx1ZS5tZXJnZShwcm9wZXJ0aWVzKVxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBTcGxpdCBhIG5vZGUgYnkgYHBhdGhgIGF0IGBvZmZzZXRgLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09wZXJhdGlvbn0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBzcGxpdF9ub2RlKHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGgsIHBvc2l0aW9uIH0gPSBvcGVyYXRpb25cbiAgICBsZXQgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuXG4gICAgLy8gQ2FsY3VsYXRlIGEgZmV3IHRoaW5ncy4uLlxuICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnRQYXRoKHBhdGgpXG4gICAgbGV0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChub2RlLmtleSlcbiAgICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKG5vZGUpXG5cbiAgICAvLyBTcGxpdCB0aGUgbm9kZSBieSBpdHMgcGFyZW50LlxuICAgIHBhcmVudCA9IHBhcmVudC5zcGxpdE5vZGUoaW5kZXgsIHBvc2l0aW9uKVxuICAgIGRvY3VtZW50ID0gZG9jdW1lbnQudXBkYXRlTm9kZShwYXJlbnQpXG5cbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgc2VsZWN0aW9uLi4uXG4gICAgY29uc3QgeyBzdGFydEtleSwgZW5kS2V5LCBzdGFydE9mZnNldCwgZW5kT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgICBjb25zdCBuZXh0ID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQobm9kZS5rZXkpXG4gICAgbGV0IG5vcm1hbGl6ZSA9IGZhbHNlXG5cbiAgICAvLyBJZiB0aGUgc3RhcnQgcG9pbnQgaXMgYWZ0ZXIgb3IgZXF1YWwgdG8gdGhlIHNwbGl0LCB1cGRhdGUgaXQuXG4gICAgaWYgKG5vZGUua2V5ID09IHN0YXJ0S2V5ICYmIHBvc2l0aW9uIDw9IHN0YXJ0T2Zmc2V0KSB7XG4gICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZVN0YXJ0VG8obmV4dC5rZXksIHN0YXJ0T2Zmc2V0IC0gcG9zaXRpb24pXG4gICAgICBub3JtYWxpemUgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGVuZCBwb2ludCBpcyBhZnRlciBvciBlcXVhbCB0byB0aGUgc3BsaXQsIHVwZGF0ZSBpdC5cbiAgICBpZiAobm9kZS5rZXkgPT0gZW5kS2V5ICYmIHBvc2l0aW9uIDw9IGVuZE9mZnNldCkge1xuICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVFbmRUbyhuZXh0LmtleSwgZW5kT2Zmc2V0IC0gcG9zaXRpb24pXG4gICAgICBub3JtYWxpemUgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBzZWxlY3Rpb24gaWYgd2UgY2hhbmdlZCBpdCwgc2luY2UgdGhlIG1ldGhvZHMgd2UgdXNlIG1pZ2h0XG4gICAgLy8gbGVhdmUgaXQgaW4gYSBub24tbm9ybWFsaXplZCB2YWx1ZS5cbiAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubm9ybWFsaXplKGRvY3VtZW50KVxuICAgIH1cblxuICAgIC8vIFJldHVybiB0aGUgdXBkYXRlZCB2YWx1ZS5cbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudCkuc2V0KCdzZWxlY3Rpb24nLCBzZWxlY3Rpb24pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbn1cblxuLyoqXG4gKiBBcHBseSBhbiBgb3BlcmF0aW9uYCB0byBhIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fE9wZXJhdGlvbn0gb3BlcmF0aW9uXG4gKiBAcmV0dXJuIHtWYWx1ZX0gdmFsdWVcbiAqL1xuXG5mdW5jdGlvbiBhcHBseU9wZXJhdGlvbih2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gIG9wZXJhdGlvbiA9IE9wZXJhdGlvbi5jcmVhdGUob3BlcmF0aW9uKVxuICBjb25zdCB7IHR5cGUgfSA9IG9wZXJhdGlvblxuICBjb25zdCBhcHBseSA9IEFQUExJRVJTW3R5cGVdXG5cbiAgaWYgKCFhcHBseSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBvcGVyYXRpb24gdHlwZTogXCIke3R5cGV9XCIuYClcbiAgfVxuXG4gIGRlYnVnKHR5cGUsIG9wZXJhdGlvbilcbiAgdmFsdWUgPSBhcHBseSh2YWx1ZSwgb3BlcmF0aW9uKVxuICByZXR1cm4gdmFsdWVcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGFwcGx5T3BlcmF0aW9uXG4iXX0=