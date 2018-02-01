'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _invert = require('../operations/invert');

var _invert2 = _interopRequireDefault(_invert);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Redo to the next value in the history.
 *
 * @param {Change} change
 */

Changes.redo = function (change) {
  var value = change.value;
  var _value = value,
      history = _value.history;

  if (!history) return;

  var _history = history,
      undos = _history.undos,
      redos = _history.redos;

  var next = redos.peek();
  if (!next) return;

  // Shift the next value into the undo stack.
  redos = redos.pop();
  undos = undos.push(next);

  // Replay the next operations.
  next.map(function (json) {
    return _operation2.default.fromJSON(json);
  }).forEach(function (op) {
    var _op = op,
        type = _op.type,
        properties = _op.properties;

    // When the operation mutates the selection, omit its `isFocused` value to
    // prevent the editor focus from changing during redoing.

    if (type == 'set_selection') {
      op = op.set('properties', (0, _omit2.default)(properties, 'isFocused'));
    }

    change.applyOperation(op, { save: false });
  });

  // Update the history.
  value = change.value;
  history = history.set('undos', undos).set('redos', redos);
  value = value.set('history', history);
  change.value = value;
};

/**
 * Undo the previous operations in the history.
 *
 * @param {Change} change
 */

Changes.undo = function (change) {
  var value = change.value;
  var _value2 = value,
      history = _value2.history;

  if (!history) return;

  var _history2 = history,
      undos = _history2.undos,
      redos = _history2.redos;

  var previous = undos.peek();
  if (!previous) return;

  // Shift the previous operations into the redo stack.
  undos = undos.pop();
  redos = redos.push(previous);

  // Replay the inverse of the previous operations.
  previous.slice().reverse().map(function (json) {
    return (0, _invert2.default)(_operation2.default.fromJSON(json));
  }).forEach(function (inverse) {
    var _inverse = inverse,
        type = _inverse.type,
        properties = _inverse.properties;

    // When the operation mutates the selection, omit its `isFocused` value to
    // prevent the editor focus from changing during undoing.

    if (type == 'set_selection') {
      inverse = inverse.set('properties', (0, _omit2.default)(properties, 'isFocused'));
    }

    change.applyOperation(inverse, { save: false });
  });

  // Update the history.
  value = change.value;
  history = history.set('undos', undos).set('redos', redos);
  value = value.set('history', history);
  change.value = value;
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL29uLWhpc3RvcnkuanMiXSwibmFtZXMiOlsiQ2hhbmdlcyIsInJlZG8iLCJjaGFuZ2UiLCJ2YWx1ZSIsImhpc3RvcnkiLCJ1bmRvcyIsInJlZG9zIiwibmV4dCIsInBlZWsiLCJwb3AiLCJwdXNoIiwibWFwIiwiZnJvbUpTT04iLCJqc29uIiwiZm9yRWFjaCIsIm9wIiwidHlwZSIsInByb3BlcnRpZXMiLCJzZXQiLCJhcHBseU9wZXJhdGlvbiIsInNhdmUiLCJ1bmRvIiwicHJldmlvdXMiLCJzbGljZSIsInJldmVyc2UiLCJpbnZlcnNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxVQUFVLEVBQWhCOztBQUVBOzs7Ozs7QUFNQUEsUUFBUUMsSUFBUixHQUFlLFVBQUNDLE1BQUQsRUFBWTtBQUFBLE1BQ25CQyxLQURtQixHQUNURCxNQURTLENBQ25CQyxLQURtQjtBQUFBLGVBRVBBLEtBRk87QUFBQSxNQUVuQkMsT0FGbUIsVUFFbkJBLE9BRm1COztBQUd6QixNQUFJLENBQUNBLE9BQUwsRUFBYzs7QUFIVyxpQkFLRkEsT0FMRTtBQUFBLE1BS25CQyxLQUxtQixZQUtuQkEsS0FMbUI7QUFBQSxNQUtaQyxLQUxZLFlBS1pBLEtBTFk7O0FBTXpCLE1BQU1DLE9BQU9ELE1BQU1FLElBQU4sRUFBYjtBQUNBLE1BQUksQ0FBQ0QsSUFBTCxFQUFXOztBQUVYO0FBQ0FELFVBQVFBLE1BQU1HLEdBQU4sRUFBUjtBQUNBSixVQUFRQSxNQUFNSyxJQUFOLENBQVdILElBQVgsQ0FBUjs7QUFFQTtBQUNBQSxPQUFLSSxHQUFMLENBQVM7QUFBQSxXQUFRLG9CQUFVQyxRQUFWLENBQW1CQyxJQUFuQixDQUFSO0FBQUEsR0FBVCxFQUEyQ0MsT0FBM0MsQ0FBbUQsVUFBQ0MsRUFBRCxFQUFRO0FBQUEsY0FDNUJBLEVBRDRCO0FBQUEsUUFDakRDLElBRGlELE9BQ2pEQSxJQURpRDtBQUFBLFFBQzNDQyxVQUQyQyxPQUMzQ0EsVUFEMkM7O0FBR3pEO0FBQ0E7O0FBQ0EsUUFBSUQsUUFBUSxlQUFaLEVBQTZCO0FBQzNCRCxXQUFLQSxHQUFHRyxHQUFILENBQU8sWUFBUCxFQUFxQixvQkFBS0QsVUFBTCxFQUFpQixXQUFqQixDQUFyQixDQUFMO0FBQ0Q7O0FBRURmLFdBQU9pQixjQUFQLENBQXNCSixFQUF0QixFQUEwQixFQUFFSyxNQUFNLEtBQVIsRUFBMUI7QUFDRCxHQVZEOztBQVlBO0FBQ0FqQixVQUFRRCxPQUFPQyxLQUFmO0FBQ0FDLFlBQVVBLFFBQVFjLEdBQVIsQ0FBWSxPQUFaLEVBQXFCYixLQUFyQixFQUE0QmEsR0FBNUIsQ0FBZ0MsT0FBaEMsRUFBeUNaLEtBQXpDLENBQVY7QUFDQUgsVUFBUUEsTUFBTWUsR0FBTixDQUFVLFNBQVYsRUFBcUJkLE9BQXJCLENBQVI7QUFDQUYsU0FBT0MsS0FBUCxHQUFlQSxLQUFmO0FBQ0QsQ0EvQkQ7O0FBaUNBOzs7Ozs7QUFNQUgsUUFBUXFCLElBQVIsR0FBZSxVQUFDbkIsTUFBRCxFQUFZO0FBQUEsTUFDbkJDLEtBRG1CLEdBQ1RELE1BRFMsQ0FDbkJDLEtBRG1CO0FBQUEsZ0JBRVBBLEtBRk87QUFBQSxNQUVuQkMsT0FGbUIsV0FFbkJBLE9BRm1COztBQUd6QixNQUFJLENBQUNBLE9BQUwsRUFBYzs7QUFIVyxrQkFLRkEsT0FMRTtBQUFBLE1BS25CQyxLQUxtQixhQUtuQkEsS0FMbUI7QUFBQSxNQUtaQyxLQUxZLGFBS1pBLEtBTFk7O0FBTXpCLE1BQU1nQixXQUFXakIsTUFBTUcsSUFBTixFQUFqQjtBQUNBLE1BQUksQ0FBQ2MsUUFBTCxFQUFlOztBQUVmO0FBQ0FqQixVQUFRQSxNQUFNSSxHQUFOLEVBQVI7QUFDQUgsVUFBUUEsTUFBTUksSUFBTixDQUFXWSxRQUFYLENBQVI7O0FBRUE7QUFDQUEsV0FBU0MsS0FBVCxHQUFpQkMsT0FBakIsR0FBMkJiLEdBQTNCLENBQStCO0FBQUEsV0FBUSxzQkFBTyxvQkFBVUMsUUFBVixDQUFtQkMsSUFBbkIsQ0FBUCxDQUFSO0FBQUEsR0FBL0IsRUFBeUVDLE9BQXpFLENBQWlGLFVBQUNXLE9BQUQsRUFBYTtBQUFBLG1CQUMvREEsT0FEK0Q7QUFBQSxRQUNwRlQsSUFEb0YsWUFDcEZBLElBRG9GO0FBQUEsUUFDOUVDLFVBRDhFLFlBQzlFQSxVQUQ4RTs7QUFHNUY7QUFDQTs7QUFDQSxRQUFJRCxRQUFRLGVBQVosRUFBNkI7QUFDM0JTLGdCQUFVQSxRQUFRUCxHQUFSLENBQVksWUFBWixFQUEwQixvQkFBS0QsVUFBTCxFQUFpQixXQUFqQixDQUExQixDQUFWO0FBQ0Q7O0FBRURmLFdBQU9pQixjQUFQLENBQXNCTSxPQUF0QixFQUErQixFQUFFTCxNQUFNLEtBQVIsRUFBL0I7QUFDRCxHQVZEOztBQVlBO0FBQ0FqQixVQUFRRCxPQUFPQyxLQUFmO0FBQ0FDLFlBQVVBLFFBQVFjLEdBQVIsQ0FBWSxPQUFaLEVBQXFCYixLQUFyQixFQUE0QmEsR0FBNUIsQ0FBZ0MsT0FBaEMsRUFBeUNaLEtBQXpDLENBQVY7QUFDQUgsVUFBUUEsTUFBTWUsR0FBTixDQUFVLFNBQVYsRUFBcUJkLE9BQXJCLENBQVI7QUFDQUYsU0FBT0MsS0FBUCxHQUFlQSxLQUFmO0FBQ0QsQ0EvQkQ7O0FBaUNBOzs7Ozs7a0JBTWVILE8iLCJmaWxlIjoib24taGlzdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGludmVydCBmcm9tICcuLi9vcGVyYXRpb25zL2ludmVydCdcbmltcG9ydCBPcGVyYXRpb24gZnJvbSAnLi4vbW9kZWxzL29wZXJhdGlvbidcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0J1xuXG4vKipcbiAqIENoYW5nZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBDaGFuZ2VzID0ge31cblxuLyoqXG4gKiBSZWRvIHRvIHRoZSBuZXh0IHZhbHVlIGluIHRoZSBoaXN0b3J5LlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqL1xuXG5DaGFuZ2VzLnJlZG8gPSAoY2hhbmdlKSA9PiB7XG4gIGxldCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgaGlzdG9yeSB9ID0gdmFsdWVcbiAgaWYgKCFoaXN0b3J5KSByZXR1cm5cblxuICBsZXQgeyB1bmRvcywgcmVkb3MgfSA9IGhpc3RvcnlcbiAgY29uc3QgbmV4dCA9IHJlZG9zLnBlZWsoKVxuICBpZiAoIW5leHQpIHJldHVyblxuXG4gIC8vIFNoaWZ0IHRoZSBuZXh0IHZhbHVlIGludG8gdGhlIHVuZG8gc3RhY2suXG4gIHJlZG9zID0gcmVkb3MucG9wKClcbiAgdW5kb3MgPSB1bmRvcy5wdXNoKG5leHQpXG5cbiAgLy8gUmVwbGF5IHRoZSBuZXh0IG9wZXJhdGlvbnMuXG4gIG5leHQubWFwKGpzb24gPT4gT3BlcmF0aW9uLmZyb21KU09OKGpzb24pKS5mb3JFYWNoKChvcCkgPT4ge1xuICAgIGNvbnN0IHsgdHlwZSwgcHJvcGVydGllcyB9ID0gb3BcblxuICAgIC8vIFdoZW4gdGhlIG9wZXJhdGlvbiBtdXRhdGVzIHRoZSBzZWxlY3Rpb24sIG9taXQgaXRzIGBpc0ZvY3VzZWRgIHZhbHVlIHRvXG4gICAgLy8gcHJldmVudCB0aGUgZWRpdG9yIGZvY3VzIGZyb20gY2hhbmdpbmcgZHVyaW5nIHJlZG9pbmcuXG4gICAgaWYgKHR5cGUgPT0gJ3NldF9zZWxlY3Rpb24nKSB7XG4gICAgICBvcCA9IG9wLnNldCgncHJvcGVydGllcycsIG9taXQocHJvcGVydGllcywgJ2lzRm9jdXNlZCcpKVxuICAgIH1cblxuICAgIGNoYW5nZS5hcHBseU9wZXJhdGlvbihvcCwgeyBzYXZlOiBmYWxzZSB9KVxuICB9KVxuXG4gIC8vIFVwZGF0ZSB0aGUgaGlzdG9yeS5cbiAgdmFsdWUgPSBjaGFuZ2UudmFsdWVcbiAgaGlzdG9yeSA9IGhpc3Rvcnkuc2V0KCd1bmRvcycsIHVuZG9zKS5zZXQoJ3JlZG9zJywgcmVkb3MpXG4gIHZhbHVlID0gdmFsdWUuc2V0KCdoaXN0b3J5JywgaGlzdG9yeSlcbiAgY2hhbmdlLnZhbHVlID0gdmFsdWVcbn1cblxuLyoqXG4gKiBVbmRvIHRoZSBwcmV2aW91cyBvcGVyYXRpb25zIGluIHRoZSBoaXN0b3J5LlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqL1xuXG5DaGFuZ2VzLnVuZG8gPSAoY2hhbmdlKSA9PiB7XG4gIGxldCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgaGlzdG9yeSB9ID0gdmFsdWVcbiAgaWYgKCFoaXN0b3J5KSByZXR1cm5cblxuICBsZXQgeyB1bmRvcywgcmVkb3MgfSA9IGhpc3RvcnlcbiAgY29uc3QgcHJldmlvdXMgPSB1bmRvcy5wZWVrKClcbiAgaWYgKCFwcmV2aW91cykgcmV0dXJuXG5cbiAgLy8gU2hpZnQgdGhlIHByZXZpb3VzIG9wZXJhdGlvbnMgaW50byB0aGUgcmVkbyBzdGFjay5cbiAgdW5kb3MgPSB1bmRvcy5wb3AoKVxuICByZWRvcyA9IHJlZG9zLnB1c2gocHJldmlvdXMpXG5cbiAgLy8gUmVwbGF5IHRoZSBpbnZlcnNlIG9mIHRoZSBwcmV2aW91cyBvcGVyYXRpb25zLlxuICBwcmV2aW91cy5zbGljZSgpLnJldmVyc2UoKS5tYXAoanNvbiA9PiBpbnZlcnQoT3BlcmF0aW9uLmZyb21KU09OKGpzb24pKSkuZm9yRWFjaCgoaW52ZXJzZSkgPT4ge1xuICAgIGNvbnN0IHsgdHlwZSwgcHJvcGVydGllcyB9ID0gaW52ZXJzZVxuXG4gICAgLy8gV2hlbiB0aGUgb3BlcmF0aW9uIG11dGF0ZXMgdGhlIHNlbGVjdGlvbiwgb21pdCBpdHMgYGlzRm9jdXNlZGAgdmFsdWUgdG9cbiAgICAvLyBwcmV2ZW50IHRoZSBlZGl0b3IgZm9jdXMgZnJvbSBjaGFuZ2luZyBkdXJpbmcgdW5kb2luZy5cbiAgICBpZiAodHlwZSA9PSAnc2V0X3NlbGVjdGlvbicpIHtcbiAgICAgIGludmVyc2UgPSBpbnZlcnNlLnNldCgncHJvcGVydGllcycsIG9taXQocHJvcGVydGllcywgJ2lzRm9jdXNlZCcpKVxuICAgIH1cblxuICAgIGNoYW5nZS5hcHBseU9wZXJhdGlvbihpbnZlcnNlLCB7IHNhdmU6IGZhbHNlIH0pXG4gIH0pXG5cbiAgLy8gVXBkYXRlIHRoZSBoaXN0b3J5LlxuICB2YWx1ZSA9IGNoYW5nZS52YWx1ZVxuICBoaXN0b3J5ID0gaGlzdG9yeS5zZXQoJ3VuZG9zJywgdW5kb3MpLnNldCgncmVkb3MnLCByZWRvcylcbiAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2hpc3RvcnknLCBoaXN0b3J5KVxuICBjaGFuZ2UudmFsdWUgPSB2YWx1ZVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IENoYW5nZXNcbiJdfQ==