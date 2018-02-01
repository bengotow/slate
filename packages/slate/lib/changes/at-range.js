'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _node = require('../models/node');

var _node2 = _interopRequireDefault(_node);

var _string = require('../utils/string');

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Add a new `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.addMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  var texts = document.getTextsAtRange(range);

  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.addMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Add a list of `marks` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Array<Mixed>} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.addMarksAtRange = function (change, range, marks) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  marks.forEach(function (mark) {
    return change.addMarkAtRange(range, mark, options);
  });
};

/**
 * Delete everything in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteAtRange = function (change, range) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (range.isCollapsed) return;

  // Snapshot the selection, which creates an extra undo save point, so that
  // when you undo a delete, the expanded selection will be retained.
  change.snapshotSelection();

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;
  var document = value.document;

  var isStartVoid = document.hasVoidParent(startKey);
  var isEndVoid = document.hasVoidParent(endKey);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);

  // Check if we have a "hanging" selection case where the even though the
  // selection extends into the start of the end node, we actually want to
  // ignore that for UX reasons.
  var isHanging = startOffset == 0 && endOffset == 0 && isStartVoid == false && startKey == startBlock.getFirstText().key && endKey == endBlock.getFirstText().key;

  // If it's a hanging selection, nudge it back to end in the previous text.
  if (isHanging && isEndVoid) {
    var prevText = document.getPreviousText(endKey);
    endKey = prevText.key;
    endOffset = prevText.text.length;
    isEndVoid = document.hasVoidParent(endKey);
  }

  // If the start node is inside a void node, remove the void node and update
  // the starting point to be right after it, continuously until the start point
  // is not a void, or until the entire range is handled.
  while (isStartVoid) {
    var startVoid = document.getClosestVoid(startKey);
    var nextText = document.getNextText(startKey);
    change.removeNodeByKey(startVoid.key, { normalize: false });

    // If the start and end keys are the same, we're done.
    if (startKey == endKey) return;

    // If there is no next text node, we're done.
    if (!nextText) return;

    // Continue...
    document = change.value.document;
    startKey = nextText.key;
    startOffset = 0;
    isStartVoid = document.hasVoidParent(startKey);
  }

  // If the end node is inside a void node, do the same thing but backwards. But
  // we don't need any aborting checks because if we've gotten this far there
  // must be a non-void node that will exit the loop.
  while (isEndVoid) {
    var endVoid = document.getClosestVoid(endKey);
    var _prevText = document.getPreviousText(endKey);
    change.removeNodeByKey(endVoid.key, { normalize: false });

    // Continue...
    document = change.value.document;
    endKey = _prevText.key;
    endOffset = _prevText.text.length;
    isEndVoid = document.hasVoidParent(endKey);
  }

  // If the start and end key are the same, and it was a hanging selection, we
  // can just remove the entire block.
  if (startKey == endKey && isHanging) {
    change.removeNodeByKey(startBlock.key, { normalize: normalize });
    return;
  }

  // Otherwise, if it wasn't hanging, we're inside a single text node, so we can
  // simply remove the text in the range.
  else if (startKey == endKey) {
      var index = startOffset;
      var length = endOffset - startOffset;
      change.removeTextByKey(startKey, index, length, { normalize: normalize });
      return;
    }

    // Otherwise, we need to recursively remove text and nodes inside the start
    // block after the start offset and inside the end block before the end
    // offset. Then remove any blocks that are in between the start and end
    // blocks. Then finally merge the start and end nodes.
    else {
        startBlock = document.getClosestBlock(startKey);
        endBlock = document.getClosestBlock(endKey);
        var startText = document.getNode(startKey);
        var endText = document.getNode(endKey);
        var startLength = startText.text.length - startOffset;
        var endLength = endOffset;

        var ancestor = document.getCommonAncestor(startKey, endKey);
        var startChild = ancestor.getFurthestAncestor(startKey);
        var endChild = ancestor.getFurthestAncestor(endKey);

        var startParent = document.getParent(startBlock.key);
        var startParentIndex = startParent.nodes.indexOf(startBlock);
        var endParentIndex = startParent.nodes.indexOf(endBlock);

        var child = void 0;

        // Iterate through all of the nodes in the tree after the start text node
        // but inside the end child, and remove them.
        child = startText;

        while (child.key != startChild.key) {
          var parent = document.getParent(child.key);
          var _index = parent.nodes.indexOf(child);
          var afters = parent.nodes.slice(_index + 1);

          afters.reverse().forEach(function (node) {
            change.removeNodeByKey(node.key, { normalize: false });
          });

          child = parent;
        }

        // Remove all of the middle children.
        var startChildIndex = ancestor.nodes.indexOf(startChild);
        var endChildIndex = ancestor.nodes.indexOf(endChild);
        var middles = ancestor.nodes.slice(startChildIndex + 1, endChildIndex);

        middles.reverse().forEach(function (node) {
          change.removeNodeByKey(node.key, { normalize: false });
        });

        // Remove the nodes before the end text node in the tree.
        child = endText;

        while (child.key != endChild.key) {
          var _parent = document.getParent(child.key);
          var _index2 = _parent.nodes.indexOf(child);
          var befores = _parent.nodes.slice(0, _index2);

          befores.reverse().forEach(function (node) {
            change.removeNodeByKey(node.key, { normalize: false });
          });

          child = _parent;
        }

        // Remove any overlapping text content from the leaf text nodes.
        if (startLength != 0) {
          change.removeTextByKey(startKey, startOffset, startLength, { normalize: false });
        }

        if (endLength != 0) {
          change.removeTextByKey(endKey, 0, endOffset, { normalize: false });
        }

        // If the start and end blocks aren't the same, move and merge the end block
        // into the start block.
        if (startBlock.key != endBlock.key) {
          document = change.value.document;
          var lonely = document.getFurthestOnlyChildAncestor(endBlock.key);

          // Move the end block to be right after the start block.
          if (endParentIndex != startParentIndex + 1) {
            change.moveNodeByKey(endBlock.key, startParent.key, startParentIndex + 1, { normalize: false });
          }

          // If the selection is hanging, just remove the start block, otherwise
          // merge the end block into it.
          if (isHanging) {
            change.removeNodeByKey(startBlock.key, { normalize: false });
          } else {
            change.mergeNodeByKey(endBlock.key, { normalize: false });
          }

          // If nested empty blocks are left over above the end block, remove them.
          if (lonely) {
            change.removeNodeByKey(lonely.key, { normalize: false });
          }
        }

        // If we should normalize, do it now after everything.
        if (normalize) {
          change.normalizeNodeByKey(ancestor.key);
        }
      }
};

/**
 * Delete backward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteCharBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteLineBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var startWithVoidInline = startBlock.nodes.size > 1 && startBlock.nodes.get(0).text == '' && startBlock.nodes.get(1).object == 'inline';

  var o = offset + startOffset;

  // If line starts with an void inline node, the text node inside this inline
  // node disturbs the offset. Ignore this inline node and delete it afterwards.
  if (startWithVoidInline) {
    o -= 1;
  }

  change.deleteBackwardAtRange(range, o, options);

  // Delete the remaining first inline node if needed.
  if (startWithVoidInline) {
    change.deleteBackward();
  }
};

/**
 * Delete backward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteWordBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteBackwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;
  var _range = range,
      startKey = _range.startKey,
      focusOffset = _range.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);

  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    change.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtStartOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtStartOf(text)) {
    var prev = document.getPreviousText(text.key);
    var prevBlock = document.getClosestBlock(prev.key);
    var prevInline = document.getClosestInline(prev.key);

    // If the previous block is void, remove it.
    if (prevBlock && prevBlock.isVoid) {
      change.removeNodeByKey(prevBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (prevInline && prevInline.isVoid) {
      change.removeNodeByKey(prevInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && prevBlock != block) {
      range = range.merge({
        anchorKey: prev.key,
        anchorOffset: prev.text.length
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the focus offset is farther than the number of characters to delete,
  // just remove the characters backwards inside the current node.
  if (n < focusOffset) {
    range = range.merge({
      focusOffset: focusOffset - n,
      isBackward: true
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes backwards to go.
  var node = text;
  var offset = 0;
  var traversed = focusOffset;

  while (n > traversed) {
    node = document.getPreviousText(node.key);
    var next = traversed + node.text.length;
    if (n <= next) {
      offset = next - n;
      break;
    } else {
      traversed = next;
    }
  }

  // If the focus node is inside a void, go up until right after it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getNextText(parent.key);
    offset = 0;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset,
    isBackward: true
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Delete forward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteCharForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteLineForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  change.deleteForwardAtRange(range, o, options);
};

/**
 * Delete forward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteWordForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteForwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;
  var _range2 = range,
      startKey = _range2.startKey,
      focusOffset = _range2.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);

  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    var nextBlock = document.getNextBlock(block.key);
    change.removeNodeByKey(block.key, { normalize: normalize });
    if (nextBlock && nextBlock.key) {
      change.moveToStartOf(nextBlock);
    }
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    change.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtEndOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtEndOf(text)) {
    var next = document.getNextText(text.key);
    var _nextBlock = document.getClosestBlock(next.key);
    var nextInline = document.getClosestInline(next.key);

    // If the previous block is void, remove it.
    if (_nextBlock && _nextBlock.isVoid) {
      change.removeNodeByKey(_nextBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (nextInline && nextInline.isVoid) {
      change.removeNodeByKey(nextInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && _nextBlock != block) {
      range = range.merge({
        focusKey: next.key,
        focusOffset: 0
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the remaining characters to the end of the node is greater than or equal
  // to the number of characters to delete, just remove the characters forwards
  // inside the current node.
  if (n <= text.text.length - focusOffset) {
    range = range.merge({
      focusOffset: focusOffset + n
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes forwards to go.
  var node = text;
  var offset = focusOffset;
  var traversed = text.text.length - focusOffset;

  while (n > traversed) {
    node = document.getNextText(node.key);
    var _next = traversed + node.text.length;
    if (n <= _next) {
      offset = n - traversed;
      break;
    } else {
      traversed = _next;
    }
  }

  // If the focus node is inside a void, go up until right before it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getPreviousText(parent.key);
    offset = node.text.length;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Insert a `block` node at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Block|String|Object} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _block2.default.create(block);
  var normalize = change.getFlag('normalize', options);

  if (range.isExpanded) {
    change.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var value = change.value;
  var document = value.document;
  var _range3 = range,
      startKey = _range3.startKey,
      startOffset = _range3.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);

  if (startBlock.isVoid) {
    var extra = range.isAtEndOf(startBlock) ? 1 : 0;
    change.insertNodeByKey(parent.key, index + extra, block, { normalize: normalize });
  } else if (startBlock.isEmpty) {
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else if (range.isAtStartOf(startBlock)) {
    change.insertNodeByKey(parent.key, index, block, { normalize: normalize });
  } else if (range.isAtEndOf(startBlock)) {
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else {
    change.splitDescendantsByKey(startBlock.key, startKey, startOffset, { normalize: false });
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  }

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert a `fragment` at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Document} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertFragmentAtRange = function (change, range, fragment) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);

  // If the range is expanded, delete it first.
  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });
    range = range.collapseToStart();
  }

  // If the fragment is empty, there's nothing to do after deleting.
  if (!fragment.nodes.size) return;

  // Regenerate the keys for all of the fragments nodes, so that they're
  // guaranteed not to collide with the existing keys in the document. Otherwise
  // they will be rengerated automatically and we won't have an easy way to
  // reference them.
  fragment = fragment.mapDescendants(function (child) {
    return child.regenerateKey();
  });

  // Calculate a few things...
  var _range4 = range,
      startKey = _range4.startKey,
      startOffset = _range4.startOffset;
  var value = change.value;
  var document = value.document;

  var startText = document.getDescendant(startKey);
  var startBlock = document.getClosestBlock(startText.key);
  var startChild = startBlock.getFurthestAncestor(startText.key);
  var isAtStart = range.isAtStartOf(startBlock);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);
  var blocks = fragment.getBlocks();
  var firstBlock = blocks.first();
  var lastBlock = blocks.last();

  // If the fragment only contains a void block, use `insertBlock` instead.
  if (firstBlock == lastBlock && firstBlock.isVoid) {
    change.insertBlockAtRange(range, firstBlock, options);
    return;
  }

  // If the first and last block aren't the same, we need to insert all of the
  // nodes after the fragment's first block at the index.
  if (firstBlock != lastBlock) {
    var lonelyParent = fragment.getFurthest(firstBlock.key, function (p) {
      return p.nodes.size == 1;
    });
    var lonelyChild = lonelyParent || firstBlock;
    var startIndex = parent.nodes.indexOf(startBlock);
    fragment = fragment.removeDescendant(lonelyChild.key);

    fragment.nodes.forEach(function (node, i) {
      var newIndex = startIndex + i + 1;
      change.insertNodeByKey(parent.key, newIndex, node, { normalize: false });
    });
  }

  // Check if we need to split the node.
  if (startOffset != 0) {
    change.splitDescendantsByKey(startChild.key, startKey, startOffset, { normalize: false });
  }

  // Update our variables with the new value.
  document = change.value.document;
  startText = document.getDescendant(startKey);
  startBlock = document.getClosestBlock(startKey);
  startChild = startBlock.getFurthestAncestor(startText.key);

  // If the first and last block aren't the same, we need to move any of the
  // starting block's children after the split into the last block of the
  // fragment, which has already been inserted.
  if (firstBlock != lastBlock) {
    var nextChild = isAtStart ? startChild : startBlock.getNextSibling(startChild.key);
    var nextNodes = nextChild ? startBlock.nodes.skipUntil(function (n) {
      return n.key == nextChild.key;
    }) : (0, _immutable.List)();
    var lastIndex = lastBlock.nodes.size;

    nextNodes.forEach(function (node, i) {
      var newIndex = lastIndex + i;
      change.moveNodeByKey(node.key, lastBlock.key, newIndex, { normalize: false });
    });
  }

  // If the starting block is empty, we replace it entirely with the first block
  // of the fragment, since this leads to a more expected behavior for the user.
  if (startBlock.isEmpty) {
    change.removeNodeByKey(startBlock.key, { normalize: false });
    change.insertNodeByKey(parent.key, index, firstBlock, { normalize: false });
  }

  // Otherwise, we maintain the starting block, and insert all of the first
  // block's inline nodes into it at the split point.
  else {
      var inlineChild = startBlock.getFurthestAncestor(startText.key);
      var inlineIndex = startBlock.nodes.indexOf(inlineChild);

      firstBlock.nodes.forEach(function (inline, i) {
        var o = startOffset == 0 ? 0 : 1;
        var newIndex = inlineIndex + i + o;
        change.insertNodeByKey(startBlock.key, newIndex, inline, { normalize: false });
      });
    }

  // Normalize if requested.
  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert an `inline` node at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Inline|String|Object} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  inline = _inline2.default.create(inline);

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });
    range = range.collapseToStart();
  }

  var value = change.value;
  var document = value.document;
  var _range5 = range,
      startKey = _range5.startKey,
      startOffset = _range5.startOffset;

  var parent = document.getParent(startKey);
  var startText = document.assertDescendant(startKey);
  var index = parent.nodes.indexOf(startText);

  if (parent.isVoid) return;

  change.splitNodeByKey(startKey, startOffset, { normalize: false });
  change.insertNodeByKey(parent.key, index + 1, inline, { normalize: false });

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert `text` at a `range`, with optional `marks`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertTextAtRange = function (change, range, text, marks) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var normalize = options.normalize;
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var key = startKey;
  var offset = startOffset;
  var parent = document.getParent(startKey);

  if (parent.isVoid) return;

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });

    // Update range start after delete
    if (change.value.startKey !== key) {
      key = change.value.startKey;
      offset = change.value.startOffset;
    }
  }

  // PERF: Unless specified, don't normalize if only inserting text.
  if (normalize !== undefined) {
    normalize = range.isExpanded;
  }

  change.insertTextByKey(key, offset, text, marks, { normalize: normalize });
};

/**
 * Remove an existing `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mark|String} mark (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var texts = document.getTextsAtRange(range);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.removeMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Set the `properties` of block nodes in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setBlockAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var blocks = document.getBlocksAtRange(range);

  blocks.forEach(function (block) {
    change.setNodeByKey(block.key, properties, { normalize: normalize });
  });
};

/**
 * Set the `properties` of inline nodes in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setInlineAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var inlines = document.getInlinesAtRange(range);

  inlines.forEach(function (inline) {
    change.setNodeByKey(inline.key, properties, { normalize: normalize });
  });
};

/**
 * Split the block nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitBlockAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range6 = range,
      startKey = _range6.startKey,
      startOffset = _range6.startOffset;
  var value = change.value;
  var document = value.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestBlock(node.key);
  var h = 0;

  while (parent && parent.object == 'block' && h < height) {
    node = parent;
    parent = document.getClosestBlock(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, { normalize: normalize });
};

/**
 * Split the inline nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitInlineAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range7 = range,
      startKey = _range7.startKey,
      startOffset = _range7.startOffset;
  var value = change.value;
  var document = value.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestInline(node.key);
  var h = 0;

  while (parent && parent.object == 'inline' && h < height) {
    node = parent;
    parent = document.getClosestInline(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, { normalize: normalize });
};

/**
 * Add or remove a `mark` from the characters at `range`, depending on whether
 * it's already there.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.toggleMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  mark = _mark2.default.create(mark);

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var marks = document.getActiveMarksAtRange(range);
  var exists = marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    change.removeMarkAtRange(range, mark, { normalize: normalize });
  } else {
    change.addMarkAtRange(range, mark, { normalize: normalize });
  }
};

/**
 * Unwrap all of the block nodes in a `range` from a block with `properties`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapBlockAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _node2.default.createProperties(properties);

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var blocks = document.getBlocksAtRange(range);
  var wrappers = blocks.map(function (block) {
    return document.getClosest(block.key, function (parent) {
      if (parent.object != 'block') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  wrappers.forEach(function (block) {
    var first = block.nodes.first();
    var last = block.nodes.last();
    var parent = document.getParent(block.key);
    var index = parent.nodes.indexOf(block);

    var children = block.nodes.filter(function (child) {
      return blocks.some(function (b) {
        return child == b || child.hasDescendant(b.key);
      });
    });

    var firstMatch = children.first();
    var lastMatch = children.last();

    if (first == firstMatch && last == lastMatch) {
      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, { normalize: false });
      });

      change.removeNodeByKey(block.key, { normalize: false });
    } else if (last == lastMatch) {
      block.nodes.skipUntil(function (n) {
        return n == firstMatch;
      }).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + 1 + i, { normalize: false });
      });
    } else if (first == firstMatch) {
      block.nodes.takeUntil(function (n) {
        return n == lastMatch;
      }).push(lastMatch).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, { normalize: false });
      });
    } else {
      var firstText = firstMatch.getFirstText();
      change.splitDescendantsByKey(block.key, firstText.key, 0, { normalize: false });
      document = change.value.document;

      children.forEach(function (child, i) {
        if (i == 0) {
          var extra = child;
          child = document.getNextBlock(child.key);
          change.removeNodeByKey(extra.key, { normalize: false });
        }

        change.moveNodeByKey(child.key, parent.key, index + 1 + i, { normalize: false });
      });
    }
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument();
  }
};

/**
 * Unwrap the inline nodes in a `range` from an inline with `properties`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapInlineAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _node2.default.createProperties(properties);

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var texts = document.getTextsAtRange(range);
  var inlines = texts.map(function (text) {
    return document.getClosest(text.key, function (parent) {
      if (parent.object != 'inline') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  inlines.forEach(function (inline) {
    var parent = change.value.document.getParent(inline.key);
    var index = parent.nodes.indexOf(inline);

    inline.nodes.forEach(function (child, i) {
      change.moveNodeByKey(child.key, parent.key, index + i, { normalize: false });
    });
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument();
  }
};

/**
 * Wrap all of the blocks in a `range` in a new `block`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Block|Object|String} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _block2.default.create(block);
  block = block.set('nodes', block.nodes.clear());

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;


  var blocks = document.getBlocksAtRange(range);
  var firstblock = blocks.first();
  var lastblock = blocks.last();
  var parent = void 0,
      siblings = void 0,
      index = void 0;

  // If there is only one block in the selection then we know the parent and
  // siblings.
  if (blocks.length === 1) {
    parent = document.getParent(firstblock.key);
    siblings = blocks;
  }

  // Determine closest shared parent to all blocks in selection.
  else {
      parent = document.getClosest(firstblock.key, function (p1) {
        return !!document.getClosest(lastblock.key, function (p2) {
          return p1 == p2;
        });
      });
    }

  // If no shared parent could be found then the parent is the document.
  if (parent == null) parent = document;

  // Create a list of direct children siblings of parent that fall in the
  // selection.
  if (siblings == null) {
    var indexes = parent.nodes.reduce(function (ind, node, i) {
      if (node == firstblock || node.hasDescendant(firstblock.key)) ind[0] = i;
      if (node == lastblock || node.hasDescendant(lastblock.key)) ind[1] = i;
      return ind;
    }, []);

    index = indexes[0];
    siblings = parent.nodes.slice(indexes[0], indexes[1] + 1);
  }

  // Get the index to place the new wrapped node at.
  if (index == null) {
    index = parent.nodes.indexOf(siblings.first());
  }

  // Inject the new block node into the parent.
  change.insertNodeByKey(parent.key, index, block, { normalize: false });

  // Move the sibling nodes into the new block node.
  siblings.forEach(function (node, i) {
    change.moveNodeByKey(node.key, block.key, i, { normalize: false });
  });

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Wrap the text and inlines in a `range` in a new `inline`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Inline|Object|String} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var value = change.value;
  var document = value.document;

  var normalize = change.getFlag('normalize', options);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (range.isCollapsed) {
    // Wrapping an inline void
    var inlineParent = document.getClosestInline(startKey);
    if (!inlineParent.isVoid) {
      return;
    }

    return change.wrapInlineByKey(inlineParent.key, inline, options);
  }

  inline = _inline2.default.create(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var blocks = document.getBlocksAtRange(range);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);
  var startChild = startBlock.getFurthestAncestor(startKey);
  var endChild = endBlock.getFurthestAncestor(endKey);

  change.splitDescendantsByKey(endChild.key, endKey, endOffset, { normalize: false });
  change.splitDescendantsByKey(startChild.key, startKey, startOffset, { normalize: false });

  document = change.value.document;
  startBlock = document.getDescendant(startBlock.key);
  endBlock = document.getDescendant(endBlock.key);
  startChild = startBlock.getFurthestAncestor(startKey);
  endChild = endBlock.getFurthestAncestor(endKey);
  var startIndex = startBlock.nodes.indexOf(startChild);
  var endIndex = endBlock.nodes.indexOf(endChild);

  if (startBlock == endBlock) {
    document = change.value.document;
    startBlock = document.getClosestBlock(startKey);
    startChild = startBlock.getFurthestAncestor(startKey);

    var startInner = document.getNextSibling(startChild.key);
    var startInnerIndex = startBlock.nodes.indexOf(startInner);
    var endInner = startKey == endKey ? startInner : startBlock.getFurthestAncestor(endKey);
    var inlines = startBlock.nodes.skipUntil(function (n) {
      return n == startInner;
    }).takeUntil(function (n) {
      return n == endInner;
    }).push(endInner);

    var node = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startInnerIndex, node, { normalize: false });

    inlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, node.key, i, { normalize: false });
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key);
    }
  } else {
    var startInlines = startBlock.nodes.slice(startIndex + 1);
    var endInlines = endBlock.nodes.slice(0, endIndex + 1);
    var startNode = inline.regenerateKey();
    var endNode = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startIndex + 1, startNode, { normalize: false });
    change.insertNodeByKey(endBlock.key, endIndex, endNode, { normalize: false });

    startInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, startNode.key, i, { normalize: false });
    });

    endInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, endNode.key, i, { normalize: false });
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key).normalizeNodeByKey(endBlock.key);
    }

    blocks.slice(1, -1).forEach(function (block) {
      var node = inline.regenerateKey();
      change.insertNodeByKey(block.key, 0, node, { normalize: false });

      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, node.key, i, { normalize: false });
      });

      if (normalize) {
        change.normalizeNodeByKey(block.key);
      }
    });
  }
};

/**
 * Wrap the text in a `range` in a prefix/suffix.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String} prefix
 * @param {String} suffix (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapTextAtRange = function (change, range, prefix) {
  var suffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : prefix;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var startKey = range.startKey,
      endKey = range.endKey;

  var start = range.collapseToStart();
  var end = range.collapseToEnd();

  if (startKey == endKey) {
    end = end.move(prefix.length);
  }

  change.insertTextAtRange(start, prefix, [], { normalize: normalize });
  change.insertTextAtRange(end, suffix, [], { normalize: normalize });
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL2F0LXJhbmdlLmpzIl0sIm5hbWVzIjpbIkNoYW5nZXMiLCJhZGRNYXJrQXRSYW5nZSIsImNoYW5nZSIsInJhbmdlIiwibWFyayIsIm9wdGlvbnMiLCJpc0NvbGxhcHNlZCIsIm5vcm1hbGl6ZSIsImdldEZsYWciLCJ2YWx1ZSIsImRvY3VtZW50Iiwic3RhcnRLZXkiLCJzdGFydE9mZnNldCIsImVuZEtleSIsImVuZE9mZnNldCIsInRleHRzIiwiZ2V0VGV4dHNBdFJhbmdlIiwiZm9yRWFjaCIsIm5vZGUiLCJrZXkiLCJpbmRleCIsImxlbmd0aCIsInRleHQiLCJhZGRNYXJrQnlLZXkiLCJhZGRNYXJrc0F0UmFuZ2UiLCJtYXJrcyIsImRlbGV0ZUF0UmFuZ2UiLCJzbmFwc2hvdFNlbGVjdGlvbiIsImlzU3RhcnRWb2lkIiwiaGFzVm9pZFBhcmVudCIsImlzRW5kVm9pZCIsInN0YXJ0QmxvY2siLCJnZXRDbG9zZXN0QmxvY2siLCJlbmRCbG9jayIsImlzSGFuZ2luZyIsImdldEZpcnN0VGV4dCIsInByZXZUZXh0IiwiZ2V0UHJldmlvdXNUZXh0Iiwic3RhcnRWb2lkIiwiZ2V0Q2xvc2VzdFZvaWQiLCJuZXh0VGV4dCIsImdldE5leHRUZXh0IiwicmVtb3ZlTm9kZUJ5S2V5IiwiZW5kVm9pZCIsInJlbW92ZVRleHRCeUtleSIsInN0YXJ0VGV4dCIsImdldE5vZGUiLCJlbmRUZXh0Iiwic3RhcnRMZW5ndGgiLCJlbmRMZW5ndGgiLCJhbmNlc3RvciIsImdldENvbW1vbkFuY2VzdG9yIiwic3RhcnRDaGlsZCIsImdldEZ1cnRoZXN0QW5jZXN0b3IiLCJlbmRDaGlsZCIsInN0YXJ0UGFyZW50IiwiZ2V0UGFyZW50Iiwic3RhcnRQYXJlbnRJbmRleCIsIm5vZGVzIiwiaW5kZXhPZiIsImVuZFBhcmVudEluZGV4IiwiY2hpbGQiLCJwYXJlbnQiLCJhZnRlcnMiLCJzbGljZSIsInJldmVyc2UiLCJzdGFydENoaWxkSW5kZXgiLCJlbmRDaGlsZEluZGV4IiwibWlkZGxlcyIsImJlZm9yZXMiLCJsb25lbHkiLCJnZXRGdXJ0aGVzdE9ubHlDaGlsZEFuY2VzdG9yIiwibW92ZU5vZGVCeUtleSIsIm1lcmdlTm9kZUJ5S2V5Iiwibm9ybWFsaXplTm9kZUJ5S2V5IiwiZGVsZXRlQ2hhckJhY2t3YXJkQXRSYW5nZSIsIm9mZnNldCIsImdldE9mZnNldCIsIm8iLCJuIiwiZ2V0Q2hhck9mZnNldEJhY2t3YXJkIiwiZGVsZXRlQmFja3dhcmRBdFJhbmdlIiwiZGVsZXRlTGluZUJhY2t3YXJkQXRSYW5nZSIsInN0YXJ0V2l0aFZvaWRJbmxpbmUiLCJzaXplIiwiZ2V0Iiwib2JqZWN0IiwiZGVsZXRlQmFja3dhcmQiLCJkZWxldGVXb3JkQmFja3dhcmRBdFJhbmdlIiwiZ2V0V29yZE9mZnNldEJhY2t3YXJkIiwiZm9jdXNPZmZzZXQiLCJpc0V4cGFuZGVkIiwiYmxvY2siLCJpc1ZvaWQiLCJpc0VtcHR5IiwiaW5saW5lIiwiZ2V0Q2xvc2VzdElubGluZSIsImlzQXRTdGFydE9mIiwiZ2V0RGVzY2VuZGFudCIsInByZXYiLCJwcmV2QmxvY2siLCJwcmV2SW5saW5lIiwibWVyZ2UiLCJhbmNob3JLZXkiLCJhbmNob3JPZmZzZXQiLCJpc0JhY2t3YXJkIiwidHJhdmVyc2VkIiwibmV4dCIsImZvY3VzS2V5IiwiZGVsZXRlQ2hhckZvcndhcmRBdFJhbmdlIiwiZ2V0Q2hhck9mZnNldEZvcndhcmQiLCJkZWxldGVGb3J3YXJkQXRSYW5nZSIsImRlbGV0ZUxpbmVGb3J3YXJkQXRSYW5nZSIsImRlbGV0ZVdvcmRGb3J3YXJkQXRSYW5nZSIsImdldFdvcmRPZmZzZXRGb3J3YXJkIiwibmV4dEJsb2NrIiwiZ2V0TmV4dEJsb2NrIiwibW92ZVRvU3RhcnRPZiIsImlzQXRFbmRPZiIsIm5leHRJbmxpbmUiLCJpbnNlcnRCbG9ja0F0UmFuZ2UiLCJjcmVhdGUiLCJjb2xsYXBzZVRvU3RhcnQiLCJleHRyYSIsImluc2VydE5vZGVCeUtleSIsInNwbGl0RGVzY2VuZGFudHNCeUtleSIsImluc2VydEZyYWdtZW50QXRSYW5nZSIsImZyYWdtZW50IiwibWFwRGVzY2VuZGFudHMiLCJyZWdlbmVyYXRlS2V5IiwiaXNBdFN0YXJ0IiwiYmxvY2tzIiwiZ2V0QmxvY2tzIiwiZmlyc3RCbG9jayIsImZpcnN0IiwibGFzdEJsb2NrIiwibGFzdCIsImxvbmVseVBhcmVudCIsImdldEZ1cnRoZXN0IiwicCIsImxvbmVseUNoaWxkIiwic3RhcnRJbmRleCIsInJlbW92ZURlc2NlbmRhbnQiLCJpIiwibmV3SW5kZXgiLCJuZXh0Q2hpbGQiLCJnZXROZXh0U2libGluZyIsIm5leHROb2RlcyIsInNraXBVbnRpbCIsImxhc3RJbmRleCIsImlubGluZUNoaWxkIiwiaW5saW5lSW5kZXgiLCJpbnNlcnRJbmxpbmVBdFJhbmdlIiwiYXNzZXJ0RGVzY2VuZGFudCIsInNwbGl0Tm9kZUJ5S2V5IiwiaW5zZXJ0VGV4dEF0UmFuZ2UiLCJ1bmRlZmluZWQiLCJpbnNlcnRUZXh0QnlLZXkiLCJyZW1vdmVNYXJrQXRSYW5nZSIsInJlbW92ZU1hcmtCeUtleSIsInNldEJsb2NrQXRSYW5nZSIsInByb3BlcnRpZXMiLCJnZXRCbG9ja3NBdFJhbmdlIiwic2V0Tm9kZUJ5S2V5Iiwic2V0SW5saW5lQXRSYW5nZSIsImlubGluZXMiLCJnZXRJbmxpbmVzQXRSYW5nZSIsInNwbGl0QmxvY2tBdFJhbmdlIiwiaGVpZ2h0IiwiaCIsInNwbGl0SW5saW5lQXRSYW5nZSIsIkluZmluaXR5IiwidG9nZ2xlTWFya0F0UmFuZ2UiLCJnZXRBY3RpdmVNYXJrc0F0UmFuZ2UiLCJleGlzdHMiLCJzb21lIiwibSIsImVxdWFscyIsInVud3JhcEJsb2NrQXRSYW5nZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJ3cmFwcGVycyIsIm1hcCIsImdldENsb3Nlc3QiLCJ0eXBlIiwiZGF0YSIsImlzU3VwZXJzZXQiLCJmaWx0ZXIiLCJ0b09yZGVyZWRTZXQiLCJ0b0xpc3QiLCJjaGlsZHJlbiIsImIiLCJoYXNEZXNjZW5kYW50IiwiZmlyc3RNYXRjaCIsImxhc3RNYXRjaCIsInRha2VVbnRpbCIsInB1c2giLCJmaXJzdFRleHQiLCJub3JtYWxpemVEb2N1bWVudCIsInVud3JhcElubGluZUF0UmFuZ2UiLCJ3cmFwQmxvY2tBdFJhbmdlIiwic2V0IiwiY2xlYXIiLCJmaXJzdGJsb2NrIiwibGFzdGJsb2NrIiwic2libGluZ3MiLCJwMSIsInAyIiwiaW5kZXhlcyIsInJlZHVjZSIsImluZCIsIndyYXBJbmxpbmVBdFJhbmdlIiwiaW5saW5lUGFyZW50Iiwid3JhcElubGluZUJ5S2V5IiwiZW5kSW5kZXgiLCJzdGFydElubmVyIiwic3RhcnRJbm5lckluZGV4IiwiZW5kSW5uZXIiLCJzdGFydElubGluZXMiLCJlbmRJbmxpbmVzIiwic3RhcnROb2RlIiwiZW5kTm9kZSIsIndyYXBUZXh0QXRSYW5nZSIsInByZWZpeCIsInN1ZmZpeCIsInN0YXJ0IiwiZW5kIiwiY29sbGFwc2VUb0VuZCIsIm1vdmUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxVQUFVLEVBQWhCOztBQUVBOzs7Ozs7Ozs7O0FBVUFBLFFBQVFDLGNBQVIsR0FBeUIsVUFBQ0MsTUFBRCxFQUFTQyxLQUFULEVBQWdCQyxJQUFoQixFQUF1QztBQUFBLE1BQWpCQyxPQUFpQix1RUFBUCxFQUFPOztBQUM5RCxNQUFJRixNQUFNRyxXQUFWLEVBQXVCOztBQUV2QixNQUFNQyxZQUFZTCxPQUFPTSxPQUFQLENBQWUsV0FBZixFQUE0QkgsT0FBNUIsQ0FBbEI7QUFIOEQsTUFJdERJLEtBSnNELEdBSTVDUCxNQUo0QyxDQUl0RE8sS0FKc0Q7QUFBQSxNQUt0REMsUUFMc0QsR0FLekNELEtBTHlDLENBS3REQyxRQUxzRDtBQUFBLE1BTXREQyxRQU5zRCxHQU1UUixLQU5TLENBTXREUSxRQU5zRDtBQUFBLE1BTTVDQyxXQU40QyxHQU1UVCxLQU5TLENBTTVDUyxXQU40QztBQUFB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LEtBRnFELENBRTFFUSxRQUYwRTtBQUFBLE1BRWhFRSxNQUZnRSxHQUVyRFYsS0FGcUQsQ0FFaEVVLE1BRmdFOztBQUdsRixNQUFNbU4sUUFBUTdOLE1BQU11SCxlQUFOLEVBQWQ7QUFDQSxNQUFJdUcsTUFBTTlOLE1BQU0rTixhQUFOLEVBQVY7O0FBRUEsTUFBSXZOLFlBQVlFLE1BQWhCLEVBQXdCO0FBQ3RCb04sVUFBTUEsSUFBSUUsSUFBSixDQUFTTCxPQUFPek0sTUFBaEIsQ0FBTjtBQUNEOztBQUVEbkIsU0FBT3lKLGlCQUFQLENBQXlCcUUsS0FBekIsRUFBZ0NGLE1BQWhDLEVBQXdDLEVBQXhDLEVBQTRDLEVBQUV2TixvQkFBRixFQUE1QztBQUNBTCxTQUFPeUosaUJBQVAsQ0FBeUJzRSxHQUF6QixFQUE4QkYsTUFBOUIsRUFBc0MsRUFBdEMsRUFBMEMsRUFBRXhOLG9CQUFGLEVBQTFDO0FBQ0QsQ0FaRDs7QUFjQTs7Ozs7O2tCQU1lUCxPIiwiZmlsZSI6ImF0LXJhbmdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBMaXN0IH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgQmxvY2sgZnJvbSAnLi4vbW9kZWxzL2Jsb2NrJ1xuaW1wb3J0IElubGluZSBmcm9tICcuLi9tb2RlbHMvaW5saW5lJ1xuaW1wb3J0IE1hcmsgZnJvbSAnLi4vbW9kZWxzL21hcmsnXG5pbXBvcnQgTm9kZSBmcm9tICcuLi9tb2RlbHMvbm9kZSdcbmltcG9ydCBTdHJpbmcgZnJvbSAnLi4vdXRpbHMvc3RyaW5nJ1xuXG4vKipcbiAqIENoYW5nZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBDaGFuZ2VzID0ge31cblxuLyoqXG4gKiBBZGQgYSBuZXcgYG1hcmtgIHRvIHRoZSBjaGFyYWN0ZXJzIGF0IGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7TWl4ZWR9IG1hcmtcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5hZGRNYXJrQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBtYXJrLCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKHJhbmdlLmlzQ29sbGFwc2VkKSByZXR1cm5cblxuICBjb25zdCBub3JtYWxpemUgPSBjaGFuZ2UuZ2V0RmxhZygnbm9ybWFsaXplJywgb3B0aW9ucylcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCBlbmRLZXksIGVuZE9mZnNldCB9ID0gcmFuZ2VcbiAgY29uc3QgdGV4dHMgPSBkb2N1bWVudC5nZXRUZXh0c0F0UmFuZ2UocmFuZ2UpXG5cbiAgdGV4dHMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgIGNvbnN0IHsga2V5IH0gPSBub2RlXG4gICAgbGV0IGluZGV4ID0gMFxuICAgIGxldCBsZW5ndGggPSBub2RlLnRleHQubGVuZ3RoXG5cbiAgICBpZiAoa2V5ID09IHN0YXJ0S2V5KSBpbmRleCA9IHN0YXJ0T2Zmc2V0XG4gICAgaWYgKGtleSA9PSBlbmRLZXkpIGxlbmd0aCA9IGVuZE9mZnNldFxuICAgIGlmIChrZXkgPT0gc3RhcnRLZXkgJiYga2V5ID09IGVuZEtleSkgbGVuZ3RoID0gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXRcblxuICAgIGNoYW5nZS5hZGRNYXJrQnlLZXkoa2V5LCBpbmRleCwgbGVuZ3RoLCBtYXJrLCB7IG5vcm1hbGl6ZSB9KVxuICB9KVxufVxuXG4vKipcbiAqIEFkZCBhIGxpc3Qgb2YgYG1hcmtzYCB0byB0aGUgY2hhcmFjdGVycyBhdCBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge0FycmF5PE1peGVkPn0gbWFya1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmFkZE1hcmtzQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBtYXJrcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIG1hcmtzLmZvckVhY2gobWFyayA9PiBjaGFuZ2UuYWRkTWFya0F0UmFuZ2UocmFuZ2UsIG1hcmssIG9wdGlvbnMpKVxufVxuXG4vKipcbiAqIERlbGV0ZSBldmVyeXRoaW5nIGluIGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmRlbGV0ZUF0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmIChyYW5nZS5pc0NvbGxhcHNlZCkgcmV0dXJuXG5cbiAgLy8gU25hcHNob3QgdGhlIHNlbGVjdGlvbiwgd2hpY2ggY3JlYXRlcyBhbiBleHRyYSB1bmRvIHNhdmUgcG9pbnQsIHNvIHRoYXRcbiAgLy8gd2hlbiB5b3UgdW5kbyBhIGRlbGV0ZSwgdGhlIGV4cGFuZGVkIHNlbGVjdGlvbiB3aWxsIGJlIHJldGFpbmVkLlxuICBjaGFuZ2Uuc25hcHNob3RTZWxlY3Rpb24oKVxuXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCBlbmRLZXksIGVuZE9mZnNldCB9ID0gcmFuZ2VcbiAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGxldCBpc1N0YXJ0Vm9pZCA9IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQoc3RhcnRLZXkpXG4gIGxldCBpc0VuZFZvaWQgPSBkb2N1bWVudC5oYXNWb2lkUGFyZW50KGVuZEtleSlcbiAgbGV0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGxldCBlbmRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhlbmRLZXkpXG5cbiAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhIFwiaGFuZ2luZ1wiIHNlbGVjdGlvbiBjYXNlIHdoZXJlIHRoZSBldmVuIHRob3VnaCB0aGVcbiAgLy8gc2VsZWN0aW9uIGV4dGVuZHMgaW50byB0aGUgc3RhcnQgb2YgdGhlIGVuZCBub2RlLCB3ZSBhY3R1YWxseSB3YW50IHRvXG4gIC8vIGlnbm9yZSB0aGF0IGZvciBVWCByZWFzb25zLlxuICBjb25zdCBpc0hhbmdpbmcgPSAoXG4gICAgc3RhcnRPZmZzZXQgPT0gMCAmJlxuICAgIGVuZE9mZnNldCA9PSAwICYmXG4gICAgaXNTdGFydFZvaWQgPT0gZmFsc2UgJiZcbiAgICBzdGFydEtleSA9PSBzdGFydEJsb2NrLmdldEZpcnN0VGV4dCgpLmtleSAmJlxuICAgIGVuZEtleSA9PSBlbmRCbG9jay5nZXRGaXJzdFRleHQoKS5rZXlcbiAgKVxuXG4gIC8vIElmIGl0J3MgYSBoYW5naW5nIHNlbGVjdGlvbiwgbnVkZ2UgaXQgYmFjayB0byBlbmQgaW4gdGhlIHByZXZpb3VzIHRleHQuXG4gIGlmIChpc0hhbmdpbmcgJiYgaXNFbmRWb2lkKSB7XG4gICAgY29uc3QgcHJldlRleHQgPSBkb2N1bWVudC5nZXRQcmV2aW91c1RleHQoZW5kS2V5KVxuICAgIGVuZEtleSA9IHByZXZUZXh0LmtleVxuICAgIGVuZE9mZnNldCA9IHByZXZUZXh0LnRleHQubGVuZ3RoXG4gICAgaXNFbmRWb2lkID0gZG9jdW1lbnQuaGFzVm9pZFBhcmVudChlbmRLZXkpXG4gIH1cblxuICAvLyBJZiB0aGUgc3RhcnQgbm9kZSBpcyBpbnNpZGUgYSB2b2lkIG5vZGUsIHJlbW92ZSB0aGUgdm9pZCBub2RlIGFuZCB1cGRhdGVcbiAgLy8gdGhlIHN0YXJ0aW5nIHBvaW50IHRvIGJlIHJpZ2h0IGFmdGVyIGl0LCBjb250aW51b3VzbHkgdW50aWwgdGhlIHN0YXJ0IHBvaW50XG4gIC8vIGlzIG5vdCBhIHZvaWQsIG9yIHVudGlsIHRoZSBlbnRpcmUgcmFuZ2UgaXMgaGFuZGxlZC5cbiAgd2hpbGUgKGlzU3RhcnRWb2lkKSB7XG4gICAgY29uc3Qgc3RhcnRWb2lkID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdFZvaWQoc3RhcnRLZXkpXG4gICAgY29uc3QgbmV4dFRleHQgPSBkb2N1bWVudC5nZXROZXh0VGV4dChzdGFydEtleSlcbiAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KHN0YXJ0Vm9pZC5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuXG4gICAgLy8gSWYgdGhlIHN0YXJ0IGFuZCBlbmQga2V5cyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUuXG4gICAgaWYgKHN0YXJ0S2V5ID09IGVuZEtleSkgcmV0dXJuXG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyBuZXh0IHRleHQgbm9kZSwgd2UncmUgZG9uZS5cbiAgICBpZiAoIW5leHRUZXh0KSByZXR1cm5cblxuICAgIC8vIENvbnRpbnVlLi4uXG4gICAgZG9jdW1lbnQgPSBjaGFuZ2UudmFsdWUuZG9jdW1lbnRcbiAgICBzdGFydEtleSA9IG5leHRUZXh0LmtleVxuICAgIHN0YXJ0T2Zmc2V0ID0gMFxuICAgIGlzU3RhcnRWb2lkID0gZG9jdW1lbnQuaGFzVm9pZFBhcmVudChzdGFydEtleSlcbiAgfVxuXG4gIC8vIElmIHRoZSBlbmQgbm9kZSBpcyBpbnNpZGUgYSB2b2lkIG5vZGUsIGRvIHRoZSBzYW1lIHRoaW5nIGJ1dCBiYWNrd2FyZHMuIEJ1dFxuICAvLyB3ZSBkb24ndCBuZWVkIGFueSBhYm9ydGluZyBjaGVja3MgYmVjYXVzZSBpZiB3ZSd2ZSBnb3R0ZW4gdGhpcyBmYXIgdGhlcmVcbiAgLy8gbXVzdCBiZSBhIG5vbi12b2lkIG5vZGUgdGhhdCB3aWxsIGV4aXQgdGhlIGxvb3AuXG4gIHdoaWxlIChpc0VuZFZvaWQpIHtcbiAgICBjb25zdCBlbmRWb2lkID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdFZvaWQoZW5kS2V5KVxuICAgIGNvbnN0IHByZXZUZXh0ID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNUZXh0KGVuZEtleSlcbiAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KGVuZFZvaWQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcblxuICAgIC8vIENvbnRpbnVlLi4uXG4gICAgZG9jdW1lbnQgPSBjaGFuZ2UudmFsdWUuZG9jdW1lbnRcbiAgICBlbmRLZXkgPSBwcmV2VGV4dC5rZXlcbiAgICBlbmRPZmZzZXQgPSBwcmV2VGV4dC50ZXh0Lmxlbmd0aFxuICAgIGlzRW5kVm9pZCA9IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQoZW5kS2V5KVxuICB9XG5cbiAgLy8gSWYgdGhlIHN0YXJ0IGFuZCBlbmQga2V5IGFyZSB0aGUgc2FtZSwgYW5kIGl0IHdhcyBhIGhhbmdpbmcgc2VsZWN0aW9uLCB3ZVxuICAvLyBjYW4ganVzdCByZW1vdmUgdGhlIGVudGlyZSBibG9jay5cbiAgaWYgKHN0YXJ0S2V5ID09IGVuZEtleSAmJiBpc0hhbmdpbmcpIHtcbiAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KHN0YXJ0QmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCBpZiBpdCB3YXNuJ3QgaGFuZ2luZywgd2UncmUgaW5zaWRlIGEgc2luZ2xlIHRleHQgbm9kZSwgc28gd2UgY2FuXG4gIC8vIHNpbXBseSByZW1vdmUgdGhlIHRleHQgaW4gdGhlIHJhbmdlLlxuICBlbHNlIGlmIChzdGFydEtleSA9PSBlbmRLZXkpIHtcbiAgICBjb25zdCBpbmRleCA9IHN0YXJ0T2Zmc2V0XG4gICAgY29uc3QgbGVuZ3RoID0gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXRcbiAgICBjaGFuZ2UucmVtb3ZlVGV4dEJ5S2V5KHN0YXJ0S2V5LCBpbmRleCwgbGVuZ3RoLCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCB3ZSBuZWVkIHRvIHJlY3Vyc2l2ZWx5IHJlbW92ZSB0ZXh0IGFuZCBub2RlcyBpbnNpZGUgdGhlIHN0YXJ0XG4gIC8vIGJsb2NrIGFmdGVyIHRoZSBzdGFydCBvZmZzZXQgYW5kIGluc2lkZSB0aGUgZW5kIGJsb2NrIGJlZm9yZSB0aGUgZW5kXG4gIC8vIG9mZnNldC4gVGhlbiByZW1vdmUgYW55IGJsb2NrcyB0aGF0IGFyZSBpbiBiZXR3ZWVuIHRoZSBzdGFydCBhbmQgZW5kXG4gIC8vIGJsb2Nrcy4gVGhlbiBmaW5hbGx5IG1lcmdlIHRoZSBzdGFydCBhbmQgZW5kIG5vZGVzLlxuICBlbHNlIHtcbiAgICBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICAgIGVuZEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKGVuZEtleSlcbiAgICBjb25zdCBzdGFydFRleHQgPSBkb2N1bWVudC5nZXROb2RlKHN0YXJ0S2V5KVxuICAgIGNvbnN0IGVuZFRleHQgPSBkb2N1bWVudC5nZXROb2RlKGVuZEtleSlcbiAgICBjb25zdCBzdGFydExlbmd0aCA9IHN0YXJ0VGV4dC50ZXh0Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0XG4gICAgY29uc3QgZW5kTGVuZ3RoID0gZW5kT2Zmc2V0XG5cbiAgICBjb25zdCBhbmNlc3RvciA9IGRvY3VtZW50LmdldENvbW1vbkFuY2VzdG9yKHN0YXJ0S2V5LCBlbmRLZXkpXG4gICAgY29uc3Qgc3RhcnRDaGlsZCA9IGFuY2VzdG9yLmdldEZ1cnRoZXN0QW5jZXN0b3Ioc3RhcnRLZXkpXG4gICAgY29uc3QgZW5kQ2hpbGQgPSBhbmNlc3Rvci5nZXRGdXJ0aGVzdEFuY2VzdG9yKGVuZEtleSlcblxuICAgIGNvbnN0IHN0YXJ0UGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KHN0YXJ0QmxvY2sua2V5KVxuICAgIGNvbnN0IHN0YXJ0UGFyZW50SW5kZXggPSBzdGFydFBhcmVudC5ub2Rlcy5pbmRleE9mKHN0YXJ0QmxvY2spXG4gICAgY29uc3QgZW5kUGFyZW50SW5kZXggPSBzdGFydFBhcmVudC5ub2Rlcy5pbmRleE9mKGVuZEJsb2NrKVxuXG4gICAgbGV0IGNoaWxkXG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIG9mIHRoZSBub2RlcyBpbiB0aGUgdHJlZSBhZnRlciB0aGUgc3RhcnQgdGV4dCBub2RlXG4gICAgLy8gYnV0IGluc2lkZSB0aGUgZW5kIGNoaWxkLCBhbmQgcmVtb3ZlIHRoZW0uXG4gICAgY2hpbGQgPSBzdGFydFRleHRcblxuICAgIHdoaWxlIChjaGlsZC5rZXkgIT0gc3RhcnRDaGlsZC5rZXkpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChjaGlsZC5rZXkpXG4gICAgICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKGNoaWxkKVxuICAgICAgY29uc3QgYWZ0ZXJzID0gcGFyZW50Lm5vZGVzLnNsaWNlKGluZGV4ICsgMSlcblxuICAgICAgYWZ0ZXJzLnJldmVyc2UoKS5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkobm9kZS5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgfSlcblxuICAgICAgY2hpbGQgPSBwYXJlbnRcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgYWxsIG9mIHRoZSBtaWRkbGUgY2hpbGRyZW4uXG4gICAgY29uc3Qgc3RhcnRDaGlsZEluZGV4ID0gYW5jZXN0b3Iubm9kZXMuaW5kZXhPZihzdGFydENoaWxkKVxuICAgIGNvbnN0IGVuZENoaWxkSW5kZXggPSBhbmNlc3Rvci5ub2Rlcy5pbmRleE9mKGVuZENoaWxkKVxuICAgIGNvbnN0IG1pZGRsZXMgPSBhbmNlc3Rvci5ub2Rlcy5zbGljZShzdGFydENoaWxkSW5kZXggKyAxLCBlbmRDaGlsZEluZGV4KVxuXG4gICAgbWlkZGxlcy5yZXZlcnNlKCkuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShub2RlLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcblxuICAgIC8vIFJlbW92ZSB0aGUgbm9kZXMgYmVmb3JlIHRoZSBlbmQgdGV4dCBub2RlIGluIHRoZSB0cmVlLlxuICAgIGNoaWxkID0gZW5kVGV4dFxuXG4gICAgd2hpbGUgKGNoaWxkLmtleSAhPSBlbmRDaGlsZC5rZXkpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChjaGlsZC5rZXkpXG4gICAgICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKGNoaWxkKVxuICAgICAgY29uc3QgYmVmb3JlcyA9IHBhcmVudC5ub2Rlcy5zbGljZSgwLCBpbmRleClcblxuICAgICAgYmVmb3Jlcy5yZXZlcnNlKCkuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KG5vZGUua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgIH0pXG5cbiAgICAgIGNoaWxkID0gcGFyZW50XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGFueSBvdmVybGFwcGluZyB0ZXh0IGNvbnRlbnQgZnJvbSB0aGUgbGVhZiB0ZXh0IG5vZGVzLlxuICAgIGlmIChzdGFydExlbmd0aCAhPSAwKSB7XG4gICAgICBjaGFuZ2UucmVtb3ZlVGV4dEJ5S2V5KHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgc3RhcnRMZW5ndGgsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIH1cblxuICAgIGlmIChlbmRMZW5ndGggIT0gMCkge1xuICAgICAgY2hhbmdlLnJlbW92ZVRleHRCeUtleShlbmRLZXksIDAsIGVuZE9mZnNldCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHN0YXJ0IGFuZCBlbmQgYmxvY2tzIGFyZW4ndCB0aGUgc2FtZSwgbW92ZSBhbmQgbWVyZ2UgdGhlIGVuZCBibG9ja1xuICAgIC8vIGludG8gdGhlIHN0YXJ0IGJsb2NrLlxuICAgIGlmIChzdGFydEJsb2NrLmtleSAhPSBlbmRCbG9jay5rZXkpIHtcbiAgICAgIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG4gICAgICBjb25zdCBsb25lbHkgPSBkb2N1bWVudC5nZXRGdXJ0aGVzdE9ubHlDaGlsZEFuY2VzdG9yKGVuZEJsb2NrLmtleSlcblxuICAgICAgLy8gTW92ZSB0aGUgZW5kIGJsb2NrIHRvIGJlIHJpZ2h0IGFmdGVyIHRoZSBzdGFydCBibG9jay5cbiAgICAgIGlmIChlbmRQYXJlbnRJbmRleCAhPSBzdGFydFBhcmVudEluZGV4ICsgMSkge1xuICAgICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShlbmRCbG9jay5rZXksIHN0YXJ0UGFyZW50LmtleSwgc3RhcnRQYXJlbnRJbmRleCArIDEsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgc2VsZWN0aW9uIGlzIGhhbmdpbmcsIGp1c3QgcmVtb3ZlIHRoZSBzdGFydCBibG9jaywgb3RoZXJ3aXNlXG4gICAgICAvLyBtZXJnZSB0aGUgZW5kIGJsb2NrIGludG8gaXQuXG4gICAgICBpZiAoaXNIYW5naW5nKSB7XG4gICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoc3RhcnRCbG9jay5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhbmdlLm1lcmdlTm9kZUJ5S2V5KGVuZEJsb2NrLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5lc3RlZCBlbXB0eSBibG9ja3MgYXJlIGxlZnQgb3ZlciBhYm92ZSB0aGUgZW5kIGJsb2NrLCByZW1vdmUgdGhlbS5cbiAgICAgIGlmIChsb25lbHkpIHtcbiAgICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShsb25lbHkua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBzaG91bGQgbm9ybWFsaXplLCBkbyBpdCBub3cgYWZ0ZXIgZXZlcnl0aGluZy5cbiAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KGFuY2VzdG9yLmtleSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEZWxldGUgYmFja3dhcmQgdW50aWwgdGhlIGNoYXJhY3RlciBib3VuZGFyeSBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVDaGFyQmFja3dhcmRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBjb25zdCBvZmZzZXQgPSBzdGFydEJsb2NrLmdldE9mZnNldChzdGFydEtleSlcbiAgY29uc3QgbyA9IG9mZnNldCArIHN0YXJ0T2Zmc2V0XG4gIGNvbnN0IHsgdGV4dCB9ID0gc3RhcnRCbG9ja1xuICBjb25zdCBuID0gU3RyaW5nLmdldENoYXJPZmZzZXRCYWNrd2FyZCh0ZXh0LCBvKVxuICBjaGFuZ2UuZGVsZXRlQmFja3dhcmRBdFJhbmdlKHJhbmdlLCBuLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIERlbGV0ZSBiYWNrd2FyZCB1bnRpbCB0aGUgbGluZSBib3VuZGFyeSBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVMaW5lQmFja3dhcmRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBjb25zdCBvZmZzZXQgPSBzdGFydEJsb2NrLmdldE9mZnNldChzdGFydEtleSlcbiAgY29uc3Qgc3RhcnRXaXRoVm9pZElubGluZSA9IChcbiAgICBzdGFydEJsb2NrLm5vZGVzLnNpemUgPiAxICYmXG4gICAgc3RhcnRCbG9jay5ub2Rlcy5nZXQoMCkudGV4dCA9PSAnJyAmJlxuICAgIHN0YXJ0QmxvY2subm9kZXMuZ2V0KDEpLm9iamVjdCA9PSAnaW5saW5lJ1xuICApXG5cbiAgbGV0IG8gPSBvZmZzZXQgKyBzdGFydE9mZnNldFxuXG4gIC8vIElmIGxpbmUgc3RhcnRzIHdpdGggYW4gdm9pZCBpbmxpbmUgbm9kZSwgdGhlIHRleHQgbm9kZSBpbnNpZGUgdGhpcyBpbmxpbmVcbiAgLy8gbm9kZSBkaXN0dXJicyB0aGUgb2Zmc2V0LiBJZ25vcmUgdGhpcyBpbmxpbmUgbm9kZSBhbmQgZGVsZXRlIGl0IGFmdGVyd2FyZHMuXG4gIGlmIChzdGFydFdpdGhWb2lkSW5saW5lKSB7XG4gICAgbyAtPSAxXG4gIH1cblxuICBjaGFuZ2UuZGVsZXRlQmFja3dhcmRBdFJhbmdlKHJhbmdlLCBvLCBvcHRpb25zKVxuXG4gIC8vIERlbGV0ZSB0aGUgcmVtYWluaW5nIGZpcnN0IGlubGluZSBub2RlIGlmIG5lZWRlZC5cbiAgaWYgKHN0YXJ0V2l0aFZvaWRJbmxpbmUpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQmFja3dhcmQoKVxuICB9XG59XG5cbi8qKlxuICogRGVsZXRlIGJhY2t3YXJkIHVudGlsIHRoZSB3b3JkIGJvdW5kYXJ5IGF0IGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmRlbGV0ZVdvcmRCYWNrd2FyZEF0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGNvbnN0IG9mZnNldCA9IHN0YXJ0QmxvY2suZ2V0T2Zmc2V0KHN0YXJ0S2V5KVxuICBjb25zdCBvID0gb2Zmc2V0ICsgc3RhcnRPZmZzZXRcbiAgY29uc3QgeyB0ZXh0IH0gPSBzdGFydEJsb2NrXG4gIGNvbnN0IG4gPSBTdHJpbmcuZ2V0V29yZE9mZnNldEJhY2t3YXJkKHRleHQsIG8pXG4gIGNoYW5nZS5kZWxldGVCYWNrd2FyZEF0UmFuZ2UocmFuZ2UsIG4sIG9wdGlvbnMpXG59XG5cbi8qKlxuICogRGVsZXRlIGJhY2t3YXJkIGBuYCBjaGFyYWN0ZXJzIGF0IGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtOdW1iZXJ9IG4gKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmRlbGV0ZUJhY2t3YXJkQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBuID0gMSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgZm9jdXNPZmZzZXQgfSA9IHJhbmdlXG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGV4cGFuZGVkLCBwZXJmb3JtIGEgcmVndWxhciBkZWxldGUgaW5zdGVhZC5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemUgfSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuXG4gIC8vIElmIHRoZSBjbG9zZXN0IGJsb2NrIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgaWYgKGJsb2NrICYmIGJsb2NrLmlzVm9pZCkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoYmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaXMgbm90IHZvaWQsIGJ1dCBlbXB0eSwgcmVtb3ZlIGl0XG4gIGlmIChibG9jayAmJiAhYmxvY2suaXNWb2lkICYmIGJsb2NrLmlzRW1wdHkgJiYgZG9jdW1lbnQubm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoYmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaW5saW5lIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgY29uc3QgaW5saW5lID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShzdGFydEtleSlcbiAgaWYgKGlubGluZSAmJiBpbmxpbmUuaXNWb2lkKSB7XG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShpbmxpbmUua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgZG9jdW1lbnQsIGFib3J0LlxuICBpZiAocmFuZ2UuaXNBdFN0YXJ0T2YoZG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBJZiB0aGUgcmFuZ2UgaXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSB0ZXh0IG5vZGUsIHdlIG5lZWQgdG8gZmlndXJlIG91dCB3aGF0XG4gIC8vIGlzIGJlaGluZCBpdCB0byBrbm93IGhvdyB0byBkZWxldGUuLi5cbiAgY29uc3QgdGV4dCA9IGRvY3VtZW50LmdldERlc2NlbmRhbnQoc3RhcnRLZXkpXG4gIGlmIChyYW5nZS5pc0F0U3RhcnRPZih0ZXh0KSkge1xuICAgIGNvbnN0IHByZXYgPSBkb2N1bWVudC5nZXRQcmV2aW91c1RleHQodGV4dC5rZXkpXG4gICAgY29uc3QgcHJldkJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHByZXYua2V5KVxuICAgIGNvbnN0IHByZXZJbmxpbmUgPSBkb2N1bWVudC5nZXRDbG9zZXN0SW5saW5lKHByZXYua2V5KVxuXG4gICAgLy8gSWYgdGhlIHByZXZpb3VzIGJsb2NrIGlzIHZvaWQsIHJlbW92ZSBpdC5cbiAgICBpZiAocHJldkJsb2NrICYmIHByZXZCbG9jay5pc1ZvaWQpIHtcbiAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkocHJldkJsb2NrLmtleSwgeyBub3JtYWxpemUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIHRoZSBwcmV2aW91cyBpbmxpbmUgaXMgdm9pZCwgcmVtb3ZlIGl0LlxuICAgIGlmIChwcmV2SW5saW5lICYmIHByZXZJbmxpbmUuaXNWb2lkKSB7XG4gICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KHByZXZJbmxpbmUua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gSWYgd2UncmUgZGVsZXRpbmcgYnkgb25lIGNoYXJhY3RlciBhbmQgdGhlIHByZXZpb3VzIHRleHQgbm9kZSBpcyBub3RcbiAgICAvLyBpbnNpZGUgdGhlIGN1cnJlbnQgYmxvY2ssIHdlIG5lZWQgdG8gbWVyZ2UgdGhlIHR3byBibG9ja3MgdG9nZXRoZXIuXG4gICAgaWYgKG4gPT0gMSAmJiBwcmV2QmxvY2sgIT0gYmxvY2spIHtcbiAgICAgIHJhbmdlID0gcmFuZ2UubWVyZ2Uoe1xuICAgICAgICBhbmNob3JLZXk6IHByZXYua2V5LFxuICAgICAgICBhbmNob3JPZmZzZXQ6IHByZXYudGV4dC5sZW5ndGgsXG4gICAgICB9KVxuXG4gICAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBmb2N1cyBvZmZzZXQgaXMgZmFydGhlciB0aGFuIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0byBkZWxldGUsXG4gIC8vIGp1c3QgcmVtb3ZlIHRoZSBjaGFyYWN0ZXJzIGJhY2t3YXJkcyBpbnNpZGUgdGhlIGN1cnJlbnQgbm9kZS5cbiAgaWYgKG4gPCBmb2N1c09mZnNldCkge1xuICAgIHJhbmdlID0gcmFuZ2UubWVyZ2Uoe1xuICAgICAgZm9jdXNPZmZzZXQ6IGZvY3VzT2Zmc2V0IC0gbixcbiAgICAgIGlzQmFja3dhcmQ6IHRydWUsXG4gICAgfSlcblxuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCB3ZSBuZWVkIHRvIHNlZSBob3cgbWFueSBub2RlcyBiYWNrd2FyZHMgdG8gZ28uXG4gIGxldCBub2RlID0gdGV4dFxuICBsZXQgb2Zmc2V0ID0gMFxuICBsZXQgdHJhdmVyc2VkID0gZm9jdXNPZmZzZXRcblxuICB3aGlsZSAobiA+IHRyYXZlcnNlZCkge1xuICAgIG5vZGUgPSBkb2N1bWVudC5nZXRQcmV2aW91c1RleHQobm9kZS5rZXkpXG4gICAgY29uc3QgbmV4dCA9IHRyYXZlcnNlZCArIG5vZGUudGV4dC5sZW5ndGhcbiAgICBpZiAobiA8PSBuZXh0KSB7XG4gICAgICBvZmZzZXQgPSBuZXh0IC0gblxuICAgICAgYnJlYWtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhdmVyc2VkID0gbmV4dFxuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBmb2N1cyBub2RlIGlzIGluc2lkZSBhIHZvaWQsIGdvIHVwIHVudGlsIHJpZ2h0IGFmdGVyIGl0LlxuICBpZiAoZG9jdW1lbnQuaGFzVm9pZFBhcmVudChub2RlLmtleSkpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRDbG9zZXN0Vm9pZChub2RlLmtleSlcbiAgICBub2RlID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQocGFyZW50LmtleSlcbiAgICBvZmZzZXQgPSAwXG4gIH1cblxuICByYW5nZSA9IHJhbmdlLm1lcmdlKHtcbiAgICBmb2N1c0tleTogbm9kZS5rZXksXG4gICAgZm9jdXNPZmZzZXQ6IG9mZnNldCxcbiAgICBpc0JhY2t3YXJkOiB0cnVlXG4gIH0pXG5cbiAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplIH0pXG59XG5cbi8qKlxuICogRGVsZXRlIGZvcndhcmQgdW50aWwgdGhlIGNoYXJhY3RlciBib3VuZGFyeSBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVDaGFyRm9yd2FyZEF0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGNvbnN0IG9mZnNldCA9IHN0YXJ0QmxvY2suZ2V0T2Zmc2V0KHN0YXJ0S2V5KVxuICBjb25zdCBvID0gb2Zmc2V0ICsgc3RhcnRPZmZzZXRcbiAgY29uc3QgeyB0ZXh0IH0gPSBzdGFydEJsb2NrXG4gIGNvbnN0IG4gPSBTdHJpbmcuZ2V0Q2hhck9mZnNldEZvcndhcmQodGV4dCwgbylcbiAgY2hhbmdlLmRlbGV0ZUZvcndhcmRBdFJhbmdlKHJhbmdlLCBuLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIERlbGV0ZSBmb3J3YXJkIHVudGlsIHRoZSBsaW5lIGJvdW5kYXJ5IGF0IGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmRlbGV0ZUxpbmVGb3J3YXJkQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCB9ID0gcmFuZ2VcbiAgY29uc3Qgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydEtleSlcbiAgY29uc3Qgb2Zmc2V0ID0gc3RhcnRCbG9jay5nZXRPZmZzZXQoc3RhcnRLZXkpXG4gIGNvbnN0IG8gPSBvZmZzZXQgKyBzdGFydE9mZnNldFxuICBjaGFuZ2UuZGVsZXRlRm9yd2FyZEF0UmFuZ2UocmFuZ2UsIG8sIG9wdGlvbnMpXG59XG5cbi8qKlxuICogRGVsZXRlIGZvcndhcmQgdW50aWwgdGhlIHdvcmQgYm91bmRhcnkgYXQgYSBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuZGVsZXRlV29yZEZvcndhcmRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBjb25zdCBvZmZzZXQgPSBzdGFydEJsb2NrLmdldE9mZnNldChzdGFydEtleSlcbiAgY29uc3QgbyA9IG9mZnNldCArIHN0YXJ0T2Zmc2V0XG4gIGNvbnN0IHsgdGV4dCB9ID0gc3RhcnRCbG9ja1xuICBjb25zdCBuID0gU3RyaW5nLmdldFdvcmRPZmZzZXRGb3J3YXJkKHRleHQsIG8pXG4gIGNoYW5nZS5kZWxldGVGb3J3YXJkQXRSYW5nZShyYW5nZSwgbiwgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBEZWxldGUgZm9yd2FyZCBgbmAgY2hhcmFjdGVycyBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBuIChvcHRpb25hbClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVGb3J3YXJkQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBuID0gMSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgZm9jdXNPZmZzZXQgfSA9IHJhbmdlXG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGV4cGFuZGVkLCBwZXJmb3JtIGEgcmVndWxhciBkZWxldGUgaW5zdGVhZC5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemUgfSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuXG4gIC8vIElmIHRoZSBjbG9zZXN0IGJsb2NrIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgaWYgKGJsb2NrICYmIGJsb2NrLmlzVm9pZCkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoYmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaXMgbm90IHZvaWQsIGJ1dCBlbXB0eSwgcmVtb3ZlIGl0XG4gIGlmIChibG9jayAmJiAhYmxvY2suaXNWb2lkICYmIGJsb2NrLmlzRW1wdHkgJiYgZG9jdW1lbnQubm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgIGNvbnN0IG5leHRCbG9jayA9IGRvY3VtZW50LmdldE5leHRCbG9jayhibG9jay5rZXkpXG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShibG9jay5rZXksIHsgbm9ybWFsaXplIH0pXG4gICAgaWYgKG5leHRCbG9jayAmJiBuZXh0QmxvY2sua2V5KSB7XG4gICAgICBjaGFuZ2UubW92ZVRvU3RhcnRPZihuZXh0QmxvY2spXG4gICAgfVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaW5saW5lIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgY29uc3QgaW5saW5lID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShzdGFydEtleSlcbiAgaWYgKGlubGluZSAmJiBpbmxpbmUuaXNWb2lkKSB7XG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShpbmxpbmUua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgZG9jdW1lbnQsIGFib3J0LlxuICBpZiAocmFuZ2UuaXNBdEVuZE9mKGRvY3VtZW50KSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgdGV4dCBub2RlLCB3ZSBuZWVkIHRvIGZpZ3VyZSBvdXQgd2hhdFxuICAvLyBpcyBiZWhpbmQgaXQgdG8ga25vdyBob3cgdG8gZGVsZXRlLi4uXG4gIGNvbnN0IHRleHQgPSBkb2N1bWVudC5nZXREZXNjZW5kYW50KHN0YXJ0S2V5KVxuICBpZiAocmFuZ2UuaXNBdEVuZE9mKHRleHQpKSB7XG4gICAgY29uc3QgbmV4dCA9IGRvY3VtZW50LmdldE5leHRUZXh0KHRleHQua2V5KVxuICAgIGNvbnN0IG5leHRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhuZXh0LmtleSlcbiAgICBjb25zdCBuZXh0SW5saW5lID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShuZXh0LmtleSlcblxuICAgIC8vIElmIHRoZSBwcmV2aW91cyBibG9jayBpcyB2b2lkLCByZW1vdmUgaXQuXG4gICAgaWYgKG5leHRCbG9jayAmJiBuZXh0QmxvY2suaXNWb2lkKSB7XG4gICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KG5leHRCbG9jay5rZXksIHsgbm9ybWFsaXplIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcHJldmlvdXMgaW5saW5lIGlzIHZvaWQsIHJlbW92ZSBpdC5cbiAgICBpZiAobmV4dElubGluZSAmJiBuZXh0SW5saW5lLmlzVm9pZCkge1xuICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShuZXh0SW5saW5lLmtleSwgeyBub3JtYWxpemUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIHdlJ3JlIGRlbGV0aW5nIGJ5IG9uZSBjaGFyYWN0ZXIgYW5kIHRoZSBwcmV2aW91cyB0ZXh0IG5vZGUgaXMgbm90XG4gICAgLy8gaW5zaWRlIHRoZSBjdXJyZW50IGJsb2NrLCB3ZSBuZWVkIHRvIG1lcmdlIHRoZSB0d28gYmxvY2tzIHRvZ2V0aGVyLlxuICAgIGlmIChuID09IDEgJiYgbmV4dEJsb2NrICE9IGJsb2NrKSB7XG4gICAgICByYW5nZSA9IHJhbmdlLm1lcmdlKHtcbiAgICAgICAgZm9jdXNLZXk6IG5leHQua2V5LFxuICAgICAgICBmb2N1c09mZnNldDogMFxuICAgICAgfSlcblxuICAgICAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgcmVtYWluaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGVuZCBvZiB0aGUgbm9kZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWxcbiAgLy8gdG8gdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRvIGRlbGV0ZSwganVzdCByZW1vdmUgdGhlIGNoYXJhY3RlcnMgZm9yd2FyZHNcbiAgLy8gaW5zaWRlIHRoZSBjdXJyZW50IG5vZGUuXG4gIGlmIChuIDw9ICh0ZXh0LnRleHQubGVuZ3RoIC0gZm9jdXNPZmZzZXQpKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5tZXJnZSh7XG4gICAgICBmb2N1c09mZnNldDogZm9jdXNPZmZzZXQgKyBuXG4gICAgfSlcblxuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCB3ZSBuZWVkIHRvIHNlZSBob3cgbWFueSBub2RlcyBmb3J3YXJkcyB0byBnby5cbiAgbGV0IG5vZGUgPSB0ZXh0XG4gIGxldCBvZmZzZXQgPSBmb2N1c09mZnNldFxuICBsZXQgdHJhdmVyc2VkID0gdGV4dC50ZXh0Lmxlbmd0aCAtIGZvY3VzT2Zmc2V0XG5cbiAgd2hpbGUgKG4gPiB0cmF2ZXJzZWQpIHtcbiAgICBub2RlID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQobm9kZS5rZXkpXG4gICAgY29uc3QgbmV4dCA9IHRyYXZlcnNlZCArIG5vZGUudGV4dC5sZW5ndGhcbiAgICBpZiAobiA8PSBuZXh0KSB7XG4gICAgICBvZmZzZXQgPSBuIC0gdHJhdmVyc2VkXG4gICAgICBicmVha1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmF2ZXJzZWQgPSBuZXh0XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIGZvY3VzIG5vZGUgaXMgaW5zaWRlIGEgdm9pZCwgZ28gdXAgdW50aWwgcmlnaHQgYmVmb3JlIGl0LlxuICBpZiAoZG9jdW1lbnQuaGFzVm9pZFBhcmVudChub2RlLmtleSkpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRDbG9zZXN0Vm9pZChub2RlLmtleSlcbiAgICBub2RlID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNUZXh0KHBhcmVudC5rZXkpXG4gICAgb2Zmc2V0ID0gbm9kZS50ZXh0Lmxlbmd0aFxuICB9XG5cbiAgcmFuZ2UgPSByYW5nZS5tZXJnZSh7XG4gICAgZm9jdXNLZXk6IG5vZGUua2V5LFxuICAgIGZvY3VzT2Zmc2V0OiBvZmZzZXQsXG4gIH0pXG5cbiAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplIH0pXG59XG5cbi8qKlxuICogSW5zZXJ0IGEgYGJsb2NrYCBub2RlIGF0IGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7QmxvY2t8U3RyaW5nfE9iamVjdH0gYmxvY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5pbnNlcnRCbG9ja0F0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgYmxvY2ssIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBibG9jayA9IEJsb2NrLmNyZWF0ZShibG9jaylcbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSlcbiAgICByYW5nZSA9IHJhbmdlLmNvbGxhcHNlVG9TdGFydCgpXG4gIH1cblxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChzdGFydEJsb2NrLmtleSlcbiAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihzdGFydEJsb2NrKVxuXG4gIGlmIChzdGFydEJsb2NrLmlzVm9pZCkge1xuICAgIGNvbnN0IGV4dHJhID0gcmFuZ2UuaXNBdEVuZE9mKHN0YXJ0QmxvY2spID8gMSA6IDBcbiAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHBhcmVudC5rZXksIGluZGV4ICsgZXh0cmEsIGJsb2NrLCB7IG5vcm1hbGl6ZSB9KVxuICB9XG5cbiAgZWxzZSBpZiAoc3RhcnRCbG9jay5pc0VtcHR5KSB7XG4gICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCArIDEsIGJsb2NrLCB7IG5vcm1hbGl6ZSB9KVxuICB9XG5cbiAgZWxzZSBpZiAocmFuZ2UuaXNBdFN0YXJ0T2Yoc3RhcnRCbG9jaykpIHtcbiAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHBhcmVudC5rZXksIGluZGV4LCBibG9jaywgeyBub3JtYWxpemUgfSlcbiAgfVxuXG4gIGVsc2UgaWYgKHJhbmdlLmlzQXRFbmRPZihzdGFydEJsb2NrKSkge1xuICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkocGFyZW50LmtleSwgaW5kZXggKyAxLCBibG9jaywgeyBub3JtYWxpemUgfSlcbiAgfVxuXG4gIGVsc2Uge1xuICAgIGNoYW5nZS5zcGxpdERlc2NlbmRhbnRzQnlLZXkoc3RhcnRCbG9jay5rZXksIHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCArIDEsIGJsb2NrLCB7IG5vcm1hbGl6ZSB9KVxuICB9XG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIEluc2VydCBhIGBmcmFnbWVudGAgYXQgYSBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBmcmFnbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmluc2VydEZyYWdtZW50QXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBmcmFnbWVudCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuXG4gIC8vIElmIHRoZSByYW5nZSBpcyBleHBhbmRlZCwgZGVsZXRlIGl0IGZpcnN0LlxuICBpZiAocmFuZ2UuaXNFeHBhbmRlZCkge1xuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICByYW5nZSA9IHJhbmdlLmNvbGxhcHNlVG9TdGFydCgpXG4gIH1cblxuICAvLyBJZiB0aGUgZnJhZ21lbnQgaXMgZW1wdHksIHRoZXJlJ3Mgbm90aGluZyB0byBkbyBhZnRlciBkZWxldGluZy5cbiAgaWYgKCFmcmFnbWVudC5ub2Rlcy5zaXplKSByZXR1cm5cblxuICAvLyBSZWdlbmVyYXRlIHRoZSBrZXlzIGZvciBhbGwgb2YgdGhlIGZyYWdtZW50cyBub2Rlcywgc28gdGhhdCB0aGV5J3JlXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIGNvbGxpZGUgd2l0aCB0aGUgZXhpc3Rpbmcga2V5cyBpbiB0aGUgZG9jdW1lbnQuIE90aGVyd2lzZVxuICAvLyB0aGV5IHdpbGwgYmUgcmVuZ2VyYXRlZCBhdXRvbWF0aWNhbGx5IGFuZCB3ZSB3b24ndCBoYXZlIGFuIGVhc3kgd2F5IHRvXG4gIC8vIHJlZmVyZW5jZSB0aGVtLlxuICBmcmFnbWVudCA9IGZyYWdtZW50Lm1hcERlc2NlbmRhbnRzKGNoaWxkID0+IGNoaWxkLnJlZ2VuZXJhdGVLZXkoKSlcblxuICAvLyBDYWxjdWxhdGUgYSBmZXcgdGhpbmdzLi4uXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGxldCBzdGFydFRleHQgPSBkb2N1bWVudC5nZXREZXNjZW5kYW50KHN0YXJ0S2V5KVxuICBsZXQgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydFRleHQua2V5KVxuICBsZXQgc3RhcnRDaGlsZCA9IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihzdGFydFRleHQua2V5KVxuICBjb25zdCBpc0F0U3RhcnQgPSByYW5nZS5pc0F0U3RhcnRPZihzdGFydEJsb2NrKVxuICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoc3RhcnRCbG9jay5rZXkpXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yoc3RhcnRCbG9jaylcbiAgY29uc3QgYmxvY2tzID0gZnJhZ21lbnQuZ2V0QmxvY2tzKClcbiAgY29uc3QgZmlyc3RCbG9jayA9IGJsb2Nrcy5maXJzdCgpXG4gIGNvbnN0IGxhc3RCbG9jayA9IGJsb2Nrcy5sYXN0KClcblxuICAvLyBJZiB0aGUgZnJhZ21lbnQgb25seSBjb250YWlucyBhIHZvaWQgYmxvY2ssIHVzZSBgaW5zZXJ0QmxvY2tgIGluc3RlYWQuXG4gIGlmIChmaXJzdEJsb2NrID09IGxhc3RCbG9jayAmJiBmaXJzdEJsb2NrLmlzVm9pZCkge1xuICAgIGNoYW5nZS5pbnNlcnRCbG9ja0F0UmFuZ2UocmFuZ2UsIGZpcnN0QmxvY2ssIG9wdGlvbnMpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBJZiB0aGUgZmlyc3QgYW5kIGxhc3QgYmxvY2sgYXJlbid0IHRoZSBzYW1lLCB3ZSBuZWVkIHRvIGluc2VydCBhbGwgb2YgdGhlXG4gIC8vIG5vZGVzIGFmdGVyIHRoZSBmcmFnbWVudCdzIGZpcnN0IGJsb2NrIGF0IHRoZSBpbmRleC5cbiAgaWYgKGZpcnN0QmxvY2sgIT0gbGFzdEJsb2NrKSB7XG4gICAgY29uc3QgbG9uZWx5UGFyZW50ID0gZnJhZ21lbnQuZ2V0RnVydGhlc3QoZmlyc3RCbG9jay5rZXksIHAgPT4gcC5ub2Rlcy5zaXplID09IDEpXG4gICAgY29uc3QgbG9uZWx5Q2hpbGQgPSBsb25lbHlQYXJlbnQgfHwgZmlyc3RCbG9ja1xuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihzdGFydEJsb2NrKVxuICAgIGZyYWdtZW50ID0gZnJhZ21lbnQucmVtb3ZlRGVzY2VuZGFudChsb25lbHlDaGlsZC5rZXkpXG5cbiAgICBmcmFnbWVudC5ub2Rlcy5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IHN0YXJ0SW5kZXggKyBpICsgMVxuICAgICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBuZXdJbmRleCwgbm9kZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHdlIG5lZWQgdG8gc3BsaXQgdGhlIG5vZGUuXG4gIGlmIChzdGFydE9mZnNldCAhPSAwKSB7XG4gICAgY2hhbmdlLnNwbGl0RGVzY2VuZGFudHNCeUtleShzdGFydENoaWxkLmtleSwgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgfVxuXG4gIC8vIFVwZGF0ZSBvdXIgdmFyaWFibGVzIHdpdGggdGhlIG5ldyB2YWx1ZS5cbiAgZG9jdW1lbnQgPSBjaGFuZ2UudmFsdWUuZG9jdW1lbnRcbiAgc3RhcnRUZXh0ID0gZG9jdW1lbnQuZ2V0RGVzY2VuZGFudChzdGFydEtleSlcbiAgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydEtleSlcbiAgc3RhcnRDaGlsZCA9IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihzdGFydFRleHQua2V5KVxuXG4gIC8vIElmIHRoZSBmaXJzdCBhbmQgbGFzdCBibG9jayBhcmVuJ3QgdGhlIHNhbWUsIHdlIG5lZWQgdG8gbW92ZSBhbnkgb2YgdGhlXG4gIC8vIHN0YXJ0aW5nIGJsb2NrJ3MgY2hpbGRyZW4gYWZ0ZXIgdGhlIHNwbGl0IGludG8gdGhlIGxhc3QgYmxvY2sgb2YgdGhlXG4gIC8vIGZyYWdtZW50LCB3aGljaCBoYXMgYWxyZWFkeSBiZWVuIGluc2VydGVkLlxuICBpZiAoZmlyc3RCbG9jayAhPSBsYXN0QmxvY2spIHtcbiAgICBjb25zdCBuZXh0Q2hpbGQgPSBpc0F0U3RhcnQgPyBzdGFydENoaWxkIDogc3RhcnRCbG9jay5nZXROZXh0U2libGluZyhzdGFydENoaWxkLmtleSlcbiAgICBjb25zdCBuZXh0Tm9kZXMgPSBuZXh0Q2hpbGQgPyBzdGFydEJsb2NrLm5vZGVzLnNraXBVbnRpbChuID0+IG4ua2V5ID09IG5leHRDaGlsZC5rZXkpIDogTGlzdCgpXG4gICAgY29uc3QgbGFzdEluZGV4ID0gbGFzdEJsb2NrLm5vZGVzLnNpemVcblxuICAgIG5leHROb2Rlcy5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IGxhc3RJbmRleCArIGlcbiAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KG5vZGUua2V5LCBsYXN0QmxvY2sua2V5LCBuZXdJbmRleCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8vIElmIHRoZSBzdGFydGluZyBibG9jayBpcyBlbXB0eSwgd2UgcmVwbGFjZSBpdCBlbnRpcmVseSB3aXRoIHRoZSBmaXJzdCBibG9ja1xuICAvLyBvZiB0aGUgZnJhZ21lbnQsIHNpbmNlIHRoaXMgbGVhZHMgdG8gYSBtb3JlIGV4cGVjdGVkIGJlaGF2aW9yIGZvciB0aGUgdXNlci5cbiAgaWYgKHN0YXJ0QmxvY2suaXNFbXB0eSkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoc3RhcnRCbG9jay5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkocGFyZW50LmtleSwgaW5kZXgsIGZpcnN0QmxvY2ssIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCB3ZSBtYWludGFpbiB0aGUgc3RhcnRpbmcgYmxvY2ssIGFuZCBpbnNlcnQgYWxsIG9mIHRoZSBmaXJzdFxuICAvLyBibG9jaydzIGlubGluZSBub2RlcyBpbnRvIGl0IGF0IHRoZSBzcGxpdCBwb2ludC5cbiAgZWxzZSB7XG4gICAgY29uc3QgaW5saW5lQ2hpbGQgPSBzdGFydEJsb2NrLmdldEZ1cnRoZXN0QW5jZXN0b3Ioc3RhcnRUZXh0LmtleSlcbiAgICBjb25zdCBpbmxpbmVJbmRleCA9IHN0YXJ0QmxvY2subm9kZXMuaW5kZXhPZihpbmxpbmVDaGlsZClcblxuICAgIGZpcnN0QmxvY2subm9kZXMuZm9yRWFjaCgoaW5saW5lLCBpKSA9PiB7XG4gICAgICBjb25zdCBvID0gc3RhcnRPZmZzZXQgPT0gMCA/IDAgOiAxXG4gICAgICBjb25zdCBuZXdJbmRleCA9IGlubGluZUluZGV4ICsgaSArIG9cbiAgICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkoc3RhcnRCbG9jay5rZXksIG5ld0luZGV4LCBpbmxpbmUsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIH0pXG4gIH1cblxuICAvLyBOb3JtYWxpemUgaWYgcmVxdWVzdGVkLlxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGFuIGBpbmxpbmVgIG5vZGUgYXQgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtJbmxpbmV8U3RyaW5nfE9iamVjdH0gaW5saW5lXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuaW5zZXJ0SW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBpbmxpbmUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCBub3JtYWxpemUgPSBjaGFuZ2UuZ2V0RmxhZygnbm9ybWFsaXplJywgb3B0aW9ucylcbiAgaW5saW5lID0gSW5saW5lLmNyZWF0ZShpbmxpbmUpXG5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgcmFuZ2UgPSByYW5nZS5jb2xsYXBzZVRvU3RhcnQoKVxuICB9XG5cbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoc3RhcnRLZXkpXG4gIGNvbnN0IHN0YXJ0VGV4dCA9IGRvY3VtZW50LmFzc2VydERlc2NlbmRhbnQoc3RhcnRLZXkpXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yoc3RhcnRUZXh0KVxuXG4gIGlmIChwYXJlbnQuaXNWb2lkKSByZXR1cm5cblxuICBjaGFuZ2Uuc3BsaXROb2RlQnlLZXkoc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCArIDEsIGlubGluZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIEluc2VydCBgdGV4dGAgYXQgYSBgcmFuZ2VgLCB3aXRoIG9wdGlvbmFsIGBtYXJrc2AuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge1NldDxNYXJrPn0gbWFya3MgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmluc2VydFRleHRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIHRleHQsIG1hcmtzLCBvcHRpb25zID0ge30pID0+IHtcbiAgbGV0IHsgbm9ybWFsaXplIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCB9ID0gcmFuZ2VcbiAgbGV0IGtleSA9IHN0YXJ0S2V5XG4gIGxldCBvZmZzZXQgPSBzdGFydE9mZnNldFxuICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoc3RhcnRLZXkpXG5cbiAgaWYgKHBhcmVudC5pc1ZvaWQpIHJldHVyblxuXG4gIGlmIChyYW5nZS5pc0V4cGFuZGVkKSB7XG4gICAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuXG4gICAgLy8gVXBkYXRlIHJhbmdlIHN0YXJ0IGFmdGVyIGRlbGV0ZVxuICAgIGlmIChjaGFuZ2UudmFsdWUuc3RhcnRLZXkgIT09IGtleSkge1xuICAgICAga2V5ID0gY2hhbmdlLnZhbHVlLnN0YXJ0S2V5XG4gICAgICBvZmZzZXQgPSBjaGFuZ2UudmFsdWUuc3RhcnRPZmZzZXRcbiAgICB9XG4gIH1cblxuICAvLyBQRVJGOiBVbmxlc3Mgc3BlY2lmaWVkLCBkb24ndCBub3JtYWxpemUgaWYgb25seSBpbnNlcnRpbmcgdGV4dC5cbiAgaWYgKG5vcm1hbGl6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbm9ybWFsaXplID0gcmFuZ2UuaXNFeHBhbmRlZFxuICB9XG5cbiAgY2hhbmdlLmluc2VydFRleHRCeUtleShrZXksIG9mZnNldCwgdGV4dCwgbWFya3MsIHsgbm9ybWFsaXplIH0pXG59XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV4aXN0aW5nIGBtYXJrYCB0byB0aGUgY2hhcmFjdGVycyBhdCBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge01hcmt8U3RyaW5nfSBtYXJrIChvcHRpb25hbClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5yZW1vdmVNYXJrQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBtYXJrLCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKHJhbmdlLmlzQ29sbGFwc2VkKSByZXR1cm5cblxuICBjb25zdCBub3JtYWxpemUgPSBjaGFuZ2UuZ2V0RmxhZygnbm9ybWFsaXplJywgb3B0aW9ucylcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHRleHRzID0gZG9jdW1lbnQuZ2V0VGV4dHNBdFJhbmdlKHJhbmdlKVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgZW5kS2V5LCBlbmRPZmZzZXQgfSA9IHJhbmdlXG5cbiAgdGV4dHMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgIGNvbnN0IHsga2V5IH0gPSBub2RlXG4gICAgbGV0IGluZGV4ID0gMFxuICAgIGxldCBsZW5ndGggPSBub2RlLnRleHQubGVuZ3RoXG5cbiAgICBpZiAoa2V5ID09IHN0YXJ0S2V5KSBpbmRleCA9IHN0YXJ0T2Zmc2V0XG4gICAgaWYgKGtleSA9PSBlbmRLZXkpIGxlbmd0aCA9IGVuZE9mZnNldFxuICAgIGlmIChrZXkgPT0gc3RhcnRLZXkgJiYga2V5ID09IGVuZEtleSkgbGVuZ3RoID0gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXRcblxuICAgIGNoYW5nZS5yZW1vdmVNYXJrQnlLZXkoa2V5LCBpbmRleCwgbGVuZ3RoLCBtYXJrLCB7IG5vcm1hbGl6ZSB9KVxuICB9KVxufVxuXG4vKipcbiAqIFNldCB0aGUgYHByb3BlcnRpZXNgIG9mIGJsb2NrIG5vZGVzIGluIGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuc2V0QmxvY2tBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIHByb3BlcnRpZXMsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCBub3JtYWxpemUgPSBjaGFuZ2UuZ2V0RmxhZygnbm9ybWFsaXplJywgb3B0aW9ucylcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IGJsb2NrcyA9IGRvY3VtZW50LmdldEJsb2Nrc0F0UmFuZ2UocmFuZ2UpXG5cbiAgYmxvY2tzLmZvckVhY2goKGJsb2NrKSA9PiB7XG4gICAgY2hhbmdlLnNldE5vZGVCeUtleShibG9jay5rZXksIHByb3BlcnRpZXMsIHsgbm9ybWFsaXplIH0pXG4gIH0pXG59XG5cbi8qKlxuICogU2V0IHRoZSBgcHJvcGVydGllc2Agb2YgaW5saW5lIG5vZGVzIGluIGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuc2V0SW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBwcm9wZXJ0aWVzLCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBpbmxpbmVzID0gZG9jdW1lbnQuZ2V0SW5saW5lc0F0UmFuZ2UocmFuZ2UpXG5cbiAgaW5saW5lcy5mb3JFYWNoKChpbmxpbmUpID0+IHtcbiAgICBjaGFuZ2Uuc2V0Tm9kZUJ5S2V5KGlubGluZS5rZXksIHByb3BlcnRpZXMsIHsgbm9ybWFsaXplIH0pXG4gIH0pXG59XG5cbi8qKlxuICogU3BsaXQgdGhlIGJsb2NrIG5vZGVzIGF0IGEgYHJhbmdlYCwgdG8gb3B0aW9uYWwgYGhlaWdodGAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHQgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnNwbGl0QmxvY2tBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIGhlaWdodCA9IDEsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCBub3JtYWxpemUgPSBjaGFuZ2UuZ2V0RmxhZygnbm9ybWFsaXplJywgb3B0aW9ucylcblxuICBpZiAocmFuZ2UuaXNFeHBhbmRlZCkge1xuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJhbmdlID0gcmFuZ2UuY29sbGFwc2VUb1N0YXJ0KClcbiAgfVxuXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KHN0YXJ0S2V5KVxuICBsZXQgcGFyZW50ID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKG5vZGUua2V5KVxuICBsZXQgaCA9IDBcblxuICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC5vYmplY3QgPT0gJ2Jsb2NrJyAmJiBoIDwgaGVpZ2h0KSB7XG4gICAgbm9kZSA9IHBhcmVudFxuICAgIHBhcmVudCA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhwYXJlbnQua2V5KVxuICAgIGgrK1xuICB9XG5cbiAgY2hhbmdlLnNwbGl0RGVzY2VuZGFudHNCeUtleShub2RlLmtleSwgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCB7IG5vcm1hbGl6ZSB9KVxufVxuXG4vKipcbiAqIFNwbGl0IHRoZSBpbmxpbmUgbm9kZXMgYXQgYSBgcmFuZ2VgLCB0byBvcHRpb25hbCBgaGVpZ2h0YC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodCAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuc3BsaXRJbmxpbmVBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIGhlaWdodCA9IEluZmluaXR5LCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemUgfSlcbiAgICByYW5nZSA9IHJhbmdlLmNvbGxhcHNlVG9TdGFydCgpXG4gIH1cblxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCB9ID0gcmFuZ2VcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGxldCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0RGVzY2VuZGFudChzdGFydEtleSlcbiAgbGV0IHBhcmVudCA9IGRvY3VtZW50LmdldENsb3Nlc3RJbmxpbmUobm9kZS5rZXkpXG4gIGxldCBoID0gMFxuXG4gIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50Lm9iamVjdCA9PSAnaW5saW5lJyAmJiBoIDwgaGVpZ2h0KSB7XG4gICAgbm9kZSA9IHBhcmVudFxuICAgIHBhcmVudCA9IGRvY3VtZW50LmdldENsb3Nlc3RJbmxpbmUocGFyZW50LmtleSlcbiAgICBoKytcbiAgfVxuXG4gIGNoYW5nZS5zcGxpdERlc2NlbmRhbnRzQnlLZXkobm9kZS5rZXksIHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgeyBub3JtYWxpemUgfSlcbn1cblxuLyoqXG4gKiBBZGQgb3IgcmVtb3ZlIGEgYG1hcmtgIGZyb20gdGhlIGNoYXJhY3RlcnMgYXQgYHJhbmdlYCwgZGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAqIGl0J3MgYWxyZWFkeSB0aGVyZS5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtNaXhlZH0gbWFya1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnRvZ2dsZU1hcmtBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG1hcmssIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBpZiAocmFuZ2UuaXNDb2xsYXBzZWQpIHJldHVyblxuXG4gIG1hcmsgPSBNYXJrLmNyZWF0ZShtYXJrKVxuXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgbWFya3MgPSBkb2N1bWVudC5nZXRBY3RpdmVNYXJrc0F0UmFuZ2UocmFuZ2UpXG4gIGNvbnN0IGV4aXN0cyA9IG1hcmtzLnNvbWUobSA9PiBtLmVxdWFscyhtYXJrKSlcblxuICBpZiAoZXhpc3RzKSB7XG4gICAgY2hhbmdlLnJlbW92ZU1hcmtBdFJhbmdlKHJhbmdlLCBtYXJrLCB7IG5vcm1hbGl6ZSB9KVxuICB9IGVsc2Uge1xuICAgIGNoYW5nZS5hZGRNYXJrQXRSYW5nZShyYW5nZSwgbWFyaywgeyBub3JtYWxpemUgfSlcbiAgfVxufVxuXG4vKipcbiAqIFVud3JhcCBhbGwgb2YgdGhlIGJsb2NrIG5vZGVzIGluIGEgYHJhbmdlYCBmcm9tIGEgYmxvY2sgd2l0aCBgcHJvcGVydGllc2AuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gcHJvcGVydGllc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnVud3JhcEJsb2NrQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBwcm9wZXJ0aWVzLCBvcHRpb25zID0ge30pID0+IHtcbiAgcHJvcGVydGllcyA9IE5vZGUuY3JlYXRlUHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IGJsb2NrcyA9IGRvY3VtZW50LmdldEJsb2Nrc0F0UmFuZ2UocmFuZ2UpXG4gIGNvbnN0IHdyYXBwZXJzID0gYmxvY2tzXG4gICAgLm1hcCgoYmxvY2spID0+IHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5nZXRDbG9zZXN0KGJsb2NrLmtleSwgKHBhcmVudCkgPT4ge1xuICAgICAgICBpZiAocGFyZW50Lm9iamVjdCAhPSAnYmxvY2snKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnRpZXMudHlwZSAhPSBudWxsICYmIHBhcmVudC50eXBlICE9IHByb3BlcnRpZXMudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmlzVm9pZCAhPSBudWxsICYmIHBhcmVudC5pc1ZvaWQgIT0gcHJvcGVydGllcy5pc1ZvaWQpIHJldHVybiBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydGllcy5kYXRhICE9IG51bGwgJiYgIXBhcmVudC5kYXRhLmlzU3VwZXJzZXQocHJvcGVydGllcy5kYXRhKSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9KVxuICAgIH0pXG4gICAgLmZpbHRlcihleGlzdHMgPT4gZXhpc3RzKVxuICAgIC50b09yZGVyZWRTZXQoKVxuICAgIC50b0xpc3QoKVxuXG4gIHdyYXBwZXJzLmZvckVhY2goKGJsb2NrKSA9PiB7XG4gICAgY29uc3QgZmlyc3QgPSBibG9jay5ub2Rlcy5maXJzdCgpXG4gICAgY29uc3QgbGFzdCA9IGJsb2NrLm5vZGVzLmxhc3QoKVxuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChibG9jay5rZXkpXG4gICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihibG9jaylcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2subm9kZXMuZmlsdGVyKChjaGlsZCkgPT4ge1xuICAgICAgcmV0dXJuIGJsb2Nrcy5zb21lKGIgPT4gY2hpbGQgPT0gYiB8fCBjaGlsZC5oYXNEZXNjZW5kYW50KGIua2V5KSlcbiAgICB9KVxuXG4gICAgY29uc3QgZmlyc3RNYXRjaCA9IGNoaWxkcmVuLmZpcnN0KClcbiAgICBjb25zdCBsYXN0TWF0Y2ggPSBjaGlsZHJlbi5sYXN0KClcblxuICAgIGlmIChmaXJzdCA9PSBmaXJzdE1hdGNoICYmIGxhc3QgPT0gbGFzdE1hdGNoKSB7XG4gICAgICBibG9jay5ub2Rlcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShjaGlsZC5rZXksIHBhcmVudC5rZXksIGluZGV4ICsgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9KVxuXG4gICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KGJsb2NrLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfVxuXG4gICAgZWxzZSBpZiAobGFzdCA9PSBsYXN0TWF0Y2gpIHtcbiAgICAgIGJsb2NrLm5vZGVzXG4gICAgICAgIC5za2lwVW50aWwobiA9PiBuID09IGZpcnN0TWF0Y2gpXG4gICAgICAgIC5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgcGFyZW50LmtleSwgaW5kZXggKyAxICsgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZWxzZSBpZiAoZmlyc3QgPT0gZmlyc3RNYXRjaCkge1xuICAgICAgYmxvY2subm9kZXNcbiAgICAgICAgLnRha2VVbnRpbChuID0+IG4gPT0gbGFzdE1hdGNoKVxuICAgICAgICAucHVzaChsYXN0TWF0Y2gpXG4gICAgICAgIC5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgcGFyZW50LmtleSwgaW5kZXggKyBpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGZpcnN0VGV4dCA9IGZpcnN0TWF0Y2guZ2V0Rmlyc3RUZXh0KClcbiAgICAgIGNoYW5nZS5zcGxpdERlc2NlbmRhbnRzQnlLZXkoYmxvY2sua2V5LCBmaXJzdFRleHQua2V5LCAwLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG5cbiAgICAgIGNoaWxkcmVuLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICBjb25zdCBleHRyYSA9IGNoaWxkXG4gICAgICAgICAgY2hpbGQgPSBkb2N1bWVudC5nZXROZXh0QmxvY2soY2hpbGQua2V5KVxuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoZXh0cmEua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgcGFyZW50LmtleSwgaW5kZXggKyAxICsgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfSlcblxuICAvLyBUT0RPOiBvcHRtaXplIHRvIG9ubHkgbm9ybWFsaXplIHRoZSByaWdodCBibG9ja1xuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY2hhbmdlLm5vcm1hbGl6ZURvY3VtZW50KClcbiAgfVxufVxuXG4vKipcbiAqIFVud3JhcCB0aGUgaW5saW5lIG5vZGVzIGluIGEgYHJhbmdlYCBmcm9tIGFuIGlubGluZSB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMudW53cmFwSW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBwcm9wZXJ0aWVzLCBvcHRpb25zID0ge30pID0+IHtcbiAgcHJvcGVydGllcyA9IE5vZGUuY3JlYXRlUHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgdGV4dHMgPSBkb2N1bWVudC5nZXRUZXh0c0F0UmFuZ2UocmFuZ2UpXG4gIGNvbnN0IGlubGluZXMgPSB0ZXh0c1xuICAgIC5tYXAoKHRleHQpID0+IHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5nZXRDbG9zZXN0KHRleHQua2V5LCAocGFyZW50KSA9PiB7XG4gICAgICAgIGlmIChwYXJlbnQub2JqZWN0ICE9ICdpbmxpbmUnKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnRpZXMudHlwZSAhPSBudWxsICYmIHBhcmVudC50eXBlICE9IHByb3BlcnRpZXMudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmlzVm9pZCAhPSBudWxsICYmIHBhcmVudC5pc1ZvaWQgIT0gcHJvcGVydGllcy5pc1ZvaWQpIHJldHVybiBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydGllcy5kYXRhICE9IG51bGwgJiYgIXBhcmVudC5kYXRhLmlzU3VwZXJzZXQocHJvcGVydGllcy5kYXRhKSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9KVxuICAgIH0pXG4gICAgLmZpbHRlcihleGlzdHMgPT4gZXhpc3RzKVxuICAgIC50b09yZGVyZWRTZXQoKVxuICAgIC50b0xpc3QoKVxuXG4gIGlubGluZXMuZm9yRWFjaCgoaW5saW5lKSA9PiB7XG4gICAgY29uc3QgcGFyZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50LmdldFBhcmVudChpbmxpbmUua2V5KVxuICAgIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2YoaW5saW5lKVxuXG4gICAgaW5saW5lLm5vZGVzLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShjaGlsZC5rZXksIHBhcmVudC5rZXksIGluZGV4ICsgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcbiAgfSlcblxuICAvLyBUT0RPOiBvcHRtaXplIHRvIG9ubHkgbm9ybWFsaXplIHRoZSByaWdodCBibG9ja1xuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY2hhbmdlLm5vcm1hbGl6ZURvY3VtZW50KClcbiAgfVxufVxuXG4vKipcbiAqIFdyYXAgYWxsIG9mIHRoZSBibG9ja3MgaW4gYSBgcmFuZ2VgIGluIGEgbmV3IGBibG9ja2AuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7QmxvY2t8T2JqZWN0fFN0cmluZ30gYmxvY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy53cmFwQmxvY2tBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIGJsb2NrLCBvcHRpb25zID0ge30pID0+IHtcbiAgYmxvY2sgPSBCbG9jay5jcmVhdGUoYmxvY2spXG4gIGJsb2NrID0gYmxvY2suc2V0KCdub2RlcycsIGJsb2NrLm5vZGVzLmNsZWFyKCkpXG5cbiAgY29uc3Qgbm9ybWFsaXplID0gY2hhbmdlLmdldEZsYWcoJ25vcm1hbGl6ZScsIG9wdGlvbnMpXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuXG4gIGNvbnN0IGJsb2NrcyA9IGRvY3VtZW50LmdldEJsb2Nrc0F0UmFuZ2UocmFuZ2UpXG4gIGNvbnN0IGZpcnN0YmxvY2sgPSBibG9ja3MuZmlyc3QoKVxuICBjb25zdCBsYXN0YmxvY2sgPSBibG9ja3MubGFzdCgpXG4gIGxldCBwYXJlbnQsIHNpYmxpbmdzLCBpbmRleFxuXG4gIC8vIElmIHRoZXJlIGlzIG9ubHkgb25lIGJsb2NrIGluIHRoZSBzZWxlY3Rpb24gdGhlbiB3ZSBrbm93IHRoZSBwYXJlbnQgYW5kXG4gIC8vIHNpYmxpbmdzLlxuICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMSkge1xuICAgIHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChmaXJzdGJsb2NrLmtleSlcbiAgICBzaWJsaW5ncyA9IGJsb2Nrc1xuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIGNsb3Nlc3Qgc2hhcmVkIHBhcmVudCB0byBhbGwgYmxvY2tzIGluIHNlbGVjdGlvbi5cbiAgZWxzZSB7XG4gICAgcGFyZW50ID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdChmaXJzdGJsb2NrLmtleSwgKHAxKSA9PiB7XG4gICAgICByZXR1cm4gISFkb2N1bWVudC5nZXRDbG9zZXN0KGxhc3RibG9jay5rZXksIHAyID0+IHAxID09IHAyKVxuICAgIH0pXG4gIH1cblxuICAvLyBJZiBubyBzaGFyZWQgcGFyZW50IGNvdWxkIGJlIGZvdW5kIHRoZW4gdGhlIHBhcmVudCBpcyB0aGUgZG9jdW1lbnQuXG4gIGlmIChwYXJlbnQgPT0gbnVsbCkgcGFyZW50ID0gZG9jdW1lbnRcblxuICAvLyBDcmVhdGUgYSBsaXN0IG9mIGRpcmVjdCBjaGlsZHJlbiBzaWJsaW5ncyBvZiBwYXJlbnQgdGhhdCBmYWxsIGluIHRoZVxuICAvLyBzZWxlY3Rpb24uXG4gIGlmIChzaWJsaW5ncyA9PSBudWxsKSB7XG4gICAgY29uc3QgaW5kZXhlcyA9IHBhcmVudC5ub2Rlcy5yZWR1Y2UoKGluZCwgbm9kZSwgaSkgPT4ge1xuICAgICAgaWYgKG5vZGUgPT0gZmlyc3RibG9jayB8fCBub2RlLmhhc0Rlc2NlbmRhbnQoZmlyc3RibG9jay5rZXkpKSBpbmRbMF0gPSBpXG4gICAgICBpZiAobm9kZSA9PSBsYXN0YmxvY2sgfHwgbm9kZS5oYXNEZXNjZW5kYW50KGxhc3RibG9jay5rZXkpKSBpbmRbMV0gPSBpXG4gICAgICByZXR1cm4gaW5kXG4gICAgfSwgW10pXG5cbiAgICBpbmRleCA9IGluZGV4ZXNbMF1cbiAgICBzaWJsaW5ncyA9IHBhcmVudC5ub2Rlcy5zbGljZShpbmRleGVzWzBdLCBpbmRleGVzWzFdICsgMSlcbiAgfVxuXG4gIC8vIEdldCB0aGUgaW5kZXggdG8gcGxhY2UgdGhlIG5ldyB3cmFwcGVkIG5vZGUgYXQuXG4gIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihzaWJsaW5ncy5maXJzdCgpKVxuICB9XG5cbiAgLy8gSW5qZWN0IHRoZSBuZXcgYmxvY2sgbm9kZSBpbnRvIHRoZSBwYXJlbnQuXG4gIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkocGFyZW50LmtleSwgaW5kZXgsIGJsb2NrLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcblxuICAvLyBNb3ZlIHRoZSBzaWJsaW5nIG5vZGVzIGludG8gdGhlIG5ldyBibG9jayBub2RlLlxuICBzaWJsaW5ncy5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkobm9kZS5rZXksIGJsb2NrLmtleSwgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIFdyYXAgdGhlIHRleHQgYW5kIGlubGluZXMgaW4gYSBgcmFuZ2VgIGluIGEgbmV3IGBpbmxpbmVgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge0lubGluZXxPYmplY3R8U3RyaW5nfSBpbmxpbmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy53cmFwSW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBpbmxpbmUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGNoYW5nZS5nZXRGbGFnKCdub3JtYWxpemUnLCBvcHRpb25zKVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgZW5kS2V5LCBlbmRPZmZzZXQgfSA9IHJhbmdlXG5cbiAgaWYgKHJhbmdlLmlzQ29sbGFwc2VkKSB7XG4gICAgLy8gV3JhcHBpbmcgYW4gaW5saW5lIHZvaWRcbiAgICBjb25zdCBpbmxpbmVQYXJlbnQgPSBkb2N1bWVudC5nZXRDbG9zZXN0SW5saW5lKHN0YXJ0S2V5KVxuICAgIGlmICghaW5saW5lUGFyZW50LmlzVm9pZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5nZS53cmFwSW5saW5lQnlLZXkoaW5saW5lUGFyZW50LmtleSwgaW5saW5lLCBvcHRpb25zKVxuICB9XG5cbiAgaW5saW5lID0gSW5saW5lLmNyZWF0ZShpbmxpbmUpXG4gIGlubGluZSA9IGlubGluZS5zZXQoJ25vZGVzJywgaW5saW5lLm5vZGVzLmNsZWFyKCkpXG5cbiAgY29uc3QgYmxvY2tzID0gZG9jdW1lbnQuZ2V0QmxvY2tzQXRSYW5nZShyYW5nZSlcbiAgbGV0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGxldCBlbmRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhlbmRLZXkpXG4gIGxldCBzdGFydENoaWxkID0gc3RhcnRCbG9jay5nZXRGdXJ0aGVzdEFuY2VzdG9yKHN0YXJ0S2V5KVxuICBsZXQgZW5kQ2hpbGQgPSBlbmRCbG9jay5nZXRGdXJ0aGVzdEFuY2VzdG9yKGVuZEtleSlcblxuICBjaGFuZ2Uuc3BsaXREZXNjZW5kYW50c0J5S2V5KGVuZENoaWxkLmtleSwgZW5kS2V5LCBlbmRPZmZzZXQsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICBjaGFuZ2Uuc3BsaXREZXNjZW5kYW50c0J5S2V5KHN0YXJ0Q2hpbGQua2V5LCBzdGFydEtleSwgc3RhcnRPZmZzZXQsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuXG4gIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG4gIHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXREZXNjZW5kYW50KHN0YXJ0QmxvY2sua2V5KVxuICBlbmRCbG9jayA9IGRvY3VtZW50LmdldERlc2NlbmRhbnQoZW5kQmxvY2sua2V5KVxuICBzdGFydENoaWxkID0gc3RhcnRCbG9jay5nZXRGdXJ0aGVzdEFuY2VzdG9yKHN0YXJ0S2V5KVxuICBlbmRDaGlsZCA9IGVuZEJsb2NrLmdldEZ1cnRoZXN0QW5jZXN0b3IoZW5kS2V5KVxuICBjb25zdCBzdGFydEluZGV4ID0gc3RhcnRCbG9jay5ub2Rlcy5pbmRleE9mKHN0YXJ0Q2hpbGQpXG4gIGNvbnN0IGVuZEluZGV4ID0gZW5kQmxvY2subm9kZXMuaW5kZXhPZihlbmRDaGlsZClcblxuICBpZiAoc3RhcnRCbG9jayA9PSBlbmRCbG9jaykge1xuICAgIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG4gICAgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydEtleSlcbiAgICBzdGFydENoaWxkID0gc3RhcnRCbG9jay5nZXRGdXJ0aGVzdEFuY2VzdG9yKHN0YXJ0S2V5KVxuXG4gICAgY29uc3Qgc3RhcnRJbm5lciA9IGRvY3VtZW50LmdldE5leHRTaWJsaW5nKHN0YXJ0Q2hpbGQua2V5KVxuICAgIGNvbnN0IHN0YXJ0SW5uZXJJbmRleCA9IHN0YXJ0QmxvY2subm9kZXMuaW5kZXhPZihzdGFydElubmVyKVxuICAgIGNvbnN0IGVuZElubmVyID0gc3RhcnRLZXkgPT0gZW5kS2V5ID8gc3RhcnRJbm5lciA6IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihlbmRLZXkpXG4gICAgY29uc3QgaW5saW5lcyA9IHN0YXJ0QmxvY2subm9kZXNcbiAgICAgIC5za2lwVW50aWwobiA9PiBuID09IHN0YXJ0SW5uZXIpXG4gICAgICAudGFrZVVudGlsKG4gPT4gbiA9PSBlbmRJbm5lcilcbiAgICAgIC5wdXNoKGVuZElubmVyKVxuXG4gICAgY29uc3Qgbm9kZSA9IGlubGluZS5yZWdlbmVyYXRlS2V5KClcblxuICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkoc3RhcnRCbG9jay5rZXksIHN0YXJ0SW5uZXJJbmRleCwgbm9kZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICBpbmxpbmVzLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShjaGlsZC5rZXksIG5vZGUua2V5LCBpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICB9KVxuXG4gICAgaWYgKG5vcm1hbGl6ZSkge1xuICAgICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShzdGFydEJsb2NrLmtleSlcbiAgICB9XG4gIH1cblxuICBlbHNlIHtcbiAgICBjb25zdCBzdGFydElubGluZXMgPSBzdGFydEJsb2NrLm5vZGVzLnNsaWNlKHN0YXJ0SW5kZXggKyAxKVxuICAgIGNvbnN0IGVuZElubGluZXMgPSBlbmRCbG9jay5ub2Rlcy5zbGljZSgwLCBlbmRJbmRleCArIDEpXG4gICAgY29uc3Qgc3RhcnROb2RlID0gaW5saW5lLnJlZ2VuZXJhdGVLZXkoKVxuICAgIGNvbnN0IGVuZE5vZGUgPSBpbmxpbmUucmVnZW5lcmF0ZUtleSgpXG5cbiAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHN0YXJ0QmxvY2sua2V5LCBzdGFydEluZGV4ICsgMSwgc3RhcnROb2RlLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KGVuZEJsb2NrLmtleSwgZW5kSW5kZXgsIGVuZE5vZGUsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuXG4gICAgc3RhcnRJbmxpbmVzLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShjaGlsZC5rZXksIHN0YXJ0Tm9kZS5rZXksIGksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIH0pXG5cbiAgICBlbmRJbmxpbmVzLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShjaGlsZC5rZXksIGVuZE5vZGUua2V5LCBpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICB9KVxuXG4gICAgaWYgKG5vcm1hbGl6ZSkge1xuICAgICAgY2hhbmdlXG4gICAgICAgIC5ub3JtYWxpemVOb2RlQnlLZXkoc3RhcnRCbG9jay5rZXkpXG4gICAgICAgIC5ub3JtYWxpemVOb2RlQnlLZXkoZW5kQmxvY2sua2V5KVxuICAgIH1cblxuICAgIGJsb2Nrcy5zbGljZSgxLCAtMSkuZm9yRWFjaCgoYmxvY2spID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSBpbmxpbmUucmVnZW5lcmF0ZUtleSgpXG4gICAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KGJsb2NrLmtleSwgMCwgbm9kZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICAgIGJsb2NrLm5vZGVzLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgbm9kZS5rZXksIGksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgfSlcblxuICAgICAgaWYgKG5vcm1hbGl6ZSkge1xuICAgICAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KGJsb2NrLmtleSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogV3JhcCB0aGUgdGV4dCBpbiBhIGByYW5nZWAgaW4gYSBwcmVmaXgvc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJlZml4XG4gKiBAcGFyYW0ge1N0cmluZ30gc3VmZml4IChvcHRpb25hbClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy53cmFwVGV4dEF0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgcHJlZml4LCBzdWZmaXggPSBwcmVmaXgsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCBub3JtYWxpemUgPSBjaGFuZ2UuZ2V0RmxhZygnbm9ybWFsaXplJywgb3B0aW9ucylcbiAgY29uc3QgeyBzdGFydEtleSwgZW5kS2V5IH0gPSByYW5nZVxuICBjb25zdCBzdGFydCA9IHJhbmdlLmNvbGxhcHNlVG9TdGFydCgpXG4gIGxldCBlbmQgPSByYW5nZS5jb2xsYXBzZVRvRW5kKClcblxuICBpZiAoc3RhcnRLZXkgPT0gZW5kS2V5KSB7XG4gICAgZW5kID0gZW5kLm1vdmUocHJlZml4Lmxlbmd0aClcbiAgfVxuXG4gIGNoYW5nZS5pbnNlcnRUZXh0QXRSYW5nZShzdGFydCwgcHJlZml4LCBbXSwgeyBub3JtYWxpemUgfSlcbiAgY2hhbmdlLmluc2VydFRleHRBdFJhbmdlKGVuZCwgc3VmZml4LCBbXSwgeyBub3JtYWxpemUgfSlcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBDaGFuZ2VzXG4iXX0=