'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slate = require('slate');

var _immutable = require('immutable');

/**
 * Deserialize a plain text `string` to a Slate value.
 *
 * @param {String} string
 * @param {Object} options
 *   @property {Boolean} toJSON
 *   @property {String|Object|Block} defaultBlock
 *   @property {Array|Set} defaultMarks
 * @return {Value}
 */

function deserialize(string) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$defaultBlock = options.defaultBlock,
      defaultBlock = _options$defaultBlock === undefined ? 'line' : _options$defaultBlock,
      _options$defaultMarks = options.defaultMarks,
      defaultMarks = _options$defaultMarks === undefined ? [] : _options$defaultMarks,
      _options$toJSON = options.toJSON,
      toJSON = _options$toJSON === undefined ? false : _options$toJSON;


  if (_immutable.Set.isSet(defaultMarks)) {
    defaultMarks = defaultMarks.toArray();
  }

  defaultBlock = _slate.Node.createProperties(defaultBlock);
  defaultMarks = defaultMarks.map(_slate.Mark.createProperties);

  var json = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: string.split('\n').map(function (line) {
        return _extends({}, defaultBlock, {
          object: 'block',
          isVoid: false,
          data: {},
          nodes: [{
            object: 'text',
            leaves: [{
              object: 'leaf',
              text: line,
              marks: defaultMarks
            }]
          }]
        });
      })
    }
  };

  var ret = toJSON ? json : _slate.Value.fromJSON(json);
  return ret;
}

/**
 * Serialize a Slate `value` to a plain text string.
 *
 * @param {Value} value
 * @return {String}
 */

function serialize(value) {
  return serializeNode(value.document);
}

/**
 * Serialize a `node` to plain text.
 *
 * @param {Node} node
 * @return {String}
 */

function serializeNode(node) {
  if (node.object == 'document' || node.object == 'block' && _slate.Block.isBlockList(node.nodes)) {
    return node.nodes.map(serializeNode).join('\n');
  } else {
    return node.text;
  }
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  deserialize: deserialize,
  serialize: serialize
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZXNlcmlhbGl6ZSIsInN0cmluZyIsIm9wdGlvbnMiLCJkZWZhdWx0QmxvY2siLCJkZWZhdWx0TWFya3MiLCJ0b0pTT04iLCJpc1NldCIsInRvQXJyYXkiLCJjcmVhdGVQcm9wZXJ0aWVzIiwibWFwIiwianNvbiIsIm9iamVjdCIsImRvY3VtZW50IiwiZGF0YSIsIm5vZGVzIiwic3BsaXQiLCJsaW5lIiwiaXNWb2lkIiwibGVhdmVzIiwidGV4dCIsIm1hcmtzIiwicmV0IiwiZnJvbUpTT04iLCJzZXJpYWxpemUiLCJ2YWx1ZSIsInNlcmlhbGl6ZU5vZGUiLCJub2RlIiwiaXNCbG9ja0xpc3QiLCJqb2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQVdBLFNBQVNBLFdBQVQsQ0FBcUJDLE1BQXJCLEVBQTJDO0FBQUEsTUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUEsOEJBS3JDQSxPQUxxQyxDQUV2Q0MsWUFGdUM7QUFBQSxNQUV2Q0EsWUFGdUMseUNBRXhCLE1BRndCO0FBQUEsOEJBS3JDRCxPQUxxQyxDQUd2Q0UsWUFIdUM7QUFBQSxNQUd2Q0EsWUFIdUMseUNBR3hCLEVBSHdCO0FBQUEsd0JBS3JDRixPQUxxQyxDQUl2Q0csTUFKdUM7QUFBQSxNQUl2Q0EsTUFKdUMsbUNBSTlCLEtBSjhCOzs7QUFPekMsTUFBSSxlQUFJQyxLQUFKLENBQVVGLFlBQVYsQ0FBSixFQUE2QjtBQUMzQkEsbUJBQWVBLGFBQWFHLE9BQWIsRUFBZjtBQUNEOztBQUVESixpQkFBZSxZQUFLSyxnQkFBTCxDQUFzQkwsWUFBdEIsQ0FBZjtBQUNBQyxpQkFBZUEsYUFBYUssR0FBYixDQUFpQixZQUFLRCxnQkFBdEIsQ0FBZjs7QUFFQSxNQUFNRSxPQUFPO0FBQ1hDLFlBQVEsT0FERztBQUVYQyxjQUFVO0FBQ1JELGNBQVEsVUFEQTtBQUVSRSxZQUFNLEVBRkU7QUFHUkMsYUFBT2IsT0FBT2MsS0FBUCxDQUFhLElBQWIsRUFBbUJOLEdBQW5CLENBQXVCLFVBQUNPLElBQUQsRUFBVTtBQUN0Qyw0QkFDS2IsWUFETDtBQUVFUSxrQkFBUSxPQUZWO0FBR0VNLGtCQUFRLEtBSFY7QUFJRUosZ0JBQU0sRUFKUjtBQUtFQyxpQkFBTyxDQUNMO0FBQ0VILG9CQUFRLE1BRFY7QUFFRU8sb0JBQVEsQ0FDTjtBQUNFUCxzQkFBUSxNQURWO0FBRUVRLG9CQUFNSCxJQUZSO0FBR0VJLHFCQUFPaEI7QUFIVCxhQURNO0FBRlYsV0FESztBQUxUO0FBa0JELE9BbkJNO0FBSEM7QUFGQyxHQUFiOztBQTRCQSxNQUFNaUIsTUFBTWhCLFNBQVNLLElBQVQsR0FBZ0IsYUFBTVksUUFBTixDQUFlWixJQUFmLENBQTVCO0FBQ0EsU0FBT1csR0FBUDtBQUNEOztBQUVEOzs7Ozs7O0FBT0EsU0FBU0UsU0FBVCxDQUFtQkMsS0FBbkIsRUFBMEI7QUFDeEIsU0FBT0MsY0FBY0QsTUFBTVosUUFBcEIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7O0FBT0EsU0FBU2EsYUFBVCxDQUF1QkMsSUFBdkIsRUFBNkI7QUFDM0IsTUFDR0EsS0FBS2YsTUFBTCxJQUFlLFVBQWhCLElBQ0NlLEtBQUtmLE1BQUwsSUFBZSxPQUFmLElBQTBCLGFBQU1nQixXQUFOLENBQWtCRCxLQUFLWixLQUF2QixDQUY3QixFQUdFO0FBQ0EsV0FBT1ksS0FBS1osS0FBTCxDQUFXTCxHQUFYLENBQWVnQixhQUFmLEVBQThCRyxJQUE5QixDQUFtQyxJQUFuQyxDQUFQO0FBQ0QsR0FMRCxNQUtPO0FBQ0wsV0FBT0YsS0FBS1AsSUFBWjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7OztrQkFNZTtBQUNibkIsMEJBRGE7QUFFYnVCO0FBRmEsQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgQmxvY2ssIE1hcmssIE5vZGUsIFZhbHVlIH0gZnJvbSAnc2xhdGUnXG5pbXBvcnQgeyBTZXQgfSBmcm9tICdpbW11dGFibGUnXG5cbi8qKlxuICogRGVzZXJpYWxpemUgYSBwbGFpbiB0ZXh0IGBzdHJpbmdgIHRvIGEgU2xhdGUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSB0b0pTT05cbiAqICAgQHByb3BlcnR5IHtTdHJpbmd8T2JqZWN0fEJsb2NrfSBkZWZhdWx0QmxvY2tcbiAqICAgQHByb3BlcnR5IHtBcnJheXxTZXR9IGRlZmF1bHRNYXJrc1xuICogQHJldHVybiB7VmFsdWV9XG4gKi9cblxuZnVuY3Rpb24gZGVzZXJpYWxpemUoc3RyaW5nLCBvcHRpb25zID0ge30pIHtcbiAgbGV0IHtcbiAgICBkZWZhdWx0QmxvY2sgPSAnbGluZScsXG4gICAgZGVmYXVsdE1hcmtzID0gW10sXG4gICAgdG9KU09OID0gZmFsc2UsXG4gIH0gPSBvcHRpb25zXG5cbiAgaWYgKFNldC5pc1NldChkZWZhdWx0TWFya3MpKSB7XG4gICAgZGVmYXVsdE1hcmtzID0gZGVmYXVsdE1hcmtzLnRvQXJyYXkoKVxuICB9XG5cbiAgZGVmYXVsdEJsb2NrID0gTm9kZS5jcmVhdGVQcm9wZXJ0aWVzKGRlZmF1bHRCbG9jaylcbiAgZGVmYXVsdE1hcmtzID0gZGVmYXVsdE1hcmtzLm1hcChNYXJrLmNyZWF0ZVByb3BlcnRpZXMpXG5cbiAgY29uc3QganNvbiA9IHtcbiAgICBvYmplY3Q6ICd2YWx1ZScsXG4gICAgZG9jdW1lbnQ6IHtcbiAgICAgIG9iamVjdDogJ2RvY3VtZW50JyxcbiAgICAgIGRhdGE6IHt9LFxuICAgICAgbm9kZXM6IHN0cmluZy5zcGxpdCgnXFxuJykubWFwKChsaW5lKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uZGVmYXVsdEJsb2NrLFxuICAgICAgICAgIG9iamVjdDogJ2Jsb2NrJyxcbiAgICAgICAgICBpc1ZvaWQ6IGZhbHNlLFxuICAgICAgICAgIGRhdGE6IHt9LFxuICAgICAgICAgIG5vZGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG9iamVjdDogJ3RleHQnLFxuICAgICAgICAgICAgICBsZWF2ZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBvYmplY3Q6ICdsZWFmJyxcbiAgICAgICAgICAgICAgICAgIHRleHQ6IGxpbmUsXG4gICAgICAgICAgICAgICAgICBtYXJrczogZGVmYXVsdE1hcmtzLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmV0ID0gdG9KU09OID8ganNvbiA6IFZhbHVlLmZyb21KU09OKGpzb24pXG4gIHJldHVybiByZXRcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgYSBTbGF0ZSBgdmFsdWVgIHRvIGEgcGxhaW4gdGV4dCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUodmFsdWUpIHtcbiAgcmV0dXJuIHNlcmlhbGl6ZU5vZGUodmFsdWUuZG9jdW1lbnQpXG59XG5cbi8qKlxuICogU2VyaWFsaXplIGEgYG5vZGVgIHRvIHBsYWluIHRleHQuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplTm9kZShub2RlKSB7XG4gIGlmIChcbiAgICAobm9kZS5vYmplY3QgPT0gJ2RvY3VtZW50JykgfHxcbiAgICAobm9kZS5vYmplY3QgPT0gJ2Jsb2NrJyAmJiBCbG9jay5pc0Jsb2NrTGlzdChub2RlLm5vZGVzKSlcbiAgKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZXMubWFwKHNlcmlhbGl6ZU5vZGUpLmpvaW4oJ1xcbicpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dFxuICB9XG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQge1xuICBkZXNlcmlhbGl6ZSxcbiAgc2VyaWFsaXplXG59XG4iXX0=