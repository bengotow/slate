'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BeforePlugin = exports.AfterPlugin = exports.setEventTransfer = exports.getEventTransfer = exports.getEventRange = exports.findRange = exports.findNode = exports.findDOMRange = exports.findDOMNode = exports.cloneFragment = exports.Editor = undefined;

var _editor = require('./components/editor');

var _editor2 = _interopRequireDefault(_editor);

var _cloneFragment = require('./utils/clone-fragment');

var _cloneFragment2 = _interopRequireDefault(_cloneFragment);

var _findDomNode = require('./utils/find-dom-node');

var _findDomNode2 = _interopRequireDefault(_findDomNode);

var _findDomRange = require('./utils/find-dom-range');

var _findDomRange2 = _interopRequireDefault(_findDomRange);

var _findNode = require('./utils/find-node');

var _findNode2 = _interopRequireDefault(_findNode);

var _findRange = require('./utils/find-range');

var _findRange2 = _interopRequireDefault(_findRange);

var _getEventRange = require('./utils/get-event-range');

var _getEventRange2 = _interopRequireDefault(_getEventRange);

var _getEventTransfer = require('./utils/get-event-transfer');

var _getEventTransfer2 = _interopRequireDefault(_getEventTransfer);

var _setEventTransfer = require('./utils/set-event-transfer');

var _setEventTransfer2 = _interopRequireDefault(_setEventTransfer);

var _after = require('./plugins/after');

var _after2 = _interopRequireDefault(_after);

var _before = require('./plugins/before');

var _before2 = _interopRequireDefault(_before);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export.
 *
 * @type {Object}
 */

exports.Editor = _editor2.default;
exports.cloneFragment = _cloneFragment2.default;
exports.findDOMNode = _findDomNode2.default;
exports.findDOMRange = _findDomRange2.default;
exports.findNode = _findNode2.default;
exports.findRange = _findRange2.default;
exports.getEventRange = _getEventRange2.default;
exports.getEventTransfer = _getEventTransfer2.default;
exports.setEventTransfer = _setEventTransfer2.default;
exports.AfterPlugin = _after2.default;
exports.BeforePlugin = _before2.default;
exports.default = {
  Editor: _editor2.default,
  cloneFragment: _cloneFragment2.default,
  findDOMNode: _findDomNode2.default,
  findDOMRange: _findDomRange2.default,
  findNode: _findNode2.default,
  findRange: _findRange2.default,
  getEventRange: _getEventRange2.default,
  getEventTransfer: _getEventTransfer2.default,
  setEventTransfer: _setEventTransfer2.default,
  AfterPlugin: _after2.default,
  BeforePlugin: _before2.default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJFZGl0b3IiLCJjbG9uZUZyYWdtZW50IiwiZmluZERPTU5vZGUiLCJmaW5kRE9NUmFuZ2UiLCJmaW5kTm9kZSIsImZpbmRSYW5nZSIsImdldEV2ZW50UmFuZ2UiLCJnZXRFdmVudFRyYW5zZmVyIiwic2V0RXZlbnRUcmFuc2ZlciIsIkFmdGVyUGx1Z2luIiwiQmVmb3JlUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7OztRQU9FQSxNO1FBQ0FDLGE7UUFDQUMsVztRQUNBQyxZO1FBQ0FDLFE7UUFDQUMsUztRQUNBQyxhO1FBQ0FDLGdCO1FBQ0FDLGdCO1FBQ0FDLFc7UUFDQUMsWTtrQkFHYTtBQUNiViwwQkFEYTtBQUViQyx3Q0FGYTtBQUdiQyxvQ0FIYTtBQUliQyxzQ0FKYTtBQUtiQyw4QkFMYTtBQU1iQyxnQ0FOYTtBQU9iQyx3Q0FQYTtBQVFiQyw4Q0FSYTtBQVNiQyw4Q0FUYTtBQVViQyw4QkFWYTtBQVdiQztBQVhhLEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBFZGl0b3IgZnJvbSAnLi9jb21wb25lbnRzL2VkaXRvcidcbmltcG9ydCBjbG9uZUZyYWdtZW50IGZyb20gJy4vdXRpbHMvY2xvbmUtZnJhZ21lbnQnXG5pbXBvcnQgZmluZERPTU5vZGUgZnJvbSAnLi91dGlscy9maW5kLWRvbS1ub2RlJ1xuaW1wb3J0IGZpbmRET01SYW5nZSBmcm9tICcuL3V0aWxzL2ZpbmQtZG9tLXJhbmdlJ1xuaW1wb3J0IGZpbmROb2RlIGZyb20gJy4vdXRpbHMvZmluZC1ub2RlJ1xuaW1wb3J0IGZpbmRSYW5nZSBmcm9tICcuL3V0aWxzL2ZpbmQtcmFuZ2UnXG5pbXBvcnQgZ2V0RXZlbnRSYW5nZSBmcm9tICcuL3V0aWxzL2dldC1ldmVudC1yYW5nZSdcbmltcG9ydCBnZXRFdmVudFRyYW5zZmVyIGZyb20gJy4vdXRpbHMvZ2V0LWV2ZW50LXRyYW5zZmVyJ1xuaW1wb3J0IHNldEV2ZW50VHJhbnNmZXIgZnJvbSAnLi91dGlscy9zZXQtZXZlbnQtdHJhbnNmZXInXG5pbXBvcnQgQWZ0ZXJQbHVnaW4gZnJvbSAnLi9wbHVnaW5zL2FmdGVyJ1xuaW1wb3J0IEJlZm9yZVBsdWdpbiBmcm9tICcuL3BsdWdpbnMvYmVmb3JlJ1xuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCB7XG4gIEVkaXRvcixcbiAgY2xvbmVGcmFnbWVudCxcbiAgZmluZERPTU5vZGUsXG4gIGZpbmRET01SYW5nZSxcbiAgZmluZE5vZGUsXG4gIGZpbmRSYW5nZSxcbiAgZ2V0RXZlbnRSYW5nZSxcbiAgZ2V0RXZlbnRUcmFuc2ZlcixcbiAgc2V0RXZlbnRUcmFuc2ZlcixcbiAgQWZ0ZXJQbHVnaW4sXG4gIEJlZm9yZVBsdWdpbixcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBFZGl0b3IsXG4gIGNsb25lRnJhZ21lbnQsXG4gIGZpbmRET01Ob2RlLFxuICBmaW5kRE9NUmFuZ2UsXG4gIGZpbmROb2RlLFxuICBmaW5kUmFuZ2UsXG4gIGdldEV2ZW50UmFuZ2UsXG4gIGdldEV2ZW50VHJhbnNmZXIsXG4gIHNldEV2ZW50VHJhbnNmZXIsXG4gIEFmdGVyUGx1Z2luLFxuICBCZWZvcmVQbHVnaW4sXG59XG4iXX0=