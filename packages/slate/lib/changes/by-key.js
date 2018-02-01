'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _node = require('../models/node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Add mark to text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.addMarkByKey = function (change, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = _mark2.default.create(mark);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();

  var operations = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the operation, continue on.
    if (ay < bx || by < ax) return;

    // If the leaf already has the mark, continue on.
    if (leaf.marks.has(mark)) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);

    operations.push({
      type: 'add_mark',
      value: value,
      path: path,
      offset: start,
      length: end - start,
      mark: mark
    });
  });

  change.applyOperations(operations);

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert a `fragment` at `index` in a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} index
 * @param {Fragment} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertFragmentByKey = function (change, key, index, fragment) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);

  fragment.nodes.forEach(function (node, i) {
    change.insertNodeByKey(key, index + i, node);
  });

  if (normalize) {
    change.normalizeNodeByKey(key);
  }
};

/**
 * Insert a `node` at `index` in a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} index
 * @param {Node} node
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertNodeByKey = function (change, key, index, node) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'insert_node',
    value: value,
    path: [].concat(_toConsumableArray(path), [index]),
    node: node
  });

  if (normalize) {
    change.normalizeNodeByKey(key);
  }
};

/**
 * Insert `text` at `offset` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertTextByKey = function (change, key, offset, text, marks) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  var normalize = change.getFlag('normalize', options);

  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  marks = marks || node.getMarksAtIndex(offset);

  change.applyOperation({
    type: 'insert_text',
    value: value,
    path: path,
    offset: offset,
    text: text,
    marks: marks
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Merge a node by `key` with the previous node.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.mergeNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var previous = document.getPreviousSibling(key);

  if (!previous) {
    throw new Error('Unable to merge node with key "' + key + '", no previous key.');
  }

  var position = previous.object == 'text' ? previous.text.length : previous.nodes.size;

  change.applyOperation({
    type: 'merge_node',
    value: value,
    path: path,
    position: position,
    target: null
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Move a node by `key` to a new parent by `newKey` and `index`.
 * `newKey` is the key of the container (it can be the document itself)
 *
 * @param {Change} change
 * @param {String} key
 * @param {String} newKey
 * @param {Number} index
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.moveNodeByKey = function (change, key, newKey, newIndex) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var newPath = document.getPath(newKey);

  change.applyOperation({
    type: 'move_node',
    value: value,
    path: path,
    newPath: [].concat(_toConsumableArray(newPath), [newIndex])
  });

  if (normalize) {
    var parent = document.getCommonAncestor(key, newKey);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove mark from text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeMarkByKey = function (change, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = _mark2.default.create(mark);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();

  var operations = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the operation, continue on.
    if (ay < bx || by < ax) return;

    // If the leaf already has the mark, continue on.
    if (!leaf.marks.has(mark)) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);

    operations.push({
      type: 'remove_mark',
      value: value,
      path: path,
      offset: start,
      length: end - start,
      mark: mark
    });
  });

  change.applyOperations(operations);

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove all `marks` from node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeAllMarksByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var state = change.state;
  var document = state.document;

  var node = document.getNode(key);
  var texts = node.object === 'text' ? [node] : node.getTextsAsArray();

  texts.forEach(function (text) {
    text.getMarksAsArray().forEach(function (mark) {
      change.removeMarkByKey(text.key, 0, text.text.length, mark, options);
    });
  });
};

/**
 * Remove a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);

  change.applyOperation({
    type: 'remove_node',
    value: value,
    path: path,
    node: node
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeTextByKey = function (change, key, offset, length) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();
  var text = node.text;


  var removals = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the removal, continue on.
    if (ay < bx || by < ax) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);
    var string = text.slice(start, end);

    removals.push({
      type: 'remove_text',
      value: value,
      path: path,
      offset: start,
      text: string,
      marks: leaf.marks
    });
  });

  // Apply in reverse order, so subsequent removals don't impact previous ones.
  change.applyOperations(removals.reverse());

  if (normalize) {
    var block = document.getClosestBlock(key);
    change.normalizeNodeByKey(block.key);
  }
};

/**
`* Replace a `node` with another `node`
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|Node} node
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.replaceNodeByKey = function (change, key, newNode) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  newNode = _node2.default.create(newNode);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var node = document.getNode(key);
  var parent = document.getParent(key);
  var index = parent.nodes.indexOf(node);
  change.removeNodeByKey(key, { normalize: false });
  change.insertNodeByKey(parent.key, index, newNode, options);
  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setMarkByKey = function (change, key, offset, length, mark, properties) {
  var options = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};

  mark = _mark2.default.create(mark);
  properties = _mark2.default.createProperties(properties);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'set_mark',
    value: value,
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    properties: properties
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Set `properties` on a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setNodeByKey = function (change, key, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _node2.default.createProperties(properties);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);

  change.applyOperation({
    type: 'set_node',
    value: value,
    path: path,
    node: node,
    properties: properties
  });

  if (normalize) {
    change.normalizeNodeByKey(node.key);
  }
};

/**
 * Split a node by `key` at `position`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} position
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitNodeByKey = function (change, key, position) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize = options.normalize,
      normalize = _options$normalize === undefined ? true : _options$normalize,
      _options$target = options.target,
      target = _options$target === undefined ? null : _options$target;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'split_node',
    value: value,
    path: path,
    position: position,
    target: target
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Split a node deeply down the tree by `key`, `textKey` and `textOffset`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} position
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitDescendantsByKey = function (change, key, textKey, textOffset) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  if (key == textKey) {
    change.splitNodeByKey(textKey, textOffset, options);
    return;
  }

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;


  var text = document.getNode(textKey);
  var ancestors = document.getAncestors(textKey);
  var nodes = ancestors.skipUntil(function (a) {
    return a.key == key;
  }).reverse().unshift(text);
  var previous = void 0;
  var index = void 0;

  nodes.forEach(function (node) {
    var prevIndex = index == null ? null : index;
    index = previous ? node.nodes.indexOf(previous) + 1 : textOffset;
    previous = node;
    change.splitNodeByKey(node.key, index, { normalize: false, target: prevIndex });
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Unwrap content from an inline parent with `properties`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapInlineByKey = function (change, key, properties, options) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  change.unwrapInlineAtRange(range, properties, options);
};

/**
 * Unwrap content from a block parent with `properties`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapBlockByKey = function (change, key, properties, options) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  change.unwrapBlockAtRange(range, properties, options);
};

/**
 * Unwrap a single node from its parent.
 *
 * If the node is surrounded with siblings, its parent will be
 * split. If the node is the only child, the parent is removed, and
 * simply replaced by the node itself.  Cannot unwrap a root node.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var parent = document.getParent(key);
  var node = parent.getChild(key);

  var index = parent.nodes.indexOf(node);
  var isFirst = index === 0;
  var isLast = index === parent.nodes.size - 1;

  var parentParent = document.getParent(parent.key);
  var parentIndex = parentParent.nodes.indexOf(parent);

  if (parent.nodes.size === 1) {
    change.moveNodeByKey(key, parentParent.key, parentIndex, { normalize: false });
    change.removeNodeByKey(parent.key, options);
  } else if (isFirst) {
    // Just move the node before its parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex, options);
  } else if (isLast) {
    // Just move the node after its parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex + 1, options);
  } else {
    // Split the parent.
    change.splitNodeByKey(parent.key, index, { normalize: false });

    // Extract the node in between the splitted parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex + 1, { normalize: false });

    if (normalize) {
      change.normalizeNodeByKey(parentParent.key);
    }
  }
};

/**
 * Wrap a node in a block with `properties`.
 *
 * @param {Change} change
 * @param {String} key The node to wrap
 * @param {Block|Object|String} block The wrapping block (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapBlockByKey = function (change, key, block, options) {
  block = _block2.default.create(block);
  block = block.set('nodes', block.nodes.clear());

  var document = change.value.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  change.insertNodeByKey(parent.key, index, block, { normalize: false });
  change.moveNodeByKey(node.key, block.key, 0, options);
};

/**
 * Wrap a node in an inline with `properties`.
 *
 * @param {Change} change
 * @param {String} key The node to wrap
 * @param {Block|Object|String} inline The wrapping inline (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapInlineByKey = function (change, key, inline, options) {
  inline = _inline2.default.create(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var document = change.value.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  change.insertNodeByKey(parent.key, index, inline, { normalize: false });
  change.moveNodeByKey(node.key, inline.key, 0, options);
};

/**
 * Wrap a node by `key` with `parent`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Node|Object} parent
 * @param {Object} options
 */

Changes.wrapNodeByKey = function (change, key, parent) {
  parent = _node2.default.create(parent);
  parent = parent.set('nodes', parent.nodes.clear());

  if (parent.object == 'block') {
    change.wrapBlockByKey(key, parent);
    return;
  }

  if (parent.object == 'inline') {
    change.wrapInlineByKey(key, parent);
    return;
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL2J5LWtleS5qcyJdLCJuYW1lcyI6WyJDaGFuZ2VzIiwiYWRkTWFya0J5S2V5IiwiY2hhbmdlIiwia2V5Iiwib2Zmc2V0IiwibGVuZ3RoIiwibWFyayIsIm9wdGlvbnMiLCJjcmVhdGUiLCJub3JtYWxpemUiLCJnZXRGbGFnIiwidmFsdWUiLCJkb2N1bWVudCIsInBhdGgiLCJnZXRQYXRoIiwibm9kZSIsImdldE5vZGUiLCJsZWF2ZXMiLCJnZXRMZWF2ZXMiLCJvcGVyYXRpb25zIiwiYngiLCJieSIsIm8iLCJmb3JFYWNoIiwibGVhZiIsImF4IiwiYXkiLCJ0ZXh0IiwibWFya3MiLCJoYXMiLCJzdGFydCIsIk1hdGgiLCJtYXgiLCJlbmQiLCJtaW4iLCJwdXNoIiwidHlwZSIsImFwcGx5T3BlcmF0aW9ucyIsInBhcmVudCIsImdldFBhcmVudCIsIm5vcm1hbGl6ZU5vZGVCeUtleSIsImluc2VydEZyYWdtZW50QnlLZXkiLCJpbmRleCIsImZyYWdtZW50Iiwibm9kZXMiLCJpIiwiaW5zZXJ0Tm9kZUJ5S2V5IiwiYXBwbHlPcGVyYXRpb24iLCJpbnNlcnRUZXh0QnlLZXkiLCJnZXRNYXJrc0F0SW5kZXgiLCJtZXJnZU5vZGVCeUtleSIsInByZXZpb3VzIiwiZ2V0UHJldmlvdXNTaWJsaW5nIiwiRXJyb3IiLCJwb3NpdGlvbiIsIm9iamVjdCIsInNpemUiLCJ0YXJnZXQiLCJtb3ZlTm9kZUJ5S2V5IiwibmV3S2V5IiwibmV3SW5kZXgiLCJuZXdQYXRoIiwiZ2V0Q29tbW9uQW5jZXN0b3IiLCJyZW1vdmVNYXJrQnlLZXkiLCJyZW1vdmVBbGxNYXJrc0J5S2V5Iiwic3RhdGUiLCJ0ZXh0cyIsImdldFRleHRzQXNBcnJheSIsImdldE1hcmtzQXNBcnJheSIsInJlbW92ZU5vZGVCeUtleSIsInJlbW92ZVRleHRCeUtleSIsInJlbW92YWxzIiwic3RyaW5nIiwic2xpY2UiLCJyZXZlcnNlIiwiYmxvY2siLCJnZXRDbG9zZXN0QmxvY2siLCJyZXBsYWNlTm9kZUJ5S2V5IiwibmV3Tm9kZSIsImluZGV4T2YiLCJzZXRNYXJrQnlLZXkiLCJwcm9wZXJ0aWVzIiwiY3JlYXRlUHJvcGVydGllcyIsInNldE5vZGVCeUtleSIsInNwbGl0Tm9kZUJ5S2V5Iiwic3BsaXREZXNjZW5kYW50c0J5S2V5IiwidGV4dEtleSIsInRleHRPZmZzZXQiLCJhbmNlc3RvcnMiLCJnZXRBbmNlc3RvcnMiLCJza2lwVW50aWwiLCJhIiwidW5zaGlmdCIsInByZXZJbmRleCIsInVud3JhcElubGluZUJ5S2V5Iiwic2VsZWN0aW9uIiwiYXNzZXJ0RGVzY2VuZGFudCIsImZpcnN0IiwiZ2V0Rmlyc3RUZXh0IiwibGFzdCIsImdldExhc3RUZXh0IiwicmFuZ2UiLCJtb3ZlVG9SYW5nZU9mIiwidW53cmFwSW5saW5lQXRSYW5nZSIsInVud3JhcEJsb2NrQnlLZXkiLCJ1bndyYXBCbG9ja0F0UmFuZ2UiLCJ1bndyYXBOb2RlQnlLZXkiLCJnZXRDaGlsZCIsImlzRmlyc3QiLCJpc0xhc3QiLCJwYXJlbnRQYXJlbnQiLCJwYXJlbnRJbmRleCIsIndyYXBCbG9ja0J5S2V5Iiwic2V0IiwiY2xlYXIiLCJ3cmFwSW5saW5lQnlLZXkiLCJpbmxpbmUiLCJ3cmFwTm9kZUJ5S2V5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsVUFBVSxFQUFoQjs7QUFFQTs7Ozs7Ozs7Ozs7O0FBWUFBLFFBQVFDLFlBQVIsR0FBdUIsVUFBQ0MsTUFBRCxFQUFTQyxHQUFULEVBQWNDLE1BQWQsRUFBc0JDLE1BQXRCLEVBQThCQyxJQUE5QixFQUFxRDtBQUFBLE1BQWpCQyxPQUFpQix1RUFBUCxFQUFPOztBQUMxRUQsU0FBTyxlQUFLRSxNQUFMLENBQVlGLElBQVosQ0FBUDtBQUNBLE1BQU1HLFlBQVlQLE9BQU9RLE9BQVAsQ0FBZSxXQUFmLEVBQTRCSCxPQUE1QixDQUFsQjtBQUYwRSxNQUdsRUksS0FIa0Us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QU9ILFNBQVNvRixnQkFBVCxDQUEwQjdGLEdBQTFCLENBQWI7QUFDQSxNQUFNbUMsU0FBUzFCLFNBQVMyQixTQUFULENBQW1CeEIsS0FBS1osR0FBeEIsQ0FBZjtBQUNBLE1BQU11QyxRQUFRSixPQUFPTSxLQUFQLENBQWFtQyxPQUFiLENBQXFCaEUsSUFBckIsQ0FBZDs7QUFFQWIsU0FBTzRDLGVBQVAsQ0FBdUJSLE9BQU9uQyxHQUE5QixFQUFtQ3VDLEtBQW5DLEVBQTBDMEUsTUFBMUMsRUFBa0QsRUFBRTNHLFdBQVcsS0FBYixFQUFsRDtBQUNBUCxTQUFPd0QsYUFBUCxDQUFxQjNDLEtBQUtaLEdBQTFCLEVBQStCaUgsT0FBT2pILEdBQXRDLEVBQTJDLENBQTNDLEVBQThDSSxPQUE5QztBQUNELENBWEQ7O0FBYUE7Ozs7Ozs7OztBQVNBUCxRQUFRcUgsYUFBUixHQUF3QixVQUFDbkgsTUFBRCxFQUFTQyxHQUFULEVBQWNtQyxNQUFkLEVBQXlCO0FBQy9DQSxXQUFTLGVBQUs5QixNQUFMLENBQVk4QixNQUFaLENBQVQ7QUFDQUEsV0FBU0EsT0FBTzJFLEdBQVAsQ0FBVyxPQUFYLEVBQW9CM0UsT0FBT00sS0FBUCxDQUFhc0UsS0FBYixFQUFwQixDQUFUOztBQUVBLE1BQUk1RSxPQUFPaUIsTUFBUCxJQUFpQixPQUFyQixFQUE4QjtBQUM1QnJELFdBQU84RyxjQUFQLENBQXNCN0csR0FBdEIsRUFBMkJtQyxNQUEzQjtBQUNBO0FBQ0Q7O0FBRUQsTUFBSUEsT0FBT2lCLE1BQVAsSUFBaUIsUUFBckIsRUFBK0I7QUFDN0JyRCxXQUFPaUgsZUFBUCxDQUF1QmhILEdBQXZCLEVBQTRCbUMsTUFBNUI7QUFDQTtBQUNEO0FBQ0YsQ0FiRDs7QUFlQTs7Ozs7O2tCQU1ldEMsTyIsImZpbGUiOiJieS1rZXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBCbG9jayBmcm9tICcuLi9tb2RlbHMvYmxvY2snXG5pbXBvcnQgSW5saW5lIGZyb20gJy4uL21vZGVscy9pbmxpbmUnXG5pbXBvcnQgTWFyayBmcm9tICcuLi9tb2RlbHMvbWFyaydcbmltcG9ydCBOb2RlIGZyb20gJy4uL21vZGVscy9ub2RlJ1xuXG4vKipcbiAqIENoYW5nZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBDaGFuZ2VzID0ge31cblxuLyoqXG4gKiBBZGQgbWFyayB0byB0ZXh0IGF0IGBvZmZzZXRgIGFuZCBgbGVuZ3RoYCBpbiBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcbiAqIEBwYXJhbSB7TWl4ZWR9IG1hcmtcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5hZGRNYXJrQnlLZXkgPSAoY2hhbmdlLCBrZXksIG9mZnNldCwgbGVuZ3RoLCBtYXJrLCBvcHRpb25zID0ge30pID0+IHtcbiAgbWFyayA9IE1hcmsuY3JlYXRlKG1hcmspXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0Tm9kZShrZXkpXG4gIGNvbnN0IGxlYXZlcyA9IG5vZGUuZ2V0TGVhdmVzKClcblxuICBjb25zdCBvcGVyYXRpb25zID0gW11cbiAgY29uc3QgYnggPSBvZmZzZXRcbiAgY29uc3QgYnkgPSBvZmZzZXQgKyBsZW5ndGhcbiAgbGV0IG8gPSAwXG5cbiAgbGVhdmVzLmZvckVhY2goKGxlYWYpID0+IHtcbiAgICBjb25zdCBheCA9IG9cbiAgICBjb25zdCBheSA9IGF4ICsgbGVhZi50ZXh0Lmxlbmd0aFxuXG4gICAgbyArPSBsZWFmLnRleHQubGVuZ3RoXG5cbiAgICAvLyBJZiB0aGUgbGVhZiBkb2Vzbid0IG92ZXJsYXAgd2l0aCB0aGUgb3BlcmF0aW9uLCBjb250aW51ZSBvbi5cbiAgICBpZiAoYXkgPCBieCB8fCBieSA8IGF4KSByZXR1cm5cblxuICAgIC8vIElmIHRoZSBsZWFmIGFscmVhZHkgaGFzIHRoZSBtYXJrLCBjb250aW51ZSBvbi5cbiAgICBpZiAobGVhZi5tYXJrcy5oYXMobWFyaykpIHJldHVyblxuXG4gICAgLy8gT3RoZXJ3aXNlLCBkZXRlcm1pbmUgd2hpY2ggb2Zmc2V0IGFuZCBjaGFyYWN0ZXJzIG92ZXJsYXAuXG4gICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heChheCwgYngpXG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4oYXksIGJ5KVxuXG4gICAgb3BlcmF0aW9ucy5wdXNoKHtcbiAgICAgIHR5cGU6ICdhZGRfbWFyaycsXG4gICAgICB2YWx1ZSxcbiAgICAgIHBhdGgsXG4gICAgICBvZmZzZXQ6IHN0YXJ0LFxuICAgICAgbGVuZ3RoOiBlbmQgLSBzdGFydCxcbiAgICAgIG1hcmssXG4gICAgfSlcbiAgfSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb25zKG9wZXJhdGlvbnMpXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGEgYGZyYWdtZW50YCBhdCBgaW5kZXhgIGluIGEgbm9kZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuaW5zZXJ0RnJhZ21lbnRCeUtleSA9IChjaGFuZ2UsIGtleSwgaW5kZXgsIGZyYWdtZW50LCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG5cbiAgZnJhZ21lbnQubm9kZXMuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkoa2V5LCBpbmRleCArIGksIG5vZGUpXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoa2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGEgYG5vZGVgIGF0IGBpbmRleGAgaW4gYSBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuaW5zZXJ0Tm9kZUJ5S2V5ID0gKGNoYW5nZSwga2V5LCBpbmRleCwgbm9kZSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ2luc2VydF9ub2RlJyxcbiAgICB2YWx1ZSxcbiAgICBwYXRoOiBbLi4ucGF0aCwgaW5kZXhdLFxuICAgIG5vZGUsXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoa2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGB0ZXh0YCBhdCBgb2Zmc2V0YCBpbiBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge1NldDxNYXJrPn0gbWFya3MgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmluc2VydFRleHRCeUtleSA9IChjaGFuZ2UsIGtleSwgb2Zmc2V0LCB0ZXh0LCBtYXJrcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChrZXkpXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5nZXROb2RlKGtleSlcbiAgbWFya3MgPSBtYXJrcyB8fCBub2RlLmdldE1hcmtzQXRJbmRleChvZmZzZXQpXG5cbiAgY2hhbmdlLmFwcGx5T3BlcmF0aW9uKHtcbiAgICB0eXBlOiAnaW5zZXJ0X3RleHQnLFxuICAgIHZhbHVlLFxuICAgIHBhdGgsXG4gICAgb2Zmc2V0LFxuICAgIHRleHQsXG4gICAgbWFya3MsXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogTWVyZ2UgYSBub2RlIGJ5IGBrZXlgIHdpdGggdGhlIHByZXZpb3VzIG5vZGUuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLm1lcmdlTm9kZUJ5S2V5ID0gKGNoYW5nZSwga2V5LCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChrZXkpXG4gIGNvbnN0IHByZXZpb3VzID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNTaWJsaW5nKGtleSlcblxuICBpZiAoIXByZXZpb3VzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbWVyZ2Ugbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLCBubyBwcmV2aW91cyBrZXkuYClcbiAgfVxuXG4gIGNvbnN0IHBvc2l0aW9uID0gcHJldmlvdXMub2JqZWN0ID09ICd0ZXh0JyA/IHByZXZpb3VzLnRleHQubGVuZ3RoIDogcHJldmlvdXMubm9kZXMuc2l6ZVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ21lcmdlX25vZGUnLFxuICAgIHZhbHVlLFxuICAgIHBhdGgsXG4gICAgcG9zaXRpb24sXG4gICAgdGFyZ2V0OiBudWxsLFxuICB9KVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIE1vdmUgYSBub2RlIGJ5IGBrZXlgIHRvIGEgbmV3IHBhcmVudCBieSBgbmV3S2V5YCBhbmQgYGluZGV4YC5cbiAqIGBuZXdLZXlgIGlzIHRoZSBrZXkgb2YgdGhlIGNvbnRhaW5lciAoaXQgY2FuIGJlIHRoZSBkb2N1bWVudCBpdHNlbGYpXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IG5ld0tleVxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMubW92ZU5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgbmV3S2V5LCBuZXdJbmRleCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuICBjb25zdCBuZXdQYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChuZXdLZXkpXG5cbiAgY2hhbmdlLmFwcGx5T3BlcmF0aW9uKHtcbiAgICB0eXBlOiAnbW92ZV9ub2RlJyxcbiAgICB2YWx1ZSxcbiAgICBwYXRoLFxuICAgIG5ld1BhdGg6IFsuLi5uZXdQYXRoLCBuZXdJbmRleF0sXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldENvbW1vbkFuY2VzdG9yKGtleSwgbmV3S2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBtYXJrIGZyb20gdGV4dCBhdCBgb2Zmc2V0YCBhbmQgYGxlbmd0aGAgaW4gbm9kZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0XG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoXG4gKiBAcGFyYW0ge01hcmt9IG1hcmtcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5yZW1vdmVNYXJrQnlLZXkgPSAoY2hhbmdlLCBrZXksIG9mZnNldCwgbGVuZ3RoLCBtYXJrLCBvcHRpb25zID0ge30pID0+IHtcbiAgbWFyayA9IE1hcmsuY3JlYXRlKG1hcmspXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0Tm9kZShrZXkpXG4gIGNvbnN0IGxlYXZlcyA9IG5vZGUuZ2V0TGVhdmVzKClcblxuICBjb25zdCBvcGVyYXRpb25zID0gW11cbiAgY29uc3QgYnggPSBvZmZzZXRcbiAgY29uc3QgYnkgPSBvZmZzZXQgKyBsZW5ndGhcbiAgbGV0IG8gPSAwXG5cbiAgbGVhdmVzLmZvckVhY2goKGxlYWYpID0+IHtcbiAgICBjb25zdCBheCA9IG9cbiAgICBjb25zdCBheSA9IGF4ICsgbGVhZi50ZXh0Lmxlbmd0aFxuXG4gICAgbyArPSBsZWFmLnRleHQubGVuZ3RoXG5cbiAgICAvLyBJZiB0aGUgbGVhZiBkb2Vzbid0IG92ZXJsYXAgd2l0aCB0aGUgb3BlcmF0aW9uLCBjb250aW51ZSBvbi5cbiAgICBpZiAoYXkgPCBieCB8fCBieSA8IGF4KSByZXR1cm5cblxuICAgIC8vIElmIHRoZSBsZWFmIGFscmVhZHkgaGFzIHRoZSBtYXJrLCBjb250aW51ZSBvbi5cbiAgICBpZiAoIWxlYWYubWFya3MuaGFzKG1hcmspKSByZXR1cm5cblxuICAgIC8vIE90aGVyd2lzZSwgZGV0ZXJtaW5lIHdoaWNoIG9mZnNldCBhbmQgY2hhcmFjdGVycyBvdmVybGFwLlxuICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5tYXgoYXgsIGJ4KVxuICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKGF5LCBieSlcblxuICAgIG9wZXJhdGlvbnMucHVzaCh7XG4gICAgICB0eXBlOiAncmVtb3ZlX21hcmsnLFxuICAgICAgdmFsdWUsXG4gICAgICBwYXRoLFxuICAgICAgb2Zmc2V0OiBzdGFydCxcbiAgICAgIGxlbmd0aDogZW5kIC0gc3RhcnQsXG4gICAgICBtYXJrLFxuICAgIH0pXG4gIH0pXG5cbiAgY2hhbmdlLmFwcGx5T3BlcmF0aW9ucyhvcGVyYXRpb25zKVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBhbGwgYG1hcmtzYCBmcm9tIG5vZGUgYnkgYGtleWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnJlbW92ZUFsbE1hcmtzQnlLZXkgPSAoY2hhbmdlLCBrZXksIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IHN0YXRlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gc3RhdGVcbiAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmdldE5vZGUoa2V5KVxuICBjb25zdCB0ZXh0cyA9IG5vZGUub2JqZWN0ID09PSAndGV4dCcgPyBbbm9kZV0gOiBub2RlLmdldFRleHRzQXNBcnJheSgpXG5cbiAgdGV4dHMuZm9yRWFjaCgodGV4dCkgPT4ge1xuICAgIHRleHQuZ2V0TWFya3NBc0FycmF5KCkuZm9yRWFjaCgobWFyaykgPT4ge1xuICAgICAgY2hhbmdlLnJlbW92ZU1hcmtCeUtleSh0ZXh0LmtleSwgMCwgdGV4dC50ZXh0Lmxlbmd0aCwgbWFyaywgb3B0aW9ucylcbiAgICB9KVxuICB9KVxufVxuXG4vKipcbiAqIFJlbW92ZSBhIG5vZGUgYnkgYGtleWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnJlbW92ZU5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0Tm9kZShrZXkpXG5cbiAgY2hhbmdlLmFwcGx5T3BlcmF0aW9uKHtcbiAgICB0eXBlOiAncmVtb3ZlX25vZGUnLFxuICAgIHZhbHVlLFxuICAgIHBhdGgsXG4gICAgbm9kZSxcbiAgfSlcblxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KGtleSlcbiAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudC5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgdGV4dCBhdCBgb2Zmc2V0YCBhbmQgYGxlbmd0aGAgaW4gbm9kZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0XG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMucmVtb3ZlVGV4dEJ5S2V5ID0gKGNoYW5nZSwga2V5LCBvZmZzZXQsIGxlbmd0aCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0Tm9kZShrZXkpXG4gIGNvbnN0IGxlYXZlcyA9IG5vZGUuZ2V0TGVhdmVzKClcbiAgY29uc3QgeyB0ZXh0IH0gPSBub2RlXG5cbiAgY29uc3QgcmVtb3ZhbHMgPSBbXVxuICBjb25zdCBieCA9IG9mZnNldFxuICBjb25zdCBieSA9IG9mZnNldCArIGxlbmd0aFxuICBsZXQgbyA9IDBcblxuICBsZWF2ZXMuZm9yRWFjaCgobGVhZikgPT4ge1xuICAgIGNvbnN0IGF4ID0gb1xuICAgIGNvbnN0IGF5ID0gYXggKyBsZWFmLnRleHQubGVuZ3RoXG5cbiAgICBvICs9IGxlYWYudGV4dC5sZW5ndGhcblxuICAgIC8vIElmIHRoZSBsZWFmIGRvZXNuJ3Qgb3ZlcmxhcCB3aXRoIHRoZSByZW1vdmFsLCBjb250aW51ZSBvbi5cbiAgICBpZiAoYXkgPCBieCB8fCBieSA8IGF4KSByZXR1cm5cblxuICAgIC8vIE90aGVyd2lzZSwgZGV0ZXJtaW5lIHdoaWNoIG9mZnNldCBhbmQgY2hhcmFjdGVycyBvdmVybGFwLlxuICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5tYXgoYXgsIGJ4KVxuICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKGF5LCBieSlcbiAgICBjb25zdCBzdHJpbmcgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgICByZW1vdmFscy5wdXNoKHtcbiAgICAgIHR5cGU6ICdyZW1vdmVfdGV4dCcsXG4gICAgICB2YWx1ZSxcbiAgICAgIHBhdGgsXG4gICAgICBvZmZzZXQ6IHN0YXJ0LFxuICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgbWFya3M6IGxlYWYubWFya3MsXG4gICAgfSlcbiAgfSlcblxuICAvLyBBcHBseSBpbiByZXZlcnNlIG9yZGVyLCBzbyBzdWJzZXF1ZW50IHJlbW92YWxzIGRvbid0IGltcGFjdCBwcmV2aW91cyBvbmVzLlxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb25zKHJlbW92YWxzLnJldmVyc2UoKSlcblxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY29uc3QgYmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoYmxvY2sua2V5KVxuICB9XG59XG5cbi8qKlxuYCogUmVwbGFjZSBhIGBub2RlYCB3aXRoIGFub3RoZXIgYG5vZGVgXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtPYmplY3R8Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnJlcGxhY2VOb2RlQnlLZXkgPSAoY2hhbmdlLCBrZXksIG5ld05vZGUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBuZXdOb2RlID0gTm9kZS5jcmVhdGUobmV3Tm9kZSlcbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0Tm9kZShrZXkpXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yobm9kZSlcbiAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShrZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHBhcmVudC5rZXksIGluZGV4LCBuZXdOb2RlLCBvcHRpb25zKVxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogU2V0IGBwcm9wZXJ0aWVzYCBvbiBtYXJrIG9uIHRleHQgYXQgYG9mZnNldGAgYW5kIGBsZW5ndGhgIGluIG5vZGUgYnkgYGtleWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aFxuICogQHBhcmFtIHtNYXJrfSBtYXJrXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuc2V0TWFya0J5S2V5ID0gKGNoYW5nZSwga2V5LCBvZmZzZXQsIGxlbmd0aCwgbWFyaywgcHJvcGVydGllcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIG1hcmsgPSBNYXJrLmNyZWF0ZShtYXJrKVxuICBwcm9wZXJ0aWVzID0gTWFyay5jcmVhdGVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ3NldF9tYXJrJyxcbiAgICB2YWx1ZSxcbiAgICBwYXRoLFxuICAgIG9mZnNldCxcbiAgICBsZW5ndGgsXG4gICAgbWFyayxcbiAgICBwcm9wZXJ0aWVzLFxuICB9KVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIFNldCBgcHJvcGVydGllc2Agb24gYSBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gcHJvcGVydGllc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnNldE5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgcHJvcGVydGllcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIHByb3BlcnRpZXMgPSBOb2RlLmNyZWF0ZVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChrZXkpXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5nZXROb2RlKGtleSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb24oe1xuICAgIHR5cGU6ICdzZXRfbm9kZScsXG4gICAgdmFsdWUsXG4gICAgcGF0aCxcbiAgICBub2RlLFxuICAgIHByb3BlcnRpZXMsXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkobm9kZS5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBTcGxpdCBhIG5vZGUgYnkgYGtleWAgYXQgYHBvc2l0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5zcGxpdE5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgcG9zaXRpb24sIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUsIHRhcmdldCA9IG51bGwgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHBhdGggPSBkb2N1bWVudC5nZXRQYXRoKGtleSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb24oe1xuICAgIHR5cGU6ICdzcGxpdF9ub2RlJyxcbiAgICB2YWx1ZSxcbiAgICBwYXRoLFxuICAgIHBvc2l0aW9uLFxuICAgIHRhcmdldCxcbiAgfSlcblxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KGtleSlcbiAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudC5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBTcGxpdCBhIG5vZGUgZGVlcGx5IGRvd24gdGhlIHRyZWUgYnkgYGtleWAsIGB0ZXh0S2V5YCBhbmQgYHRleHRPZmZzZXRgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnNwbGl0RGVzY2VuZGFudHNCeUtleSA9IChjaGFuZ2UsIGtleSwgdGV4dEtleSwgdGV4dE9mZnNldCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmIChrZXkgPT0gdGV4dEtleSkge1xuICAgIGNoYW5nZS5zcGxpdE5vZGVCeUtleSh0ZXh0S2V5LCB0ZXh0T2Zmc2V0LCBvcHRpb25zKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuXG4gIGNvbnN0IHRleHQgPSBkb2N1bWVudC5nZXROb2RlKHRleHRLZXkpXG4gIGNvbnN0IGFuY2VzdG9ycyA9IGRvY3VtZW50LmdldEFuY2VzdG9ycyh0ZXh0S2V5KVxuICBjb25zdCBub2RlcyA9IGFuY2VzdG9ycy5za2lwVW50aWwoYSA9PiBhLmtleSA9PSBrZXkpLnJldmVyc2UoKS51bnNoaWZ0KHRleHQpXG4gIGxldCBwcmV2aW91c1xuICBsZXQgaW5kZXhcblxuICBub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgY29uc3QgcHJldkluZGV4ID0gaW5kZXggPT0gbnVsbCA/IG51bGwgOiBpbmRleFxuICAgIGluZGV4ID0gcHJldmlvdXMgPyBub2RlLm5vZGVzLmluZGV4T2YocHJldmlvdXMpICsgMSA6IHRleHRPZmZzZXRcbiAgICBwcmV2aW91cyA9IG5vZGVcbiAgICBjaGFuZ2Uuc3BsaXROb2RlQnlLZXkobm9kZS5rZXksIGluZGV4LCB7IG5vcm1hbGl6ZTogZmFsc2UsIHRhcmdldDogcHJldkluZGV4IH0pXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogVW53cmFwIGNvbnRlbnQgZnJvbSBhbiBpbmxpbmUgcGFyZW50IHdpdGggYHByb3BlcnRpZXNgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gcHJvcGVydGllc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnVud3JhcElubGluZUJ5S2V5ID0gKGNoYW5nZSwga2V5LCBwcm9wZXJ0aWVzLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgY29uc3QgZmlyc3QgPSBub2RlLmdldEZpcnN0VGV4dCgpXG4gIGNvbnN0IGxhc3QgPSBub2RlLmdldExhc3RUZXh0KClcbiAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24ubW92ZVRvUmFuZ2VPZihmaXJzdCwgbGFzdClcbiAgY2hhbmdlLnVud3JhcElubGluZUF0UmFuZ2UocmFuZ2UsIHByb3BlcnRpZXMsIG9wdGlvbnMpXG59XG5cbi8qKlxuICogVW53cmFwIGNvbnRlbnQgZnJvbSBhIGJsb2NrIHBhcmVudCB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy51bndyYXBCbG9ja0J5S2V5ID0gKGNoYW5nZSwga2V5LCBwcm9wZXJ0aWVzLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgY29uc3QgZmlyc3QgPSBub2RlLmdldEZpcnN0VGV4dCgpXG4gIGNvbnN0IGxhc3QgPSBub2RlLmdldExhc3RUZXh0KClcbiAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24ubW92ZVRvUmFuZ2VPZihmaXJzdCwgbGFzdClcbiAgY2hhbmdlLnVud3JhcEJsb2NrQXRSYW5nZShyYW5nZSwgcHJvcGVydGllcywgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBVbndyYXAgYSBzaW5nbGUgbm9kZSBmcm9tIGl0cyBwYXJlbnQuXG4gKlxuICogSWYgdGhlIG5vZGUgaXMgc3Vycm91bmRlZCB3aXRoIHNpYmxpbmdzLCBpdHMgcGFyZW50IHdpbGwgYmVcbiAqIHNwbGl0LiBJZiB0aGUgbm9kZSBpcyB0aGUgb25seSBjaGlsZCwgdGhlIHBhcmVudCBpcyByZW1vdmVkLCBhbmRcbiAqIHNpbXBseSByZXBsYWNlZCBieSB0aGUgbm9kZSBpdHNlbGYuICBDYW5ub3QgdW53cmFwIGEgcm9vdCBub2RlLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy51bndyYXBOb2RlQnlLZXkgPSAoY2hhbmdlLCBrZXksIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCBub3JtYWxpemUgPSBjaGFuZ2UuZ2V0RmxhZygnbm9ybWFsaXplJywgb3B0aW9ucylcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gIGNvbnN0IG5vZGUgPSBwYXJlbnQuZ2V0Q2hpbGQoa2V5KVxuXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yobm9kZSlcbiAgY29uc3QgaXNGaXJzdCA9IGluZGV4ID09PSAwXG4gIGNvbnN0IGlzTGFzdCA9IGluZGV4ID09PSBwYXJlbnQubm9kZXMuc2l6ZSAtIDFcblxuICBjb25zdCBwYXJlbnRQYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQocGFyZW50LmtleSlcbiAgY29uc3QgcGFyZW50SW5kZXggPSBwYXJlbnRQYXJlbnQubm9kZXMuaW5kZXhPZihwYXJlbnQpXG5cbiAgaWYgKHBhcmVudC5ub2Rlcy5zaXplID09PSAxKSB7XG4gICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoa2V5LCBwYXJlbnRQYXJlbnQua2V5LCBwYXJlbnRJbmRleCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShwYXJlbnQua2V5LCBvcHRpb25zKVxuICB9XG5cbiAgZWxzZSBpZiAoaXNGaXJzdCkge1xuICAgIC8vIEp1c3QgbW92ZSB0aGUgbm9kZSBiZWZvcmUgaXRzIHBhcmVudC5cbiAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShrZXksIHBhcmVudFBhcmVudC5rZXksIHBhcmVudEluZGV4LCBvcHRpb25zKVxuICB9XG5cbiAgZWxzZSBpZiAoaXNMYXN0KSB7XG4gICAgLy8gSnVzdCBtb3ZlIHRoZSBub2RlIGFmdGVyIGl0cyBwYXJlbnQuXG4gICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoa2V5LCBwYXJlbnRQYXJlbnQua2V5LCBwYXJlbnRJbmRleCArIDEsIG9wdGlvbnMpXG4gIH1cblxuICBlbHNlIHtcbiAgICAvLyBTcGxpdCB0aGUgcGFyZW50LlxuICAgIGNoYW5nZS5zcGxpdE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICAvLyBFeHRyYWN0IHRoZSBub2RlIGluIGJldHdlZW4gdGhlIHNwbGl0dGVkIHBhcmVudC5cbiAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShrZXksIHBhcmVudFBhcmVudC5rZXksIHBhcmVudEluZGV4ICsgMSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudFBhcmVudC5rZXkpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV3JhcCBhIG5vZGUgaW4gYSBibG9jayB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBub2RlIHRvIHdyYXBcbiAqIEBwYXJhbSB7QmxvY2t8T2JqZWN0fFN0cmluZ30gYmxvY2sgVGhlIHdyYXBwaW5nIGJsb2NrIChpdHMgY2hpbGRyZW4gYXJlIGRpc2NhcmRlZClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy53cmFwQmxvY2tCeUtleSA9IChjaGFuZ2UsIGtleSwgYmxvY2ssIG9wdGlvbnMpID0+IHtcbiAgYmxvY2sgPSBCbG9jay5jcmVhdGUoYmxvY2spXG4gIGJsb2NrID0gYmxvY2suc2V0KCdub2RlcycsIGJsb2NrLm5vZGVzLmNsZWFyKCkpXG5cbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gY2hhbmdlLnZhbHVlXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KG5vZGUua2V5KVxuICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKG5vZGUpXG5cbiAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCwgYmxvY2ssIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICBjaGFuZ2UubW92ZU5vZGVCeUtleShub2RlLmtleSwgYmxvY2sua2V5LCAwLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIFdyYXAgYSBub2RlIGluIGFuIGlubGluZSB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBub2RlIHRvIHdyYXBcbiAqIEBwYXJhbSB7QmxvY2t8T2JqZWN0fFN0cmluZ30gaW5saW5lIFRoZSB3cmFwcGluZyBpbmxpbmUgKGl0cyBjaGlsZHJlbiBhcmUgZGlzY2FyZGVkKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLndyYXBJbmxpbmVCeUtleSA9IChjaGFuZ2UsIGtleSwgaW5saW5lLCBvcHRpb25zKSA9PiB7XG4gIGlubGluZSA9IElubGluZS5jcmVhdGUoaW5saW5lKVxuICBpbmxpbmUgPSBpbmxpbmUuc2V0KCdub2RlcycsIGlubGluZS5ub2Rlcy5jbGVhcigpKVxuXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IGNoYW5nZS52YWx1ZVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0RGVzY2VuZGFudChrZXkpXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChub2RlLmtleSlcbiAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihub2RlKVxuXG4gIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkocGFyZW50LmtleSwgaW5kZXgsIGlubGluZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KG5vZGUua2V5LCBpbmxpbmUua2V5LCAwLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIFdyYXAgYSBub2RlIGJ5IGBrZXlgIHdpdGggYHBhcmVudGAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtOb2RlfE9iamVjdH0gcGFyZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbkNoYW5nZXMud3JhcE5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgcGFyZW50KSA9PiB7XG4gIHBhcmVudCA9IE5vZGUuY3JlYXRlKHBhcmVudClcbiAgcGFyZW50ID0gcGFyZW50LnNldCgnbm9kZXMnLCBwYXJlbnQubm9kZXMuY2xlYXIoKSlcblxuICBpZiAocGFyZW50Lm9iamVjdCA9PSAnYmxvY2snKSB7XG4gICAgY2hhbmdlLndyYXBCbG9ja0J5S2V5KGtleSwgcGFyZW50KVxuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKHBhcmVudC5vYmplY3QgPT0gJ2lubGluZScpIHtcbiAgICBjaGFuZ2Uud3JhcElubGluZUJ5S2V5KGtleSwgcGFyZW50KVxuICAgIHJldHVyblxuICB9XG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlc1xuIl19