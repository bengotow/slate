'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Define the core schema rules, order-sensitive.
 *
 * @type {Array}
 */

var CORE_SCHEMA_RULES = [

/**
 * Only allow block nodes in documents.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'document') return;
    var invalids = node.nodes.filter(function (n) {
      return n.object != 'block';
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Only allow block nodes or inline and text nodes in blocks.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block') return;
    var first = node.nodes.first();
    if (!first) return;
    var objects = first.object == 'block' ? ['block'] : ['inline', 'text'];
    var invalids = node.nodes.filter(function (n) {
      return !objects.includes(n.object);
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Only allow inline and text nodes in inlines.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'inline') return;
    var invalids = node.nodes.filter(function (n) {
      return n.object != 'inline' && n.object != 'text';
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that block and inline nodes have at least one text child.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;
    if (node.nodes.size > 0) return;

    return function (change) {
      var text = _text2.default.create();
      change.insertNodeByKey(node.key, 0, text, { normalize: false });
    };
  }
},

/**
 * Ensure that void nodes contain a text node with a single space of text.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (!node.isVoid) return;
    if (node.object != 'block' && node.object != 'inline') return;
    if (node.text == ' ' && node.nodes.size == 1) return;

    return function (change) {
      var text = _text2.default.create(' ');
      var index = node.nodes.size;

      change.insertNodeByKey(node.key, index, text, { normalize: false });

      node.nodes.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that inline nodes are never empty.
 *
 * This rule is applied to all blocks, because when they contain an empty
 * inline, we need to remove the inline from that parent block. If `validate`
 * was to be memoized, it should be against the parent node, not the inline
 * themselves.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block') return;
    var invalids = node.nodes.filter(function (n) {
      return n.object == 'inline' && n.text == '';
    });
    if (!invalids.size) return;

    return function (change) {
      // If all of the block's nodes are invalid, insert an empty text node so
      // that the selection will be preserved when they are all removed.
      if (node.nodes.size == invalids.size) {
        var text = _text2.default.create();
        change.insertNodeByKey(node.key, 1, text, { normalize: false });
      }

      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that inline void nodes are surrounded by text nodes, by adding extra
 * blank text nodes if necessary.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;

    var invalids = node.nodes.reduce(function (list, child, index) {
      if (child.object !== 'inline') return list;

      var prev = index > 0 ? node.nodes.get(index - 1) : null;
      var next = node.nodes.get(index + 1);
      // We don't test if "prev" is inline, since it has already been processed in the loop
      var insertBefore = !prev;
      var insertAfter = !next || next.object == 'inline';

      if (insertAfter || insertBefore) {
        list = list.push({ insertAfter: insertAfter, insertBefore: insertBefore, index: index });
      }

      return list;
    }, new _immutable.List());

    if (!invalids.size) return;

    return function (change) {
      // Shift for every text node inserted previously.
      var shift = 0;

      invalids.forEach(function (_ref) {
        var index = _ref.index,
            insertAfter = _ref.insertAfter,
            insertBefore = _ref.insertBefore;

        if (insertBefore) {
          change.insertNodeByKey(node.key, shift + index, _text2.default.create(), { normalize: false });
          shift++;
        }

        if (insertAfter) {
          change.insertNodeByKey(node.key, shift + index + 1, _text2.default.create(), { normalize: false });
          shift++;
        }
      });
    };
  }
},

/**
 * Merge adjacent text nodes.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;

    var invalids = node.nodes.map(function (child, i) {
      var next = node.nodes.get(i + 1);
      if (child.object != 'text') return;
      if (!next || next.object != 'text') return;
      return next;
    }).filter(Boolean);

    if (!invalids.size) return;

    return function (change) {
      // Reverse the list to handle consecutive merges, since the earlier nodes
      // will always exist after each merge.
      invalids.reverse().forEach(function (n) {
        change.mergeNodeByKey(n.key, { normalize: false });
      });
    };
  }
},

/**
 * Prevent extra empty text nodes, except when adjacent to inline void nodes.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;
    var nodes = node.nodes;

    if (nodes.size <= 1) return;

    var invalids = nodes.filter(function (desc, i) {
      if (desc.object != 'text') return;
      if (desc.text.length > 0) return;

      var prev = i > 0 ? nodes.get(i - 1) : null;
      var next = nodes.get(i + 1);

      // If it's the first node, and the next is a void, preserve it.
      if (!prev && next.object == 'inline') return;

      // It it's the last node, and the previous is an inline, preserve it.
      if (!next && prev.object == 'inline') return;

      // If it's surrounded by inlines, preserve it.
      if (next && prev && next.object == 'inline' && prev.object == 'inline') return;

      // Otherwise, remove it.
      return true;
    });

    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (text) {
        change.removeNodeByKey(text.key, { normalize: false });
      });
    };
  }
}];

/**
 * Export.
 *
 * @type {Array}
 */

exports.default = CORE_SCHEMA_RULES;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvY29yZS1zY2hlbWEtcnVsZXMuanMiXSwibmFtZXMiOlsiQ09SRV9TQ0hFTUFfUlVMRVMiLCJ2YWxpZGF0ZU5vZGUiLCJub2RlIiwib2JqZWN0IiwiaW52YWxpZHMiLCJub2RlcyIsImZpbHRlciIsIm4iLCJzaXplIiwiY2hhbmdlIiwiZm9yRWFjaCIsImNoaWxkIiwicmVtb3ZlTm9kZUJ5S2V5Iiwia2V5Iiwibm9ybWFsaXplIiwiZmlyc3QiLCJvYmplY3RzIiwiaW5jbHVkZXMiLCJ0ZXh0IiwiY3JlYXRlIiwiaW5zZXJ0Tm9kZUJ5S2V5IiwiaXNWb2lkIiwiaW5kZXgiLCJyZWR1Y2UiLCJsaXN0IiwicHJldiIsImdldCIsIm5leHQiLCJpbnNlcnRCZWZvcmUiLCJpbnNlcnRBZnRlciIsInB1c2giLCJzaGlmdCIsIm1hcCIsImkiLCJCb29sZWFuIiwicmV2ZXJzZSIsIm1lcmdlTm9kZUJ5S2V5IiwiZGVzYyIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBRUE7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxvQkFBb0I7O0FBRXhCOzs7Ozs7QUFNQTtBQUNFQyxjQURGLHdCQUNlQyxJQURmLEVBQ3FCO0FBQ2pCLFFBQUlBLEtBQUtDLE1BQUwsSUFBZSxVQUFuQixFQUErQjtBQUMvQixRQUFNQyxXQUFXRixLQUFLRyxLQUFMLENBQVdDLE1BQVgsQ0FBa0I7QUFBQSxhQUFLQyxFQUFFSixNQUFGLElBQVksT0FBakI7QUFBQSxLQUFsQixDQUFqQjtBQUNBLFFBQUksQ0FBQ0MsU0FBU0ksSUFBZCxFQUFvQjs7QUFFcEIsV0FBTyxVQUFDQyxNQUFELEVBQVk7QUFDakJMLGVBQVNNLE9BQVQsQ0FBaUIsVUFBQ0MsS0FBRCxFQUFXO0FBQzFCRixlQUFPRyxlQUFQLENBQXVCRCxNQUFNRSxHQUE3QixFQUFrQyxFQUFFQyxXQUFXLEtBQWIsRUFBbEM7QUFDRCxPQUZEO0FBR0QsS0FKRDtBQUtEO0FBWEgsQ0FSd0I7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YS1ydWxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgTGlzdCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuaW1wb3J0IFRleHQgZnJvbSAnLi4vbW9kZWxzL3RleHQnXG5cbi8qKlxuICogRGVmaW5lIHRoZSBjb3JlIHNjaGVtYSBydWxlcywgb3JkZXItc2Vuc2l0aXZlLlxuICpcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuXG5jb25zdCBDT1JFX1NDSEVNQV9SVUxFUyA9IFtcblxuICAvKipcbiAgICogT25seSBhbGxvdyBibG9jayBub2RlcyBpbiBkb2N1bWVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHtcbiAgICB2YWxpZGF0ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ICE9ICdkb2N1bWVudCcpIHJldHVyblxuICAgICAgY29uc3QgaW52YWxpZHMgPSBub2RlLm5vZGVzLmZpbHRlcihuID0+IG4ub2JqZWN0ICE9ICdibG9jaycpXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE9ubHkgYWxsb3cgYmxvY2sgbm9kZXMgb3IgaW5saW5lIGFuZCB0ZXh0IG5vZGVzIGluIGJsb2Nrcy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAge1xuICAgIHZhbGlkYXRlTm9kZShub2RlKSB7XG4gICAgICBpZiAobm9kZS5vYmplY3QgIT0gJ2Jsb2NrJykgcmV0dXJuXG4gICAgICBjb25zdCBmaXJzdCA9IG5vZGUubm9kZXMuZmlyc3QoKVxuICAgICAgaWYgKCFmaXJzdCkgcmV0dXJuXG4gICAgICBjb25zdCBvYmplY3RzID0gZmlyc3Qub2JqZWN0ID09ICdibG9jaycgPyBbJ2Jsb2NrJ10gOiBbJ2lubGluZScsICd0ZXh0J11cbiAgICAgIGNvbnN0IGludmFsaWRzID0gbm9kZS5ub2Rlcy5maWx0ZXIobiA9PiAhb2JqZWN0cy5pbmNsdWRlcyhuLm9iamVjdCkpXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE9ubHkgYWxsb3cgaW5saW5lIGFuZCB0ZXh0IG5vZGVzIGluIGlubGluZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHtcbiAgICB2YWxpZGF0ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ICE9ICdpbmxpbmUnKSByZXR1cm5cbiAgICAgIGNvbnN0IGludmFsaWRzID0gbm9kZS5ub2Rlcy5maWx0ZXIobiA9PiBuLm9iamVjdCAhPSAnaW5saW5lJyAmJiBuLm9iamVjdCAhPSAndGV4dCcpXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IGJsb2NrIGFuZCBpbmxpbmUgbm9kZXMgaGF2ZSBhdCBsZWFzdCBvbmUgdGV4dCBjaGlsZC5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAge1xuICAgIHZhbGlkYXRlTm9kZShub2RlKSB7XG4gICAgICBpZiAobm9kZS5vYmplY3QgIT0gJ2Jsb2NrJyAmJiBub2RlLm9iamVjdCAhPSAnaW5saW5lJykgcmV0dXJuXG4gICAgICBpZiAobm9kZS5ub2Rlcy5zaXplID4gMCkgcmV0dXJuXG5cbiAgICAgIHJldHVybiAoY2hhbmdlKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBUZXh0LmNyZWF0ZSgpXG4gICAgICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkobm9kZS5rZXksIDAsIHRleHQsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRW5zdXJlIHRoYXQgdm9pZCBub2RlcyBjb250YWluIGEgdGV4dCBub2RlIHdpdGggYSBzaW5nbGUgc3BhY2Ugb2YgdGV4dC5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAge1xuICAgIHZhbGlkYXRlTm9kZShub2RlKSB7XG4gICAgICBpZiAoIW5vZGUuaXNWb2lkKSByZXR1cm5cbiAgICAgIGlmIChub2RlLm9iamVjdCAhPSAnYmxvY2snICYmIG5vZGUub2JqZWN0ICE9ICdpbmxpbmUnKSByZXR1cm5cbiAgICAgIGlmIChub2RlLnRleHQgPT0gJyAnICYmIG5vZGUubm9kZXMuc2l6ZSA9PSAxKSByZXR1cm5cblxuICAgICAgcmV0dXJuIChjaGFuZ2UpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IFRleHQuY3JlYXRlKCcgJylcbiAgICAgICAgY29uc3QgaW5kZXggPSBub2RlLm5vZGVzLnNpemVcblxuICAgICAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KG5vZGUua2V5LCBpbmRleCwgdGV4dCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICAgICAgbm9kZS5ub2Rlcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IGlubGluZSBub2RlcyBhcmUgbmV2ZXIgZW1wdHkuXG4gICAqXG4gICAqIFRoaXMgcnVsZSBpcyBhcHBsaWVkIHRvIGFsbCBibG9ja3MsIGJlY2F1c2Ugd2hlbiB0aGV5IGNvbnRhaW4gYW4gZW1wdHlcbiAgICogaW5saW5lLCB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgaW5saW5lIGZyb20gdGhhdCBwYXJlbnQgYmxvY2suIElmIGB2YWxpZGF0ZWBcbiAgICogd2FzIHRvIGJlIG1lbW9pemVkLCBpdCBzaG91bGQgYmUgYWdhaW5zdCB0aGUgcGFyZW50IG5vZGUsIG5vdCB0aGUgaW5saW5lXG4gICAqIHRoZW1zZWx2ZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHtcbiAgICB2YWxpZGF0ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ICE9ICdibG9jaycpIHJldHVyblxuICAgICAgY29uc3QgaW52YWxpZHMgPSBub2RlLm5vZGVzLmZpbHRlcihuID0+IG4ub2JqZWN0ID09ICdpbmxpbmUnICYmIG4udGV4dCA9PSAnJylcbiAgICAgIGlmICghaW52YWxpZHMuc2l6ZSkgcmV0dXJuXG5cbiAgICAgIHJldHVybiAoY2hhbmdlKSA9PiB7XG4gICAgICAgIC8vIElmIGFsbCBvZiB0aGUgYmxvY2sncyBub2RlcyBhcmUgaW52YWxpZCwgaW5zZXJ0IGFuIGVtcHR5IHRleHQgbm9kZSBzb1xuICAgICAgICAvLyB0aGF0IHRoZSBzZWxlY3Rpb24gd2lsbCBiZSBwcmVzZXJ2ZWQgd2hlbiB0aGV5IGFyZSBhbGwgcmVtb3ZlZC5cbiAgICAgICAgaWYgKG5vZGUubm9kZXMuc2l6ZSA9PSBpbnZhbGlkcy5zaXplKSB7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IFRleHQuY3JlYXRlKClcbiAgICAgICAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KG5vZGUua2V5LCAxLCB0ZXh0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGludmFsaWRzLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShjaGlsZC5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRW5zdXJlIHRoYXQgaW5saW5lIHZvaWQgbm9kZXMgYXJlIHN1cnJvdW5kZWQgYnkgdGV4dCBub2RlcywgYnkgYWRkaW5nIGV4dHJhXG4gICAqIGJsYW5rIHRleHQgbm9kZXMgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB7XG4gICAgdmFsaWRhdGVOb2RlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLm9iamVjdCAhPSAnYmxvY2snICYmIG5vZGUub2JqZWN0ICE9ICdpbmxpbmUnKSByZXR1cm5cblxuICAgICAgY29uc3QgaW52YWxpZHMgPSBub2RlLm5vZGVzLnJlZHVjZSgobGlzdCwgY2hpbGQsIGluZGV4KSA9PiB7XG4gICAgICAgIGlmIChjaGlsZC5vYmplY3QgIT09ICdpbmxpbmUnKSByZXR1cm4gbGlzdFxuXG4gICAgICAgIGNvbnN0IHByZXYgPSBpbmRleCA+IDAgPyBub2RlLm5vZGVzLmdldChpbmRleCAtIDEpIDogbnVsbFxuICAgICAgICBjb25zdCBuZXh0ID0gbm9kZS5ub2Rlcy5nZXQoaW5kZXggKyAxKVxuICAgICAgICAvLyBXZSBkb24ndCB0ZXN0IGlmIFwicHJldlwiIGlzIGlubGluZSwgc2luY2UgaXQgaGFzIGFscmVhZHkgYmVlbiBwcm9jZXNzZWQgaW4gdGhlIGxvb3BcbiAgICAgICAgY29uc3QgaW5zZXJ0QmVmb3JlID0gIXByZXZcbiAgICAgICAgY29uc3QgaW5zZXJ0QWZ0ZXIgPSAhbmV4dCB8fCAobmV4dC5vYmplY3QgPT0gJ2lubGluZScpXG5cbiAgICAgICAgaWYgKGluc2VydEFmdGVyIHx8IGluc2VydEJlZm9yZSkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LnB1c2goeyBpbnNlcnRBZnRlciwgaW5zZXJ0QmVmb3JlLCBpbmRleCB9KVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpc3RcbiAgICAgIH0sIG5ldyBMaXN0KCkpXG5cbiAgICAgIGlmICghaW52YWxpZHMuc2l6ZSkgcmV0dXJuXG5cbiAgICAgIHJldHVybiAoY2hhbmdlKSA9PiB7XG4gICAgICAgIC8vIFNoaWZ0IGZvciBldmVyeSB0ZXh0IG5vZGUgaW5zZXJ0ZWQgcHJldmlvdXNseS5cbiAgICAgICAgbGV0IHNoaWZ0ID0gMFxuXG4gICAgICAgIGludmFsaWRzLmZvckVhY2goKHsgaW5kZXgsIGluc2VydEFmdGVyLCBpbnNlcnRCZWZvcmUgfSkgPT4ge1xuICAgICAgICAgIGlmIChpbnNlcnRCZWZvcmUpIHtcbiAgICAgICAgICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkobm9kZS5rZXksIHNoaWZ0ICsgaW5kZXgsIFRleHQuY3JlYXRlKCksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgICAgICAgc2hpZnQrK1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpbnNlcnRBZnRlcikge1xuICAgICAgICAgICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShub2RlLmtleSwgc2hpZnQgKyBpbmRleCArIDEsIFRleHQuY3JlYXRlKCksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgICAgICAgc2hpZnQrK1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE1lcmdlIGFkamFjZW50IHRleHQgbm9kZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHtcbiAgICB2YWxpZGF0ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUub2JqZWN0ICE9ICdibG9jaycgJiYgbm9kZS5vYmplY3QgIT0gJ2lubGluZScpIHJldHVyblxuXG4gICAgICBjb25zdCBpbnZhbGlkcyA9IG5vZGUubm9kZXNcbiAgICAgICAgLm1hcCgoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICBjb25zdCBuZXh0ID0gbm9kZS5ub2Rlcy5nZXQoaSArIDEpXG4gICAgICAgICAgaWYgKGNoaWxkLm9iamVjdCAhPSAndGV4dCcpIHJldHVyblxuICAgICAgICAgIGlmICghbmV4dCB8fCBuZXh0Lm9iamVjdCAhPSAndGV4dCcpIHJldHVyblxuICAgICAgICAgIHJldHVybiBuZXh0XG4gICAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbilcblxuICAgICAgaWYgKCFpbnZhbGlkcy5zaXplKSByZXR1cm5cblxuICAgICAgcmV0dXJuIChjaGFuZ2UpID0+IHtcbiAgICAgICAgLy8gUmV2ZXJzZSB0aGUgbGlzdCB0byBoYW5kbGUgY29uc2VjdXRpdmUgbWVyZ2VzLCBzaW5jZSB0aGUgZWFybGllciBub2Rlc1xuICAgICAgICAvLyB3aWxsIGFsd2F5cyBleGlzdCBhZnRlciBlYWNoIG1lcmdlLlxuICAgICAgICBpbnZhbGlkcy5yZXZlcnNlKCkuZm9yRWFjaCgobikgPT4ge1xuICAgICAgICAgIGNoYW5nZS5tZXJnZU5vZGVCeUtleShuLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBQcmV2ZW50IGV4dHJhIGVtcHR5IHRleHQgbm9kZXMsIGV4Y2VwdCB3aGVuIGFkamFjZW50IHRvIGlubGluZSB2b2lkIG5vZGVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB7XG4gICAgdmFsaWRhdGVOb2RlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLm9iamVjdCAhPSAnYmxvY2snICYmIG5vZGUub2JqZWN0ICE9ICdpbmxpbmUnKSByZXR1cm5cbiAgICAgIGNvbnN0IHsgbm9kZXMgfSA9IG5vZGVcbiAgICAgIGlmIChub2Rlcy5zaXplIDw9IDEpIHJldHVyblxuXG4gICAgICBjb25zdCBpbnZhbGlkcyA9IG5vZGVzLmZpbHRlcigoZGVzYywgaSkgPT4ge1xuICAgICAgICBpZiAoZGVzYy5vYmplY3QgIT0gJ3RleHQnKSByZXR1cm5cbiAgICAgICAgaWYgKGRlc2MudGV4dC5sZW5ndGggPiAwKSByZXR1cm5cblxuICAgICAgICBjb25zdCBwcmV2ID0gaSA+IDAgPyBub2Rlcy5nZXQoaSAtIDEpIDogbnVsbFxuICAgICAgICBjb25zdCBuZXh0ID0gbm9kZXMuZ2V0KGkgKyAxKVxuXG4gICAgICAgIC8vIElmIGl0J3MgdGhlIGZpcnN0IG5vZGUsIGFuZCB0aGUgbmV4dCBpcyBhIHZvaWQsIHByZXNlcnZlIGl0LlxuICAgICAgICBpZiAoIXByZXYgJiYgbmV4dC5vYmplY3QgPT0gJ2lubGluZScpIHJldHVyblxuXG4gICAgICAgIC8vIEl0IGl0J3MgdGhlIGxhc3Qgbm9kZSwgYW5kIHRoZSBwcmV2aW91cyBpcyBhbiBpbmxpbmUsIHByZXNlcnZlIGl0LlxuICAgICAgICBpZiAoIW5leHQgJiYgcHJldi5vYmplY3QgPT0gJ2lubGluZScpIHJldHVyblxuXG4gICAgICAgIC8vIElmIGl0J3Mgc3Vycm91bmRlZCBieSBpbmxpbmVzLCBwcmVzZXJ2ZSBpdC5cbiAgICAgICAgaWYgKG5leHQgJiYgcHJldiAmJiBuZXh0Lm9iamVjdCA9PSAnaW5saW5lJyAmJiBwcmV2Lm9iamVjdCA9PSAnaW5saW5lJykgcmV0dXJuXG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCByZW1vdmUgaXQuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9KVxuXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKCh0ZXh0KSA9PiB7XG4gICAgICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleSh0ZXh0LmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbl1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IENPUkVfU0NIRU1BX1JVTEVTXG4iXX0=