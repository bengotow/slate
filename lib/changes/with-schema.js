'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Normalize the value with its schema.
 *
 * @param {Change} change
 */

Changes.normalize = function (change) {
  change.normalizeDocument();
};

/**
 * Normalize the document with the value's schema.
 *
 * @param {Change} change
 */

Changes.normalizeDocument = function (change) {
  var value = change.value;
  var document = value.document;

  change.normalizeNodeByKey(document.key);
};

/**
 * Normalize a `node` and its children with the value's schema.
 *
 * @param {Change} change
 * @param {Node|String} key
 */

Changes.normalizeNodeByKey = function (change, key) {
  var value = change.value;
  var document = value.document,
      schema = value.schema;

  var node = document.assertNode(key);

  normalizeNodeAndChildren(change, node, schema);

  document = change.value.document;
  var ancestors = document.getAncestors(key);
  if (!ancestors) return;

  ancestors.forEach(function (ancestor) {
    normalizeNode(change, ancestor, schema);
  });
};

/**
 * Normalize a `node` and its children with a `schema`.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNodeAndChildren(change, node, schema) {
  if (node.object == 'text') {
    normalizeNode(change, node, schema);
    return;
  }

  // We can't just loop the children and normalize them, because in the process
  // of normalizing one child, we might end up creating another. Instead, we
  // have to normalize one at a time, and check for new children along the way.
  // PERF: use a mutable array here instead of an immutable stack.
  var keys = node.nodes.toArray().map(function (n) {
    return n.key;
  });

  // While there is still a child key that hasn't been normalized yet...

  var _loop = function _loop() {
    var size = change.operations.size;

    var key = void 0;

    // PERF: use a mutable set here since we'll be add to it a lot.
    var set = new _immutable.Set().asMutable();

    // Unwind the stack, normalizing every child and adding it to the set.
    while (key = keys[0]) {
      var child = node.getChild(key);
      normalizeNodeAndChildren(change, child, schema);
      set.add(key);
      keys.shift();
    }

    // Turn the set immutable to be able to compare against it.
    set = set.asImmutable();

    // PERF: Only re-find the node and re-normalize any new children if
    // operations occured that might have changed it.
    if (change.operations.size > size) {
      node = refindNode(change, node);

      // Add any new children back onto the stack.
      node.nodes.forEach(function (n) {
        if (set.has(n.key)) return;
        keys.unshift(n.key);
      });
    }
  };

  while (keys.length) {
    _loop();
  }

  // Normalize the node itself if it still exists.
  if (node) {
    normalizeNode(change, node, schema);
  }
}

/**
 * Re-find a reference to a node that may have been modified or removed
 * entirely by a change.
 *
 * @param {Change} change
 * @param {Node} node
 * @return {Node}
 */

function refindNode(change, node) {
  var value = change.value;
  var document = value.document;

  return node.object == 'document' ? document : document.getDescendant(node.key);
}

/**
 * Normalize a `node` with a `schema`, but not its children.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNode(change, node, schema) {
  var max = schema.stack.plugins.length + 1;
  var iterations = 0;

  function iterate(c, n) {
    var normalize = n.validate(schema);
    if (!normalize) return;

    // Run the `normalize` function to fix the node.
    normalize(c);

    // Re-find the node reference, in case it was updated. If the node no longer
    // exists, we're done for this branch.
    n = refindNode(c, n);
    if (!n) return;

    // Increment the iterations counter, and check to make sure that we haven't
    // exceeded the max. Without this check, it's easy for the `validate` or
    // `normalize` function of a schema rule to be written incorrectly and for
    // an infinite invalid loop to occur.
    iterations++;

    if (iterations > max) {
      throw new Error('A schema rule could not be validated after sufficient iterations. This is usually due to a `rule.validate` or `rule.normalize` function of a schema being incorrectly written, causing an infinite loop.');
    }

    // Otherwise, iterate again.
    iterate(c, n);
  }

  iterate(change, node);
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL3dpdGgtc2NoZW1hLmpzIl0sIm5hbWVzIjpbIkNoYW5nZXMiLCJub3JtYWxpemUiLCJjaGFuZ2UiLCJub3JtYWxpemVEb2N1bWVudCIsInZhbHVlIiwiZG9jdW1lbnQiLCJub3JtYWxpemVOb2RlQnlLZXkiLCJrZXkiLCJzY2hlbWEiLCJub2RlIiwiYXNzZXJ0Tm9kZSIsIm5vcm1hbGl6ZU5vZGVBbmRDaGlsZHJlbiIsImFuY2VzdG9ycyIsImdldEFuY2VzdG9ycyIsImZvckVhY2giLCJhbmNlc3RvciIsIm5vcm1hbGl6ZU5vZGUiLCJvYmplY3QiLCJrZXlzIiwibm9kZXMiLCJ0b0FycmF5IiwibWFwIiwibiIsInNpemUiLCJvcGVyYXRpb25zIiwic2V0IiwiYXNNdXRhYmxlIiwiY2hpbGQiLCJnZXRDaGlsZCIsImFkZCIsInNoaWZ0IiwiYXNJbW11dGFibGUiLCJyZWZpbmROb2RlIiwiaGFzIiwidW5zaGlmdCIsImxlbmd0aCIsImdldERlc2NlbmRhbnQiLCJtYXgiLCJzdGFjayIsInBsdWdpbnMiLCJpdGVyYXRpb25zIiwiaXRlcmF0ZSIsImMiLCJ2YWxpZGF0ZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsVUFBVSxFQUFoQjs7QUFFQTs7Ozs7O0FBTUFBLFFBQVFDLFNBQVIsR0FBb0IsVUFBQ0MsTUFBRCxFQUFZO0FBQzlCQSxTQUFPQyxpQkFBUDtBQUNELENBRkQ7O0FBSUE7Ozs7OztBQU1BSCxRQUFRRyxpQkFBUixHQUE0QixVQUFDRCxNQUFELEVBQVk7QUFBQSxNQUM5QkUsS0FEOEIsR0FDcEJGLE1BRG9CLENBQzlCRSxLQUQ4QjtBQUFBLE1BRTlCQyxRQUY4QixHQUVqQkQsS0FGaUIsQ0FFOUJDLFFBRjhCOztBQUd0Q0gsU0FBT0ksa0JBQVAsQ0FBMEJELFNBQVNFLEdBQW5DO0FBQ0QsQ0FKRDs7QUFNQTs7Ozs7OztBQU9BUCxRQUFRTSxrQkFBUixHQUE2QixV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LElBQS9CLEVBQXFDRCxNQUFyQyxFQUE2QztBQUMzQyxNQUFNNkIsTUFBTTdCLE9BQU84QixLQUFQLENBQWFDLE9BQWIsQ0FBcUJKLE1BQXJCLEdBQThCLENBQTFDO0FBQ0EsTUFBSUssYUFBYSxDQUFqQjs7QUFFQSxXQUFTQyxPQUFULENBQWlCQyxDQUFqQixFQUFvQnBCLENBQXBCLEVBQXVCO0FBQ3JCLFFBQU1yQixZQUFZcUIsRUFBRXFCLFFBQUYsQ0FBV25DLE1BQVgsQ0FBbEI7QUFDQSxRQUFJLENBQUNQLFNBQUwsRUFBZ0I7O0FBRWhCO0FBQ0FBLGNBQVV5QyxDQUFWOztBQUVBO0FBQ0E7QUFDQXBCLFFBQUlVLFdBQVdVLENBQVgsRUFBY3BCLENBQWQsQ0FBSjtBQUNBLFFBQUksQ0FBQ0EsQ0FBTCxFQUFROztBQUVSO0FBQ0E7QUFDQTtBQUNBO0FBQ0FrQjs7QUFFQSxRQUFJQSxhQUFhSCxHQUFqQixFQUFzQjtBQUNwQixZQUFNLElBQUlPLEtBQUosQ0FBVSwwTUFBVixDQUFOO0FBQ0Q7O0FBRUQ7QUFDQUgsWUFBUUMsQ0FBUixFQUFXcEIsQ0FBWDtBQUNEOztBQUVEbUIsVUFBUXZDLE1BQVIsRUFBZ0JPLElBQWhCO0FBQ0Q7O0FBRUQ7Ozs7OztrQkFNZVQsTyIsImZpbGUiOiJ3aXRoLXNjaGVtYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgU2V0IH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG4vKipcbiAqIENoYW5nZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBDaGFuZ2VzID0ge31cblxuLyoqXG4gKiBOb3JtYWxpemUgdGhlIHZhbHVlIHdpdGggaXRzIHNjaGVtYS5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKi9cblxuQ2hhbmdlcy5ub3JtYWxpemUgPSAoY2hhbmdlKSA9PiB7XG4gIGNoYW5nZS5ub3JtYWxpemVEb2N1bWVudCgpXG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBkb2N1bWVudCB3aXRoIHRoZSB2YWx1ZSdzIHNjaGVtYS5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKi9cblxuQ2hhbmdlcy5ub3JtYWxpemVEb2N1bWVudCA9IChjaGFuZ2UpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoZG9jdW1lbnQua2V5KVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIGBub2RlYCBhbmQgaXRzIGNoaWxkcmVuIHdpdGggdGhlIHZhbHVlJ3Mgc2NoZW1hLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7Tm9kZXxTdHJpbmd9IGtleVxuICovXG5cbkNoYW5nZXMubm9ybWFsaXplTm9kZUJ5S2V5ID0gKGNoYW5nZSwga2V5KSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBsZXQgeyBkb2N1bWVudCwgc2NoZW1hIH0gPSB2YWx1ZVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0Tm9kZShrZXkpXG5cbiAgbm9ybWFsaXplTm9kZUFuZENoaWxkcmVuKGNoYW5nZSwgbm9kZSwgc2NoZW1hKVxuXG4gIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG4gIGNvbnN0IGFuY2VzdG9ycyA9IGRvY3VtZW50LmdldEFuY2VzdG9ycyhrZXkpXG4gIGlmICghYW5jZXN0b3JzKSByZXR1cm5cblxuICBhbmNlc3RvcnMuZm9yRWFjaCgoYW5jZXN0b3IpID0+IHtcbiAgICBub3JtYWxpemVOb2RlKGNoYW5nZSwgYW5jZXN0b3IsIHNjaGVtYSlcbiAgfSlcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSBgbm9kZWAgYW5kIGl0cyBjaGlsZHJlbiB3aXRoIGEgYHNjaGVtYWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge1NjaGVtYX0gc2NoZW1hXG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplTm9kZUFuZENoaWxkcmVuKGNoYW5nZSwgbm9kZSwgc2NoZW1hKSB7XG4gIGlmIChub2RlLm9iamVjdCA9PSAndGV4dCcpIHtcbiAgICBub3JtYWxpemVOb2RlKGNoYW5nZSwgbm9kZSwgc2NoZW1hKVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gV2UgY2FuJ3QganVzdCBsb29wIHRoZSBjaGlsZHJlbiBhbmQgbm9ybWFsaXplIHRoZW0sIGJlY2F1c2UgaW4gdGhlIHByb2Nlc3NcbiAgLy8gb2Ygbm9ybWFsaXppbmcgb25lIGNoaWxkLCB3ZSBtaWdodCBlbmQgdXAgY3JlYXRpbmcgYW5vdGhlci4gSW5zdGVhZCwgd2VcbiAgLy8gaGF2ZSB0byBub3JtYWxpemUgb25lIGF0IGEgdGltZSwgYW5kIGNoZWNrIGZvciBuZXcgY2hpbGRyZW4gYWxvbmcgdGhlIHdheS5cbiAgLy8gUEVSRjogdXNlIGEgbXV0YWJsZSBhcnJheSBoZXJlIGluc3RlYWQgb2YgYW4gaW1tdXRhYmxlIHN0YWNrLlxuICBjb25zdCBrZXlzID0gbm9kZS5ub2Rlcy50b0FycmF5KCkubWFwKG4gPT4gbi5rZXkpXG5cbiAgLy8gV2hpbGUgdGhlcmUgaXMgc3RpbGwgYSBjaGlsZCBrZXkgdGhhdCBoYXNuJ3QgYmVlbiBub3JtYWxpemVkIHlldC4uLlxuICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICBjb25zdCB7IHNpemUgfSA9IGNoYW5nZS5vcGVyYXRpb25zXG4gICAgbGV0IGtleVxuXG4gICAgLy8gUEVSRjogdXNlIGEgbXV0YWJsZSBzZXQgaGVyZSBzaW5jZSB3ZSdsbCBiZSBhZGQgdG8gaXQgYSBsb3QuXG4gICAgbGV0IHNldCA9IG5ldyBTZXQoKS5hc011dGFibGUoKVxuXG4gICAgLy8gVW53aW5kIHRoZSBzdGFjaywgbm9ybWFsaXppbmcgZXZlcnkgY2hpbGQgYW5kIGFkZGluZyBpdCB0byB0aGUgc2V0LlxuICAgIHdoaWxlIChrZXkgPSBrZXlzWzBdKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuZ2V0Q2hpbGQoa2V5KVxuICAgICAgbm9ybWFsaXplTm9kZUFuZENoaWxkcmVuKGNoYW5nZSwgY2hpbGQsIHNjaGVtYSlcbiAgICAgIHNldC5hZGQoa2V5KVxuICAgICAga2V5cy5zaGlmdCgpXG4gICAgfVxuXG4gICAgLy8gVHVybiB0aGUgc2V0IGltbXV0YWJsZSB0byBiZSBhYmxlIHRvIGNvbXBhcmUgYWdhaW5zdCBpdC5cbiAgICBzZXQgPSBzZXQuYXNJbW11dGFibGUoKVxuXG4gICAgLy8gUEVSRjogT25seSByZS1maW5kIHRoZSBub2RlIGFuZCByZS1ub3JtYWxpemUgYW55IG5ldyBjaGlsZHJlbiBpZlxuICAgIC8vIG9wZXJhdGlvbnMgb2NjdXJlZCB0aGF0IG1pZ2h0IGhhdmUgY2hhbmdlZCBpdC5cbiAgICBpZiAoY2hhbmdlLm9wZXJhdGlvbnMuc2l6ZSA+IHNpemUpIHtcbiAgICAgIG5vZGUgPSByZWZpbmROb2RlKGNoYW5nZSwgbm9kZSlcblxuICAgICAgLy8gQWRkIGFueSBuZXcgY2hpbGRyZW4gYmFjayBvbnRvIHRoZSBzdGFjay5cbiAgICAgIG5vZGUubm9kZXMuZm9yRWFjaCgobikgPT4ge1xuICAgICAgICBpZiAoc2V0LmhhcyhuLmtleSkpIHJldHVyblxuICAgICAgICBrZXlzLnVuc2hpZnQobi5rZXkpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgbm9kZSBpdHNlbGYgaWYgaXQgc3RpbGwgZXhpc3RzLlxuICBpZiAobm9kZSkge1xuICAgIG5vcm1hbGl6ZU5vZGUoY2hhbmdlLCBub2RlLCBzY2hlbWEpXG4gIH1cbn1cblxuLyoqXG4gKiBSZS1maW5kIGEgcmVmZXJlbmNlIHRvIGEgbm9kZSB0aGF0IG1heSBoYXZlIGJlZW4gbW9kaWZpZWQgb3IgcmVtb3ZlZFxuICogZW50aXJlbHkgYnkgYSBjaGFuZ2UuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtOb2RlfVxuICovXG5cbmZ1bmN0aW9uIHJlZmluZE5vZGUoY2hhbmdlLCBub2RlKSB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICByZXR1cm4gbm9kZS5vYmplY3QgPT0gJ2RvY3VtZW50J1xuICAgID8gZG9jdW1lbnRcbiAgICA6IGRvY3VtZW50LmdldERlc2NlbmRhbnQobm9kZS5rZXkpXG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgYG5vZGVgIHdpdGggYSBgc2NoZW1hYCwgYnV0IG5vdCBpdHMgY2hpbGRyZW4uXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge1NjaGVtYX0gc2NoZW1hXG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplTm9kZShjaGFuZ2UsIG5vZGUsIHNjaGVtYSkge1xuICBjb25zdCBtYXggPSBzY2hlbWEuc3RhY2sucGx1Z2lucy5sZW5ndGggKyAxXG4gIGxldCBpdGVyYXRpb25zID0gMFxuXG4gIGZ1bmN0aW9uIGl0ZXJhdGUoYywgbikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZSA9IG4udmFsaWRhdGUoc2NoZW1hKVxuICAgIGlmICghbm9ybWFsaXplKSByZXR1cm5cblxuICAgIC8vIFJ1biB0aGUgYG5vcm1hbGl6ZWAgZnVuY3Rpb24gdG8gZml4IHRoZSBub2RlLlxuICAgIG5vcm1hbGl6ZShjKVxuXG4gICAgLy8gUmUtZmluZCB0aGUgbm9kZSByZWZlcmVuY2UsIGluIGNhc2UgaXQgd2FzIHVwZGF0ZWQuIElmIHRoZSBub2RlIG5vIGxvbmdlclxuICAgIC8vIGV4aXN0cywgd2UncmUgZG9uZSBmb3IgdGhpcyBicmFuY2guXG4gICAgbiA9IHJlZmluZE5vZGUoYywgbilcbiAgICBpZiAoIW4pIHJldHVyblxuXG4gICAgLy8gSW5jcmVtZW50IHRoZSBpdGVyYXRpb25zIGNvdW50ZXIsIGFuZCBjaGVjayB0byBtYWtlIHN1cmUgdGhhdCB3ZSBoYXZlbid0XG4gICAgLy8gZXhjZWVkZWQgdGhlIG1heC4gV2l0aG91dCB0aGlzIGNoZWNrLCBpdCdzIGVhc3kgZm9yIHRoZSBgdmFsaWRhdGVgIG9yXG4gICAgLy8gYG5vcm1hbGl6ZWAgZnVuY3Rpb24gb2YgYSBzY2hlbWEgcnVsZSB0byBiZSB3cml0dGVuIGluY29ycmVjdGx5IGFuZCBmb3JcbiAgICAvLyBhbiBpbmZpbml0ZSBpbnZhbGlkIGxvb3AgdG8gb2NjdXIuXG4gICAgaXRlcmF0aW9ucysrXG5cbiAgICBpZiAoaXRlcmF0aW9ucyA+IG1heCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNjaGVtYSBydWxlIGNvdWxkIG5vdCBiZSB2YWxpZGF0ZWQgYWZ0ZXIgc3VmZmljaWVudCBpdGVyYXRpb25zLiBUaGlzIGlzIHVzdWFsbHkgZHVlIHRvIGEgYHJ1bGUudmFsaWRhdGVgIG9yIGBydWxlLm5vcm1hbGl6ZWAgZnVuY3Rpb24gb2YgYSBzY2hlbWEgYmVpbmcgaW5jb3JyZWN0bHkgd3JpdHRlbiwgY2F1c2luZyBhbiBpbmZpbml0ZSBsb29wLicpXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBpdGVyYXRlIGFnYWluLlxuICAgIGl0ZXJhdGUoYywgbilcbiAgfVxuXG4gIGl0ZXJhdGUoY2hhbmdlLCBub2RlKVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IENoYW5nZXNcbiJdfQ==