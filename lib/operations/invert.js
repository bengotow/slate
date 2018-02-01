'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:operation:invert');

/**
 * Invert an `op`.
 *
 * @param {Object} op
 * @return {Object}
 */

function invertOperation(op) {
  op = _operation2.default.create(op);
  var _op = op,
      type = _op.type;

  debug(type, op);

  /**
   * Insert node.
   */

  if (type == 'insert_node') {
    var inverse = op.set('type', 'remove_node');
    return inverse;
  }

  /**
   * Remove node.
   */

  if (type == 'remove_node') {
    var _inverse = op.set('type', 'insert_node');
    return _inverse;
  }

  /**
   * Move node.
   */

  if (type == 'move_node') {
    var _op2 = op,
        newPath = _op2.newPath,
        path = _op2.path;

    var inversePath = newPath;
    var inverseNewPath = path;

    var pathLast = path.length - 1;
    var newPathLast = newPath.length - 1;

    // If the node's old position was a left sibling of an ancestor of
    // its new position, we need to adjust part of the path by -1.
    if (path.length < inversePath.length && path.slice(0, pathLast).every(function (e, i) {
      return e == inversePath[i];
    }) && path[pathLast] < inversePath[pathLast]) {
      inversePath = inversePath.slice(0, pathLast).concat([inversePath[pathLast] - 1]).concat(inversePath.slice(pathLast + 1, inversePath.length));
    }

    // If the node's new position is an ancestor of the old position,
    // or a left sibling of an ancestor of its old position, we need
    // to adjust part of the path by 1.
    if (newPath.length < inverseNewPath.length && newPath.slice(0, newPathLast).every(function (e, i) {
      return e == inverseNewPath[i];
    }) && newPath[newPathLast] <= inverseNewPath[newPathLast]) {
      inverseNewPath = inverseNewPath.slice(0, newPathLast).concat([inverseNewPath[newPathLast] + 1]).concat(inverseNewPath.slice(newPathLast + 1, inverseNewPath.length));
    }

    var _inverse2 = op.set('path', inversePath).set('newPath', inverseNewPath);
    return _inverse2;
  }

  /**
   * Merge node.
   */

  if (type == 'merge_node') {
    var _op3 = op,
        _path = _op3.path;
    var length = _path.length;

    var last = length - 1;
    var _inversePath = _path.slice(0, last).concat([_path[last] - 1]);
    var _inverse3 = op.set('type', 'split_node').set('path', _inversePath);
    return _inverse3;
  }

  /**
   * Split node.
   */

  if (type == 'split_node') {
    var _op4 = op,
        _path2 = _op4.path;
    var _length = _path2.length;

    var _last = _length - 1;
    var _inversePath2 = _path2.slice(0, _last).concat([_path2[_last] + 1]);
    var _inverse4 = op.set('type', 'merge_node').set('path', _inversePath2);
    return _inverse4;
  }

  /**
   * Set node.
   */

  if (type == 'set_node') {
    var _op5 = op,
        properties = _op5.properties,
        node = _op5.node;

    var inverseNode = node.merge(properties);
    var inverseProperties = (0, _pick2.default)(node, Object.keys(properties));
    var _inverse5 = op.set('node', inverseNode).set('properties', inverseProperties);
    return _inverse5;
  }

  /**
   * Insert text.
   */

  if (type == 'insert_text') {
    var _inverse6 = op.set('type', 'remove_text');
    return _inverse6;
  }

  /**
   * Remove text.
   */

  if (type == 'remove_text') {
    var _inverse7 = op.set('type', 'insert_text');
    return _inverse7;
  }

  /**
   * Add mark.
   */

  if (type == 'add_mark') {
    var _inverse8 = op.set('type', 'remove_mark');
    return _inverse8;
  }

  /**
   * Remove mark.
   */

  if (type == 'remove_mark') {
    var _inverse9 = op.set('type', 'add_mark');
    return _inverse9;
  }

  /**
   * Set mark.
   */

  if (type == 'set_mark') {
    var _op6 = op,
        _properties = _op6.properties,
        mark = _op6.mark;

    var inverseMark = mark.merge(_properties);
    var _inverseProperties = (0, _pick2.default)(mark, Object.keys(_properties));
    var _inverse10 = op.set('mark', inverseMark).set('properties', _inverseProperties);
    return _inverse10;
  }

  /**
   * Set selection.
   */

  if (type == 'set_selection') {
    var _op7 = op,
        _properties2 = _op7.properties,
        selection = _op7.selection;

    var inverseSelection = selection.merge(_properties2);
    var inverseProps = (0, _pick2.default)(selection, Object.keys(_properties2));
    var _inverse11 = op.set('selection', inverseSelection).set('properties', inverseProps);
    return _inverse11;
  }

  /**
   * Set value.
   */

  if (type == 'set_value') {
    var _op8 = op,
        _properties3 = _op8.properties,
        value = _op8.value;

    var inverseValue = value.merge(_properties3);
    var _inverseProperties2 = (0, _pick2.default)(value, Object.keys(_properties3));
    var _inverse12 = op.set('value', inverseValue).set('properties', _inverseProperties2);
    return _inverse12;
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = invertOperation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vcGVyYXRpb25zL2ludmVydC5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImludmVydE9wZXJhdGlvbiIsIm9wIiwiY3JlYXRlIiwidHlwZSIsImludmVyc2UiLCJzZXQiLCJuZXdQYXRoIiwicGF0aCIsImludmVyc2VQYXRoIiwiaW52ZXJzZU5ld1BhdGgiLCJwYXRoTGFzdCIsImxlbmd0aCIsIm5ld1BhdGhMYXN0Iiwic2xpY2UiLCJldmVyeSIsImUiLCJpIiwiY29uY2F0IiwibGFzdCIsInByb3BlcnRpZXMiLCJub2RlIiwiaW52ZXJzZU5vZGUiLCJtZXJnZSIsImludmVyc2VQcm9wZXJ0aWVzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcmsiLCJpbnZlcnNlTWFyayIsInNlbGVjdGlvbiIsImludmVyc2VTZWxlY3Rpb24iLCJpbnZlcnNlUHJvcHMiLCJ2YWx1ZSIsImludmVyc2VWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxxQkFBTSx3QkFBTixDQUFkOztBQUVBOzs7Ozs7O0FBT0EsU0FBU0MsZUFBVCxDQUF5QkMsRUFBekIsRUFBNkI7QUFDM0JBLE9BQUssb0JBQVVDLE1BQVYsQ0FBaUJELEVBQWpCLENBQUw7QUFEMkIsWUFFVkEsRUFGVTtBQUFBLE1BRW5CRSxJQUZtQixPQUVuQkEsSUFGbUI7O0FBRzNCSixRQUFNSSxJQUFOLEVBQVlGLEVBQVo7O0FBRUE7Ozs7QUFJQSxNQUFJRSxRQUFRLGFBQVosRUFBMkI7QUFDekIsUUFBTUMsVUFBVUgsR0FBR0ksR0FBSCxDQUFPLE1BQVAsRUFBZSxhQUFmLENBQWhCO0FBQ0EsV0FBT0QsT0FBUDtBQUNEOztBQUVEOzs7O0FBSUEsTUFBSUQsUUFBUSxhQUFaLEVBQTJCO0FBQ3pCLFFBQU1DLFdBQVVILEdBQUdJLEdBQUgsQ0FBTyxNQUFQLEVBQWUsYUFBZixDQUFoQjtBQUNBLFdBQU9ELFFBQVA7QUFDRDs7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T0MsSUFBUCxDQUFZTixZQUFaLENBQVosQ0FBMUI7QUFDQSxRQUFNZixhQUFVSCxHQUFHSSxHQUFILENBQU8sT0FBUCxFQUFnQjJCLFlBQWhCLEVBQThCM0IsR0FBOUIsQ0FBa0MsWUFBbEMsRUFBZ0RrQixtQkFBaEQsQ0FBaEI7QUFDQSxXQUFPbkIsVUFBUDtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7OztrQkFNZUosZSIsImZpbGUiOiJpbnZlcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1ZydcbmltcG9ydCBwaWNrIGZyb20gJ2xvZGFzaC9waWNrJ1xuXG5pbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4uL21vZGVscy9vcGVyYXRpb24nXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOm9wZXJhdGlvbjppbnZlcnQnKVxuXG4vKipcbiAqIEludmVydCBhbiBgb3BgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGludmVydE9wZXJhdGlvbihvcCkge1xuICBvcCA9IE9wZXJhdGlvbi5jcmVhdGUob3ApXG4gIGNvbnN0IHsgdHlwZSB9ID0gb3BcbiAgZGVidWcodHlwZSwgb3ApXG5cbiAgLyoqXG4gICAqIEluc2VydCBub2RlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnaW5zZXJ0X25vZGUnKSB7XG4gICAgY29uc3QgaW52ZXJzZSA9IG9wLnNldCgndHlwZScsICdyZW1vdmVfbm9kZScpXG4gICAgcmV0dXJuIGludmVyc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgbm9kZS5cbiAgICovXG5cbiAgaWYgKHR5cGUgPT0gJ3JlbW92ZV9ub2RlJykge1xuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ3R5cGUnLCAnaW5zZXJ0X25vZGUnKVxuICAgIHJldHVybiBpbnZlcnNlXG4gIH1cblxuICAvKipcbiAgICogTW92ZSBub2RlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnbW92ZV9ub2RlJykge1xuICAgIGNvbnN0IHsgbmV3UGF0aCwgcGF0aCB9ID0gb3BcbiAgICBsZXQgaW52ZXJzZVBhdGggPSBuZXdQYXRoXG4gICAgbGV0IGludmVyc2VOZXdQYXRoID0gcGF0aFxuXG4gICAgY29uc3QgcGF0aExhc3QgPSBwYXRoLmxlbmd0aCAtIDFcbiAgICBjb25zdCBuZXdQYXRoTGFzdCA9IG5ld1BhdGgubGVuZ3RoIC0gMVxuXG4gICAgLy8gSWYgdGhlIG5vZGUncyBvbGQgcG9zaXRpb24gd2FzIGEgbGVmdCBzaWJsaW5nIG9mIGFuIGFuY2VzdG9yIG9mXG4gICAgLy8gaXRzIG5ldyBwb3NpdGlvbiwgd2UgbmVlZCB0byBhZGp1c3QgcGFydCBvZiB0aGUgcGF0aCBieSAtMS5cbiAgICBpZiAocGF0aC5sZW5ndGggPCBpbnZlcnNlUGF0aC5sZW5ndGggJiZcbiAgICAgICAgcGF0aC5zbGljZSgwLCBwYXRoTGFzdCkuZXZlcnkoKGUsIGkpID0+IGUgPT0gaW52ZXJzZVBhdGhbaV0pICYmXG4gICAgICAgIHBhdGhbcGF0aExhc3RdIDwgaW52ZXJzZVBhdGhbcGF0aExhc3RdKSB7XG4gICAgICBpbnZlcnNlUGF0aCA9IGludmVyc2VQYXRoLnNsaWNlKDAsIHBhdGhMYXN0KVxuICAgICAgICAuY29uY2F0KFtpbnZlcnNlUGF0aFtwYXRoTGFzdF0gLSAxXSlcbiAgICAgICAgLmNvbmNhdChpbnZlcnNlUGF0aC5zbGljZShwYXRoTGFzdCArIDEsIGludmVyc2VQYXRoLmxlbmd0aCkpXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG5vZGUncyBuZXcgcG9zaXRpb24gaXMgYW4gYW5jZXN0b3Igb2YgdGhlIG9sZCBwb3NpdGlvbixcbiAgICAvLyBvciBhIGxlZnQgc2libGluZyBvZiBhbiBhbmNlc3RvciBvZiBpdHMgb2xkIHBvc2l0aW9uLCB3ZSBuZWVkXG4gICAgLy8gdG8gYWRqdXN0IHBhcnQgb2YgdGhlIHBhdGggYnkgMS5cbiAgICBpZiAobmV3UGF0aC5sZW5ndGggPCBpbnZlcnNlTmV3UGF0aC5sZW5ndGggJiZcbiAgICAgICAgbmV3UGF0aC5zbGljZSgwLCBuZXdQYXRoTGFzdCkuZXZlcnkoKGUsIGkpID0+IGUgPT0gaW52ZXJzZU5ld1BhdGhbaV0pICYmXG4gICAgICAgIG5ld1BhdGhbbmV3UGF0aExhc3RdIDw9IGludmVyc2VOZXdQYXRoW25ld1BhdGhMYXN0XSkge1xuICAgICAgaW52ZXJzZU5ld1BhdGggPSBpbnZlcnNlTmV3UGF0aC5zbGljZSgwLCBuZXdQYXRoTGFzdClcbiAgICAgICAgLmNvbmNhdChbaW52ZXJzZU5ld1BhdGhbbmV3UGF0aExhc3RdICsgMV0pXG4gICAgICAgIC5jb25jYXQoaW52ZXJzZU5ld1BhdGguc2xpY2UobmV3UGF0aExhc3QgKyAxLCBpbnZlcnNlTmV3UGF0aC5sZW5ndGgpKVxuICAgIH1cblxuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ3BhdGgnLCBpbnZlcnNlUGF0aCkuc2V0KCduZXdQYXRoJywgaW52ZXJzZU5ld1BhdGgpXG4gICAgcmV0dXJuIGludmVyc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSBub2RlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnbWVyZ2Vfbm9kZScpIHtcbiAgICBjb25zdCB7IHBhdGggfSA9IG9wXG4gICAgY29uc3QgeyBsZW5ndGggfSA9IHBhdGhcbiAgICBjb25zdCBsYXN0ID0gbGVuZ3RoIC0gMVxuICAgIGNvbnN0IGludmVyc2VQYXRoID0gcGF0aC5zbGljZSgwLCBsYXN0KS5jb25jYXQoW3BhdGhbbGFzdF0gLSAxXSlcbiAgICBjb25zdCBpbnZlcnNlID0gb3Auc2V0KCd0eXBlJywgJ3NwbGl0X25vZGUnKS5zZXQoJ3BhdGgnLCBpbnZlcnNlUGF0aClcbiAgICByZXR1cm4gaW52ZXJzZVxuICB9XG5cbiAgLyoqXG4gICAqIFNwbGl0IG5vZGUuXG4gICAqL1xuXG4gIGlmICh0eXBlID09ICdzcGxpdF9ub2RlJykge1xuICAgIGNvbnN0IHsgcGF0aCB9ID0gb3BcbiAgICBjb25zdCB7IGxlbmd0aCB9ID0gcGF0aFxuICAgIGNvbnN0IGxhc3QgPSBsZW5ndGggLSAxXG4gICAgY29uc3QgaW52ZXJzZVBhdGggPSBwYXRoLnNsaWNlKDAsIGxhc3QpLmNvbmNhdChbcGF0aFtsYXN0XSArIDFdKVxuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ3R5cGUnLCAnbWVyZ2Vfbm9kZScpLnNldCgncGF0aCcsIGludmVyc2VQYXRoKVxuICAgIHJldHVybiBpbnZlcnNlXG4gIH1cblxuICAvKipcbiAgICogU2V0IG5vZGUuXG4gICAqL1xuXG4gIGlmICh0eXBlID09ICdzZXRfbm9kZScpIHtcbiAgICBjb25zdCB7IHByb3BlcnRpZXMsIG5vZGUgfSA9IG9wXG4gICAgY29uc3QgaW52ZXJzZU5vZGUgPSBub2RlLm1lcmdlKHByb3BlcnRpZXMpXG4gICAgY29uc3QgaW52ZXJzZVByb3BlcnRpZXMgPSBwaWNrKG5vZGUsIE9iamVjdC5rZXlzKHByb3BlcnRpZXMpKVxuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ25vZGUnLCBpbnZlcnNlTm9kZSkuc2V0KCdwcm9wZXJ0aWVzJywgaW52ZXJzZVByb3BlcnRpZXMpXG4gICAgcmV0dXJuIGludmVyc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgdGV4dC5cbiAgICovXG5cbiAgaWYgKHR5cGUgPT0gJ2luc2VydF90ZXh0Jykge1xuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ3R5cGUnLCAncmVtb3ZlX3RleHQnKVxuICAgIHJldHVybiBpbnZlcnNlXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRleHQuXG4gICAqL1xuXG4gIGlmICh0eXBlID09ICdyZW1vdmVfdGV4dCcpIHtcbiAgICBjb25zdCBpbnZlcnNlID0gb3Auc2V0KCd0eXBlJywgJ2luc2VydF90ZXh0JylcbiAgICByZXR1cm4gaW52ZXJzZVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBtYXJrLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnYWRkX21hcmsnKSB7XG4gICAgY29uc3QgaW52ZXJzZSA9IG9wLnNldCgndHlwZScsICdyZW1vdmVfbWFyaycpXG4gICAgcmV0dXJuIGludmVyc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgbWFyay5cbiAgICovXG5cbiAgaWYgKHR5cGUgPT0gJ3JlbW92ZV9tYXJrJykge1xuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ3R5cGUnLCAnYWRkX21hcmsnKVxuICAgIHJldHVybiBpbnZlcnNlXG4gIH1cblxuICAvKipcbiAgICogU2V0IG1hcmsuXG4gICAqL1xuXG4gIGlmICh0eXBlID09ICdzZXRfbWFyaycpIHtcbiAgICBjb25zdCB7IHByb3BlcnRpZXMsIG1hcmsgfSA9IG9wXG4gICAgY29uc3QgaW52ZXJzZU1hcmsgPSBtYXJrLm1lcmdlKHByb3BlcnRpZXMpXG4gICAgY29uc3QgaW52ZXJzZVByb3BlcnRpZXMgPSBwaWNrKG1hcmssIE9iamVjdC5rZXlzKHByb3BlcnRpZXMpKVxuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ21hcmsnLCBpbnZlcnNlTWFyaykuc2V0KCdwcm9wZXJ0aWVzJywgaW52ZXJzZVByb3BlcnRpZXMpXG4gICAgcmV0dXJuIGludmVyc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgc2VsZWN0aW9uLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnc2V0X3NlbGVjdGlvbicpIHtcbiAgICBjb25zdCB7IHByb3BlcnRpZXMsIHNlbGVjdGlvbiB9ID0gb3BcbiAgICBjb25zdCBpbnZlcnNlU2VsZWN0aW9uID0gc2VsZWN0aW9uLm1lcmdlKHByb3BlcnRpZXMpXG4gICAgY29uc3QgaW52ZXJzZVByb3BzID0gcGljayhzZWxlY3Rpb24sIE9iamVjdC5rZXlzKHByb3BlcnRpZXMpKVxuICAgIGNvbnN0IGludmVyc2UgPSBvcC5zZXQoJ3NlbGVjdGlvbicsIGludmVyc2VTZWxlY3Rpb24pLnNldCgncHJvcGVydGllcycsIGludmVyc2VQcm9wcylcbiAgICByZXR1cm4gaW52ZXJzZVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB2YWx1ZS5cbiAgICovXG5cbiAgaWYgKHR5cGUgPT0gJ3NldF92YWx1ZScpIHtcbiAgICBjb25zdCB7IHByb3BlcnRpZXMsIHZhbHVlIH0gPSBvcFxuICAgIGNvbnN0IGludmVyc2VWYWx1ZSA9IHZhbHVlLm1lcmdlKHByb3BlcnRpZXMpXG4gICAgY29uc3QgaW52ZXJzZVByb3BlcnRpZXMgPSBwaWNrKHZhbHVlLCBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSlcbiAgICBjb25zdCBpbnZlcnNlID0gb3Auc2V0KCd2YWx1ZScsIGludmVyc2VWYWx1ZSkuc2V0KCdwcm9wZXJ0aWVzJywgaW52ZXJzZVByb3BlcnRpZXMpXG4gICAgcmV0dXJuIGludmVyc2VcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgaW52ZXJ0T3BlcmF0aW9uXG4iXX0=