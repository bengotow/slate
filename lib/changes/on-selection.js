'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _range = require('../models/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Set `properties` on the selection.
 *
 * @param {Change} change
 * @param {Object} properties
 */

Changes.select = function (change, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  properties = _range2.default.createProperties(properties);

  var _options$snapshot = options.snapshot,
      snapshot = _options$snapshot === undefined ? false : _options$snapshot;
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var props = {};
  var sel = selection.toJSON();
  var next = selection.merge(properties).normalize(document);
  properties = (0, _pick2.default)(next, Object.keys(properties));

  // Remove any properties that are already equal to the current selection. And
  // create a dictionary of the previous values for all of the properties that
  // are being changed, for the inverse operation.
  for (var k in properties) {
    if (snapshot == false && properties[k] == sel[k]) continue;
    props[k] = properties[k];
  }

  // If the selection moves, clear any marks, unless the new selection
  // properties change the marks in some way.
  var moved = ['anchorKey', 'anchorOffset', 'focusKey', 'focusOffset'].some(function (p) {
    return props.hasOwnProperty(p);
  });

  if (sel.marks && properties.marks == sel.marks && moved) {
    props.marks = null;
  }

  // If there are no new properties to set, abort.
  if ((0, _isEmpty2.default)(props)) {
    return;
  }

  // If the only change is blowing away the current selection's marks, abort.
  // To remove all marks, clear the set, don't set it to null.
  var onlyMarks = Object.keys(props).length == 1 && props.hasOwnProperty('marks');
  if (onlyMarks && props.marks == null) {
    return;
  }

  // Apply the operation.
  change.applyOperation({
    type: 'set_selection',
    value: value,
    properties: props,
    selection: sel
  }, snapshot ? { skip: false, merge: false } : {});
};

/**
 * Select the whole document.
 *
 * @param {Change} change
 */

Changes.selectAll = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var next = selection.moveToRangeOf(document);
  change.select(next);
};

/**
 * Snapshot the current selection.
 *
 * @param {Change} change
 */

Changes.snapshotSelection = function (change) {
  var value = change.value;
  var selection = value.selection;

  change.select(selection, { snapshot: true });
};

/**
 * Move the anchor point backward, accounting for being at the start of a block.
 *
 * @param {Change} change
 */

Changes.moveAnchorCharBackward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      anchorText = value.anchorText,
      anchorBlock = value.anchorBlock;
  var anchorOffset = selection.anchorOffset;

  var previousText = document.getPreviousText(anchorText.key);
  var isInVoid = document.hasVoidParent(anchorText.key);
  var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);

  if (!isInVoid && anchorOffset > 0) {
    change.moveAnchor(-1);
    return;
  }

  if (!previousText) {
    return;
  }

  change.moveAnchorToEndOf(previousText);

  if (!isInVoid && !isPreviousInVoid && anchorBlock.hasNode(previousText.key)) {
    change.moveAnchor(-1);
  }
};

/**
 * Move the anchor point forward, accounting for being at the end of a block.
 *
 * @param {Change} change
 */

Changes.moveAnchorCharForward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      anchorText = value.anchorText,
      anchorBlock = value.anchorBlock;
  var anchorOffset = selection.anchorOffset;

  var nextText = document.getNextText(anchorText.key);
  var isInVoid = document.hasVoidParent(anchorText.key);
  var isNextInVoid = nextText && document.hasVoidParent(nextText.key);

  if (!isInVoid && anchorOffset < anchorText.text.length) {
    change.moveAnchor(1);
    return;
  }

  if (!nextText) {
    return;
  }

  change.moveAnchorToStartOf(nextText);

  if (!isInVoid && !isNextInVoid && anchorBlock.hasNode(nextText.key)) {
    change.moveAnchor(1);
  }
};

/**
 * Move the focus point backward, accounting for being at the start of a block.
 *
 * @param {Change} change
 */

Changes.moveFocusCharBackward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      focusText = value.focusText,
      focusBlock = value.focusBlock;
  var focusOffset = selection.focusOffset;

  var previousText = document.getPreviousText(focusText.key);
  var isInVoid = document.hasVoidParent(focusText.key);
  var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);

  if (!isInVoid && focusOffset > 0) {
    change.moveFocus(-1);
    return;
  }

  if (!previousText) {
    return;
  }

  change.moveFocusToEndOf(previousText);

  if (!isInVoid && !isPreviousInVoid && focusBlock.hasNode(previousText.key)) {
    change.moveFocus(-1);
  }
};

/**
 * Move the focus point forward, accounting for being at the end of a block.
 *
 * @param {Change} change
 */

Changes.moveFocusCharForward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      focusText = value.focusText,
      focusBlock = value.focusBlock;
  var focusOffset = selection.focusOffset;

  var nextText = document.getNextText(focusText.key);
  var isInVoid = document.hasVoidParent(focusText.key);
  var isNextInVoid = nextText && document.hasVoidParent(nextText.key);

  if (!isInVoid && focusOffset < focusText.text.length) {
    change.moveFocus(1);
    return;
  }

  if (!nextText) {
    return;
  }

  change.moveFocusToStartOf(nextText);

  if (!isInVoid && !isNextInVoid && focusBlock.hasNode(nextText.key)) {
    change.moveFocus(1);
  }
};

/**
 * Mix in move methods.
 */

var MOVE_DIRECTIONS = ['Forward', 'Backward'];

MOVE_DIRECTIONS.forEach(function (direction) {
  var anchor = 'moveAnchorChar' + direction;
  var focus = 'moveFocusChar' + direction;

  Changes['moveChar' + direction] = function (change) {
    change[anchor]()[focus]();
  };

  Changes['moveStartChar' + direction] = function (change) {
    if (change.value.isBackward) {
      change[focus]();
    } else {
      change[anchor]();
    }
  };

  Changes['moveEndChar' + direction] = function (change) {
    if (change.value.isBackward) {
      change[anchor]();
    } else {
      change[focus]();
    }
  };

  Changes['extendChar' + direction] = function (change) {
    change['moveFocusChar' + direction]();
  };

  Changes['collapseChar' + direction] = function (change) {
    var collapse = direction == 'Forward' ? 'collapseToEnd' : 'collapseToStart';
    change[collapse]()['moveChar' + direction]();
  };
});

/**
 * Mix in alias methods.
 */

var ALIAS_METHODS = [['collapseLineBackward', 'collapseToStartOfBlock'], ['collapseLineForward', 'collapseToEndOfBlock'], ['extendLineBackward', 'extendToStartOfBlock'], ['extendLineForward', 'extendToEndOfBlock']];

ALIAS_METHODS.forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      alias = _ref2[0],
      method = _ref2[1];

  Changes[alias] = function (change) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    change[method].apply(change, [change].concat(args));
  };
});

/**
 * Mix in selection changes that are just a proxy for the selection method.
 */

var PROXY_TRANSFORMS = ['blur', 'collapseTo', 'collapseToAnchor', 'collapseToEnd', 'collapseToEndOf', 'collapseToFocus', 'collapseToStart', 'collapseToStartOf', 'extend', 'extendTo', 'extendToEndOf', 'extendToStartOf', 'flip', 'focus', 'move', 'moveAnchor', 'moveAnchorOffsetTo', 'moveAnchorTo', 'moveAnchorToEndOf', 'moveAnchorToStartOf', 'moveEnd', 'moveEndOffsetTo', 'moveEndTo', 'moveFocus', 'moveFocusOffsetTo', 'moveFocusTo', 'moveFocusToEndOf', 'moveFocusToStartOf', 'moveOffsetsTo', 'moveStart', 'moveStartOffsetTo', 'moveStartTo', 'moveTo', 'moveToEnd', 'moveToEndOf', 'moveToRangeOf', 'moveToStart', 'moveToStartOf', 'deselect'];

PROXY_TRANSFORMS.forEach(function (method) {
  Changes[method] = function (change) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var normalize = method != 'deselect';
    var value = change.value;
    var document = value.document,
        selection = value.selection;

    var next = selection[method].apply(selection, args);
    if (normalize) next = next.normalize(document);
    change.select(next);
  };
});

/**
 * Mix in node-related changes.
 */

var PREFIXES = ['moveTo', 'moveAnchorTo', 'moveFocusTo', 'moveStartTo', 'moveEndTo', 'collapseTo', 'extendTo'];

var DIRECTIONS = ['Next', 'Previous'];

var OBJECTS = ['Block', 'Inline', 'Text'];

PREFIXES.forEach(function (prefix) {
  var edges = ['Start', 'End'];

  if (prefix == 'moveTo') {
    edges.push('Range');
  }

  edges.forEach(function (edge) {
    var method = '' + prefix + edge + 'Of';

    OBJECTS.forEach(function (object) {
      var getNode = object == 'Text' ? 'getNode' : 'getClosest' + object;

      Changes['' + method + object] = function (change) {
        var value = change.value;
        var document = value.document,
            selection = value.selection;

        var node = document[getNode](selection.startKey);
        if (!node) return;
        change[method](node);
      };

      DIRECTIONS.forEach(function (direction) {
        var getDirectionNode = 'get' + direction + object;
        var directionKey = direction == 'Next' ? 'startKey' : 'endKey';

        Changes['' + method + direction + object] = function (change) {
          var value = change.value;
          var document = value.document,
              selection = value.selection;

          var node = document[getNode](selection[directionKey]);
          if (!node) return;
          var target = document[getDirectionNode](node.key);
          if (!target) return;
          change[method](target);
        };
      });
    });
  });
});

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL29uLXNlbGVjdGlvbi5qcyJdLCJuYW1lcyI6WyJDaGFuZ2VzIiwic2VsZWN0IiwiY2hhbmdlIiwicHJvcGVydGllcyIsIm9wdGlvbnMiLCJjcmVhdGVQcm9wZXJ0aWVzIiwic25hcHNob3QiLCJ2YWx1ZSIsImRvY3VtZW50Iiwic2VsZWN0aW9uIiwicHJvcHMiLCJzZWwiLCJ0b0pTT04iLCJuZXh0IiwibWVyZ2UiLCJub3JtYWxpemUiLCJPYmplY3QiLCJrZXlzIiwiayIsIm1vdmVkIiwic29tZSIsImhhc093blByb3BlcnR5IiwicCIsIm1hcmtzIiwib25seU1hcmtzIiwibGVuZ3RoIiwiYXBwbHlPcGVyYXRpb24iLCJ0eXBlIiwic2tpcCIsInNlbGVjdEFsbCIsIm1vdmVUb1JhbmdlT2YiLCJzbmFwc2hvdFNlbGVjdGlvbiIsIm1vdmVBbmNob3JDaGFyQmFja3dhcmQiLCJhbmNob3JUZXh0IiwiYW5jaG9yQmxvY2siLCJhbmNob3JPZmZzZXQiLCJwcmV2aW91c1RleHQiLCJnZXRQcmV2aW91c1RleHQiLCJrZXkiLCJpc0luVm9pZCIsImhhc1ZvaWRQYXJlbnQiLCJpc1ByZXZpb3VzSW5Wb2lkIiwibW92ZUFuY2hvciIsIm1vdmVBbmNob3JUb0VuZE9mIiwiaGFzTm9kZSIsIm1vdmVBbmNob3JDaGFyRm9yd2FyZCIsIm5leHRUZXh0IiwiZ2V0TmV4dFRleHQiLCJpc05leHRJblZvaWQiLCJ0ZXh0IiwibW92ZUFuY2hvclRvU3RhcnRPZiIsIm1vdmVGb2N1c0NoYXJCYWNrd2FyZCIsImZvY3VzVGV4dCIsImZvY3VzQmxvY2siLCJmb2N1c09mZnNldCIsIm1vdmVGb2N1cyIsIm1vdmVGb2N1c1RvRW5kT2YiLCJtb3ZlRm9jdXNDaGFyRm9yd2FyZCIsIm1vdmVGb2N1c1RvU3RhcnRPZiIsIk1PVkVfRElSRUNUSU9OUyIsImZvckVhY2giLCJkaXJlY3Rpb24iLCJhbmNob3IiLCJmb2N1cyIsImlzQmFja3dhcmQiLCJjb2xsYXBzZSIsIkFMSUFTX01FVEhPRFMiLCJhbGlhcyIsIm1ldGhvZCIsImFyZ3MiLCJQUk9YWV9UUkFOU0ZPUk1TIiwiUFJFRklYRVMiLCJESVJFQ1RJT05TIiwiT0JKRUNUUyIsInByZWZpeCIsImVkZ2VzIiwicHVzaCIsImVkZ2UiLCJvYmplY3QiLCJnZXROb2RlIiwibm9kZSIsInN0YXJ0S2V5IiwiZ2V0RGlyZWN0aW9uTm9kZSIsImRpcmVjdGlvbktleSIsInRhcmdldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxVQUFVLEVBQWhCOztBQUVBOzs7Ozs7O0FBT0FBLFFBQVFDLE1BQVIsR0FBaUIsVUFBQ0MsTUFBRCxFQUFTQyxVQUFULEVBQXNDO0FBQUEsTUFBakJDLE9BQWlCLHVFQUFQLEVBQU87O0FBQ3JERCxlQUFhLGdCQUFNRSxnQkFBTixDQUF1QkYsVUFBdkIsQ0FBYjs7QUFEcUQsMEJBR3hCQyxPQUh3QixDQUc3Q0UsUUFINkM7QUFBQSxNQUc3Q0EsUUFINkMscUNBR2xDLEtBSGtDO0FBQUEsTUFJN0NDLEtBSjZDLEdBSW5DTCxNQUptQyxDQUk3Q0ssS0FKNkM7QUFBQSxNQUs3Q0MsUUFMNkMsR0FLckJELEtBTHFCLENBSzdDQyxRQUw2QztBQUFBLE1BS25DQyxTQUxtQyxHQUtyQkYsS0FMcUIsQ0FLbkNFLFNBTG1DOztBQU1yRCxNQUFNQyxRQUFRLEVBQWQ7QUFDQSxNQUFNQyxNQUFNRixVQUFVRyxNQUFWLEVBQVo7QUFDQSxNQUFNQyxPQUFPSixVQUFVSyxLQUFWLENBQWdCWCxVQUFoQixFQUE0QlksU0FBNUIsQ0FBc0NQLFFBQXRDLENBQWI7QUFDQUwsZUFBYSxvQkFBS1UsSUFBTCxFQUFXRyxPQUFPQyxJQUFQLENBQVlkLFVBQVosQ0FBWCxDQUFiOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQUssSUFBTWUsQ0FBWCxJQUFnQmYsVUFBaEIsRUFBNEI7QUFDMUIsUUFBSUcsWUFBWSxLQUFaLElBQXFCSCxXQUFXZSxD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QUVWRCxLQUZVLENBRWxDQyxRQUZrQztBQUFBLFlBRXhCQyxTQUZ3QixHQUVWRixLQUZVLENBRXhCRSxTQUZ3Qjs7QUFHMUMsWUFBTXVFLE9BQU94RSxTQUFTdUUsT0FBVCxFQUFrQnRFLFVBQVV3RSxRQUE1QixDQUFiO0FBQ0EsWUFBSSxDQUFDRCxJQUFMLEVBQVc7QUFDWDlFLGVBQU9rRSxNQUFQLEVBQWVZLElBQWY7QUFDRCxPQU5EOztBQVFBUixpQkFBV1osT0FBWCxDQUFtQixVQUFDQyxTQUFELEVBQWU7QUFDaEMsWUFBTXFCLDJCQUF5QnJCLFNBQXpCLEdBQXFDaUIsTUFBM0M7QUFDQSxZQUFNSyxlQUFldEIsYUFBYSxNQUFiLEdBQXNCLFVBQXRCLEdBQW1DLFFBQXhEOztBQUVBN0QscUJBQVdvRSxNQUFYLEdBQW9CUCxTQUFwQixHQUFnQ2lCLE1BQWhDLElBQTRDLFVBQUM1RSxNQUFELEVBQVk7QUFBQSxjQUM5Q0ssS0FEOEMsR0FDcENMLE1BRG9DLENBQzlDSyxLQUQ4QztBQUFBLGNBRTlDQyxRQUY4QyxHQUV0QkQsS0FGc0IsQ0FFOUNDLFFBRjhDO0FBQUEsY0FFcENDLFNBRm9DLEdBRXRCRixLQUZzQixDQUVwQ0UsU0FGb0M7O0FBR3RELGNBQU11RSxPQUFPeEUsU0FBU3VFLE9BQVQsRUFBa0J0RSxVQUFVMEUsWUFBVixDQUFsQixDQUFiO0FBQ0EsY0FBSSxDQUFDSCxJQUFMLEVBQVc7QUFDWCxjQUFNSSxTQUFTNUUsU0FBUzBFLGdCQUFULEVBQTJCRixLQUFLMUMsR0FBaEMsQ0FBZjtBQUNBLGNBQUksQ0FBQzhDLE1BQUwsRUFBYTtBQUNibEYsaUJBQU9rRSxNQUFQLEVBQWVnQixNQUFmO0FBQ0QsU0FSRDtBQVNELE9BYkQ7QUFjRCxLQXpCRDtBQTBCRCxHQTdCRDtBQThCRCxDQXhDRDs7QUEwQ0E7Ozs7OztrQkFNZXBGLE8iLCJmaWxlIjoib24tc2VsZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgaXNFbXB0eSBmcm9tICdpcy1lbXB0eSdcbmltcG9ydCBwaWNrIGZyb20gJ2xvZGFzaC9waWNrJ1xuXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vbW9kZWxzL3JhbmdlJ1xuXG4vKipcbiAqIENoYW5nZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBDaGFuZ2VzID0ge31cblxuLyoqXG4gKiBTZXQgYHByb3BlcnRpZXNgIG9uIHRoZSBzZWxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXNcbiAqL1xuXG5DaGFuZ2VzLnNlbGVjdCA9IChjaGFuZ2UsIHByb3BlcnRpZXMsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBwcm9wZXJ0aWVzID0gUmFuZ2UuY3JlYXRlUHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuXG4gIGNvbnN0IHsgc25hcHNob3QgPSBmYWxzZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICBjb25zdCBwcm9wcyA9IHt9XG4gIGNvbnN0IHNlbCA9IHNlbGVjdGlvbi50b0pTT04oKVxuICBjb25zdCBuZXh0ID0gc2VsZWN0aW9uLm1lcmdlKHByb3BlcnRpZXMpLm5vcm1hbGl6ZShkb2N1bWVudClcbiAgcHJvcGVydGllcyA9IHBpY2sobmV4dCwgT2JqZWN0LmtleXMocHJvcGVydGllcykpXG5cbiAgLy8gUmVtb3ZlIGFueSBwcm9wZXJ0aWVzIHRoYXQgYXJlIGFscmVhZHkgZXF1YWwgdG8gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLiBBbmRcbiAgLy8gY3JlYXRlIGEgZGljdGlvbmFyeSBvZiB0aGUgcHJldmlvdXMgdmFsdWVzIGZvciBhbGwgb2YgdGhlIHByb3BlcnRpZXMgdGhhdFxuICAvLyBhcmUgYmVpbmcgY2hhbmdlZCwgZm9yIHRoZSBpbnZlcnNlIG9wZXJhdGlvbi5cbiAgZm9yIChjb25zdCBrIGluIHByb3BlcnRpZXMpIHtcbiAgICBpZiAoc25hcHNob3QgPT0gZmFsc2UgJiYgcHJvcGVydGllc1trXSA9PSBzZWxba10pIGNvbnRpbnVlXG4gICAgcHJvcHNba10gPSBwcm9wZXJ0aWVzW2tdXG4gIH1cblxuICAvLyBJZiB0aGUgc2VsZWN0aW9uIG1vdmVzLCBjbGVhciBhbnkgbWFya3MsIHVubGVzcyB0aGUgbmV3IHNlbGVjdGlvblxuICAvLyBwcm9wZXJ0aWVzIGNoYW5nZSB0aGUgbWFya3MgaW4gc29tZSB3YXkuXG4gIGNvbnN0IG1vdmVkID0gW1xuICAgICdhbmNob3JLZXknLFxuICAgICdhbmNob3JPZmZzZXQnLFxuICAgICdmb2N1c0tleScsXG4gICAgJ2ZvY3VzT2Zmc2V0JyxcbiAgXS5zb21lKHAgPT4gcHJvcHMuaGFzT3duUHJvcGVydHkocCkpXG5cbiAgaWYgKHNlbC5tYXJrcyAmJiBwcm9wZXJ0aWVzLm1hcmtzID09IHNlbC5tYXJrcyAmJiBtb3ZlZCkge1xuICAgIHByb3BzLm1hcmtzID0gbnVsbFxuICB9XG5cbiAgLy8gSWYgdGhlcmUgYXJlIG5vIG5ldyBwcm9wZXJ0aWVzIHRvIHNldCwgYWJvcnQuXG4gIGlmIChpc0VtcHR5KHByb3BzKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIG9ubHkgY2hhbmdlIGlzIGJsb3dpbmcgYXdheSB0aGUgY3VycmVudCBzZWxlY3Rpb24ncyBtYXJrcywgYWJvcnQuXG4gIC8vIFRvIHJlbW92ZSBhbGwgbWFya3MsIGNsZWFyIHRoZSBzZXQsIGRvbid0IHNldCBpdCB0byBudWxsLlxuICBjb25zdCBvbmx5TWFya3MgPSBPYmplY3Qua2V5cyhwcm9wcykubGVuZ3RoID09IDEgJiYgcHJvcHMuaGFzT3duUHJvcGVydHkoJ21hcmtzJylcbiAgaWYgKG9ubHlNYXJrcyAmJiBwcm9wcy5tYXJrcyA9PSBudWxsKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBBcHBseSB0aGUgb3BlcmF0aW9uLlxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb24oe1xuICAgIHR5cGU6ICdzZXRfc2VsZWN0aW9uJyxcbiAgICB2YWx1ZSxcbiAgICBwcm9wZXJ0aWVzOiBwcm9wcyxcbiAgICBzZWxlY3Rpb246IHNlbCxcbiAgfSwgc25hcHNob3QgPyB7IHNraXA6IGZhbHNlLCBtZXJnZTogZmFsc2UgfSA6IHt9KVxufVxuXG4vKipcbiAqIFNlbGVjdCB0aGUgd2hvbGUgZG9jdW1lbnQuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICovXG5cbkNoYW5nZXMuc2VsZWN0QWxsID0gKGNoYW5nZSkgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICBjb25zdCBuZXh0ID0gc2VsZWN0aW9uLm1vdmVUb1JhbmdlT2YoZG9jdW1lbnQpXG4gIGNoYW5nZS5zZWxlY3QobmV4dClcbn1cblxuLyoqXG4gKiBTbmFwc2hvdCB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICovXG5cbkNoYW5nZXMuc25hcHNob3RTZWxlY3Rpb24gPSAoY2hhbmdlKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IHNlbGVjdGlvbiB9ID0gdmFsdWVcbiAgY2hhbmdlLnNlbGVjdChzZWxlY3Rpb24sIHsgc25hcHNob3Q6IHRydWUgfSlcbn1cblxuLyoqXG4gKiBNb3ZlIHRoZSBhbmNob3IgcG9pbnQgYmFja3dhcmQsIGFjY291bnRpbmcgZm9yIGJlaW5nIGF0IHRoZSBzdGFydCBvZiBhIGJsb2NrLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqL1xuXG5DaGFuZ2VzLm1vdmVBbmNob3JDaGFyQmFja3dhcmQgPSAoY2hhbmdlKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24sIGFuY2hvclRleHQsIGFuY2hvckJsb2NrIH0gPSB2YWx1ZVxuICBjb25zdCB7IGFuY2hvck9mZnNldCB9ID0gc2VsZWN0aW9uXG4gIGNvbnN0IHByZXZpb3VzVGV4dCA9IGRvY3VtZW50LmdldFByZXZpb3VzVGV4dChhbmNob3JUZXh0LmtleSlcbiAgY29uc3QgaXNJblZvaWQgPSBkb2N1bWVudC5oYXNWb2lkUGFyZW50KGFuY2hvclRleHQua2V5KVxuICBjb25zdCBpc1ByZXZpb3VzSW5Wb2lkID0gcHJldmlvdXNUZXh0ICYmIGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQocHJldmlvdXNUZXh0LmtleSlcblxuICBpZiAoIWlzSW5Wb2lkICYmIGFuY2hvck9mZnNldCA+IDApIHtcbiAgICBjaGFuZ2UubW92ZUFuY2hvcigtMSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmICghcHJldmlvdXNUZXh0KSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBjaGFuZ2UubW92ZUFuY2hvclRvRW5kT2YocHJldmlvdXNUZXh0KVxuXG4gIGlmICghaXNJblZvaWQgJiYgIWlzUHJldmlvdXNJblZvaWQgJiYgYW5jaG9yQmxvY2suaGFzTm9kZShwcmV2aW91c1RleHQua2V5KSkge1xuICAgIGNoYW5nZS5tb3ZlQW5jaG9yKC0xKVxuICB9XG59XG5cbi8qKlxuICogTW92ZSB0aGUgYW5jaG9yIHBvaW50IGZvcndhcmQsIGFjY291bnRpbmcgZm9yIGJlaW5nIGF0IHRoZSBlbmQgb2YgYSBibG9jay5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKi9cblxuQ2hhbmdlcy5tb3ZlQW5jaG9yQ2hhckZvcndhcmQgPSAoY2hhbmdlKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24sIGFuY2hvclRleHQsIGFuY2hvckJsb2NrIH0gPSB2YWx1ZVxuICBjb25zdCB7IGFuY2hvck9mZnNldCB9ID0gc2VsZWN0aW9uXG4gIGNvbnN0IG5leHRUZXh0ID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQoYW5jaG9yVGV4dC5rZXkpXG4gIGNvbnN0IGlzSW5Wb2lkID0gZG9jdW1lbnQuaGFzVm9pZFBhcmVudChhbmNob3JUZXh0LmtleSlcbiAgY29uc3QgaXNOZXh0SW5Wb2lkID0gbmV4dFRleHQgJiYgZG9jdW1lbnQuaGFzVm9pZFBhcmVudChuZXh0VGV4dC5rZXkpXG5cbiAgaWYgKCFpc0luVm9pZCAmJiBhbmNob3JPZmZzZXQgPCBhbmNob3JUZXh0LnRleHQubGVuZ3RoKSB7XG4gICAgY2hhbmdlLm1vdmVBbmNob3IoMSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmICghbmV4dFRleHQpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNoYW5nZS5tb3ZlQW5jaG9yVG9TdGFydE9mKG5leHRUZXh0KVxuXG4gIGlmICghaXNJblZvaWQgJiYgIWlzTmV4dEluVm9pZCAmJiBhbmNob3JCbG9jay5oYXNOb2RlKG5leHRUZXh0LmtleSkpIHtcbiAgICBjaGFuZ2UubW92ZUFuY2hvcigxKVxuICB9XG59XG5cbi8qKlxuICogTW92ZSB0aGUgZm9jdXMgcG9pbnQgYmFja3dhcmQsIGFjY291bnRpbmcgZm9yIGJlaW5nIGF0IHRoZSBzdGFydCBvZiBhIGJsb2NrLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqL1xuXG5DaGFuZ2VzLm1vdmVGb2N1c0NoYXJCYWNrd2FyZCA9IChjaGFuZ2UpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiwgZm9jdXNUZXh0LCBmb2N1c0Jsb2NrIH0gPSB2YWx1ZVxuICBjb25zdCB7IGZvY3VzT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgY29uc3QgcHJldmlvdXNUZXh0ID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNUZXh0KGZvY3VzVGV4dC5rZXkpXG4gIGNvbnN0IGlzSW5Wb2lkID0gZG9jdW1lbnQuaGFzVm9pZFBhcmVudChmb2N1c1RleHQua2V5KVxuICBjb25zdCBpc1ByZXZpb3VzSW5Wb2lkID0gcHJldmlvdXNUZXh0ICYmIGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQocHJldmlvdXNUZXh0LmtleSlcblxuICBpZiAoIWlzSW5Wb2lkICYmIGZvY3VzT2Zmc2V0ID4gMCkge1xuICAgIGNoYW5nZS5tb3ZlRm9jdXMoLTEpXG4gICAgcmV0dXJuXG4gIH1cblxuICBpZiAoIXByZXZpb3VzVGV4dCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgY2hhbmdlLm1vdmVGb2N1c1RvRW5kT2YocHJldmlvdXNUZXh0KVxuXG4gIGlmICghaXNJblZvaWQgJiYgIWlzUHJldmlvdXNJblZvaWQgJiYgZm9jdXNCbG9jay5oYXNOb2RlKHByZXZpb3VzVGV4dC5rZXkpKSB7XG4gICAgY2hhbmdlLm1vdmVGb2N1cygtMSlcbiAgfVxufVxuXG4vKipcbiAqIE1vdmUgdGhlIGZvY3VzIHBvaW50IGZvcndhcmQsIGFjY291bnRpbmcgZm9yIGJlaW5nIGF0IHRoZSBlbmQgb2YgYSBibG9jay5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKi9cblxuQ2hhbmdlcy5tb3ZlRm9jdXNDaGFyRm9yd2FyZCA9IChjaGFuZ2UpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiwgZm9jdXNUZXh0LCBmb2N1c0Jsb2NrIH0gPSB2YWx1ZVxuICBjb25zdCB7IGZvY3VzT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgY29uc3QgbmV4dFRleHQgPSBkb2N1bWVudC5nZXROZXh0VGV4dChmb2N1c1RleHQua2V5KVxuICBjb25zdCBpc0luVm9pZCA9IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQoZm9jdXNUZXh0LmtleSlcbiAgY29uc3QgaXNOZXh0SW5Wb2lkID0gbmV4dFRleHQgJiYgZG9jdW1lbnQuaGFzVm9pZFBhcmVudChuZXh0VGV4dC5rZXkpXG5cbiAgaWYgKCFpc0luVm9pZCAmJiBmb2N1c09mZnNldCA8IGZvY3VzVGV4dC50ZXh0Lmxlbmd0aCkge1xuICAgIGNoYW5nZS5tb3ZlRm9jdXMoMSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmICghbmV4dFRleHQpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNoYW5nZS5tb3ZlRm9jdXNUb1N0YXJ0T2YobmV4dFRleHQpXG5cbiAgaWYgKCFpc0luVm9pZCAmJiAhaXNOZXh0SW5Wb2lkICYmIGZvY3VzQmxvY2suaGFzTm9kZShuZXh0VGV4dC5rZXkpKSB7XG4gICAgY2hhbmdlLm1vdmVGb2N1cygxKVxuICB9XG59XG5cbi8qKlxuICogTWl4IGluIG1vdmUgbWV0aG9kcy5cbiAqL1xuXG5jb25zdCBNT1ZFX0RJUkVDVElPTlMgPSBbXG4gICdGb3J3YXJkJyxcbiAgJ0JhY2t3YXJkJyxcbl1cblxuTU9WRV9ESVJFQ1RJT05TLmZvckVhY2goKGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBhbmNob3IgPSBgbW92ZUFuY2hvckNoYXIke2RpcmVjdGlvbn1gXG4gIGNvbnN0IGZvY3VzID0gYG1vdmVGb2N1c0NoYXIke2RpcmVjdGlvbn1gXG5cbiAgQ2hhbmdlc1tgbW92ZUNoYXIke2RpcmVjdGlvbn1gXSA9IChjaGFuZ2UpID0+IHtcbiAgICBjaGFuZ2VbYW5jaG9yXSgpW2ZvY3VzXSgpXG4gIH1cblxuICBDaGFuZ2VzW2Btb3ZlU3RhcnRDaGFyJHtkaXJlY3Rpb259YF0gPSAoY2hhbmdlKSA9PiB7XG4gICAgaWYgKGNoYW5nZS52YWx1ZS5pc0JhY2t3YXJkKSB7XG4gICAgICBjaGFuZ2VbZm9jdXNdKClcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhbmdlW2FuY2hvcl0oKVxuICAgIH1cbiAgfVxuXG4gIENoYW5nZXNbYG1vdmVFbmRDaGFyJHtkaXJlY3Rpb259YF0gPSAoY2hhbmdlKSA9PiB7XG4gICAgaWYgKGNoYW5nZS52YWx1ZS5pc0JhY2t3YXJkKSB7XG4gICAgICBjaGFuZ2VbYW5jaG9yXSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYW5nZVtmb2N1c10oKVxuICAgIH1cbiAgfVxuXG4gIENoYW5nZXNbYGV4dGVuZENoYXIke2RpcmVjdGlvbn1gXSA9IChjaGFuZ2UpID0+IHtcbiAgICBjaGFuZ2VbYG1vdmVGb2N1c0NoYXIke2RpcmVjdGlvbn1gXSgpXG4gIH1cblxuICBDaGFuZ2VzW2Bjb2xsYXBzZUNoYXIke2RpcmVjdGlvbn1gXSA9IChjaGFuZ2UpID0+IHtcbiAgICBjb25zdCBjb2xsYXBzZSA9IGRpcmVjdGlvbiA9PSAnRm9yd2FyZCcgPyAnY29sbGFwc2VUb0VuZCcgOiAnY29sbGFwc2VUb1N0YXJ0J1xuICAgIGNoYW5nZVtjb2xsYXBzZV0oKVtgbW92ZUNoYXIke2RpcmVjdGlvbn1gXSgpXG4gIH1cbn0pXG5cbi8qKlxuICogTWl4IGluIGFsaWFzIG1ldGhvZHMuXG4gKi9cblxuY29uc3QgQUxJQVNfTUVUSE9EUyA9IFtcbiAgWydjb2xsYXBzZUxpbmVCYWNrd2FyZCcsICdjb2xsYXBzZVRvU3RhcnRPZkJsb2NrJ10sXG4gIFsnY29sbGFwc2VMaW5lRm9yd2FyZCcsICdjb2xsYXBzZVRvRW5kT2ZCbG9jayddLFxuICBbJ2V4dGVuZExpbmVCYWNrd2FyZCcsICdleHRlbmRUb1N0YXJ0T2ZCbG9jayddLFxuICBbJ2V4dGVuZExpbmVGb3J3YXJkJywgJ2V4dGVuZFRvRW5kT2ZCbG9jayddLFxuXVxuXG5BTElBU19NRVRIT0RTLmZvckVhY2goKFsgYWxpYXMsIG1ldGhvZCBdKSA9PiB7XG4gIENoYW5nZXNbYWxpYXNdID0gZnVuY3Rpb24gKGNoYW5nZSwgLi4uYXJncykge1xuICAgIGNoYW5nZVttZXRob2RdKGNoYW5nZSwgLi4uYXJncylcbiAgfVxufSlcblxuLyoqXG4gKiBNaXggaW4gc2VsZWN0aW9uIGNoYW5nZXMgdGhhdCBhcmUganVzdCBhIHByb3h5IGZvciB0aGUgc2VsZWN0aW9uIG1ldGhvZC5cbiAqL1xuXG5jb25zdCBQUk9YWV9UUkFOU0ZPUk1TID0gW1xuICAnYmx1cicsXG4gICdjb2xsYXBzZVRvJyxcbiAgJ2NvbGxhcHNlVG9BbmNob3InLFxuICAnY29sbGFwc2VUb0VuZCcsXG4gICdjb2xsYXBzZVRvRW5kT2YnLFxuICAnY29sbGFwc2VUb0ZvY3VzJyxcbiAgJ2NvbGxhcHNlVG9TdGFydCcsXG4gICdjb2xsYXBzZVRvU3RhcnRPZicsXG4gICdleHRlbmQnLFxuICAnZXh0ZW5kVG8nLFxuICAnZXh0ZW5kVG9FbmRPZicsXG4gICdleHRlbmRUb1N0YXJ0T2YnLFxuICAnZmxpcCcsXG4gICdmb2N1cycsXG4gICdtb3ZlJyxcbiAgJ21vdmVBbmNob3InLFxuICAnbW92ZUFuY2hvck9mZnNldFRvJyxcbiAgJ21vdmVBbmNob3JUbycsXG4gICdtb3ZlQW5jaG9yVG9FbmRPZicsXG4gICdtb3ZlQW5jaG9yVG9TdGFydE9mJyxcbiAgJ21vdmVFbmQnLFxuICAnbW92ZUVuZE9mZnNldFRvJyxcbiAgJ21vdmVFbmRUbycsXG4gICdtb3ZlRm9jdXMnLFxuICAnbW92ZUZvY3VzT2Zmc2V0VG8nLFxuICAnbW92ZUZvY3VzVG8nLFxuICAnbW92ZUZvY3VzVG9FbmRPZicsXG4gICdtb3ZlRm9jdXNUb1N0YXJ0T2YnLFxuICAnbW92ZU9mZnNldHNUbycsXG4gICdtb3ZlU3RhcnQnLFxuICAnbW92ZVN0YXJ0T2Zmc2V0VG8nLFxuICAnbW92ZVN0YXJ0VG8nLFxuICAnbW92ZVRvJyxcbiAgJ21vdmVUb0VuZCcsXG4gICdtb3ZlVG9FbmRPZicsXG4gICdtb3ZlVG9SYW5nZU9mJyxcbiAgJ21vdmVUb1N0YXJ0JyxcbiAgJ21vdmVUb1N0YXJ0T2YnLFxuICAnZGVzZWxlY3QnLFxuXVxuXG5QUk9YWV9UUkFOU0ZPUk1TLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICBDaGFuZ2VzW21ldGhvZF0gPSAoY2hhbmdlLCAuLi5hcmdzKSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplID0gbWV0aG9kICE9ICdkZXNlbGVjdCdcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgbGV0IG5leHQgPSBzZWxlY3Rpb25bbWV0aG9kXSguLi5hcmdzKVxuICAgIGlmIChub3JtYWxpemUpIG5leHQgPSBuZXh0Lm5vcm1hbGl6ZShkb2N1bWVudClcbiAgICBjaGFuZ2Uuc2VsZWN0KG5leHQpXG4gIH1cbn0pXG5cbi8qKlxuICogTWl4IGluIG5vZGUtcmVsYXRlZCBjaGFuZ2VzLlxuICovXG5cbmNvbnN0IFBSRUZJWEVTID0gW1xuICAnbW92ZVRvJyxcbiAgJ21vdmVBbmNob3JUbycsXG4gICdtb3ZlRm9jdXNUbycsXG4gICdtb3ZlU3RhcnRUbycsXG4gICdtb3ZlRW5kVG8nLFxuICAnY29sbGFwc2VUbycsXG4gICdleHRlbmRUbycsXG5dXG5cbmNvbnN0IERJUkVDVElPTlMgPSBbXG4gICdOZXh0JyxcbiAgJ1ByZXZpb3VzJyxcbl1cblxuY29uc3QgT0JKRUNUUyA9IFtcbiAgJ0Jsb2NrJyxcbiAgJ0lubGluZScsXG4gICdUZXh0Jyxcbl1cblxuUFJFRklYRVMuZm9yRWFjaCgocHJlZml4KSA9PiB7XG4gIGNvbnN0IGVkZ2VzID0gW1xuICAgICdTdGFydCcsXG4gICAgJ0VuZCcsXG4gIF1cblxuICBpZiAocHJlZml4ID09ICdtb3ZlVG8nKSB7XG4gICAgZWRnZXMucHVzaCgnUmFuZ2UnKVxuICB9XG5cbiAgZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xuICAgIGNvbnN0IG1ldGhvZCA9IGAke3ByZWZpeH0ke2VkZ2V9T2ZgXG5cbiAgICBPQkpFQ1RTLmZvckVhY2goKG9iamVjdCkgPT4ge1xuICAgICAgY29uc3QgZ2V0Tm9kZSA9IG9iamVjdCA9PSAnVGV4dCcgPyAnZ2V0Tm9kZScgOiBgZ2V0Q2xvc2VzdCR7b2JqZWN0fWBcblxuICAgICAgQ2hhbmdlc1tgJHttZXRob2R9JHtvYmplY3R9YF0gPSAoY2hhbmdlKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICAgICAgICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudFtnZXROb2RlXShzZWxlY3Rpb24uc3RhcnRLZXkpXG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICAgIGNoYW5nZVttZXRob2RdKG5vZGUpXG4gICAgICB9XG5cbiAgICAgIERJUkVDVElPTlMuZm9yRWFjaCgoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IGdldERpcmVjdGlvbk5vZGUgPSBgZ2V0JHtkaXJlY3Rpb259JHtvYmplY3R9YFxuICAgICAgICBjb25zdCBkaXJlY3Rpb25LZXkgPSBkaXJlY3Rpb24gPT0gJ05leHQnID8gJ3N0YXJ0S2V5JyA6ICdlbmRLZXknXG5cbiAgICAgICAgQ2hhbmdlc1tgJHttZXRob2R9JHtkaXJlY3Rpb259JHtvYmplY3R9YF0gPSAoY2hhbmdlKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gICAgICAgICAgY29uc3QgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudFtnZXROb2RlXShzZWxlY3Rpb25bZGlyZWN0aW9uS2V5XSlcbiAgICAgICAgICBpZiAoIW5vZGUpIHJldHVyblxuICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50W2dldERpcmVjdGlvbk5vZGVdKG5vZGUua2V5KVxuICAgICAgICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICAgICAgICBjaGFuZ2VbbWV0aG9kXSh0YXJnZXQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlc1xuIl19