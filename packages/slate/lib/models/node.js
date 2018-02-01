'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _direction = require('direction');

var _direction2 = _interopRequireDefault(_direction);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _immutable = require('immutable');

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

var _range6 = require('./range');

var _range7 = _interopRequireDefault(_range6);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _isIndexInRange = require('../utils/is-index-in-range');

var _isIndexInRange2 = _interopRequireDefault(_isIndexInRange);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Node.
 *
 * And interface that `Document`, `Block` and `Inline` all implement, to make
 * working with the recursive node tree easier.
 *
 * @type {Node}
 */

var Node = function () {
  function Node() {
    _classCallCheck(this, Node);
  }

  _createClass(Node, [{
    key: 'areDescendantsSorted',


    /**
     * True if the node has both descendants in that order, false otherwise. The
     * order is depth-first, post-order.
     *
     * @param {String} first
     * @param {String} second
     * @return {Boolean}
     */

    value: function areDescendantsSorted(first, second) {
      first = assertKey(first);
      second = assertKey(second);

      var keys = this.getKeysAsArray();
      var firstIndex = keys.indexOf(first);
      var secondIndex = keys.indexOf(second);
      if (firstIndex == -1 || secondIndex == -1) return null;

      return firstIndex < secondIndex;
    }

    /**
     * Assert that a node has a child by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertChild',
    value: function assertChild(key) {
      var child = this.getChild(key);

      if (!child) {
        key = assertKey(key);
        throw new Error('Could not find a child node with key "' + key + '".');
      }

      return child;
    }

    /**
     * Assert that a node has a descendant by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertDescendant',
    value: function assertDescendant(key) {
      var descendant = this.getDescendant(key);

      if (!descendant) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      return descendant;
    }

    /**
     * Assert that a node's tree has a node by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertNode',
    value: function assertNode(key) {
      var node = this.getNode(key);

      if (!node) {
        key = assertKey(key);
        throw new Error('Could not find a node with key "' + key + '".');
      }

      return node;
    }

    /**
     * Assert that a node exists at `path` and return it.
     *
     * @param {Array} path
     * @return {Node}
     */

  }, {
    key: 'assertPath',
    value: function assertPath(path) {
      var descendant = this.getDescendantAtPath(path);

      if (!descendant) {
        throw new Error('Could not find a descendant at path "' + path + '".');
      }

      return descendant;
    }

    /**
     * Recursively filter all descendant nodes with `iterator`.
     *
     * @param {Function} iterator
     * @return {List<Node>}
     */

  }, {
    key: 'filterDescendants',
    value: function filterDescendants(iterator) {
      var matches = [];

      this.forEachDescendant(function (node, i, nodes) {
        if (iterator(node, i, nodes)) matches.push(node);
      });

      return (0, _immutable.List)(matches);
    }

    /**
     * Recursively find all descendant nodes by `iterator`.
     *
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'findDescendant',
    value: function findDescendant(iterator) {
      var found = null;

      this.forEachDescendant(function (node, i, nodes) {
        if (iterator(node, i, nodes)) {
          found = node;
          return false;
        }
      });

      return found;
    }

    /**
     * Recursively iterate over all descendant nodes with `iterator`. If the
     * iterator returns false it will break the loop.
     *
     * @param {Function} iterator
     */

  }, {
    key: 'forEachDescendant',
    value: function forEachDescendant(iterator) {
      var ret = void 0;

      this.nodes.forEach(function (child, i, nodes) {
        if (iterator(child, i, nodes) === false) {
          ret = false;
          return false;
        }

        if (child.object != 'text') {
          ret = child.forEachDescendant(iterator);
          return ret;
        }
      });

      return ret;
    }

    /**
     * Get the path of ancestors of a descendant node by `key`.
     *
     * @param {String|Node} key
     * @return {List<Node>|Null}
     */

  }, {
    key: 'getAncestors',
    value: function getAncestors(key) {
      key = assertKey(key);

      if (key == this.key) return (0, _immutable.List)();
      if (this.hasChild(key)) return (0, _immutable.List)([this]);

      var ancestors = void 0;
      this.nodes.find(function (node) {
        if (node.object == 'text') return false;
        ancestors = node.getAncestors(key);
        return ancestors;
      });

      if (ancestors) {
        return ancestors.unshift(this);
      } else {
        return null;
      }
    }

    /**
     * Get the leaf block descendants of the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocks',
    value: function getBlocks() {
      var array = this.getBlocksAsArray();
      return new _immutable.List(array);
    }

    /**
     * Get the leaf block descendants of the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksAsArray',
    value: function getBlocksAsArray() {
      return this.nodes.reduce(function (array, child) {
        if (child.object != 'block') return array;
        if (!child.isLeafBlock()) return array.concat(child.getBlocksAsArray());
        array.push(child);
        return array;
      }, []);
    }

    /**
     * Get the leaf block descendants in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksAtRange',
    value: function getBlocksAtRange(range) {
      var array = this.getBlocksAtRangeAsArray(range);
      // Eliminate duplicates by converting to an `OrderedSet` first.
      return new _immutable.List(new _immutable.OrderedSet(array));
    }

    /**
     * Get the leaf block descendants in a `range` as an array
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getBlocksAtRangeAsArray',
    value: function getBlocksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      var _range = range,
          startKey = _range.startKey,
          endKey = _range.endKey;

      var startBlock = this.getClosestBlock(startKey);

      // PERF: the most common case is when the range is in a single block node,
      // where we can avoid a lot of iterating of the tree.
      if (startKey == endKey) return [startBlock];

      var endBlock = this.getClosestBlock(endKey);
      var blocks = this.getBlocksAsArray();
      var start = blocks.indexOf(startBlock);
      var end = blocks.indexOf(endBlock);
      return blocks.slice(start, end + 1);
    }

    /**
     * Get all of the leaf blocks that match a `type`.
     *
     * @param {String} type
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksByType',
    value: function getBlocksByType(type) {
      var array = this.getBlocksByTypeAsArray(type);
      return new _immutable.List(array);
    }

    /**
     * Get all of the leaf blocks that match a `type` as an array
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getBlocksByTypeAsArray',
    value: function getBlocksByTypeAsArray(type) {
      return this.nodes.reduce(function (array, node) {
        if (node.object != 'block') {
          return array;
        } else if (node.isLeafBlock() && node.type == type) {
          array.push(node);
          return array;
        } else {
          return array.concat(node.getBlocksByTypeAsArray(type));
        }
      }, []);
    }

    /**
     * Get all of the characters for every text node.
     *
     * @return {List<Character>}
     */

  }, {
    key: 'getCharacters',
    value: function getCharacters() {
      var array = this.getCharactersAsArray();
      return new _immutable.List(array);
    }

    /**
     * Get all of the characters for every text node as an array
     *
     * @return {Array}
     */

  }, {
    key: 'getCharactersAsArray',
    value: function getCharactersAsArray() {
      return this.nodes.reduce(function (arr, node) {
        return node.object == 'text' ? arr.concat(node.characters.toArray()) : arr.concat(node.getCharactersAsArray());
      }, []);
    }

    /**
     * Get a list of the characters in a `range`.
     *
     * @param {Range} range
     * @return {List<Character>}
     */

  }, {
    key: 'getCharactersAtRange',
    value: function getCharactersAtRange(range) {
      var array = this.getCharactersAtRangeAsArray(range);
      return new _immutable.List(array);
    }

    /**
     * Get a list of the characters in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getCharactersAtRangeAsArray',
    value: function getCharactersAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      return this.getTextsAtRange(range).reduce(function (arr, text) {
        var chars = text.characters.filter(function (char, i) {
          return (0, _isIndexInRange2.default)(i, text, range);
        }).toArray();

        return arr.concat(chars);
      }, []);
    }

    /**
     * Get a child node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getChild',
    value: function getChild(key) {
      key = assertKey(key);
      return this.nodes.find(function (node) {
        return node.key == key;
      });
    }

    /**
     * Get closest parent of node by `key` that matches `iterator`.
     *
     * @param {String} key
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'getClosest',
    value: function getClosest(key, iterator) {
      key = assertKey(key);
      var ancestors = this.getAncestors(key);
      if (!ancestors) {
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      // Exclude this node itself.
      return ancestors.rest().findLast(iterator);
    }

    /**
     * Get the closest block parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestBlock',
    value: function getClosestBlock(key) {
      return this.getClosest(key, function (parent) {
        return parent.object == 'block';
      });
    }

    /**
     * Get the closest inline parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestInline',
    value: function getClosestInline(key) {
      return this.getClosest(key, function (parent) {
        return parent.object == 'inline';
      });
    }

    /**
     * Get the closest void parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestVoid',
    value: function getClosestVoid(key) {
      return this.getClosest(key, function (parent) {
        return parent.isVoid;
      });
    }

    /**
     * Get the common ancestor of nodes `one` and `two` by keys.
     *
     * @param {String} one
     * @param {String} two
     * @return {Node}
     */

  }, {
    key: 'getCommonAncestor',
    value: function getCommonAncestor(one, two) {
      one = assertKey(one);
      two = assertKey(two);

      if (one == this.key) return this;
      if (two == this.key) return this;

      this.assertDescendant(one);
      this.assertDescendant(two);
      var ancestors = new _immutable.List();
      var oneParent = this.getParent(one);
      var twoParent = this.getParent(two);

      while (oneParent) {
        ancestors = ancestors.push(oneParent);
        oneParent = this.getParent(oneParent.key);
      }

      while (twoParent) {
        if (ancestors.includes(twoParent)) return twoParent;
        twoParent = this.getParent(twoParent.key);
      }
    }

    /**
     * Get the decorations for the node from a `stack`.
     *
     * @param {Stack} stack
     * @return {List}
     */

  }, {
    key: 'getDecorations',
    value: function getDecorations(stack) {
      var decorations = stack.find('decorateNode', this);
      var list = _range7.default.createList(decorations || []);
      return list;
    }

    /**
     * Get the depth of a child node by `key`, with optional `startAt`.
     *
     * @param {String} key
     * @param {Number} startAt (optional)
     * @return {Number} depth
     */

  }, {
    key: 'getDepth',
    value: function getDepth(key) {
      var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      this.assertDescendant(key);
      if (this.hasChild(key)) return startAt;
      return this.getFurthestAncestor(key).getDepth(key, startAt + 1);
    }

    /**
     * Get a descendant node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getDescendant',
    value: function getDescendant(key) {
      key = assertKey(key);
      var descendantFound = null;

      var found = this.nodes.find(function (node) {
        if (node.key === key) {
          return node;
        } else if (node.object !== 'text') {
          descendantFound = node.getDescendant(key);
          return descendantFound;
        } else {
          return false;
        }
      });

      return descendantFound || found;
    }

    /**
     * Get a descendant by `path`.
     *
     * @param {Array} path
     * @return {Node|Null}
     */

  }, {
    key: 'getDescendantAtPath',
    value: function getDescendantAtPath(path) {
      var descendant = this;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var index = _step.value;

          if (!descendant) return;
          if (!descendant.nodes) return;
          descendant = descendant.nodes.get(index);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return descendant;
    }

    /**
     * Get the first child text node.
     *
     * @return {Node|Null}
     */

  }, {
    key: 'getFirstText',
    value: function getFirstText() {
      var descendantFound = null;

      var found = this.nodes.find(function (node) {
        if (node.object == 'text') return true;
        descendantFound = node.getFirstText();
        return descendantFound;
      });

      return descendantFound || found;
    }

    /**
     * Get a fragment of the node at a `range`.
     *
     * @param {Range} range
     * @return {Document}
     */

  }, {
    key: 'getFragmentAtRange',
    value: function getFragmentAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return _document2.default.create();

      var node = this;

      // Make sure the children exist.
      var _range2 = range,
          startKey = _range2.startKey,
          startOffset = _range2.startOffset,
          endKey = _range2.endKey,
          endOffset = _range2.endOffset;

      var startText = node.assertDescendant(startKey);
      var endText = node.assertDescendant(endKey);

      // Split at the start and end.
      var child = startText;
      var previous = void 0;
      var parent = void 0;

      while (parent = node.getParent(child.key)) {
        var index = parent.nodes.indexOf(child);
        var position = child.object == 'text' ? startOffset : child.nodes.indexOf(previous);

        parent = parent.splitNode(index, position);
        node = node.updateNode(parent);
        previous = parent.nodes.get(index + 1);
        child = parent;
      }

      child = startKey == endKey ? node.getNextText(startKey) : endText;

      while (parent = node.getParent(child.key)) {
        var _index = parent.nodes.indexOf(child);
        var _position = child.object == 'text' ? startKey == endKey ? endOffset - startOffset : endOffset : child.nodes.indexOf(previous);

        parent = parent.splitNode(_index, _position);
        node = node.updateNode(parent);
        previous = parent.nodes.get(_index + 1);
        child = parent;
      }

      // Get the start and end nodes.
      var startNode = node.getNextSibling(node.getFurthestAncestor(startKey).key);
      var endNode = startKey == endKey ? node.getNextSibling(node.getNextSibling(node.getFurthestAncestor(endKey).key).key) : node.getNextSibling(node.getFurthestAncestor(endKey).key);

      // Get children range of nodes from start to end nodes
      var startIndex = node.nodes.indexOf(startNode);
      var endIndex = node.nodes.indexOf(endNode);
      var nodes = node.nodes.slice(startIndex, endIndex);

      // Return a new document fragment.
      return _document2.default.create({ nodes: nodes });
    }

    /**
     * Get the furthest parent of a node by `key` that matches an `iterator`.
     *
     * @param {String} key
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthest',
    value: function getFurthest(key, iterator) {
      var ancestors = this.getAncestors(key);
      if (!ancestors) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      // Exclude this node itself
      return ancestors.rest().find(iterator);
    }

    /**
     * Get the furthest block parent of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestBlock',
    value: function getFurthestBlock(key) {
      return this.getFurthest(key, function (node) {
        return node.object == 'block';
      });
    }

    /**
     * Get the furthest inline parent of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestInline',
    value: function getFurthestInline(key) {
      return this.getFurthest(key, function (node) {
        return node.object == 'inline';
      });
    }

    /**
     * Get the furthest ancestor of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestAncestor',
    value: function getFurthestAncestor(key) {
      key = assertKey(key);
      return this.nodes.find(function (node) {
        if (node.key == key) return true;
        if (node.object == 'text') return false;
        return node.hasDescendant(key);
      });
    }

    /**
     * Get the furthest ancestor of a node by `key` that has only one child.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestOnlyChildAncestor',
    value: function getFurthestOnlyChildAncestor(key) {
      var ancestors = this.getAncestors(key);

      if (!ancestors) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      return ancestors
      // Skip this node...
      .skipLast()
      // Take parents until there are more than one child...
      .reverse().takeUntil(function (p) {
        return p.nodes.size > 1;
      })
      // And pick the highest.
      .last();
    }

    /**
     * Get the closest inline nodes for each text node in the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getInlines',
    value: function getInlines() {
      var array = this.getInlinesAsArray();
      return new _immutable.List(array);
    }

    /**
     * Get the closest inline nodes for each text node in the node, as an array.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesAsArray',
    value: function getInlinesAsArray() {
      var array = [];

      this.nodes.forEach(function (child) {
        if (child.object == 'text') return;
        if (child.isLeafInline()) {
          array.push(child);
        } else {
          array = array.concat(child.getInlinesAsArray());
        }
      });

      return array;
    }

    /**
     * Get the closest inline nodes for each text node in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesAtRange',
    value: function getInlinesAtRange(range) {
      var array = this.getInlinesAtRangeAsArray(range);
      // Remove duplicates by converting it to an `OrderedSet` first.
      return new _immutable.List(new _immutable.OrderedSet(array));
    }

    /**
     * Get the closest inline nodes for each text node in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getInlinesAtRangeAsArray',
    value: function getInlinesAtRangeAsArray(range) {
      var _this = this;

      range = range.normalize(this);
      if (range.isUnset) return [];

      return this.getTextsAtRangeAsArray(range).map(function (text) {
        return _this.getClosestInline(text.key);
      }).filter(function (exists) {
        return exists;
      });
    }

    /**
     * Get all of the leaf inline nodes that match a `type`.
     *
     * @param {String} type
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesByType',
    value: function getInlinesByType(type) {
      var array = this.getInlinesByTypeAsArray(type);
      return new _immutable.List(array);
    }

    /**
     * Get all of the leaf inline nodes that match a `type` as an array.
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getInlinesByTypeAsArray',
    value: function getInlinesByTypeAsArray(type) {
      return this.nodes.reduce(function (inlines, node) {
        if (node.object == 'text') {
          return inlines;
        } else if (node.isLeafInline() && node.type == type) {
          inlines.push(node);
          return inlines;
        } else {
          return inlines.concat(node.getInlinesByTypeAsArray(type));
        }
      }, []);
    }

    /**
     * Return a set of all keys in the node as an array.
     *
     * @return {Array<String>}
     */

  }, {
    key: 'getKeysAsArray',
    value: function getKeysAsArray() {
      var keys = [];

      this.forEachDescendant(function (desc) {
        keys.push(desc.key);
      });

      return keys;
    }

    /**
     * Return a set of all keys in the node.
     *
     * @return {Set<String>}
     */

  }, {
    key: 'getKeys',
    value: function getKeys() {
      var keys = this.getKeysAsArray();
      return new _immutable.Set(keys);
    }

    /**
     * Get the last child text node.
     *
     * @return {Node|Null}
     */

  }, {
    key: 'getLastText',
    value: function getLastText() {
      var descendantFound = null;

      var found = this.nodes.findLast(function (node) {
        if (node.object == 'text') return true;
        descendantFound = node.getLastText();
        return descendantFound;
      });

      return descendantFound || found;
    }

    /**
     * Get all of the marks for all of the characters of every text node.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarks',
    value: function getMarks() {
      var array = this.getMarksAsArray();
      return new _immutable.Set(array);
    }

    /**
     * Get all of the marks for all of the characters of every text node.
     *
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarks',
    value: function getOrderedMarks() {
      var array = this.getMarksAsArray();
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get all of the marks as an array.
     *
     * @return {Array}
     */

  }, {
    key: 'getMarksAsArray',
    value: function getMarksAsArray() {
      return this.nodes.reduce(function (marks, node) {
        return marks.concat(node.getMarksAsArray());
      }, []);
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksAtRange',
    value: function getMarksAtRange(range) {
      var array = this.getMarksAtRangeAsArray(range);
      return new _immutable.Set(array);
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getInsertMarksAtRange',
    value: function getInsertMarksAtRange(range) {
      var array = this.getInsertMarksAtRangeAsArray(range);
      return new _immutable.Set(array);
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarksAtRange',
    value: function getOrderedMarksAtRange(range) {
      var array = this.getMarksAtRangeAsArray(range);
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get a set of the active marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getActiveMarksAtRange',
    value: function getActiveMarksAtRange(range) {
      var array = this.getActiveMarksAtRangeAsArray(range);
      return new _immutable.Set(array);
    }

    /**
     * Get a set of the marks in a `range`, by unioning.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getMarksAtRangeAsArray',
    value: function getMarksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];
      if (range.isCollapsed) return this.getMarksAtCollaspsedRangeAsArray(range);

      return this.getCharactersAtRange(range).reduce(function (memo, char) {
        char.marks.toArray().forEach(function (c) {
          return memo.push(c);
        });
        return memo;
      }, []);
    }

    /**
     * Get a set of the marks in a `range` for insertion behavior.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getInsertMarksAtRangeAsArray',
    value: function getInsertMarksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];
      if (range.isCollapsed) return this.getMarksAtCollaspsedRangeAsArray(range);

      var text = this.getDescendant(range.startKey);
      var char = text.characters.get(range.startOffset);
      return char.marks.toArray();
    }

    /**
     * Get a set of marks in a `range`, by treating it as collapsed.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getMarksAtCollaspsedRangeAsArray',
    value: function getMarksAtCollaspsedRangeAsArray(range) {
      if (range.isUnset) return [];

      var startKey = range.startKey,
          startOffset = range.startOffset;


      if (startOffset == 0) {
        var previous = this.getPreviousText(startKey);
        if (!previous || previous.text.length == 0) return [];
        var _char = previous.characters.get(previous.text.length - 1);
        return _char.marks.toArray();
      }

      var text = this.getDescendant(startKey);
      var char = text.characters.get(startOffset - 1);
      return char.marks.toArray();
    }

    /**
     * Get a set of marks in a `range`, by intersecting.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getActiveMarksAtRangeAsArray',
    value: function getActiveMarksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];
      if (range.isCollapsed) return this.getMarksAtCollaspsedRangeAsArray(range);

      // Otherwise, get a set of the marks for each character in the range.
      var chars = this.getCharactersAtRange(range);
      var first = chars.first();
      if (!first) return [];

      var memo = first.marks;

      chars.slice(1).forEach(function (char) {
        memo = memo.intersect(char.marks);
        return memo.size != 0;
      });

      return memo.toArray();
    }

    /**
     * Get all of the marks that match a `type`.
     *
     * @param {String} type
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksByType',
    value: function getMarksByType(type) {
      var array = this.getMarksByTypeAsArray(type);
      return new _immutable.Set(array);
    }

    /**
     * Get all of the marks that match a `type`.
     *
     * @param {String} type
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarksByType',
    value: function getOrderedMarksByType(type) {
      var array = this.getMarksByTypeAsArray(type);
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get all of the marks that match a `type` as an array.
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getMarksByTypeAsArray',
    value: function getMarksByTypeAsArray(type) {
      return this.nodes.reduce(function (array, node) {
        return node.object == 'text' ? array.concat(node.getMarksAsArray().filter(function (m) {
          return m.type == type;
        })) : array.concat(node.getMarksByTypeAsArray(type));
      }, []);
    }

    /**
     * Get the block node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextBlock',
    value: function getNextBlock(key) {
      var child = this.assertDescendant(key);
      var last = void 0;

      if (child.object == 'block') {
        last = child.getLastText();
      } else {
        var block = this.getClosestBlock(key);
        last = block.getLastText();
      }

      var next = this.getNextText(last.key);
      if (!next) return null;

      return this.getClosestBlock(next.key);
    }

    /**
     * Get the node after a descendant by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextSibling',
    value: function getNextSibling(key) {
      key = assertKey(key);

      var parent = this.getParent(key);
      var after = parent.nodes.skipUntil(function (child) {
        return child.key == key;
      });

      if (after.size == 0) {
        throw new Error('Could not find a child node with key "' + key + '".');
      }
      return after.get(1);
    }

    /**
     * Get the text node after a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextText',
    value: function getNextText(key) {
      key = assertKey(key);
      return this.getTexts().skipUntil(function (text) {
        return text.key == key;
      }).get(1);
    }

    /**
     * Get a node in the tree by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNode',
    value: function getNode(key) {
      key = assertKey(key);
      return this.key == key ? this : this.getDescendant(key);
    }

    /**
     * Get a node in the tree by `path`.
     *
     * @param {Array} path
     * @return {Node|Null}
     */

  }, {
    key: 'getNodeAtPath',
    value: function getNodeAtPath(path) {
      return path.length ? this.getDescendantAtPath(path) : this;
    }

    /**
     * Get the offset for a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Number}
     */

  }, {
    key: 'getOffset',
    value: function getOffset(key) {
      this.assertDescendant(key);

      // Calculate the offset of the nodes before the highest child.
      var child = this.getFurthestAncestor(key);
      var offset = this.nodes.takeUntil(function (n) {
        return n == child;
      }).reduce(function (memo, n) {
        return memo + n.text.length;
      }, 0);

      // Recurse if need be.
      return this.hasChild(key) ? offset : offset + child.getOffset(key);
    }

    /**
     * Get the offset from a `range`.
     *
     * @param {Range} range
     * @return {Number}
     */

  }, {
    key: 'getOffsetAtRange',
    value: function getOffsetAtRange(range) {
      range = range.normalize(this);

      if (range.isUnset) {
        throw new Error('The range cannot be unset to calculcate its offset.');
      }

      if (range.isExpanded) {
        throw new Error('The range must be collapsed to calculcate its offset.');
      }

      var _range3 = range,
          startKey = _range3.startKey,
          startOffset = _range3.startOffset;

      return this.getOffset(startKey) + startOffset;
    }

    /**
     * Get the parent of a child node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getParent',
    value: function getParent(key) {
      if (this.hasChild(key)) return this;

      var node = null;

      this.nodes.find(function (child) {
        if (child.object == 'text') {
          return false;
        } else {
          node = child.getParent(key);
          return node;
        }
      });

      return node;
    }

    /**
     * Get the path of a descendant node by `key`.
     *
     * @param {String|Node} key
     * @return {Array}
     */

  }, {
    key: 'getPath',
    value: function getPath(key) {
      var child = this.assertNode(key);
      var ancestors = this.getAncestors(key);
      var path = [];

      ancestors.reverse().forEach(function (ancestor) {
        var index = ancestor.nodes.indexOf(child);
        path.unshift(index);
        child = ancestor;
      });

      return path;
    }

    /**
     * Get the placeholder for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Component|Void}
     */

  }, {
    key: 'getPlaceholder',
    value: function getPlaceholder(schema) {
      return schema.__getPlaceholder(this);
    }

    /**
     * Get the block node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousBlock',
    value: function getPreviousBlock(key) {
      var child = this.assertDescendant(key);
      var first = void 0;

      if (child.object == 'block') {
        first = child.getFirstText();
      } else {
        var block = this.getClosestBlock(key);
        first = block.getFirstText();
      }

      var previous = this.getPreviousText(first.key);
      if (!previous) return null;

      return this.getClosestBlock(previous.key);
    }

    /**
     * Get the node before a descendant node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousSibling',
    value: function getPreviousSibling(key) {
      key = assertKey(key);
      var parent = this.getParent(key);
      var before = parent.nodes.takeUntil(function (child) {
        return child.key == key;
      });

      if (before.size == parent.nodes.size) {
        throw new Error('Could not find a child node with key "' + key + '".');
      }

      return before.last();
    }

    /**
     * Get the text node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousText',
    value: function getPreviousText(key) {
      key = assertKey(key);
      return this.getTexts().takeUntil(function (text) {
        return text.key == key;
      }).last();
    }

    /**
     * Get the indexes of the selection for a `range`, given an extra flag for
     * whether the node `isSelected`, to determine whether not finding matches
     * means everything is selected or nothing is.
     *
     * @param {Range} range
     * @param {Boolean} isSelected
     * @return {Object|Null}
     */

  }, {
    key: 'getSelectionIndexes',
    value: function getSelectionIndexes(range) {
      var isSelected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var startKey = range.startKey,
          endKey = range.endKey;

      // PERF: if we're not selected, or the range is blurred, we can exit early.

      if (!isSelected || range.isBlurred) {
        return null;
      }

      // if we've been given an invalid selection we can exit early.
      if (range.isUnset) {
        return null;
      }

      // PERF: if the start and end keys are the same, just check for the child
      // that contains that single key.
      if (startKey == endKey) {
        var child = this.getFurthestAncestor(startKey);
        var index = child ? this.nodes.indexOf(child) : null;
        return { start: index, end: index + 1 };
      }

      // Otherwise, check all of the children...
      var start = null;
      var end = null;

      this.nodes.forEach(function (child, i) {
        if (child.object == 'text') {
          if (start == null && child.key == startKey) start = i;
          if (end == null && child.key == endKey) end = i + 1;
        } else {
          if (start == null && child.hasDescendant(startKey)) start = i;
          if (end == null && child.hasDescendant(endKey)) end = i + 1;
        }

        // PERF: exit early if both start and end have been found.
        return start == null || end == null;
      });

      if (isSelected && start == null) start = 0;
      if (isSelected && end == null) end = this.nodes.size;
      return start == null ? null : { start: start, end: end };
    }

    /**
     * Get the concatenated text string of all child nodes.
     *
     * @return {String}
     */

  }, {
    key: 'getText',
    value: function getText() {
      return this.nodes.reduce(function (string, node) {
        return string + node.text;
      }, '');
    }

    /**
     * Get the descendent text node at an `offset`.
     *
     * @param {String} offset
     * @return {Node|Null}
     */

  }, {
    key: 'getTextAtOffset',
    value: function getTextAtOffset(offset) {
      // PERF: Add a few shortcuts for the obvious cases.
      if (offset == 0) return this.getFirstText();
      if (offset == this.text.length) return this.getLastText();
      if (offset < 0 || offset > this.text.length) return null;

      var length = 0;

      return this.getTexts().find(function (node, i, nodes) {
        length += node.text.length;
        return length > offset;
      });
    }

    /**
     * Get the direction of the node's text.
     *
     * @return {String}
     */

  }, {
    key: 'getTextDirection',
    value: function getTextDirection() {
      var dir = (0, _direction2.default)(this.text);
      return dir == 'neutral' ? undefined : dir;
    }

    /**
     * Recursively get all of the child text nodes in order of appearance.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getTexts',
    value: function getTexts() {
      var array = this.getTextsAsArray();
      return new _immutable.List(array);
    }

    /**
     * Recursively get all the leaf text nodes in order of appearance, as array.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getTextsAsArray',
    value: function getTextsAsArray() {
      var array = [];

      this.nodes.forEach(function (node) {
        if (node.object == 'text') {
          array.push(node);
        } else {
          array = array.concat(node.getTextsAsArray());
        }
      });

      return array;
    }

    /**
     * Get all of the text nodes in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getTextsAtRange',
    value: function getTextsAtRange(range) {
      var array = this.getTextsAtRangeAsArray(range);
      return new _immutable.List(array);
    }

    /**
     * Get all of the text nodes in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getTextsAtRangeAsArray',
    value: function getTextsAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      var _range4 = range,
          startKey = _range4.startKey,
          endKey = _range4.endKey;

      var startText = this.getDescendant(startKey);

      // PERF: the most common case is when the range is in a single text node,
      // where we can avoid a lot of iterating of the tree.
      if (startKey == endKey) return [startText];

      var endText = this.getDescendant(endKey);
      var texts = this.getTextsAsArray();
      var start = texts.indexOf(startText);
      var end = texts.indexOf(endText);
      return texts.slice(start, end + 1);
    }

    /**
     * Check if a child node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasChild',
    value: function hasChild(key) {
      return !!this.getChild(key);
    }

    /**
     * Recursively check if a child node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasDescendant',
    value: function hasDescendant(key) {
      return !!this.getDescendant(key);
    }

    /**
     * Recursively check if a node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasNode',
    value: function hasNode(key) {
      return !!this.getNode(key);
    }

    /**
     * Check if a node has a void parent by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasVoidParent',
    value: function hasVoidParent(key) {
      return !!this.getClosest(key, function (parent) {
        return parent.isVoid;
      });
    }

    /**
     * Insert a `node` at `index`.
     *
     * @param {Number} index
     * @param {Node} node
     * @return {Node}
     */

  }, {
    key: 'insertNode',
    value: function insertNode(index, node) {
      var keys = this.getKeys();

      if (keys.contains(node.key)) {
        node = node.regenerateKey();
      }

      if (node.object != 'text') {
        node = node.mapDescendants(function (desc) {
          return keys.contains(desc.key) ? desc.regenerateKey() : desc;
        });
      }

      var nodes = this.nodes.insert(index, node);
      return this.set('nodes', nodes);
    }

    /**
     * Check whether the node is in a `range`.
     *
     * @param {Range} range
     * @return {Boolean}
     */

  }, {
    key: 'isInRange',
    value: function isInRange(range) {
      range = range.normalize(this);

      var node = this;
      var _range5 = range,
          startKey = _range5.startKey,
          endKey = _range5.endKey,
          isCollapsed = _range5.isCollapsed;

      // PERF: solve the most common cast where the start or end key are inside
      // the node, for collapsed selections.

      if (node.key == startKey || node.key == endKey || node.hasDescendant(startKey) || node.hasDescendant(endKey)) {
        return true;
      }

      // PERF: if the selection is collapsed and the previous check didn't return
      // true, then it must be false.
      if (isCollapsed) {
        return false;
      }

      // Otherwise, look through all of the leaf text nodes in the range, to see
      // if any of them are inside the node.
      var texts = node.getTextsAtRange(range);
      var memo = false;

      texts.forEach(function (text) {
        if (node.hasDescendant(text.key)) memo = true;
        return memo;
      });

      return memo;
    }

    /**
     * Check whether the node is a leaf block.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isLeafBlock',
    value: function isLeafBlock() {
      return this.object == 'block' && this.nodes.every(function (n) {
        return n.object != 'block';
      });
    }

    /**
     * Check whether the node is a leaf inline.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isLeafInline',
    value: function isLeafInline() {
      return this.object == 'inline' && this.nodes.every(function (n) {
        return n.object != 'inline';
      });
    }

    /**
     * Merge a children node `first` with another children node `second`.
     * `first` and `second` will be concatenated in that order.
     * `first` and `second` must be two Nodes or two Text.
     *
     * @param {Node} first
     * @param {Node} second
     * @return {Node}
     */

  }, {
    key: 'mergeNode',
    value: function mergeNode(withIndex, index) {
      var node = this;
      var one = node.nodes.get(withIndex);
      var two = node.nodes.get(index);

      if (one.object != two.object) {
        throw new Error('Tried to merge two nodes of different objects: "' + one.object + '" and "' + two.object + '".');
      }

      // If the nodes are text nodes, concatenate their characters together.
      if (one.object == 'text') {
        var characters = one.characters.concat(two.characters);
        one = one.set('characters', characters);
      }

      // Otherwise, concatenate their child nodes together.
      else {
          var nodes = one.nodes.concat(two.nodes);
          one = one.set('nodes', nodes);
        }

      node = node.removeNode(index);
      node = node.removeNode(withIndex);
      node = node.insertNode(withIndex, one);
      return node;
    }

    /**
     * Map all child nodes, updating them in their parents. This method is
     * optimized to not return a new node if no changes are made.
     *
     * @param {Function} iterator
     * @return {Node}
     */

  }, {
    key: 'mapChildren',
    value: function mapChildren(iterator) {
      var _this2 = this;

      var nodes = this.nodes;


      nodes.forEach(function (node, i) {
        var ret = iterator(node, i, _this2.nodes);
        if (ret != node) nodes = nodes.set(ret.key, ret);
      });

      return this.set('nodes', nodes);
    }

    /**
     * Map all descendant nodes, updating them in their parents. This method is
     * optimized to not return a new node if no changes are made.
     *
     * @param {Function} iterator
     * @return {Node}
     */

  }, {
    key: 'mapDescendants',
    value: function mapDescendants(iterator) {
      var _this3 = this;

      var nodes = this.nodes;


      nodes.forEach(function (node, i) {
        var ret = node;
        if (ret.object != 'text') ret = ret.mapDescendants(iterator);
        ret = iterator(ret, i, _this3.nodes);
        if (ret == node) return;

        var index = nodes.indexOf(node);
        nodes = nodes.set(index, ret);
      });

      return this.set('nodes', nodes);
    }

    /**
     * Regenerate the node's key.
     *
     * @return {Node}
     */

  }, {
    key: 'regenerateKey',
    value: function regenerateKey() {
      var key = (0, _generateKey2.default)();
      return this.set('key', key);
    }

    /**
     * Remove a `node` from the children node map.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'removeDescendant',
    value: function removeDescendant(key) {
      key = assertKey(key);

      var node = this;
      var parent = node.getParent(key);
      if (!parent) throw new Error('Could not find a descendant node with key "' + key + '".');

      var index = parent.nodes.findIndex(function (n) {
        return n.key === key;
      });
      var nodes = parent.nodes.splice(index, 1);

      parent = parent.set('nodes', nodes);
      node = node.updateNode(parent);
      return node;
    }

    /**
     * Remove a node at `index`.
     *
     * @param {Number} index
     * @return {Node}
     */

  }, {
    key: 'removeNode',
    value: function removeNode(index) {
      var nodes = this.nodes.splice(index, 1);
      return this.set('nodes', nodes);
    }

    /**
     * Split a child node by `index` at `position`.
     *
     * @param {Number} index
     * @param {Number} position
     * @return {Node}
     */

  }, {
    key: 'splitNode',
    value: function splitNode(index, position) {
      var node = this;
      var child = node.nodes.get(index);
      var one = void 0;
      var two = void 0;

      // If the child is a text node, the `position` refers to the text offset at
      // which to split it.
      if (child.object == 'text') {
        var befores = child.characters.take(position);
        var afters = child.characters.skip(position);
        one = child.set('characters', befores);
        two = child.set('characters', afters).regenerateKey();
      }

      // Otherwise, if the child is not a text node, the `position` refers to the
      // index at which to split its children.
      else {
          var _befores = child.nodes.take(position);
          var _afters = child.nodes.skip(position);
          one = child.set('nodes', _befores);
          two = child.set('nodes', _afters).regenerateKey();
        }

      // Remove the old node and insert the newly split children.
      node = node.removeNode(index);
      node = node.insertNode(index, two);
      node = node.insertNode(index, one);
      return node;
    }

    /**
     * Set a new value for a child node by `key`.
     *
     * @param {Node} node
     * @return {Node}
     */

  }, {
    key: 'updateNode',
    value: function updateNode(node) {
      if (node.key == this.key) {
        return node;
      }

      var child = this.assertDescendant(node.key);
      var ancestors = this.getAncestors(node.key);

      ancestors.reverse().forEach(function (parent) {
        var _parent = parent,
            nodes = _parent.nodes;

        var index = nodes.indexOf(child);
        child = parent;
        nodes = nodes.set(index, node);
        parent = parent.set('nodes', nodes);
        node = parent;
      });

      return node;
    }

    /**
     * Validate the node against a `schema`.
     *
     * @param {Schema} schema
     * @return {Function|Null}
     */

  }, {
    key: 'validate',
    value: function validate(schema) {
      return schema.validateNode(this);
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Node` with `attrs`.
     *
     * @param {Object|Node} attrs
     * @return {Node}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Node.isNode(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var object = attrs.object;


        if (!object && attrs.kind) {
          _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
          object = attrs.kind;
        }

        switch (object) {
          case 'block':
            return _block2.default.create(attrs);
          case 'document':
            return _document2.default.create(attrs);
          case 'inline':
            return _inline2.default.create(attrs);
          case 'text':
            return _text2.default.create(attrs);
          default:
            {
              throw new Error('`Node.create` requires a `object` string.');
            }
        }
      }

      throw new Error('`Node.create` only accepts objects or nodes but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Nodes` from an array.
     *
     * @param {Array<Object|Node>} elements
     * @return {List<Node>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Node.create));
        return list;
      }

      throw new Error('`Node.createList` only accepts lists or arrays, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable node properties from `attrs`.
     *
     * @param {Object|String|Node} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (_block2.default.isBlock(attrs) || _inline2.default.isInline(attrs)) {
        return {
          data: attrs.data,
          isVoid: attrs.isVoid,
          type: attrs.type
        };
      }

      if (typeof attrs == 'string') {
        return { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var props = {};
        if ('type' in attrs) props.type = attrs.type;
        if ('data' in attrs) props.data = _data2.default.create(attrs.data);
        if ('isVoid' in attrs) props.isVoid = attrs.isVoid;
        return props;
      }

      throw new Error('`Node.createProperties` only accepts objects, strings, blocks or inlines, but you passed it: ' + attrs);
    }

    /**
     * Create a `Node` from a JSON `value`.
     *
     * @param {Object} value
     * @return {Node}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(value) {
      var object = value.object;


      if (!object && value.kind) {
        _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
        object = value.kind;
      }

      switch (object) {
        case 'block':
          return _block2.default.fromJSON(value);
        case 'document':
          return _document2.default.fromJSON(value);
        case 'inline':
          return _inline2.default.fromJSON(value);
        case 'text':
          return _text2.default.fromJSON(value);
        default:
          {
            throw new Error('`Node.fromJSON` requires an `object` of either \'block\', \'document\', \'inline\' or \'text\', but you passed: ' + value);
          }
      }
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isNode',


    /**
     * Check if `any` is a `Node`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isNode(any) {
      return _block2.default.isBlock(any) || _document2.default.isDocument(any) || _inline2.default.isInline(any) || _text2.default.isText(any);
    }

    /**
     * Check if `any` is a list of nodes.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isNodeList',
    value: function isNodeList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Node.isNode(item);
      });
    }
  }]);

  return Node;
}();

/**
 * Assert a key `arg`.
 *
 * @param {String} arg
 * @return {String}
 */

Node.fromJS = Node.fromJSON;
function assertKey(arg) {
  if (typeof arg == 'string') return arg;
  throw new Error('Invalid `key` argument! It must be a key string, but you passed: ' + arg);
}

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Node.prototype, ['getBlocks', 'getBlocksAsArray', 'getCharacters', 'getCharactersAsArray', 'getFirstText', 'getInlines', 'getInlinesAsArray', 'getKeys', 'getKeysAsArray', 'getLastText', 'getMarks', 'getOrderedMarks', 'getMarksAsArray', 'getText', 'getTextDirection', 'getTexts', 'getTextsAsArray', 'isLeafBlock', 'isLeafInline'], {
  takesArguments: false
});

(0, _memoize2.default)(Node.prototype, ['areDescendantsSorted', 'getActiveMarksAtRange', 'getActiveMarksAtRangeAsArray', 'getAncestors', 'getBlocksAtRange', 'getBlocksAtRangeAsArray', 'getBlocksByType', 'getBlocksByTypeAsArray', 'getCharactersAtRange', 'getCharactersAtRangeAsArray', 'getChild', 'getClosestBlock', 'getClosestInline', 'getClosestVoid', 'getCommonAncestor', 'getDecorations', 'getDepth', 'getDescendant', 'getDescendantAtPath', 'getFragmentAtRange', 'getFurthestBlock', 'getFurthestInline', 'getFurthestAncestor', 'getFurthestOnlyChildAncestor', 'getInlinesAtRange', 'getInlinesAtRangeAsArray', 'getInlinesByType', 'getInlinesByTypeAsArray', 'getMarksAtRange', 'getInsertMarksAtRange', 'getOrderedMarksAtRange', 'getMarksAtRangeAsArray', 'getInsertMarksAtRangeAsArray', 'getMarksByType', 'getOrderedMarksByType', 'getMarksByTypeAsArray', 'getNextBlock', 'getNextSibling', 'getNextText', 'getNode', 'getNodeAtPath', 'getOffset', 'getOffsetAtRange', 'getParent', 'getPath', 'getPlaceholder', 'getPreviousBlock', 'getPreviousSibling', 'getPreviousText', 'getTextAtOffset', 'getTextsAtRange', 'getTextsAtRangeAsArray', 'hasChild', 'hasDescendant', 'hasNode', 'hasVoidParent', 'validate'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvbm9kZS5qcyJdLCJuYW1lcyI6WyJOb2RlIiwiZmlyc3QiLCJzZWNvbmQiLCJhc3NlcnRLZXkiLCJrZXlzIiwiZ2V0S2V5c0FzQXJyYXkiLCJmaXJzdEluZGV4IiwiaW5kZXhPZiIsInNlY29uZEluZGV4Iiwia2V5IiwiY2hpbGQiLCJnZXRDaGlsZCIsIkVycm9yIiwiZGVzY2VuZGFudCIsImdldERlc2NlbmRhbnQiLCJub2RlIiwiZ2V0Tm9kZSIsInBhdGgiLCJnZXREZXNjZW5kYW50QXRQYXRoIiwiaXRlcmF0b3IiLCJtYXRjaGVzIiwiZm9yRWFjaERlc2NlbmRhbnQiLCJpIiwibm9kZXMiLCJwdXNoIiwiZm91bmQiLCJyZXQiLCJmb3JFYWNoIiwib2JqZWN0IiwiaGFzQ2hpbGQiLCJhbmNlc3RvcnMiLCJmaW5kIiwiZ2V0QW5jZXN0b3JzIiwidW5zaGlmdCIsImFycmF5IiwiZ2V0QmxvY2tzQXNBcnJheSIsInJlZHVjZSIsImlzTGVhZkJsb2NrIiwiY29uY2F0IiwicmFuZ2UiLCJnZXRCbG9ja3NBdFJhbmdlQXNBcnJheSIsIm5vcm1hbGl6ZSIsImlzVW5zZXQiLCJzdGFydEtleSIsImVuZEtleSIsInN0YXJ0QmxvY2siLCJnZXRDbG9zZXN0QmxvY2siLCJlbmRCbG9jayIsImJsb2NrcyIsInN0YXJ0IiwiZW5kIiwic2xpY2UiLCJ0eXBlIiwiZ2V0QmxvY2tzQnlUeXBlQXNBcnJheSIsImdldENoYXJhY3RlcnNBc0FycmF5IiwiYXJyIiwiY2hhcmFjdGVycyIsInRvQXJyYXkiLCJnZXRDaGFyYWN0ZXJzQXRSYW5nZUFzQXJyYXkiLCJnZXRUZXh0c0F0UmFuZ2UiLCJ0ZXh0IiwiY2hhcnMiLCJmaWx0ZXIiLCJjaGFyIiwicmVzdCIsImZpbmRMYXN0IiwiZ2V0Q2xvc2VzdCIsInBhcmVudCIsImlzVm9pZCIsIm9uZSIsInR3byIsImFzc2VydERlc2NlbmRhbnQiLCJvbmVQYXJlbnQiLCJnZXRQYXJlbnQiLCJ0d29QYXJlbnQiLCJpbmNsdWRlcyIsInN0YWNrIiwiZGVjb3JhdGlvbnMiLCJsaXN0IiwiY3JlYXRlTGlzdCIsInN0YXJ0QXQiLCJnZXRGdXJ0aGVzdEFuY2VzdG9yIiwiZ2V0RGVwdGgiLCJkZXNjZW5kYW50Rm91bmQiLCJpbmRleCIsImdldCIsImdldEZpcnN0VGV4dCIsImNyZWF0ZSIsInN0YXJ0T2Zmc2V0IiwiZW5kT2Zmc2V0Iiwic3RhcnRUZXh0IiwiZW5kVGV4dCIsInByZXZpb3VzIiwicG9zaXRpb24iLCJzcGxpdE5vZGUiLCJ1cGRhdGVOb2RlIiwiZ2V0TmV4dFRleHQiLCJzdGFydE5vZGUiLCJnZXROZXh0U2libGluZyIsImVuZE5vZGUiLCJzdGFydEluZGV4IiwiZW5kSW5kZXgiLCJnZXRGdXJ0aGVzdCIsImhhc0Rlc2NlbmRhbnQiLCJza2lwTGFzdCIsInJldmVyc2UiLCJ0YWtlVW50aWwiLCJwIiwic2l6ZSIsImxhc3QiLCJnZXRJbmxpbmVzQXNBcnJheSIsImlzTGVhZklubGluZSIsImdldElubGluZXNBdFJhbmdlQXNBcnJheSIsImdldFRleHRzQXRSYW5nZUFzQXJyYXkiLCJtYXAiLCJnZXRDbG9zZXN0SW5saW5lIiwiZXhpc3RzIiwiZ2V0SW5saW5lc0J5VHlwZUFzQXJyYXkiLCJpbmxpbmVzIiwiZGVzYyIsImdldExhc3RUZXh0IiwiZ2V0TWFya3NBc0FycmF5IiwibWFya3MiLCJnZXRNYXJrc0F0UmFuZ2VBc0FycmF5IiwiZ2V0SW5zZXJ0TWFya3NBdFJhbmdlQXNBcnJheSIsImdldEFjdGl2ZU1hcmtzQXRSYW5nZUFzQXJyYXkiLCJpc0NvbGxhcHNlZCIsImdldE1hcmtzQXRDb2xsYXNwc2VkUmFuZ2VBc0FycmF5IiwiZ2V0Q2hhcmFjdGVyc0F0UmFuZ2UiLCJtZW1vIiwiYyIsImdldFByZXZpb3VzVGV4dCIsImxlbmd0aCIsImludGVyc2VjdCIsImdldE1hcmtzQnlUeXBlQXNBcnJheSIsIm0iLCJibG9jayIsIm5leHQiLCJhZnRlciIsInNraXBVbnRpbCIsImdldFRleHRzIiwib2Zmc2V0IiwibiIsImdldE9mZnNldCIsImlzRXhwYW5kZWQiLCJhc3NlcnROb2RlIiwiYW5jZXN0b3IiLCJzY2hlbWEiLCJfX2dldFBsYWNlaG9sZGVyIiwiYmVmb3JlIiwiaXNTZWxlY3RlZCIsImlzQmx1cnJlZCIsInN0cmluZyIsImRpciIsInVuZGVmaW5lZCIsImdldFRleHRzQXNBcnJheSIsInRleHRzIiwiZ2V0S2V5cyIsImNvbnRhaW5zIiwicmVnZW5lcmF0ZUtleSIsIm1hcERlc2NlbmRhbnRzIiwiaW5zZXJ0Iiwic2V0IiwiZXZlcnkiLCJ3aXRoSW5kZXgiLCJyZW1vdmVOb2RlIiwiaW5zZXJ0Tm9kZSIsImZpbmRJbmRleCIsInNwbGljZSIsImJlZm9yZXMiLCJ0YWtlIiwiYWZ0ZXJzIiwic2tpcCIsInZhbGlkYXRlTm9kZSIsImF0dHJzIiwiaXNOb2RlIiwia2luZCIsImRlcHJlY2F0ZSIsImVsZW1lbnRzIiwiaXNMaXN0IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNCbG9jayIsImlzSW5saW5lIiwiZGF0YSIsInByb3BzIiwidmFsdWUiLCJmcm9tSlNPTiIsImFueSIsImlzRG9jdW1lbnQiLCJpc1RleHQiLCJpdGVtIiwiZnJvbUpTIiwiYXJnIiwicHJvdG90eXBlIiwidGFrZXNBcmd1bWVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBOzs7Ozs7Ozs7SUFTTUEsSTs7Ozs7Ozs7O0FBOElKOzs7Ozs7Ozs7eUNBU3FCQyxLLEVBQU9DLE0sRUFBUTtBQUNsQ0QsY0FBUUUsVUFBVUYsS0FBVixDQUFSO0FBQ0FDLGVBQVNDLFVBQVVELE1BQVYsQ0FBVDs7QUFFQSxVQUFNRSxPQUFPLEtBQUtDLGNBQUwsRUFBYjtBQUNBLFVBQU1DLGFBQWFGLEtBQUtHLE9BQUwsQ0FBYU4sS0FBYixDQUFuQjtBQUNBLFVBQU1P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c0IsRUFvRHRCLHdCQXBEc0IsRUFxRHRCLFVBckRzQixFQXNEdEIsZUF0RHNCLEVBdUR0QixTQXZEc0IsRUF3RHRCLGVBeERzQixFQXlEdEIsVUF6RHNCLENBQXhCLEVBMERHO0FBQ0RDLGtCQUFnQjtBQURmLENBMURIOztBQThEQTs7Ozs7O2tCQU1lbk0sSSIsImZpbGUiOiJub2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgZGlyZWN0aW9uIGZyb20gJ2RpcmVjdGlvbidcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IExpc3QsIE9yZGVyZWRTZXQsIFNldCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuaW1wb3J0IEJsb2NrIGZyb20gJy4vYmxvY2snXG5pbXBvcnQgRGF0YSBmcm9tICcuL2RhdGEnXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBJbmxpbmUgZnJvbSAnLi9pbmxpbmUnXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi9yYW5nZSdcbmltcG9ydCBUZXh0IGZyb20gJy4vdGV4dCdcbmltcG9ydCBnZW5lcmF0ZUtleSBmcm9tICcuLi91dGlscy9nZW5lcmF0ZS1rZXknXG5pbXBvcnQgaXNJbmRleEluUmFuZ2UgZnJvbSAnLi4vdXRpbHMvaXMtaW5kZXgtaW4tcmFuZ2UnXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi91dGlscy9tZW1vaXplJ1xuXG4vKipcbiAqIE5vZGUuXG4gKlxuICogQW5kIGludGVyZmFjZSB0aGF0IGBEb2N1bWVudGAsIGBCbG9ja2AgYW5kIGBJbmxpbmVgIGFsbCBpbXBsZW1lbnQsIHRvIG1ha2VcbiAqIHdvcmtpbmcgd2l0aCB0aGUgcmVjdXJzaXZlIG5vZGUgdHJlZSBlYXNpZXIuXG4gKlxuICogQHR5cGUge05vZGV9XG4gKi9cblxuY2xhc3MgTm9kZSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgTm9kZWAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxOb2RlfSBhdHRyc1xuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlKGF0dHJzID0ge30pIHtcbiAgICBpZiAoTm9kZS5pc05vZGUoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gYXR0cnNcbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhdHRycykpIHtcbiAgICAgIGxldCB7IG9iamVjdCB9ID0gYXR0cnNcblxuICAgICAgaWYgKCFvYmplY3QgJiYgYXR0cnMua2luZCkge1xuICAgICAgICBsb2dnZXIuZGVwcmVjYXRlKCdzbGF0ZUAwLjMyLjAnLCAnVGhlIGBraW5kYCBwcm9wZXJ0eSBvZiBTbGF0ZSBvYmplY3RzIGhhcyBiZWVuIHJlbmFtZWQgdG8gYG9iamVjdGAuJylcbiAgICAgICAgb2JqZWN0ID0gYXR0cnMua2luZFxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKG9iamVjdCkge1xuICAgICAgICBjYXNlICdibG9jayc6IHJldHVybiBCbG9jay5jcmVhdGUoYXR0cnMpXG4gICAgICAgIGNhc2UgJ2RvY3VtZW50JzogcmV0dXJuIERvY3VtZW50LmNyZWF0ZShhdHRycylcbiAgICAgICAgY2FzZSAnaW5saW5lJzogcmV0dXJuIElubGluZS5jcmVhdGUoYXR0cnMpXG4gICAgICAgIGNhc2UgJ3RleHQnOiByZXR1cm4gVGV4dC5jcmVhdGUoYXR0cnMpXG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BOb2RlLmNyZWF0ZWAgcmVxdWlyZXMgYSBgb2JqZWN0YCBzdHJpbmcuJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgTm9kZS5jcmVhdGVcXGAgb25seSBhY2NlcHRzIG9iamVjdHMgb3Igbm9kZXMgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaXN0IG9mIGBOb2Rlc2AgZnJvbSBhbiBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxPYmplY3R8Tm9kZT59IGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGVMaXN0KGVsZW1lbnRzID0gW10pIHtcbiAgICBpZiAoTGlzdC5pc0xpc3QoZWxlbWVudHMpIHx8IEFycmF5LmlzQXJyYXkoZWxlbWVudHMpKSB7XG4gICAgICBjb25zdCBsaXN0ID0gbmV3IExpc3QoZWxlbWVudHMubWFwKE5vZGUuY3JlYXRlKSlcbiAgICAgIHJldHVybiBsaXN0XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBOb2RlLmNyZWF0ZUxpc3RcXGAgb25seSBhY2NlcHRzIGxpc3RzIG9yIGFycmF5cywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7ZWxlbWVudHN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkaWN0aW9uYXJ5IG9mIHNldHRhYmxlIG5vZGUgcHJvcGVydGllcyBmcm9tIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ3xOb2RlfSBhdHRyc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKGF0dHJzID0ge30pIHtcbiAgICBpZiAoQmxvY2suaXNCbG9jayhhdHRycykgfHwgSW5saW5lLmlzSW5saW5lKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogYXR0cnMuZGF0YSxcbiAgICAgICAgaXNWb2lkOiBhdHRycy5pc1ZvaWQsXG4gICAgICAgIHR5cGU6IGF0dHJzLnR5cGUsXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhdHRycyA9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgdHlwZTogYXR0cnMgfVxuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgY29uc3QgcHJvcHMgPSB7fVxuICAgICAgaWYgKCd0eXBlJyBpbiBhdHRycykgcHJvcHMudHlwZSA9IGF0dHJzLnR5cGVcbiAgICAgIGlmICgnZGF0YScgaW4gYXR0cnMpIHByb3BzLmRhdGEgPSBEYXRhLmNyZWF0ZShhdHRycy5kYXRhKVxuICAgICAgaWYgKCdpc1ZvaWQnIGluIGF0dHJzKSBwcm9wcy5pc1ZvaWQgPSBhdHRycy5pc1ZvaWRcbiAgICAgIHJldHVybiBwcm9wc1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgTm9kZS5jcmVhdGVQcm9wZXJ0aWVzXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzLCBzdHJpbmdzLCBibG9ja3Mgb3IgaW5saW5lcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgTm9kZWAgZnJvbSBhIEpTT04gYHZhbHVlYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTih2YWx1ZSkge1xuICAgIGxldCB7IG9iamVjdCB9ID0gdmFsdWVcblxuICAgIGlmICghb2JqZWN0ICYmIHZhbHVlLmtpbmQpIHtcbiAgICAgIGxvZ2dlci5kZXByZWNhdGUoJ3NsYXRlQDAuMzIuMCcsICdUaGUgYGtpbmRgIHByb3BlcnR5IG9mIFNsYXRlIG9iamVjdHMgaGFzIGJlZW4gcmVuYW1lZCB0byBgb2JqZWN0YC4nKVxuICAgICAgb2JqZWN0ID0gdmFsdWUua2luZFxuICAgIH1cblxuICAgIHN3aXRjaCAob2JqZWN0KSB7XG4gICAgICBjYXNlICdibG9jayc6IHJldHVybiBCbG9jay5mcm9tSlNPTih2YWx1ZSlcbiAgICAgIGNhc2UgJ2RvY3VtZW50JzogcmV0dXJuIERvY3VtZW50LmZyb21KU09OKHZhbHVlKVxuICAgICAgY2FzZSAnaW5saW5lJzogcmV0dXJuIElubGluZS5mcm9tSlNPTih2YWx1ZSlcbiAgICAgIGNhc2UgJ3RleHQnOiByZXR1cm4gVGV4dC5mcm9tSlNPTih2YWx1ZSlcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcXGBOb2RlLmZyb21KU09OXFxgIHJlcXVpcmVzIGFuIFxcYG9iamVjdFxcYCBvZiBlaXRoZXIgJ2Jsb2NrJywgJ2RvY3VtZW50JywgJ2lubGluZScgb3IgJ3RleHQnLCBidXQgeW91IHBhc3NlZDogJHt2YWx1ZX1gKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IE5vZGUuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgTm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzTm9kZShhbnkpIHtcbiAgICByZXR1cm4gKFxuICAgICAgQmxvY2suaXNCbG9jayhhbnkpIHx8XG4gICAgICBEb2N1bWVudC5pc0RvY3VtZW50KGFueSkgfHxcbiAgICAgIElubGluZS5pc0lubGluZShhbnkpIHx8XG4gICAgICBUZXh0LmlzVGV4dChhbnkpXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgbGlzdCBvZiBub2Rlcy5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNOb2RlTGlzdChhbnkpIHtcbiAgICByZXR1cm4gTGlzdC5pc0xpc3QoYW55KSAmJiBhbnkuZXZlcnkoaXRlbSA9PiBOb2RlLmlzTm9kZShpdGVtKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnVlIGlmIHRoZSBub2RlIGhhcyBib3RoIGRlc2NlbmRhbnRzIGluIHRoYXQgb3JkZXIsIGZhbHNlIG90aGVyd2lzZS4gVGhlXG4gICAqIG9yZGVyIGlzIGRlcHRoLWZpcnN0LCBwb3N0LW9yZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZmlyc3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlY29uZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBhcmVEZXNjZW5kYW50c1NvcnRlZChmaXJzdCwgc2Vjb25kKSB7XG4gICAgZmlyc3QgPSBhc3NlcnRLZXkoZmlyc3QpXG4gICAgc2Vjb25kID0gYXNzZXJ0S2V5KHNlY29uZClcblxuICAgIGNvbnN0IGtleXMgPSB0aGlzLmdldEtleXNBc0FycmF5KClcbiAgICBjb25zdCBmaXJzdEluZGV4ID0ga2V5cy5pbmRleE9mKGZpcnN0KVxuICAgIGNvbnN0IHNlY29uZEluZGV4ID0ga2V5cy5pbmRleE9mKHNlY29uZClcbiAgICBpZiAoZmlyc3RJbmRleCA9PSAtMSB8fCBzZWNvbmRJbmRleCA9PSAtMSkgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiBmaXJzdEluZGV4IDwgc2Vjb25kSW5kZXhcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIG5vZGUgaGFzIGEgY2hpbGQgYnkgYGtleWAgYW5kIHJldHVybiBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBhc3NlcnRDaGlsZChrZXkpIHtcbiAgICBjb25zdCBjaGlsZCA9IHRoaXMuZ2V0Q2hpbGQoa2V5KVxuXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBjaGlsZCBub2RlIHdpdGgga2V5IFwiJHtrZXl9XCIuYClcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGRcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIG5vZGUgaGFzIGEgZGVzY2VuZGFudCBieSBga2V5YCBhbmQgcmV0dXJuIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIGFzc2VydERlc2NlbmRhbnQoa2V5KSB7XG4gICAgY29uc3QgZGVzY2VuZGFudCA9IHRoaXMuZ2V0RGVzY2VuZGFudChrZXkpXG5cbiAgICBpZiAoIWRlc2NlbmRhbnQpIHtcbiAgICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgZGVzY2VuZGFudCBub2RlIHdpdGgga2V5IFwiJHtrZXl9XCIuYClcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzY2VuZGFudFxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGF0IGEgbm9kZSdzIHRyZWUgaGFzIGEgbm9kZSBieSBga2V5YCBhbmQgcmV0dXJuIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIGFzc2VydE5vZGUoa2V5KSB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0Tm9kZShrZXkpXG5cbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLmApXG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIG5vZGUgZXhpc3RzIGF0IGBwYXRoYCBhbmQgcmV0dXJuIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBwYXRoXG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIGFzc2VydFBhdGgocGF0aCkge1xuICAgIGNvbnN0IGRlc2NlbmRhbnQgPSB0aGlzLmdldERlc2NlbmRhbnRBdFBhdGgocGF0aClcblxuICAgIGlmICghZGVzY2VuZGFudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhIGRlc2NlbmRhbnQgYXQgcGF0aCBcIiR7cGF0aH1cIi5gKVxuICAgIH1cblxuICAgIHJldHVybiBkZXNjZW5kYW50XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgZmlsdGVyIGFsbCBkZXNjZW5kYW50IG5vZGVzIHdpdGggYGl0ZXJhdG9yYC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAgICogQHJldHVybiB7TGlzdDxOb2RlPn1cbiAgICovXG5cbiAgZmlsdGVyRGVzY2VuZGFudHMoaXRlcmF0b3IpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gW11cblxuICAgIHRoaXMuZm9yRWFjaERlc2NlbmRhbnQoKG5vZGUsIGksIG5vZGVzKSA9PiB7XG4gICAgICBpZiAoaXRlcmF0b3Iobm9kZSwgaSwgbm9kZXMpKSBtYXRjaGVzLnB1c2gobm9kZSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIExpc3QobWF0Y2hlcylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBmaW5kIGFsbCBkZXNjZW5kYW50IG5vZGVzIGJ5IGBpdGVyYXRvcmAuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZmluZERlc2NlbmRhbnQoaXRlcmF0b3IpIHtcbiAgICBsZXQgZm91bmQgPSBudWxsXG5cbiAgICB0aGlzLmZvckVhY2hEZXNjZW5kYW50KChub2RlLCBpLCBub2RlcykgPT4ge1xuICAgICAgaWYgKGl0ZXJhdG9yKG5vZGUsIGksIG5vZGVzKSkge1xuICAgICAgICBmb3VuZCA9IG5vZGVcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmb3VuZFxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGl0ZXJhdGUgb3ZlciBhbGwgZGVzY2VuZGFudCBub2RlcyB3aXRoIGBpdGVyYXRvcmAuIElmIHRoZVxuICAgKiBpdGVyYXRvciByZXR1cm5zIGZhbHNlIGl0IHdpbGwgYnJlYWsgdGhlIGxvb3AuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqL1xuXG4gIGZvckVhY2hEZXNjZW5kYW50KGl0ZXJhdG9yKSB7XG4gICAgbGV0IHJldFxuXG4gICAgdGhpcy5ub2Rlcy5mb3JFYWNoKChjaGlsZCwgaSwgbm9kZXMpID0+IHtcbiAgICAgIGlmIChpdGVyYXRvcihjaGlsZCwgaSwgbm9kZXMpID09PSBmYWxzZSkge1xuICAgICAgICByZXQgPSBmYWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgaWYgKGNoaWxkLm9iamVjdCAhPSAndGV4dCcpIHtcbiAgICAgICAgcmV0ID0gY2hpbGQuZm9yRWFjaERlc2NlbmRhbnQoaXRlcmF0b3IpXG4gICAgICAgIHJldHVybiByZXRcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHJldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCBvZiBhbmNlc3RvcnMgb2YgYSBkZXNjZW5kYW50IG5vZGUgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IGtleVxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fE51bGx9XG4gICAqL1xuXG4gIGdldEFuY2VzdG9ycyhrZXkpIHtcbiAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuXG4gICAgaWYgKGtleSA9PSB0aGlzLmtleSkgcmV0dXJuIExpc3QoKVxuICAgIGlmICh0aGlzLmhhc0NoaWxkKGtleSkpIHJldHVybiBMaXN0KFt0aGlzXSlcblxuICAgIGxldCBhbmNlc3RvcnNcbiAgICB0aGlzLm5vZGVzLmZpbmQoKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLm9iamVjdCA9PSAndGV4dCcpIHJldHVybiBmYWxzZVxuICAgICAgYW5jZXN0b3JzID0gbm9kZS5nZXRBbmNlc3RvcnMoa2V5KVxuICAgICAgcmV0dXJuIGFuY2VzdG9yc1xuICAgIH0pXG5cbiAgICBpZiAoYW5jZXN0b3JzKSB7XG4gICAgICByZXR1cm4gYW5jZXN0b3JzLnVuc2hpZnQodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsZWFmIGJsb2NrIGRlc2NlbmRhbnRzIG9mIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRCbG9ja3MoKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldEJsb2Nrc0FzQXJyYXkoKVxuICAgIHJldHVybiBuZXcgTGlzdChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxlYWYgYmxvY2sgZGVzY2VuZGFudHMgb2YgdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGdldEJsb2Nrc0FzQXJyYXkoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMucmVkdWNlKChhcnJheSwgY2hpbGQpID0+IHtcbiAgICAgIGlmIChjaGlsZC5vYmplY3QgIT0gJ2Jsb2NrJykgcmV0dXJuIGFycmF5XG4gICAgICBpZiAoIWNoaWxkLmlzTGVhZkJsb2NrKCkpIHJldHVybiBhcnJheS5jb25jYXQoY2hpbGQuZ2V0QmxvY2tzQXNBcnJheSgpKVxuICAgICAgYXJyYXkucHVzaChjaGlsZClcbiAgICAgIHJldHVybiBhcnJheVxuICAgIH0sIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGVhZiBibG9jayBkZXNjZW5kYW50cyBpbiBhIGByYW5nZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGdldEJsb2Nrc0F0UmFuZ2UocmFuZ2UpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0QmxvY2tzQXRSYW5nZUFzQXJyYXkocmFuZ2UpXG4gICAgLy8gRWxpbWluYXRlIGR1cGxpY2F0ZXMgYnkgY29udmVydGluZyB0byBhbiBgT3JkZXJlZFNldGAgZmlyc3QuXG4gICAgcmV0dXJuIG5ldyBMaXN0KG5ldyBPcmRlcmVkU2V0KGFycmF5KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxlYWYgYmxvY2sgZGVzY2VuZGFudHMgaW4gYSBgcmFuZ2VgIGFzIGFuIGFycmF5XG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRCbG9ja3NBdFJhbmdlQXNBcnJheShyYW5nZSkge1xuICAgIHJhbmdlID0gcmFuZ2Uubm9ybWFsaXplKHRoaXMpXG4gICAgaWYgKHJhbmdlLmlzVW5zZXQpIHJldHVybiBbXVxuXG4gICAgY29uc3QgeyBzdGFydEtleSwgZW5kS2V5IH0gPSByYW5nZVxuICAgIGNvbnN0IHN0YXJ0QmxvY2sgPSB0aGlzLmdldENsb3Nlc3RCbG9jayhzdGFydEtleSlcblxuICAgIC8vIFBFUkY6IHRoZSBtb3N0IGNvbW1vbiBjYXNlIGlzIHdoZW4gdGhlIHJhbmdlIGlzIGluIGEgc2luZ2xlIGJsb2NrIG5vZGUsXG4gICAgLy8gd2hlcmUgd2UgY2FuIGF2b2lkIGEgbG90IG9mIGl0ZXJhdGluZyBvZiB0aGUgdHJlZS5cbiAgICBpZiAoc3RhcnRLZXkgPT0gZW5kS2V5KSByZXR1cm4gW3N0YXJ0QmxvY2tdXG5cbiAgICBjb25zdCBlbmRCbG9jayA9IHRoaXMuZ2V0Q2xvc2VzdEJsb2NrKGVuZEtleSlcbiAgICBjb25zdCBibG9ja3MgPSB0aGlzLmdldEJsb2Nrc0FzQXJyYXkoKVxuICAgIGNvbnN0IHN0YXJ0ID0gYmxvY2tzLmluZGV4T2Yoc3RhcnRCbG9jaylcbiAgICBjb25zdCBlbmQgPSBibG9ja3MuaW5kZXhPZihlbmRCbG9jaylcbiAgICByZXR1cm4gYmxvY2tzLnNsaWNlKHN0YXJ0LCBlbmQgKyAxKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIGxlYWYgYmxvY2tzIHRoYXQgbWF0Y2ggYSBgdHlwZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGdldEJsb2Nrc0J5VHlwZSh0eXBlKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldEJsb2Nrc0J5VHlwZUFzQXJyYXkodHlwZSlcbiAgICByZXR1cm4gbmV3IExpc3QoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbGVhZiBibG9ja3MgdGhhdCBtYXRjaCBhIGB0eXBlYCBhcyBhbiBhcnJheVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0QmxvY2tzQnlUeXBlQXNBcnJheSh0eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMucmVkdWNlKChhcnJheSwgbm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ICE9ICdibG9jaycpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5XG4gICAgICB9IGVsc2UgaWYgKG5vZGUuaXNMZWFmQmxvY2soKSAmJiBub2RlLnR5cGUgPT0gdHlwZSkge1xuICAgICAgICBhcnJheS5wdXNoKG5vZGUpXG4gICAgICAgIHJldHVybiBhcnJheVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFycmF5LmNvbmNhdChub2RlLmdldEJsb2Nrc0J5VHlwZUFzQXJyYXkodHlwZSkpXG4gICAgICB9XG4gICAgfSwgW10pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgY2hhcmFjdGVycyBmb3IgZXZlcnkgdGV4dCBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtMaXN0PENoYXJhY3Rlcj59XG4gICAqL1xuXG4gIGdldENoYXJhY3RlcnMoKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldENoYXJhY3RlcnNBc0FycmF5KClcbiAgICByZXR1cm4gbmV3IExpc3QoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgY2hhcmFjdGVycyBmb3IgZXZlcnkgdGV4dCBub2RlIGFzIGFuIGFycmF5XG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRDaGFyYWN0ZXJzQXNBcnJheSgpIHtcbiAgICByZXR1cm4gdGhpcy5ub2Rlcy5yZWR1Y2UoKGFyciwgbm9kZSkgPT4ge1xuICAgICAgcmV0dXJuIG5vZGUub2JqZWN0ID09ICd0ZXh0J1xuICAgICAgICA/IGFyci5jb25jYXQobm9kZS5jaGFyYWN0ZXJzLnRvQXJyYXkoKSlcbiAgICAgICAgOiBhcnIuY29uY2F0KG5vZGUuZ2V0Q2hhcmFjdGVyc0FzQXJyYXkoKSlcbiAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIHRoZSBjaGFyYWN0ZXJzIGluIGEgYHJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7TGlzdDxDaGFyYWN0ZXI+fVxuICAgKi9cblxuICBnZXRDaGFyYWN0ZXJzQXRSYW5nZShyYW5nZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRDaGFyYWN0ZXJzQXRSYW5nZUFzQXJyYXkocmFuZ2UpXG4gICAgcmV0dXJuIG5ldyBMaXN0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgdGhlIGNoYXJhY3RlcnMgaW4gYSBgcmFuZ2VgIGFzIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0Q2hhcmFjdGVyc0F0UmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIFtdXG5cbiAgICByZXR1cm4gdGhpc1xuICAgICAgLmdldFRleHRzQXRSYW5nZShyYW5nZSlcbiAgICAgIC5yZWR1Y2UoKGFyciwgdGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBjaGFycyA9IHRleHQuY2hhcmFjdGVyc1xuICAgICAgICAgIC5maWx0ZXIoKGNoYXIsIGkpID0+IGlzSW5kZXhJblJhbmdlKGksIHRleHQsIHJhbmdlKSlcbiAgICAgICAgICAudG9BcnJheSgpXG5cbiAgICAgICAgcmV0dXJuIGFyci5jb25jYXQoY2hhcnMpXG4gICAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjaGlsZCBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2hpbGQoa2V5KSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICByZXR1cm4gdGhpcy5ub2Rlcy5maW5kKG5vZGUgPT4gbm9kZS5rZXkgPT0ga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjbG9zZXN0IHBhcmVudCBvZiBub2RlIGJ5IGBrZXlgIHRoYXQgbWF0Y2hlcyBgaXRlcmF0b3JgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2xvc2VzdChrZXksIGl0ZXJhdG9yKSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICBjb25zdCBhbmNlc3RvcnMgPSB0aGlzLmdldEFuY2VzdG9ycyhrZXkpXG4gICAgaWYgKCFhbmNlc3RvcnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBkZXNjZW5kYW50IG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuICAgIH1cblxuICAgIC8vIEV4Y2x1ZGUgdGhpcyBub2RlIGl0c2VsZi5cbiAgICByZXR1cm4gYW5jZXN0b3JzLnJlc3QoKS5maW5kTGFzdChpdGVyYXRvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsb3Nlc3QgYmxvY2sgcGFyZW50IG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2xvc2VzdEJsb2NrKGtleSkge1xuICAgIHJldHVybiB0aGlzLmdldENsb3Nlc3Qoa2V5LCBwYXJlbnQgPT4gcGFyZW50Lm9iamVjdCA9PSAnYmxvY2snKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xvc2VzdCBpbmxpbmUgcGFyZW50IG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2xvc2VzdElubGluZShrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDbG9zZXN0KGtleSwgcGFyZW50ID0+IHBhcmVudC5vYmplY3QgPT0gJ2lubGluZScpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjbG9zZXN0IHZvaWQgcGFyZW50IG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2xvc2VzdFZvaWQoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xvc2VzdChrZXksIHBhcmVudCA9PiBwYXJlbnQuaXNWb2lkKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29tbW9uIGFuY2VzdG9yIG9mIG5vZGVzIGBvbmVgIGFuZCBgdHdvYCBieSBrZXlzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb25lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0d29cbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgZ2V0Q29tbW9uQW5jZXN0b3Iob25lLCB0d28pIHtcbiAgICBvbmUgPSBhc3NlcnRLZXkob25lKVxuICAgIHR3byA9IGFzc2VydEtleSh0d28pXG5cbiAgICBpZiAob25lID09IHRoaXMua2V5KSByZXR1cm4gdGhpc1xuICAgIGlmICh0d28gPT0gdGhpcy5rZXkpIHJldHVybiB0aGlzXG5cbiAgICB0aGlzLmFzc2VydERlc2NlbmRhbnQob25lKVxuICAgIHRoaXMuYXNzZXJ0RGVzY2VuZGFudCh0d28pXG4gICAgbGV0IGFuY2VzdG9ycyA9IG5ldyBMaXN0KClcbiAgICBsZXQgb25lUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQob25lKVxuICAgIGxldCB0d29QYXJlbnQgPSB0aGlzLmdldFBhcmVudCh0d28pXG5cbiAgICB3aGlsZSAob25lUGFyZW50KSB7XG4gICAgICBhbmNlc3RvcnMgPSBhbmNlc3RvcnMucHVzaChvbmVQYXJlbnQpXG4gICAgICBvbmVQYXJlbnQgPSB0aGlzLmdldFBhcmVudChvbmVQYXJlbnQua2V5KVxuICAgIH1cblxuICAgIHdoaWxlICh0d29QYXJlbnQpIHtcbiAgICAgIGlmIChhbmNlc3RvcnMuaW5jbHVkZXModHdvUGFyZW50KSkgcmV0dXJuIHR3b1BhcmVudFxuICAgICAgdHdvUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQodHdvUGFyZW50LmtleSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBkZWNvcmF0aW9ucyBmb3IgdGhlIG5vZGUgZnJvbSBhIGBzdGFja2AuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RhY2t9IHN0YWNrXG4gICAqIEByZXR1cm4ge0xpc3R9XG4gICAqL1xuXG4gIGdldERlY29yYXRpb25zKHN0YWNrKSB7XG4gICAgY29uc3QgZGVjb3JhdGlvbnMgPSBzdGFjay5maW5kKCdkZWNvcmF0ZU5vZGUnLCB0aGlzKVxuICAgIGNvbnN0IGxpc3QgPSBSYW5nZS5jcmVhdGVMaXN0KGRlY29yYXRpb25zIHx8IFtdKVxuICAgIHJldHVybiBsaXN0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBkZXB0aCBvZiBhIGNoaWxkIG5vZGUgYnkgYGtleWAsIHdpdGggb3B0aW9uYWwgYHN0YXJ0QXRgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydEF0IChvcHRpb25hbClcbiAgICogQHJldHVybiB7TnVtYmVyfSBkZXB0aFxuICAgKi9cblxuICBnZXREZXB0aChrZXksIHN0YXJ0QXQgPSAxKSB7XG4gICAgdGhpcy5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgICBpZiAodGhpcy5oYXNDaGlsZChrZXkpKSByZXR1cm4gc3RhcnRBdFxuICAgIHJldHVybiB0aGlzXG4gICAgICAuZ2V0RnVydGhlc3RBbmNlc3RvcihrZXkpXG4gICAgICAuZ2V0RGVwdGgoa2V5LCBzdGFydEF0ICsgMSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBkZXNjZW5kYW50IG5vZGUgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXREZXNjZW5kYW50KGtleSkge1xuICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgbGV0IGRlc2NlbmRhbnRGb3VuZCA9IG51bGxcblxuICAgIGNvbnN0IGZvdW5kID0gdGhpcy5ub2Rlcy5maW5kKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5rZXkgPT09IGtleSkge1xuICAgICAgICByZXR1cm4gbm9kZVxuICAgICAgfSBlbHNlIGlmIChub2RlLm9iamVjdCAhPT0gJ3RleHQnKSB7XG4gICAgICAgIGRlc2NlbmRhbnRGb3VuZCA9IG5vZGUuZ2V0RGVzY2VuZGFudChrZXkpXG4gICAgICAgIHJldHVybiBkZXNjZW5kYW50Rm91bmRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZGVzY2VuZGFudEZvdW5kIHx8IGZvdW5kXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgZGVzY2VuZGFudCBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXREZXNjZW5kYW50QXRQYXRoKHBhdGgpIHtcbiAgICBsZXQgZGVzY2VuZGFudCA9IHRoaXNcblxuICAgIGZvciAoY29uc3QgaW5kZXggb2YgcGF0aCkge1xuICAgICAgaWYgKCFkZXNjZW5kYW50KSByZXR1cm5cbiAgICAgIGlmICghZGVzY2VuZGFudC5ub2RlcykgcmV0dXJuXG4gICAgICBkZXNjZW5kYW50ID0gZGVzY2VuZGFudC5ub2Rlcy5nZXQoaW5kZXgpXG4gICAgfVxuXG4gICAgcmV0dXJuIGRlc2NlbmRhbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZpcnN0IGNoaWxkIHRleHQgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRGaXJzdFRleHQoKSB7XG4gICAgbGV0IGRlc2NlbmRhbnRGb3VuZCA9IG51bGxcblxuICAgIGNvbnN0IGZvdW5kID0gdGhpcy5ub2Rlcy5maW5kKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5vYmplY3QgPT0gJ3RleHQnKSByZXR1cm4gdHJ1ZVxuICAgICAgZGVzY2VuZGFudEZvdW5kID0gbm9kZS5nZXRGaXJzdFRleHQoKVxuICAgICAgcmV0dXJuIGRlc2NlbmRhbnRGb3VuZFxuICAgIH0pXG5cbiAgICByZXR1cm4gZGVzY2VuZGFudEZvdW5kIHx8IGZvdW5kXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgZnJhZ21lbnQgb2YgdGhlIG5vZGUgYXQgYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtEb2N1bWVudH1cbiAgICovXG5cbiAgZ2V0RnJhZ21lbnRBdFJhbmdlKHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIERvY3VtZW50LmNyZWF0ZSgpXG5cbiAgICBsZXQgbm9kZSA9IHRoaXNcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgY2hpbGRyZW4gZXhpc3QuXG4gICAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQsIGVuZEtleSwgZW5kT2Zmc2V0IH0gPSByYW5nZVxuICAgIGNvbnN0IHN0YXJ0VGV4dCA9IG5vZGUuYXNzZXJ0RGVzY2VuZGFudChzdGFydEtleSlcbiAgICBjb25zdCBlbmRUZXh0ID0gbm9kZS5hc3NlcnREZXNjZW5kYW50KGVuZEtleSlcblxuICAgIC8vIFNwbGl0IGF0IHRoZSBzdGFydCBhbmQgZW5kLlxuICAgIGxldCBjaGlsZCA9IHN0YXJ0VGV4dFxuICAgIGxldCBwcmV2aW91c1xuICAgIGxldCBwYXJlbnRcblxuICAgIHdoaWxlIChwYXJlbnQgPSBub2RlLmdldFBhcmVudChjaGlsZC5rZXkpKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKGNoaWxkKVxuICAgICAgY29uc3QgcG9zaXRpb24gPSBjaGlsZC5vYmplY3QgPT0gJ3RleHQnXG4gICAgICAgID8gc3RhcnRPZmZzZXRcbiAgICAgICAgOiBjaGlsZC5ub2Rlcy5pbmRleE9mKHByZXZpb3VzKVxuXG4gICAgICBwYXJlbnQgPSBwYXJlbnQuc3BsaXROb2RlKGluZGV4LCBwb3NpdGlvbilcbiAgICAgIG5vZGUgPSBub2RlLnVwZGF0ZU5vZGUocGFyZW50KVxuICAgICAgcHJldmlvdXMgPSBwYXJlbnQubm9kZXMuZ2V0KGluZGV4ICsgMSlcbiAgICAgIGNoaWxkID0gcGFyZW50XG4gICAgfVxuXG4gICAgY2hpbGQgPSBzdGFydEtleSA9PSBlbmRLZXkgPyBub2RlLmdldE5leHRUZXh0KHN0YXJ0S2V5KSA6IGVuZFRleHRcblxuICAgIHdoaWxlIChwYXJlbnQgPSBub2RlLmdldFBhcmVudChjaGlsZC5rZXkpKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKGNoaWxkKVxuICAgICAgY29uc3QgcG9zaXRpb24gPSBjaGlsZC5vYmplY3QgPT0gJ3RleHQnXG4gICAgICAgID8gc3RhcnRLZXkgPT0gZW5kS2V5ID8gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXQgOiBlbmRPZmZzZXRcbiAgICAgICAgOiBjaGlsZC5ub2Rlcy5pbmRleE9mKHByZXZpb3VzKVxuXG4gICAgICBwYXJlbnQgPSBwYXJlbnQuc3BsaXROb2RlKGluZGV4LCBwb3NpdGlvbilcbiAgICAgIG5vZGUgPSBub2RlLnVwZGF0ZU5vZGUocGFyZW50KVxuICAgICAgcHJldmlvdXMgPSBwYXJlbnQubm9kZXMuZ2V0KGluZGV4ICsgMSlcbiAgICAgIGNoaWxkID0gcGFyZW50XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBzdGFydCBhbmQgZW5kIG5vZGVzLlxuICAgIGNvbnN0IHN0YXJ0Tm9kZSA9IG5vZGUuZ2V0TmV4dFNpYmxpbmcobm9kZS5nZXRGdXJ0aGVzdEFuY2VzdG9yKHN0YXJ0S2V5KS5rZXkpXG4gICAgY29uc3QgZW5kTm9kZSA9IHN0YXJ0S2V5ID09IGVuZEtleVxuICAgICAgPyBub2RlLmdldE5leHRTaWJsaW5nKG5vZGUuZ2V0TmV4dFNpYmxpbmcobm9kZS5nZXRGdXJ0aGVzdEFuY2VzdG9yKGVuZEtleSkua2V5KS5rZXkpXG4gICAgICA6IG5vZGUuZ2V0TmV4dFNpYmxpbmcobm9kZS5nZXRGdXJ0aGVzdEFuY2VzdG9yKGVuZEtleSkua2V5KVxuXG4gICAgLy8gR2V0IGNoaWxkcmVuIHJhbmdlIG9mIG5vZGVzIGZyb20gc3RhcnQgdG8gZW5kIG5vZGVzXG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IG5vZGUubm9kZXMuaW5kZXhPZihzdGFydE5vZGUpXG4gICAgY29uc3QgZW5kSW5kZXggPSBub2RlLm5vZGVzLmluZGV4T2YoZW5kTm9kZSlcbiAgICBjb25zdCBub2RlcyA9IG5vZGUubm9kZXMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpXG5cbiAgICAvLyBSZXR1cm4gYSBuZXcgZG9jdW1lbnQgZnJhZ21lbnQuXG4gICAgcmV0dXJuIERvY3VtZW50LmNyZWF0ZSh7IG5vZGVzIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBwYXJlbnQgb2YgYSBub2RlIGJ5IGBrZXlgIHRoYXQgbWF0Y2hlcyBhbiBgaXRlcmF0b3JgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0RnVydGhlc3Qoa2V5LCBpdGVyYXRvcikge1xuICAgIGNvbnN0IGFuY2VzdG9ycyA9IHRoaXMuZ2V0QW5jZXN0b3JzKGtleSlcbiAgICBpZiAoIWFuY2VzdG9ycykge1xuICAgICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBkZXNjZW5kYW50IG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuICAgIH1cblxuICAgIC8vIEV4Y2x1ZGUgdGhpcyBub2RlIGl0c2VsZlxuICAgIHJldHVybiBhbmNlc3RvcnMucmVzdCgpLmZpbmQoaXRlcmF0b3IpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBibG9jayBwYXJlbnQgb2YgYSBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0RnVydGhlc3RCbG9jayhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGdXJ0aGVzdChrZXksIG5vZGUgPT4gbm9kZS5vYmplY3QgPT0gJ2Jsb2NrJylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZ1cnRoZXN0IGlubGluZSBwYXJlbnQgb2YgYSBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0RnVydGhlc3RJbmxpbmUoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RnVydGhlc3Qoa2V5LCBub2RlID0+IG5vZGUub2JqZWN0ID09ICdpbmxpbmUnKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZnVydGhlc3QgYW5jZXN0b3Igb2YgYSBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0RnVydGhlc3RBbmNlc3RvcihrZXkpIHtcbiAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgIHJldHVybiB0aGlzLm5vZGVzLmZpbmQoKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLmtleSA9PSBrZXkpIHJldHVybiB0cnVlXG4gICAgICBpZiAobm9kZS5vYmplY3QgPT0gJ3RleHQnKSByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiBub2RlLmhhc0Rlc2NlbmRhbnQoa2V5KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBhbmNlc3RvciBvZiBhIG5vZGUgYnkgYGtleWAgdGhhdCBoYXMgb25seSBvbmUgY2hpbGQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRGdXJ0aGVzdE9ubHlDaGlsZEFuY2VzdG9yKGtleSkge1xuICAgIGNvbnN0IGFuY2VzdG9ycyA9IHRoaXMuZ2V0QW5jZXN0b3JzKGtleSlcblxuICAgIGlmICghYW5jZXN0b3JzKSB7XG4gICAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhIGRlc2NlbmRhbnQgbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLmApXG4gICAgfVxuXG4gICAgcmV0dXJuIGFuY2VzdG9yc1xuICAgICAgLy8gU2tpcCB0aGlzIG5vZGUuLi5cbiAgICAgIC5za2lwTGFzdCgpXG4gICAgICAvLyBUYWtlIHBhcmVudHMgdW50aWwgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgY2hpbGQuLi5cbiAgICAgIC5yZXZlcnNlKCkudGFrZVVudGlsKHAgPT4gcC5ub2Rlcy5zaXplID4gMSlcbiAgICAgIC8vIEFuZCBwaWNrIHRoZSBoaWdoZXN0LlxuICAgICAgLmxhc3QoKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xvc2VzdCBpbmxpbmUgbm9kZXMgZm9yIGVhY2ggdGV4dCBub2RlIGluIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRJbmxpbmVzKCkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRJbmxpbmVzQXNBcnJheSgpXG4gICAgcmV0dXJuIG5ldyBMaXN0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xvc2VzdCBpbmxpbmUgbm9kZXMgZm9yIGVhY2ggdGV4dCBub2RlIGluIHRoZSBub2RlLCBhcyBhbiBhcnJheS5cbiAgICpcbiAgICogQHJldHVybiB7TGlzdDxOb2RlPn1cbiAgICovXG5cbiAgZ2V0SW5saW5lc0FzQXJyYXkoKSB7XG4gICAgbGV0IGFycmF5ID0gW11cblxuICAgIHRoaXMubm9kZXMuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGlmIChjaGlsZC5vYmplY3QgPT0gJ3RleHQnKSByZXR1cm5cbiAgICAgIGlmIChjaGlsZC5pc0xlYWZJbmxpbmUoKSkge1xuICAgICAgICBhcnJheS5wdXNoKGNoaWxkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJyYXkgPSBhcnJheS5jb25jYXQoY2hpbGQuZ2V0SW5saW5lc0FzQXJyYXkoKSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGFycmF5XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjbG9zZXN0IGlubGluZSBub2RlcyBmb3IgZWFjaCB0ZXh0IG5vZGUgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRJbmxpbmVzQXRSYW5nZShyYW5nZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRJbmxpbmVzQXRSYW5nZUFzQXJyYXkocmFuZ2UpXG4gICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgYnkgY29udmVydGluZyBpdCB0byBhbiBgT3JkZXJlZFNldGAgZmlyc3QuXG4gICAgcmV0dXJuIG5ldyBMaXN0KG5ldyBPcmRlcmVkU2V0KGFycmF5KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsb3Nlc3QgaW5saW5lIG5vZGVzIGZvciBlYWNoIHRleHQgbm9kZSBpbiBhIGByYW5nZWAgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRJbmxpbmVzQXRSYW5nZUFzQXJyYXkocmFuZ2UpIHtcbiAgICByYW5nZSA9IHJhbmdlLm5vcm1hbGl6ZSh0aGlzKVxuICAgIGlmIChyYW5nZS5pc1Vuc2V0KSByZXR1cm4gW11cblxuICAgIHJldHVybiB0aGlzXG4gICAgICAuZ2V0VGV4dHNBdFJhbmdlQXNBcnJheShyYW5nZSlcbiAgICAgIC5tYXAodGV4dCA9PiB0aGlzLmdldENsb3Nlc3RJbmxpbmUodGV4dC5rZXkpKVxuICAgICAgLmZpbHRlcihleGlzdHMgPT4gZXhpc3RzKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIGxlYWYgaW5saW5lIG5vZGVzIHRoYXQgbWF0Y2ggYSBgdHlwZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGdldElubGluZXNCeVR5cGUodHlwZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRJbmxpbmVzQnlUeXBlQXNBcnJheSh0eXBlKVxuICAgIHJldHVybiBuZXcgTGlzdChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIG9mIHRoZSBsZWFmIGlubGluZSBub2RlcyB0aGF0IG1hdGNoIGEgYHR5cGVgIGFzIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0SW5saW5lc0J5VHlwZUFzQXJyYXkodHlwZSkge1xuICAgIHJldHVybiB0aGlzLm5vZGVzLnJlZHVjZSgoaW5saW5lcywgbm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ID09ICd0ZXh0Jykge1xuICAgICAgICByZXR1cm4gaW5saW5lc1xuICAgICAgfSBlbHNlIGlmIChub2RlLmlzTGVhZklubGluZSgpICYmIG5vZGUudHlwZSA9PSB0eXBlKSB7XG4gICAgICAgIGlubGluZXMucHVzaChub2RlKVxuICAgICAgICByZXR1cm4gaW5saW5lc1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGlubGluZXMuY29uY2F0KG5vZGUuZ2V0SW5saW5lc0J5VHlwZUFzQXJyYXkodHlwZSkpXG4gICAgICB9XG4gICAgfSwgW10pXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgc2V0IG9mIGFsbCBrZXlzIGluIHRoZSBub2RlIGFzIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtBcnJheTxTdHJpbmc+fVxuICAgKi9cblxuICBnZXRLZXlzQXNBcnJheSgpIHtcbiAgICBjb25zdCBrZXlzID0gW11cblxuICAgIHRoaXMuZm9yRWFjaERlc2NlbmRhbnQoKGRlc2MpID0+IHtcbiAgICAgIGtleXMucHVzaChkZXNjLmtleSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIGtleXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBzZXQgb2YgYWxsIGtleXMgaW4gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1NldDxTdHJpbmc+fVxuICAgKi9cblxuICBnZXRLZXlzKCkge1xuICAgIGNvbnN0IGtleXMgPSB0aGlzLmdldEtleXNBc0FycmF5KClcbiAgICByZXR1cm4gbmV3IFNldChrZXlzKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGFzdCBjaGlsZCB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0TGFzdFRleHQoKSB7XG4gICAgbGV0IGRlc2NlbmRhbnRGb3VuZCA9IG51bGxcblxuICAgIGNvbnN0IGZvdW5kID0gdGhpcy5ub2Rlcy5maW5kTGFzdCgobm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ID09ICd0ZXh0JykgcmV0dXJuIHRydWVcbiAgICAgIGRlc2NlbmRhbnRGb3VuZCA9IG5vZGUuZ2V0TGFzdFRleHQoKVxuICAgICAgcmV0dXJuIGRlc2NlbmRhbnRGb3VuZFxuICAgIH0pXG5cbiAgICByZXR1cm4gZGVzY2VuZGFudEZvdW5kIHx8IGZvdW5kXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgZm9yIGFsbCBvZiB0aGUgY2hhcmFjdGVycyBvZiBldmVyeSB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1NldDxNYXJrPn1cbiAgICovXG5cbiAgZ2V0TWFya3MoKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldE1hcmtzQXNBcnJheSgpXG4gICAgcmV0dXJuIG5ldyBTZXQoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgZm9yIGFsbCBvZiB0aGUgY2hhcmFjdGVycyBvZiBldmVyeSB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge09yZGVyZWRTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldE9yZGVyZWRNYXJrcygpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0TWFya3NBc0FycmF5KClcbiAgICByZXR1cm4gbmV3IE9yZGVyZWRTZXQoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRNYXJrc0FzQXJyYXkoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMucmVkdWNlKChtYXJrcywgbm9kZSkgPT4ge1xuICAgICAgcmV0dXJuIG1hcmtzLmNvbmNhdChub2RlLmdldE1hcmtzQXNBcnJheSgpKVxuICAgIH0sIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiB0aGUgbWFya3MgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldE1hcmtzQXRSYW5nZShyYW5nZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRNYXJrc0F0UmFuZ2VBc0FycmF5KHJhbmdlKVxuICAgIHJldHVybiBuZXcgU2V0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiB0aGUgbWFya3MgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldEluc2VydE1hcmtzQXRSYW5nZShyYW5nZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRJbnNlcnRNYXJrc0F0UmFuZ2VBc0FycmF5KHJhbmdlKVxuICAgIHJldHVybiBuZXcgU2V0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiB0aGUgbWFya3MgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtPcmRlcmVkU2V0PE1hcms+fVxuICAgKi9cblxuICBnZXRPcmRlcmVkTWFya3NBdFJhbmdlKHJhbmdlKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldE1hcmtzQXRSYW5nZUFzQXJyYXkocmFuZ2UpXG4gICAgcmV0dXJuIG5ldyBPcmRlcmVkU2V0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiB0aGUgYWN0aXZlIG1hcmtzIGluIGEgYHJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7U2V0PE1hcms+fVxuICAgKi9cblxuICBnZXRBY3RpdmVNYXJrc0F0UmFuZ2UocmFuZ2UpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0QWN0aXZlTWFya3NBdFJhbmdlQXNBcnJheShyYW5nZSlcbiAgICByZXR1cm4gbmV3IFNldChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzZXQgb2YgdGhlIG1hcmtzIGluIGEgYHJhbmdlYCwgYnkgdW5pb25pbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRNYXJrc0F0UmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIFtdXG4gICAgaWYgKHJhbmdlLmlzQ29sbGFwc2VkKSByZXR1cm4gdGhpcy5nZXRNYXJrc0F0Q29sbGFzcHNlZFJhbmdlQXNBcnJheShyYW5nZSlcblxuICAgIHJldHVybiB0aGlzXG4gICAgICAuZ2V0Q2hhcmFjdGVyc0F0UmFuZ2UocmFuZ2UpXG4gICAgICAucmVkdWNlKChtZW1vLCBjaGFyKSA9PiB7XG4gICAgICAgIGNoYXIubWFya3MudG9BcnJheSgpLmZvckVhY2goYyA9PiBtZW1vLnB1c2goYykpXG4gICAgICAgIHJldHVybiBtZW1vXG4gICAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzZXQgb2YgdGhlIG1hcmtzIGluIGEgYHJhbmdlYCBmb3IgaW5zZXJ0aW9uIGJlaGF2aW9yLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0SW5zZXJ0TWFya3NBdFJhbmdlQXNBcnJheShyYW5nZSkge1xuICAgIHJhbmdlID0gcmFuZ2Uubm9ybWFsaXplKHRoaXMpXG4gICAgaWYgKHJhbmdlLmlzVW5zZXQpIHJldHVybiBbXVxuICAgIGlmIChyYW5nZS5pc0NvbGxhcHNlZCkgcmV0dXJuIHRoaXMuZ2V0TWFya3NBdENvbGxhc3BzZWRSYW5nZUFzQXJyYXkocmFuZ2UpXG5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXREZXNjZW5kYW50KHJhbmdlLnN0YXJ0S2V5KVxuICAgIGNvbnN0IGNoYXIgPSB0ZXh0LmNoYXJhY3RlcnMuZ2V0KHJhbmdlLnN0YXJ0T2Zmc2V0KVxuICAgIHJldHVybiBjaGFyLm1hcmtzLnRvQXJyYXkoKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiBtYXJrcyBpbiBhIGByYW5nZWAsIGJ5IHRyZWF0aW5nIGl0IGFzIGNvbGxhcHNlZC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldE1hcmtzQXRDb2xsYXNwc2VkUmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgaWYgKHJhbmdlLmlzVW5zZXQpIHJldHVybiBbXVxuXG4gICAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG5cbiAgICBpZiAoc3RhcnRPZmZzZXQgPT0gMCkge1xuICAgICAgY29uc3QgcHJldmlvdXMgPSB0aGlzLmdldFByZXZpb3VzVGV4dChzdGFydEtleSlcbiAgICAgIGlmICghcHJldmlvdXMgfHwgcHJldmlvdXMudGV4dC5sZW5ndGggPT0gMCkgcmV0dXJuIFtdXG4gICAgICBjb25zdCBjaGFyID0gcHJldmlvdXMuY2hhcmFjdGVycy5nZXQocHJldmlvdXMudGV4dC5sZW5ndGggLSAxKVxuICAgICAgcmV0dXJuIGNoYXIubWFya3MudG9BcnJheSgpXG4gICAgfVxuXG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZ2V0RGVzY2VuZGFudChzdGFydEtleSlcbiAgICBjb25zdCBjaGFyID0gdGV4dC5jaGFyYWN0ZXJzLmdldChzdGFydE9mZnNldCAtIDEpXG4gICAgcmV0dXJuIGNoYXIubWFya3MudG9BcnJheSgpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc2V0IG9mIG1hcmtzIGluIGEgYHJhbmdlYCwgYnkgaW50ZXJzZWN0aW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0QWN0aXZlTWFya3NBdFJhbmdlQXNBcnJheShyYW5nZSkge1xuICAgIHJhbmdlID0gcmFuZ2Uubm9ybWFsaXplKHRoaXMpXG4gICAgaWYgKHJhbmdlLmlzVW5zZXQpIHJldHVybiBbXVxuICAgIGlmIChyYW5nZS5pc0NvbGxhcHNlZCkgcmV0dXJuIHRoaXMuZ2V0TWFya3NBdENvbGxhc3BzZWRSYW5nZUFzQXJyYXkocmFuZ2UpXG5cbiAgICAvLyBPdGhlcndpc2UsIGdldCBhIHNldCBvZiB0aGUgbWFya3MgZm9yIGVhY2ggY2hhcmFjdGVyIGluIHRoZSByYW5nZS5cbiAgICBjb25zdCBjaGFycyA9IHRoaXMuZ2V0Q2hhcmFjdGVyc0F0UmFuZ2UocmFuZ2UpXG4gICAgY29uc3QgZmlyc3QgPSBjaGFycy5maXJzdCgpXG4gICAgaWYgKCFmaXJzdCkgcmV0dXJuIFtdXG5cbiAgICBsZXQgbWVtbyA9IGZpcnN0Lm1hcmtzXG5cbiAgICBjaGFycy5zbGljZSgxKS5mb3JFYWNoKChjaGFyKSA9PiB7XG4gICAgICBtZW1vID0gbWVtby5pbnRlcnNlY3QoY2hhci5tYXJrcylcbiAgICAgIHJldHVybiBtZW1vLnNpemUgIT0gMFxuICAgIH0pXG5cbiAgICByZXR1cm4gbWVtby50b0FycmF5KClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIG9mIHRoZSBtYXJrcyB0aGF0IG1hdGNoIGEgYHR5cGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuIHtTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldE1hcmtzQnlUeXBlKHR5cGUpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0TWFya3NCeVR5cGVBc0FycmF5KHR5cGUpXG4gICAgcmV0dXJuIG5ldyBTZXQoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgdGhhdCBtYXRjaCBhIGB0eXBlYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICogQHJldHVybiB7T3JkZXJlZFNldDxNYXJrPn1cbiAgICovXG5cbiAgZ2V0T3JkZXJlZE1hcmtzQnlUeXBlKHR5cGUpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0TWFya3NCeVR5cGVBc0FycmF5KHR5cGUpXG4gICAgcmV0dXJuIG5ldyBPcmRlcmVkU2V0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIG1hcmtzIHRoYXQgbWF0Y2ggYSBgdHlwZWAgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRNYXJrc0J5VHlwZUFzQXJyYXkodHlwZSkge1xuICAgIHJldHVybiB0aGlzLm5vZGVzLnJlZHVjZSgoYXJyYXksIG5vZGUpID0+IHtcbiAgICAgIHJldHVybiBub2RlLm9iamVjdCA9PSAndGV4dCdcbiAgICAgICAgPyBhcnJheS5jb25jYXQobm9kZS5nZXRNYXJrc0FzQXJyYXkoKS5maWx0ZXIobSA9PiBtLnR5cGUgPT0gdHlwZSkpXG4gICAgICAgIDogYXJyYXkuY29uY2F0KG5vZGUuZ2V0TWFya3NCeVR5cGVBc0FycmF5KHR5cGUpKVxuICAgIH0sIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYmxvY2sgbm9kZSBiZWZvcmUgYSBkZXNjZW5kYW50IHRleHQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldE5leHRCbG9jayhrZXkpIHtcbiAgICBjb25zdCBjaGlsZCA9IHRoaXMuYXNzZXJ0RGVzY2VuZGFudChrZXkpXG4gICAgbGV0IGxhc3RcblxuICAgIGlmIChjaGlsZC5vYmplY3QgPT0gJ2Jsb2NrJykge1xuICAgICAgbGFzdCA9IGNoaWxkLmdldExhc3RUZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYmxvY2sgPSB0aGlzLmdldENsb3Nlc3RCbG9jayhrZXkpXG4gICAgICBsYXN0ID0gYmxvY2suZ2V0TGFzdFRleHQoKVxuICAgIH1cblxuICAgIGNvbnN0IG5leHQgPSB0aGlzLmdldE5leHRUZXh0KGxhc3Qua2V5KVxuICAgIGlmICghbmV4dCkgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiB0aGlzLmdldENsb3Nlc3RCbG9jayhuZXh0LmtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5vZGUgYWZ0ZXIgYSBkZXNjZW5kYW50IGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0TmV4dFNpYmxpbmcoa2V5KSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcblxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KGtleSlcbiAgICBjb25zdCBhZnRlciA9IHBhcmVudC5ub2Rlc1xuICAgICAgLnNraXBVbnRpbChjaGlsZCA9PiBjaGlsZC5rZXkgPT0ga2V5KVxuXG4gICAgaWYgKGFmdGVyLnNpemUgPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhIGNoaWxkIG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuICAgIH1cbiAgICByZXR1cm4gYWZ0ZXIuZ2V0KDEpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0ZXh0IG5vZGUgYWZ0ZXIgYSBkZXNjZW5kYW50IHRleHQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldE5leHRUZXh0KGtleSkge1xuICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dHMoKVxuICAgICAgLnNraXBVbnRpbCh0ZXh0ID0+IHRleHQua2V5ID09IGtleSlcbiAgICAgIC5nZXQoMSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBub2RlIGluIHRoZSB0cmVlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Tm9kZShrZXkpIHtcbiAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgIHJldHVybiB0aGlzLmtleSA9PSBrZXkgPyB0aGlzIDogdGhpcy5nZXREZXNjZW5kYW50KGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBub2RlIGluIHRoZSB0cmVlIGJ5IGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldE5vZGVBdFBhdGgocGF0aCkge1xuICAgIHJldHVybiBwYXRoLmxlbmd0aCA/IHRoaXMuZ2V0RGVzY2VuZGFudEF0UGF0aChwYXRoKSA6IHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG9mZnNldCBmb3IgYSBkZXNjZW5kYW50IHRleHQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqL1xuXG4gIGdldE9mZnNldChrZXkpIHtcbiAgICB0aGlzLmFzc2VydERlc2NlbmRhbnQoa2V5KVxuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBvZmZzZXQgb2YgdGhlIG5vZGVzIGJlZm9yZSB0aGUgaGlnaGVzdCBjaGlsZC5cbiAgICBjb25zdCBjaGlsZCA9IHRoaXMuZ2V0RnVydGhlc3RBbmNlc3RvcihrZXkpXG4gICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5ub2Rlc1xuICAgICAgLnRha2VVbnRpbChuID0+IG4gPT0gY2hpbGQpXG4gICAgICAucmVkdWNlKChtZW1vLCBuKSA9PiBtZW1vICsgbi50ZXh0Lmxlbmd0aCwgMClcblxuICAgIC8vIFJlY3Vyc2UgaWYgbmVlZCBiZS5cbiAgICByZXR1cm4gdGhpcy5oYXNDaGlsZChrZXkpXG4gICAgICA/IG9mZnNldFxuICAgICAgOiBvZmZzZXQgKyBjaGlsZC5nZXRPZmZzZXQoa2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgb2Zmc2V0IGZyb20gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqL1xuXG4gIGdldE9mZnNldEF0UmFuZ2UocmFuZ2UpIHtcbiAgICByYW5nZSA9IHJhbmdlLm5vcm1hbGl6ZSh0aGlzKVxuXG4gICAgaWYgKHJhbmdlLmlzVW5zZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHJhbmdlIGNhbm5vdCBiZSB1bnNldCB0byBjYWxjdWxjYXRlIGl0cyBvZmZzZXQuJylcbiAgICB9XG5cbiAgICBpZiAocmFuZ2UuaXNFeHBhbmRlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcmFuZ2UgbXVzdCBiZSBjb2xsYXBzZWQgdG8gY2FsY3VsY2F0ZSBpdHMgb2Zmc2V0LicpXG4gICAgfVxuXG4gICAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gICAgcmV0dXJuIHRoaXMuZ2V0T2Zmc2V0KHN0YXJ0S2V5KSArIHN0YXJ0T2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwYXJlbnQgb2YgYSBjaGlsZCBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0UGFyZW50KGtleSkge1xuICAgIGlmICh0aGlzLmhhc0NoaWxkKGtleSkpIHJldHVybiB0aGlzXG5cbiAgICBsZXQgbm9kZSA9IG51bGxcblxuICAgIHRoaXMubm9kZXMuZmluZCgoY2hpbGQpID0+IHtcbiAgICAgIGlmIChjaGlsZC5vYmplY3QgPT0gJ3RleHQnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZSA9IGNoaWxkLmdldFBhcmVudChrZXkpXG4gICAgICAgIHJldHVybiBub2RlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBub2RlXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwYXRoIG9mIGEgZGVzY2VuZGFudCBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBrZXlcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldFBhdGgoa2V5KSB7XG4gICAgbGV0IGNoaWxkID0gdGhpcy5hc3NlcnROb2RlKGtleSlcbiAgICBjb25zdCBhbmNlc3RvcnMgPSB0aGlzLmdldEFuY2VzdG9ycyhrZXkpXG4gICAgY29uc3QgcGF0aCA9IFtdXG5cbiAgICBhbmNlc3RvcnMucmV2ZXJzZSgpLmZvckVhY2goKGFuY2VzdG9yKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IGFuY2VzdG9yLm5vZGVzLmluZGV4T2YoY2hpbGQpXG4gICAgICBwYXRoLnVuc2hpZnQoaW5kZXgpXG4gICAgICBjaGlsZCA9IGFuY2VzdG9yXG4gICAgfSlcblxuICAgIHJldHVybiBwYXRoXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwbGFjZWhvbGRlciBmb3IgdGhlIG5vZGUgZnJvbSBhIGBzY2hlbWFgLlxuICAgKlxuICAgKiBAcGFyYW0ge1NjaGVtYX0gc2NoZW1hXG4gICAqIEByZXR1cm4ge0NvbXBvbmVudHxWb2lkfVxuICAgKi9cblxuICBnZXRQbGFjZWhvbGRlcihzY2hlbWEpIHtcbiAgICByZXR1cm4gc2NoZW1hLl9fZ2V0UGxhY2Vob2xkZXIodGhpcylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGJsb2NrIG5vZGUgYmVmb3JlIGEgZGVzY2VuZGFudCB0ZXh0IG5vZGUgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRQcmV2aW91c0Jsb2NrKGtleSkge1xuICAgIGNvbnN0IGNoaWxkID0gdGhpcy5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgICBsZXQgZmlyc3RcblxuICAgIGlmIChjaGlsZC5vYmplY3QgPT0gJ2Jsb2NrJykge1xuICAgICAgZmlyc3QgPSBjaGlsZC5nZXRGaXJzdFRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBibG9jayA9IHRoaXMuZ2V0Q2xvc2VzdEJsb2NrKGtleSlcbiAgICAgIGZpcnN0ID0gYmxvY2suZ2V0Rmlyc3RUZXh0KClcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuZ2V0UHJldmlvdXNUZXh0KGZpcnN0LmtleSlcbiAgICBpZiAoIXByZXZpb3VzKSByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xvc2VzdEJsb2NrKHByZXZpb3VzLmtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5vZGUgYmVmb3JlIGEgZGVzY2VuZGFudCBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0UHJldmlvdXNTaWJsaW5nKGtleSkge1xuICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoa2V5KVxuICAgIGNvbnN0IGJlZm9yZSA9IHBhcmVudC5ub2Rlc1xuICAgICAgLnRha2VVbnRpbChjaGlsZCA9PiBjaGlsZC5rZXkgPT0ga2V5KVxuXG4gICAgaWYgKGJlZm9yZS5zaXplID09IHBhcmVudC5ub2Rlcy5zaXplKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgY2hpbGQgbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLmApXG4gICAgfVxuXG4gICAgcmV0dXJuIGJlZm9yZS5sYXN0KClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRleHQgbm9kZSBiZWZvcmUgYSBkZXNjZW5kYW50IHRleHQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldFByZXZpb3VzVGV4dChrZXkpIHtcbiAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgIHJldHVybiB0aGlzLmdldFRleHRzKClcbiAgICAgIC50YWtlVW50aWwodGV4dCA9PiB0ZXh0LmtleSA9PSBrZXkpXG4gICAgICAubGFzdCgpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBpbmRleGVzIG9mIHRoZSBzZWxlY3Rpb24gZm9yIGEgYHJhbmdlYCwgZ2l2ZW4gYW4gZXh0cmEgZmxhZyBmb3JcbiAgICogd2hldGhlciB0aGUgbm9kZSBgaXNTZWxlY3RlZGAsIHRvIGRldGVybWluZSB3aGV0aGVyIG5vdCBmaW5kaW5nIG1hdGNoZXNcbiAgICogbWVhbnMgZXZlcnl0aGluZyBpcyBzZWxlY3RlZCBvciBub3RoaW5nIGlzLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzU2VsZWN0ZWRcbiAgICogQHJldHVybiB7T2JqZWN0fE51bGx9XG4gICAqL1xuXG4gIGdldFNlbGVjdGlvbkluZGV4ZXMocmFuZ2UsIGlzU2VsZWN0ZWQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHsgc3RhcnRLZXksIGVuZEtleSB9ID0gcmFuZ2VcblxuICAgIC8vIFBFUkY6IGlmIHdlJ3JlIG5vdCBzZWxlY3RlZCwgb3IgdGhlIHJhbmdlIGlzIGJsdXJyZWQsIHdlIGNhbiBleGl0IGVhcmx5LlxuICAgIGlmICghaXNTZWxlY3RlZCB8fCByYW5nZS5pc0JsdXJyZWQpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgLy8gaWYgd2UndmUgYmVlbiBnaXZlbiBhbiBpbnZhbGlkIHNlbGVjdGlvbiB3ZSBjYW4gZXhpdCBlYXJseS5cbiAgICBpZiAocmFuZ2UuaXNVbnNldCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICAvLyBQRVJGOiBpZiB0aGUgc3RhcnQgYW5kIGVuZCBrZXlzIGFyZSB0aGUgc2FtZSwganVzdCBjaGVjayBmb3IgdGhlIGNoaWxkXG4gICAgLy8gdGhhdCBjb250YWlucyB0aGF0IHNpbmdsZSBrZXkuXG4gICAgaWYgKHN0YXJ0S2V5ID09IGVuZEtleSkge1xuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLmdldEZ1cnRoZXN0QW5jZXN0b3Ioc3RhcnRLZXkpXG4gICAgICBjb25zdCBpbmRleCA9IGNoaWxkID8gdGhpcy5ub2Rlcy5pbmRleE9mKGNoaWxkKSA6IG51bGxcbiAgICAgIHJldHVybiB7IHN0YXJ0OiBpbmRleCwgZW5kOiBpbmRleCArIDEgfVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgY2hlY2sgYWxsIG9mIHRoZSBjaGlsZHJlbi4uLlxuICAgIGxldCBzdGFydCA9IG51bGxcbiAgICBsZXQgZW5kID0gbnVsbFxuXG4gICAgdGhpcy5ub2Rlcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgaWYgKGNoaWxkLm9iamVjdCA9PSAndGV4dCcpIHtcbiAgICAgICAgaWYgKHN0YXJ0ID09IG51bGwgJiYgY2hpbGQua2V5ID09IHN0YXJ0S2V5KSBzdGFydCA9IGlcbiAgICAgICAgaWYgKGVuZCA9PSBudWxsICYmIGNoaWxkLmtleSA9PSBlbmRLZXkpIGVuZCA9IGkgKyAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3RhcnQgPT0gbnVsbCAmJiBjaGlsZC5oYXNEZXNjZW5kYW50KHN0YXJ0S2V5KSkgc3RhcnQgPSBpXG4gICAgICAgIGlmIChlbmQgPT0gbnVsbCAmJiBjaGlsZC5oYXNEZXNjZW5kYW50KGVuZEtleSkpIGVuZCA9IGkgKyAxXG4gICAgICB9XG5cbiAgICAgIC8vIFBFUkY6IGV4aXQgZWFybHkgaWYgYm90aCBzdGFydCBhbmQgZW5kIGhhdmUgYmVlbiBmb3VuZC5cbiAgICAgIHJldHVybiBzdGFydCA9PSBudWxsIHx8IGVuZCA9PSBudWxsXG4gICAgfSlcblxuICAgIGlmIChpc1NlbGVjdGVkICYmIHN0YXJ0ID09IG51bGwpIHN0YXJ0ID0gMFxuICAgIGlmIChpc1NlbGVjdGVkICYmIGVuZCA9PSBudWxsKSBlbmQgPSB0aGlzLm5vZGVzLnNpemVcbiAgICByZXR1cm4gc3RhcnQgPT0gbnVsbCA/IG51bGwgOiB7IHN0YXJ0LCBlbmQgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29uY2F0ZW5hdGVkIHRleHQgc3RyaW5nIG9mIGFsbCBjaGlsZCBub2Rlcy5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXRUZXh0KCkge1xuICAgIHJldHVybiB0aGlzLm5vZGVzLnJlZHVjZSgoc3RyaW5nLCBub2RlKSA9PiB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgbm9kZS50ZXh0XG4gICAgfSwgJycpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBkZXNjZW5kZW50IHRleHQgbm9kZSBhdCBhbiBgb2Zmc2V0YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9mZnNldFxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldFRleHRBdE9mZnNldChvZmZzZXQpIHtcbiAgICAvLyBQRVJGOiBBZGQgYSBmZXcgc2hvcnRjdXRzIGZvciB0aGUgb2J2aW91cyBjYXNlcy5cbiAgICBpZiAob2Zmc2V0ID09IDApIHJldHVybiB0aGlzLmdldEZpcnN0VGV4dCgpXG4gICAgaWYgKG9mZnNldCA9PSB0aGlzLnRleHQubGVuZ3RoKSByZXR1cm4gdGhpcy5nZXRMYXN0VGV4dCgpXG4gICAgaWYgKG9mZnNldCA8IDAgfHwgb2Zmc2V0ID4gdGhpcy50ZXh0Lmxlbmd0aCkgcmV0dXJuIG51bGxcblxuICAgIGxldCBsZW5ndGggPSAwXG5cbiAgICByZXR1cm4gdGhpc1xuICAgICAgLmdldFRleHRzKClcbiAgICAgIC5maW5kKChub2RlLCBpLCBub2RlcykgPT4ge1xuICAgICAgICBsZW5ndGggKz0gbm9kZS50ZXh0Lmxlbmd0aFxuICAgICAgICByZXR1cm4gbGVuZ3RoID4gb2Zmc2V0XG4gICAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZGlyZWN0aW9uIG9mIHRoZSBub2RlJ3MgdGV4dC5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXRUZXh0RGlyZWN0aW9uKCkge1xuICAgIGNvbnN0IGRpciA9IGRpcmVjdGlvbih0aGlzLnRleHQpXG4gICAgcmV0dXJuIGRpciA9PSAnbmV1dHJhbCcgPyB1bmRlZmluZWQgOiBkaXJcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBnZXQgYWxsIG9mIHRoZSBjaGlsZCB0ZXh0IG5vZGVzIGluIG9yZGVyIG9mIGFwcGVhcmFuY2UuXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGdldFRleHRzKCkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRUZXh0c0FzQXJyYXkoKVxuICAgIHJldHVybiBuZXcgTGlzdChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBnZXQgYWxsIHRoZSBsZWFmIHRleHQgbm9kZXMgaW4gb3JkZXIgb2YgYXBwZWFyYW5jZSwgYXMgYXJyYXkuXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGdldFRleHRzQXNBcnJheSgpIHtcbiAgICBsZXQgYXJyYXkgPSBbXVxuXG4gICAgdGhpcy5ub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5vYmplY3QgPT0gJ3RleHQnKSB7XG4gICAgICAgIGFycmF5LnB1c2gobm9kZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycmF5ID0gYXJyYXkuY29uY2F0KG5vZGUuZ2V0VGV4dHNBc0FycmF5KCkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBhcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIHRleHQgbm9kZXMgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRUZXh0c0F0UmFuZ2UocmFuZ2UpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0VGV4dHNBdFJhbmdlQXNBcnJheShyYW5nZSlcbiAgICByZXR1cm4gbmV3IExpc3QoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgdGV4dCBub2RlcyBpbiBhIGByYW5nZWAgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRUZXh0c0F0UmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIFtdXG5cbiAgICBjb25zdCB7IHN0YXJ0S2V5LCBlbmRLZXkgfSA9IHJhbmdlXG4gICAgY29uc3Qgc3RhcnRUZXh0ID0gdGhpcy5nZXREZXNjZW5kYW50KHN0YXJ0S2V5KVxuXG4gICAgLy8gUEVSRjogdGhlIG1vc3QgY29tbW9uIGNhc2UgaXMgd2hlbiB0aGUgcmFuZ2UgaXMgaW4gYSBzaW5nbGUgdGV4dCBub2RlLFxuICAgIC8vIHdoZXJlIHdlIGNhbiBhdm9pZCBhIGxvdCBvZiBpdGVyYXRpbmcgb2YgdGhlIHRyZWUuXG4gICAgaWYgKHN0YXJ0S2V5ID09IGVuZEtleSkgcmV0dXJuIFtzdGFydFRleHRdXG5cbiAgICBjb25zdCBlbmRUZXh0ID0gdGhpcy5nZXREZXNjZW5kYW50KGVuZEtleSlcbiAgICBjb25zdCB0ZXh0cyA9IHRoaXMuZ2V0VGV4dHNBc0FycmF5KClcbiAgICBjb25zdCBzdGFydCA9IHRleHRzLmluZGV4T2Yoc3RhcnRUZXh0KVxuICAgIGNvbnN0IGVuZCA9IHRleHRzLmluZGV4T2YoZW5kVGV4dClcbiAgICByZXR1cm4gdGV4dHMuc2xpY2Uoc3RhcnQsIGVuZCArIDEpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBjaGlsZCBub2RlIGV4aXN0cyBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNDaGlsZChrZXkpIHtcbiAgICByZXR1cm4gISF0aGlzLmdldENoaWxkKGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBjaGVjayBpZiBhIGNoaWxkIG5vZGUgZXhpc3RzIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGhhc0Rlc2NlbmRhbnQoa2V5KSB7XG4gICAgcmV0dXJuICEhdGhpcy5nZXREZXNjZW5kYW50KGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBjaGVjayBpZiBhIG5vZGUgZXhpc3RzIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGhhc05vZGUoa2V5KSB7XG4gICAgcmV0dXJuICEhdGhpcy5nZXROb2RlKGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIG5vZGUgaGFzIGEgdm9pZCBwYXJlbnQgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzVm9pZFBhcmVudChrZXkpIHtcbiAgICByZXR1cm4gISF0aGlzLmdldENsb3Nlc3Qoa2V5LCBwYXJlbnQgPT4gcGFyZW50LmlzVm9pZClcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBgbm9kZWAgYXQgYGluZGV4YC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBpbnNlcnROb2RlKGluZGV4LCBub2RlKSB7XG4gICAgY29uc3Qga2V5cyA9IHRoaXMuZ2V0S2V5cygpXG5cbiAgICBpZiAoa2V5cy5jb250YWlucyhub2RlLmtleSkpIHtcbiAgICAgIG5vZGUgPSBub2RlLnJlZ2VuZXJhdGVLZXkoKVxuICAgIH1cblxuICAgIGlmIChub2RlLm9iamVjdCAhPSAndGV4dCcpIHtcbiAgICAgIG5vZGUgPSBub2RlLm1hcERlc2NlbmRhbnRzKChkZXNjKSA9PiB7XG4gICAgICAgIHJldHVybiBrZXlzLmNvbnRhaW5zKGRlc2Mua2V5KVxuICAgICAgICAgID8gZGVzYy5yZWdlbmVyYXRlS2V5KClcbiAgICAgICAgICA6IGRlc2NcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZXMgPSB0aGlzLm5vZGVzLmluc2VydChpbmRleCwgbm9kZSlcbiAgICByZXR1cm4gdGhpcy5zZXQoJ25vZGVzJywgbm9kZXMpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgbm9kZSBpcyBpbiBhIGByYW5nZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGlzSW5SYW5nZShyYW5nZSkge1xuICAgIHJhbmdlID0gcmFuZ2Uubm9ybWFsaXplKHRoaXMpXG5cbiAgICBjb25zdCBub2RlID0gdGhpc1xuICAgIGNvbnN0IHsgc3RhcnRLZXksIGVuZEtleSwgaXNDb2xsYXBzZWQgfSA9IHJhbmdlXG5cbiAgICAvLyBQRVJGOiBzb2x2ZSB0aGUgbW9zdCBjb21tb24gY2FzdCB3aGVyZSB0aGUgc3RhcnQgb3IgZW5kIGtleSBhcmUgaW5zaWRlXG4gICAgLy8gdGhlIG5vZGUsIGZvciBjb2xsYXBzZWQgc2VsZWN0aW9ucy5cbiAgICBpZiAoXG4gICAgICBub2RlLmtleSA9PSBzdGFydEtleSB8fFxuICAgICAgbm9kZS5rZXkgPT0gZW5kS2V5IHx8XG4gICAgICBub2RlLmhhc0Rlc2NlbmRhbnQoc3RhcnRLZXkpIHx8XG4gICAgICBub2RlLmhhc0Rlc2NlbmRhbnQoZW5kS2V5KVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBQRVJGOiBpZiB0aGUgc2VsZWN0aW9uIGlzIGNvbGxhcHNlZCBhbmQgdGhlIHByZXZpb3VzIGNoZWNrIGRpZG4ndCByZXR1cm5cbiAgICAvLyB0cnVlLCB0aGVuIGl0IG11c3QgYmUgZmFsc2UuXG4gICAgaWYgKGlzQ29sbGFwc2VkKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGxvb2sgdGhyb3VnaCBhbGwgb2YgdGhlIGxlYWYgdGV4dCBub2RlcyBpbiB0aGUgcmFuZ2UsIHRvIHNlZVxuICAgIC8vIGlmIGFueSBvZiB0aGVtIGFyZSBpbnNpZGUgdGhlIG5vZGUuXG4gICAgY29uc3QgdGV4dHMgPSBub2RlLmdldFRleHRzQXRSYW5nZShyYW5nZSlcbiAgICBsZXQgbWVtbyA9IGZhbHNlXG5cbiAgICB0ZXh0cy5mb3JFYWNoKCh0ZXh0KSA9PiB7XG4gICAgICBpZiAobm9kZS5oYXNEZXNjZW5kYW50KHRleHQua2V5KSkgbWVtbyA9IHRydWVcbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSlcblxuICAgIHJldHVybiBtZW1vXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgbm9kZSBpcyBhIGxlYWYgYmxvY2suXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGlzTGVhZkJsb2NrKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm9iamVjdCA9PSAnYmxvY2snICYmXG4gICAgICB0aGlzLm5vZGVzLmV2ZXJ5KG4gPT4gbi5vYmplY3QgIT0gJ2Jsb2NrJylcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgbm9kZSBpcyBhIGxlYWYgaW5saW5lLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBpc0xlYWZJbmxpbmUoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMub2JqZWN0ID09ICdpbmxpbmUnICYmXG4gICAgICB0aGlzLm5vZGVzLmV2ZXJ5KG4gPT4gbi5vYmplY3QgIT0gJ2lubGluZScpXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIGEgY2hpbGRyZW4gbm9kZSBgZmlyc3RgIHdpdGggYW5vdGhlciBjaGlsZHJlbiBub2RlIGBzZWNvbmRgLlxuICAgKiBgZmlyc3RgIGFuZCBgc2Vjb25kYCB3aWxsIGJlIGNvbmNhdGVuYXRlZCBpbiB0aGF0IG9yZGVyLlxuICAgKiBgZmlyc3RgIGFuZCBgc2Vjb25kYCBtdXN0IGJlIHR3byBOb2RlcyBvciB0d28gVGV4dC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBmaXJzdFxuICAgKiBAcGFyYW0ge05vZGV9IHNlY29uZFxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBtZXJnZU5vZGUod2l0aEluZGV4LCBpbmRleCkge1xuICAgIGxldCBub2RlID0gdGhpc1xuICAgIGxldCBvbmUgPSBub2RlLm5vZGVzLmdldCh3aXRoSW5kZXgpXG4gICAgY29uc3QgdHdvID0gbm9kZS5ub2Rlcy5nZXQoaW5kZXgpXG5cbiAgICBpZiAob25lLm9iamVjdCAhPSB0d28ub2JqZWN0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRyaWVkIHRvIG1lcmdlIHR3byBub2RlcyBvZiBkaWZmZXJlbnQgb2JqZWN0czogXCIke29uZS5vYmplY3R9XCIgYW5kIFwiJHt0d28ub2JqZWN0fVwiLmApXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG5vZGVzIGFyZSB0ZXh0IG5vZGVzLCBjb25jYXRlbmF0ZSB0aGVpciBjaGFyYWN0ZXJzIHRvZ2V0aGVyLlxuICAgIGlmIChvbmUub2JqZWN0ID09ICd0ZXh0Jykge1xuICAgICAgY29uc3QgY2hhcmFjdGVycyA9IG9uZS5jaGFyYWN0ZXJzLmNvbmNhdCh0d28uY2hhcmFjdGVycylcbiAgICAgIG9uZSA9IG9uZS5zZXQoJ2NoYXJhY3RlcnMnLCBjaGFyYWN0ZXJzKVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgY29uY2F0ZW5hdGUgdGhlaXIgY2hpbGQgbm9kZXMgdG9nZXRoZXIuXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBub2RlcyA9IG9uZS5ub2Rlcy5jb25jYXQodHdvLm5vZGVzKVxuICAgICAgb25lID0gb25lLnNldCgnbm9kZXMnLCBub2RlcylcbiAgICB9XG5cbiAgICBub2RlID0gbm9kZS5yZW1vdmVOb2RlKGluZGV4KVxuICAgIG5vZGUgPSBub2RlLnJlbW92ZU5vZGUod2l0aEluZGV4KVxuICAgIG5vZGUgPSBub2RlLmluc2VydE5vZGUod2l0aEluZGV4LCBvbmUpXG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgYWxsIGNoaWxkIG5vZGVzLCB1cGRhdGluZyB0aGVtIGluIHRoZWlyIHBhcmVudHMuIFRoaXMgbWV0aG9kIGlzXG4gICAqIG9wdGltaXplZCB0byBub3QgcmV0dXJuIGEgbmV3IG5vZGUgaWYgbm8gY2hhbmdlcyBhcmUgbWFkZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgbWFwQ2hpbGRyZW4oaXRlcmF0b3IpIHtcbiAgICBsZXQgeyBub2RlcyB9ID0gdGhpc1xuXG4gICAgbm9kZXMuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgICAgY29uc3QgcmV0ID0gaXRlcmF0b3Iobm9kZSwgaSwgdGhpcy5ub2RlcylcbiAgICAgIGlmIChyZXQgIT0gbm9kZSkgbm9kZXMgPSBub2Rlcy5zZXQocmV0LmtleSwgcmV0KVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpcy5zZXQoJ25vZGVzJywgbm9kZXMpXG4gIH1cblxuICAvKipcbiAgICogTWFwIGFsbCBkZXNjZW5kYW50IG5vZGVzLCB1cGRhdGluZyB0aGVtIGluIHRoZWlyIHBhcmVudHMuIFRoaXMgbWV0aG9kIGlzXG4gICAqIG9wdGltaXplZCB0byBub3QgcmV0dXJuIGEgbmV3IG5vZGUgaWYgbm8gY2hhbmdlcyBhcmUgbWFkZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgbWFwRGVzY2VuZGFudHMoaXRlcmF0b3IpIHtcbiAgICBsZXQgeyBub2RlcyB9ID0gdGhpc1xuXG4gICAgbm9kZXMuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgICAgbGV0IHJldCA9IG5vZGVcbiAgICAgIGlmIChyZXQub2JqZWN0ICE9ICd0ZXh0JykgcmV0ID0gcmV0Lm1hcERlc2NlbmRhbnRzKGl0ZXJhdG9yKVxuICAgICAgcmV0ID0gaXRlcmF0b3IocmV0LCBpLCB0aGlzLm5vZGVzKVxuICAgICAgaWYgKHJldCA9PSBub2RlKSByZXR1cm5cblxuICAgICAgY29uc3QgaW5kZXggPSBub2Rlcy5pbmRleE9mKG5vZGUpXG4gICAgICBub2RlcyA9IG5vZGVzLnNldChpbmRleCwgcmV0KVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpcy5zZXQoJ25vZGVzJywgbm9kZXMpXG4gIH1cblxuICAvKipcbiAgICogUmVnZW5lcmF0ZSB0aGUgbm9kZSdzIGtleS5cbiAgICpcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgcmVnZW5lcmF0ZUtleSgpIHtcbiAgICBjb25zdCBrZXkgPSBnZW5lcmF0ZUtleSgpXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdrZXknLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgYG5vZGVgIGZyb20gdGhlIGNoaWxkcmVuIG5vZGUgbWFwLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIHJlbW92ZURlc2NlbmRhbnQoa2V5KSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcblxuICAgIGxldCBub2RlID0gdGhpc1xuICAgIGxldCBwYXJlbnQgPSBub2RlLmdldFBhcmVudChrZXkpXG4gICAgaWYgKCFwYXJlbnQpIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBkZXNjZW5kYW50IG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuXG4gICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuZmluZEluZGV4KG4gPT4gbi5rZXkgPT09IGtleSlcbiAgICBjb25zdCBub2RlcyA9IHBhcmVudC5ub2Rlcy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICBwYXJlbnQgPSBwYXJlbnQuc2V0KCdub2RlcycsIG5vZGVzKVxuICAgIG5vZGUgPSBub2RlLnVwZGF0ZU5vZGUocGFyZW50KVxuICAgIHJldHVybiBub2RlXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgbm9kZSBhdCBgaW5kZXhgLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgcmVtb3ZlTm9kZShpbmRleCkge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5ub2Rlcy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdub2RlcycsIG5vZGVzKVxuICB9XG5cbiAgLyoqXG4gICAqIFNwbGl0IGEgY2hpbGQgbm9kZSBieSBgaW5kZXhgIGF0IGBwb3NpdGlvbmAuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgc3BsaXROb2RlKGluZGV4LCBwb3NpdGlvbikge1xuICAgIGxldCBub2RlID0gdGhpc1xuICAgIGNvbnN0IGNoaWxkID0gbm9kZS5ub2Rlcy5nZXQoaW5kZXgpXG4gICAgbGV0IG9uZVxuICAgIGxldCB0d29cblxuICAgIC8vIElmIHRoZSBjaGlsZCBpcyBhIHRleHQgbm9kZSwgdGhlIGBwb3NpdGlvbmAgcmVmZXJzIHRvIHRoZSB0ZXh0IG9mZnNldCBhdFxuICAgIC8vIHdoaWNoIHRvIHNwbGl0IGl0LlxuICAgIGlmIChjaGlsZC5vYmplY3QgPT0gJ3RleHQnKSB7XG4gICAgICBjb25zdCBiZWZvcmVzID0gY2hpbGQuY2hhcmFjdGVycy50YWtlKHBvc2l0aW9uKVxuICAgICAgY29uc3QgYWZ0ZXJzID0gY2hpbGQuY2hhcmFjdGVycy5za2lwKHBvc2l0aW9uKVxuICAgICAgb25lID0gY2hpbGQuc2V0KCdjaGFyYWN0ZXJzJywgYmVmb3JlcylcbiAgICAgIHR3byA9IGNoaWxkLnNldCgnY2hhcmFjdGVycycsIGFmdGVycykucmVnZW5lcmF0ZUtleSgpXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiB0aGUgY2hpbGQgaXMgbm90IGEgdGV4dCBub2RlLCB0aGUgYHBvc2l0aW9uYCByZWZlcnMgdG8gdGhlXG4gICAgLy8gaW5kZXggYXQgd2hpY2ggdG8gc3BsaXQgaXRzIGNoaWxkcmVuLlxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgYmVmb3JlcyA9IGNoaWxkLm5vZGVzLnRha2UocG9zaXRpb24pXG4gICAgICBjb25zdCBhZnRlcnMgPSBjaGlsZC5ub2Rlcy5za2lwKHBvc2l0aW9uKVxuICAgICAgb25lID0gY2hpbGQuc2V0KCdub2RlcycsIGJlZm9yZXMpXG4gICAgICB0d28gPSBjaGlsZC5zZXQoJ25vZGVzJywgYWZ0ZXJzKS5yZWdlbmVyYXRlS2V5KClcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIG9sZCBub2RlIGFuZCBpbnNlcnQgdGhlIG5ld2x5IHNwbGl0IGNoaWxkcmVuLlxuICAgIG5vZGUgPSBub2RlLnJlbW92ZU5vZGUoaW5kZXgpXG4gICAgbm9kZSA9IG5vZGUuaW5zZXJ0Tm9kZShpbmRleCwgdHdvKVxuICAgIG5vZGUgPSBub2RlLmluc2VydE5vZGUoaW5kZXgsIG9uZSlcbiAgICByZXR1cm4gbm9kZVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIG5ldyB2YWx1ZSBmb3IgYSBjaGlsZCBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgdXBkYXRlTm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUua2V5ID09IHRoaXMua2V5KSB7XG4gICAgICByZXR1cm4gbm9kZVxuICAgIH1cblxuICAgIGxldCBjaGlsZCA9IHRoaXMuYXNzZXJ0RGVzY2VuZGFudChub2RlLmtleSlcbiAgICBjb25zdCBhbmNlc3RvcnMgPSB0aGlzLmdldEFuY2VzdG9ycyhub2RlLmtleSlcblxuICAgIGFuY2VzdG9ycy5yZXZlcnNlKCkuZm9yRWFjaCgocGFyZW50KSA9PiB7XG4gICAgICBsZXQgeyBub2RlcyB9ID0gcGFyZW50XG4gICAgICBjb25zdCBpbmRleCA9IG5vZGVzLmluZGV4T2YoY2hpbGQpXG4gICAgICBjaGlsZCA9IHBhcmVudFxuICAgICAgbm9kZXMgPSBub2Rlcy5zZXQoaW5kZXgsIG5vZGUpXG4gICAgICBwYXJlbnQgPSBwYXJlbnQuc2V0KCdub2RlcycsIG5vZGVzKVxuICAgICAgbm9kZSA9IHBhcmVudFxuICAgIH0pXG5cbiAgICByZXR1cm4gbm9kZVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoZSBub2RlIGFnYWluc3QgYSBgc2NoZW1hYC5cbiAgICpcbiAgICogQHBhcmFtIHtTY2hlbWF9IHNjaGVtYVxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbnxOdWxsfVxuICAgKi9cblxuICB2YWxpZGF0ZShzY2hlbWEpIHtcbiAgICByZXR1cm4gc2NoZW1hLnZhbGlkYXRlTm9kZSh0aGlzKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBc3NlcnQgYSBrZXkgYGFyZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFyZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGFzc2VydEtleShhcmcpIHtcbiAgaWYgKHR5cGVvZiBhcmcgPT0gJ3N0cmluZycpIHJldHVybiBhcmdcbiAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFxcYGtleVxcYCBhcmd1bWVudCEgSXQgbXVzdCBiZSBhIGtleSBzdHJpbmcsIGJ1dCB5b3UgcGFzc2VkOiAke2FyZ31gKVxufVxuXG4vKipcbiAqIE1lbW9pemUgcmVhZCBtZXRob2RzLlxuICovXG5cbm1lbW9pemUoTm9kZS5wcm90b3R5cGUsIFtcbiAgJ2dldEJsb2NrcycsXG4gICdnZXRCbG9ja3NBc0FycmF5JyxcbiAgJ2dldENoYXJhY3RlcnMnLFxuICAnZ2V0Q2hhcmFjdGVyc0FzQXJyYXknLFxuICAnZ2V0Rmlyc3RUZXh0JyxcbiAgJ2dldElubGluZXMnLFxuICAnZ2V0SW5saW5lc0FzQXJyYXknLFxuICAnZ2V0S2V5cycsXG4gICdnZXRLZXlzQXNBcnJheScsXG4gICdnZXRMYXN0VGV4dCcsXG4gICdnZXRNYXJrcycsXG4gICdnZXRPcmRlcmVkTWFya3MnLFxuICAnZ2V0TWFya3NBc0FycmF5JyxcbiAgJ2dldFRleHQnLFxuICAnZ2V0VGV4dERpcmVjdGlvbicsXG4gICdnZXRUZXh0cycsXG4gICdnZXRUZXh0c0FzQXJyYXknLFxuICAnaXNMZWFmQmxvY2snLFxuICAnaXNMZWFmSW5saW5lJyxcbl0sIHtcbiAgdGFrZXNBcmd1bWVudHM6IGZhbHNlXG59KVxuXG5tZW1vaXplKE5vZGUucHJvdG90eXBlLCBbXG4gICdhcmVEZXNjZW5kYW50c1NvcnRlZCcsXG4gICdnZXRBY3RpdmVNYXJrc0F0UmFuZ2UnLFxuICAnZ2V0QWN0aXZlTWFya3NBdFJhbmdlQXNBcnJheScsXG4gICdnZXRBbmNlc3RvcnMnLFxuICAnZ2V0QmxvY2tzQXRSYW5nZScsXG4gICdnZXRCbG9ja3NBdFJhbmdlQXNBcnJheScsXG4gICdnZXRCbG9ja3NCeVR5cGUnLFxuICAnZ2V0QmxvY2tzQnlUeXBlQXNBcnJheScsXG4gICdnZXRDaGFyYWN0ZXJzQXRSYW5nZScsXG4gICdnZXRDaGFyYWN0ZXJzQXRSYW5nZUFzQXJyYXknLFxuICAnZ2V0Q2hpbGQnLFxuICAnZ2V0Q2xvc2VzdEJsb2NrJyxcbiAgJ2dldENsb3Nlc3RJbmxpbmUnLFxuICAnZ2V0Q2xvc2VzdFZvaWQnLFxuICAnZ2V0Q29tbW9uQW5jZXN0b3InLFxuICAnZ2V0RGVjb3JhdGlvbnMnLFxuICAnZ2V0RGVwdGgnLFxuICAnZ2V0RGVzY2VuZGFudCcsXG4gICdnZXREZXNjZW5kYW50QXRQYXRoJyxcbiAgJ2dldEZyYWdtZW50QXRSYW5nZScsXG4gICdnZXRGdXJ0aGVzdEJsb2NrJyxcbiAgJ2dldEZ1cnRoZXN0SW5saW5lJyxcbiAgJ2dldEZ1cnRoZXN0QW5jZXN0b3InLFxuICAnZ2V0RnVydGhlc3RPbmx5Q2hpbGRBbmNlc3RvcicsXG4gICdnZXRJbmxpbmVzQXRSYW5nZScsXG4gICdnZXRJbmxpbmVzQXRSYW5nZUFzQXJyYXknLFxuICAnZ2V0SW5saW5lc0J5VHlwZScsXG4gICdnZXRJbmxpbmVzQnlUeXBlQXNBcnJheScsXG4gICdnZXRNYXJrc0F0UmFuZ2UnLFxuICAnZ2V0SW5zZXJ0TWFya3NBdFJhbmdlJyxcbiAgJ2dldE9yZGVyZWRNYXJrc0F0UmFuZ2UnLFxuICAnZ2V0TWFya3NBdFJhbmdlQXNBcnJheScsXG4gICdnZXRJbnNlcnRNYXJrc0F0UmFuZ2VBc0FycmF5JyxcbiAgJ2dldE1hcmtzQnlUeXBlJyxcbiAgJ2dldE9yZGVyZWRNYXJrc0J5VHlwZScsXG4gICdnZXRNYXJrc0J5VHlwZUFzQXJyYXknLFxuICAnZ2V0TmV4dEJsb2NrJyxcbiAgJ2dldE5leHRTaWJsaW5nJyxcbiAgJ2dldE5leHRUZXh0JyxcbiAgJ2dldE5vZGUnLFxuICAnZ2V0Tm9kZUF0UGF0aCcsXG4gICdnZXRPZmZzZXQnLFxuICAnZ2V0T2Zmc2V0QXRSYW5nZScsXG4gICdnZXRQYXJlbnQnLFxuICAnZ2V0UGF0aCcsXG4gICdnZXRQbGFjZWhvbGRlcicsXG4gICdnZXRQcmV2aW91c0Jsb2NrJyxcbiAgJ2dldFByZXZpb3VzU2libGluZycsXG4gICdnZXRQcmV2aW91c1RleHQnLFxuICAnZ2V0VGV4dEF0T2Zmc2V0JyxcbiAgJ2dldFRleHRzQXRSYW5nZScsXG4gICdnZXRUZXh0c0F0UmFuZ2VBc0FycmF5JyxcbiAgJ2hhc0NoaWxkJyxcbiAgJ2hhc0Rlc2NlbmRhbnQnLFxuICAnaGFzTm9kZScsXG4gICdoYXNWb2lkUGFyZW50JyxcbiAgJ3ZhbGlkYXRlJyxcbl0sIHtcbiAgdGFrZXNBcmd1bWVudHM6IHRydWVcbn0pXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgTm9kZVxuIl19