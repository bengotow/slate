'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _slateBase64Serializer = require('slate-base64-serializer');

var _slateBase64Serializer2 = _interopRequireDefault(_slateBase64Serializer);

var _transferTypes = require('../constants/transfer-types');

var _transferTypes2 = _interopRequireDefault(_transferTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transfer types.
 *
 * @type {String}
 */

var FRAGMENT = _transferTypes2.default.FRAGMENT,
    HTML = _transferTypes2.default.HTML,
    NODE = _transferTypes2.default.NODE,
    RICH = _transferTypes2.default.RICH,
    TEXT = _transferTypes2.default.TEXT;

/**
 * Fragment matching regexp for HTML nodes.
 *
 * @type {RegExp}
 */

var FRAGMENT_MATCHER = / data-slate-fragment="([^\s"]+)"/;

/**
 * Get the transfer data from an `event`.
 *
 * @param {Event} event
 * @return {Object}
 */

function getEventTransfer(event) {
  if (event.nativeEvent) {
    event = event.nativeEvent;
  }

  var transfer = event.dataTransfer || event.clipboardData;
  var fragment = getType(transfer, FRAGMENT);
  var node = getType(transfer, NODE);
  var html = getType(transfer, HTML);
  var rich = getType(transfer, RICH);
  var text = getType(transfer, TEXT);
  var files = void 0;

  // If there isn't a fragment, but there is HTML, check to see if the HTML is
  // actually an encoded fragment.
  if (!fragment && html && ~html.indexOf(' data-slate-fragment="')) {
    var matches = FRAGMENT_MATCHER.exec(html);

    var _matches = _slicedToArray(matches, 2),
        full = _matches[0],
        encoded = _matches[1]; // eslint-disable-line no-unused-vars


    if (encoded) fragment = encoded;
  }

  // COMPAT: Edge doesn't handle custom data types
  // These will be embedded in text/plain in this case (2017/7/12)
  if (text) {
    var embeddedTypes = getEmbeddedTypes(text);

    if (embeddedTypes[FRAGMENT]) fragment = embeddedTypes[FRAGMENT];
    if (embeddedTypes[NODE]) node = embeddedTypes[NODE];
    if (embeddedTypes[TEXT]) text = embeddedTypes[TEXT];
  }

  // Decode a fragment or node if they exist.
  if (fragment) fragment = _slateBase64Serializer2.default.deserializeNode(fragment);
  if (node) node = _slateBase64Serializer2.default.deserializeNode(node);

  // COMPAT: Edge sometimes throws 'NotSupportedError'
  // when accessing `transfer.items` (2017/7/12)
  try {
    // Get and normalize files if they exist.
    if (transfer.items && transfer.items.length) {
      files = Array.from(transfer.items).map(function (item) {
        return item.kind == 'file' ? item.getAsFile() : null;
      }).filter(function (exists) {
        return exists;
      });
    } else if (transfer.files && transfer.files.length) {
      files = Array.from(transfer.files);
    }
  } catch (err) {
    if (transfer.files && transfer.files.length) {
      files = Array.from(transfer.files);
    }
  }

  // Determine the type of the data.
  var data = { files: files, fragment: fragment, html: html, node: node, rich: rich, text: text };
  data.type = getTransferType(data);
  return data;
}

/**
 * Takes text input, checks whether contains embedded data
 * and returns object with original text +/- additional data
 *
 * @param {String} text
 * @return {Object}
 */

function getEmbeddedTypes(text) {
  var prefix = 'SLATE-DATA-EMBED::';

  if (text.substring(0, prefix.length) != prefix) {
    return { TEXT: text };
  }

  // Attempt to parse, if fails then just standard text/plain
  // Otherwise, already had data embedded
  try {
    return JSON.parse(text.substring(prefix.length));
  } catch (err) {
    throw new Error('Unable to parse custom Slate drag event data.');
  }
}

/**
 * Get the type of a transfer from its `data`.
 *
 * @param {Object} data
 * @return {String}
 */

function getTransferType(data) {
  if (data.fragment) return 'fragment';
  if (data.node) return 'node';

  // COMPAT: Microsoft Word adds an image of the selected text to the data.
  // Since files are preferred over HTML or text, this would cause the type to
  // be considered `files`. But it also adds rich text data so we can check
  // for that and properly set the type to `html` or `text`. (2016/11/21)
  if (data.rich && data.html) return 'html';
  if (data.rich && data.text) return 'text';

  if (data.files && data.files.length) return 'files';
  if (data.html) return 'html';
  if (data.text) return 'text';
  return 'unknown';
}

/**
 * Get one of types `TYPES.FRAGMENT`, `TYPES.NODE`, `text/html`, `text/rtf` or
 * `text/plain` from transfers's `data` if possible, otherwise return null.
 *
 * @param {Object} transfer
 * @param {String} type
 * @return {String}
 */

function getType(transfer, type) {
  if (!transfer.types || !transfer.types.length) {
    // COMPAT: In IE 11, there is no `types` field but `getData('Text')`
    // is supported`. (2017/06/23)
    return type == TEXT ? transfer.getData('Text') || null : null;
  }

  // COMPAT: In Edge, transfer.types doesn't respond to `indexOf`. (2017/10/25)
  var types = Array.from(transfer.types);

  return types.indexOf(type) !== -1 ? transfer.getData(type) || null : null;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getEventTransfer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9nZXQtZXZlbnQtdHJhbnNmZXIuanMiXSwibmFtZXMiOlsiRlJBR01FTlQiLCJIVE1MIiwiTk9ERSIsIlJJQ0giLCJURVhUIiwiRlJBR01FTlRfTUFUQ0hFUiIsImdldEV2ZW50VHJhbnNmZXIiLCJldmVudCIsIm5hdGl2ZUV2ZW50IiwidHJhbnNmZXIiLCJkYXRhVHJhbnNmZXIiLCJjbGlwYm9hcmREYXRhIiwiZnJhZ21lbnQiLCJnZXRUeXBlIiwibm9kZSIsImh0bWwiLCJyaWNoIiwidGV4dCIsImZpbGVzIiwiaW5kZXhPZiIsIm1hdGNoZXMiLCJleGVjIiwiZnVsbCIsImVuY29kZWQiLCJlbWJlZGRlZFR5cGVzIiwiZ2V0RW1iZWRkZWRUeXBlcyIsImRlc2VyaWFsaXplTm9kZSIsIml0ZW1zIiwibGVuZ3RoIiwiQXJyYXkiLCJmcm9tIiwibWFwIiwiaXRlbSIsImtpbmQiLCJnZXRBc0ZpbGUiLCJmaWx0ZXIiLCJleGlzdHMiLCJlcnIiLCJkYXRhIiwidHlwZSIsImdldFRyYW5zZmVyVHlwZSIsInByZWZpeCIsInN1YnN0cmluZyIsIkpTT04iLCJwYXJzZSIsIkVycm9yIiwidHlwZXMiLCJnZXREYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBOzs7Ozs7SUFPRUEsUSwyQkFBQUEsUTtJQUNBQyxJLDJCQUFBQSxJO0lBQ0FDLEksMkJBQUFBLEk7SUFDQUMsSSwyQkFBQUEsSTtJQUNBQyxJLDJCQUFBQSxJOztBQUdGOzs7Ozs7QUFNQSxJQUFNQyxtQkFBbUIsa0NBQXpCOztBQUVBOzs7Ozs7O0FBT0EsU0FBU0MsZ0JBQVQsQ0FBMEJDLEtBQTFCLEVBQWlDO0FBQy9CLE1BQUlBLE1BQU1DLFdBQVYsRUFBdUI7QUFDckJELFlBQVFBLE1BQU1DLFdBQWQ7QUFDRDs7QUFFRCxNQUFNQyxXQUFXRixNQUFNRyxZQUFOLElBQXNCSCxNQUFNSSxhQUE3QztBQUNBLE1BQUlDLFdBQVdDLFFBQVFKLFFB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VCxDQUFpQlIsSUFBakIsS0FBMEIsSUFBdkQsR0FBOEQsSUFBckU7QUFDRDs7QUFFRDs7Ozs7O2tCQU1lakMsZ0IiLCJmaWxlIjoiZ2V0LWV2ZW50LXRyYW5zZmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgQmFzZTY0IGZyb20gJ3NsYXRlLWJhc2U2NC1zZXJpYWxpemVyJ1xuXG5pbXBvcnQgVFJBTlNGRVJfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL3RyYW5zZmVyLXR5cGVzJ1xuXG4vKipcbiAqIFRyYW5zZmVyIHR5cGVzLlxuICpcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cblxuY29uc3Qge1xuICBGUkFHTUVOVCxcbiAgSFRNTCxcbiAgTk9ERSxcbiAgUklDSCxcbiAgVEVYVFxufSA9IFRSQU5TRkVSX1RZUEVTXG5cbi8qKlxuICogRnJhZ21lbnQgbWF0Y2hpbmcgcmVnZXhwIGZvciBIVE1MIG5vZGVzLlxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cblxuY29uc3QgRlJBR01FTlRfTUFUQ0hFUiA9IC8gZGF0YS1zbGF0ZS1mcmFnbWVudD1cIihbXlxcc1wiXSspXCIvXG5cbi8qKlxuICogR2V0IHRoZSB0cmFuc2ZlciBkYXRhIGZyb20gYW4gYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGdldEV2ZW50VHJhbnNmZXIoZXZlbnQpIHtcbiAgaWYgKGV2ZW50Lm5hdGl2ZUV2ZW50KSB7XG4gICAgZXZlbnQgPSBldmVudC5uYXRpdmVFdmVudFxuICB9XG5cbiAgY29uc3QgdHJhbnNmZXIgPSBldmVudC5kYXRhVHJhbnNmZXIgfHwgZXZlbnQuY2xpcGJvYXJkRGF0YVxuICBsZXQgZnJhZ21lbnQgPSBnZXRUeXBlKHRyYW5zZmVyLCBGUkFHTUVOVClcbiAgbGV0IG5vZGUgPSBnZXRUeXBlKHRyYW5zZmVyLCBOT0RFKVxuICBjb25zdCBodG1sID0gZ2V0VHlwZSh0cmFuc2ZlciwgSFRNTClcbiAgY29uc3QgcmljaCA9IGdldFR5cGUodHJhbnNmZXIsIFJJQ0gpXG4gIGxldCB0ZXh0ID0gZ2V0VHlwZSh0cmFuc2ZlciwgVEVYVClcbiAgbGV0IGZpbGVzXG5cbiAgLy8gSWYgdGhlcmUgaXNuJ3QgYSBmcmFnbWVudCwgYnV0IHRoZXJlIGlzIEhUTUwsIGNoZWNrIHRvIHNlZSBpZiB0aGUgSFRNTCBpc1xuICAvLyBhY3R1YWxseSBhbiBlbmNvZGVkIGZyYWdtZW50LlxuICBpZiAoXG4gICAgIWZyYWdtZW50ICYmXG4gICAgaHRtbCAmJlxuICAgIH5odG1sLmluZGV4T2YoJyBkYXRhLXNsYXRlLWZyYWdtZW50PVwiJylcbiAgKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IEZSQUdNRU5UX01BVENIRVIuZXhlYyhodG1sKVxuICAgIGNvbnN0IFsgZnVsbCwgZW5jb2RlZCBdID0gbWF0Y2hlcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgaWYgKGVuY29kZWQpIGZyYWdtZW50ID0gZW5jb2RlZFxuICB9XG5cbiAgLy8gQ09NUEFUOiBFZGdlIGRvZXNuJ3QgaGFuZGxlIGN1c3RvbSBkYXRhIHR5cGVzXG4gIC8vIFRoZXNlIHdpbGwgYmUgZW1iZWRkZWQgaW4gdGV4dC9wbGFpbiBpbiB0aGlzIGNhc2UgKDIwMTcvNy8xMilcbiAgaWYgKHRleHQpIHtcbiAgICBjb25zdCBlbWJlZGRlZFR5cGVzID0gZ2V0RW1iZWRkZWRUeXBlcyh0ZXh0KVxuXG4gICAgaWYgKGVtYmVkZGVkVHlwZXNbRlJBR01FTlRdKSBmcmFnbWVudCA9IGVtYmVkZGVkVHlwZXNbRlJBR01FTlRdXG4gICAgaWYgKGVtYmVkZGVkVHlwZXNbTk9ERV0pIG5vZGUgPSBlbWJlZGRlZFR5cGVzW05PREVdXG4gICAgaWYgKGVtYmVkZGVkVHlwZXNbVEVYVF0pIHRleHQgPSBlbWJlZGRlZFR5cGVzW1RFWFRdXG4gIH1cblxuICAvLyBEZWNvZGUgYSBmcmFnbWVudCBvciBub2RlIGlmIHRoZXkgZXhpc3QuXG4gIGlmIChmcmFnbWVudCkgZnJhZ21lbnQgPSBCYXNlNjQuZGVzZXJpYWxpemVOb2RlKGZyYWdtZW50KVxuICBpZiAobm9kZSkgbm9kZSA9IEJhc2U2NC5kZXNlcmlhbGl6ZU5vZGUobm9kZSlcblxuICAvLyBDT01QQVQ6IEVkZ2Ugc29tZXRpbWVzIHRocm93cyAnTm90U3VwcG9ydGVkRXJyb3InXG4gIC8vIHdoZW4gYWNjZXNzaW5nIGB0cmFuc2Zlci5pdGVtc2AgKDIwMTcvNy8xMilcbiAgdHJ5IHtcbiAgICAvLyBHZXQgYW5kIG5vcm1hbGl6ZSBmaWxlcyBpZiB0aGV5IGV4aXN0LlxuICAgIGlmICh0cmFuc2Zlci5pdGVtcyAmJiB0cmFuc2Zlci5pdGVtcy5sZW5ndGgpIHtcbiAgICAgIGZpbGVzID0gQXJyYXkuZnJvbSh0cmFuc2Zlci5pdGVtcylcbiAgICAgICAgLm1hcChpdGVtID0+IGl0ZW0ua2luZCA9PSAnZmlsZScgPyBpdGVtLmdldEFzRmlsZSgpIDogbnVsbClcbiAgICAgICAgLmZpbHRlcihleGlzdHMgPT4gZXhpc3RzKVxuICAgIH0gZWxzZSBpZiAodHJhbnNmZXIuZmlsZXMgJiYgdHJhbnNmZXIuZmlsZXMubGVuZ3RoKSB7XG4gICAgICBmaWxlcyA9IEFycmF5LmZyb20odHJhbnNmZXIuZmlsZXMpXG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodHJhbnNmZXIuZmlsZXMgJiYgdHJhbnNmZXIuZmlsZXMubGVuZ3RoKSB7XG4gICAgICBmaWxlcyA9IEFycmF5LmZyb20odHJhbnNmZXIuZmlsZXMpXG4gICAgfVxuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIHRoZSB0eXBlIG9mIHRoZSBkYXRhLlxuICBjb25zdCBkYXRhID0geyBmaWxlcywgZnJhZ21lbnQsIGh0bWwsIG5vZGUsIHJpY2gsIHRleHQgfVxuICBkYXRhLnR5cGUgPSBnZXRUcmFuc2ZlclR5cGUoZGF0YSlcbiAgcmV0dXJuIGRhdGFcbn1cblxuLyoqXG4gKiBUYWtlcyB0ZXh0IGlucHV0LCBjaGVja3Mgd2hldGhlciBjb250YWlucyBlbWJlZGRlZCBkYXRhXG4gKiBhbmQgcmV0dXJucyBvYmplY3Qgd2l0aCBvcmlnaW5hbCB0ZXh0ICsvLSBhZGRpdGlvbmFsIGRhdGFcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGdldEVtYmVkZGVkVHlwZXModGV4dCkge1xuICBjb25zdCBwcmVmaXggPSAnU0xBVEUtREFUQS1FTUJFRDo6J1xuXG4gIGlmICh0ZXh0LnN1YnN0cmluZygwLCBwcmVmaXgubGVuZ3RoKSAhPSBwcmVmaXgpIHtcbiAgICByZXR1cm4geyBURVhUOiB0ZXh0IH1cbiAgfVxuXG4gIC8vIEF0dGVtcHQgdG8gcGFyc2UsIGlmIGZhaWxzIHRoZW4ganVzdCBzdGFuZGFyZCB0ZXh0L3BsYWluXG4gIC8vIE90aGVyd2lzZSwgYWxyZWFkeSBoYWQgZGF0YSBlbWJlZGRlZFxuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHRleHQuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGgpKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBjdXN0b20gU2xhdGUgZHJhZyBldmVudCBkYXRhLicpXG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIHR5cGUgb2YgYSB0cmFuc2ZlciBmcm9tIGl0cyBgZGF0YWAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBnZXRUcmFuc2ZlclR5cGUoZGF0YSkge1xuICBpZiAoZGF0YS5mcmFnbWVudCkgcmV0dXJuICdmcmFnbWVudCdcbiAgaWYgKGRhdGEubm9kZSkgcmV0dXJuICdub2RlJ1xuXG4gIC8vIENPTVBBVDogTWljcm9zb2Z0IFdvcmQgYWRkcyBhbiBpbWFnZSBvZiB0aGUgc2VsZWN0ZWQgdGV4dCB0byB0aGUgZGF0YS5cbiAgLy8gU2luY2UgZmlsZXMgYXJlIHByZWZlcnJlZCBvdmVyIEhUTUwgb3IgdGV4dCwgdGhpcyB3b3VsZCBjYXVzZSB0aGUgdHlwZSB0b1xuICAvLyBiZSBjb25zaWRlcmVkIGBmaWxlc2AuIEJ1dCBpdCBhbHNvIGFkZHMgcmljaCB0ZXh0IGRhdGEgc28gd2UgY2FuIGNoZWNrXG4gIC8vIGZvciB0aGF0IGFuZCBwcm9wZXJseSBzZXQgdGhlIHR5cGUgdG8gYGh0bWxgIG9yIGB0ZXh0YC4gKDIwMTYvMTEvMjEpXG4gIGlmIChkYXRhLnJpY2ggJiYgZGF0YS5odG1sKSByZXR1cm4gJ2h0bWwnXG4gIGlmIChkYXRhLnJpY2ggJiYgZGF0YS50ZXh0KSByZXR1cm4gJ3RleHQnXG5cbiAgaWYgKGRhdGEuZmlsZXMgJiYgZGF0YS5maWxlcy5sZW5ndGgpIHJldHVybiAnZmlsZXMnXG4gIGlmIChkYXRhLmh0bWwpIHJldHVybiAnaHRtbCdcbiAgaWYgKGRhdGEudGV4dCkgcmV0dXJuICd0ZXh0J1xuICByZXR1cm4gJ3Vua25vd24nXG59XG5cbi8qKlxuICogR2V0IG9uZSBvZiB0eXBlcyBgVFlQRVMuRlJBR01FTlRgLCBgVFlQRVMuTk9ERWAsIGB0ZXh0L2h0bWxgLCBgdGV4dC9ydGZgIG9yXG4gKiBgdGV4dC9wbGFpbmAgZnJvbSB0cmFuc2ZlcnMncyBgZGF0YWAgaWYgcG9zc2libGUsIG90aGVyd2lzZSByZXR1cm4gbnVsbC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdHJhbnNmZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0VHlwZSh0cmFuc2ZlciwgdHlwZSkge1xuICBpZiAoIXRyYW5zZmVyLnR5cGVzIHx8ICF0cmFuc2Zlci50eXBlcy5sZW5ndGgpIHtcbiAgICAvLyBDT01QQVQ6IEluIElFIDExLCB0aGVyZSBpcyBubyBgdHlwZXNgIGZpZWxkIGJ1dCBgZ2V0RGF0YSgnVGV4dCcpYFxuICAgIC8vIGlzIHN1cHBvcnRlZGAuICgyMDE3LzA2LzIzKVxuICAgIHJldHVybiB0eXBlID09IFRFWFQgPyB0cmFuc2Zlci5nZXREYXRhKCdUZXh0JykgfHwgbnVsbCA6IG51bGxcbiAgfVxuXG4gIC8vIENPTVBBVDogSW4gRWRnZSwgdHJhbnNmZXIudHlwZXMgZG9lc24ndCByZXNwb25kIHRvIGBpbmRleE9mYC4gKDIwMTcvMTAvMjUpXG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbSh0cmFuc2Zlci50eXBlcylcblxuICByZXR1cm4gdHlwZXMuaW5kZXhPZih0eXBlKSAhPT0gLTEgPyB0cmFuc2Zlci5nZXREYXRhKHR5cGUpIHx8IG51bGwgOiBudWxsXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBnZXRFdmVudFRyYW5zZmVyXG4iXX0=